// src/supabase/client.js
import { createClient } from '@supabase/supabase-js';

// Correção: Acessar variáveis de ambiente com o prefixo correto para Create React App.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validação robusta para garantir que as variáveis de ambiente foram carregadas.
if (!supabaseUrl) {
  console.error('Erro: A variável de ambiente REACT_APP_SUPABASE_URL não foi encontrada.');
  console.log('Verifique se você criou um arquivo .env na raiz do projeto e reiniciou o servidor de desenvolvimento.');
}

if (!supabaseAnonKey) {
  console.error('Erro: A variável de ambiente REACT_APP_SUPABASE_ANON_KEY não foi encontrada.');
  console.log('Verifique seu arquivo .env e a configuração no dashboard do Supabase.');
}

// Lança um erro para interromper a execução se a configuração estiver incompleta.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração do Supabase incompleta. Verifique o console para mais detalhes.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);