# StoreCheck HD — MVP

Aplicación móvil-first (PWA) para realizar auditorías comparables de tiendas **Hard Discount** (D1, Ara, Isimo), capturar evidencia en campo, trabajar sin conexión y sincronizar resultados para análisis operativo, comercial y financiero.

## Stack

- **Frontend:** React + TypeScript + Vite (PWA con `vite-plugin-pwa`)
- **Formularios:** React Hook Form + Zod
- **Local/offline:** IndexedDB mediante Dexie
- **Backend (fase posterior):** Supabase (PostgreSQL, Auth, Storage, RLS)

## Requisitos

- Node.js ≥ 18
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Calidad

```bash
npm run lint      # ESLint
npm run test      # Vitest
npm run build     # TypeScript + build de producción
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores. Nunca subas secretos al repositorio.

## Funcionalidad implementada (MVP)

- **Auth** con Supabase Auth (email/contraseña) y roles Auditor/Administrador. Modo local de respaldo si no hay backend.
- **Ficha técnica** con GPS, fecha/hora, cadena, tienda, país, moneda y NSE.
- **Checklist versionado** de 5 módulos (Infraestructura, Surtido, Precios, Operación, Cliente) con tipos de pregunta (texto, número, porcentaje, selección, múltiple).
- **Progreso** por módulo y general con validación de campos obligatorios.
- **Comparativa de precios** (mínimo 3 observaciones) con precio normalizado por unidad.
- **Evidencia** de fotos y notas de audio (audio opcional) subida a Supabase Storage.
- **Guardado automático offline** en IndexedDB (Dexie) y recuperación de borradores.
- **Sincronización offline-first**: al recuperar conexión, las auditorías y evidencia pendientes se suben a Supabase (idempotente por UUID). Al **crear una auditoría con conexión** se sincroniza de inmediato.
- **Panel administrativo** de validación (En revisión → Validada / Devuelta).
- **Comparación** de tiendas y **exportación CSV**.

## Diseño y UX

Interfaz moderna y profesional (paleta propia, tarjetas con elevación, gradientes, micro-interacciones). Verificado de extremo a extremo con navegador real (Playwright + Chrome): registro, login, creación de auditoría y sincronización a Supabase funcionan en producción sin errores de consola. Los scripts de automatización viven en `scripts/browser-*.mjs` y las capturas se guardan en `screenshots-flow/` (fuera de Git).

## Despliegue en producción (GitHub Pages + Supabase)

> La app está publicada en: `https://sanleandron.github.io/storecheck/`

### 1. Supabase
- Crea un proyecto en https://supabase.com.
- Ejecuta `supabase/schema.sql` en **SQL Editor** (crea tablas, RLS y catálogos). El script es idempotente: puedes re-ejecutarlo sin errores.
- Activa el proveedor Email en **Authentication → Providers** (requerido para login/registro).
- Recomendado para pruebas: desactiva **"Confirm email"** en *Authentication → Sign In / Tokens* — si queda activo, Supabase aplica un límite de envío de correos (`over_email_send_rate_limit`) que puede frenar registros consecutivos.
- El bucket de Storage `evidence` (fotos/audios) lo crea la app automáticamente como público; puedes crearlo manualmente en **Storage → New bucket → evidence → público**.

### 2. Variables de entorno
Copia `.env.example` a `.env` y completa los valores de tu proyecto:
```
VITE_SUPABASE_URL=https://<tu-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```
Estas variables también se configuran como **Build Environment** en el dashboard de Netlify (nunca en el repositorio).

### 3. Netlify (despliegue por Git)
1. Sube este repositorio a GitHub.
2. En Netlify: **Add new site → Import an existing project** y conecta el repo.
3. Build command: `npm ci && npm run build`; Publish directory: `dist`.
4. En **Site settings → Environment variables** añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Deploy. Netlify da una URL `https://<sitio>.netlify.app` con HTTPS automático.

Para desplegar desde tu terminal (opcional):
```bash
netlify login
npm run build
netlify deploy --prod --dir=dist
```

Alternativa todo-en-uno (PowerShell) tras completar `.env`:
```bash
.\scripts\deploy.ps1
```

### 4. Probar en el teléfono
1. Abre la URL HTTPS en el navegador del móvil.
2. Regístrate/entra.
3. "Agregar a pantalla de inicio" (Android/Chrome) o "Instalar aplicación" para usarla como PWA.

## Estructura

- `/docs` — requisitos, arquitectura y decisiones (ADR)
- `/references` — archivos fuente originales de StoreCheck
- `/src` — código de la aplicación

## Documentación

Ver `/docs` y `AGENTS.md` para reglas de trabajo y decisiones de arquitectura.
