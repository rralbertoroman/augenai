"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PatientsTable } from "../db/schemas";
import {
  CreatePatientSchema,
  UpdatePatientSchema,
  DeletePatientSchema,
  type CreatePatientInput,
  type UpdatePatientInput,
  type DeletePatientInput,
  type PatientDTO,
} from "../zod-schemas/patient";

export const getPatients = async (): Promise<PatientDTO[]> => {
  const patients = await db.select().from(PatientsTable);
  return patients;
};

export const getPatientById = async (
  id: string,
): Promise<PatientDTO | null> => {
  const [patient] = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.id, id));
  return patient || null;
};

export const createPatient = async (
  data: CreatePatientInput,
): Promise<PatientDTO> => {
  const validatedData = CreatePatientSchema.parse(data);
  const [patient] = await db
    .insert(PatientsTable)
    .values(validatedData)
    .returning();
  return patient;
};

export const updatePatient = async (
  id: string,
  data: UpdatePatientInput,
): Promise<PatientDTO> => {
  const validatedData = UpdatePatientSchema.parse(data);
  const [patient] = await db
    .update(PatientsTable)
    .set(validatedData)
    .where(eq(PatientsTable.id, id))
    .returning();
  return patient;
};

export const deletePatient = async (
  data: DeletePatientInput,
): Promise<void> => {
  const { id } = DeletePatientSchema.parse(data);
  await db.delete(PatientsTable).where(eq(PatientsTable.id, id));
};

export const getPatientsByUserId = async (
  userId: string,
): Promise<PatientDTO[]> => {
  const patients = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.doctorId, userId));
  return patients;
};
