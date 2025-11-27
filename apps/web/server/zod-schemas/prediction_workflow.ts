import { z } from "zod";

export const PredictionWorkflowInputSchema = z.object({
  token: z.string().min(1),
  storagePath: z.string().min(1),
  bucketName: z.string().min(1),
  patientId: z.uuid(),
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string().min(1)).min(1),
});

// Base classification from AI service
export const ClassificationSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
});

// Base detection from AI service
export const DetectionSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
  box: z.array(z.number()).length(4),
});

export const BBoxSchema = z.object({
  x_left: z.number(),
  y_top: z.number(),
  width: z.number(),
  height: z.number(),
});

// Intermediate detection structure after processing AI service response
export const ProcessedDetectionSchema = ClassificationSchema.extend(
  BBoxSchema.shape,
);

// Enriched classification with DB info
export const EnrichedClassificationSchema = ClassificationSchema.extend({
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
});

// Enriched detection with DB info
export const EnrichedDetectionSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
  bbox: BBoxSchema,
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
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

// Raw AI service response
export const AIServicePredictionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  error: z.string().optional(),
  result: z.object({
    predictions: z
      .array(z.union([ClassificationSchema, DetectionSchema]))
      .optional(),
    metadata: z.object({
      inference_time_ms: z.number(),
      model_version: z.string(),
    }),
  }),
});

// INPUT TYPES
export type PredictionWorkflowInput = z.infer<
  typeof PredictionWorkflowInputSchema
>;

// OUTPUT TYPES
export type Classification = z.output<typeof ClassificationSchema>;
export type Detection = z.output<typeof DetectionSchema>;
export type EnrichedClassification = z.output<
  typeof EnrichedClassificationSchema
>;
export type EnrichedDetection = z.output<typeof EnrichedDetectionSchema>;
export type PredictionResponse = z.output<typeof PredictionResponseSchema>;
export type MultiplePredictionsResponse = z.output<
  typeof MultiplePredictionsResponseSchema
>;
export type AIServicePredictionResponse = z.output<
  typeof AIServicePredictionResponseSchema
>;
export type ProcessedDetection = z.output<typeof ProcessedDetectionSchema>;
