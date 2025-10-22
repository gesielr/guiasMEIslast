# 🚀 GuiasMEI - Setup Completo de Desenvolvimento

> **Guia passo a passo para configurar o ambiente de desenvolvimento completo do GuiasMEI**

## 📋 Pré-requisitos

### **Software Necessário**
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Supabase CLI** - `npm install -g supabase`
- **Vercel CLI** - `npm install -g vercel` (opcional)
- **Railway CLI** - `npm install -g @railway/cli` (opcional)

### **Contas Necessárias**
- **Supabase** - [supabase.com](https://supabase.com)
- **Stripe** - [stripe.com](https://stripe.com) (pagamentos)
- **Vercel** - [vercel.com](https://vercel.com) (deploy frontend)
- **Railway** - [railway.app](https://railway.app) (deploy backend)

## 🚀 Configuração Inicial

### **1. Clone e Instalação**
```bash
# Clone o repositório
git clone https://github.com/gesielr/guiasMEI.git
cd guiasMEI

# Instale as dependências
npm install
```

### **2. Estrutura do Projeto**
```
guiasMEI/
├── 📱 apps/
│   ├── web/                 # Frontend React
│   └── backend/             # Backend Node.js
├── 📦 packages/             # Pacotes compartilhados
├── 🗄️ supabase/            # Configuração Supabase
├── 📚 docs/                 # Documentação
└── 🧪 test/                 # Testes
```

## 🗄️ Configuração do Supabase

### **1. Criar Projeto**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Nome: `guiasmei`
4. Senha: Escolha uma senha forte
5. Região: São Paulo (mais próxima)
6. Clique em "Create new project"

### **2. Configurar Variáveis**
Crie `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# NFSe (ADN)
ADN_NFSE_CONTRIBUINTES_URL=https://preprod.nfse.gov.br/contribuintes
ADN_NFSE_PARAMETROS_URL=https://preprod.nfse.gov.br/parametros
ADN_NFSE_DANFSE_URL=https://preprod.nfse.gov.br/danfse

# WhatsApp (opcional)
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

### **3. Executar Migrações**
```bash
# Login no Supabase
supabase login

# Conectar ao projeto
supabase link --project-ref your_project_ref

# Executar migrações
supabase db push

# Verificar status
supabase status
```

## 🎨 Configuração do Frontend

### **1. Dependências**
```bash
cd apps/web
npm install
```

### **2. Variáveis de Ambiente**
O frontend usa variáveis com prefixo `VITE_`:

```env
# apps/web/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **3. Executar Frontend**
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

**Acesso**: http://localhost:3000

## ⚙️ Configuração do Backend

### **1. Dependências**
```bash
cd apps/backend
npm install
```

### **2. Variáveis de Ambiente**
```env
# apps/backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# NFSe
ADN_NFSE_CONTRIBUINTES_URL=https://preprod.nfse.gov.br/contribuintes
ADN_NFSE_PARAMETROS_URL=https://preprod.nfse.gov.br/parametros
ADN_NFSE_DANFSE_URL=https://preprod.nfse.gov.br/danfse

# WhatsApp
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

### **3. Executar Backend**
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

**Acesso**: http://localhost:3001

## 💰 Configuração do Stripe

### **1. Criar Conta**
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta ou faça login
3. Complete a verificação

### **2. Obter Chaves**
1. Dashboard > Developers > API Keys
2. Copie a "Secret key" (sk_test_...)
3. Copie a "Publishable key" (pk_test_...)

### **3. Configurar Webhooks**
1. Dashboard > Developers > Webhooks
2. Add endpoint
3. URL: `https://your-backend-url.com/webhooks/stripe`
4. Eventos: `checkout.session.completed`, `payment_intent.succeeded`
5. Copie o "Signing secret" (whsec_...)

## 📱 Configuração do WhatsApp

### **Desenvolvimento Local**
```bash
# Simulador incluído
npm run dev:whatsapp
```

**Acesso**: http://localhost:3002

### **Produção**
1. [WhatsApp Business API](https://business.whatsapp.com)
2. Configure webhook: `https://your-backend-url.com/webhooks/whatsapp`
3. Copie token e phone ID

## 🚀 Scripts de Desenvolvimento

### **Executar Tudo**
```bash
# Na raiz do projeto
npm run dev
```

**Executa simultaneamente**:
- Frontend (porta 3000)
- Backend (porta 3001)
- Supabase local (porta 54321)
- WhatsApp Simulator (porta 3002)

### **Scripts Individuais**
```bash
# Apenas frontend
npm start

# Apenas backend
npm run dev:backend

# Apenas Supabase
npm run dev:supabase

# Apenas WhatsApp
npm run dev:whatsapp

# Build completo
npm run build

# Testes
npm test

# Lint
npm run lint
```

## 🔧 Configurações Avançadas

### **Supabase Local**
```bash
# Iniciar Supabase local
supabase start

# Parar Supabase local
supabase stop

# Reset do banco
supabase db reset

# Logs
supabase logs
```

### **Storage Buckets**
```sql
-- Criar buckets necessários
INSERT INTO storage.buckets (id, name, public) VALUES
  ('certificates', 'certificates', false),
  ('nfse-pdfs', 'nfse-pdfs', false),
  ('gps-pdfs', 'gps-pdfs', false);
```

### **RLS Policies**
```sql
-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Partners can view their clients" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM partner_clients 
      WHERE partner_id = auth.uid()
    )
  );
```

## 🧪 Testes

### **Executar Testes**
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --grep "NFSe"

# Cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e
```

### **Testes de Integração**
```bash
# Testar APIs
curl http://localhost:3001/health

# Testar autenticação
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🚀 Deploy para Produção

### **Frontend (Vercel)**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### **Backend (Railway)**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway deploy

# Configurar variáveis
railway variables set SUPABASE_URL=your_url
railway variables set STRIPE_SECRET_KEY=your_key
```

### **Banco de Dados**
```bash
# Migrações em produção
supabase db push --linked

# Deploy Edge Functions
supabase functions deploy
```

## 📊 Monitoramento

### **Métricas Importantes**
- **Uptime**: 99.9% disponibilidade
- **Response Time**: < 200ms APIs
- **Error Rate**: < 0.1% falhas
- **User Activity**: Atividade dos usuários

### **Ferramentas**
- **Supabase Dashboard**: Métricas do banco
- **Vercel Analytics**: Performance frontend
- **Railway Metrics**: Performance backend
- **Stripe Dashboard**: Métricas de pagamento

## 🔧 Troubleshooting

### **Problemas Comuns**

#### **Frontend não carrega**
```bash
# Verificar variáveis
echo $VITE_SUPABASE_URL

# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar porta
lsof -i :3000
```

#### **Backend não conecta**
```bash
# Verificar Supabase
supabase status

# Testar conexão
supabase db ping

# Verificar logs
supabase logs
```

#### **Erro de CORS**
```bash
# Configurar CORS no Supabase
# Dashboard > Settings > API > CORS
# Adicionar: http://localhost:3000
```

#### **Erro de autenticação**
```bash
# Verificar chaves
echo $SUPABASE_SERVICE_ROLE_KEY

# Testar conexão
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  https://your-project.supabase.co/rest/v1/
```

### **Logs e Debug**
```bash
# Logs detalhados
DEBUG=* npm run dev

# Logs do Supabase
supabase logs --follow

# Logs do backend
npm run dev -- --verbose
```

## 📚 Documentação Adicional

- **Arquitetura**: [docs/arquitetura-atual.md](docs/arquitetura-atual.md)
- **Panorama Geral**: [docs/panorama-geral-aplicativo.md](docs/panorama-geral-aplicativo.md)
- **NFSe Testing**: [docs/nfse-testing.md](docs/nfse-testing.md)
- **Checklist Produção**: [docs/checklist-pre-producao-nfse.md](docs/checklist-pre-producao-nfse.md)

## 🎯 Próximos Passos

1. ✅ **Configure o ambiente de desenvolvimento**
2. ✅ **Execute os testes**: `npm test`
3. ✅ **Configure as integrações externas**
4. ✅ **Teste o fluxo completo**
5. 🚀 **Deploy para produção**

---

**GuiasMEI** - Setup completo para desenvolvimento! 🚀