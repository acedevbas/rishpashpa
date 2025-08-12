import express from 'express';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/src', express.static('src'));

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL || `http://localhost:${port}`;

if (botToken) {
  const bot = new TelegramBot(botToken, { polling: true });
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Открыть мини-тренировку', {
      reply_markup: {
        keyboard: [[{ text: 'Открыть Ришпашпу', web_app: { url: webAppUrl } }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  });
  console.log('Telegram bot started.');
} else {
  console.log('No TELEGRAM_BOT_TOKEN provided, bot not started.');
}

app.listen(port, () => {
  console.log(`Web app served on http://localhost:${port}`);
});
