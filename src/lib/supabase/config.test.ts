import { afterEach, describe, expect, it, vi } from "vitest";
import { getServiceRoleKey, getSupabasePublicConfig, hasSupabasePublicConfig } from "./config";

afterEach(() => vi.unstubAllEnvs());

describe("Supabase environment guards", () => {
  it("does not accept copied example placeholders as real credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://YOUR_PROJECT_REF.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(hasSupabasePublicConfig()).toBe(false);
    expect(getServiceRoleKey()).toBeNull();
    expect(() => getSupabasePublicConfig()).toThrow(/real project URL/i);
  });

  it("accepts actual-looking project values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcdefghijklmnopqrst.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_example-public-key-value");
    expect(hasSupabasePublicConfig()).toBe(true);
    expect(getSupabasePublicConfig().url).toBe("https://abcdefghijklmnopqrst.supabase.co");
  });
});
