-- ============================================================
-- AirFareX — Real Data Schema (Step 7)
-- Run this in Supabase SQL Editor, in one go.
-- Assumes profiles table + user_role enum already exist (Step 3).
-- ============================================================

-- ---------- 1. Reference tables ----------

create table airlines (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,          -- e.g. '6E', 'AI', 'QP', 'AI Express', 'SG'
  name text not null,                 -- e.g. 'IndiGo'
  created_at timestamptz not null default now()
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  origin text not null,                -- IATA code, e.g. 'DEL'
  destination text not null,           -- IATA code, e.g. 'BOM'
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (origin, destination)
);

-- ---------- 2. Fare quotes (raw scraped/mock records) ----------

create table fare_quotes (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  airline_id uuid not null references airlines(id) on delete cascade,
  quote_timestamp timestamptz not null default now(),  -- when this quote was captured
  departure_date date not null,
  advance_days integer not null,        -- T+1, T+7, T+15, T+30, T+45 etc.
  fare_class text not null,             -- e.g. 'Economy', 'Flexi'
  base_fare numeric(10,2) not null,
  taxes numeric(10,2) not null default 0,
  udf numeric(10,2) not null default 0,
  convenience_fee numeric(10,2) not null default 0,
  total_fare numeric(10,2) generated always as (base_fare + taxes + udf + convenience_fee) stored,
  availability integer,                 -- seats left, if known
  source text not null,                 -- 'IndiGo.com', 'MakeMyTrip', 'Yatra', etc.
  created_at timestamptz not null default now()
);

create index idx_fare_quotes_route on fare_quotes(route_id);
create index idx_fare_quotes_airline on fare_quotes(airline_id);
create index idx_fare_quotes_departure on fare_quotes(departure_date);
create index idx_fare_quotes_advance on fare_quotes(advance_days);

-- ---------- 3. Index history (daily/weekly/monthly APIx values) ----------

create table index_history (
  id uuid primary key default gen_random_uuid(),
  value_date date not null unique,
  apix_value numeric(6,2) not null,     -- e.g. 128.64
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


-- ---------- 4. Row Level Security ----------

alter table airlines enable row level security;
alter table routes enable row level security;
alter table fare_quotes enable row level security;
alter table index_history enable row level security;

-- Helper: current caller's role, reused across policies instead of repeating the subquery
create or replace function public.current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

-- Airlines & routes: readable by any authenticated user
create policy "authenticated read airlines" on airlines
  for select using (auth.role() = 'authenticated');

create policy "authenticated read routes" on routes
  for select using (auth.role() = 'authenticated');

-- Index history: readable by any authenticated user
create policy "authenticated read index_history" on index_history
  for select using (auth.role() = 'authenticated');

-- Fare quotes: raw records are ANALYST/ADMIN only
create policy "analyst+ read fare_quotes" on fare_quotes
  for select using (public.current_user_role() in ('ADMIN', 'ANALYST'));

-- Writes: ADMIN only, on everything
create policy "admin write airlines" on airlines
  for all using (public.current_user_role() = 'ADMIN');

create policy "admin write routes" on routes
  for all using (public.current_user_role() = 'ADMIN');

create policy "admin write fare_quotes" on fare_quotes
  for all using (public.current_user_role() = 'ADMIN');

create policy "admin write index_history" on index_history
  for all using (public.current_user_role() = 'ADMIN');

-- ---------- 5. A VIEWER-safe aggregate view ----------

create view route_fare_summary
with (security_invoker = false) as
select
  r.id as route_id,
  r.origin,
  r.destination,
  a.name as airline_name,
  avg(fq.total_fare) as avg_fare,
  min(fq.total_fare) as min_fare,
  max(fq.total_fare) as max_fare,
  count(*) as quote_count,
  max(fq.quote_timestamp) as last_updated
from fare_quotes fq
join routes r on r.id = fq.route_id
join airlines a on a.id = fq.airline_id
group by r.id, r.origin, r.destination, a.name;

-- ---------- 6. Seed data ----------

insert into airlines (code, name) values
  ('6E', 'IndiGo'),
  ('AI', 'Air India'),
  ('IX', 'Air India Express'),
  ('QP', 'Akasa Air'),
  ('SG', 'SpiceJet');

insert into routes (origin, destination) values
  ('DEL', 'BOM'), ('DEL', 'BLR'), ('BOM', 'BLR'),
  ('DEL', 'CCU'), ('BLR', 'HYD'), ('MAA', 'DEL'),
  ('DEL', 'HYD'), ('BOM', 'DEL');

insert into index_history (value_date, apix_value)
select
  current_date - (n || ' days')::interval,
  128.64 + (random() * 6 - 3)
from generate_series(0, 29) as n;

insert into fare_quotes (route_id, airline_id, departure_date, advance_days, fare_class, base_fare, taxes, udf, convenience_fee, availability, source)
select
  r.id,
  a.id,
  current_date + ((random() * 30)::int || ' days')::interval,
  (array[1,7,15,30,45])[floor(random()*5+1)],
  'Economy',
  round((3500 + random() * 6000)::numeric, 2),
  round((400 + random() * 400)::numeric, 2),
  round((50 + random() * 100)::numeric, 2),
  round((100 + random() * 200)::numeric, 2),
  floor(random() * 9)::int,
  (array['IndiGo.com','AirIndia.in','MakeMyTrip','Yatra','EaseMyTrip','Cleartrip','Ixigo','Goibibo'])[floor(random()*8+1)]
from routes r
cross join airlines a
cross join generate_series(1, 5);

-- ---------- 7. Auto-confirm signed-up users (bypasses email confirmation requirement) ----------

update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  new.email_confirmed_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;

create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

