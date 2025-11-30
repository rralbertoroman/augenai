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
  type PredictionWithTasks,
} from "../zod-schemas/prediction_request";
import {
  type EnrichedPredictionDTO,
  type EnrichedClassification,
  type EnrichedDetection,
} from "../zod-schemas/prediction_workflow";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { getPredictionClassLesionByClassIdAndModelId } from "./prediction_class_lesion";
import { getCurrentUser, verifyOwnership } from "../auth";
import { PatientDTO } from "../zod-schemas";

// Helper function to process predictions in parallel
const processPredictionsInParallel = async (
  predictions: PredictionWithTasks[],
  requestContext: {
    patientId: string;
    patientBirthDate?: string;
    requestId: string;
    bucketName: string;
    storagePath: string;
    userId: string;
  },
  includeFeedbacks: boolean = false,
): Promise<EnrichedPredictionDTO> => {
  const classifications: EnrichedClassification[] = [];
  const detections: EnrichedDetection[] = [];

  for (const prediction of predictions) {
    const { modelId } = prediction;

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
          model_id: modelId,
          confidence: classification.confidence,
          disease_id: classInfo.diseaseId,
          disease_name: classInfo.diseaseName,
          stage_idx: classInfo.stageIdx,
          stage_content: classInfo.diseaseStages[classInfo.stageIdx],
          patient_id: requestContext.patientId,
          patient_birth_date: requestContext.patientBirthDate,
          request_id: requestContext.requestId,
          user_id: requestContext.userId,
          createdAt: classification.createdAt,
          bucket_name: requestContext.bucketName,
          storage_path: requestContext.storagePath,
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
          model_id: modelId,
          confidence: detection.confidence,
          lesion_name: lesionInfo.lesionName,
          patient_id: requestContext.patientId,
          patient_birth_date: requestContext.patientBirthDate,
          request_id: requestContext.requestId,
          user_id: requestContext.userId,
          createdAt: detection.createdAt,
          bbox: {
            x_left: detection.xLeft,
            y_top: detection.yTop,
            width: detection.width,
            height: detection.height,
          },
          bucket_name: requestContext.bucketName,
          storage_path: requestContext.storagePath,
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
  }

  return { classifications, detections };
};

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

export const getAllPredictionRequestsWithPredictionsByUserId = async (
  token: string,
  userId: string,
): Promise<EnrichedPredictionDTO[]> => {
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
      processPredictionsInParallel(
        request.predictions,
        {
          patientId: request.patientId,
          patientBirthDate: request.patient.dateOfBirth,
          requestId: request.id,
          bucketName: request.bucketName,
          storagePath: request.storagePath,
          userId: request.userId,
        },
        false,
      ),
    ),
  );

  return results;
};

export const getAllPredictionRequestsWithFeedbacksByUserId = async (
  token: string,
  userId: string,
): Promise<EnrichedPredictionDTO[]> => {
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
      processPredictionsInParallel(
        request.predictions,
        {
          patientId: request.patientId,
          patientBirthDate: request.patient.dateOfBirth,
          requestId: request.id,
          bucketName: request.bucketName,
          storagePath: request.storagePath,
          userId: request.userId,
        },
        true,
      ),
    ),
  );

  return results;
};

export const getPredictionRequestById = async (
  token: string,
  data: GetPredictionRequestByIdInput,
): Promise<{
  request: PredictionRequestDTO;
  patient: PatientDTO;
  enrichedPrediction: EnrichedPredictionDTO;
} | null> => {
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

  const enrichedPrediction = await processPredictionsInParallel(
    request.predictions,
    {
      patientId: request.patientId,
      patientBirthDate: request.patient.dateOfBirth,
      requestId: request.id,
      bucketName: request.bucketName,
      storagePath: request.storagePath,
      userId: request.userId,
    },
    false,
  );

  return {
    request,
    patient: request.patient,
    enrichedPrediction,
  };
};

export const getAllSystemPredictionRequests = async (
  token: string,
): Promise<EnrichedPredictionDTO[]> => {
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
      processPredictionsInParallel(
        request.predictions,
        {
          patientId: request.patientId,
          patientBirthDate: request.patient.dateOfBirth,
          requestId: request.id,
          bucketName: request.bucketName,
          storagePath: request.storagePath,
          userId: request.userId,
        },
        true,
      ),
    ),
  );

  return results;
};
