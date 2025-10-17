// src/supabase/client.js
import { createClient } from '@supabase/supabase-js';

// Acessar variáveis de ambiente com o prefixo correto para Create React App.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabaseClient = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ambiente de desenvolvimento sem Supabase configurado — usar mock leve
  console.warn('Aviso: variáveis REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY não encontradas. Usando mock de supabase para desenvolvimento.');

  const mockAuth = {
    async getUser() { return { data: { user: null } }; },
    onAuthStateChange() { return { data: null, subscription: { unsubscribe: () => {} } }; },
    async signOut() { return { error: null }; },
    async signUp({ email, password }) {
      // retorna um usuário mock
      const id = 'mock_' + Date.now();
      return { data: { user: { id, email, user_metadata: { user_type: 'parceiro' } } }, error: null };
    }
  };

  supabaseClient = {
    auth: mockAuth,
    from() {
      // retorna objetos que não quebram as chamadas usadas pelo app
      return {
        async select() { return { data: [], error: null, count: 0 }; },
        async insert() { return { data: [], error: null }; },
        async update() { return { data: [], error: null }; },
        async delete() { return { data: [], error: null }; },
        async upsert(payload) { return { data: payload, error: null }; }
      };
    }
  };

} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;