# Private administration

`AdminDashboard.tsx` lets an authorized user create/update/publish portfolio projects, attach Cloudinary assets, edit localized category copy, review enquiries, update visit/callback status, review saved customer-care conversations and check integration setup guidance.

Access is enforced by `getAdminUser()` on protected server routes/pages and by Supabase RLS. Signing in through Supabase Auth alone does not make an account an administrator; it must also have an active row in `public.admin_users`.
