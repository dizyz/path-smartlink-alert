import {AxiosError} from 'axios';
import {PANTRY_ID, SMARTLINK_PASSWORD, SMARTLINK_USERNAME} from './@env';
import {createOrReplaceBasket, getBasket} from './@pantry';
import {SmartLink, SmartLinkCard} from './@smartlink';
import {sendMessage} from './@telegram';

const PANTRY_BASKET_NAME = 'smartlink';

interface PantryBasketData {
  updatedAt: number;
  cards: SmartLinkCard[];
}

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

async function updateData(
  data: Omit<PantryBasketData, 'updatedAt'>,
): Promise<boolean> {
  try {
    let {updatedAt, ...oldData} = await getBasket<PantryBasketData>(
      PANTRY_ID,
      PANTRY_BASKET_NAME,
    );
    if (JSON.stringify(data) === JSON.stringify(oldData)) {
      console.log('No changes to save');
      return false;
    }
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as AxiosError).response
    ) {
      let response = (error as AxiosError).response!;
      if (response.status === 429) {
        console.log(
          'Too many requests, please wait util next scheduled pipeline run',
        );
        return false;
      }
    }
    console.log('Error getting old data:', error);
  }

  let newData = {
    updatedAt: Date.now(),
    ...data,
  };

  await createOrReplaceBasket<PantryBasketData>(
    PANTRY_ID,
    PANTRY_BASKET_NAME,
    newData,
  );

  return true;
}

function describeCards(cards: SmartLinkCard[]): string {
  let description = 'Your SmartLink cards:';
  for (let [i, card] of cards.entries()) {
    description += '\n---';
    description += `\n#${i + 1} ${card.nickname}`;
    description += `\nSerial: ${card.serialNumber}`;
    description += `\nBalance: ${card.balance}`;
  }
  return description;
}
