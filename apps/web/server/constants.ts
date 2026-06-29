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

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is not set in environment variables");
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

if (!process.env.SMTP_HOST) {
  throw new Error("SMTP_HOST is not set in environment variables");
}

if (!process.env.SMTP_PORT) {
  throw new Error("SMTP_PORT is not set in environment variables");
}

if (!process.env.SMTP_USER) {
  throw new Error("SMTP_USER is not set in environment variables");
}

if (!process.env.SMTP_PASS) {
  throw new Error("SMTP_PASS is not set in environment variables");
}

if (!process.env.EMAIL_FROM) {
  throw new Error("EMAIL_FROM is not set in environment variables");
}

if (!process.env.CONTACT_EMAIL) {
  throw new Error("CONTACT_EMAIL is not set in environment variables");
}

export const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
export const AI_PREDICTION_SERVICE_URL = process.env.AI_PREDICTION_SERVICE_URL;
export const AI_PREDICTION_SERVICE_SECRET_KEY =
  process.env.AI_PREDICTION_SERVICE_SECRET_KEY;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = Number(process.env.SMTP_PORT);
// SMTP_SECURE is optional; defaults to true only for the implicit-TLS port 465.
export const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
export const ENVIRONMENT = process.env.ENVIRONMENT;
