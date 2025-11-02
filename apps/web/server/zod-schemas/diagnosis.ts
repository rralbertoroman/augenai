import { z } from "zod";

export const CreateDiagnosisSchema = z.object({
  diseaseId: z.uuid(),
  currentStage: z.string().min(1),
});

export const UpdateDiagnosisSchema = z.object({
  diseaseId: z.uuid().optional(),
  currentStage: z.string().min(1).optional(),
});

export const DeleteDiagnosisSchema = z.object({
  id: z.uuid(),
});

export const DiagnosisDTOSchema = z.object({
  id: z.uuid(),
  diseaseId: z.uuid(),
  currentStage: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreateDiagnosisInput = z.input<typeof CreateDiagnosisSchema>;
export type UpdateDiagnosisInput = z.input<typeof UpdateDiagnosisSchema>;
export type DeleteDiagnosisInput = z.input<typeof DeleteDiagnosisSchema>;

// OUTPUT TYPES
export type DiagnosisDTO = z.output<typeof DiagnosisDTOSchema>;
