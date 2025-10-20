import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().optional(),
  WHATSAPP_NUMBER: z.string().min(8),
  WHATSAPP_WELCOME_TEMPLATE: z
    .string()
    .default("Olá! Sou a IA do GuiasMEI. Estou aqui para te ajudar com suas guias e notas fiscais."),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);