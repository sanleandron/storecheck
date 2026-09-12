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

## ADR-006 — Auth real con Supabase Auth

**Estado:** Aceptado.
**Contexto:** El login inicial era local (localStorage) sin verificación de identidad.
**Decisión:** Reemplazar por Supabase Auth (email + contraseña) con rol Auditor/Admin derivado de `user_metadata.role`. Persistencia de sesión con `persistSession: true`.
**Consecuencias:** Requiere proyecto Supabase y variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Se conserva un modo "local" de respaldo cuando Supabase no está configurado.

## ADR-007 — Sincronización offline-first con Supabase

**Estado:** Aceptado.
**Contexto:** La app debe operar sin conexión y consolidar datos al volver a línea.
**Decisión:** Dexie sigue siendo la fuente local (offline); al haber conexión se sincroniza cada auditoría a la tabla `audits` con **upsert por UUID** (idempotente, sin duplicados) y la evidencia a **Supabase Storage** (bucket `evidence`). Seguimiento de intentos en `sync_events`.
**Consecuencias:** Los auditorios con `synced: false` se suben al abrir la lista o desde el detalle. Idempotencia garantizada por identificadores UUID generados en el dispositivo.

## ADR-008 — Despliegue a GitHub Pages (PWA por Git)

**Estado:** Aceptado.
**Contexto:** Se requiere URL pública con HTTPS para instalar la PWA en el móvil.
**Decisión:** Publicar la app en **GitHub Pages** bajo el subpath `/storecheck/` usando la rama `gh-pages` (build estático precompilado con credenciales). `base` de Vite, basename dinámico y `404.html` fallback SPA para rutas internas.
**Consecuencias:** URL pública `https://<usuario>.github.io/storecheck/`. El repo debe ser público para GitHub Pages en cuenta gratuita. El deep-link a rutas internas puede requerir 404 fallback.

## ADR-009 — Sincronización inmediata al crear una auditoría

**Estado:** Aceptado.
**Contexto:** Al crear una auditoría solo se guardaba localmente y se sincronizaba al volver a la lista o desde el detalle, lo que podía dejar auditorías "atrapadas" en el dispositivo si el usuario no volvía a la lista.
**Decisión:** En `AuditNew` al guardar localmente, si hay sesión y conexión se llama a `syncAuditWithMedia(audit)` de forma fire-and-forget (upsert idempotente por UUID). Si falla, permanece `synced: false` y se sube luego.
**Consecuencias:** La auditoría recién creada llega a Supabase de inmediato cuando hay conexión, sin perder el comportamiento offline-first.

## ADR-010 — Modernización de la interfaz (UX/UI)

**Estado:** Aceptado.
**Contexto:** La interfaz inicial era funcional pero con estética básica.
**Decisión:** Rediseño moderno y profesional exclusivamente en `src/index.css`: design tokens, tarjetas con elevación y radios mayores, botones con gradientes y micro-interacciones, header con degradado, pills/radio mejorados y focus accesible. Se respetan todas las clases existentes para no romper componentes.
**Consecuencias:** Mejora la percepción de calidad y el uso en móvil; sin cambio de arquitectura ni dependencias.
