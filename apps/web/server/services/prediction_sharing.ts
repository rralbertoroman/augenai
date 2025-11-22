"use server";

import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionSharingTable } from "../db/schemas";
import {
  CreatePredictionSharingSchema,
  DeletePredictionSharingSchema,
  GetPredictionSharingsByPredictionSchema,
  GetPredictionSharingsByUserSchema,
  GetPredictionSharingByIdsSchema,
  UpdatePredictionSharingSchema,
  type CreatePredictionSharingInput,
  type DeletePredictionSharingInput,
  type GetPredictionSharingsByPredictionInput,
  type GetPredictionSharingsByUserInput,
  type GetPredictionSharingByIdsInput,
  type PredictionSharingDTO,
  type UpdatePredictionSharingInput,
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

export const getPredictionSharing = async (
  data: GetPredictionSharingByIdsInput,
): Promise<PredictionSharingDTO | null> => {
  const { predictionId, userId } = GetPredictionSharingByIdsSchema.parse(data);
  const [sharing] = await db
    .select()
    .from(PredictionSharingTable)
    .where(
      and(
        eq(PredictionSharingTable.predictionId, predictionId),
        eq(PredictionSharingTable.userId, userId),
      ),
    );

  if (!sharing) {
    return null;
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

export const updatePredictionSharing = async (
  predictionId: string,
  userId: string,
  data: UpdatePredictionSharingInput,
): Promise<PredictionSharingDTO> => {
  const payload = UpdatePredictionSharingSchema.parse(data);

  const [sharing] = await db
    .update(PredictionSharingTable)
    .set(payload)
    .where(
      and(
        eq(PredictionSharingTable.predictionId, predictionId),
        eq(PredictionSharingTable.userId, userId),
      ),
    )
    .returning();

  if (!sharing) {
    throw new Error("Prediction sharing not found");
  }

  return sharing;
};

export const deletePredictionSharing = async (
  data: DeletePredictionSharingInput,
): Promise<boolean> => {
  const { predictionId, userId } = DeletePredictionSharingSchema.parse(data);

  const deleted = await db
    .delete(PredictionSharingTable)
    .where(
      and(
        eq(PredictionSharingTable.predictionId, predictionId),
        eq(PredictionSharingTable.userId, userId),
      ),
    )
    .returning();
  return deleted.length > 0;
};
