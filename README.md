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

- **Auth local** con roles Auditor y Administrador.
- **Ficha técnica** con GPS, fecha/hora, cadena, tienda, país, moneda y NSE.
- **Checklist versionado** de 5 módulos (Infraestructura, Surtido, Precios, Operación, Cliente) con tipos de pregunta (texto, número, porcentaje, selección, múltiple).
- **Progreso** por módulo y general con validación de campos obligatorios.
- **Comparativa de precios** (mínimo 3 observaciones) con precio normalizado por unidad.
- **Evidencia** de fotos y notas de audio (audio opcional).
- **Guardado automático offline** en IndexedDB (Dexie) y recuperación de borradores.
- **Panel administrativo** de validación (En revisión → Validada / Devuelta).
- **Comparación** de tiendas y **exportación CSV**.

## Estructura

- `/docs` — requisitos, arquitectura y decisiones (ADR)
- `/references` — archivos fuente originales de StoreCheck
- `/src` — código de la aplicación

## Documentación

Ver `/docs` y `AGENTS.md` para reglas de trabajo y decisiones de arquitectura.
