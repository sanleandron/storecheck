// Verifica la sincronización de EDICIÓN: crea auditoría, responde una pregunta,
// vuelve a la lista (auto-sync), y consulta la API para confirmar que las
// respuestas (y status) quedaron en Supabase.
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

async function getAuditsDb() {
  const l = await fetch(SUP_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST', headers: { apikey: SUP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await l.json();
  if (!j.access_token) return { err: j.msg || j.error_description };
  const r = await fetch(SUP_URL + '/rest/v1/audits?select=id,tienda,status,answers', {
    headers: { apikey: SUP_KEY, Authorization: 'Bearer ' + j.access_token },
  });
  return await r.json();
}

(async () => {
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

    // Crear auditoría
    await page.getByRole('button', { name: /Nueva Auditor/i }).click();
    await page.waitForTimeout(1000);
    await page.locator('input[type=text]').first().fill('Tienda SyncEdit');
    const ciudad = page.locator('[placeholder]').first();
    await ciudad.fill('Bogota');
    await page.getByRole('button', { name: /Crear y comenzar/i }).click();
    await page.waitForTimeout(1200);
    console.log('CREADA_URL:', page.url());

    // Entrar a un módulo (ej. Infraestructura) y responder una pregunta numérica
    const moduleBtn = page.locator('.menu-item').filter({ hasText: 'Infraestructura' }).first();
    if (await moduleBtn.count()) {
      await moduleBtn.click();
      await page.waitForTimeout(1000);
      console.log('MODULO_URL:', page.url());
      // Responder el primer campo numérico
      const numInput = page.locator('input[type=number]').first();
      if (await numInput.count()) {
        await numInput.fill('250');
        await page.waitForTimeout(600);
        console.log('RESPONDIDO: 250');
      }
      await page.screenshot({ path: 'screenshots-flow/120-module.png' });
      // Guardar y volver a la lista (dispara auto-sync de la sucia)
      const back = page.locator('.btn-primary').filter({ hasText: /Guardar y Volver/ });
      if (await back.count()) { await back.click(); } else { await page.goBack(); }
      await page.waitForTimeout(1500);
      console.log('VUELTA_URL:', page.url());
      await page.waitForTimeout(6000); // dar tiempo al auto-sync
    }
  } catch (e) { console.log('FLOW_ERR:', e.message); }
  await browser.close();

  const db = await getAuditsDb();
  console.log('AUDITS_EN_BASE:', Array.isArray(db) ? JSON.stringify(db) : JSON.stringify(db));
  console.log('CONSOLE_ERRORS:', errors.length);
})();