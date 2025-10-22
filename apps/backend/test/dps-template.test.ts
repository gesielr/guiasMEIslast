import { describe, it, expect } from "vitest";
import { buildDpsXml } from "../src/nfse/templates/dps-template";

describe("dps-template", () => {
  it("produces xml containing required NFSe blocks and escaped values", () => {
    const xml = buildDpsXml({
      userId: "00000000-0000-0000-0000-000000000000",
      identification: {
        numero: "1",
        serie: "1",
        competencia: "2025-01",
        dataEmissao: "2025-01-15T12:00:00Z"
      },
      prestador: {
        cpfCnpj: "12345678000195",
        inscricaoMunicipal: "123456",
        codigoMunicipio: "4205407"
      },
      tomador: {
        nome: "Joao & Teste",
        documento: "01234567000189",
        email: "teste@example.com",
        endereco: {
          codigoMunicipio: "4205407",
          logradouro: "Rua <Principal>",
          numero: "100",
          bairro: "Centro",
          complemento: "Sala 1",
          cep: "88000000",
          uf: "SC"
        }
      },
      servico: {
        codigoTributacaoMunicipio: "1234",
        itemListaLc116: "7.02",
        codigoCnae: "6201500",
        descricao: "Desenvolvimento & Suporte",
        codigoMunicipio: "4205407",
        aliquota: 2,
        valorServicos: 1500,
        valorDeducoes: 0
      },
      regime: {
        regimeEspecialTributacao: "MEI",
        optanteSimples: true,
        incentivoFiscal: false
      }
    });

    expect(xml).toContain("<infDPS");
    expect(xml).toContain("<valorServicos>1500.00</valorServicos>");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;Principal&gt;");
  });
});
