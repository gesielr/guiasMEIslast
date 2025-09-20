// whatsapp-sim/server.js
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'rebelo-whatsapp-secret',
  resave: false,
  saveUninitialized: true
}));

// Servir frontend temporário para exibir QR Code
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "rebelo-app" }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR CODE para escanear no WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web conectado!');
});

client.on('message', async msg => {
  const text = msg.body.trim();
  const from = msg.from;

  // Verifica se a mensagem contém o ID do usuário (ex: "Olá! Sou novo usuário. Meu ID é: UUID")
  if (text.includes('Meu ID é:')) {
    const userId = text.split('Meu ID é:')[1].trim();

    // Simula fluxo da IA
    await msg.reply(`🤖 Olá! Sou a IA da Rebelo. Vamos começar seu cadastro!\n\n1. Leia e aceite nosso contrato: https://rebelo.app/contrato-${userId}.pdf\n2. Pague sua adesão de R$120,00: https://rebelo.app/pagar/${userId}\n\nApós o pagamento, te ajudarei a emitir sua primeira nota fiscal!`);

    // Aqui você poderia chamar uma API para atualizar o status do usuário no Supabase
    // Usando a variável 'from' no log
    console.log(`[IA] Iniciando onboarding para usuário: ${userId} | WhatsApp: ${from}`);
  }
});

client.initialize();

// Rota para verificar status
app.get('/status', (req, res) => {
  res.json({ status: client.info ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de simulação WhatsApp rodando em http://localhost:${PORT}`);
  console.log(`📱 Acesse http://localhost:${PORT}/ para ver o QR Code`);
});