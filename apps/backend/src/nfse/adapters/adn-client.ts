import axios, { AxiosInstance } from "axios";
import { readFile } from "node:fs/promises";
import https from "node:https";
import { env } from "../../env";

interface CreateAdnClientOptions {
  module: "contribuintes" | "parametros" | "danfse";
}

async function loadPfxBuffer(): Promise<Buffer | undefined> {
  if (env.NFSE_CERT_PFX_BASE64) {
    return Buffer.from(env.NFSE_CERT_PFX_BASE64, "base64");
  }
  if (env.NFSE_CERT_PFX_PATH) {
    return await readFile(env.NFSE_CERT_PFX_PATH);
  }
  return undefined;
}

function resolveBaseUrl(module: CreateAdnClientOptions["module"]): string {
  switch (module) {
    case "contribuintes":
      return env.NFSE_CONTRIBUINTES_BASE_URL || "";
    case "parametros":
      return env.NFSE_PARAMETROS_BASE_URL || "";
    case "danfse":
      return env.NFSE_DANFSE_BASE_URL || "";
  }
}

export async function createAdnClient(options: CreateAdnClientOptions): Promise<AxiosInstance> {
  const pfx = await loadPfxBuffer();

  if (!pfx && !env.NFSE_CERT_PKCS11_LIBRARY) {
    throw new Error("Nenhuma credencial NFSe configurada (PFX ou PKCS#11)");
  }

  const httpsAgent = new https.Agent({
    pfx,
    passphrase: env.NFSE_CERT_PFX_PASS,
    rejectUnauthorized: true
  });

  return axios.create({
    baseURL: resolveBaseUrl(options.module),
    httpsAgent,
    headers: {
      "Content-Type": "application/xml",
      Accept: "application/json"
    },
    timeout: 15000
  });
}
