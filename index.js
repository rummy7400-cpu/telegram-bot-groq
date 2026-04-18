const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

const token = process.env.TELEGRAM_TOKEN;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (text === '/start') {
    bot.sendMessage(chatId, 'Bot nyala nyet 🚀');
    return;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: text }],
      model: 'llama-3.1-8b-instant',
    });
    bot.sendMessage(chatId, chatCompletion.choices[0]?.message?.content || 'Error nyet');
  } catch (error) {
    bot.sendMessage(chatId, 'Groq lagi error nyet');
  }
});

console.log('Bot jalan...');
