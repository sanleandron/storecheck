# StoreCheck MVP — Plan de desarrollo por fases (Windsurf + Cascade)

<aside>
🎯

Plan maestro para construir el MVP de StoreCheck mediante Vibecoding con Windsurf y su asistente Cascade. El avance se controla por entregables y criterios de aceptación, no por estimaciones de tiempo.

</aside>

## 1. Propósito y resultado esperado

Construir una aplicación móvil-first para realizar auditorías comparables de tiendas Hard Discount, capturar evidencia en campo, trabajar sin conexión y sincronizar los resultados para análisis operativo, comercial y financiero.

El MVP debe permitir:

- Crear y administrar auditorías de tiendas.
- Completar una ficha técnica y cinco módulos de evaluación.
- Capturar fotografías, audio, geolocalización, fecha y hora.
- Guardar borradores y operar sin conexión.
- Sincronizar información sin duplicados.
- Consultar, comparar y exportar resultados.
- Mantener trazabilidad, seguridad y calidad de datos.

### Principios del producto

1. **Captura antes que inteligencia:** primero datos confiables; después IA avanzada.
2. **Offline-first:** una visita no puede depender de conectividad estable.
3. **Comparabilidad:** preguntas, unidades y opciones estandarizadas.
4. **Evidencia:** cada hallazgo relevante debe poder asociarse con foto, audio o nota.
5. **Trazabilidad:** autor, fecha, ubicación y cambios deben quedar registrados.
6. **Privacidad por diseño:** separar datos de campo de cualquier información confidencial de ADN.

## 2. Alcance del MVP

### Incluido

- PWA responsive optimizada para teléfonos.
- Inicio de sesión y roles básicos: Auditor y Administrador.
- Listado de auditorías por estado.
- Creación, edición y revisión de una auditoría.
- Ficha técnica con GPS, fecha y hora.
- Cinco módulos del checklist.
- Captura de fotos y notas de audio.
- Guardado automático local.
- Recuperación de borradores.
- Indicador de progreso y validación de campos.
- Cola de sincronización offline.
- Panel administrativo básico.
- Consulta detallada de auditorías.
- Exportación CSV/Excel.
- Comparación básica entre tiendas.
- Registro de auditor, dispositivo y marcas de tiempo.

### Fuera del MVP inicial

- OCR automático de etiquetas.
- Reconocimiento de productos mediante visión.
- Transcripción y resumen automático de audios.
- Recomendaciones generadas por IA.
- Mapas de calor avanzados.
- Integración automática con el P&L.
- Benchmark predictivo.
- Aplicaciones nativas independientes para iOS y Android.

## 3. Stack de referencia para Vibecoding

<aside>
🛠️

Cascade debe respetar este stack salvo que documente una razón técnica para cambiarlo. Ningún cambio de arquitectura debe hacerse de forma silenciosa.

</aside>

### Frontend

- React + TypeScript.
- Vite o Next.js en modo PWA; elegir una sola opción en la Fase 1.
- Diseño mobile-first.
- React Hook Form para formularios.
- Zod para esquemas y validaciones.
- IndexedDB mediante Dexie para almacenamiento local.
- Service Worker para caché y operación offline.
- Compresión de imágenes antes de cargar.

### Backend recomendado para el MVP

- Supabase.
- PostgreSQL.
- Supabase Auth.
- Supabase Storage para fotografías y audios.
- Row Level Security para aislamiento por rol.
- API tipada y migraciones versionadas.

### Calidad y operación

- Git y repositorio remoto desde el primer commit.
- Variables de entorno separadas para desarrollo y producción.
- ESLint y Prettier.
- Vitest para pruebas unitarias.
- Playwright para recorridos críticos.
- Registro de errores y eventos de sincronización.

## 4. Arquitectura funcional

### Entidades principales

- **users:** identidad, rol y estado.
- **chains:** cadenas o competidores.
- **stores:** establecimientos, dirección y coordenadas.
- **audits:** encabezado, estado, progreso y versión del checklist.
- **audit_answers:** respuestas por pregunta.
- **price_observations:** productos, presentación, precio y unidad normalizada.
- **media_evidence:** fotos, audios y metadatos.
- **checklist_versions:** versiones publicadas del formulario.
- **sync_events:** intentos, resultados y errores de sincronización.
- **audit_history:** cambios relevantes y trazabilidad.

### Estados de una auditoría

1. Borrador.
2. Completa pendiente de sincronizar.
3. Enviada.
4. En revisión.
5. Validada.
6. Devuelta para corrección.

### Fuente y confianza de cada dato

Cada respuesta cuantitativa debe registrar:

- Valor.
- Unidad.
- Fuente: observado, contado, estimado o informado por tercero.
- Nivel de confianza: alto, medio o bajo.
- Comentario opcional.
- Evidencia asociada cuando aplique.

## 5. Fase 0 — Preparación del proyecto para Cascade

### Objetivo

Convertir los insumos existentes en una especificación estable y crear un entorno donde Cascade pueda trabajar por tareas pequeñas y verificables.

### Entregables

- Repositorio inicial.
- `README.md` con propósito, alcance y comandos.
- `AGENTS.md` con reglas obligatorias para Cascade.
- Carpeta `/docs` con requisitos, arquitectura y decisiones.
- Carpeta `/references` con los archivos actuales de StoreCheck.
- Lista de supuestos y decisiones pendientes.
- Convenciones de ramas, commits y pull requests.
- Archivo `.env.example` sin secretos.
- Backlog inicial organizado por fases.

### Reglas para `AGENTS.md`

- Leer requisitos y arquitectura antes de modificar código.
- No inventar campos, estados o reglas de negocio.
- Trabajar una tarea por vez.
- Mostrar primero el plan de archivos a modificar.
- No reescribir módulos que ya funcionan sin autorización.
- Crear o actualizar pruebas con cada cambio.
- No colocar secretos en código o commits.
- Mantener TypeScript estricto.
- Ejecutar lint, pruebas y build antes de marcar una tarea como terminada.
- Actualizar documentación cuando cambie una decisión.

### Criterio de salida

- [ ]  El proyecto se instala desde cero siguiendo el README.
- [ ]  Cascade entiende alcance, reglas y estructura sin depender del historial del chat.
- [ ]  Los archivos fuente están disponibles dentro del repositorio.
- [ ]  No existen secretos ni credenciales reales.

## 6. Fase 1 — Descubrimiento técnico y contrato del MVP

### Objetivo

Cerrar las decisiones que afectan la construcción antes de generar grandes cantidades de código.

### Decisiones obligatorias

- Vite PWA o Next.js PWA.
- Supabase o backend ADN.
- Nombre, logo y paleta definitiva.
- Usuarios y roles iniciales.
- Cadenas, países y monedas admitidas.
- Preguntas obligatorias y opcionales.
- Cantidad mínima de fotografías.
- Audio obligatorio u opcional.
- Límite de tamaño y duración de multimedia.
- Productos mínimos de comparación.
- Formato de exportación.
- Política de conservación de archivos.
- Responsable de validación de auditorías.

### Entregables

- Especificación funcional v1.
- Mapa de pantallas.
- Modelo de navegación.
- Modelo entidad-relación.
- Contrato de datos para una auditoría.
- Diccionario de campos y catálogos.
- Matriz de permisos.
- Criterios de aceptación globales.
- Registro de decisiones arquitectónicas — ADR.

### Criterio de salida

- [ ]  Cada pantalla tiene propósito, entradas, acciones y estados vacíos/error.
- [ ]  Cada campo tiene tipo, unidad, obligatoriedad y validación.
- [ ]  Los roles y permisos están definidos.
- [ ]  El alcance incluido y excluido está congelado para el MVP.

## 7. Fase 2 — Fundaciones técnicas

### Objetivo

Crear una base mantenible antes de desarrollar los formularios.

### Entregables

- Estructura definitiva del proyecto.
- Configuración PWA.
- Diseño base y componentes reutilizables.
- Rutas y navegación.
- Variables de entorno.
- Cliente de datos.
- Manejo global de errores.
- Sistema de notificaciones.
- Estados de carga, vacío y error.
- Pipeline de lint, pruebas y build.
- Ambiente de desarrollo conectado a una base sin datos sensibles.

### Criterio de salida

- [ ]  La aplicación instala y abre como PWA.
- [ ]  Funciona en un teléfono real.
- [ ]  Tiene navegación básica y manejo consistente de errores.
- [ ]  Lint, pruebas iniciales y build finalizan correctamente.

## 8. Fase 3 — Identidad, acceso y permisos

### Objetivo

Garantizar que cada acción quede asociada a una identidad autorizada.

### Entregables

- Inicio y cierre de sesión.
- Recuperación de acceso.
- Roles Auditor y Administrador.
- Protección de rutas.
- Perfil del usuario.
- Políticas de acceso en base de datos.
- Registro básico de actividad.

### Criterio de salida

- [ ]  Un auditor solo accede a las funciones autorizadas.
- [ ]  Un administrador consulta todas las auditorías.
- [ ]  Un usuario no autenticado no accede a datos.
- [ ]  Las políticas se validan en backend, no solo en interfaz.

## 9. Fase 4 — Catálogos y ficha técnica

### Objetivo

Permitir crear una auditoría correctamente identificada.

### Catálogos

- Países, estados y ciudades.
- Cadenas y competidores.
- Tiendas.
- Nivel socioeconómico.
- Tipo de ubicación.
- Monedas.
- Categorías y productos comparables.

### Ficha técnica

- Auditor.
- Fecha y hora de inicio.
- Cadena y tienda.
- Dirección y ciudad.
- GPS.
- Nivel socioeconómico.
- Tipo de ubicación.
- Momento de observación.
- Observaciones generales.
- Foto de fachada.

### Criterio de salida

- [ ]  Se crea, guarda, edita y elimina lógicamente un borrador.
- [ ]  Fecha, hora, auditor y coordenadas se registran correctamente.
- [ ]  Los catálogos no dependen de texto libre innecesario.
- [ ]  La auditoría recibe un identificador único.

## 10. Fase 5 — Motor versionado de checklist

### Objetivo

Evitar formularios rígidos y permitir evolucionar preguntas sin invalidar visitas anteriores.

### Capacidades

- Definición de secciones y preguntas mediante configuración.
- Tipos de respuesta: texto, número, porcentaje, selección, selección múltiple, rango y evidencia.
- Reglas de obligatoriedad.
- Unidades y rangos válidos.
- Preguntas condicionales.
- Orden de visualización.
- Versión publicada del checklist.
- Persistencia de la versión usada en cada auditoría.

### Criterio de salida

- [ ]  Una versión nueva no modifica auditorías históricas.
- [ ]  Las validaciones provienen del esquema publicado.
- [ ]  Se puede reconstruir exactamente el formulario usado en una visita.

## 11. Fase 6 — Los cinco módulos de auditoría

### Módulo 1 — Infraestructura, layout y densidad

- Área del piso de venta.
- Número y ancho de pasillos.
- Cruce de dos carritos.
- Cajas totales y operativas.
- Estanterías, góndolas, palets y SRP.
- Cadena de frío.
- Iluminación, acabados y señalización.
- Limpieza y mantenimiento.

### Módulo 2 — Surtido, marcas y portafolio

- Estimación de SKUs.
- Categorías presentes.
- Profundidad por categoría.
- Marca propia, líderes y marcas económicas.
- Frescos, refrigerados y congelados.
- Importados y nacionales.
- Pasillo In & Out.
- Rotación y visibilidad.

### Módulo 3 — Precios, promociones y comunicación

- Producto, categoría, marca y presentación.
- Precio y moneda.
- Unidad de medida y precio normalizado.
- Marca propia o nacional.
- EDLP, descuentos, combos y liquidaciones.
- Formato y visibilidad de etiquetas.
- Mensajes de ahorro y propuesta de valor.

### Módulo 4 — Operación, logística y eficiencia

- Personal visible y funciones.
- Polivalencia.
- Reposición y palets en pasillos.
- Agotados.
- Merma y productos dañados.
- Área de recepción.
- Evidencia de frecuencia y método de despacho.

### Módulo 5 — Comportamiento del cliente

- Perfiles observados.
- Tipo y frecuencia de compra.
- Tamaño de cesta.
- Uso de carrito o cesta.
- Tráfico.
- Tiempo de espera.
- Métodos de pago y proporción estimada.

### Criterio de salida

- [ ]  Los cinco módulos guardan y recuperan respuestas.
- [ ]  El progreso es correcto.
- [ ]  Los campos obligatorios se muestran claramente.
- [ ]  Los rangos y unidades evitan datos inconsistentes.
- [ ]  Cada módulo admite observaciones y evidencia.

## 12. Fase 7 — Evidencia multimedia

### Objetivo

Asociar hechos observados con evidencia verificable sin degradar la experiencia en campo.

### Entregables

- Captura y selección de fotografías.
- Vista previa, compresión y eliminación antes de enviar.
- Notas de audio.
- Metadatos de fecha, ubicación y autor.
- Asociación de cada archivo con auditoría, sección y pregunta.
- Cola de carga independiente del formulario.
- Estados de carga, error y reintento.

### Criterio de salida

- [ ]  Una falla de carga no elimina respuestas ni archivos locales.
- [ ]  Los archivos se comprimen antes de sincronizar.
- [ ]  Cada evidencia conserva trazabilidad.
- [ ]  No se duplica una carga al reintentar.

## 13. Fase 8 — Operación offline y sincronización

### Objetivo

Permitir completar una visita sin conexión y sincronizarla con seguridad después.

### Entregables

- Persistencia local en IndexedDB.
- Caché del shell de la aplicación y catálogos necesarios.
- Guardado automático.
- Cola local de operaciones.
- Identificadores idempotentes.
- Detección de conectividad.
- Sincronización manual y automática.
- Reintentos controlados.
- Resolución documentada de conflictos.
- Indicador visible de estado local/sincronizado.

### Criterio de salida

- [ ]  Se completa una auditoría en modo avión.
- [ ]  Cerrar y abrir la aplicación no pierde información.
- [ ]  Al recuperar internet, datos y archivos se sincronizan.
- [ ]  Reintentar no genera auditorías duplicadas.
- [ ]  El usuario sabe qué información sigue pendiente.

## 14. Fase 9 — Revisión, envío y trazabilidad

### Objetivo

Evitar el envío de auditorías incompletas o inconsistentes.

### Entregables

- Resumen previo al envío.
- Lista de campos pendientes.
- Confirmación del auditor.
- Cambio controlado de estados.
- Historial de modificaciones.
- Flujo de devolución y corrección.
- Bloqueo o versionado después de validar.

### Criterio de salida

- [ ]  Una auditoría incompleta no se marca como enviada.
- [ ]  El auditor puede corregir antes de confirmar.
- [ ]  Los cambios posteriores al envío quedan registrados.
- [ ]  Autor, fecha, ubicación y versión del checklist son trazables.

## 15. Fase 10 — Panel administrativo, comparación y exportación

### Objetivo

Transformar las visitas en información utilizable por el equipo.

### Entregables

- Listado con filtros por fecha, auditor, cadena, ciudad, tienda y estado.
- Vista detallada de cada auditoría.
- Galería de evidencia.
- Comparación básica de tiendas.
- Comparación de precios normalizados.
- Indicadores básicos: SKUs, marca propia, cajas operativas, agotados, espera y cesta.
- Exportación CSV/Excel.
- Descarga controlada de evidencia.

### Criterio de salida

- [ ]  Los filtros y totales coinciden con los registros fuente.
- [ ]  La exportación conserva unidades y metadatos.
- [ ]  Se pueden comparar al menos dos tiendas.
- [ ]  Los permisos protegen la consulta y descarga.

## 16. Fase 11 — Seguridad y privacidad

### Objetivo

Preparar el MVP para operar con evidencia sensible y evitar que datos confidenciales entren al producto sin control.

### Controles

- Row Level Security.
- HTTPS.
- Variables de entorno y secretos fuera del repositorio.
- Separación de desarrollo y producción.
- Datos ficticios o anonimizados para pruebas.
- Registro de accesos y exportaciones.
- Eliminación lógica y política de retención.
- Revisión de permisos de fotografías y ubicación.
- Respaldo y recuperación.
- Prohibición de cargar datos reales de clientes ADN sin autorización expresa.

### Criterio de salida

- [ ]  No hay secretos en código ni historial Git.
- [ ]  Las políticas de acceso tienen pruebas.
- [ ]  Desarrollo no contiene datos reales sensibles.
- [ ]  Existe procedimiento de respaldo y recuperación.

## 17. Fase 12 — Pruebas de campo y estabilización

### Objetivo

Validar el producto en condiciones reales antes de declararlo operativo.

### Escenarios obligatorios

- Teléfono Android de gama media.
- Pantalla pequeña.
- Conexión lenta e intermitente.
- Modo avión.
- Cierre inesperado de la aplicación.
- Fotografía pesada.
- Audio interrumpido.
- Doble pulsación del botón de envío.
- Sesión vencida.
- Sincronización parcial.
- Auditoría larga con todos los módulos.

### Entregables

- Guion de prueba de campo.
- Registro de defectos.
- Priorización por severidad.
- Evidencia de correcciones.
- Manual breve del auditor.
- Checklist de salida a producción.

### Criterio de salida

- [ ]  No hay pérdida de respuestas ni archivos.
- [ ]  No hay duplicados por reintento.
- [ ]  El recorrido completo funciona en teléfono real.
- [ ]  Los errores críticos y altos están cerrados.
- [ ]  Un auditor puede utilizar la aplicación sin apoyo técnico continuo.

## 18. Fase 13 — Cierre del MVP y preparación de evolución

### Objetivo

Congelar una versión estable, documentar lo aprendido y preparar la incorporación posterior de IA.

### Entregables

- Release versionado.
- Notas de versión.
- Manual de despliegue.
- Manual operativo.
- Inventario de deuda técnica.
- Métricas del piloto.
- Backlog posterior al MVP.
- Decisión sobre OCR, visión, transcripción y recomendaciones.

### Criterio de salida global

- [ ]  Se crea una auditoría completa.
- [ ]  Se capturan GPS, fotografías y audio.
- [ ]  Se trabaja offline sin pérdida de datos.
- [ ]  La sincronización es idempotente.
- [ ]  La auditoría se revisa y envía.
- [ ]  Un administrador la consulta y exporta.
- [ ]  Se comparan dos o más tiendas.
- [ ]  Autor, fecha, ubicación, versión y evidencia quedan trazables.
- [ ]  Seguridad, pruebas y documentación están completas.

## 19. Método de trabajo con Windsurf y Cascade

### Ciclo recomendado para cada tarea

1. Seleccionar una historia pequeña con criterio de aceptación.
2. Pedir a Cascade que lea `AGENTS.md` y los documentos relacionados.
3. Solicitar un plan de implementación antes de editar.
4. Revisar archivos y riesgos propuestos.
5. Autorizar una sola unidad de cambio.
6. Ejecutar pruebas, lint y build.
7. Probar manualmente el recorrido afectado.
8. Revisar el diff.
9. Actualizar documentación.
10. Hacer commit con mensaje descriptivo.

### Plantilla de prompt para Cascade

```
Lee primero AGENTS.md y los documentos relacionados en /docs.

Tarea: [describir una sola historia].
Criterios de aceptación:
- [criterio 1]
- [criterio 2]
- [criterio 3]

Antes de editar:
1. Resume cómo entiendes la tarea.
2. Indica los archivos que crearás o modificarás.
3. Explica riesgos, supuestos y pruebas necesarias.
4. No cambies arquitectura ni dependencias sin aprobación.

Después de implementar:
1. Ejecuta lint, pruebas y build.
2. Reporta resultados reales.
3. Resume el diff.
4. Indica pruebas manuales pendientes.
5. Actualiza la documentación afectada.
```

### Reglas para evitar deuda por Vibecoding

- No aceptar cambios masivos sin dividirlos.
- No permitir archivos monolíticos.
- No duplicar lógica de formularios.
- No mezclar estado local, sincronización y presentación en un solo módulo.
- No confiar únicamente en validaciones del frontend.
- No omitir pruebas porque la interfaz “parece funcionar”.
- No actualizar dependencias sin revisar impacto.
- No aceptar código que Cascade no pueda explicar.
- No usar datos o credenciales reales en prompts.
- Mantener un ADR por cada decisión estructural importante.

## 20. Backlog posterior al MVP

- OCR de etiquetas y anaqueles.
- Reconocimiento de productos.
- Normalización asistida de presentaciones.
- Transcripción de notas de audio.
- Resumen automático de cada visita.
- Detección de anomalías.
- Comparación inteligente entre cadenas.
- Recomendaciones para layout y surtido.
- Integración con Cost & Assortment Matrix.
- Integración con P&L y Evidence Book.
- Mapas de calor y análisis geográfico.
- Generación automática del informe de visita.

## 21. Archivos actuales para descargar y entregar a Cascade

<aside>
📦

Descarga estos cuatro archivos y colócalos en `/references/storecheck-original/` dentro del repositorio. `APP_STORECHECK (1).html` no se incluye porque es un duplicado exacto del HTML principal.

</aside>

[APP_STORECHECK.txt — checklist funcional original](f3e92713-1758-4b9b-8748-b827f33b7a28.txt)

APP_STORECHECK.txt — checklist funcional original

[Prompt Inicial StoreCheck.txt — solicitud inicial de diseño](cd6b3630-5f1d-4cfa-85b0-1d120d1d39ee.txt)

Prompt Inicial StoreCheck.txt — solicitud inicial de diseño

[Python_StoreCheck.txt — código y prototipo de referencia](a7eb3dbb-6206-46fb-beae-ffe9021dc3e0.txt)

Python_StoreCheck.txt — código y prototipo de referencia

[APP_STORECHECK.html — prototipo navegable actual](b682910a-6647-4884-8d2b-5cae7aaef9bd.html)

APP_STORECHECK.html — prototipo navegable actual

### Página fuente

Los originales también se conservan en [QL — StoreCheck: investigación de campo y prototipos](https://app.notion.com/p/QL-StoreCheck-investigaci-n-de-campo-y-prototipos-29fe8e784b3847b5b7d3d555bd6d6c88?pvs=21).

## 22. Documentación complementaria del espacio de trabajo

- [QL — Hard Discount: concepto y modelo operativo](https://app.notion.com/p/QL-Hard-Discount-concepto-y-modelo-operativo-b90518d8b64a415eb46ab62f7a13c492?pvs=21)
- [QL — Finanzas y sprint de viabilidad](https://app.notion.com/p/QL-Finanzas-y-sprint-de-viabilidad-0241bac95ff64e3291e8b415eaf079f6?pvs=21)
- [QL — Responsables, pendientes, hitos y riesgos](https://app.notion.com/p/QL-Responsables-pendientes-hitos-y-riesgos-564c3418c2984d8bb61568fb890033a1?pvs=21)
- [QL — Síntesis ejecutiva del chat de socios](https://app.notion.com/p/QL-S-ntesis-ejecutiva-del-chat-de-socios-7a4c2ea552a5431191a4afe0249fe5b1?pvs=21)
- [QL — Mapa de adjuntos y evidencia del chat](https://app.notion.com/p/QL-Mapa-de-adjuntos-y-evidencia-del-chat-8263dfda71744b85887a782f6b8e7129?pvs=21)