"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionSharingTable } from "../db/schemas";
import {
  CreatePredictionSharingSchema,
  GetPredictionSharingsByPredictionSchema,
  GetPredictionSharingsByUserSchema,
  type CreatePredictionSharingInput,
  type GetPredictionSharingsByPredictionInput,
  type GetPredictionSharingsByUserInput,
  type PredictionSharingDTO,
} from "../zod-schemas/prediction_sharing";

export const createPredictionSharing = async (
  data: CreatePredictionSharingInput,
): Promise<PredictionSharingDTO> => {
  const payload = CreatePredictionSharingSchema.parse(data);
  const [sharing] = await db
    .insert(PredictionSharingTable)
    .values(payload)
    .returning();

  if (!sharing) {
    throw new Error("Error creating the prediction sharing");
  }

  return sharing;
};

export const getPredictionSharingsByPrediction = async (
  data: GetPredictionSharingsByPredictionInput,
): Promise<PredictionSharingDTO[]> => {
  const { predictionId } = GetPredictionSharingsByPredictionSchema.parse(data);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.predictionId, predictionId));
  return sharings;
};

export const getPredictionSharingsByUser = async (
  data: GetPredictionSharingsByUserInput,
): Promise<PredictionSharingDTO[]> => {
  const { userId } = GetPredictionSharingsByUserSchema.parse(data);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.userId, userId));
  return sharings;
};
