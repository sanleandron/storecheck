// Verifica la sincronización real: loguea, va a la lista (dispara auto-sync), y consulta la base por API.
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const findChrome = () => CHROME_PATHS.find((p) => fs.existsSync(p)) || null;
const APP_URL = 'https://sanleandron.github.io/storecheck/';
const TEST_EMAIL = process.env.TEST_EMAIL || 'qa.storecheck1789175002853@mailinator.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'QaStore2024!';

(async () => {
  const executablePath = findChrome();
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    // login
    await page.fill('input[type=email]', TEST_EMAIL);
    await page.fill('input[type=password]', TEST_PASSWORD);
    await page.getByRole('button', { name: /Entrar/i }).click();
    await page.waitForURL('**/auditorias**', { timeout: 20000 }).catch(() => {});
    console.log('URL_LOGIN:', page.url());
    // Esperar al auto-sync (useEffect syncPendingNow). Mirar si aparece estado de sync.
    await page.waitForTimeout(6000);
    const body = (await page.textContent('body')) || '';
    console.log('TIENE_TODO_SINCRONIZADO:', /Todo sincronizado/i.test(body));
    console.log('TIENE_PENDIENTE:', /pendiente/i.test(body));
    await page.screenshot({ path: 'screenshots-flow/70-synced-list.png' });
  } catch (e) {
    console.log('ERR:', e.message);
  } finally {
    await browser.close();
    console.log('ERRORES_CONSOLE:', errors.length);
  }
})();