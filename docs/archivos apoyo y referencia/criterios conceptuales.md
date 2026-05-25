Aquí tienes el **Documento Rector (`criterios conceptuales.md`) completo y corregido**, implementando tu filosofía de diseño.

He eliminado por completo los bloques de código SQL para mantenerlo puramente conceptual y estructurado. La sección 6 ahora describe detalladamente la existencia de las **tres tablas independientes** (Teoría, Práctica Libre y Desafíos), y la sección 7 (Checklist) ha sido reescrita para separar matemáticamente la volumetría de 120 familias para entrenamiento y 150 preguntas para evaluación, resolviendo definitivamente la contradicción.

Puedes copiar este bloque y reemplazar tu archivo actual:

```markdown
# Documento Rector para la Creación de Fases — LogicaKids Pro

## 1. Principios Arquitectónicos y Pool de Preguntas

Todas las fases de LogicaKids Pro deben operar bajo un modelo de **Autoridad en el Servidor (Server-Authoritative)**. El frontend actúa únicamente como capa de renderizado interactiva; jamás calcula respuestas finales, ni controla la progresión, ni maneja los estados de aprobación.

### 1.1. Estrategia de Almacenamiento: Pool en Base de Datos (No Generación Dinámica)

Para garantizar la estabilidad del sistema, la auditoría pedagógica previa y evitar la latencia o fallos matemáticos en tiempo de ejecución, **se prohíbe la generación dinámica de preguntas en tiempo real por el backend**.

* **Modelo de Pool Precargado:** Todas las preguntas, variantes, respuestas correctas, distractores y feedbacks específicos de cada nivel deben estar previamente calculados, validados e insertados en tablas de la base de datos PostgreSQL.
* **Consumo del Backend:** El servidor FastAPI se limitará a consultar, filtrar y seleccionar de manera aleatoria controlada (utilizando `random.sample()` o sentencias SQL eficientes) los ítems del pool preexistente para entregarlos al frontend.
* **Uso de Plantillas Estáticas:** Para problemas textuales o herramientas interactivas, los textos y estructuras se almacenan completamente renderizados o estructurados mediante objetos JSONB estáticos en la base de datos, eliminando el uso de variables dinámicas al vuelo durante la sesión del alumno.

---

## 2. Anatomía Estándar de un Módulo

Cada fase está compuesta por **Módulos**, y cada módulo debe respetar el siguiente flujo de usuario inalterable:

1. **Fase de Aprendizaje Teórico:** Lectura fragmentada por niveles.
2. **Desbloqueo por Evocación:** Resolución obligatoria de 3 mini-retos numéricos sin temporizador.
3. **Práctica Libre (Niveles):** Batería de preguntas con asistencia algorítmica (*Bucle Espejo*).
4. **Zona de Desafíos (Evaluación):** 3 niveles de examen con temporizador y reglas de expulsión estricta (*Early Exit*).

---

## 3. Estructura Interna de un Nivel de Aprendizaje y Práctica

Cada nivel dentro de un módulo sirve para aislar un micro-concepto antes de integrarlo. Debe diseñarse con los siguientes componentes:

### 3.1. Teoría Pre-renderizada (Carrusel Interactivo de Flashcards)
Toda la carga teórica de un nivel se almacena de forma pre-renderizada en la base de datos y se presenta al alumno mediante un **Carrusel Interactivo de Flashcards (3 Pasos)**. Esto fragmenta la información para no saturar al estudiante y asegura que la teoría sea activa, no pasiva:

#### Paso 1: Introducción y Superpoder
* **Mensaje de Bienvenida (Declaración de Superpoder):** Tono motivacional, épico y centrado en el alumno. Introduce el tema como una habilidad especial dentro de una temática (misiones, pócimas, monstruos).
* **Cuerpo Teórico Concreto (Explicación Narrativa Corta):** Párrafos fluidos que conectan la lógica con la imaginación del niño.

#### Paso 2: Modelado y Práctica Guiada (Interactivos)
* **Ejemplos Guiados:** Antes de pasar a los interactivos, el niño ve ejemplos (mínimo 2) completamente resueltos paso a paso.
* **Interactivos Pre-evaluativos:** Bloque obligatorio de 3 preguntas de evocación (cuadro de texto `input` vacío). El alumno debe completarlas paso a paso.
* **Retroalimentación Inmediata:**
  * **En caso de Acierto:** Se muestra el `feedback_acierto` (ej. "¡Correcto! 8 × 2 = 16").
  * **En caso de Error:** Se muestra el `feedback_error` (ej. "Piénsalo mejor. 'El doble' es multiplicar por 2").
  * El alumno no debe poder avanzar al Paso 3 hasta no responder correctamente los interactivos.

#### Paso 3: Trampa y Consolidación
* **Bloque de Advertencia ("Tip Pedagógico"):** Exposición explícita de la debilidad o error más común (ej. *El Monstruo del Desorden*).
* **El Diccionario del Nivel:** Lista estructurada que traduce los términos narrativos a su operador matemático.
* **Llamado a la Acción:** Botón final "¡Entendido, empezar!" que cierra el carrusel y libera la Batería de Práctica Libre.

### 3.2. Batería de Práctica Libre

* **Formato de Interfaz:** Exclusivamente cuadros de texto (`input`) vacíos. Se prohíbe el uso de opciones múltiples en esta etapa para eliminar el factor de adivinanza o descarte, obligando al alumno a realizar el proceso cognitivo completo.
* **Sistema de Tutoría Avanzada (El Bucle Espejo Progresivo):**
Cuando el alumno comete un error, el avance en la barra de progreso se congela por completo y el servidor activa un bucle de aprendizaje estructurado con tolerancia máxima de hasta 3 variantes espejo consecutivas (extraídas del pool estático) antes de activar un protocolo de rescate profundo:
1. **Primera Falla (Pregunta Original) $\rightarrow$ Variante Espejo 1:** El servidor congela el progreso, identifica el tipo de error en el JSONB, muestra el feedback del "Tutor Invisible" e inyecta la **Variante Espejo 1** (misma estructura exacta, diferentes números).
2. **Segunda Falla (En Variante 1) $\rightarrow$ Variante Espejo 2:** Si el alumno vuelve a fallar, el sistema no cambia de tema. El backend envía un segundo feedback con una pista más directa e inyecta la **Variante Espejo 2** (mantiene la estructura idéntica).
3. **Tercera Falla (En Variante 2) $\rightarrow$ Variante Espejo 3:** Si el error persiste, se le da una última oportunidad inyectando la **Variante Espejo 3**, acompañada de un mensaje de alerta motivacional ("¡Vamos, tú puedes! Fíjate bien en el orden...").

#### El Bloque de Rescate Pedagógico (A la 4ta Falla Consecutiva)

Si el alumno se equivoca por cuarta vez consecutiva (fallando la pregunta original y sus 3 variantes espejo), el sistema asume que existe un bloqueo conceptual específico con esa arquitectura de pregunta. En ese instante, la batería se congela temporalmente y el frontend despliega de forma obligatoria el **Bloque de Rescate**:

* **Interfaz de Rescate:** Un recuadro emergente e interactivo que toma el control de la pantalla de forma prioritaria.
* **Contenido:** Desglosa visualmente la regla pedagógica y muestra **3 ejercicios idénticos resueltos paso a paso** (ej. utilizando flechas visuales que guían el orden de la operación).
* **Dinámica de Continuidad Fluyente:** El niño lee la explicación y analiza la secuencia de los 3 ejemplos.

> **Filosofía Antifrustración de la Práctica Libre (Entrenamiento):**
> La meta de esta **fase específica de entrenamiento** no es evaluar ni exigir perfección rígida a costa de destruir la experiencia del usuario. Tras pasar por 4 errores consecutivos y recibir la explicación profunda, el cerebro del alumno ya ha procesado la estructura visual.
> Por lo tanto, el sistema no lo penaliza ni retrocede su barra de progreso. Para evitar que el alumno simplemente cierre la ventana sin leer (spam), **el recuadro de rescate le exigirá transcribir la respuesta correcta final demostrada en los ejemplos**. Al hacerlo, el backend da la pregunta por superada, resetea el contador (`fallas_consecutivas_bucle = 0`) y le permite continuar su entrenamiento sin frustración.

> **Filosofía de la Variante Espejo:**
> Ante un error, el alumno jamás debe ser castigado con un problema completamente nuevo que le exija reiniciar su mapa mental. La variante espejo lo enfrenta **al mismo concepto, con la misma estructura gramatical o sintáctica y la misma secuencia de operaciones**. Al mantener la estructura "casi idéntica", el alumno se familiariza con el patrón visual del problema, reduciendo la carga cognitiva y enfocando su energía en aplicar el feedback. Si el patrón falla 3 veces, el **Bloque de Rescate** modela el pensamiento correcto antes de dejarlo continuar.

* **Ejemplo Aplicado del Flujo Completo (Módulo 1 - Jerarquías):**
* *Pregunta Original:* `4 + 3 × 4` $\rightarrow$ *Falla del alumno (Escribe 28).*
* *Variante Espejo 1:* `5 + 2 × 3` $\rightarrow$ *Falla del alumno (Escribe 21).*
* *Variante Espejo 2:* `2 + 4 × 5` $\rightarrow$ *Falla del alumno (Escribe 30).*
* *Variante Espejo 3:* `6 + 3 × 2` $\rightarrow$ *Falla del alumno (Escribe 18).*
* **Acción del Servidor:** Detiene la batería de preguntas y despliega el **Bloque de Rescate** en pantalla con la explicación profunda de la prioridad de la multiplicación, ilustrada detalladamente a través de 3 ejemplos idénticos resueltos paso a paso. Tras transcribir la respuesta y cerrar el recuadro, el niño avanza a la siguiente pregunta guardando su progreso.

---

### 💡 Nota técnica para los desarrolladores:
El backend debe llevar un contador de `fallas_consecutivas_bucle` en el estado de la sesión actual. Este contador se incrementa con cada error en una variante espejo y se resetea a `0` únicamente cuando el alumno responde correctamente una variante espejo o cuando transcribe la respuesta en el componente del **Bloque de Rescate**.

---

## 4. Zona de Evaluación: Los Desafíos

Al terminar los niveles de práctica, el alumno transita de un entorno de **Entrenamiento** a un entorno de **Evaluación Estricta**. El objetivo aquí ya no es afianzar conceptos, sino demostrar maestría, automatización y tolerancia a la presión. 

Por esta razón, en la Zona de Desafíos se elimina por completo la red de seguridad pedagógica: no existe el Bucle Espejo, no hay Bloques de Rescate y el progreso no está garantizado. Se exige velocidad de procesamiento y precisión absoluta. Todo módulo debe contener exactamente estos 3 desafíos indexados en el pool estático:

| Componente | Dificultad | Interfaz | Cantidad | Temporizador | Regla de Cierre (Early Exit) |
| --- | --- | --- | --- | --- | --- |
| **Desafío 1** | Estándar | Opción Múltiple | 25 | **25 seg** / pregunta | Expulsión al **3er error** |
| **Desafío 2** | Avanzada | Opción Múltiple | 25 | **40 seg** / pregunta | Expulsión al **3er error** |
| **Desafío Final** | Maestría | Evocación Pura (`input`) | 10 | **50 seg** / pregunta | Expulsión al **2do error** |

> **Filosofía del Tiempo Variable:** Los tiempos están calculados de forma inversa a la asistencia de la interfaz. El **Desafío 1** otorga **25 segundos** porque las opciones múltiples facilitan el descarte visual rápido. El **Desafío 2** sube la complejidad conceptual, por lo que expande el tiempo a **40 segundos**. El **Desafío Final** otorga **50 segundos** debido a que elimina los distractores por completo, exigiendo al alumno evocar el resultado, calcularlo mentalmente y tipear la respuesta desde cero en un cuadro vacío.

> **Ejemplo Aplicado (Desafío Final - Módulo 1):** Evocación pura. El niño ve en pantalla `30 - 15 ÷ 3`. No hay opciones para adivinar. El temporizador inicia la cuenta regresiva desde los **50 segundos**. El alumno debe tipear `25` correctamente en el `input` antes de que el tiempo se agote, o el servidor le computará de forma automática un error crítico hacia el *Early Exit*.

---

## 5. Reglas Universales de Aprobación y Early Exit

Todas las evaluaciones exigen un **90% de precisión**. Para evitar el "Bloqueo del Pequeño Fracaso" (donde el alumno sigue respondiendo cuando matemáticamente ya reprobó), el servidor debe abortar la sesión automáticamente.

**Tabla Maestra de Tolerancia:**

* Sesión de **10** preguntas $\rightarrow$ Aborta al **2º error**.
* Sesión de **15** preguntas $\rightarrow$ Aborta al **2º error**.
* Sesión de **20** preguntas $\rightarrow$ Aborta al **3er error**.
* Sesión de **25** preguntas $\rightarrow$ Aborta al **3er error**.
* Sesión de **50** preguntas $\rightarrow$ Aborta al **6º error**.

> 💡 **Nota de Flexibilidad Operativa y Parametrización:** > Los valores de volumetría (cantidad de preguntas), límites de tiempo por pregunta, porcentajes de aprobación mínimos y umbrales de tolerancia para el *Early Exit* descritos en este documento representan la **configuración base y estándar estipulada pedagógicamente**. Sin embargo, la arquitectura del sistema está completamente parametrizada a través de la base de datos (`configuraciones_progreso`). Esto permite que un administrador pueda ajustar, balancear o modificar cualquiera de estos valores en tiempo real desde el Panel de Administración sin necesidad de alterar el código fuente ni realizar nuevos despliegues en el servidor.
---

## 6. Especificaciones Técnicas y de Base de Datos

Para garantizar el aislamiento de lógicas, el rendimiento y evitar campos nulos innecesarios, el sistema descarta el uso de una tabla maestra única. Toda fase debe mapearse obligatoriamente en **tres tablas independientes**, separando el contenido teórico, el entrenamiento y la evaluación:

### 6.1. Tabla 1: Fase de Aprendizaje y Evocación (`niveles_teoria_pool`)
Esta tabla se encarga exclusivamente del contenido estático y multimedia del carrusel inicial. Almacena la narrativa, los diccionarios conceptuales y las preguntas obligatorias de evocación que el alumno debe responder para desbloquear el nivel.
* **Datos requeridos:** Título, párrafo de bienvenida y superpoder.
* **Componentes JSONB estáticos:** El cuerpo secuencial de la teoría, las trampas cognitivas, el diccionario (traducción de términos a matemáticas), ejemplos paso a paso, y las 3 preguntas interactivas numéricas para desbloqueo.
* **Volumetría:** 1 registro por cada nivel de aprendizaje en la fase.

### 6.2. Tabla 2: Batería de Práctica Libre (`practica_libre_pool`)
Esta tabla es de uso exclusivo para la fase de entrenamiento asíncrono. Su estructura prohíbe las opciones múltiples (solo renderiza campos numéricos vacíos) y está diseñada obligatoriamente para agrupar preguntas en familias (Bucle Espejo).
* **Agrupación y Control:** Utiliza un identificador de familia (`estructura_padre_id`) que empaqueta las preguntas en bloques exactos de 4 iteraciones (1 original y 3 variantes).
* **Bloque de Rescate Obligatorio:** Requiere que cada pregunta cuente con su propio código de renderizado (HTML/Markdown) detallando el paso a paso visual y colorido para cuando el alumno falle repetidamente.
* **Volumetría Estricta:** El pool debe tener siempre sembradas **120 familias de preguntas por nivel** (equivale a 480 preguntas individuales por nivel).

### 6.3. Tabla 3: Zona de Evaluación y Desafíos (`desafios_pool`)
Esta tabla se desentiende por completo de la lógica espejo y del rescate pedagógico, enfocándose en la evaluación de alta intensidad mediante temporizadores estáticos y la regla de *Early Exit*.
* **Control de Formato:** Permite preguntas de tipo "Opción Múltiple" (para Desafío 1 y 2) y de tipo "Evocación Pura" (Desafío Final).
* **Tabla Auxiliar de Alternativas:** Para las opciones múltiples, incluye una sub-tabla conectada que inyecta textos, distractores pedagógicos y booleanos de corrección.
* **Volumetría Estricta:** El pool debe contar con un **mínimo de 150 preguntas individuales e independientes para cada uno de los desafíos** de la fase.

### 6.4. Esquemas JSONB para Tutoría e Interactivos

Ejemplo JSONB de heurística de errores previstos (almacenado como tabla adjunta a la práctica):

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

Ejemplo JSONB para los interactivos de desbloqueo (incluidos en la Tabla 1 - Teoría):

```json
[
  {
    "pregunta_id": "interactivo_1",
    "enunciado": "¿Qué operación se resuelve primero en: 5 + 4 × 2?",
    "respuesta_correcta": "multiplicacion",
    "feedback_acierto": "¡Excelente! La multiplicación manda.",
    "feedback_error": "¡Piénsalo mejor! Recuerda que la multiplicación tiene el escudo de oro y va antes que la suma."
  }
]


```

### 6.5. Reglas de Protección y Anti-Trampas (Edge Cases)

* **Fallo de Punto Flotante (IEEE 754):** El backend y la DB jamás deben operar con tipo Float para dinero. Todo se almacena como enteros (centavos).
* *Ejemplo:* R$ 2,50 se procesa internamente en el backend y base de datos como 250 centavos.
* **Protección del Estado de Sesión:** Si el alumno actualiza el navegador (F5), el frontend hidrata el estado desde la API para evitar que burle el *Early Exit* o el contador de `fallas_consecutivas_bucle`.
* **Tokenización de Textos (Evitar falsos negativos):** En preguntas donde el alumno interactúa con el texto, el frontend envía un array de IDs, no texto crudo.
* *Ejemplo Aplicado (Módulo 4 - Subrayado):* En la oración "Lucas tiene 5 manzanas rojas", el texto "5 manzanas rojas" es el token ID: 2 con el rol "dato_util". El frontend solo envía `{"tokens_seleccionados": [2]}`.

### 6.6. Sincronización de Progreso (Compatibilidad)

El sistema utiliza la tabla de `ProgresoMaestria` como la principal fuente de verdad autoritativa para el progreso por bloques y módulos. Sin embargo, para mantener compatibilidad con ciertos componentes del frontend (como el Dashboard de la Fase 1) que dependen de la lectura del perfil de configuración del usuario (`user.settings["unlockedLevels"]`), el backend aplica una lógica de sincronización espejo inalterable en todas las fases.

Cada vez que un administrador aprueba, bloquea o interviene manualmente un progreso (mediante el endpoint `/progress/override`), el servidor mapea automáticamente la operación (`suma`, `resta`, `multiplicacion`, `division`, `mixta`) a su clave correspondiente en inglés (`addition`, `subtraction`, `multiplication`, `division`, `challenge`) y sobrescribe el nivel en el diccionario `unlockedLevels` del usuario. Esto garantiza que cualquier cambio de estado se refleje de forma visual e instantánea en la interfaz gráfica del alumno, independientemente de si la fase lee los datos de la tabla relacional o del JSON de ajustes del usuario.

---

## 7. Checklist de Creación para Nuevas Fases

Cuando el equipo pedagógico y técnico comience el diseño de una nueva fase, debe entregar de forma obligatoria:

* [ ] **Documento de Diseño Lógico:** Definición del propósito de los módulos y las trampas conceptuales.
* [ ] **Guion de Textos:** Lecturas de entrada, diccionarios/analogías, mensajes de superpoder y los textos de feedback para aciertos/errores de los interactivos.
* [ ] **Población del Pool Estático (Base de datos):** La volumetría de generación debe respetar dos lógicas independientes según la tabla física asignada:
* **Para Práctica Libre (`practica_libre_pool`):** Exactamente 120 familias por nivel (480 preguntas agrupadas obligatoriamente por `estructura_padre_id` para garantizar 1 pregunta original, 3 variantes espejo y el campo de rescate profundo).
* **Para Zonas de Desafío (`desafios_pool`):** Mínimo 150 preguntas individuales e independientes (sin agrupación espejo ni asistencia) sembradas específicamente para cada uno de los 3 desafíos finales.


* [ ] **Scripts Inyectores (Python):** Scripts automatizados que calculen respuestas correctas, estructuren los esquemas JSONB de errores y realicen el INSERT masivo de manera limpia en PostgreSQL.
* [ ] **Mapeo de Errores (JSONB):** Definición explícita de los distractores y las respuestas del Tutor Invisible asociados a cada ítem del pool de práctica libre.

```

```


