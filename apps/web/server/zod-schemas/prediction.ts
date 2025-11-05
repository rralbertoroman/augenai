import { z } from "zod";

export const CreatePredictionSchema = z.object({
  classId: z.uuid(),
  modelId: z.uuid(),
  patientId: z.uuid(),
  predictionResult: z.any(),
  predictionMetadata: z.any(),
  userId: z.uuid(),
});

export const UpdatePredictionSchema = z.object({
  classId: z.uuid().optional(),
  modelId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  predictionResult: z.any().optional(),
  predictionMetadata: z.any().optional(),
  userId: z.uuid().optional(),
});

export const DeletePredictionSchema = z.object({
  id: z.uuid(),
});

export const PredictionDTOSchema = z.object({
  id: z.uuid(),
  classId: z.uuid(),
  modelId: z.uuid(),
  patientId: z.uuid(),
  predictionResult: z.any(),
  predictionMetadata: z.any(),
  userId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPredictionsByPatientSchema = z.object({
  patientId: z.uuid(),
});

export const GetPredictionsByModelSchema = z.object({
  modelId: z.uuid(),
});

// INPUT TYPES
export type CreatePredictionInput = z.input<typeof CreatePredictionSchema>;
export type UpdatePredictionInput = z.input<typeof UpdatePredictionSchema>;
export type DeletePredictionInput = z.input<typeof DeletePredictionSchema>;
export type GetPredictionsByPatientInput = z.input<
  typeof GetPredictionsByPatientSchema
>;
export type GetPredictionsByModelInput = z.input<
  typeof GetPredictionsByModelSchema
>;

// OUTPUT TYPES
export type PredictionDTO = z.output<typeof PredictionDTOSchema>;
