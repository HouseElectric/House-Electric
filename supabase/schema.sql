-- House Electric — Supabase schema
-- Run once (this script also gets applied automatically by the setup script).

create extension if not exists pgcrypto;

-- ============ profiles: customer/admin/technician account profile (extends auth.users) ============
-- NOTE: this table, is_admin(), and every table below down to before_after_photos already exist
-- in the live database (created directly via the Supabase dashboard during earlier iterations)
-- but were never captured in this file. Added here so a fresh environment can be provisioned
-- from this script alone; `if not exists`/`create or replace` make it a no-op against the
-- existing live database.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  mobile text,
  address text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  property_type text,
  property_size text,
  electrical_setup_notes text,
  city text,
  state text,
  avatar_url text
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable security definer
set search_path to 'public'
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or is_admin());

-- ============ otp_codes: email OTP verification (signup + password reset) ============
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  purpose text not null check (purpose in ('signup','reset')),
  payload jsonb,
  attempts integer not null default 0,
  verified boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.otp_codes enable row level security;
-- No client-facing policies: only the service-role key (server-side OTP routes) touches this table.

-- ============ technicians ============
create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  specialization text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.technicians enable row level security;

drop policy if exists "Admin manages technicians" on public.technicians;
create policy "Admin manages technicians" on public.technicians
  for all using (is_admin()) with check (is_admin());

-- ============ amc_plans: Residential/Commercial/Corporate AMC plan catalog (admin-managed pricing) ============
create table if not exists public.amc_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('residential','office','commercial','corporate')),
  price_label text,
  duration_label text not null default 'Per Year',
  coverage jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  price numeric,
  duration_months integer not null default 12,
  visit_frequency text not null default 'quarterly' check (visit_frequency in ('monthly','quarterly','half_yearly','yearly'))
);

alter table public.amc_plans enable row level security;

drop policy if exists "Admin manages amc plans" on public.amc_plans;
create policy "Admin manages amc plans" on public.amc_plans
  for all using (is_admin()) with check (is_admin());

drop policy if exists "Public can view active amc plans" on public.amc_plans;
create policy "Public can view active amc plans" on public.amc_plans
  for select using (active = true or is_admin());

-- ============ amc_subscriptions: a customer's purchased/active AMC ============
create sequence if not exists public.amc_number_seq;

create or replace function public.next_amc_number()
returns text
language sql
as $$
  select 'HE-AMC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.amc_number_seq')::text, 5, '0');
$$;

create table if not exists public.amc_subscriptions (
  id uuid primary key default gen_random_uuid(),
  amc_number text not null unique default public.next_amc_number(),
  customer_id uuid references public.profiles (id) on delete set null,
  plan_id uuid references public.amc_plans (id) on delete set null,
  plan_name_snapshot text,
  coverage_snapshot jsonb,
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  start_date date not null default current_date,
  expiry_date date not null,
  next_visit_date date,
  created_at timestamptz not null default now(),
  duration_months integer not null default 12,
  amount_paid numeric,
  renewed_from uuid references public.amc_subscriptions (id),
  reminder_sent_at timestamptz
);

alter table public.amc_subscriptions enable row level security;

drop policy if exists "Admin manages amc subscriptions" on public.amc_subscriptions;
create policy "Admin manages amc subscriptions" on public.amc_subscriptions
  for all using (is_admin()) with check (is_admin());

drop policy if exists "Customers view own amc" on public.amc_subscriptions;
create policy "Customers view own amc" on public.amc_subscriptions
  for select using (customer_id = auth.uid() or is_admin());

-- ============ amc_visits: scheduled/completed visits under an AMC subscription ============
create table if not exists public.amc_visits (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.amc_subscriptions (id) on delete cascade,
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending','completed','skipped')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.amc_visits enable row level security;

drop policy if exists "Admin manages amc visits" on public.amc_visits;
create policy "Admin manages amc visits" on public.amc_visits
  for all using (is_admin()) with check (is_admin());

drop policy if exists "Customers view own amc visits" on public.amc_visits;
create policy "Customers view own amc visits" on public.amc_visits
  for select using (
    is_admin() or exists (
      select 1 from public.amc_subscriptions s
      where s.id = amc_visits.subscription_id and s.customer_id = auth.uid()
    )
  );

-- ============ before_after_photos: homepage "our work" gallery ============
create table if not exists public.before_after_photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  before_image_url text not null,
  after_image_url text not null,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.before_after_photos enable row level security;

drop policy if exists "Admin manages before-after photos" on public.before_after_photos;
create policy "Admin manages before-after photos" on public.before_after_photos
  for all using (is_admin()) with check (is_admin());

drop policy if exists "Public reads active before-after photos" on public.before_after_photos;
create policy "Public reads active before-after photos" on public.before_after_photos
  for select using (active = true);

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
alter table public.services add column if not exists faqs jsonb not null default '[]'::jsonb;

-- ============ services: two-tone hero headline (plain text + accent-highlighted phrase) ============
alter table public.services add column if not exists hero_title_plain text;
alter table public.services add column if not exists hero_title_highlight text;

-- ============ services: optional rich sections (SLA stats strip, advantage cards, process steps) ============
-- All admin-managed and all optional — a section only renders on the public page once its
-- data is non-empty, so every service uses the exact same [slug] template with zero hardcoding.
alter table public.services add column if not exists sla_stats jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists advantages_section jsonb not null default '{}'::jsonb;
alter table public.services add column if not exists process_section jsonb not null default '{}'::jsonb;
alter table public.services add column if not exists checklist_section jsonb not null default '{}'::jsonb;

-- ============ services: optional "types" section (who this service is for) ============
-- E.g. AMC's Residential / Office / Commercial / Corporate categories, each with a short
-- list of the property types it covers. Admin-managed and optional like the other sections.
alter table public.services add column if not exists types_section jsonb not null default '{}'::jsonb;

-- ============ services: optional headline override for the pricing card ============
-- Shown instead of price_label when set — useful when the real price lives on a
-- separate plans page (e.g. AMC's "See the AMC Plans") rather than a single figure.
alter table public.services add column if not exists price_cta_label text;

-- ============ amc_plans: admin-controlled "Most Popular" badge ============
alter table public.amc_plans add column if not exists featured boolean not null default false;

-- ============ technicians: profile photo ============
alter table public.technicians add column if not exists photo_url text;

-- ============ service_requests: customer ticket system ============
-- Ticket numbers use the format HE-<year>-<6-digit-sequence>, e.g. HE-2026-000125.
create sequence if not exists public.ticket_number_seq;

create or replace function public.next_ticket_number()
returns text
language sql
as $$
  select 'HE-SR-' || lpad(nextval('public.ticket_number_seq')::text, 5, '0');
$$;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null default public.next_ticket_number(),
  customer_id uuid references auth.users (id) on delete set null,
  service_type text not null,
  description text,
  preferred_date date,
  preferred_time text,
  location text,
  photo_url text,
  photo_urls jsonb not null default '[]'::jsonb,
  status text not null default 'requested' check (status in ('requested','assigned','scheduled','in_progress','completed','cancelled')),
  technician_name text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_requests enable row level security;

drop policy if exists "Customers can read own requests" on public.service_requests;
create policy "Customers can read own requests" on public.service_requests
  for select using (auth.uid() = customer_id or auth.role() = 'service_role');

drop policy if exists "Customers can create own requests" on public.service_requests;
create policy "Customers can create own requests" on public.service_requests
  for insert with check (auth.uid() = customer_id);

drop policy if exists "Authenticated full access on requests" on public.service_requests;
create policy "Authenticated full access on requests" on public.service_requests
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ notifications: customer-facing event feed ============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users (id) on delete cascade,
  title text not null,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Customers can read own notifications" on public.notifications;
create policy "Customers can read own notifications" on public.notifications
  for select using (auth.uid() = customer_id);

drop policy if exists "Customers can update own notifications" on public.notifications;
create policy "Customers can update own notifications" on public.notifications
  for update using (auth.uid() = customer_id);

drop policy if exists "Authenticated full access on notifications" on public.notifications;
create policy "Authenticated full access on notifications" on public.notifications
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table public.notifications add column if not exists technician_id uuid references public.technicians (id) on delete cascade;

drop policy if exists "Technicians can read own notifications" on public.notifications;
create policy "Technicians can read own notifications" on public.notifications
  for select using (technician_id in (select id from public.technicians where user_id = auth.uid()));

drop policy if exists "Technicians can update own notifications" on public.notifications;
create policy "Technicians can update own notifications" on public.notifications
  for update using (technician_id in (select id from public.technicians where user_id = auth.uid()));

-- ============ quotations: standard + Corporate AMC quotations (chargeable material/work approval) ============
create sequence if not exists public.quotation_number_seq;

create or replace function public.next_quotation_number()
returns text
language sql
as $$
  select 'QTN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quotation_number_seq')::text, 4, '0');
$$;

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique default public.next_quotation_number(),
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text,
  customer_email text,
  customer_mobile text,
  service_request_id uuid references public.service_requests (id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  discount numeric not null default 0,
  gst_percent numeric not null default 18,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  terms text,
  valid_until date,
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','rejected','expired','paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotations enable row level security;

drop policy if exists "Admin creates quotations" on public.quotations;
create policy "Admin creates quotations" on public.quotations
  for insert with check (is_admin());

drop policy if exists "Admin deletes quotations" on public.quotations;
create policy "Admin deletes quotations" on public.quotations
  for delete using (is_admin());

drop policy if exists "Customers respond to own quotations" on public.quotations;
create policy "Customers respond to own quotations" on public.quotations
  for update using (customer_id = auth.uid() or is_admin())
  with check (customer_id = auth.uid() or is_admin());

drop policy if exists "Customers view own quotations" on public.quotations;
create policy "Customers view own quotations" on public.quotations
  for select using (customer_id = auth.uid() or is_admin());

-- ============ invoices ============
create sequence if not exists public.invoice_number_seq;

create or replace function public.next_invoice_number()
returns text
language sql
as $$
  select 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0');
$$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default public.next_invoice_number(),
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text,
  customer_email text,
  customer_mobile text,
  quotation_id uuid references public.quotations (id) on delete set null,
  service_request_id uuid references public.service_requests (id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  gst_percent numeric not null default 18,
  total_amount numeric not null default 0,
  paid_amount numeric not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending','payment_initiated','paid','failed','cancelled','refunded','partially_paid')),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

drop policy if exists "Admin manages invoices" on public.invoices;
create policy "Admin manages invoices" on public.invoices
  for all using (is_admin()) with check (is_admin());

drop policy if exists "Customers view own invoices" on public.invoices;
create policy "Customers view own invoices" on public.invoices
  for select using (customer_id = auth.uid() or is_admin());

-- ============ site_settings: working hours (admin-managed, shown on Contact page) ============
-- No default value seeded here — the Contact page only shows a "Working Hours" row once an
-- admin fills it in via /admin/settings, so no hours are ever displayed unless genuinely set.

-- ============ service_areas: optional genuine local detail per area ============
-- Blank by default. The /electrician-in/[area] page only renders a "local highlight" callout
-- once an admin has actually written one — avoids thin/duplicate location-page content without
-- ever fabricating local claims.
alter table public.service_areas add column if not exists local_note text;

-- ============ payments: Cashfree gateway (replaces the earlier Razorpay integration) ============
alter table public.invoices add column if not exists cashfree_order_id text;
alter table public.invoices add column if not exists cashfree_payment_id text;
alter table public.invoices drop column if exists razorpay_order_id;
alter table public.invoices drop column if exists razorpay_payment_id;

alter table public.amc_subscriptions add column if not exists cashfree_order_id text;
alter table public.amc_subscriptions add column if not exists cashfree_payment_id text;
alter table public.amc_subscriptions drop column if exists razorpay_order_id;
alter table public.amc_subscriptions drop column if exists razorpay_payment_id;

-- Lets a customer pay an accepted quotation directly; also the webhook's lookup key.
alter table public.quotations add column if not exists cashfree_order_id text;

-- AMC subscription rows only exist AFTER a successful payment, so the async webhook needs
-- somewhere to look up "what should this order_id activate" if the client never confirms.
create table if not exists public.amc_purchase_intents (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  customer_id uuid references auth.users (id) on delete cascade,
  plan_id uuid references public.amc_plans (id) on delete set null,
  renew_from_id uuid references public.amc_subscriptions (id) on delete set null,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.amc_purchase_intents enable row level security;

drop policy if exists "Admin manages amc purchase intents" on public.amc_purchase_intents;
create policy "Admin manages amc purchase intents" on public.amc_purchase_intents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ health_checks: Electrical Health Check booking (lead-gen) ============
-- Booking numbers use the format HE-HC-<year>-<6-digit-sequence>.
create sequence if not exists public.health_check_number_seq;

create or replace function public.next_health_check_number()
returns text
language sql
as $$
  select 'HE-HC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.health_check_number_seq')::text, 6, '0');
$$;

create table if not exists public.health_checks (
  id uuid primary key default gen_random_uuid(),
  request_number text not null default public.next_health_check_number(),
  customer_id uuid references auth.users (id) on delete set null,
  name text not null,
  mobile text not null,
  email text,
  address text,
  property_type text,
  preferred_date date,
  preferred_time text,
  notes text,
  status text not null default 'requested' check (status in ('requested','scheduled','completed','cancelled')),
  engineer_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_checks add column if not exists technician_id uuid references public.technicians (id) on delete set null;

alter table public.health_checks enable row level security;

drop policy if exists "Public can submit health checks" on public.health_checks;
create policy "Public can submit health checks" on public.health_checks
  for insert with check (true);

drop policy if exists "Customers can read own health checks" on public.health_checks;
create policy "Customers can read own health checks" on public.health_checks
  for select using (auth.uid() = customer_id);

drop policy if exists "Authenticated full access on health checks" on public.health_checks;
create policy "Authenticated full access on health checks" on public.health_checks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ health_reports: digital inspection report produced after a health check ============
-- Report numbers use the format HE-HR-<year>-<6-digit-sequence>.
create sequence if not exists public.health_report_number_seq;

create or replace function public.next_health_report_number()
returns text
language sql
as $$
  select 'HE-HR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.health_report_number_seq')::text, 6, '0');
$$;

create table if not exists public.health_reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null default public.next_health_report_number(),
  health_check_id uuid references public.health_checks (id) on delete set null,
  customer_id uuid references auth.users (id) on delete set null,
  customer_name text,
  property_name text,
  property_address text,
  property_type text,
  inspection_date date,
  inspector_name text,
  items jsonb not null default '[]'::jsonb,
  summary text,
  recommended_plan_id uuid references public.amc_plans (id) on delete set null,
  recommended_plan_note text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_reports enable row level security;

drop policy if exists "Customers can read own published health reports" on public.health_reports;
create policy "Customers can read own published health reports" on public.health_reports
  for select using (auth.uid() = customer_id and status = 'published');

drop policy if exists "Authenticated full access on health reports" on public.health_reports;
create policy "Authenticated full access on health reports" on public.health_reports
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ properties: customer's "My Properties" (multiple properties per customer) ============
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  property_type text,
  address text not null,
  city text,
  state text,
  pincode text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

drop policy if exists "Customers manage own properties" on public.properties;
create policy "Customers manage own properties" on public.properties
  for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

drop policy if exists "Authenticated full access on properties" on public.properties;
create policy "Authenticated full access on properties" on public.properties
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ AMC purchases: link a subscription to one of the customer's properties ============
alter table public.amc_purchase_intents add column if not exists property_id uuid references public.properties (id) on delete set null;
alter table public.amc_subscriptions add column if not exists property_id uuid references public.properties (id) on delete set null;

-- ============ service_requests: link a request to one of the customer's properties ============
alter table public.service_requests add column if not exists property_id uuid references public.properties (id) on delete set null;

-- ============ health_reports: link a report to one of the customer's properties ============
alter table public.health_reports add column if not exists property_id uuid references public.properties (id) on delete set null;

-- ============ services: additional optional rich sections for the AMC page (admin-managed, same pattern as advantages/types/process) ============
alter table public.services add column if not exists problem_section jsonb not null default '{}'::jsonb;
alter table public.services add column if not exists exclusions_section jsonb not null default '{}'::jsonb;
alter table public.services add column if not exists why_house_electric_section jsonb not null default '{}'::jsonb;

-- ============ services: let an admin manually hide an otherwise-populated optional section
-- (e.g. keep FAQ content drafted but not live yet) without deleting its content. Values are
-- section keys: stats, types, checklist, problem, exclusions, advantages, process, why_he, faqs.
-- A section still only ever shows when it BOTH has content AND is not listed here. ============
alter table public.services add column if not exists hidden_sections text[] not null default '{}'::text[];

-- ============ amc_plans: "suitable for" audience description (e.g. "1 BHK, 2 BHK Apartments") ============
alter table public.amc_plans add column if not exists suitable_for jsonb not null default '[]'::jsonb;

-- ============ amc_plans: visit limits, response SLA, exclusions matrix (admin-configurable) ============
alter table public.amc_plans add column if not exists visit_limit_type text not null default 'unlimited' check (visit_limit_type in ('unlimited','defined','fair_use'));
alter table public.amc_plans add column if not exists visit_limit_count int;
alter table public.amc_plans add column if not exists response_time_sla text;
alter table public.amc_plans add column if not exists exclusions jsonb not null default '[]'::jsonb;

-- ============ amc_plans: unified per-service coverage matrix ============
-- Each entry: { name, status } where status is included | excluded | chargeable | quote_required.
-- `coverage` (included names) and `exclusions` (chargeable/quote_required names) above are kept in
-- sync automatically whenever this is edited from the admin panel, so existing consumers that only
-- read the legacy flat lists (certificates, snapshots, emails) keep working unchanged.
alter table public.amc_plans add column if not exists coverage_items jsonb not null default '[]'::jsonb;

-- ============ Technician self-service login panel ============
alter table public.profiles add column if not exists is_technician boolean not null default false;

create or replace function public.is_technician()
returns boolean
language sql
stable security definer
set search_path to 'public'
as $$
  select coalesce((select is_technician from public.profiles where id = auth.uid()), false);
$$;

alter table public.technicians add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.technicians add column if not exists email text;
create unique index if not exists technicians_user_id_key on public.technicians (user_id) where user_id is not null;

drop policy if exists "Technicians can read own row" on public.technicians;
create policy "Technicians can read own row" on public.technicians
  for select using (user_id = auth.uid());

drop policy if exists "Technicians can update own row" on public.technicians;
create policy "Technicians can update own row" on public.technicians
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.service_requests add column if not exists technician_id uuid references public.technicians (id) on delete set null;

drop policy if exists "Technicians manage assigned requests" on public.service_requests;
create policy "Technicians manage assigned requests" on public.service_requests
  for all using (technician_id in (select id from public.technicians where user_id = auth.uid()))
  with check (technician_id in (select id from public.technicians where user_id = auth.uid()));

-- SECURITY DEFINER helpers (same pattern as is_admin()/is_technician() above) so these RLS
-- policies never run a correlated subquery directly against an RLS-protected table from within
-- that table's own policy evaluation — doing so previously caused "infinite recursion detected
-- in policy for relation service_requests", which broke profile reads for EVERY signed-in user
-- (customers included), not just technicians.
create or replace function public.technician_property_ids()
returns setof uuid
language sql
stable security definer
set search_path to 'public'
as $$
  select distinct property_id from public.service_requests
  where property_id is not null
    and technician_id in (select id from public.technicians where user_id = auth.uid());
$$;

create or replace function public.technician_customer_ids()
returns setof uuid
language sql
stable security definer
set search_path to 'public'
as $$
  select distinct customer_id from public.service_requests
  where customer_id is not null
    and technician_id in (select id from public.technicians where user_id = auth.uid());
$$;

-- Technicians only see the customer/property details of jobs actually assigned to them.
drop policy if exists "Technicians can read assigned customers profiles" on public.profiles;
create policy "Technicians can read assigned customers profiles" on public.profiles
  for select using (id in (select public.technician_customer_ids()));

drop policy if exists "Technicians can read assigned properties" on public.properties;
create policy "Technicians can read assigned properties" on public.properties
  for select using (id in (select public.technician_property_ids()));

-- Technicians can see AMC coverage and prior service history for properties they have a job at
-- (not just the one ticket assigned to them) — needed for the job-detail "AMC coverage / previous
-- service history" view.
drop policy if exists "Technicians can read amc for assigned properties" on public.amc_subscriptions;
create policy "Technicians can read amc for assigned properties" on public.amc_subscriptions
  for select using (property_id in (select public.technician_property_ids()));

drop policy if exists "Technicians can read history for assigned properties" on public.service_requests;
create policy "Technicians can read history for assigned properties" on public.service_requests
  for select using (property_id in (select public.technician_property_ids()));

-- ============ amc_subscriptions: multi-stage renewal reminders (60/30/15/7/1 days before expiry) ============
-- Tracks which milestone days have already been emailed so each one fires exactly once,
-- instead of the old single reminder_sent_at flag which only ever sent one reminder total.
alter table public.amc_subscriptions add column if not exists reminder_stages_sent jsonb not null default '[]'::jsonb;

-- ============ enquiries: site assessment tracking (mainly for corporate/commercial leads) ============
alter table public.enquiries add column if not exists assessment_date date;
alter table public.enquiries add column if not exists assessment_time text;
alter table public.enquiries add column if not exists assigned_engineer text;
alter table public.enquiries add column if not exists assessment_notes text;

-- ============ quotations: structured Corporate AMC fields (scope, SLA, manpower, exclusions) ============
alter table public.quotations add column if not exists quotation_type text not null default 'standard' check (quotation_type in ('standard','corporate_amc'));
alter table public.quotations add column if not exists enquiry_id uuid references public.enquiries (id) on delete set null;
alter table public.quotations add column if not exists scope_of_work text;
alter table public.quotations add column if not exists visit_frequency text;
alter table public.quotations add column if not exists response_time_sla text;
alter table public.quotations add column if not exists manpower text;
alter table public.quotations add column if not exists exclusions text;
alter table public.quotations add column if not exists amc_duration_months int;

-- ============ service_requests: full status lifecycle + technician visit scheduling + service report ============
alter table public.service_requests drop constraint if exists service_requests_status_check;
alter table public.service_requests add constraint service_requests_status_check check (
  status in (
    'requested','under_review','assigned','scheduled','on_the_way','in_progress',
    'material_required','customer_approval_pending','completed','confirmed','closed','cancelled'
  )
);

alter table public.service_requests add column if not exists scheduled_date date;
alter table public.service_requests add column if not exists scheduled_time text;
alter table public.service_requests add column if not exists diagnosis text;
alter table public.service_requests add column if not exists work_performed text;
alter table public.service_requests add column if not exists material_used text;
alter table public.service_requests add column if not exists before_photos jsonb not null default '[]'::jsonb;
alter table public.service_requests add column if not exists after_photos jsonb not null default '[]'::jsonb;
alter table public.service_requests add column if not exists customer_confirmed boolean not null default false;
alter table public.service_requests add column if not exists customer_confirmed_at timestamptz;
alter table public.service_requests add column if not exists video_urls jsonb not null default '[]'::jsonb;

-- ============ communication_log: admin-visible history of calls/emails/WhatsApp/notes with a customer ============
create table if not exists public.communication_log (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  channel text not null default 'call' check (channel in ('call', 'email', 'whatsapp', 'sms', 'note')),
  direction text not null default 'outbound' check (direction in ('inbound', 'outbound')),
  summary text not null,
  created_by text,
  created_at timestamptz not null default now()
);

alter table public.communication_log enable row level security;

drop policy if exists "Admin manages communication log" on public.communication_log;
create policy "Admin manages communication log" on public.communication_log
  for all using (is_admin()) with check (is_admin());

-- ============ properties: area + electrical infrastructure detail (DBs, load, points) ============
alter table public.properties add column if not exists area_sqft numeric;
alter table public.properties add column if not exists electrical_details text;

-- ============ service_requests: whether admin has opened/seen this request in the notifications bell ============
alter table public.service_requests add column if not exists admin_seen boolean not null default false;

-- ============ service_requests: technician contact snapshot (shown to customer + in status emails) ============
alter table public.service_requests add column if not exists technician_phone text;
alter table public.service_requests add column if not exists technician_photo text;

-- ============ service_request_status_history: timestamp of every status change, for the progress timeline
-- shown to customers, technicians and admin. Populated automatically by a trigger (below) so every
-- code path that changes service_requests.status (admin panel, technician portal, future automation)
-- is captured with zero extra client-side work — nothing has to remember to write to this table.
create table if not exists public.service_request_status_history (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests (id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now()
);

create index if not exists service_request_status_history_request_idx
  on public.service_request_status_history (service_request_id, changed_at);

alter table public.service_request_status_history enable row level security;

drop policy if exists "Customers can read own request history" on public.service_request_status_history;
create policy "Customers can read own request history" on public.service_request_status_history
  for select using (service_request_id in (select id from public.service_requests where customer_id = auth.uid()));

drop policy if exists "Technicians can read assigned request history" on public.service_request_status_history;
create policy "Technicians can read assigned request history" on public.service_request_status_history
  for select using (
    service_request_id in (
      select id from public.service_requests
      where technician_id in (select id from public.technicians where user_id = auth.uid())
    )
  );

drop policy if exists "Admin manages request history" on public.service_request_status_history;
create policy "Admin manages request history" on public.service_request_status_history
  for all using (is_admin()) with check (is_admin());

create or replace function public.log_service_request_status_change()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.service_request_status_history (service_request_id, status, changed_at) values (new.id, new.status, now());
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.service_request_status_history (service_request_id, status, changed_at) values (new.id, new.status, now());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_service_request_status_history on public.service_requests;
create trigger trg_service_request_status_history
after insert or update on public.service_requests
for each row execute function public.log_service_request_status_change();

-- Best-effort backfill for requests created before this table existed — one entry at their
-- current status/timestamp, so existing requests aren't left with a completely empty timeline.
insert into public.service_request_status_history (service_request_id, status, changed_at)
select id, status, coalesce(updated_at, created_at)
from public.service_requests r
where not exists (
  select 1 from public.service_request_status_history h where h.service_request_id = r.id
);

-- ============ projects: multi-photo albums (columns added directly on the live DB earlier,
-- documented here now so a fresh environment matches) ============
alter table public.projects add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists location text;
alter table public.projects add column if not exists description text;
alter table public.projects add column if not exists status text not null default 'Completed';
alter table public.projects add column if not exists featured boolean not null default false;
alter table public.projects add column if not exists display_order integer not null default 0;

-- ============ project_categories: admin-picked cover image per project category ============
-- Categories themselves are still just the free-text `projects.category` values (matched by
-- name, case-insensitive) — this table only exists to let an admin attach one cover photo and
-- an ordering to each category name for the public /projects category grid. A category with
-- projects but no row here yet still shows up (the app falls back to a project's own cover).
create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  cover_image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_categories enable row level security;

drop policy if exists "Public can read project categories" on public.project_categories;
create policy "Public can read project categories" on public.project_categories
  for select using (true);

drop policy if exists "Authenticated full access on project categories" on public.project_categories;
create policy "Authenticated full access on project categories" on public.project_categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
