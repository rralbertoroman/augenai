"use server";

import { db } from "../db/client";
import { ClassificationsTable } from "../db/schemas";
import {
  CreateClassificationSchema,
  type CreateClassificationInput,
  type ClassificationDTO,
} from "../zod-schemas/classification";
import { z } from "zod";

export const createClassifications = async (
  inputs: CreateClassificationInput[],
): Promise<ClassificationDTO[]> => {
  if (inputs.length === 0) return [];

  const payload = z.array(CreateClassificationSchema).parse(inputs);

  const classifications = await db
    .insert(ClassificationsTable)
    .values(payload)
    .returning();

  return classifications;
};
