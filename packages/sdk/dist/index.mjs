// src/client.ts
import fetch from "cross-fetch";
var ApiError = class extends Error {
  constructor(status, payload) {
    super(`API error (${status})`);
    this.status = status;
    this.payload = payload;
  }
};
async function request(config, path, init) {
  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (config.token) {
    headers.set("Authorization", `Bearer ${config.token}`);
  }
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers
  });
  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch(() => null));
  }
  return response.json();
}
function createSdk(config) {
  return {
    auth: {
      async register(payload) {
        if (config.mode === "mock") {
          return { userId: "mock-user", ...payload };
        }
        return request(config, "/auth/register", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async login(payload) {
        if (config.mode === "mock") {
          return { token: "mock-token", challengeRequired: true };
        }
        return request(config, "/auth/login", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async verify2fa(payload) {
        if (config.mode === "mock") {
          return { token: "mock-session-token" };
        }
        return request(config, "/auth/verify-2fa", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    },
    dashboards: {
      async getMei() {
        if (config.mode === "mock") {
          return {
            revenueMonth: 12500,
            nfseIssued: 18,
            taxesPaid: 4200,
            chart: Array.from({ length: 12 }, (_, idx) => ({
              month: idx + 1,
              value: Math.random() * 18e3
            }))
          };
        }
        return request(config, "/dashboards/mei");
      },
      async getAutonomo() {
        if (config.mode === "mock") {
          return {
            contributionsYear: 9,
            nextCompetence: "2024-04-20",
            calendar: []
          };
        }
        return request(config, "/dashboards/autonomo");
      },
      async getParceiro() {
        if (config.mode === "mock") {
          return {
            clients: 42,
            commissions: 2175.35,
            pending: 5,
            chart: []
          };
        }
        return request(config, "/dashboards/parceiro");
      }
    },
    nfse: {
      async emitir(payload) {
        if (config.mode === "mock") {
          return {
            protocolo: "NFSE-MOCK-0001",
            numero: "1",
            pdfUrl: "https://example.com/mock-nfse.pdf"
          };
        }
        return request(config, "/nfse", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async listar() {
        if (config.mode === "mock") {
          return [];
        }
        return request(config, "/nfse");
      }
    },
    gps: {
      async gerar(payload) {
        if (config.mode === "mock") {
          return {
            linhaDigitavel: "39990.00009 01234.567899 87654.321000 1 12340000012345",
            pdfUrl: "https://example.com/mock-gps.pdf"
          };
        }
        return request(config, "/gps", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    },
    payments: {
      async createCheckout(payload) {
        if (config.mode === "mock") {
          return {
            checkoutUrl: "https://checkout.mock/pix"
          };
        }
        return request(config, "/payments/checkout", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    },
    whatsapp: {
      async send(payload) {
        if (config.mode === "mock") {
          console.info("[mock:whatsapp]", payload);
          return { id: "mock-message" };
        }
        return request(config, "/whatsapp", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    }
  };
}
export {
  ApiError,
  createSdk
};
