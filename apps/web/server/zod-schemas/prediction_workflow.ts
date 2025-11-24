import { z } from "zod";
import { PredictionStatus } from "@/types/prediction";

export const PredictionWorkflowInputSchema = z.object({
  token: z.string().min(1),
  storagePath: z.string().min(1),
  bucketName: z.string().min(1),
  patientId: z.uuid(),
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string().min(1)).min(1),
});

export const PredictionMetadataSchema = z.object({
  inference_time_ms: z.number(),
  model_version: z.string(),
});

export const EnrichedClassificationObjectSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
});

export const EnrichedClassificationResultSchema = z.object({
  predictions: z.array(EnrichedClassificationObjectSchema),
  metadata: PredictionMetadataSchema,
});

export const PredictionResponseSchema = z.object({
  status: z.enum(PredictionStatus),
  error: z.string().optional(),
  result: EnrichedClassificationResultSchema,
  db_prediction_id: z.uuid(),
});

export const MultiplePredictionsResponseSchema = z.object({
  predictions: z.array(PredictionResponseSchema),
  models_used: z.array(z.string()),
});

// INPUT TYPES
export type PredictionWorkflowInput = z.infer<
  typeof PredictionWorkflowInputSchema
>;

// OUTPUT TYPES
export type PredictionResponse = z.output<typeof PredictionResponseSchema>;
export type MultiplePredictionsResponse = z.output<
  typeof MultiplePredictionsResponseSchema
>;
