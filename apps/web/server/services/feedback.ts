"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { FeedbackTable } from "../db/schemas";
import {
  CreateFeedbackSchema,
  GetFeedbackByDiagnosisSchema,
  type CreateFeedbackInput,
  type GetFeedbackByDiagnosisInput,
  type FeedbackDTO,
} from "../zod-schemas/feedback";
import { getCurrentUser } from "../auth";

export const createFeedback = async (
  token: string,
  data: CreateFeedbackInput,
): Promise<FeedbackDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreateFeedbackSchema.parse(data);

  const [feedback] = await db
    .insert(FeedbackTable)
    .values({
      ...payload,
      userProfileId: user.userId,
    })
    .returning();

  if (!feedback) {
    throw new Error("Error creating the feedback");
  }

  return feedback;
};

export const getFeedbackByDiagnosis = async (
  token: string,
  data: GetFeedbackByDiagnosisInput,
): Promise<FeedbackDTO[]> => {
  await getCurrentUser(token);
  const { diagnosisId } = GetFeedbackByDiagnosisSchema.parse(data);
  const feedback = await db
    .select()
    .from(FeedbackTable)
    .where(eq(FeedbackTable.diagnosisId, diagnosisId));
  return feedback;
};
