// Shared error types used across the application

export interface SupabaseError {
  code?: string;
  message?: string;
  weak_password?: { reasons?: string[] };
}
