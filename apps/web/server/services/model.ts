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

/**
 * Selects optimal models to cover all requested diseases
 * Algorithm:
 * 1. Filter models by task and imageType
 * 2. Greedy selection to minimize number of models
 * 3. Priority order for each iteration:
 *    a) Model that covers MOST uncovered diseases
 *    b) If tie, choose model with SMALLEST size
 *    c) If still tie, choose model with FEWEST params
 */
export const selectOptimalModels = async (
  task: string,
  imageType: string,
  diseases: string[],
): Promise<string[]> => {
  // Get all models that match task and imageType
  const allModels = await db.select().from(ModelsTable);

  const candidateModels = allModels.filter(
    (model) =>
      model.modelTasks.includes(task) &&
      model.acceptedImageTypes.includes(imageType),
  );

  if (candidateModels.length === 0) {
    throw new Error(
      `No models found for task: ${task} and imageType: ${imageType}`,
    );
  }

  // Greedy algorithm to select minimum models covering all diseases
  const selectedModelNames: string[] = [];
  const selectedModelIds = new Set<string>();
  const coveredDiseases = new Set<string>();
  const targetDiseases = new Set(diseases);

  // Keep selecting models until all diseases are covered
  while (coveredDiseases.size < targetDiseases.size) {
    let bestModel: (typeof candidateModels)[0] | null = null;
    let maxNewCoverage = 0;

    // Find model that covers the most uncovered diseases
    // Priority: 1) Most diseases covered, 2) Smallest size, 3) Fewest params
    for (const model of candidateModels) {
      if (selectedModelIds.has(model.id)) continue;

      const newDiseases = model.diseases.filter(
        (disease) =>
          targetDiseases.has(disease) && !coveredDiseases.has(disease),
      );

      const newCoverage = newDiseases.length;

      // Select this model if:
      // 1. It covers more diseases than current best, OR
      // 2. It covers same diseases but is smaller, OR
      // 3. It covers same diseases, same size, but fewer params
      if (
        newCoverage > maxNewCoverage ||
        (newCoverage === maxNewCoverage &&
          bestModel &&
          (model.size < bestModel.size ||
            (model.size === bestModel.size && model.params < bestModel.params)))
      ) {
        maxNewCoverage = newCoverage;
        bestModel = model;
      }
    }

    if (!bestModel || maxNewCoverage === 0) {
      const uncoveredDiseases = Array.from(targetDiseases).filter(
        (d) => !coveredDiseases.has(d),
      );
      throw new Error(
        `Cannot cover all diseases. Uncovered: ${uncoveredDiseases.join(", ")}`,
      );
    }

    // Add best model and update covered diseases
    selectedModelIds.add(bestModel.id);
    selectedModelNames.push(bestModel.modelName);
    bestModel.diseases.forEach((disease) => {
      if (targetDiseases.has(disease)) {
        coveredDiseases.add(disease);
      }
    });
  }

  return selectedModelNames;
};
