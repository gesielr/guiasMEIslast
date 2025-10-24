import { NfseService } from "../services/nfse.service";
import { listPendingEmissions } from "../repositories/nfse-emissions.repo";

export async function pollPendingEmissions() {
  const service = new NfseService();
  const pendentes = await listPendingEmissions();

  for (const emission of pendentes) {
    try {
      const status = await service.pollStatus(emission.protocolo);
      const situacao = status?.situacao ?? status?.status;
      if (situacao === "AUTORIZADA") {
        const chave =
          status?.chaveAcesso ||
          status?.nfse?.chaveAcesso ||
          status?.chaveNfse ||
          status?.chave ||
          emission.protocolo;
        const pdf = await service.downloadDanfe(chave);
        await service.attachPdf(emission.id, pdf);
      }
    } catch (error) {
      // TODO: structured logging
      console.error(error);
    }
  }
}
