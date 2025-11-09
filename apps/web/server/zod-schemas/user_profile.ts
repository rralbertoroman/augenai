import { z } from "zod";

export const CreateUserProfileSchema = z.object({
  id: z.uuid(), // ID from Supabase auth.users
  email: z.email(),
  name: z.string().min(1).max(255),
  role: z.string().max(50).default("doctor"), // Expected values: "admin", "doctor", "patient"
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

export const GetUserProfilesByRoleSchema = z.object({
  role: z.string().max(50), // Expected values: "admin", "doctor", "patient"
});

// INPUT TYPES
export type CreateUserProfileInput = z.input<typeof CreateUserProfileSchema>;
export type UpdateUserProfileInput = z.input<typeof UpdateUserProfileSchema>;
export type DeleteUserProfileInput = z.input<typeof DeleteUserProfileSchema>;
export type GetUserProfileByEmailInput = z.input<
  typeof GetUserProfileByEmailSchema
>;
export type GetUserProfilesByRoleInput = z.input<
  typeof GetUserProfilesByRoleSchema
>;

// OUTPUT TYPES
export type UserProfileDTO = z.output<typeof UserProfileDTOSchema>;
