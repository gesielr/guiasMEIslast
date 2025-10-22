import { createSupabaseClients } from "../../../services/supabase";
import { decryptSecret, encryptSecret } from "../services/credential-crypto";

const { admin } = createSupabaseClients();

export async function getCredentialPfxBuffer(storagePath: string): Promise<Buffer> {
  // Baixa o arquivo do Storage privado
  const { data, error } = await admin.storage.from("certificates").download(storagePath);
  if (error || !data) throw new Error("Erro ao baixar certificado do Storage");
  // data é um Blob, converter para Buffer
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export interface StoredCredential {
  storage_path: string;
  pass_encrypted: string;
  pass_iv: string;
  pass_tag: string;
}

export function decodeCredentialSecret(credential: StoredCredential): string {
  return decryptSecret({
    encrypted: credential.pass_encrypted,
    iv: credential.pass_iv,
    tag: credential.pass_tag
  });
}

export async function storeCredential({
  userId,
  type,
  subject,
  document,
  notAfter,
  pfxBase64,
  pass
}: any) {
  // Upload to Supabase Storage
  const filename = `certs/${userId}-${Date.now()}.pfx`;
  const buffer = Buffer.from(pfxBase64, "base64");
  const { error: uploadError } = await admin.storage
    .from("certificates")
    .upload(filename, buffer, { upsert: false });
  if (uploadError) throw uploadError;

  const secret = encryptSecret(pass);

  const { data, error } = await admin
    .from("nfse_credentials")
    .insert({
      user_id: userId,
      type,
      subject,
      document,
      not_after: notAfter,
      storage_path: filename,
      pass_encrypted: secret.encrypted,
      pass_iv: secret.iv,
      pass_tag: secret.tag
    })
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function fetchLatestCredential(userId: string) {
  const { data, error } = await admin
    .from("nfse_credentials")
    .select("storage_path, pass_encrypted, pass_iv, pass_tag")
    .eq("user_id", userId)
    .order("not_after", { ascending: false })
    .limit(1);
  if (error) throw error;
  if (!data?.[0]) {
    return null;
  }
  const credential = data[0] as StoredCredential;
  if (!credential.pass_encrypted || !credential.pass_iv || !credential.pass_tag) {
    throw new Error("Credencial NFSe sem senha cadastrada; reenviar certificado.");
  }
  return {
    storagePath: credential.storage_path,
    pass: decodeCredentialSecret(credential)
  };
}
