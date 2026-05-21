# Documento de Reglas para Generación y Carga de Preguntas — Fase 2 LogicaKids Pro

**Estado:** Documento base de trabajo
**Fase:** Fase 2 — Desarrollo Numérico y Razonamiento
**Proyecto:** LogicaKids Pro

---

# 1. Propósito del Documento

Este documento define las directrices pedagógicas, técnicas y operativas para la generación, almacenamiento, validación y presentación de preguntas correspondientes a la **Fase 2 de LogicaKids Pro**, denominada **“Desarrollo Numérico y Razonamiento”**.

La Fase 2 tiene como objetivo principal desarrollar en el alumno las siguientes competencias:

1. Seguridad numérica.
2. Cálculo mental avanzado.
3. Comprensión práctica del sistema monetario brasileño (**R$**).
4. Lectura e interpretación matemática de problemas.
5. Capacidad para elegir operaciones adecuadas y resolver problemas paso a paso.

Para alcanzar estos objetivos, el sistema adopta una **arquitectura híbrida de generación de preguntas con autoridad en el servidor** (*Server-Authoritative*).

Esto significa que el backend es responsable de:

* generar preguntas cuando corresponda;
* validar respuestas;
* calcular resultados correctos;
* controlar la progresión del alumno;
* registrar intentos;
* activar tutoría invisible;
* y garantizar que el frontend no pueda alterar la lógica pedagógica ni los criterios de aprobación.

En esta arquitectura, los módulos matemáticos de cálculo estructurado utilizan **generación aleatoria controlada desde el backend**, mientras que los módulos de lectura, interpretación y razonamiento complejo utilizan **preguntas preparadas, plantillas dinámicas y estructuras JSONB almacenadas en PostgreSQL**.

---

# 2. Regla General de Generación de Preguntas

La Fase 2 utiliza un modelo híbrido controlado íntegramente por el backend FastAPI.

```text
Módulos 1, 2 y 3:
Usar generación aleatoria controlada en el servidor.

Módulos 4 y 5:
Usar base de datos de preguntas preparadas en PostgreSQL.

En ciertos niveles:
Usar motor de plantillas dinámicas almacenadas como JSONB en la base de datos.
```

Esta separación busca equilibrar tres necesidades fundamentales del sistema:

1. **Infinidad de ejercicios** para cálculo rápido y automatización mental.
2. **Control pedagógico estricto** en problemas de texto e interpretación.
3. **Prevención de memorización mecánica**, mediante variaciones controladas y dinámicas.

El criterio central es el siguiente:

* cuando la pregunta depende principalmente de operaciones matemáticas simples o patrones numéricos, se genera de forma controlada en el backend;
* cuando la pregunta depende de lenguaje, contexto narrativo, distractores o pasos encadenados, se almacena y administra desde la base de datos.

---

# 3. Definición de Métodos de Generación

## 3.1. Generación Aleatoria Controlada

La **generación aleatoria controlada** permite que el servidor FastAPI cree preguntas automáticamente en tiempo real, siguiendo reglas previamente definidas por módulo, nivel y tipo de habilidad.

Este método debe aplicar:

* rangos numéricos controlados;
* restricciones matemáticas;
* dificultad progresiva;
* control de operaciones permitidas;
* validación automática de la respuesta correcta;
* generación de explicación cuando corresponda.

### Ejemplo aplicado al Módulo 3 — Tienda Matemática

**Nivel:** Carrito de Compras
**Regla:** generar sumas de valores decimales que representen dinero, restringiendo las terminaciones a:

```text
,00 | ,25 | ,50 | ,75
```

**Pregunta generada:**

> Un pan cuesta R$ 1,75. Un jugo cuesta R$ 2,50. ¿Cuánto cuestan juntos?

**Respuesta correcta:**

```text
R$ 4,25
```

La respuesta debe ser calculada, almacenada temporalmente y validada por el backend, evitando que el frontend controle el resultado.

---

## 3.2. Base de Datos de Preguntas Preparadas

La **base de datos de preguntas preparadas** se utiliza cuando la pregunta depende de lenguaje, contexto, lectura matemática, distractores o razonamiento secuencial.

Este método es obligatorio para preguntas donde sea necesario controlar:

* enunciado narrativo;
* datos útiles;
* distractores;
* operación lógica esperada;
* explicación paso a paso;
* errores previstos;
* feedback de tutoría invisible.

### Ejemplo

**Enunciado:**

> Carlos tenía R$ 50,00. Compró un libro por R$ 18,00 y un lápiz por R$ 4,00. Después recibió R$ 10,00 de su madre. ¿Cuánto dinero tiene ahora?

**Solución secuencial esperada:**

1. `18 + 4 = 22` → gasto total.
2. `50 - 22 = 28` → dinero restante.
3. `28 + 10 = 38` → dinero final.

**Respuesta correcta:**

```text
R$ 38,00
```

---

## 3.3. Plantillas Dinámicas

Las **plantillas dinámicas** permiten que el equipo pedagógico defina una estructura fija en formato JSONB, mientras que el backend reemplaza nombres, productos, cantidades y valores numéricos en tiempo real.

Este método permite generar múltiples variaciones sin perder control semántico ni pedagógico.

### Ejemplo de plantilla

```text
{nombre} tenía R$ {dinero_inicial}. Compró {producto} por R$ {precio}. ¿Cuánto dinero le sobró?
```

### Ejemplo generado

> Ana tenía R$ 10,00. Compró un jugo por R$ 2,50. ¿Cuánto dinero le sobró?

**Respuesta:**

```text
R$ 7,50
```

Las plantillas dinámicas son especialmente útiles para evitar repetición excesiva, manteniendo una misma habilidad matemática con diferentes escenarios.

---

# 4. Reglas por Módulo

## 4.1. Módulo 1 — Gimnasio Numérico Mental

**Método principal:** generación aleatoria controlada en backend, con preguntas fijas de práctica seleccionadas por plantilla y validación server-authoritative.

**Propósito pedagógico:** romper el miedo inicial a los números, entrenar la agilidad mental y construir las bases del pensamiento algebraico mediante la traducción de proporciones y el respeto de la jerarquía aritmética.

**Público objetivo:** niños de aproximadamente 10 años.

**Principio de diseño:** eliminar enunciados largos que fatiguen la lectura y priorizar instrucciones claras, cortas y lineales.

**Enfoque de control:** autoridad absoluta del servidor. En las fases de aprendizaje y práctica, todas las respuestas se ingresan en un cuadro de texto vacío (`input`), forzando la evocación pura y evitando que el alumno adivine mediante opciones múltiples.

**Regla de tiempo:** las fases de nivel del Módulo 1 no tienen temporizador. El entrenamiento debe ser seguro, progresivo y sin presión.

---

## 4.1.1. Lógica conceptual del Módulo 1

El Módulo 1 es la puerta de entrada al universo de LogicaKids Pro.

Su objetivo no es que el alumno resuelva operaciones gigantescas, sino que automatice dos habilidades fundamentales:

1. **Decodificación semántica:** traducir palabras del lenguaje natural a operaciones matemáticas.
2. **Inhibición del impulso:** evitar resolver expresiones de izquierda a derecha cuando existe prioridad algebraica.

La lógica cognitiva del módulo puede representarse así:

```text
Lenguaje natural → Traducción matemática → Estructura algebraica → Resolución mental
```

El módulo ataca directamente uno de los errores más comunes en niños de esta edad: operar por impulso visual.

Ejemplo de error típico:

```text
5 + 3 × 2
```

El alumno impulsivo puede calcular:

```text
5 + 3 = 8
8 × 2 = 16
```

Pero el razonamiento correcto exige frenar, reconocer la prioridad de la multiplicación y resolver:

```text
3 × 2 = 6
5 + 6 = 11
```

Por eso, el Módulo 1 premia la pausa analítica, no la velocidad ciega.

---

## 4.1.2. Arquitectura general del flujo del usuario

Cada nivel del Módulo 1 sigue un flujo lineal e infranqueable controlado por el backend.

El alumno no puede saltar secciones, evitar la práctica ni avanzar por simple navegación del frontend.

### Fase A — Calentamiento teórico dentro de la aplicación

El frontend solicita el inicio del nivel y el backend entrega el contenido teórico fragmentado.

Cada nivel debe presentar:

1. bloque teórico corto;
2. ejemplo matemático puro;
3. ejemplo contextualizado breve;
4. bloque de advertencia “Cuidado con la trampa”;
5. tres interacciones de evocación con `input` vacío.

En las interacciones de evocación:

* si la respuesta es correcta, se desbloquea el siguiente fragmento;
* si la respuesta es incorrecta, el input se limpia y el alumno intenta de nuevo;
* no hay penalización durante esta fase;
* no se avanza hasta que el alumno evoque correctamente el número esperado.

---

### Fase B — Batería de práctica libre

Después de completar la lectura oficial y los interactivos, el servidor activa una sesión de práctica.

Cada nivel de práctica del Módulo 1 contiene:

```text
25 preguntas fijas
```

Características:

* sin temporizador;
* sin opciones múltiples;
* respuesta por `input` numérico;
* validación en backend;
* activación del Bucle Espejo ante errores;
* progresión controlada por `indice_actual` de la sesión.

Flujo básico:

1. El backend crea o recupera la sesión de práctica.
2. El backend envía la pregunta correspondiente al `indice_actual`.
3. El alumno calcula mentalmente y digita la respuesta.
4. El frontend envía la respuesta al endpoint de validación.
5. El backend valida, registra el intento y decide la siguiente acción.

---

## 4.1.3. Máquina de estados del Bucle Espejo

El **Bucle Espejo** es el mecanismo de tutoría invisible del Módulo 1.

Cuando el alumno falla, el sistema no debe limitarse a marcar error. Debe identificar el tipo de tropiezo, congelar el avance y entregar una variante equivalente para entrenar el mismo concepto sin inducir memorización visual.

### Flujo lógico

```text
¿Respuesta correcta?
        │
        ├── Sí → limpiar estado espejo → avanzar a la siguiente pregunta
        │
        └── No → congelar indice_actual → diagnosticar error
                    │
                    ├── Nivel espejo < 3 → cargar feedback + variante espejo
                    │
                    └── Nivel espejo = 3 → activar asistencia avanzada + avanzar por frustración
```

### Escenario A — El alumno acierta

Cuando la respuesta es correcta, el backend debe:

1. registrar el intento como correcto;
2. incrementar `indice_actual` en +1;
3. limpiar cualquier estado espejo anterior;
4. enviar la siguiente pregunta del pool;
5. finalizar el nivel si no quedan preguntas.

---

### Escenario B — El alumno se equivoca

Si el alumno falla, el backend debe:

1. registrar el intento incorrecto;
2. congelar el `indice_actual`;
3. identificar el tipo de error;
4. devolver feedback quirúrgico;
5. cargar una variante espejo si aún no alcanzó el límite;
6. impedir el avance directo por simple reintento visual.

Ejemplo:

**Pregunta original:**

```text
4 + 3 × 4
```

**Respuesta correcta:**

```text
16
```

Si el alumno responde `28`, probablemente aplicó el error de izquierda a derecha:

```text
4 + 3 = 7
7 × 4 = 28
```

El backend puede devolver un feedback como:

```text
Le quitaste el poder al Jefe Supremo. Multiplicar va primero.
```

Luego, al presionar “Reintentar”, el sistema no debe mostrar la misma pregunta, sino una variante espejo:

```text
5 + 2 × 3
```

La estructura conceptual es la misma, pero los números cambian.

---

### Límite de frustración

Si el alumno falla tres veces consecutivas dentro del Bucle Espejo, el backend debe asumir bloqueo conceptual.

En ese caso debe:

1. mostrar asistencia avanzada;
2. registrar el evento para analítica docente;
3. evitar castigo repetitivo;
4. avanzar controladamente a la siguiente pregunta;
5. preservar la motivación del alumno.

Esta regla evita que el software se transforme en una fuente de estrés.

---

# 4.1.4. Estructura pedagógica por niveles

El Módulo 1 queda organizado en tres niveles principales de entrenamiento y un bloque posterior de evaluación cronometrada.

---

## Nivel 1 — Escalas y Proporciones: “El amplificador de números”

### Objetivo

Enseñar al alumno a traducir palabras cotidianas en operadores matemáticos.

El alumno debe comprender que:

```text
el doble  → × 2
el triple → × 3
la mitad  → ÷ 2
```

También puede introducirse progresivamente:

```text
el cuádruple → × 4
```

---

### Texto oficial de entrada

¡Hola, atleta mental! Bienvenido al Módulo 1 de LogicaKids. Hoy vas a entrar al Gimnasio Numérico. Tu primer superpoder será aprender a amplificar y encoger números al instante usando palabras clave del lenguaje diario.

En la vida real, las personas usan palabras como “el doble”, “el triple” o “la mitad” para cambiar el tamaño de las cosas. Tu trabajo de detective es traducir esas palabras en símbolos matemáticos de multiplicación y división.

---

### Diccionario del amplificador

| Expresión    | Traducción matemática |
| ------------ | --------------------- |
| El doble     | `× 2`                 |
| El triple    | `× 3`                 |
| La mitad     | `÷ 2`                 |
| El cuádruple | `× 4`                 |

---

### Ejemplo matemático puro

```text
El triple de 8
```

Se traduce como:

```text
8 × 3 = 24
```

Respuesta:

```text
24
```

---

### Ejemplo contextualizado

Lucas tiene 6 canicas brillantes en su mano. Sofía tiene el doble de canicas que Lucas.

La palabra “doble” ordena multiplicar por 2:

```text
6 × 2 = 12
```

Sofía tiene:

```text
12 canicas
```

---

### Trampa conceptual del nivel

El error común es confundir “el doble” con “sumar 2”.

Camino incorrecto:

```text
5 + 2 = 7
```

Camino correcto:

```text
5 × 2 = 10
```

Regla pedagógica:

```text
El doble no suma 2. El doble multiplica por 2.
```

---

### Interactivos oficiales del Nivel 1

**Interactivo 1:**

Un mago saca 5 conejos de su sombrero y en el siguiente truco logra conseguir el triple de esa cantidad. ¿Cuántos conejos tiene ahora?

Respuesta esperada:

```text
15
```

---

**Interactivo 2:**

Valentina guardó 16 chocolates en su mochila, pero al llegar a la escuela descubrió que se comió la mitad. ¿Cuántos chocolates le quedan útiles?

Respuesta esperada:

```text
8
```

---

**Interactivo 3:**

Un juguete pequeño cuesta R$ 4,00 en la tienda. Un juego de mesa grande cuesta el cuádruple de ese precio. ¿Cuánto cuesta el juego de mesa?

Respuesta esperada:

```text
16
```

---

### Batería de práctica del Nivel 1

Al presionar “Entendido”, el backend libera una batería de:

```text
25 preguntas fijas sin tiempo
```

Todas las preguntas deben exigir respuesta por `input` numérico.

El servidor debe validar el cálculo mental y activar el Bucle Espejo ante errores con amplificadores.

---

## Nivel 2 — El Orden de las Operaciones: “La ley de los símbolos”

### Objetivo

Enseñar al alumno a respetar la jerarquía aritmética.

El alumno debe comprender que no siempre se resuelve de izquierda a derecha.

Regla central:

```text
Multiplicación y división primero.
Suma y resta después.
```

---

### Texto oficial de entrada

¡Excelente calentamiento! Ya sabes usar la lupa mágica de las proporciones. Ahora vas a aprender la regla de oro más importante del gimnasio: el Orden de las Operaciones.

Cuando ves una fila de números con sumas, restas y multiplicaciones juntas, no puedes resolverlas en el orden que te dé la gana. En matemática existe una ley de prioridades.

---

### Ley del trono matemático

| Jerarquía      | Operaciones | Regla                 |
| -------------- | ----------- | --------------------- |
| Jefes Supremos | `×` y `÷`   | Se resuelven primero  |
| Soldados       | `+` y `-`   | Se resuelven al final |

---

### Ejemplo matemático puro

```text
4 + 3 × 2
```

Primero se resuelve la multiplicación:

```text
3 × 2 = 6
```

Luego se suma:

```text
4 + 6 = 10
```

Respuesta:

```text
10
```

---

### Ejemplo contextualizado

Tienes 5 manzanas en una cesta. Tu mamá te regala 2 bolsas nuevas, y cada bolsa trae 3 manzanas dentro.

La operación es:

```text
5 + 2 × 3
```

Primero se calculan las bolsas:

```text
2 × 3 = 6
```

Luego se suma la cesta inicial:

```text
5 + 6 = 11
```

Respuesta:

```text
11 manzanas
```

---

### Trampa conceptual del nivel

El error común es operar de izquierda a derecha sin respetar jerarquía.

Camino incorrecto:

```text
4 + 3 = 7
7 × 2 = 14
```

Camino correcto:

```text
3 × 2 = 6
4 + 6 = 10
```

Regla pedagógica:

```text
Primero mandan multiplicación y división.
```

---

### Interactivos oficiales del Nivel 2

**Interactivo 1:**

Resuelve en tu mente respetando la prioridad del jefe supremo:

```text
10 - 2 × 4
```

Respuesta esperada:

```text
2
```

---

**Interactivo 2:**

Aplica la ley del trono matemático:

```text
3 × 5 + 4
```

Respuesta esperada:

```text
19
```

---

**Interactivo 3:**

Resuelve calculando primero la división:

```text
20 ÷ 4 + 2
```

Respuesta esperada:

```text
7
```

---

### Batería de práctica del Nivel 2

El sistema cargará:

```text
25 preguntas fijas sin tiempo
```

Las preguntas deben enfocarse en jerarquía aritmética de dos bloques.

Ejemplos:

```text
6 + 4 × 3
15 - 9 ÷ 3
```

El backend debe custodiar cada ejercicio mediante el Bucle Espejo, reforzando la inhibición del impulso de operar de izquierda a derecha.

---

## Nivel 3 — Refuerzo e Integración: “El circuito del gimnasio”

### Objetivo

Integrar los dos superpoderes anteriores:

1. traducir proporciones;
2. respetar jerarquía aritmética.

En este nivel, el alumno debe leer instrucciones breves, traducirlas a operaciones y resolverlas mentalmente.

---

### Texto oficial de entrada

¡Eres todo un profesional! Ya sabes traducir palabras clave y respetas la ley del trono matemático. Has llegado al último nivel del Gimnasio Numérico: el Circuito Combinado.

En este nivel no hay trucos nuevos. El desafío es unir ambos superpoderes al mismo tiempo.

---

### Construcción de operación combinada

Historia base:

```text
El triple de cuatro, y a ese resultado le restas dos.
```

Paso 1 — traducir:

```text
4 × 3
```

Paso 2 — armar y resolver:

```text
4 × 3 - 2
12 - 2 = 10
```

Respuesta:

```text
10
```

---

### Trampa conceptual del nivel

El error común es aplicar la proporción al número equivocado o alterar el orden real de la historia.

Ejemplo:

```text
Sofía tiene 6 chocolates, su tío le duplica la cantidad y luego se come 3.
```

Camino incorrecto:

```text
6 - 3 = 3
3 × 2 = 6
```

Camino correcto:

```text
6 × 2 = 12
12 - 3 = 9
```

Regla pedagógica:

```text
Primero sigue el orden lógico de la historia. Después aplica la jerarquía matemática.
```

---

### Interactivos oficiales del Nivel 3

**Interactivo 1:**

Traduce y calcula:

```text
El triple de cinco, más dos.
```

Respuesta esperada:

```text
17
```

---

**Interactivo 2:**

Mateo comenzó el juego con 8 puntos. En la ronda de bonificación logró duplicar sus puntos, pero al final recibió una penalización de 4 puntos. ¿Con cuántos puntos netos terminó?

Respuesta esperada:

```text
12
```

---

**Interactivo 3:**

Encuentra el valor exacto:

```text
La mitad de treinta, más el doble de dos.
```

Respuesta esperada:

```text
19
```

---

### Batería de práctica del Nivel 3

Al presionar “Entendido”, el backend activa el pool de cierre del Módulo 1:

```text
25 preguntas fijas sin opciones y sin tiempo
```

El sistema debe mezclar:

* lenguaje proporcional;
* jerarquía aritmética;
* operaciones combinadas;
* contextos cortos;
* traducciones semánticas.

Al superar este bloque, el backend desbloquea formalmente el acceso a los Desafíos Finales Cronometrados del Módulo 1.

---

# 4.1.5. Bloque de evaluación — Desafíos del Módulo 1

Una vez completados los tres niveles de práctica, el alumno ingresa a la Zona de Desafíos.

A diferencia de la práctica, los desafíos sí tienen temporizador y criterios de cierre estricto.

---

## Pantalla de bienvenida y reglas del torneo

Texto sugerido de interfaz:

> ¡Atención, atleta de la lógica! Has completado con éxito todo el entrenamiento del Gimnasio Numérico Mental. Las pesas libres se han cerrado y las pistas de práctica ya no están disponibles. Has ingresado a la Zona de Desafíos.
>
> Antes de presionar el botón de inicio, lee con atención las reglas de la arena.

Reglas visibles:

1. **El tiempo empieza a correr:** una barra superior medirá la velocidad. Si se vacía por completo, la pregunta se cuenta como error automático.
2. **Sin red de seguridad:** aquí no hay Bucle Espejo ni explicaciones intermedias. Si el alumno falla, el sistema pasa a la siguiente pregunta.
3. **Salida temprana:** el servidor vigila los errores. Si se acumulan demasiados fallos, la prueba se cierra automáticamente y el alumno regresa a entrenar.

---

## Desafío 1 — Filtros de Reconocimiento Aritmético

**Dificultad:** estándar.

**Formato de interacción:** opción múltiple A, B, C, D.

**Contenido de la batería:**

```text
25 preguntas
```

**Enfoque:**

* traducciones directas de escalas del Nivel 1;
* jerarquía simple con un operador fuerte del Nivel 2.

**Temporizador:**

```text
45 segundos por pregunta
```

**Regla de cierre Early Exit:**

```text
expulsión automática al 3er error
```

**Criterio de aprobación:**

```text
mínimo 90% = 23 de 25 respuestas correctas
```

### Ejemplo 1 — Traducción de escala

Sofía tiene 7 tazos de colección. Lucas tiene el triple de tazos que Sofía. ¿Cuántos tazos tiene Lucas?

```text
A) 10  → error común: sumó 3 en lugar de multiplicar
B) 21  → correcto: 7 × 3 = 21
C) 14
D) 28
```

### Ejemplo 2 — Jerarquía simple

Resuelve respetando las leyes del gimnasio:

```text
6 + 4 × 2
```

```text
A) 20  → error de impulso: sumó de izquierda a derecha
B) 12
C) 14  → correcto: 4 × 2 = 8; 6 + 8 = 14
D) 16
```

---

## Desafío 2 — Jerarquías Complejas

**Dificultad:** avanzada.

**Formato de interacción:** opción múltiple A, B, C, D.

**Contenido de la batería:**

```text
25 preguntas
```

**Enfoque:**

* expresiones aritméticas de bloques múltiples;
* dos multiplicaciones separadas por suma o resta;
* problemas de contexto cruzados del Nivel 3.

**Temporizador:**

```text
60 segundos por pregunta
```

Se concede más tiempo porque las operaciones requieren doble procesamiento mental.

**Regla de cierre Early Exit:**

```text
expulsión automática al 3er error
```

**Criterio de aprobación:**

```text
mínimo 90% = 23 de 25 respuestas correctas
```

### Ejemplo 1 — Bloques múltiples secos

Calcula el resultado neto:

```text
5 × 4 - 3 × 2
```

```text
A) 34
B) 14  → correcto: 20 - 6 = 14
C) 11
D) 26
```

### Ejemplo 2 — Contexto integrado avanzado

El doble de diez, y a ese resultado le sumas la mitad de doce. ¿Cuál es el número final?

```text
A) 32
B) 22
C) 26  → correcto: 10 × 2 = 20; 12 ÷ 2 = 6; 20 + 6 = 26
D) 16
```

---

## Desafío Final — El Gran Atleta Mental

**Dificultad:** maestría pura.

**Formato de interacción:** evocación pura por `input`, sin opciones.

El estudiante se enfrenta al vacío conceptual: debe calcular mentalmente y digitar el valor exacto.

**Contenido de la batería:**

```text
10 preguntas selectas
```

**Enfoque:**

* automatización del reflejo;
* fusión de operaciones mixtas;
* jerarquía aritmética;
* traducción textual breve;
* precisión sin apoyo visual.

**Temporizador:**

```text
45 segundos por pregunta
```

**Regla de cierre estricta:**

```text
cancelación automática al 2do error
```

**Criterio de aprobación:**

```text
mínimo 90% = 9 de 10 respuestas correctas
```

### Ejemplo 1 — Evocación en seco

```text
30 - 15 ÷ 3
```

Respuesta esperada:

```text
25
```

Explicación interna:

```text
15 ÷ 3 = 5
30 - 5 = 25
```

---

### Ejemplo 2 — Evocación textual combinada

Mateo tiene 4 cajas con 3 lápices cada una. Si su hermana le regala el doble de 5 lápices más, ¿cuántos lápices tiene Mateo en total?

Respuesta esperada:

```text
22
```

Explicación interna:

```text
4 × 3 = 12
5 × 2 = 10
12 + 10 = 22
```

---

# 4.1.6. Reglas técnicas del generador de evaluaciones del Módulo 1

El backend debe generar o seleccionar las preguntas de evaluación separándolas por el campo:

```text
sub_tipo_desafio
```

Valores permitidos:

```text
desafio_1_estandar
desafio_2_avanzado
desafio_final_maestria
```

También debe incluirse el campo:

```text
tipo_interfaz
```

Valores esperados:

```text
opcion_multiple
evocacion_pura_input
```

---

## Esquema recomendado para preguntas de desafío

```json
{
  "modulo_id": 1,
  "sub_tipo_desafio": "desafio_1_estandar",
  "tipo_interfaz": "opcion_multiple",
  "tiempo_limite_segundos": 45,
  "enunciado": "Calcula rápido respetando las prioridades: 6 + 4 × 2",
  "opciones": {
    "A": "20",
    "B": "12",
    "C": "14",
    "D": "16"
  },
  "respuesta_correcta": "C"
}
```

Para el desafío final:

```json
{
  "modulo_id": 1,
  "sub_tipo_desafio": "desafio_final_maestria",
  "tipo_interfaz": "evocacion_pura_input",
  "tiempo_limite_segundos": 45,
  "enunciado": "Digita el valor neto exacto sin fallar: 30 - 15 ÷ 3",
  "respuesta_correcta": "25"
}
```

---

# 4.1.7. Reglas de implementación obligatorias para el Módulo 1

1. Las fases de aprendizaje no deben tener temporizador.
2. Las prácticas de nivel deben usar `input`, no opción múltiple.
3. El frontend no debe validar respuestas como autoridad final.
4. El backend debe controlar avance, errores, desbloqueos y variantes espejo.
5. El Bucle Espejo debe generar o seleccionar variantes equivalentes, no repetir visualmente la misma pregunta.
6. El límite de frustración debe activarse al tercer fallo consecutivo dentro del Bucle Espejo.
7. Los desafíos finales sí pueden usar temporizador.
8. Los desafíos 1 y 2 usan opción múltiple.
9. El Desafío Final usa evocación pura por `input`.
10. La salida temprana debe aplicarse en los desafíos para evitar intentos largos sin posibilidad real de aprobación.
11. Todo intento debe registrarse para analítica futura.
12. El desbloqueo del Módulo 2 solo ocurre después de aprobar el flujo definido del Módulo 1.

---

# 4.1.8. Resumen operativo del Módulo 1

| Bloque                                |         Formato |     Cantidad |        Tiempo | Bucle Espejo |             Aprobación |
| ------------------------------------- | --------------: | -----------: | ------------: | -----------: | ---------------------: |
| Nivel 1 — Escalas y Proporciones      |           Input | 25 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 2 — Orden de Operaciones        |           Input | 25 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 3 — Refuerzo e Integración      |           Input | 25 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Desafío 1 — Reconocimiento Aritmético | Opción múltiple | 25 preguntas | 45 s/pregunta |           No |                  23/25 |
| Desafío 2 — Jerarquías Complejas      | Opción múltiple | 25 preguntas | 60 s/pregunta |           No |                  23/25 |
| Desafío Final — Gran Atleta Mental    |           Input | 10 preguntas | 45 s/pregunta |           No |                   9/10 |

El Módulo 1 queda cerrado como un flujo completo de entrenamiento, refuerzo y evaluación. Su diseño protege emocionalmente al alumno durante la práctica, pero exige precisión y automatización durante los desafíos finales.

---

✖️ MÓDULO 2: TABLAS EN ACCIÓN (DISEÑO CONCEPTUAL)

* **Propósito Pedagógico:** Demostrar que toda operación matemática tiene un "camino de regreso". Desarrollar la flexibilidad cognitiva al conectar la suma con la resta, y la multiplicación con la división, preparando el terreno para el despeje algebraico intuitivo.
* **Mecánica de Control:** Motor de plantillas interactivas calculadas en tiempo de ejecución por el servidor (*Server-Authoritative template engine*). El sistema cambia los números dinámicamente en cada sesión.
* **Mecánica de Interfaz:** Inputs de evocación pura (sin opciones) en las prácticas de nivel para evitar el desvío por adivinación, mutando a opción múltiple estructurada únicamente en los primeros dos desafíos.

---

# [DOCUMENTO DE TEXTO: LECTURAS OFICIALES E INTERACTIVOS — MÓDULO 2]

## 👑 Nivel 1: Operación Inversa — Suma y Resta (¡El camino de regreso!)

¡Hola de nuevo, científico de la lógica! Bienvenido al Módulo 2. Hoy vas a descubrir un secreto increíble sobre los números: **las operaciones matemáticas tienen superpoderes inversos**. Esto significa que todo lo que un símbolo construye, su símbolo compañero lo puede deshacer.

La **Suma (+)** y la **Resta (-)** son compañeras de equipo inseparables. Si una suma te hace avanzar hacia adelante en la recta numérica, una resta te permite regresar exactamente al mismo punto de partida. ¡Es como el botón de "deshacer" de tu computadora!

---

### 🔙 El Botón de Deshacer Aditivo

Mira cómo funciona este viaje de ida y vuelta:

* **El viaje de ida (Suma):** Tienes 7 tazos. Te encuentras 3 tazos más. Ahora tienes: `7 + 3 = 10`.
* **El viaje de regreso (Resta):** Tienes los 10 tazos, pero le devuelves los 3 tazos a la caja. ¿Con qué te quedas? `10 - 3 = 7`. ¡Regresaste al 7 del inicio!
* **Ejemplo 1 (Matemático Puro):** Si sabes que `12 + 5 = 17`, entonces sabes automáticamente y sin calcular de nuevo que `17 - 5 = 12`.
* **Ejemplo 2 (Contexto corto y directo):** Sofía metió 8 galletas en un frasco. Su hermano metió algunas más y ahora hay 14 galletas. Para deshacer el camino y saber cuántas galletas metió su hermano, restas el inicio del final: `14 - 8 = 6`. Su hermano metió 6 galletas.

---

> ⚠️ **¡Cuidado con la Trampa del Cambio de Lugar!**
> El monstruo del desorden quiere que pienses que al regresar puedes restar los números en cualquier orden. ¡Cuidado! En la resta, el número más grande (el total acumulado) siempre debe ir adelante.
> * **❌ El Camino Incorrecto (La Trampa):** Para revertir `8 + 6 = 14`, intentar escribir `6 - 14`. ¡Eso es imposible de resolver en tu mente a los 10 años!
> * **✅ El Camino Correcto:** Tomas el gran total obtenido (`14`), lo pones al frente de la fila y le quitas uno de los pedazos: `14 - 6 = 8`. ¡El camino de regreso es perfecto!
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Si una pista de autos dice que `25 + 10 = 35`, ¿cuánto da la resta inversa `35 - 10`?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Lucas tenía 15 canicas. Su tío le regaló un grupo de canicas y ahora tiene 20 en total. ¿Cuántas canicas le regaló su tío? *(Deshaz el camino restando)*
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Un elevador estaba en el piso 12. Subió unos pisos y llegó al piso 19. ¿Cuántos pisos subió el elevador?
`[ Escribe tu respuesta aquí ]`

---

### 🎯 Estado de la Batería de Práctica (Nivel 1)

Al presionar "Entendido", el servidor activará tu pool de **15 preguntas fijas sin tiempo**. Deberás escribir el número exacto que deshace la operación. Si cometes un error, el Bucle Espejo congelará tu avance y te entrenará con variantes numéricas mutadas hasta que domines el reflejo inverso.

---

## 👑 Nivel 2: Operación Inversa — Multiplicación y División (¡Los espejos multiplicativos!)

¡Impresionante! Ya dominas el viaje de ida y vuelta de la suma y la resta. Ahora vas a conocer a la segunda pareja de superhéroes inversos del gimnasio: **la Multiplicación (×) y la División (÷)**.

Ellas hacen exactamente lo mismo, pero a gran escala. Si la multiplicación junta grupos iguales para armar un gran número, la división toma ese gran número y lo corta en partes exactamente iguales para regresar a los grupos del inicio. ¡Son operaciones espejo!

---

### 🪞 El Espejo Multiplicativo

Mira cómo se desarma una tabla de multiplicar usando una división:

* **El viaje de ida (Multiplicar):** Tienes 4 bolsas con 5 dulces cada una. El total es: `4 × 5 = 20`.
* **El viaje de regreso (Dividir):** Tomas los 20 dulces totales y los repartes en partes iguales en las 4 bolsas. ¿Cuántos dulces quedan en cada una? `20 ÷ 4 = 5`. ¡Volviste al 5 original!
* **Ejemplo 1 (Matemático Puro):** Si la tabla del 6 te dice que `6 × 3 = 18`, entonces la ley inversa te asegura que `18 ÷ 3 = 6`.
* **Ejemplo 2 (Contexto corto y directo):** Un maestro tiene un mazo de cartas y le da 8 cartas a cada uno de sus 3 alumnos (en total repartió 24 cartas). Si quiere recoger las 24 cartas y volverlas a separar en los 3 grupos, hace `24 ÷ 3 = 8`.

---

> ⚠️ **¡Cuidado con la Trampa del Reparto Roto!**
> El monstruo del desorden quiere que olvides que la multiplicación y la división son familia. Al ver una división, intenta que busques un número completamente nuevo que no estaba en la tabla.
> * **❌ El Camino Incorrecto (La Trampa):** Si sabes que `4 × 8 = 32`, y el sistema te pregunta cuánto es `32 ÷ 8`, ponerte a contar con los dedos desde el cero o inventar que da 9.
> * **✅ El Camino Correcto:** ¡Usa los ojos de detective! Los tres números (`4`, `8` y `32`) pertenecen a la misma familia. Si ya tienes el `32` y el `8`, el número que falta por ley inversa es el `4`. ¡Haces `32 ÷ 8 = 4` de forma instantánea!
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Si sabemos que `7 × 5 = 35`, ¿cuál es el resultado de la división inversa `35 ÷ 5`?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Un clonador mágico triplicó (×3) los juguetes de Mateo y los convirtió en 12 juguetes en total. ¿Cuántos juguetes tenía Mateo antes de usar el clonador? *(Regresa dividiendo entre 3)*
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Un grupo de 4 amigos juntaron sus monedas en partes iguales y armaron un fondo de R$ 24,00. ¿Cuántos reales aportó cada amigo?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 3: El Número Faltante (¡El misterio del espacio vacío!)

¡Eres un crack! Ya conoces a ambas parejas inversas. Ahora vas a entrar al nivel de los **Misterios Escondidos**. En este nivel, el monstruo del desorden ha borrado un número en medio de la operación y ha dejado un espacio vacío: `___`.

Tu misión como detective es usar tus herramientas inversas para descubrir qué número estaba escondido ahí. ¡Esto es el inicio del verdadero álgebra, pero resuelto con pura lógica de ida y vuelta!

---

### 🕵️‍♂️ Escaneando el Espacio Vacío

Para descubrir al número prófugo, solo debes mirar qué operación están haciendo los números visibles y aplicar tu superpoder inverso para atraparlo:

* **Misterio 1 (Suma incompleta):** `8 + ___ = 15`.
* *Plano del detective:* La operación va sumando. Para descubrir el vacío, viajas hacia atrás restando: `15 - 8 = 7`. El número escondido es **7**.


* **Misterio 2 (Multiplicación incompleta):** `5 × ___ = 30`.
* *Plano del detective:* La operación va multiplicando. Para regresar y descubrir el secreto, divides el final entre el inicio: `30 ÷ 5 = 6`. El número escondido es **6**.



---

> ⚠️ **¡Cuidado con la Trampa de la Resta Engañosa!**
> Cuando el espacio vacío está en medio de una resta, como `20 - ___ = 12`, el monstruo quiere que sumes `20 + 12 = 32`. ¡Cuidado! Si pones un 32 ahí, la operación diría `20 - 32`, lo cual no tiene sentido.
> * **❌ El Camino Incorrecto:** Sumar los números visibles sin mirar la posición del vacío.
> * **✅ El Camino Correcto:** Piensa de forma lógica: si a 20 le quitas un pedazo y te quedan 12, para saber qué pedazo quitaste, simplemente restas: `20 - 12 = 8`. ¡El número faltante es **8**! (`20 - 8 = 12`).
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Encuentra el número escondido en este misterio aditivo: `14 + ___ = 20`.
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Descubre el número faltante en esta tabla en acción: `4 × ___ = 32`.
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Resuelve este desafío de resta antes de que el desorden gane: `15 - ___ = 9`.
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 4: Gran Integración (¡La prueba de velocidad mental!)

¡Felicidades! Has llegado al último nivel del Módulo 2. Esta es la **Zona de Control Mixto**. Aquí las reglas cambian a velocidad de vértigo porque todas las herramientas que has aprendido están completamente mezcladas.

En una pantalla tendrás que descubrir un número faltante en una multiplicación, y en la siguiente tendrás que aplicar la operación inversa de una resta. El objetivo de este nivel es entrenar a tu cerebro para **cambiar de velocidad operativa al instante**, sin quedarse pegado en un solo tipo de ejercicio.

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Descubre el número que falta en esta expresión: `6 × ___ = 24`.
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Aplica la operación inversa directa para resolver este caso: Si `45 - 15 = 30`, ¿cuánto es `30 + 15`?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Resuelve el misterio del espacio vacío aditivo: `18 + ___ = 25`.
`[ Escribe tu respuesta aquí ]`

---

# 🏆 BLOQUE DE EVALUACIÓN: DESAFÍOS DEL MÓDULO 2

## ⚡ Desafío 1: El Torneo del Retorno (Dificultad Estándar)

* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas aleatorias calculadas por la plantilla del servidor. Foco exclusivo en operaciones inversas directas de Suma/Resta (Nivel 1) y Multiplicación/División (Nivel 2).
* **Temporizador Activo:** **45 segundos por pregunta** (Barra horizontal superior fluida).
* **Salida Temprana (Early Exit):** Cierre automático de la prueba al acumular el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 1):

* **Pregunta 1:** "Si sabemos que `14 + 12 = 26`, ¿cuál es el resultado de la operación inversa `26 - 12`?"
* A) 10
* B) **14** *(¡Correcto! Por propiedad reversibles aditiva)*
* C) 12
* D) 16


* **Pregunta 2:** "Un juego de cartas te indica que `8 × 4 = 32`. ¿Cuánto da la división espejo `32 ÷ 4`?"
* A) 6
* B) 32
* C) **8** *(¡Correcto! Pertenece a la misma familia multiplicativa)*
* D) 4



---

## 🚀 Desafío 2: Los Guardianes del Vacío (Dificultad Avanzada)

* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas. Despeje conceptual de números faltantes en posiciones intermedias (Nivel 3) e integraciones de cambio de velocidad (Nivel 4).
* **Temporizador Activo:** **60 segundos por pregunta** (Margen extendido por la carga del análisis posicional del vacío).
* **Salida Temprana (Early Exit):** Cierre automático al **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 2):

* **Pregunta 1:** "Encuentra el valor del número faltante en la siguiente expresión: `24 - ___ = 15`"
* A) 39 *(Error común: sumó los valores visibles)*
* B) **9** *(¡Correcto! `24 - 9 = 15`)*
* C) 8
* D) 7


* **Pregunta 2:** "Descubre el número oculto que activa la tabla en acción: `7 × ___ = 42`"
* A) 5
* B) 7
* C) **6** *(¡Correcto! Por operación inversa `42 ÷ 7 = 6`)*
* D) 8



---

## 👑 Desafío Final: El Maestro de la Inversa (Evocación Pura)

* **Formato:** **Sin opciones. Cuadro de texto vacío (`input`)**. El alumno lee el enigma matemático, aplica el despeje mental inverso y digita el resultado neto.
* **Contenido:** 10 preguntas selectas de alta variabilidad integrando operaciones cruzadas.
* **Temporizador Activo:** **45 segundos por pregunta** (Mide automatización refleja).
* **Salida Temprana Estricta:** Cierre automático inmediato al registrar el **2do error**.
* **Criterio de Aprobación:** Mínimo 90% (9 de 10 correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío Final):

* **Pregunta 1:** "Resuelve el misterio y digita el número escondido en el espacio vacío: `35 ÷ ___ = 5`"
* *Input limpio esperado:* **7** *(El niño aplica mentalmente `35 ÷ 5 = 7`).*


* **Pregunta 2:** "Si al doble de un número desconocido le sumas 4, obtienes 14. ¿Cuál es ese número desconocido?"
* *Input limpio esperado:* **5** *(El niño deshaz de atrás hacia adelante: primero resta `14 - 4 = 10`, y luego le saca la mitad a 10: `10 ÷ 2 = 5`).*



---

## 💻 Script Generador Automatizado del Pool de Desafíos (Módulo 2)

Este script inyecta de forma masiva los reactivos de evaluación para el Módulo 2 en la base de datos, estructurando las opciones y las respuestas según los requerimientos técnicos del backend en FastAPI.

```python
import random
import json

def generar_pool_desafios_modulo2(cantidad_por_tipo=50):
    banco_desafios = []
    id_base = 2900 # Rango 2900 exclusivo para evaluaciones del Módulo 2
    
    for i in range(cantidad_por_tipo):
        # 1. GENERAR PREGUNTAS DESAFÍO 1 (INVERSA DIRECTA)
        n1 = random.randint(10, 30)
        n2 = random.randint(5, 20)
        total_suma = n1 + n2
        
        pregunta_d1 = {
            "id": id_base + len(banco_desafios) + 1,
            "modulo_id": 2,
            "sub_tipo_desafio": "desafio_1_estandar",
            "tipo_interfaz": "opcion_multiple",
            "tiempo_limite_segundos": 45,
            "enunciado": f"Si la plantilla del servidor confirma que {n1} + {n2} = {total_suma}, ¿cuánto es {total_suma} - {n1}?",
            "opciones": {
                "A": str(n2 + 2),
                "B": str(n1),
                "C": str(n2), # Correcta
                "D": str(total_suma)
            },
            "respuesta_correcta": "C"
        }
        banco_desafios.append(pregunta_d1)
        
        # 2. GENERAR PREGUNTAS DESAFÍO 2 (NÚMERO FALTANTE)
        factor1 = random.randint(3, 9)
        ans_oculto = random.randint(4, 9)
        total_mult = factor1 * ans_oculto
        
        pregunta_d2 = {
            "id": id_base + len(banco_desafios) + 1,
            "modulo_id": 2,
            "sub_tipo_desafio": "desafio_2_avanzado",
            "tipo_interfaz": "opcion_multiple",
            "tiempo_limite_segundos": 60,
            "enunciado": f"Descubre el número prófugo que completa la tabla: {factor1} × ___ = {total_mult}",
            "opciones": {
                "A": str(ans_oculto), # Correcta
                "B": str(ans_oculto + 1),
                "C": str(total_mult // factor1 + 2),
                "D": str(factor1)
            },
            "respuesta_correcta": "A"
        }
        banco_desafios.append(pregunta_d2)
        
        # 3. GENERAR PREGUNTAS DESAFÍO FINAL (EVOCACIÓN PURA)
        base_resta = random.randint(30, 60)
        ans_final = random.randint(10, 25)
        faltante_resta = base_resta - ans_final
        
        pregunta_df = {
            "id": id_base + len(banco_desafios) + 1,
            "modulo_id": 2,
            "sub_tipo_desafio": "desafio_final_maestria",
            "tipo_interfaz": "evocacion_pura_input",
            "tiempo_limite_segundos": 45,
            "enunciado": f"Resuelve mentalmente el vacío de la resta y digita el valor: {base_resta} - ___ = {ans_final}",
            "respuesta_correcta": str(faltante_resta)
        }
        banco_desafios.append(pregunta_df)
        
    return banco_desafios

pool_evaluacion_m2 = generar_pool_desafios_modulo2(50)

with open("pool_modulo2_desafios.json", "w", encoding="utf-8") as f:
    json.dump(pool_evaluacion_m2, f, ensure_ascii=False, indent=2)

print(f"¡Éxito! Banco de evaluaciones del Módulo 2 generado con {len(pool_evaluacion_m2)} registros listos para producción.")

```

# 4.2.8. Resumen operativo del Módulo 2

| Bloque                                |         Formato |     Cantidad |        Tiempo | Bucle Espejo |             Aprobación |
| ------------------------------------- | --------------: | -----------: | ------------: | -----------: | ---------------------: |
| Nivel 1 — Suma y Resta                |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 2 — Multiplicación y División   |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 3 — El Número Faltante          |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 4 — Gran Integración            |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Desafío 1 — El Torneo del Retorno     | Opción múltiple | 25 preguntas | 45 s/pregunta |           No |           23/25 (90%)  |
| Desafío 2 — Los Guardianes del Vacío  | Opción múltiple | 25 preguntas | 60 s/pregunta |           No |           23/25 (90%)  |
| Desafío Final — Maestro de la Inversa |           Input | 10 preguntas | 45 s/pregunta |           No |            9/10 (90%)  |

---

Con esto, el **Módulo 2** queda completamente diseñado, desarrollado y acoplado a las especificaciones técnicas del backend. ¡Listo para integrarse en la plataforma!

Aquí tienes el diseño conceptual, la arquitectura del flujo técnico, las lecturas oficiales interactivas para todos los niveles y la especificación de los desafíos finales para el **Módulo 3: Tienda Matemática**. Este bloque está diseñado específicamente para que los alumnos de 10 años dominen las transacciones del mundo real eliminando por completo la frustración de las operaciones decimales complejas.

---

# 🛒 MÓDULO 3: TIENDA MATEMÁTICA (DISEÑO CONCEPTUAL Y DE FLUJO)

## 1. Enfoque Pedagógico y Reglas de Negocio

* **Propósito:** Transformar el cálculo abstracto de números decimales en un escenario concreto y de alto interés: el manejo del dinero en Reales (**R$**).
* **Restricción Monetaria Estricta:** Queda prohibido el uso de centavos aleatorios (como `,13` o `,87`). El motor del servidor solo generará precios con terminaciones amigables: **,00**, **,25**, **,50** y **,75**. Esto permite que el niño agrupe centavos mentalmente como bloques de construcción (bloques de 25 en 25).
* **Control del Servidor:** Al igual que los módulos 1 y 2, funciona mediante un motor de plantillas en FastAPI que calcula los precios y vueltos en tiempo de ejecución.

## 2. Arquitectura del Flujo del Usuario

```
[Lectura Teórica] ──> [Sección Trampa] ──> [3 Inputs de Evocación] ──> [Práctica Libre (15/20 Q)] ──> [Embudo de Desafíos]

```

1. **Fase de Aprendizaje:** El niño lee la lección fraccionada. Resuelve tres miniretos numéricos obligatorios tipeando en su teclado para desbloquear la práctica.
2. **Fase de Práctica (15 o 20 Preguntas):** El servidor entrega los problemas comerciales uno a uno. Si el alumno falla en el cálculo de un vuelto o una suma, el **Bucle Espejo** detiene el avance, le muestra el error con peras y manzanas, y le entrega un caso espejo con los mismos centavos pero diferentes productos.

---

# [DOCUMENTO DE TEXTO: LECTURAS OFICIALES E INTERACTIVOS — MÓDULO 3]

## 👑 Nivel 1: Reconozco el Dinero (¡El valor de las monedas!)

¡Bienvenido a la Tienda Matemática, comprador estrella! Hoy vas a abrir tu propio negocio, y tu primer superpoder será **dominar las monedas de centavos**.

En el mundo de los reales (**R$**), los centavos son pequeños pedacitos de dinero que se juntan para armar un Real entero. En lugar de complicarte con números raros, imagina que los centavos son como bloques de juguete que encajan a la perfección:

---

### 🪙 Los Bloques de Centavos Amigables

* Dos monedas de **R$ 0,50** se juntan y fabrican **R$ 1,00** entero (`0,50 + 0,50 = 1,00`).
* Cuatro monedas de **R$ 0,25** se juntan y fabrican **R$ 1,00** entero (`0,25 + 0,25 + 0,25 + 0,25 = 1,00`).
* **Ejemplo 1 (Matemático Puro):** Si tienes un billete de R$ 2,00 y dos monedas de R$ 0,50, sumas la parte entera y el real que fabricaron las monedas: `2,00 + 1,00 = 3,00`. Tienes **R$ 3,00**.
* **Ejemplo 2 (Contexto corto y directo):** Sofía abrió su alcancía y sacó 3 monedas de R$ 0,25 y una moneda de R$ 0,50. Sabe que dos de R$ 0,25 hacen 50 centavos, y con la otra de 50 centavos ya tiene R$ 1,00. Le queda una moneda suelta de R$ 0,25. Sofía tiene **R$ 1,25**.

---

> ⚠️ **¡Cuidado con la Trampa del Cambio de Lugar!**
> El monstruo del desorden quiere que veas el número 25 de una moneda y creas que vale más que un billete de R$ 2,00 solo porque el 25 es un número más grande. ¡No te confundas! Los centavos siempre van detrás de la coma.
> * **❌ El Camino Incorrecto (La Trampa):** Decir que 3 monedas de R$ 0,25 son R$ 75,00. ¡Eso sería una fortuna!
> * **✅ El Camino Correcto:** Recordar que los centavos son pedacitos pequeños. Tres monedas de R$ 0,25 se escriben y valen **R$ 0,75** (setenta y cinco centavos).
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Lucas tiene en su mano un billete de R$ 5,00 y cuatro monedas de R$ 0,25. ¿Cuántos reales tiene en total?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Si juntas una moneda de R$ 0,50 con una moneda de R$ 0,25, ¿cuántos centavos tienes expresados en reales?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Un frasco de gomitas cuesta exactamente R$ 1,00. Si pagas usando solo monedas de R$ 0,25, ¿cuántas monedas tienes que entregarle al cajero?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 2: Pago y Cambio (¡El arte del vuelto!)

¡Excelente! Ya sabes reconocer el dinero. Ahora vas a aprender el secreto más importante de los comerciantes: **calcular el vuelto sin equivocarte**.

Cuando vas a comprar un dulce que cuesta R$ 1,25 y pagas con un billete de R$ 5,00, el cajero tiene que hacer una resta para devolverte lo que sobra. Tu superpoder será calcular esa resta en tu mente antes de que el cajero te entregue las monedas.

---

### 💸 Rompiendo el Real para cobrar

Para restar centavos amigables de un billete entero, imagina que "rompes" un real del billete y lo transformas en monedas de R$ 0,25:

* **Ejemplo 1 (Matemático Puro):** Calcular `5,00 - 1,25`. Al billete de 5 le quitas 1 real entero (te quedan 4 reales). A ese real que separaste le quitas los 25 centavos (te quedan 75 centavos). Al final juntas todo: `3 reales + 75 centavos = 3,75`. El resultado es **3,75**.
* **Ejemplo 2 (Contexto corto y directo):** Mateo compra un juguete de R$ 2,50 y paga con un billete de R$ 10,00. Tu mente hace el cálculo: `10,00 - 2,50 = 7,50`. El cajero debe devolverle **R$ 7,50** de vuelto.

---

> ⚠️ **¡Cuidado con la Trampa de la Resta Directa!**
> El monstruo del desorden quiere que restes los números enteros de la izquierda y dejes los centavos exactamente iguales. ¡Ese es el error más común en la tienda!
> * **❌ El Camino Incorrecto (La Trampa):** Para calcular `5,00 - 1,25`, hacer `5 - 1 = 4` y poner corriendo que el vuelto es R$ 4,25. ¡Cuidado! Le estás regalando tus centavos al cajero.
> * **✅ El Camino Correcto:** Recuerda que los centavos del precio se comen una parte del real entero. Al hacer el desglose correcto descubres que el vuelto verdadero es **R$ 3,75**.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Compras un chocolate que cuesta R$ 1,50 y pagas con un billete de R$ 2,00. ¿Cuánto dinero te deben regresar de vuelto?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Si tienes un billete de R$ 20,00 y gastas exactamente R$ 10,25 en una libreta, ¿cuánto te queda en la billetera?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Valentina paga con un billete de R$ 5,00 una golosina que vale R$ 3,50. ¿Cuál es el vuelto exacto que recibe?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 3: Carrito de Compras (¡Agrupando centavos!)

¡Eres todo un cajero profesional! Ahora vamos a complicar un poco las cosas en la tienda. En este nivel no comprarás una sola cosa; vas a **llenar el carrito con 2 o 3 productos al mismo tiempo**.

Tu superpoder aquí será la **Agrupación Inteligente**. En lugar de sumar todo junto y enredarte con las comas, vas a sumar primero los billetes enteros por un lado, y luego vas a juntar los centavos amigables para ver si logran fabricar reales nuevos.

---

### 🛒 El Secreto de la Caja Registradora

* **Productos:** Un paquete de papas de R$ 2,50 y un refresco de R$ 1,50.
* **Paso 1 (Sumar enteros):** `2 reales + 1 real = 3 reales`.
* **Paso 2 (Sumar centavos):** `50 centavos + 50 centavos = 1 real entero`.
* **Paso 3 (Unir todo):** `3 reales + 1 real nuevo = 4 reales`. El total del carrito es **R$ 4,00**.

---

> ⚠️ **¡Cuidado con la Trampa del Real Olvidado!**
> El monstruo del desorden quiere que sumes los centavos, pero que olvides sumarle ese real extra al total del dinero entero.
> * **❌ El Camino Incorrecto (La Trampa):** En la suma de R$ 2,50 + R$ 1,50, decir que el resultado es R$ 3,00 porque solo sumaste `2 + 1` y olvidaste los dos bloques de 50 centavos.
> * **✅ El Camino Correcto:** Sumar los enteros (`3`), sumar los centavos (`1,00`) y consolidar el resultado real: `3 + 1 = 4,00`. ¡El total verdadero es **R$ 4,00**!
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Metes al carrito un llavero de R$ 3,25 y un lápiz de R$ 1,25. ¿Cuánto marca la pantalla de la caja registradora?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Calculas el total de dos dulces gigantes: uno cuesta R$ 4,75 y el otro cuesta R$ 1,25. ¿Cuánto cuestan juntos? *(Agrupa los centavos para armar un real nuevo)*
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** En tu carrito hay tres objetos pequeños de R$ 0,25 cada uno. ¿Cuánto dinero sumas en total?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 4: Comprador Inteligente (¡El poder del presupuesto!)

¡Felicidades! Has llegado al último nivel de la tienda. Aquí te enfrentarás a la prueba de fuego del dinero: **tomar decisiones inteligentes**.

En este nivel combinaremos todo lo anterior en una misión del mundo real. El sistema te dará una cantidad fija de dinero en tu billetera y te mostrará un carrito de compras. Tu misión se divide en dos partes: primero calcularás el total del carrito, luego revisarás tu dinero y responderás de forma exacta **cuánto dinero te sobra o cuánto dinero te hace falta** para poder pagar.

---

### 📋 El Plano de la Compra Inteligente

* **Tu billetera:** Un billete de R$ 10,00.
* **Tu carrito:** Una galleta de R$ 3,50 y un jugo de R$ 2,50 (Total carrito = R$ 6,00).
* **Análisis final:** Como 10 es más grande que 6, el dinero sí alcanza. Calculas la resta para saber lo que te queda en el bolsillo: `10,00 - 6,00 = 4,00`. Te sobran **R$ 4,00**.

---

> ⚠️ **¡Cuidado con la Trampa del Dinero Insuficiente!**
> Cuando el dinero no alcanza, el monstruo del desorden quiere que restes al revés o que pongas que te sobra dinero cuando en realidad estás debiendo en la caja.
> * **❌ El Camino Incorrecto:** Si tu carrito suma R$ 12,00 y solo tienes R$ 10,00, escribir que te devuelven R$ 2,00 de vuelto. ¡Eso es imposible, te van a retener los productos!
> * **✅ El Camino Correcto:** Identificar que el carrito superó tu presupuesto. Haces la resta de la diferencia: `12 - 10 = 2`. La respuesta correcta es que **te faltan R$ 2,00**.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Tienes un billete de R$ 5,00. Tu carrito de compras suma exactamente R$ 5,75. ¿Cuánto dinero te hace falta para poder comprar?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Llevas un billete de R$ 20,00. Compras productos por un total de R$ 15,50. ¿Cuánto te queda en la billetera después de pagar en la caja?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Tienes R$ 10,00. Quieres comprar dos juguetes que cuestan R$ 4,50 cada uno. ¿Cuánto dinero te sobra al final de la transacción?
`[ Escribe tu respuesta aquí ]`

---

# 🏆 BLOQUE DE EVALUACIÓN: DESAFÍOS DEL MÓDULO 3

## ⚡ Desafío 1: Cajero Express (Dificultad Estándar)

* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas fijas de la plantilla. Foco en el conteo de centavos amigables (Nivel 1) y cálculo rápido de vueltos con un solo producto en caja (Nivel 2).
* **Temporizador Activo:** **45 segundos por pregunta.**
* **Salida Temprana (Early Exit):** Desconexión automática al acumular el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 1):

* **Pregunta 1:** "Tienes un billete de R$ 5,00 y tres monedas de R$ 0,25. ¿Cuánto dinero tienes en total?"
* A) R$ 5,25
* B) **R$ 5,75** *(¡Correcto! 5,00 + 0,75 = 5,75)*
* C) R$ 8,00
* D) R$ 5,30


* **Pregunta 2:** "Pagas un helado que cuesta R$ 2,25 con un billete de R$ 5,00. ¿Cuál es tu vuelto exacto?"
* A) R$ 3,25
* B) R$ 2,50
* C) **R$ 2,75** *(¡Correcto! El desglose inverso da 2,75)*
* D) R$ 3,75



---

## 🚀 Desafío 2: Control de Inventario y Carrito (Dificultad Avanzada)

* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas. Sumas complejas de carritos de compras multiobjeto (Nivel 3) y balances de presupuesto cruzados (Nivel 4).
* **Temporizador Activo:** **60 segundos por pregunta** (Holgura para procesar la doble suma decimal amigable).
* **Salida Temprana (Early Exit):** Cierre automático de la sesión al **3er error**.

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 2):

* **Pregunta 1:** "Metes en el carrito un cuaderno de R$ 4,50, una goma de R$ 1,25 y un marcador de R$ 2,25. ¿Cuánto suma el total del carrito?"
* A) R$ 7,50
* B) **R$ 8,00** *(¡Correcto! 4,50 + 1,25 + 2,25 = 8,00)*
* C) R$ 8,25
* D) R$ 7,75


* **Pregunta 2:** "Tienes un billete de R$ 10,00. Tu carrito de compras suma un total de R$ 11,50. ¿Cuál es el estado de tu compra?"
* A) Te sobran R$ 1,50
* B) Te faltan R$ 1,00
* C) **Te faltan R$ 1,50** *(¡Correcto! Modificador lineal de presupuesto fuera de límite)*
* D) Te sobran R$ 0,50



---

## 👑 Desafío Final: El Gerente de la Tienda (Evocación Pura)

* **Formato:** **Sin opciones. Cuadro de texto vacío (`input`)**. El alumno lee el problema comercial mixto, realiza la liquidación en su mente y digita el número flotante neto (usando coma o punto según configuración local).
* **Contenido:** 10 preguntas de alta variabilidad que mezclan compras múltiples y cálculos de vueltos encadenados.
* **Temporizador Activo:** **45 segundos por pregunta** (Fluidez refleja).
* **Salida Temprana Estricta:** Cierre fulminante al registrar el **2do error**.
* **Criterio de Aprobación:** Mínimo 90% (9 de 10 correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío Final):

* **Pregunta 1:** "Llevas un billete de R$ 20,00. Compras dos chocolates de R$ 3,50 cada uno y un jugo de R$ 1,50. ¿Cuánto dinero te queda de vuelto al salir de la tienda?"
* *Input limpio esperado en el backend:* **11,50** *(Cálculo: Carrito = 3,50 + 3,50 + 1,50 = 8,50. Vuelto = 20,00 - 8,50 = 11,50).*


* **Pregunta 2:** "Tienes tres monedas de R$ 0,50 y dos monedas de R$ 0,25. Si compras un dulce de R$ 1,25, ¿cuántos reales netos te quedan?"
* *Input limpio esperado en el backend:* **0,75** *(Cálculo: Billetera = 1,50 + 0,50 = 2,00. Saldo final = 2,00 - 1,25 = 0,75).*



---

## 💻 Script Generador Automatizado del Motor de la Tienda (Módulo 3)

Este script inyecta la batería de preguntas del Módulo 3 respetando la restricción monetaria estricta de centavos amigables mediante una lista fija de opciones controladas por el servidor, procesando internamente valores en **centavos enteros** para evitar imprecisiones de coma flotante y limitando los bucles para prevenir bloqueos en base a la regla de `max_intentos`.

```python
import random
import json

CENTAVOS_AMIGABLES = [0, 25, 50, 75]
PRODUCTOS_TIENDA = ["chocolate", "jugo de frutas", "cuaderno", "llavero", "gomitas", "lápiz coleccionable"]

def formato_reales(centavos):
    return f"{centavos // 100},{centavos % 100:02d}"

def construir_opciones_unicas(correcta_str, distractores_list, cantidad=4):
    valores = []
    for val in [correcta_str] + distractores_list:
        if val not in valores:
            valores.append(val)
    while len(valores) < cantidad:
        # Generar un distractor numérico aleatorio amigable en centavos
        entero = random.randint(1, 15)
        dec = random.choice(CENTAVOS_AMIGABLES)
        nuevo = formato_reales(entero * 100 + dec)
        if nuevo not in valores:
            valores.append(nuevo)
    random.shuffle(valores)
    return valores

def generar_banco_plantillas_modulo3(cantidad_por_nivel=50):
    banco_completo = []
    
    for nivel in [1, 2, 3, 4]:
        enunciados_nivel = set()
        intentos = 0
        max_intentos = cantidad_por_nivel * 50
        
        while len([q for q in banco_completo if q["nivel_id"] == nivel]) < cantidad_por_nivel and intentos < max_intentos:
            intentos += 1
            prod = random.choice(PRODUCTOS_TIENDA)
            
            # Operar con centavos enteros
            precio_entero = random.randint(1, 8)
            precio_decimal = random.choice(CENTAVOS_AMIGABLES)
            precio_centavos = precio_entero * 100 + precio_decimal
            
            str_precio = formato_reales(precio_centavos)
            id_pregunta = 3000 + (nivel * 100) + len(banco_completo) + 1
            
            if nivel == 1:
                # Foco: Reconocimiento y sumas de unidades con combinatoria ampliada
                tipo_objetivo = random.choice(["contar_total", "completar_real", "comparar_valores"])
                
                if tipo_objetivo == "contar_total":
                    monedas_25 = random.randint(0, 8)
                    monedas_50 = random.randint(0, 6)
                    if monedas_25 == 0 and monedas_50 == 0: continue
                    
                    ans_centavos = (monedas_25 * 25) + (monedas_50 * 50)
                    str_ans = formato_reales(ans_centavos)
                    enunciado = f"En tu bolsillo tienes exactamente {monedas_50} monedas de R$ 0,50 y {monedas_25} monedas de R$ 0,25. ¿A cuántos reales equivale este dinero?"
                
                elif tipo_objetivo == "completar_real":
                    monedas_25 = random.randint(1, 3)
                    ans_centavos = 100 - (monedas_25 * 25)
                    str_ans = formato_reales(ans_centavos)
                    enunciado = f"Tienes {monedas_25} monedas de R$ 0,25. ¿Cuánto dinero te falta en centavos para poder completar exactamente R$ 1,00?"
                
                else:
                    monedas_50 = random.randint(1, 3)
                    ans_centavos = (monedas_50 * 50) + 200 # Billete de 2
                    str_ans = formato_reales(ans_centavos)
                    enunciado = f"Si tienes un billete de R$ 2,00 y {monedas_50} monedas de R$ 0,50 en la mano, ¿cuánto dinero tienes en total?"
                
                struct = {
                    "id": id_pregunta, "modulo_id": 3, "nivel_id": 1, "tipo_pregunta": "tienda_conteo",
                    "enunciado_macro": enunciado, "respuesta_correcta": str_ans,
                    "retro_error": "Calculaste mal la agrupación de las monedas y el billete del monedero."
                }
                
            elif nivel == 2:
                # Foco: Cálculo de vuelto directo con billete limpio
                billete = random.choice([5, 10, 20])
                billete_centavos = billete * 100
                if billete_centavos <= precio_centavos: continue
                
                ans_centavos = billete_centavos - precio_centavos
                str_ans = formato_reales(ans_centavos)
                enunciado = f"Compras un {prod} que cuesta R$ {str_precio} y pagas en caja con un billete de R$ {billete},00. ¿Cuál es tu vuelto exacto?"
                
                struct = {
                    "id": id_pregunta, "modulo_id": 3, "nivel_id": 2, "tipo_pregunta": "tienda_vuelto",
                    "enunciado_macro": enunciado, "respuesta_correcta": str_ans,
                    "retro_error": "Olvidaste restar la parte decimal del real que rompiste para pagar."
                }
                
            elif nivel == 3:
                # Foco: Llenado de carrito con dos productos amigables
                p2_entero = random.randint(1, 4)
                p2_decimal = random.choice(CENTAVOS_AMIGABLES)
                p2_centavos = p2_entero * 100 + p2_decimal
                
                ans_centavos = precio_centavos + p2_centavos
                str_ans = formato_reales(ans_centavos)
                str_p2 = formato_reales(p2_centavos)
                
                enunciado = f"Metes en tu carrito un {prod} de R$ {str_precio} y otro artículo que vale R$ {str_p2}. ¿Cuánto dinero debes pagar en total?"
                
                struct = {
                    "id": id_pregunta, "modulo_id": 3, "nivel_id": 3, "tipo_pregunta": "tienda_carrito",
                    "enunciado_macro": enunciado, "respuesta_correcta": str_ans,
                    "retro_error": "Revisa la consolidación de los centavos. Recuerda que pueden fabricar un real extra."
                }
                
            else:
                # Foco: Decisiones de presupuesto (saldo_sobrante / dinero_faltante)
                billete = random.choice([5, 10, 15])
                billete_centavos = billete * 100
                ans_centavos = billete_centavos - precio_centavos
                str_ans = formato_reales(abs(ans_centavos))
                
                if ans_centavos >= 0:
                    enunciado = f"Tienes un billete de R$ {billete},00 y tu carrito suma R$ {str_precio}. Si te alcanza, ¿cuánto dinero te queda de saldo?"
                else:
                    enunciado = f"Tienes un billete de R$ {billete},00 y quieres comprar un artículo de R$ {str_precio}. ¿Cuánto dinero te falta en la caja?"
                    
                struct = {
                    "id": id_pregunta, "modulo_id": 3, "nivel_id": 4, "tipo_pregunta": "tienda_presupuesto",
                    "enunciado_macro": enunciado, "respuesta_correcta": str_ans,
                    "retro_error": "Calculaste mal la diferencia entre tu billete disponible y el precio total."
                }
                
            if enunciado in enunciados_nivel: continue
            enunciados_nivel.add(enunciado)
            banco_completo.append(struct)
            
    return banco_completo

pool_m3 = generar_banco_plantillas_modulo3(50)
with open("pool_modulo3_tienda.json", "w", encoding="utf-8") as f:
    json.dump(pool_m3, f, ensure_ascii=False, indent=2)

print(f"¡Éxito! Plantillas del Módulo 3 generadas y exportadas con un total de {len(pool_m3)} registros dinámicos.")

```

# 4.3.8. Resumen operativo del Módulo 3

| Bloque                                |         Formato |     Cantidad |        Tiempo | Bucle Espejo |             Aprobación |
| ------------------------------------- | --------------: | -----------: | ------------: | -----------: | ---------------------: |
| Nivel 1 — Conteo de Monedas           |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 2 — Vuelto Exacto               |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 3 — Sumas de Carrito            |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 4 — Control de Presupuesto      |           Input | 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Desafío 1 — Compras y Vueltos Rápidos | Opción múltiple | 25 preguntas | 45 s/pregunta |           No |           23/25 (90%)  |
| Desafío 2 — Control de Inventario     | Opción múltiple | 25 preguntas | 60 s/pregunta |           No |           23/25 (90%)  |
| Desafío Final — El Gerente de la Tienda|           Input | 10 preguntas | 45 s/pregunta |           No |            9/10 (90%)  |

---


# 🕵️‍♂️ MÓDULO 4: DETECTIVES DE HISTORIAS (DISEÑO COMPLETO)

## 1. PARTE CONCEPTUAL Y LOGICA DEL MÓDULO

* **Propósito Pedagógico:** Erradicar la "ansiedad del bloqueo textual" en problemas matemáticos de palabras. Los niños de 10 años suelen estresarse al ver párrafos largos y tienden a operar de forma aleatoria con cualquier número que encuentren. Este módulo enseña a desarmar un problema escrito como si fuera un caso de detectives, separando la información útil de la basura, traduciendo verbos de acción a operadores matemáticos y identificando secuencias lógicas y flujos de pasos múltiples.
* **Mecánica de Ingeniería de Datos (Pool de Alta Variabilidad):** Para evitar que los alumnos memoricen el orden de las respuestas o repitan las mismas preguntas al reintentar un nivel (el "Efecto Patrón"), este módulo se conecta de forma nativa a colecciones indexadas en PostgreSQL que albergan **150 preguntas únicas por nivel**.
* **Mecánica de Flujo y Muestreo del Servidor:** Al iniciar una sesión, el backend en FastAPI selecciona mediante `random.sample()` un bloque cerrado (15 preguntas para los niveles 1 al 4, y 20 preguntas para el nivel 5). El progreso lineal queda bajo control del backend; las respuestas incorrectas detienen el avance y disparan el **Bucle Espejo** con variantes paramétricas mutadas de forma transparente.

---

## 2. ARQUITECTURA DEL FLUJO DEL USUARIO (USER FLOW)

```
[Inicio del Nivel]
       │
       ▼
[Lectura Teórica Fragmentada] ──► [Alerta "¡Cuidado con la Trampa!"]
       │
       ▼
[Desbloqueo por Evocación] (Resolver obligatoriamente 3 Inputs interactivos sin tiempo)
       │
       ▼
[Carga de Sesión en el Servidor] (Muestreo aleatorio de IDs desde el pool de 150 en Postgres)
       │
       ▼
[Bucle de Práctica Libre (15 o 20 Preguntas)] ◄──────────────────────────────┐
       │                                                                     │
       ├─► Respuesta CORRECTA ──► Avanza puntero lineal ─────────────────────┤
       │                                                                     │
       └─► Respuesta INCORRECTA ─► Bloqueo + Feedback Quirúrgico             │
                                         │                                   │
                                         ▼                                   │
                                   Inicia Bucle Espejo                       │
                                   (Hasta 3 variantes numéricas mutadas) ────┘
                                         │
                                         ▼ (Si falla las 3 variantes)
                                   Despliega Soporte Avanzado y salta la pregunta
       │
       ▼
[Luz Verde del Backend] ──► Apertura de la Zona de Desafíos Finales

```

---

# 3. TEXTOS OFICIALES INTERACTIVOS DE LOS NIVELES

## 👑 Nivel 1: Filtro de Datos (¡El Escudo contra Distractores!)

¡Hola, detective! Bienvenido al Módulo 4. Hoy vas a activar un dispositivo de alta tecnología en tu mente: **El Escudo contra Distractores**.

En el mundo de los problemas escritos, hay un monstruo llamado el Desorden al que le encanta meter información de relleno ("datos basura") dentro de las historias. Mete números que no tienen nada que ver con lo que te están preguntando, solo para ver si caes en su trampa y los sumas todos por apuro. ¡Tu superpoder será congelar esos datos basura y dejarlos fuera de tu cálculo!

---

### 🛡️ Activando el Escudo Láser

Para resolver el misterio, el primer paso de un detective es **leer directamente la pregunta final**. Ella te dirá qué números tienen valor y cuáles son solo una distracción.

* **Ejemplo 1 (Contexto corto y directo):** Lucas tiene 5 manzanas rojas en su mochila, 3 plátanos amarillos en su bolsa y 2 perros jugando en el jardín de su casa. ¿Cuántas frutas tiene Lucas en total para comer?
* **Plano de resolución:** Miras la pregunta: te piden *frutas*. Activamos el escudo. ¿Las manzanas son frutas? Sí (5). ¿Los plátanos son frutas? Sí (3). ¿Los perros son frutas? ¡Claro que no! El 2 es un distractor basura. Lo congelas. Tu operación limpia es: `5 + 3 = 8`. Lucas tiene **8** frutas.

---

> ⚠️ **¡Cuidado con la Trampa del Apuro Numérico!**
> El monstruo del desorden quiere que veas números flotando en el texto, te emociones, y los metas todos en una gigantesca suma sin leer.
> * **❌ El Camino Incorrecto (La Trampa):** En la historia de Lucas, ver el 5, el 3 y el 2, y sumar corriendo `5 + 3 + 2 = 10`. ¡Error! Acabas de meter a los perros adentro de la ensalada de frutas.
> * **✅ El Camino Correcto:** Leer la pregunta con calma, activar el escudo láser para dejar fuera a los perros y sumar solo los datos útiles: `5 + 3 = 8`.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Sofía tiene 6 lápices de colores en su estuche, 4 borradores limpios y 3 gatos durmiendo en su cama. ¿Cuántos útiles escolares tiene Sofía en total dentro de su estuche?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Mateo tiene 10 tazos de héroes y 5 estampas de fútbol en su cajón. En la sala de su casa hay 4 sillas de madera. ¿Cuántos objetos coleccionables tiene Mateo guardados?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** En un árbol hay 8 pájaros cantando, 4 mariposas volando y 5 manzanas colgadas de las ramas. ¿Cuántos animales hay en total en el árbol? *(¡Usa el escudo contra las manzanas!)*
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 2: Traductores de Palabras Clave (¡El idioma secreto de los números!)

¡Excelente trabajo con el escudo! Ahora que sabes limpiar las historias de datos basura, vas a recibir tu segunda herramienta de detective: **El Diccionario de Traducción**.

Los problemas escritos están hablados en lenguaje humano, pero los símbolos matemáticos hablan su propio idioma. Tu superpoder será escuchar los verbos de acción de la historia y traducirlos instantáneamente en operadores matemáticos (`+`, `-`, `×`, `÷`). ¡Es como tener un traductor universal en tu cerebro!

---

### 🔠 El Diccionario del Detective

Abre tu diccionario mental y memoriza estas traducciones directas:

* Si la historia dice: *Juntó, ganó, recibió, reunió* $\rightarrow$ Traduce a **Suma (+)**.
* Si la historia dice: *Perdió, regaló, gastó, se comió* $\rightarrow$ Traduce a **Resta (-)**.
* Si la historia dice: *El doble, el triple, veces* $\rightarrow$ Traduce a **Multiplicación (×)**.
* Si la historia dice: *Repartió, dividió, compartió en partes iguales* $\rightarrow$ Traduce a **División (÷)**.
* **Ejemplo 1 (Contexto corto y directo):** Valentina tenía 12 bombones deliciosos en una caja y los **repartió** en partes iguales entre sus 3 mejores amigas. ¿Cuántos bombones recibe cada amiga?
* **Plano de resolución:** Buscas la palabra clave: *repartió*. Tu diccionario te dice que esa palabra se traduce como división (`÷`). Tu operación automática es: `12 ÷ 3 = 4`. Cada amiga recibe **4** bombones.

---

> ⚠️ **¡Cuidado con la Trampa del Cruce de Cables!**
> El monstruo del desorden quiere que confundas palabras que encogen los números. Al leer "repartió", intenta que hagas una resta porque piensas que Valentina se está quedando con menos cosas.
> * **❌ El Camino Incorrecto (La Trampa):** Ver la palabra "repartió" en la historia de Valentina y escribir la operación `12 - 3 = 9`. ¡Error! No los perdió en un agujero negro, los distribuyó de forma equitativa.
> * **✅ El Camino Correcto:** Mantener el diccionario activo. Repartir en partes iguales siempre significa dividir el total entre los grupos: `12 ÷ 3 = 4`. ¡La respuesta exacta es **4**!
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Enzo tenía 20 monedas en su alcancía y **gastó** 6 monedas comprando una goma de borrar. ¿Cuántas monedas le quedan? *(Traduce la palabra clave)*
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Juliana tiene 5 paquetes de pegatinas y cada paquete trae **el triple** de esa cantidad en pegatinas sueltas. ¿Cuántas pegatinas tiene en total?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Un entrenador tiene 15 pelotas de tenis y las **comparte en partes iguales** en 3 canastas de entrenamiento. ¿Cuántas pelotas entran en cada canasta?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 3: El Plano de los Dos Pasos (¡Misiones en dos partes!)

¡Eres todo un experto traduciendo! Ahora que manejas el escudo y el diccionario, estás listo para entrar al nivel de las **Misiones Lineales Dobles**.

En este nivel, las historias se vuelven un poco más complejas porque no se pueden solucionar con un solo cálculo matemático. Son como un videojuego donde tienes una misión principal, pero primero debes resolver un misterio escondido a mitad de camino para poder abrir la puerta final. ¡Diseñaremos un plano de dos pasos!

---

### 🗺️ Diseñando la Estrategia en Cadena

En estas historias, la primera parte de la lectura te dará los datos para fabricar un número nuevo. Una vez que tengas ese número en la mano, lo usarás para ejecutar la operación del final.

* **Ejemplo 1 (Contexto corto y directo):** Gabriel compra 3 paquetes de figuritas para su álbum. Cada paquete contiene exactamente 4 figuritas dentro. En el camino a casa, abre los paquetes pero pierde 2 figuritas por un agujero de su bolsillo. ¿Cuántas figuritas le quedan al llegar a casa?
* **Plano de resolución:**
* *Paso 1 (Multiplicar):* Primero necesitamos saber cuántas figuritas tenía en total antes del accidente. Multiplicamos los paquetes por su contenido: `3 × 4 = 12`. (Tenemos nuestro número intermedio: 12).
* *Paso 2 (Restar):* Ahora que sabemos que tenía 12, ejecutamos la segunda parte traduciendo la palabra "perdió" a resta: `12 - 2 = 10`. Al llegar a casa le quedan **10** figuritas.



---

> ⚠️ **¡Cuidado con la Trampa del Paso Olvidado!**
> El monstruo del desorden quiere que te emociones tanto al calcular el primer paso que pongas ese resultado corriendo en la pantalla, dejando la historia a la mitad de la misión.
> * **❌ El Camino Incorrecto (La Trampa):** En la historia de Gabriel, calcular `3 × 4 = 12` y escribir de inmediato el número 12 como respuesta final. ¡Cuidado! Dejaste el caso abierto y olvidaste restar las figuritas que se cayeron al suelo.
> * **✅ El Camino Correcto:** Sigue el plano hasta el final. Consigue el 12, retenlo en tu mente y réstale las 2 perdidas para cerrar la misión con éxito: `12 - 2 = 10`.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Mariana tiene 2 cajas de crayones con 6 crayones cada una. Su mamá le regala 3 crayones sueltos más. ¿Cuántos crayones tiene Mariana en total? *(Paso 1: averigua los crayones de las cajas; Paso 2: suma los regalos)*
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Pedro compra 4 paquetes de gomitas de fruta. Cada paquete trae 5 gomitas. Si se come 3 gomitas en el recreo, ¿cuántas gomitas le quedan en total?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Un maestro reparte 18 lápices entre 3 mesas en partes iguales. Si los niños de la primera mesa ya rompieron 2 de sus lápices recibidos, ¿cuántos lápices útiles le quedan a esa mesa?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 4: Series y Patrones (¡El rastro del ritmo numérico!)

¡Increíble cómo dominas las historias textuales! Hoy vamos a hacer una pausa de la lectura de párrafos largos para entrenar un superpoder visual muy especial: **El Detective de Ritmos**.

A veces, las pistas que investigamos no vienen en palabras, sino en filas de números separados por comas. Estas filas se llaman **series numéricas** y avanzan o retroceden siguiendo un patrón secreto. Tu misión es descubrir cuál es el "salto" constante entre los primeros vagones para poder predecir con total exactitud cuál es el número que vendrá al final de la fila.

---

### 🚂 Descubriendo la Regla del Tren

Para resolver este enigma, debes comparar el primer número con el segundo y averiguar qué operación matemática se está repitiendo todo el tiempo:

* **Pista 1 (Suma Fija):** `3, 6, 9, 12, ___`. Los números van creciendo. De 3 para llegar a 6 el salto es de tres (`+3`). De 6 para 9 también es `+3`. ¡La regla secreta es sumar 3! El número que completa el vagón vacío es `12 + 3 = 15`.
* **Pista 2 (Resta Fija):** `20, 16, 12, 8, ___`. Los números se van encogiendo. De 20 para llegar a 16 el salto va hacia atrás restando cuatro (`-4`). El número final que destruye el desorden es `8 - 4 = 4`.
* **Pista 3 (Multiplicación - El Doble):** `2, 4, 8, 16, ___`. Aquí el salto no es sumando lo mismo, porque de 2 a 4 sumas 2, pero de 4 a 8 sumas 4. ¡Mira bien! Cada número es **el doble** del anterior (`× 2`). El próximo número será el doble de 16: `16 × 2 = 32`.

---

> ⚠️ **¡Cuidado con la Trampa de la Dirección del Salto!**
> El monstruo del desorden quiere que midas el tamaño del salto rápido y hagas la operation en la dirección totalmente opuesta por apuro.
> * **❌ El Camino Incorrecto (La Trampa):** En la serie decreciente `30, 25, 20, ___`, ver que la diferencia es un 5, emocionarte y calcular hacia adelante: `20 + 5 = 25`. ¡Error! Los números se están achicando, el tren va en reversa.
> * **✅ El Camino Correcto:** Asegura el signo de la regla. Como la serie baja de 5 en 5, la regla real es restar: `20 - 5 = 15`. ¡El número faltante es **15**!
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Descubre el número que completa el patrón en este tren ascendente de salto fijo: `4, 8, 12, 16, ___`.
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Encuentra el número que falta en esta serie que marcha hacia atrás: `50, 40, 30, 20, ___`.
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Una serie corta avanza duplicando su valor en cada estación: `3, 6, 12, ___`. Usa tu multiplicación por 2 para hallar el número final.
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 5: Gran Integración Textual y de Patrones (¡El examen de los superpoderes!)

¡Felicidades, detective de élite! Has completado todos los entrenamientos del Módulo 4. Has aprendido a levantar el escudo láser contra datos basura, a consultar tu diccionario de palabras clave, a encadenar misiones de dos pasos y a cazar el ritmo secreto de las series numéricas.

En esta **Zona de Integración Final**, no hay reglas nuevas ni trucos escondidos. El verdadero desafío es que tu cerebro aprenda a **cambiar de velocidad operativa**. Cada pantalla te lanzará un misterio completamente diferente al anterior. ¡Tendrás que abrir tu caja de herramientas lógicas y elegir el superpoder correcto en un instante!

---

### 🧠 Abriendo la Caja de Herramientas

Antes de escribir cualquier número en tu teclado, escanea el problema con calma:

1. ¿Hay números de relleno que no conectan con la pregunta? $\rightarrow$ **¡Lanza el Escudo!**
2. ¿Hay verbos de acción directa como repartir o gastar? $\rightarrow$ **¡Abre el Diccionario!**
3. ¿La historia se divide en una acción inicial y otra final? $\rightarrow$ **¡Arma los Dos Pasos!**
4. ¿Ves números puros separados por comas en una fila? $\rightarrow$ **¡Busca el Ritmo!**

---

> ⚠️ **¡Cuidado con la Trampa del Cruce de Cables!**
> Como todos los ejercicios están mezclados al azar por el servidor, el monstruo quiere que te confundas de herramienta. No intentes buscarle un ritmo de saltos a una historia de texto, ni le lances el escudo contra distractores a una serie numérica limpia.
> * **❌ El Camino Incorrecto:** Ver el rastro numérico de un robot `5, 10, 20, ___` e intentar inventar una historia de que el robot perdió juguetes en el camino.
> * **✅ El Camino Correcto:** Mira el formato. Si son números puros alineados, mides el salto (`× 2 = 40`). Si es un párrafo escrito, buscas los datos útiles y las palabras clave.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Clara juntó 15 piedras brillantes y regaló 5 a su mejor amiga. También vio 4 nubes en el cielo. ¿Cuántas piedras le quedaron a Clara en total? *(Filtra el distractor y traduce el verbo)*
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Descubre el número que completa el rastro secreto del tren: `18, 15, 12, 9, ___`.
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Enzo tiene 3 paquetes de cartas coleccionables. Cada paquete trae 5 cartas dentro. Si saliendo de la escuela se encuentra 4 cartas más sueltas tiradas en el suelo, ¿cuántas cartas tiene Enzo ahora en total? *(Misión de dos pasos)*
`[ Escribe tu respuesta aquí ]`

---

# 🏆 4. BATERÍA DE EVALUACIÓN: DESAFÍOS DEL MÓDULO 4

## ⚡ Desafío 1: Filtros y Ritmática (Dificultad Estándar)

* **Formato de Interacción:** Opción Múltiple (A, B, C, D).
* **Contenido de la Batería:** 25 preguntas seleccionadas al azar de la base de datos. Evalúa de forma exclusiva la activación del escudo contra distractores (Nivel 1), traducción de operaciones de un solo paso (Nivel 2) y series numéricas básicas de suma y resta fija (Nivel 4).
* **Temporizador Activo:** **45 segundos por pregunta.** Si la barra superior fluida se vacía, el servidor computa un error automático por tiempo excedido (`tiempo_agotado`).
* **Regla de Cierre (Early Exit):** El examen se cancela e interrumpe de forma automática al registrar el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 1):

* **Pregunta 1 (Filtro de datos basura):** "En una frutería hay 12 cajas de naranjas, 8 bolsas de manzanas y 5 camiones de carga estacionados afuera. ¿Cuántos contenedores de fruta hay en total en la tienda?"
* A) 25 *(Error: sumó los 5 camiones distractores)*
* B) 15
* C) **20** *(¡Correcto! 12 cajas + 8 bolsas = 20, aislando los camiones)*
* D) 17


* **Pregunta 2 (Patrón en reversa):** "Descubre qué número completa el rastro numérico de la pista: `35, 30, 25, 20, ___`"
* A) 25 *(Error de dirección: sumó 5 en lugar de restar)*
* B) **15** *(¡Correcto! La regla es -5, por lo que 20 - 5 = 15)*
* C) 10
* D) 22



---

## 🚀 Desafío 2: Operaciones Encadenadas (Dificultad Avanzada)

* **Formato de Interacción:** Opción Múltiple (A, B, C, D).
* **Contenido de la Batería:** 25 preguntas de control. Historias complejas de dos pasos de flujo lineal (Nivel 3), secuencias multiplicativas de dobles controlados (Nivel 4) y problemas de integración cruzada (Nivel 5).
* **Temporizador Activo:** **60 segundos por pregunta** (Se otorga una ventana técnica de tiempo extendida para facilitar la doble decodificación léxica y numérica en la mente).
* **Regla de Cierre (Early Exit):** El examen se cierra de forma automática al acumular el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 2):

* **Pregunta 1 (Misión de dos pasos):** "Nicolás compra 4 paquetes de pegatinas de superhéroes. Cada paquete trae exactamente 6 pegatinas dentro. Si al abrir las bolsas le regala 5 pegatinas a su hermano menor, ¿cuántas pegatinas le quedan a Nicolás?"
* A) 24 *(Error común: se quedó a mitad de camino, solo multiplicó 4 × 6)*
* B) 15
* C) **19** *(¡Correcto! Paso 1: 4 × 6 = 24; Paso 2: 24 - 5 = 19)*
* D) 20


* **Pregunta 2 (Serie multiplicativa controlada):** "Encuentra el número que falta al final de esta secuencia de crecimiento rápido: `5, 10, 20, 40, ___`"
* A) 45 *(Error: asumió un salto aditivo)*
* B) 50
* C) **80** *(¡Correcto! Cada término es el doble del anterior: 40 × 2 = 80)*
* D) 60



---

## 👑 Desafío Final: El Gran Intérprete Master (Evocación Pura)

* **Formato de Interacción:** **Sin opciones de respuesta. Cuadro de texto totalmente vacío (`input`)**. El estudiante opera frente al vacío conceptual; debe calcular el resultado neto en su cerebro y tipear el número exacto utilizando su teclado.
* **Contenido de la Batería:** 10 preguntas seleccionadas dinámicamente por el servidor que mezclan de forma desordenada distractores camuflados, operaciones cruzadas y patrones numéricos rápidos.
* **Temporizador Activo:** **45 segundos por pregunta** (Mide si la traducción automática del texto a símbolo ya funciona como un reflejo consolidado).
* **Regla de Cierre Estricta (Early Exit):** Al registrar el **2do error de cualquier tipo**, la prueba aborta y se cierra de forma fulminante.
* **Criterio de Aprobación:** Mínimo 90% (9 de 10 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío Final):

* **Pregunta 1 (Integración de texto y filtro):** "Sofía tiene 3 estuches escolares con 5 lápices de colores dentro de cada uno. Si perdió 3 lápices en el patio de juegos y además tiene 4 cuadernos limpios en su mochila, ¿cuántos lápices de colores le quedan en total a Sofía?"
* *Input numérico limpio esperado por el backend:* **12** *(El cerebro del niño activa el escudo contra los 4 cuadernos basura, ejecuta el paso uno multiplicando 3 × 5 = 15, y cierra el paso dos restando los perdidos: 15 - 3 = 12).*


* **Pregunta 2 (Traducción y evocación pura):** "Valentina tenía 36 gomitas de frutas en una bolsa grande y las repartió en partes iguales entre 4 frascos de vidrio pequeños. ¿Cuántas gomitas metió en cada frasco?"
* *Input numérico limpio esperado por el backend:* **9** *(Traducción refleja e instantánea de la palabra clave "repartió" a una división exacta de una sola estación: 36 ÷ 4 = 9).*



---

## 💻 5. SCRIPT GENERADOR DE BASE DE DATOS (150 PREGUNTAS - NIVEL 4)

Este script inyecta de forma masiva los reactivos correspondientes al nuevo **Nivel 4 (Series y Patrones)** dentro de las tablas de PostgreSQL, garantizando un reparto balanceado entre patrones de suma, resta y multiplicación simple, y utilizando límites de protección (`max_intentos`) para evitar bucles infinitos.

```python
import random
import json

CONTEXTOS_N4 = [
    "Un conejo salta por piedras numeradas en el bosque",
    "Un tren de carga avanza registrando números en sus vagones",
    "Sofía organiza sus tazos brillantes en filas ordenadas",
    "Mateo observa las páginas de su libro de colección de sellos",
    "Un robot explorador camina dejando un rastro numérico en el suelo",
    "Lucas cuenta las manzanas recolectadas por hora en la huerta",
    "Mariana registra la temperatura exterior cada diez minutos",
    "Un submarino desciende registrando la profundidad en metros",
    "Una ardilla trepa acumulando bellotas en ramas numeradas",
    "Gabriel anota la distancia recorrida en su bicicleta en kilómetros"
]

def generar_banco_preguntas_m4_n4(cantidad=150):
    preguntas_generadas = []
    enunciados_unicos = set()
    intentos = 0
    max_intentos = cantidad * 50
    
    # Reparto equitativo: 1/3 suma, 1/3 resta, 1/3 multiplicación simple (dobles/triples)
    tipos_patron = ["suma", "resta", "multiplicacion_simple"]
    
    while len(preguntas_generadas) < cantidad and intentos < max_intentos:
        intentos += 1
        tipo = tipos_patron[len(preguntas_generadas) % 3]
        contexto = random.choice(CONTEXTOS_N4)
        
        if tipo == "suma":
            salto = random.choice([2, 3, 4, 5, 10, 15, 20])
            inicio = random.randint(1, 30)
            secuencia = [inicio + (i * salto) for i in range(4)]
            ans = secuencia[-1] + salto
            enunciado = f"{contexto}. La serie es: {secuencia[0]}, {secuencia[1]}, {secuencia[2]}, {secuencia[3]}, ___. ¿Qué número completa el patrón?"
            explicacion = f"Los números aumentan sumando {salto} en cada paso. Por lo tanto, {secuencia[-1]} + {salto} = {ans}."
            metadata = {"tipo_patron": "suma_fija", "salto": salto}
            
        elif tipo == "resta":
            salto = random.choice([2, 3, 4, 5, 10, 15, 20])
            base_final = random.randint(2, 20)
            secuencia_rev = [base_final + (i * salto) for i in range(5)]
            secuencia = secuencia_rev[::-1]  # descendente
            ans = secuencia[-1] - salto
            enunciado = f"{contexto}. La serie va hacia atrás: {secuencia[0]}, {secuencia[1]}, {secuencia[2]}, {secuencia[3]}, ___. ¿Qué número sigue?"
            explicacion = f"Los números disminuyen restando {salto} en cada paso. Por lo tanto, {secuencia[3]} - {salto} = {ans}."
            metadata = {"tipo_patron": "resta_fija", "salto": salto}
            
        else: # multiplicacion_simple (Dobles y Triples controlados)
            factor = random.choice([2, 3])
            if factor == 2:
                inicio = random.choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
                secuencia = [inicio * (2 ** i) for i in range(4)]
                ans = secuencia[-1] * 2
                explicacion = f"Cada número es el doble del anterior (se multiplica por 2). El doble de {secuencia[-1]} es {ans}."
            else:
                inicio = random.choice([1, 2, 3, 4, 5])
                secuencia = [inicio * (3 ** i) for i in range(3)] # Crecimiento rápido, menos elementos
                ans = secuencia[-1] * 3
                explicacion = f"Cada número es el triple del anterior (se multiplica por 3). El triple de {secuencia[-1]} es {ans}."
                
            enunciado = f"{contexto}. La serie avanza rápido: {', '.join(map(str, secuencia))}, ___. ¿Qué número sigue?"
            metadata = {"tipo_patron": "multiplicacion_factorizada", "factor": factor}

        if enunciado in enunciados_unicos:
            continue
            
        enunciados_unicos.add(enunciado)
        id_pregunta = 4400 + len(preguntas_generadas) + 1  # Bloque identificador 4400 para Nivel 4
        
        pregunta_estructura = {
            "id": id_pregunta,
            "modulo": 4,
            "nivel": 4,
            "tipo_pregunta": "secuencia_logica_patron",
            "enunciado": enunciado,
            "respuesta_correcta": str(ans),
            "metadata_tokenizacion": metadata,
            "retroalimentacion_bucle": {
                "donde_esta_el_error": "Calculaste mal el tamaño del salto o la dirección del patrón numérico.",
                "respuesta_correcta_revelada": str(ans),
                "explicacion_pedagogica": explicacion
            }
        }
        preguntas_generadas.append(pregunta_estructura)
        
    if len(preguntas_generadas) < cantidad:
        raise ValueError(f"No hay suficiente variabilidad para generar {cantidad} preguntas únicas de Nivel 4.")
        
    return preguntas_generadas

# Ejecución automatizada de generación de datos
pool_m4_n4 = generar_banco_preguntas_m4_n4(150)

# Serialización a archivo físico JSON listo para el sembrado (Seed) de PostgreSQL
with open("pool_modulo4_nivel4.json", "w", encoding="utf-8") as f:
    json.dump(pool_m4_n4, f, ensure_ascii=False, indent=2)

```

# 4.4.8. Resumen operativo del Módulo 4

| Bloque                                |         Formato |     Cantidad |        Tiempo | Bucle Espejo |             Aprobación |
| ------------------------------------- | --------------: | -----------: | ------------: | -----------: | ---------------------: |
| Nivel 1 — Filtro de Datos (Escudo)    | Subrayado tokens| 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 2 — Traductores de Palabras     | Subrayado tokens| 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 3 — Plano de Dos Pasos          | Subrayado tokens| 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 4 — Series y Patrones           | Subrayado tokens| 15 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Nivel 5 — Integrador Completo         | Subrayado tokens| 20 preguntas |    Sin tiempo |           Sí | Según regla del bloque |
| Desafío 1 — Desafío Lector Rápido     | Opción múltiple | 25 preguntas | 45 s/pregunta |           No |           23/25 (90%)  |
| Desafío 2 — Operaciones Encadenadas   | Opción múltiple | 25 preguntas | 60 s/pregunta |           No |           23/25 (90%)  |
| Desafío Final — Maestro Intérprete    |           Input | 10 preguntas | 45 s/pregunta |           No |            9/10 (90%)  |

---


# 🏗️ MÓDULO 5: CONSTRUCTOR DE SOLUCIONES (DISEÑO COMPLETO)

## 1. PARTE CONCEPTUAL Y LÓGICA DEL MÓDULO

* **Propósito Pedagógico:** Desarrollar el pensamiento algorítmico, la de descomposición de problemas complejos y la persistencia lógica. En lugar de resolver problemas aislados de un único paso, los niños de 10 años aprenden a construir estructuras de resolución en cadena. La habilidad clave es entender que en la vida real, las decisiones y los cálculos dependen de resultados previos: no puedes calcular el destino final sin haber asegurado con precisión la estación intermedia.
* **Mecánica de Ingeniería de Datos (Arquitectura Chained):** Cada ejercicio de este módulo es un problema compuesto guardado de forma relacional en PostgreSQL. No se evalúa el problema como un bloque ciego de "todo o nada". El backend en FastAPI expone sub-preguntas indexadas por pasos (`paso_1`, `paso_2`). La respuesta del paso anterior se inyecta dinámicamente en la interfaz de la siguiente pregunta como un dato consolidado, aislando el error. Cada nivel se alimenta de un pool masivo de **150 preguntas únicas**.
* **Mecánica de Flujo y Mitigación de Errores:** Si el estudiante comete un error en el `paso_1`, el sistema activa el Bucle Espejo en ese paso específico. Una vez superado el `paso_1`, el valor correcto queda fijo en la pantalla para que el alumno resuelva el `paso_2` sin arrastrar un castigo de puntaje doble por un fallo de cálculo inicial.

---

## 2. ARQUITECTURA DEL FLUJO DEL USUARIO (USER FLOW)

```
[Entrada al Módulo 5]
       │
       ▼
[Lectura de la Teoría del Constructor] ──► [Análisis de "¡Cuidado con la Trampa!"]
       │
       ▼
[Desbloqueo de Práctica] (Resolver 3 mini-retos numéricos encadenados en la lectura)
       │
       ▼
[Carga de Sesión Híbrida] (FastAPI extrae 15 o 20 IDs del pool de 150 en Postgres)
       │
       ▼
[Bucle del Constructor de Soluciones] ◄──────────────────────────────────────┐
       │                                                                     │
       ▼                                                                     │
 ┌───────────────┐                                                           │
 │    PASO 1     │ ──► Incorrecto ──► Bucle Espejo (Variante Numérica)       │
 └───────┬───────┘                                                           │
         │ Aprobado (El Servidor congela el dato útil en pantalla)           │
         ▼                                                                   │
 ┌───────────────┐                                                           │
 │    PASO 2     │ ──► Incorrecto ──► Bucle Espejo (Mismo dato del Paso 1)   │
 └───────┬───────┘                                                           │
         │ Aprobado                                                          │
         ▼                                                                   │
   Avanza Puntero Lineal ────────────────────────────────────────────────────┘
       │
       ▼
[Validación de Fin de Módulo] ──► Desbloqueo de los Desafíos Cronometrados

```

---

# 3. TEXTOS OFICIALES INTERACTIVOS DE LOS NIVELES

## 👑 Nivel 1: El Primer Eslabón (¡Cadenas Aditivas!)

¡Bienvenido al laboratorio definitivo, ingeniero de la lógica! Has llegado al Módulo 5. Aquí vas a construir soluciones enteras armando **cadenas de respuestas**. En este nivel, los problemas son como un videojuego con misiones consecutivas: **para poder activar la misión 2, necesitas obligatoriamente el resultado de la misión 1**.

No te preocupes si ves una historia larga; nuestro sistema es súper inteligente y va a revisar cada uno de tus pasos por separado. ¡Si aseguras el primer eslabón, tendrás la mitad de la victoria!

---

### ⛓️ Cómo funciona una solución en cadena

Mira cómo la respuesta de la primera pregunta se convierte automáticamente en el inicio de la segunda:

* **Historia base:** Sofía cosechó 8 manzanas rojas y 4 manzanas verdes en su huerto. En la tarde, vendió 3 manzanas de su total acumulado.
* **Paso 1 (Suma):** ¿Cuántas manzanas cosechó Sofía en total en su huerto?
* *Tu mente calcula:* `8 + 4 = 12`. (¡Paso 1 aprobado! El sistema congela tu **12** en la pantalla).


* **Paso 2 (Resta usando tu respuesta anterior):** Si de esas 12 manzanas que tenía cosechadas vendió 3, ¿cuántas le quedan ahora?
* *Tu mente calcula:* `12 - 3 = 9`. ¡Misión cumplida! El resultado final de la cadena es **9**.



---

> ⚠️ **¡Cuidado con la Trampa del Eslabón Roto!**
> Si calculas con prisas el Paso 1, arrastrarás ese error al Paso 2 y toda tu torre de respuestas se vendrá abajo.
> * **❌ El Camino Incorrecto (La Trampa):** En la historia de Sofía, decir que `8 + 4 = 10` en el Paso 1 por apurado. Al llegar al Paso 2, harías `10 - 3 = 7`. ¡Todo tu plano de solución estaría roto!
> * **✅ El Camino Correcto:** Concéntrate en resolver el Paso 1 como si fuera un problema único y aislado. Una vez que el servidor te dé luz verde con el 12, úsalo con total seguridad para restar los 3 del final.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Lucas tiene 10 carritos azules en un cajón y 5 carritos amarillos en su mochila.
* *Pregunta del Paso 1:* ¿Cuántos carritos tiene Lucas en total?
`[ Escribe tu respuesta aquí ]`


* **🧠 Hazlo en tu mente (Interactivo 2):** Usando tu respuesta anterior (los 15 carritos totales de Lucas), resuelve la segunda parte de la historia: Si Lucas decide regalarle 4 carritos de su total a su primo menor...
* *Pregunta del Paso 2:* ¿Cuántos carritos le quedan en la colección ahora?
`[ Escribe tu respuesta aquí ]`


* **🎯 ¡Tu turno! (Interactivo 3 - Cadena Completa):** Mateo juntó 20 monedas en su alcancía. Gastó 5 monedas comprando un dulce y luego gastó otras 3 monedas comprando una goma de borrar. El Paso 1 ya calculó que le quedaron 15 monedas tras el dulce (`20 - 5 = 15`). Responde directamente el Paso 2: Si le quedaban 15 monedas y gastó 3 más, ¿cuánto dinero le queda al final del día?
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 2: El Multiplicador en Cadena (¡Cadenas Multiplicativas!)

¡Excelente trabajo superando el primer eslabón, ingeniero! Ya sabes cómo conectar sumas y restas en una línea de tiempo. Ahora, el desafío sube de nivel en la fábrica de soluciones: vas a **conectar multiplicaciones y divisiones** para resolver misterios de inventario masivo.

Tu superpoder en este nivel será el **Control de Grupos**. Primero multiplicarás para descubrir cuántos objetos tienes guardados en total dentro de varios paquetes cerrados, y luego usarás esa gran respuesta para repartirlos equitativamente. ¡Paso a paso eres invencible!

---

### 📦 Calculando el inventario total

Mira cómo el resultado de la multiplicación abre la puerta para poder hacer el reparto exacto:

* **Historia base:** Mateo compró 3 paquetes de calcomanías de fútbol. Cada paquete contiene exactamente 6 calcomanías dentro. Al llegar a la escuela, decidió repartir todas sus calcomanías en partes iguales entre sus 2 hermanos.
* **Paso 1 (Multiplicar grupos):** ¿Cuántas calcomanías compró Mateo en total?
* *Tu mente calcula:* `3 × 6 = 18`. (¡Paso 1 aprobado! El servidor guarda y bloquea tu **18**).


* **Paso 2 (Dividir el inventario):** Si tiene 18 calcomanías y las reparte en partes iguales entre sus 2 hermanos, ¿cuántas calcomanías recibe cada uno?
* *Tu mente divide:* `18 ÷ 2 = 9`. ¡Solución construida! Cada hermano recibe **9**.



---

> ⚠️ **¡Cuidado con la Trampa del Inventario Roto!**
> Un error muy común es intentar repartir únicamente lo que viene adentro de un solo paquete, olvidando por completo que compraste varios contenedores. ¡No dejes cajas cerradas!
> * **❌ El Camino Incorrecto (La Trampa):** En la historia de Mateo, tomar las 6 calcomanías de un solo paquete y hacer `6 ÷ 2 = 3` para el Paso 2. ¡Error! Te olvidaste de las calcomanías de los otros 2 paquetes.
> * **✅ El Camino Correcto:** Espera a que el Paso 1 junte todo el inventario absoluto (`18`). Cuando tengas ese gran número limpio en tu mano, lo usas para ejecutar la división distributiva final: `18 ÷ 2 = 9`.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Valentina compró 4 bolsas de chocolates dulces. Cada bolsa contiene exactamente 5 chocolates dentro.
* *Pregunta del Paso 1:* ¿Cuántos chocolates tiene Valentina en total en su inventario?
`[ Escribe tu respuesta aquí ]`


* **🧠 Hazlo en tu mente (Interactivo 2):** Usando tu respuesta anterior (los 20 chocolates totales de Valentina), resuelve la segunda parte: Ella decide compartir todos esos chocolates en partes iguales entre sus 4 mejores amigos.
* *Pregunta del Paso 2:* ¿Cuántos chocolates le tocan a cada amigo?
`[ Escribe tu respuesta aquí ]`


* **🎯 ¡Tu turno! (Interactivo 3 - Cadena Completa):** Enzo tiene 2 cajas con 8 tazos de colección cada una (Total inicial = 16 tazos). Si decide regalarle la mitad (dividir entre 2) de todos sus tazos a su primo, ¿cuántos tazos recibió su primo al final de la tarde? *(Calcula directo sobre el total del inventario)*
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 3: La Fábrica de Soluciones (¡Cadenas Mixtas Avanzadas!)

¡Eres todo un maestro de la construcción! Ya dominas las cadenas que empiezan sumando o multiplicando de forma ordenada. Pero en el mundo real, las historias a veces cambian las reglas: ¿qué pasa si una historia te pide quitar cosas primero y luego multiplicar lo que te sobró?

Tu superpoder en este nivel será **seguir el reloj de la historia**. No importa qué operación aparezca escrita primero; tú vas a armar los eslabones lógicos exactamente en el mismo orden en que ocurren las acciones en la vida real.

---

### 🛠️ Armando cadenas cruzadas

Mira cómo el orden de los factores se adapta perfectamente al paso del tiempo:

* **Historia base:** Isabella tenía 10 peluches ordenados en su repisa. Le regaló 4 peluches a su prima pequeña. En la tarde, su abuela vio que le quedaban pocos y le **duplicó** exactamente la cantidad que le quedaba.
* **Paso 1 (Restar primero):** ¿Cuántos peluches le quedaron a Isabella inmediatamente después de regalarle a su prima?
* *Tu mente calcula la pérdida:* `10 - 4 = 6`. (¡Paso 1 aprobado! El servidor guarda tu **6**).


* **Paso 2 (Multiplicar el resultado restante):** Si le quedaban 6 peluches y su abuela le duplicó (×2) esa cantidad, ¿cuántos peluches tiene ahora en total?
* *Tu mente calcula el doble:* `6 × 2 = 12`. ¡Cadena perfecta! Ahora tiene **12** peluches.



---

> ⚠️ **¡Cuidado con la Trampa del Orden Invertido!**
> El monstruo del desorden quiere que veas una palabra poderosa como "duplicó" y quieras multiplicar el número que estaba al puro principio de la historia. ¡Eso arruinará todo tu plano!
> * **❌ El Camino Incorrecto (La Trampa):** En la historia de Isabella, tomar los 10 peluches del inicio, duplicarlos `10 × 2 = 20` y luego restar `20 - 4 = 16`. ¡Error! Su abuela no duplicó los peluches del inicio, duplicó los que sobrevivieron en la repisa.
> * **✅ El Camino Correcto:** Sigue el orden del reloj. Primero quitas lo que se fue del inventario (`10 - 4 = 6`) y únicamente a ese número limpio le aplicas el multiplicador del final: `6 × 2 = 12`.
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Gabriel tenía 15 estampas de fútbol en su álbum. Perdió 5 estampas jugando en el patio de la escuela.
* *Pregunta del Paso 1:* ¿Cuántas estampas le quedaron a Gabriel en ese momento?
`[ Escribe tu respuesta aquí ]`


* **🧠 Hazlo en tu mente (Interactivo 2):** Usando tu respuesta anterior (las 10 estampas que le quedaron a Gabriel), resuelve la segunda parte: Al verlo triste, su papá le compró el **triple** (×3) de las estampas que le quedaban.
* *Pregunta del Paso 2:* ¿Cuántas estampas tiene Gabriel ahora en su colección?
`[ Escribe tu respuesta aquí ]`


* **🎯 ¡Tu turno! (Interactivo 3 - Cadena Completa):** Juliana tenía 12 bombones de chocolate. Se comió la mitad (12 ÷ 2 = 6). Luego, su hermano mayor le regaló 5 bombones más. ¿Cuántos bombones tiene Juliana al final de la historia? *(Calcula primero la mitad y luego súmale los que llegaron).*
`[ Escribe tu respuesta aquí ]`

---

## 👑 Nivel 4: Gran Integración (¡El Maestro Constructor!)

¡Impresionante, ingeniero! Has demostrado que puedes unir eslabones de sumas, restas, multiplicaciones y divisiones sin que se te rompa la estructura. Te encuentras en el centro de operaciones de la Fábrica de Soluciones.

En este nivel final de práctica, todos los misterios están mezclados por el servidor. Tu misión es **cambiar de velocidad mental**. En un problema tendrás que multiplicar primero para saber el inventario, y en el siguiente tendrás que restar antes de poder duplicar. ¡Tú eres el arquitecto jefe y tú decides el plano de tu solución!

---

### 🧠 Seleccionando tu Plano de Solución

Antes de escribir cualquier dígito en tu teclado, lee la historia de principio a fin:

* Si la historia junta o quita objetos sueltos $\rightarrow$ **Usa cadenas aditivas (+ o -).**
* Si la historia habla de paquetes, cajas o bolsas cerradas $\rightarrow$ **Usa cadenas multiplicativas (× o ÷).**
* Si las acciones ocurren en momentos diferentes $\rightarrow$ **Sigue el reloj de la historia.**

---

> ⚠️ **¡Cuidado con la Trampa del Apuro Estructural!**
> Como todas las cadenas están mezcladas al azar, el monstruo quiere que hagas el Paso 2 usando los datos estáticos del inicio del texto, ignorando por completo tu primera respuesta. ¡No cruces los cables!
> * **❌ El Camino Incorrecto:** En un problema de cajas, tomar el contenido de una sola caja del enunciado y dividirlo, olvidando que el Paso 1 ya calculó el inventario macro.
> * **✅ El Camino Correcto:** Usa siempre el nuevo número que acabas de fabricar en el Paso 1 como el motor de arranque para solucionar el Paso 2. ¡Ese es el secreto de una cadena irrompible!
> 
> 

---

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Lucas tiene 8 carritos verdes y 6 carritos rojos guardados en su repisa (Total = 14). Si decide regalarle 4 carritos de su total a su primo...
* *Pregunta del Paso 2:* ¿Cuántos carritos le quedan libres en su repisa al final del día?
`[ Escribe tu respuesta aquí ]`


* **🧠 Hazlo en tu mente (Interactivo 2):** Valentina compró 2 paquetes de galletas de avena. Cada paquete trae exactamente 5 galletas dentro. Si decide compartir todas sus galletas en partes iguales entre sus 2 hermanas...
* *Pregunta del Paso 2:* ¿Cuántas galletas recibe cada una de sus hermanas?
`[ Escribe tu respuesta aquí ]`


* **🎯 ¡Tu turno! (Interactivo 3):** Enzo tenía 12 chocolates en su mesa. Se comió 4 chocolates durante el almuerzo. En la tarde, su mamá vio que le quedaban pocos y le duplicó (×2) los chocolates que le quedaban en la mesa. ¿Con cuántos chocolates terminó el día Enzo?
`[ Escribe tu respuesta aquí ]`

---

# 🏆 4. BATERÍA DE EVALUACIÓN: DESAFÍOS DEL MÓDULO 5

## ⚡ Desafío 1: Cadenas Base (Dificultad Estándar)

* **Formato de Interacción:** Opción Múltiple (A, B, C, D).
* **Contenido de la Batería:** 25 preguntas fijas de evaluación. Foco exclusivo en problemas de pasos conectados aditivos (Nivel 1) y reconocimiento de la primera operación de inventario en historias lineales de suma y resta combinada.
* **Temporizador Activo:** **45 segundos por pregunta.** Agotar la barra fluida horizontal superior genera un error automático por expiración de tiempo.
* **Regla de Cierre (Early Exit):** El examen aborta y se bloquea de forma automática al registrar el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 1):

* **Pregunta 1 (Eslabón aditivo intermedio):** "Sofía tiene 15 estampas en un cajón y 10 en su mochila (Paso 1: Total = 25). Si decide regalarle 7 estampas de su total a un amigo, ¿cuál es el cálculo correcto que cierra la cadena en el Paso 2?"
* A) `15 - 7 = 8` *(Error: usó solo un dato inicial estático)*
* B) `25 + 7 = 32`
* C) **`25 - 7 = 18`** *(¡Correcto! Aplicó la pérdida sobre el total consolidado)*
* D) `20 - 7 = 13`


* **Pregunta 2 (Cadena aditiva lineal):** "Lucas juntó 12 piedras verdes y 8 piedras azules. En la tarde perdió 4 piedras jugando en el parque. ¿Con cuántas piedras se quedó al final?"
* A) 24
* B) **16** *(¡Correcto! Paso 1: 12 + 8 = 20; Paso 2: 20 - 4 = 16)*
* C) 12
* D) 20



---

## 🚀 Desafío 2: Ingeniería del Inventario (Dificultad Avanzada)

* **Formato de Interacción:** Opción Múltiple (A, B, C, D).
* **Contenido de la Batería:** 25 preguntas fijas. Cadenas de flujos multiplicativos estructurales (Nivel 2) y problemas de orden de tiempo invertido mixto (Nivel 3).
* **Temporizador Activo:** **60 segundos por pregunta** (Holgura técnica extendida para permitir el procesamiento mental de la división distributiva exacta y la multiplicación de factores).
* **Regla de Cierre (Early Exit):** El sistema cancela el desafío de forma automática al acumular el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío 2):

* **Pregunta 1 (Cadena de inventario distributivo):** "Mateo tiene 4 paquetes de chocolates con 6 chocolates cada uno. Decide repartir todo su inventario en partes iguales entre 3 amigos. ¿Cuántos chocolates recibe cada amigo?"
* A) 24 *(Error: se quedó a mitad de camino, olvidó el eslabón del reparto)*
* B) 6
* C) **8** *(¡Correcto! Total inicial: 4 × 6 = 24. Distribución: 24 ÷ 3 = 8)*
* D) 12


* **Pregunta 2 (Cadena mixta invertida):** "Isabella tenía 20 canicas en su frasco. Le regaló 8 canicas a su hermano menor. En la tarde, jugando en línea, logró triplicar (×3) la cantidad exacta de canicas que le habían quedado en el frasco. ¿Cuántas canicas tiene ahora?"
* A) 60 *(Error de orden: triplicó el número del inicio)*
* B) **36** *(¡Correcto! Resta inicial: 20 - 8 = 12. Multiplicación final: 12 × 3 = 36)*
* C) 48
* D) 24



---

## 👑 Desafío Final: El Maestro Constructor (Maestría Pura)

* **Formato de Interacción:** **Sin opciones de respuesta. Cuadro de texto totalmente vacío (`input`)**. El estudiante se enfrenta al reto sin alternativas de apoyo visual; debe ejecutar mentalmente la cadena completa de eslabones y digitar el resultado numérico neto definitivo.
* **Contenido de la Batería:** 10 preguntas selectas de integración total (Nivel 4). Estructuras cruzadas y permutadas al azar por el motor de evaluación del servidor.
* **Temporizador Activo:** **45 segundos por pregunta** (Evalúa la velocidad analítica refleja y la solidez de la evocación en el teclado).
* **Regla de Cierre Estricta (Early Exit):** Al registrar el **2do error de cualquier tipo**, la prueba aborta y se bloquea de forma fulminante.
* **Criterio de Aprobación:** Mínimo 90% (9 de 10 respuestas correctas).

### 📝 Ejemplos de Preguntas (Banco de Datos Desafío Final):

* **Pregunta 1 (Evocación en cadena mixta):** "Gabriel compró 3 paquetes de estampas de superhéroes. Cada paquete contiene exactamente 5 estampas dentro. Si saliendo de la escuela pierde 3 estampas por un agujero de su bolsillo y luego su papá le regala 4 estampas más, ¿cuántas estampas tiene Gabriel al final del día?"
* *Input numérico limpio esperado por el backend:* **16** *(El niño ejecuta la cadena en su mente: Eslabón 1 [Multiplicación]: 3 × 5 = 15. Eslabón 2 [Resta]: 15 - 3 = 12. Eslabón 3 [Suma]: 12 + 4 = 16).*


* **Pregunta 2 (Evocación de inventario invertido):** "Juliana tenía 16 bombones. Se comió la mitad de todos sus bombones en la mañana. En la tarde, su tía le regaló una caja que contenía el triple de la cantidad de bombones que le habían quedado. ¿Cuántos bombones le regaló su tía?"
* *Input numérico limpio esperado por el backend:* **24** *(El niño calcula los eslabones: Paso 1 [Mitad]: 16 ÷ 2 = 8 bombones le quedaron. Paso 2 [Triple del remanente]: 8 × 3 = 24 bombones traía la caja nueva).*



---

## 💻 5. SCRIPT GENERADOR DE BASE DE DATOS (150 PREGUNTAS - NIVEL 3)

Este script inyecta de forma masiva los reactivos correspondientes al **Nivel 3 (La Fábrica de Soluciones / Cadenas Mixtas Avanzadas)** en PostgreSQL, alternando entre flujos de (Resta $\rightarrow$ Multiplicación) y (División $\rightarrow$ Suma), controlando las variables para mantener el entorno libre de estrés decimal.

```python
import random
import json

NOMBRES_N3 = ["Lucas", "Sofía", "Mateo", "Valentina", "Enzo", "Isabella", "Gabriel", "Juliana", "Pedro", "Mariana"]
OBJETOS_N3 = ["canicas de vidrio", "estampas de héroes", "chocolates", "gomitas de fruta", "cartas de dinosaurios"]

def generar_banco_preguntas_m5_n3(cantidad=150):
    preguntas_generadas = []
    enunciados_unicos = set()
    
    while len(preguntas_generadas) < cantidad:
        nombre = random.choice(NOMBRES_N3)
        objeto = random.choice(OBJETOS_N3)
        
        # Alternar estructuras 50/50 para enriquecer la variabilidad del JSONB
        tipo_cadena = "resta_luego_multiplica" if len(preguntas_generadas) % 2 == 0 else "divide_luego_suma"
        
        if tipo_cadena == "resta_luego_multiplica":
            n1 = random.randint(12, 25)
            resta_valor = random.randint(3, 8)
            total_paso1 = n1 - resta_valor
            
            factor = random.choice([2, 3])
            final_paso2 = total_paso1 * factor
            palabra_factor = "duplicó" if factor == 2 else "triplicó"
            
            enunciado_general = (
                f"{nombre} comenzó la tarde con {n1} {objeto}. En la escuela le regaló {resta_valor} "
                f"unidades a su mejor amigo. Más tarde, al ganar un juego limpio, logró que la cantidad "
                f"que le quedaba en su mochila se {palabra_factor}."
            )
            
            sub_1 = f"Paso 1: ¿Cuántos {objeto} le quedaron a {nombre} después de regalarle a su amigo?"
            sub_2 = f"Paso 2: ¡Excelente! Con esos {total_paso1} restantes, si esa cantidad se {palabra_factor} (×{factor}), ¿cuántos tiene ahora al final?"
            err_1 = f"Calculaste mal la resta inicial: {n1} - {resta_valor}."
            exp_1 = f"Primero debemos restar las unidades que salieron de la mochila: {n1} - {resta_valor} = {total_paso1}."
            err_2 = f"Multiplicaste mal los {total_paso1} sobrevivientes por el factor de aumento."
            exp_2 = f"Tomamos los {total_paso1} del paso anterior y los multiplicamos por {factor} porque la cantidad se {palabra_factor}: {total_paso1} × {factor} = {final_paso2}."
            
        else: # divide_luego_suma
            divisor = random.choice([2, 3, 4])
            total_paso1 = random.randint(4, 8)
            n1 = total_paso1 * divisor # Garantiza división exacta sin residuo
            
            suma_valor = random.randint(3, 10)
            final_paso2 = total_paso1 + suma_valor
            
            enunciado_general = (
                f"{nombre} tiene {n1} {objeto} en una caja grande y decide repartirlos en partes iguales "
                f"entre {divisor} frascos transparentes. Si en el primer frasco decide agregar {suma_valor} {objeto} "
                f"sueltos más que se encontró tirados, ¿cuántos objetos hay adentro de ese frasco?"
            )
            
            sub_1 = f"Paso 1: ¿Cuántos {objeto} quedaron en cada uno de los {divisor} frascos al repartirlos equitativamente?"
            sub_2 = f"Paso 2: ¡Muy bien! Si en ese frasco quedaron {total_paso1} unidades y luego se agregaron {suma_valor} más, ¿cuántos hay en total en ese frasco?"
            err_1 = f"Hiciste mal el reparto distributivo inicial: {n1} ÷ {divisor}."
            exp_1 = f"Repartir en partes iguales significa dividir el inventario: {n1} ÷ {divisor} = {total_paso1}."
            err_2 = f"Sumaste de forma incorrecta las unidades agregadas al frasco."
            exp_2 = f"Tomamos las {total_paso1} unidades base del frasco y sumamos las {suma_valor} nuevas que se encontraron: {total_paso1} + {suma_valor} = {final_paso2}."

        if enunciado_general in enunciados_unicos:
            continue
            
        enunciados_unicos.add(enunciado_general)
        id_pregunta = 5200 + len(preguntas_generadas) + 1 # Bloque identificador 5200 para Nivel 3
        
        pregunta_estructura = {
            "id": id_pregunta,
            "modulo": 5,
            "nivel": 3,
            "tipo_pregunta": "constructor_soluciones_mixto_avanzado",
            "enunciado_macro": enunciado_general,
            
            "paso_1": {
                "sub_enunciado": sub_1,
                "respuesta_correcta": str(total_paso1),
                "retroalimentacion_error": {
                    "donde_esta_el_error": err_1,
                    "explicacion": exp_1
                }
            },
            "paso_2": {
                "sub_enunciado": sub_2,
                "respuesta_correcta": str(final_paso2),
                "retroalimentacion_error": {
                    "donde_esta_el_error": err_2,
                    "explicacion": exp_2
                }
            },
            "metadata_tecnica": {
                "tipo_cadena": tipo_cadena,
                "item_conteo": objeto
            }
        }
        preguntas_generadas.append(pregunta_estructura)
        
    return preguntas_generadas

# Generación activa de las 150 preguntas encadenadas avanzadas
pool_m5_n3 = generar_banco_preguntas_m5_n3(150)

# Exportación limpia a formato JSON listo para el sembrado directo (Seed) en PostgreSQL
with open("pool_modulo5_nivel3.json", "w", encoding="utf-8") as f:
    json.dump(pool_m5_n3, f, ensure_ascii=False, indent=2)

```

# 4.5.8. Resumen operativo del Módulo 5

| Bloque                                |         Formato |     Cantidad |        Tiempo | Bucle Espejo |             Aprobación |
| ------------------------------------- | --------------: | -----------: | ------------: | -----------: | ---------------------: |
| Nivel 1 — Sumas y Restas Encadenadas  | Chained step    | 15 preguntas |    Sin tiempo | Sí (por paso) | Según regla del bloque |
| Nivel 2 — Mult/Div Encadenadas        | Chained step    | 15 preguntas |    Sin tiempo | Sí (por paso) | Según regla del bloque |
| Nivel 3 — Operaciones Mixtas          | Chained step    | 15 preguntas |    Sin tiempo | Sí (por paso) | Según regla del bloque |
| Desafío 1 — Desafío Constructor Rápido| Opción múltiple | 25 preguntas | 45 s/pregunta |           No |           23/25 (90%)  |
| Desafío 2 — Cadenas de Decisión       | Opción múltiple | 25 preguntas | 60 s/pregunta |           No |           23/25 (90%)  |
| Desafío Final — Gran Constructor Master|           Input | 10 preguntas | 45 s/pregunta |           No |            9/10 (90%)  |

---

Con este bloque completo, el **Módulo 5: Constructor de Soluciones** queda completamente diseñado, estructurado y listo en su dimensión técnica y pedagógica. La Fase 2 de LogicaKids Pro tiene ahora todos sus módulos completamente cerrados para desarrollo.

---


# 5. Criterio de Aprobación, Maestría y Terminología de Flujo

La Fase 2 sigue el estándar unificado de progresión de LogicaKids Pro, pero normalizado con reglas maestras para evitar la arbitrariedad en el tamaño de las pruebas y la confusión terminológica.

---

## 5.1. Normalización de Cantidades de Preguntas por Bloque

Para garantizar un balance entre la asimilación conceptual y la fluidez operativa, se establece la siguiente tabla de cantidades obligatoria para la construcción de interfaces y sesiones:

| Tipo de bloque | Cantidad recomendada | Uso pedagógico / Contexto |
| :--- | :---: | :--- |
| **Lectura interactiva** | 3 inputs | Desbloqueo inicial conceptual durante la fase teórica. |
| **Práctica corta** | 15 preguntas | Módulos de lectura intensa o problemas lógicos largos (Módulo 4 y 5). |
| **Práctica extendida** | 20 preguntas | Módulos de mayor complejidad integradora. |
| **Práctica numérica intensiva** | 25 preguntas | Módulos 1, 2 y 3 (calentamiento numérico y automatización de tablas). |
| **Evaluación estándar** | 25 preguntas | Desafíos de nivel 1 y 2 en formato de opción múltiple. |
| **Evaluación final** | 10 preguntas | Desafío Final con evocación pura en campo de texto (`input`). |
| **Banco base amplio** | 50 o 150 preguntas | Pool interno en base de datos PostgreSQL, no reflejado como sesión única. |

---

## 5.2. Fórmula Universal de Aprobación y Salida Temprana (Early Exit)

Dado que las sesiones varían en longitud (10, 15, 20, 25 o 50 preguntas), el motor de FastAPI no utiliza límites de errores cableados en texto estático. Se aplica de forma estricta la siguiente fórmula matemática:

```text
min_correctas = ceil(total_preguntas × porcentaje_aprobacion)
max_errores_permitidos = total_preguntas - min_correctas
early_exit = max_errores_permitidos + 1
```

Mapeo determinista resultante bajo la regla de aprobación del **90%**:

| Total Preguntas ($N$) | Aprobación Mínima (90%) | Máximo Errores Permitidos | Límite de Salida Temprana (Early Exit) |
| :---: | :---: | :---: | :---: |
| **10** | 9 correctas | 1 error | **2º error** (abortar de inmediato) |
| **15** | 14 correctas | 1 error | **2º error** (abortar de inmediato) |
| **20** | 18 correctas | 2 errores | **3er error** (abortar de inmediato) |
| **25** | 23 correctas | 2 errores | **3er error** (abortar de inmediato) |
| **50** | 45 correctas | 5 errores | **6º error** (abortar de inmediato) |

Al cumplirse la condición de `early_exit`, el backend interrumpe la sesión y avisa al frontend para disparar el flujo remedial y motivacional.

---

## 5.3. Clarificación de Terminología de Generación

Para evitar ambigüedades entre "aleatorio" y "fijo" en los manuales de desarrollo, se declaran los siguientes tres conceptos formales:

1. **Banco Base (Pool)**: El conjunto amplio de preguntas posibles cargadas en PostgreSQL o predefinidas en el motor del backend (ej. las 150 preguntas por módulo).
2. **Sesión Práctica (Session)**: El subconjunto seleccionado mediante `random.sample()` del Banco Base para ser resuelto por el alumno. Una vez inicializada, el orden y los reactivos de la sesión quedan **congelados** para ese intento específico.
3. **Pregunta Generada**: El reactivo creado bajo demanda en tiempo real por los algoritmos controlados del backend FastAPI.

---

## 5.4. Sincronización Transaccional de la Maestría

El avance entre niveles, módulos y fases debe guardarse de forma atómica y transaccional en PostgreSQL. Esto garantiza:
* Consistencia absoluta de la progresión pedagógica.
* Prevención de desbloqueos indebidos causados por desconexiones o refrescos del navegador.
* Control estricto de permisos e imposibilidad de eludir validaciones desde el código cliente (frontend).

Solo las cuentas con rol `ADMIN` pueden inyectar excepciones de bypass en la progresión.

---

# 6. Arquitectura de Base de Datos y Modelado Relacional

La base de datos utiliza PostgreSQL como sistema principal de persistencia.

Tras la certificación técnica, la arquitectura implementa el patrón **Facade**, consolidando los modelos independientes y asíncronos bajo un único punto de registro SQLAlchemy.

Archivo principal:

```text
app/models/sql_models.py
```

Modelos consolidados:

```text
alumno.py
pregunta.py
progreso.py
```

La operación de base de datos debe ser:

* transaccional;
* controlada;
* versionada;
* compatible con migraciones Alembic;
* segura para producción.

---

## 6.1. Modelo: Fase

Define los nodos principales del Viaje Matemático.

| Campo    | Tipo                 | Descripción               |
| -------- | -------------------- | ------------------------- |
| `id`     | Integer, Primary Key | ID único de la fase       |
| `nombre` | String               | Nombre de la fase         |
| `orden`  | Integer              | Posición dentro del viaje |

### Valores esperados para Fase 2

```text
id: 2
nombre: Desarrollo Numérico y Razonamiento
orden: 2
```

---

## 6.2. Modelo: Pregunta

Representa el banco de ejercicios, preguntas preparadas y plantillas dinámicas.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Integer, Primary Key | Identificador único. |
| `fase_id` | Integer, ForeignKey(`fases.id`) | Relación directa con la fase. |
| `modulo` | Integer | Módulo pedagógico, del 1 al 5. |
| `nivel` | Integer | Nivel de dificultad. |
| `tipo_pregunta` | String | Tipo de pregunta (ej. `calculo_directo`). |
| `sub_tipo_desafio` | String, Nullable | Sub-tipo si es evaluación (`desafio_1_estandar`, `desafio_2_avanzado`, `desafio_final_maestria`). |
| `tipo_interfaz` | String | Tipo de interacción de UI (`opcion_multiple`, `evocacion_pura_input`, `subrayado_tokens`, `chained_step`). |
| `enunciado` | Text | Texto o expresión matemática limpia. |
| `payload_tokenizado`| JSONB, Nullable | Array de tokens estructurados interactivos para subrayar. |
| `datos_numericos` | JSONB, Nullable | Variables numéricas para plantillas. |
| `respuesta_correcta` | String | Resultado esperado (evocación o letra de opción). |
| `explicacion_paso_a_paso` | JSONB, Nullable | Pasos detallados para la Tutoría Invisible. |
| `errores_previstos` | JSONB, Nullable | Mapeo de distractores a tipos de error y retroalimentaciones. |
| `tiempo_limite_segundos`| Integer, Nullable | Tiempo límite para desafíos. |
| `origen_pregunta` | String | Procedencia del reactivo (`generada` \| `preparada` \| `plantilla_dinamica`). |
| `estado` | String | Estado del reactivo en producción (`activa` \| `borrador` \| `retirada`). |
| `nivel_dificultad` | Integer | Nivel interno de complejidad relativa de 1 a 5. |

### Tipos de pregunta permitidos

```text
calculo_directo
problema_contexto
plantilla_dinamica
secuencia_logica_patron
constructor_soluciones_chained
```

---

## 6.3. Modelo: Alternativa

Representa opciones de respuesta asociadas a una pregunta.

| Campo         | Tipo                                | Descripción                      |
| ------------- | ----------------------------------- | -------------------------------- |
| `id`          | Integer, Primary Key                | Identificador único              |
| `pregunta_id` | Integer, ForeignKey(`preguntas.id`) | Pregunta asociada                |
| `texto`       | String                              | Texto de la alternativa          |
| `es_correcta` | Boolean                             | Indica si la opción es correcta  |
| `tipo_error`  | String                              | Clasificación del error asociado |

Ejemplos de `tipo_error`:

```text
calculo
comprension
incompleto
operacion_incorrecta
```

---

## 6.4. Modelo: ProgresoMaestria

Rastrea la maestría y el desbloqueo de niveles del alumno.

| Campo                 | Tipo                              | Descripción                      |
| --------------------- | --------------------------------- | -------------------------------- |
| `id`                  | Integer, Primary Key              | Identificador único              |
| `alumno_id`           | Integer, ForeignKey(`alumnos.id`) | Alumno asociado                  |
| `modulo`              | Integer                           | Módulo actual                    |
| `nivel`               | Integer                           | Nivel actual                     |
| `aciertos_acumulados` | Integer                           | Cantidad de respuestas correctas |
| `intentos_totales`    | Integer                           | Cantidad total de intentos       |
| `estado`              | String                            | Estado del progreso              |

### Estados permitidos

```text
bloqueado
en_progreso
aprobado
```

El estado puede mapearse con Enum Python en SQLAlchemy usando:

```text
native_enum=False
```

Esto evita fallos al modificar enums en PostgreSQL en producción.

---

## 6.5. Modelo: Intento

Registra el historial analítico detallado de cada pregunta respondida.

| Campo                  | Tipo                                | Descripción                       |
| ---------------------- | ----------------------------------- | --------------------------------- |
| `id`                   | Integer, Primary Key                | Identificador único               |
| `alumno_id`            | Integer, ForeignKey(`alumnos.id`)   | Alumno asociado                   |
| `pregunta_id`          | Integer, ForeignKey(`preguntas.id`) | Pregunta respondida               |
| `respuesta_dada`       | String                              | Respuesta ingresada por el alumno |
| `es_correcta`          | Boolean                             | Resultado de la validación        |
| `tipo_error_detectado` | String, nullable                    | Error identificado por el backend |
| `tiempo_respuesta`     | Float                               | Tiempo de respuesta en segundos   |

Este modelo es esencial para:

* analítica pedagógica;
* tutoría invisible;
* estadísticas administrativas;
* detección de patrones de error;
* futura personalización con IA.

---

# 7. Optimización de Capa de Datos

Para soportar concurrencia a gran escala en producción, se deben implementar restricciones e índices estratégicos.

## 7.1. Restricción de unicidad

Debe aplicarse una restricción única sobre la combinación:

```text
(alumno_id, modulo, nivel)
```

en el modelo `ProgresoMaestria`.

Esta restricción evita que existan registros duplicados de progreso para un mismo alumno en un mismo nivel.

---

## 7.2. Índices estratégicos

### Índice: `idx_progreso_alumno_fase`

Ubicación:

```text
ProgresoMaestria
```

Objetivo:

optimizar las consultas necesarias para cargar el mapa del Viaje Matemático del alumno y pintar correctamente los niveles bloqueados, disponibles o aprobados.

### Índice: `idx_pool_alumno_bloque`

Ubicación:

```text
Intentos
```

Objetivo:

optimizar reportes analíticos, tutoría IA y estadísticas del Panel de Administración.

---

## 7.3. Migraciones con Alembic

Toda modificación estructural de base de datos debe manejarse mediante migraciones Alembic.

Queda prohibida la creación o alteración manual del DDL durante el evento de inicio de FastAPI:

```text
startup
```

Esta regla es obligatoria para ambientes de producción.

---

# 8. Esquemas de Datos Estructurados JSONB

La Tutoría Invisible y los flujos avanzados de problemas de texto consumen estructuras JSONB para representar explicaciones, errores previstos y lógica pedagógica flexible.

---

## 8.1. Explicación Paso a Paso

Campo:

```text
explicacion_paso_a_paso
```

Ejemplo:

```json
{
  "titulo": "Resolvamos paso a paso",
  "pasos": [
    {
      "orden": 1,
      "instruccion": "Identifica los datos iniciales",
      "detalle": "Carlos tiene R$ 50,00."
    },
    {
      "orden": 2,
      "instruccion": "Suma los gastos realizados",
      "operacion": "18 + 4 = 22",
      "detalle": "Gastó R$ 22,00 en total."
    },
    {
      "orden": 3,
      "instruccion": "Resta los gastos al total inicial",
      "operacion": "50 - 22 = 28",
      "detalle": "Le quedan R$ 28,00."
    }
  ]
}
```

---

## 8.2. Errores Previstos

Campo:

```text
errores_previstos
```

Ejemplo:

```json
{
  "mapeo": [
    {
      "respuesta": "22",
      "tipo_error": "problema_incompleto",
      "feedback": "Calculaste bien los gastos, pero falta restarlos de los R$ 50,00 iniciales."
    },
    {
      "respuesta": "68",
      "tipo_error": "operacion_incorrecta",
      "feedback": "Parece que sumaste todos los números en lugar de restar los gastos."
    }
  ]
}
```

---

## 8.3. Esquema del Enunciado Tokenizado (Herramienta Subrayadora - Módulo 4)

Para el funcionamiento seguro y determinista de la herramienta de subrayado en el Módulo 4, el enunciado de la pregunta no se envía como texto plano. Se almacena y expone como un esquema estructurado de tokens en una columna JSONB (`payload_tokenizado`).

### Estructura del payload en la Base de Datos

Cada token representa una palabra, número o conector con propiedades que definen si es interactivo y cuál es su rol pedagógico.

```json
{
  "tokens": [
    {
      "id": 0,
      "texto": "Lucas",
      "seleccionable": false,
      "rol": "conector"
    },
    {
      "id": 1,
      "texto": "tiene",
      "seleccionable": false,
      "rol": "conector"
    },
    {
      "id": 2,
      "texto": "5 manzanas rojas",
      "seleccionable": true,
      "rol": "dato_util",
      "valor_matematico": 5
    },
    {
      "id": 3,
      "texto": "en su mochila, y",
      "seleccionable": false,
      "rol": "conector"
    },
    {
      "id": 4,
      "texto": "3 perros",
      "seleccionable": true,
      "rol": "distractor",
      "valor_matematico": 3
    },
    {
      "id": 5,
      "texto": "jugando en el patio.",
      "seleccionable": false,
      "rol": "conector"
    }
  ]
}
```

### Contrato de Entrada y Salida (API / Pedagógica)

1. **Salida del Backend (Pregunta enviada al frontend)**: El API responde con la colección de tokens tal como está en el modelo. El frontend renderiza un párrafo donde los elementos con `"seleccionable": true` son botones o áreas de texto interactivos (con estilos de cursor de puntero y color sutil al pasar el mouse).
2. **Entrada al Backend (Respuesta enviada por el alumno)**: El alumno hace clic sobre los elementos interactivos para "subrayarlos" (activando visualmente un estilo de marca-textos). Al presionar el botón "Validar", el frontend no envía texto crudo; envía una estructura con los identificadores enteros de los tokens seleccionados:
   ```json
   {
     "pregunta_id": 4102,
     "tokens_seleccionados": [2]
   }
   ```
3. **Validación determinista en el Servidor**: El backend verifica si la lista `tokens_seleccionados` coincide exactamente con los ids de los tokens cuyo rol es `"dato_util"` (o la combinación pedagógica solicitada por el nivel), eliminando de raíz las inconsistencias por puntuación, espacios y acentos.

---

## 8.4. Modelo de Registro Detallado de Multi-Pasos (Módulo 5)

En el Módulo 5, al tratarse de problemas resueltos en cadena de múltiples pasos, un modelo de registro plano (`Intento`) no es suficiente porque mezcla y degrada las métricas de acierto. Para solucionarlo, se implementa una separación analítica en dos niveles mediante dos modelos de base de datos relacionales: `IntentoPregunta` (la sesión macro) e `IntentoPaso` (el registro granular por paso).

### Modelo: `IntentoPregunta` (Sesión de la Pregunta)
Rastrea la resolución general de la pregunta compuesta de 2 pasos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Integer, PK | Identificador único del intento general. |
| `alumno_id` | Integer, FK | Relación con el alumno. |
| `pregunta_id` | Integer, FK | Relación con la pregunta del Módulo 5. |
| `aprobada_completa`| Boolean | Indica si completó ambos pasos de forma exitosa. |
| `intentos_totales` | Integer | Cuántas veces intentó la pregunta (incluyendo fallos). |
| `tiempo_total` | Float | Tiempo acumulado de resolución en segundos. |

### Modelo: `IntentoPaso` (Registro Granular del Paso)
Registra cada uno de los intentos individuales de respuesta en un paso específico de la pregunta del Módulo 5.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Integer, PK | Identificador único de este intento de paso. |
| `intento_pregunta_id`| Integer, FK | Relación con `IntentoPregunta`. |
| `paso_numero` | Integer | Número de paso (`1` o `2`). |
| `respuesta_dada` | String | Valor ingresado por el alumno. |
| `es_correcta` | Boolean | Resultado de la validación. |
| `tipo_error_detectado`| String | Error específico diagnosticado en este paso (ej. `calculo`, `operacion`). |
| `es_espejo` | Boolean | Indica si este intento ocurrió dentro de una variante espejo. |
| `tiempo_respuesta` | Float | Tiempo consumido en este paso específico. |

Esta separación permite a la **Tutoría Invisible** saber con total precisión que el alumno domina las restas de dos dígitos (Paso 1) pero falla sistemáticamente en las multiplicaciones de factor 3 (Paso 2), sin perder la granularidad de sus errores en el registro de progreso general.

---

# 9. Riesgos Técnicos y Casos de Borde

Para blindar la estabilidad del sistema y asegurar una experiencia de usuario adecuada, el backend y el frontend deben mitigar los siguientes escenarios críticos.

---

## 9.1. Bloqueo del “Pequeño Fracaso”

### Escenario

El alumno necesita alcanzar un mínimo de **90% de precisión** para aprobar un nivel.

En un bloque de 50 preguntas, esto equivale a:

```text
45 respuestas correctas de 50
```

Por lo tanto, el alumno puede cometer como máximo:

```text
5 errores
```

Si comete el sexto error antes de finalizar el bloque, por ejemplo en la pregunta 12, matemáticamente ya no podrá alcanzar el 90% requerido.

### Impacto

Obligar al alumno a responder las preguntas restantes en una situación donde ya no puede aprobar puede provocar:

* frustración;
* pérdida de motivación;
* abandono del flujo;
* reducción de retención;
* experiencia negativa con la plataforma.

### Regla de mitigación

El backend debe implementar un sistema de **Fallo Temprano** (*Early Exit*).

Cuando el contador de errores del bloque llegue a 6, la API debe detener el flujo principal de evaluación y activar una de las siguientes rutas:

1. subflujo remedial;
2. cierre controlado del nivel;
3. feedback motivacional;
4. recomendación de refuerzo;
5. repetición guiada del bloque.

El objetivo no es castigar el error, sino reconducir al alumno hacia una experiencia de recuperación pedagógica.

---

## 9.2. Desalineación de Cadenas en la Herramienta Subrayadora

### Escenario

En el Módulo 4, el alumno debe subrayar elementos del texto para clasificar datos útiles, distractores o información relevante.

Si el backend envía el enunciado como texto plano y luego evalúa comparando substrings crudos, pueden ocurrir falsos negativos debido a:

* espacios adicionales;
* puntuación;
* acentos;
* variaciones de formato;
* caracteres especiales;
* símbolo de moneda `R$`;
* diferencias entre frontend y backend en el tratamiento del texto.

### Impacto

El alumno podría seleccionar correctamente una parte del enunciado, pero el sistema podría marcarla como incorrecta por una diferencia técnica de cadena.

Esto dañaría:

* confianza del alumno;
* precisión de la evaluación;
* calidad de la tutoría;
* confiabilidad del módulo.

### Regla de mitigación

Las preguntas que requieran interacción de subrayado deben enviarse desde la base de datos de manera **tokenizada**.

El campo del enunciado debe estructurarse como un array de objetos indexados.

Ejemplo:

```json
[
  {"id": 0, "texto": "Carlos", "tipo": "distractor"},
  {"id": 1, "texto": "tenía", "tipo": "conector"},
  {"id": 2, "texto": "R$ 50,00.", "tipo": "dato_util"}
]
```

El componente React debe renderizar el texto a partir de estos tokens.

El frontend no debe enviar substrings al backend.

Debe enviar únicamente:

```text
IDs seleccionados
```

De esta forma, la validación se vuelve determinista, estable e independiente de diferencias de formato textual.

---

## 9.3. Degradación del Rendimiento en Consultas Agregadas

### Escenario

La tabla `Intentos` acumulará rápidamente millones de registros en ambientes de alta concurrencia.

Si la Tutoría IA o los reportes administrativos intentan buscar patrones consultando directamente estructuras JSONB complejas, especialmente dentro de `errores_previstos`, las consultas pueden degradar severamente el rendimiento de PostgreSQL.

### Impacto

Esto puede provocar:

* lentitud en reportes;
* sobrecarga de CPU;
* bloqueo de consultas;
* aumento de latencia;
* mala experiencia del administrador;
* riesgo de impacto sobre usuarios activos.

### Regla de mitigación

El modelo `Intento` debe mantener una columna plana e indexable:

```text
tipo_error_detectado
```

Esta columna debe ser de tipo `String` nativo en PostgreSQL.

El backend debe resolver el mapeo del error en tiempo de ejecución y guardar directamente la etiqueta final en esta columna.

Ejemplos:

```text
calculo
comprension
problema_incompleto
operacion_incorrecta
distractor_seleccionado
```

De esta forma, los reportes y modelos de tutoría pueden consultar patrones de error sin parsear estructuras JSONB pesadas.

---

## 9.4. Bucle Infinito en Scripts de Sembrado (Seeders)

### Escenario
Los scripts de generación aleatoria utilizan bucles `while len(pool) < cantidad`. Si las restricciones de unicidad (como enunciados o combinaciones numéricas distintas) son demasiado estrictas en comparación con el espacio combinatorio real, el generador entrará en un bucle infinito consumiendo 100% de CPU y bloqueando el despliegue.

### Impacto
* Bloqueo de pipelines de CI/CD.
* Agotamiento de recursos en el servidor de base de datos.
* Demora indefinida en la inicialización de ambientes.

### Regla de mitigación
Cada bucle de generación aleatoria debe estar protegido por una variable `intentos` y un límite de seguridad estricto `max_intentos` (ej. `cantidad * 50`). Si se alcanza este límite, el script debe interrumpir la ejecución lanzando una excepción clara (`ValueError`) indicando el nivel y módulo del fallo combinatorio.

---

## 9.5. Errores de Precisión en Monedas de Punto Flotante (IEEE 754)

### Escenario
En el Módulo 3, representar precios y vueltos mediante tipo `Float` en JavaScript o Python (ej. `2.50` o `1.10`) genera imprecisiones acumuladas por la representación decimal binaria (ej. `3.6000000000000005`), haciendo que las comparaciones de respuestas del servidor fallen de forma errática.

### Impacto
* Falsos negativos injustos para los alumnos.
* Frustración y quejas por fallos técnicos de centavos.
* Inconsistencias contables en reportes.

### Regla de mitigación
Queda prohibido operar con números decimales flotantes en el backend y base de datos para la gestión monetaria. Todos los precios se procesan y almacenan como **enteros en centavos** (ej. `250` en lugar de `2.50`). La interfaz de usuario es la única encargada de formatear el valor a texto legible con coma `R$ X,XX` dividiendo por 100 en la salida.

---

## 9.6. Desabastecimiento del Pool de Muestreo (Starvation)

### Escenario
Al iniciar un bloque de práctica, el backend ejecuta un muestreo aleatorio (ej. `random.sample(pool, 15)`). Si por algún error de sembrado el banco de preguntas de un nivel particular en PostgreSQL contiene menos registros que la cantidad de preguntas solicitadas para la sesión, el método lanzará una excepción fatal abortando el juego.

### Impacto
* Caídas de la API al cargar un nivel.
* Interrupción total de la experiencia del estudiante.
* Pantallas de error de carga de nivel.

### Regla de mitigación
El backend debe implementar una validación de tamaño mínimo antes del muestreo. Si `len(pool) < cantidad_solicitada`, debe capturar el caso, registrar una alerta en Sentry y realizar un fallback dinámico (ej. entregar todas las preguntas disponibles o duplicar temporalmente el pool con variaciones leves). Asimismo, se establecen pruebas unitarias automáticas en el pipeline de desarrollo para verificar que el pool de base de datos de cada nivel supere siempre las 150 preguntas.

---

## 9.7. Pérdida de Estado por Refresco de Navegador

### Escenario
Si el estado de la sesión de práctica (como el contador de errores o el índice actual de pregunta) reside únicamente en la memoria React o en el `localStorage` del frontend, un refresco accidental de la pantalla o un cierre del navegador permitirá al alumno reiniciar su contador de errores y evadir la Salida Temprana (Early Exit).

### Impacto
* Vulneración del flujo de maestría y progresión pedagógica.
* Alumnos aprobando niveles mediante el simple método de refrescar la pantalla tras cometer errores.

### Regla de mitigación
Toda la máquina de estados de la evaluación es **Server-Authoritative**. El backend mantiene en la tabla `SesionEvaluacion` el estado persistente del intento activo (`indice_actual`, `errores_acumulados`). Al cargar la interfaz, el frontend consulta el estado de hidratación al endpoint del backend, reanudando la partida exactamente en el mismo estado en que se quedó, protegiendo las reglas del Early Exit.

---

## 9.8. Manipulación de Parámetros de Calificación (Tampering)

### Escenario
Endpoints de validación que aceptan parámetros enviados por el cliente del tipo `es_correcta: true` o `puntos_ganados: 10` permiten que cualquier usuario con conocimientos básicos de consola de navegador simule respuestas exitosas enviando peticiones manipuladas a la API.

### Impacto
* Trampas y alteración fraudulenta del progreso pedagógico.
* Reportes analíticos de maestría completamente invalidados.

### Regla de mitigación
El endpoint de respuesta `/pedagogia/responder` únicamente debe aceptar el `pregunta_id` (o `paso_id`) y la `respuesta_dada` (como string crudo o array de IDs de tokens). La lógica de verificación de aciertos y otorgamiento de maestría es de exclusiva autoridad del servidor en base a los registros guardados en PostgreSQL.

---

## 9.9. Condiciones de Carrera en Actualizaciones de Progreso

### Escenario
Peticiones paralelas enviadas en milisegundos de diferencia por dobles clics rápidos en interfaces táctiles pueden causar que se inserten filas duplicadas de maestría `ProgresoMaestria` para un mismo alumno y nivel, rompiendo la integridad relacional de la base de datos.

### Impacto
* Duplicados en tablas y fallos de integridad referencial.
* Pantallas de perfil de alumno cargando progresos inconsistentes.

### Regla de mitigación
Se aplica una restricción de clave única compuesta `UNIQUE (alumno_id, modulo, nivel)` sobre `ProgresoMaestria` en PostgreSQL. Todas las escrituras de progresión deben manejarse mediante cláusulas de inserción seguras (ej. `UPSERT` / `ON CONFLICT DO UPDATE`) garantizando la idempotencia absoluta de la operación relacional.

---

# 10. Hoja de Ruta de Implementación de la Fase 2

## 10.1. Etapa 1 — Estructura Base y Lógica Central

**Estado:** completado.

Tareas:

* [x] Consolidación del Facade relacional en `sql_models.py`.
* [x] Definición de modelos principales.
* [x] Creación de índices optimizados.
* [x] Implementación de restricciones de unicidad.
* [x] Creación de endpoints pedagógicos centralizados.
* [x] Endpoint `/pedagogia/dashboard`.
* [x] Endpoint `/pedagogia/responder`.
* [x] Configuración de Alembic.
* [x] Configuración de ciclo asíncrono.
* [x] Control de versiones de esquema en producción.

---

## 10.2. Etapa 2 — Integración de UI y Motor Híbrido

**Estado:** siguiente iteración.

Tareas:

* [ ] Remover por completo la dependencia del frontend en `mathService.ts` para la Fase 2.
* [ ] Crear vistas declarativas en React Router DOM v6+.
* [ ] Implementar ruta `/fase/2/welcome`.
* [ ] Implementar ruta `/fase/2/play`.
* [ ] Implementar ruta `/fase/2/results`.
* [ ] Crear el componente de Tutoría Invisible.
* [ ] Interpretar desde UI las estructuras `errores_previstos` y `explicacion_paso_a_paso`.
* [ ] Construir la herramienta subrayadora interactiva.
* [ ] Aplicar renderizado por tokens para los Módulos 4 y 5.
* [ ] Enviar al backend únicamente IDs seleccionados por el alumno.

---

# 11. Reglas Operativas para el Equipo de Desarrollo

Para mantener la coherencia técnica del proyecto, el equipo debe respetar las siguientes reglas:

1. El frontend nunca debe validar respuestas como autoridad final.
2. El backend debe calcular y validar la respuesta correcta.
3. Las preguntas generadas deben respetar las reglas pedagógicas del módulo y nivel.
4. Los problemas de texto complejos deben venir desde base de datos.
5. Las estructuras de tutoría deben almacenarse como JSONB.
6. Los errores detectados deben registrarse en columnas consultables.
7. Toda migración estructural debe pasar por Alembic.
8. No se debe alterar el esquema de base de datos desde el `startup` de FastAPI en producción.
9. Los módulos 4 y 5 deben priorizar control pedagógico sobre generación aleatoria.
10. Todo avance de progreso debe guardarse de forma transaccional.

---

# 12. Conclusión

La Fase 2 de LogicaKids Pro adopta una arquitectura sólida para combinar cálculo mental, razonamiento matemático, comprensión lectora y resolución de problemas.

El modelo híbrido permite aprovechar lo mejor de dos enfoques:

* generación aleatoria controlada para ejercicios matemáticos repetibles y variados;
* banco de preguntas preparadas para problemas complejos que requieren control narrativo y pedagógico.

La incorporación de Tutoría Invisible, JSONB, validación server-authoritative, control de maestría y registro analítico de intentos convierte esta fase en una base preparada para evolución futura hacia:

* aprendizaje adaptativo;
* tutoría con IA;
* reportes pedagógicos avanzados;
* personalización de rutas;
* diagnóstico automático de errores;
* y mejora continua del banco de preguntas.

La prioridad del desarrollo debe ser mantener equilibrio entre robustez técnica, claridad pedagógica y experiencia motivacional del alumno.



***************************************
****************************************
Modulo 1
🏗️ [FASE 2: DESARROLLO NUMÉRICO Y RAZONAMIENTO]
Propósito: Pasar del cálculo puramente mecánico al pensamiento numérico estructurado y abstracto.

🧠 MÓDULO 1: GIMNASIO NUMÉRICO MENTAL
Tema: Escalas, relaciones distributivas y jerarquía.

Propósito Pedagógico: Eliminar la dependencia de los dedos y el conteo de uno en uno, instalando en la mente del alumno el concepto de operador de escala (escalar un número) y la prioridad matemática innata (la multiplicación domina sobre la suma).

📋 Estructura de Niveles (Textos Interactivos)
👑 Nivel 1: Conceptos de doble, triple, mitad y cuádruple
Texto de Descubrimiento: ¡Hola, atleta de la mente! Bienvenido al Gimnasio Numérico. Hoy vas a entrenar tus músculos lógicos con los Multiplicadores de Tamaño. Cuando doblas, triplicas o cuadruplicas un número, estás usando un rayo de crecimiento matemático. Si lo partes a la mitad, usas un rayo reductor.

El Diccionario del Nivel:

El Doble: Multiplica por 2 (× 2).

El Triple: Multiplica por 3 (× 3).

La Mitad: Divide entre 2 (÷ 2).

El Cuádruple: Multiplica por 4 (× 4).

⚠️ ¡Cuidado con la Trampa del Apuro! El monstruo del desorden quiere que sumes en lugar de multiplicar. Si te piden el triple de 4, la trampa es hacer 4 + 3 = 7. ¡Error! El triple significa tres veces el mismo número: 4 × 3 = 12.

⚡ Interactivo 1: Tengo 6 tazos coleccionables en mi cajón y mi hermano tiene el doble. ¿Cuántos tazos tiene mi hermano? [ Input ] (Respuesta: 12)

🧠 Interactivo 2: Sofía preparó 16 panqués y se comió la mitad con sus amigos. ¿Cuántos panqués quedan? [ Input ] (Respuesta: 8)

🎯 Interactivo 3: En un árbol hay 5 pájaros, pero en el tejado hay el cuádruple. ¿Cuántos pájaros hay en el tejado? [ Input ] (Respuesta: 20)

👑 Nivel 2: Prioridad algebraica: orden de operaciones y uso de paréntesis
Texto de Descubrimiento: ¡Atención! Los números tienen reglas de oro y jerarquías como los caballeros antiguos. En una fila de operaciones matemáticas, la multiplicación y la división siempre se resuelven antes que la suma y la resta. Pero hay un escudo mágico supremo: Los Paréntesis ( ). Cualquier operación atrapada dentro de un paréntesis se resuelve primero, sin importar qué símbolo sea.

⚠️ ¡Cuidado con la Trampa de Leer de Corrido! Si ves 3 + 2 × 5, la tentación es leer de izquierda a derecha: 3 + 2 = 5, y luego 5 × 5 = 25. ¡Error! La multiplicación exige prioridad: primero calculas 2 × 5 = 10 y luego sumas el 3: 3 + 10 = 13.

⚡ Interactivo 1: Resuelve respetando la prioridad: 5 + 4 × 2 = [ Input ] (Respuesta: 13)

🧠 Interactivo 2: Los paréntesis tienen el poder absoluto. Resuelve: (5 + 4) × 2 = [ Input ] (Respuesta: 18)

🎯 Interactivo 3: Resuelve con calma: 20 - 10 ÷ 2 = [ Input ] (Respuesta: 15)

👑 Nivel 3: Traducción del lenguaje verbal a expresiones numéricas abstractas
Texto de Descubrimiento: ¡Te has convertido en un traductor de élite! Las historias humanas están llenas de palabras que esconden fórmulas matemáticas abstractas. Tu misión es leer el enunciado, identificar la operación y ordenarla usando paréntesis si es necesario.

⚠️ ¡Cuidado con la Trampa de los Cables Cruzados! Si la historia dice: "A la suma de 3 y 4 multiplícala por 2", no debes escribir 3 + 4 × 2 porque la multiplicación se comería al 4 primero. Tienes que proteger la suma con un paréntesis: (3 + 4) × 2.

⚡ Interactivo 1: Traduce y resuelve: "El triple de la suma de 2 y 3". [ Input ] (Respuesta: 15)

🧠 Interactivo 2: Traduce y resuelve: "A 20 le resto la mitad de 8". [ Input ] (Respuesta: 16)

🎯 Interactivo 3: Traduce y resuelve: "El doble de 10, y al resultado le sumo 5". [ Input ] (Respuesta: 25)


****************
🔄 MÓDULO 2: TABLAS EN ACCIÓN
Tema: Ecuaciones de un paso y operaciones inversas.

Propósito Pedagógico: Sentar las bases del álgebra abstracta desmitificando el despeje de incógnitas. El alumno aprende que el símbolo de igualdad (=) es una balanza en equilibrio y que para deshacer una acción debe aplicar su operación inversa exacta.

📋 Estructura de Niveles (Textos Interactivos)
👑 Nivel 1: Operación Inversa - Suma y Resta
Texto de Descubrimiento: ¡Bienvenido al mundo al revés! Hoy vas a aprender el superpoder del Camino de Regreso. Si una máquina matemática le sumó un número a tu inventario secreto y quieres descubrir cuál era tu número original, solo debes viajar hacia atrás aplicando una Resta. La resta destruye a la suma, y la suma destruye a la resta.

⚠️ ¡Cuidado con la Trampa de la Balanza Desequilibrada! Si ves que un número sumaba al lado de tu incógnita, no lo pases al otro lado sumando también. Romperías el equilibrio. Para cruzar la frontera del igual (=), debe cambiar de bando usando su operación contraria.

⚡ Interactivo 1: Un número misterioso se junta con 5 y el resultado final es 12. ¿Cuál es el número misterioso? [ Input ] (Respuesta: 7)

🧠 Interactivo 2: A un cofre con gemas le roban 4 y quedan 10 gemas dentro. ¿Cuántas gemas tenía el cofre al inicio? [ Input ] (Respuesta: 14)

🎯 Interactivo 3: Resuelve el regreso: Si X - 8 = 2, entonces X vale... [ Input ] (Respuesta: 10)

👑 Nivel 2: Operación Inversa - Multiplicación y División
Texto de Descubrimiento: ¡Subimos la velocidad! Ahora la máquina misteriosa multiplica y divide en secreto. Si un número fue multiplicado por 3 para crecer, el camino de regreso para rescatar al número original es Dividir entre 3. La multiplicación y la división son espejos perfectos: una arma grupos y la otra los desarma.

⚠️ ¡Cuidado con la Trampa del Espejo Roto! Si te dicen que el triple de un número es 15, no multipliques 15 × 3 = 45. Estarías haciendo crecer el número dos veces. Usa el espejo inverso: divide 15 ÷ 3 = 5.

⚡ Interactivo 1: El doble de mi edad actual da como resultado 20 años. ¿Cuántos años tengo? [ Input ] (Respuesta: 10)

🧠 Interactivo 2: Repartí mis estampas entre 4 amigos en partes iguales y a cada uno le tocaron 5. ¿Cuántas estampas tenía yo al principio? [ Input ] (Respuesta: 20)

🎯 Interactivo 3: Resuelve el espejo: Si 3 × Y = 18, entonces Y vale... [ Input ] (Respuesta: 6)

👑 Nivel 3: El Número Faltante
Texto de Descubrimiento: ¡Es hora de convertirte en un cazador de espacios vacíos! En este nivel, las ecuaciones se presentan como un reto de casillas en blanco. Verás un espacio desierto [ ] o una incógnita pura mezclada en cualquier posición de la operación. Tu trabajo es mantener la balanza equilibrada despejando el espacio vacío.

⚠️ ¡Cuidado con la Trampa del Espacio Cambiado! Si ves 15 - [ ] = 10, ten cuidado con sumar 15 + 10. Piensa de forma intuitiva: a 15 le tienes que quitar algo para que se convierta en 10. El espacio faltante se calcula restando 15 - 10 = 5.

⚡ Interactivo 1: Completa el espacio faltante: 8 + [ ] = 20 [ Input ] (Respuesta: 12)

🧠 Interactivo 2: Completa el espacio faltante: [ ] ÷ 3 = 6 [ Input ] (Respuesta: 18)

🎯 Interactivo 3: Completa el espacio faltante: 25 - [ ] = 15 [ Input ] (Respuesta: 10)

👑 Nivel 4: Gran Integración
Texto de Descubrimiento: ¡Felicidades, estratega! Has unificado tus conocimientos de operaciones inversas. En este nivel de máxima velocidad operacional, el servidor barajarará incógnitas aditivas y multiplicativas al azar. Tendrás que cambiar tu chip mental en milisegundos para decidir si regresas sumando, restando, multiplicando o dividiendo.

⚠️ ¡Cuidado con la Trampa del Cruce de Cables! No apliques una resta para deshacer una división, ni uses una división para deshacer una resta. Mira fijamente el símbolo original de la balanza antes de ejecutar el contraataque matemático.

⚡ Interactivo 1: Resuelve la incógnita: X + 14 = 30 [ Input ] (Respuesta: 16)

🧠 Interactivo 2: Resuelve la incógnita: 4 × Z = 32 [ Input ] (Respuesta: 8)

🎯 Interactivo 3: Resuelve la incógnita: Y - 9 = 11 [ Input ] (Respuesta: 20)