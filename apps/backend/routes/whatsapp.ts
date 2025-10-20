import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

const messageSchema = z.object({
  to: z.string().min(8),
  message: z.string().min(1)
});

type MessageBody = z.infer<typeof messageSchema>;

export async function registerWhatsappRoutes(app: FastifyInstance) {
  app.post("/whatsapp", async (request: FastifyRequest<{ Body: MessageBody }>) => {
    const payload = messageSchema.parse(request.body);
    request.log.info({ payload }, "WhatsApp message dispatched");
    return { ok: true };
  });
}

export default registerWhatsappRoutes;