import {md} from 'telegram-escape';

import {SMARTLINK_PASSWORD, SMARTLINK_USERNAME} from './@env';
import {cleanupRedis, get, set} from './@redis';
import {SmartLink, SmartLinkCard} from './@smartlink';
import {sendTelegramMessage} from './@telegram';

const REDIS_MESSAGE_KEY = 'smartlink_message';

async function main(): Promise<void> {
  let smartlink = new SmartLink();

  try {
    await smartlink.login(SMARTLINK_USERNAME, SMARTLINK_PASSWORD);

    const cards = smartlink.getCards();

    const message = describeCards(cards);

    const oldMessage = await get(REDIS_MESSAGE_KEY);

    if (oldMessage !== message) {
      await set(REDIS_MESSAGE_KEY, message);
      await sendTelegramMessage(message);
      console.log(message);
    } else {
      console.log('No changes');
    }
  } finally {
    await smartlink.close();
    cleanupRedis();
  }
}

main().catch(console.error);

function describeCards(cards: SmartLinkCard[]): string {
  let description = '';
  for (let [i, card] of cards.entries()) {
    description += '\n---';
    description += `\n#${i + 1} ${card.nickname}`;
    description += `\nSerial: ${card.serialNumber}`;
    description += `\nBalance: ${card.balance}`;
  }
  return md`*Your SmartLink cards:*${description}`;
}
