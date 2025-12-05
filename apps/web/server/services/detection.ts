"use server";

import { eq, gte, and } from "drizzle-orm";
import { db } from "../db/client";
import { DetectionsTable, PredictionRequestsTable } from "../db/schemas";
import {
  CreateDetectionSchema,
  type CreateDetectionInput,
  type DetectionDTO,
} from "../zod-schemas/detection";
import { z } from "zod";
import {
  type DetectionWithExtras,
  type PredictionRequestWithRelations,
  type Detection,
} from "../zod-schemas/prediction_workflow";
import { getCurrentUser, verifyOwnership } from "../auth";
import { getPredictionClassLesionByClassIdAndModelId } from "./prediction_class_lesion";

export const createDetections = async (
  inputs: CreateDetectionInput[],
): Promise<DetectionDTO[]> => {
  if (inputs.length === 0) return [];

  const payload = z.array(CreateDetectionSchema).parse(inputs);

  const detections = await db
    .insert(DetectionsTable)
    .values(payload)
    .returning();

  return detections;
};

/**
 * Internal Helper: Flattens the hierarchical prediction structure into a single list of findings.
 * Useful for list views or tables where grouping by request is not needed.
 */
const flattenPredictionsWithExtras = async (
  request: PredictionRequestWithRelations,
  includeFeedbacks: boolean = false,
): Promise<
  Array<
    Detection & {
      model_id: string;
      prediction_id: string;
      request_id: string;
      patient_id: string;
      patient_name?: string;
      patient_birth_date?: string;
      created_at: Date;
      bucket_name?: string;
      storage_path?: string;
    }
  >
> => {
  const allDetections: Array<
    Detection & {
      model_id: string;
      prediction_id: string;
      request_id: string;
      patient_id: string;
      patient_name?: string;
      patient_birth_date?: string;
      created_at: Date;
      bucket_name?: string;
      storage_path?: string;
    }
  > = [];

  for (const prediction of request.predictions) {
    const { modelId, id: predictionId, createdAt } = prediction;

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

        allDetections.push({
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
          model_id: modelId,
          prediction_id: predictionId,
          request_id: request.id,
          patient_id: request.patientId,
          patient_name: request.patient.name,
          patient_birth_date: request.patient.dateOfBirth,
          created_at: createdAt,
          bucket_name: request.bucketName,
          storage_path: request.storagePath,
        });
      }
    }
  }

  return allDetections;
};

/**
 * Retrieves a flattened list of all detections for a user.
 * Usage (FE): Used by general 'Detections' stats or list views.
 */
export const getAllDetectionsWithExtrasByUserId = async (
  token: string,
  userId: string,
): Promise<DetectionWithExtras[]> => {
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

  const allDetections: DetectionWithExtras[] = [];

  for (const request of predictionRequests) {
    const detections = await flattenPredictionsWithExtras(request, false);
    allDetections.push(...detections);
  }

  return allDetections;
};

/**
 * Retrieves a flattened list of all detections with their feedback data.
 * Usage (FE): Used by detection feedback hooks.
 * @param token - Authentication token
 * @param userId - User ID to filter by
 * @param daysBack - Optional number of days to look back (default: all time)
 */
export const getAllDetectionsWithFeedbacksAndExtrasByUserId = async (
  token: string,
  userId: string,
  daysBack?: number,
): Promise<DetectionWithExtras[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  // Calculate date filter if daysBack is provided
  let whereClause;
  if (daysBack !== undefined && daysBack > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    whereClause = and(
      eq(PredictionRequestsTable.userId, userId),
      gte(PredictionRequestsTable.createdAt, cutoffDate)
    );
  } else {
    whereClause = eq(PredictionRequestsTable.userId, userId);
  }

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: whereClause,
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

  const allDetections: DetectionWithExtras[] = [];

  for (const request of predictionRequests) {
    const detections = await flattenPredictionsWithExtras(request, true);
    allDetections.push(...detections);
  }

  return allDetections;
};

/**
 * Retrieves all detections across the system with feedback.
 * Usage (FE): Used by DashboardContext for detections (Admin/Supervisor view).
 * @param token - Authentication token
 * @param daysBack - Optional number of days to look back (default: all time)
 */
export const getAllSystemDetectionsWithFeedbacksAndExtras = async (
  token: string,
  daysBack?: number,
): Promise<DetectionWithExtras[]> => {
  await getCurrentUser(token); // Verify authentication only

  // Calculate date filter if daysBack is provided
  let dateFilter;
  if (daysBack !== undefined && daysBack > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    dateFilter = gte(PredictionRequestsTable.createdAt, cutoffDate);
  }

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: dateFilter,
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

  const allDetections: DetectionWithExtras[] = [];

  for (const request of predictionRequests) {
    const detections = await flattenPredictionsWithExtras(request, true);
    allDetections.push(...detections);
  }

  return allDetections;
};

/**
 * Retrieves detections for a specific request, flattened with extras.
 * Usage (FE): Used by the Prediction Detail Page to display a simple list of detections found in that request.
 */
export const getDetectionsWithExtrasByRequestId = async (
  token: string,
  id: string,
): Promise<DetectionWithExtras[]> => {
  await getCurrentUser(token); // Verify authentication only

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
    return [];
  }

  const detections = await flattenPredictionsWithExtras(request, false);
  return detections;
};
