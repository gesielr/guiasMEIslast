// supabase/functions/whatsapp-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
      };
    }>;
  }>;
}

serve(async (req) => {
  // Verificação inicial (Meta envia GET para validar webhook)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  if (req.method === 'POST') {
    const payload: WebhookPayload = await req.json();

    // Validação básica
    if (payload.object !== 'whatsapp_business_account') {
      return new Response('Invalid object', { status: 400 });
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const { contacts, messages } = change.value;

        if (messages && contacts) {
          for (const msg of messages) {
            if (msg.type !== 'text') continue; // Só processa texto por enquanto

            const from = msg.from; // WhatsApp ID (ex: 5511999999999)
            const text = msg.text?.body || '';
            const contact = contacts.find(c => c.wa_id === from);

            console.log(`[WhatsApp Official] Mensagem de ${contact?.profile.name} (${from}): ${text}`);

            // Verificar se contém ID do usuário
            if (text.includes('Meu ID é:')) {
              const userId = text.split('Meu ID é:')[1].trim();

              // Atualizar usuário no Supabase
              const { error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/users?id=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                  'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                  whatsapp_consent: true,
                  updated_at: new Date().toISOString()
                })
              });

              if (error) {
                console.error('Erro ao atualizar usuário:', error);
              } else {
                console.log(`✅ Usuário ${userId} deu consentimento via WhatsApp`);

                // Responder com contrato e pagamento (simulado aqui, mas em produção usa sendWhatsAppMessage)
                // Em produção, você chamaria outra Edge Function para enviar a resposta
                console.log(`[IA] Respondendo para ${from}: Links de contrato e pagamento...`);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }

  return new Response('Method not allowed', { status: 405 });
});