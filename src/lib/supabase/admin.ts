import { createSupabaseServerClient } from "./server";

export type AdminUser = { id: string; email: string | null; fullName: string | null };

/** Server-side allow decision is backed by the admin_users table and RLS. */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id, active")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    if (error || !data) return null;
    return { id: user.id, email: user.email ?? null, fullName: user.user_metadata?.full_name ?? null };
  } catch {
    return null;
  }
}
