import {
  createSupabaseClients,
  env
} from "./chunk-GKA2ARJQ.js";

// src/index.ts
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySensible from "@fastify/sensible";

// routes/auth.ts
import { z } from "zod";

// services/profile-service.ts
var upsertProfile = async (supabase, profile) => {
};
var ensureCustomerRecord = async (supabase, customer) => {
};
var ensurePartnerRecord = async (supabase, partner) => {
};

// routes/auth.ts
var registerBodySchema = z.object({
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
var loginBodySchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6)
});
async function registerAuthRoutes(app) {
  const supabase = createSupabaseClients();
  app.post("/auth/register", async (request, reply) => {
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
      return reply.badRequest("N\xE3o foi poss\xEDvel criar o usu\xE1rio");
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
        return reply.badRequest("Documento do parceiro \xE9 obrigat\xF3rio");
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
    const whatsappLink = body.role === "partner" ? null : `https://wa.me/${env.WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `${env.WHATSAPP_WELCOME_TEMPLATE} (ID:${userId})`
    )}`;
    return {
      userId,
      session: sessionData.session ?? null,
      whatsappLink,
      redirectTo: body.role === "partner" ? `${env.FRONTEND_URL ?? ""}/dashboard/parceiro` : whatsappLink
    };
  });
  app.post("/auth/login", async (request, reply) => {
    const body = loginBodySchema.parse(request.body);
    const isEmail = body.identifier.includes("@");
    const credentials = isEmail ? { email: body.identifier, password: body.password } : { phone: body.identifier, password: body.password };
    const { data: sessionData, error } = await supabase.anon.auth.signInWithPassword(credentials);
    if (error || !sessionData.session) {
      request.log.warn({ err: error }, "invalid credentials");
      return reply.unauthorized("Credenciais inv\xE1lidas");
    }
    const { data: profileData } = await supabase.admin.from("profiles").select("user_type, partner_id, whatsapp_phone").eq("id", sessionData.user?.id).single();
    return {
      session: sessionData.session,
      profile: profileData ?? null,
      challengeRequired: false
    };
  });
  app.post("/auth/verify-2fa", async (_request, _reply) => {
    return { token: "2fa-not-configured" };
  });
}

// routes/dashboard.ts
import { z as z2 } from "zod";
var querySchema = z2.object({ userId: z2.string().uuid() });
async function registerDashboardRoutes(app) {
  const supabase = createSupabaseClients();
  app.get(
    "/dashboards/mei",
    async (request) => {
      const { userId } = querySchema.parse(request.query);
      const [{ data: profile }, { data: nfse }, { data: gps }] = await Promise.all([
        supabase.admin.from("profiles").select("name, onboarding_completed, onboarding_status").eq("id", userId).single(),
        supabase.admin.from("nfse_emissions").select("value, status").eq("user_id", userId),
        supabase.admin.from("gps_emissions").select("value, status").eq("user_id", userId)
      ]);
      const nfseIssued = nfse?.filter((item) => item.status === "issued").length ?? 0;
      const gpsIssued = gps?.filter((item) => item.status === "issued").length ?? 0;
      const gpsTotal = gps?.reduce((acc, item) => acc + (item.value ?? 0), 0) ?? 0;
      return {
        profile,
        nfseIssued,
        gpsIssued,
        gpsTotal
      };
    }
  );
  app.get(
    "/dashboards/autonomo",
    async (request) => {
      const { userId } = querySchema.parse(request.query);
      const [{ data: profile }, { data: gps }] = await Promise.all([
        supabase.admin.from("profiles").select("name, onboarding_completed, onboarding_status").eq("id", userId).single(),
        supabase.admin.from("gps_emissions").select("month_ref, value, status").eq("user_id", userId)
      ]);
      return {
        profile,
        contributions: gps ?? []
      };
    }
  );
  app.get(
    "/dashboards/parceiro",
    async (request) => {
      const { userId } = querySchema.parse(request.query);
      const { data: clients } = await supabase.admin.from("partner_clients").select("client_id, created_at").eq("partner_id", userId);
      const clientIds = clients?.map((client) => client.client_id) ?? [];
      const [nfse, gps, partner] = await Promise.all([
        clientIds.length ? supabase.admin.from("nfse_emissions").select("value").in("user_id", clientIds) : Promise.resolve({ data: [] }),
        clientIds.length ? supabase.admin.from("gps_emissions").select("value").in("user_id", clientIds) : Promise.resolve({ data: [] }),
        supabase.admin.from("partners").select("company_name").eq("id", userId).single()
      ]);
      const issuedNfseCount = nfse?.data?.length ?? 0;
      const gpsTotalValue = gps?.data?.reduce((accumulator, item) => accumulator + (item.value ?? 0), 0) ?? 0;
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
    }
  );
}

// src/nfse/adapters/adn-client.ts
import axios from "axios";
import { readFile } from "fs/promises";
import https from "https";
async function loadPfxBuffer() {
  if (env.NFSE_CERT_PFX_BASE64) {
    return Buffer.from(env.NFSE_CERT_PFX_BASE64, "base64");
  }
  if (env.NFSE_CERT_PFX_PATH) {
    return await readFile(env.NFSE_CERT_PFX_PATH);
  }
  return void 0;
}
function resolveBaseUrl(module) {
  switch (module) {
    case "contribuintes":
      return env.NFSE_CONTRIBUINTES_BASE_URL || "";
    case "parametros":
      return env.NFSE_PARAMETROS_BASE_URL || "";
    case "danfse":
      return env.NFSE_DANFSE_BASE_URL || "";
  }
}
async function createAdnClient(options) {
  const pfx = await loadPfxBuffer();
  if (!pfx && !env.NFSE_CERT_PKCS11_LIBRARY) {
    throw new Error("Nenhuma credencial NFSe configurada (PFX ou PKCS#11)");
  }
  const httpsAgent = new https.Agent({
    pfx,
    passphrase: env.NFSE_CERT_PFX_PASS,
    rejectUnauthorized: true
  });
  return axios.create({
    baseURL: resolveBaseUrl(options.module),
    httpsAgent,
    headers: {
      "Content-Type": "application/xml",
      Accept: "application/json"
    },
    timeout: 15e3
  });
}

// src/nfse/crypto/xml-signer.ts
import { SignedXml } from "xml-crypto";
import { DOMParser } from "@xmldom/xmldom";
function signInfDps(xml, options, SignedXmlImpl) {
  const SignedImpl = SignedXmlImpl ?? SignedXml;
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  function findFirstByLocalName(node, localName) {
    if (!node)
      return null;
    if (node.localName === localName)
      return node;
    const children = node.childNodes || node.childNodes || [];
    for (let i = 0; i < children.length; i++) {
      const found = findFirstByLocalName(children[i], localName);
      if (found)
        return found;
    }
    return null;
  }
  const infDpsNode = findFirstByLocalName(doc, "infDPS");
  if (!infDpsNode) {
    throw new Error("Elemento <infDPS> n\xE3o encontrado no XML");
  }
  const idAttr = infDpsNode.getAttribute("Id");
  if (!idAttr) {
    throw new Error("Elemento <infDPS> deve conter atributo Id");
  }
  const signer = new SignedImpl();
  signer.addReference(
    `#${idAttr}`,
    ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
  );
  signer.signatureAlgorithm = options.signatureAlgorithm === "rsa-sha1" ? "http://www.w3.org/2000/09/xmldsig#rsa-sha1" : "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
  signer.signingKey = options.privateKeyPem;
  signer.keyInfoProvider = {
    getKeyInfo: () => {
      const pem = options.certificatePem || "";
      const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/g, "").replace(/-----END CERTIFICATE-----/g, "").replace(/\r?\n|\r/g, "");
      return `<X509Data><X509Certificate>${b64}</X509Certificate></X509Data>`;
    }
  };
  signer.computeSignature(xml, {
    prefix: "",
    location: {
      reference: "/*[local-name(.)='DPS']",
      action: "append"
    }
  });
  return signer.getSignedXml();
}

// src/nfse/templates/dps-template.ts
import { randomUUID } from "crypto";
function buildDpsXml(dto) {
  const id = dto.id || `DPS-${randomUUID()}`;
  const tomador = dto.tomador || {};
  const valores = dto.valores || { subtotal: dto.value ?? 0, total: dto.value ?? 0 };
  return `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.abrasf.org.br/dps" versao="1.0">
  <infDPS Id="${id}">
    <identificacao>
      <numero>${dto.numero ?? 1}</numero>
      <serie>${dto.serie ?? "1"}</serie>
      <dataEmissao>${dto.dataEmissao ?? (/* @__PURE__ */ new Date()).toISOString()}</dataEmissao>
    </identificacao>
    <prestador>
      <cpfCnpj>${dto.prestador?.cpfCnpj ?? ""}</cpfCnpj>
      <inscricaoMunicipal>${dto.prestador?.inscricaoMunicipal ?? ""}</inscricaoMunicipal>
    </prestador>
    <tomador>
      <nome>${escapeXml(tomador.nome ?? "")}</nome>
      <documento>${escapeXml(tomador.documento ?? "")}</documento>
      <email>${escapeXml(tomador.email ?? "")}</email>
      <endereco>${escapeXml(tomador.endereco ?? "")}</endereco>
    </tomador>
    <itens>
      <item>
        <descricao>${escapeXml(dto.serviceDescription ?? dto.description ?? "")}</descricao>
        <quantidade>${dto.quantidade ?? 1}</quantidade>
        <valorUnitario>${(dto.value ?? 0).toFixed(2)}</valorUnitario>
        <valorTotal>${(dto.value ?? 0).toFixed(2)}</valorTotal>
      </item>
    </itens>
    <valores>
      <subtotal>${(valores.subtotal ?? 0).toFixed(2)}</subtotal>
      <total>${(valores.total ?? 0).toFixed(2)}</total>
    </valores>
  </infDPS>
</DPS>`;
}
function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

// src/nfse/repositories/nfse-emissions.repo.ts
import crypto from "crypto";
var { admin } = createSupabaseClients();
async function saveEmission(payload) {
  const { error, data } = await admin.from("nfse_emissions").insert({
    user_id: payload.userId,
    protocolo: payload.protocolo,
    status: payload.status,
    xml_hash: payload.xmlHash,
    tomador: payload.tomador ?? null,
    valores: payload.valores ?? null,
    municipio: payload.municipio ?? null
  }).select();
  if (error)
    throw error;
  return data?.[0];
}
async function updateEmissionStatus(protocolo, status, mensagens) {
  await admin.from("nfse_emissions").update({ status, updated_at: /* @__PURE__ */ new Date() }).eq("protocolo", protocolo);
}
function hashXml(xml) {
  return crypto.createHash("sha256").update(xml).digest("hex");
}
async function listPendingEmissions() {
  const { data } = await admin.from("nfse_emissions").select("id, protocolo").in("status", ["EM_FILA", "PROCESSANDO"]).limit(100);
  return data ?? [];
}
async function attachPdf(emissionId, pdfBuffer) {
  const key = `nfse-pdf-${emissionId}.pdf`;
  await admin.from("nfse_emissions").update({ pdf_url: `https://files.guiasmei.com/nfse/${key}` }).eq("id", emissionId);
}

// src/nfse/crypto/pfx-utils.ts
import forge from "node-forge";
function pfxToPem(buffer, passphrase, forgeImpl) {
  const f = forgeImpl ?? forge;
  const p12Asn1 = f.asn1.fromDer(buffer.toString("binary"));
  const p12 = f.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase || "");
  let keyObj = null;
  let certObj = null;
  for (const safeContent of p12.safeContents) {
    for (const safeBag of safeContent.safeBags) {
      if (safeBag.type === f.pki.oids.pkcs8ShroudedKeyBag || safeBag.type === f.pki.oids.keyBag) {
        keyObj = safeBag.key;
      }
      if (safeBag.type === f.pki.oids.certBag) {
        certObj = safeBag.cert;
      }
    }
  }
  if (!keyObj || !certObj) {
    throw new Error("PFX does not contain key or certificate");
  }
  const privateKeyPem = f.pki.privateKeyToPem(keyObj);
  const certificatePem = f.pki.certificateToPem(certObj);
  return { privateKeyPem, certificatePem };
}

// src/nfse/services/nfse.service.ts
var NfseService = class {
  async emit(dto) {
    const xml = buildDpsXml(dto);
    const { admin: admin3 } = (await import("./supabase-VLF2RB4Y.js")).createSupabaseClients();
    const { data: credData, error: credError } = await admin3.from("nfse_credentials").select("storage_path, pass").eq("user_id", dto.userId).order("not_after", { ascending: false }).limit(1);
    if (credError || !credData?.[0]) {
      throw new Error("Nenhuma credencial PFX encontrada para o usu\xE1rio");
    }
    const { storage_path, pass } = credData[0];
    const { getCredentialPfxBuffer } = await import("./credentials.repo-57UH2JBH.js");
    const pfxBuffer = await getCredentialPfxBuffer(storage_path);
    const { privateKeyPem, certificatePem } = pfxToPem(pfxBuffer, pass ?? env.NFSE_CERT_PFX_PASS);
    const signedXml = signInfDps(xml, { certificatePem, privateKeyPem });
    const adn = await createAdnClient({ module: "contribuintes" });
    const response = await adn.post("/contribuintes/servicos/dps", signedXml, {
      headers: { "Content-Type": "application/xml" }
    });
    await saveEmission({
      userId: dto.userId,
      protocolo: response.data?.uuidProcessamento ?? `PROTO-${Date.now()}`,
      status: "EM_FILA",
      xmlHash: hashXml(signedXml)
    });
    return {
      protocolo: response.data?.uuidProcessamento ?? `PROTO-${Date.now()}`
    };
  }
  async pollStatus(protocolo) {
    const adn = await createAdnClient({ module: "contribuintes" });
    const { data } = await adn.get(`/contribuintes/servicos/dps/${protocolo}`);
    await updateEmissionStatus(protocolo, data.situacao ?? "UNKNOWN", data.mensagens ?? null);
    return data;
  }
  async downloadDanfe(chave) {
    const adn = await createAdnClient({ module: "danfse" });
    const { data } = await adn.get(`/danfse/${chave}`, { responseType: "arraybuffer" });
    return Buffer.from(data);
  }
  async attachPdf(emissionId, pdf) {
    await attachPdf(emissionId, pdf);
  }
};

// src/nfse/dto/create-dps.dto.ts
import { z as z3 } from "zod";
var createDpsSchema = z3.object({
  userId: z3.string().uuid(),
  value: z3.number().positive(),
  description: z3.string().min(3),
  certificateId: z3.string().optional()
});
var cancelSchema = z3.object({ protocolo: z3.string().min(1) });

// src/nfse/controllers/nfse.controller.ts
async function registerNfseController(app) {
  const service = new NfseService();
  app.post("/services/nfse", async (request, reply) => {
    const dto = createDpsSchema.parse(request.body);
    return service.emit(dto);
  });
  app.post("/services/nfse/credentials", async (request, reply) => {
    const body = request.body;
    const dto = (await import("./credential.dto-2YDMSASX.js")).credentialSchema.parse(body);
    if (!dto.pfxBase64) {
      return reply.badRequest("Arquivo PFX n\xE3o enviado");
    }
    const pfxBuffer = Buffer.from(dto.pfxBase64, "base64");
    if (pfxBuffer.length < 1e3 || pfxBuffer.length > 3e4) {
      return reply.badRequest("Arquivo PFX fora do tamanho esperado (1KB ~ 30KB)");
    }
    try {
      const forge2 = await import("node-forge");
      const f = forge2.default ?? forge2;
      const asn1 = f.asn1.fromDer(pfxBuffer.toString("binary"));
      f.pkcs12.pkcs12FromAsn1(asn1);
    } catch (err) {
      return reply.badRequest("Arquivo n\xE3o \xE9 um PFX v\xE1lido");
    }
    const { storeCredential } = await import("./credentials.repo-57UH2JBH.js");
    const created = await storeCredential({
      userId: dto.userId,
      type: dto.type,
      subject: dto.subject,
      document: dto.document,
      notAfter: dto.notAfter,
      pfxBase64: dto.pfxBase64
    });
    return created;
  });
  app.get("/services/nfse/:id", async (request) => {
    const { id } = request.params;
    return service.pollStatus(id);
  });
  app.post("/services/nfse/:id/cancel", async (request) => {
    const { id } = request.params;
    const body = request.body;
    const dto = cancelSchema.parse({ protocolo: id, ...body ?? {} });
    return { canceled: true, protocolo: id };
  });
  app.get("/services/nfse/:id/pdf", async (request, reply) => {
    const { id } = request.params;
    const pdf = await service.downloadDanfe(id);
    reply.type("application/pdf");
    reply.header("Content-Disposition", `inline; filename=NFSe-${id}.pdf`);
    return reply.send(pdf);
  });
}

// src/nfse/workers/scheduler.ts
import cron from "node-cron";

// src/nfse/workers/status-poller.ts
async function pollPendingEmissions() {
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
      console.error(error);
    }
  }
}

// src/nfse/services/certificate-monitor.service.ts
var { admin: admin2 } = createSupabaseClients();
async function checkCertificatesExpiry() {
  const { data } = await admin2.from("nfse_credentials").select("id, user_id, not_after").lte("not_after", new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString());
  if (!data || data.length === 0)
    return;
  for (const cert of data) {
    console.log("Cert expiring soon:", cert.id, cert.not_after);
  }
}

// src/nfse/workers/scheduler.ts
function startScheduler() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await pollPendingEmissions();
    } catch (err) {
      console.error("Error polling emissions:", err);
    }
  });
  cron.schedule("30 0 * * *", async () => {
    try {
      await checkCertificatesExpiry();
    } catch (err) {
      console.error("Error checking certificate expiry:", err);
    }
  });
}

// routes/gps.ts
import { z as z4 } from "zod";
var gpsSchema = z4.object({
  userId: z4.string().uuid(),
  monthRef: z4.string().regex(/^\d{4}-\d{2}$/),
  value: z4.number().positive(),
  inssCode: z4.string().optional()
});
async function registerGpsRoutes(app) {
  const supabase = createSupabaseClients();
  app.post("/gps", async (request, reply) => {
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
      return reply.internalServerError("N\xE3o foi poss\xEDvel registrar a guia");
    }
    return {
      linhaDigitavel: barcode,
      pdfUrl: `https://files.guiasmei.com/gps/${barcode}.pdf`
    };
  });
}

// routes/payments.ts
import { z as z5 } from "zod";
var checkoutSchema = z5.object({
  userId: z5.string().uuid(),
  successUrl: z5.string().url().optional(),
  cancelUrl: z5.string().url().optional()
});
async function registerPaymentRoutes(app) {
  app.post("/payments/checkout", async (request) => {
    const body = checkoutSchema.parse(request.body);
    const checkoutUrl = env.FRONTEND_URL ? `${env.FRONTEND_URL}/pagamentos?user_id=${body.userId}` : `https://checkout.guiasmei.com/session/${body.userId}`;
    return {
      checkoutUrl
    };
  });
}

// routes/whatsapp.ts
import { z as z6 } from "zod";
var messageSchema = z6.object({
  to: z6.string().min(8),
  message: z6.string().min(1)
});
async function registerWhatsappRoutes(app) {
  app.post("/whatsapp", async (request) => {
    const payload = messageSchema.parse(request.body);
    request.log.info({ payload }, "WhatsApp message dispatched");
    return { ok: true };
  });
}

// src/index.ts
async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info"
    }
  });
  await app.register(fastifyCors, {
    origin: true,
    credentials: true
  });
  await app.register(fastifySensible);
  await registerAuthRoutes(app);
  await registerDashboardRoutes(app);
  await registerNfseController(app);
  await registerGpsRoutes(app);
  await registerPaymentRoutes(app);
  await registerWhatsappRoutes(app);
  return app;
}
buildServer().then(async (app) => {
  app.listen({ port: env.PORT, host: "0.0.0.0" }, (error, address) => {
    if (error) {
      app.log.error(error, "Falha ao iniciar servidor");
      process.exit(1);
    }
    app.log.info(`API GuiasMEI escutando em ${address}`);
    if (env.NODE_ENV !== "test") {
      try {
        startScheduler();
        app.log.info("NFSe scheduler started");
      } catch (err) {
        app.log.error(err, "Failed to start NFSe scheduler");
      }
    }
  });
}).catch((error) => {
  console.error("Erro ao iniciar servidor", error);
  process.exit(1);
});
