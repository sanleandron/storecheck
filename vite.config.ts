import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Para GitHub Pages bajo subpath, la app se sirve desde /storecheck/.
// En local (npm run dev / preview) se sirve desde la raíz.
// Sobre-escribe con: BASE_URL=/storecheck/ npm run build  (variable de entorno)
const BASE_URL = process.env.BASE_URL || '/';

/**
 * Genera un 404.html como copia del index.html del build.
 * GitHub Pages sirve este archivo cuando una ruta interior del SPA no existe
 * (p. ej. /storecheck/login), permitiendo que React arranque y el router
 * resuelva la URL. Sin esto, entrar/recargar en una ruta interna da 404.
 */
function spa404Fallback(): { name: string; closeBundle: () => void } {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const root = resolve(__dirname);
      const dist = join(root, 'dist');
      const index = join(dist, 'index.html');
      const notFound = join(dist, '404.html');
      if (existsSync(index)) {
        copyFileSync(index, notFound);
      }
    },
  };
}

export default defineConfig({
  base: BASE_URL,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'StoreCheck HD',
        short_name: 'StoreCheck',
        description: 'Auditoría de punto de venta Hard Discount',
        theme_color: '#1f1b56',
        background_color: '#d0d5d9',
        display: 'standalone',
        start_url: BASE_URL === '/' ? '/' : `${BASE_URL}?source=pwa`,
        scope: BASE_URL,
        icons: [
          {
            src: `${BASE_URL === '/' ? '' : BASE_URL}icons/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${BASE_URL === '/' ? '' : BASE_URL}icons/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
    spa404Fallback(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Separa Supabase en su propio chunk para que los usuarios offline
        // no descarguen el SDK completo que solo se usa al sincronizar.
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});