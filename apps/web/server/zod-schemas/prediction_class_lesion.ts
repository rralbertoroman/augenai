import { z } from "zod";

export const PredictionClassLesionDTOSchema = z.object({
  classId: z.number().int(),
  modelId: z.uuid(),
  lesionId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetByClassIdAndModelIdSchema = z.object({
  classId: z.number().int(),
  modelId: z.uuid(),
});

export const GetByLesionAndModelSchema = z.object({
  lesionId: z.uuid(),
  modelId: z.uuid(),
});

// INPUT TYPES
export type GetByClassIdAndModelIdInput = z.input<
  typeof GetByClassIdAndModelIdSchema
>;

export type GetByLesionAndModelInput = z.input<
  typeof GetByLesionAndModelSchema
>;

// OUTPUT TYPES
export type PredictionClassLesionDTO = z.output<
  typeof PredictionClassLesionDTOSchema
>;

export type PredictionClassLesionWithLesion = PredictionClassLesionDTO & {
  lesionName: string;
};
