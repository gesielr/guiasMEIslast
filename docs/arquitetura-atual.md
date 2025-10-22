# 🏗️ GuiasMEI - Arquitetura Atual do Sistema

## 📋 Visão Geral da Arquitetura

O GuiasMEI é uma aplicação full-stack moderna construída com tecnologias de ponta, seguindo princípios de arquitetura limpa e escalável.

## 🎯 Princípios Arquiteturais

- **Separação de Responsabilidades**: Frontend, Backend e Banco claramente separados
- **Segurança First**: Criptografia, RLS e autenticação robusta
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Manutenibilidade**: Código limpo e bem documentado
- **Performance**: Otimizações em todos os níveis

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 CAMADA DE APRESENTAÇÃO                │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (Vite)                                      │
│  ├── 🏠 Homepage & Landing                                  │
│  ├── 👤 Cadastros (MEI/Autônomo/Parceiro)                  │
│  ├── 🔐 Autenticação                                        │
│  ├── 📊 Dashboards Especializados                           │
│  └── 🤖 WhatsApp Simulator                                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    🔌 CAMADA DE INTEGRAÇÃO                  │
├─────────────────────────────────────────────────────────────┤
│  APIs REST & Webhooks                                       │
│  ├── 🔐 Autenticação (Supabase Auth)                       │
│  ├── 💰 Pagamentos (Stripe + PIX)                          │
│  ├── 📱 WhatsApp (Business API)                             │
│  └── 🏛️ Governo (Receita, ADN, SEFIP)                      │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    ⚙️ CAMADA DE NEGÓCIO                      │
├─────────────────────────────────────────────────────────────┤
│  Backend Node.js (Fastify)                                  │
│  ├── 🔐 Auth Service                                        │
│  ├── 📊 Dashboard Service                                   │
│  ├── 🗺️ GPS Service                                         │
│  ├── 📄 NFSe Service                                        │
│  ├── 💰 Payment Service                                     │
│  └── 📱 WhatsApp Service                                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    🗄️ CAMADA DE DADOS                       │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + Auth + Storage)                    │
│  ├── 👥 profiles (usuários)                                │
│  ├── 🤝 partners (contabilidades)                          │
│  ├── 📄 nfse_emissions (emissões NFS-e)                    │
│  ├── 🗺️ gps_emissions (emissões GPS)                       │
│  ├── 🔐 nfse_credentials (certificados)                    │
│  └── 💰 payments (transações)                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend (React + Vite)

### **Estrutura de Componentes**
```
src/
├── 🏠 features/
│   ├── HomePage.jsx              # Landing page
│   ├── auth/                     # Autenticação
│   │   ├── CadastroPage.jsx      # Seleção de perfil
│   │   ├── CadastroPageMei.jsx   # Cadastro MEI
│   │   ├── CadastroPageGps.jsx   # Cadastro Autônomo
│   │   ├── CadastroPageParceiro.jsx # Cadastro Parceiro
│   │   └── LoginPage.jsx         # Login
│   ├── dashboards/               # Dashboards
│   │   ├── DashboardUser.jsx     # Dashboard usuário
│   │   ├── DashboardPartner.jsx # Dashboard parceiro
│   │   └── AdminDashboard.jsx    # Dashboard admin
│   ├── admin/                    # Telas administrativas
│   │   └── nfse/                 # Módulo NFSe
│   │       ├── CertificadosAdminPage.jsx
│   │       ├── EmissoesAdminPage.jsx
│   │       ├── RelatoriosAdminPage.jsx
│   │       ├── ConfiguracoesAdminPage.jsx
│   │       └── LogsAdminPage.jsx
│   ├── nfse/                     # Emissões NFSe
│   └── gps/                      # Emissões GPS
├── 🧩 components/               # Componentes reutilizáveis
├── 🔧 services/                 # Serviços de API
├── 🎨 styles/                   # Estilos globais
└── 📱 supabase/                 # Cliente Supabase
```

### **Design System**
- **Paleta de Cores**: Azuis profissionais (#3b82f6, #2563eb)
- **Tipografia**: Inter (moderna e legível)
- **Componentes**: Cards, badges, botões com hover effects
- **Responsividade**: Mobile-first, adaptável
- **Animações**: Transições suaves (0.3s ease)

## ⚙️ Backend (Node.js + Fastify)

### **Estrutura Modular**
```
src/
├── 🔐 auth/                      # Autenticação
│   └── auth.ts
├── 📊 dashboard/                 # APIs de dashboard
│   └── dashboard.ts
├── 🗺️ gps/                      # Emissão GPS
│   └── gps.ts
├── 📄 nfse/                     # Módulo NFSe completo
│   ├── controllers/             # Controladores
│   │   └── nfse.controller.ts
│   ├── services/                # Serviços de negócio
│   │   ├── nfse.service.ts
│   │   └── credential-crypto.ts
│   ├── repositories/            # Acesso a dados
│   │   ├── credentials.repo.ts
│   │   └── nfse-emissions.repo.ts
│   ├── adapters/                # Integrações externas
│   │   └── adn-client.ts
│   ├── crypto/                  # Criptografia
│   │   ├── pfx-utils.ts
│   │   └── xml-signer.ts
│   ├── workers/                 # Jobs em background
│   │   ├── scheduler.ts
│   │   └── status-poller.ts
│   ├── dto/                     # Validação de dados
│   │   └── create-dps.dto.ts
│   └── templates/               # Templates XML
│       └── dps-template.ts
├── 💰 payments/                 # Integração Stripe
│   └── payments.ts
├── 📱 whatsapp/                 # Webhooks WhatsApp
│   └── whatsapp.ts
└── 🔧 services/                 # Serviços compartilhados
    └── supabase.ts
```

### **Padrões Implementados**
- **Repository Pattern**: Separação de acesso a dados
- **Service Layer**: Lógica de negócio isolada
- **DTO Pattern**: Validação de entrada
- **Adapter Pattern**: Integrações externas
- **Worker Pattern**: Jobs assíncronos

## 🗄️ Banco de Dados (Supabase)

### **Schema Principal**
```sql
-- 👥 Perfis de usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT ENCRYPTED,  -- CPF/CNPJ criptografado
  document_type TEXT,      -- 'cpf' | 'cnpj'
  user_type TEXT,          -- 'mei' | 'autonomo' | 'partner' | 'admin'
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🤝 Parceiros (contabilidades)
CREATE TABLE partners (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  cnpj TEXT ENCRYPTED,
  email TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🔗 Vínculos parceiro-cliente
CREATE TABLE partner_clients (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES partners(id),
  client_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 📄 Emissões NFS-e
CREATE TABLE nfse_emissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  protocolo TEXT UNIQUE,
  status TEXT,  -- 'EM_FILA' | 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA'
  valores JSONB,
  tomador JSONB,
  pdf_storage_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🔐 Certificados digitais
CREATE TABLE nfse_credentials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT,  -- 'A1' | 'A3'
  subject TEXT,
  not_before TIMESTAMP,
  not_after TIMESTAMP,
  pfx_password_encrypted TEXT,
  pfx_storage_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Row Level Security (RLS)**
```sql
-- Usuários só veem seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Parceiros veem seus clientes
CREATE POLICY "Partners can view their clients" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM partner_clients 
      WHERE partner_id = auth.uid()
    )
  );

-- Admins veem tudo
CREATE POLICY "Admins can view all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );
```

## 🔐 Segurança

### **Criptografia de Dados**
```typescript
// AES-256-GCM para dados sensíveis
const encrypted = await encryptData(cpf, process.env.ENCRYPTION_KEY);
const decrypted = await decryptData(encrypted, process.env.ENCRYPTION_KEY);
```

### **Autenticação e Autorização**
- **JWT Tokens**: Supabase Auth
- **Role-based Access**: Admin, Parceiro, Usuário
- **RLS Policies**: Segurança a nível de banco
- **API Keys**: Integrações externas

### **Auditoria**
- **Logs Estruturados**: Winston/Pino
- **Rastreabilidade**: Quem fez o quê e quando
- **Compliance**: LGPD e regulamentações

## 🚀 Integrações Externas

### **APIs Governamentais**
```typescript
// Receita Federal - Validação CNPJ
const cnpjData = await fetchCNPJ(cnpj);

// ADN NFSe - Emissão de notas
const nfseResult = await adnClient.emitirDPS(dpsData);

// SEFIP - Geração GPS
const gpsData = await sefipClient.gerarGPS(gpsParams);
```

### **Serviços de Pagamento**
```typescript
// Stripe - Cartão
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: items,
  mode: 'payment'
});

// PIX - Pagamento instantâneo
const pixPayment = await pixProvider.createPayment({
  amount: 10000,
  description: 'Taxa de adesão'
});
```

### **WhatsApp Business API**
```typescript
// Envio de mensagens
await whatsappClient.sendMessage({
  to: userPhone,
  message: 'Olá! Como posso ajudar?'
});

// Webhook de recebimento
app.post('/webhook/whatsapp', async (req, res) => {
  const message = req.body;
  await processMessage(message);
});
```

## 📊 Monitoramento e Observabilidade

### **Métricas de Performance**
- **Response Time**: < 200ms para APIs
- **Uptime**: 99.9% disponibilidade
- **Error Rate**: < 0.1% falhas
- **Throughput**: 1000 req/s

### **Logs Estruturados**
```typescript
logger.info('NFSe emission started', {
  userId: user.id,
  protocolo: emission.protocolo,
  timestamp: new Date().toISOString()
});
```

### **Alertas Automáticos**
- **Falhas de API**: Slack/Email
- **Alto uso de CPU**: CloudWatch
- **Erros de pagamento**: Stripe Dashboard
- **Falhas de certificado**: Sistema interno

## 🔄 Fluxo de Dados

### **Cadastro de Usuário**
```
1. Frontend → Formulário de cadastro
2. Backend → Validação e criptografia
3. Supabase → Criação de perfil
4. WhatsApp → Link de redirecionamento
5. IA → Atendimento automatizado
```

### **Emissão de NFS-e**
```
1. WhatsApp → Comando do usuário
2. IA → Processamento da solicitação
3. Backend → Validação e preparação
4. ADN → Emissão da nota fiscal
5. Storage → Armazenamento do PDF
6. WhatsApp → Envio do documento
```

### **Sistema de Comissões**
```
1. Emissão → Registro da transação
2. Cálculo → Aplicação da taxa
3. Stripe → Cobrança automática
4. Parceiro → Crédito da comissão
5. Relatório → Dashboard atualizado
```

## 🚀 Deploy e Infraestrutura

### **Ambientes**
- **Development**: Local com Supabase local
- **Staging**: Vercel + Railway + Supabase
- **Production**: Vercel + Railway + Supabase Cloud

### **CI/CD Pipeline**
```yaml
# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
```

### **Backup e Recuperação**
- **Database**: Backup diário automático
- **Storage**: Replicação em múltiplas regiões
- **Code**: Versionamento Git
- **Secrets**: Gerenciamento seguro

## 📈 Escalabilidade

### **Horizontal Scaling**
- **Frontend**: CDN global (Vercel)
- **Backend**: Load balancer + múltiplas instâncias
- **Database**: Read replicas + connection pooling
- **Cache**: Redis para sessões e dados frequentes

### **Vertical Scaling**
- **CPU**: Otimização de algoritmos
- **Memory**: Garbage collection tuning
- **Storage**: Compressão e otimização
- **Network**: HTTP/2 e compressão

## 🔮 Roadmap Técnico

### **Fase 1: Estabilização** ✅
- [x] Arquitetura base implementada
- [x] Autenticação e autorização
- [x] Dashboards funcionais
- [x] Integração Supabase

### **Fase 2: NFSe Integration** 🚧
- [x] 5 telas administrativas
- [x] Gestão de certificados
- [ ] Integração real ADN
- [ ] Testes end-to-end

### **Fase 3: WhatsApp + IA** 📋
- [ ] WhatsApp Business API
- [ ] IA especializada
- [ ] Automação completa
- [ ] Sistema de comandos

### **Fase 4: Escala** 🚀
- [ ] Multi-tenant
- [ ] API pública
- [ ] Mobile app
- [ ] Marketplace

---

**GuiasMEI** - Arquitetura robusta para o futuro da gestão fiscal! 🚀
