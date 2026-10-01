import * as dotenv from 'dotenv';
import * as path from 'path';

// The .env lives at the repo root. src/ (ts-node-dev) and dist/ (compiled) sit at the
// same depth, so this path works for both. Loading it here means any module that
// imports config sees the variables, regardless of import order.
dotenv.config({ path: path.join(__dirname, '../../.env'), quiet: true });

const LOCAL_ORIGINS = ['http://localhost:3001', 'http://localhost:3002'];
const DEFAULT_FRONTEND_URL = 'https://skillsync-frontend-five.vercel.app';

// FRONTEND_URL accepts a comma-separated list so preview deployments can be allowed too.
const frontendOrigins = (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  port: Number(process.env.PORT) || 3000,
  isProduction: process.env.NODE_ENV === 'production',
  allowedOrigins: [...LOCAL_ORIGINS, ...frontendOrigins],
};
