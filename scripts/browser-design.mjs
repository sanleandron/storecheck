// Captura del nuevo diseño en el preview local.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const findChrome = () => CHROME_PATHS.find((p) => fs.existsSync(p)) || null;
const BASE = process.env.BASE || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  try {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 25000 }).catch(async () => {
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 25000 });
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots-flow/100-new-login.png' });
    console.log('LOGIN TITULO:', await page.title());
    console.log('BODY:', (await page.textContent('body')).replace(/\s+/g, ' ').slice(0, 300));
  } catch (e) {
    console.log('ERR:', e.message);
  }
  console.log('CONSOLE_ERRORS:', errors);
  await browser.close();
})();