import { SUPABASE_DB_URL } from "@/server/constants";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schemas",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: SUPABASE_DB_URL,
  },
});
