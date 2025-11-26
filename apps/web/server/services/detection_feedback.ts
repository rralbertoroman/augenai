"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { DetectionFeedbackTable } from "../db/schemas";
import {
  CreateDetectionFeedbackSchema,
  GetFeedbackByDetectionSchema,
  type CreateDetectionFeedbackInput,
  type GetFeedbackByDetectionInput,
  type DetectionFeedbackDTO,
} from "../zod-schemas/detection_feedback";
import { getCurrentUser } from "../auth";

export const createDetectionFeedback = async (
  token: string,
  data: CreateDetectionFeedbackInput,
): Promise<DetectionFeedbackDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreateDetectionFeedbackSchema.parse(data);

  const [feedback] = await db
    .insert(DetectionFeedbackTable)
    .values({
      ...payload,
      userProfileId: user.userId,
    })
    .returning();

  if (!feedback) {
    throw new Error("Error creating the detection feedback");
  }

  return feedback;
};

export const getFeedbackByDetection = async (
  token: string,
  data: GetFeedbackByDetectionInput,
): Promise<DetectionFeedbackDTO[]> => {
  await getCurrentUser(token);
  const { detectionId } = GetFeedbackByDetectionSchema.parse(data);
  const feedback = await db
    .select()
    .from(DetectionFeedbackTable)
    .where(eq(DetectionFeedbackTable.detectionId, detectionId));
  return feedback;
};
