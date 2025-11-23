import { z } from "zod";

export const CreatePatientSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  gender: z.string().min(1),
  clinicalConditions: z.array(z.string()),
  doctorId: z.uuid(),
});

export const UpdatePatientSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  gender: z.string().min(1).optional(),
  clinicalConditions: z.array(z.string()).optional(),
  doctorId: z.uuid().optional(),
});

export const DeletePatientSchema = z.object({
  id: z.uuid(),
});

export const PatientDTOSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  clinicalConditions: z.array(z.string()),
  doctorId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// INPUT TYPES
export type CreatePatientInput = z.input<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.input<typeof UpdatePatientSchema>;
export type DeletePatientInput = z.input<typeof DeletePatientSchema>;

// OUTPUT TYPES
export type PatientDTO = z.output<typeof PatientDTOSchema>;
