-- Debug: Verificar se há triggers ou políticas causando erro 500 no signup

-- 1. Verificar triggers na tabela auth.users
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 2. Verificar se há políticas RLS na tabela auth.users
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users';

-- 3. Verificar se RLS está habilitado na tabela auth.users
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename = 'users';

-- 4. Verificar se há funções que podem estar causando problemas
SELECT 
    routine_name, 
    routine_type, 
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
AND routine_name LIKE '%user%';

-- 5. Verificar se há constraints que podem estar falhando
SELECT 
    conname, 
    contype, 
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass;
