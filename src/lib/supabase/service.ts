import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey } from "./config";

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getServiceRoleKey();

  if (!url || !key) {
    console.error(
      "Supabase service client could not be created. Check your environment variables."
    );
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}