"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PatientsTable } from "../db/schemas";
import {
  CreatePatientSchema,
  UpdatePatientSchema,
  type CreatePatientInput,
  type UpdatePatientInput,
  type PatientDTO,
} from "../zod-schemas/patient";
import { getCurrentUser, verifyOwnership } from "../auth";

export const createPatient = async (
  token: string,
  data: CreatePatientInput,
): Promise<PatientDTO> => {
  const user = await getCurrentUser(token);
  const validatedData = CreatePatientSchema.parse(data);
  const [patient] = await db
    .insert(PatientsTable)
    .values({
      ...validatedData,
      doctorId: user.userId,
    })
    .returning();
  return patient;
};

export const updatePatient = async (
  token: string,
  patientId: string,
  data: UpdatePatientInput,
): Promise<PatientDTO> => {
  const user = await getCurrentUser(token);

  // Verify patient exists and get its doctorId
  const [existingPatient] = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.id, patientId));

  if (!existingPatient) {
    throw new Error("Patient not found");
  }

  // Verify ownership
  verifyOwnership(user, existingPatient.doctorId);

  const validatedData = UpdatePatientSchema.parse(data);
  const [patient] = await db
    .update(PatientsTable)
    .set(validatedData)
    .where(eq(PatientsTable.id, patientId))
    .returning();
  return patient;
};

export const deletePatient = async (
  token: string,
  patientId: string,
): Promise<void> => {
  const user = await getCurrentUser(token);

  // Verify patient exists and get its doctorId
  const [existingPatient] = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.id, patientId));

  if (!existingPatient) {
    throw new Error("Patient not found");
  }

  // Verify ownership
  verifyOwnership(user, existingPatient.doctorId);

  await db.delete(PatientsTable).where(eq(PatientsTable.id, patientId));
};

export const getPatientsByUserId = async (
  token: string,
): Promise<PatientDTO[]> => {
  const user = await getCurrentUser(token);

  const patients = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.doctorId, user.userId));
  return patients;
};

export const getPatientById = async (
  patientId: string,
): Promise<PatientDTO | null> => {
  const [patient] = await db
    .select()
    .from(PatientsTable)
    .where(eq(PatientsTable.id, patientId));
  return patient || null;
};
