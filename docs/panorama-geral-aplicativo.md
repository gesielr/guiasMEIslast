# 🚀 GuiasMEI - Panorama Geral do Aplicativo

## 📋 Visão Geral

O **GuiasMEI** é uma plataforma completa de gestão fiscal para Microempreendedores Individuais (MEI) e autônomos, oferecendo emissão automatizada de guias GPS e notas fiscais NFS-e através de atendimento via WhatsApp com IA.

## 🎯 Objetivo Principal

Simplificar a vida fiscal de MEIs e autônomos através de:
- **Atendimento 100% via WhatsApp** com IA especializada
- **Emissão automática** de guias GPS e NFS-e
- **Gestão de parceiros** (contabilidades) com sistema de comissões
- **Painel administrativo** completo para monitoramento

## 🏗️ Arquitetura do Sistema

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

## 👥 Tipos de Usuários

### **1. 🏢 MEI (Microempreendedor Individual)**
- **Fluxo**: Homepage → Cadastro → WhatsApp (IA)
- **Funcionalidades**: Emissão GPS/NFS-e via IA
- **Acesso**: Apenas WhatsApp (sem telas web)

### **2. 👤 Autônomo**
- **Fluxo**: Homepage → Cadastro → WhatsApp (IA)
- **Funcionalidades**: Emissão GPS via IA
- **Acesso**: Apenas WhatsApp (sem telas web)

### **3. 🤝 Parceiro (Contabilidade)**
- **Fluxo**: Homepage → Cadastro → Dashboard Web
- **Funcionalidades**:
  - Gerenciar clientes
  - Gerar links de convite
  - Acompanhar comissões
  - Relatórios de faturamento

### **4. 🔧 Administrador**
- **Fluxo**: Login direto → Dashboard Admin
- **Funcionalidades**:
  - Gestão completa de usuários
  - Monitoramento NFSe (5 telas especializadas)
  - Configurações do sistema
  - Analytics e relatórios

## 🎨 Interface e Experiência

### **Design System**
- **Paleta**: Azuis profissionais (#3b82f6, #2563eb)
- **Tipografia**: Inter (moderna e legível)
- **Componentes**: Cards, badges, botões com hover effects
- **Responsividade**: Mobile-first, adaptável

### **Navegação**
- **Sidebar**: Navegação lateral com ícones
- **Breadcrumbs**: Orientação clara do usuário
- **Estados**: Loading, erro, vazio bem definidos

## 🔧 Funcionalidades Principais

### **1. 🏠 Homepage**
- Landing page atrativa
- Seleção de perfil (MEI/Autônomo/Parceiro)
- CTAs claros para cadastro

### **2. 📝 Cadastros**
- **MEI**: CNPJ, dados pessoais, certificado digital
- **Autônomo**: CPF, dados pessoais
- **Parceiro**: CNPJ da contabilidade, dados comerciais

### **3. 🤖 Atendimento WhatsApp**
- **IA Especializada**: Conhece legislação fiscal
- **Comandos**: "Emitir GPS", "Emitir NFS-e", "Histórico"
- **Automação**: Processamento 24/7
- **Integração**: Backend + Supabase + APIs externas

### **4. 📊 Dashboards**

#### **Dashboard Parceiro**
- **Métricas**: Clientes, comissões, emissões
- **Gestão**: Adicionar clientes, gerar links
- **Relatórios**: Faturamento, performance

#### **Dashboard Admin**
- **Visão Geral**: Estatísticas globais
- **Gestão NFSe**: 5 telas especializadas
  - 🔐 Certificados Digitais
  - 📊 Monitoramento de Emissões
  - 📈 Relatórios e Analytics
  - ⚙️ Configurações do Sistema
  - 🔍 Logs e Auditoria

### **5. 💰 Sistema de Pagamentos**
- **Stripe**: Cartão de crédito/débito
- **PIX**: Integração nativa
- **Webhooks**: Confirmação automática
- **Comissões**: Cálculo automático para parceiros

## 🔐 Segurança e Conformidade

### **Criptografia**
- **Dados Sensíveis**: CPF, CNPJ, PIS criptografados (AES-256-GCM)
- **Certificados**: Senhas PFX criptografadas
- **Transmissão**: HTTPS obrigatório

### **Controle de Acesso**
- **RLS**: Row Level Security no Supabase
- **JWT**: Tokens seguros para autenticação
- **Roles**: Admin, Parceiro, Usuário com permissões específicas

### **Auditoria**
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

## 📱 Fluxo de Uso

### **Para MEI/Autônomo:**
1. **Acesso**: Homepage → Seleção de perfil
2. **Cadastro**: Formulário específico
3. **Redirecionamento**: Link WhatsApp automático
4. **Atendimento**: IA guia todo o processo
5. **Emissões**: GPS/NFS-e via comandos
6. **Histórico**: Consulta via WhatsApp

### **Para Parceiro:**
1. **Acesso**: Homepage → Cadastro Parceiro
2. **Login**: Dashboard web
3. **Gestão**: Adicionar clientes, gerar links
4. **Acompanhamento**: Métricas e comissões
5. **Relatórios**: Exportação de dados

### **Para Administrador:**
1. **Acesso**: Login direto
2. **Monitoramento**: 5 telas NFSe especializadas
3. **Gestão**: Usuários, parceiros, configurações
4. **Analytics**: Relatórios completos
5. **Manutenção**: Logs, auditoria, troubleshooting

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18**: Interface moderna
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

## 📊 Métricas e KPIs

### **Para o Negócio**
- **Usuários Ativos**: MEIs e autônomos
- **Parceiros**: Contabilidades cadastradas
- **Emissões**: GPS e NFS-e processadas
- **Receita**: Taxas e comissões

### **Para Administradores**
- **Performance**: Tempo de resposta APIs
- **Erros**: Taxa de falhas por endpoint
- **Uso**: Picos de utilização
- **Segurança**: Tentativas de acesso

## 🔮 Roadmap Futuro

### **Fase 1: Estabilização** ✅
- [x] Interface moderna
- [x] Dashboards funcionais
- [x] Integração Supabase
- [x] Sistema de autenticação

### **Fase 2: Integração NFSe** 🚧
- [x] 5 telas administrativas NFSe
- [x] Gestão de certificados
- [x] Monitoramento de emissões
- [ ] Integração real com ADN
- [ ] Testes end-to-end

### **Fase 3: WhatsApp + IA** 📋
- [ ] Integração WhatsApp Business API
- [ ] IA especializada em legislação fiscal
- [ ] Automação completa de emissões
- [ ] Sistema de comandos por voz

### **Fase 4: Escala** 🚀
- [ ] Multi-tenant para parceiros
- [ ] API pública para integrações
- [ ] Mobile app nativo
- [ ] Marketplace de serviços

## 🎯 Diferenciais Competitivos

1. **🤖 IA Especializada**: Conhecimento profundo em legislação fiscal
2. **📱 WhatsApp First**: Atendimento onde o usuário já está
3. **🤝 Rede de Parceiros**: Sistema de comissões atrativo
4. **🔐 Segurança**: Criptografia e compliance total
5. **📊 Analytics**: Insights para tomada de decisão
6. **⚡ Performance**: Resposta rápida e confiável

## 📞 Suporte e Manutenção

### **Monitoramento**
- **Uptime**: 99.9% de disponibilidade
- **Logs**: Centralizados e estruturados
- **Alertas**: Notificações automáticas
- **Backup**: Diário e seguro

### **Atualizações**
- **Deploy**: Automático via CI/CD
- **Rollback**: Reversão rápida se necessário
- **Versionamento**: Semântico e documentado
- **Testing**: Cobertura completa

---

**GuiasMEI** - Transformando a gestão fiscal através da tecnologia! 🚀
