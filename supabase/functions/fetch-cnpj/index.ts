// @deno-types="https://deno.land/std@0.177.0/http/server.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Headers CORS para todas as respostas
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Função auxiliar para garantir que TODAS as respostas tenham CORS
function withCors(body: BodyInit | null, init: ResponseInit = {}): Response {
  return new Response(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

serve(async (req: Request) => {
  // Responder a preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return withCors(null, { status: 204 });
  }

  // Aceitar apenas GET
  if (req.method !== 'GET') {
    return withCors(
      JSON.stringify({ error: 'Método não permitido. Use GET.' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const cnpj = url.searchParams.get('cnpj');

    if (!cnpj) {
      return withCors(
        JSON.stringify({ error: 'Parâmetro "cnpj" é obrigatório.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ URL corrigida — sem espaços!
    const apiUrl = `https://www.receitaws.com.br/v1/cnpj/${cnpj}`;
    const externalResponse = await fetch(apiUrl);

    // Verificar se a resposta da API externa foi bem-sucedida
    if (!externalResponse.ok) {
      console.error(`Erro na API Receita WS: ${externalResponse.status} ${externalResponse.statusText}`);
      return withCors(
        JSON.stringify({ error: `Erro ao consultar CNPJ: ${externalResponse.status}` }),
        { 
          status: externalResponse.status >= 400 && externalResponse.status < 500 ? 400 : 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await externalResponse.json();

    return withCors(
      JSON.stringify(data),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro interno na Edge Function:', error);

    // SEMPRE retornar com CORS, mesmo em erro interno
    return withCors(
      JSON.stringify({ error: 'Erro interno no servidor. Tente novamente mais tarde.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});