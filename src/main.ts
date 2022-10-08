import {md} from 'telegram-escape';

import {SMARTLINK_PASSWORD, SMARTLINK_USERNAME} from './@env';
import {cleanupRedis, get, set} from './@redis';
import {SmartLink, SmartLinkCard} from './@smartlink';
import {sendTelegramMessage} from './@telegram';

const REDIS_DATA_KEY = 'smartlink_data';

interface SmartLinkData {
  cards: SmartLinkCard[];
  updatedAt: number;
}

async function main(): Promise<void> {
  let smartlink = new SmartLink();

  try {
    await smartlink.login(SMARTLINK_USERNAME, SMARTLINK_PASSWORD);

    const cards = smartlink.getCards();

    const message = describeCards(cards);

    const oldDataJSON = await get(REDIS_DATA_KEY);

    let oldMessage: string | undefined;

    if (oldDataJSON) {
      try {
        let oldData = JSON.parse(oldDataJSON) as SmartLinkData;
        oldMessage = describeCards(oldData.cards);
      } catch (e) {
        // ignore
      }
    }

    if (oldMessage !== message) {
      const data: SmartLinkData = {
        cards,
        updatedAt: Date.now(),
      };
      await set(REDIS_DATA_KEY, JSON.stringify(data));
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
