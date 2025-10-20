import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "../src/env";

export interface SupabaseService {
  admin: SupabaseClient;
  anon: SupabaseClient;
}

export function createSupabaseClients(): SupabaseService {
  const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const anon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return { admin, anon };
}
