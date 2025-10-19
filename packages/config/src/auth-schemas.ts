import { z } from "zod";

const email = z.string().email("Informe um e-mail válido");
const phone = z.string().min(10, "Informe um telefone válido");
const password = z.string().min(8, "Senha deve ter ao menos 8 caracteres");

export const meiRegisterSchema = z
  .object({
    role: z.literal("mei"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    razaoSocial: z.string().min(3),
    email,
    phone,
    password,
    confirmPassword: z.string(),
    certificado: z.string().optional(),
    aceiteLGPD: z.boolean().refine(Boolean, "É necessário aceitar os termos")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"]
  });

export const autonomoRegisterSchema = z
  .object({
    role: z.literal("autonomo"),
    cpf: z.string().min(11, "CPF inválido"),
    pis: z.string().min(11, "PIS inválido"),
    email,
    phone,
    password,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"]
  });

export const parceiroRegisterSchema = z
  .object({
    role: z.literal("parceiro"),
    documento: z.string().min(11, "CPF/CNPJ inválido"),
    crc: z.string().min(5, "Informe o número do CRC"),
    email,
    phone,
    password,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  identifier: z.string().min(3, "Informe e-mail ou telefone"),
  password,
  remember: z.boolean().optional()
});

export const twoFactorSchema = z.object({
  code: z.string().length(6, "Código deve ter 6 dígitos")
});
