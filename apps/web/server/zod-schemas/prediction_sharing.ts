import { z } from "zod";

export const CreatePredictionSharingSchema = z.object({
  predictionRequestId: z.uuid(),
  hasFeedback: z.boolean().optional(),
});

export const PredictionSharingDTOSchema = z.object({
  predictionRequestId: z.uuid(),
  userId: z.uuid(),
  hasFeedback: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPredictionSharingsByPredictionRequestSchema = z.object({
  predictionRequestId: z.uuid(),
});

export const GetPredictionSharingsByUserSchema = z.object({
  userId: z.uuid(),
});

export const GetPredictionSharingByIdsSchema = z.object({
  predictionRequestId: z.uuid(),
  userId: z.uuid(),
});

export const UpdateHasFeedbackSchema = z.object({
  predictionRequestId: z.uuid(),
  userId: z.uuid(),
  hasFeedback: z.boolean(),
});

export const GetSharedPredictionRequestsByUserSchema = z.object({
  userId: z.uuid(),
});

// INPUT TYPES
export type CreatePredictionSharingInput = z.input<
  typeof CreatePredictionSharingSchema
>;
export type GetPredictionSharingsByPredictionRequestInput = z.input<
  typeof GetPredictionSharingsByPredictionRequestSchema
>;
export type GetPredictionSharingsByUserInput = z.input<
  typeof GetPredictionSharingsByUserSchema
>;
export type GetPredictionSharingByIdsInput = z.input<
  typeof GetPredictionSharingByIdsSchema
>;
export type UpdateHasFeedbackInput = z.input<typeof UpdateHasFeedbackSchema>;
export type GetSharedPredictionRequestsByUserInput = z.input<
  typeof GetSharedPredictionRequestsByUserSchema
>;

// OUTPUT TYPES
export type PredictionSharingDTO = z.output<typeof PredictionSharingDTOSchema>;
