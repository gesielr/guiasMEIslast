import { gunzipSync } from "node:zlib";
import { AxiosError } from "axios";
import { createAdnClient } from "../adapters/adn-client";
import { saveEmission, updateEmissionStatus, hashXml, attachPdf } from "../repositories/nfse-emissions.repo";

function decodeDpsPayload(base64Gzip: string): string {
  try {
    const gzBuffer = Buffer.from(base64Gzip, "base64");
    const xmlBuffer = gunzipSync(gzBuffer);
    return xmlBuffer.toString("utf8");
  } catch {
    throw new Error("Payload DPS inválido: não foi possível decodificar GZip/Base64");
  }
}

export interface EmitNfseDto {
  userId: string;
  versao: string;
  dps_xml_gzip_b64: string;
}

export class NfseService {
  async emit(dto: EmitNfseDto) {
    if (!dto?.versao) {
      throw new Error("Campo versao é obrigatório");
    }

    if (!dto?.userId) {
      throw new Error("Campo userId é obrigatório");
    }

    if (!dto?.dps_xml_gzip_b64) {
      throw new Error("Campo dps_xml_gzip_b64 é obrigatório");
    }

    const signedXml = decodeDpsPayload(dto.dps_xml_gzip_b64);
    const xmlHash = hashXml(signedXml);

    const adn = await createAdnClient({ module: "contribuintes" });
    const payload = {
      versao: dto.versao,
      dps_xml_gzip_b64: dto.dps_xml_gzip_b64
    };

    let response;
    try {
      response = await adn.post("/nfse", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      });
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        const upstreamError = new Error("Falha ao comunicar com a API Nacional de NFS-e");
        (upstreamError as any).statusCode = error.response.status;
        (upstreamError as any).data = error.response.data ?? null;
        throw upstreamError;
      }
      throw error;
    }

    const protocolo =
      response.data?.identificadorDps ??
      response.data?.idDps ??
      response.data?.uuidProcessamento ??
      `PROTO-${Date.now()}`;

    const nfseKey =
      response.data?.chaveAcesso ??
      response.data?.nfse?.chaveAcesso ??
      response.data?.dados?.chaveAcesso ??
      null;

    const status = nfseKey ? "AUTORIZADA" : "EM_FILA";

    await saveEmission({
      userId: dto.userId,
      protocolo,
      status,
      xmlHash,
      nfseKey: nfseKey ?? undefined
    });

    return {
      protocolo,
      nfseKey,
      situacao: status,
      resposta: response.data
    };
  }

  async pollStatus(protocolo: string) {
    const adn = await createAdnClient({ module: "contribuintes" });
    const { data } = await adn.get(`/nfse/${protocolo}`, {
      headers: {
        Accept: "application/json"
      }
    });

    const situacao = data?.situacao ?? data?.status ?? "UNKNOWN";
    await updateEmissionStatus(protocolo, situacao, data);

    return data;
  }

  async downloadDanfe(chave: string) {
    const adn = await createAdnClient({ module: "danfse" });
    const { data } = await adn.get(`/danfse/${chave}`, {
      responseType: "arraybuffer" as any
    });
    return Buffer.from(data);
  }

  async attachPdf(emissionId: string, pdf: Buffer) {
    await attachPdf(emissionId, pdf);
  }
}
