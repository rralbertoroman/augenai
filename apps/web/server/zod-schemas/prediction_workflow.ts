import { z } from "zod";
import { 
  ClassificationFeedbackDTOSchema,
  ClassificationFeedbackWithExtrasSchema 
} from "./classification_feedback";
import { 
  DetectionFeedbackDTOSchema,
  DetectionFeedbackWithExtrasSchema 
} from "./detection_feedback";

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
export const ClassificationSchema = z.object({
  id: z.string().optional(),
  class_id: z.number(),
  confidence: z.number(),
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
  feedbacks: z.union([
    z.array(ClassificationFeedbackDTOSchema),
    z.array(ClassificationFeedbackWithExtrasSchema)
  ]).optional(),
});

// Enriched classification with extras for frontend consumption
// Includes context information (model_id, prediction_id, request_id, patient_id, created_at)
export const ClassificationWithExtrasSchema = ClassificationSchema.extend({
  model_id: z.string(),
  prediction_id: z.string(),
  request_id: z.string(),
  patient_id: z.string(),
  patient_name: z.string().optional(),
  patient_birth_date: z.string().optional(),
  created_at: z.date(),
  bucket_name: z.string().optional(),
  storage_path: z.string().optional(),
});

// Base enriched detection with lesion information from DB
export const DetectionSchema = z.object({
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
  feedbacks: z.union([
    z.array(DetectionFeedbackDTOSchema),
    z.array(DetectionFeedbackWithExtrasSchema)
  ]).optional(),
});

// Enriched detection with extras for frontend consumption
// Includes context information (model_id, prediction_id, request_id, patient_id, created_at)
export const DetectionWithExtrasSchema = DetectionSchema.extend({
  model_id: z.string(),
  prediction_id: z.string(),
  request_id: z.string(),
  patient_id: z.string(),
  patient_name: z.string().optional(),
  patient_birth_date: z.string().optional(),
  created_at: z.date(),
  bucket_name: z.string().optional(),
  storage_path: z.string().optional(),
});

// Enriched prediction containing classifications and detections
export const PredictionSchema = z.object({
  prediction_id: z.uuid(),
  model_id: z.uuid(),
  created_at: z.date(),
  classifications: z.array(ClassificationSchema).default([]),
  detections: z.array(DetectionSchema).default([]),
});

// Enriched prediction with extras - contains enriched classifications and detections
// Used when grouping predictions with full context information
export const PredictionWithExtrasSchema = z.object({
  id: z.uuid().optional(),
  prediction_id: z.uuid(),
  model_id: z.uuid(),
  created_at: z.date(),
  bucket_name: z.string().optional(),
  storage_path: z.string().optional(),
  patient_id: z.string().optional(),
  classifications: z.array(ClassificationWithExtrasSchema).default([]),
  detections: z.array(DetectionWithExtrasSchema).default([]),
});

// Enriched prediction request with all nested predictions
// This is the main response format for prediction request endpoints
export const PredictionRequestSchema = z.object({
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
  predictions: z.array(PredictionSchema),
  diseaseNames: z.array(z.string()).optional(),
  predictionsWithExtras: z.array(PredictionWithExtrasSchema).optional(),
  totalPredictions: z.number().optional(),
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
export type Classification = z.output<typeof ClassificationSchema>;
export type Detection = z.output<typeof DetectionSchema>;
export type Prediction = z.output<typeof PredictionSchema>;
export type PredictionRequest = z.output<typeof PredictionRequestSchema>;

// OUTPUT TYPES - WITH EXTRAS
export type ClassificationWithExtras = z.output<
  typeof ClassificationWithExtrasSchema
>;
export type DetectionWithExtras = z.output<typeof DetectionWithExtrasSchema>;
export type PredictionWithExtras = z.output<typeof PredictionWithExtrasSchema>;

// UNION TYPES
export type Task = Classification | Detection;
export type TaskWithExtras = ClassificationWithExtras | DetectionWithExtras;
