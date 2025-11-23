import { z } from "zod";

export const PredictionWorkflowInputSchema = z.object({
  userId: z.uuid(),
  formData: z.instanceof(FormData),
});

// INPUT TYPES
export type PredictionWorkflowInput = z.infer<
  typeof PredictionWorkflowInputSchema
>;
