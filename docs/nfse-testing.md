# Testes ponta a ponta da integração NFSe

1. **Preparar ambiente Supabase**
   - Execute `supabase db push` para aplicar as migrations (incluindo `pass_encrypted`, `pass_iv`, `pass_tag` na tabela `nfse_credentials`).
   - Crie o bucket privado `certificates` (`supabase storage create-bucket certificates --public=false`).
   - Ajuste as políticas do bucket para permitir acesso apenas à `service_role`.

2. **Configurar variáveis de ambiente**
   - Atualize `apps/backend/.env` com:
     - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.
     - Endpoints ADN de pré-produção: `NFSE_CONTRIBUINTES_BASE_URL`, `NFSE_PARAMETROS_BASE_URL`, `NFSE_DANFSE_BASE_URL`.
     - `NFSE_CREDENTIAL_SECRET` com uma chave de 32 caracteres.
     - `NFSE_ENV=pr`.
   - Defina `NFSE_CERT_PFX_BASE64` ou `NFSE_CERT_PFX_PATH` caso a infraestrutura use um PFX "da casa" para mTLS.

3. **Cadastrar credencial do contribuinte**
   - Faça login no app e gere um token de sessão que permita chamar `POST /services/nfse/credentials`.
   - Envie o payload com:
     ```json
     {
       "userId": "<uuid-do-usuario>",
       "type": "A1",
       "subject": "RAZAO SOCIAL LTDA",
       "document": "12345678000195",
       "notAfter": "2026-01-01T00:00:00Z",
       "pfxBase64": "<arquivo-pfx-em-base64>",
       "pass": "<senha-pfx>"
     }
     ```
   - Verifique no Supabase que o arquivo foi gravado em `storage.certificates` e que a linha em `nfse_credentials` contém `pass_encrypted`, `pass_iv`, `pass_tag`.

4. **Emitir DPS**
   - Chame `POST /services/nfse` com o corpo seguindo o `createDpsSchema` (ver `apps/backend/src/nfse/dto/create-dps.dto.ts:53`).
   - Confirme que a resposta retorna `protocolo`.
   - Valide que `nfse_emissions` recebeu uma nova linha com `status = 'EM_FILA'`.

5. **Acompanhar processamento**
   - Aplique `npm run dev:api` e aguarde o cron (`apps/backend/src/nfse/workers/scheduler.ts:5`) disparar, ou force manualmente chamando `pollPendingEmissions()` via REPL.
   - Monitore logs para as chamadas GET `/contribuintes/servicos/dps/{protocolo}` e, quando `situacao = AUTORIZADA`, confirme o upload do PDF (`attachPdf`).

6. **Baixar DANFSe**
   - Use `GET /services/nfse/:id/pdf` com a chave retornada.
   - Verifique se o arquivo PDF abre corretamente.

7. **Cenários de falha**
   - Teste senha incorreta do PFX (a API deve responder 400).
   - Teste protocolo inexistente no poller (o status deve registrar erro).
   - Teste token sem permissões Supabase para garantir que as políticas de storage bloqueiam o acesso.

> Se algum passo falhar por ausência de confguração, revise as seções correspondentes em `docs/fullstack-setup.md:10` e nos arquivos de environment listados acima.
