import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createSupabaseClients } from "../services/supabase";

const gpsSchema = z.object({
  userId: z.string().uuid(),
  monthRef: z.string().regex(/^\d{4}-\d{2}$/),
  value: z.number().positive(),
  inssCode: z.string().optional()
});

type GpsBody = z.infer<typeof gpsSchema>;

export async function registerGpsRoutes(app: FastifyInstance) {
  const supabase = createSupabaseClients();

  app.post("/gps", async (request: FastifyRequest<{ Body: GpsBody }>, reply: FastifyReply) => {
    const body = gpsSchema.parse(request.body);
    const barcode = `8368${Date.now()}${Math.random().toString().slice(2, 10)}`;

    const { error } = await supabase.admin.from("gps_emissions").insert({
      user_id: body.userId,
      month_ref: body.monthRef,
      value: body.value,
      inss_code: body.inssCode ?? null,
      barcode,
      status: "issued",
      pdf_url: `https://files.guiasmei.com/gps/${barcode}.pdf`
    });

    if (error) {
      request.log.error({ err: error }, "failed to insert gps");
      return reply.internalServerError("Não foi possível registrar a guia");
    }

    return {
      linhaDigitavel: barcode,
      pdfUrl: `https://files.guiasmei.com/gps/${barcode}.pdf`
    };
  });
}