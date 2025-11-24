import { z } from "zod";

export const CreateFeedbackSchema = z.object({
  diagnosisId: z.uuid(),
  isMainUser: z.boolean().optional().default(true),
  isMainData: z.boolean().optional().default(false),
  classId: z.number().int(),
  confidence: z.number(),
});

export const FeedbackDTOSchema = z.object({
  id: z.uuid(),
  diagnosisId: z.uuid(),
  userProfileId: z.uuid(),
  isMainUser: z.boolean(),
  isMainData: z.boolean(),
  classId: z.number().int(),
  confidence: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetFeedbackByDiagnosisSchema = z.object({
  diagnosisId: z.uuid(),
});

// INPUT TYPES
export type CreateFeedbackInput = z.input<typeof CreateFeedbackSchema>;
export type GetFeedbackByDiagnosisInput = z.input<
  typeof GetFeedbackByDiagnosisSchema
>;

// OUTPUT TYPES
export type FeedbackDTO = z.output<typeof FeedbackDTOSchema>;
