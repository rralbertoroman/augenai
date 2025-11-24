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

// Base diagnosis from AI service
export const PredictionDiagnosisSchema = z.object({
  class_id: z.number(),
  confidence: z.number(),
});

// Enriched diagnosis with DB info
export const EnrichedPredictionDiagnosisSchema =
  PredictionDiagnosisSchema.extend({
    disease_id: z.string(),
    disease_name: z.string(),
    stage_idx: z.number(),
    stage_content: z.string(),
  });

// Individual prediction response - simplified with inlined metadata
export const PredictionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  error: z.string().optional(),
  result: z.object({
    predictions: z.array(EnrichedPredictionDiagnosisSchema),
    metadata: z.object({
      inference_time_ms: z.number(),
      model_version: z.string(),
    }),
  }),
  db_prediction_id: z.uuid(),
});

// Multiple predictions response - simplified nested structure
export const MultiplePredictionsResponseSchema = z.object({
  predictions: z.array(PredictionResponseSchema),
  models_used: z.array(z.string()),
});

// Raw AI service response - simplified with complete nested structure
export const AIServicePredictionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  error: z.string().optional(),
  result: z.object({
    predictions: z.array(PredictionDiagnosisSchema),
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
export type PredictionDiagnosis = z.output<typeof PredictionDiagnosisSchema>;
export type EnrichedPredictionDiagnosis = z.output<
  typeof EnrichedPredictionDiagnosisSchema
>;
export type PredictionResponse = z.output<typeof PredictionResponseSchema>;
export type MultiplePredictionsResponse = z.output<
  typeof MultiplePredictionsResponseSchema
>;
export type AIServicePredictionResponse = z.output<
  typeof AIServicePredictionResponseSchema
>;
