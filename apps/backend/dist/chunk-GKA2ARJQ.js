// services/supabase.ts
import { createClient } from "@supabase/supabase-js";

// src/env.ts
import { config as loadEnv } from "dotenv";
import { z } from "zod";
loadEnv();
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().optional(),
  WHATSAPP_NUMBER: z.string().min(8),
  WHATSAPP_WELCOME_TEMPLATE: z.string().default("Ol\xE1! Sou a IA do GuiasMEI. Estou aqui para te ajudar com suas guias e notas fiscais."),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NFSE_ENV: z.enum(["pr", "prod"]).default("pr"),
  NFSE_CONTRIBUINTES_BASE_URL: z.string().url().optional(),
  NFSE_PARAMETROS_BASE_URL: z.string().url().optional(),
  NFSE_DANFSE_BASE_URL: z.string().url().optional(),
  NFSE_CERT_PFX_PATH: z.string().optional(),
  NFSE_CERT_PFX_BASE64: z.string().optional(),
  NFSE_CERT_PFX_PASS: z.string().optional(),
  NFSE_CERT_PKCS11_LIBRARY: z.string().optional(),
  NFSE_CERT_PKCS11_SLOT: z.string().optional(),
  NFSE_CERT_PKCS11_PIN: z.string().optional()
});
var env = envSchema.parse(process.env);

// services/supabase.ts
function createSupabaseClients() {
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

export {
  env,
  createSupabaseClients
};
