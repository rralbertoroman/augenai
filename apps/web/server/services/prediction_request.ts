"use server";

import { eq, and, getTableColumns } from "drizzle-orm";
import { db } from "../db/client";
import {
  PredictionRequestsTable,
  UserProfilesTable,
  PredictionClassesTable,
  PredictionClassLesionsTable,
  LesionsTable,
  ClassificationFeedbackTable,
  DetectionFeedbackTable,
} from "../db/schemas";
import {
  CreatePredictionRequestSchema,
  type CreatePredictionRequestInput,
  type PredictionRequestDTO,
} from "../zod-schemas/prediction_request";
import {
  type Prediction,
  type PredictionRequest,
  type Classification,
  type Detection,
  type PredictionRequestWithRelations,
  type PredictionWithExtras,
  type ClassificationWithExtras,
  type DetectionWithExtras,
} from "../zod-schemas/prediction_workflow";
import {
  type ClassificationFeedbackDTO,
  type ClassificationFeedbackWithExtras,
} from "../zod-schemas/classification_feedback";
import {
  type DetectionFeedbackDTO,
  type DetectionFeedbackWithExtras,
} from "../zod-schemas/detection_feedback";
import { getPredictionClassDiseaseByClassIdAndModelId } from "./prediction_class_disease";
import { getPredictionClassLesionByClassIdAndModelId } from "./prediction_class_lesion";
import { getCurrentUser, verifyOwnership } from "../auth";
import { DiseasesTable } from "../db/schemas";
import { inArray } from "drizzle-orm";
import ClassificationsTable from "../db/schemas/classification";
import DetectionsTable from "../db/schemas/detection";
import PredictionsTable from "../db/schemas/prediction";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Internal Helper: Enriches classification feedbacks with user_name and stage_content
 */
const enrichClassificationFeedbacks = async (
  feedbacks: ClassificationFeedbackDTO[],
  classificationId: string,
): Promise<ClassificationFeedbackWithExtras[]> => {
  if (!feedbacks || feedbacks.length === 0) {
    return [];
  }

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

/**
 * Internal Helper: Enriches detection feedbacks with user_name and lesion_name
 */
const enrichDetectionFeedbacks = async (
  feedbacks: DetectionFeedbackDTO[],
  detectionId: string,
): Promise<DetectionFeedbackWithExtras[]> => {
  if (!feedbacks || feedbacks.length === 0) {
    return [];
  }

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

/**
 * Internal Helper: Processes raw DB predictions into the enriched DTO format.
 * Maps disease/lesion IDs to names and structures the hierarchy (Request -> Predictions -> Classifications/Detections).
 */
const buildEnrichedPredictionRequest = async (
  request: PredictionRequestWithRelations,
  includeFeedbacks: boolean = false,
): Promise<PredictionRequest> => {
  const enrichedPredictions: Prediction[] = [];
  const predictionsWithExtras: PredictionWithExtras[] = [];

  // Fetch disease names if there are any diseases
  let diseaseNames: string[] = [];
  if (request.diseases && request.diseases.length > 0) {
    const diseases = await db
      .select()
      .from(DiseasesTable)
      .where(inArray(DiseasesTable.id, request.diseases));

    // Create a map to preserve order if needed, or just map the results
    // Mapping directly from results for now
    diseaseNames = diseases.map((d) => d.name);
  }

  for (const prediction of request.predictions) {
    const { modelId, id: predictionId, createdAt } = prediction;
    const classifications: Classification[] = [];
    const detections: Detection[] = [];
    const classificationsWithExtras: ClassificationWithExtras[] = [];
    const detectionsWithExtras: DetectionWithExtras[] = [];

    // Process Classifications
    if (
      prediction.classifications &&
      Array.isArray(prediction.classifications)
    ) {
      for (const classification of prediction.classifications) {
        const classInfo = await getPredictionClassDiseaseByClassIdAndModelId({
          classId: classification.classId,
          modelId,
        });

        if (!classInfo) {
          throw new Error(
            `Disease mapping not found for class_id ${classification.classId} and model ${modelId}`,
          );
        }

        // Enrich feedbacks if needed
        let enrichedFeedbacks:
          | ClassificationFeedbackWithExtras[]
          | ClassificationFeedbackDTO[]
          | undefined;
        if (includeFeedbacks && classification.feedbacks) {
          enrichedFeedbacks = await enrichClassificationFeedbacks(
            classification.feedbacks,
            classification.id,
          );
        }

        const baseClassification = {
          id: classification.id,
          class_id: classification.classId,
          confidence: classification.confidence,
          disease_id: classInfo.diseaseId,
          disease_name: classInfo.diseaseName,
          stage_idx: classInfo.stageIdx,
          stage_content: classInfo.diseaseStages[classInfo.stageIdx],
          feedbacks: enrichedFeedbacks,
        };

        classifications.push(baseClassification);

        // Add extras
        classificationsWithExtras.push({
          ...baseClassification,
          model_id: modelId,
          prediction_id: predictionId,
          request_id: request.id,
          patient_id: request.patientId,
          patient_name: request.patient.name,
          patient_birth_date: request.patient.dateOfBirth,
          created_at: createdAt,
          bucket_name: request.bucketName,
          storage_path: request.storagePath,
        });
      }
    }

    // Process Detections
    if (prediction.detections && Array.isArray(prediction.detections)) {
      for (const detection of prediction.detections) {
        const lesionInfo = await getPredictionClassLesionByClassIdAndModelId({
          classId: detection.classId,
          modelId,
        });

        if (!lesionInfo) {
          throw new Error(
            `Lesion mapping not found for class_id ${detection.classId} and model ${modelId}`,
          );
        }

        // Enrich feedbacks if needed
        let enrichedDetectionFeedbacks:
          | DetectionFeedbackWithExtras[]
          | DetectionFeedbackDTO[]
          | undefined;
        if (includeFeedbacks && detection.feedbacks) {
          enrichedDetectionFeedbacks = await enrichDetectionFeedbacks(
            detection.feedbacks,
            detection.id,
          );
        }

        const baseDetection = {
          id: detection.id,
          class_id: detection.classId,
          confidence: detection.confidence,
          lesion_name: lesionInfo.lesionName,
          bbox: {
            x_left: detection.xLeft,
            y_top: detection.yTop,
            width: detection.width,
            height: detection.height,
          },
          feedbacks: enrichedDetectionFeedbacks,
        };

        detections.push(baseDetection);

        // Add extras
        detectionsWithExtras.push({
          ...baseDetection,
          model_id: modelId,
          prediction_id: predictionId,
          request_id: request.id,
          patient_id: request.patientId,
          patient_name: request.patient.name,
          patient_birth_date: request.patient.dateOfBirth,
          created_at: createdAt,
          bucket_name: request.bucketName,
          storage_path: request.storagePath,
        });
      }
    }

    enrichedPredictions.push({
      prediction_id: predictionId,
      model_id: modelId,
      created_at: createdAt,
      classifications,
      detections,
    });

    predictionsWithExtras.push({
      prediction_id: predictionId,
      model_id: modelId,
      created_at: createdAt,
      bucket_name: request.bucketName,
      storage_path: request.storagePath,
      patient_id: request.patientId,
      classifications: classificationsWithExtras,
      detections: detectionsWithExtras,
    });
  }

  // Calculate total predictions
  const totalPredictions = predictionsWithExtras.reduce(
    (sum, pred) => sum + pred.classifications.length + pred.detections.length,
    0,
  );

  return {
    id: request.id,
    user_id: request.userId,
    patient_id: request.patientId,
    task: request.task,
    image_type: request.imageType,
    diseases: request.diseases,
    storage_path: request.storagePath,
    bucket_name: request.bucketName,
    models_used: request.modelsUsed,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    patient_name: request.patient.name,
    patient_birth_date: request.patient.dateOfBirth,
    image_bucket: request.bucketName,
    image_path: request.storagePath,
    predictions: enrichedPredictions,
    diseaseNames,
    predictionsWithExtras,
    totalPredictions,
  };
};

// ============================================================================
// CREATION
// ============================================================================

/**
 * Creates a new Prediction Request record in the database.
 * Usage (Internal): Used by the prediction workflow to initialize a request.
 */
export const createPredictionRequest = async (
  token: string,
  data: CreatePredictionRequestInput,
): Promise<PredictionRequestDTO> => {
  const user = await getCurrentUser(token);
  const payload = CreatePredictionRequestSchema.parse(data);

  const [predictionRequest] = await db
    .insert(PredictionRequestsTable)
    .values({
      ...payload,
      userId: user.userId,
    })
    .returning();

  if (!predictionRequest) {
    throw new Error("Error creating the prediction request");
  }

  return predictionRequest;
};

// ============================================================================
// USER QUERIES (REQUESTS)
// ============================================================================

/**
 * Retrieves all prediction requests for a user, including their predictions (classifications/detections).
 * Usage (FE): Used by the Dashboard (PredictionRequestList) to show the history of requests.
 */
export const getAllPredictionRequestsWithPredictionsByUserId = async (
  token: string,
  userId: string,
): Promise<PredictionRequest[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: eq(PredictionRequestsTable.userId, userId),
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

  const results = await Promise.all(
    predictionRequests.map((request) =>
      buildEnrichedPredictionRequest(request, false),
    ),
  );

  return results;
};

/**
 * Retrieves all prediction requests for a user, including feedback data.
 * Usage (FE): Potentially used for a detailed history view that highlights feedback status.
 */
export const getAllPredictionRequestsWithFeedbacksByUserId = async (
  token: string,
  userId: string,
): Promise<PredictionRequest[]> => {
  const user = await getCurrentUser(token);
  verifyOwnership(user, userId);

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    where: eq(PredictionRequestsTable.userId, userId),
    with: {
      predictions: {
        with: {
          classifications: {
            with: {
              feedbacks: true,
            },
          },
          detections: {
            with: {
              feedbacks: true,
            },
          },
        },
      },
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const results = await Promise.all(
    predictionRequests.map((request) =>
      buildEnrichedPredictionRequest(request, true),
    ),
  );

  return results;
};

// ============================================================================
// SYSTEM/ADMIN QUERIES
// ============================================================================

/**
 * Retrieves all prediction requests across the system (admin view).
 * Usage (FE): Likely for an admin panel to view all system activity.
 */
export const getAllSystemPredictionRequests = async (
  token: string,
): Promise<PredictionRequest[]> => {
  await getCurrentUser(token); // Verify authentication only

  const predictionRequests = await db.query.PredictionRequestsTable.findMany({
    with: {
      predictions: {
        with: {
          classifications: {
            with: {
              feedbacks: true,
            },
          },
          detections: {
            with: {
              feedbacks: true,
            },
          },
        },
      },
      patient: true,
    },
    orderBy: (predictionRequests, { desc }) => [
      desc(predictionRequests.createdAt),
    ],
  });

  const results = await Promise.all(
    predictionRequests.map((request) =>
      buildEnrichedPredictionRequest(request, true),
    ),
  );

  return results;
};

// ============================================================================
// SINGLE REQUEST QUERIES
// ============================================================================

/**
 * Retrieves a single prediction request by ID with full details.
 * Usage (FE): Used by the Prediction Detail Page (diagnosis/[id]).
 */
export const getPredictionRequestById = async (
  token: string,
  id: string,
  withFeedbacks: boolean = false,
): Promise<PredictionRequest | null> => {
  await getCurrentUser(token); // Verify authentication only

  const request = await db.query.PredictionRequestsTable.findFirst({
    where: eq(PredictionRequestsTable.id, id),
    with: {
      predictions: {
        with: {
          classifications: {
            with: withFeedbacks
              ? {
                  feedbacks: true,
                }
              : undefined,
          },
          detections: {
            with: withFeedbacks
              ? {
                  feedbacks: true,
                }
              : undefined,
          },
        },
      },
      patient: true,
    },
  });

  if (!request) {
    return null;
  }

  return await buildEnrichedPredictionRequest(request, withFeedbacks);
};
