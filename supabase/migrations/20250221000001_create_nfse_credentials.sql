drop table if exists public.nfse_certificates cascade;
drop table if exists public.nfse_credentials cascade;

-- Ensure nfse_credentials table exists with encryption support
create table if not exists public.nfse_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('A1', 'A3')),
  subject text not null,
  document text not null,
  not_after timestamp with time zone not null,
  storage_path text not null,
  pass_encrypted text not null,
  pass_iv text not null,
  pass_tag text not null,
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.nfse_credentials enable row level security;

drop policy if exists "nfse_credentials_owner" on public.nfse_credentials;
create policy "nfse_credentials_owner"
  on public.nfse_credentials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_nfse_credentials_user_not_after
  on public.nfse_credentials (user_id, not_after desc);

drop trigger if exists handle_updated_at_nfse_credentials on public.nfse_credentials;
create trigger handle_updated_at_nfse_credentials
  before update on public.nfse_credentials
  for each row execute function public.handle_timestamp();
