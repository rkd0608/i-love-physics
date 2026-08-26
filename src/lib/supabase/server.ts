import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database.types";

export { isSupabaseConfigured } from "./config";

export async function getSupabaseServer(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const url = SUPABASE_URL;
  const anonKey = SUPABASE_ANON_KEY;
  if (url === undefined || anonKey === undefined) {
    return null;
  }
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {}
      },
    },
  });
}

export async function getSessionUser(): Promise<{
  id: string;
  email?: string;
} | null> {
  const supabase = await getSupabaseServer();
  if (supabase === null) {
    return null;
  }
  const { data, error } = await supabase.auth.getUser();
  if (error !== null || data.user === null) {
    return null;
  }
  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
  };
}
