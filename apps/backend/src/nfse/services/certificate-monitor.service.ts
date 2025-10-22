import { createSupabaseClients } from "../../../services/supabase";
const { admin } = createSupabaseClients();

export async function checkCertificatesExpiry() {
  // Find certificates expiring within 30 days
  const { data } = await admin
    .from('nfse_credentials')
    .select('id, user_id, not_after')
    .lte('not_after', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!data || data.length === 0) return;

  for (const cert of data) {
    // TODO: alert owner/admin (email, webhook, etc.)
    console.log('Cert expiring soon:', cert.id, cert.not_after);
  }
}
