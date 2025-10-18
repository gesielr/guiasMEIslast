
# Guias MEI — README

Aplicação web React + funções Supabase para emissão/gestão de guias (GPS) e notas (simuladas), com integração local de WhatsApp (simulador) e Stripe para pagamentos.

Este README foi atualizado para documentar todas as funcionalidades, como rodar localmente (Windows PowerShell), scripts úteis e variáveis de ambiente necessárias.

## Status

- Frontend (React) pronto em modo dev (Create React App).
- Simulador de WhatsApp disponível na pasta `whatsapp-sim`.
- Funções do Supabase em `supabase/functions` (Edge Functions).
- Integração de pagamentos via Stripe (modo teste).

## Funcionalidades (resumido)

- Cadastro de usuário (MEI / Autônomo)
- Busca de CNPJ/CPF via função (fetch-cnpj)
- Pagamento de adesão via Stripe (fluxo de checkout criado nas Edge Functions)
- Emissão simulada de Nota Fiscal de Serviço (NFS-e)
- Emissão simulada de Guia de Previdência Social (GPS)
- Dashboards:
    - Usuário (`/dashboard`)
    - Parceiro (`/dashboard-parceiro`)
    - Admin (`/admin`)
- Onboarding/atendimento via WhatsApp (simulador local)
- Criptografia de dados sensíveis (AES-GCM) antes de salvar no banco
- Regras de segurança (RLS) e uso de Supabase Auth

## Tecnologias

- Frontend: React, React Router, Axios
- Bundler: Create React App (`react-scripts`)
- Backend / DB: Supabase (Auth, Postgres, Edge Functions)
- WhatsApp (local): Node.js + simulador (pasta `whatsapp-sim`)
- Pagamentos: Stripe (modo teste)

## Estrutura de arquivos (importante)

Principais arquivos e pastas:

- `package.json` — scripts e dependências
- `public/` — assets públicos (index.html, imagens)
- `src/` — código React
    - `src/App.jsx` — rotas da aplicação
    - `src/index.js` — ponto de entrada
    - `src/pages/` — páginas (HomePage, CadastroPage, LoginPage, PaymentPage, DashboardUser, EmitirNotaPage, EmitirGpsPage, DashboardPartner, AdminDashboard, PoliticaPrivacidade)
    - `src/services/` — integrações (paymentService, whatsappService)
    - `src/supabase/` — cliente Supabase e configurações
    - `src/utils/` — helpers (encryption, validators)
- `whatsapp-sim/` — servidor simulador WhatsApp (QR + web UI)
- `supabase/functions/` — funções Edge (fetch-cnpj, create-checkout-session, stripe-webhook, whatsapp-webhook)

## Scripts úteis (do `package.json`)

- `npm start` — inicia o frontend (CRA) em `http://localhost:3000`
- `npm run build` — build de produção
- `npm test` — testes (react-scripts)
- `npm run dev` — script que usa `concurrently` para iniciar frontend + supabase local + whatsapp-sim (ver notas abaixo)
- `npm run dev:supabase` — `cd supabase && supabase start && supabase functions serve`
- `npm run dev:whatsapp` — `cd ../whatsapp-sim && node server.js`

Observação: para rodar `npm run dev` você precisa do Supabase CLI instalado globalmente e do `whatsapp-sim` configurado.

## Variáveis de ambiente (exemplo `.env`)

Crie um arquivo `.env` na raiz do projeto com ao menos as variáveis usadas pelo frontend:

REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENCRYPTION_SECRET=uma_chave_secreta_com_pelo_menos_32_bytes
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
REACT_APP_WHATSAPP_API_TOKEN=token_para_whatsapp (opcional para produção)

Notas:
- Nunca comite chaves secretas no repositório.
- Algumas integrações (Stripe webhook secret, supabase service role) ficam nas funções do Supabase ou no painel do Supabase.

## Como rodar local (Windows PowerShell)

1) Instalar dependências (já executado na sua sessão):

```powershell
npm install
```

2) Iniciar apenas o frontend (modo de desenvolvimento):

```powershell
npm start
# Abre em http://localhost:3000
```

3) Iniciar todos os serviços (frontend + supabase local + whatsapp-sim):

```powershell
npm run dev
```

Requisitos para `npm run dev`:

- Supabase CLI instalado (https://supabase.com/docs/guides/cli)
- Node.js instalado (recomendado >= 16)
- `whatsapp-sim/server.js` deve estar presente e com dependências instaladas (`cd whatsapp-sim && npm install`)

4) Rodar apenas o simulador de WhatsApp (se preferir separado):

```powershell
cd whatsapp-sim
node server.js
```

5) Rodar/executar localmente as Edge Functions do Supabase:

```powershell
supabase start
supabase functions serve
```

## Rotas disponíveis (frontend)

As rotas principais definidas em `src/App.jsx`:

- `/` — HomePage
- `/cadastro` — Página de cadastro
- `/cadastro/mei` — Cadastro MEI
- `/cadastro/autonomo` — Cadastro Autônomo
- `/login` — Login
- `/pagar` — PaymentPage (checkout)
- `/dashboard` — Dashboard do Usuário
- `/emitir-nota` — Emitir Nota (simulada)
- `/emitir-gps` — Emitir GPS (simulado)
- `/dashboard-parceiro` — Dashboard do Parceiro
- `/admin` — AdminDashboard
- `/politica-privacidade` — Política de Privacidade

## Testes e verificação rápida

- Verifique versões: `node -v` e `npm -v` (Node >= 16 recomendado).
- Se o frontend travar na inicialização, delete `node_modules` e `package-lock.json` e rode `npm install` novamente.

## Segurança / Privacidade

- Dados sensíveis (CPF/CNPJ/PIS) são criptografados com AES-GCM antes de serem persistidos (veja `src/utils/encryption.js`).
- Acesso e permissões controlados via Supabase Auth e regras RLS no banco.

## Deploy (resumo)

- Frontend: build com `npm run build` e deploy em Vercel/Netlify ou serviço equivalente.
- Backend: funções do Supabase implantadas via `supabase functions deploy` e banco no Supabase.

## Problemas comuns / Troubleshooting

- Erro: "resource busy" no Supabase local — pare instâncias antigas e rode `supabase stop`.
- Erro no start do CRA: verifique versões do Node e remova `node_modules` se necessário.
- `npm run dev` falha: confirme que `supabase` está no PATH e `whatsapp-sim` tem `server.js` executável.

## Contribuição

- Abra uma issue descrevendo o bug ou feature.
- Fork → branch feature → PR com descrição clara e screenshots se aplicável.

## Licença

MIT License

---

Se quiser, eu posso:

- 1) abrir o site localmente executando `npm start` aqui;
- 2) rodar `npm run dev` para levantar todos os serviços (precisa do Supabase CLI instalado); ou
- 3) ajustar o README com instruções específicas de deploy (Vercel + Supabase) — me diga qual prefere.

