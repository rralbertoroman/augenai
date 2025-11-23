"use server";

import { eq, and, getTableColumns } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionClassesTable, DiseasesTable } from "../db/schemas";
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
  type PredictionClassDiseaseWithDisease,
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

export const getPredictionClassDiseaseByClassIdAndModelId = async (
  data: GetByClassIdAndModelIdInput,
): Promise<PredictionClassDiseaseWithDisease | null> => {
  const { classId, modelId } = GetByClassIdAndModelIdSchema.parse(data);

  const [result] = await db
    .select({
      ...getTableColumns(PredictionClassesTable),
      diseaseName: DiseasesTable.name,
      diseaseStages: DiseasesTable.stages,
    })
    .from(PredictionClassesTable)
    .innerJoin(
      DiseasesTable,
      eq(PredictionClassesTable.diseaseId, DiseasesTable.id),
    )
    .where(
      and(
        eq(PredictionClassesTable.classId, classId),
        eq(PredictionClassesTable.modelId, modelId),
      ),
    );

  if (!result) {
    return null;
  }

  return result;
};

export const getAllPredictionClassDiseases = async (): Promise<
  PredictionClassDiseaseDTO[]
> => {
  const predictionClasses = await db.select().from(PredictionClassesTable);
  return predictionClasses;
};

export const updatePredictionClassDisease = async (
  identifiers: GetByClassIdAndModelIdInput,
  data: UpdatePredictionClassDiseaseInput,
): Promise<PredictionClassDiseaseDTO> => {
  const { classId, modelId } = GetByClassIdAndModelIdSchema.parse(identifiers);
  const payload = UpdatePredictionClassDiseaseSchema.parse(data);

  const [predictionClass] = await db
    .update(PredictionClassesTable)
    .set(payload)
    .where(
      and(
        eq(PredictionClassesTable.classId, classId),
        eq(PredictionClassesTable.modelId, modelId),
      ),
    )
    .returning();

  if (!predictionClass) {
    throw new Error("Prediction class disease not found");
  }

  return predictionClass;
};

export const deletePredictionClassDisease = async (
  data: DeletePredictionClassDiseaseInput,
): Promise<boolean> => {
  const { classId, modelId } = DeletePredictionClassDiseaseSchema.parse(data);

  const deleted = await db
    .delete(PredictionClassesTable)
    .where(
      and(
        eq(PredictionClassesTable.classId, classId),
        eq(PredictionClassesTable.modelId, modelId),
      ),
    )
    .returning({
      classId: PredictionClassesTable.classId,
      modelId: PredictionClassesTable.modelId,
    });
  return deleted.length > 0;
};
