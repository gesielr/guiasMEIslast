declare module "xml-crypto" {
  export class SignedXml {
    constructor();
    signingKey: any;
    signatureAlgorithm?: string;
    keyInfoProvider?: {
      getKeyInfo: (keyInfo?: any, prefix?: string) => string;
    };
    addReference(ref: string, transforms?: string[], canonicalization?: string): void;
    computeSignature(xml: string, opts?: any): void;
    getSignedXml(): string;
  }
  export function select(xpath: string, node: any): any[];
}

declare module "xmldom" {
  export class DOMParser {
    parseFromString(xml: string, mimeType?: string): any;
  }
}

declare module "@xmldom/xmldom" {
  export class DOMParser {
    parseFromString(xml: string, mimeType?: string): any;
  }
}

declare module "node-forge" {
  const forge: any;
  export default forge;
}
