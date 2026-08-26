import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowser(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const url = SUPABASE_URL;
  const anonKey = SUPABASE_ANON_KEY;
  if (url === undefined || anonKey === undefined) {
    return null;
  }
  if (browserClient === null) {
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
