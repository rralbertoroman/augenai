"use server";

import { db } from "../db/client";
import { DetectionsTable } from "../db/schemas";
import {
  CreateDetectionSchema,
  type CreateDetectionInput,
  type DetectionDTO,
} from "../zod-schemas/detection";
import { z } from "zod";

export const createDetections = async (
  inputs: CreateDetectionInput[],
): Promise<DetectionDTO[]> => {
  if (inputs.length === 0) return [];

  const payload = z.array(CreateDetectionSchema).parse(inputs);

  const detections = await db
    .insert(DetectionsTable)
    .values(payload)
    .returning();

  return detections;
};
