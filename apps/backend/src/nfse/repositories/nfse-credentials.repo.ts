import { createSupabaseClients } from "../../../services/supabase";
const { admin } = createSupabaseClients();

export async function createCredential(payload: any) {
  const { data, error } = await admin.from('nfse_credentials').insert(payload).select();
  if (error) throw error;
  return data?.[0];
}

export async function listExpiringWithin(days: number) {
  const { data } = await admin.from('nfse_credentials').select('id, user_id, not_after').lte('not_after', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString());
  return data ?? [];
}
