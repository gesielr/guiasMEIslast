-- ==============================================================
-- Supabase NFS-e National System - Complete and Corrected Schema
-- ==============================================================

-- 1. EXTENSIONS
----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FUNÇÕES (handle_timestamp e audit_log_trigger) - PRIMEIRO!
----------------------------------------------------------------

-- Função para atualizar a coluna 'updated_at' automaticamente
DROP FUNCTION IF EXISTS public.handle_timestamp CASCADE;
CREATE OR REPLACE FUNCTION public.handle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função de trigger para log de auditoria
DROP FUNCTION IF EXISTS public.audit_log_trigger CASCADE;
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.nfse_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        auth.uid(), -- Usuário atualmente autenticado
        TG_OP,      -- Tipo de operação (INSERT, UPDATE, DELETE)
        TG_TABLE_NAME, -- Nome da tabela
        COALESCE(NEW.id, OLD.id), -- ID do registro afetado
        to_jsonb(OLD),  -- Valores antigos (para UPDATE e DELETE)
        to_jsonb(NEW)   -- Novos valores (para INSERT e UPDATE)
    );
    RETURN COALESCE(NEW, OLD); -- Retorna NEW para INSERT/UPDATE, OLD para DELETE
END;
$$ LANGUAGE plpgsql;


-- 3. TABELAS (DROP IF EXISTS e CREATE TABLE)
----------------------------------------------------------------

-- Tabela NFSE_EVENTS deve ser dropada antes de NFSE_EMISSIONS devido à FK
DROP TABLE IF EXISTS public.nfse_events CASCADE;
DROP TABLE IF EXISTS public.nfse_emissions CASCADE;
DROP TABLE IF EXISTS public.nfse_tomadores CASCADE;
DROP TABLE IF EXISTS public.nfse_contributors CASCADE;
DROP TABLE IF EXISTS public.nfse_certificates CASCADE;
DROP TABLE IF EXISTS public.nfse_parameters CASCADE;
DROP TABLE IF EXISTS public.nfse_audit_log CASCADE;


-- Tabela nfse_emissions: Armazena todas as emissões de NFS-e do sistema
CREATE TABLE public.nfse_emissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados da emissão
    nfse_number TEXT,
    nfse_key TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, approved, rejected, cancelled
    
    -- Valores
    service_value NUMERIC(12,2) NOT NULL,
    deduction_value NUMERIC(12,2) DEFAULT 0,
    net_value NUMERIC(12,2) NOT NULL,
    tax_value NUMERIC(12,2) NOT NULL,
    
    -- Descrição do serviço
    service_description TEXT NOT NULL,
    service_code TEXT,
    
    -- Tomador (cliente)
    tomador_cnpj TEXT,
    tomador_cpf TEXT,
    tomador_name TEXT,
    tomador_email TEXT,
    
    -- Documentos
    pdf_url TEXT,
    xml_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issued_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Tabela nfse_events: Eventos vinculados às emissões (aprovação, rejeição, cancelamento)
CREATE TABLE public.nfse_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nfse_emission_id UUID NOT NULL REFERENCES public.nfse_emissions(id) ON DELETE CASCADE,
    
    -- Tipo de evento
    event_type TEXT NOT NULL, -- sent, approved, rejected, cancelled, blocked
    event_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    
    -- Detalhes
    event_description TEXT,
    error_message TEXT,
    response_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela nfse_tomadores: Dados dos tomadores de serviço (clientes)
CREATE TABLE public.nfse_tomadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificação
    document_type TEXT NOT NULL, -- cpf, cnpj
    document_number TEXT NOT NULL,
    name TEXT NOT NULL,
    
    -- Contato
    email TEXT,
    phone TEXT,
    
    -- Endereço
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    
    -- Dados adicionais
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela nfse_contributors: Dados dos emitentes/contribuintes (prestadores)
CREATE TABLE public.nfse_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificação
    cnpj TEXT NOT NULL UNIQUE,
    inscricao_municipal TEXT NOT NULL,
    company_name TEXT NOT NULL,
    
    -- Contato
    email TEXT,
    phone TEXT,
    
    -- Endereço
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, inactive, blocked
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela nfse_certificates: Certificados digitais (e-CNPJ) dos usuários
CREATE TABLE public.nfse_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Certificado
    certificate_base64 TEXT NOT NULL,
    certificate_password TEXT NOT NULL,
    certificate_type TEXT NOT NULL DEFAULT 'A1', -- A1, A3
    
    -- Informações do certificado
    certificate_subject TEXT,
    certificate_issuer TEXT,
    certificate_serial TEXT,
    
    -- Validade
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, expired, revoked
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela nfse_parameters: Parâmetros municipais de tributação (visão global)
CREATE TABLE public.nfse_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação do município
    city_code TEXT NOT NULL UNIQUE,
    city_name TEXT NOT NULL,
    state TEXT NOT NULL,
    
    -- Parâmetros de tributação
    default_tax_rate NUMERIC(5,4),
    min_tax_rate NUMERIC(5,4),
    max_tax_rate NUMERIC(5,4),
    
    -- URLs dos endpoints
    api_url TEXT,
    homolog_url TEXT,
    
    -- Configurações
    requires_certificate BOOLEAN DEFAULT TRUE,
    requires_municipal_registration BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela nfse_audit_log: Log de auditoria de todas as operações (registrada por triggers)
CREATE TABLE public.nfse_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Pode ser NULL se for ação de sistema
    
    -- Ação
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE (vindo de TG_OP)
    table_name TEXT NOT NULL,
    record_id UUID, -- ID do registro da tabela afetada
    
    -- Detalhes
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    
    -- IP e User Agent (se capturados pela aplicação)
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 4. ÍNDICES
----------------------------------------------------------------
CREATE INDEX idx_nfse_emissions_user_id ON public.nfse_emissions(user_id);
CREATE INDEX idx_nfse_emissions_status ON public.nfse_emissions(status);
CREATE INDEX idx_nfse_emissions_nfse_key ON public.nfse_emissions(nfse_key);
CREATE INDEX idx_nfse_emissions_created_at ON public.nfse_emissions(created_at);

CREATE INDEX idx_nfse_events_nfse_emission_id ON public.nfse_events(nfse_emission_id);
CREATE INDEX idx_nfse_events_event_type ON public.nfse_events(event_type);
CREATE INDEX idx_nfse_events_created_at ON public.nfse_events(created_at);

CREATE INDEX idx_nfse_tomadores_user_id ON public.nfse_tomadores(user_id);
CREATE INDEX idx_nfse_tomadores_document ON public.nfse_tomadores(document_number);

CREATE INDEX idx_nfse_contributors_user_id ON public.nfse_contributors(user_id);
CREATE INDEX idx_nfse_contributors_cnpj ON public.nfse_contributors(cnpj);

CREATE INDEX idx_nfse_certificates_user_id ON public.nfse_certificates(user_id);
CREATE INDEX idx_nfse_certificates_status ON public.nfse_certificates(status);

CREATE INDEX idx_nfse_parameters_city_code ON public.nfse_parameters(city_code);
CREATE INDEX idx_nfse_parameters_state ON public.nfse_parameters(state);

CREATE INDEX idx_nfse_audit_log_user_id ON public.nfse_audit_log(user_id);
CREATE INDEX idx_nfse_audit_log_table_name ON public.nfse_audit_log(table_name);
CREATE INDEX idx_nfse_audit_log_created_at ON public.nfse_audit_log(created_at);


-- 5. RLS (ALTER TABLE ENABLE ROW LEVEL SECURITY)
----------------------------------------------------------------
ALTER TABLE public.nfse_emissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_tomadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_audit_log ENABLE ROW LEVEL SECURITY;


-- 6. POLÍTICAS (DROP POLICY IF EXISTS, CREATE POLICY)
----------------------------------------------------------------

-- nfse_emissions
DROP POLICY IF EXISTS "User can manage their own nfse_emissions" ON public.nfse_emissions;
CREATE POLICY "User can manage their own nfse_emissions"
    ON public.nfse_emissions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- nfse_events
DROP POLICY IF EXISTS "User can view nfse_events for their nfse" ON public.nfse_events;
CREATE POLICY "User can view nfse_events for their nfse"
    ON public.nfse_events
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.nfse_emissions 
        WHERE id = nfse_emission_id AND user_id = auth.uid()
    ));

-- nfse_tomadores
DROP POLICY IF EXISTS "User can manage their own tomadores" ON public.nfse_tomadores;
CREATE POLICY "User can manage their own tomadores"
    ON public.nfse_tomadores
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- nfse_contributors
DROP POLICY IF EXISTS "User can manage their own contributor" ON public.nfse_contributors;
CREATE POLICY "User can manage their own contributor"
    ON public.nfse_contributors
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- nfse_certificates
DROP POLICY IF EXISTS "User can manage their own certificates" ON public.nfse_certificates;
CREATE POLICY "User can manage their own certificates"
    ON public.nfse_certificates
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- nfse_parameters (todos podem ler, escrita/atualização para admins ou service_role)
DROP POLICY IF EXISTS "Anyone can view parameters" ON public.nfse_parameters;
CREATE POLICY "Anyone can view parameters"
    ON public.nfse_parameters
    FOR SELECT
    USING (TRUE);
-- Adicione políticas de INSERT/UPDATE/DELETE para 'service_role' se necessário
-- DROP POLICY IF EXISTS "Service role can manage parameters" ON public.nfse_parameters;
-- CREATE POLICY "Service role can manage parameters"
--     ON public.nfse_parameters
--     FOR ALL
--     TO service_role
--     USING (TRUE) WITH CHECK (TRUE);

-- nfse_audit_log (apenas leitura para o próprio user_id, escrita apenas por triggers ou service_role)
DROP POLICY IF EXISTS "User can view their own audit logs" ON public.nfse_audit_log;
CREATE POLICY "User can view their own audit logs"
    ON public.nfse_audit_log
    FOR SELECT
    USING (auth.uid() = user_id);
-- DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.nfse_audit_log;
-- CREATE POLICY "Service role can manage audit logs"
--     ON public.nfse_audit_log
--     FOR ALL
--     TO service_role
--     USING (TRUE) WITH CHECK (TRUE);


-- 7. TRIGGERS (que usam as funções)
----------------------------------------------------------------

-- Triggers para 'updated_at'
DROP TRIGGER IF EXISTS handle_updated_at_nfse_emissions ON public.nfse_emissions;
CREATE TRIGGER handle_updated_at_nfse_emissions
    BEFORE UPDATE ON public.nfse_emissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_timestamp();

DROP TRIGGER IF EXISTS handle_updated_at_nfse_events ON public.nfse_events;
CREATE TRIGGER handle_updated_at_nfse_events
    BEFORE UPDATE ON public.nfse_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_timestamp();

DROP TRIGGER IF EXISTS handle_updated_at_nfse_tomadores ON public.nfse_tomadores;
CREATE TRIGGER handle_updated_at_nfse_tomadores
    BEFORE UPDATE ON public.nfse_tomadores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_timestamp();

DROP TRIGGER IF EXISTS handle_updated_at_nfse_contributors ON public.nfse_contributors;
CREATE TRIGGER handle_updated_at_nfse_contributors
    BEFORE UPDATE ON public.nfse_contributors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_timestamp();

DROP TRIGGER IF EXISTS handle_updated_at_nfse_certificates ON public.nfse_certificates;
CREATE TRIGGER handle_updated_at_nfse_certificates
    BEFORE UPDATE ON public.nfse_certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_timestamp();

DROP TRIGGER IF EXISTS handle_updated_at_nfse_parameters ON public.nfse_parameters;
CREATE TRIGGER handle_updated_at_nfse_parameters
    BEFORE UPDATE ON public.nfse_parameters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_timestamp();

-- Triggers de Auditoria
DROP TRIGGER IF EXISTS audit_nfse_emissions ON public.nfse_emissions;
CREATE TRIGGER audit_nfse_emissions
    AFTER INSERT OR UPDATE OR DELETE ON public.nfse_emissions
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_nfse_events ON public.nfse_events;
CREATE TRIGGER audit_nfse_events
    AFTER INSERT OR UPDATE OR DELETE ON public.nfse_events
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_nfse_certificates ON public.nfse_certificates;
CREATE TRIGGER audit_nfse_certificates
    AFTER INSERT OR UPDATE OR DELETE ON public.nfse_certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_nfse_tomadores ON public.nfse_tomadores;
CREATE TRIGGER audit_nfse_tomadores
    AFTER INSERT OR UPDATE OR DELETE ON public.nfse_tomadores
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_nfse_contributors ON public.nfse_contributors;
CREATE TRIGGER audit_nfse_contributors
    AFTER INSERT OR UPDATE OR DELETE ON public.nfse_contributors
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_log_trigger();

-- nfse_parameters não precisa de auditoria por usuário final (geralmente gerenciado internamente)
-- nfse_audit_log também não precisa de trigger de auditoria para evitar loop infinito


-- 8. VIEWS
----------------------------------------------------------------

-- View: NFS-e Emitidas por Usuário (últimas 30 dias)
DROP VIEW IF EXISTS public.v_nfse_recent;
CREATE VIEW public.v_nfse_recent AS
SELECT 
    ne.id,
    ne.user_id,
    ne.nfse_number,
    ne.nfse_key,
    ne.status,
    ne.service_value,
    ne.tax_value,
    ne.net_value,
    ne.service_description,
    ne.tomador_name,
    ne.created_at,
    ne.issued_at
FROM public.nfse_emissions ne
WHERE ne.created_at >= NOW() - INTERVAL '30 days'
ORDER BY ne.created_at DESC;

-- View: Resumo de Emissões por Usuário
DROP VIEW IF EXISTS public.v_nfse_summary;
CREATE VIEW public.v_nfse_summary AS
SELECT 
    user_id,
    COUNT(*) as total_nfse,
    SUM(service_value) as total_service_value,
    SUM(tax_value) as total_tax_value,
    SUM(net_value) as total_net_value,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
FROM public.nfse_emissions
GROUP BY user_id;


-- 9. COMENTÁRIOS
----------------------------------------------------------------
COMMENT ON TABLE public.nfse_emissions IS 'Armazena todas as emissões de NFS-e do sistema.';
COMMENT ON COLUMN public.nfse_emissions.user_id IS 'ID do usuário que emitiu a NFS-e.';
COMMENT ON COLUMN public.nfse_emissions.nfse_key IS 'Chave de acesso da NFS-e, deve ser única.';
COMMENT ON COLUMN public.nfse_emissions.status IS 'Status atual da NFS-e (pendente, enviada, aprovada, rejeitada, cancelada).';

COMMENT ON TABLE public.nfse_events IS 'Registra eventos relacionados às NFS-e (aprovação, rejeição, cancelamento).';
COMMENT ON COLUMN public.nfse_events.nfse_emission_id IS 'Referência à emissão de NFS-e associada.';
COMMENT ON COLUMN public.nfse_events.event_type IS 'Tipo do evento (sent, approved, rejected, cancelled, blocked).';
COMMENT ON COLUMN public.nfse_events.response_data IS 'Dados da resposta da API externa, em formato JSON.';

COMMENT ON TABLE public.nfse_tomadores IS 'Armazena informações dos tomadores de serviço (clientes) de cada usuário.';
COMMENT ON COLUMN public.nfse_tomadores.document_type IS 'Tipo de documento do tomador (CPF ou CNPJ).';
COMMENT ON COLUMN public.nfse_tomadores.document_number IS 'Número do documento do tomador.';
COMMENT ON COLUMN public.nfse_tomadores.is_default IS 'Indica se este é o tomador padrão do usuário.';

COMMENT ON TABLE public.nfse_contributors IS 'Armazena informações dos contribuintes/emitentes (prestadores) para cada usuário.';
COMMENT ON COLUMN public.nfse_contributors.cnpj IS 'CNPJ do contribuinte.';
COMMENT ON COLUMN public.nfse_contributors.inscricao_municipal IS 'Inscrição Municipal do contribuinte.';
COMMENT ON COLUMN public.nfse_contributors.status IS 'Status do contribuinte (ativo, inativo, bloqueado).';

COMMENT ON TABLE public.nfse_certificates IS 'Armazena certificados digitais (e-CNPJ) dos usuários.';
COMMENT ON COLUMN public.nfse_certificates.certificate_base64 IS 'Conteúdo do certificado digital em formato Base64.';
COMMENT ON COLUMN public.nfse_certificates.certificate_password IS 'Senha do certificado digital.';
COMMENT ON COLUMN public.nfse_certificates.valid_from IS 'Data de início da validade do certificado.';
COMMENT ON COLUMN public.nfse_certificates.valid_until IS 'Data de fim da validade do certificado.';

COMMENT ON TABLE public.nfse_parameters IS 'Armazena parâmetros e configurações específicos de cada município para a emissão de NFS-e.';
COMMENT ON COLUMN public.nfse_parameters.city_code IS 'Código IBGE do município.';
COMMENT ON COLUMN public.nfse_parameters.default_tax_rate IS 'Alíquota de imposto padrão para o município.';
COMMENT ON COLUMN public.nfse_parameters.homolog_url IS 'URL do endpoint de homologação para o município.';

COMMENT ON TABLE public.nfse_audit_log IS 'Tabela de log de auditoria para rastrear alterações em dados sensíveis ou ações importantes.';
COMMENT ON COLUMN public.nfse_audit_log.action IS 'Ação realizada (INSERT, UPDATE, DELETE).';
COMMENT ON COLUMN public.nfse_audit_log.table_name IS 'Tabela onde a ação ocorreu.';
COMMENT ON COLUMN public.nfse_audit_log.old_values IS 'Valores do registro antes da alteração (JSONB).';
COMMENT ON COLUMN public.nfse_audit_log.new_values IS 'Valores do registro após a alteração (JSONB).';

COMMENT ON FUNCTION public.handle_timestamp() IS 'Função para atualizar a coluna updated_at automaticamente.';
COMMENT ON FUNCTION public.audit_log_trigger() IS 'Função de trigger para registrar eventos de auditoria.';

COMMENT ON VIEW public.v_nfse_recent IS 'Visão das emissões de NFS-e mais recentes (últimos 30 dias).';
COMMENT ON VIEW public.v_nfse_summary IS 'Visão de resumo das emissões de NFS-e por usuário.';