"use server";

import {
  AI_PREDICTION_SERVICE_URL,
  AI_PREDICTION_SERVICE_SECRET_KEY,
  ENVIRONMENT,
} from "../constants";
import {
  PredictionStatus,
  type AIServicePredictionResponse,
  type ClassificationObject,
  type EnrichedClassificationObject,
} from "@/types/prediction";
import { createPrediction } from "./prediction";
import { createPredictionRequest } from "./prediction_request";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { supabaseAdmin } from "../supabase/client";
import { selectOptimalModels } from "./model";
import { type OptimalModel } from "../zod-schemas/model";

import {
  PredictionWorkflowInputSchema,
  type PredictionWorkflowInput,
  type PredictionResponse,
  type MultiplePredictionsResponse,
} from "../zod-schemas/prediction_workflow";

export async function processPredictionRequest(
  input: PredictionWorkflowInput,
): Promise<MultiplePredictionsResponse> {
  const validatedInput = PredictionWorkflowInputSchema.parse(input);
  const { task, imageType, diseases, storagePath, bucketName } = validatedInput;

  // 1. Select optimal models
  const selectedModels = await selectOptimalModels(task, imageType, diseases);

  if (selectedModels.length === 0) {
    throw new Error("No suitable models found for the given criteria");
  }

  // 2. Download image
  const { imageBlob, fileName } = await downloadImageFromStorage(
    bucketName,
    storagePath,
  );

  // 3. Create prediction request record
  const predictionRequest = await savePredictionRequest(
    validatedInput,
    selectedModels,
  );

  // 4. Run predictions
  const allPredictions: PredictionResponse[] = [];

  for (const model of selectedModels) {
    const predictionResponse = await processModelPrediction(
      model,
      imageBlob,
      fileName,
      predictionRequest.id,
    );

    if (predictionResponse) {
      allPredictions.push(predictionResponse);
    }
  }

  if (allPredictions.length === 0) {
    throw new Error("All model predictions failed");
  }

  return {
    predictions: allPredictions,
    models_used: selectedModels.map((m) => m.name),
  };
}

// --- Helper Functions ---

async function downloadImageFromStorage(
  bucketName: string,
  storagePath: string,
): Promise<{ imageBlob: Blob; fileName: string }> {
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

  return { imageBlob, fileName };
}

async function savePredictionRequest(
  input: PredictionWorkflowInput,
  selectedModels: OptimalModel[],
) {
  return await createPredictionRequest({
    userId: input.userId,
    patientId: input.patientId,
    task: input.task,
    imageType: input.imageType,
    diseases: input.diseases,
    storagePath: input.storagePath,
    bucketName: input.bucketName,
    modelsUsed: selectedModels.map((m) => m.id),
  });
}

async function processModelPrediction(
  model: OptimalModel,
  imageBlob: Blob,
  fileName: string,
  requestId: string,
): Promise<PredictionResponse | null> {
  // 1. Fetch from AI Service
  const predictionResult = await fetchPredictionFromAIService(
    imageBlob,
    fileName,
    model.name,
  );

  if (
    !predictionResult ||
    predictionResult.status === PredictionStatus.ERROR ||
    !predictionResult.result?.predictions?.length
  ) {
    return null;
  }

  // 2. Save to DB
  const savedPrediction = await createPrediction({
    requestId,
    modelId: model.id,
    predictionResult: predictionResult.result,
  });

  // 3. Enrich Data
  const enrichedPredictions = await enrichPredictionData(
    predictionResult.result.predictions,
    model.id,
  );

  return {
    status: predictionResult.status,
    error: predictionResult.error,
    result: {
      predictions: enrichedPredictions,
      metadata: predictionResult.result.metadata,
    },
    db_prediction_id: savedPrediction.id,
  };
}

async function enrichPredictionData(
  predictions: ClassificationObject[],
  modelId: string,
): Promise<EnrichedClassificationObject[]> {
  const enrichedPredictions: EnrichedClassificationObject[] = [];

  for (const pred of predictions) {
    const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
      classId: pred.class_id,
      modelId: modelId,
    });

    if (!classInfo) {
      throw new Error(
        `Disease mapping not found for class_id ${pred.class_id} and model ${modelId}`,
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

  return enrichedPredictions;
}

async function fetchPredictionFromAIService(
  imageBlob: Blob,
  fileName: string,
  modelName: string,
): Promise<AIServicePredictionResponse | null> {
  const predictionFormData = new FormData();
  predictionFormData.append("image", imageBlob, fileName);
  predictionFormData.append("model_id", modelName);

  if (ENVIRONMENT === "test") {
    predictionFormData.append("is_mocked", "true");
  }

  try {
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
      return null;
    }

    return await predictionResponse.json();
  } catch (error) {
    console.error(`Error fetching prediction from model ${modelName}:`, error);
    return null;
  }
}
