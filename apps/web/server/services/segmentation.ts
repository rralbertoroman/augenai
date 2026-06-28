"use server";

import { db } from "../db/client";
import { SegmentationsTable } from "../db/schemas";
import {
  CreateSegmentationSchema,
  type CreateSegmentationInput,
  type SegmentationDTO,
} from "../zod-schemas/segmentation";
import { z } from "zod";

export const createSegmentations = async (
  inputs: CreateSegmentationInput[],
): Promise<SegmentationDTO[]> => {
  if (inputs.length === 0) return [];

  const payload = z.array(CreateSegmentationSchema).parse(inputs);

  const segmentations = await db
    .insert(SegmentationsTable)
    .values(payload)
    .returning();

  return segmentations;
};
