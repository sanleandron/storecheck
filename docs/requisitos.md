# Requisitos del MVP — StoreCheck HD

## Propósito

Aplicación móvil-first para auditorías comparables de tiendas Hard Discount, con captura de evidencia en campo, operación offline y sincronización.

## Principios del producto

1. **Captura antes que inteligencia:** primero datos confiables; después IA.
2. **Offline-first:** una visita no depende de conectividad estable.
3. **Comparabilidad:** preguntas, unidades y opciones estandarizadas.
4. **Evidencia:** cada hallazgo relevante se asocia con foto, audio o nota.
5. **Trazabilidad:** autor, fecha, ubicación y cambios registrados.
6. **Privacidad por diseño:** separar datos de campo de información confidencial.

## Alcance incluido

- PWA responsive optimizada para teléfonos.
- Roles Auditor y Administrador.
- Listado de auditorías por estado.
- Ficha técnica con GPS, fecha y hora.
- Cinco módulos del checklist.
- Captura de fotos y notas de audio (audio opcional).
- Guardado automático local (IndexedDB).
- Recuperación de borradores.
- Indicador de progreso y validación de campos.
- Cola de sincronización offline.
- Panel administrativo básico.
- Consulta detallada, comparación básica y exportación CSV/Excel.

## Alcance excluido del MVP

- OCR, visión, transcripción de audio, recomendaciones IA.
- Mapas de calor avanzados.
- Integración automática con P&L.
- Aplicaciones nativas iOS/Android.

## Decisiones confirmadas

- **Frontend:** Vite PWA + React + TypeScript.
- **Backend:** Supabase.
- **Multi-país** desde el inicio.
- **Observaciones de precio:** mínimo 3 por auditoría (obligatorio).
- **Audio:** opcional.
- **Validación:** rol Administrador (Auditor no valida su propio trabajo).

## Estados de una auditoría

1. Borrador
2. Completa pendiente de sincronizar
3. Enviada
4. En revisión
5. Validada
6. Devuelta para corrección

## Fuente y confianza de cada dato

Cada respuesta cuantitativa registra: valor, unidad, fuente (observado/contado/estimado/informado), nivel de confianza (alto/medio/bajo), comentario opcional y evidencia asociada.
