import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { createSupabaseClients } from "../services/supabase";

const querySchema = z.object({ userId: z.string().uuid() });
type DashboardQuery = z.infer<typeof querySchema>;

export async function registerDashboardRoutes(app: FastifyInstance) {
  const supabase = createSupabaseClients();

  app.get(
    "/dashboards/mei",
    async (request: FastifyRequest<{ Querystring: DashboardQuery }>) => {
    const { userId } = querySchema.parse(request.query);

    const [{ data: profile }, { data: nfse }, { data: gps }] = await Promise.all([
      supabase.admin.from("profiles").select("name, onboarding_completed, onboarding_status").eq("id", userId).single(),
      supabase.admin.from("nfse_emissions").select("value, status").eq("user_id", userId),
      supabase.admin.from("gps_emissions").select("value, status").eq("user_id", userId)
    ]);

    const nfseIssued = nfse?.filter((item: { status: string | null }) => item.status === "issued").length ?? 0;
    const gpsIssued = gps?.filter((item: { status: string | null }) => item.status === "issued").length ?? 0;
    const gpsTotal = gps?.reduce((acc: number, item: { value: number | null }) => acc + (item.value ?? 0), 0) ?? 0;

    return {
      profile,
      nfseIssued,
      gpsIssued,
      gpsTotal
    };
  });

  app.get(
    "/dashboards/autonomo",
    async (request: FastifyRequest<{ Querystring: DashboardQuery }>) => {
    const { userId } = querySchema.parse(request.query);

    const [{ data: profile }, { data: gps }] = await Promise.all([
      supabase.admin.from("profiles").select("name, onboarding_completed, onboarding_status").eq("id", userId).single(),
      supabase.admin.from("gps_emissions").select("month_ref, value, status").eq("user_id", userId)
    ]);

    return {
      profile,
      contributions: gps ?? []
    };
  });

  app.get(
    "/dashboards/parceiro",
    async (request: FastifyRequest<{ Querystring: DashboardQuery }>) => {
    const { userId } = querySchema.parse(request.query);

    const { data: clients } = await supabase.admin
      .from("partner_clients")
      .select("client_id, created_at")
      .eq("partner_id", userId);

    const clientIds = clients?.map((client: { client_id: string }) => client.client_id) ?? [];

    const [nfse, gps, partner] = await Promise.all([
      clientIds.length
        ? supabase.admin.from("nfse_emissions").select("value").in("user_id", clientIds)
        : Promise.resolve({ data: [] as { value: number | null }[] }),
      clientIds.length
        ? supabase.admin.from("gps_emissions").select("value").in("user_id", clientIds)
        : Promise.resolve({ data: [] as { value: number | null }[] }),
      supabase.admin.from("partners").select("company_name").eq("id", userId).single()
    ]);

    const issuedNfseCount = nfse?.data?.length ?? 0;
    const gpsTotalValue =
      gps?.data?.reduce<number>((accumulator, item: { value: number | null }) => accumulator + (item.value ?? 0), 0) ?? 0;
    const totalRevenue = issuedNfseCount * 3 + gpsTotalValue * 0.06;

    return {
      partner: partner?.data ?? null,
      clients: clients ?? [],
      metrics: {
        totalClients: clientIds.length,
        nfseIssued: nfse?.data?.length ?? 0,
        gpsIssued: gps?.data?.length ?? 0,
        totalRevenue
      }
    };
  });
}
