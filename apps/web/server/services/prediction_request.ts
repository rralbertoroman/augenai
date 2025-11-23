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

export const createPredictionRequest = async (
  data: CreatePredictionRequestInput,
): Promise<PredictionRequestDTO> => {
  const payload = CreatePredictionRequestSchema.parse(data);

  const [predictionRequest] = await db
    .insert(PredictionRequestsTable)
    .values(payload)
    .returning();

  if (!predictionRequest) {
    throw new Error("Error creating the prediction request");
  }

  return predictionRequest;
};

export const getAllPredictionRequestsWithPredictionsByUserId = async (
  userId: string,
): Promise<EnrichedPredictionDTO[]> => {
  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: eq(PredictionRequestsTable.userId, userId),
    with: {
      predictions: true,
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const enrichedPredictions: EnrichedPredictionDTO[] = [];

  for (const request of predictionRequests) {
    for (const prediction of request.predictions) {
      const result = prediction.predictionResult as unknown as {
        predictions: {
          class_id: number;
          class_name: string;
          confidence: number;
        }[];
      };

      if (!result || !result.predictions || !Array.isArray(result.predictions))
        continue;

      for (const pred of result.predictions) {
        const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
          classId: pred.class_id,
          modelId: prediction.modelId,
        });

        if (classInfo) {
          enrichedPredictions.push({
            class_id: pred.class_id,
            class_name: pred.class_name,
            confidence: pred.confidence,
            disease_id: classInfo.diseaseId,
            disease_name: classInfo.diseaseName,
            stage_idx: classInfo.stageIdx,
            stage_content: classInfo.diseaseStages[classInfo.stageIdx],
            patient_id: request.patientId,
          });
        }
      }
    }
  }

  return enrichedPredictions;
};
