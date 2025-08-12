import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const content = `window.env = { TELEGRAM_BOT_TOKEN: '${token}' };\n`;

const outPath = resolve(__dirname, '../public/env.js');
writeFileSync(outPath, content);
console.log('Generated public/env.js');
