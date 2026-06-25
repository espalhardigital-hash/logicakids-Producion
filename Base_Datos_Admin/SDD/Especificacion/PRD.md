# PRD - Documento de Requisitos de Producto (Mejoras del Panel Administrador)

## 1. Visión General del Producto
El Panel Administrador es el núcleo de gestión y control del ecosistema LogicaKids. Esta iteración tiene como objetivo sanear la deuda técnica del frontend (errores de compilación de TypeScript), eliminar flujos redundantes (Fase 0), y habilitar herramientas potentes de administración en lote (Bulk Delete de alumnos) y revisión de contenidos (Modo Simulación de Alumno en el Banco de Preguntas).

---

## 2. Personas Detalladas
1. **Sofía (Pedagoga y Creadora de Contenido):**
   - *Perfil:* Profesional en educación encargada de diseñar los problemas matemáticos y explicaciones teóricas.
   - *Necesidades:* Quiere ver exactamente cómo le aparecerá al alumno la pregunta (si las opciones caben en la tarjeta, si el texto del problema no se corta, etc.) y marcar que ya está revisada.
2. **Alejandro (Tutor/Coordinador de Escuela):**
   - *Perfil:* Administrador del sistema a nivel escolar.
   - *Necesidades:* Gestiona el ingreso y retiro de alumnos. Requiere borrar alumnos inactivos en lote al final del ciclo escolar sin tener que hacerlo uno por uno.

---

## 3. Historias de Usuario (*User Stories*)
- **HU-01 (Eliminación en Lote):** Como administrador, quiero seleccionar múltiples alumnos a través de checkboxes para eliminarlos en lote junto con sus progresos y archivos de MinIO de forma segura.
- **HU-02 (Paginación Configurable):** Como administrador, quiero ajustar el número de alumnos por página (10, 20 o 50) y navegar con controles clásicos para manejar listas grandes de manera eficiente.
- **HU-03 (Nombres de Módulos):** Como pedagogo, quiero ver los nombres descriptivos de los módulos en la sección de Pedagogía para identificarlos fácilmente sin tener que memorizar códigos de sección.
- **HU-04 (Jerarquía en Banco de Preguntas):** Como pedagogo, quiero navegar por el banco de preguntas siguiendo el flujo lógico (Fase -> Módulo -> Pestañas de detalle) para mantener el contexto del avance didáctico.
- **HU-05 (Modo Simulación Alumno):** Como pedagogo, quiero alternar a la vista alumno para previsualizar la pregunta/teoría interactiva de forma fiel, aprobar su revisión e ir pasando a la siguiente de manera fluida.

---

## 4. Requisitos Funcionales

### A. Gestión de Alumnos
- **Checkboxes de Selección:** 
  - Columna izquierda de checkboxes en la tabla.
  - Checkbox maestro en el header que selecciona/deselecciona todo en la página actual.
- **Botón de Borrado Masivo:**
  - Aparece únicamente cuando hay al menos 1 alumno seleccionado.
  - Lanza un modal confirmatorio: *"¿Seguro que deseas eliminar permanentemente a estos X alumnos?"*.
- **Endpoint Bulk (Backend):**
  - Endpoint `DELETE /admin/users/bulk` que procesa un array de IDs de usuario en una sola transacción.
- **Limpieza de MinIO (Backend):**
  - Para cada usuario a eliminar, se extrae el campo `avatar`. Si contiene una ruta de archivo, se ejecuta la eliminación en el bucket `logicakids`. Si ocurre un error con el storage, se registra en logs pero no interrumpe el flujo de base de datos.
- **Paginación Configurable:**
  - Selector de tamaño de página (dropdown: 10, 20, 50).
  - Paginador clásico (Página 1, 2, 3...) recalculando dinámicamente según el total devuelto por el backend.

### B. Pedagogía y Fases
- **Baja de Fase 0:**
  - Eliminar por completo el registro `Fase 0` de la base de datos.
  - Eliminar en cascada los alumnos y datos asociados que estén actualmente posicionados en la Fase 0.
  - Actualizar `auth_users.py` para que el fallback de registro asigne por defecto la fase activa con menor orden (Fase 1).
- **Mapeo de Módulos:**
  - Integrar el diccionario de módulos en el frontend para reemplazar los números de sección (ej: Módulo 100) por nombres amigables (ej: "Sumas", "Gimnasio Numérico Mental").

### C. Banco de Preguntas Renovado
- **Navegación en Tres Niveles:**
  - Pestañas de Fases en la parte superior.
  - Menú lateral secundario con los Módulos de la fase elegida.
  - Sub-pestañas horizontales para: General del Módulo, Teoría, Preguntas Libres, Desafíos.
- **Formulario Inteligente:**
  - El botón "Nueva Pregunta" autocompleta Fase y Módulo según la ubicación actual del usuario.
- **Modo Vista Alumno (Simulador):**
  - Renderizado interactivo del ejercicio imitando el estilo visual de la aplicación móvil/juego.
  - Navegación secuencial con botones "Atrás" y "Adelante".
  - Checkbox de `"Aprobado y revisado"`.
  - Barra de progreso que calcula el porcentaje de preguntas marcadas como `revisado_admin = True` sobre el total de preguntas de ese módulo.

---

## 5. Requisitos No Funcionales
- **Rendimiento:** La eliminación en lote de hasta 50 alumnos debe completarse en menos de 3 segundos.
- **Consistencia:** Toda eliminación de base de datos y MinIO debe ejecutarse de forma transaccional o controlada para evitar datos huérfanos.
- **Seguridad:** Los endpoints de eliminación masiva y actualización de teoría requieren autenticación obligatoria y rol de `ADMIN`.

---

## 6. Casos Límite y Edge Cases
1. **Avatares Inexistentes en MinIO:** Si el registro de base de datos del alumno tiene una ruta en `avatar` pero el archivo fue borrado manualmente de MinIO, el backend debe capturar la excepción y proceder a eliminar al usuario de la DB sin lanzar un error 500.
2. **Eliminación del Alumno con el que se ha Iniciado Sesión:** Evitar que un administrador pueda autoseleccionarse para borrar su propia cuenta.
3. **Pérdida de Conexión de API:** Si la conexión con el servidor falla, el frontend debe mostrar un aviso descriptivo y no bloquear el navegador.

---

## 7. Criterios de Aceptación (Ejemplo)
- *Dado* que el administrador ha seleccionado 5 alumnos en la tabla, *cuando* presiona "Eliminar Seleccionados" y confirma en el modal, *entonces* el sistema debe responder exitosamente, refrescar la lista (eliminando las filas), y las 5 imágenes asociadas ya no deben existir en el storage de MinIO.
