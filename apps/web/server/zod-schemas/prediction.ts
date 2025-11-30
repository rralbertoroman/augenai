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

// INPUT TYPES
export type CreatePredictionInput = z.input<typeof CreatePredictionSchema>;

// OUTPUT TYPES
export type PredictionDTO = z.output<typeof PredictionDTOSchema>;
