"use server";

import {
  AI_PREDICTION_SERVICE_URL,
  AI_PREDICTION_SERVICE_SECRET_KEY,
  ENVIRONMENT,
} from "../constants";
import { createPrediction } from "./prediction";
import { createPredictionRequest } from "./prediction_request";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { getPredictionClassLesionByClassIdAndModelId } from "./prediction_class_lesion";
import { createClassifications } from "./classification";
import { createDetections } from "./detection";
import { supabaseAdmin } from "../supabase/client";
import { selectOptimalModels } from "./model";
import { type OptimalModel } from "../zod-schemas/model";
import { sendPredictionToSupervisor } from "./prediction_sharing";
import { getPatientById } from "./patient";

import {
  PredictionWorkflowInputSchema,
  type PredictionWorkflowInput,
  type Prediction,
  type PredictionRequest,
  type Classification,
  type Detection,
} from "../zod-schemas/prediction_workflow";
import {
  type AIServicePredictionResponse,
  type AIServiceClassification,
  type AIServiceDetection,
} from "../zod-schemas/ai_service";

// ============================================================================
// MAIN WORKFLOW
// ============================================================================

/**
 * Main entry point for the prediction workflow.
 * This function orchestrates the entire process of:
 * 1. Validating input and fetching patient data
 * 2. Selecting optimal AI models based on task and disease
 * 3. Downloading the image from storage
 * 4. Creating a prediction request record in the DB
 * 5. Sending the image to the AI Service for each selected model
 * 6. Saving the results (predictions, classifications, detections) to the DB
 * 7. Sharing the prediction with a supervisor if configured
 * 8. Returning the fully  prediction request with all results
 *
 * Usage (FE): Called by the Server Action or API endpoint when a user submits a new diagnosis request.
 */
export async function processPredictionRequest(
  input: PredictionWorkflowInput,
): Promise<PredictionRequest> {
  console.log("[PREDICTION_WORKFLOW] Starting prediction request", { input });
  const validatedInput = PredictionWorkflowInputSchema.parse(input);
  const { task, imageType, diseases, storagePath, bucketName, patientId } =
    validatedInput;
  console.log("[PREDICTION_WORKFLOW] Validated input", {
    task,
    imageType,
    diseases,
    storagePath,
    bucketName,
    patientId,
  });

  // 1. Get patient data
  console.log("[PREDICTION_WORKFLOW] Fetching patient data...");
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new Error(`Patient not found: ${patientId}`);
  }
  console.log("[PREDICTION_WORKFLOW] Patient data fetched", {
    patientName: patient.name,
  });

  // 2. Select optimal models
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

  // 3. Download image
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

  // 4. Create prediction request record
  console.log("[PREDICTION_WORKFLOW] Saving prediction request...");
  const predictionRequest = await savePredictionRequest(
    validatedInput,
    selectedModels,
  );
  console.log("[PREDICTION_WORKFLOW] Prediction request saved", {
    requestId: predictionRequest.id,
  });

  // 5. Run predictions
  console.log("[PREDICTION_WORKFLOW] Starting predictions for all models...");
  const allPredictions: Prediction[] = [];

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
          predictionResponse.prediction_id,
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

  // 6. Build and return PredictionRequestDTO
  return {
    id: predictionRequest.id,
    user_id: predictionRequest.userId,
    patient_id: predictionRequest.patientId,
    task: predictionRequest.task,
    image_type: predictionRequest.imageType,
    diseases: predictionRequest.diseases,
    storage_path: predictionRequest.storagePath,
    bucket_name: predictionRequest.bucketName,
    models_used: predictionRequest.modelsUsed,
    created_at: predictionRequest.createdAt,
    updated_at: predictionRequest.updatedAt,
    patient_name: patient.name,
    patient_birth_date: patient.dateOfBirth,
    image_bucket: bucketName,
    image_path: storagePath,
    predictions: allPredictions,
  };
}

// ============================================================================
// INFRASTRUCTURE HELPERS
// ============================================================================

/**
 * Downloads the image file from Supabase Storage.
 * Internal helper.
 */
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

/**
 * Sends the image to the external AI Service API.
 * Internal helper.
 */
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

// ============================================================================
// DATA PROCESSING HELPERS
// ============================================================================

/**
 * Creates the initial Prediction Request record in the database.
 * Internal helper.
 */
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

/**
 * Processes a single model prediction:
 * 1. Calls AI Service
 * 2. Saves Prediction record
 * 3. Saves Classifications/Detections
 * 4. Enriches data with disease/lesion info
 * Internal helper.
 */
async function processModelPrediction(
  model: OptimalModel,
  imageBlob: Blob,
  fileName: string,
  requestId: string,
  task: string,
): Promise<Prediction | null> {
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
  let Classifications: Classification[] = [];
  let Detections: Detection[] = [];

  if (task === "classification") {
    // Process Classifications
    const classifications = predictionResult.result
      .predictions as AIServiceClassification[];

    // Save to DB
    await createClassifications(
      classifications.map((p) => ({
        predictionId: savedPrediction.id,
        classId: p.class_id,
        confidence: p.confidence,
      })),
    );

    // Enrich
    Classifications = await enrichClassificationData(classifications, model.id);
  } else if (task === "detection") {
    // Process Detections
    // Need to cast carefully or validate
    const detectionsRaw = predictionResult.result
      .predictions as AIServiceDetection[];
    // Map raw box to expected format for DB and Enrichment
    const detections = detectionsRaw;

    // Save to DB
    await createDetections(
      detections.map((d) => ({
        predictionId: savedPrediction.id,
        classId: d.class_id,
        confidence: d.confidence,
        xLeft: d.box[0],
        yTop: d.box[1],
        width: d.box[2],
        height: d.box[3],
      })),
    );
    Detections = await enrichDetectionData(detections, model.id);
  }

  return {
    prediction_id: savedPrediction.id,
    model_id: model.id,
    created_at: savedPrediction.createdAt,
    classifications: Classifications,
    detections: Detections,
  };
}

/**
 * Maps raw classification results to disease information (Name, Stage).
 * Internal helper.
 */
async function enrichClassificationData(
  predictions: AIServiceClassification[],
  modelId: string,
): Promise<Classification[]> {
  const Classifications: Classification[] = [];

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

    Classifications.push({
      ...pred,
      disease_id: classInfo.diseaseId,
      disease_name: classInfo.diseaseName,
      stage_idx: classInfo.stageIdx,
      stage_content: classInfo.diseaseStages[classInfo.stageIdx],
    });
  }

  return Classifications;
}

/**
 * Maps raw detection results to lesion information (Name).
 * Internal helper.
 */
async function enrichDetectionData(
  detections: AIServiceDetection[],
  modelId: string,
): Promise<Detection[]> {
  const Detections: Detection[] = [];

  for (const det of detections) {
    const lesionInfo = await getPredictionClassLesionByClassIdAndModelId({
      classId: det.class_id,
      modelId: modelId,
    });

    if (!lesionInfo) {
      console.error("[PREDICTION_WORKFLOW] Lesion mapping not found", {
        classId: det.class_id,
        modelId,
      });
      throw new Error(
        `Lesion mapping not found for class_id ${det.class_id} and model ${modelId}`,
      );
    }

    Detections.push({
      class_id: det.class_id,
      confidence: det.confidence,
      bbox: {
        x_left: det.box[0],
        y_top: det.box[1],
        width: det.box[2],
        height: det.box[3],
      },
      lesion_name: lesionInfo.lesionName,
    });
  }

  return Detections;
}
