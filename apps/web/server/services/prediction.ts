"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionsTable } from "../db/schemas";
import {
  CreatePredictionSchema,
  DeletePredictionSchema,
  GetPredictionsByModelSchema,
  GetPredictionsByRequestSchema,
  UpdatePredictionSchema,
  type CreatePredictionInput,
  type DeletePredictionInput,
  type GetPredictionsByModelInput,
  type GetPredictionsByRequestInput,
  type PredictionDTO,
  type UpdatePredictionInput,
} from "../zod-schemas/prediction";

export const createPrediction = async (
  data: CreatePredictionInput,
): Promise<PredictionDTO> => {
  const payload = CreatePredictionSchema.parse(data);
  const [prediction] = await db
    .insert(PredictionsTable)
    .values(payload)
    .returning();

  if (!prediction) {
    throw new Error("Error creating the prediction");
  }

  return prediction;
};

export const getPredictionById = async (
  id: string,
): Promise<PredictionDTO | null> => {
  const [prediction] = await db
    .select()
    .from(PredictionsTable)
    .where(eq(PredictionsTable.id, id));

  if (!prediction) {
    throw new Error("Prediction not found");
  }

  return prediction;
};

export const getAllPredictions = async (): Promise<PredictionDTO[]> => {
  const predictions = await db.select().from(PredictionsTable);
  return predictions;
};

export const getPredictionsByRequest = async (
  data: GetPredictionsByRequestInput,
): Promise<PredictionDTO[]> => {
  const { requestId } = GetPredictionsByRequestSchema.parse(data);
  const predictions = await db
    .select()
    .from(PredictionsTable)
    .where(eq(PredictionsTable.requestId, requestId));
  return predictions;
};

export const getPredictionsByModel = async (
  data: GetPredictionsByModelInput,
): Promise<PredictionDTO[]> => {
  const { modelId } = GetPredictionsByModelSchema.parse(data);
  const predictions = await db
    .select()
    .from(PredictionsTable)
    .where(eq(PredictionsTable.modelId, modelId));
  return predictions;
};

export const updatePrediction = async (
  id: string,
  data: UpdatePredictionInput,
): Promise<PredictionDTO> => {
  const payload = UpdatePredictionSchema.parse(data);

  const [prediction] = await db
    .update(PredictionsTable)
    .set(payload)
    .where(eq(PredictionsTable.id, id))
    .returning();

  if (!prediction) {
    throw new Error("Prediction not found");
  }

  return prediction;
};

export const deletePrediction = async (
  data: DeletePredictionInput,
): Promise<boolean> => {
  const { id } = DeletePredictionSchema.parse(data);

  const deleted = await db
    .delete(PredictionsTable)
    .where(eq(PredictionsTable.id, id))
    .returning({ id: PredictionsTable.id });
  return deleted.length > 0;
};
