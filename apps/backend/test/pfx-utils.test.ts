import { describe, it, expect } from 'vitest'
import { pfxToPem } from "../src/nfse/crypto/pfx-utils";

function makeFakeForge() {
  return {
    asn1: { fromDer: (d: any) => ({}) },
    pkcs12: { pkcs12FromAsn1: (a: any, p: any) => ({ safeContents: [] }) },
    pki: {
      oids: { pkcs8ShroudedKeyBag: 1, keyBag: 2, certBag: 3 },
      privateKeyToPem: (k: any) => "--PRIVATE--",
      certificateToPem: (c: any) => "--CERT--"
    }
  };
}

describe('pfx-utils', () => {
  it('throws when no key/cert found', () => {
    const fake = makeFakeForge();
    expect(() => pfxToPem(Buffer.from(""), "", fake)).toThrow();
  });
});
