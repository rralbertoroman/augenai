import { z } from "zod";

export const SelectOptimalModelsSchema = z.object({
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string().min(1)).min(1),
});

export const OptimalModelSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export const SelectOptimalModelsResponseSchema = z.array(OptimalModelSchema);

// INPUT TYPES
export type SelectOptimalModelsInput = z.input<
  typeof SelectOptimalModelsSchema
>;

// OUTPUT TYPES
export type OptimalModel = z.output<typeof OptimalModelSchema>;
export type SelectOptimalModelsResponse = z.output<
  typeof SelectOptimalModelsResponseSchema
>;
