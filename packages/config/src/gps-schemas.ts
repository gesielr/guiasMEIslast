import { z } from "zod";

export const gpsGeneratorSchema = z.object({
  competencia: z.date(),
  tipoContribuicao: z.enum(["11", "12", "13", "21"]),
  remuneracao: z.number().min(0),
  codigoPagamento: z.string().min(4),
  descontoINSS: z.boolean().default(false)
});
