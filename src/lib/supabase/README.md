# Supabase clients and session handling

- `browser.ts` creates the cookie-backed browser client for administrator sign-in and authorized dashboard operations.
- `server.ts` creates a request-scoped server client that reads and updates Supabase Auth cookies.
- `proxy.ts` refreshes admin-session cookies for `/admin/*` and `/api/admin/*` requests in Next.js 16.
- `service.ts` creates a server-only elevated client used by validated public enquiry/chat writes. Never import it in client components.
- `config.ts` rejects example placeholder credentials.

Server authorization (`getAdminUser`) and PostgreSQL Row Level Security are separate boundaries. The proxy is for session refresh, not the source of authorization.
