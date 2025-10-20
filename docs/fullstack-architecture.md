# GuiasMEI Full-Stack Technical Plan

## 1. Objetivo
Este documento descreve o plano técnico para fazer o GuiasMEI operar conforme o fluxo revisado: onboarding inicial via web, condução do usuário para atendimento 100% no WhatsApp com agente de IA, cobrança de adesão e tarifas sobre serviços e acesso diferenciado para parceiros e administradores.

## 2. Diagnóstico do estado atual
- **Frontend**: aplicação React monolítica (CRA/Vite) que mistura páginas públicas, fluxos de cadastro, dashboards e emissão simulada de documentos.
- **Backend**: funções Supabase (Edge Functions) para Stripe e consultas de CNPJ; ausência de uma API própria para orquestrar o atendimento no WhatsApp e sincronizar estados de onboarding/pagamento/emissões.
- **Persistência**: apenas parte das tabelas usadas nas telas está provisionada; não há tabelas formais para parceiros, emissões, vínculo com WhatsApp ou logs da IA.
- **Fluxo real**: após cadastro, o usuário permanece no web app, mas queremos mover as ações críticas para o WhatsApp.

## 3. Metas funcionais
1. Web app apenas para landing, cadastro e login inicial.
2. MEIs e autônomos migram para atendimento automatizado via WhatsApp imediatamente após o cadastro.
3. Parceiros ficam no dashboard web com ferramentas de convite, métricas e gestão de clientes.
4. Stripe (cartão) e PIX cobram a taxa de adesão; o webhook confirma pagamento e destrava o atendimento na IA.
5. A IA executa emissões de NFS-e/GPS, consulta históricos e envia documentos sob demanda.
6. Tarifas por serviço (R$3/NFS-e e 6%/GPS) são registradas como transações adicionais.

## 4. Arquitetura recomendada
### 4.1 Organização do repositório
Manter monorepo com duas pastas de nível superior:
- `apps/frontend`: app React (Vite) focado em landing/cadastro/dashboards.
- `apps/backend`: API Node.js (NestJS, Fastify ou Adonis) que expõe endpoints REST/GraphQL e integra com Supabase, Stripe e WhatsApp.
- `packages/` e `supabase/` continuam para código compartilhado (tipos, utilitários) e infra Supabase.

Alternativa: manter a API como Edge Functions Supabase. Contudo, para coordenação da IA e integrações com provedores externos, recomenda-se um backend dedicado (`apps/backend`) com fila/eventos e Webhooks, usando Supabase apenas como banco/Auth.

### 4.2 Componentes principais
1. **Frontend (React)**
   - Fluxo de cadastro com redirecionamento para WhatsApp via deep link.
   - Dashboard de parceiros/admin carregando dados via API backend.
   - Painel mínimo para administradores (aberto apenas para supervisão).
2. **Backend (Node.js)**
   - Autenticação: delegar ao Supabase Auth (jwt) ou implementar Auth própria usando o mesmo banco.
   - Orquestração: gerenciar estados de onboarding, pagamentos e tarefas da IA.
   - Webhooks: Stripe (pagamento adesão e tarifas), PIX provider, WhatsApp provider.
   - Serviços: emissão NFS-e/GPS, geração de PDFs, cálculo de tarifas, notificações.
3. **Supabase (Postgres + Auth)**
   - Fonte única de dados (usuários, perfis, parceiros, emissões, transações, conversas).
   - Regras RLS reforçadas para impedir acesso indevido.
4. **WhatsApp Automation**
   - Pode ser Twilio, Meta Cloud API ou provedor terceiro.
   - Backend expõe endpoints para receber mensagens e responde usando machine learning/LLM.

## 5. Modelagem de dados
### 5.1 Principais tabelas
- `profiles` (já existe): estender com colunas `role` (`'mei' | 'autonomo' | 'partner' | 'admin'`), `whatsapp_phone`, `onboarding_status`, `partner_id`.
- `partners`: dados da contabilidade (CNPJ/CPF, endereço, limites, comissionamento).
- `partner_invitations`: convites emitidos, códigos/prefixos de link, status.
- `customers`: detalhamento de MEIs/autônomos (CNPJ, CPF, PIS, dados bancários) criptografados.
- `whatsapp_sessions`: token de sessão com IA, status da conversa, último atendimento.
- `payments`: registrar taxa de adesão, método (PIX/Stripe), valor, status, referência a invoice.
- `service_transactions`: cada emissão de NFS-e/GPS com valores cobrados e logs.
- `nfse_documents` e `gps_documents`: armazenamento dos metadados gerados (número nota, chave, links PDF).
- `audit_logs`: rastreabilidade de ações da IA e humanos.

### 5.2 Migrações
- Criar migrations no Supabase para todas as tabelas acima.
- Ajustar RLS: permitir leitura/consulta apenas ao próprio usuário, parceiros aos seus clientes, admins a tudo.
- Criar views/materialized views para dashboards (KPIs por parceiro, volume mensal, receita).

## 6. Backend/API design
### 6.1 Endpoints principais
- `POST /auth/register` — cria usuário via Supabase, envia link WhatsApp.
- `POST /auth/login` — delega para Supabase Auth.
- `POST /partners/invitations` — cria link de convite; gera URL `https://guiasmei.com/cadastro?ref=XYZ`.
- `GET /partners/dashboard` — métricas (clientes, receitas, emissões).
- `POST /webhooks/stripe` — confirma pagamentos de adesão e tarifas.
- `POST /webhooks/pix` — confirma PIX.
- `POST /webhooks/whatsapp` — recebe mensagens do usuário e agenda respostas (usando fila/bot).
- `POST /services/nfse` e `POST /services/gps` — endpoints internos usados pela IA para emitir documentos.
- `GET /documents/:id` — serve PDF com autenticação e expiração.

### 6.2 Fluxo de mensagens WhatsApp
1. Usuário inicia conversa via link `https://wa.me/55XXXXXXXXXX?text=INICIAR%20GUIASMEI`.
2. Backend cria/atualiza `whatsapp_sessions` e passa contexto (tipo de usuário, status de pagamento, dados cadastrais).
3. IA (ex.: integração com OpenAI GPT + ferramentas) guia o usuário, chama serviços internos quando necessário (emissão de NFS-e/GPS, consulta histórico, reenvio de PDFs).
4. Registrar cada mensagem em `audit_logs` para conformidade.

### 6.3 Cálculo de tarifas
- Taxa fixa de adesão salva em `payments`.
- Em cada emissão:
  - `nfse`: inserir `service_transactions` com `type='nfse'`, `fee_fixed=3.00`, `total = fee_fixed`.
  - `gps`: `type='gps'`, `fee_percent=0.06`, `base_amount`, `total = base_amount * fee_percent`.
- Gateway de cobrança: usar Stripe Payment Links ou cobrança manual via PIX; backend registra `status=paid` após webhook.

## 7. Ajustes no Frontend
1. **Landing page**: incluir CTA com seletor de tipo de usuário; ao concluir cadastro, redirecionar para link WhatsApp ou dashboard parceiro.
2. **Fluxo de cadastro**:
   - Simplificar formulários; enviar dados para `apps/backend` via API.
   - Receber resposta com instruções e link (para MEI/autônomo) ou token de sessão (parceiro).
3. **Login**: usado apenas para parceiros e admins.
4. **Dashboards**:
   - Parceiro: métricas, convites, lista de clientes, histórico de faturamento (consumir endpoints `GET /partners/dashboard`, `GET /partners/customers`).
   - Admin: visões globais (tabelas agregadas, filtros de emissão/pagamentos).
5. **Remover/ocultar telas de emissão do usuário**: orientar o usuário a usar WhatsApp.

## 8. Integrações externas
- **Stripe**: configurar produtos/preços para taxa de adesão e cobranças variáveis (usando Payment Intents). Webhook deve atualizar `payments` e liberar atendimento.
- **PIX**: escolher PSP (Gerencianet, Pagar.me, Iugu) com webhook de confirmação. Backend unifica o status.
- **ReceitaWS ou Gov.br**: manter função `fetch-cnpj` para autocomplete.
- **NFS-e**: avaliar provedores (E-notas, NFE.io) ou integrações municipais específicas. Expor chave API via backend, nunca direto no frontend.
- **GPS**: gerar via Receita (SEFIP) ou biblioteca própria; armazenar PDF no Supabase Storage ou S3.

## 9. Segurança e conformidade
- Criptografar dados sensíveis antes de gravar (AES-GCM com chaves gerenciadas no backend). Remover lógica de criptografia do frontend para evitar exposição da chave.
- Implementar rate limiting, monitoramento e auditoria para webhooks.
- LGPD: registrar consentimentos, permitir exclusão de dados, manter registro de acesso.
- Backup periódico do banco e Storage.

## 10. Observabilidade
- Adicionar logs estruturados (Winston/Pino) no backend.
- Configurar métricas (Prometheus/Grafana ou APM SaaS) e alertas para falhas em webhooks, emissões ou pagamentos.

## 11. Roadmap de implementação
1. **Fundação de backend**
   - Criar `apps/backend` (NestJS ou Fastify).
   - Configurar Supabase client, autenticação (JWT service role), migrations.
2. **Modelagem de dados**
   - Escrever migrations e seeds para parceiros/admins.
   - Atualizar RLS.
3. **Integrações de pagamento**
   - Implementar endpoints Stripe/PIX e testar webhooks.
4. **Integração WhatsApp + IA**
   - Definir provedor; criar fluxo de mensagens, persistir sessões.
   - Implementar orquestração com LLM (ex.: GPT-4.1) + ferramentas internas.
5. **Atualização do frontend**
   - Ajustar formulários, redirecionamentos e dashboards.
   - Remover emissões diretas; adicionar instruções de uso via WhatsApp.
6. **Serviços de emissão**
   - Integrar provedores NFS-e/GPS e geração de PDFs.
   - Adicionar testes end-to-end com cenários de emissão.
7. **Go-live**
   - Configurar CI/CD (GitHub Actions) para frontend e backend.
   - Preparar ambiente (Supabase, servidor backend, storage, domínio, certificados).

## 12. Resposta às perguntas
- **"O que precisamos alterar?"** — Implementar backend dedicado, migrations completas, integração WhatsApp, redirecionar o fluxo do usuário para IA e ajustar dashboards; remover dependência de lógica sensível no frontend.
- **"Precisamos separar em duas pastas frontend/backend?"** — Sim, recomenda-se `apps/frontend` e `apps/backend` dentro do monorepo para facilitar versionamento, CI/CD e responsabilidades claras. O frontend continua React; o backend pode ser NestJS/Fastify com testes e infraestrutura de webhooks.
- **"Documento técnico full stack"** — Este arquivo consolida a visão de arquitetura, dados, endpoints, integrações e roadmap para alcançar o comportamento desejado.
