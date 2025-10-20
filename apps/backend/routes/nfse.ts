import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createSupabaseClients } from "../services/supabase";

const nfseSchema = z.object({
  userId: z.string().uuid(),
  value: z.number().positive(),
  serviceDescription: z.string().min(3),
  tomador: z.object({
    nome: z.string(),
    documento: z.string(),
    email: z.string().email().optional()
  })
});

type NfseBody = z.infer<typeof nfseSchema>;

const getQuerySchema = z.object({ userId: z.string().uuid() });
type GetQuery = z.infer<typeof getQuerySchema>;

export async function registerNfseRoutes(app: FastifyInstance) {
  const supabase = createSupabaseClients();

  app.post("/nfse", async (request: FastifyRequest<{ Body: NfseBody }>, reply: FastifyReply) => {
    const body = nfseSchema.parse(request.body);

    const nfseKey = `NFSE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { error } = await supabase.admin.from("nfse_emissions").insert({
      user_id: body.userId,
      value: body.value,
      service_description: body.serviceDescription,
      tomador: body.tomador,
      nfse_key: nfseKey,
      status: "issued",
      pdf_url: `https://files.guiasmei.com/nfse/${nfseKey}.pdf`
    });

    if (error) {
      request.log.error({ err: error }, "failed to insert nfse");
      return reply.internalServerError("Não foi possível registrar a NFS-e");
    }

    return {
      protocolo: nfseKey,
      numero: nfseKey.split("-").at(-1),
      pdfUrl: `https://files.guiasmei.com/nfse/${nfseKey}.pdf`
    };
  });

  app.get("/nfse", async (request: FastifyRequest<{ Querystring: GetQuery }>) => {
    const query = getQuerySchema.parse(request.query);

    const { data } = await supabase.admin
      .from("nfse_emissions")
      .select("id, created_at, nfse_key, value, status")
      .eq("user_id", query.userId)
      .order("created_at", { ascending: false });

    return data ?? [];
  });
}