import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SECRET_KEY } from "../constants";

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
