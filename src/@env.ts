export const SMARTLINK_USERNAME = process.env.SMARTLINK_USERNAME!;
export const SMARTLINK_PASSWORD = process.env.SMARTLINK_PASSWORD!;

if (!SMARTLINK_USERNAME || !SMARTLINK_PASSWORD) {
  throw new Error('SMARTLINK_USERNAME or SMARTLINK_PASSWORD is not defined');
}

export const REDIS_URL = process.env.REDIS_URL!;

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('Env TELEGRAM_BOT_TOKEN is not set');
}

export const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID!;
if (!TELEGRAM_USER_ID) {
  throw new Error('Env TELEGRAM_USER_ID is not set');
}
