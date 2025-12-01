"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { DetectionFeedbackTable } from "../db/schemas";
import {
  CreateDetectionFeedbackSchema,
  GetFeedbackByDetectionSchema,
  UpdateIsMainUserSchema,
  type CreateDetectionFeedbackInput,
  type GetFeedbackByDetectionInput,
  type UpdateIsMainUserInput,
  type DetectionFeedbackDTO,
} from "../zod-schemas/detection_feedback";
import { getCurrentUser, verifyOwnership } from "../auth";

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

export const getFeedbackById = async (
  id: string,
): Promise<DetectionFeedbackDTO> => {
  const [feedback] = await db
    .select()
    .from(DetectionFeedbackTable)
    .where(eq(DetectionFeedbackTable.id, id));

  if (!feedback) {
    throw new Error("Detection feedback not found");
  }

  return feedback;
};

export const updateIsMainData = async (
  token: string,
  data: UpdateIsMainUserInput,
): Promise<DetectionFeedbackDTO> => {
  const user = await getCurrentUser(token);
  const { id, isMainData } = UpdateIsMainUserSchema.parse(data);

  const existingFeedback = await getFeedbackById(id);

  verifyOwnership(user, existingFeedback.userProfileId);

  const [updatedFeedback] = await db
    .update(DetectionFeedbackTable)
    .set({ isMainData })
    .where(eq(DetectionFeedbackTable.id, id))
    .returning();

  if (!updatedFeedback) {
    throw new Error("Error updating the detection feedback");
  }

  return updatedFeedback;
};
