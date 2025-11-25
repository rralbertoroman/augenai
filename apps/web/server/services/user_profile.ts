"use server";

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { UserProfilesTable } from "../db/schemas";
import { getCurrentUser, verifyOwnership } from "../auth";
import {
  CreateUserProfileSchema,
  CreateUserProfileWithAuthSchema,
  DeleteUserProfileSchema,
  UpdateUserProfileSchema,
  GetUserProfileByEmailSchema,
  type CreateUserProfileInput,
  type CreateUserProfileWithAuthInput,
  type DeleteUserProfileInput,
  type UpdateUserProfileInput,
  type GetUserProfileByEmailInput,
  type UserProfileDTO,
} from "../zod-schemas/user_profile";

export const createUserProfile = async (
  token: string,
  data: CreateUserProfileInput,
): Promise<UserProfileDTO> => {
  // Get authenticated user from JWT
  const currentUser = await getCurrentUser(token);

  // Check if profile already exists
  const existing = await getUserProfileById(currentUser.userId);
  if (existing) {
    return existing;
  }

  // Validate input data
  const validatedData = CreateUserProfileSchema.parse(data);

  // Merge JWT data with provided data
  const completeData: CreateUserProfileWithAuthInput = {
    id: currentUser.userId,
    email: currentUser.email,
    ...validatedData,
  };

  // Validate complete data
  const payload = CreateUserProfileWithAuthSchema.parse(completeData);

  const [userProfile] = await db
    .insert(UserProfilesTable)
    .values(payload)
    .returning();

  if (!userProfile) {
    throw new Error("Error creating the user profile");
  }

  return userProfile;
};

export const getUserProfileById = async (
  id: string,
): Promise<UserProfileDTO | null> => {
  const [userProfile] = await db
    .select()
    .from(UserProfilesTable)
    .where(eq(UserProfilesTable.id, id));

  if (!userProfile) {
    return null;
  }

  return userProfile;
};

export const getUserProfileByEmail = async (
  data: GetUserProfileByEmailInput,
): Promise<UserProfileDTO | null> => {
  const { email } = GetUserProfileByEmailSchema.parse(data);

  const [userProfile] = await db
    .select()
    .from(UserProfilesTable)
    .where(eq(UserProfilesTable.email, email));

  if (!userProfile) {
    return null;
  }

  return userProfile;
};

export const updateUserProfile = async (
  token: string,
  id: string,
  data: UpdateUserProfileInput,
): Promise<UserProfileDTO> => {
  // Get authenticated user and verify ownership
  const currentUser = await getCurrentUser(token);
  verifyOwnership(currentUser, id);

  const payload = UpdateUserProfileSchema.parse(data);

  const [userProfile] = await db
    .update(UserProfilesTable)
    .set(payload)
    .where(eq(UserProfilesTable.id, id))
    .returning();

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  return userProfile;
};

export const deleteUserProfile = async (
  token: string,
  data: DeleteUserProfileInput,
): Promise<boolean> => {
  const { id } = DeleteUserProfileSchema.parse(data);

  // Get authenticated user and verify ownership
  const currentUser = await getCurrentUser(token);
  verifyOwnership(currentUser, id);

  const deleted = await db
    .delete(UserProfilesTable)
    .where(eq(UserProfilesTable.id, id))
    .returning({ id: UserProfilesTable.id });

  return deleted.length > 0;
};

export const addSupervisor = async (
  token: string,
  supervisorId: string,
): Promise<UserProfileDTO> => {
  const currentUser = await getCurrentUser(token);

  // Prevent user from setting themselves as supervisor
  if (currentUser.userId === supervisorId) {
    throw new Error("Cannot set yourself as your own supervisor");
  }

  // Verify supervisor exists and has the correct role
  const supervisor = await getUserProfileById(supervisorId);
  if (!supervisor) {
    throw new Error("Supervisor not found");
  }

  if (supervisor.role !== "supervisor") {
    throw new Error("User is not a supervisor");
  }

  // Update current user's profile
  const [updatedProfile] = await db
    .update(UserProfilesTable)
    .set({ supervisorId })
    .where(eq(UserProfilesTable.id, currentUser.userId))
    .returning();

  if (!updatedProfile) {
    throw new Error("Error adding supervisor");
  }

  return updatedProfile;
};
