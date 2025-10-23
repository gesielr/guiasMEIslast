-- Align NFSe tables with backend expectations

drop table if exists public.nfse_events cascade;
drop table if exists public.nfse_emissions cascade;
drop table if exists public.nfse_municipal_params_cache cascade;

create table public.nfse_emissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocolo text not null,
  nfse_key text,
  status text not null,
  xml_hash text not null,
  tomador jsonb,
  valores jsonb,
  municipio varchar(7),
  pdf_storage_path text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.nfse_emissions enable row level security;

drop policy if exists "nfse_emissions_owner" on public.nfse_emissions;
create policy "nfse_emissions_owner"
  on public.nfse_emissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_nfse_emissions_user_status
  on public.nfse_emissions (user_id, status);

create table public.nfse_events (
  id uuid primary key default gen_random_uuid(),
  emission_id uuid not null references public.nfse_emissions(id) on delete cascade,
  type text not null,
  status text not null,
  payload jsonb,
  response jsonb,
  created_at timestamp with time zone default now()
);

alter table public.nfse_events enable row level security;

drop policy if exists "nfse_events_owner" on public.nfse_events;
create policy "nfse_events_owner"
  on public.nfse_events
  for select using (
    exists (
      select 1
      from public.nfse_emissions ne
      where ne.id = emission_id
        and ne.user_id = auth.uid()
    )
  );

create table public.nfse_municipal_params_cache (
  id uuid primary key default gen_random_uuid(),
  municipality_code varchar(7) not null,
  lc116_item text not null,
  payload jsonb not null,
  expires_at timestamp with time zone not null,
  unique (municipality_code, lc116_item)
);

create index if not exists idx_nfse_municipal_params_expiry
  on public.nfse_municipal_params_cache (expires_at);

drop trigger if exists handle_updated_at_nfse_emissions on public.nfse_emissions;
create trigger handle_updated_at_nfse_emissions
  before update on public.nfse_emissions
  for each row execute function public.handle_timestamp();
