-- Sharma Aluminium Master — initial schema.
-- Apply in Supabase SQL Editor or via Supabase CLI. Review policies before production.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  display_name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true);
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  cover_image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null check (locale in ('en','hi','pa')),
  title text not null,
  description text not null default '',
  unique (category_id, locale)
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories(id) on delete set null,
  cover_image_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  premium boolean not null default false,
  published boolean not null default false,
  allow_download boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.project_translations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  locale text not null check (locale in ('en','hi','pa')),
  title text not null,
  description text not null default '',
  unique (project_id, locale)
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  secure_url text,
  public_id text,
  resource_type text not null default 'image' check (resource_type in ('image','video','raw')),
  format text,
  width integer,
  height integer,
  duration numeric,
  title text,
  description text,
  alt_text text,
  is_private boolean not null default false,
  allow_download boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  position integer not null default 0,
  is_cover boolean not null default false,
  unique (project_id, media_asset_id)
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'quote' check (type in ('quote','project','general','ai_escalation','callback','site_visit')),
  name text not null,
  phone text not null,
  email text,
  service text,
  message text not null default '',
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone','whatsapp','email')),
  status text not null default 'new' check (status in ('new','contacted','visit_scheduled','quoted','won','closed','spam')),
  locale text not null default 'en' check (locale in ('en','hi','pa')),
  project_slug text,
  follow_up_at timestamptz,
  admin_notes text,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.enquiry_projects (
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  primary key (enquiry_id, project_id)
);
create table if not exists public.site_visit_requests (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries(id) on delete set null,
  preferred_date date,
  preferred_time text,
  address text not null,
  area text,
  requirement text,
  status text not null default 'new' check (status in ('new','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries(id) on delete set null,
  preferred_time text,
  status text not null default 'new' check (status in ('new','called','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  session_key text not null unique,
  status text not null default 'open' check (status in ('open','escalated','closed')),
  locale text not null default 'en' check (locale in ('en','hi','pa')),
  customer_name text,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  needs_human boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.business_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_idx on public.projects(published, featured, premium);
create index if not exists projects_category_idx on public.projects(category_id);
create index if not exists project_media_order_idx on public.project_media(project_id, position);
create index if not exists enquiries_status_idx on public.enquiries(status, created_at desc);
create index if not exists site_visits_status_idx on public.site_visit_requests(status, created_at desc);
create index if not exists callbacks_status_idx on public.callback_requests(status, created_at desc);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id, created_at);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['categories','projects','enquiries','site_visit_requests','callback_requests','ai_conversations','business_settings'] LOOP
    EXECUTE format('drop trigger if exists set_updated_at on public.%I', t);
    EXECUTE format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  END LOOP;
END $$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.media_assets enable row level security;
alter table public.project_media enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_projects enable row level security;
alter table public.site_visit_requests enable row level security;
alter table public.callback_requests enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.business_settings enable row level security;

-- Admin allow decision comes from admin_users; being signed in alone grants no admin permission.
drop policy if exists "admin users can read own row" on public.admin_users;
drop policy if exists "admin users can read own row" on public.admin_users;
create policy "admin users can read own row" on public.admin_users for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admins manage admin users" on public.admin_users;
create policy "admins manage admin users" on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads active categories" on public.categories;
create policy "public reads active categories" on public.categories for select to anon, authenticated using (active = true or public.is_admin());
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads category translations" on public.category_translations;
create policy "public reads category translations" on public.category_translations for select to anon, authenticated using (exists (select 1 from public.categories c where c.id = category_id and (c.active = true or public.is_admin())));
drop policy if exists "admins manage category translations" on public.category_translations;
create policy "admins manage category translations" on public.category_translations for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects" on public.projects for select to anon, authenticated using (published = true or public.is_admin());
drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads published project translations" on public.project_translations;
create policy "public reads published project translations" on public.project_translations for select to anon, authenticated using (exists (select 1 from public.projects p where p.id = project_id and (p.published = true or public.is_admin())));
drop policy if exists "admins manage project translations" on public.project_translations;
create policy "admins manage project translations" on public.project_translations for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads linked public media" on public.media_assets;
create policy "public reads linked public media" on public.media_assets for select to anon, authenticated using (is_private = false and exists (select 1 from public.project_media pm join public.projects p on p.id = pm.project_id where pm.media_asset_id = media_assets.id and p.published = true) or public.is_admin());
drop policy if exists "admins manage media assets" on public.media_assets;
create policy "admins manage media assets" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads published project media" on public.project_media;
create policy "public reads published project media" on public.project_media for select to anon, authenticated using (exists (select 1 from public.projects p where p.id = project_id and (p.published = true or public.is_admin())));
drop policy if exists "admins manage project media" on public.project_media;
create policy "admins manage project media" on public.project_media for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Form submissions are written through a validated server route using the server-only service role key.
-- No public SELECT policies are defined for customer records.
drop policy if exists "admins manage enquiries" on public.enquiries;
create policy "admins manage enquiries" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage enquiry projects" on public.enquiry_projects;
create policy "admins manage enquiry projects" on public.enquiry_projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage site visits" on public.site_visit_requests;
create policy "admins manage site visits" on public.site_visit_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage callbacks" on public.callback_requests;
create policy "admins manage callbacks" on public.callback_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage ai conversations" on public.ai_conversations;
create policy "admins manage ai conversations" on public.ai_conversations for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage ai messages" on public.ai_messages;
create policy "admins manage ai messages" on public.ai_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads basic business settings" on public.business_settings;
create policy "public reads basic business settings" on public.business_settings for select to anon, authenticated using (key in ('public_contact','public_location') or public.is_admin());
drop policy if exists "admins manage business settings" on public.business_settings;
create policy "admins manage business settings" on public.business_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.categories, public.category_translations, public.projects, public.project_translations, public.media_assets, public.project_media, public.business_settings to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Initial configurable categories; the owner can rename/reorder/hide them in the admin dashboard.
insert into public.categories (slug, sort_order, active) values
  ('kitchens-cabinetry', 10, true),
  ('cupboards-almirahs', 20, true),
  ('doors', 30, true),
  ('windows', 40, true),
  ('sheets-panels', 50, true),
  ('commercial-interiors', 60, true),
  ('racks-storage', 70, true),
  ('gates-grills-fabrication', 80, true),
  ('glass-partitions', 90, true),
  ('premium-collection', 100, true)
on conflict (slug) do update set sort_order = excluded.sort_order;

with seed(slug, locale, title, description) as (values
 ('kitchens-cabinetry','en','Kitchens & cabinetry','Aluminium kitchens, cupboards, cabinetry and storage layouts.'),
 ('kitchens-cabinetry','hi','किचन और कैबिनेट','एल्युमिनियम किचन, कपबर्ड, कैबिनेट और स्टोरेज लेआउट।'),
 ('kitchens-cabinetry','pa','ਕਿਚਨ ਅਤੇ ਕੈਬਿਨੇਟ','ਐਲੂਮੀਨੀਅਮ ਕਿਚਨ, ਕਬੱਡ, ਕੈਬਿਨੇਟ ਅਤੇ ਸਟੋਰੇਜ ਲੇਆਉਟ।'),
 ('cupboards-almirahs','en','Cupboards & almirahs','Custom cupboards, almirahs and practical storage options.'),
 ('cupboards-almirahs','hi','कपबर्ड और अलमारी','कस्टम कपबर्ड, अलमारी और उपयोगी स्टोरेज विकल्प।'),
 ('cupboards-almirahs','pa','ਕਬੱਡ ਅਤੇ ਅਲਮਾਰੀਆਂ','ਕਸਟਮ ਕਬੱਡ, ਅਲਮਾਰੀਆਂ ਅਤੇ ਵਰਤੋਂਯੋਗ ਸਟੋਰੇਜ ਵਿਕਲਪ।'),
 ('doors','en','Aluminium doors','Doors and frames for residential and commercial spaces.'),
 ('doors','hi','एल्युमिनियम दरवाज़े','घर और व्यावसायिक जगहों के लिए दरवाज़े और फ्रेम।'),
 ('doors','pa','ਐਲੂਮੀਨੀਅਮ ਦਰਵਾਜ਼ੇ','ਘਰ ਅਤੇ ਵਪਾਰਕ ਥਾਵਾਂ ਲਈ ਦਰਵਾਜ਼ੇ ਅਤੇ ਫਰੇਮ।'),
 ('windows','en','Windows & frames','Window and frame-system ideas for homes and workplaces.'),
 ('windows','hi','खिड़कियाँ और फ्रेम','घर और कार्यस्थल के लिए खिड़कियाँ और फ्रेम।'),
 ('windows','pa','ਖਿੜਕੀਆਂ ਅਤੇ ਫਰੇਮ','ਘਰ ਅਤੇ ਕੰਮਕਾਜ ਵਾਲੀਆਂ ਥਾਵਾਂ ਲਈ ਖਿੜਕੀਆਂ ਅਤੇ ਫਰੇਮ।'),
 ('sheets-panels','en','Sheets & panels','Aluminium sheets, panel finishes and surface inspiration.'),
 ('sheets-panels','hi','शीट और पैनल','एल्युमिनियम शीट, पैनल फिनिश और सतह के विचार।'),
 ('sheets-panels','pa','ਸ਼ੀਟ ਅਤੇ ਪੈਨਲ','ਐਲੂਮੀਨੀਅਮ ਸ਼ੀਟਾਂ, ਪੈਨਲ ਫਿਨਿਸ਼ ਅਤੇ ਸਤਹ ਦੇ ਵਿਚਾਰ।'),
 ('commercial-interiors','en','Office & commercial interiors','Office fittings, partitions, counters and commercial interior work.'),
 ('commercial-interiors','hi','ऑफिस और कमर्शियल इंटीरियर','ऑफिस फिटिंग, पार्टिशन, काउंटर और व्यावसायिक इंटीरियर।'),
 ('commercial-interiors','pa','ਦਫ਼ਤਰ ਅਤੇ ਕਮਰਸ਼ੀਅਲ ਇੰਟੀਰੀਅਰ','ਦਫ਼ਤਰੀ ਫਿਟਿੰਗ, ਪਾਰਟੀਸ਼ਨ, ਕਾਊਂਟਰ ਅਤੇ ਵਪਾਰਕ ਇੰਟੀਰੀਅਰ।'),
 ('racks-storage','en','Racks & storage','Storage systems for homes, shops and practical work areas.'),
 ('racks-storage','hi','रैक और स्टोरेज','घर, दुकान और कार्यस्थल के लिए स्टोरेज सिस्टम।'),
 ('racks-storage','pa','ਰੈਕ ਅਤੇ ਸਟੋਰੇਜ','ਘਰ, ਦੁਕਾਨ ਅਤੇ ਕੰਮ ਵਾਲੀ ਥਾਂ ਲਈ ਸਟੋਰੇਜ ਸਿਸਟਮ।'),
 ('gates-grills-fabrication','en','Gates, grills & fabrication','Custom gate, grill and fabrication requirements.'),
 ('gates-grills-fabrication','hi','गेट, ग्रिल और फैब्रिकेशन','कस्टम गेट, ग्रिल और फैब्रिकेशन की ज़रूरतें।'),
 ('gates-grills-fabrication','pa','ਗੇਟ, ਗ੍ਰਿੱਲ ਅਤੇ ਫੈਬ੍ਰਿਕੇਸ਼ਨ','ਕਸਟਮ ਗੇਟ, ਗ੍ਰਿੱਲ ਅਤੇ ਫੈਬ੍ਰਿਕੇਸ਼ਨ ਦੀਆਂ ਲੋੜਾਂ।'),
 ('glass-partitions','en','Glass work & partitions','Glass partitions and glass + aluminium combinations.'),
 ('glass-partitions','hi','ग्लास वर्क और पार्टिशन','ग्लास पार्टिशन और ग्लास + एल्युमिनियम संयोजन।'),
 ('glass-partitions','pa','ਕੱਚ ਦਾ ਕੰਮ ਅਤੇ ਪਾਰਟੀਸ਼ਨ','ਕੱਚ ਦੀਆਂ ਪਾਰਟੀਸ਼ਨਾਂ ਅਤੇ ਕੱਚ + ਐਲੂਮੀਨੀਅਮ ਦੇ ਜੋੜ।'),
 ('premium-collection','en','Premium collection','Profile lighting, premium glass, aluminium combinations and refined interiors.'),
 ('premium-collection','hi','प्रीमियम कलेक्शन','प्रोफाइल लाइटिंग, प्रीमियम ग्लास, एल्युमिनियम संयोजन और इंटीरियर।'),
 ('premium-collection','pa','ਪ੍ਰੀਮੀਅਮ ਕਲੈਕਸ਼ਨ','ਪ੍ਰੋਫਾਈਲ ਲਾਈਟਿੰਗ, ਪ੍ਰੀਮੀਅਮ ਕੱਚ, ਐਲੂਮੀਨੀਅਮ ਦੇ ਜੋੜ ਅਤੇ ਇੰਟੀਰੀਅਰ।')
)
insert into public.category_translations (category_id, locale, title, description)
select c.id, seed.locale, seed.title, seed.description from seed join public.categories c on c.slug = seed.slug
on conflict (category_id, locale) do update set title = excluded.title, description = excluded.description;
