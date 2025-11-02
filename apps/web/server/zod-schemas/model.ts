import { z } from "zod";

export const CreateModelSchema = z.object({
  modelName: z.string().min(1),
  modelTasks: z.array(z.string()).min(1),
  diseases: z.array(z.string()).min(1),
  acceptedImageTypes: z.array(z.string()).min(1),
  latestTraining: z.date(),
  accuracy: z.number().min(0).max(1),
});

export const UpdateModelSchema = z.object({
  modelName: z.string().min(1).optional(),
  modelTasks: z.array(z.string()).min(1).optional(),
  diseases: z.array(z.string()).min(1).optional(),
  acceptedImageTypes: z.array(z.string()).min(1).optional(),
  latestTraining: z.date().optional(),
  accuracy: z.number().min(0).max(1).optional(),
});

export const DeleteModelSchema = z.object({
  id: z.uuid(),
});

export const ModelDTOSchema = z.object({
  id: z.uuid(),
  modelName: z.string(),
  modelTasks: z.array(z.string()),
  diseases: z.array(z.string()),
  acceptedImageTypes: z.array(z.string()),
  latestTraining: z.date(),
  accuracy: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreateModelInput = z.input<typeof CreateModelSchema>;
export type UpdateModelInput = z.input<typeof UpdateModelSchema>;
export type DeleteModelInput = z.input<typeof DeleteModelSchema>;

// OUTPUT TYPES
export type ModelDTO = z.output<typeof ModelDTOSchema>;
