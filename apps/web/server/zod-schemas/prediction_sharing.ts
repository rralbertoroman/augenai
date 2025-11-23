import { z } from "zod";

export const CreatePredictionSharingSchema = z.object({
  predictionId: z.uuid(),
  userId: z.uuid(),
  hasFeedback: z.boolean().optional(),
});

export const PredictionSharingDTOSchema = z.object({
  predictionId: z.uuid(),
  userId: z.uuid(),
  hasFeedback: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPredictionSharingsByPredictionSchema = z.object({
  predictionId: z.uuid(),
});

export const GetPredictionSharingsByUserSchema = z.object({
  userId: z.uuid(),
});

export const GetPredictionSharingByIdsSchema = z.object({
  predictionId: z.uuid(),
  userId: z.uuid(),
});

// INPUT TYPES
export type CreatePredictionSharingInput = z.input<
  typeof CreatePredictionSharingSchema
>;
export type GetPredictionSharingsByPredictionInput = z.input<
  typeof GetPredictionSharingsByPredictionSchema
>;
export type GetPredictionSharingsByUserInput = z.input<
  typeof GetPredictionSharingsByUserSchema
>;
export type GetPredictionSharingByIdsInput = z.input<
  typeof GetPredictionSharingByIdsSchema
>;

// OUTPUT TYPES
export type PredictionSharingDTO = z.output<typeof PredictionSharingDTOSchema>;
