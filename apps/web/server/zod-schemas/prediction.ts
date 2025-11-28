import { z } from "zod";

export const CreatePredictionSchema = z.object({
  requestId: z.uuid(),
  modelId: z.uuid(),
});

export const PredictionDTOSchema = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  modelId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EnrichedPredictionDTOSchema = z.object({
  id: z.string(),
  class_id: z.number(),
  model_id: z.string(),
  confidence: z.number(),
  disease_id: z.string().optional(),
  disease_name: z.string().optional(),
  stage_idx: z.number().optional(),
  stage_content: z.string().optional(),
  lesion_name: z.string().optional(),
  patient_id: z.string(),
  request_id: z.string(),
  createdAt: z.date(),
  type: z.enum(["classification", "detection"]).optional(),
  bbox: z
    .object({
      x_left: z.number(),
      y_top: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  bucket_name: z.string(),
  storage_path: z.string(),
  feedbacks: z
    .array(
      z.object({
        id: z.string(),
        userProfileId: z.string(),
        isMainUser: z.boolean(),
        isMainData: z.boolean(),
        classId: z.number(),
        confidence: z.number(),
        createdAt: z.date(),
        // Optional bbox for detection feedback
        xLeft: z.number().optional(),
        yTop: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    )
    .optional(),
});

// INPUT TYPES
export type CreatePredictionInput = z.input<typeof CreatePredictionSchema>;

// OUTPUT TYPES
export type PredictionDTO = z.output<typeof PredictionDTOSchema>;
export type EnrichedPredictionDTO = z.output<
  typeof EnrichedPredictionDTOSchema
>;
