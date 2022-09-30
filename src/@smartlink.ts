import Puppeteer from 'puppeteer';

import {processBalanceText} from './@utils';

const LOGIN_URL = 'https://www.pathsmartlinkcard.com/front/account/login.jsp';
const HOME_PAGE_URL =
  'https://www.pathsmartlinkcard.com/front/account/home.jsp';

export interface SmartLinkCard {
  serialNumber: string;
  nickname: string;
  balance: string;
}

export class SmartLink {
  private browser!: Puppeteer.Browser;
  private page!: Puppeteer.Page;
  private cards: SmartLinkCard[] = [];

  async login(username: string, password: string): Promise<void> {
    this.browser = await Puppeteer.launch({headless: true});
    this.page = await this.browser.newPage();

    let page = this.page;

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

      await usernameInput.type(username);
      await passwordInput.type(password);

      let loginButton = await page.$('input#login2');

      if (!loginButton) {
        throw new Error('Could not find login button');
      }

      await loginButton.click();
    }

    let cards: SmartLinkCard[] = [];

    {
      try {
        await page.waitForNetworkIdle({timeout: 5000});
      } catch (e) {
        // ignore
      }

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

    this.cards = cards;
  }

  getCards(): SmartLinkCard[] {
    return this.cards;
  }

  async refreshCards(): Promise<SmartLinkCard[]> {
    let page = this.page;
    await page.goto(HOME_PAGE_URL);

    let cards: SmartLinkCard[] = [];

    try {
      await page.waitForNetworkIdle({timeout: 5000});
    } catch (e) {
      // ignore
    }

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

    this.cards = cards;
    return cards;
  }

  async close() {
    let browser = this.browser;
    await browser.close();
    if (!browser) {
      return;
    }
    let process = browser.process();
    if (!process) {
      return;
    }
    process.kill('SIGINT');
  }
}
