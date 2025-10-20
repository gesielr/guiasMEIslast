import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySensible from "@fastify/sensible";
import { env } from "./env";
import { registerAuthRoutes } from "../routes/auth";
import { registerDashboardRoutes } from "../routes/dashboard";
import { registerNfseRoutes } from "../routes/nfse";
import { registerGpsRoutes } from "../routes/gps";
import { registerPaymentRoutes } from "../routes/payments";
import { registerWhatsappRoutes } from "../routes/whatsapp";

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
  await registerNfseRoutes(app);
  await registerGpsRoutes(app);
  await registerPaymentRoutes(app);
  await registerWhatsappRoutes(app);

  return app;
}

buildServer()
  .then((app) => {
    app.listen({ port: env.PORT, host: "0.0.0.0" }, (error, address) => {
      if (error) {
        app.log.error(error, "Falha ao iniciar servidor");
        process.exit(1);
      }
      app.log.info(`API GuiasMEI escutando em ${address}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar servidor", error);
    process.exit(1);
  });
