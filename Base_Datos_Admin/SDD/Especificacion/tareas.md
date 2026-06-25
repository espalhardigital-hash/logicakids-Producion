# TAREAS - Hoja de Ruta de Modificaciones e Implementación (Checklist)

Este documento contiene la lista detallada y secuencial de tareas de desarrollo para completar la reforma del panel administrador.

---

## 📅 Fase A: Base de Datos y Modelos (Backend)

- [x] **Tarea A.1: Migración en base de datos de Alumnos e Intentos**
  * *Acción:* Agregar columnas `revisado_admin` (boolean, default FALSE), `revisado_por` (varchar, nullable), y `fecha_revision` (timestamp, nullable) a la tabla `preguntas`.
  * *Destino:* Consola PostgreSQL local (`logicakids_local_db`).
- [x] **Tarea A.2: Migración en base de datos de Teoría**
  * *Acción:* Agregar columnas `revisado_admin` (boolean, default FALSE), `revisado_por` (varchar, nullable), y `fecha_revision` (timestamp, nullable) a la tabla `niveles_teoria_pool`.
  * *Destino:* Consola PostgreSQL local (`logicakids_local_db`).
- [x] **Tarea A.3: Script SQL para eliminar la Fase 0**
  * *Acción:* Ejecutar script SQL transaccional para eliminar en cascada la Fase 0 de la tabla `fases` y limpiar todos los datos/usuarios vinculados únicamente a ella.
- [x] **Tarea A.4: Actualizar modelos SQLAlchemy**
  * *Acción:* Modificar el modelo de `Pregunta` en [pregunta.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/models/pregunta.py) y `NivelTeoria` en [models.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/fase2/models.py) para mapear las nuevas columnas de revisión.

---

## 🌐 Fase B: Servicios y Endpoints API (Backend)

- [x] **Tarea B.1: Reconfigurar fase por defecto para alumnos**
  * *Acción:* Modificar la lógica en [auth_users.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/routers/auth_users.py#L324-L338) para que la creación de nuevos alumnos asigne de forma dinámica la fase activa con menor orden (Fase 1) en lugar de buscar específicamente el orden 0.
- [x] **Tarea B.2: Crear endpoint para eliminación masiva (Bulk Delete)**
  * *Acción:* Crear la ruta `DELETE /admin/users/bulk` en el router de administración. Debe recibir una lista de IDs de usuario, borrar sus avatares en MinIO capturando excepciones, y eliminar los usuarios de la base de datos en una sola transacción SQL.
  * *Destino:* [router.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/admin/router.py).
- [x] **Tarea B.3: Logging de Auditoría (Audit Logs)**
  * *Acción:* Agregar registros automatizados de auditoría a la tabla `audit_logs` utilizando el modelo `AuditLog` cada vez que se ejecute una acción administrativa (bulk delete, guardar teoría, editar preguntas, marcar revisados).
- [x] **Tarea B.4: Validar y reiniciar el contenedor del backend**
  * *Acción:* Levantar Docker localmente y probar la API mediante el Swagger de FastAPI (`http://localhost:8000/docs`).

---

## 🛠️ Fase C: Corrección de Compilación TypeScript (Frontend)

- [x] **Tarea C.1: Crear archivo de definición de tipos**
  * *Acción:* Crear el archivo [db-models.ts](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/types/db-models.ts) definiendo las interfaces para `Alumno`, `Fase`, `ConfiguracionProgreso`, `Pregunta` y `Alternativa`.
- [x] **Tarea C.2: Arreglar importaciones y propiedades rotas**
  * *Acción:* Modificar [DashboardLayout.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/components/layout/DashboardLayout.tsx) y [AppRoutes.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/routes/AppRoutes.tsx) para resolver discrepancias de TypeScript (incluyendo pasar `allowedRoles` como prop válida en enrutador o ignorarla limpiamente).
- [x] **Tarea C.3: Compilación limpia**
  * *Acción:* Correr `npm run build` en el directorio frontend y verificar que no arroje errores de TypeScript.

---

## 👥 Fase D: Mejoras en la Sección de Alumnos (Frontend)

- [x] **Tarea D.1: Checkboxes de selección en la tabla**
  * *Acción:* Modificar [AlumnosTable.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/features/alumnos/components/AlumnosTable.tsx) para renderizar checkboxes en las filas y en el header principal. Controlar el estado de alumnos seleccionados en un array React.
- [x] **Tarea D.2: Controles de Paginación Ajustable**
  * *Acción:* Implementar el selector de límite (10, 20, 50) y los controles numéricos de página en [AlumnosTable.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/features/alumnos/components/AlumnosTable.tsx), sincronizando el estado con la query de React Query.
- [x] **Tarea D.3: Integración de eliminación masiva en UI**
  * *Acción:* Vincular el botón de eliminar seleccionados con un modal confirmatorio y llamar al nuevo endpoint de eliminación en lote del backend. Refrescar la tabla tras el éxito de la petición.

---

## 📚 Fase E: Mejoras en Pedagogía (Frontend)

- [x] **Tarea E.1: Remover referencias a Fase 0**
  * *Acción:* Ocultar/filtrar cualquier pestaña o control que haga referencia a la Fase 0 en el frontend.
- [x] **Tarea E.2: Mostrar nombres descriptivos de módulos**
  * *Acción:* Crear un diccionario de mapeo en TypeScript y usarlo en [FasesPage.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/features/pedagogia/pages/FasesPage.tsx) para renderizar los nombres de los módulos reales a un lado del identificador de sección.

---

## 📝 Fase F: Reforma del Banco de Preguntas (Frontend)

- [x] **Tarea F.1: Refactor de layout jerárquico**
  * *Acción:* Modificar [PreguntasPage.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/features/ejercicios/pages/PreguntasPage.tsx) para incluir la navegación por Fases (superior), Módulos (menú lateral) y Sub-pestañas horizontales (General, Teoría, Preguntas, Desafíos).
- [x] **Tarea F.2: Implementar Pestaña "General del Módulo"**
  * *Acción:* Mostrar resumen de configuraciones y permitir editarlas en lote.
- [x] **Tarea F.3: Implementar Pestaña "Teoría"**
  * *Acción:* Integrar editor visual de texto y campos descriptivos (diccionario, ejemplos, advertencia) para la teoría del módulo por nivel.
- [x] **Tarea F.4: Modo Simulación Alumno (WYSIWYG)**
  * *Acción:* Crear el modal/tarjeta de simulación interactiva donde la pregunta se vea como en la app móvil. Habilitar la barra de progreso, la navegación secuencial (Atrás/Adelante) y el checkbox de revisión.

---

## 🎨 Fase G: Rediseño Visual y Temas (Claro y Oscuro)

- [x] **Tarea G.1: Rediseñar la Sidebar Principal**
  * *Acción:* Modificar [DashboardLayout.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Base_Datos_Admin/logicakids-admin/src/components/layout/DashboardLayout.tsx) para implementar la barra lateral primaria compacta en tonos navy oscuros (`#0b1528` / `bg-zinc-950`) común a ambos temas, optimizando el espacio visual de los iconos.
- [x] **Tarea G.2: Pautas de Color Globales en CSS**
  * *Acción:* Configurar los fondos y colores semánticos en `index.css` y `App.css` aplicando el contraste Light (base `slate-50`) y la escala de grises oscuros premium de la paleta Zinc (base `zinc-950` para canvas y `zinc-900` para tarjetas) para el Dark Mode.
- [x] **Tarea G.3: Sistema de Alternancia de Tema (Theme Switcher)**
  * *Acción:* Adaptar el enrutador y los layouts para leer el tema activo en `localStorage` e inyectar dinámicamente la clase `dark` en la etiqueta raíz `<html>` o `<body>` de forma fluida.
- [x] **Tarea G.4: Estilización de Tablas y Paneles de Control**
  * *Acción:* Aplicar las reglas visuales (`rounded-2xl`, sombras tenues `shadow-sm`, y bordes `border-slate-100` / `border-zinc-800` en modo oscuro) en las vistas de Alumnos, Fases de Pedagogía y el Banco de Preguntas.

