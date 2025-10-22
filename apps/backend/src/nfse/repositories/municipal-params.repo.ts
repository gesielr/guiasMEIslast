import { createSupabaseClients } from "../../../services/supabase";

const { admin } = createSupabaseClients();

export async function getCachedParams(municipio: string, item: string) {
  const { data } = await admin
    .from("nfse_municipal_params_cache")
    .select("payload, expires_at")
    .eq("municipality_code", municipio)
    .eq("lc116_item", item)
    .limit(1)
    .single();

  if (!data) return null;
  return { payload: data.payload, expiresAt: new Date(data.expires_at) };
}

export async function upsertCache(municipio: string, item: string, payload: any) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await admin.from("nfse_municipal_params_cache").upsert(
    {
      municipality_code: municipio,
      lc116_item: item,
      payload,
      expires_at: expiresAt
    },
    { onConflict: "municipality_code,lc116_item" }
  );
}
