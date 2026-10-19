# Database migrations

Apply SQL migrations from oldest to newest in Supabase SQL Editor or through the Supabase CLI. The current migration `202610190001_initial_schema.sql` creates the schema, enables Row Level Security, configures public/admin policies, and seeds ten gallery categories with English, Hindi and Punjabi translations.

Before running against a database that already has application tables, review the `create table if not exists` statements and policies for compatibility with the existing schema. After applying the migration, create the intended owner in **Supabase Authentication → Users**, then insert that user's UUID into `public.admin_users`. Signing in without an active admin row must not grant dashboard access.

The public website's quote forms and chat persistence use a server-only `SUPABASE_SERVICE_ROLE_KEY`. Put the `sb_secret_...` key (or legacy `service_role` key) in that variable. Keep it out of client-side code and public environment variables. The key bypasses RLS, so public API routes validate user input before writing and must remain monitored for abuse. RLS still protects normal browser/API access through the publishable/anon public key.
