export function getSupabasePublicConfig(): {
  url: string;
  key: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase public configuration. Check your .env.local file."
    );
  }

  return { url, key };
}

export function hasSupabasePublicConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(url && key);
}

export function getServiceRoleKey(): string | null {
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    console.error(
      "Missing server-side Supabase secret. Check your .env.local file."
    );
    return null;
  }

  if (
    key.startsWith("sb_publishable_") ||
    key.startsWith("sbp_")
  ) {
    console.error(
      "Invalid server key: a publishable key cannot be used as the server secret."
    );
    return null;
  }

  return key;
}