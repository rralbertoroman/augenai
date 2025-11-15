import { z } from "zod";

export const CreatePredictionSchema = z.object({
  requestId: z.uuid(),
  modelId: z.uuid(),
  predictionResult: z.any(),
});

export const UpdatePredictionSchema = z.object({
  requestId: z.uuid().optional(),
  modelId: z.uuid().optional(),
  predictionResult: z.any().optional(),
});

export const DeletePredictionSchema = z.object({
  id: z.uuid(),
});

export const PredictionDTOSchema = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  modelId: z.uuid(),
  predictionResult: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPredictionsByRequestSchema = z.object({
  requestId: z.uuid(),
});

export const GetPredictionsByModelSchema = z.object({
  modelId: z.uuid(),
});

// INPUT TYPES
export type CreatePredictionInput = z.input<typeof CreatePredictionSchema>;
export type UpdatePredictionInput = z.input<typeof UpdatePredictionSchema>;
export type DeletePredictionInput = z.input<typeof DeletePredictionSchema>;
export type GetPredictionsByRequestInput = z.input<
  typeof GetPredictionsByRequestSchema
>;
export type GetPredictionsByModelInput = z.input<
  typeof GetPredictionsByModelSchema
>;

// OUTPUT TYPES
export type PredictionDTO = z.output<typeof PredictionDTOSchema>;
