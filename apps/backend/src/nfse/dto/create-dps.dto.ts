import { z } from "zod";

const documentoSchema = z.string().min(11);

const prestadorSchema = z.object({
  cpfCnpj: documentoSchema,
  inscricaoMunicipal: z.string().min(1),
  codigoMunicipio: z.string().length(7)
});

const enderecoSchema = z.object({
  codigoMunicipio: z.string().length(7),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  complemento: z.string().optional(),
  cep: z.string().min(8).max(8),
  uf: z.string().length(2)
});

const tomadorSchema = z.object({
  nome: z.string().min(1),
  documento: documentoSchema,
  email: z.string().email().optional(),
  endereco: enderecoSchema
});

const servicoSchema = z.object({
  codigoTributacaoMunicipio: z.string().min(1),
  itemListaLc116: z.string().min(1),
  codigoCnae: z.string().min(1),
  descricao: z.string().min(3),
  codigoMunicipio: z.string().length(7),
  aliquota: z.number().nonnegative(),
  valorServicos: z.number().positive(),
  valorDeducoes: z.number().nonnegative().default(0),
  valorIss: z.number().nonnegative().optional()
});

const identificationSchema = z.object({
  numero: z.string().min(1),
  serie: z.string().min(1),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, "Competencia no formato YYYY-MM"),
  dataEmissao: z.string().optional()
});

const regimeSchema = z.object({
  regimeEspecialTributacao: z.string().min(1),
  optanteSimples: z.boolean(),
  incentivoFiscal: z.boolean().default(false)
});

export const createDpsSchema = z.object({
  userId: z.string().uuid(),
  identification: identificationSchema,
  prestador: prestadorSchema,
  tomador: tomadorSchema,
  servico: servicoSchema,
  regime: regimeSchema,
  referencias: z
    .object({
      codigoMunicipioIncidencia: z.string().length(7),
      naturezaOperacao: z.string().min(1)
    })
    .optional()
});

export type CreateDpsDto = z.infer<typeof createDpsSchema>;

export const cancelSchema = z.object({ protocolo: z.string().min(1) });
