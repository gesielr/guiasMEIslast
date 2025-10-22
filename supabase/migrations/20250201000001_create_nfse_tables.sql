-- create NFSe related tables
create table if not exists nfse_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text check (type in ('A1', 'A3')) not null,
  subject text not null,
  document text not null,
  not_after timestamp with time zone not null,
  storage_path text not null,
  created_at timestamp with time zone default now()
);

create table if not exists nfse_municipal_params_cache (
  id uuid primary key default gen_random_uuid(),
  municipality_code varchar(7) not null,
  lc116_item text not null,
  payload jsonb not null,
  expires_at timestamp with time zone not null,
  unique (municipality_code, lc116_item)
);

create table if not exists nfse_emissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  protocolo text not null,
  nfse_key text,
  status text not null,
  xml_hash text not null,
  tomador jsonb,
  valores jsonb,
  municipio varchar(7),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists nfse_events (
  id uuid primary key default gen_random_uuid(),
  emission_id uuid references nfse_emissions(id) not null,
  type text not null,
  status text not null,
  payload jsonb,
  response jsonb,
  created_at timestamp with time zone default now()
);
