"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionRequestsTable } from "../db/schemas";
import {
  CreatePredictionRequestSchema,
  GetPredictionRequestByIdSchema,
  type CreatePredictionRequestInput,
  type GetPredictionRequestByIdInput,
  type PredictionRequestDTO,
} from "../zod-schemas/prediction_request";
import {
  type EnrichedPredictionDTO,
  type EnrichedPredictionRequestDTO,
  type EnrichedClassification,
  type EnrichedDetection,
  type PredictionRequestWithRelations,
} from "../zod-schemas/prediction_workflow";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { getPredictionClassLesionByClassIdAndModelId } from "./prediction_class_lesion";
import { getCurrentUser, verifyOwnership } from "../auth";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Internal Helper: Processes raw DB predictions into the enriched DTO format.
 * Maps disease/lesion IDs to names and structures the hierarchy (Request -> Predictions -> Classifications/Detections).
 */
const buildEnrichedPredictionRequest = async (
  request: PredictionRequestWithRelations,
  includeFeedbacks: boolean = false,
): Promise<EnrichedPredictionRequestDTO> => {
  const enrichedPredictions: EnrichedPredictionDTO[] = [];

  for (const prediction of request.predictions) {
    const { modelId, id: predictionId, createdAt } = prediction;
    const classifications: EnrichedClassification[] = [];
    const detections: EnrichedDetection[] = [];

    // Process Classifications
    if (
      prediction.classifications &&
      Array.isArray(prediction.classifications)
    ) {
      for (const classification of prediction.classifications) {
        const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
          classId: classification.classId,
          modelId,
        });

        if (!classInfo) {
          throw new Error(
            `Disease mapping not found for class_id ${classification.classId} and model ${modelId}`,
          );
        }

        classifications.push({
          id: classification.id,
          class_id: classification.classId,
          confidence: classification.confidence,
          disease_id: classInfo.diseaseId,
          disease_name: classInfo.diseaseName,
          stage_idx: classInfo.stageIdx,
          stage_content: classInfo.diseaseStages[classInfo.stageIdx],
          feedbacks:
            includeFeedbacks && classification.feedbacks
              ? classification.feedbacks.map((f) => ({
                  id: f.id,
                  classificationId: f.classificationId,
                  userProfileId: f.userProfileId,
                  isMainUser: f.isMainUser,
                  isMainData: f.isMainData,
                  classId: f.classId,
                  confidence: f.confidence,
                  createdAt: f.createdAt,
                  updatedAt: f.updatedAt,
                }))
              : undefined,
        });
      }
    }

    // Process Detections
    if (prediction.detections && Array.isArray(prediction.detections)) {
      for (const detection of prediction.detections) {
        const lesionInfo = await getPredictionClassLesionByClassIdAndModelId({
          classId: detection.classId,
          modelId,
        });

        if (!lesionInfo) {
          throw new Error(
            `Lesion mapping not found for class_id ${detection.classId} and model ${modelId}`,
          );
        }

        detections.push({
          id: detection.id,
          class_id: detection.classId,
          confidence: detection.confidence,
          lesion_name: lesionInfo.lesionName,
          bbox: {
            x_left: detection.xLeft,
            y_top: detection.yTop,
            width: detection.width,
            height: detection.height,
          },
          feedbacks:
            includeFeedbacks && detection.feedbacks
              ? detection.feedbacks.map((f) => ({
                  id: f.id,
                  detectionId: f.detectionId,
                  userProfileId: f.userProfileId,
                  isMainUser: f.isMainUser,
                  isMainData: f.isMainData,
                  classId: f.classId,
                  confidence: f.confidence,
                  createdAt: f.createdAt,
                  updatedAt: f.updatedAt,
                  xLeft: f.xLeft,
                  yTop: f.yTop,
                  width: f.width,
                  height: f.height,
                }))
              : undefined,
        });
      }
    }

    enrichedPredictions.push({
      prediction_id: predictionId,
      model_id: modelId,
      created_at: createdAt,
      classifications,
      detections,
    });
  }

  return {
    id: request.id,
    user_id: request.userId,
    patient_id: request.patientId,
    task: request.task,
    image_type: request.imageType,
    diseases: request.diseases,
    storage_path: request.storagePath,
    bucket_name: request.bucketName,
    models_used: request.modelsUsed,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    patient_name: request.patient.name,
    patient_birth_date: request.patient.dateOfBirth,
    image_bucket: request.bucketName,
    image_path: request.storagePath,
    predictions: enrichedPredictions,
  };
};

// ============================================================================
// CREATION
// ============================================================================

/**
 * Creates a new Prediction Request record in the database.
 * Usage (Internal): Used by the prediction workflow to initialize a request.
 */
export const createPredictionRequest = async (
  token: string,
  data: CreatePredictionRequestInput,
): Promise<PredictionRequestDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreatePredictionRequestSchema.parse(data);

  const [predictionRequest] = await db
    .insert(PredictionRequestsTable)
    .values({
      ...payload,
      userId: user.userId,
    })
    .returning();

  if (!predictionRequest) {
    throw new Error("Error creating the prediction request");
  }

  return predictionRequest;
};

// ============================================================================
// USER QUERIES (REQUESTS)
// ============================================================================

/**
 * Retrieves all prediction requests for a user, including their predictions (classifications/detections).
 * Usage (FE): Used by the Dashboard (PredictionRequestList) to show the history of requests.
 */
export const getAllPredictionRequestsWithPredictionsByUserId = async (
  token: string,
  userId: string,
): Promise<EnrichedPredictionRequestDTO[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: eq(PredictionRequestsTable.userId, userId),
    with: {
      predictions: {
        with: {
          classifications: true,
          detections: true,
        },
      },
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const results = await Promise.all(
    predictionRequests.map((request) =>
      buildEnrichedPredictionRequest(request, false),
    ),
  );

  return results;
};

/**
 * Retrieves all prediction requests for a user, including feedback data.
 * Usage (FE): Potentially used for a detailed history view that highlights feedback status.
 */
export const getAllPredictionRequestsWithFeedbacksByUserId = async (
  token: string,
  userId: string,
): Promise<EnrichedPredictionRequestDTO[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: eq(PredictionRequestsTable.userId, userId),
    with: {
      predictions: {
        with: {
          classifications: {
            with: {
              feedbacks: true,
            },
          },
          detections: {
            with: {
              feedbacks: true,
            },
          },
        },
      },
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const results = await Promise.all(
    predictionRequests.map((request) =>
      buildEnrichedPredictionRequest(request, true),
    ),
  );

  return results;
};

// ============================================================================
// SYSTEM/ADMIN QUERIES
// ============================================================================

/**
 * Retrieves all prediction requests across the system (admin view).
 * Usage (FE): Likely for an admin panel to view all system activity.
 */
export const getAllSystemPredictionRequests = async (
  token: string,
): Promise<EnrichedPredictionRequestDTO[]> => {
  await getCurrentUser(token); // Verify authentication only

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    with: {
      predictions: {
        with: {
          classifications: {
            with: {
              feedbacks: true,
            },
          },
          detections: {
            with: {
              feedbacks: true,
            },
          },
        },
      },
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const results = await Promise.all(
    predictionRequests.map((request) =>
      buildEnrichedPredictionRequest(request, true),
    ),
  );

  return results;
};

// ============================================================================
// SINGLE REQUEST QUERIES
// ============================================================================

/**
 * Retrieves a single prediction request by ID with full details.
 * Usage (FE): Used by the Prediction Detail Page (diagnosis/[id]).
 */
export const getPredictionRequestById = async (
  token: string,
  data: GetPredictionRequestByIdInput,
): Promise<EnrichedPredictionRequestDTO | null> => {
  await getCurrentUser(token); // Verify authentication only
  const { id } = GetPredictionRequestByIdSchema.parse(data);

  const request = await db.query.PredictionRequestsTable.findFirst({
    where: eq(PredictionRequestsTable.id, id),
    with: {
      predictions: {
        with: {
          classifications: true,
          detections: true,
        },
      },
      patient: true,
    },
  });

  if (!request) {
    return null;
  }

  return await buildEnrichedPredictionRequest(request, false);
};
