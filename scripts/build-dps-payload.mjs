import fs from "node:fs";
import zlib from "node:zlib";

const [xmlPath, outputPath = "./dps-request.json", versao = "1.00"] = process.argv.slice(2);

if (!xmlPath) {
  console.error("Uso: node scripts/build-dps-payload.mjs <caminho-do-xml> [saida-json] [versao]");
  process.exit(1);
}

if (!fs.existsSync(xmlPath)) {
  console.error(`Arquivo XML nao encontrado: ${xmlPath}`);
  process.exit(1);
}

const xmlBuffer = fs.readFileSync(xmlPath);
const gz = zlib.gzipSync(xmlBuffer);
const payload = {
  versao,
  dps_xml_gzip_b64: gz.toString("base64")
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`Payload salvo em ${outputPath}`);
