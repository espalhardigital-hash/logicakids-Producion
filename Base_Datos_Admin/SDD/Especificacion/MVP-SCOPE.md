# MVP SCOPE - Alcance de la Versión Mínima Viable

Este documento define con precisión qué elementos forman parte de la entrega (MVP) para la reforma del panel administrador y cuáles quedan excluidos para fases posteriores.

---

## 1. Clasificación MoSCoW

### 🔴 Must Have (Obligatorio)
- **Compilación Estable:** Corrección de todos los errores de TypeScript en el frontend y creación de `db-models.ts`.
- **Selección Múltiple y Borrado Bulk:** Columnas de checkboxes en Alumnos, botón masivo, confirmación con conteo exacto de usuarios, API del lado del servidor para borrado en lote y cascada en MinIO.
- **Paginación Ajustable:** Selector de tamaño (10/20/50 alumnos) y botones numéricos de paginación.
- **Baja de Fase 0:** Limpieza de Fase 0 en base de datos y migración segura de registro de nuevos usuarios en `auth_users.py`.
- **Mapeo de Nombres de Módulos:** Nombres descriptivos en la pestaña Pedagogía.
- **Jerarquía del Banco de Preguntas:** Navegación por Fase -> Módulo -> Pestañas de detalle.
- **Modo Simulación Alumno:** Renderizado visual interactivo, controles de navegación secuencial (Atrás/Adelante), y checkbox de revisión con registro del tutor.
- **Progreso de Revisión:** Barra de avance que indica el porcentaje de preguntas revisadas en base de datos para el módulo activo.
- **Campos de Revisión en DB:** `revisado_admin`, `revisado_por` y `fecha_revision` en las tablas `preguntas` y `niveles_teoria_pool`.
- **Auditoría:** Registro automático de las operaciones administrativas del banco de preguntas en `audit_logs`.

### 🟡 Should Have (Deseable)
- Notificaciones Toast (mensajes emergentes) descriptivas tras completar la eliminación masiva indicando el estado del borrado de avatares.

### 🟢 Could Have (Opcional)
- Desbloqueo temporal para permitir que el administrador fuerce la revisión de preguntas sin visualizarlas.

### ⚫ Won't Have (Descartado para este MVP)
- Gráfico de embudo de avance pedagógico interactivo.
- Selector multidispositivo en Modo Simulación Alumno (iFrames).
- Alertas automatizadas de alumnos estancados en el listado general.
- Generador/clonador rápido de variantes de preguntas en un clic.
- Exportación a CSV o Excel de alumnos/preguntas.
- Botón para "deshacer" eliminaciones masivas.

---

## 2. Justificación de Decisiones
Las propuestas opcionales (funnel, multidispositivo, alertas, clonadores) fueron evaluadas y descartadas en la fase de descubrimiento para mantener el desarrollo acotado a la estabilidad básica y optimización directa del flujo transaccional. Esto asegura una entrega en tiempo y forma, minimizando el riesgo de inyectar bugs complejos en las áreas de visualización.

---

## 3. Hipótesis a Validar con el MVP
1. **Hipótesis 1:** La eliminación en lote reduce drásticamente las quejas de los administradores sobre el mantenimiento manual de la lista de alumnos al finalizar los ciclos de prueba.
2. **Hipótesis 2:** El Modo Simulación de Alumno reduce a cero los errores tipográficos o de desbordamiento de caja (layout overflow) en las preguntas del juego final.
3. **Hipótesis 3:** La barra de progreso de revisión incentiva a los pedagogos a completar la auditoría del 100% de las preguntas de cada módulo.

---

## 4. Métricas de Éxito cuantitativas
- **Velocidad de Limpieza:** Tiempo de borrado de 50 alumnos < 3 segundos.
- **Consistencia del Almacenamiento:** 0 bytes de archivos huérfanos en MinIO correspondientes a alumnos borrados.
- **Compilador TypeScript:** 0 errores de compilación (`npm run build` exitoso).
