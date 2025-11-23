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
  isMainUser: z.boolean().optional().default(true),
  isMainData: z.boolean().optional().default(false),
  feedbackData: z.array(FeedbackItemSchema),
});

export const FeedbackDTOSchema = z.object({
  predictionId: z.uuid(),
  userProfileId: z.uuid(),
  isMainUser: z.boolean(),
  isMainData: z.boolean(),
  feedbackData: z.array(FeedbackItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetFeedbackByPredictionSchema = z.object({
  predictionId: z.uuid(),
});

// INPUT TYPES
export type CreateFeedbackInput = z.input<typeof CreateFeedbackSchema>;
export type GetFeedbackByPredictionInput = z.input<
  typeof GetFeedbackByPredictionSchema
>;

// OUTPUT TYPES
export type FeedbackDTO = z.output<typeof FeedbackDTOSchema>;
export type FeedbackItemContent = z.infer<typeof FeedbackItemContentSchema>;
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
