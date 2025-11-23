import { z } from "zod";

export const CreateUserProfileSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().max(50).default("doctor"), // Expected values: "admin", "doctor", "patient"
});

export const CreateUserProfileWithAuthSchema = z.object({
  id: z.uuid(), // ID from Supabase auth.users (from JWT)
  email: z.email(), // Email from JWT
  name: z.string().min(1).max(255),
  role: z.string().max(50).default("doctor"),
});

export const UpdateUserProfileSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(1).max(255).optional(),
  role: z.string().max(50).optional(), // Expected values: "admin", "doctor", "patient"
});

export const DeleteUserProfileSchema = z.object({
  id: z.uuid(),
});

export const UserProfileDTOSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: z.string(), // Values: "admin", "doctor", "patient"
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetUserProfileByEmailSchema = z.object({
  email: z.email(),
});

// INPUT TYPES
export type CreateUserProfileInput = z.input<typeof CreateUserProfileSchema>;
export type CreateUserProfileWithAuthInput = z.input<
  typeof CreateUserProfileWithAuthSchema
>;
export type UpdateUserProfileInput = z.input<typeof UpdateUserProfileSchema>;
export type DeleteUserProfileInput = z.input<typeof DeleteUserProfileSchema>;
export type GetUserProfileByEmailInput = z.input<
  typeof GetUserProfileByEmailSchema
>;

// OUTPUT TYPES
export type UserProfileDTO = z.output<typeof UserProfileDTOSchema>;
