import { z } from "zod";

export const CreateDetectionSchema = z.object({
  predictionId: z.uuid(),
  classId: z.number().int(),
  confidence: z.number(),
  xLeft: z.number(),
  yTop: z.number(),
  width: z.number(),
  height: z.number(),
});

export const DetectionDTOSchema = CreateDetectionSchema.extend({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreateDetectionInput = z.infer<typeof CreateDetectionSchema>;

// OUTPUT TYPES
export type DetectionDTO = z.infer<typeof DetectionDTOSchema>;
