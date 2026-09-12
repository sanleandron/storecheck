// Recorrido E2E completo de la app publicada (viewport móvil).
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
const SHOT = 'screenshots-flow';
if (!fs.existsSync(SHOT)) fs.mkdirSync(SHOT);

async function audsInDb() {
  const l = await fetch(SUP_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: SUP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await l.json();
  if (!j.access_token) return { err: j.msg || j.error_description };
  const r = await fetch(SUP_URL + '/rest/v1/audits?select=id,tienda,status,answers,price_observations', {
    headers: { apikey: SUP_KEY, Authorization: 'Bearer ' + j.access_token },
  });
  return await r.json();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const shot = (n) => page.screenshot({ path: SHOT + '/' + n });

  try {
    // 1) Login online
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const hasEmail = await page.locator('input[type=email]').count();
    console.log('1.MODO_ONLINE(email):', hasEmail > 0);
    console.log('1.URL:', page.url());
    await page.fill('input[type=email]', EMAIL);
    await page.fill('input[type=password]', PASS);
    await shot('200-login-filled.png');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/auditorias**', { timeout: 20000 }).catch(() => {});
    console.log('2.TRAS_LOGIN_URL:', page.url());
    await shot('205-lista.png');

    // 2) Crear auditoría
    await page.getByRole('button', { name: 'Nueva Auditoría' }).click();
    await page.waitForTimeout(1200);
    await page.locator('input[type=text]').first().fill('Tienda Navegacion');
    const ciudad = page.locator('[placeholder]').first();
    if (await ciudad.count()) await ciudad.fill('Madrid');
    await shot('215-nueva.png');
    await page.getByRole('button', { name: /Crear y comenzar/ }).click();
    await page.waitForTimeout(1500);
    console.log('3.CREADA_URL:', page.url());
    await shot('225-modulos.png');

    // 3) Infraestructura -> responder preguntas
    const btn = page.locator('.menu-item').filter({ hasText: 'Infraestructura' }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1000);
      console.log('4.MODULO_URL:', page.url());
      const num = page.locator('input[type=number]').nth(0);
      const num2 = page.locator('input[type=number]').nth(1);
      await num.fill('260').catch(() => {});
      await num2.fill('4').catch(() => {});
      await page.waitForTimeout(400);
      await shot('235-preguntas.png');
      const save = page.locator('.btn-primary').filter({ hasText: 'Guardar y Volver' });
      if (await save.count()) { await save.click(); await page.waitForTimeout(1500); }
      console.log('4b.VOLVER_URL:', page.url());
    }

    // 4) Precios -> añadir observación
    const prices = page.locator('.menu-item').filter({ hasText: 'Precios' }).first();
    if (await prices.count()) {
      await prices.click();
      await page.waitForTimeout(1000);
      const add = page.locator('.btn-primary').filter({ hasText: /Agregar producto/ });
      if (await add.count()) { await add.click(); await page.waitForTimeout(800); }
      const prod = page.locator('input[type=text]').first();
      if (await prod.count()) await prod.fill('Arroz 1kg');
      const priceNum = page.locator('input[type=number]').first();
      if (await priceNum.count()) await priceNum.fill('1800');
      await shot('245-precios.png');
      const guardar = page.locator('.btn-primary').filter({ hasText: 'Guardar' });
      if (await guardar.count()) { await guardar.click(); await page.waitForTimeout(800); }
      console.log('5.PRECIOS_guardado');
      const volver = page.locator('.btn-secondary').filter({ hasText: /Volver a m/ });
      if (await volver.count()) { await volver.click(); await page.waitForTimeout(800); }
    }

    // 5) Revisar y sincronizar
    const revisar = page.locator('.btn-secondary').filter({ hasText: /Revisar y Enviar/ });
    if (await revisar.count()) { await revisar.click(); await page.waitForTimeout(1200); }
    console.log('6.REVISAR_URL:', page.url());
    await shot('255-revision.png');
    const syncBtn = page.locator('.btn-secondary').filter({ hasText: /Sincronizar ahora/ });
    if (await syncBtn.count()) { await syncBtn.click(); await page.waitForTimeout(5000); }
    await shot('260-revision-sync.png');

    // 6) Volver a la lista raíz y esperar auto-sync
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(7000);
    await shot('270-lista-final.png');
    const bodyFinal = (await page.textContent('body')) || '';
    console.log('7.LISTA_TIENE_TODO_SINCRONIZADO:', /Todo sincronizado/i.test(bodyFinal));
  } catch (e) { console.log('FLOW_ERR:', e.message); }
  await browser.close();

  const db = await audsInDb();
  console.log('8.AUDITS_EN_BASE_COUNT:', Array.isArray(db) ? db.length : JSON.stringify(db));
  if (Array.isArray(db) && db.length) {
    const last = db[db.length - 1];
    console.log('9.ULTIMA:', JSON.stringify(last).slice(0, 500));
  }
  console.log('ERRORES_CONSOLE:', errs.length);
})();