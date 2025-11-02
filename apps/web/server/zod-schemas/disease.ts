import { z } from "zod";

export const CreateDiseaseSchema = z.object({
  name: z.string().min(1),
  stages: z.array(z.string()).min(1),
});

export const UpdateDiseaseSchema = z.object({
  name: z.string().min(1).optional(),
  stages: z.array(z.string()).min(1).optional(),
});

export const DeleteDiseaseSchema = z.object({
  id: z.uuid(),
});

export const DiseaseDTOSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  stages: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreateDiseaseInput = z.input<typeof CreateDiseaseSchema>;
export type UpdateDiseaseInput = z.input<typeof UpdateDiseaseSchema>;
export type DeleteDiseaseInput = z.input<typeof DeleteDiseaseSchema>;

// OUTPUT TYPES
export type DiseaseDTO = z.output<typeof DiseaseDTOSchema>;
