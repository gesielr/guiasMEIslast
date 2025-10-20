import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { env } from "../src/env";
import { createSupabaseClients } from "../services/supabase";
import { ensureCustomerRecord, ensurePartnerRecord, upsertProfile } from "../services/profile-service";

const registerBodySchema = z.object({
  role: z.enum(["mei", "autonomo", "partner"]),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().min(8),
  document: z.string().optional(),
  businessName: z.string().optional(),
  pis: z.string().optional(),
  referralCode: z.string().optional()
});

const loginBodySchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6)
});

type RegisterBody = z.infer<typeof registerBodySchema>;
type LoginBody = z.infer<typeof loginBodySchema>;

export async function registerAuthRoutes(app: FastifyInstance) {
  const supabase = createSupabaseClients();

  app.post("/auth/register", async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const body = registerBodySchema.parse(request.body);

    const { data: userCreated, error: createError } = await supabase.admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name: body.name,
        phone: body.phone,
        user_type: body.role,
        referral_code: body.referralCode ?? null
      }
    });

    if (createError || !userCreated.user) {
      request.log.error({ err: createError }, "failed to create user");
      return reply.badRequest("Não foi possível criar o usuário");
    }

    const userId = userCreated.user.id;

    await upsertProfile(supabase.admin, {
      id: userId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      document: body.document ?? null,
      businessName: body.businessName ?? null,
      userType: body.role,
      partnerId: body.role === "partner" ? userId : null
    });

    if (body.role === "partner") {
      if (!body.document) {
        return reply.badRequest("Documento do parceiro é obrigatório");
      }
      await ensurePartnerRecord(supabase.admin, {
        partnerId: userId,
        companyName: body.businessName ?? body.name,
        document: body.document,
        phone: body.phone
      });
    } else if (body.document) {
      await ensureCustomerRecord(supabase.admin, {
        userId,
        type: body.role,
        encryptedDocument: body.document,
        pis: body.pis ?? null,
        partnerId: body.referralCode ?? null
      });
    }

    const { data: sessionData, error: signInError } = await supabase.anon.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (signInError || !sessionData.session) {
      request.log.error({ err: signInError }, "failed to create session after signup");
    }

    const whatsappLink = body.role === "partner"
      ? null
      : `https://wa.me/${env.WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `${env.WHATSAPP_WELCOME_TEMPLATE} (ID:${userId})`
        )}`;

    return {
      userId,
      session: sessionData.session ?? null,
      whatsappLink,
      redirectTo: body.role === "partner" ? `${env.FRONTEND_URL ?? ""}/dashboard/parceiro` : whatsappLink
    };
  });

  app.post("/auth/login", async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const body = loginBodySchema.parse(request.body);
    const isEmail = body.identifier.includes("@");
    const credentials = isEmail
      ? { email: body.identifier, password: body.password }
      : { phone: body.identifier, password: body.password };

    const { data: sessionData, error } = await supabase.anon.auth.signInWithPassword(credentials as any);

    if (error || !sessionData.session) {
      request.log.warn({ err: error }, "invalid credentials");
      return reply.unauthorized("Credenciais inválidas");
    }

    const { data: profileData } = await supabase.admin
      .from("profiles")
      .select("user_type, partner_id, whatsapp_phone")
      .eq("id", sessionData.user?.id)
      .single();

    return {
      session: sessionData.session,
      profile: profileData ?? null,
      challengeRequired: false
    };
  });

  app.post("/auth/verify-2fa", async (_request: FastifyRequest, _reply: FastifyReply) => {
    return { token: "2fa-not-configured" };
  });
}
