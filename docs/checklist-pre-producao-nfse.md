# Checklist Técnico: Preparação para Testes NFSe com Supabase

## 📋 Resumo Executivo

Este documento mapeia **todos os itens faltantes** para conseguirmos testar a integração NFSe com Supabase antes da produção. A análise foi feita como desenvolvedor fullstack, cobrindo infraestrutura, código, configurações e testes.

## 🚨 Status Atual

### ✅ **O que já está implementado**
- **Backend NFSe**: Controller, serviços, repositórios, workers, crypto, templates
- **Supabase**: Migrations, tabelas, políticas RLS básicas
- **Frontend**: Telas de dashboard, autenticação, emissão
- **Monorepo**: Estrutura com workspaces, dependências

### ❌ **O que está faltando (CRÍTICO)**

---

## 🔧 **1. INFRAESTRUTURA E CONFIGURAÇÃO**

### 1.1 **Variáveis de Ambiente (FALTANDO)**
```bash
# apps/backend/.env - CRÍTICO: Arquivo não existe
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NFSE_ENV=pr
NFSE_CONTRIBUINTES_BASE_URL=https://preprod.nfse.gov.br/contribuintes
NFSE_PARAMETROS_BASE_URL=https://preprod.nfse.gov.br/parametros
NFSE_DANFSE_BASE_URL=https://preprod.nfse.gov.br/danfse
NFSE_CREDENTIAL_SECRET=chave-de-32-chars-para-criptografia
NFSE_CERT_PFX_BASE64=base64-do-certificado-mtls
NFSE_CERT_PFX_PASS=senha-do-certificado
```

### 1.2 **Supabase Storage (FALTANDO)**
- [ ] Bucket `certificates` (privado) - para PFX dos usuários
- [ ] Bucket `nfse-pdfs` (privado) - para DANFSe gerados
- [ ] Políticas de Storage para `service_role` apenas
- [ ] Teste de upload/download de arquivos

### 1.3 **Migrations Pendentes**
- [ ] Aplicar todas as migrations: `supabase db push`
- [ ] Verificar se `pdf_storage_path` foi adicionado em `nfse_emissions`
- [ ] Testar conexão com Supabase

---

## 🧪 **2. TESTES E VALIDAÇÃO**

### 2.1 **Testes Unitários (FALTANDO)**
```bash
# Existem apenas 3 testes básicos
apps/backend/test/
├── dps-template.test.ts
├── pfx-utils.test.ts
└── xml-signer.test.ts
```

**FALTANDO:**
- [ ] Testes de integração com Supabase
- [ ] Testes de criptografia de credenciais
- [ ] Testes de upload/download de Storage
- [ ] Testes de workers/scheduler
- [ ] Testes de validação de PFX
- [ ] Testes de assinatura XML

### 2.2 **Testes de Integração (FALTANDO)**
- [ ] Teste completo do fluxo NFSe (cadastro → emissão → autorização)
- [ ] Teste de fallback entre ADN e Storage
- [ ] Teste de tratamento de erros
- [ ] Teste de performance com múltiplas emissões

### 2.3 **Testes End-to-End (FALTANDO)**
- [ ] Script automatizado de teste completo
- [ ] Validação de PDFs gerados
- [ ] Teste de diferentes tipos de certificados
- [ ] Teste de cenários de falha

---

## 🔐 **3. SEGURANÇA E AUTENTICAÇÃO**

### 3.1 **Autenticação NFSe (FALTANDO)**
- [ ] Middleware de autenticação para endpoints NFSe
- [ ] Validação de permissões por usuário
- [ ] Rate limiting para emissões
- [ ] Logs de auditoria para operações sensíveis

### 3.2 **Políticas RLS (INCOMPLETAS)**
```sql
-- FALTANDO: Políticas mais restritivas
-- FALTANDO: Validação de service_role para operações admin
-- FALTANDO: Políticas específicas para Storage
```

### 3.3 **Criptografia (PARCIAL)**
- [ ] Validação de força da chave `NFSE_CREDENTIAL_SECRET`
- [ ] Rotação de chaves de criptografia
- [ ] Backup seguro de chaves

---

## 📱 **4. FRONTEND E UX**

### 4.1 **Telas NFSe (FALTANDO)**
- [ ] Tela de cadastro de certificado digital
- [ ] Tela de status de emissões
- [ ] Tela de download de DANFSe
- [ ] Tela de histórico de NFSe
- [ ] Validação de formulários NFSe

### 4.2 **Integração Frontend-Backend (FALTANDO)**
- [ ] SDK/API client para NFSe
- [ ] Tratamento de erros específicos NFSe
- [ ] Loading states para operações longas
- [ ] Notificações de status

### 4.3 **Responsividade (PARCIAL)**
- [ ] Teste em dispositivos móveis
- [ ] Otimização para tablets
- [ ] Acessibilidade (ARIA labels)

---

## 🚀 **5. DEPLOY E PRODUÇÃO**

### 5.1 **Ambiente de Staging (FALTANDO)**
- [ ] Configuração de ambiente de homologação
- [ ] Dados de teste consistentes
- [ ] Monitoramento de logs
- [ ] Backup automático

### 5.2 **CI/CD (FALTANDO)**
- [ ] Pipeline de deploy automático
- [ ] Testes automatizados no CI
- [ ] Rollback automático em caso de falha
- [ ] Deploy blue-green

### 5.3 **Monitoramento (FALTANDO)**
- [ ] Logs estruturados (JSON)
- [ ] Métricas de performance
- [ ] Alertas de erro
- [ ] Dashboard de saúde do sistema

---

## 🔄 **6. WORKERS E BACKGROUND JOBS**

### 6.1 **Scheduler (PARCIAL)**
```typescript
// Existe mas precisa de melhorias
- [ ] Retry logic para falhas
- [ ] Dead letter queue
- [ ] Monitoramento de jobs
- [ ] Escalabilidade horizontal
```

### 6.2 **Processamento Assíncrono (FALTANDO)**
- [ ] Queue system (Redis/Bull)
- [ ] Processamento em lote
- [ ] Priorização de jobs
- [ ] Timeout handling

---

## 📊 **7. DADOS E MIGRAÇÃO**

### 7.1 **Seeds e Dados de Teste (FALTANDO)**
- [ ] Dados de municípios
- [ ] Códigos de tributação
- [ ] Usuários de teste
- [ ] Certificados de teste

### 7.2 **Backup e Recovery (FALTANDO)**
- [ ] Estratégia de backup
- [ ] Teste de restore
- [ ] Backup de Storage
- [ ] Versionamento de dados

---

## 🧩 **8. INTEGRAÇÕES EXTERNAS**

### 8.1 **ADN NFSe (PARCIAL)**
- [ ] Certificado mTLS válido
- [ ] Teste de conectividade
- [ ] Tratamento de timeouts
- [ ] Fallback para offline

### 8.2 **WhatsApp (FALTANDO)**
- [ ] Integração real com API WhatsApp
- [ ] Webhook de mensagens
- [ ] Template de mensagens
- [ ] Rate limiting

---

## 📋 **9. CHECKLIST DE EXECUÇÃO**

### **FASE 1: INFRAESTRUTURA (1-2 dias)**
- [ ] Criar arquivo `.env` com todas as variáveis
- [ ] Configurar buckets do Supabase Storage
- [ ] Aplicar todas as migrations
- [ ] Testar conexão com Supabase

### **FASE 2: TESTES (2-3 dias)**
- [ ] Implementar testes unitários faltantes
- [ ] Criar testes de integração
- [ ] Testar fluxo completo NFSe
- [ ] Validar segurança

### **FASE 3: FRONTEND (2-3 dias)**
- [ ] Implementar telas NFSe faltantes
- [ ] Integrar com backend
- [ ] Testar UX/UI
- [ ] Validar responsividade

### **FASE 4: DEPLOY (1-2 dias)**
- [ ] Configurar ambiente de staging
- [ ] Implementar CI/CD
- [ ] Configurar monitoramento
- [ ] Teste de produção

---

## 🎯 **PRIORIDADES CRÍTICAS**

### **ALTA PRIORIDADE (BLOQUEANTES)**
1. **Variáveis de ambiente** - Sem isso, nada funciona
2. **Supabase Storage** - Necessário para certificados e PDFs
3. **Testes básicos** - Para validar funcionalidade
4. **Certificado mTLS** - Para comunicação com ADN

### **MÉDIA PRIORIDADE (IMPORTANTES)**
1. **Telas frontend** - Para usuário final
2. **Testes de integração** - Para confiabilidade
3. **Monitoramento** - Para produção
4. **Segurança** - Para compliance

### **BAIXA PRIORIDADE (MELHORIAS)**
1. **CI/CD** - Para automação
2. **Performance** - Para escala
3. **UX avançada** - Para experiência
4. **Analytics** - Para insights

---

## 📞 **PRÓXIMOS PASSOS IMEDIATOS**

1. **HOJE**: Criar `.env` e configurar Supabase Storage
2. **AMANHÃ**: Implementar testes básicos e validar fluxo
3. **ESTA SEMANA**: Completar telas frontend e testes de integração
4. **PRÓXIMA SEMANA**: Deploy em staging e testes de produção

---

## 🔍 **RECURSOS NECESSÁRIOS**

### **Desenvolvimento**
- Certificado digital A1 válido para testes
- Acesso ao ambiente pré-produção da ADN
- Conta Supabase com Storage habilitado
- Ambiente de desenvolvimento configurado

### **Tempo Estimado**
- **Desenvolvedor Sênior**: 1-2 semanas
- **Desenvolvedor Pleno**: 2-3 semanas  
- **Desenvolvedor Júnior**: 3-4 semanas

### **Custos**
- Supabase Pro (se necessário para Storage)
- Certificado digital (se não tiver)
- Ambiente de staging (opcional)

---

*Documento gerado em: $(date)*
*Versão: 1.0*
*Status: Em análise*
