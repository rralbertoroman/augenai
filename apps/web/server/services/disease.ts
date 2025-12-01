"use server";

import { db } from "../db/client";
import { DiseasesTable } from "../db/schemas";
import { type DiseaseDTO } from "../zod-schemas/disease";
import { getCurrentUser } from "../auth";

export const getAllDiseases = async (token: string): Promise<DiseaseDTO[]> => {
  await getCurrentUser(token);
  const diseases = await db.select().from(DiseasesTable);
  return diseases;
};
