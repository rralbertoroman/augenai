"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { FeedbackTable } from "../db/schemas";
import {
  CreateFeedbackSchema,
  GetFeedbackByPredictionSchema,
  type CreateFeedbackInput,
  type GetFeedbackByPredictionInput,
  type FeedbackDTO,
} from "../zod-schemas/feedback";

export const createFeedback = async (
  data: CreateFeedbackInput,
): Promise<FeedbackDTO> => {
  const payload = CreateFeedbackSchema.parse(data);
  const [feedback] = await db.insert(FeedbackTable).values(payload).returning();

  if (!feedback) {
    throw new Error("Error creating the feedback");
  }

  return feedback;
};

export const getFeedbackByPrediction = async (
  data: GetFeedbackByPredictionInput,
): Promise<FeedbackDTO[]> => {
  const { predictionId } = GetFeedbackByPredictionSchema.parse(data);
  const feedback = await db
    .select()
    .from(FeedbackTable)
    .where(eq(FeedbackTable.predictionId, predictionId));
  return feedback;
};
