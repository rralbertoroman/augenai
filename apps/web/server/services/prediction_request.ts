"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { PredictionRequestsTable } from "../db/schemas";
import {
  CreatePredictionRequestSchema,
  DeletePredictionRequestSchema,
  UpdatePredictionRequestSchema,
  GetPredictionRequestsByPatientSchema,
  GetPredictionRequestsByUserSchema,
  type CreatePredictionRequestInput,
  type DeletePredictionRequestInput,
  type UpdatePredictionRequestInput,
  type GetPredictionRequestsByPatientInput,
  type GetPredictionRequestsByUserInput,
  type PredictionRequestDTO,
} from "../zod-schemas/prediction_request";

export const createPredictionRequest = async (
  data: CreatePredictionRequestInput,
): Promise<PredictionRequestDTO> => {
  const payload = CreatePredictionRequestSchema.parse(data);

  const [predictionRequest] = await db
    .insert(PredictionRequestsTable)
    .values(payload)
    .returning();

  if (!predictionRequest) {
    throw new Error("Error creating the prediction request");
  }

  return predictionRequest;
};

export const getPredictionRequestById = async (
  id: string,
): Promise<PredictionRequestDTO | null> => {
  const [predictionRequest] = await db
    .select()
    .from(PredictionRequestsTable)
    .where(eq(PredictionRequestsTable.id, id));

  if (!predictionRequest) {
    return null;
  }

  return predictionRequest;
};

export const getPredictionRequestsByPatient = async (
  data: GetPredictionRequestsByPatientInput,
): Promise<PredictionRequestDTO[]> => {
  const { patientId } = GetPredictionRequestsByPatientSchema.parse(data);

  const predictionRequests = await db
    .select()
    .from(PredictionRequestsTable)
    .where(eq(PredictionRequestsTable.patientId, patientId));

  return predictionRequests;
};

export const getPredictionRequestsByUser = async (
  data: GetPredictionRequestsByUserInput,
): Promise<PredictionRequestDTO[]> => {
  const { userId } = GetPredictionRequestsByUserSchema.parse(data);

  const predictionRequests = await db
    .select()
    .from(PredictionRequestsTable)
    .where(eq(PredictionRequestsTable.userId, userId));

  return predictionRequests;
};

export const getAllPredictionRequests = async (): Promise<
  PredictionRequestDTO[]
> => {
  const predictionRequests = await db.select().from(PredictionRequestsTable);
  return predictionRequests;
};

export const updatePredictionRequest = async (
  id: string,
  data: UpdatePredictionRequestInput,
): Promise<PredictionRequestDTO> => {
  const payload = UpdatePredictionRequestSchema.parse(data);

  const [predictionRequest] = await db
    .update(PredictionRequestsTable)
    .set(payload)
    .where(eq(PredictionRequestsTable.id, id))
    .returning();

  if (!predictionRequest) {
    throw new Error("Prediction request not found");
  }

  return predictionRequest;
};

export const deletePredictionRequest = async (
  data: DeletePredictionRequestInput,
): Promise<boolean> => {
  const { id } = DeletePredictionRequestSchema.parse(data);

  const deleted = await db
    .delete(PredictionRequestsTable)
    .where(eq(PredictionRequestsTable.id, id))
    .returning({ id: PredictionRequestsTable.id });

  return deleted.length > 0;
};
