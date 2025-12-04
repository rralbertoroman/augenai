import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schemas";
import { SUPABASE_DB_URL } from "../constants";

export const queryClient = postgres(SUPABASE_DB_URL, { prepare: false });
export const db = drizzle(queryClient, { schema });
