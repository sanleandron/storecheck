# Registro de decisiones arquitectónicas (ADR) — StoreCheck HD

## ADR-001 — Frontend con Vite PWA

**Estado:** Aceptado.
**Contexto:** Se necesita una PWA móvil-first offline-first.
**Decisión:** Vite + `vite-plugin-pwa` + React + TypeScript. SPA estático, builds rápidos, PWA más limpia que Next.js.
**Consecuencias:** Sin SSR/SEO; adecuado para app cliente-pesada.

## ADR-002 — Backend con Supabase

**Estado:** Aceptado.
**Contexto:** Se requiere auth, base de datos, almacenamiento y RLS.
**Decisión:** Supabase (PostgreSQL, Auth, Storage, RLS).
**Consecuencias:** Requiere cuenta y proyecto; API tipada.

## ADR-003 — Multi-país desde el inicio

**Estado:** Aceptado.
**Contexto:** El producto puede operar en varios países/monedas.
**Decisión:** Catálogos multi-entidad de países, monedas y cadenas.
**Consecuencias:** Mayor complejidad de catálogos desde el inicio.

## ADR-004 — Observaciones de precio como entidad de primera clase

**Estado:** Aceptado.
**Contexto:** La comparativa de precios es un diferenciador del checklist.
**Decisión:** Entidad `price_observations` con precio normalizado; mínimo 3 por auditoría.
**Consecuencias:** Requiere normalización de unidades.

## ADR-005 — Validación por rol Administrador

**Estado:** Aceptado.
**Contexto:** Se requiere control de calidad de las auditorías.
**Decisión:** El Administrador valida (En revisión → Validada / Devuelta). El Auditor no valida su propio trabajo. La validada queda bloqueada.
**Consecuencias:** Flujo de estados más complejo; protege la comparabilidad.
