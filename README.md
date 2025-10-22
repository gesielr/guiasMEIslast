# 🚀 GuiasMEI - Plataforma Completa de Gestão Fiscal

> **Solução inovadora para emissão automatizada de guias GPS e notas fiscais NFS-e através de atendimento via WhatsApp com IA especializada.**

## 🎯 Visão Geral

O **GuiasMEI** é uma plataforma full-stack que revoluciona a gestão fiscal de Microempreendedores Individuais (MEI) e autônomos, oferecendo:

- 🤖 **Atendimento 100% via WhatsApp** com IA especializada em legislação fiscal
- 📄 **Emissão automática** de guias GPS e notas fiscais NFS-e
- 🤝 **Rede de parceiros** (contabilidades) com sistema de comissões
- 🔧 **Painel administrativo** completo para monitoramento e gestão

## 👥 Tipos de Usuários

### 🏢 **MEI (Microempreendedor Individual)**
- **Fluxo**: Homepage → Cadastro → WhatsApp (IA)
- **Funcionalidades**: Emissão GPS/NFS-e via IA
- **Acesso**: Apenas WhatsApp (sem telas web)

### 👤 **Autônomo**
- **Fluxo**: Homepage → Cadastro → WhatsApp (IA)
- **Funcionalidades**: Emissão GPS via IA
- **Acesso**: Apenas WhatsApp (sem telas web)

### 🤝 **Parceiro (Contabilidade)**
- **Fluxo**: Homepage → Cadastro → Dashboard Web
- **Funcionalidades**:
  - Gerenciar clientes
  - Gerar links de convite
  - Acompanhar comissões
  - Relatórios de faturamento

### 🔧 **Administrador**
- **Fluxo**: Login direto → Dashboard Admin
- **Funcionalidades**:
  - Gestão completa de usuários
  - Monitoramento NFSe (5 telas especializadas)
  - Configurações do sistema
  - Analytics e relatórios

## 🏗️ Arquitetura Técnica

### **Frontend (React + Vite)**
```
apps/web/
├── 🏠 Homepage - Landing page e seleção de perfil
├── 👤 Cadastros - MEI, Autônomo, Parceiro
├── 🔐 Autenticação - Login/Logout
├── 📊 Dashboards - Usuário, Parceiro, Admin
├── 🤖 WhatsApp Simulator - Testes locais
└── 📄 Emissões - Telas de emissão (simuladas)
```

### **Backend (Node.js + Fastify)**
```
apps/backend/
├── 🔐 Auth - Autenticação e autorização
├── 📊 Dashboard - APIs de dados
├── 🗺️ GPS - Emissão de guias
├── 📄 NFSe - Emissão de notas fiscais
├── 💰 Payments - Integração Stripe
└── 📱 WhatsApp - Webhooks e automação
```

### **Banco de Dados (Supabase)**
```
📊 Tabelas Principais:
├── profiles - Perfis de usuários
├── partners - Contabilidades parceiras
├── nfse_emissions - Emissões de NFS-e
├── gps_emissions - Emissões de GPS
├── nfse_credentials - Certificados digitais
└── partner_clients - Vínculos parceiro-cliente
```

## 🎨 Interface e Experiência

### **Design System Moderno**
- **Paleta**: Azuis profissionais (#3b82f6, #2563eb)
- **Tipografia**: Inter (moderna e legível)
- **Componentes**: Cards, badges, botões com hover effects
- **Responsividade**: Mobile-first, adaptável

### **Dashboards Especializados**

#### **Dashboard Parceiro** 🤝
- **Métricas**: Clientes, comissões, emissões
- **Gestão**: Adicionar clientes, gerar links
- **Relatórios**: Faturamento, performance
- **Ações Rápidas**: Gerar link, lembrete, relatórios, WhatsApp

#### **Dashboard Admin** 🔧
- **Visão Geral**: Estatísticas globais
- **Gestão NFSe**: 5 telas especializadas
  - 🔐 **Certificados Digitais** - Gestão de certificados de todos os usuários
  - 📊 **Monitoramento de Emissões** - Acompanhamento em tempo real
  - 📈 **Relatórios e Analytics** - Análise completa de dados
  - ⚙️ **Configurações do Sistema** - Gerenciamento de integrações
  - 🔍 **Logs e Auditoria** - Monitoramento de operações

## 🔐 Segurança e Conformidade

### **Criptografia Avançada**
- **Dados Sensíveis**: CPF, CNPJ, PIS criptografados (AES-256-GCM)
- **Certificados**: Senhas PFX criptografadas
- **Transmissão**: HTTPS obrigatório

### **Controle de Acesso**
- **RLS**: Row Level Security no Supabase
- **JWT**: Tokens seguros para autenticação
- **Roles**: Admin, Parceiro, Usuário com permissões específicas

### **Auditoria Completa**
- **Logs**: Todas as ações registradas
- **Rastreabilidade**: Quem fez o quê e quando
- **Compliance**: LGPD e regulamentações fiscais

## 🚀 Integrações Externas

### **APIs Governamentais**
- **Receita Federal**: Validação CNPJ/CPF
- **ADN NFSe**: Emissão de notas fiscais
- **SEFIP**: Geração de guias GPS

### **Serviços de Pagamento**
- **Stripe**: Processamento internacional
- **PIX**: Pagamentos instantâneos
- **Webhooks**: Confirmação automática

### **Comunicação**
- **WhatsApp Business API**: Atendimento automatizado
- **Twilio**: SMS e notificações
- **Email**: Confirmações e lembretes

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18**: Interface moderna e reativa
- **Vite**: Build rápido e eficiente
- **React Router**: Navegação SPA
- **Tailwind CSS**: Estilização utilitária
- **Supabase Client**: Integração banco

### **Backend**
- **Node.js**: Runtime JavaScript
- **Fastify**: Framework web rápido
- **TypeScript**: Tipagem estática
- **Zod**: Validação de schemas
- **Axios**: Cliente HTTP

### **Banco de Dados**
- **Supabase**: PostgreSQL + Auth
- **RLS**: Segurança a nível de linha
- **Migrations**: Versionamento schema
- **Storage**: Arquivos e documentos

### **Infraestrutura**
- **Vercel**: Deploy frontend
- **Railway**: Deploy backend
- **Supabase Cloud**: Banco e auth
- **GitHub**: Versionamento

## 🚀 Como Rodar Localmente

### **Pré-requisitos**
- Node.js 18+
- Supabase CLI
- Git

### **1. Instalação**
```bash
# Clone o repositório
git clone https://github.com/gesielr/guiasMEI.git
cd guiasMEI

# Instale as dependências
npm install
```

### **2. Configuração**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis de ambiente
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - STRIPE_SECRET_KEY
# - ADN_NFSE_* (configurações NFSe)
```

### **3. Execução**
```bash
# Iniciar todos os serviços (recomendado)
npm run dev

# Ou iniciar individualmente:
npm start          # Frontend apenas
npm run dev:supabase  # Supabase local
npm run dev:whatsapp  # Simulador WhatsApp
```

### **4. Acesso**
- **Frontend**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **WhatsApp Simulator**: http://localhost:3001

## 📁 Estrutura do Projeto

```
guiasMEI/
├── 📱 apps/
│   ├── web/                 # Frontend React
│   │   ├── src/
│   │   │   ├── features/    # Funcionalidades
│   │   │   │   ├── auth/     # Autenticação
│   │   │   │   ├── dashboards/ # Dashboards
│   │   │   │   ├── admin/    # Telas administrativas
│   │   │   │   └── nfse/     # Emissões NFSe
│   │   │   ├── components/  # Componentes reutilizáveis
│   │   │   └── assets/      # Imagens e ícones
│   │   └── public/          # Arquivos estáticos
│   └── backend/             # Backend Node.js
│       ├── src/
│       │   ├── nfse/        # Módulo NFSe
│       │   ├── services/    # Serviços
│       │   └── routes/      # Rotas API
│       └── dist/            # Build produção
├── 📦 packages/             # Pacotes compartilhados
│   ├── config/             # Schemas e tipos
│   ├── sdk/                # Cliente API
│   └── ui/                 # Componentes UI
├── 🗄️ supabase/            # Configuração Supabase
│   ├── functions/          # Edge Functions
│   └── migrations/         # Migrações DB
├── 📚 docs/                # Documentação
└── 🧪 test/                # Testes
```

## 📊 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia frontend em desenvolvimento |
| `npm run dev` | Inicia todos os serviços |
| `npm run build` | Build de produção |
| `npm run dev:supabase` | Supabase local |
| `npm run dev:whatsapp` | Simulador WhatsApp |
| `npm test` | Executa testes |
| `npm run lint` | Verifica código |

## 🔧 Configuração de Desenvolvimento

### **Variáveis de Ambiente**
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NFSe
ADN_NFSE_CONTRIBUINTES_URL=https://...
ADN_NFSE_PARAMETROS_URL=https://...
ADN_NFSE_DANFSE_URL=https://...

# WhatsApp
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

### **Banco de Dados**
```bash
# Aplicar migrações
supabase db reset

# Visualizar schema
supabase db diff
```

## 🚀 Deploy e Produção

### **Frontend (Vercel)**
```bash
npm run build
vercel --prod
```

### **Backend (Railway)**
```bash
npm run build:backend
railway deploy
```

### **Banco (Supabase)**
```bash
supabase db push
supabase functions deploy
```

## 📈 Monitoramento

- **Uptime**: 99.9% disponibilidade
- **Logs**: Centralizados no Supabase
- **Métricas**: Performance e uso
- **Alertas**: Falhas e problemas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/gesielr/guiasMEI/issues)
- **Email**: suporte@guiasmei.com

---

**GuiasMEI** - Transformando a gestão fiscal através da tecnologia! 🚀