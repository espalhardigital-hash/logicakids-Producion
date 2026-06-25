# Documento de Validación (Fase 2) - Riesgos, Viabilidad y Escopo de MVP

Este documento contiene el análisis de viabilidad, riesgos identificados y la definición del alcance (escopo) acordados para la implementación de las mejoras y reformas en el panel administrador (`logicakids-admin`).

---

## 1. Análisis de Viabilidad y Riesgos Técnicos

### A. Modificaciones en el Esquema de Base de Datos (Migraciones)
- **Riesgo:** La incorporación de campos de revisión (`revisado_admin`, `revisado_por`, `fecha_revision`) en las tablas `preguntas` y `niveles_teoria_pool` requiere alterar tablas existentes con datos.
- **Mitigación:** Se debe preparar un script SQL limpio para aplicar en el entorno de pruebas local (y posteriormente en producción) inicializando `revisado_admin` en `FALSE` para registros existentes.

### B. Eliminación de la Fase 0 y Cascadas
- **Riesgo:** La eliminación física de la Fase 0 en cascada puede provocar fallos de integridad referencial si hay relaciones mal configuradas o índices huérfanos.
- **Mitigación:** Ejecutar la eliminación en un orden estrictamente secuencial en la transacción SQL:
  1. Eliminar intentos y progresos de alumnos asociados a la Fase 0.
  2. Eliminar alumnos y usuarios vinculados únicamente a la Fase 0.
  3. Eliminar preguntas y alternativas de la Fase 0.
  4. Eliminar el registro de la Fase 0 de la tabla `fases`.

### C. Limpieza Física en MinIO
- **Riesgo:** Si un alumno tiene una imagen cargada pero el archivo físico fue eliminado manualmente o falta en el storage, una llamada de eliminación podría retornar un error de S3 e interrumpir la transacción de borrado de base de datos.
- **Mitigación:** El backend debe capturar excepciones al intentar eliminar archivos de MinIO, permitiendo que la transacción de base de datos continúe con éxito aunque el archivo físico no exista (tolerancia a fallos).

### D. Eliminación Masiva (Bulk Delete)
- **Riesgo:** Borrar múltiples usuarios a la vez incrementa el tiempo de ejecución en la base de datos, lo que podría ocasionar un *timeout* en la conexión HTTP.
- **Mitigación:** Implementar un endpoint dedicado `DELETE /admin/users/bulk` que reciba un listado de IDs y ejecute la eliminación masiva agrupada en una sola transacción SQL optimizada.

---

## 2. Definición del Escopo del MVP

El alcance de esta actualización se centrará estrictamente en los requerimientos solicitados por el usuario, omitiendo cualquier recomendación externa.

### 🔴 Must Have (Obligatorio para el MVP)
1. **Estabilización del Frontend:**
   - Crear el archivo de tipos `db-models.ts` para resolver las dependencias faltantes.
   - Corregir errores de tipado e interfaces rotas en `PreguntaForm.tsx`, `DashboardLayout.tsx` y enrutadores.
2. **Sección Alumnos:**
   - Checkboxes individuales y checkbox maestro en la tabla de alumnos.
   - Paginación tradicional (página 1, 2, 3...) con selector de tamaño de página (10, 20, 50).
   - Modal confirmatorio que detalle la cantidad de alumnos a eliminar.
   - API de eliminación masiva en el backend y borrado físico de avatares en MinIO.
3. **Sección Pedagogía y Fases:**
   - Eliminación física de la Fase 0 en la base de datos local y supresión de referencias en la UI.
   - Modificación del backend (`auth_users.py`) para que los nuevos usuarios se registren por defecto en la fase de menor orden disponible (Fase 1).
   - Mapeo de nombres descriptivos de módulos en la tabla de configuraciones pedagógicas.
4. **Reforma del Banco de Preguntas:**
   - Navegación jerárquica: *Fase -> Módulo -> Pestañas de Sección* (General, Teoría, Preguntas Libres, Desafíos).
   - Modo Vista Alumno (Simulador WYSIWYG) con controles de navegación Anterior y Siguiente.
   - Checkbox de "Aprobado/Revisado" para preguntas y teoría, guardando el autor y fecha de revisión.
   - Barra de progreso de revisión por módulo basada en la base de datos.

### ⚪ Won't Have (Fuera de Alcance)
- Gráficos de embudo de avance (Learning Funnel).
- Simulación adaptativa en dispositivos móviles/tablets (iFrames).
- Sistema de alertas automáticas para alumnos estancados.
- Clonador automático/Generador rápido de variantes de preguntas.
- Exportación de listados de alumnos o preguntas a Excel/CSV.
- Botón de deshacer en la eliminación masiva de alumnos.
