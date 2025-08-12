import express from 'express';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import https from 'https';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

let useHttps = process.env.USE_HTTPS === 'true';
const botToken = process.env.TELEGRAM_BOT_TOKEN;


app.use(express.static('public'));


const webAppUrl = process.env.WEB_APP_URL || `${useHttps ? 'https' : 'http'}://localhost:${port}`;


if (botToken) {
  const bot = new TelegramBot(botToken, { polling: true });
  bot.onText(/\/start/, (msg) => {
    if (useHttps) {
      bot.sendMessage(msg.chat.id, 'Открыть мини-тренировку', {
        reply_markup: {
          keyboard: [[{ text: 'Открыть Ришпашпу', web_app: { url: webAppUrl } }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else {
      bot.sendMessage(
        msg.chat.id,
        'Мини‑приложение требует HTTPS. Запустите сервер с USE_HTTPS=true, чтобы открыть Ришпашпу.'
      );
    }
  });
  console.log('Telegram bot started.');
} else {
  console.log('No TELEGRAM_BOT_TOKEN provided, bot not started.');
}

if (useHttps) {

  try {
    const keyPath = process.env.SSL_KEY_PATH || 'cert/localhost.key';
    const certPath = process.env.SSL_CERT_PATH || 'cert/localhost.crt';
    const ssl = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https.createServer(ssl, app).listen(port, () => {
      console.log(`Web app served on https://localhost:${port}`);
    });
  } catch (err) {
    console.warn('Failed to start HTTPS server, falling back to HTTP:', err.message);
    useHttps = false;
  }
}

if (!useHttps) {

  app.listen(port, () => {
    console.log(`Web app served on http://localhost:${port}`);
  });
}
