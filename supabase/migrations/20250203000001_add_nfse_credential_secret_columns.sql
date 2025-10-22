alter table if exists nfse_credentials
  add column if not exists pass_encrypted text,
  add column if not exists pass_iv text,
  add column if not exists pass_tag text;

create index if not exists idx_nfse_credentials_user on nfse_credentials (user_id, not_after desc);
