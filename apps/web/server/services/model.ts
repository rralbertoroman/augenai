"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { ModelsTable } from "../db/schemas";
import {
  CreateModelSchema,
  DeleteModelSchema,
  UpdateModelSchema,
  type CreateModelInput,
  type DeleteModelInput,
  type ModelDTO,
  type UpdateModelInput,
} from "../zod-schemas";

export const createModel = async (
  data: CreateModelInput,
): Promise<ModelDTO> => {
  const payload = CreateModelSchema.parse(data);
  const [model] = await db.insert(ModelsTable).values(payload).returning();

  if (!model) {
    throw new Error("Error creating the model");
  }

  return model;
};

export const getModelById = async (id: string): Promise<ModelDTO | null> => {
  const [model] = await db
    .select()
    .from(ModelsTable)
    .where(eq(ModelsTable.id, id));

  if (!model) {
    throw new Error("Model not found");
  }

  return model;
};

export const getModelByName = async (
  modelName: string,
): Promise<ModelDTO | null> => {
  const [model] = await db
    .select()
    .from(ModelsTable)
    .where(eq(ModelsTable.modelName, modelName));

  if (!model) {
    throw new Error("Model not found");
  }

  return model;
};

export const getAllModels = async (): Promise<ModelDTO[]> => {
  const models = await db.select().from(ModelsTable);
  return models;
};

export const updateModel = async (
  id: string,
  data: UpdateModelInput,
): Promise<ModelDTO> => {
  const payload = UpdateModelSchema.parse(data);

  const [model] = await db
    .update(ModelsTable)
    .set(payload)
    .where(eq(ModelsTable.id, id))
    .returning();

  if (!model) {
    throw new Error("Model not found");
  }

  return model;
};

export const deleteModel = async (data: DeleteModelInput): Promise<boolean> => {
  const { id } = DeleteModelSchema.parse(data);

  const deleted = await db
    .delete(ModelsTable)
    .where(eq(ModelsTable.id, id))
    .returning({ id: ModelsTable.id });
  return deleted.length > 0;
};
