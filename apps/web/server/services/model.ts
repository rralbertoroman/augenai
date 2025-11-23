"use server";

import { db } from "../db/client";
import { ModelsTable } from "../db/schemas";

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
): Promise<{ id: string; name: string }[]> => {
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

  return selectedModelNames.map((name) => {
    const model = candidateModels.find((m) => m.modelName === name);
    if (!model) throw new Error(`Model ${name} not found in candidates`);
    return { id: model.id, name: model.modelName };
  });
};
