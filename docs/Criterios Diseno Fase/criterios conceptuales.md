# Documento Rector para la Creación de Fases — LogicaKids Pro

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

---

## 2. Anatomía Estándar de un Módulo

Cada fase está compuesta por **módulos**, y cada módulo debe respetar el siguiente flujo de usuario inalterable:

1. **Fase de Aprendizaje Teórico:** Lectura fragmentada por niveles.
2. **Desbloqueo por Evocación:** Resolución obligatoria de 3 mini-retos numéricos sin temporizador.
3. **Práctica Libre:** Batería de preguntas con asistencia algorítmica mediante Bucle Espejo.
4. **Zona de Desafíos:** 3 niveles de evaluación con temporizador y reglas estrictas de expulsión por Early Exit.

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

Ante un error en la zona de desafíos, la respuesta incorrecta se computa directamente, no se dan variantes espejo de segunda oportunidad y el temporizador sigue corriendo de forma implacable. El alumno debe demostrar su dominio bajo presión de tiempo y cumplir con el porcentaje de precisión mínima estándar (90%) para poder aprobar, enfrentando la expulsión por **Early Exit** si supera el umbral máximo de errores permitidos.

Todo módulo debe contener exactamente estos 3 desafíos indexados en el pool estático:

| Componente | Dificultad | Interfaz | Cantidad estándar | Temporizador estándar | Regla de Cierre |
| --- | --- | --- | --- | --- | --- |
| **Desafío 1** | Estándar | Opción múltiple | 25 | 25 segundos por pregunta | Early Exit al 3er error |
| **Desafío 2** | Avanzada | Opción múltiple | 25 | 40 segundos por pregunta | Early Exit al 3er error |
| **Desafío Final** | Maestría | Evocación pura (`input`) | 10 | 50 segundos por pregunta | Early Exit al 2do error |

### 6.1. Filosofía del Tiempo Variable

Los tiempos están calculados de forma inversa a la asistencia de la interfaz:

* Desafío 1: menos tiempo porque la opción múltiple permite descarte visual.
* Desafío 2: más tiempo por mayor complejidad conceptual.
* Desafío Final: más tiempo porque exige evocación pura sin distractores.

### 6.2. Calibración en Caliente de Estrés Temporal y Fatiga de Atención (Overrides)

Los tiempos (temporizadores) y la cantidad de preguntas de cada bloque estipulados en las tablas anteriores representan **valores iniciales de referencia pedagógica**. 

Durante las fases de desarrollo, pruebas de campo e investigación activa, los tiempos óptimos y la fatiga del alumno son variables experimentales. Por ello, el sistema pedagógico de LogicaKids Pro habilita la **Calibración en Caliente**:
* Desde el Panel de Administración, el Superusuario tiene la autoridad para modificar en tiempo real el número de preguntas (`cantidad_requerida`), activar/desactivar temporizadores (`usa_cronometro`) y alterar la duración de los mismos (`tiempo_default_segundos`) para cualquier nivel de práctica libre, desafío, módulo o fase.
* Esto permite adaptar la presión temporal del juego a diferentes metodologías escolares, ritmos grupales o necesidades experimentales de investigación sin alterar la base de datos de manera estática ni requerir despliegues de código nuevos.

### 6.3. Interfaz y Flujo de Salida Temprana (Early Exit Modal)
El fin abrupto e inesperado de una sesión de evaluación es perjudicial para la concentración y la retención del estudiante. Por tanto, ante un escenario de *Early Exit* por acumulación de errores, el flujo visual debe responder bajo las siguientes reglas conceptuales:
* **Pantalla de Error Final:** El estudiante debe ver primero el feedback visual (rojo) indicando que su respuesta fue incorrecta, cerrándolo por sí mismo mediante el botón confirmador.
* **Modal Informativo de Salida Temprana:** Al cerrar el banner de error, en lugar de retornar abruptamente al menú, el juego debe abrir un modal prioritario con estética *glassmorphic* premium y un borde superior rojo neón (`#EF4444`) conteniendo el escudo protector (`🛡️`).
* **Enfoque Pedagógico Positivo:** El texto del modal debe tener un tono motivador e instructivo. Debe explicar claramente que el intento actual no puede alcanzar el 90% mínimo de aprobación debido a las fallas acumuladas, pero le invita con entusiasmo a no rendirse, a practicar en los niveles de entrenamiento y a iniciar un nuevo intento cuando se sienta listo.
* **Retorno Controlado:** Al pulsar el botón "Entendido, volver a intentar", la interfaz redirige limpiamente al dashboard de selección de niveles, liberando de forma segura la sesión y los intentos en la base de datos para iniciar de cero.

---

## 7. Reglas Universales de Aprobación, Completitud y Early Exit

Para evitar contradicciones entre práctica y evaluación, LogicaKids Pro separa dos conceptos y los aplica según la etapa pedagógica:

* **Completitud requerida:** porcentaje de la batería asignada que el alumno debe completar. En Práctica Libre, el estándar es 100%.
* **Precisión mínima:** porcentaje mínimo de aciertos requerido. El estándar general para Desafíos es 90%.

### 7.1. Práctica Libre (Entrenamiento Antifrustración)

La práctica libre se considera aprobada y se desbloquea el siguiente nivel cuando cumple la única condición de:

1. `completitud_requerida = 100%` de la batería asignada.

**No existe un umbral mínimo de precisión** para aprobar la Práctica Libre. El alumno puede cometer múltiples errores en sus respuestas o activar bypasses de rescate explicativos; el backend aprobará de forma fluida el bloque al completar el 100% de la batería para garantizar una práctica sin frustración. El porcentaje de precisión obtenido se almacena únicamente con fines de diagnóstico y visualización en el Panel del Tutor.

### 7.2. Desafíos (Evaluación Estricta)

Para superar y aprobar un Desafío, el alumno debe cumplir estrictamente ambas condiciones:

1. `completitud_requerida = 100%` de las preguntas resueltas.
2. `precision_minima = porcentaje_aprobacion`, por defecto 90%.

El servidor debe abortar la sesión automáticamente (Early Exit) si el alumno alcanza un número de errores que vuelve matemáticamente imposible alcanzar el 90% de precisión.
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

### 7.4. Flexibilidad Pedagógica y Vías de Avance (Anulación Manual / Override)

El sistema pedagógico de **LogicaKids Pro** está estructurado para diferenciar rigurosamente la etapa de entrenamiento de la etapa de evaluación:

1. **En Práctica Libre (Entrenamiento Antifrustración):** El objetivo exclusivo es que el estudiante practique y asimile activamente los microconceptos. **No se exige ningún umbral o porcentaje de precisión mínima para aprobar**. El estudiante aprueba de forma automática y desbloquea el siguiente nivel con solo alcanzar el **100% de completitud** de la batería asignada, independientemente de si responde correctamente o comete errores y avanza a través de los bypasses explicativos. La precisión real (con un estándar sugerido de 90%) se registra e informa **exclusivamente con fines estadísticos y de diagnóstico pedagógico para el Tutor IA y el Panel del Administrador**, sin actuar jamás como un bloqueo para el avance del alumno.
2. **En la Zona de Desafíos (Evaluación Estricta):** El avance automático exige de forma rígida cumplir tanto el **100% de completitud** como alcanzar una precisión real **igual o superior al porcentaje de aprobación (90%)**, además de superar el cronómetro y no incurrir en expulsión por Early Exit.

Por tanto, el sistema pedagógico implementa dos vías legítimas y paralelas para el avance de un estudiante:

1. **Avance Automático por Desempeño (Regla Pedagógica Estándar):**
   * El backend evalúa si el alumno cumple dinámicamente con los requisitos cuantitativos definidos para cada bloque (completitud de 100% para Práctica Libre; completitud de 100% y precisión de ≥90% para Desafíos).
2. **Override Administrativo Manual (Intervención Pedagógica Directa):**
   * Un tutor o superusuario, desde el Panel de Administrador, tiene la autoridad pedagógica de anular el flujo estándar para un alumno en específico, aplicando una de las siguientes tres acciones de override:
     * **Liberar (`unlock`):** Cambia manualmente el estado de un nivel o módulo a `EN_PROGRESO` sin obligar al alumno a completar las etapas o niveles precedentes. Esto le permite saltar contenidos ya dominados y acceder directamente al material.
     * **Aprobar (`approve`):** Declara manualmente un nivel o módulo como `APROBADO` sin que el alumno complete la práctica o los desafíos. El backend simula un **100% de completitud** y un **90% de porcentaje de precisión**, marcando la bandera `aprobado_por_admin = true`, y guardando de forma obligatoria un *Motivo pedagógico* y la *Fecha* de intervención.
        * **Regla Crítica de Aprobación Retrógada (Retro-Approval):** Para evitar colisiones lógicas al activar desafíos y garantizar la integridad de la progresión lineal, **la aprobación manual de un bloque aprueba automáticamente todos los niveles y módulos anteriores de esa fase**. El backend actualiza en reversa el estado de todos los prerrequisitos anteriores a `APROBADO` en `ProgresoMaestria` (simulando 100% completitud y 90% precisión).
        * Esta aprobación en reversa desencadena la cascada estándar para habilitar el bloque inmediatamente posterior de forma segura.
     * **Restablecer o Bloquear (`lock` o `reset`):** Regresa un nivel o módulo al estado `BLOQUEADO` o reinicializa su progreso a cero (limpiando contadores de fallas consecutivas y reiniciando barras de avance), obligando al estudiante a cursarlo de nuevo.

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

---

## 8. Especificaciones Técnicas y de Base de Datos (Pools Segmentados por Fase)

Para garantizar aislamiento absoluto de lógicas, escalabilidad de contenidos, rendimiento óptimo en índices y ausencia de campos nulos innecesarios, el sistema descarta el uso de tablas maestras globales y monolíticas para almacenar las preguntas de la plataforma. 

**Cada Fase `X` posee su propio conjunto físico e independiente de tablas segmentadas (Isolated Phase Pools)**, prefijadas por el identificador de la fase (ej: `fase{X}_...`). Esto permite realizar mantenimientos, migraciones, seeders y correcciones pedagógicas en una fase en específico sin afectar la disponibilidad o integridad de las demás fases activas.

Para cada Fase `X`, el Pool Precargado se divide físicamente en un **trinomio de tablas aisladas** correspondientes a las tres etapas del módulo:

### 8.1. Tabla 1: Aprendizaje y Evocación (`fase{X}_teoria_pool`)

Esta tabla almacena el contenido estático de teoría y los mini-retos interactivos de la Etapa 1.

Campos conceptuales requeridos:

* `fase_id` (ID de fase, ej: `2`)
* `modulo_id`
* `nivel_id`
* `titulo`
* `bienvenida_superpoder`
* `cuerpo_teoria`
* `trampa_advertencia`
* `diccionario_nivel`
* `ejemplo_guiado`
* `interactivos_desbloqueo`

Volumetría: 1 registro por cada nivel de aprendizaje de la fase.

### 8.2. Tabla 2: Práctica Libre y Bucle Espejo (`fase{X}_practica_pool`)

Esta tabla es exclusiva para entrenamiento y asistencia del Bucle Espejo. No maneja opciones múltiples en la práctica estándar.

Campos conceptuales requeridos:

* `fase_id`
* `modulo_id`
* `nivel_id`
* `seccion`
* `estructura_padre_id`
* `operacion`
* `enunciado_visual`
* `respuesta_correcta`
* `explicacion_profunda`
* `datos_numericos`
* `modo_interaccion`
* `requiere_subrayado`
* `tokens_texto`
* `tokens_correctos`

Volumetría estricta: 120 familias por nivel (equivalente a 480 preguntas individuales por nivel) dentro de la fase.

### 8.3. Tabla 3: Evaluación y Desafíos (`fase{X}_desafios_pool`)

Esta tabla se desentiende por completo de la lógica espejo y del rescate pedagógico, optimizada para exámenes cronometrados.

Campos conceptuales requeridos:

* `fase_id`
* `modulo_id`
* `desafio_id`
* `seccion`
* `tipo_segmento`
* `tipo_pregunta`
* `enunciado_visual`
* `respuesta_correcta`
* `datos_numericos`

Volumetría estricta: mínimo 150 preguntas individuales independientes para cada desafío de la fase.

### 8.4. Tabla Auxiliar de Alternativas (`fase{X}_alternativas_desafios_pool`)

Para preguntas de opción múltiple, se utiliza una tabla auxiliar conectada mediante clave foránea a `fase{X}_desafios_pool`.

Campos conceptuales requeridos:

* `desafio_id`
* `texto`
* `texto_opcion`
* `es_correcta`
* `orden`
* `tipo_error`

### 8.5. Tabla Auxiliar de Errores (`fase{X}_respuestas_erroneas`)

Mapea las respuestas incorrectas previstas de `fase{X}_practica_pool` a un tipo de error y feedback específico del Tutor Invisible.

Ejemplo:

```json
{
  "respuestas_erroneas": [
    {
      "valor": "22",
      "tipo_error": "problema_incompleto",
      "feedback": "Calculaste bien los gastos, pero falta restarlos de los R$ 50,00 iniciales."
    }
  ]
}
```

### 8.6. Algoritmo de Recirculación y Reciclaje de Preguntas

Si el superusuario configura una `cantidad_requerida` de preguntas en un nivel que excede el pool físico de familias únicas precargadas en `fase{X}_practica_pool`, el backend activa un mecanismo automático de **recirculación**:
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
