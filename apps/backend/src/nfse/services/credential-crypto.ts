import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../../env";

interface EncodedSecret {
  encrypted: string;
  iv: string;
  tag: string;
}

function deriveKey(): Buffer {
  return createHash("sha256").update(env.NFSE_CREDENTIAL_SECRET).digest();
}

export function encryptSecret(plainText: string): EncodedSecret {
  if (!plainText) {
    throw new Error("Certificate password must not be empty");
  }

  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  };
}

export function decryptSecret(secret: EncodedSecret): string {
  const key = deriveKey();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(secret.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(secret.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(secret.encrypted, "base64")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
