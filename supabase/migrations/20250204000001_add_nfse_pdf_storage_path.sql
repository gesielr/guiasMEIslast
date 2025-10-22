alter table if exists nfse_emissions
  add column if not exists pdf_storage_path text;

create index if not exists idx_nfse_emissions_pdf_path on nfse_emissions (pdf_storage_path);


