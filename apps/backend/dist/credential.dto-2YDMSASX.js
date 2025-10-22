// src/nfse/dto/credential.dto.ts
import { z } from "zod";
var credentialSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["A1", "A3"]).default("A1"),
  subject: z.string().min(1),
  document: z.string().min(1),
  notAfter: z.string(),
  pfxBase64: z.string().min(1)
});
export {
  credentialSchema
};
