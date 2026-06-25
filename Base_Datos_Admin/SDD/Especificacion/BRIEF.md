# BRIEF - Reforma y Mejoras del Panel Administrador (LogicaKids Pro)

## 1. Problema en una Frase
La gestión actual de alumnos y del banco de preguntas en el panel de administración carece de eficiencia operativa (eliminación en lote, paginación configurable), consistencia en el flujo de bases de datos (Fase 0 obsoleta e inconsistente con MinIO) y controles visuales para que los tutores validen pedagógicamente el contenido tal como lo experimenta el estudiante.

## 2. Solución Propuesta
Implementar una reforma integral en la aplicación de administración que incorpore:
1. **Administración en Lote:** Checkboxes de selección múltiple, paginación tradicional ajustable y un endpoint optimizado para la eliminación masiva segura con limpieza física de avatares en MinIO.
2. **Saneamiento de la Estructura Pedagógica:** Eliminación completa de la Fase 0 obsoleta y mapeo visual de módulos con sus nombres descriptivos reales.
3. **Reforma del Banco de Preguntas:** Nueva navegación jerárquica (*Fase -> Módulo -> Niveles/Teoría/Preguntas*) y un "Modo Simulación Alumno" con visualización interactiva WYSIWYG, navegación secuencial y marcas de aprobación/auditoría.

## 3. Público Objetivo
- **Pedagogos y Diseñadores de Contenido:** Responsables de crear, revisar, y aprobar la teoría y las preguntas de los niveles.
- **Administradores y Tutores del Sistema:** Encargados de dar de alta o baja alumnos, ajustar sus fases y monitorear el progreso del sistema.

## 4. Diferencial Competitivo
En lugar de ser un simple CRUD (Crear, Leer, Actualizar, Borrar) de base de datos genérico, el panel se transforma en un **entorno de simulación y auditoría integrada**. Permite a los pedagogos validar el impacto visual y pedagógico del contenido interactivo antes y durante su puesta en marcha, garantizando la consistencia total entre la base de datos y la experiencia del alumno.

## 5. Métricas de Éxito
- **Reducción de Tiempo Operativo:** Disminución del 90% en el tiempo empleado para dar de baja grupos de alumnos (de minutos a un solo clic).
- **Cero Archivos Huérfanos:** Eliminación del 100% de imágenes de perfil asociadas a los alumnos dados de baja en el bucket de MinIO.
- **Tasa de Error de Compilación:** 0% de advertencias y errores de TypeScript en la compilación del proyecto frontend.
- **Precisión en Contenidos:** Reducción a cero de preguntas publicadas con errores de formato o diseño gracias al proceso de revisión en Modo Simulación.
