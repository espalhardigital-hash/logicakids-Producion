# Documento de Discovery (Fase 1) - Mejoras y Reformas en el Panel Administrador

Este documento recopila de manera profunda y detallada los requerimientos, especificaciones, y decisiones de diseño acordados durante la **Fase 1: Discovery** para las modificaciones y mejoras en la aplicación de administración (`logicakids-admin`).

---

## 1. Módulo de Alumnos (Gestión en Lote y Visualización)

### Requerimientos de la Interfaz
- **Selección Múltiple (Checkboxes):** 
  - Agregar una columna de checkboxes en el extremo izquierdo de la tabla de alumnos.
  - Implementar un checkbox maestro en la cabecera para seleccionar/deseleccionar todos los alumnos visibles de la página actual.
- **Acción Masiva (Eliminación en Lote):**
  - Mostrar un botón destacado para eliminar a los alumnos seleccionados.
  - Al hacer clic, se debe abrir un modal de confirmación detallado indicando la cantidad exacta de alumnos que serán afectados:
    > *"¿Estás seguro de que deseas eliminar permanentemente a estos X alumnos? Esta acción borrará todo su progreso e imágenes y no se puede deshacer."*
- **Filtro de Tamaño de Página (Paginación Clásica):**
  - Reemplazar cualquier scroll infinito por controles de paginación tradicionales (botones numéricos `1, 2, 3...`, Anterior y Siguiente).
  - Incluir un selector de tamaño de página con las opciones: **10**, **20** y **50** alumnos por grupo.

### Reglas de Backend y Base de Datos (Cascada Completa)
- **Eliminación Física:** Al eliminar un alumno, el backend debe eliminar en cascada:
  - Registro de `User` y `Alumno`.
  - Registros de `ProgresoMaestria` e `Intento`.
- **Limpieza de Archivos en MinIO:** 
  - El backend debe consultar el campo `avatar` del registro del alumno antes de eliminarlo.
  - Si el campo contiene un archivo, se debe realizar la eliminación física en el bucket de MinIO/S3 utilizando el servicio `storage_service`.
- **Eliminación por Fase:** Si existen alumnos registrados en la **Fase 0**, estos se eliminarán por completo al dar de baja la fase del sistema.

---

## 2. Módulo de Pedagogía y Fases (Limpieza y Identificación)

### Eliminación de Fase 0 (Operaciones Elementales)
- **Base de Datos y API:** Eliminar por completo el registro de la **Fase 0** de la base de datos (desarrollo y producción).
- **Registro por Defecto:** Modificar la lógica en `auth_users.py` (y cualquier endpoint de registro) para que, al dar de alta un nuevo alumno, se le asigne por defecto la fase activa con el orden más bajo disponible (que ahora será la **Fase 1**).
- **Frontend:** Limpiar todas las referencias o filtros a la Fase 0 en la interfaz gráfica del administrador.

### Nombres de Módulos
- **Identificación:** En la vista de configuración de fases, en lugar de mostrar códigos de sección genéricos (ej: `Módulo 100`), se cruzará la sección con un mapeador del lado del cliente para mostrar el nombre oficial descriptivo del módulo:
  - **Fase 1:** Módulo 1 (Sumas), Módulo 2 (Restas), Módulo 3 (Tablas), Módulo 4 (Divisiones), Módulo 5 (Desafío Mixto).
  - **Fase 2:** Módulo 1 (Gimnasio Numérico Mental), Módulo 2 (Tablas en Acción), Módulo 3 (Tienda Matemática), Módulo 4 (Constructor de Soluciones).
  - **Fase 3:** Módulo 1 (El Detective Literario), Módulo 2 (Secuencia Temporal), Módulo 3 (Deducción de Precios), Módulo 4 (Reparto y Residuos), Módulo 5 (Ciclos y Agrupaciones Máximas).
  - **Fase 4:** Módulo 1 (La Fracción Visual), Módulo 2 (Fracción de Cantidad), Módulo 3 (Porcentajes Rápidos), Módulo 4 (Razón y Mezclas).

---

## 3. Reforma Estructural del Banco de Preguntas

### Nueva Estructura de Navegación (Jerarquía)
La pantalla se dividirá en tres niveles de profundidad bien diferenciados:
1. **Nivel 1 (Fase):** Barra superior de pestañas para seleccionar la Fase activa (Fase 1, 2, 3, 4).
2. **Nivel 2 (Módulo):** Menú lateral izquierdo secundario que muestra los módulos correspondientes a la fase elegida.
3. **Nivel 3 (Sección Detalle):** El contenido principal del módulo seleccionado se dividirá en 4 sub-pestañas:
   - **General del Módulo:** Resumen y control de configuraciones (porcentaje de aprobación y cantidad de preguntas requeridas).
   - **Teoría:** Editor visual interactivo de los contenidos teóricos del módulo (títulos, diccionarios, advertencias, ejemplos, interactivos) para cada nivel (1, 2 y 3).
   - **Preguntas Libres:** Tabla para buscar, crear, editar y eliminar preguntas de práctica (Niveles 1, 2, 3).
   - **Desafíos:** Tabla para gestionar preguntas asociadas a desafíos (Desafíos 1, 2, Final).

### Modo Simulación Alumno (Visualizador y Editor Visual)
- **Interactividad WYSIWYG:** Un switch/modo que permite al administrador visualizar la pregunta y sus alternativas en una tarjeta interactiva exactamente como la vería el alumno.
- **Acciones Rápidas:** Desde esta misma tarjeta, se proporcionarán botones discretos para "Editar/Reformular" y "Eliminar".
- **Navegación Secuencial:** Botones de "Atrás" y "Adelante" para pasar de forma consecutiva por las preguntas de ese nivel/módulo.
- **Checkbox de Aprobación:** Un control de check que permite marcar la pregunta/teoría como `"Aprobada y revisada por el Administrador"`.
- **Barra de Progreso de Revisión:** Muestra el porcentaje de preguntas de ese módulo que ya han sido revisadas y marcadas con el check en la base de datos.

---

## 4. Auditoría, Registro de Cambios y Nuevos Campos

### Nuevos Campos en Modelos (`Pregunta` y `NivelTeoria`)
Para dar soporte al flujo de revisión visual, se añadirán los siguientes campos a las tablas correspondientes de la base de datos:
- `revisado_admin` (Boolean, default False): Estado de revisión.
- `revisado_por` (String/ForeignKey, nullable): Identificación del administrador que realizó la última aprobación de revisión.
- `fecha_revision` (DateTime, nullable): Marca de tiempo de la revisión.

### Registro de Actividad (Audit Logs)
- **Trazabilidad:** Cada vez que un administrador cree, modifique, elimine o marque como revisado una pregunta o bloque de teoría, se registrará una entrada en la tabla `audit_logs` con los detalles específicos de la operación (`admin_id`, `action`, `endpoint`, `payload_summary`, `timestamp`).

---

## 5. Diseño Visual y UX/UI (Light & Dark Theme)

Tomando como referencia los estándares modernos de UX provistos por el usuario:

### Modo Claro (Light Mode)
- **Fondo General:** Gris neutro frío suave (`bg-slate-50` / `#f8fafc`).
- **Tarjetas/Paneles:** Blanco puro (`#ffffff`) con bordes minimalistas y sombras suaves y difusas (`shadow-sm` / `border-slate-100`).
- **Accent Color:** Índigo y Azul Eléctrico (`indigo-600`) para estados activos, foco y elementos interactivos clave.
- **Navegación:** Barra lateral primaria compacta en tonos azul marino profundo (`#0b1528`) que da un aspecto premium e industrial.

### Modo Oscuro (Dark Mode)
- **Fondo General:** Gris carbón/zinc profundo (`bg-zinc-950` / `#09090b`).
- **Tarjetas/Modales:** Gris zinc elevado (`bg-zinc-900` / `#18181b`), con bordes finos de baja opacidad (`border-zinc-800`).
- **Acciones Primarias (CTAs):** Botones en blanco puro con texto negro, garantizando el máximo contraste y accesibilidad en entornos oscuros.
- **Tipografía:** Títulos en blanco zinc (`#f4f4f5`) y descripciones en gris medio (`#a1a1aa`).
- **Modales:** Uso extendido de fondos oscurecidos con difuminado de fondo (`backdrop-blur-md bg-black/60`).
