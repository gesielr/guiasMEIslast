import { z } from 'zod';

declare const meiRegisterSchema: z.ZodEffects<z.ZodObject<{
    role: z.ZodLiteral<"mei">;
    cnpj: z.ZodString;
    razaoSocial: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    certificado: z.ZodOptional<z.ZodString>;
    aceiteLGPD: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    role: "mei";
    cnpj: string;
    razaoSocial: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    aceiteLGPD: boolean;
    certificado?: string | undefined;
}, {
    role: "mei";
    cnpj: string;
    razaoSocial: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    aceiteLGPD: boolean;
    certificado?: string | undefined;
}>, {
    role: "mei";
    cnpj: string;
    razaoSocial: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    aceiteLGPD: boolean;
    certificado?: string | undefined;
}, {
    role: "mei";
    cnpj: string;
    razaoSocial: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    aceiteLGPD: boolean;
    certificado?: string | undefined;
}>;
declare const autonomoRegisterSchema: z.ZodEffects<z.ZodObject<{
    role: z.ZodLiteral<"autonomo">;
    cpf: z.ZodString;
    pis: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "autonomo";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    pis: string;
}, {
    role: "autonomo";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    pis: string;
}>, {
    role: "autonomo";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    pis: string;
}, {
    role: "autonomo";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    pis: string;
}>;
declare const parceiroRegisterSchema: z.ZodEffects<z.ZodObject<{
    role: z.ZodLiteral<"parceiro">;
    documento: z.ZodString;
    crc: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "parceiro";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    documento: string;
    crc: string;
}, {
    role: "parceiro";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    documento: string;
    crc: string;
}>, {
    role: "parceiro";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    documento: string;
    crc: string;
}, {
    role: "parceiro";
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    documento: string;
    crc: string;
}>;
declare const loginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
    remember: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    password: string;
    identifier: string;
    remember?: boolean | undefined;
}, {
    password: string;
    identifier: string;
    remember?: boolean | undefined;
}>;
declare const twoFactorSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;

declare const nfseTomadorSchema: z.ZodObject<{
    nome: z.ZodString;
    cpfCnpj: z.ZodString;
    inscricaoMunicipal: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    endereco: z.ZodObject<{
        logradouro: z.ZodString;
        numero: z.ZodString;
        complemento: z.ZodOptional<z.ZodString>;
        bairro: z.ZodString;
        cidade: z.ZodString;
        estado: z.ZodString;
        cep: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        complemento?: string | undefined;
    }, {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        complemento?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nome: string;
    cpfCnpj: string;
    endereco: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        complemento?: string | undefined;
    };
    inscricaoMunicipal?: string | undefined;
}, {
    email: string;
    nome: string;
    cpfCnpj: string;
    endereco: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        complemento?: string | undefined;
    };
    inscricaoMunicipal?: string | undefined;
}>;
declare const nfseServicoSchema: z.ZodObject<{
    codigoServico: z.ZodString;
    discriminacao: z.ZodString;
    valorServico: z.ZodNumber;
    aliquota: z.ZodNumber;
    issRetido: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    codigoServico: string;
    discriminacao: string;
    valorServico: number;
    aliquota: number;
    issRetido: boolean;
}, {
    codigoServico: string;
    discriminacao: string;
    valorServico: number;
    aliquota: number;
    issRetido?: boolean | undefined;
}>;
declare const nfseRevisaoSchema: z.ZodObject<{
    emitirEmailTomador: z.ZodDefault<z.ZodBoolean>;
    observacoes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    emitirEmailTomador: boolean;
    observacoes?: string | undefined;
}, {
    emitirEmailTomador?: boolean | undefined;
    observacoes?: string | undefined;
}>;

declare const gpsGeneratorSchema: z.ZodObject<{
    competencia: z.ZodDate;
    tipoContribuicao: z.ZodEnum<["11", "12", "13", "21"]>;
    remuneracao: z.ZodNumber;
    codigoPagamento: z.ZodString;
    descontoINSS: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    competencia: Date;
    tipoContribuicao: "11" | "12" | "13" | "21";
    remuneracao: number;
    codigoPagamento: string;
    descontoINSS: boolean;
}, {
    competencia: Date;
    tipoContribuicao: "11" | "12" | "13" | "21";
    remuneracao: number;
    codigoPagamento: string;
    descontoINSS?: boolean | undefined;
}>;

type UserRole = "mei" | "autonomo" | "parceiro" | "admin";

export { type UserRole, autonomoRegisterSchema, gpsGeneratorSchema, loginSchema, meiRegisterSchema, nfseRevisaoSchema, nfseServicoSchema, nfseTomadorSchema, parceiroRegisterSchema, twoFactorSchema };
