"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { DiseasesTable } from "../db/schemas";
import {
  CreateDiseaseSchema,
  DeleteDiseaseSchema,
  UpdateDiseaseSchema,
  type CreateDiseaseInput,
  type DeleteDiseaseInput,
  type DiseaseDTO,
  type UpdateDiseaseInput,
} from "../zod-schemas";

export const createDisease = async (
  data: CreateDiseaseInput,
): Promise<DiseaseDTO> => {
  const payload = CreateDiseaseSchema.parse(data);
  const [disease] = await db.insert(DiseasesTable).values(payload).returning();

  if (!disease) {
    throw new Error("Error creating the disease");
  }

  return disease;
};

export const getDiseaseById = async (
  id: string,
): Promise<DiseaseDTO | null> => {
  const [disease] = await db
    .select()
    .from(DiseasesTable)
    .where(eq(DiseasesTable.id, id));

  if (!disease) {
    throw new Error("Disease not found");
  }

  return disease;
};

export const getDiseaseByName = async (
  name: string,
): Promise<DiseaseDTO | null> => {
  const [disease] = await db
    .select()
    .from(DiseasesTable)
    .where(eq(DiseasesTable.name, name));

  if (!disease) {
    throw new Error("Disease not found");
  }

  return disease;
};

export const getAllDiseases = async (): Promise<DiseaseDTO[]> => {
  const diseases = await db.select().from(DiseasesTable);
  return diseases;
};

export const updateDisease = async (
  id: string,
  data: UpdateDiseaseInput,
): Promise<DiseaseDTO> => {
  const payload = UpdateDiseaseSchema.parse(data);

  const [disease] = await db
    .update(DiseasesTable)
    .set(payload)
    .where(eq(DiseasesTable.id, id))
    .returning();

  if (!disease) {
    throw new Error("Disease not found");
  }

  return disease;
};

export const deleteDisease = async (
  data: DeleteDiseaseInput,
): Promise<boolean> => {
  const { id } = DeleteDiseaseSchema.parse(data);

  const deleted = await db
    .delete(DiseasesTable)
    .where(eq(DiseasesTable.id, id))
    .returning({ id: DiseasesTable.id });
  return deleted.length > 0;
};
