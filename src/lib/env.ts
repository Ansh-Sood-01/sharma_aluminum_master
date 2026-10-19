/**
 * Non-throwing integration checks for local development and preview deploys.
 * Provider setup is considered complete only when the required values exist.
 * Do not use these checks as an authorization mechanism.
 */
function hasValue(value: string | undefined): value is string {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  const lowered = normalized.toLowerCase();
  if (lowered.startsWith("replace_with_") || lowered.startsWith("your_") || lowered.startsWith("your-")) return false;
  if (lowered.includes("your-project") || lowered.includes("your_project_ref")) return false;
  if (lowered === "example" || lowered.includes("<your") || lowered.includes("change_me")) return false;
  return true;
}

function isConfiguredEmail(value: string | undefined): boolean {
  if (!hasValue(value)) return false;
  const normalized = value.toLowerCase();
  return !normalized.endsWith("@example.com") && !normalized.endsWith("@your-domain.example");
}

export const integrationStatus = {
  supabase: Boolean(
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  ),
  cloudinary: Boolean(
    hasValue(process.env.CLOUDINARY_CLOUD_NAME) &&
      hasValue(process.env.CLOUDINARY_API_KEY) &&
      hasValue(process.env.CLOUDINARY_API_SECRET),
  ),
  ai: Boolean(
    hasValue(process.env.AI_MODEL) &&
      hasValue(process.env.AI_API_KEY),
  ),
  email: Boolean(
    hasValue(process.env.RESEND_API_KEY) &&
      isConfiguredEmail(process.env.RESEND_FROM_EMAIL) &&
      isConfiguredEmail(process.env.ADMIN_NOTIFICATION_EMAIL),
  ),
} as const;

/** Return a safe site origin, even when a malformed local env value is set. */
export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): URL {
  if (hasValue(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:" || parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return parsed;
      }
    } catch {
      // Fall through to a safe local default. Provider route handlers should
      // validate their own mandatory configuration before making requests.
    }
  }

  return new URL("http://localhost:3000");
}

/**
 * This allowlist reader is intentionally only a configuration helper.
 * Admin authorization must still be checked on the server for every action
 * and mirrored by database Row Level Security policies.
 */
export function getAdminEmailAllowlist(value = process.env.ADMIN_EMAILS): string[] {
  if (!hasValue(value)) return [];

  return [...new Set(value.split(",").map((email) => email.trim().toLowerCase()).filter(isConfiguredEmail))];
}
