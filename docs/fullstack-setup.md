# GuiasMEI – Guia rápido de implementação

Este passo a passo descreve como preparar o ambiente local com o frontend React, a API Node.js e o banco Supabase para que o fluxo WhatsApp-centric funcione ponta a ponta.

## 1. Pré-requisitos
- Node.js 18+
- npm 9+
- Supabase CLI configurado e um projeto provisionado
- Stripe (opcional, para checkout real)

## 2. Variáveis de ambiente

### API (`apps/backend/.env`)
Copie o arquivo `.env.example` e ajuste com as chaves reais:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Campos obrigatórios:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_NUMBER`
- `NFSE_ENV` (`pr` ou `prod`)
- `NFSE_CONTRIBUINTES_BASE_URL`
- `NFSE_PARAMETROS_BASE_URL`
- `NFSE_DANFSE_BASE_URL`
- `NFSE_CREDENTIAL_SECRET` (chave AES de 32 caracteres usada para cifrar a senha do PFX)

> Use os endpoints da ADN NFSe de pré-produção nas variáveis acima enquanto estiver testando:
> - `https://preprod.nfse.gov.br/contribuintes`
> - `https://preprod.nfse.gov.br/parametros`
> - `https://preprod.nfse.gov.br/danfse`

### Frontend (`apps/web/.env`)

```bash
cp apps/web/.env.example apps/web/.env
```

Configure com a URL da API (`VITE_API_URL`) e as credenciais públicas do Supabase.

### Supabase Functions (`supabase/.env`)
Atualize com `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` e tokens de integração do WhatsApp.

## 3. Banco de dados e storage

1. Autentique-se no Supabase CLI (`supabase login`).
2. Aplique as migrations do diretório `supabase/migrations`:

```bash
supabase db push
```

3. Crie um bucket privado para armazenar certificados NFSe:

```bash
supabase storage create-bucket certificates --public=false
```

4. Garanta que apenas a `service_role` terá acesso programático ao bucket. No dashboard do Supabase, crie uma política de armazenamento permitindo `select`/`insert`/`update`/`delete` apenas para `role = 'service_role'`.

As migrations criam as tabelas `partners`, `customers`, `partner_clients`, `nfse_credentials`, `nfse_emissions`, `gps_emissions`, entre outras.

## 4. Instalação das dependências

Na raiz do monorepo:

```bash
npm install
```

## 5. Executando os serviços

### API

```bash
npm run dev:api
```

A API será iniciada em `http://localhost:3333`.

### Frontend

Em outro terminal:

```bash
npm run dev --workspace=@guiasmei/web
```

O Vite iniciará o app em `http://localhost:5173`.

## 6. Fluxo de cadastro e login
1. O visitante escolhe o tipo de cadastro (`/cadastro`).
2. MEI/autônomo conclui o formulário, envia para `POST /auth/register`, recebe `whatsappLink` e é redirecionado para a conversa com a IA.
3. Parceiros seguem o mesmo endpoint, obtêm sessão Supabase e vão para o dashboard (`/dashboard/parceiro`).
4. O login (`/login`) autentica via API, replica a sessão no Supabase (para dashboards) e redireciona MEIs/autônomos para o WhatsApp.

## 7. Emissão simulada
- `POST /nfse` e `POST /gps` registram emissões simuladas no banco e retornam chaves/pdfs fictícios.
- As telas React continuam consumindo diretamente o Supabase para listar históricos.

## 8. Próximos passos
- Conectar provedores reais (Stripe, PIX, API WhatsApp).
- Reforçar regras RLS conforme o modelo de produção.
- Substituir simulações de emissão por integrações oficiais.
