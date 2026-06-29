import { z } from "zod";

export const PredictionClassBiomarkerDTOSchema = z.object({
  classId: z.number().int(),
  modelId: z.uuid(),
  biomarkerId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetByClassIdAndModelIdSchema = z.object({
  classId: z.number().int(),
  modelId: z.uuid(),
});

export const GetByBiomarkerAndModelSchema = z.object({
  biomarkerId: z.uuid(),
  modelId: z.uuid(),
});

// INPUT TYPES
export type GetByClassIdAndModelIdInput = z.input<
  typeof GetByClassIdAndModelIdSchema
>;

export type GetByBiomarkerAndModelInput = z.input<
  typeof GetByBiomarkerAndModelSchema
>;

// OUTPUT TYPES
export type PredictionClassBiomarkerDTO = z.output<
  typeof PredictionClassBiomarkerDTOSchema
>;

export type PredictionClassBiomarkerWithBiomarker =
  PredictionClassBiomarkerDTO & {
    biomarkerName: string;
  };
