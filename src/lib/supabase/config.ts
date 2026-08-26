interface SupabaseEnvSnapshot {
  readonly url: string | undefined;
  readonly anonKey: string | undefined;
}

let snapshot: SupabaseEnvSnapshot | null = null;

function readSupabaseEnv(): SupabaseEnvSnapshot {
  if (snapshot !== null) {
    return snapshot;
  }
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  snapshot = {
    url: rawUrl.length > 0 ? rawUrl : undefined,
    anonKey: rawKey.length > 0 ? rawKey : undefined,
  };
  return snapshot;
}

const initialEnv = readSupabaseEnv();

export const SUPABASE_URL: string | undefined = initialEnv.url;
export const SUPABASE_ANON_KEY: string | undefined = initialEnv.anonKey;

export function isSupabaseConfigured(): boolean {
  const env = readSupabaseEnv();
  return (
    env.url !== undefined &&
    env.anonKey !== undefined &&
    env.url.startsWith("https://")
  );
}
