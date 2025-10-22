import { NfseService } from "../services/nfse.service";
import { listPendingEmissions } from "../repositories/nfse-emissions.repo";

export async function pollPendingEmissions() {
  const service = new NfseService();
  const pendentes = await listPendingEmissions();

  for (const emission of pendentes) {
    try {
      const status = await service.pollStatus(emission.protocolo);
      if (status?.situacao === "AUTORIZADA") {
        const pdf = await service.downloadDanfe(status.chaveNfse || status.chave || emission.protocolo);
        await service.attachPdf(emission.id, pdf);
      }
    } catch (error) {
      // TODO: structured logging
      console.error(error);
    }
  }
}
