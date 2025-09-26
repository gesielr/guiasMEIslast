// telegram-bot/server.js
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Para carregar variáveis de ambiente do arquivo .env

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuração do Bot do Telegram ---
// Substitua pelo token do seu bot ou coloque em um arquivo .env
const token = process.env.TELEGRAM_BOT_TOKEN || 'SEU_TOKEN_AQUI';

// Criando o bot. 'polling' é usado para desenvolvimento. Em produção, usaríamos webhooks.
const bot = new TelegramBot(token, { polling: true });

app.use(express.json());

console.log('🤖 Bot do Telegram iniciado e aguardando mensagens...');

// Listener para o comando /start, que é enviado quando o usuário inicia a conversa.
// O link no frontend será t.me/seu_bot?start=USER_ID
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = match[1]; // Captura o ID do usuário do comando start

  console.log(`[IA] Iniciando onboarding para usuário: ${userId} | Chat ID: ${chatId}`);

  // Simula fluxo da IA
  const welcomeMessage = `🤖 Olá! Sou a assistente virtual da Rebelo. Vi que você se cadastrou com o ID: ${userId}.\n\nVamos começar?`;
  await bot.sendMessage(chatId, welcomeMessage);

  // Simula a coleta de dados da categoria (Pessoa Física)
  const categoryMessage = `Para gerar suas guias de INSS, preciso saber em qual categoria você se encaixa. Por favor, escolha uma:`;
  await bot.sendMessage(chatId, categoryMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Autônomo', callback_data: 'category_autonomo' }],
        [{ text: 'Empregador Doméstico', callback_data: 'category_domestico' }],
        [{ text: 'Pró-labore', callback_data: 'category_prolabore' }]
      ]
    }
  });
});

// Listener para os botões inline
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data; // ex: 'category_autonomo'

  if (data.startsWith('category_')) {
    const category = data.split('_')[1];
    await bot.sendMessage(chatId, `Ótimo! Você selecionou: ${category}.\n\nAgora, para ativar sua conta, basta pagar a taxa de adesão única de R$120,00 neste link seguro: https://rebelo.app/pagar/USER_ID_AQUI`);
    // Aqui você chamaria uma API para salvar a categoria no perfil do usuário no Supabase.
  }
});

// Rota para verificar status
app.get('/status', (req, res) => {
  res.json({ status: 'running', bot: 'Telegram' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor do Bot do Telegram rodando em http://localhost:${PORT}`);
});