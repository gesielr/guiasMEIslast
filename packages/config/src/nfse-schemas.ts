import { z } from "zod";

export const nfseTomadorSchema = z.object({
  nome: z.string().min(3),
  cpfCnpj: z.string().min(11),
  inscricaoMunicipal: z.string().optional(),
  email: z.string().email(),
  endereco: z.object({
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string().length(2),
    cep: z.string().min(8)
  })
});

export const nfseServicoSchema = z.object({
  codigoServico: z.string(),
  discriminacao: z.string().min(5),
  valorServico: z.number().min(0.01),
  aliquota: z.number().min(0),
  issRetido: z.boolean().default(false)
});

export const nfseRevisaoSchema = z.object({
  emitirEmailTomador: z.boolean().default(true),
  observacoes: z.string().optional()
});
