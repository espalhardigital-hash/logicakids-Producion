Aquí tienes el documento maestro completo y detallado para la **Fase 3: Problemas de Texto y Sistemas Simples**, siguiendo exactamente la misma arquitectura pedagógica, tono gamificado (detectives/científicos) y estructura técnica de los documentos anteriores.

Este documento está listo para ser entregado al equipo de desarrollo y pedagogía para su implementación.

---

# Documento de Reglas para Generación y Carga de Preguntas — Fase 3 LogicaKids Pro

**Versión:** 1.0 — Documento Base
**Fase:** Fase 3 — Problemas de Texto y Sistemas Simples
**Proyecto:** LogicaKids Pro

---

# 1. Propósito del Documento

Este documento define las directrices pedagógicas, narrativas y técnicas para la **Fase 3**, centrada en erradicar el analfabetismo matemático funcional. El objetivo es que los alumnos de 10 años dominen la lectura matemática, el filtrado de distractores y la deducción de valores ocultos (sistemas de ecuaciones camuflados).

**Mecánica Principal de Interfaz:** Esta fase introduce el **Cuaderno del Detective** y la **Estantería de Datos**. El alumno no solo ingresa números, sino que interactúa con el texto (subrayando con tokens) y arrastra datos para ensamblar operaciones lógicas antes de calcular.

---

# 2. Especificación de Interfaz de Usuario (UI/UX)

Para esta fase, la plataforma abandona el input simple y adopta una interfaz de investigación y diagnóstico paso a paso, acorde a la estética global (cyberpunk, glassmorphism con fondos profundos `slate-950`).

La pantalla principal de práctica se divide en tres secciones funcionales:

## 2.1. Sección 1: El Cuaderno del Detective (Izquierda)
Un lienzo de texto interactivo que imita una hoja de libreta digital con fondo oscuro translúcido (`bg-slate-900/40 backdrop-blur-md`).

* **Subrayado Interactivo (Herramienta Tokenizadora):** El niño no teclea directamente. Hace clic o pulsa sobre palabras/números en el enunciado para "resaltarlos".
* **Datos Importantes:** Se iluminan con un destello verde.
* **Datos Distractores / Basura:** Se iluminan con un destello rojo o gris apagado.

## 2.2. Sección 2: La Estantería de Datos (Derecha / Base)
Tarjetas flotantes dinámicas que se van rellenando a medida que el alumno identifica correctamente los elementos en el Cuaderno del Detective:

* **Caja de Pregunta Principal:** Campo para colocar o seleccionar qué es exactamente lo que el problema pide calcular.
* **Caja de Datos Numéricos:** Lista visual donde "aterrizan" los valores clave aislados del texto (ej. 35 caramelos, 12 bolsas).

## 2.3. Sección 3: Constructor de Operaciones (Inferior)
Una zona de ensamblaje (arrastrar y soltar o selección múltiple) donde el niño construye la ecuación antes de resolverla:

* **Espacio Interactivo:** `[ Dato A ]   [ Operador (+, -, *, /) ]   [ Dato B ]   =   [ Resultado ]`
* **Feedback Visual Inmediato:** Si el niño elige una operación que no corresponde a la lógica del texto, la interfaz le guiará sutilmente resaltando la palabra clave en el enunciado (ej. si intenta restar cuando el texto dice "repartir", la palabra "repartir" resalta en azul, sugiriendo división).

## 2.4. Feedback Pedagógico (Tutoría Invisible)
* **Feedback de Aciertos:** Animación de resolución de enigma (ej. lupas o destellos cian/púrpura flotando).
* **Feedback de Error (Bucle Espejo):** En caso de error, el sistema nunca da la respuesta directa. Desglosa la libreta explicando: "¿Notaste que el problema nos dice que Carlos 'regaló' sus juguetes? Eso significa que su cantidad disminuyó. ¿Qué operación deberíamos usar?".

---

# 3. Reglas Generales de Generación (Backend)

* **Origen de Datos:** Banco de Ejercicios Preparados en base de datos PostgreSQL.
* **Estructura Requerida por Pregunta:**
  * Enunciado claro y narrativo adecuado para niños de primaria.
  * Al menos 1 dato irrelevante (distractor) obligatorio en los niveles correspondientes para evaluar la atención selectiva.
  * Explicación de tutoría estructurada por pasos en formato JSONB.
* **Progresión Estricta:** Práctica inicial sin presión de tiempo (con Bucle Espejo), seguida de Desafíos cronometrados. Se requiere una maestría mínima del 90% para aprobar.

---

# 4. Módulos de Aprendizaje

## 4.1. MÓDULO 1: TRADUCCIÓN Y FILTRO (EL ESCÁNER DE LA VERDAD)

**Propósito Pedagógico:** Enseñar al alumno a no operar a ciegas. Aprenderán a identificar primero la pregunta, subrayar solo los datos útiles y congelar la información "basura".

### 👑 Nivel 1: Descubrimiento — El Lápiz Mágico
¡Hola, Detective de la Lógica! Bienvenido a la Fase 3. Hoy recibes tu placa oficial y tu primera herramienta: **El Lápiz Mágico**.
En la vida real, los problemas no vienen como sumas limpias (`5 + 3`), vienen escondidos en historias. El monstruo del Desorden intentará confundirte poniéndote números que no necesitas. Tu primer superpoder es **leer la pregunta final antes que nada**, porque ella te dirá qué números son pistas reales y cuáles son simple basura.

> ⚠️ **¡Cuidado con la Trampa de la Suma Ciega!**
> El monstruo quiere que leas la historia rápido, veas tres números distintos y los sumes todos sin pensar.
> * **❌ El Camino Incorrecto:** "Carlos tiene 5 perros, 3 gatos y 2 bicicletas. ¿Cuántos animales tiene?" $\rightarrow$ Sumar `5 + 3 + 2 = 10`. ¡Acabas de convertir las bicicletas en animales!
> * **✅ El Camino Correcto:** Leer la pregunta: "¿Cuántos animales?". Activar el Lápiz Mágico para subrayar los 5 perros y los 3 gatos. Ignorar el 2. Sumar: `5 + 3 = 8`.

* **⚡ ¡Pruébalo ya! (Interactivo 1):** En tu mochila hay 4 cuadernos rojos, 2 lápices y 3 cuadernos azules. ¿Cuántos cuadernos tienes en total? *(Subraya los datos útiles en tu pantalla y resuelve).*
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Sofía compró 10 dulces de fresa, 5 galletas saladas y 4 dulces de limón. ¿Cuántos dulces compró en total?
`[ Escribe tu respuesta aquí ]`
* **🎯 ¡Tu turno! (Interactivo 3):** Un árbol tiene 8 pájaros en la rama alta, 3 ardillas en el tronco y 4 pájaros en la rama baja. ¿Cuántas aves hay en el árbol?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 2: Consolidación — El Escudo Anti-Basura
¡Excelente trabajo! Ya sabes buscar la pregunta. Ahora vamos a entrenar con historias un poco más largas. Aquí los distractores numéricos serán más engañosos. Recuerda: si un dato no responde directamente a la pregunta principal, debes congelarlo con tu **Escudo Anti-Basura**.

* **⚡ ¡Pruébalo ya! (Interactivo 1):** En una carrera de 10 kilómetros, el corredor número 42 llegó a la meta en el primer lugar ganando un premio de R$ 500. ¿Cuál era el número en la camiseta del ganador? *(Cuidado, hay mucha basura aquí).*
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Para hacer una torta de 3 pisos, la abuela necesita 5 huevos, 2 tazas de leche y 400 gramos de harina. Si quiere hacer la torta, ¿cuántos huevos usará?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 3: Fluidez — El Laberinto Numérico
Este es el nivel experto del filtro. Aquí tendrás problemas donde todos los datos parecen importantes, pero solo algunos se relacionan mediante una sola operación.

* **🎯 ¡Tu turno! (Interactivo 3):** Un tren viaja a 80 km por hora. Salió de la estación con 45 pasajeros. En la primera parada, que duró 15 minutos, subieron 10 pasajeros más. ¿Cuántos pasajeros hay ahora en el tren? *(Filtra la velocidad y el tiempo, enfócate en las personas).*
`[ Escribe tu respuesta aquí ]`

## 4.2. MÓDULO 2: SECUENCIA TEMPORAL (LA MÁQUINA DEL TIEMPO)

**Propósito Pedagógico:** Enseñar que los problemas matemáticos son historias con una línea de tiempo (Inicio $\rightarrow$ Medio $\rightarrow$ Final). Aprenderán a avanzar paso a paso y a usar operaciones inversas para "viajar al pasado".

### 👑 Nivel 1: Descubrimiento — El Reloj hacia Adelante
¡Bienvenido al segundo módulo, Viajero del Tiempo! En estas misiones las cosas cambian a medida que avanzan las horas. Alguien "tenía" algo en la mañana, luego "ganó" o "perdió" cosas en la tarde, y debes averiguar con qué terminó en la noche. Tu superpoder es **escribir la historia en estricto orden cronológico**.

> ⚠️ **¡Cuidado con la Trampa del Desorden Temporal!**
> * **❌ El Camino Incorrecto:** Leer todo rápido y restar el número grande del pequeño sin importar cuándo pasó.
> * **✅ El Camino Correcto:** Haz una película en tu mente. Paso 1: ¿Cuánto había al inicio? Paso 2: ¿Llegó más (suma) o se fue algo (resta)? Paso 3: Calcula el final.

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Mateo tenía 15 tazos en la mañana. En el recreo ganó 5 tazos jugando, pero a la salida perdió 2. ¿Con cuántos tazos llegó a casa?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Un bus arranca con 20 personas. En la primera parada bajan 5. En la segunda parada suben 8. ¿Cuántas personas van ahora?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 2: Consolidación — El Reloj en Reversa
¡Alerta de anomalía temporal! En este nivel, el monstruo del desorden nos robó el dato del principio de la historia. Nos dice qué pasó en el medio y con cuánto terminamos. Para encontrar el inicio, debes usar la **Máquina del Tiempo en Reversa** (operaciones inversas que aprendiste en la Fase 2).

> 💡 **Regla del Viaje al Pasado:** Si en la historia el personaje "perdió" (-), para volver al pasado tú debes "sumar" (+). Si "ganó" (+), tú debes "restar" (-).

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Piensa en reversa: Lucas tenía algunos juguetes. Le regaló 4 a su hermano y se quedó con 10. ¿Cuántos juguetes tenía al principio? *(Si regaló, viaja al pasado sumando: 10 + 4).*
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Valentina tenía ahorrado cierto dinero. Su tía le regaló R$ 15,00 y ahora tiene R$ 40,00 en total. ¿Cuánto dinero tenía al principio?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 3: Fluidez — Historias de 3 Pasos
¡El desafío final de la línea temporal! Historias encadenadas donde un pequeño error en el paso 1 destruirá toda la línea del tiempo.

* **🎯 ¡Tu turno! (Interactivo 3):** Luiz tenía 12 figuritas de Bafo. El lunes ganó 8. El martes le regaló la mitad de todas las figuritas que tenía a su mejor amigo. El miércoles se encontró 3 figuritas en el piso. ¿Con cuántas figuritas terminó Luiz?
`[ Escribe tu respuesta aquí ]`

## 4.3. MÓDULO 3: DEDUCCIÓN DE PRECIOS (EL OJO DEL COMERCIANTE)

**Propósito Pedagógico:** Introducción natural y camuflada a los sistemas de ecuaciones lógicas. El alumno comparará escenarios para aislar el valor unitario de un objeto desconocido.

### 👑 Nivel 1: Descubrimiento — El Carrito Gemelo
¡Bienvenido a la Tienda de los Secretos! Aquí no hay etiquetas de precios. Para saber cuánto cuesta algo, debes usar tu **Ojo de Comerciante** y comparar dos carritos de compras casi idénticos.

Si miras dos cajas y ves qué es lo único que cambió entre ellas, descubrirás inmediatamente el precio de ese objeto extra. ¡Es pura deducción lógica!

> ⚠️ **¡Cuidado con la Trampa de Adivinar!**
> * **❌ El Camino Incorrecto:** Ver que 2 manzanas y 1 plátano cuestan R$ 10, e inventar que la manzana vale 3 y el plátano 4 porque sí.
> * **✅ El Camino Correcto:** Mira el Carrito A (2 manzanas = R$ 8). Mira el Carrito B (2 manzanas + 1 plátano = R$ 10). La única diferencia es el plátano, y el precio subió R$ 2. ¡El plátano vale R$ 2!

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Carrito 1: 2 jugos cuestan R$ 6,00.
Carrito 2: 2 jugos y 1 chocolate cuestan R$ 10,00.
¿Cuánto cuesta el chocolate?
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** Mesa 1: 3 libretas pesan 600 gramos.
Mesa 2: 3 libretas y 1 goma pesan 650 gramos.
¿Cuántos gramos pesa la goma?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 2: Consolidación — Cruzando Datos
Ahora verás las libretas de deudas de la tienda. Te daremos los datos cruzados de dos clientes y tú deberás encontrar el precio de la unidad para luego calcular una compra nueva.

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Ana compró 4 sobres de cartas por R$ 20,00. Pedro compró 1 sobre de cartas y 1 revista por R$ 15,00. Usando el dato de Ana, descubre cuánto cuesta el sobre, y luego descubre cuánto le costó la revista a Pedro. ¿Cuál es el precio de la revista?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 3: Fluidez — Sistemas Ocultos
¡Magia pura! Traducirás oraciones completas a comparaciones lógicas para descubrir el precio oculto sin carritos dibujados.

* **🎯 ¡Tu turno! (Interactivo 3):** "Si 2 cuadernos idénticos cuestan R$ 24,00, y resulta que 1 cuaderno y 1 caja de colores cuestan R$ 30,00 juntos". ¿Cuánto cuesta la caja de colores sola?
`[ Escribe tu respuesta aquí ]`

## 4.4. MÓDULO 4: REPARTO Y RESIDUOS (EL MAESTRO DEL EMPAQUE)

**Propósito Pedagógico:** Comprensión profunda de la división. No solo repartir exactamente, sino entender qué significa lo que sobra (el residuo) y cómo usarlo para predecir ciclos.

### 👑 Nivel 1: Descubrimiento — El Reparto Perfecto
¡Llegaste a la fábrica de empaques! Tu misión es tomar inventarios gigantes y empacarlos en cajas idénticas. Esto es la división exacta.

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Tienes un saco con 45 pelotas de tenis y debes empacarlas en tubos. Si en cada tubo caben 3 pelotas exactamente, ¿cuántos tubos necesitas?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 2: Consolidación — Las Piezas Sobrantes (El Residuo)
¡Atención! En el mundo real, no todo encaja perfecto. A veces, al empacar, te sobran piezas que no alcanzan a llenar una caja nueva. A esto le llamamos **El Residuo**. El monstruo del desorden intentará que tires a la basura lo que sobra. ¡Tú debes saber exactamente cuántos elementos quedaron sueltos!

> ⚠️ **¡Cuidado con la Trampa de la Caja Incompleta!**
> * **❌ El Camino Incorrecto:** Si debes empacar 10 libros en cajas de a 3, decir que necesitas 3 cajas y media.
> * **✅ El Camino Correcto:** Haces grupos: 3, 6, 9. Llenaste 3 cajas perfectas. Te sobró 1 libro suelto. El residuo es 1.

* **⚡ ¡Pruébalo ya! (Interactivo 1):** Un granjero tiene 22 huevos. Quiere guardarlos en cajas donde caben 6 huevos. Después de llenar todas las cajas posibles, ¿cuántos huevos le quedarán sueltos sobre la mesa? *(Calcula el residuo)*.
`[ Escribe tu respuesta aquí ]`
* **🧠 Hazlo en tu mente (Interactivo 2):** En una clase hay 25 alumnos. La profesora quiere armar equipos exactos de 4 personas para un torneo. ¿Cuántos niños se quedarán sin equipo y tendrán que ser árbitros?
`[ Escribe tu respuesta aquí ]`

### 👑 Nivel 3: Fluidez — El Ciclo Infinito
¡El secreto de los adivinos! Cuando las cosas se repiten en un patrón circular, puedes usar el residuo de la división para predecir el futuro.

* **🎯 ¡Tu turno! (Interactivo 3):** Un faro enciende luces en este orden que se repite para siempre: ROJO, AZUL, VERDE. (Es un ciclo de 3 colores). Si quieres saber de qué color será el destello número 10, divide 10 entre 3. El residuo te dará la respuesta. (10 ÷ 3 = 3 grupos enteros, sobra 1). Como sobra 1, es el primer color del ciclo. ¿Qué color es el destello 10?
`[ Escribe tu respuesta aquí (Escribe: ROJO, AZUL o VERDE) ]`

---

# 5. Evaluación Fase 3: Bloque de Desafíos (Maestría)

Al superar los 4 módulos, se bloquea la herramienta del Cuaderno del Detective (subrayado visual). El alumno debe demostrar que ha interiorizado el esquema y puede resolver mentalmente.

## 5.1. Desafío 1: El Inspector Estándar
* **Consolida:** M1, M2 (1 paso) y M4 básico.
* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas. Foco en filtrado de 1 distractor, secuencias cronológicas directas, carritos gemelos sencillos y residuos básicos.
* **Interacción:** El usuario ya no puede usar la herramienta de subrayado; debe hacer la lectura matemática en su mente.
* **Temporizador:** **45 segundos por pregunta.**
* **Salida Temprana (Early Exit):** Cierre automático de la prueba al acumular el **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 correctas).

### 📝 Ejemplo de Pregunta (Desafío 1):
"Sofía compró 3 cuadernos a R$ 10,00 cada uno y 2 gomas a R$ 2,00. En la papelería había 5 personas comprando. ¿Cuánto gastó en total?"
* A) R$ 34,00 *(Correcto: Ignoró a las 5 personas y calculó 30 + 4).*
* B) R$ 39,00
* C) R$ 17,00
* D) R$ 15,00

## 5.2. Desafío 2: La Mente Maestra (Avanzado)
* **Consolida:** Integra M2 (3 pasos), M3 (Sistemas) y M4 (Ciclos).
* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas. Integración de historias de 3 pasos con eventos invertidos, sistemas camuflados de precios y adivinación por ciclos.
* **Temporizador:** **60 segundos por pregunta** (Tiempo extendido por la carga de procesamiento lector).
* **Salida Temprana:** Cierre al **3er error**.
* **Criterio de Aprobación:** Mínimo 90% (23 de 25 correctas).

### 📝 Ejemplo de Pregunta (Desafío 2):
"Si 3 cajas de leche pesan 3000 gramos, y resulta que 1 caja de leche y 1 bote de cacao pesan 1500 gramos juntos. ¿Cuánto pesa el bote de cacao?"
* A) 1000 g
* B) 500 g *(Correcto: Caja de leche = 1000. 1500 - 1000 = 500).*
* C) 1500 g
* D) 200 g

## 5.3. Desafío Final: El Detective Legendario (Maestría 90%)
* **Consolida:** Alta complejidad cruzando todos los módulos.
* **Formato:** **Sin opciones. Evocación pura en Input numérico.** 
* **Contenido:** 10 problemas de texto densos. Cruza todas las habilidades (Ej: Una historia larga con distractores, pasos invertidos y que termina pidiendo el residuo de un reparto).
* **Temporizador:** **45 segundos por pregunta.**
* **Salida Temprana:** Cierre fulminante al **2do error**.
* **Criterio de Aprobación:** Mínimo 90% (9 de 10 correctas).

### 📝 Ejemplo de Pregunta (Desafío Final):
"Lucas tenía 40 cartas. Le regaló la mitad a su hermano. Luego, su mamá le compró 12 cartas nuevas. Si las cartas que tiene ahora las quiere guardar en álbumes donde caben 10 cartas por página, ¿cuántas cartas le quedarán sueltas (residuo) que no llenan una página completa?"
* *Input esperado:* **2** *(Mentalidad: 40 ÷ 2 = 20. 20 + 12 = 32. 32 ÷ 10 = 3 páginas completas, sobran 2).*

---

# 6. Resumen Operativo de la Fase 3

| Bloque / Desafío | Formato | Cantidad | Tiempo | Bucle Espejo | Regla Early Exit / Aprobación |
| --- | --- | --- | --- | --- | --- |
| **M1: Traducción y Filtro** | UI Interactiva | 15 preguntas | Sin tiempo | Sí | Según regla del bloque |
| **M2: Secuencia Temporal** | UI Interactiva | 15 preguntas | Sin tiempo | Sí | Según regla del bloque |
| **M3: Deducción de Precios** | UI Interactiva | 15 preguntas | Sin tiempo | Sí | Según regla del bloque |
| **M4: Reparto y Residuos** | UI Interactiva | 15 preguntas | Sin tiempo | Sí | Según regla del bloque |
| **Desafío 1: Inspector Estándar** | Opción múltiple | 25 preguntas | 45 s/pregunta | No | Cierre al 3er error / 23/25 (90%) |
| **Desafío 2: Mente Maestra** | Opción múltiple | 25 preguntas | 60 s/pregunta | No | Cierre al 3er error / 23/25 (90%) |
| **Desafío Final: Detective Legendario** | Input (Puro) | 10 preguntas | 45 s/pregunta | No | Cierre al 2do error / 9/10 (90%) |

---

# 7. Notas de Arquitectura de Base de Datos (JSONB para UI)

Para soportar la herramienta del Cuaderno del Detective, la base de datos PostgreSQL debe almacenar los enunciados en un formato tokenizado (JSONB) en el campo `payload_tokenizado`.

**Contrato de Datos (Backend $\leftrightarrow$ Frontend):**

```json
{
  "tokens": [
    { "id": 0, "texto": "Mateo tiene", "seleccionable": false, "rol": "conector" },
    { "id": 1, "texto": "15 tazos", "seleccionable": true, "rol": "dato_util" },
    { "id": 2, "texto": "y", "seleccionable": false, "rol": "conector" },
    { "id": 3, "texto": "2 perros.", "seleccionable": true, "rol": "distractor" }
  ]
}
```

* **Renderizado Frontend:** Los objetos con `"seleccionable": true` se renderizan como botones/spans interactivos en el lienzo oscuro.
* **Validación Backend:** El frontend envía un array con los IDs subrayados por el alumno (ej. `[1]`). El backend verifica esta coincidencia exacta, evitando problemas de parseo de strings (espacios, comas, etc.) y garantizando un feedback determinista.