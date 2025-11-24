"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionRequestsTable } from "../db/schemas";
import {
  CreatePredictionRequestSchema,
  type CreatePredictionRequestInput,
  type PredictionRequestDTO,
} from "../zod-schemas/prediction_request";
import { type EnrichedPredictionDTO } from "../zod-schemas/prediction";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { getCurrentUser, verifyOwnership } from "../auth";

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
          diagnoses: true,
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
      if (!prediction.diagnoses || !Array.isArray(prediction.diagnoses))
        continue;

      for (const diagnosis of prediction.diagnoses) {
        const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
          classId: diagnosis.classId,
          modelId: prediction.modelId,
        });

        if (!classInfo) {
          throw new Error(
            `Disease mapping not found for class_id ${diagnosis.classId} and model ${prediction.modelId}`,
          );
        }

        enrichedPredictions.push({
          id: diagnosis.id,
          class_id: diagnosis.classId,
          confidence: diagnosis.confidence,
          disease_id: classInfo.diseaseId,
          disease_name: classInfo.diseaseName,
          stage_idx: classInfo.stageIdx,
          stage_content: classInfo.diseaseStages[classInfo.stageIdx],
          patient_id: request.patientId,
          createdAt: diagnosis.createdAt,
        });
      }
    }
  }

  return enrichedPredictions;
};
