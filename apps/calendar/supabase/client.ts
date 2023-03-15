import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!url) {
  throw new Error("There is no Supabase URL environment variable.");
}

const key =
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!key) {
  throw new Error("There is no Supabase key environment variable.");
}

export const supabaseClient = createClient(url, key);
