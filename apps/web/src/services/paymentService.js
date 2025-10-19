const API_URL = process.env.REACT_APP_SUPABASE_URL;
const API_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const createCheckoutSession = async (user_id, amount = 120, description = "Adesão Rebelo App") => {
  const response = await fetch(`${API_URL}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      user_id,
      amount,
      description,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar sessão de pagamento');
  }

  const data = await response.json();
  return data.url; // URL do Stripe Checkout
};