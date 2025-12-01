import { z } from "zod";
import { ClassificationFeedbackDTOSchema } from "./classification_feedback";
import { DetectionFeedbackDTOSchema } from "./detection_feedback";

// ============================================================================
// INPUT SCHEMAS - Used for API requests
// ============================================================================

export const PredictionWorkflowInputSchema = z.object({
  token: z.string().min(1),
  storagePath: z.string().min(1),
  bucketName: z.string().min(1),
  patientId: z.uuid(),
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string().min(1)).min(1),
});

// ============================================================================
// DRIZZLE MAPPING SCHEMA - Used to type Drizzle query results
// ============================================================================

export const PredictionRequestWithRelationsSchema = z.object({
  // Request fields
  id: z.string(),
  userId: z.string(),
  patientId: z.string(),
  task: z.string(),
  imageType: z.string(),
  diseases: z.array(z.string()),
  storagePath: z.string(),
  bucketName: z.string(),
  modelsUsed: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Patient relation
  patient: z.object({
    id: z.string(),
    name: z.string(),
    dateOfBirth: z.string(),
  }),
  // Predictions relation with nested classifications and detections
  predictions: z.array(
    z.object({
      id: z.string(),
      modelId: z.string(),
      createdAt: z.date(),
      // Classifications with optional feedbacks
      classifications: z
        .array(
          z.object({
            id: z.string(),
            classId: z.number(),
            confidence: z.number(),
            feedbacks: z.array(ClassificationFeedbackDTOSchema).optional(),
          }),
        )
        .optional(),
      // Detections with optional feedbacks
      detections: z
        .array(
          z.object({
            id: z.string(),
            classId: z.number(),
            confidence: z.number(),
            xLeft: z.number(),
            yTop: z.number(),
            width: z.number(),
            height: z.number(),
            feedbacks: z.array(DetectionFeedbackDTOSchema).optional(),
          }),
        )
        .optional(),
    }),
  ),
});

// ============================================================================
// ENRICHED OUTPUT SCHEMAS - Used for API responses
// ============================================================================

// Base enriched classification with disease/stage information from DB
export const EnrichedClassificationSchema = z.object({
  id: z.string().optional(),
  class_id: z.number(),
  confidence: z.number(),
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
  feedbacks: z.array(ClassificationFeedbackDTOSchema).optional(),
});

// Enriched classification with extras for frontend consumption
// Includes context information (model_id, prediction_id, request_id, patient_id, created_at)
export const EnrichedClassificationWithExtrasSchema =
  EnrichedClassificationSchema.extend({
    model_id: z.string(),
    prediction_id: z.string(),
    request_id: z.string(),
    patient_id: z.string(),
    patient_name: z.string().optional(),
    patient_birth_date: z.string().optional(),
    created_at: z.date(),
  });

// Base enriched detection with lesion information from DB
export const EnrichedDetectionSchema = z.object({
  id: z.string().optional(),
  class_id: z.number(),
  confidence: z.number(),
  bbox: z.object({
    x_left: z.number(),
    y_top: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  lesion_name: z.string(),
  feedbacks: z.array(DetectionFeedbackDTOSchema).optional(),
});

// Enriched detection with extras for frontend consumption
// Includes context information (model_id, prediction_id, request_id, patient_id, created_at)
export const EnrichedDetectionWithExtrasSchema = EnrichedDetectionSchema.extend(
  {
    model_id: z.string(),
    prediction_id: z.string(),
    request_id: z.string(),
    patient_id: z.string(),
    patient_name: z.string().optional(),
    patient_birth_date: z.string().optional(),
    created_at: z.date(),
  },
);

// Enriched prediction containing classifications and detections
export const EnrichedPredictionDTOSchema = z.object({
  prediction_id: z.uuid(),
  model_id: z.uuid(),
  created_at: z.date(),
  classifications: z.array(EnrichedClassificationSchema).default([]),
  detections: z.array(EnrichedDetectionSchema).default([]),
});

// Enriched prediction request with all nested predictions
// This is the main response format for prediction request endpoints
export const EnrichedPredictionRequestDTOSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  patient_id: z.uuid(),
  task: z.string(),
  image_type: z.string(),
  diseases: z.array(z.string()),
  storage_path: z.string(),
  bucket_name: z.string(),
  models_used: z.array(z.string()),
  created_at: z.date(),
  updated_at: z.date(),
  patient_name: z.string().optional(),
  patient_birth_date: z.string().optional(),
  image_bucket: z.string().optional(),
  image_path: z.string().optional(),
  predictions: z.array(EnrichedPredictionDTOSchema),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// INPUT TYPES
export type PredictionWorkflowInput = z.infer<
  typeof PredictionWorkflowInputSchema
>;

// DRIZZLE MAPPING TYPES
export type PredictionRequestWithRelations = z.infer<
  typeof PredictionRequestWithRelationsSchema
>;

// OUTPUT TYPES - BASE
export type EnrichedClassification = z.output<
  typeof EnrichedClassificationSchema
>;
export type EnrichedDetection = z.output<typeof EnrichedDetectionSchema>;
export type EnrichedPredictionDTO = z.output<
  typeof EnrichedPredictionDTOSchema
>;
export type EnrichedPredictionRequestDTO = z.output<
  typeof EnrichedPredictionRequestDTOSchema
>;

// OUTPUT TYPES - WITH EXTRAS
export type EnrichedClassificationWithExtras = z.output<
  typeof EnrichedClassificationWithExtrasSchema
>;
export type EnrichedDetectionWithExtras = z.output<
  typeof EnrichedDetectionWithExtrasSchema
>;

// UNION TYPES
export type EnrichedTask = EnrichedClassification | EnrichedDetection;
export type EnrichedTaskWithExtras =
  | EnrichedClassificationWithExtras
  | EnrichedDetectionWithExtras;
