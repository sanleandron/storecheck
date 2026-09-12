// Navegación y prueba de la app StoreCheck usando Playwright-core + Chrome del sistema.
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findChrome() {
  return CHROME_PATHS.find((p) => fs.existsSync(p)) || null;
}

const APP_URL = process.env.APP_URL || 'https://sanleandron.github.io/storecheck/';
const SHOT_DIR = 'screenshots';
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR);

(async () => {
  const executablePath = findChrome();
  if (!executablePath) {
    console.log('NO_BROWSER');
    process.exit(2);
  }
  console.log('USANDO_BROWSER:', executablePath);
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, // vista móvil
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
  });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message));

  try {
    // 1) Cargar raíz
    console.log('== Paso 1: cargar raíz ==');
    const resp = await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('HTTP:', resp ? resp.status() : 'sin-resp');
    await page.waitForTimeout(1500);
    console.log('TITULO:', await page.title());
    console.log('URL_ACTUAL:', page.url());
    await page.screenshot({ path: path.join(SHOT_DIR, '01-root.png') });

    // Texto visible (StoreCheck / Iniciar sesión / etc.)
    const bodyText = (await page.textContent('body')) || '';
    const hasStoreCheck = bodyText.includes('StoreCheck');
    const hasLogin = /Iniciar sesión|Crear cuenta|Entrar|Email/i.test(bodyText);
    console.log('TEXTO_HAS_StoreCheck:', hasStoreCheck);
    console.log('TEXTO_HAS_LoginUI:', hasLogin);
    console.log('BODY_PREVIEW:', bodyText.replace(/\s+/g, ' ').slice(0, 300));

    // 2) Navegar a login (SPA: clic si existe, sino goto con ruta)
    console.log('== Paso 2: navegar a login ==');
    // En modo local/no conectado puede mostrar modo local; en conectado muestra email/password
    const emailInput = await page.locator('input[type=email]').count();

    if (emailInput > 0) {
      console.log('UI_LOGIN_EMAIL_PRESENTE (modo conectado a Supabase)');
    } else {
      const inputCount = await page.locator('input[type=text]').count();
      const radioCount = await page.locator('input[type=radio]').count();
      console.log('UI_LOGIN_EMAIL_AUSENTE; inputs texto:', inputCount, 'radios:', radioCount);
    }

    console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors));
    await page.screenshot({ path: path.join(SHOT_DIR, '02-login.png') });
  } catch (e) {
    console.log('ERROR_FATAL:', e.message);
    try {
      await page.screenshot({ path: path.join(SHOT_DIR, 'error.png') });
    } catch {}
  } finally {
    await browser.close();
    console.log('\n== RESULTADO ==');
    console.log('CONSOLE_ERRORS_TOTAL:', consoleErrors.length);
  }
})();