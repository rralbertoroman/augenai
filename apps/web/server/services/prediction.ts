"use server";

import { db } from "../db/client";
import { PredictionsTable } from "../db/schemas";
import {
  CreatePredictionSchema,
  type CreatePredictionInput,
  type PredictionDTO,
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
