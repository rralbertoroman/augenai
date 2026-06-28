import { z } from "zod";

export const CreateSegmentationSchema = z.object({
  predictionId: z.uuid(),
  classId: z.number().int(),
  className: z.string(),
  polygon: z.array(z.array(z.number())),
  area: z.number(),
  confidence: z.number(),
});

export const SegmentationDTOSchema = CreateSegmentationSchema.extend({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreateSegmentationInput = z.infer<typeof CreateSegmentationSchema>;

// OUTPUT TYPES
export type SegmentationDTO = z.infer<typeof SegmentationDTOSchema>;
