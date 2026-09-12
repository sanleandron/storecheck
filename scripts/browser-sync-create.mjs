// Verifica la mejora: al crear una auditoría, la app la sincroniza a Supabase
// de inmediato (sin necesidad de volver a la lista).
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const findChrome = () => CHROME_PATHS.find((p) => fs.existsSync(p)) || null;
const APP_URL = 'https://sanleandron.github.io/storecheck/';
const SUP_URL = 'https://ysgmxckzvltqkfusstyr.supabase.co';
const SUP_KEY = process.env.SUP_KEY;
const EMAIL = process.env.TEST_EMAIL;
const PASS = process.env.TEST_PASSWORD;

async function audsInDb() {
  const l = await fetch(SUP_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: SUP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await l.json();
  if (!j.access_token) return { err: j.msg || j.error_description };
  const r = await fetch(SUP_URL + '/rest/v1/audits?select=id,tienda,status', {
    headers: { apikey: SUP_KEY, Authorization: 'Bearer ' + j.access_token },
  });
  return await r.json();
}

(async () => {
  const before = await audsInDb();
  console.log('EN_BASE_BEFORE_COUNT:', Array.isArray(before) ? before.length : 0);

  const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.fill('input[type=email]', EMAIL);
    await page.fill('input[type=password]', PASS);
    await page.getByRole('button', { name: /Entrar/i }).click();
    await page.waitForURL('**/auditorias**', { timeout: 20000 }).catch(() => {});
    console.log('URL_LOGIN:', page.url());

    await page.getByRole('button', { name: /Nueva Auditor/i }).click();
    await page.waitForTimeout(1200);
    await page.locator('input[type=text]').first().fill('Tienda SyncDirecta');
    const ciudad = page.locator('[placeholder]').first();
    await ciudad.fill('Madrid');
    const lat = page.getByRole('button', { name: /GPS/ });
    if (await lat.count()) { /* skip gps en headless */ }
    await page.getByRole('button', { name: /Crear y comenzar/i }).click();
    await page.waitForTimeout(1200);
    console.log('URL_CREADA:', page.url());
    await page.screenshot({ path: 'screenshots-flow/110-created.png' });

    // Esperar a que corra el sync automático (no bloquea navegación).
    await page.waitForTimeout(5000);
  } catch (e) { console.log('FLOW_ERR:', e.message); }
  await browser.close();

  const after = await audsInDb();
  console.log('EN_BASE_AFTER_COUNT:', Array.isArray(after) ? after.length : 0);
  console.log('BASE:', Array.isArray(after) ? JSON.stringify(after) : JSON.stringify(after));
  console.log('CONSOLE_ERRORS:', errors.length);
})();