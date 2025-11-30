import { z } from "zod";

// Base classification from AI service
export const AIServiceClassificationSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
});

// Base detection from AI service
export const AIServiceDetectionSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
  box: z.array(z.number()).length(4),
});

// Raw AI service response
export const AIServicePredictionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  error: z.string().optional(),
  result: z.object({
    predictions: z
      .array(z.union([AIServiceClassificationSchema, AIServiceDetectionSchema]))
      .optional(),
    metadata: z.object({
      inference_time_ms: z.number(),
      model_version: z.string(),
    }),
  }),
});

// OUTPUT TYPES
export type AIServiceClassification = z.output<
  typeof AIServiceClassificationSchema
>;
export type AIServiceDetection = z.output<typeof AIServiceDetectionSchema>;
export type AIServicePredictionResponse = z.output<
  typeof AIServicePredictionResponseSchema
>;
