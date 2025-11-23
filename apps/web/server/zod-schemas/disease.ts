import { z } from "zod";

export const DiseaseDTOSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  stages: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// OUTPUT TYPES
export type DiseaseDTO = z.output<typeof DiseaseDTOSchema>;
