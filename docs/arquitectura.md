# Arquitectura — StoreCheck HD

## Stack

- **Frontend:** React 18 + TypeScript + Vite (PWA con `vite-plugin-pwa`).
- **Formularios:** React Hook Form + Zod.
- **Local/offline:** Dexie (IndexedDB).
- **Backend (fase posterior):** Supabase (PostgreSQL, Auth, Storage, RLS).

## Entidades principales

- **users** — identidad, rol, estado.
- **chains** — cadenas/competidores.
- **stores** — establecimientos, dirección, coordenadas.
- **audits** — encabezado, estado, progreso, versión del checklist.
- **audit_answers** — respuestas por pregunta.
- **price_observations** — productos, presentación, precio, unidad normalizada.
- **media_evidence** — fotos, audios, metadatos.
- **checklist_versions** — versiones publicadas del formulario.
- **sync_events** — intentos, resultados y errores de sincronización.
- **audit_history** — cambios relevantes y trazabilidad.

## Modelo del checklist versionado

- **checklist_versions** — id, version, status (draft/published), published_at.
- **checklist_sections** — id, version_id, code, title, order.
- **checklist_questions** — id, section_id, code, type, label, help, required, unit, min, max, options (JSON), conditional_on, order.
- **audit_answers** — id, audit_id, question_id, value, unit, source, confidence, comment, media_ids.

Cada auditoría guarda `checklist_version_id` para reconstruir exactamente el formulario usado.

## Estrategia de sincronización

- IDs idempotentes (UUID generado en el dispositivo).
- Cola local FIFO con estados `pending → uploading → done/failed`.
- Sync por auditoría; multimedia en cola separada.
- Conflictos: última escritura gana, notificación al usuario, registro en `audit_history`.

## Estructura de carpetas

```
/src
  /components   — componentes reutilizables (design system)
  /pages        — pantallas
  /db           — capa Dexie
  /data         — catálogos y definición del checklist
  /types        — tipos TypeScript
  /lib          — utilidades (validación, normalización)
```
