-- Partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    document TEXT NOT NULL,
    whatsapp_phone TEXT,
    crc TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "partner can manage own record"
    ON public.partners
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Extend profiles with WhatsApp + partner linkage
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id);

-- Customers table (MEI / Autônomos complement)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    encrypted_document TEXT,
    pis TEXT,
    partner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "customer can view own row"
    ON public.customers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "customer can insert own row"
    ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "customer can update own row"
    ON public.customers
    FOR UPDATE USING (auth.uid() = id);

-- Partner x Clients junction
CREATE TABLE IF NOT EXISTS public.partner_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.partner_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "partner can view own clients"
    ON public.partner_clients
    FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY IF NOT EXISTS "partner can insert own clients"
    ON public.partner_clients
    FOR INSERT WITH CHECK (auth.uid() = partner_id);

-- NFSe emissions table
CREATE TABLE IF NOT EXISTS public.nfse_emissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    value NUMERIC(12,2) NOT NULL,
    service_description TEXT,
    tomador JSONB,
    nfse_key TEXT,
    status TEXT DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.nfse_emissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user can manage own nfse"
    ON public.nfse_emissions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- GPS emissions table
CREATE TABLE IF NOT EXISTS public.gps_emissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_ref TEXT NOT NULL,
    value NUMERIC(12,2) NOT NULL,
    inss_code TEXT,
    barcode TEXT,
    status TEXT DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.gps_emissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user can manage own gps"
    ON public.gps_emissions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service transactions (fees)
CREATE TABLE IF NOT EXISTS public.service_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    base_amount NUMERIC(12,2),
    fee_fixed NUMERIC(12,2),
    fee_percent NUMERIC(5,4),
    total NUMERIC(12,2) NOT NULL,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.service_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user can view own service transactions"
    ON public.service_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "user can insert own service transactions"
    ON public.service_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WhatsApp sessions logs
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user can see own whatsapp sessions"
    ON public.whatsapp_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "user can insert own whatsapp sessions"
    ON public.whatsapp_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to maintain updated_at columns
CREATE OR REPLACE FUNCTION public.handle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_partners
    BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp();

CREATE TRIGGER handle_updated_at_customers
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp();

CREATE TRIGGER handle_updated_at_service_transactions
    BEFORE UPDATE ON public.service_transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_timestamp();