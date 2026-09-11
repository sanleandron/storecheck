import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'StoreCheck HD',
        short_name: 'StoreCheck',
        description: 'Auditoría de punto de venta Hard Discount',
        theme_color: '#1f1b56',
        background_color: '#d0d5d9',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
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
