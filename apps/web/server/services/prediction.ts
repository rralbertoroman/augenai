"use server";

import { db } from "../db/client";
import { PredictionsTable } from "../db/schemas";
import {
  CreatePredictionSchema,
  type CreatePredictionInput,
  type PredictionDTO,
} from "../zod-schemas/prediction";
import { type PredictionWithExtras } from "../zod-schemas/prediction_workflow";
import { getCurrentUser, verifyOwnership } from "../auth";
import { groupByPredictionId } from "./utils/utils";
import {
  getAllClassificationsWithExtrasByUserId,
  getAllClassificationsWithFeedbacksAndExtrasByUserId,
  getAllSystemClassificationsWithFeedbacksAndExtras,
  getClassificationsWithExtrasByRequestId,
} from "./classification";
import {
  getAllDetectionsWithExtrasByUserId,
  getAllDetectionsWithFeedbacksAndExtrasByUserId,
  getAllSystemDetectionsWithFeedbacksAndExtras,
  getDetectionsWithExtrasByRequestId,
} from "./detection";

// ============================================================================
// CREATION
// ============================================================================

export const createPrediction = async (
  data: CreatePredictionInput,
): Promise<PredictionDTO> => {
  const payload = CreatePredictionSchema.parse(data);
  const [prediction] = await db
    .insert(PredictionsTable)
    .values(payload)
    .returning();

  if (!prediction) {
    throw new Error("Error creating the prediction");
  }

  return prediction;
};

// ============================================================================
// QUERY FUNCTIONS - WITH EXTRAS
// ============================================================================

/**
 * Retrieves all predictions for a user with enriched data (disease/lesion names).
 * Reuses classification and detection services to get enriched data.
 * Usage (FE): Full prediction list with human-readable disease and lesion information.
 */
export const getAllPredictionsWithExtrasByUserId = async (
  token: string,
  userId: string,
): Promise<PredictionWithExtras[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  // Get enriched classifications and detections
  const allClassifications = await getAllClassificationsWithExtrasByUserId(
    token,
    userId,
  );
  const allDetections = await getAllDetectionsWithExtrasByUserId(token, userId);

  // Group by prediction_id using helper
  return groupByPredictionId(allClassifications, allDetections);
};

/**
 * Retrieves all predictions for a user with enriched data AND feedback.
 * Reuses classification and detection services to get enriched data with feedbacks.
 * @param token - Authentication token
 * @param userId - User ID to filter by
 * @param daysBack - Optional number of days to look back (default: all time)
 */
export const getAllPredictionsWithFeedbacksAndExtrasByUserId = async (
  token: string,
  userId: string,
  daysBack?: number,
): Promise<PredictionWithExtras[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  // Get enriched classifications and detections with feedbacks
  const allClassifications =
    await getAllClassificationsWithFeedbacksAndExtrasByUserId(token, userId, daysBack);
  const allDetections = await getAllDetectionsWithFeedbacksAndExtrasByUserId(
    token,
    userId,
    daysBack,
  );

  // Group by prediction_id using helper
  return groupByPredictionId(allClassifications, allDetections);
};

/**
 * Retrieves all predictions across the system with enriched data and feedback.
 * Reuses classification and detection services to get system-wide enriched data.
 * @param token - Authentication token
 * @param daysBack - Optional number of days to look back (default: all time)
 */
export const getAllSystemPredictionsWithFeedbacksAndExtras = async (
  token: string,
  daysBack?: number,
): Promise<PredictionWithExtras[]> => {
  await getCurrentUser(token); // Verify authentication only

  // Get enriched classifications and detections system-wide
  const allClassifications =
    await getAllSystemClassificationsWithFeedbacksAndExtras(token, daysBack);
  const allDetections =
    await getAllSystemDetectionsWithFeedbacksAndExtras(token, daysBack);

  // Group by prediction_id using helper
  return groupByPredictionId(allClassifications, allDetections);
};

/**
 * Retrieves predictions for a specific request with enriched data.
 * Reuses classification and detection services to get enriched data by request.
 */
export const getPredictionsWithExtrasByRequestId = async (
  token: string,
  requestId: string,
): Promise<PredictionWithExtras[]> => {
  await getCurrentUser(token); // Verify authentication only

  // Get enriched classifications and detections for this request
  const allClassifications = await getClassificationsWithExtrasByRequestId(
    token,
    requestId,
  );
  const allDetections = await getDetectionsWithExtrasByRequestId(
    token,
    requestId,
  );

  // Group by prediction_id using helper
  return groupByPredictionId(allClassifications, allDetections);
};
