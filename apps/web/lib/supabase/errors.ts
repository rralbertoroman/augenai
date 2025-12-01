/**
 * Supabase Error Types
 * Defines TypeScript interfaces for Supabase API error responses
 */

export interface SupabaseWeakPasswordError {
  code: string;
  message: string;
  weak_password?: {
    reasons?: string[];
  };
}
