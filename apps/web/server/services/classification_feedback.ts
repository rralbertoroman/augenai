"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { ClassificationFeedbackTable } from "../db/schemas";
import {
  CreateClassificationFeedbackSchema,
  GetFeedbackByClassificationSchema,
  type CreateClassificationFeedbackInput,
  type GetFeedbackByClassificationInput,
  type ClassificationFeedbackDTO,
} from "../zod-schemas/classification_feedback";
import { getCurrentUser } from "../auth";

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
