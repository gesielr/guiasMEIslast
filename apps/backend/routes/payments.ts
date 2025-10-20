import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { env } from "../src/env";

const checkoutSchema = z.object({
  userId: z.string().uuid(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

type CheckoutBody = z.infer<typeof checkoutSchema>;

export async function registerPaymentRoutes(app: FastifyInstance) {
  app.post("/payments/checkout", async (request: FastifyRequest<{ Body: CheckoutBody }>) => {
    const body = checkoutSchema.parse(request.body);

    const checkoutUrl = env.FRONTEND_URL
      ? `${env.FRONTEND_URL}/pagamentos?user_id=${body.userId}`
      : `https://checkout.guiasmei.com/session/${body.userId}`;

    return {
      checkoutUrl
    };
  });
}