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
import { getCurrentUser, verifyOwnership } from "../auth";

export const createPredictionSharing = async (
  token: string,
  data: CreatePredictionSharingInput,
): Promise<PredictionSharingDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreatePredictionSharingSchema.parse(data);
  const [sharing] = await db
    .insert(PredictionSharingTable)
    .values({
      ...payload,
      userId: user.userId,
    })
    .returning();

  if (!sharing) {
    throw new Error("Error creating the prediction sharing");
  }

  return sharing;
};

export const getPredictionSharingsByPrediction = async (
  token: string,
  data: GetPredictionSharingsByPredictionInput,
): Promise<PredictionSharingDTO[]> => {
  await getCurrentUser(token);
  const { predictionId } = GetPredictionSharingsByPredictionSchema.parse(data);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.predictionId, predictionId));
  return sharings;
};

export const getPredictionSharingsByUser = async (
  token: string,
  data: GetPredictionSharingsByUserInput,
): Promise<PredictionSharingDTO[]> => {
  const user = await getCurrentUser(token);
  const { userId } = GetPredictionSharingsByUserSchema.parse(data);
  verifyOwnership(user, userId);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.userId, userId));
  return sharings;
};
