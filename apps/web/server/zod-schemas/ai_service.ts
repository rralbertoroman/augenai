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

// Base segmentation from AI service
export const AIServiceSegmentationSchema = z.object({
  class_id: z.number(),
  class_name: z.string(),
  polygon: z.array(z.array(z.number())),
  area: z.number(),
  confidence: z.number(),
});

// Raw AI service response
export const AIServicePredictionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  error: z.string().optional(),
  result: z.object({
    predictions: z
      .array(
        z.union([
          AIServiceClassificationSchema,
          AIServiceDetectionSchema,
          AIServiceSegmentationSchema,
        ]),
      )
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
export type AIServiceSegmentation = z.output<
  typeof AIServiceSegmentationSchema
>;
export type AIServicePredictionResponse = z.output<
  typeof AIServicePredictionResponseSchema
>;
