# 🛡️ Reporte de Pruebas Lógicas y E2E — Fase 2 (Desarrollo Numérico)

**Fecha de Ejecución:** 2026-06-09  
**Entorno:** 100% Local (Docker compose + PostgreSQL + Redis + MinIO)  
**Usuario de Pruebas:** `prueba@gmail.com`  
**Resultado Global:** ✅ **3 Pruebas Pasadas (100% Éxito)**  

---

## 1. Resumen del Gameplay Testeado

Se implementó y ejecutó de forma exhaustiva una suite de pruebas de integración de punta a punta (E2E) con Playwright en `docs/Pruebas_y_Test_Unitario/tests/06-gameplay-fase2.spec.ts` que valida los flujos principales de juego en la **Fase 2**:

1. **Flujo de Práctica Libre (Módulo 1 - Gimnasio Mental):**
   - Transición del modal de teoría inicial (lectura de diapositivas).
   - Omitir splash screen de inicio.
   - Envío de respuesta correcta (Acierto) con auto-avance.
   - Envío de respuesta incorrecta (Fallo) que dispara el **Bucle Espejo (Mirror Loop)**.
   - Carga dinámica y resolución exitosa de la pregunta espejo (Mirror Question) y cierre del modal.

2. **Flujo de Preguntas Chained / Multi-Paso (Módulo 4 - Constructor de Soluciones):**
   - Entrada al módulo 4.
   - Validación del renderizado del constructor multi-paso (Paso 1 y Paso 2).
   - Envío de respuesta para el Paso 1, validación de feedback y avance.
   - Envío de respuesta final para el Paso 2, validación de acierto definitivo.

3. **Flujo de Desafío y Salida Temprana / Early Exit (Módulo 1 - Desafío):**
   - Carga del Desafío Estándar (Nivel 11).
   - Validación del temporizador en pantalla (`.f2-badge-timer`).
   - Envío sucesivo de respuestas incorrectas para agotar el límite de tolerancia de errores de forma dinámica.
   - Detección del **Modal de Salida Temprana (Early Exit)** al alcanzar el límite de fallas sin permitir continuar.
   - Retorno automático al Dashboard de la Fase 2 tras cerrar el modal.

---

## 2. Bugs Identificados y Corregidos en los Tests

Durante el diseño y ejecución de esta suite de pruebas, identificamos y aislamos varias condiciones de carrera y flujos conflictivos tanto en el diseño del frontend como en las interacciones E2E. A continuación se detallan las correcciones aplicadas:

### Bug 1: Duplicidad del Splash Screen Overlay en el DOM
* **Síntomas:** Error de Playwright por violación de modo estricto (`strict mode violation: locator resolved to 2 elements`) al intentar hacer clic en `.f2-start-splash-overlay`.
* **Causa:** En `Fase2GameScreen.tsx`, el overlay de inicio se renderiza dos veces por separado bajo la misma condición `showSplash`: una al inicio del `return` (línea 1082) y otra al final (línea 1506).
* **Solución/Workaround:** En la suite de pruebas se ajustó el localizador usando `.first()` (`page.locator('.f2-start-splash-overlay').first()`) para asegurar interactividad sin fallos.

### Bug 2: Fuga de Estado de Pasos Intermedios (Chained Questions)
* **Síntomas:** Al iniciar el test del Módulo 4, en ocasiones se gatillaba un Bucle Espejo (Mirror Modal) de forma inmediata al cargar la primera pregunta.
* **Causa:** En las preguntas multi-paso (chained), los pasos intermedios (como el Paso 1) se registran en la tabla `intentos` como fallidos hasta que se completa el Paso 2 de forma exitosa. Al recargar la pantalla, el backend detectaba este intento "incorrecto" residual y cargaba directamente la lógica de espejo.
* **Solución/Workaround:** Se implementó una función hook `clearTestUserProgress` ejecutada en el `beforeEach` de cada test, la cual ejecuta comandos SQL directos en el contenedor de base de datos local para limpiar todo historial en las tablas `intento_pasos`, `intento_preguntas`, `intentos` y `progreso_maestria` del usuario de pruebas.

### Bug 3: Condición de Carrera en Desafíos (Auto-Advance vs. Confirmación Manual)
* **Síntomas:** Los tests del Desafío fallaban aleatoriamente por elementos desconectados del DOM (`element was detached from the DOM`) o tiempos de espera agotados.
* **Causa:** En los desafíos de la Fase 2, un fallo inicia un temporizador automático del navegador de 1500ms para avanzar a la siguiente pregunta. Si el script de pruebas hacía clic en "Continuar" manualmente durante esa ventana de tiempo para avanzar más rápido, se generaban dos peticiones concurrentes de carga de pregunta (una por el clic y otra por el timeout residual no cancelado en React), causando que se cargaran dos preguntas consecutivas rápidamente y desestabilizara la interfaz.
* **Solución/Workaround:** Se refactorizó la prueba para esperar pasivamente a que el navegador realice su auto-avance natural (monitoreando si `currentQuestionId` cambia en Node gracias al listener de red). Si transcurren 2.4 segundos y el ID no cambia, significa que la tolerancia se agotó y se cargó el estado de **Early Exit** (el cual no auto-avanza), por lo que el test hace clic en "Continuar" manualmente para abrir el modal de Salida Temprana de forma determinista y segura.

### Bug 4: Incompatibilidad con Preguntas de Opción Múltiple (`MULTIPLE_OPCION`)
* **Síntomas:** Esperas agotadas (`TimeoutError`) buscando el selector de entrada de texto `.f2-hidden-input`.
* **Causa:** El test originalmente esperaba que el primer ejercicio fuera numérico y tuviera un input de texto. No obstante, si la primera pregunta cargada por el backend era de opción múltiple, el input de texto no se renderizaba, haciendo fallar el selector.
* **Solución/Workaround:** Se eliminó la dependencia de buscar el selector `.f2-hidden-input` al cargar la pantalla. En su lugar, se implementó un bucle de sondeo rápido en Node que espera a que la variable reactiva `currentQuestionId` sea poblada por el listener de red. Una vez cargada, se consulta el tipo de pregunta en base de datos para interactuar con los botones de opciones (`.f2-mc-option-btn`) o el input numérico según corresponda.

---

## 3. Mejoras Implementadas en la Suite

Para asegurar una ejecución estable y libre de falsos negativos en el entorno local de desarrollo, se aplicaron las siguientes implementaciones técnicas:
1. **Detección de Tipo de Pregunta Dinámica:** Los helpers `submitCorrectAnswer` y `failCurrentQuestion` consultan directamente la base de datos PostgreSQL local en tiempo real para determinar el tipo de pregunta (`MULTIPLE_OPCION` o `RESPUESTA_NUMERICA`) y su respuesta correcta, adaptando el comportamiento de Playwright sobre la marcha.
2. **Control de Flujo de Red Activo:** Se utiliza un listener de respuestas de red (`page.on('response', ...)`) interceptando la ruta `/api/fase2/modulo/` para capturar con precisión atómica el ID de la pregunta actual que tiene cargada el cliente.
3. **Limpieza Automatizada de Datos:** Asegura un estado idéntico (0 aciertos, 0 intentos, 0% maestría) para cada ejecución de test individual.

---

## 4. Recomendaciones de Código para el Frontend (UX/Desarrollo)

Para resolver definitivamente los bugs identificados en el código de producción de `Fase2GameScreen.tsx`, recomendamos realizar los siguientes cambios:

1. **Eliminar Splash Duplicado:**
   Remover el bloque `<AnimatePresence>` redundante ubicado en las líneas 1501-1588 de `Fase2GameScreen.tsx`. El primer bloque (línea 1075) es más que suficiente y está correctamente integrado en el flujo principal del componente.

2. **Limpiar el Temporizador de Avance en Desafíos:**
   Almacenar el `setTimeout` del avance automático en un `useRef` (ej. `advanceTimeoutRef.current`) y limpiarlo explícitamente (`clearTimeout`) al desmontar el componente o cuando el usuario hace clic manual en el botón de "Continuar" dentro de la función `handleSubmit`/`handleFeedbackClose`. Esto evitará peticiones duplicadas y problemas de DOM desincronizado si un usuario impaciente hace clic antes de los 1.5 segundos.
