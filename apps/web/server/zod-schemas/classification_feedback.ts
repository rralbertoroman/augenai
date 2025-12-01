import { z } from "zod";

export const CreateClassificationFeedbackSchema = z.object({
  classificationId: z.uuid(),
  isMainUser: z.boolean().optional().default(true),
  isMainData: z.boolean().optional().default(false),
  classId: z.number().int(),
  confidence: z.number(),
});

export const ClassificationFeedbackDTOSchema = z.object({
  id: z.uuid(),
  classificationId: z.uuid(),
  userProfileId: z.uuid(),
  isMainUser: z.boolean(),
  isMainData: z.boolean(),
  classId: z.number().int(),
  confidence: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetFeedbackByClassificationSchema = z.object({
  classificationId: z.uuid(),
});

export const GetFeedbackByIdSchema = z.object({
  id: z.uuid(),
});

export const UpdateIsMainUserSchema = z.object({
  id: z.uuid(),
  isMainData: z.boolean(),
});

// INPUT TYPES
export type CreateClassificationFeedbackInput = z.input<
  typeof CreateClassificationFeedbackSchema
>;
export type GetFeedbackByClassificationInput = z.input<
  typeof GetFeedbackByClassificationSchema
>;
export type GetFeedbackByIdInput = z.input<typeof GetFeedbackByIdSchema>;
export type UpdateIsMainUserInput = z.input<typeof UpdateIsMainUserSchema>;

// OUTPUT TYPES
export type ClassificationFeedbackDTO = z.output<
  typeof ClassificationFeedbackDTOSchema
>;
