import { z } from "zod";

export const CreatePredictionRequestSchema = z.object({
  userId: z.uuid(),
  patientId: z.uuid(),
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string()).min(1),
  storagePath: z.string().min(1),
  bucketName: z.string().min(1),
  modelsUsed: z.array(z.uuid()).min(1),
});

export const UpdatePredictionRequestSchema = z.object({
  userId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  task: z.string().min(1).optional(),
  imageType: z.string().min(1).optional(),
  diseases: z.array(z.string()).min(1).optional(),
  storagePath: z.string().min(1).optional(),
  bucketName: z.string().min(1).optional(),
  modelsUsed: z.array(z.uuid()).min(1).optional(),
});

export const DeletePredictionRequestSchema = z.object({
  id: z.uuid(),
});

export const PredictionRequestDTOSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  patientId: z.uuid(),
  task: z.string(),
  imageType: z.string(),
  diseases: z.array(z.string()),
  storagePath: z.string(),
  bucketName: z.string(),
  modelsUsed: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPredictionRequestsByPatientSchema = z.object({
  patientId: z.uuid(),
});

export const GetPredictionRequestsByUserSchema = z.object({
  userId: z.uuid(),
});

// INPUT TYPES
export type CreatePredictionRequestInput = z.input<
  typeof CreatePredictionRequestSchema
>;
export type UpdatePredictionRequestInput = z.input<
  typeof UpdatePredictionRequestSchema
>;
export type DeletePredictionRequestInput = z.input<
  typeof DeletePredictionRequestSchema
>;
export type GetPredictionRequestsByPatientInput = z.input<
  typeof GetPredictionRequestsByPatientSchema
>;
export type GetPredictionRequestsByUserInput = z.input<
  typeof GetPredictionRequestsByUserSchema
>;

// OUTPUT TYPES
export type PredictionRequestDTO = z.output<typeof PredictionRequestDTOSchema>;
