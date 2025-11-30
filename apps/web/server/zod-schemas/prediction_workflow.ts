import { z } from "zod";
import { ClassificationFeedbackDTOSchema } from "./classification_feedback";
import { DetectionFeedbackDTOSchema } from "./detection_feedback";

export const PredictionWorkflowInputSchema = z.object({
  token: z.string().min(1),
  storagePath: z.string().min(1),
  bucketName: z.string().min(1),
  patientId: z.uuid(),
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string().min(1)).min(1),
});

// Enriched classification with DB info
export const EnrichedClassificationSchema = z.object({
  id: z.string().optional(),
  class_id: z.number(),
  confidence: z.number(),
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
  patient_name: z.string().optional(),
  patient_id: z.string().optional(),
  patient_birth_date: z.string().optional(),
  model_id: z.string().optional(),
  request_id: z.string().optional(),
  user_id: z.string().optional(),
  bucket_name: z.string().optional(),
  storage_path: z.string().optional(),
  createdAt: z.date().optional(),
  feedbacks: z.array(ClassificationFeedbackDTOSchema).optional(),
});

// Enriched detection with DB info
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
  patient_name: z.string().optional(),
  patient_id: z.string().optional(),
  patient_birth_date: z.string().optional(),
  model_id: z.string().optional(),
  request_id: z.string().optional(),
  user_id: z.string().optional(),
  bucket_name: z.string().optional(),
  storage_path: z.string().optional(),
  createdAt: z.date().optional(),
  feedbacks: z.array(DetectionFeedbackDTOSchema).optional(),
});

export const EnrichedPredictionDTOSchema = z.object({
  classifications: z.array(EnrichedClassificationSchema).default([]),
  detections: z.array(EnrichedDetectionSchema).default([]),
});

// Individual prediction response
export const PredictionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  error: z.string().optional(),
  result: z.object({
    classifications: z.array(EnrichedClassificationSchema).optional(),
    detections: z.array(EnrichedDetectionSchema).optional(),
    metadata: z.object({
      inference_time_ms: z.number(),
      model_version: z.string(),
    }),
  }),
  db_prediction_id: z.uuid(),
});

// Multiple predictions response
export const MultiplePredictionsResponseSchema = z.object({
  predictions: z.array(PredictionResponseSchema),
  models_used: z.array(z.string()),
});

// INPUT TYPES
export type PredictionWorkflowInput = z.infer<
  typeof PredictionWorkflowInputSchema
>;

// OUTPUT TYPES
export type EnrichedClassification = z.output<
  typeof EnrichedClassificationSchema
>;
export type EnrichedDetection = z.output<typeof EnrichedDetectionSchema>;
export type PredictionResponse = z.output<typeof PredictionResponseSchema>;
export type MultiplePredictionsResponse = z.output<
  typeof MultiplePredictionsResponseSchema
>;
export type EnrichedPredictionDTO = z.output<
  typeof EnrichedPredictionDTOSchema
>;export type EnrichedTask = EnrichedClassification | EnrichedDetection;