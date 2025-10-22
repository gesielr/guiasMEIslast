import {
  createSupabaseClients
} from "./chunk-GKA2ARJQ.js";

// src/nfse/repositories/credentials.repo.ts
async function getCredentialPfxBuffer(storagePath) {
  const { data, error } = await admin.storage.from("certificates").download(storagePath);
  if (error || !data)
    throw new Error("Erro ao baixar certificado do Storage");
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
var { admin } = createSupabaseClients();
async function storeCredential({ userId, type, subject, document, notAfter, pfxBase64 }) {
  const filename = `certs/${userId}-${Date.now()}.pfx`;
  const buffer = Buffer.from(pfxBase64, "base64");
  const { data: uploadData, error: uploadError } = await admin.storage.from("certificates").upload(filename, buffer, { upsert: false });
  if (uploadError)
    throw uploadError;
  const { data, error } = await admin.from("nfse_credentials").insert({
    user_id: userId,
    type,
    subject,
    document,
    not_after: notAfter,
    storage_path: filename
  }).select();
  if (error)
    throw error;
  return data?.[0];
}
export {
  getCredentialPfxBuffer,
  storeCredential
};
