import { z } from "zod";

export const CreatePredictionDiagnosisSchema = z.object({
  predictionId: z.uuid(),
  classId: z.number().int(),
  confidence: z.number(),
});

export const PredictionDiagnosisSchema = CreatePredictionDiagnosisSchema.extend(
  {
    id: z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  },
);

// INPUT TYPES
export type CreatePredictionDiagnosisInput = z.infer<
  typeof CreatePredictionDiagnosisSchema
>;

// OUTPUT TYPES
export type PredictionDiagnosisDTO = z.infer<typeof PredictionDiagnosisSchema>;
