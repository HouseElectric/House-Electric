-- House Electric — Supabase schema
-- Run once (this script also gets applied automatically by the setup script).

create extension if not exists pgcrypto;

-- ============ enquiries (booking / amc / corporate forms) ============
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'booking' check (type in ('booking','amc','corporate')),
  name text,
  company text,
  contact_person text,
  mobile text,
  email text,
  location text,
  address text,
  property_type text,
  area text,
  service text,
  requirement text,
  message text,
  system_details text,
  preferred_date text,
  preferred_time text,
  contact_time text,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries" on public.enquiries
  for insert with check (true);

drop policy if exists "Authenticated can read enquiries" on public.enquiries;
create policy "Authenticated can read enquiries" on public.enquiries
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update enquiries" on public.enquiries;
create policy "Authenticated can update enquiries" on public.enquiries
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete enquiries" on public.enquiries;
create policy "Authenticated can delete enquiries" on public.enquiries
  for delete using (auth.role() = 'authenticated');

-- ============ blog_posts ============
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  cover_image_alt text,
  category text,
  tags text[] not null default '{}',
  author text not null default 'House Electric Team',
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published posts" on public.blog_posts;
create policy "Public can read published posts" on public.blog_posts
  for select using (status = 'published');

drop policy if exists "Authenticated full access on posts" on public.blog_posts;
create policy "Authenticated full access on posts" on public.blog_posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ testimonials ============
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  text text not null,
  rating int not null default 5,
  avatar_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials" on public.testimonials
  for select using (published = true);

drop policy if exists "Authenticated full access on testimonials" on public.testimonials;
create policy "Authenticated full access on testimonials" on public.testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ projects (work gallery) ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects" on public.projects
  for select using (true);

drop policy if exists "Authenticated full access on projects" on public.projects;
create policy "Authenticated full access on projects" on public.projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ site_settings (key-value JSON store, e.g. contact info) ============
create table if not exists public.site_settings (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings
  for select using (true);

drop policy if exists "Authenticated full access on settings" on public.site_settings;
create policy "Authenticated full access on settings" on public.site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ services (services grid + pricing, admin-manageable) ============
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_label text,
  icon_key text not null default 'bolt',
  image_url text,
  href text not null default '/contact',
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services
  for select using (active = true);

drop policy if exists "Authenticated full access on services" on public.services;
create policy "Authenticated full access on services" on public.services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ service_areas ============
create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.service_areas enable row level security;

drop policy if exists "Public can read service areas" on public.service_areas;
create policy "Public can read service areas" on public.service_areas
  for select using (true);

drop policy if exists "Authenticated full access on service areas" on public.service_areas;
create policy "Authenticated full access on service areas" on public.service_areas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ services: slug + checklist for auto-generated detail pages ============
alter table public.services add column if not exists slug text;
alter table public.services add column if not exists checklist_items text[] not null default '{}';
alter table public.services add column if not exists subtitle text;
create unique index if not exists services_slug_key on public.services (slug) where slug is not null;

-- ============ services: per-service hero eyebrow, CTA buttons & booking text ============
alter table public.services add column if not exists hero_eyebrow text not null default 'Our Services';
alter table public.services add column if not exists primary_cta_label text not null default 'Book This Service';
alter table public.services add column if not exists primary_cta_href text not null default '#booking';
alter table public.services add column if not exists secondary_cta_label text not null default 'Get a Quote';
alter table public.services add column if not exists secondary_cta_href text not null default '/contact';
alter table public.services add column if not exists booking_subtitle text not null default 'Fill in your details and our team will confirm your booking shortly.';
