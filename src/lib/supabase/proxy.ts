import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig, hasSupabasePublicConfig } from "./config";

/**
 * Refresh the Supabase Auth cookie for protected workspace requests.
 * Authorization is still checked by getAdminUser() and database RLS; this
 * proxy only keeps the cookie session current and is not an access-control gate.
 */
export async function refreshAdminSession(request: NextRequest) {
  if (!hasSupabasePublicConfig()) return NextResponse.next({ request });

  const { url, key } = getSupabasePublicConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Make refreshed cookies available to any downstream server code in
        // this same request, then send the same cookies back to the browser.
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    // getClaims verifies tokens and refreshes the session when needed.
    await supabase.auth.getClaims();
  } catch {
    // Do not turn temporary Auth-provider outages into a site-wide 500.
    // Protected server routes still reject unverified or missing sessions.
  }

  return response;
}
