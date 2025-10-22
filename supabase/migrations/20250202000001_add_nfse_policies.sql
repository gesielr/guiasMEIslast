-- Enable RLS and policies for nfse_emissions and nfse_credentials
-- Note: adjust role names and admin check according to your Supabase setup

-- Ensure RLS enabled
alter table if exists nfse_emissions enable row level security;
alter table if exists nfse_credentials enable row level security;

-- Policy: owners can select/insert/update on their records
create policy if not exists "nfse_emissions_owner" on nfse_emissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "nfse_credentials_owner" on nfse_credentials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policy: admins (role 'service_role' or custom) can bypass (example uses a claim)
create policy if not exists "nfse_admin_access" on nfse_emissions
  for all using (auth.role() = 'admin');

create index if not exists idx_nfse_emissions_protocolo on nfse_emissions (protocolo);
create index if not exists idx_nfse_emissions_nfse_key on nfse_emissions (nfse_key);
create index if not exists idx_nfse_emissions_municipio on nfse_emissions (municipio);
