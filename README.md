# Sharma Aluminium Master — Complete Website (v5)

A full Next.js application for the Sharma Aluminium Master aluminium fabrication business in Jalandhar, Punjab. This version combines the public portfolio website, category galleries, zoomable image/video viewer, quote and measurement-request forms, AI customer care with escalation, and an administrator dashboard for managing portfolio content and incoming customer requests.

> **Important:** The application code is included, but provider services still need to be connected using your own Supabase, Cloudinary, email, and optional AI credentials. Sample inspiration images are labelled as references; they are not presented as completed Sharma Aluminium Master projects. Replace them with the business's own photographs before launch.

## What is included

### Public website
- Premium responsive layout using the red/indigo business identity.
- Localized routes for English (`/en`), Hindi (`/hi`) and Punjabi (`/pa`).
- Homepage, About, Premium Collection, Contact, Privacy and Terms pages.
- Ten category galleries: kitchens/cabinetry, cupboards/almirahs, doors, windows/frames, sheets/panels, commercial interiors, racks/storage, gates/fabrication, glass/partitions, and premium collection.
- Responsive gallery grid with fullscreen viewer, previous/next controls, keyboard navigation, image zoom and pan, browser share support, and video playback.
- Published project detail pages for business-uploaded project photos and videos.
- Direct call, WhatsApp, email and Google Maps address-search links.

### Lead capture and customer care
- Quote/general enquiry form.
- Measurement/site-visit request form with preferred date, time and address.
- Callback request form.
- Server-side validation with Zod, honeypot field and user-facing success/error states.
- Optional Resend notification when a verified sender is configured.
- Floating customer-care chat in English, Hindi and Punjabi.
- A deterministic FAQ fallback works without an AI provider. An OpenAI-compatible chat-completions provider can be configured optionally.
- When an answer is uncertain, the chat directs customers to a callback form. Enquiries and chat conversations can be reviewed from the admin dashboard when database service configuration is complete.

### Private admin dashboard
- Email/password sign-in through Supabase Auth.
- Server-side admin gate backed by `public.admin_users`; signing in does **not** automatically make someone an administrator.
- Overview, projects/media, categories, enquiries, site visits/callbacks, chat conversations, and setup/security sections.
- Create/edit/publish/archive portfolio projects and categories, add English/Hindi/Punjabi titles and descriptions, attach photos/videos, and flag featured/premium projects.
- Cloudinary signed upload flow. The signing route requires admin authorization and keeps the API secret on the server.
- Enquiry and request status management.

### Backend and security baseline
- Supabase PostgreSQL schema with category/project translations, media relationships, customer requests, AI conversation history, settings and admin users.
- Row Level Security enabled on database tables. Public reads are limited to active categories and published portfolio content; customer records are not publicly readable.
- Server-only service-role key for validated public form writes and private chat-history persistence.
- `.env.local` excluded from Git by `.gitignore`.

## Technology stack

- Next.js App Router + TypeScript
- React
- Supabase Auth/Postgres/RLS
- Cloudinary for image/video storage
- Optional Resend for email notifications
- Optional OpenAI-compatible AI endpoint
- Tailwind CSS v4 baseline and custom responsive CSS
- Vitest for unit tests

## Requirements

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm
- A Supabase project
- A Cloudinary account for owner-managed media uploads
- Optional: Resend account with a verified sender domain and an AI-provider API key

## Local installation

1. Extract this ZIP into a normal working folder, for example `D:\sharma-aluminium-master-v5\sharma-aluminium-master`.
2. Open PowerShell in the folder containing `package.json`.
3. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Open `.env.local` in VS Code or Notepad and add the values you have. At minimum, use your own Supabase project URL and publishable/anon key:

   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SECRET_KEY
   ```

   In **Supabase → Settings → API Keys**, put the `sb_publishable_...` key (or the legacy `anon` key) in `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This variable name is retained by the project code for compatibility. Put the `sb_secret_...` key (or legacy `service_role` key) in `SUPABASE_SERVICE_ROLE_KEY`. That key bypasses Row Level Security, so keep it strictly server-side: never prefix it with `NEXT_PUBLIC_`, paste it into chat, or commit it to Git.

5. Install dependencies and start the development server:

   ```powershell
   npm install
   npm run dev
   ```

6. Open `http://localhost:3000`. The root redirects to `/en`. Directly test a category, for example `http://localhost:3000/en/gallery/windows`.

If install fails because npm temporarily cannot reach the registry, check your internet/DNS connection and run `npm install` again. Do not run `npm audit fix --force` blindly; it can replace major versions and introduce new conflicts.

## Supabase setup (required for admin and real form storage)

### 1. Apply the database migration

1. Open your Supabase project.
2. Go to **SQL Editor** and create a new query.
3. Copy the complete contents of `supabase/migrations/202610190001_initial_schema.sql` into the editor.
4. Run it once. It creates tables, indexes, updated-at triggers, Row Level Security policies, permissions and the ten default gallery categories/translations.

Apply the migration to the intended project only. Review SQL before running it if the project already contains tables with the same names.

### 2. Create the owner login

1. In Supabase, open **Authentication → Users**.
2. Add a user using the email address the owner will use to sign into the admin dashboard. Set a strong password and keep it private.
3. Copy that Auth user's **UUID**.
4. Return to **SQL Editor** and run the following after replacing `AUTH_USER_UUID` with the exact UUID:

   ```sql
   insert into public.admin_users (user_id, display_name, active)
   values ('AUTH_USER_UUID', 'Business Owner', true)
   on conflict (user_id) do update
   set active = true, display_name = excluded.display_name;
   ```

5. Open `http://localhost:3000/admin` and sign in with that Supabase Auth user's email/password. The server checks the `admin_users` table before displaying the dashboard.

**Do not expose the service-role secret in frontend code.** It belongs only in `.env.local` for local work and in Vercel's server-side environment variables for production.

### 3. Verify the database

After running the migration, the `categories` table should contain ten active categories and `category_translations` should contain English, Hindi and Punjabi rows for each category. The admin dashboard will initially have no projects or enquiries until you add some or the public forms receive requests. The included Next.js 16 `src/proxy.ts` refreshes the Supabase auth cookie on admin pages and admin API requests; authorization is still rechecked by the server and PostgreSQL RLS.

## Cloudinary setup (for image/video uploads)

1. Create or use a Cloudinary account.
2. Copy the cloud name and API key into the server variables in `.env.local`.
3. Add the API secret only to `CLOUDINARY_API_SECRET`; never use a `NEXT_PUBLIC_` prefix for it.
4. Keep `CLOUDINARY_FOLDER=sharma-aluminium-master` or choose another folder.
5. Sign in at `/admin`, open **Projects & media**, upload photographs/videos, give the project localized titles/descriptions, and publish it.

Supported file limits in the UI are 20 MB per image and 80 MB per video. Uploading a file to Cloudinary and saving its database record are separate operations; if the database save fails after upload, the file may remain in Cloudinary and need cleanup there.

## Optional email notifications

Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL`. The sender must be verified with Resend. If these variables are missing, requests can still be stored in Supabase but no email notification is sent. The API response never treats a failed provider notification as a successful email send.

## Optional AI customer care

To use an AI model, configure:

```env
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=YOUR_AI_PROVIDER_KEY
AI_MODEL=YOUR_SUPPORTED_MODEL_NAME
```

If your provider has a compatible `/chat/completions` endpoint, set `AI_BASE_URL` to that provider's API root. Use the provider's currently supported model identifier. The key and model call happen server-side only.

Without `AI_API_KEY` and `AI_MODEL`, a deterministic FAQ fallback answers common questions about services, contact details, location, and pricing process, and escalates unsupported questions toward a callback request. It will not invent a quote or opening hours. Test the AI behavior before making the website public.

## Optional maps and public URL

- Set `NEXT_PUBLIC_SITE_URL` to your production origin once deployed.
- Set `NEXT_PUBLIC_GOOGLE_MAPS_PLACE_URL` only after verifying that it opens the exact business listing. If unset, the website uses a Google Maps search for the supplied business address rather than making up coordinates.
- `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` is optional and is not required for the address/directions links.

## Testing and build checks

Run these from the project root:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Or run `npm run check` to run type-checking, lint and tests together. This package was syntax-checked during preparation, but a full dependency-backed Next.js build could not be run in the file-preparation environment. Run the commands above on your machine after `npm install` and fix any issues reported by your local dependency versions before deploying.

## Deploying to Vercel

1. Create a private GitHub repository and push this project, excluding `.env.local` and all secrets.
2. Import the repository into Vercel as a Next.js project.
3. In Vercel → Project Settings → Environment Variables, add the same values as needed from `.env.local`. Add secrets as server-only environment values and never put secret values under `NEXT_PUBLIC_` names.
4. Set `NEXT_PUBLIC_SITE_URL` to the final `https://...vercel.app` URL or your custom domain.
5. Ensure the Supabase Auth site's **Site URL** and allowed redirect URLs include your Vercel domain.
6. Apply the SQL migration and add the admin user to the production Supabase database.
7. Deploy. Test public forms, database storage, admin login, project upload, locale navigation, and mobile layout against the deployed site.

## Recommended launch checklist

- [ ] Replace every reference image in `src/config/gallery.ts` with the business's own real project images, or keep the sample-reference labels clearly visible.
- [ ] Apply the Supabase migration to the correct project and confirm the ten categories appear.
- [ ] Create the owner Auth user and add their UUID to `public.admin_users`.
- [ ] Set the Supabase public key and server-only service-role secret locally and in Vercel.
- [ ] Configure Cloudinary and test both image and video uploads.
- [ ] Configure and test AI only if desired; otherwise verify that fallback answers and callback escalation work.
- [ ] Configure and verify Resend sender if email notifications are wanted.
- [ ] Test all three locales, mobile/tablet/desktop layouts, all category links, lightbox keyboard controls and project detail links.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` without errors.
- [ ] Test spam handling. The included rate limiter is an in-process, best-effort safeguard; for multiple serverless instances or broad public promotion, add a managed/distributed rate limiter and consider CAPTCHA/Turnstile.
- [ ] Have the business owner review the privacy and terms pages against the services actually enabled and applicable law.

## Project structure

```text
src/app/
  [locale]/             English, Hindi and Punjabi public pages
  api/                  Enquiry, customer-care and admin-signature routes
  admin/                Sign-in and protected dashboard routes
src/proxy.ts            Supabase cookie refresh for admin routes
  sitemap.ts            SEO sitemap
  robots.ts             Robots rules
src/components/
  admin/                Project/category/request management and media upload
  chat/                 Customer-care chat widget
  forms/                Quote, callback and measurement-visit forms
  gallery/              Category gallery, fullscreen viewer and project cards
  layout/               Shared headers, footers and public page shell
src/config/             Business profile, gallery categories and locales
src/lib/                Supabase clients, environment and portfolio helpers
supabase/migrations/    Database schema, RLS, permissions and category seeds
```

## Business details in this project

- **Business:** Sharma Aluminium Master
- **Address:** Bharat Nagar Market, Bashirpura to Chaggitti Road, Jalandhar City, Punjab, India
- **Email:** sharmaaluminium.1970@gmail.com
- **Raj Kumar:** 99882-57900
- **Rohit:** 89680-93533
- **Mohit:** 94657-63088

These details come from the business information provided for this project. No specific opening hours, prices, warranties, certifications or customer reviews are asserted in the site copy.
