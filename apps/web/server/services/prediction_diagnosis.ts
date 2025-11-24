"use server";

import { db } from "../db/client";
import { PredictionDiagnosesTable } from "../db/schemas";
import {
  CreatePredictionDiagnosisSchema,
  type CreatePredictionDiagnosisInput,
  type PredictionDiagnosisDTO,
} from "../zod-schemas/prediction_diagnosis";
import { z } from "zod";

export const createPredictionDiagnoses = async (
  inputs: CreatePredictionDiagnosisInput[],
): Promise<PredictionDiagnosisDTO[]> => {
  if (inputs.length === 0) return [];

  const payload = z.array(CreatePredictionDiagnosisSchema).parse(inputs);

  const diagnoses = await db
    .insert(PredictionDiagnosesTable)
    .values(payload)
    .returning();

  return diagnoses;
};
