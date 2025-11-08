import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is not set in environment variables");
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

export const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
export const AI_PREDICTION_SERVICE_URL = process.env.AI_PREDICTION_SERVICE_URL;
export const AI_PREDICTION_SERVICE_SECRET_KEY =
  process.env.AI_PREDICTION_SERVICE_SECRET_KEY;
