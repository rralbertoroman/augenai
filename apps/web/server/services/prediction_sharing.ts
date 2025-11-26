"use server";

import { eq, and, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionSharingTable, PredictionRequestsTable } from "../db/schemas";
import {
  CreatePredictionSharingSchema,
  GetPredictionSharingsByPredictionRequestSchema,
  GetPredictionSharingsByUserSchema,
  UpdateHasFeedbackSchema,
  GetSharedPredictionRequestsByUserSchema,
  type CreatePredictionSharingInput,
  type GetPredictionSharingsByPredictionRequestInput,
  type GetPredictionSharingsByUserInput,
  type UpdateHasFeedbackInput,
  type GetSharedPredictionRequestsByUserInput,
  type PredictionSharingDTO,
} from "../zod-schemas/prediction_sharing";
import { getCurrentUser, verifyOwnership } from "../auth";
import { sendPredictionSharedEmail } from "../resend/services";
import { getUserProfileById } from "./user_profile";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { type EnrichedPredictionDTO } from "../zod-schemas/prediction";

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

export const getPredictionSharingsByPredictionRequest = async (
  token: string,
  data: GetPredictionSharingsByPredictionRequestInput,
): Promise<PredictionSharingDTO[]> => {
  await getCurrentUser(token);
  const { predictionRequestId } =
    GetPredictionSharingsByPredictionRequestSchema.parse(data);
  const sharings = await db
    .select()
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.predictionRequestId, predictionRequestId));
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

export const getPredictionSharingByUserAndPredictionRequest = async (
  userId: string,
  predictionRequestId: string,
): Promise<PredictionSharingDTO | null> => {
  const [sharing] = await db
    .select()
    .from(PredictionSharingTable)
    .where(
      and(
        eq(PredictionSharingTable.userId, userId),
        eq(PredictionSharingTable.predictionRequestId, predictionRequestId),
      ),
    );

  return sharing || null;
};

export const sharePrediction = async (
  token: string,
  predictionRequestId: string,
  recipientId: string,
): Promise<{ success: boolean; error?: string }> => {
  // Get current user
  const currentUser = await getCurrentUser(token);

  // Check if already shared
  const existingSharing = await getPredictionSharingByUserAndPredictionRequest(
    recipientId,
    predictionRequestId,
  );

  if (existingSharing) {
    return {
      success: false,
      error: "Prediction already shared with this user",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const predictionUrl = `${appUrl}/predictions/${predictionRequestId}`;

  const result = await sendPredictionSharedEmail(
    currentUser.userId,
    recipientId,
    predictionUrl,
  );

  if (result.success) {
    // Create sharing record
    await db.insert(PredictionSharingTable).values({
      predictionRequestId,
      userId: recipientId,
      hasFeedback: false,
    });
  }

  return result;
};

export const sendPredictionToSupervisor = async (
  token: string,
  predictionRequestId: string,
): Promise<void> => {
  const user = await getCurrentUser(token);
  const profile = await getUserProfileById(user.userId);

  if (profile?.supervisorId) {
    await sharePrediction(token, predictionRequestId, profile.supervisorId);
  }
};

export const updateHasFeedback = async (
  token: string,
  data: UpdateHasFeedbackInput,
): Promise<PredictionSharingDTO> => {
  const user = await getCurrentUser(token);
  const { predictionRequestId, userId, hasFeedback } = UpdateHasFeedbackSchema.parse(data);

  // Verify ownership - only the user who received the sharing can update it
  verifyOwnership(user, userId);

  const [updatedSharing] = await db
    .update(PredictionSharingTable)
    .set({ hasFeedback })
    .where(
      and(
        eq(PredictionSharingTable.predictionRequestId, predictionRequestId),
        eq(PredictionSharingTable.userId, userId),
      ),
    )
    .returning();

  if (!updatedSharing) {
    throw new Error("Prediction sharing not found or you don't have permission to update it");
  }

  return updatedSharing;
};

export const getSharedPredictionRequestsWithPredictionsByUserId = async (
  token: string,
  data: GetSharedPredictionRequestsByUserInput,
): Promise<EnrichedPredictionDTO[]> => {
  const user = await getCurrentUser(token);
  const { userId } = GetSharedPredictionRequestsByUserSchema.parse(data);
  
  // Verify ownership - only the user can see their shared predictions
  verifyOwnership(user, userId);

  // First, get all prediction request IDs that were shared with this user
  const sharedSharings = await db
    .select({
      predictionRequestId: PredictionSharingTable.predictionRequestId,
    })
    .from(PredictionSharingTable)
    .where(eq(PredictionSharingTable.userId, userId));

  const sharedRequestIds = sharedSharings.map(sharing => sharing.predictionRequestId);

  if (sharedRequestIds.length === 0) {
    return [];
  }

  // Now get all prediction requests that were shared with this user
  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: inArray(PredictionRequestsTable.id, sharedRequestIds),
    with: {
      predictions: {
        with: {
          classifications: true,
          detections: true,
        },
      },
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const enrichedPredictions: EnrichedPredictionDTO[] = [];

  for (const request of predictionRequests) {
    for (const prediction of request.predictions) {
      // Process Classifications
      if (
        prediction.classifications &&
        Array.isArray(prediction.classifications)
      ) {
        for (const classification of prediction.classifications) {
          const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
            classId: classification.classId,
            modelId: prediction.modelId,
          });

          if (!classInfo) {
            throw new Error(
              `Disease mapping not found for class_id ${classification.classId} and model ${prediction.modelId}`,
            );
          }

          enrichedPredictions.push({
            id: classification.id,
            class_id: classification.classId,
            model_id: prediction.modelId,
            confidence: classification.confidence,
            disease_id: classInfo.diseaseId,
            disease_name: classInfo.diseaseName,
            stage_idx: classInfo.stageIdx,
            stage_content: classInfo.diseaseStages[classInfo.stageIdx],
            patient_id: request.patientId,
            request_id: request.id,
            createdAt: classification.createdAt,
            type: "classification",
            bucket_name: request.bucketName,
            storage_path: request.storagePath,
          });
        }
      }

      // Process Detections
      if (prediction.detections && Array.isArray(prediction.detections)) {
        for (const detection of prediction.detections) {
          const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
            classId: detection.classId,
            modelId: prediction.modelId,
          });

          if (!classInfo) {
            throw new Error(
              `Disease mapping not found for class_id ${detection.classId} and model ${prediction.modelId}`,
            );
          }

          enrichedPredictions.push({
            id: detection.id,
            class_id: detection.classId,
            model_id: prediction.modelId,
            confidence: detection.confidence,
            disease_id: classInfo.diseaseId,
            disease_name: classInfo.diseaseName,
            stage_idx: classInfo.stageIdx,
            stage_content: classInfo.diseaseStages[classInfo.stageIdx],
            patient_id: request.patientId,
            request_id: request.id,
            createdAt: detection.createdAt,
            type: "detection",
            bbox: {
              x_left: detection.xLeft,
              y_top: detection.yTop,
              width: detection.width,
              height: detection.height,
            },
            bucket_name: request.bucketName,
            storage_path: request.storagePath,
          });
        }
      }
    }
  }

  return enrichedPredictions;
};
