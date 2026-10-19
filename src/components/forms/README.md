# Lead and quote forms

`LeadForm.tsx` supports regular quotation/general enquiries, callbacks and measurement/site visits. It posts to `/api/enquiries`, where Zod validates inputs, a hidden honeypot and best-effort process-local rate limiter reduce simple bot traffic, Supabase stores submissions with the server-only key, and Resend can optionally email the team.
