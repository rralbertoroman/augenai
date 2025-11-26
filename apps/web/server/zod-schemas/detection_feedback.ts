import { z } from "zod";

export const CreateDetectionFeedbackSchema = z.object({
  detectionId: z.uuid(),
  isMainUser: z.boolean().optional().default(true),
  isMainData: z.boolean().optional().default(false),
  classId: z.number().int(),
  confidence: z.number(),
  xLeft: z.number(),
  yTop: z.number(),
  width: z.number(),
  height: z.number(),
});

export const DetectionFeedbackDTOSchema = z.object({
  id: z.uuid(),
  detectionId: z.uuid(),
  userProfileId: z.uuid(),
  isMainUser: z.boolean(),
  isMainData: z.boolean(),
  classId: z.number().int(),
  confidence: z.number(),
  xLeft: z.number(),
  yTop: z.number(),
  width: z.number(),
  height: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetFeedbackByDetectionSchema = z.object({
  detectionId: z.uuid(),
});

// INPUT TYPES
export type CreateDetectionFeedbackInput = z.input<
  typeof CreateDetectionFeedbackSchema
>;
export type GetFeedbackByDetectionInput = z.input<
  typeof GetFeedbackByDetectionSchema
>;

// OUTPUT TYPES
export type DetectionFeedbackDTO = z.output<typeof DetectionFeedbackDTOSchema>;
