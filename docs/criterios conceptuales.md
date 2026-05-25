# Documento Rector para la Creación de Fases — LogicaKids Pro

> Nota de autoridad documental: Este documento es la fuente principal de verdad pedagógica y conceptual de LogicaKids Pro. En caso de conflicto, prevalece primero este Documento Rector Conceptual, luego el Blueprint Técnico, luego el Manual del Administrador y finalmente la Guía UX/UI.

---

## 1. Principios Arquitectónicos y Pool de Preguntas

Todas las fases de LogicaKids Pro deben operar bajo un modelo de **Autoridad en el Servidor (Server-Authoritative)**. El frontend actúa únicamente como capa de renderizado interactiva; jamás calcula respuestas finales, ni controla la progresión, ni maneja estados de aprobación.

La fuente de verdad para el progreso académico es la tabla `ProgresoMaestria`. El objeto `user.settings["unlockedLevels"]` puede existir únicamente como espejo de compatibilidad visual para componentes heredados del frontend. Ninguna decisión de aprobación, bloqueo, desbloqueo o avance debe depender exclusivamente de `user.settings`.

### 1.1. Estrategia de Almacenamiento: Pool en Base de Datos

Para garantizar estabilidad, auditoría pedagógica previa y evitar latencia o fallos matemáticos en tiempo de ejecución, **se prohíbe la generación dinámica de preguntas en tiempo real por el backend durante la sesión del alumno**.

* **Modelo de Pool Precargado:** Todas las preguntas, variantes, respuestas correctas, distractores y feedbacks específicos de cada nivel deben estar previamente calculados, validados e insertados en tablas de PostgreSQL.
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

* **Ejemplos Guiados:** Antes de pasar a los interactivos, el niño debe ver mínimo 2 ejemplos completamente resueltos paso a paso.
* **Interactivos Pre-evaluativos:** Bloque obligatorio de 3 preguntas de evocación con `input` vacío.
* **Retroalimentación Inmediata:**
  * En caso de acierto, se muestra `feedback_acierto`.
  * En caso de error, se muestra `feedback_error`.
  * El alumno no debe poder avanzar al Paso 3 hasta responder correctamente los interactivos.

#### Paso 3: Trampa y Consolidación

* **Bloque de Advertencia:** Exposición explícita de la debilidad o error más común.
* **Diccionario del Nivel:** Lista estructurada que traduce términos narrativos a operadores matemáticos.
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

### 4.2. Sistema de Tutoría Avanzada: Bucle Espejo Progresivo

Cuando el alumno comete un error, el avance en la barra de progreso se congela por completo y el servidor activa un bucle de aprendizaje estructurado con tolerancia máxima de hasta 3 variantes espejo consecutivas antes del rescate profundo.

1. **Primera Falla: Pregunta Original → Variante Espejo 1**  
   El servidor congela el progreso, identifica el tipo de error, muestra feedback del Tutor Invisible e inyecta la Variante Espejo 1 con la misma estructura y números diferentes.

2. **Segunda Falla: Variante Espejo 1 → Variante Espejo 2**  
   Si el alumno vuelve a fallar, el sistema no cambia de tema. Envía un feedback más directo e inyecta la Variante Espejo 2.

3. **Tercera Falla: Variante Espejo 2 → Variante Espejo 3**  
   Si el error persiste, se le da una última oportunidad con la Variante Espejo 3, acompañada de un mensaje de alerta motivacional.

4. **Cuarta Falla: Activación del Bloque de Rescate**  
   Si el alumno falla la pregunta original y sus 3 variantes espejo, el servidor activa el Bloque de Rescate Pedagógico.

### 4.3. Filosofía de la Variante Espejo

Ante un error, el alumno jamás debe ser castigado con un problema completamente nuevo que le exija reiniciar su mapa mental. La variante espejo lo enfrenta al mismo concepto, con la misma estructura gramatical o sintáctica y la misma secuencia de operaciones.

Al mantener una estructura casi idéntica, el alumno se familiariza con el patrón visual del problema, reduce la carga cognitiva y enfoca su energía en aplicar el feedback recibido.

---

## 5. Bloque de Rescate Pedagógico

Si el alumno se equivoca por cuarta vez consecutiva, el sistema asume que existe un bloqueo conceptual específico con esa arquitectura de pregunta. En ese instante, la batería se congela temporalmente y el frontend despliega de forma obligatoria el **Bloque de Rescate**.

### 5.1. Reglas del Bloque de Rescate

* El bloque toma el control de la pantalla mediante un modal prioritario.
* Debe mostrar una explicación profunda con visualización paso a paso.
* Debe presentar 3 ejercicios o ejemplos resueltos con la misma lógica.
* Debe exigir una acción anti-spam antes de continuar.
* El alumno debe transcribir la respuesta correcta final demostrada en los ejemplos.
* El backend valida esa transcripción.
* Si la transcripción es correcta, el backend considera superada la pregunta, resetea `fallas_consecutivas_bucle = 0` y permite continuar.
* No se penaliza ni se destruye el progreso de la práctica libre.

### 5.2. Filosofía Antifrustración

La meta de la práctica libre no es exigir perfección rígida, sino construir dominio. Tras pasar por 4 errores consecutivos y recibir la explicación profunda, el alumno ya ha procesado el patrón visual. Por eso el sistema no debe retroceder la barra ni castigarlo: debe asegurar continuidad pedagógica con una acción mínima de atención activa.

### 5.3. Ejemplo Aplicado del Flujo Completo

* Pregunta Original: `4 + 3 × 4` → el alumno escribe `28`.
* Variante Espejo 1: `5 + 2 × 3` → el alumno escribe `21`.
* Variante Espejo 2: `2 + 4 × 5` → el alumno escribe `30`.
* Variante Espejo 3: `6 + 3 × 2` → el alumno escribe `18`.
* Acción del Servidor: activa el Bloque de Rescate con explicación profunda de la prioridad de la multiplicación. Tras transcribir la respuesta solicitada, el alumno avanza a una nueva familia de preguntas.

---

## 6. Zona de Evaluación: Desafíos

Al terminar los niveles de práctica, el alumno transita de un entorno de **Entrenamiento** a un entorno de **Evaluación Estricta**. Aquí no existe Bucle Espejo, no hay Bloque de Rescate y el progreso no está garantizado.

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

---

## 7. Reglas Universales de Aprobación, Completitud y Early Exit

Para evitar contradicciones entre práctica y evaluación, LogicaKids Pro separa dos conceptos:

* **Completitud requerida:** porcentaje de la batería asignada que el alumno debe completar. En práctica libre, el estándar es 100%.
* **Precisión mínima:** porcentaje mínimo de aciertos requerido. El estándar general es 90%.

### 7.1. Práctica Libre

La práctica libre se considera aprobada cuando cumple ambas condiciones:

1. `completitud_requerida = 100%` de la batería asignada.
2. `precision_minima = porcentaje_aprobacion`, por defecto 90%.

Solo cuando ambas condiciones se cumplen, el backend habilita los desafíos del módulo.

### 7.2. Desafíos

Todas las evaluaciones exigen por defecto 90% de precisión. El servidor debe abortar la sesión automáticamente si el alumno alcanza un número de errores que vuelve matemáticamente imposible aprobar.

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

El criterio estándar de aprobación del **90% de precisión** y **100% de completitud** en la Práctica Libre es un **estándar relativo y estadístico**. Dado que los estudiantes de LogicaKids Pro ingresan con diferentes conocimientos previos, ritmos de aprendizaje o necesidades de nivelación inmediata, obligar a una ruta lineal rígida puede generar desmotivación en alumnos avanzados o retrasos innecesarios en casos particulares.

Por tanto, el sistema pedagógico implementa dos vías legítimas y paralelas para el avance de un estudiante:

1. **Avance Automático por Desempeño (Regla Pedagógica Estándar):**
   * El backend evalúa si el alumno cumple dinámicamente con los requisitos cuantitativos (precisión y completitud) definidos para el nivel o módulo.
2. **Override Administrativo Manual (Intervención Pedagógica Directa):**
   * Un tutor o superusuario, desde el Panel de Administrador, tiene la autoridad pedagógica de anular el flujo estándar para un alumno en específico, aplicando una de las siguientes tres acciones de override:
     * **Liberar (`unlock`):** Cambia manualmente el estado de un nivel o módulo a `EN_PROGRESO` sin obligar al alumno a completar las etapas o niveles precedentes. Esto le permite saltar contenidos ya dominados y acceder directamente al material.
     * **Aprobar (`approve`):** Declara manualmente un nivel o módulo como `APROBADO` sin que el alumno complete la práctica o los desafíos. El backend simula un **100% de completitud** y un **90% de porcentaje de precisión**, marcando la bandera `aprobado_por_admin = true`, y guardando de forma obligatoria un *Motivo pedagógico* y la *Fecha* de intervención. Esta aprobación desencadena la cascada de desbloqueo para el siguiente nivel de forma inmediata.
     * **Restablecer o Bloquear (`lock` o `reset`):** Regresa un nivel o módulo al estado `BLOQUEADO` o reinicializa su progreso a cero (limpiando contadores de fallas consecutivas y reiniciando barras de avance), obligando al estudiante a cursarlo de nuevo.

#### Regla Crítica de Integridad y Sincronización de Datos:
Cualquier intervención manual de override que cambie el estado de un bloque o nivel en la tabla autoritativa `ProgresoMaestria` **debe disparar obligatoriamente una sincronización inmediata con el espejo de compatibilidad** `user.settings["unlockedLevels"]` (por ejemplo, asignando el valor `6` en caso de aprobación total, `1` en caso de liberación activa, o `0` en caso de bloqueo). Esto garantiza que el frontend heredado visualice coherentemente el estado administrativo sin desajustes de interfaz.

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

---

## 9. Reglas de Protección y Anti-Trampas

### 9.1. Dinero sin Float

El backend y la base de datos jamás deben operar con tipo `Float` para dinero. Todo se almacena como enteros en centavos.

Ejemplo:

```text
R$ 2,50 = 250 centavos
```

### 9.2. Protección del Estado de Sesión

Si el alumno actualiza el navegador, el frontend debe hidratar el estado desde la API. Esto evita que burle el Early Exit, el contador `fallas_consecutivas_bucle` o el estado de rescate.

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
