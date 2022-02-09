export const SMARTLINK_USERNAME = process.env.SMARTLINK_USERNAME!;
export const SMARTLINK_PASSWORD = process.env.SMARTLINK_PASSWORD!;

if (!SMARTLINK_USERNAME || !SMARTLINK_PASSWORD) {
  throw new Error('SMARTLINK_USERNAME or SMARTLINK_PASSWORD is not defined');
}

export const PANTRY_ID = process.env.PANTRY_ID!;

if (!PANTRY_ID) {
  throw new Error('PANTRY_ID is not defined');
}

export const TELEGRAM_SEND_API_ENDPOINT =
  process.env.TELEGRAM_SEND_API_ENDPOINT!;
