Aquí tienes el **Documento Rector completo, definitivo y unificado** con todas las especificaciones arquitectónicas, pedagógicas y técnicas actualizadas. Está formateado de forma limpia en Markdown, listo para que lo copies y lo pegues en tu repositorio de documentación.

---

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

### 3.1. Textos y Teoría (Componentes de Entrega Estática)

Toda la carga teórica de un nivel se almacena de forma pre-renderizada en la base de datos. Para mantener el interés y asegurar la comprensión sin saturar al alumno, el contenido se divide en componentes visuales e inmersivos pre-diseñados:

* **Mensaje de Bienvenida (Declaración de Superpoder):** Tono motivacional, épico y centrado en el alumno. En lugar de definiciones abstractas, introduce el tema como una habilidad especial dentro de una temática o narrativa atractiva.
* **Cuerpo Teórico Concreto (Explicación Narrativa Corta):** Un bloque de texto de extensión moderada (un párrafo fluido) que introduce el concepto abstracto mediante analogías del mundo real, deportes o el entorno del juego (misiones, pócimas, monstruos). Debe ser directo pero descriptivo, conectando la lógica con la imaginación del niño. Estos textos están previamente diseñados y guardados de forma estática.
* **El Diccionario del Nivel (Glosario Visual):** Una lista corta y estructurada que traduce los términos narrativos o conceptuales directamente a su operador matemático explícito, sirviendo como la caja de herramientas que el niño usará en los ejercicios.

> **Ejemplo Guardado en Base de Datos (Módulo 2 - Multiplicadores):**
> * **Bienvenida/Cuerpo Teórico:** "¡Hola, atleta de la mente! Bienvenido al Gimnasio Numérico. Hoy vas a entrenar tus músculos lógicos con los Multiplicadores de Tamaño. Cuando doblas, triplicas o cuadruplicas un número, estás usando un rayo de crecimiento matemático. Si lo partes a la mitad, usas un rayo reductor."
> * **El Diccionario del Nivel:**
> * **El Doble:** Multiplica por 2 ($\times$ 2).
> * **El Triple:** Multiplica por 3 ($\times$ 3).
> * **La Mitad:** Divide entre 2 ($\div$ 2).
> * **El Cuádruple:** Multiplica por 4 ($\times$ 4).
> 
> 
> 
> 

* **Bloque de Advertencia ("Cuidado con la Trampa"):** Exposición explícita de la debilidad o error más común que cometen los niños en ese concepto. Visualmente se asocia a un antagonista (ej. *El Monstruo de la Prisa*, *El Distractor*).

> **Ejemplo Guardado (Módulo 1 - Jerarquías):** "¡Alerta! El monstruo del desorden quiere que operes siempre de izquierda a derecha. Si ves `4 + 3 × 2`, la trampa es hacer `4 + 3 = 7`. ¡No caigas! Las multiplicaciones tienen escudo de oro y se resuelven primero."

* **Ejemplos Guiados Estáticos:** Antes de pasar a los interactivos, el niño ve ejemplos resueltos previamente diseñados que ilustran la teoría y la advertencia. Este componente cuenta con un desglose visual paso a paso.
* **Interactivos de Desbloqueo (Flujo de Evocación Efectiva):** Bloque obligatorio de 3 preguntas de evocación pura (cuadro de texto `input` vacío, sin opciones múltiples) extraídas directamente de las relaciones del pool para validar la comprensión teórica antes de abrir la práctica libre.
Para maximizar la retención, **ambos escenarios (acierto y error) deben disparar una animación sutil seguida de la apertura de un recuadro explicativo** que refuerce el concepto pedagógico:
* **En caso de Acierto:** El recuadro del `input` ejecuta una animación sutil de destello verde. Acto caído, se abre un recuadro animado en pantalla con el mensaje "¡Correcto!" y el texto de refuerzo pedagógico que consolida el porqué esa respuesta es la correcta.
* **En caso de Error:** El recuadro del `input` ejecuta una animación sutil de "Piénsalo mejor" (ej. una vibración lateral suave o destello tenue). Acto seguido, se abre el mismo recuadro animado en pantalla mostrando la explicación pedagógica detallada del error común y el camino correcto para resolverlo, permitiendo al alumno aprender de la falla antes de volver a intentar.



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

> **Filosofía Antifrustración del Flujo:**
> La meta del módulo no es exigir una perfección rígida del 100% en un solo ítem a costa de destruir la experiencia del usuario. Tras pasar por 4 errores consecutivos y recibir la explicación profunda, el cerebro del alumno ya ha procesado la estructura visual y sintáctica del problema, formándose una idea clara de la estructura.
> Por lo tanto, **al cerrar el recuadro de rescate, el backend da la pregunta por completada, resetea el contador a cero (`fallas_consecutivas_bucle = 0`), mantiene intacto el progreso de la barra y permite al alumno continuar con la próxima pregunta de la batería**. No se le estanca ni se le frustra por un solo ejercicio; el juego continúa para mantener el ritmo y la motivación.

> **Filosofía de la Variante Espejo:**
> Ante un error, el alumno jamás debe ser castigado con un problema completamente nuevo que le exija reiniciar su mapa mental. La variante espejo lo enfrenta **al mismo concepto, con la misma estructura gramatical o sintáctica y la misma secuencia de operaciones**. Al mantener la estructura "casi idéntica", el alumno se familiariza con el patrón visual del problema, reduciendo la carga cognitiva y enfocando su energía en aplicar el feedback. Si el patrón falla 3 veces, el **Bloque de Rescate** modela el pensamiento correcto antes de dejarlo continuar.

* **Ejemplo Aplicado del Flujo Completo (Módulo 1 - Jerarquías):**
* *Pregunta Original:* `4 + 3 × 4` $\rightarrow$ *Falla del alumno (Escribe 28).*
* *Variante Espejo 1:* `5 + 2 × 3` $\rightarrow$ *Falla del alumno (Escribe 21).*
* *Variante Espejo 2:* `2 + 4 × 5` $\rightarrow$ *Falla del alumno (Escribe 30).*
* *Variante Espejo 3:* `6 + 3 × 2` $\rightarrow$ *Falla del alumno (Escribe 18).*
* **Acción del Servidor:** Detiene la batería de preguntas y despliega el **Bloque de Rescate** en pantalla con la explicación profunda de la prioridad de la multiplicación, ilustrada detalladamente a través de 3 ejemplos idénticos resueltos paso a paso. Tras cerrar el recuadro, el niño avanza a la siguiente pregunta guardando su progreso.



---

### 💡 Nota técnica para los desarrolladores:

El backend debe llevar un contador de `fallas_consecutivas_bucle` en el estado de la sesión actual. Este contador se incrementa con cada error en una variante espejo y se resetea a `0` únicamente cuando el alumno responde correctamente una variante espejo o cuando se cierra el componente del **Bloque de Rescate**.

---

## 4. Zona de Evaluación: Los Desafíos

Al terminar los niveles de práctica, el módulo se cierra con la **Zona de Desafíos**. Aquí se elimina por completo la red de seguridad (no existe el Bucle Espejo ni el Bloque de Rescate) y se exige velocidad de procesamiento. Todo módulo debe contener exactamente estos 3 desafíos indexados en el pool estático:

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

---

## 6. Especificaciones Técnicas y de Base de Datos

Para que los nuevos módulos se acoplen a la API FastAPI y a PostgreSQL sin romper el sistema, deben cumplir con los siguientes estándares:

### 6.1. Creación de Tablas para el Pool Estático (Estructura Base)

Las preguntas de la Batería Libre y Desafíos se gestionan mediante las siguientes entidades relacionales en la base de datos:

```sql
CREATE TABLE preguntas_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id INT NOT NULL,
    nivel_id INT NOT NULL,
    tipo_segmento VARCHAR(50) NOT NULL, -- 'desbloqueo', 'practica', 'desafio_1', 'desafio_2', 'desafio_final'
    estructura_padre_id UUID NULL,       -- Agrupa una pregunta original con sus variantes espejo
    enunciado_visual TEXT NOT NULL,      -- Lo que el niño lee (ej: '4 + 3 × 4')
    respuesta_correcta TEXT NOT NULL,    -- Almacenada como string para soportar enteros o tokens
    explicacion_profunda TEXT NOT NULL,  -- Bloque pedagógico para el recuadro interactivo o rescate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE respuestas_erroneas_jsonb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregunta_id UUID REFERENCES preguntas_pool(id) ON DELETE CASCADE,
    mapeo_errores JSONB NOT NULL         -- Almacena heurística de errores previstos
);

```

### 6.2. Tabla de Base de Datos para Contenido Teórico

Para soportar el contenido explicativo y estructurado de la Sección 3.1:

```sql
CREATE TABLE niveles_teoria_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id INT NOT NULL,
    nivel_id INT NOT NULL,
    bienvenida_superpoder TEXT NOT NULL,
    cuerpo_teoria JSONB NOT NULL,        -- Contiene los párrafos fragmentados secuenciales
    trampa_advertencia TEXT NOT NULL,
    ejemplo_guiado JSONB NOT NULL,       -- { "enunciado": "...", "pasos_resolucion": ["p1", "p2"] }
    interactivos_desbloqueo JSONB NOT NULL, -- Array con las 3 preguntas, respuestas y feedbacks de destello
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### 6.3. Esquemas JSONB para Tutoría e Interactivos

* **Ejemplo JSONB para `mapeo_errores` (Práctica/Desafíos):**

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

* **Ejemplo JSONB para `interactivos_desbloqueo` (Teoría):**

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

### 6.4. Reglas de Protección y Anti-Trampas (Edge Cases)

1. **Fallo de Punto Flotante (IEEE 754):** El backend y la DB **jamás** deben operar con tipo `Float` para dinero. Todo se almacena como enteros (centavos).

> **Ejemplo:** `R$ 2,50` se procesa internamente en el backend y base de datos como `250` centavos.

2. **Protección del Estado de Sesión:** Si el alumno actualiza el navegador (F5), el frontend hidrata el estado desde la API para evitar que burle el `Early Exit` o el contador de `fallas_consecutivas_bucle`.
3. **Tokenización de Textos (Evitar falsos negativos):** En preguntas donde el alumno interactúa con el texto, el frontend envía un array de IDs, no texto crudo.

> **Ejemplo Aplicado (Módulo 4 - Subrayado):** En la oración "Lucas tiene 5 manzanas rojas", el texto "5 manzanas rojas" es el token `ID: 2` con el rol `"dato_util"`. El frontend solo envía `{"tokens_seleccionados": [2]}`.

---

## 7. Checklist de Creación para Nuevas Fases

Cuando el equipo pedagógico y técnico comience el diseño de una nueva fase, debe entregar de forma obligatoria:

1. [ ] **Documento de Diseño Lógico:** Definición del propósito de los módulos y las trampas conceptuales.
2. [ ] **Guion de Textos:** Lecturas de entrada, diccionarios/analogías, mensajes de superpoder y los textos de feedback para aciertos/errores de los interactivos.
3. [ ] **Población del Pool Estático (Base de datos):** Mínimo 150 preguntas agrupadas estructuralmente mediante `estructura_padre_id` (para asegurar suficientes variantes espejo por cada nivel de práctica y ítems para desafíos).
4. [ ] **Scripts Inyectores (Python):** Scripts automatizados que calculen respuestas correctas, estructuren los esquemas JSONB de errores y realicen el `INSERT` masivo de manera limpia en PostgreSQL.
5. [ ] **Mapeo de Errores (JSONB):** Definición explícita de los distractores y las respuestas del Tutor Invisible asociados a cada ítem del pool de práctica.