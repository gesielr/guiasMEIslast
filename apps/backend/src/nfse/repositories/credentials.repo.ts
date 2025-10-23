import { createSupabaseClients } from "../../../services/supabase";
import { decryptSecret, encryptSecret } from "../services/credential-crypto";

const { admin } = createSupabaseClients();

interface StoredCredentialRow {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  document: string;
  not_after: string;
  storage_path: string;
  pass_encrypted: string | null;
  pass_iv: string | null;
  pass_tag: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getCredentialPfxBuffer(storagePath: string): Promise<Buffer> {
  const { data, error } = await admin.storage.from("certificates").download(storagePath);
  if (error || !data) {
    throw error ?? new Error("Erro ao baixar certificado do Storage");
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function decodeCredentialSecret(credential: Pick<StoredCredentialRow, "pass_encrypted" | "pass_iv" | "pass_tag">): string {
  if (!credential.pass_encrypted || !credential.pass_iv || !credential.pass_tag) {
    throw new Error("Credencial NFSe sem dados de senha criptografada; reenviar certificado.");
  }

  return decryptSecret({
    encrypted: credential.pass_encrypted,
    iv: credential.pass_iv,
    tag: credential.pass_tag
  });
}

interface StoreCredentialParams {
  userId: string;
  type: string;
  subject: string;
  document: string;
  notAfter: string;
  pfxBase64: string;
  pass: string;
}

export async function storeCredential(params: StoreCredentialParams) {
  const filename = `certs/${params.userId}-${Date.now()}.pfx`;
  const buffer = Buffer.from(params.pfxBase64, "base64");

  const { error: uploadError } = await admin
    .storage
    .from("certificates")
    .upload(filename, buffer, {
      upsert: false,
      contentType: "application/x-pkcs12"
    });

  if (uploadError) {
    throw new Error(`Erro ao fazer upload do certificado: ${uploadError.message}`);
  }

  try {
    const secret = encryptSecret(params.pass);
    const { data, error } = await admin
      .from("nfse_credentials")
      .insert({
        user_id: params.userId,
        type: params.type,
        subject: params.subject,
        document: params.document,
        not_after: params.notAfter,
        storage_path: filename,
        pass_encrypted: secret.encrypted,
        pass_iv: secret.iv,
        pass_tag: secret.tag,
        status: "active"
      })
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as StoredCredentialRow | null;
  } catch (error) {
    await admin.storage.from("certificates").remove([filename]);
    throw error;
  }
}

export async function fetchLatestCredential(userId: string) {
  const { data, error } = await admin
    .from("nfse_credentials")
    .select("id, storage_path, pass_encrypted, pass_iv, pass_tag, not_after, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("not_after", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const credential = data as StoredCredentialRow;
  const notAfterDate = new Date(credential.not_after);
  if (!Number.isNaN(notAfterDate.valueOf()) && notAfterDate < new Date()) {
    throw new Error("Certificado expirado. Envie um novo certificado válido.");
  }

  return {
    storagePath: credential.storage_path,
    pass: decodeCredentialSecret(credential)
  };
}

export async function listCredentials(userId: string): Promise<Array<Pick<StoredCredentialRow, "id" | "type" | "subject" | "document" | "not_after" | "status" | "created_at">>> {
  const { data, error } = await admin
    .from("nfse_credentials")
    .select("id, type, subject, document, not_after, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Array<Pick<StoredCredentialRow, "id" | "type" | "subject" | "document" | "not_after" | "status" | "created_at">>;
}

export async function deleteCredential(userId: string, credentialId: string) {
  const { data, error } = await admin
    .from("nfse_credentials")
    .select("storage_path")
    .eq("id", credentialId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Credencial não encontrada para este usuário.");
  }

  const storagePath = (data as { storage_path: string | null }).storage_path;

  const { error: deleteError } = await admin
    .from("nfse_credentials")
    .delete()
    .eq("id", credentialId)
    .eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  if (storagePath) {
    await admin.storage.from("certificates").remove([storagePath]);
  }
}
