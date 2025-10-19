// src/auth-schemas.ts
import { z } from "zod";
var email = z.string().email("Informe um e-mail v\xE1lido");
var phone = z.string().min(10, "Informe um telefone v\xE1lido");
var password = z.string().min(8, "Senha deve ter ao menos 8 caracteres");
var meiRegisterSchema = z.object({
  role: z.literal("mei"),
  cnpj: z.string().min(14, "CNPJ inv\xE1lido"),
  razaoSocial: z.string().min(3),
  email,
  phone,
  password,
  confirmPassword: z.string(),
  certificado: z.string().optional(),
  aceiteLGPD: z.boolean().refine(Boolean, "\xC9 necess\xE1rio aceitar os termos")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas n\xE3o conferem",
  path: ["confirmPassword"]
});
var autonomoRegisterSchema = z.object({
  role: z.literal("autonomo"),
  cpf: z.string().min(11, "CPF inv\xE1lido"),
  pis: z.string().min(11, "PIS inv\xE1lido"),
  email,
  phone,
  password,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas n\xE3o conferem",
  path: ["confirmPassword"]
});
var parceiroRegisterSchema = z.object({
  role: z.literal("parceiro"),
  documento: z.string().min(11, "CPF/CNPJ inv\xE1lido"),
  crc: z.string().min(5, "Informe o n\xFAmero do CRC"),
  email,
  phone,
  password,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas n\xE3o conferem",
  path: ["confirmPassword"]
});
var loginSchema = z.object({
  identifier: z.string().min(3, "Informe e-mail ou telefone"),
  password,
  remember: z.boolean().optional()
});
var twoFactorSchema = z.object({
  code: z.string().length(6, "C\xF3digo deve ter 6 d\xEDgitos")
});

// src/nfse-schemas.ts
import { z as z2 } from "zod";
var nfseTomadorSchema = z2.object({
  nome: z2.string().min(3),
  cpfCnpj: z2.string().min(11),
  inscricaoMunicipal: z2.string().optional(),
  email: z2.string().email(),
  endereco: z2.object({
    logradouro: z2.string(),
    numero: z2.string(),
    complemento: z2.string().optional(),
    bairro: z2.string(),
    cidade: z2.string(),
    estado: z2.string().length(2),
    cep: z2.string().min(8)
  })
});
var nfseServicoSchema = z2.object({
  codigoServico: z2.string(),
  discriminacao: z2.string().min(5),
  valorServico: z2.number().min(0.01),
  aliquota: z2.number().min(0),
  issRetido: z2.boolean().default(false)
});
var nfseRevisaoSchema = z2.object({
  emitirEmailTomador: z2.boolean().default(true),
  observacoes: z2.string().optional()
});

// src/gps-schemas.ts
import { z as z3 } from "zod";
var gpsGeneratorSchema = z3.object({
  competencia: z3.date(),
  tipoContribuicao: z3.enum(["11", "12", "13", "21"]),
  remuneracao: z3.number().min(0),
  codigoPagamento: z3.string().min(4),
  descontoINSS: z3.boolean().default(false)
});
export {
  autonomoRegisterSchema,
  gpsGeneratorSchema,
  loginSchema,
  meiRegisterSchema,
  nfseRevisaoSchema,
  nfseServicoSchema,
  nfseTomadorSchema,
  parceiroRegisterSchema,
  twoFactorSchema
};
