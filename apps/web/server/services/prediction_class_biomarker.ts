"use server";

import { eq, and, getTableColumns } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionClassBiomarkersTable, BiomarkersTable } from "../db/schemas";
import {
  GetByClassIdAndModelIdSchema,
  type GetByClassIdAndModelIdInput,
  type PredictionClassBiomarkerWithBiomarker,
} from "../zod-schemas/prediction_class_biomarker";

// Re-export type for consumers
export type { PredictionClassBiomarkerWithBiomarker };

export const getPredictionClassBiomarkerByClassIdAndModelId = async (
  data: GetByClassIdAndModelIdInput,
): Promise<PredictionClassBiomarkerWithBiomarker | null> => {
  const { classId, modelId } = GetByClassIdAndModelIdSchema.parse(data);

  const [result] = await db
    .select({
      ...getTableColumns(PredictionClassBiomarkersTable),
      biomarkerName: BiomarkersTable.name,
    })
    .from(PredictionClassBiomarkersTable)
    .innerJoin(
      BiomarkersTable,
      eq(PredictionClassBiomarkersTable.biomarkerId, BiomarkersTable.id),
    )
    .where(
      and(
        eq(PredictionClassBiomarkersTable.classId, classId),
        eq(PredictionClassBiomarkersTable.modelId, modelId),
      ),
    );

  if (!result) {
    return null;
  }

  return result;
};

/**
 * Gets all prediction class biomarkers as a Map for O(1) lookups.
 * Key format: `${classId}-${modelId}`
 * Use this instead of individual queries in loops.
 */
export const getAllPredictionClassBiomarkersAsMap = async (): Promise<
  Map<string, PredictionClassBiomarkerWithBiomarker>
> => {
  const results = await db
    .select({
      ...getTableColumns(PredictionClassBiomarkersTable),
      biomarkerName: BiomarkersTable.name,
    })
    .from(PredictionClassBiomarkersTable)
    .innerJoin(
      BiomarkersTable,
      eq(PredictionClassBiomarkersTable.biomarkerId, BiomarkersTable.id),
    );

  const map = new Map<string, PredictionClassBiomarkerWithBiomarker>();
  for (const result of results) {
    const key = `${result.classId}-${result.modelId}`;
    map.set(key, result);
  }

  return map;
};
