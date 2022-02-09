import Puppeteer from 'puppeteer';
import {SMARTLINK_PASSWORD, SMARTLINK_USERNAME} from './@env';
import {processBalanceText} from './@utils';

const LOGIN_URL = 'https://www.pathsmartlinkcard.com/front/account/login.jsp';

interface SmartLinkCard {
  serialNumber: string;
  nickname: string;
  balance: string;
}

async function main() {
  let browser = await Puppeteer.launch();
  const page = await browser.newPage();

  {
    await page.goto(LOGIN_URL);

    let pageTitle = await page.title();

    if (!pageTitle || !pageTitle.includes('SmartLink')) {
      throw new Error('Invalid page, did not successfully load login page');
    }

    let usernameInput = await page.$('input[name="username"]');
    let passwordInput = await page.$('input[name="password"]');

    if (!usernameInput || !passwordInput) {
      throw new Error('Could not find username or password input');
    }

    await usernameInput.type(SMARTLINK_USERNAME);
    await passwordInput.type(SMARTLINK_PASSWORD);

    let loginButton = await page.$('input#login2');

    if (!loginButton) {
      throw new Error('Could not find login button');
    }

    await loginButton.click();
  }

  let cards: SmartLinkCard[] = [];

  {
    await page.waitForNavigation();
    await page.waitForNetworkIdle();

    let logoutForm = await page.$('form#logout');

    if (!logoutForm) {
      throw new Error('Failed to log in');
    }

    let items = await page.$$('#content table tbody tr');
    for (let [i, item] of items.entries()) {
      let cols = await item.$$('td');

      if (cols.length <= 3) {
        continue;
      }

      const getText = async (index: number) => {
        let text = String(
          (await cols[index].evaluate(el => el.textContent)) || '',
        );
        return text.trim();
      };

      let serialNumber = await getText(0);
      if (!serialNumber) {
        console.warn(`Could not get serial number for Card #${i}`);
        continue;
      }
      let nickname = await getText(1);
      let balance = await getText(2);
      if (!balance) {
        console.warn(`Could not get balance for Card #${i}`);
      }
      balance = processBalanceText(balance);
      cards.push({
        serialNumber,
        nickname,
        balance,
      });
    }
  }

  console.log(cards);

  await browser.close();
}

main().catch(console.error);
