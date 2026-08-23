-- ============================================================
-- AirFareX — Complete Unified Database & Auth Setup
-- Run this script in the Supabase SQL Editor (in one go)
-- ============================================================

-- 1. Create Role Enum
do $$ begin
  create type public.user_role as enum ('ADMIN', 'ANALYST', 'VIEWER');
exception
  when duplicate_object then null;
end $$;

-- 2. Create Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role public.user_role not null default 'VIEWER'::public.user_role,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_read_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- 3. Automatic Profile Creation Trigger on Auth Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  assigned_role public.user_role;
begin
  if new.email ilike '%admin%' then
    assigned_role := 'ADMIN'::public.user_role;
  elsif new.email ilike '%analyst%' then
    assigned_role := 'ANALYST'::public.user_role;
  else
    assigned_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'VIEWER'::public.user_role);
  end if;

  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    assigned_role
  )
  on conflict (id) do update
    set name = excluded.name,
        role = excluded.role;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Auto-Confirm Users (Bypasses Email Verification Requirement)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  new.email_confirmed_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- 5. Reference Tables
create table if not exists public.airlines (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (origin, destination)
);

create table if not exists public.fare_quotes (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  airline_id uuid not null references public.airlines(id) on delete cascade,
  quote_timestamp timestamptz not null default now(),
  departure_date date not null,
  advance_days integer not null,
  fare_class text not null default 'Economy',
  base_fare numeric(10,2) not null,
  taxes numeric(10,2) not null default 0,
  udf numeric(10,2) not null default 0,
  convenience_fee numeric(10,2) not null default 0,
  total_fare numeric(10,2) generated always as (base_fare + taxes + udf + convenience_fee) stored,
  availability integer default 9,
  source text not null default 'OTA',
  created_at timestamptz not null default now()
);

create table if not exists public.index_history (
  id uuid primary key default gen_random_uuid(),
  value_date date not null unique,
  apix_value numeric(6,2) not null,
  dgca_ref numeric(6,2),
  avg_fare numeric(10,2),
  metro_metro_index numeric(6,2),
  metro_non_metro_index numeric(6,2),
  tier2_index numeric(6,2),
  volume integer,
  upper_band numeric(6,2),
  lower_band numeric(6,2),
  base_period text not null default 'January 2026',
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.airlines enable row level security;
alter table public.routes enable row level security;
alter table public.fare_quotes enable row level security;
alter table public.index_history enable row level security;

-- Open read policies for client analytics
create policy "allow_read_airlines" on public.airlines for select using (true);
create policy "allow_read_routes" on public.routes for select using (true);
create policy "allow_read_fare_quotes" on public.fare_quotes for select using (true);
create policy "allow_read_index_history" on public.index_history for select using (true);

-- Seed Initial Airlines & Routes
insert into public.airlines (code, name) values
  ('6E', 'IndiGo'),
  ('AI', 'Air India'),
  ('IX', 'Air India Express'),
  ('QP', 'Akasa Air'),
  ('SG', 'SpiceJet')
on conflict (code) do nothing;

insert into public.routes (origin, destination) values
  ('DEL', 'BOM'), ('DEL', 'BLR'), ('BOM', 'BLR'),
  ('DEL', 'CCU'), ('BLR', 'HYD'), ('MAA', 'DEL'),
  ('DEL', 'HYD'), ('BOM', 'DEL')
on conflict (origin, destination) do nothing;
