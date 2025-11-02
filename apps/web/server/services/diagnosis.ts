"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { DiagnosesTable } from "../db/schemas";
import {
  CreateDiagnosisSchema,
  DeleteDiagnosisSchema,
  UpdateDiagnosisSchema,
  type CreateDiagnosisInput,
  type DeleteDiagnosisInput,
  type DiagnosisDTO,
  type UpdateDiagnosisInput,
} from "../zod-schemas";

export const createDiagnosis = async (
  data: CreateDiagnosisInput,
): Promise<DiagnosisDTO> => {
  const payload = CreateDiagnosisSchema.parse(data);
  const [diagnosis] = await db
    .insert(DiagnosesTable)
    .values(payload)
    .returning();

  if (!diagnosis) {
    throw new Error("Error creating the diagnosis");
  }

  return diagnosis;
};

export const getDiagnosisById = async (
  id: string,
): Promise<DiagnosisDTO | null> => {
  const [diagnosis] = await db
    .select()
    .from(DiagnosesTable)
    .where(eq(DiagnosesTable.id, id));

  if (!diagnosis) {
    throw new Error("Diagnosis not found");
  }

  return diagnosis;
};

export const getAllDiagnoses = async (): Promise<DiagnosisDTO[]> => {
  const diagnoses = await db.select().from(DiagnosesTable);
  return diagnoses;
};

export const updateDiagnosis = async (
  id: string,
  data: UpdateDiagnosisInput,
): Promise<DiagnosisDTO> => {
  const payload = UpdateDiagnosisSchema.parse(data);

  const [diagnosis] = await db
    .update(DiagnosesTable)
    .set(payload)
    .where(eq(DiagnosesTable.id, id))
    .returning();

  if (!diagnosis) {
    throw new Error("Diagnosis not found");
  }

  return diagnosis;
};

export const deleteDiagnosis = async (
  data: DeleteDiagnosisInput,
): Promise<boolean> => {
  const { id } = DeleteDiagnosisSchema.parse(data);

  const deleted = await db
    .delete(DiagnosesTable)
    .where(eq(DiagnosesTable.id, id))
    .returning({ id: DiagnosesTable.id });
  return deleted.length > 0;
};
