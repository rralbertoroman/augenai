import { z } from "zod";

export const CreateModelSchema = z.object({
  modelName: z.string().min(1),
  modelTasks: z.array(z.string()).min(1),
  diseases: z.array(z.string()).min(1),
  acceptedImageTypes: z.array(z.string()).min(1),
  latestTraining: z.date(),
  accuracy: z.number().min(0).max(1),
  size: z.number().positive(), // Model size in MB
  params: z.number().positive(), // Number of parameters in millions
});

export const UpdateModelSchema = z.object({
  modelName: z.string().min(1).optional(),
  modelTasks: z.array(z.string()).min(1).optional(),
  diseases: z.array(z.string()).min(1).optional(),
  acceptedImageTypes: z.array(z.string()).min(1).optional(),
  latestTraining: z.date().optional(),
  accuracy: z.number().min(0).max(1).optional(),
  size: z.number().positive().optional(),
  params: z.number().positive().optional(),
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
  size: z.number(),
  params: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SelectOptimalModelsSchema = z.object({
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string()).min(1),
});

// INPUT TYPES
export type CreateModelInput = z.input<typeof CreateModelSchema>;
export type UpdateModelInput = z.input<typeof UpdateModelSchema>;
export type DeleteModelInput = z.input<typeof DeleteModelSchema>;
export type SelectOptimalModelsInput = z.input<
  typeof SelectOptimalModelsSchema
>;

// OUTPUT TYPES
export type ModelDTO = z.output<typeof ModelDTOSchema>;
