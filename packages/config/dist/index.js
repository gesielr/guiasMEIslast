"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  autonomoRegisterSchema: () => autonomoRegisterSchema,
  gpsGeneratorSchema: () => gpsGeneratorSchema,
  loginSchema: () => loginSchema,
  meiRegisterSchema: () => meiRegisterSchema,
  nfseRevisaoSchema: () => nfseRevisaoSchema,
  nfseServicoSchema: () => nfseServicoSchema,
  nfseTomadorSchema: () => nfseTomadorSchema,
  parceiroRegisterSchema: () => parceiroRegisterSchema,
  twoFactorSchema: () => twoFactorSchema
});
module.exports = __toCommonJS(src_exports);

// src/auth-schemas.ts
var import_zod = require("zod");
var email = import_zod.z.string().email("Informe um e-mail v\xE1lido");
var phone = import_zod.z.string().min(10, "Informe um telefone v\xE1lido");
var password = import_zod.z.string().min(8, "Senha deve ter ao menos 8 caracteres");
var meiRegisterSchema = import_zod.z.object({
  role: import_zod.z.literal("mei"),
  cnpj: import_zod.z.string().min(14, "CNPJ inv\xE1lido"),
  razaoSocial: import_zod.z.string().min(3),
  email,
  phone,
  password,
  confirmPassword: import_zod.z.string(),
  certificado: import_zod.z.string().optional(),
  aceiteLGPD: import_zod.z.boolean().refine(Boolean, "\xC9 necess\xE1rio aceitar os termos")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas n\xE3o conferem",
  path: ["confirmPassword"]
});
var autonomoRegisterSchema = import_zod.z.object({
  role: import_zod.z.literal("autonomo"),
  cpf: import_zod.z.string().min(11, "CPF inv\xE1lido"),
  pis: import_zod.z.string().min(11, "PIS inv\xE1lido"),
  email,
  phone,
  password,
  confirmPassword: import_zod.z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas n\xE3o conferem",
  path: ["confirmPassword"]
});
var parceiroRegisterSchema = import_zod.z.object({
  role: import_zod.z.literal("parceiro"),
  documento: import_zod.z.string().min(11, "CPF/CNPJ inv\xE1lido"),
  crc: import_zod.z.string().min(5, "Informe o n\xFAmero do CRC"),
  email,
  phone,
  password,
  confirmPassword: import_zod.z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas n\xE3o conferem",
  path: ["confirmPassword"]
});
var loginSchema = import_zod.z.object({
  identifier: import_zod.z.string().min(3, "Informe e-mail ou telefone"),
  password,
  remember: import_zod.z.boolean().optional()
});
var twoFactorSchema = import_zod.z.object({
  code: import_zod.z.string().length(6, "C\xF3digo deve ter 6 d\xEDgitos")
});

// src/nfse-schemas.ts
var import_zod2 = require("zod");
var nfseTomadorSchema = import_zod2.z.object({
  nome: import_zod2.z.string().min(3),
  cpfCnpj: import_zod2.z.string().min(11),
  inscricaoMunicipal: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email(),
  endereco: import_zod2.z.object({
    logradouro: import_zod2.z.string(),
    numero: import_zod2.z.string(),
    complemento: import_zod2.z.string().optional(),
    bairro: import_zod2.z.string(),
    cidade: import_zod2.z.string(),
    estado: import_zod2.z.string().length(2),
    cep: import_zod2.z.string().min(8)
  })
});
var nfseServicoSchema = import_zod2.z.object({
  codigoServico: import_zod2.z.string(),
  discriminacao: import_zod2.z.string().min(5),
  valorServico: import_zod2.z.number().min(0.01),
  aliquota: import_zod2.z.number().min(0),
  issRetido: import_zod2.z.boolean().default(false)
});
var nfseRevisaoSchema = import_zod2.z.object({
  emitirEmailTomador: import_zod2.z.boolean().default(true),
  observacoes: import_zod2.z.string().optional()
});

// src/gps-schemas.ts
var import_zod3 = require("zod");
var gpsGeneratorSchema = import_zod3.z.object({
  competencia: import_zod3.z.date(),
  tipoContribuicao: import_zod3.z.enum(["11", "12", "13", "21"]),
  remuneracao: import_zod3.z.number().min(0),
  codigoPagamento: import_zod3.z.string().min(4),
  descontoINSS: import_zod3.z.boolean().default(false)
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  autonomoRegisterSchema,
  gpsGeneratorSchema,
  loginSchema,
  meiRegisterSchema,
  nfseRevisaoSchema,
  nfseServicoSchema,
  nfseTomadorSchema,
  parceiroRegisterSchema,
  twoFactorSchema
});
