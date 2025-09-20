// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno&no-check";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId = session.metadata?.user_id;
    const sessionId = session.id;

    if (userId) {
      // Atualizar pagamento como pago
      const { error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/payments`, {
        method: 'POST',
        headers: {
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          amount: session.amount_total / 100,
          type: session.metadata?.type || 'onboarding',
          status: 'paid',
          stripe_session_id: sessionId,
        }),
      });

      if (error) {
        console.error('Erro ao registrar pagamento:', error);
      } else {
        // Atualizar perfil do usuário: contrato aceito e onboarding concluído
        await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contract_accepted: true,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});