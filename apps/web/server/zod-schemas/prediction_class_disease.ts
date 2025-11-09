import { z } from "zod";

export const CreatePredictionClassDiseaseSchema = z.object({
  classId: z.uuid(),
  modelId: z.uuid(),
  diseaseId: z.uuid(),
  stageIdx: z.number().int(),
});

export const UpdatePredictionClassDiseaseSchema = z.object({
  classId: z.uuid().optional(),
  modelId: z.uuid().optional(),
  diseaseId: z.uuid().optional(),
  stageIdx: z.number().int().optional(),
});

export const DeletePredictionClassDiseaseSchema = z.object({
  id: z.uuid(),
});

export const PredictionClassDiseaseDTOSchema = z.object({
  id: z.uuid(),
  classId: z.uuid(),
  modelId: z.uuid(),
  diseaseId: z.uuid(),
  stageIdx: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetByClassIdAndModelIdSchema = z.object({
  classId: z.uuid(),
  modelId: z.uuid(),
});

// INPUT TYPES
export type CreatePredictionClassDiseaseInput = z.input<
  typeof CreatePredictionClassDiseaseSchema
>;
export type UpdatePredictionClassDiseaseInput = z.input<
  typeof UpdatePredictionClassDiseaseSchema
>;
export type DeletePredictionClassDiseaseInput = z.input<
  typeof DeletePredictionClassDiseaseSchema
>;
export type GetByClassIdAndModelIdInput = z.input<
  typeof GetByClassIdAndModelIdSchema
>;

// OUTPUT TYPES
export type PredictionClassDiseaseDTO = z.output<
  typeof PredictionClassDiseaseDTOSchema
>;
