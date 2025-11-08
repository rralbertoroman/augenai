"use server";

import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionClassesTable } from "../db/schemas";
import {
  CreatePredictionClassDiseaseSchema,
  DeletePredictionClassDiseaseSchema,
  UpdatePredictionClassDiseaseSchema,
  GetByClassIdAndModelIdSchema,
  type CreatePredictionClassDiseaseInput,
  type DeletePredictionClassDiseaseInput,
  type UpdatePredictionClassDiseaseInput,
  type GetByClassIdAndModelIdInput,
  type PredictionClassDiseaseDTO,
} from "../zod-schemas/prediction_class_disease";

export const createPredictionClassDisease = async (
  data: CreatePredictionClassDiseaseInput,
): Promise<PredictionClassDiseaseDTO> => {
  const payload = CreatePredictionClassDiseaseSchema.parse(data);
  const [predictionClass] = await db
    .insert(PredictionClassesTable)
    .values(payload)
    .returning();

  if (!predictionClass) {
    throw new Error("Error creating the prediction class disease");
  }

  return predictionClass;
};

export const getPredictionClassDiseaseById = async (
  id: string,
): Promise<PredictionClassDiseaseDTO | null> => {
  const [predictionClass] = await db
    .select()
    .from(PredictionClassesTable)
    .where(eq(PredictionClassesTable.id, id));

  if (!predictionClass) {
    throw new Error("Prediction class disease not found");
  }

  return predictionClass;
};

export const getPredictionClassDiseaseByClassIdAndModelId = async (
  data: GetByClassIdAndModelIdInput,
): Promise<PredictionClassDiseaseDTO | null> => {
  const { classId, modelId } = GetByClassIdAndModelIdSchema.parse(data);

  const [predictionClass] = await db
    .select()
    .from(PredictionClassesTable)
    .where(
      and(
        eq(PredictionClassesTable.classId, classId),
        eq(PredictionClassesTable.modelId, modelId),
      ),
    );

  if (!predictionClass) {
    return null;
  }

  return predictionClass;
};

export const getAllPredictionClassDiseases = async (): Promise<
  PredictionClassDiseaseDTO[]
> => {
  const predictionClasses = await db.select().from(PredictionClassesTable);
  return predictionClasses;
};

export const updatePredictionClassDisease = async (
  id: string,
  data: UpdatePredictionClassDiseaseInput,
): Promise<PredictionClassDiseaseDTO> => {
  const payload = UpdatePredictionClassDiseaseSchema.parse(data);

  const [predictionClass] = await db
    .update(PredictionClassesTable)
    .set(payload)
    .where(eq(PredictionClassesTable.id, id))
    .returning();

  if (!predictionClass) {
    throw new Error("Prediction class disease not found");
  }

  return predictionClass;
};

export const deletePredictionClassDisease = async (
  data: DeletePredictionClassDiseaseInput,
): Promise<boolean> => {
  const { id } = DeletePredictionClassDiseaseSchema.parse(data);

  const deleted = await db
    .delete(PredictionClassesTable)
    .where(eq(PredictionClassesTable.id, id))
    .returning({ id: PredictionClassesTable.id });
  return deleted.length > 0;
};
