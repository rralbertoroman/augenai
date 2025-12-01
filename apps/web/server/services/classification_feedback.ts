"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { ClassificationFeedbackTable } from "../db/schemas";
import {
  CreateClassificationFeedbackSchema,
  GetFeedbackByClassificationSchema,
  UpdateIsMainUserSchema,
  type CreateClassificationFeedbackInput,
  type GetFeedbackByClassificationInput,
  type UpdateIsMainUserInput,
  type ClassificationFeedbackDTO,
} from "../zod-schemas/classification_feedback";
import { getCurrentUser, verifyOwnership } from "../auth";

export const createClassificationFeedback = async (
  token: string,
  data: CreateClassificationFeedbackInput,
): Promise<ClassificationFeedbackDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreateClassificationFeedbackSchema.parse(data);

  const [feedback] = await db
    .insert(ClassificationFeedbackTable)
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

export const getFeedbackByClassification = async (
  token: string,
  data: GetFeedbackByClassificationInput,
): Promise<ClassificationFeedbackDTO[]> => {
  await getCurrentUser(token);
  const { classificationId } = GetFeedbackByClassificationSchema.parse(data);
  const feedback = await db
    .select()
    .from(ClassificationFeedbackTable)
    .where(eq(ClassificationFeedbackTable.classificationId, classificationId));
  return feedback;
};

export const getFeedbackById = async (
  id: string,
): Promise<ClassificationFeedbackDTO> => {
  const [feedback] = await db
    .select()
    .from(ClassificationFeedbackTable)
    .where(eq(ClassificationFeedbackTable.id, id));

  if (!feedback) {
    throw new Error("Classification feedback not found");
  }

  return feedback;
};

export const updateIsMainData = async (
  token: string,
  data: UpdateIsMainUserInput,
): Promise<ClassificationFeedbackDTO> => {
  const user = await getCurrentUser(token);
  const { id, isMainData } = UpdateIsMainUserSchema.parse(data);

  const existingFeedback = await getFeedbackById(id);

  verifyOwnership(user, existingFeedback.userProfileId);

  const [updatedFeedback] = await db
    .update(ClassificationFeedbackTable)
    .set({ isMainData })
    .where(eq(ClassificationFeedbackTable.id, id))
    .returning();

  if (!updatedFeedback) {
    throw new Error("Error updating the classification feedback");
  }

  return updatedFeedback;
};
