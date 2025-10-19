"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ApiError: () => ApiError,
  createSdk: () => createSdk
});
module.exports = __toCommonJS(src_exports);

// src/client.ts
var import_cross_fetch = __toESM(require("cross-fetch"));
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
  const response = await (0, import_cross_fetch.default)(`${config.baseUrl}${path}`, {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiError,
  createSdk
});
