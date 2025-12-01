import { z } from "zod";
import { type InferSelectModel } from "drizzle-orm";
import {
  PredictionsTable,
  ClassificationsTable,
  DetectionsTable,
  ClassificationFeedbackTable,
  DetectionFeedbackTable,
} from "../db/schemas";

export const CreatePredictionRequestSchema = z.object({
  patientId: z.uuid(),
  task: z.string().min(1),
  imageType: z.string().min(1),
  diseases: z.array(z.string()).min(1),
  storagePath: z.string().min(1),
  bucketName: z.string().min(1),
  modelsUsed: z.array(z.uuid()).min(1),
});

export const PredictionRequestDTOSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  patientId: z.uuid(),
  task: z.string(),
  imageType: z.string(),
  diseases: z.array(z.string()),
  storagePath: z.string(),
  bucketName: z.string(),
  modelsUsed: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreatePredictionRequestInput = z.input<
  typeof CreatePredictionRequestSchema
>;

// OUTPUT TYPES
export type PredictionRequestDTO = z.output<typeof PredictionRequestDTOSchema>;

// DB TYPES
type Classification = InferSelectModel<typeof ClassificationsTable>;
type Detection = InferSelectModel<typeof DetectionsTable>;
type ClassificationFeedback = InferSelectModel<
  typeof ClassificationFeedbackTable
>;
type DetectionFeedback = InferSelectModel<typeof DetectionFeedbackTable>;
type Prediction = InferSelectModel<typeof PredictionsTable>;

export type PredictionWithTasks = Prediction & {
  classifications: (Classification & {
    feedbacks?: ClassificationFeedback[];
  })[];
  detections: (Detection & { feedbacks?: DetectionFeedback[] })[];
};
