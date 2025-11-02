import { z } from "zod";

export const CreatePredictionSchema = z.object({
  consultationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  modelId: z.uuid(),
  patientId: z.uuid(),
  predictedDiagnosisId: z.uuid(),
});

export const UpdatePredictionSchema = z.object({
  consultationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  modelId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  predictedDiagnosisId: z.uuid().optional(),
});

export const DeletePredictionSchema = z.object({
  id: z.uuid(),
});

export const PredictionDTOSchema = z.object({
  id: z.uuid(),
  consultationDate: z.string(),
  modelId: z.uuid(),
  patientId: z.uuid(),
  predictedDiagnosisId: z.uuid(),
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
