// src/services/whatsappService.js

// Durante desenvolvimento, usamos mock
const USE_MOCK = process.env.NODE_ENV !== 'production';

// Em produção, usa a API oficial
const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';
const PHONE_NUMBER_ID = process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;

// Função para enviar mensagem (usada pela IA ou sistema)
export const sendWhatsAppMessage = async (to, message) => {
  if (USE_MOCK) {
    console.log(`[MOCK WhatsApp] Enviando para ${to}: ${message}`);
    // Em modo mock, só loga — ou chama seu simulador local
    return { success: true, mock: true };
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove máscara
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao enviar mensagem');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro no WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

// Função para formatar número (ex: +5511999999999)
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+55${cleaned}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned}`;
  }
  return `+55${cleaned}`;
};