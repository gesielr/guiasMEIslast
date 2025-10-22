import type { FastifyInstance } from "fastify";
import { NfseService } from "../services/nfse.service";
import { createDpsSchema, cancelSchema } from "../dto/create-dps.dto";

export async function registerNfseController(app: FastifyInstance) {
  const service = new NfseService();

  app.post("/services/nfse", async (request) => {
    const dto = createDpsSchema.parse(request.body);
    return service.emit(dto);
  });

  app.post("/services/nfse/credentials", async (request, reply) => {
    const body = request.body as unknown;
    const dto = (await import("../dto/credential.dto")).credentialSchema.parse(body);

    if (!dto.pfxBase64) {
      return reply.badRequest("Arquivo PFX nao enviado");
    }

    const pfxBuffer = Buffer.from(dto.pfxBase64, "base64");
    if (pfxBuffer.length < 1000 || pfxBuffer.length > 30000) {
      return reply.badRequest("Arquivo PFX fora do tamanho esperado (1KB ~ 30KB)");
    }

    try {
      const forge = await import("node-forge");
      const f = forge.default ?? forge;
      const asn1 = f.asn1.fromDer(pfxBuffer.toString("binary"));
      f.pkcs12.pkcs12FromAsn1(asn1, dto.pass);
    } catch {
      return reply.badRequest("Arquivo nao e um PFX valido ou senha incorreta");
    }

    const { storeCredential } = await import("../repositories/credentials.repo");
    const created = await storeCredential({
      userId: dto.userId,
      type: dto.type,
      subject: dto.subject,
      document: dto.document,
      notAfter: dto.notAfter,
      pfxBase64: dto.pfxBase64,
      pass: dto.pass
    });
    return created;
  });

  app.get("/services/nfse/:id", async (request) => {
    const { id } = request.params as { id: string };
    return service.pollStatus(id);
  });

  app.post("/services/nfse/:id/cancel", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as unknown;
    const dto = cancelSchema.parse({ protocolo: id, ...(body ?? {}) });
    return { canceled: true, protocolo: dto.protocolo };
  });

  app.get("/services/nfse/:id/pdf", async (request, reply) => {
    const { id } = request.params as { id: string };
    const pdf = await service.downloadDanfe(id);

    reply.type("application/pdf");
    reply.header("Content-Disposition", `inline; filename=NFSe-${id}.pdf`);
    return reply.send(pdf);
  });

  app.get("/services/nfse/:id/storage-pdf", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { getEmissionPdfStoragePath, downloadPdfFromStorage } = await import("../repositories/nfse-emissions.repo");
    const storagePath = await getEmissionPdfStoragePath(id);

    if (!storagePath) {
      return reply.notFound("PDF não disponível para esta emissão");
    }

    const pdf = await downloadPdfFromStorage(storagePath);
    reply.type("application/pdf");
    reply.header("Content-Disposition", `inline; filename=NFSe-${id}.pdf`);
    return reply.send(pdf);
  });
}
