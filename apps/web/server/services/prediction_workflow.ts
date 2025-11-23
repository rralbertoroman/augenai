"use server";

import {
  AI_PREDICTION_SERVICE_URL,
  AI_PREDICTION_SERVICE_SECRET_KEY,
  ENVIRONMENT,
} from "../constants";
import {
  PredictionStatus,
  type AIServicePredictionResponse,
  type PredictionResponse,
  type MultiplePredictionsResponse,
} from "@/types/prediction";
import { createPrediction } from "./prediction";
import { createPredictionRequest } from "./prediction_request";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { supabaseAdmin } from "../supabase/client";
import { selectOptimalModels } from "./model";

import {
  PredictionWorkflowInputSchema,
  type PredictionWorkflowInput,
} from "../zod-schemas/prediction_workflow";

export async function processPredictionRequest(
  input: PredictionWorkflowInput,
): Promise<MultiplePredictionsResponse> {
  const { userId, formData } = PredictionWorkflowInputSchema.parse(input);
  const storagePath = formData.get("storage_path") as string;
  const bucketName = formData.get("bucket_name") as string;
  const patientId = formData.get("patient_id") as string;
  const task = formData.get("task") as string;
  const imageType = formData.get("image_type") as string;
  const diseasesStr = formData.get("diseases") as string;

  if (!storagePath) throw new Error("Storage path is required");
  if (!bucketName) throw new Error("Bucket name is required");
  if (!patientId) throw new Error("Patient ID is required");
  if (!task) throw new Error("Task is required");
  if (!imageType) throw new Error("Image type is required");
  if (!diseasesStr) throw new Error("Diseases are required");

  let diseases: string[];
  try {
    diseases = JSON.parse(diseasesStr);
    if (!Array.isArray(diseases) || diseases.length === 0) {
      throw new Error("Diseases must be a non-empty array");
    }
  } catch {
    throw new Error("Invalid diseases format. Must be a JSON array");
  }

  // Select optimal models based on task, imageType, and diseases
  const selectedModels = await selectOptimalModels(task, imageType, diseases);

  if (selectedModels.length === 0) {
    throw new Error("No suitable models found for the given criteria");
  }

  // Download image from storage
  const { data: imageBlob, error: downloadError } = await supabaseAdmin.storage
    .from(bucketName)
    .download(storagePath);

  if (downloadError || !imageBlob) {
    throw new Error(
      `Failed to download image from storage: ${downloadError?.message || "No data returned"}`,
    );
  }

  const fileName = storagePath.split("/").pop();

  if (!fileName) {
    throw new Error("Invalid storage path: cannot extract filename");
  }

  // Create prediction request first
  const predictionRequest = await createPredictionRequest({
    userId,
    patientId,
    task,
    imageType,
    diseases,
    storagePath,
    bucketName,
    modelsUsed: selectedModels.map((m) => m.id),
  });

  // Run predictions for all selected models
  const allPredictions: PredictionResponse[] = [];

  for (const model of selectedModels) {
    const predictionFormData = new FormData();
    predictionFormData.append("image", imageBlob, fileName);
    predictionFormData.append("model_id", model.name);
    if (ENVIRONMENT === "test") {
      predictionFormData.append("is_mocked", "true");
    }

    const predictionResponse = await fetch(
      `${AI_PREDICTION_SERVICE_URL}/predict`,
      {
        method: "POST",
        headers: {
          "X-API-Key": AI_PREDICTION_SERVICE_SECRET_KEY,
        },
        body: predictionFormData,
      },
    );

    if (!predictionResponse.ok) {
      await predictionResponse.json().catch(() => ({}));
      continue; // Skip this model and continue with others
    }

    const predictionResult: AIServicePredictionResponse =
      await predictionResponse.json();

    if (predictionResult.status === PredictionStatus.ERROR) {
      continue;
    }

    if (
      !predictionResult.result ||
      !predictionResult.result.predictions ||
      predictionResult.result.predictions.length === 0
    ) {
      continue;
    }

    const savedPrediction = await createPrediction({
      requestId: predictionRequest.id,
      modelId: model.id,
      predictionResult: predictionResult.result,
    });

    // Enrich predictions with disease info
    const enrichedPredictions = [];

    for (const pred of predictionResult.result.predictions) {
      const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
        classId: pred.class_id,
        modelId: model.id,
      });

      if (!classInfo) {
        throw new Error(
          `Disease mapping not found for class_id ${pred.class_id} and model ${model.id}`,
        );
      }

      enrichedPredictions.push({
        ...pred,
        disease_id: classInfo.diseaseId,
        disease_name: classInfo.diseaseName,
        stage_idx: classInfo.stageIdx,
        stage_content: classInfo.diseaseStages[classInfo.stageIdx],
      });
    }

    const apiResponse: PredictionResponse = {
      status: predictionResult.status,
      error: predictionResult.error,
      result: {
        predictions: enrichedPredictions,
        metadata: predictionResult.result.metadata,
      },
      db_prediction_id: savedPrediction.id,
    };

    allPredictions.push(apiResponse);
  }

  if (allPredictions.length === 0) {
    throw new Error("All model predictions failed");
  }

  return {
    predictions: allPredictions,
    models_used: selectedModels.map((m) => m.name),
  };
}
