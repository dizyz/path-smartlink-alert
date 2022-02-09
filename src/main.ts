import {PANTRY_ID, SMARTLINK_PASSWORD, SMARTLINK_USERNAME} from './@env';
import {createOrReplaceBasket, getBasket} from './@pantry';
import {SmartLink, SmartLinkCard} from './@smartlink';
import {sendMessage} from './@telegram';

const PANTRY_BASKET_NAME = 'smartlink';

async function main(): Promise<void> {
  let smartlink = new SmartLink();

  try {
    await smartlink.login(SMARTLINK_USERNAME, SMARTLINK_PASSWORD);

    let data = {
      cards: smartlink.getCards(),
    };

    let updated = await updateData(data);

    if (updated) {
      sendMessage({message: describeCards(data.cards)});
    }
  } finally {
    await smartlink.close();
  }
}

main().catch(console.error);

async function updateData(data: any): Promise<boolean> {
  try {
    let oldData = await getBasket<SmartLinkCard[]>(
      PANTRY_ID,
      PANTRY_BASKET_NAME,
    );
    if (JSON.stringify(data) === JSON.stringify(oldData)) {
      console.log('No changes to save');
      return false;
    }
  } catch (error) {
    console.log('Error getting old data:', error);
  }

  await createOrReplaceBasket(PANTRY_ID, PANTRY_BASKET_NAME, data);

  return true;
}

function describeCards(cards: SmartLinkCard[]): string {
  let description = 'Your SmartLink cards:';
  for (let [i, card] of cards.entries()) {
    description += '---';
    description += `\n#${i + 1} ${card.nickname}`;
    description += `\nSerial: ${card.serialNumber}`;
    description += `\nBalance: ${card.balance}`;
  }
  return description;
}
