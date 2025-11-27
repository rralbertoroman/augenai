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
import { type EnrichedPredictionDTO } from "../zod-schemas/prediction";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { getCurrentUser, verifyOwnership } from "../auth";
import { PatientDTO } from "../zod-schemas";

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
  await getCurrentUser(token); // Verify authentication only
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

  const enrichedPredictions: EnrichedPredictionDTO[] = [];

  for (const request of predictionRequests) {
    for (const prediction of request.predictions) {
      // Process Classifications
      if (
        prediction.classifications &&
        Array.isArray(prediction.classifications)
      ) {
        for (const classification of prediction.classifications) {
          const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
            classId: classification.classId,
            modelId: prediction.modelId,
          });

          if (!classInfo) {
            throw new Error(
              `Disease mapping not found for class_id ${classification.classId} and model ${prediction.modelId}`,
            );
          }

          enrichedPredictions.push({
            id: classification.id,
            class_id: classification.classId,
            model_id: prediction.modelId,
            confidence: classification.confidence,
            disease_id: classInfo.diseaseId,
            disease_name: classInfo.diseaseName,
            stage_idx: classInfo.stageIdx,
            stage_content: classInfo.diseaseStages[classInfo.stageIdx],
            patient_id: request.patientId,
            request_id: request.id,
            createdAt: classification.createdAt,
            type: "classification",
            bucket_name: request.bucketName,
            storage_path: request.storagePath,
          });
        }
      }

      // Process Detections
      if (prediction.detections && Array.isArray(prediction.detections)) {
        for (const detection of prediction.detections) {
          const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
            classId: detection.classId,
            modelId: prediction.modelId,
          });

          if (!classInfo) {
            throw new Error(
              `Disease mapping not found for class_id ${detection.classId} and model ${prediction.modelId}`,
            );
          }

          enrichedPredictions.push({
            id: detection.id,
            class_id: detection.classId,
            model_id: prediction.modelId,
            confidence: detection.confidence,
            disease_id: classInfo.diseaseId,
            disease_name: classInfo.diseaseName,
            stage_idx: classInfo.stageIdx,
            stage_content: classInfo.diseaseStages[classInfo.stageIdx],
            patient_id: request.patientId,
            request_id: request.id,
            createdAt: detection.createdAt,
            type: "detection",
            bbox: {
              x_left: detection.xLeft,
              y_top: detection.yTop,
              width: detection.width,
              height: detection.height,
            },
            bucket_name: request.bucketName,
            storage_path: request.storagePath,
          });
        }
      }
    }
  }

  return enrichedPredictions;
};

export const getPredictionRequestById = async (
  token: string,
  data: GetPredictionRequestByIdInput,
): Promise<{
  request: PredictionRequestDTO;
  patient: PatientDTO;
  enrichedPredictions: EnrichedPredictionDTO[];
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

  const enrichedPredictions: EnrichedPredictionDTO[] = [];

  for (const prediction of request.predictions) {
    // Process Classifications
    if (
      prediction.classifications &&
      Array.isArray(prediction.classifications)
    ) {
      for (const classification of prediction.classifications) {
        const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
          classId: classification.classId,
          modelId: prediction.modelId,
        });

        if (!classInfo) {
          throw new Error(
            `Disease mapping not found for class_id ${classification.classId} and model ${prediction.modelId}`,
          );
        }

        enrichedPredictions.push({
          id: classification.id,
          class_id: classification.classId,
          model_id: prediction.modelId,
          confidence: classification.confidence,
          disease_id: classInfo.diseaseId,
          disease_name: classInfo.diseaseName,
          stage_idx: classInfo.stageIdx,
          stage_content: classInfo.diseaseStages[classInfo.stageIdx],
          patient_id: request.patientId,
          request_id: request.id,
          createdAt: classification.createdAt,
          type: "classification",
          bucket_name: request.bucketName,
          storage_path: request.storagePath,
        });
      }
    }

    // Process Detections
    if (prediction.detections && Array.isArray(prediction.detections)) {
      for (const detection of prediction.detections) {
        const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
          classId: detection.classId,
          modelId: prediction.modelId,
        });

        if (!classInfo) {
          throw new Error(
            `Disease mapping not found for class_id ${detection.classId} and model ${prediction.modelId}`,
          );
        }

        enrichedPredictions.push({
          id: detection.id,
          class_id: detection.classId,
          model_id: prediction.modelId,
          confidence: detection.confidence,
          disease_id: classInfo.diseaseId,
          disease_name: classInfo.diseaseName,
          stage_idx: classInfo.stageIdx,
          stage_content: classInfo.diseaseStages[classInfo.stageIdx],
          patient_id: request.patientId,
          request_id: request.id,
          createdAt: detection.createdAt,
          type: "detection",
          bbox: {
            x_left: detection.xLeft,
            y_top: detection.yTop,
            width: detection.width,
            height: detection.height,
          },
          bucket_name: request.bucketName,
          storage_path: request.storagePath,
        });
      }
    }
  }

  return {
    request,
    patient: request.patient,
    enrichedPredictions,
  };
};
