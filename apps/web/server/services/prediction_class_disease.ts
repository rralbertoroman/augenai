"use server";

import { eq, and, getTableColumns } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionClassesTable, DiseasesTable } from "../db/schemas";
import {
  GetByClassIdAndModelIdSchema,
  GetByStageDiseaseAndModelSchema,
  type GetByClassIdAndModelIdInput,
  type GetByStageDiseaseAndModelInput,
  type PredictionClassDiseaseWithDisease,
} from "../zod-schemas/prediction_class_disease";

import { getCurrentUser } from "../auth";

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

export const getClassIdByStageDiseaseAndModel = async (
  data: GetByStageDiseaseAndModelInput,
): Promise<number | null> => {
  const { stageIdx, diseaseId, modelId } =
    GetByStageDiseaseAndModelSchema.parse(data);

  const [result] = await db
    .select({
      classId: PredictionClassesTable.classId,
    })
    .from(PredictionClassesTable)
    .where(
      and(
        eq(PredictionClassesTable.stageIdx, stageIdx),
        eq(PredictionClassesTable.diseaseId, diseaseId),
        eq(PredictionClassesTable.modelId, modelId),
      ),
    );

  if (!result) {
    return null;
  }

  return result.classId;
};

export const getAllPredictionClasses = async (
  token: string,
): Promise<PredictionClassDiseaseWithDisease[]> => {
  await getCurrentUser(token);

  const results = await db
    .select({
      ...getTableColumns(PredictionClassesTable),
      diseaseName: DiseasesTable.name,
      diseaseStages: DiseasesTable.stages,
    })
    .from(PredictionClassesTable)
    .innerJoin(
      DiseasesTable,
      eq(PredictionClassesTable.diseaseId, DiseasesTable.id),
    );

  return results;
};
