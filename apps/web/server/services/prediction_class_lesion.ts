"use server";

import { eq, and, getTableColumns } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionClassLesionsTable, LesionsTable } from "../db/schemas";
import {
  GetByClassIdAndModelIdSchema,
  GetByLesionAndModelSchema,
  type GetByClassIdAndModelIdInput,
  type GetByLesionAndModelInput,
  type PredictionClassLesionWithLesion,
} from "../zod-schemas/prediction_class_lesion";

// Re-export type for consumers
export type { PredictionClassLesionWithLesion };

export const getPredictionClassLesionByClassIdAndModelId = async (
  data: GetByClassIdAndModelIdInput,
): Promise<PredictionClassLesionWithLesion | null> => {
  const { classId, modelId } = GetByClassIdAndModelIdSchema.parse(data);

  const [result] = await db
    .select({
      ...getTableColumns(PredictionClassLesionsTable),
      lesionName: LesionsTable.name,
    })
    .from(PredictionClassLesionsTable)
    .innerJoin(
      LesionsTable,
      eq(PredictionClassLesionsTable.lesionId, LesionsTable.id),
    )
    .where(
      and(
        eq(PredictionClassLesionsTable.classId, classId),
        eq(PredictionClassLesionsTable.modelId, modelId),
      ),
    );

  if (!result) {
    return null;
  }

  return result;
};

/**
 * Gets all prediction class lesions as a Map for O(1) lookups.
 * Key format: `${classId}-${modelId}`
 * Use this instead of individual queries in loops.
 */
export const getAllPredictionClassLesionsAsMap = async (): Promise<
  Map<string, PredictionClassLesionWithLesion>
> => {
  const results = await db
    .select({
      ...getTableColumns(PredictionClassLesionsTable),
      lesionName: LesionsTable.name,
    })
    .from(PredictionClassLesionsTable)
    .innerJoin(
      LesionsTable,
      eq(PredictionClassLesionsTable.lesionId, LesionsTable.id),
    );

  const map = new Map<string, PredictionClassLesionWithLesion>();
  for (const result of results) {
    const key = `${result.classId}-${result.modelId}`;
    map.set(key, result);
  }

  return map;
};

export const getClassIdByLesionAndModel = async (
  data: GetByLesionAndModelInput,
): Promise<number | null> => {
  const { lesionId, modelId } = GetByLesionAndModelSchema.parse(data);

  const [result] = await db
    .select({
      classId: PredictionClassLesionsTable.classId,
    })
    .from(PredictionClassLesionsTable)
    .where(
      and(
        eq(PredictionClassLesionsTable.lesionId, lesionId),
        eq(PredictionClassLesionsTable.modelId, modelId),
      ),
    );

  if (!result) {
    return null;
  }

  return result.classId;
};
