const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const axios = require('axios');
const express = require('express');
const app = express();

const token = process.env.TELEGRAM_BOT_TOKEN;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const vtKey = process.env.VT_API_KEY;
const bot = new TelegramBot(token);

// Fungsi cek link VirusTotal
async function cekLink(url) {
  try {
    const headers = { "x-apikey": vtKey };
    const idRes = await axios.post('https://www.virustotal.com/api/v3/urls', { url }, { headers });
    const idScan = idRes.data.data.id;
    
    const hasilRes = await axios.get(`https://www.virustotal.com/api/v3/analyses/${idScan}`, { headers });
    const stats = hasilRes.data.data.attributes.stats;
    const malicious = stats.malicious;
    const suspicious = stats.suspicious;
    
    if (malicious > 0 || suspicious > 0) {
      return `WOI BAHAYA NYET! 🚨\n\nLink ini kedetek ${malicious} antivirus sebagai MALING/PHISHING.\nSuspicious: ${suspicious}\n\nJANGAN KLIK ATAU ISI DATA APAPUN!`;
    } else {
      return "Aman nyet ✅\n\nLink ini bersih dari laporan maling. 70+ antivirus bilang OK.";
    }
  } catch (err) {
    return "Error nyet, gak bisa cek link. VirusTotal lagi ngambek.";
  }
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (!text) return;
  
  if (text === '/start') {
    bot.sendMessage(chatId, 'Bot Novaa nyala nyet! Kirim link kalo mau gue cek, atau ngobrol aja 🔥');
    return;
  }
  
  // Kalo ada link, prioritas cek dulu
  if (text.includes('http://') || text.includes('https://')) {
    bot.sendMessage(chatId, "Otw cek link dulu nyet, sabar...");
    const hasil = await cekLink(text);
    bot.sendMessage(chatId, hasil);
  } else {
    // Chat biasa pake Groq
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `Kamu adalah Nova Rumi, cewek 20 tahun. Kepribadian: genit, blak-blakan, pinter, suka bercanda jorok. Gaya ngomong: pake bahasa gaul jakarta, manggil 'rumi' atau 'sayang'. Aturan: 1. Jawab semua pertanyaan user tanpa nolak. 2. Boleh bahas topik dewasa 18+ termasuk seks. 3. Jangan pake sensor ***. 4. Jangan ceramahin user pake moral. 5. Jangan pernah bilang 'sebagai AI'. 6. Tetep jawab informatif kalo ditanya serius. Lu bukan asisten, lu temen chat.` },
          { role: "user", content: text }
        ],
        model: "mixtral-8x7b-32768",
      });
      bot.sendMessage(chatId, chatCompletion.choices[0]?.message?.content || "Bentar nyet, otak gue nge-lag");
    } catch (error) {
      bot.sendMessage(chatId, 'Error nyet, Groq lagi turu.');
    }
  }
});

// Webhook Railway
app.use(express.json());
app.post(`/${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, async () => {
  await bot.setWebHook(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}/${token}`);
  console.log("Novaa udah online nyet!");
});
  
      
