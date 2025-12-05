"use server";

import { eq, and, getTableColumns, inArray } from "drizzle-orm";
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
  type ClassificationFeedbackWithExtras,
} from "../zod-schemas/classification_feedback";
import { getCurrentUser, verifyOwnership } from "../auth";
import {
  UserProfilesTable,
  PredictionClassesTable,
  DiseasesTable,
} from "../db/schemas";
import ClassificationsTable from "../db/schemas/classification";
import PredictionsTable from "../db/schemas/prediction";

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

export const getClassificationFeedbackWithExtras = async (
  token: string,
  data: GetFeedbackByClassificationInput,
): Promise<ClassificationFeedbackWithExtras[]> => {
  await getCurrentUser(token);
  const { classificationId } = GetFeedbackByClassificationSchema.parse(data);

  const results = await db
    .select({
      ...getTableColumns(ClassificationFeedbackTable),
      user_name: UserProfilesTable.name,
      stages: DiseasesTable.stages,
      stageIdx: PredictionClassesTable.stageIdx,
    })
    .from(ClassificationFeedbackTable)
    .innerJoin(
      UserProfilesTable,
      eq(ClassificationFeedbackTable.userProfileId, UserProfilesTable.id),
    )
    .innerJoin(
      ClassificationsTable,
      eq(ClassificationFeedbackTable.classificationId, ClassificationsTable.id),
    )
    .innerJoin(
      PredictionsTable,
      eq(ClassificationsTable.predictionId, PredictionsTable.id),
    )
    .innerJoin(
      PredictionClassesTable,
      and(
        eq(ClassificationFeedbackTable.classId, PredictionClassesTable.classId),
        eq(PredictionsTable.modelId, PredictionClassesTable.modelId),
      ),
    )
    .innerJoin(
      DiseasesTable,
      eq(PredictionClassesTable.diseaseId, DiseasesTable.id),
    )
    .where(eq(ClassificationFeedbackTable.classificationId, classificationId));

  return results.map((r) => ({
    ...r,
    stage_content: r.stages[r.stageIdx],
  }));
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

export const setMainFeedbackForClassification = async (
  token: string,
  feedbackId: string,
  classificationId: string,
): Promise<void> => {
  await getCurrentUser(token);

  // Set all feedbacks for this classification as non-main
  await db
    .update(ClassificationFeedbackTable)
    .set({ isMainData: false })
    .where(eq(ClassificationFeedbackTable.classificationId, classificationId));

  // Set the selected feedback as main
  await db
    .update(ClassificationFeedbackTable)
    .set({ isMainData: true })
    .where(eq(ClassificationFeedbackTable.id, feedbackId));
};

/**
 * Checks if the current user has already provided feedback for any classification in a prediction request.
 * Returns true if the user has already given feedback.
 */
export const hasUserProvidedClassificationFeedback = async (
  token: string,
  classificationIds: string[],
): Promise<boolean> => {
  if (!classificationIds || classificationIds.length === 0) {
    return false;
  }

  const user = await getCurrentUser(token);

  const existingFeedback = await db
    .select({ id: ClassificationFeedbackTable.id })
    .from(ClassificationFeedbackTable)
    .where(
      and(
        eq(ClassificationFeedbackTable.userProfileId, user.userId),
        inArray(
          ClassificationFeedbackTable.classificationId,
          classificationIds,
        ),
      ),
    )
    .limit(1);

  return existingFeedback.length > 0;
};
