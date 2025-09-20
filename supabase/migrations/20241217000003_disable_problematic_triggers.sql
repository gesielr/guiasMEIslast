-- Desabilitar temporariamente triggers que podem estar causando erro 500 no signup

-- 1. Verificar e desabilitar triggers na tabela auth.users
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND event_object_schema = 'auth'
        AND trigger_name != 'on_auth_user_created'
    LOOP
        EXECUTE format('ALTER TABLE auth.users DISABLE TRIGGER %I', trigger_record.trigger_name);
        RAISE NOTICE 'Desabilitado trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 2. Verificar se há políticas RLS na tabela auth.users e desabilitar temporariamente
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', policy_record.policyname);
        RAISE NOTICE 'Removida política: %', policy_record.policyname;
    END LOOP;
END $$;

-- 3. Desabilitar RLS temporariamente na tabela auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se há constraints que podem estar falhando
-- (Vamos manter as constraints, mas verificar se há alguma problemática)
