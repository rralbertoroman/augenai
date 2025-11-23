import { z } from "zod";

export const CreatePredictionSchema = z.object({
  requestId: z.uuid(),
  modelId: z.uuid(),
  predictionResult: z.any(),
});

export const PredictionDTOSchema = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  modelId: z.uuid(),
  predictionResult: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EnrichedPredictionDTOSchema = z.object({
  class_id: z.number(),
  class_name: z.string(),
  confidence: z.number(),
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
  patient_id: z.string(),
});

// INPUT TYPES
export type CreatePredictionInput = z.input<typeof CreatePredictionSchema>;

// OUTPUT TYPES
export type PredictionDTO = z.output<typeof PredictionDTOSchema>;
export type EnrichedPredictionDTO = z.output<
  typeof EnrichedPredictionDTOSchema
>;
