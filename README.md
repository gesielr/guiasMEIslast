# Guias MEI

Aplicação web full-stack (React + Node.js/Deno) com Supabase para emissão e gestão de guias de impostos (GPS) e notas fiscais (NFS-e) para Microempreendedores Individuais (MEI) e autônomos. O projeto inclui integração com Stripe para pagamentos e um simulador de WhatsApp para onboarding e suporte.

## Funcionalidades

O projeto é dividido em várias funcionalidades principais, atendendo a diferentes perfis de usuário (cliente final, parceiro e administrador).

### Gestão de Usuários e Autenticação
- **Cadastro de Usuários:** Fluxos de cadastro distintos para MEI, Autônomo e Parceiros.
- **Autenticação Segura:** Login e gestão de sessão utilizando Supabase Auth.
- **Perfis de Usuário:** Perfis detalhados para cada tipo de usuário com informações específicas.
- **Busca de CNPJ:** Integração com API para buscar e validar dados de CNPJ durante o cadastro.

### Funcionalidades para o Cliente (MEI/Autônomo)
- **Emissão de Guia de Previdência Social (GPS):** Geração de guias de pagamento do INSS.
- **Emissão de Nota Fiscal de Serviço (NFS-e):** Geração de notas fiscais de serviço (simuladas).
- **Histórico de Documentos:** Acesso a um histórico de todas as guias e notas emitidas.
- **Dashboard do Usuário:** Painel central para visualização de status, atalhos para emissão de documentos e informações relevantes.

### Pagamentos e Assinaturas
- **Integração com Stripe:** Processamento de pagamentos para acesso a funcionalidades premium.
- **Checkout de Pagamento:** Geração de sessões de checkout do Stripe de forma segura através de funções de backend.
- **Webhooks:** Processamento de eventos do Stripe (ex: pagamento confirmado) para atualização automática do status do usuário no banco de dados.

### Dashboards e Perfis
- **Dashboard do Usuário:** Painel para o cliente final com suas informações e ações rápidas.
- **Dashboard do Parceiro:** Painel para parceiros gerenciarem seus clientes e visualizarem informações relevantes.
- **Dashboard do Administrador:** Painel de administração para gestão completa de usuários, parceiros e configurações do sistema.

### Integrações
- **WhatsApp:** Onboarding e suporte ao cliente através de um webhook que recebe mensagens e um simulador para testes locais.
- **Supabase:** Utilização intensiva dos recursos do Supabase:
    - **Authentication:** Para gestão de usuários.
    - **Postgres Database:** Com Row Level Security (RLS) para garantir a privacidade dos dados.
    - **Edge Functions:** Para lógica de backend segura (pagamentos, webhooks, etc.).

### Segurança
- **Criptografia de Dados Sensíveis:** Dados como CPF, CNPJ e PIS são criptografados (AES-GCM) antes de serem armazenados no banco de dados.
- **Row Level Security (RLS):** Regras de segurança no nível do banco de dados para garantir que um usuário só possa acessar seus próprios dados.
- **Validação de Dados:** Utilização de schemas (Zod) para validar todos os dados que entram no sistema, tanto no frontend quanto no backend.

## Tecnologias Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, React Router.
- **Backend:**
    - **Supabase:** Auth, Postgres, Edge Functions (Deno/TypeScript).
    - **Node.js:** Para rotas de backend e serviços.
- **Pagamentos:** Stripe.
- **Estrutura do Projeto:** Monorepo com `apps` (web, backend) e `packages` (config, sdk, ui).

## Como Rodar Localmente (Windows PowerShell)

1.  **Instalar Dependências:**
    ```powershell
    npm install
    ```

2.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e preencha com as chaves do Supabase, Stripe e outras configurações. Use o `.env.example` como referência.

3.  **Iniciar Todos os Serviços (Recomendado):**
    Este comando utiliza `concurrently` para iniciar o frontend, o Supabase local e o simulador de WhatsApp.
    ```powershell
    npm run dev
    ```
    *Requisito:* Você precisa ter o [Supabase CLI](https://supabase.com/docs/guides/cli) instalado.

4.  **Iniciar Apenas o Frontend:**
    ```powershell
    npm start
    ```
    O site estará disponível em `http://localhost:3000`.

## Scripts Úteis

- `npm start`: Inicia o servidor de desenvolvimento do frontend.
- `npm run build`: Gera a build de produção do frontend.
- `npm run dev`: Inicia todos os serviços em modo de desenvolvimento.
- `npm run dev:supabase`: Inicia o ambiente local do Supabase e suas funções.
- `npm run dev:whatsapp`: Inicia o simulador local do WhatsApp.

## Estrutura de Arquivos

- `apps/web`: Contém o código-fonte do frontend em React.
- `apps/backend`: Contém as rotas e serviços do backend em Node.js.
- `packages/`: Contém pacotes compartilhados no monorepo:
    - `config`: Schemas de validação e tipos.
    - `sdk`: Cliente para comunicação com o backend.
    - `ui`: Componentes de UI reutilizáveis.
- `supabase/`: Contém as configurações e funções do Supabase:
    - `functions/`: Edge Functions para operações críticas (pagamentos, webhooks, etc.).
    - `migrations/`: Migrações do banco de dados.