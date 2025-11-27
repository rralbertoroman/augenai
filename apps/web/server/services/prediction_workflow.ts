"use server";

import {
  AI_PREDICTION_SERVICE_URL,
  AI_PREDICTION_SERVICE_SECRET_KEY,
  ENVIRONMENT,
} from "../constants";
import { createPrediction } from "./prediction";
import { createPredictionRequest } from "./prediction_request";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { createClassifications } from "./classification";
import { createDetections } from "./detection";
import { supabaseAdmin } from "../supabase/client";
import { selectOptimalModels } from "./model";
import { type OptimalModel } from "../zod-schemas/model";
import { sendPredictionToSupervisor } from "./prediction_sharing";

import {
  PredictionWorkflowInputSchema,
  type PredictionWorkflowInput,
  type PredictionResponse,
  type MultiplePredictionsResponse,
  type AIServicePredictionResponse,
  type Classification,
  type EnrichedClassification,
  type EnrichedDetection,
  type Detection,
  type ProcessedDetection,
} from "../zod-schemas/prediction_workflow";

export async function processPredictionRequest(
  input: PredictionWorkflowInput,
): Promise<MultiplePredictionsResponse> {
  console.log("[PREDICTION_WORKFLOW] Starting prediction request", { input });
  const validatedInput = PredictionWorkflowInputSchema.parse(input);
  const { task, imageType, diseases, storagePath, bucketName } = validatedInput;
  console.log("[PREDICTION_WORKFLOW] Validated input", {
    task,
    imageType,
    diseases,
    storagePath,
    bucketName,
  });

  // 1. Select optimal models
  console.log("[PREDICTION_WORKFLOW] Selecting optimal models...");
  const selectedModels = await selectOptimalModels(task, imageType, diseases);
  console.log("[PREDICTION_WORKFLOW] Selected models", {
    count: selectedModels.length,
    models: selectedModels.map((m) => ({ id: m.id, name: m.name })),
  });

  if (selectedModels.length === 0) {
    console.error("[PREDICTION_WORKFLOW] No suitable models found");
    throw new Error("No suitable models found for the given criteria");
  }

  // 2. Download image
  console.log("[PREDICTION_WORKFLOW] Downloading image from storage...", {
    bucketName,
    storagePath,
  });
  const { imageBlob, fileName } = await downloadImageFromStorage(
    bucketName,
    storagePath,
  );
  console.log("[PREDICTION_WORKFLOW] Image downloaded", {
    fileName,
    size: imageBlob.size,
  });

  // 3. Create prediction request record
  console.log("[PREDICTION_WORKFLOW] Saving prediction request...");
  const predictionRequest = await savePredictionRequest(
    validatedInput,
    selectedModels,
  );
  console.log("[PREDICTION_WORKFLOW] Prediction request saved", {
    requestId: predictionRequest.id,
  });

  // 4. Run predictions
  console.log("[PREDICTION_WORKFLOW] Starting predictions for all models...");
  const allPredictions: PredictionResponse[] = [];

  for (const model of selectedModels) {
    console.log("[PREDICTION_WORKFLOW] Processing prediction for model", {
      modelId: model.id,
      modelName: model.name,
    });
    const predictionResponse = await processModelPrediction(
      model,
      imageBlob,
      fileName,
      predictionRequest.id,
      task,
    );

    if (predictionResponse) {
      console.log("[PREDICTION_WORKFLOW] Prediction successful for model", {
        modelName: model.name,
      });
      allPredictions.push(predictionResponse);

      // Share with supervisor if applicable
      try {
        await sendPredictionToSupervisor(
          input.token,
          predictionResponse.db_prediction_id,
        );
      } catch (error) {
        console.error(
          "[PREDICTION_WORKFLOW] Failed to share prediction with supervisor",
          error,
        );
        // Do not fail the workflow if sharing fails
      }
    } else {
      console.warn("[PREDICTION_WORKFLOW] Prediction failed for model", {
        modelName: model.name,
      });
    }
  }

  if (allPredictions.length === 0) {
    console.error("[PREDICTION_WORKFLOW] All model predictions failed");
    throw new Error("All model predictions failed");
  }

  console.log(
    "[PREDICTION_WORKFLOW] Prediction workflow completed successfully",
    { predictionsCount: allPredictions.length },
  );
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
  return await createPredictionRequest(input.token, {
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
  task: string,
): Promise<PredictionResponse | null> {
  // 1. Fetch from AI Service
  const predictionResult = await fetchPredictionFromAIService(
    imageBlob,
    fileName,
    model.name,
  );

  if (
    !predictionResult ||
    predictionResult.status === "error" ||
    !predictionResult.result?.predictions?.length
  ) {
    return null;
  }

  // 2. Save to DB
  const savedPrediction = await createPrediction({
    requestId,
    modelId: model.id,
  });

  // 2.1 Process Results based on Task
  let enrichedClassifications: EnrichedClassification[] = [];
  let enrichedDetections: EnrichedDetection[] = [];

  if (task === "classification") {
    // Process Classifications
    const classifications = predictionResult.result
      .predictions as Classification[];

    // Save to DB
    await createClassifications(
      classifications.map((p) => ({
        predictionId: savedPrediction.id,
        classId: p.class_id,
        confidence: p.confidence,
      })),
    );

    // Enrich
    enrichedClassifications = await enrichClassificationData(
      classifications,
      model.id,
    );
  } else if (task === "detection") {
    // Process Detections
    // Need to cast carefully or validate
    const detectionsRaw = predictionResult.result.predictions as Detection[];
    // Map raw box to expected format for DB and Enrichment
    const detections = detectionsRaw.map((d) => ({
      class_id: d.class_id,
      confidence: d.confidence,
      x_left: d.box[0],
      y_top: d.box[1],
      width: d.box[2],
      height: d.box[3],
    }));

    // Save to DB
    await createDetections(
      detections.map((d) => ({
        predictionId: savedPrediction.id,
        classId: d.class_id,
        confidence: d.confidence,
        xLeft: d.x_left,
        yTop: d.y_top,
        width: d.width,
        height: d.height,
      })),
    );
    enrichedDetections = await enrichDetectionData(detections, model.id);
  }

  return {
    status: predictionResult.status,
    error: predictionResult.error,
    result: {
      classifications:
        enrichedClassifications.length > 0
          ? enrichedClassifications
          : undefined,
      detections:
        enrichedDetections.length > 0 ? enrichedDetections : undefined,
      metadata: predictionResult.result.metadata,
    },
    db_prediction_id: savedPrediction.id,
  };
}

async function enrichClassificationData(
  predictions: Classification[],
  modelId: string,
): Promise<EnrichedClassification[]> {
  const enrichedClassifications: EnrichedClassification[] = [];

  for (const pred of predictions) {
    const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
      classId: pred.class_id,
      modelId: modelId,
    });

    if (!classInfo) {
      console.error("[PREDICTION_WORKFLOW] Disease mapping not found", {
        classId: pred.class_id,
        modelId,
      });
      throw new Error(
        `Disease mapping not found for class_id ${pred.class_id} and model ${modelId}`,
      );
    }

    enrichedClassifications.push({
      ...pred,
      disease_id: classInfo.diseaseId,
      disease_name: classInfo.diseaseName,
      stage_idx: classInfo.stageIdx,
      stage_content: classInfo.diseaseStages[classInfo.stageIdx],
    });
  }

  return enrichedClassifications;
}

async function enrichDetectionData(
  detections: ProcessedDetection[],
  modelId: string,
): Promise<EnrichedDetection[]> {
  const enrichedDetections: EnrichedDetection[] = [];

  for (const det of detections) {
    const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
      classId: det.class_id,
      modelId: modelId,
    });

    if (!classInfo) {
      console.error("[PREDICTION_WORKFLOW] Disease mapping not found", {
        classId: det.class_id,
        modelId,
      });
      throw new Error(
        `Disease mapping not found for class_id ${det.class_id} and model ${modelId}`,
      );
    }

    enrichedDetections.push({
      class_id: det.class_id,
      confidence: det.confidence,
      bbox: {
        x_left: det.x_left,
        y_top: det.y_top,
        width: det.width,
        height: det.height,
      },
      disease_id: classInfo.diseaseId,
      disease_name: classInfo.diseaseName,
      stage_idx: classInfo.stageIdx,
      stage_content: classInfo.diseaseStages[classInfo.stageIdx],
    });
  }

  return enrichedDetections;
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
      const errorData = await predictionResponse.json().catch(() => ({}));
      console.error("[PREDICTION_WORKFLOW] AI Service returned error", {
        status: predictionResponse.status,
        statusText: predictionResponse.statusText,
        modelName,
        errorData,
      });
      return null;
    }

    return await predictionResponse.json();
  } catch (error) {
    console.error(`Error fetching prediction from model ${modelName}:`, error);
    return null;
  }
}
