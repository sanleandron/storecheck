// Prueba E2E de sincronización: crear auditoría en una sesión, volver a lista (auto-sync),
// y verificar por API que quedó persistida en Supabase.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const findChrome = () => CHROME_PATHS.find((p) => fs.existsSync(p)) || null;
const APP_URL = 'https://sanleandron.github.io/storecheck/';
const SUP_URL = 'https://ysgmxckzvltqkfusstyr.supabase.co';
const SUP_KEY = process.env.SUP_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL || 'qa.storecheck1789175002853@mailinator.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'QaStore2024!';

async function countAuditsInDb() {
  const l = await fetch(SUP_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: SUP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  const j = await l.json();
  if (!j.access_token) return { err: j.msg || j.error_description };
  const r = await fetch(SUP_URL + '/rest/v1/audits?select=id,tienda,ciudad,cadena,status', {
    headers: { apikey: SUP_KEY, Authorization: 'Bearer ' + j.access_token },
  });
  return await r.json();
}

(async () => {
  const before = await countAuditsInDb();
  console.log('AUDITS_EN_BASE_ANTES:', JSON.stringify(before));

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
    console.log('URL_TRAS_LOGIN:', page.url());

    // crear auditoría
    await page.getByRole('button', { name: /Nueva Auditor/i }).click();
    await page.waitForTimeout(1200);
    await page.locator('input[type=text]').first().fill('Tienda Sync QA');
    const ciudad = page.locator('input[placeholder]').first();
    await ciudad.fill('Madrid QA');
    await page.screenshot({ path: 'screenshots-flow/80-new-filled.png' });
    await page.getByRole('button', { name: /Crear y comenzar/i }).click();
    await page.waitForURL('**/modulos/**', { timeout: 15000 }).catch(() => {});
    console.log('URL_TRAS_CREAR:', page.url());

    // volver a la lista -> dispara auto-sync (syncPendingNow)
    await page.getByRole('button', { name: /Guardar y Volver/i }).click();
    await page.waitForURL('**/auditorias', { timeout: 15000 }).catch(() => {});
    console.log('URL_VUELTA_LISTA:', page.url());
    // esperar a que corra el sync
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'screenshots-flow/90-sync-list.png' });
    const body = (await page.textContent('body')) || '';
    console.log('TEXTO_SYNC:', /Todo sincronizado/i.test(body) ? 'TODOSINCRONIZADO' : (/pendiente/i.test(body) ? 'PENDIENTE' : 'INDEFINIDO'));
  } catch (e) {
    console.log('FLOW_ERR:', e.message);
  }
  await browser.close();

  const after = await countAuditsInDb();
  console.log('AUDITS_EN_BASE_DESPUES:', JSON.stringify(after));
  console.log('CONSOLE_ERRORS:', errors.length);
})();