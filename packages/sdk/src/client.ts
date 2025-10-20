import fetch from "cross-fetch";

export type SdkMode = "mock" | "sandbox" | "production";

export interface SdkConfig {
  baseUrl: string;
  mode: SdkMode;
  token?: string;
}

export class ApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(`API error (${status})`);
  }
}

async function request<T>(config: SdkConfig, path: string, init?: RequestInit): Promise<T> {
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

  return response.json() as Promise<T>;
}

export function createSdk(config: SdkConfig) {
  return {
    auth: {
      async register(payload: Record<string, unknown>) {
        if (config.mode === "mock") {
         return {
            userId: "mock-user",
            whatsappLink: "https://wa.me/5511999999999?text=Bem-vindo%20ao%20GuiasMEI",
            redirectTo: "/dashboard"
          } as const;
        }
        return request(config, "/auth/register", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async login(payload: { identifier: string; password: string }) {
        if (config.mode === "mock") {
          return {
            session: { access_token: "mock", refresh_token: "mock" },
            profile: { user_type: "partner" },
            challengeRequired: false
          } as const;
        }
        return request(config, "/auth/login", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async verify2fa(payload: { code: string }) {
        if (config.mode === "mock") {
          return { token: "mock-session-token" } as const;
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
              value: Math.random() * 18000
            }))
          } as const;
        }
        return request(config, "/dashboards/mei");
      },
      async getAutonomo() {
        if (config.mode === "mock") {
          return {
            contributionsYear: 9,
            nextCompetence: "2024-04-20",
            calendar: []
          } as const;
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
          } as const;
        }
        return request(config, "/dashboards/parceiro");
      }
    },
    nfse: {
      async emitir(payload: Record<string, unknown>) {
        if (config.mode === "mock") {
          return {
            protocolo: "NFSE-MOCK-0001",
            numero: "1",
            pdfUrl: "https://example.com/mock-nfse.pdf"
          } as const;
        }
        return request(config, "/nfse", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async listar() {
        if (config.mode === "mock") {
          return [] as const;
        }
        return request(config, "/nfse");
      }
    },
    gps: {
      async gerar(payload: Record<string, unknown>) {
        if (config.mode === "mock") {
          return {
            linhaDigitavel: "39990.00009 01234.567899 87654.321000 1 12340000012345",
            pdfUrl: "https://example.com/mock-gps.pdf"
          } as const;
        }
        return request(config, "/gps", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    },
    payments: {
      async createCheckout(payload: Record<string, unknown>) {
        if (config.mode === "mock") {
          return {
            checkoutUrl: "https://checkout.mock/pix"
          } as const;
        }
        return request(config, "/payments/checkout", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    },
    whatsapp: {
      async send(payload: Record<string, unknown>) {
        if (config.mode === "mock") {
          console.info("[mock:whatsapp]", payload);
          return { id: "mock-message" } as const;
        }
        return request(config, "/whatsapp", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
    }
  };
}
