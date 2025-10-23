-- Adicionar colunas para armazenamento seguro da senha do certificado e caminho do arquivo
ALTER TABLE public.nfse_certificates
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS pass_encrypted TEXT,
ADD COLUMN IF NOT EXISTS pass_iv TEXT,
ADD COLUMN IF NOT EXISTS pass_tag TEXT;

-- Definir as novas colunas como NOT NULL e com valor padrão
-- IMPORTANTE: Se já existirem dados, primeiro atualize-os antes de adicionar NOT NULL.
-- Exemplo:
-- UPDATE public.nfse_certificates SET storage_path = '', pass_encrypted = '', pass_iv = '', pass_tag = '' WHERE storage_path IS NULL;

-- ALTER TABLE public.nfse_certificates ALTER COLUMN storage_path SET NOT NULL;
-- ALTER TABLE public.nfse_certificates ALTER COLUMN pass_encrypted SET NOT NULL;
-- ALTER TABLE public.nfse_certificates ALTER COLUMN pass_iv SET NOT NULL;
-- ALTER TABLE public.nfse_certificates ALTER COLUMN pass_tag SET NOT NULL;

-- Opcional: Remover colunas que se tornaram redundantes
-- ALTER TABLE public.nfse_certificates DROP COLUMN IF EXISTS certificate_base64;
-- ALTER TABLE public.nfse_certificates DROP COLUMN IF EXISTS certificate_password;