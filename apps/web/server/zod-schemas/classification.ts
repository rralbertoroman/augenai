import { z } from "zod";

export const CreateClassificationSchema = z.object({
  predictionId: z.uuid(),
  classId: z.number().int(),
  confidence: z.number(),
});

export const ClassificationSchema = CreateClassificationSchema.extend({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreateClassificationInput = z.infer<
  typeof CreateClassificationSchema
>;

// OUTPUT TYPES
export type ClassificationDTO = z.infer<typeof ClassificationSchema>;
