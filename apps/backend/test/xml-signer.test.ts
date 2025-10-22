import { describe, it, expect } from 'vitest'
import { signInfDps } from "../src/nfse/crypto/xml-signer";

class MockSignedXml {
  signingKey: any;
  signatureAlgorithm?: string;
  addReference() {}
  computeSignature() {}
  getSignedXml() { return "<signed/>"; }
}

const xml = `<?xml version="1.0"?><DPS><infDPS Id="ID123"><numero>1</numero></infDPS></DPS>`;

describe('xml-signer', () => {
  it('returns signed xml string using mock SignedXml', () => {
    const signed = signInfDps(xml, { certificatePem: "", privateKeyPem: "" }, MockSignedXml as any);
    expect(typeof signed).toBe('string');
    expect(signed.length).toBeGreaterThan(0);
  });
});
