import { z } from "zod";

export const CreatePredictionSchema = z.object({
  requestId: z.uuid(),
  modelId: z.uuid(),
});

export const PredictionDTOSchema = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  modelId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EnrichedPredictionDTOSchema = z.object({
  id: z.string(),
  class_id: z.number(),
  confidence: z.number(),
  disease_id: z.string(),
  disease_name: z.string(),
  stage_idx: z.number(),
  stage_content: z.string(),
  patient_id: z.string(),
  request_id: z.string(),
  createdAt: z.date(),
  type: z.enum(["classification", "detection"]).optional(),
  bbox: z
    .object({
      x_left: z.number(),
      y_top: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

// INPUT TYPES
export type CreatePredictionInput = z.input<typeof CreatePredictionSchema>;

// OUTPUT TYPES
export type PredictionDTO = z.output<typeof PredictionDTOSchema>;
export type EnrichedPredictionDTO = z.output<
  typeof EnrichedPredictionDTOSchema
>;
