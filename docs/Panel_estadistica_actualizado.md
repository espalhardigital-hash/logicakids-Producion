# Manual Técnico y de Arquitectura: Panel de Estadísticas y Resultados (Mi Progreso & Tutoría IA)

> Nota de autoridad documental: Este documento define la visualización del progreso del alumno y la pantalla de resultados. No define reglas de aprobación ni desbloqueo. En caso de conflicto, prevalece primero el Documento Rector Conceptual, luego el Blueprint Técnico, luego el Manual del Administrador y finalmente este documento de estadísticas.

---

## 1. Propósito del Documento

Este documento detalla el diseño, la configuración de datos, la integración con PostgreSQL, la lógica de lectura de progreso y la implementación de la interfaz del **Panel de Estadísticas ("Mi Progreso")** y la **Pantalla de Resultados de Sesión** en la plataforma **LogicaKids Pro**.

El Panel de Estadísticas es una interfaz de lectura, análisis y motivación para el alumno. Su función es mostrar progreso, resultados, historial, recomendaciones y estados académicos ya resueltos por el backend.

### 1.1. Regla de autoridad

El frontend del alumno no calcula aprobación, no desbloquea niveles, no gradúa fases y no modifica el progreso académico real.

La fuente de verdad del progreso académico es `ProgresoMaestria`. La bitácora de respuestas individuales se registra en `intentos`. Cualquier espejo visual heredado como `user.settings["unlockedLevels"]` solo puede sincronizarse desde el backend y nunca debe actuar como fuente principal.

### 1.2. Vías legítimas de avance

El sistema reconoce dos vías de avance académico:

1. **Avance automático por desempeño:** el backend aprueba o desbloquea bloques cuando el alumno cumple las reglas pedagógicas configuradas.
2. **Intervención manual por administrador:** un administrador autorizado puede liberar, aprobar, bloquear o restablecer módulos, niveles o desafíos específicos para un alumno concreto.

El Panel de Estadísticas debe mostrar ambas situaciones con claridad visual, diferenciando progreso obtenido por desempeño y progreso intervenido por administrador.

---

## 2. Stack Tecnológico, Estética y Sistema de Diseño (Glassmorphism Dark)

Los componentes de estadísticas y feedback ofrecen una experiencia premium, motivadora y visualmente inmersiva, combinando analíticas rigurosas con mecánicas de gamificación.

### 2.1. UI Stack

* **React (TypeScript):** Código fuertemente tipado para garantizar consistencia en registros e históricos.
* **Tailwind CSS:** Maquetación responsiva moderna, mobile-first.
* **Framer Motion:** Animaciones de acordeones, tarjetas KPI, trofeos, modales y transiciones.
* **Lucide React:** Iconografía vectorial limpia.
* **Zustand:** Estado local de sesión, usuario y datos de visualización.
* **FastAPI + PostgreSQL:** Backend autoritativo, lectura de progreso y analíticas persistidas.

### 2.2. Directrices Estéticas Premium

* **Profundidad de Fondo:** Capas translúcidas sobre gradientes oscuros (`bg-slate-950/40`) con `backdrop-blur-2xl`.
* **Resplandores Ambientales:** Luces difusas (`bg-blue-500/10`, `bg-purple-500/10`, `blur-[80px]`).
* **Bordes de Cristal:** Tarjetas y modales con `border-white/10`.
* **Éxito:** Esmeralda / Verde (`#10b981`, `text-emerald-400`).
* **Error:** Rojo / Rosa (`#ef4444`, `text-rose-500`).
* **Niveles y Estrellas:** Amarillo neón (`#facc15`, `text-yellow-400`).
* **Intervención Admin:** Azul / Cian (`text-cyan-300`) para distinguir liberaciones o aprobaciones manuales.

---

## 3. Componentes Frontend Principales

### 3.1. Panel "Mi Progreso" (`ProgressScreen.tsx`)

Este componente muestra la trayectoria histórica y académica del estudiante.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 👤 Mi Progreso                                      ✨ LogicaKids Pro         │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🎮 Bloques trabajados   📈 Precisión promedio   ✅ Aciertos   🧭 Completitud │
│        12                      85%               142             78%         │
├──────────────────────────────────────────────────────────────────────────────┤
│ PROGRESO POR FASE, MÓDULO Y BLOQUE                                           │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Fase 2 — Desarrollo Numérico                                             │ │
│ │   Módulo 1 — Gimnasio Numérico Mental                                    │ │
│ │   Nivel 2 — Jerarquía      Precisión 92% | Completitud 100% | APROBADO   │ │
│ │   Origen: Automático por desempeño                                       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Fase 2 — Desarrollo Numérico                                             │ │
│ │   Módulo 3 — Tienda Matemática                                           │ │
│ │   Nivel 1 — Reconozco Dinero   Estado: EN PROGRESO                       │ │
│ │   Origen: Liberado por administrador                                     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. KPIs principales

El panel debe mostrar métricas calculadas por el backend o agregadas desde datos confiables:

* **Bloques trabajados:** cantidad de bloques con intentos o progreso registrado.
* **Precisión promedio:** promedio ponderado de `porcentaje_actual` o histórico de intentos.
* **Respuestas correctas:** sumatoria de aciertos registrados.
* **Completitud promedio:** avance promedio por bloque.
* **Bloques aprobados:** total de estados `APROBADO`.
* **Bloques liberados por admin:** total de bloques con `desbloqueado_por_admin = true` y `aprobado_por_admin = false`.
* **Bloques aprobados por admin:** total de bloques con `aprobado_por_admin = true`.

### 3.3. Acordeón de progreso académico

El acordeón principal se organiza por:

1. Fase.
2. Módulo.
3. Bloque académico: nivel de práctica libre o desafío.

Cada bloque debe mostrar:

* título de fase;
* nombre de módulo;
* nombre de nivel o desafío;
* `fase_id`, `modulo_id`, `nivel_id`, `desafio_id` y `seccion` como metadatos técnicos internos;
* precisión (`porcentaje_actual`);
* completitud (`completitud_actual`);
* estado (`BLOQUEADO`, `EN_PROGRESO`, `APROBADO`);
* origen del estado: automático, liberado por admin, aprobado por admin, bloqueado por admin o restablecido por admin;
* fecha de última actividad;
* indicadores visuales de Bucle Espejo, Rescate o Early Exit si aplican.

### 3.4. Visualización de intervención manual

Cuando un bloque fue intervenido por administrador, el panel debe mostrarlo de forma explícita y transparente:

```text
Estado: APROBADO
Origen: Aprobado manualmente por administrador
Motivo: Evaluación diagnóstica externa
Fecha: 25/05/2026
```

O:

```text
Estado: EN PROGRESO
Origen: Liberado por administrador
Motivo: Alumno ingresó con nivel intermedio
```

Esto evita confundir una aprobación manual con una aprobación obtenida por ejecución dentro de la plataforma.

### 3.5. Historial de intentos

El historial se alimenta de la tabla `intentos` y de resúmenes derivados del backend. Debe mostrar:

* fecha;
* fase;
* módulo;
* nivel o desafío;
* operación;
* respuesta dada, solo si la política de privacidad lo permite;
* resultado correcto/incorrecto sin exponer `es_correcta` en payloads de preguntas activas;
* tipo de error;
* feedback mostrado;
* tiempo de respuesta.

El alumno no debe poder eliminar físicamente registros académicos. Si se permite ocultar un intento en la vista del alumno, debe usarse una marca visual como `oculto_para_alumno = true`, sin borrar `intentos` ni `ProgresoMaestria`.

---

## 4. Pantalla de Resultados de Sesión (`ResultsScreen.tsx`)

Muestra feedback inmediato al finalizar una sesión de práctica o desafío. Debe renderizar según el estado devuelto por el backend, no según cálculos locales del frontend.

### 4.1. Estados pedagógicos soportados

La pantalla debe contemplar:

* `APROBADO`: mostrar trofeo, resumen positivo y botón para continuar al bloque indicado por backend.
* `NO_APROBADO`: mostrar refuerzo, errores principales y opción de reintentar.
* `EN_PROGRESO`: mostrar avance parcial, completitud y continuar.
* `EARLY_EXIT`: mostrar interrupción por límite de errores y regreso seguro al dashboard.
* `RESCATE_COMPLETADO`: mostrar avance de entrenamiento sin tratarlo como evaluación estricta.
* `BLOQUEADO`: mostrar que el bloque no está disponible.
* `ADMIN_UNLOCK`: mostrar que el bloque fue liberado por administrador.
* `ADMIN_APPROVE`: mostrar que el bloque fue aprobado por administrador.

### 4.2. Métricas de sesión

* **Precisión:** porcentaje de aciertos.
* **Completitud:** porcentaje del bloque completado.
* **Aciertos vs fallos:** conteo de respuestas.
* **Tiempos:** promedio y total.
* **Tipos de error:** agrupación por `tipo_error`.
* **Modo de tutoría:** `normal`, `bucle_espejo` o `rescate`.
* **Resultado backend:** estado final calculado por el servidor.

### 4.3. Acciones de continuidad

Los botones no deben modificar progreso directamente. Solo navegan a rutas o sesiones indicadas por el backend.

* **Continuar:** navega al siguiente bloque disponible informado por el backend.
* **Reintentar:** solicita al backend iniciar una nueva sesión del mismo bloque.
* **Volver al mapa:** regresa al mapa de fases.
* **Ver explicación:** muestra Tutor IA o feedback del bloque.

No debe existir lógica como:

```typescript
if (score >= passingScore) {
  service.unlockLevel(category, nextLevel);
}
```

---

## 5. Modelo de Datos de Analíticas

La sincronización de datos de progreso se rige por estructuras tipadas de lectura. Estas estructuras representan datos ya procesados por el backend.

### 5.1. Interfaz `AcademicBlockProgress`

```typescript
export interface AcademicBlockProgress {
  fase_id: number;
  fase_titulo: string;
  modulo_id: number;
  modulo_titulo: string;
  nivel_id?: number | null;
  nivel_titulo?: string | null;
  desafio_id?: number | null;
  desafio_titulo?: string | null;
  seccion: number;
  operacion: 'suma' | 'resta' | 'multiplicacion' | 'division' | 'mixta';

  estado: 'BLOQUEADO' | 'EN_PROGRESO' | 'APROBADO';
  porcentaje_actual: number;
  completitud_actual: number;
  aciertos_acumulados: number;
  intentos_totales: number;

  desbloqueado_por_admin: boolean;
  aprobado_por_admin: boolean;
  override_tipo?: 'unlock' | 'approve' | 'lock' | 'reset' | null;
  override_motivo?: string | null;
  override_fecha?: string | null;

  ultimo_intento_at?: string | null;
  siguiente_bloque_disponible?: boolean;
}
```

### 5.2. Interfaz `StudentAttemptSummary`

```typescript
export interface StudentAttemptSummary {
  id: string;
  alumno_id: string;
  session_id: string;

  fase_id: number;
  modulo_id: number;
  nivel_id?: number | null;
  desafio_id?: number | null;
  seccion: number;
  operacion: 'suma' | 'resta' | 'multiplicacion' | 'division' | 'mixta';

  porcentaje: number;
  completitud: number;
  aciertos: number;
  errores: number;
  intentos_totales: number;
  tiempo_promedio_segundos: number;

  tipo_pool: 'practica' | 'desafio';
  estado_resultado:
    | 'APROBADO'
    | 'NO_APROBADO'
    | 'EN_PROGRESO'
    | 'EARLY_EXIT'
    | 'RESCATE_COMPLETADO'
    | 'ADMIN_UNLOCK'
    | 'ADMIN_APPROVE';

  fecha_inicio: string;
  fecha_fin: string;
}
```

### 5.3. Interfaz `ProgressSummary`

```typescript
export interface ProgressSummary {
  alumno_id: string;
  total_bloques_trabajados: number;
  total_bloques_aprobados: number;
  total_bloques_liberados_admin: number;
  total_bloques_aprobados_admin: number;
  precision_promedio: number;
  completitud_promedio: number;
  total_aciertos: number;
  total_errores: number;
  tiempo_total_segundos: number;
}
```

---

## 6. Endpoints de Sincronización

El frontend consume endpoints de alumno normalizados bajo `/api/me`. Estos endpoints son de lectura o de inicio/consulta de sesión; no desbloquean niveles directamente desde el cliente.

### 6.1. Progreso y resumen

```text
GET /api/me/progress/summary
GET /api/me/progress/blocks
GET /api/me/progress/history
GET /api/me/progress/history?fase_id={fase_id}&modulo_id={modulo_id}&nivel_id={nivel_id}
```

### 6.2. Resultados de sesión

```text
GET /api/me/results/{session_id}
```

Devuelve el resultado pedagógico ya resuelto por el backend.

### 6.3. Tutor IA

```text
GET /api/me/tutor-analysis/summary
GET /api/me/tutor-analysis?fase_id={fase_id}&modulo_id={modulo_id}&nivel_id={nivel_id}&desafio_id={desafio_id}
```

El análisis debe considerar fase, módulo, nivel, desafío, `tipo_error`, historial de intentos y estado del bloque.

### 6.4. Sesiones de juego

```text
POST /api/fases/{fase_id}/sessions/start
POST /api/fases/{fase_id}/responder
POST /api/fases/{fase_id}/cerrar-rescate
GET  /api/fases/{fase_id}/sessions/{session_id}/status
```

El backend usa estas rutas para evaluar respuestas, actualizar `intentos`, actualizar `ProgresoMaestria` y resolver avance académico.

### 6.5. Endpoints prohibidos en el frontend del alumno

El Panel de Estadísticas no debe usar endpoints legacy como:

```text
POST   /scores
GET    /scores?user={username}
DELETE /scores/{scoreId}
PATCH  /users/me/progress/level
GET    /ai/analyze/{category}
```

Tampoco debe existir una función tipo `unlockLevel()` disponible para el frontend del alumno.

---

## 7. Lógica Correcta de Flujo de Juego y Progresión

Cuando un estudiante finaliza una sesión, el frontend no decide si aprobó. El backend ya debe haber procesado cada respuesta o debe procesar el cierre de sesión.

### 7.1. Flujo correcto

```mermaid
graph TD
    A["1. Alumno responde en GameScreen"] --> B["2. Frontend envía respuesta al backend"]
    B --> C["3. Backend valida respuesta y registra intento"]
    C --> D["4. Backend actualiza ProgresoMaestria"]
    D --> E{"5. ¿Debe activar Bucle Espejo, Rescate o Early Exit?"}
    E -->|Sí| F["6. Backend devuelve estado pedagógico específico"]
    E -->|No| G{"7. ¿Cumple completitud y precisión?"}
    G -->|Sí| H["8. Backend aprueba y desbloquea siguiente bloque"]
    G -->|No| I["9. Backend mantiene EN_PROGRESO o NO_APROBADO"]
    F --> J["10. Frontend renderiza resultado"]
    H --> J
    I --> J
```

### 7.2. Condiciones de aprobación automática

El backend debe evaluar al menos:

* `completitud_actual >= completitud_requerida`;
* `porcentaje_actual >= porcentaje_aprobacion`;
* ausencia de condición de `EARLY_EXIT`;
* estado válido de sesión;
* reglas del bloque según `modo_tutoria`;
* configuración resuelta por cascada.

### 7.3. Intervención manual ya aplicada

Si el alumno tiene un bloque liberado o aprobado por administrador, el panel debe mostrarlo, no recalcularlo.

Ejemplo:

```json
{
  "estado": "APROBADO",
  "porcentaje_actual": 90,
  "completitud_actual": 100,
  "aprobado_por_admin": true,
  "override_tipo": "approve",
  "override_motivo": "Alumno evaluado presencialmente."
}
```

---

## 8. Tutor IA LogicaKids

El Tutor IA debe consumir datos ya autorizados por el backend. No debe inferir aprobación ni desbloqueo.

Debe analizar:

* fase;
* módulo;
* nivel o desafío;
* operación;
* historial de intentos;
* tipos de error;
* tiempos de respuesta;
* completitud;
* precisión;
* si hubo Bucle Espejo;
* si hubo Rescate;
* si hubo Early Exit;
* si el bloque fue liberado o aprobado por administrador.

Cuando el progreso proviene de intervención manual, el Tutor IA debe evitar decir que el alumno "jugó y aprobó". Debe comunicar que el bloque fue habilitado o aprobado por decisión pedagógica del administrador.

---

## 9. Reglas de Seguridad y Coherencia

* El frontend del alumno no calcula aprobación.
* El frontend del alumno no desbloquea niveles.
* El frontend del alumno no gradúa fases.
* El frontend del alumno no elimina físicamente registros académicos.
* El frontend solo muestra estados devueltos por el backend.
* `ProgresoMaestria` es la fuente de verdad del progreso.
* `intentos` es la fuente de verdad del histórico de respuestas.
* Las intervenciones manuales del administrador deben mostrarse con origen, motivo y fecha.
* Los botones de continuidad solo navegan hacia rutas o bloques indicados por el backend.
* Las métricas visuales pueden calcularse localmente solo para animaciones, pero no para modificar progreso real.

---

## 10. Pruebas y Validación Manual del Panel

### 10.1. Flujo de lectura de progreso

* Entrar a "Mi Progreso".
* Verificar que se llame `GET /api/me/progress/summary`.
* Verificar que se llame `GET /api/me/progress/blocks`.
* Confirmar que los bloques se agrupen por fase, módulo y nivel/desafío.

### 10.2. Validación de no desbloqueo desde frontend

* Finalizar una sesión con score alto.
* Confirmar que no exista llamada a `PATCH /users/me/progress/level`.
* Confirmar que no exista función `unlockLevel()` ejecutada desde el frontend.
* Confirmar que el siguiente bloque aparece solo si el backend lo devolvió como disponible.

### 10.3. Validación de completitud y precisión

* Simular una sesión con 100% de precisión pero 60% de completitud.
* Confirmar que el frontend no apruebe el bloque localmente.
* Confirmar que se muestre `EN_PROGRESO` si así lo devuelve el backend.

### 10.4. Validación de intervención manual

* Desde el panel admin, liberar un bloque para un alumno.
* Entrar como alumno y verificar que el bloque aparezca como disponible con origen `Liberado por administrador`.
* Desde el panel admin, aprobar un bloque para un alumno.
* Entrar como alumno y verificar que aparezca como `APROBADO` con origen `Aprobado manualmente por administrador`.
* Confirmar que se muestre motivo y fecha si el backend los devuelve.

### 10.5. Validación de historial

* Confirmar que el alumno no pueda borrar físicamente intentos.
* Confirmar que cualquier opción de ocultar no elimine registros de `intentos` ni `ProgresoMaestria`.

---

## 11. Resumen de cambio respecto al modelo legacy

El modelo anterior basado en `ScoreRecord`, `CategoryProgress`, `/scores`, `category`, `difficulty` y `unlockLevel()` queda reemplazado por un modelo server-authoritative basado en:

* `ProgresoMaestria`;
* `intentos`;
* `AcademicBlockProgress`;
* `StudentAttemptSummary`;
* endpoints `/api/me/...`;
* estados pedagógicos resueltos por backend;
* visualización explícita de intervenciones administrativas.
