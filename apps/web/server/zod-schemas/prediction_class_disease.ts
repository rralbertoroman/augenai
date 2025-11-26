import { z } from "zod";

export const PredictionClassDiseaseDTOSchema = z.object({
  classId: z.number().int(),
  modelId: z.uuid(),
  diseaseId: z.uuid(),
  stageIdx: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetByClassIdAndModelIdSchema = z.object({
  classId: z.number().int(),
  modelId: z.uuid(),
});

export const GetByStageDiseaseAndModelSchema = z.object({
  stageIdx: z.number().int(),
  diseaseId: z.uuid(),
  modelId: z.uuid(),
});

// INPUT TYPES
export type GetByClassIdAndModelIdInput = z.input<
  typeof GetByClassIdAndModelIdSchema
>;

export type GetByStageDiseaseAndModelInput = z.input<
  typeof GetByStageDiseaseAndModelSchema
>;

// OUTPUT TYPES
export type PredictionClassDiseaseDTO = z.output<
  typeof PredictionClassDiseaseDTOSchema
>;

export type PredictionClassDiseaseWithDisease = PredictionClassDiseaseDTO & {
  diseaseName: string;
  diseaseStages: string[];
};
