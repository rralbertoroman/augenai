import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is not set in environment variables");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is not set in environment variables",
  );
}

if (!process.env.SUPABASE_MASTER_API_KEY) {
  throw new Error(
    "SUPABASE_MASTER_API_KEY is not set in environment variables",
  );
}

if (!process.env.AI_PREDICTION_SERVICE_URL) {
  throw new Error(
    "AI_PREDICTION_SERVICE_URL is not set in environment variables",
  );
}

if (!process.env.AI_PREDICTION_SERVICE_SECRET_KEY) {
  throw new Error(
    "AI_PREDICTION_SERVICE_SECRET_KEY is not set in environment variables",
  );
}

if (!process.env.SUPABASE_JWT_JWK) {
  throw new Error("SUPABASE_JWT_JWK is not set in environment variables");
}

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

if (!process.env.RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not set in environment variables");
}

export const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_MASTER_API_KEY;
export const SUPABASE_JWT_JWK = process.env.SUPABASE_JWT_JWK;
export const AI_PREDICTION_SERVICE_URL = process.env.AI_PREDICTION_SERVICE_URL;
export const AI_PREDICTION_SERVICE_SECRET_KEY =
  process.env.AI_PREDICTION_SERVICE_SECRET_KEY;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
export const ENVIRONMENT = process.env.ENVIRONMENT;
