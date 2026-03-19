-- ============================================================
-- CarBroker Pro — Initial Schema
-- Run via: supabase db push  OR  paste into the SQL editor
-- ============================================================

-- Enums
create type vehicle_status as enum ('available', 'pending', 'sold', 'acquired');
create type deal_stage     as enum ('prospect', 'negotiation', 'inspection', 'financing', 'closing', 'completed', 'cancelled');
create type deal_type      as enum ('buy', 'sell');

-- ── Vehicles ────────────────────────────────────────────────
create table vehicles (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  make           text not null,
  model          text not null,
  year           int  not null check (year between 1900 and 2100),
  trim           text,
  vin            text unique,
  color          text,
  mileage        int  check (mileage >= 0),
  status         vehicle_status not null default 'available',
  asking_price   numeric(12,2),
  purchase_price numeric(12,2),
  notes          text,
  image_urls     text[] not null default '{}'
);

-- ── Contacts ────────────────────────────────────────────────
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name       text not null,
  email      text,
  phone      text,
  notes      text
);

-- ── Deals ────────────────────────────────────────────────────
create table deals (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  vehicle_id          uuid not null references vehicles(id) on delete restrict,
  contact_id          uuid references contacts(id) on delete set null,
  type                deal_type  not null,
  stage               deal_stage not null default 'prospect',
  offer_price         numeric(12,2),
  final_price         numeric(12,2),
  expected_close_date date,
  closed_at           timestamptz,
  notes               text
);

-- ── Indexes ─────────────────────────────────────────────────
create index on vehicles (status);
create index on vehicles (make, model);
create index on vehicles (year);
create index on deals (stage);
create index on deals (vehicle_id);

-- ── updated_at trigger ──────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicles_updated_at before update on vehicles
  for each row execute function set_updated_at();

create trigger contacts_updated_at before update on contacts
  for each row execute function set_updated_at();

create trigger deals_updated_at before update on deals
  for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
-- Enable RLS (policies should be added once auth is configured)
alter table vehicles enable row level security;
alter table contacts enable row level security;
alter table deals    enable row level security;

-- Temporary open policies for development — REMOVE before going to production
create policy "dev_all_vehicles" on vehicles for all using (true) with check (true);
create policy "dev_all_contacts" on contacts for all using (true) with check (true);
create policy "dev_all_deals"    on deals    for all using (true) with check (true);
