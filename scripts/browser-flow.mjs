// Flujo completo: registro -> login -> crear auditoría -> navegar módulos.
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

const APP_URL = process.env.APP_URL || 'https://sanleandron.github.io/storecheck/';
// Credenciales de PRUEBA (se registran contra la base real; no son secretos del proyecto)
const TEST_EMAIL = process.env.TEST_EMAIL || `qa.storecheck${Date.now()}@mailinator.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'QaStore2024!';
const TEST_NAME = 'QA Auditor';

const SHOT_DIR = 'screenshots-flow';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR);
const shot = (n) => page.screenshot({ path: path.join(SHOT_DIR, n) });

let page;
(async () => {
  const executablePath = findChrome();
  if (!executablePath) { console.log('NO_BROWSER'); process.exit(2); }
  console.log('BROWSER:', executablePath);
  const browser = await chromium.launch({ headless: true, executablePath });
  page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
  });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

  try {
    // 1) Raíz -> se redirige a login
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    console.log('1.URL_POS_LOGIN:', page.url());
    await shot('10-login.png');

    // 2) Ir a registro
    const regBtn = page.getByText('Regístrate');
    if (await regBtn.count()) {
      await regBtn.click();
      await page.waitForTimeout(800);
      await shot('20-register.png');
      console.log('2. UI_REGISTRO: visible');

      // Llenar registro
      await page.fill('input[type=text]', TEST_NAME); // nombre
      await page.fill('input[type=email]', TEST_EMAIL);
      await page.fill('input[type=password]', TEST_PASSWORD);
      await shot('30-register-filled.png');
      await page.getByRole('button', { name: /Registrarme/i }).click();
      await page.waitForTimeout(3000);
      console.log('3. TRAS_REGISTRO_URL:', page.url());
      await shot('40-after-register.png');
    } else {
      console.log('2. no-boton-registrate');
    }

    // 3) Si quedó en login (registro no autenticó), intentar login
    if (page.url().includes('/login')) {
      const emailInput = await page.locator('input[type=email]').count();
      if (emailInput > 0) {
        await page.fill('input[type=email]', TEST_EMAIL);
        await page.fill('input[type=password]', TEST_PASSWORD);
        await page.getByRole('button', { name: /Entrar/i }).click();
        await page.waitForTimeout(3000);
        console.log('3b. TRAS_LOGIN_URL:', page.url());
        await shot('45-after-login.png');
      }
    }

    // 4) ¿Llegamos a /auditorias?
    console.log('4. URL_FINAL:', page.url());
    const bodyText = (await page.textContent('body')) || '';
    const hasNueva = /Nueva Auditor/i.test(bodyText);
    const hasLogout = /Salir/i.test(bodyText);
    console.log('4. UI_AUDITORIAS_NUEVA:', hasNueva, '| UI_LOGOUT:', hasLogout);

    // 5) Crear auditoría si llegamos a la lista
    if (page.url().includes('/auditorias') && hasNueva) {
      await page.getByRole('button', { name: /Nueva Auditor/i }).click();
      await page.waitForTimeout(1500);
      console.log('5. UNVA_URL:', page.url());
      await shot('50-audit-new.png');
      // Rellenar ficha mínima
      await page.fill('input[type=text]', 'Tienda QA'); // tienda
      const ciudad = page.locator('input[placeholder*="Barquisimeto"]');
      if (await ciudad.count()) await ciudad.fill('Madrid');
      await shot('55-audit-filled.png');
      await page.getByRole('button', { name: /Crear y comenzar/i }).click();
      await page.waitForTimeout(2000);
      console.log('5b. DESPUES_CREAR_URL:', page.url());
      await shot('60-audit-modules.png');
      const t2 = (await page.textContent('body')) || '';
      console.log('6. MODULOS_UI:', /Módulos de Auditor/i.test(t2));
    }

    console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors, null, 0));
  } catch (e) {
    console.log('ERROR_FATAL:', e.message);
    try { await shot('error.png'); } catch {}
  } finally {
    await browser.close();
    console.log('TEST_EMAIL:', TEST_EMAIL);
    console.log('DONE. Error count:', consoleErrors.length);
  }
})();