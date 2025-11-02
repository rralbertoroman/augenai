import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is not set in environment variables");
}

export const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
