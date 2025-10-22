import { createAdnClient } from "../adapters/adn-client";
import { signInfDps } from "../crypto/xml-signer";
import { buildDpsXml } from "../templates/dps-template";
import { saveEmission, updateEmissionStatus, hashXml, attachPdf } from "../repositories/nfse-emissions.repo";
import { pfxToPem } from "../crypto/pfx-utils";

export class NfseService {
  async emit(dto: any) {
    const xml = buildDpsXml(dto);
    const { fetchLatestCredential, getCredentialPfxBuffer } = await import("../repositories/credentials.repo");
    const credential = await fetchLatestCredential(dto.userId);
    if (!credential) {
      throw new Error("Nenhuma credencial PFX encontrada para o usuario");
    }

    const pfxBuffer = await getCredentialPfxBuffer(credential.storagePath);
    const { privateKeyPem, certificatePem } = pfxToPem(pfxBuffer, credential.pass);
    const signedXml = signInfDps(xml, { certificatePem, privateKeyPem });

    const adn = await createAdnClient({ module: "contribuintes" });
    const response = await adn.post("/contribuintes/servicos/dps", signedXml, {
      headers: { "Content-Type": "application/xml" }
    });

    await saveEmission({
      userId: dto.userId,
      protocolo: response.data?.uuidProcessamento ?? `PROTO-${Date.now()}`,
      status: "EM_FILA",
      xmlHash: hashXml(signedXml)
    });

    return {
      protocolo: response.data?.uuidProcessamento ?? `PROTO-${Date.now()}`
    };
  }

  async pollStatus(protocolo: string) {
    const adn = await createAdnClient({ module: "contribuintes" });
    const { data } = await adn.get(`/contribuintes/servicos/dps/${protocolo}`);

    await updateEmissionStatus(protocolo, data.situacao ?? "UNKNOWN", data.mensagens ?? null);

    return data;
  }

  async downloadDanfe(chave: string) {
    const adn = await createAdnClient({ module: "danfse" });
    const { data } = await adn.get(`/danfse/${chave}`, { responseType: "arraybuffer" as any });
    return Buffer.from(data);
  }

  async attachPdf(emissionId: string, pdf: Buffer) {
    await attachPdf(emissionId, pdf);
  }
}
