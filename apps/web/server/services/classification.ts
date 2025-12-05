"use server";

import { eq, gte, and } from "drizzle-orm";
import { db } from "../db/client";
import { ClassificationsTable, PredictionRequestsTable } from "../db/schemas";
import {
  CreateClassificationSchema,
  type CreateClassificationInput,
  type ClassificationDTO,
} from "../zod-schemas/classification";
import { z } from "zod";
import {
  type ClassificationWithExtras,
  type PredictionRequestWithRelations,
  type Classification,
} from "../zod-schemas/prediction_workflow";
import { getCurrentUser, verifyOwnership } from "../auth";
import {
  getAllPredictionClassesAsMap,
  type PredictionClassDiseaseWithDisease,
} from "./prediction_class_disease";

export const createClassifications = async (
  inputs: CreateClassificationInput[],
): Promise<ClassificationDTO[]> => {
  if (inputs.length === 0) return [];

  const payload = z.array(CreateClassificationSchema).parse(inputs);

  const classifications = await db
    .insert(ClassificationsTable)
    .values(payload)
    .returning();

  return classifications;
};

/**
 * Internal Helper: Flattens the hierarchical prediction structure into a single list of findings.
 * Useful for list views or tables where grouping by request is not needed.
 * Now accepts a pre-loaded classesMap to avoid N+1 queries.
 */
const flattenPredictionsWithExtras = (
  request: PredictionRequestWithRelations,
  classesMap: Map<string, PredictionClassDiseaseWithDisease>,
  includeFeedbacks: boolean = false,
): Array<
  Classification & {
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
> => {
  const allClassifications: Array<
    Classification & {
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

    // Process Classifications
    if (
      prediction.classifications &&
      Array.isArray(prediction.classifications)
    ) {
      for (const classification of prediction.classifications) {
        // O(1) lookup from pre-loaded map
        const key = `${classification.classId}-${modelId}`;
        const classInfo = classesMap.get(key);

        if (!classInfo) {
          throw new Error(
            `Disease mapping not found for class_id ${classification.classId} and model ${modelId}`,
          );
        }

        allClassifications.push({
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

  return allClassifications;
};

/**
 * Retrieves a flattened list of all classifications for a user.
 * Usage (FE): Used by general 'Predictions' stats or list views that don't group by request.
 */
export const getAllClassificationsWithExtrasByUserId = async (
  token: string,
  userId: string,
): Promise<ClassificationWithExtras[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  // Load all prediction classes once (O(1) lookup)
  const classesMap = await getAllPredictionClassesAsMap();

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

  const allClassifications: ClassificationWithExtras[] = [];

  for (const request of predictionRequests) {
    const classifications = flattenPredictionsWithExtras(
      request,
      classesMap,
      false,
    );
    allClassifications.push(...classifications);
  }

  return allClassifications;
};

/**
 * Retrieves a flattened list of all classifications with their feedback data.
 * Usage (FE): Used by 'usePredictionsWithFeedback' hook to show predictions that might have been reviewed.
 * @param token - Authentication token
 * @param userId - User ID to filter by
 * @param daysBack - Optional number of days to look back (default: all time)
 */
export const getAllClassificationsWithFeedbacksAndExtrasByUserId = async (
  token: string,
  userId: string,
  daysBack?: number,
): Promise<ClassificationWithExtras[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  // Load all prediction classes once (O(1) lookup)
  const classesMap = await getAllPredictionClassesAsMap();

  // Calculate date filter if daysBack is provided
  let whereClause;
  if (daysBack !== undefined && daysBack > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    whereClause = and(
      eq(PredictionRequestsTable.userId, userId),
      gte(PredictionRequestsTable.createdAt, cutoffDate),
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

  const allClassifications: ClassificationWithExtras[] = [];

  for (const request of predictionRequests) {
    const classifications = flattenPredictionsWithExtras(
      request,
      classesMap,
      true,
    );
    allClassifications.push(...classifications);
  }

  return allClassifications;
};

/**
 * Retrieves all classifications across the system with feedback.
 * Usage (FE): Used by DashboardContext (likely for Admin/Supervisor dashboard view).
 * @param token - Authentication token
 * @param daysBack - Optional number of days to look back (default: all time)
 */
export const getAllSystemClassificationsWithFeedbacksAndExtras = async (
  token: string,
  daysBack?: number,
): Promise<ClassificationWithExtras[]> => {
  await getCurrentUser(token); // Verify authentication only

  // Load all prediction classes once (O(1) lookup)
  const classesMap = await getAllPredictionClassesAsMap();

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

  const allClassifications: ClassificationWithExtras[] = [];

  for (const request of predictionRequests) {
    const classifications = flattenPredictionsWithExtras(
      request,
      classesMap,
      true,
    );
    allClassifications.push(...classifications);
  }

  return allClassifications;
};

/**
 * Retrieves classifications for a specific request, flattened with extras.
 * Usage (FE): Used by the Prediction Detail Page to display a simple list of diagnoses found in that request.
 */
export const getClassificationsWithExtrasByRequestId = async (
  token: string,
  id: string,
): Promise<ClassificationWithExtras[]> => {
  await getCurrentUser(token); // Verify authentication only

  // Load all prediction classes once (O(1) lookup)
  const classesMap = await getAllPredictionClassesAsMap();

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

  const classifications = flattenPredictionsWithExtras(
    request,
    classesMap,
    false,
  );
  return classifications;
};
