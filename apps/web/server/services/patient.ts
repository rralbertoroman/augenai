"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PatientsTable } from "../db/schemas";
import {
  CreatePatientSchema,
  DeletePatientSchema,
  UpdatePatientSchema,
  type CreatePatientInput,
  type DeletePatientInput,
  type PatientDTO,
  type UpdatePatientInput,
} from "../zod-schemas";

export const createPatient = async (
  data: CreatePatientInput,
): Promise<PatientDTO> => {
  const payload = CreatePatientSchema.parse(data);
  const [patient] = await db.insert(PatientsTable).values(payload).returning();

  if (!patient) {
    throw new Error("Error creating the patient");
  }

  return patient;
};

export const getPatientById = async (
  id: string,
): Promise<PatientDTO | null> => {
  const [patient] = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.id, id));

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

export const getAllPatients = async (): Promise<PatientDTO[]> => {
  const patients = await db.select().from(PatientsTable);
  return patients;
};

export const updatePatient = async (
  id: string,
  data: UpdatePatientInput,
): Promise<PatientDTO> => {
  const payload = UpdatePatientSchema.parse(data);

  const [patient] = await db
    .update(PatientsTable)
    .set(payload)
    .where(eq(PatientsTable.id, id))
    .returning();

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

export const deletePatient = async (
  data: DeletePatientInput,
): Promise<boolean> => {
  const { id } = DeletePatientSchema.parse(data);

  const deleted = await db
    .delete(PatientsTable)
    .where(eq(PatientsTable.id, id))
    .returning({ id: PatientsTable.id });
  return deleted.length > 0;
};
