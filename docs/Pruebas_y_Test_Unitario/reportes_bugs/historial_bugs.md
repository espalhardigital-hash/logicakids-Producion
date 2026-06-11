# 📚 Historial de Bugs y Soluciones — LogicaKids

Este archivo es la **base de conocimiento acumulativa** de todos los bugs encontrados
y resueltos durante las pruebas E2E. Cuando un problema se repite o uno similar aparece,
consulta este historial para encontrar rápidamente la solución.

> **Uso:** Busca por palabras clave (ej: "ChunkLoadError", "login", "bloqueo") para
> encontrar soluciones previas relevantes.

---


## ✅ BUG-05CLEANUP-EMAIL-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
En múltiples suites de pruebas (`05-progresion-desbloqueo.spec.ts`, `06-gameplay-fase2.spec.ts`, `07-gameplay-fase3.spec.ts`, `08-gameplay-fase4.spec.ts`, `09-gameplay-fase5.spec.ts`, `10-gameplay-fase6.spec.ts`), la función de limpieza `clearTestUserProgress` borraba los intentos del alumno usando un nombre de alumno fijo `usuario_prueba` en la base de datos PostgreSQL. Al ejecutar los tests con un usuario de prueba dinámico (`TEST_EMAIL="pruebas_automaticas_2@gmail.com"`), el progreso no se borraba correctamente, causando fugas de estado (state leakage) y fallos en cascada en las aserciones de progresión de la suite 5.

### Solución Aplicada
Se reescribió `clearTestUserProgress` en los 6 spec files para resolver dinámicamente el `alumno_id` a partir del email configurado en la variable de entorno `TEST_EMAIL` (por defecto `pruebas_automaticas_2@gmail.com`), permitiendo limpiar correctamente los intentos del usuario activo.

### Archivos Modificados
- `docs/Pruebas_y_Test_Unitario/tests/05-progresion-desbloqueo.spec.ts`
- `docs/Pruebas_y_Test_Unitario/tests/06-gameplay-fase2.spec.ts`
- `docs/Pruebas_y_Test_Unitario/tests/07-gameplay-fase3.spec.ts`
- `docs/Pruebas_y_Test_Unitario/tests/08-gameplay-fase4.spec.ts`
- `docs/Pruebas_y_Test_Unitario/tests/09-gameplay-fase5.spec.ts`
- `docs/Pruebas_y_Test_Unitario/tests/10-gameplay-fase6.spec.ts`

---

## ✅ BUG-08FASE4-RACE-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
En el test `08-gameplay-fase4.spec.ts`, al resolver las preguntas interactivas de fracciones y porcentajes (donde se seleccionan porciones de pizza o cuadrículas), el test hacía clic en el botón "CONFIRMAR" de manera inmediata tras realizar el clic en las porciones. Debido al tiempo de procesamiento del estado de React (`interactiveSelectedCount`), la interfaz a veces registraba el envío de la respuesta antes de actualizar completamente el estado, provocando un fallo en la validación localizadora del test.

### Solución Aplicada
Se añadió una espera de seguridad de 300 ms (`await page.waitForTimeout(300)`) entre la selección de las porciones y el clic en el botón "CONFIRMAR" en los helpers `submitCorrectAnswer` y `failCurrentQuestion` para asegurar que el estado de React se haya sincronizado correctamente en el DOM antes del envío.

### Archivos Modificados
- `docs/Pruebas_y_Test_Unitario/tests/08-gameplay-fase4.spec.ts`

---

## ✅ BUG-13adminpan-20260610164236-2YLZ

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10T16:42:14.812Z |
| **Fecha resolución** | 2026-06-10T16:42:50Z |
| **Estado** | 🟢 RESUELTO |

### Problema
El test `ADMIN puede crear una pregunta en ContentTab (Fase 4) y USER puede jugarla` fallaba porque la Fase 4 aparecía bloqueada al intentar ingresar como un usuario normal. Esto ocurría porque la API de usuario `/users/me` recalcula dinámicamente la `fase_actual_id` de los alumnos basada en su progreso completado real (el cual era 0 para el nuevo usuario). El backend incluye un bypass para evitar este recálculo para usuarios de pruebas automáticas, pero el nuevo usuario `pruebas_automaticas_2` no estaba incluido en la lista.

### Solución Aplicada
Se añadió el nombre de usuario `"pruebas_automaticas_2"` al listado de exclusión/bypass de recálculo de fase en `backend/app/services/pedagogia_service.py` y se reconstruyó la imagen de Docker del backend local para aplicar el cambio.

### Archivos Modificados
- `LogicaMath/backend/app/services/pedagogia_service.py`
---

## ✅ BUG-FASEMETADATA-TYPO-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
Inconsistencia en `faseMetadata.ts` en el Nivel 2 del Módulo 4 de la Fase 7, donde la clave de datos estaba nombrada como `examples:` en lugar de `ejemplos:`. Esto causaba un error en tiempo de ejecución mostrando la interfaz de fallback "No hay ejemplos...".

### Solución Aplicada
Se corrigió la clave del objeto de metadatos a `ejemplos:`.

### Archivos Modificados
- `LogicaMath/frontend/components/fase_generic/faseMetadata.ts`

---

## ✅ BUG-11GAMEPLAY-E2E-THEORY-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
Las pruebas automatizadas de gameplay `11-gameplay-fase7-8.spec.ts` y `12-gameplay-fase9.spec.ts` fallaban tras la introducción del modal interactivo de teoría, ya que no sabían cómo interactuar con el flujo de diapositivas de teoría y resolver los ejercicios interactivos del modal.

### Solución Aplicada
Se actualizaron los tests E2E para simular clics en "Siguiente", rellenar y verificar respuestas de los ejercicios interactivos del modal, y finalizar con un clic en "¡Entendido, empezar!".

### Archivos Modificados
- `docs/Pruebas_y_Test_Unitario/tests/11-gameplay-fase7-8.spec.ts`
- `docs/Pruebas_y_Test_Unitario/tests/12-gameplay-fase9.spec.ts`

---

## ✅ BUG-13ADMINPANEL-TEARDOWN-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
La prueba `13-admin-panel.spec.ts` fallaba en la limpieza posterior (`afterAll`) por violaciones de clave foránea en la base de datos al intentar eliminar la pregunta de prueba directamente de la tabla `preguntas` mientras existían registros dependientes en `intentos`, `intento_preguntas` y `pool_asignado_alumno`.

### Solución Aplicada
Se modificó el hook `afterAll` para eliminar en cascada y en orden correcto los registros dependientes de las tablas relacionadas antes de proceder con el borrado de la pregunta en la tabla principal `preguntas`.

### Archivos Modificados
- `docs/Pruebas_y_Test_Unitario/tests/13-admin-panel.spec.ts`

---

## ✅ BUG-05PROGRESS-CLEANUP-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
Falsos positivos y fallos intermitentes en la suite de progresión `05-progresion-desbloqueo.spec.ts` debido a estados de progreso residuales en la base de datos para el usuario de pruebas procedentes de ejecuciones anteriores.

### Solución Aplicada
Se integró un hook `beforeEach` que realiza una limpieza completa del progreso del usuario de pruebas en la base de datos antes de cada caso de prueba.

### Archivos Modificados
- `docs/Pruebas_y_Test_Unitario/tests/05-progresion-desbloqueo.spec.ts`

---

## ✅ IMPLEMENTACION-BARRA-PROGRESO-FASES-2-8

| Campo | Valor |
|---|---|
| **Fecha inicio** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 COMPLETADO |

### Problema
Ausencia de la Barra de Progreso General de la Fase en los hubs de bienvenida de las Fases 2, 3, 4, 5, 6, 7 y 8. El diseño inicial requería esta barra para mostrar el progreso global antes de desbloquear el Desafío final.

### Solución Aplicada
Se implementó la Barra de Progreso General con porcentaje acumulado, barra animada mediante `framer-motion` y sub-barras flexibles por módulo (con clase `flex-1`) condicionado a que el desafío final esté bloqueado.

### Archivos Modificados
- `LogicaMath/frontend/components/fase2/WelcomeScreenPhase2.tsx`
- `LogicaMath/frontend/components/fase3/WelcomeScreenPhase3.tsx`
- `LogicaMath/frontend/components/fase4/WelcomeScreenPhase4.tsx`
- `LogicaMath/frontend/components/fase5/WelcomeScreenPhase5.tsx`
- `LogicaMath/frontend/components/fase6/WelcomeScreenPhase6.tsx`
- `LogicaMath/frontend/components/fase_generic/WelcomeScreenPhaseGeneric.tsx`

---

## ✅ IMPLEMENTACION-SEPARACION-WELCOME-FASES-7-9

| Campo | Valor |
|---|---|
| **Fecha inicio** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 COMPLETADO |

### Problema
Las Fases 7, 8 y 9 no contaban con archivos de pantalla de bienvenida individuales (utilizaban una pantalla genérica compartida `WelcomeScreenPhaseGeneric`), a diferencia de las fases anteriores (1-6) que poseen sus propios componentes dedicados.

### Solución Aplicada
Se crearon componentes dedicados e individuales para cada fase:
1. `WelcomeScreenPhase7.tsx` en `frontend/components/fase7/`
2. `WelcomeScreenPhase8.tsx` en `frontend/components/fase8/`
3. `WelcomeScreenPhase9.tsx` en `frontend/components/fase9/`
Se configuraron las rutas independientes en `App.tsx` (`/welcome-fase7`, `/welcome-fase8` y `/welcome-fase9`), se actualizó la navegación en el mapa de fases y en la pantalla de juego genérica, y se ajustó la suite de pruebas E2E `02-navegacion-fases.spec.ts` para testear cada pantalla de bienvenida por separado.

### Archivos Modificados
- `LogicaMath/frontend/App.tsx`
- `LogicaMath/frontend/components/fase7/WelcomeScreenPhase7.tsx`
- `LogicaMath/frontend/components/fase8/WelcomeScreenPhase8.tsx`
- `LogicaMath/frontend/components/fase9/WelcomeScreenPhase9.tsx`
- `LogicaMath/frontend/components/fase_generic/FaseGenericGameScreen.tsx`
- `docs/Pruebas_y_Test_Unitario/helpers/constants.ts`
- `docs/Pruebas_y_Test_Unitario/tests/02-navegacion-fases.spec.ts`

---

## ✅ BUG-E2E-FALLBACK-EMAIL-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
Todos los tests de gameplay (Fase 2, Fase 4, Fase 7, Fase 8, Fase 9, Panel Admin) fallaban de forma aleatoria (Timeouts, elementos bloqueados) porque los scripts SQL de actualización previa usaban un fallback de email hardcodeado a `prueba@gmail.com`. Como en constants.ts el usuario de prueba E2E es `pruebas_automaticas_2@gmail.com`, las bases de datos no asignaban correctamente los permisos de ADMIN ni el progreso, dejando los módulos bloqueados en la UI.

### Solución Aplicada
Se reemplazó el correo de fallback en todos los archivos `.spec.ts` usando un script, asegurando que las inyecciones SQL que otorgan rol ADMIN modifiquen al usuario correcto.

### Archivos Modificados
- `docs/Pruebas_y_Test_Unitario/tests/*.spec.ts`

---

## ✅ BUG-UI-FASE7-FASE8-THEORY-20260610

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10 |
| **Fecha resolución** | 2026-06-10 |
| **Estado** | 🟢 RESUELTO |

### Problema
Al iniciar los niveles en la Fase 7 y 8, la interfaz teórica (Diccionario, ejemplos, interactivos) no se mostraba y la app fallaba o saltaba la lectura. El componente `FaseGenericGameScreen` invocaba a `FaseGenericTheoryModal` sin enviarle los props obligatorios (`moduloId`, `moduloNombre`, `nivelId`, `moduleColor`, `onClose`).

### Solución Aplicada
Se inyectaron los props correctos en `<FaseGenericTheoryModal>` dentro de `FaseGenericGameScreen.tsx`, garantizando que todas las fases genéricas presenten la introducción teórica interactiva, en paridad con la Fase 2.

### Archivos Modificados
- `LogicaMath/frontend/components/fase_generic/FaseGenericGameScreen.tsx`
