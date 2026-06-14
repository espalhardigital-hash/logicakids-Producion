# Tomo 1: Documento Rector Pedagógico — LogicaKids Pro

> **Versión:** 4.0 (Consolidada) | **Última actualización:** 2026-06-08 | **Prioridad documental:** 1 (Máxima)

> Nota de autoridad documental: Este documento es la fuente principal de verdad pedagógica y conceptual de LogicaKids Pro. En caso de conflicto, prevalece primero este Documento Rector Conceptual, luego el Blueprint Técnico, luego el Manual del Administrador y finalmente la Guía UX/UI.

---

## 1. Principios Arquitectónicos y Pool de Preguntas

Todas las fases de LogicaKids Pro deben operar bajo un modelo de **Autoridad en el Servidor (Server-Authoritative)**. El frontend actúa únicamente como capa de renderizado interactiva; jamás calcula respuestas finales, ni controla la progresión, ni maneja estados de aprobación.

La fuente de verdad para el progreso académico es la tabla `ProgresoMaestria`. El objeto `user.settings["unlockedLevels"]` puede existir únicamente como espejo de compatibilidad visual para componentes heredados del frontend. Ninguna decisión de aprobación, bloqueo, desbloqueo o avance debe depender exclusivamente de `user.settings`.

### 1.1. Estrategia de Almacenamiento: Pool en Base de Datos

Para garantizar estabilidad, auditoría pedagógica previa y evitar latencia o fallos matemáticos en tiempo de ejecución, **se prohíbe la generación dinámica de preguntas en tiempo real por el backend durante la sesión del alumno**.

* **Modelo de Pool Precargado:** Todas las preguntas, variantes, respuestas correctas, distractores y feedbacks específicos de cada nivel deben estar previamente calculados, validados e insertados en tablas de PostgreSQL.
* **Estrategia de Purga y Reemplazo Limpio (Clean Purge & Overwrite):** Antes de proceder con la ejecución de cualquier script de sembrado de datos (`seed.py`), se debe purgar completamente la base de datos de los registros de la fase correspondiente (preguntas, alternativas, intentos, configuraciones de progreso y teoría). Esto evita la acumulación de datos huérfanos, inconsistentes, obsoletos o duplicados de ejecuciones previas.
* **Garantía de De-duplicación Absoluta:** Para mantener un modelo limpio y una experiencia de usuario diversa, el 100% de las preguntas precargadas en el pool deben ser únicas. Se prohíbe la inserción de preguntas idénticas (duplicados textuales) en un mismo nivel o desafío. Los generadores de semillas deben ampliar sus espacios de combinación aleatoria (parámetros numéricos, nombres de productos, etc.) para que todas las combinaciones resulten en enunciados únicos.
* **Certificación Lógica y Coherencia Matemática:** El pool de preguntas debe pasar por un proceso riguroso de auditoría offline antes del despliegue en producción. Cada enunciado matemático debe ser resuelto por un script analizador automático para certificar que la respuesta esperada almacenada en la base de datos es 100% correcta y matemáticamente coherente con el enunciado de la pregunta.
* **Consumo del Backend:** El servidor FastAPI se limita a consultar, filtrar y seleccionar de manera aleatoria controlada los ítems del pool preexistente para entregarlos al frontend.
* **Uso de Plantillas Estáticas:** Para problemas textuales o herramientas interactivas, los textos y estructuras se almacenan completamente renderizados o estructurados mediante objetos JSONB estáticos en la base de datos. No se deben generar variables nuevas al vuelo durante la sesión del alumno.

### 1.2. Modelo Server-Authoritative

El backend debe ser responsable de:

* seleccionar la pregunta;
* validar la respuesta;
* identificar el error;
* actualizar el contador de fallas;
* activar variantes espejo;
* activar el Bloque de Rescate;
* aplicar Early Exit;
* actualizar `ProgresoMaestria`;
* sincronizar, cuando sea necesario, el espejo visual `user.settings["unlockedLevels"]`.

El frontend debe ser responsable únicamente de:

* renderizar el estado entregado por el backend;
* capturar la interacción del alumno;
* enviar respuestas al servidor;
* mostrar feedbacks, modales y animaciones según el payload recibido.

### 1.2.B Prácticas de Ingeniería Backend de Alta Escalabilidad
* **Gestión de Ciclo de Vida (Lifespan):** Las inicializaciones de la aplicación FastAPI (como el test de conexión a base de datos o precarga de configuraciones) deben realizarse utilizando el gestor de contexto de vida moderno `@asynccontextmanager async def lifespan(app)`, descartando explícitamente los eventos obsoletos basados en cadenas como `@app.on_event("startup")` para garantizar compatibilidad técnica futura.
* **Optimización de Índices (GIN para JSONB):** Para mantener respuestas de API inferiores a `50ms` al escalar la cantidad de usuarios, toda estructura anidada almacenada en base de datos que se consulte en lógicas encadenadas o Tutor Invisible (ej. `mapeo_errores`, `datos_numericos` en base a reglas de Bucle Espejo, o `settings` de usuario) debe forzosamente:
  1. Utilizar el tipo de columna estricto `JSONB` en PostgreSQL (se prohíbe el tipo `JSON` plano debido a su incompatibilidad con la indexación profunda).
  2. Tener implementados **índices de tipo GIN (Generalized Inverted Index)**.
  3. Los índices GIN deben construirse mediante el modificador `CONCURRENTLY` (en SQL raw sin transacciones) para no bloquear las tablas de producción durante su construcción.

---

## 1.3. Prohibición de Datos Mock en Pantallas de Fase (Producción)

Todos los componentes de pantalla de fase del frontend (ej. `WelcomeScreenPhase2.tsx`, y cualquier equivalente para Fase 3, 4, 5, etc.) **tienen prohibido mostrar datos estáticos de prueba (`MOCK_DATA`, `MOCK_DASHBOARD`, etc.) ante errores de red o del backend**.

* **Riesgo documentado:** Si un componente de pantalla de fase captura un error del backend (por ejemplo, un `HTTP 500` causado por una columna faltante en la base de datos) y responde cargando datos de prueba predeterminados, el alumno verá un progreso ficticio que no refleja su situación real. Esto puede generar confusión, diagnósticos erróneos y pérdida de confianza en la plataforma.
* **Comportamiento obligatorio:** Ante cualquier error de llamada a la API (timeout, error de red, HTTP 4xx/5xx), el componente **debe**:
  1. Establecer el estado de error (`setError(mensajeDescriptivo)`).
  2. Dejar el dashboard en `null`.
  3. Mostrar la **pantalla de error con botón "Reintentar"** ya existente en el componente.
  4. Registrar el error en `console.error()` con el contexto completo.
* **Prohibición de Datos Estáticos (Mocks) en Todas las Fases:** Ninguna fase (ya sea Fase 7, Fase 8, Fase 9 o futuras) debe operar bajo el supuesto de "mocks" (datos simulados) cuando falta el backend. Toda la información, tanto para preguntas normales como para Simulados (Fase 9), DEBE provenir siempre de la Base de Datos a través de los endpoints de la API correspondientes.
* **Los datos mock (`MOCK_DASHBOARD`, etc.) solo son válidos** en herramientas de desarrollo aisladas, storybooks o scripts de prueba desconectados del backend real. Nunca deben estar activos en un componente que ya tiene conexión a la API.
* **Criterio de aceptación:** En ninguna fase nueva se debe añadir código del tipo `catch (e) { setDashboard(MOCK_DATA); }` en componentes de producción.

---

## 2. Anatomía Estándar de un Módulo

Cada fase está compuesta por **módulos**, y cada módulo debe respetar el siguiente flujo de usuario inalterable:

1. **Fase de Aprendizaje Teórico:** Lectura fragmentada por niveles.
2. **Desbloqueo por Evocación:** Resolución obligatoria de 3 mini-retos numéricos sin temporizador.
3. **Práctica Libre:** Batería de preguntas con asistencia algorítmica mediante Bucle Espejo.
4. **Zona de Desafíos:** 3 niveles de evaluación con temporizador y reglas estrictas de expulsión por Early Exit. NOTA: En la Zona de Desafíos NO se revela la respuesta correcta, se avanza directamente descontando vidas o tiempo.

**Variante Especial: Modo Examen (Fase 9 y Simulados)**
Los "Simulados Pedro II" (y otras evaluaciones tipo examen) difieren del módulo estándar. Sus reglas son:
* **Cronómetro Global:** En lugar de tiempo por pregunta, existe un tiempo global (ej. 25-35 minutos para toda la batería).
* **Navegación Libre:** El alumno puede moverse entre preguntas, marcarlas "Para revisión" y cambiar sus respuestas usando una cuadrícula/grid visual.
* **Ausencia de Feedback Inmediato:** No hay "Bucle Espejo" ni alertas tempranas de error.
* **Validación al Entregar:** Las respuestas se evalúan en lote únicamente al momento de hacer clic en "Entregar Examen", invocando el modelo Server-Authoritative del backend para producir los resultados en una "Clínica de Errores".

---

## 3. Estructura Interna de un Nivel de Aprendizaje y Práctica

Cada nivel dentro de un módulo sirve para aislar un microconcepto antes de integrarlo. Debe diseñarse con los siguientes componentes.

### 3.1. Teoría Pre-renderizada: Carrusel Interactivo de Flashcards

Toda la carga teórica de un nivel se almacena de forma pre-renderizada en base de datos y se presenta al alumno mediante un **Carrusel Interactivo de Flashcards de 3 pasos**. Esto fragmenta la información para no saturar al estudiante y asegura que la teoría sea activa, no pasiva.

#### Paso 1: Introducción y Superpoder

* **Mensaje de Bienvenida:** Tono motivacional, épico y centrado en el alumno.
* **Declaración de Superpoder:** Presenta el tema como una habilidad especial.
* **Cuerpo Teórico Concreto:** Explicación narrativa corta, conectando la lógica matemática con una historia, misión o metáfora.

#### Paso 2: Modelado y Práctica Guiada

* **Ejemplos Guiados (Mínimo 5):** Cada nivel de cada módulo en todas las fases debe garantizar **por lo menos 5 ejemplos guiados** completamente resueltos paso a paso para ofrecer una cobertura didáctica y una variedad de modelado óptima.
* **Resaltado y Formateado Premium de Palabras Clave:** En todos los enunciados de los ejemplos y en las explicaciones paso a paso, se deben resaltar los términos críticos y palabras clave utilizando la clase CSS `.keyword-highlight` (representada en la base de datos mediante la etiqueta HTML `<span class="keyword-highlight">palabra</span>`).
  * Esta clase CSS debe aplicar una línea de subrayado elegante (con `text-underline-offset: 3px`) y un cambio de color neón premium que hereda dinámicamente el color cromático del módulo via `--neon-accent-color` (o decae al color rosa neón de acento `#ff5e97`).
  * Para garantizar el correcto renderizado de estos estilos interactivos y evitar inyecciones crudas de texto, el frontend debe renderizar los enunciados y explicaciones de los ejemplos del carrusel utilizando el método seguro de React `dangerouslySetInnerHTML`.
* **Interactivos Pre-evaluativos:** Bloque obligatorio de 3 preguntas de evocación con `input` vacío.
* **Retroalimentación Inmediata:**
  * En caso de acierto, se muestra `feedback_acierto`.
  * En caso de error, se muestra `feedback_error`.
  * El alumno no debe poder avanzar al Paso 3 hasta responder correctamente los interactivos.

#### Paso 3: Trampa y Consolidación

* **Bloque de Advertencia:** Exposición explícita de la debilidad o error más común.
* **Diccionario del Nivel:** Lista estructurada que traduce términos narrativos a operadores matemáticos.
* **Pantalla de Lanzamiento (Launch Animation):** Momento de transición motivacional antes de la práctica. Debe incluir un **Emoji Vectorial Animado** (ej: 🚀) con movimiento de flotación, **Efecto de Celebración** con destellos pulsantes (✨) y un **Botón de Acción Pulsante**.
* **Llamado a la Acción:** Botón final "¡Entendido, empezar!" que cierra el carrusel y libera la Batería de Práctica Libre.

---

## 4. Batería de Práctica Libre

La Práctica Libre es entrenamiento, no evaluación estricta. Su función es construir fluidez, seguridad y reconocimiento de patrones.

### 4.1. Formato de Interfaz

La práctica libre debe usar principalmente cuadros de texto (`input`) vacíos. Se prohíbe el uso de opciones múltiples en esta etapa, salvo que una fase específica justifique una interacción especial, porque el objetivo es eliminar el factor de adivinanza y obligar al alumno a realizar el proceso cognitivo completo.

Cuando una pregunta exige interacción textual, como subrayado o selección de datos relevantes, el frontend debe enviar IDs de tokens y no texto crudo.

Ejemplo:

```json
{
  "tokens_seleccionados": [2, 5]
}
```

Esta regla debe mapearse técnicamente en las tablas de práctica y/o desafíos mediante campos como `tokens_texto` y `tokens_correctos`, evitando que el backend compare texto libre que puede generar falsos negativos.
### 4.2. Sistema de Tutoría Avanzada: Bucle Espejo Progresivo (Exclusivo de Práctica Libre)

La Práctica Libre es un entorno de **entrenamiento y afianzamiento de conceptos**, no de evaluación. Por ello, **no lleva temporizador** y el alumno no debe ser bloqueado ni frustrado ante el error. Si el alumno responde incorrectamente, el sistema activa un bucle de aprendizaje dinámico de hasta 3 variantes espejo consecutivas y revela de forma inmediata la respuesta esperada:

1. **Primera Falla: Pregunta Original → Variante Espejo 1**  
   El servidor congela el avance de la barra, registra el intento fallido, **muestra automáticamente la respuesta que era correcta** en pantalla y entrega feedback del Tutor Invisible. Inmediatamente inyecta la **Variante Espejo 1**.  
   *Regla de Integridad de Datos:* Las fallas cometidas dentro de las variantes espejo **no penalizan el contador de errores visual ni reducen el porcentaje de precisión** del alumno; se consideran parte del proceso de aprendizaje seguro.
2. **Segunda Falla: Variante Espejo 1 → Variante Espejo 2**  
   Si el alumno vuelve a fallar en la primera variante, se repite el proceso: **se revela la respuesta que era correcta**, se muestra el feedback visual del Tutor Invisible e inyecta la **Variante Espejo 2**.
3. **Tercera Falla: Variante Espejo 2 → Variante Espejo 3**  
   Si el error persiste, se le muestra nuevamente la respuesta que era correcta y se le otorga una última oportunidad con la **Variante Espejo 3**.
4. **Cuarta Falla Consecutiva (Variante Espejo 3 Errada): Activación de la Explicación y Bypass de Avance**  
   Si el alumno falla por cuarta vez dentro de la misma familia, el sistema asume un bloqueo conceptual severo. En ese instante, se activa el **Bloque de Rescate y Explicación Teórica** en pantalla. Tras visualizar el porqué y cómo de la resolución, el alumno hace clic en "Continuar" y **avanza inmediatamente a la siguiente familia de preguntas**, disolviendo toda frustración sin atascarlo con el mismo reto.

### 4.3. Filosofía de la Variante Espejo

Ante un error en la práctica, el alumno jamás debe ser castigado con un problema de estructura completamente nueva que le exija reiniciar su mapa mental. La variante espejo lo enfrenta al mismo concepto, con la misma estructura gramatical o sintáctica y la misma secuencia de operaciones.

Al mantener una estructura casi idéntica, el alumno se familiariza con el patrón visual del problema, reduce la carga cognitiva, procesa la respuesta correcta revelada y enfoca su energía en aplicar el feedback recibido en el siguiente intento inmediato.

### 4.4. Soporte Unificado para Entrada de Decimales
En los módulos y niveles que involucren operaciones monetarias, fracciones o valores de coma flotante, los sistemas de entrada de datos (tanto el teclado físico como los teclados virtuales en pantalla) deben dar soporte de compatibilidad absoluto para los separadores decimales:
* **Entrada de datos flexible:** Los cuadros de texto e inputs de respuestas deben aceptar tanto el punto decimal (`.`) como la coma decimal (`,`) de forma fluida. La expresión de validación regular en JS/TS recomendada es `/^[0-9,.\-]*$/`.
* **Teclado en pantalla coherente:** Las teclas de separadores en los teclados numéricos virtuales deben mostrar de manera unificada el punto (`.`) en lugar de la coma, facilitando la familiarización de los estudiantes con las notaciones numéricas universales.

### 4.5. Botón de Confirmación Inline Obligatorio
Para asegurar consistencia visual y accesibilidad táctil, se prohíbe depender únicamente de la tecla del teclado virtual o del teclado físico para enviar respuestas:
* **Botón en la Tarjeta:** Toda tarjeta de pregunta (`.f2-question-card` o equivalente) debe contener un botón inline visible de **"Confirmar"** que cambia a **"Continuar"** una vez procesada la respuesta.
* **Visibilidad Absoluta:** Las hojas de estilo globales no deben ocultar por defecto la clase de los botones confirmadores (`.f2-submit-btn` o equivalente) a través de propiedades `display: none` genéricas. Si un teclado numérico inyecta su propio botón, los botones de otros tipos de preguntas (como opción múltiple) deben seguir mostrándose de forma explícita y bella con interacciones fluidas en la tarjeta.

---

## 5. Bloque de Rescate Explicativo (Bypass Conceptual)

Si el alumno se equivoca por cuarta vez consecutiva (fallando la pregunta original y sus 3 variantes espejo), la batería de práctica despliega de forma obligatoria el **Bloque de Rescate**.

### 5.1. Reglas del Bloque de Rescate

* Toma el control de la pantalla mediante un modal prioritario o recuadro prioritario esmerilado (`glassmorphic`).
* **Revelación y Explicación Profunda:** Muestra la explicación teórica del concepto, el desglose paso a paso de la resolución de la pregunta y el *porqué* se llega a esa respuesta correcta.
* **Bypass de Avance Fluido:** **No exige una transcripción anti-spam ni una acción compleja de escritura**. El objetivo es la asimilación del error. El alumno lee la demostración conceptual, hace clic en el botón de confirmación `"¡Entendido, continuar!"` y el backend registra el bloque explicativo como leído, desbloqueando el avance inmediato a una nueva familia de preguntas independiente.
* No se destruye el progreso acumulado en la barra de práctica libre del alumno.

### 5.2. Filosofía Antifrustración de la Práctica

La meta de la práctica libre no es exigir perfección rígida, sino construir dominio. Tras pasar por 4 errores consecutivos y recibir la explicación profunda y la respuesta demostrada, el alumno ya ha procesado el patrón visual. Por eso el sistema no debe retroceder la barra ni castigarlo: debe asegurar continuidad pedagógica con una acción mínima de atención activa.

### 5.3. Ejemplo Aplicado del Flujo Completo en Práctica

* Pregunta Original: `4 + 3 × 4` → alumno escribe `28` (Error). El sistema marca rojo, **revela la respuesta correcta (`16`)** y muestra el feedback de prioridad de operadores.
* Variante Espejo 1: `5 + 2 × 3` → alumno escribe `21` (Error). Marca rojo, **revela la respuesta correcta (`11`)**.
* Variante Espejo 2: `2 + 4 × 5` → alumno escribe `30` (Error). Marca rojo, **revela la respuesta correcta (`22`)**.
* Variante Espejo 3: `6 + 3 × 2` → alumno escribe `18` (Error). Marca rojo, **revela la respuesta correcta (`12`)** y activa el Bloque de Rescate.
* Acción de Cierre: Se despliega la explicación detallada de por qué se multiplica antes de sumar. Al hacer clic en "Entendido", el alumno avanza a la siguiente familia de preguntas.

---

## 6. Zona de Evaluación: Desafíos (Evaluación Estricta sin Asistencia)

Al terminar los niveles de práctica, el alumno transita de un entorno de **Entrenamiento** a un entorno de **Evaluación Estricta**. Aquí **se elimina por completo el Bucle Espejo y no existe el Bloque de Rescate**. 

Ante un error en la zona de desafíos, la respuesta incorrecta se computa directamente, no se dan variantes espejo de segunda oportunidad y el temporizador sigue corriendo de forma implacable. El alumno debe demostrar su dominio bajo presión de tiempo y cumplir con el porcentaje de precisión mínima (cuyo estándar por defecto es **90%**, pero es **dinámicamente configurable desde el Panel de Administrador**) para poder aprobar, enfrentando la expulsión por **Early Exit** si supera el umbral máximo de errores permitidos.

Todo módulo debe contener exactamente estos 3 desafíos indexados en el pool estático:

| Componente | Dificultad | Interfaz | Cantidad estándar | Temporizador estándar | Regla de Cierre |
| --- | --- | --- | --- | --- | --- |
| **Desafío 1** | Estándar | Opción múltiple | 25 | 25 segundos (30s en Módulos 3-8) | Early Exit al 3er error |
| **Desafío 2** | Avanzada | Opción múltiple | 25 | 40 segundos (45s en Módulos 3-8) | Early Exit al 3er error |
| **Desafío Final** | Maestría | Evocación pura (`input`) | 10 | 50 segundos (60s en Módulos 3-8) | Early Exit al 2do error |
| **Desafío Mixto** | Élite | Mixta | 20 | 60 segundos (90s en Módulos 3-8) | Early Exit al 2do error |

### 6.1. Filosofía del Tiempo Variable

> [!IMPORTANT]
> **Flexibilidad de Configuración:** Los tiempos y umbrales presentados en la tabla anterior representan el **estándar pedagógico de diseño por defecto**. Todos estos parámetros (`tiempo_limite`, `porcentaje_aprobacion`, `cantidad_requerida`) pueden ser **modificados libremente desde el Panel de Administrador**. El backend siempre debe consumir los valores dinámicos guardados en la tabla `configuraciones_progreso` (o su cascada de resolución), y **nunca** debe utilizar valores "hardcoded" (rígidos) en el código.

Los tiempos por defecto están calculados de forma inversa a la asistencia de la interfaz:

* Desafío 1: menos tiempo porque la opción múltiple permite descarte visual (25s estándar / 30s en Módulos 3-8).
* Desafío 2: más tiempo por mayor complejidad conceptual (40s estándar / 45s en Módulos 3-8).
* Desafío Final: más tiempo porque exige evocación pura sin distractores (50s estándar / 60s en Módulos 3-8).

### 6.1.B. Interfaz Splash Premium de Desafíos (Challenge Splash Screen)

Antes de iniciar cualquier desafío (incluyendo los Desafíos 1, 2 y Desafío Final de Maestría de cada módulo o fase), se debe desplegar una pantalla de bienvenida inmersiva con las siguientes especificaciones técnicas y UX/UI:
* **Duración Activa Obligatoria:** Exactamente **8 segundos** (8000ms).
* **Contenido Informativo del Desafío:** Debe presentar de forma estructurada en un grid responsivo con *glassmorphism* y micro-iconos (Trophy/Compass, Target, Clock) los siguientes datos:
  - **Módulo:** Nombre descriptivo del módulo actual.
  - **Preguntas:** Cantidad de aciertos requeridos para aprobar la prueba (`maxAciertos` o `cantidad_requerida`).
  - **Tiempo por Pregunta:** Límite de tiempo asignado a cada ejercicio.
* **Animación de Cuenta Regresiva Circular:**
  - Anillo circular SVG en el centro de la pantalla cuyo trazo de color característico del módulo se vacía linealmente de 100% a 0% a lo largo de los **8 segundos** de duración.
  - Un número indicador dinámico gigante en el centro del anillo que decrece del **8** al **1** con un efecto periódico de escala y opacidad cada segundo.
* **Mecanismo de Oclusión (Skip):** Para mantener el control del usuario, la interfaz debe descartarse de inmediato al hacer clic en cualquier parte de la pantalla o presionar cualquier tecla del teclado físico, dando paso inmediato a la primera pregunta del desafío.

### 6.2. Calibración en Caliente de Estrés Temporal y Fatiga de Atención (Overrides)

Los tiempos (temporizadores) y la cantidad de preguntas de cada bloque estipulados en las tablas anteriores representan **valores iniciales de referencia pedagógica**. 

Durante las fases de desarrollo, pruebas de campo e investigación activa, los tiempos óptimos y la fatiga del alumno son variables experimentales. Por ello, el sistema pedagógico de LogicaKids Pro habilita la **Calibración en Caliente**:
* Desde el Panel de Administración, el Superusuario tiene la autoridad para modificar en tiempo real el número de preguntas (`cantidad_requerida`), activar/desactivar temporizadores (`usa_cronometro`) y alterar la duración de los mismos (`tiempo_default_segundos`) para cualquier nivel de práctica libre, desafío, módulo o fase.
* Esto permite adaptar la presión temporal del juego a diferentes metodologías escolares, ritmos grupales o necesidades experimentales de investigación sin alterar la base de datos de manera estática ni requerir despliegues de código nuevos.

### 6.3. Interfaz y Flujo de Salida Temprana (Early Exit Modal)
El fin abrupto e inesperado de una sesión de evaluación es perjudicial para la concentración y la retención del estudiante. Por tanto, ante un escenario de *Early Exit* por acumulación de errores, el flujo visual debe responder bajo las siguientes reglas conceptuales:
* **Pantalla de Error Final:** El estudiante debe ver primero el feedback visual (rojo) indicando que su respuesta fue incorrecta, cerrándolo por sí mismo mediante el botón confirmador.
* **Modal Informativo de Salida Temprana con Reporte de Desempeño:** Al cerrar el banner de error, en lugar de retornar abruptamente al menú, el juego debe abrir un modal prioritario con estética *glassmorphic* premium y un borde superior rojo neón (`#EF4444`) conteniendo el escudo protector (`🛡️`).
  - **Ficha de Reporte Integrada:** Debe incluir de forma destacada una caja de desempeño con el **Nombre del Módulo** y el **Nombre del Desafío** en curso.
  - **Tarjetas de Estadísticas:** Debe mostrar en una grilla de dos columnas el conteo exacto de **Aciertos** en verde neón (`#10B981`) y **Errores** en rojo neón (`#EF4444`) cometidos durante la sesión, para que el estudiante comprenda con total claridad su resultado.
* **Indicador de Errores Activos en el Encabezado (Live Errors HUD):** Durante el desarrollo de cualquier desafío, la cabecera del juego debe inyectar una badge interactiva (`f2-badge-errors`, etc.) con animación de pulso que indique el número de errores cometidos respecto al máximo tolerado en tiempo real (ej: `ERRORES: 1/2`), permitiendo al alumno regular su concentración y saber cuántas oportunidades más le quedan antes de la salida temprana.
* **Enfoque Pedagógico Positivo:** El texto del modal debe tener un tono motivador e instructivo. Debe explicar claramente que el intento actual no puede alcanzar el 90% mínimo de aprobación debido a las fallas acumuladas, pero le invita con entusiasmo a no rendirse, a practicar en los niveles de entrenamiento y a iniciar un nuevo intento cuando se sienta listo.
* **Retorno Controlado:** Al pulsar el botón "Entendido, volver a intentar", la interfaz redirige limpiamente al dashboard de selección de niveles, liberando de forma segura la sesión y los intentos en la base de datos para iniciar de cero.

---

## 7. Reglas Universales de Aprobación, Completitud y Early Exit

Para evitar contradicciones entre práctica y evaluación, LogicaKids Pro separa dos conceptos y los aplica según la etapa pedagógica:

* **Completitud requerida:** porcentaje de la batería asignada que el alumno debe completar. En Práctica Libre, el estándar es 100%.
* **Precisión mínima:** porcentaje mínimo de aciertos requerido. El estándar general para Desafíos es 90%.

### 7.1. Práctica Libre (Entrenamiento Antifrustración)

La práctica libre se considera aprobada y se desbloquea el siguiente nivel del mismo módulo cuando cumple la única condición de:

1. `completitud_requerida = 100%` de la batería asignada.

**No existe un umbral mínimo de precisión** para aprobar la Práctica Libre. El alumno puede cometer múltiples errores en sus respuestas o activar bypasses de rescate explicativos; el backend aprobará de forma fluida el bloque al completar el 100% de la batería para garantizar una práctica sin frustración. El porcentaje de precisión obtenido se almacena únicamente con fines de diagnóstico y visualización en el Panel del Tutor.

### 7.2. Desafíos (Evaluación Estricta)

Para superar y aprobar un Desafío, el alumno debe cumplir estrictamente ambas condiciones:

1. `completitud_requerida = 100%` de las preguntas resueltas.
2. `precision_minima = porcentaje_aprobacion`, por defecto 90%.

El servidor debe abortar la sesión automáticamente (Early Exit) si el alumno alcanza un número de errores que vuelve matemáticamente imposible alcanzar el porcentaje de precisión mínima exigido en la configuración (por defecto 90%).
* **Reset y Limpieza Total en Salida Temprana:** Al gatillarse el Early Exit, el backend realiza un reset absoluto de la sesión de progreso (`aciertos_acumulados = 0`, `porcentaje_actual = 0`, `intentos_totales = 0`) y purga de forma segura todos los intentos guardados para ese desafío (`Intento` e `IntentoPregunta` si aplica) para evitar colisiones lógicas y permitir al alumno volver a intentar el nivel desde cero de forma totalmente limpia y motivadora.
* **Robustez en el Conteo de Errores de Sesión (Consistencia sin Aciertos):** Para evitar que el contador de errores consecutivos de sesión quede atascado en `1` cuando el alumno inicia un desafío con `0` aciertos acumulados (lo que causaría que el bucle de validación omitiera los errores previos), el backend evalúa incondicionalmente todos los intentos anteriores de la sesión actual. De esta manera, el Early Exit se activa de forma determinista y consistente al cometer el número límite de fallas (por ejemplo, 3er error en Desafíos 1 y 2, y 2do error en Desafío Final).

### 7.3. Tabla Maestra de Tolerancia

| Cantidad de preguntas | Errores máximos antes de abortar |
| --- | --- |
| 10 preguntas | Aborta al 2º error |
| 15 preguntas | Aborta al 2º error |
| 20 preguntas | Aborta al 3er error |
| 25 preguntas | Aborta al 3er error |
| 50 preguntas | Aborta al 6º error |

> Nota de flexibilidad operativa: La volumetría, los límites de tiempo, los porcentajes de aprobación, la completitud requerida y los umbrales de Early Exit son parámetros editables desde `configuraciones_progreso`. Los valores de este documento representan la configuración pedagógica estándar, no valores hardcoded. El umbral de Early Exit (Tabla Maestra de Tolerancia) es recalculado de forma determinista por el backend con base en la `cantidad_requerida` configurada en el momento de iniciar la prueba, respetando siempre el principio de tolerancia proporcional del 90%.

> [!IMPORTANT]
> **Excepción de la Tabla de Tolerancia:** El Desafío Mixto de Fase (20 preguntas) utiliza Early Exit al **2do error** (no al 3er error como indicaría la tabla genérica), porque su nivel de dificultad "Élite" requiere un umbral de precisión más estricto. La tabla §6 de desafíos prevalece sobre la tabla genérica §7.3 cuando hay conflicto para un tipo de desafío específico.

> **Regla de Derecho Adquirido (Grandfathering):** Si el administrador modifica dinámicamente los parámetros pedagógicos (ej. aumentar la `cantidad_requerida` de 15 a 20 o cambiar `tiempo_limite`), el backend dispara un recálculo masivo. Los alumnos que ya habían alcanzado el estado `APROBADO` mantendrán su estado intacto y su `porcentaje_actual` se reajustará forzadamente a `100%`, evitando degradaciones del progreso debido a políticas administrativas posteriores.

### 7.4. Flexibilidad Pedagógica y Vías de Avance (Anulación Manual / Override)

El sistema pedagógico de **LogicaKids Pro** está estructurado para diferenciar rigurosamente la etapa de entrenamiento de la etapa de evaluación:

1. **En Práctica Libre (Entrenamiento Antifrustración):** El objetivo exclusivo es que el estudiante practique y asimile activamente los microconceptos. **No se exige ningún umbral o porcentaje de precisión mínima para aprobar**. El estudiante aprueba de forma automática y desbloquea el siguiente nivel *del mismo módulo* con solo alcanzar el **100% de completitud** de la batería asignada, independientemente de si responde correctamente o comete errores y avanza a través de los bypasses explicativos. La precisión real (con un estándar sugerido de 90%) se registra e informa **exclusivamente con fines estadísticos y de diagnóstico pedagógico para el Tutor IA y el Panel del Administrador**, sin actuar jamás como un bloqueo para el avance del alumno.
2. **En la Zona de Desafíos (Evaluación Estricta):** El avance automático exige de forma rígida cumplir tanto el **100% de completitud** como alcanzar una precisión real **igual o superior al porcentaje de aprobación configurado (por defecto 90%)**, además de superar el cronómetro y no incurrir en expulsión por Early Exit.

Por tanto, el sistema pedagógico implementa dos vías legítimas y paralelas para el avance de un estudiante:

1. **Avance Automático por Desempeño (Regla Pedagógica Estándar):**
   * El backend evalúa si el alumno cumple dinámicamente con los requisitos cuantitativos definidos para cada bloque (completitud de 100% para Práctica Libre; completitud de 100% y precisión de ≥90% para Desafíos).
   * **Regla de Desbloqueo de Niveles dentro de un Módulo:** El siguiente nivel de práctica libre de un módulo se desbloquea secuencialmente cuando el nivel anterior alcanza el 100% de completitud.
   * **Regla de Desbloqueo de Desafíos:** Los desafíos de un módulo se desbloquean una vez que se han dominado todos los niveles de práctica libre del módulo. Específicamente, el Desafío 1 se desbloquea al aprobar todos los niveles de práctica del módulo, el Desafío 2 se desbloquea al aprobar el Desafío 1, y el Desafío Final se desbloquea al aprobar el Desafío 2.
   * **Regla de Desbloqueo de Módulos (Transición entre Módulos):** El primer nivel del siguiente módulo de la fase (Módulo N+1) **únicamente se desbloquea** cuando el alumno ha aprobado y dominado la totalidad de los bloques del módulo anterior (Módulo N), lo cual requiere haber completado exitosamente todos los niveles de práctica libre (100% completitud) Y todos los desafíos (Desafíos 1, 2 y Final con completitud al 100% y precisión de ≥90%).
2. **Override Administrativo Manual (Intervención Pedagógica Directa):**
   * Un tutor o superusuario, desde el Panel de Administrador, tiene la autoridad pedagógica de anular el flujo estándar para un alumno en específico, aplicando una de las siguientes tres acciones de override:
     * **Liberar (`unlock`):** Cambia manualmente el estado de un nivel o módulo a `EN_PROGRESO` sin obligar al alumno a completar las etapas o niveles precedentes. Esto le permite saltar contenidos ya dominados y acceder directamente al material.
     * **Aprobar (`approve`):** Declara manualmente un nivel o módulo como `APROBADO` sin que el alumno complete la práctica o los desafíos. El backend simula un **100% de completitud** y un **90% de porcentaje de precisión**, marcando la bandera `aprobado_por_admin = true`, y guardando de forma obligatoria un *Motivo pedagógico* y la *Fecha* de intervención.
        * **Regla Crítica de Aprobación Retrógada (Retro-Approval):** Para evitar colisiones lógicas al activar desafíos y garantizar la integridad de la progresión lineal, **la aprobación manual de un bloque aprueba automáticamente todos los niveles y módulos anteriores de esa fase**. El backend actualiza en reversa el estado de todos los prerrequisitos anteriores a `APROBADO` en `ProgresoMaestria` (simulando 100% completitud y 90% precisión).
        * Esta aprobación en reversa desencadena la cascada estándar para habilitar el bloque inmediatamente posterior de forma segura.
     * **Restablecer / Bloquear (`reset`):** Acción única que regresa un nivel o módulo al estado `BLOQUEADO` y reinicializa completamente su progreso a cero (limpiando contadores de fallas consecutivas, aciertos acumulados y reiniciando barras de avance), obligando al estudiante a cursarlo de nuevo. En la API, se envía como `accion: "reset"`. Los términos `lock` y `reset` son sinónimos funcionales; ambos producen el mismo efecto en la base de datos.

#### Regla Crítica de Integridad y Sincronización de Datos:
Cualquier intervención manual de override que cambie el estado de un bloque o nivel en la tabla autoritativa `ProgresoMaestria` **debe disparar obligatoriamente una sincronización inmediata con el espejo de compatibilidad** `user.settings["unlockedLevels"]` (por ejemplo, asignando el valor `6` en caso de aprobación total, `1` en caso de liberación activa, o `0` en caso de bloqueo). Esto garantiza que el frontend heredado visualice coherentemente el estado administrativo sin desajustes de interfaz.

### 7.5. Flujo de Celebración de Logros (Completion Achievements Modal)
Para reforzar el impacto del progreso, la finalización exitosa de cualquier nivel de práctica o desafío no debe cerrar la pantalla de juego de manera tosca. Se debe gatillar un flujo de celebración premium:
* **Modal de Logros Interactivo:** Una vez aprobados los requisitos de completitud y precisión en `handleFeedbackClose`, el juego suspende la interfaz principal y despliega un modal prioritario con estética *glass-card* premium e íconos animados de éxito (`🏆`, `⭐`).
* **Estadísticas de la Sesión:** El modal presentará tres tarjetas detalladas de logros en tiempo real:
  1. **Aciertos:** Número de respuestas correctas logradas.
  2. **Precisión:** Porcentaje (%) de exactitud en las respuestas dadas.
  3. **Puntos Ganados:** Recompensa de puntuación para gamificación (`+100` en prácticas, `+250` en desafíos).
* **Motor Lógico de Recomendaciones:** El sistema incluye una caja que evalúa el nivel superado y sugiere con precisión pedagógica el siguiente reto que debe afrontar el alumno (ej: *"Ir al Nivel X+1"*, *"Iniciar Desafío 1"*, *"Siguiente Módulo"*, *"Avanzar a Fase X+1"*).
* **Botón Progresivo:** El botón principal adopta el color del módulo y el texto sugerido por el recomendador pedagógico para llevar al estudiante directamente al mapa o al hub con su progreso guardado.

### 7.5.B. Pantalla de Módulo Completado (Duolingo Style Celebration)
Cuando el alumno culmina exitosamente todos los niveles de un módulo académico, se debe desplegar una pantalla interactiva dedicada a pantalla completa con los siguientes parámetros de experiencia UX/UI:
* **Fondo Oscuro Inmersivo:** Uso de un color de fondo plano muy oscuro (ej: `#131f24` o `#070b14`) que aísle al estudiante del mapa general y concentre su atención en la recompensa.
* **Personaje o Mascota Central Dinámica:** Un gráfico o SVG representativo en escena que aparezca mediante un efecto de rebote elástico (`spring` o `bounce` de Framer Motion) transmitiendo alegría.
* **Estallido de Fuegos Artificiales (Sparks Burst):** Generación de partículas de colores vibrantes (`#FFC800`, `#58CC02`, `#FF5E97`, `#84D8FF`) con retrasos aleatorios y trayectorias radiales que estallen alrededor de la mascota.
* **Conteo Progresivo de Estadísticas (Count-Up):** Animación numérica progresiva desde 0 hasta el valor final en las dos tarjetas principales del pie:
  - **Tarjeta de Puntos (Izquierda):** Fondo plano amarillo Duolingo (`#ffc800`) con volumen de botón, ícono de rayo (`Zap`) y valor animado.
  - **Tarjeta de Precisión (Derecha):** Fondo plano verde Duolingo (`#58cc02`) con volumen, ícono de puntería (`Target`) y porcentaje animado.
* **Botón de Continuidad:** Botón de acción con efecto hover/active de Duolingo (sombreado inferior de 3D flat y traslación vertical al pulsar) para avanzar de manera fluida.

### 7.6. Pantalla Monumental de Graduación de Fase (Phase Graduation Modal)
Completar una fase académica completa (ej: 26 niveles en la Fase 2) representa el máximo hito de esfuerzo e ingenio del alumno en la plataforma. Por ello, **se prohíbe el uso de alertas nativas de navegador u salidas simplistas**. El sistema debe gatillar un portal de graduación monumental y personalizado:
* **Pantalla de Celebración Esmerilada:** Overlay inmersivo completo (`rgba(7, 11, 20, 0.95)`) con borde neón verde de éxito (`#10B981`) y una gran corona real (`👑`) animada tridimensionalmente.
* **Personalización con Nombre de Alumno:** Integración obligatoria del nombre del alumno en un gran título de felicitación para incentivar la identidad y el orgullo pedagógico.
* **Infografía de Ruta Conquistada:** Representación gráfica secuencial (estilo mapa vial) que conecta los módulos de la fase mediante una pista neón y badges de dominado (`✓`), sirviendo como recuento e infografía del viaje recorrido.
* **Logros Históricos del Alumno:** Grid visual de cuatro bloques de información temáticos que resumen el volumen del esfuerzo del alumno en la fase:
  1. **Niveles Superados:** Cantidad total de niveles aprobados en la fase (ej: `26 / 26`).
  2. **Módulos Dominados:** Módulos completados (ej: `4 / 4`).
  3. **Ejercicios Logrados:** Estimado global de preguntas resueltas exitosamente (ej: `300+`).
  4. **Conceptos Clave:** Conceptos matemáticos clave asimilados (ej: `12+`).
* **Lanzamiento de Siguiente Fase:** Un botón final destacado con sombreado luminoso que invita directamente al estudiante a avanzar en el mapamundi al primer nivel del bloque o fase posterior desbloqueada.
* **Mapeo de Endpoints y Lógica de Graduación de Fases:** Para habilitar el avance correcto y desbloquear la siguiente fase en la base de datos, cada fase de la plataforma debe contar con su propio endpoint de graduación en el backend (ej: `/pedagogia/graduate-to-fase1`, `/pedagogia/graduate-to-fase2`, `/fase2/graduate`, etc.) y su respectivo servicio en el frontend. La lógica del cliente en `handleEndGame` debe evaluar condicionalmente la fase actual del alumno (`currentUser.fase_actual_id`) para invocar el endpoint de graduación correspondiente a esa fase específica, garantizando que el usuario no sea redirigido de forma inconsistente o quede atascado.

### 7.7. Dinámica y Estados del Banner de Progreso de Fase (Bottom Banner States)
El banner de control inferior en los dashboards y mapas de fase (`WelcomeScreen` y equivalentes) actúa como el portal de graduación y control de la fase. Debe reaccionar dinámicamente según tres estados lógicos excluyentes del progreso del alumno:
1. **Estado de Progreso Básico (Incompleto):**
   - Se muestra cuando restan niveles por completar en las disciplinas básicas.
   - Muestra el avance global en porcentaje y un mensaje invitando a completar los niveles para desbloquear el examen o desafío final.
2. **Estado de Desafío Listo (Desbloqueado):**
   - Se activa cuando todas las disciplinas básicas han sido dominadas al 100%, pero el Desafío Mixto final no ha sido aprobado.
   - Presenta un degradado azul/índigo neón con un botón destacado de **"Iniciar Prueba Final"** que redirige al examen final.
3. **Estado de Fase Aprobada (Felicitaciones):**
   - Se activa cuando la disciplina final (Desafío Mixto) ha sido aprobada de forma satisfactoria (Examen Completado ✓).
   - El banner cambia a un gradiente verde esmeralda y verde azulado neón.
   - El título se actualiza dinámicamente a un mensaje animado de **`¡Felicidades! 🎉`** con un texto secundario claro: **`Has superado esta fase. Puedes avanzar a la próxima.`**
   - El botón cambia de acción a **"Volver al Mapa"** o avanzar a la siguiente fase, eliminando el acceso al examen y evitando bucles de reintento innecesarios en fases ya aprobadas.
   - El ícono del trofeo (`Trophy`) del banner debe ejecutar una animación continua y cíclica de oscilación de ángulo y escala (efecto vaivén) para denotar recompensa y llamar la atención del alumno.

### 7.8. Homologación Visual y Desbloqueo Dinámico del Dashboard
Para garantizar una experiencia de usuario sin fricciones y evitar inconsistencias entre el frontend y el estado real del estudiante, todos los endpoints de dashboard (independientemente de la fase) deben adherirse a las siguientes dos reglas rectoras:
1. **Visualmente Perfecto (Porcentaje a 100%):** Si un nivel, desafío o módulo alcanza el estado `APROBADO` (dominado), el backend debe forzar incondicionalmente el envío de `porcentaje = 100` a la interfaz. Esto previene escenarios confusos donde un alumno ve un módulo aprobado en verde pero con un progreso del 92% o 98% debido a parámetros de `porcentaje_aprobacion` dinámicos (ej. 90%), lo que generaría frustración e incertidumbre.
2. **Desbloqueo Dinámico e Inmunidad a Estados Rígidos:** La condición de bloqueo (candado) de los niveles y módulos subsecuentes en el dashboard NO debe depender nunca de la verificación directa de si `progreso.estado == EstadoProgresoEnum.BLOQUEADO` en la base de datos. Dado que este campo estático puede quedar obsoleto (por ejemplo, si el administrador modifica las reglas o por un bug de recálculo), el bloqueo/desbloqueo debe evaluarse SIEMPRE en tiempo real utilizando funciones dinámicas de cálculo de prerrequisitos (ej. `_is_nivel_unlocked()` o `_is_desafio_unlocked()`).

---

## 8. Especificaciones Técnicas y de Base de Datos (Arquitectura de Tablas Consolidadas)

Para optimizar la mantenibilidad del esquema, la consistencia de las consultas relacionales y simplificar la capa del ORM (SQLAlchemy), **el sistema utiliza una arquitectura de tablas consolidadas y unificadas** en lugar de tablas físicas segmentadas por fase. La separación de contenidos de cada fase se gestiona a nivel lógico mediante relaciones y filtros por clave foránea.

El pool precargado se almacena principalmente en un conjunto de tablas unificadas indexadas:

### 8.1. Tabla 1: Aprendizaje y Evocación (`niveles_teoria_pool`)

Esta tabla almacena el contenido estático de teoría y los mini-retos interactivos de la Etapa 1 para todas las fases.

Campos conceptuales requeridos:

* `fase_id` (ID de fase, ej: `2`, ForeignKey hacia `fases.id`)
* `modulo_id`
* `nivel_id`
* `titulo`
* `bienvenida_superpoder`
* `cuerpo_teoria`
* `trampa_advertencia`
* `diccionario_nivel`
* `ejemplo_guiado`
* `interactivos_desbloqueo`

Volumetría: 1 registro por cada nivel de aprendizaje en total.

### 8.2. Tabla 2: Banco de Preguntas Unificado (`preguntas`)

Esta tabla centraliza todos los ejercicios de Práctica Libre (Etapa 2) y Evaluación/Desafíos (Etapa 4) de todas las fases.

Campos conceptuales requeridos:

* `fase_id` (ForeignKey hacia `fases.id`)
* `modulo_id`
* `seccion` (código de nivel, ej: `101`, `201`, etc.)
* `operacion` (Enum: `SUMA`, `MULTIPLICACION`, `MIXTA`, etc.)
* `tipo_pregunta` (Enum: `CALCULO_DIRECTO`, `MULTIPLE_OPCION`, etc.)
* `enunciado`
* `respuesta_correcta`
* `datos_numericos` (JSONB para coordenadas paramétricas, pasos encadenados, etc.)
* `payload_tokenizado` (JSONB para textos y tokens de subrayado)
* `explicacion_paso_a_paso` (JSONB con explicaciones detalladas para el Bloque de Rescate)
* `requiere_subrayado` (Boolean)
* `palabras_clave` (JSONB)
* `errores_previstos` (JSONB que mapea respuestas incorrectas a feedback del Tutor Invisible)
* `estado` (Enum: `ACTIVO`, `INACTIVO`)

Volumetría: Almacena el pool completo de familias para todos los niveles y desafíos de la plataforma.

### 8.3. Tabla 3: Tabla Auxiliar de Alternativas (`alternativas`)

Para preguntas de opción múltiple de cualquier fase o desafío, se utiliza esta tabla vinculada mediante clave foránea a la tabla principal `preguntas`.

Campos conceptuales requeridos:

* `pregunta_id` (ForeignKey hacia `preguntas.id`)
* `texto` (Texto visible de la opción)
* `es_correcta` (Boolean)
* `orden` (Entero, orden de visualización)
* `tipo_error` (Enum, diagnóstico pedagógico)
* `feedback_error` (Texto del feedback específico)

### 8.4. Algoritmo de Recirculación y Reciclaje de Preguntas

Si el superusuario configura una `cantidad_requerida` de preguntas en un nivel que excede el pool físico de preguntas únicas precargadas en la tabla `preguntas` para esa combinación de `fase_id` y `seccion`, el backend activa un mecanismo automático de **recirculación**:
* Al agotarse las preguntas inéditas, el backend no causará fallos de carga. Limpiará automáticamente la bandera `respondida_alguna_vez` del pool asignado del estudiante (`pool_asignado_alumno`) empezando por las más antiguas en fecha, permitiéndole reutilizarlas secuencialmente hasta completar la batería de práctica requerida.

---

## 9. Reglas de Protección y Anti-Trampas

### 9.1. Dinero sin Float

El backend y la base de datos jamás deben operar con tipo `Float` para dinero. Todo se almacena como enteros en centavos.

Ejemplo:

```text
R$ 2,50 = 250 centavos
```

### 9.2. Protección del Estado de Sesión y Reinicio de Práctica por Reload

Para garantizar la seguridad académica y coherencia didáctica, el sistema aplica dos reglas diferenciadas de estado ante cierres o recargas (`F5`):

1. **En Práctica Libre (Etapa de Aprendizaje):**
   * **Reinicio Obligatorio:** Dado que la práctica es un proceso de entrenamiento y asimilación de microconceptos, **las sesiones de Práctica Libre no persistirán su progreso si el alumno sale del juego o recarga la página**.
   * Si el estudiante recarga estando en la pregunta 10 de 15, la barra de progreso se reinicia por completo a `0`, forzándolo a resolver de forma continua toda la batería de `cantidad_requerida` preguntas para asegurar que no queden lagunas conceptuales.
2. **En Desafíos (Etapa de Evaluación Estricta):**
   * **Persistencia Segura (Anti-Trampa):** En evaluaciones con cronómetro, el frontend debe hidratar obligatoriamente el estado exacto de la sesión desde la API. Si el alumno recarga para intentar burlar el Early Exit o el contador de errores, el backend le restituye la misma pregunta activa y sus contadores de fallas acumulados, impidiendo trampas y bloqueando accesos duplicados.

### 9.3. Tokenización de Textos

En preguntas donde el alumno interactúa con texto, el frontend envía IDs estables, no texto crudo.

Ejemplo:

```json
{
  "tokens_texto": [
    { "id": 1, "texto": "Lucas", "rol": "sujeto" },
    { "id": 2, "texto": "tiene 5 manzanas rojas", "rol": "dato_util" }
  ],
  "tokens_correctos": [2]
}
```

---

## 10. Sincronización de Progreso

El sistema utiliza `ProgresoMaestria` como fuente principal de verdad autoritativa para progreso por bloques, niveles y módulos.

Para mantener compatibilidad con componentes heredados, el backend puede sincronizar automáticamente algunos cambios hacia `user.settings["unlockedLevels"]`. Esta sincronización es un espejo visual y no una fuente primaria de decisión.

Cada vez que un administrador aprueba, bloquea o interviene manualmente un progreso mediante `/api/admin/alumnos/{alumno_id}/progress/override`, el servidor debe actualizar `ProgresoMaestria` y, si el frontend heredado lo requiere, reflejar el cambio en `user.settings["unlockedLevels"]`.

---

## 11. Checklist de Creación para Nuevas Fases

Cuando el equipo pedagógico y técnico comience el diseño de una nueva fase, debe entregar:

* [ ] Documento de diseño lógico.
* [ ] Propósito pedagógico de cada módulo.
* [ ] Trampas conceptuales de cada nivel.
* [ ] Guion de textos teóricos.
* [ ] Diccionarios y analogías.
* [ ] Mensajes de superpoder.
* [ ] Feedbacks de acierto y error para interactivos.
* [ ] Pool de práctica libre con exactamente 120 familias por nivel.
* [ ] Cada familia debe tener 1 pregunta original y 3 variantes espejo.
* [ ] Cada pregunta de práctica debe tener `explicacion_profunda`.
* [ ] Cada práctica con interacción textual debe tener `tokens_texto` y `tokens_correctos`.
* [ ] Pool de desafíos con mínimo 150 preguntas por desafío.
* [ ] Alternativas conectadas para preguntas de opción múltiple.
* [ ] Mapeo heurístico de errores para Tutor Invisible.
* [ ] Scripts inyectores limpios y reproducibles.
* [ ] Validación de que no existen campos críticos nulos.
* [ ] Validación de que el frontend no recibe `es_correcta`.
* [ ] Validación de que el progreso se calcula en backend y no en frontend.
* [ ] Validación de que ningún componente de pantalla de fase usa datos mock como fallback ante errores del backend (el catch solo debe mostrar la pantalla de error y un botón "Reintentar").
