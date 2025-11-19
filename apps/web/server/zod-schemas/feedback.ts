import { z } from "zod";

const FeedbackItemContentSchema = z.object({
  previousDiseaseId: z.string(),
  newDiseaseId: z.string(),
  previousStageIdx: z.number(),
  newStageIdx: z.number(),
});

const FeedbackItemSchema = z.record(z.string(), FeedbackItemContentSchema);

export const CreateFeedbackSchema = z.object({
  predictionId: z.uuid(),
  userProfileId: z.uuid(),
  isMain: z.boolean().optional().default(true),
  feedbackData: z.array(FeedbackItemSchema),
});

export const UpdateFeedbackSchema = z.object({
  predictionId: z.uuid(),
  userProfileId: z.uuid(),
  isMain: z.boolean().optional(),
  feedbackData: z.array(FeedbackItemSchema).optional(),
});

export const DeleteFeedbackSchema = z.object({
  predictionId: z.uuid(),
  userProfileId: z.uuid(),
});

export const FeedbackDTOSchema = z.object({
  predictionId: z.uuid(),
  userProfileId: z.uuid(),
  isMain: z.boolean(),
  feedbackData: z.array(FeedbackItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetFeedbackByPredictionSchema = z.object({
  predictionId: z.uuid(),
});

export const GetFeedbackByUserSchema = z.object({
  userProfileId: z.uuid(),
});

// INPUT TYPES
export type CreateFeedbackInput = z.input<typeof CreateFeedbackSchema>;
export type UpdateFeedbackInput = z.input<typeof UpdateFeedbackSchema>;
export type DeleteFeedbackInput = z.input<typeof DeleteFeedbackSchema>;
export type GetFeedbackByPredictionInput = z.input<
  typeof GetFeedbackByPredictionSchema
>;
export type GetFeedbackByUserInput = z.input<typeof GetFeedbackByUserSchema>;

// OUTPUT TYPES
export type FeedbackDTO = z.output<typeof FeedbackDTOSchema>;
export type FeedbackItemContent = z.infer<typeof FeedbackItemContentSchema>;
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
