import { createSupabaseClients } from "../../../services/supabase";
import crypto from "node:crypto";

const { admin } = createSupabaseClients();
const PDF_BUCKET = "nfse-pdfs";

export async function saveEmission(payload: any) {
  const { error, data } = await admin.from("nfse_emissions").insert({
    user_id: payload.userId,
    protocolo: payload.protocolo,
    status: payload.status,
    xml_hash: payload.xmlHash,
    tomador: payload.tomador ?? null,
    valores: payload.valores ?? null,
    municipio: payload.municipio ?? null
  }).select();

  if (error) throw error;
  return data?.[0];
}

export async function updateEmissionStatus(protocolo: string, status: string, mensagens?: any) {
  await admin.from("nfse_emissions").update({ status, updated_at: new Date() }).eq("protocolo", protocolo);
}

export function hashXml(xml: string) {
  return crypto.createHash("sha256").update(xml).digest("hex");
}

export async function listPendingEmissions() {
  const { data } = await admin.from("nfse_emissions").select("id, protocolo").in("status", ["EM_FILA", "PROCESSANDO"]).limit(100);
  return data ?? [];
}

export async function attachPdf(emissionId: string, pdfBuffer: Buffer) {
  const storagePath = `pdfs/${emissionId}.pdf`;
  const bucket = admin.storage.from(PDF_BUCKET);

  // upload PDF
  const { error: uploadError } = await bucket.upload(storagePath, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true
  });
  if (uploadError) throw uploadError;

  // persist storage path in table
  const { error: updateError } = await admin
    .from("nfse_emissions")
    .update({ pdf_storage_path: storagePath, updated_at: new Date() })
    .eq("id", emissionId);
  if (updateError) throw updateError;
}

export async function getEmissionPdfStoragePath(emissionId: string): Promise<string | null> {
  const { data, error } = await admin
    .from("nfse_emissions")
    .select("pdf_storage_path")
    .eq("id", emissionId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as any)?.pdf_storage_path ?? null;
}

export async function downloadPdfFromStorage(storagePath: string): Promise<Buffer> {
  const { data, error } = await admin.storage.from(PDF_BUCKET).download(storagePath);
  if (error || !data) throw error ?? new Error("PDF não encontrado no Storage");
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
