Claro! Abaixo está o **arquivo `README.md` completo** para seu projeto **Rebelo App**, pronto para ser colocado na raiz do repositório. Ele inclui:

✅ Descrição do projeto  
✅ Tecnologias utilizadas  
✅ Estrutura de pastas  
✅ Instruções de instalação e configuração local  
✅ Como executar (frontend, backend, WhatsApp sim)  
✅ Variáveis de ambiente  
✅ Fluxo do usuário  
✅ Licença

---

# 📄 **README.md — Rebelo App**

> **Plataforma Web + WhatsApp para Gestão Fiscal Automatizada de MEIs e Autônomos**

O **Rebelo App** é uma plataforma que automatiza a gestão fiscal de Microempreendedores Individuais (MEIs) e autônomos, permitindo a emissão de notas fiscais de serviço (NFS-e) e guias de INSS (GPS) via atendimento guiado por IA no WhatsApp. O sistema opera com dois modelos de usuário: **usuário comum** e **parceiro** (contabilidades revendedoras).

---

## 🚀 **Funcionalidades Principais**

- ✅ Cadastro de MEI (com busca automática na Receita Federal) e Autônomo
- ✅ Onboarding guiado por IA via WhatsApp
- ✅ Pagamento de adesão via Stripe (R$120,00)
- ✅ Emissão simulada de Nota Fiscal de Serviço (NFS-e)
- ✅ Emissão simulada de Guia de Previdência Social (GPS)
- ✅ Dashboard do Usuário com histórico e status
- ✅ Dashboard do Parceiro (contabilidade) com gestão de clientes e comissões
- ✅ Dashboard Administrativo com relatórios e métricas
- ✅ Criptografia de dados sensíveis (CPF/CNPJ/PIS)
- ✅ Conformidade com LGPD e políticas de RLS no Supabase

---

## 🛠️ **Tecnologias Utilizadas**

| Camada        | Tecnologia                          |
|---------------|-------------------------------------|
| **Frontend**  | React, React Router, Axios          |
| **Backend**   | Supabase (Auth, Database, Edge Functions) |
| **WhatsApp**  | Simulador local com WhatsApp Web.js (WWebJS) + preparado para API Oficial |
| **Pagamentos**| Stripe (modo teste)                 |
| **APIs**      | Receita WS (via proxy), Emissor Nacional de NFS-e (simulado) |
| **Segurança** | Criptografia AES-GCM, RLS, LGPD     |
| **Deploy**    | Vercel (frontend), Supabase (backend) |

---

## 📁 **Estrutura de Pastas**

```
rebelo-app/
├── .env                          # Variáveis de ambiente
├── public/                       # Assets públicos
├── src/
│   ├── assets/                   # Imagens, ícones
│   ├── components/               # Componentes reutilizáveis
│   │   ├── common/
│   │   └── ui/
│   ├── pages/                    # Telas da aplicação
│   │   ├── HomePage.jsx
│   │   ├── CadastroPage.jsx
│   │   ├── DashboardUser.jsx
│   │   ├── DashboardPartner.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── EmitirNotaPage.jsx
│   │   ├── EmitirGpsPage.jsx
│   │   ├── PaymentPage.jsx
│   │   └── PoliticaPrivacidade.jsx
│   ├── services/                 # Serviços de integração
│   │   ├── paymentService.js
│   │   └── whatsappService.js
│   ├── supabase/
│   │   └── client.js             # Cliente Supabase
│   ├── utils/
│   │   ├── encryption.js         # Criptografia AES-GCM
│   │   └── validators.js         # Validação de CPF/CNPJ
│   ├── App.jsx
│   └── index.js
├── whatsapp-sim/                 # Simulador de WhatsApp (Node.js)
│   ├── server.js
│   └── public/
│       └── index.html
└── rebelo-app/supabase/
    └── functions/                # Edge Functions
        ├── fetch-cnpj/
        │   └── index.ts
        ├── create-checkout-session/
        │   └── index.ts
        ├── stripe-webhook/
        │   └── index.ts
        └── whatsapp-webhook/
            └── index.ts
```

---

## ⚙️ **Configuração Local**

### 1. Clone o repositório

```bash
git clone https://github.com/gesielr/guiasMEI.git
cd rebelo-app
```

### 2. Configure o `.env` na raiz

```env
# Supabase
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Criptografia
REACT_APP_ENCRYPTION_SECRET=uma_chave_secreta_muito_forte_aqui_32bytes!

# WhatsApp (para produção)
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345
REACT_APP_WHATSAPP_ACCESS_TOKEN=EAAlZBw1xO...

# Stripe (para produção)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_... # Usada principalmente nas Edge Functions do Supabase
```

> 💡 Substitua pelos valores do seu projeto Supabase: https://supabase.com/dashboard

### 3. Instale as dependências do frontend

```bash
npm install
```

### 4. Configure o simulador de WhatsApp

```bash
cd whatsapp-sim
npm install
```

### 5. Configure as Edge Functions (Supabase CLI)

```bash
cd rebelo-app # Altere para o diretório do frontend
supabase login
```

---

## ▶️ **Como Executar**

### ✅ Frontend (React)

```bash
cd rebelo-app
npm start
```

> Acesse: `http://localhost:3000`

---

### ✅ Simulador de WhatsApp (WWebJS)

```bash
cd whatsapp-sim
node server.js
```

> Acesse: `http://localhost:3001` → escaneie o QR Code com seu WhatsApp.

---

### ✅ Supabase Edge Functions (Local)

```bash
cd rebelo-app
supabase functions serve fetch-cnpj
# Ou para servir todas:
supabase functions serve
```

> Acesse: `http://localhost:54321/functions/v1/fetch-cnpj?cnpj=00000000000000`

---

## 🔄 **Fluxo de Teste Local**

1. Acesse `http://localhost:3000` → Cadastre-se como MEI ou Autônomo.
2. Após cadastro, é redirecionado para WhatsApp com seu `user_id`.
3. No WhatsApp, envie: `Olá! Sou novo usuário. Meu ID é: SEU_UUID`.
4. A IA responde com links de contrato e pagamento.
5. Clique no link de pagamento → pague com cartão de teste do Stripe (`4242...`).
6. Após pagamento, acesse o Dashboard → emita nota fiscal e GPS.
7. Teste também os dashboards de Parceiro e Admin (crie usuários manualmente no Supabase).

---

## 🔐 **Segurança e LGPD**

- Todos os dados sensíveis (CPF, CNPJ, PIS) são criptografados com **AES-GCM** antes de salvar no banco.
- Políticas de **Row Level Security (RLS)** aplicadas em todas as tabelas.
- Consentimento explícito no cadastro + página de Política de Privacidade.
- Logs de acesso e auditoria via tabela `whatsapp_logs`.

---

## 📤 **Próximos Passos (Produção)**

1. Substituir simulação de WhatsApp pela **API Oficial do WhatsApp Business Cloud**.
2. Integrar com **API real do Emissor Nacional de NFS-e** (requer certificado digital).
3. Implementar **web scraping ou API parceira para GPS real**.
4. Fazer deploy do frontend na **Vercel** e ativar HTTPS.
5. Configurar domínio personalizado e CI/CD.

---

## 📜 **Licença**

MIT License — Livre para uso, modificação e distribuição.

---
