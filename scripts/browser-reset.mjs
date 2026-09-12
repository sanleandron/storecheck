// Verifica que la página de login muestra el enlace de recuperación
// y que la ruta /actualizar-contrasena carga.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const findChrome = () => CHROME_PATHS.find((p) => fs.existsSync(p)) || null;

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto('https://sanleandron.github.io/storecheck/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const body = (await page.textContent('body')) || '';
    console.log('LOGIN URL:', page.url());
    console.log('TIENE_OLVIDASTE:', /Olvidaste tu contraseña/i.test(body));
    await page.screenshot({ path: 'screenshots-flow/130-login-reset.png' });

    // Probar la ruta de actualización de contraseña (sin token)
    await page.goto('https://sanleandron.github.io/storecheck/actualizar-contrasena', { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
    await page.goto('https://sanleandron.github.io/storecheck/actualizar-contrasena', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    const body2 = (await page.textContent('body')) || '';
    console.log('RESET URL:', page.url());
    console.log('TIENE_NUEVA_CONTRASENA:', /Nueva contraseña/i.test(body2));
  } catch (e) { console.log('ERR:', e.message); }
  console.log('CONSOLE_ERRORS:', errors.length);
  await browser.close();
})();