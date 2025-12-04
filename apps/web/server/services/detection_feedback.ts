"use server";

import { eq, and, getTableColumns, inArray } from "drizzle-orm";
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
  type DetectionFeedbackWithExtras,
} from "../zod-schemas/detection_feedback";
import { getCurrentUser, verifyOwnership } from "../auth";
import {
  UserProfilesTable,
  PredictionClassLesionsTable,
  LesionsTable,
} from "../db/schemas";
import DetectionsTable from "../db/schemas/detection";
import PredictionsTable from "../db/schemas/prediction";

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

export const getDetectionFeedbackWithExtras = async (
  token: string,
  data: GetFeedbackByDetectionInput,
): Promise<DetectionFeedbackWithExtras[]> => {
  await getCurrentUser(token);
  const { detectionId } = GetFeedbackByDetectionSchema.parse(data);

  const results = await db
    .select({
      ...getTableColumns(DetectionFeedbackTable),
      user_name: UserProfilesTable.name,
      lesion_name: LesionsTable.name,
    })
    .from(DetectionFeedbackTable)
    .innerJoin(
      UserProfilesTable,
      eq(DetectionFeedbackTable.userProfileId, UserProfilesTable.id),
    )
    .innerJoin(
      DetectionsTable,
      eq(DetectionFeedbackTable.detectionId, DetectionsTable.id),
    )
    .innerJoin(
      PredictionsTable,
      eq(DetectionsTable.predictionId, PredictionsTable.id),
    )
    .innerJoin(
      PredictionClassLesionsTable,
      and(
        eq(DetectionFeedbackTable.classId, PredictionClassLesionsTable.classId),
        eq(PredictionsTable.modelId, PredictionClassLesionsTable.modelId),
      ),
    )
    .innerJoin(
      LesionsTable,
      eq(PredictionClassLesionsTable.lesionId, LesionsTable.id),
    )
    .where(eq(DetectionFeedbackTable.detectionId, detectionId));

  return results;
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

/**
 * Checks if the current user has already provided feedback for any detection in a prediction request.
 * Returns true if the user has already given feedback.
 */
export const hasUserProvidedDetectionFeedback = async (
  token: string,
  detectionIds: string[],
): Promise<boolean> => {
  if (!detectionIds || detectionIds.length === 0) {
    return false;
  }

  const user = await getCurrentUser(token);

  const existingFeedback = await db
    .select({ id: DetectionFeedbackTable.id })
    .from(DetectionFeedbackTable)
    .where(
      and(
        eq(DetectionFeedbackTable.userProfileId, user.userId),
        inArray(DetectionFeedbackTable.detectionId, detectionIds),
      ),
    )
    .limit(1);

  return existingFeedback.length > 0;
};
