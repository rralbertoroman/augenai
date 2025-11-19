"use server";

import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { FeedbackTable } from "../db/schemas";
import {
  CreateFeedbackSchema,
  DeleteFeedbackSchema,
  GetFeedbackByPredictionSchema,
  GetFeedbackByUserSchema,
  UpdateFeedbackSchema,
  type CreateFeedbackInput,
  type DeleteFeedbackInput,
  type GetFeedbackByPredictionInput,
  type GetFeedbackByUserInput,
  type FeedbackDTO,
  type UpdateFeedbackInput,
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

export const getFeedbackByUser = async (
  data: GetFeedbackByUserInput,
): Promise<FeedbackDTO[]> => {
  const { userProfileId } = GetFeedbackByUserSchema.parse(data);
  const feedback = await db
    .select()
    .from(FeedbackTable)
    .where(eq(FeedbackTable.userProfileId, userProfileId));
  return feedback;
};

export const updateFeedback = async (
  predictionId: string,
  userProfileId: string,
  data: UpdateFeedbackInput,
): Promise<FeedbackDTO> => {
  const payload = UpdateFeedbackSchema.parse(data);

  const [feedback] = await db
    .update(FeedbackTable)
    .set(payload)
    .where(
      and(
        eq(FeedbackTable.predictionId, predictionId),
        eq(FeedbackTable.userProfileId, userProfileId),
      ),
    )
    .returning();

  if (!feedback) {
    throw new Error("Feedback not found");
  }

  return feedback;
};

export const deleteFeedback = async (
  data: DeleteFeedbackInput,
): Promise<boolean> => {
  const { predictionId, userProfileId } = DeleteFeedbackSchema.parse(data);

  const deleted = await db
    .delete(FeedbackTable)
    .where(
      and(
        eq(FeedbackTable.predictionId, predictionId),
        eq(FeedbackTable.userProfileId, userProfileId),
      ),
    )
    .returning();
  return deleted.length > 0;
};
