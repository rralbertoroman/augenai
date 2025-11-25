"use server";

import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionSharingTable } from "../db/schemas";
import {
  CreatePredictionSharingSchema,
  GetPredictionSharingsByPredictionSchema,
  GetPredictionSharingsByUserSchema,
  type CreatePredictionSharingInput,
  type GetPredictionSharingsByPredictionInput,
  type GetPredictionSharingsByUserInput,
  type PredictionSharingDTO,
} from "../zod-schemas/prediction_sharing";
import { getCurrentUser, verifyOwnership } from "../auth";
import { sendPredictionSharedEmail } from "../resend/services";
import { getUserProfileById } from "./user_profile";

export const createPredictionSharing = async (
  token: string,
  data: CreatePredictionSharingInput,
): Promise<PredictionSharingDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreatePredictionSharingSchema.parse(data);
  const [sharing] = await db
    .insert(PredictionSharingTable)
    .values({
      ...payload,
      userId: user.userId,
    })
    .returning();

  if (!sharing) {
    throw new Error("Error creating the prediction sharing");
  }

  return sharing;
};

export const getPredictionSharingsByPrediction = async (
  token: string,
  data: GetPredictionSharingsByPredictionInput,
): Promise<PredictionSharingDTO[]> => {
  await getCurrentUser(token);
  const { predictionId } = GetPredictionSharingsByPredictionSchema.parse(data);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.predictionId, predictionId));
  return sharings;
};

export const getPredictionSharingsByUser = async (
  token: string,
  data: GetPredictionSharingsByUserInput,
): Promise<PredictionSharingDTO[]> => {
  const user = await getCurrentUser(token);
  const { userId } = GetPredictionSharingsByUserSchema.parse(data);
  verifyOwnership(user, userId);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.userId, userId));
  return sharings;
};

export const getPredictionSharingByUserAndPrediction = async (
  userId: string,
  predictionId: string,
): Promise<PredictionSharingDTO | null> => {
  const [sharing] = await db
    .select()
    .from(PredictionSharingTable)
    .where(
      and(
        eq(PredictionSharingTable.userId, userId),
        eq(PredictionSharingTable.predictionId, predictionId),
      ),
    );

  return sharing || null;
};

export const sharePrediction = async (
  token: string,
  predictionId: string,
  recipientId: string,
): Promise<{ success: boolean; error?: string }> => {
  // Get current user
  const currentUser = await getCurrentUser(token);

  // Check if already shared
  const existingSharing = await getPredictionSharingByUserAndPrediction(
    recipientId,
    predictionId,
  );

  if (existingSharing) {
    return {
      success: false,
      error: "Prediction already shared with this user",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const predictionUrl = `${appUrl}/predictions/${predictionId}`;

  const result = await sendPredictionSharedEmail(
    currentUser.userId,
    recipientId,
    predictionUrl,
  );

  if (result.success) {
    // Create sharing record
    await db.insert(PredictionSharingTable).values({
      predictionId,
      userId: recipientId,
      hasFeedback: false,
    });
  }

  return result;
};

export const sendPredictionToSupervisor = async (
  token: string,
  predictionId: string,
): Promise<void> => {
  const user = await getCurrentUser(token);
  const profile = await getUserProfileById(user.userId);

  if (profile?.supervisorId) {
    await sharePrediction(token, predictionId, profile.supervisorId);
  }
};
