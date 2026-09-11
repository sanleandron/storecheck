# Reglas obligatorias para Cascade

Antes de modificar código, lee los requisitos y la arquitectura en `/docs`.

## Reglas de trabajo

- No inventar campos, estados o reglas de negocio que no estén en `/docs`.
- Trabajar una tarea por vez, con criterio de aceptación.
- Mostrar primero el plan de archivos a modificar antes de editar.
- No reescribir módulos que ya funcionan sin autorización.
- Crear o actualizar pruebas con cada cambio.
- No colocar secretos en código o commits.
- Mantener TypeScript estricto.
- Ejecutar lint, pruebas y build antes de marcar una tarea como terminada.
- Actualizar documentación cuando cambie una decisión.

## Stack obligatorio

- React + TypeScript + Vite (PWA).
- React Hook Form + Zod para formularios y validaciones.
- Dexie (IndexedDB) para almacenamiento local offline.
- No cambiar arquitectura ni dependencias sin aprobación documentada.

## Definición de Listo (DoD)

- Código implementado.
- Lint, pruebas y build OK.
- Recorrido manual verificado.
- Diff revisado.
- Documentación actualizada.
- Commit descriptivo.
