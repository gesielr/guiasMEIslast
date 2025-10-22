import forge from "node-forge";

export interface PfxPemResult {
  privateKeyPem: string;
  certificatePem: string;
}

export function pfxToPem(buffer: Buffer, passphrase?: string, forgeImpl?: any): PfxPemResult {
  const f = forgeImpl ?? forge;
  const p12Asn1 = f.asn1.fromDer(buffer.toString("binary"));
  const p12 = f.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase || "");

  let keyObj: any = null;
  let certObj: any = null;

  for (const safeContent of p12.safeContents) {
    for (const safeBag of safeContent.safeBags) {
      if (safeBag.type === f.pki.oids.pkcs8ShroudedKeyBag || safeBag.type === f.pki.oids.keyBag) {
        keyObj = safeBag.key;
      }
      if (safeBag.type === f.pki.oids.certBag) {
        certObj = safeBag.cert;
      }
    }
  }

  if (!keyObj || !certObj) {
    throw new Error("PFX does not contain key or certificate");
  }

  const privateKeyPem = f.pki.privateKeyToPem(keyObj);
  const certificatePem = f.pki.certificateToPem(certObj);

  return { privateKeyPem, certificatePem };
}
