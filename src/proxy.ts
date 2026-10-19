import type { NextRequest } from "next/server";
import { refreshAdminSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return refreshAdminSession(request);
}

export const config = {
  // Public routes do not need an Auth session. Refresh cookies for every admin
  // page and admin API request, including the session check and media signing.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
