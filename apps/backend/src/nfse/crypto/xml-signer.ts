import { SignedXml } from "xml-crypto";
import { DOMParser } from "@xmldom/xmldom";

export type SignatureAlgorithm = "rsa-sha1" | "rsa-sha256";

export interface XmlSignerOptions {
  certificatePem: string;
  privateKeyPem: string;
  signatureAlgorithm?: SignatureAlgorithm;
}

export function signInfDps(xml: string, options: XmlSignerOptions, SignedXmlImpl?: typeof SignedXml): string {
  const SignedImpl = SignedXmlImpl ?? SignedXml;
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  // find first element with local-name 'infDPS'
  function findFirstByLocalName(node: any, localName: string): any {
    if (!node) return null;
    if (node.localName === localName) return node;
    const children = node.childNodes || node.childNodes || [];
    for (let i = 0; i < children.length; i++) {
      const found = findFirstByLocalName(children[i], localName);
      if (found) return found;
    }
    return null;
  }

  const infDpsNode = findFirstByLocalName(doc, 'infDPS');

  if (!infDpsNode) {
    throw new Error("Elemento <infDPS> não encontrado no XML");
  }

  const idAttr = infDpsNode.getAttribute("Id");
  if (!idAttr) {
    throw new Error("Elemento <infDPS> deve conter atributo Id");
  }

  const signer = new SignedImpl();
  signer.addReference(
    "/*[local-name(.)='DPS']/*[local-name(.)='infDPS']",
    ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    "http://www.w3.org/2001/04/xmlenc#sha256",
    `#${idAttr}`
  );

  signer.signatureAlgorithm =
    options.signatureAlgorithm === "rsa-sha1"
      ? "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
      : "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
  signer.signingKey = options.privateKeyPem;
  signer.keyInfoProvider = {
    getKeyInfo: () => {
      // include certificate Base64 inside KeyInfo -> X509Data
      const pem = options.certificatePem || "";
      const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/g, "").replace(/-----END CERTIFICATE-----/g, "").replace(/\r?\n|\r/g, "");
      return `<X509Data><X509Certificate>${b64}</X509Certificate></X509Data>`;
    }
  } as any;

  signer.computeSignature(xml, {
    prefix: "",
    location: {
      reference: "/*[local-name(.)='DPS']",
      action: "append"
    }
  });

  return signer.getSignedXml();
}
