Aquí tienes el documento maestro actualizado y consolidado de la **Fase 3**. He integrado minuciosamente todos los textos completos, ejemplos y ejercicios de los módulos 2 y 3 que desarrollamos, ajustando el bloque de evaluación para reflejar la distribución exacta de 50 preguntas (20-20-10) y actualizando la mecánica de corrección del **Bucle Espejo** según tus directrices.

---

# Documento de Reglas para Generación y Carga de Preguntas — Fase 3 LogicaKids Pro

**Versión:** 2.0 — Consolidado Final
**Fase:** Fase 3 — Problemas de Texto y Sistemas Simples
**Proyecto:** LogicaKids Pro

---

## 1. Propósito del Documento

Este documento define las directrices pedagógicas, narrativas y técnicas para la **Fase 3**, centrada en erradicar el analfabetismo matemático funcional. El objetivo es que los alumnos de 10 años dominen la lectura matemática, el filtrado de distractores y la deducción de valores ocultos (sistemas de ecuaciones camuflados).

**Mecánica Principal de Interfaz:** Esta fase introduce el **Cuaderno del Detective** y la **Estantería de Datos**. El alumno no solo ingresa números, sino que interactúa con el texto (subrayando con tokens) y arrastra datos para ensamblar operaciones lógicas antes de calcular.

---

## 2. Especificación de Interfaz de Usuario (UI/UX)

La pantalla principal de práctica se divide en tres secciones funcionales alineadas a la estética *cyberpunk* (`slate-950`):

* **Sección 1: El Cuaderno del Detective (Izquierda):** Lienzo de texto interactivo. Al pulsar sobre los datos importantes, destellan en verde; la información basura destella en rojo o gris.
* **Sección 2: La Estantería de Datos (Derecha):** Tarjetas flotantes dinámicas ("Caja de Pregunta" y "Caja de Datos Numéricos") donde aterrizan los tokens subrayados.
* **Sección 3: Constructor de Operaciones (Inferior):** Zona de ensamblaje (arrastrar y soltar) con feedback visual de palabras clave si el operador elegido es incorrecto.

### 2.4. Feedback Pedagógico (Bucle Espejo Actualizado)

Si el alumno se equivoca en la fase de práctica, el sistema actúa bajo la siguiente regla estricta:

1. **Recuadro Explicativo:** Se detiene el avance y se muestra un recuadro señalando exactamente **dónde está el error y por qué se equivocó**.
2. **Cascada de Espejos (Máximo 3):** Tras la explicación, se le presenta la *Pregunta Espejo 1*. Si vuelve a equivocarse, pasa a la *Pregunta Espejo 2*. Si falla nuevamente, se presenta la *Pregunta Espejo 3*.
3. **Cierre de Bucle:** Si el alumno falla las tres preguntas espejo consecutivas, el bucle se cierra automáticamente y el sistema avanza a la siguiente pregunta original del pool.

---

## 3. Módulos de Aprendizaje

### 4.1. MÓDULO 1: TRADUCCIÓN Y FILTRO (EL ESCÁNER DE LA VERDAD)

* **Nivel 1: Descubrimiento — El Lápiz Mágico:** Enseña a leer la pregunta final antes de operar para filtrar distractores (Ej. Si preguntan por animales, ignorar las bicicletas).
* **Nivel 2: Consolidación — El Escudo Anti-Basura:** Historias más largas con distractores numéricos engañosos que obligan a usar el escudo.
* **Nivel 3: Fluidez — El Laberinto Numérico:** Problemas expertos donde todos los datos parecen importantes, pero solo algunos se relacionan directamente con la pregunta.

---

### 4.2. MÓDULO 2: SECUENCIA TEMPORAL (LA MÁQUINA DEL TIEMPO)

#### 👑 Nivel 1: Descubrimiento — El Reloj hacia Adelante

En estas misiones, las cosas cambian a medida que avanzan las horas. Tu superpoder es **escribir la historia en estricto orden cronológico**.

> ⚠️ **¡Cuidado con la Trampa del Desorden Temporal!**
> Haz una película en tu mente. Paso 1: ¿Cuánto había al inicio? Paso 2: ¿Llegó más (suma) o se fue algo (resta)? Paso 3: Calcula el final.

* **Interactivo 1:** Mateo tenía 15 tazos. Ganó 5, pero luego perdió 2. ¿Con cuántos llegó? **(Respuesta: 18)**
* **Interactivo 2:** Un bus arranca con 20 personas. Bajan 5 y suben 8. ¿Cuántas van ahora? **(Respuesta: 23)**
* **Interactivo 3:** Ana tenía R$ 10,00. Recibió R$ 5,00 y gastó R$ 3,00. ¿Con cuánto se quedó? **(Respuesta: R$ 12,00)**
* **Interactivo 4:** Juan tenía 8 canicas. Le prestaron 4 y perdió 3. ¿Con cuántas terminó? **(Respuesta: 9)**
* **Interactivo 5:** Un atleta corre 5 km, luego 2 km más. Descansa. ¿Cuántos corrió? **(Respuesta: 7)**

#### 👑 Nivel 2: Consolidación — El Reloj en Reversa

Para encontrar el inicio de la historia, debes usar tu **Máquina del Tiempo en Reversa**. Si el personaje "perdió" (-), para volver al pasado tú debes "sumar" (+). Si "ganó" (+), debes "restar" (-).

* **Interactivo 1:** Lucas regaló 4 juguetes y se quedó con 10. ¿Cuántos tenía al principio? **(Respuesta: 14)**
* **Interactivo 2:** Valentina recibió R$ 15,00 y ahora tiene R$ 40,00. ¿Cuánto tenía antes? **(Respuesta: 25)**
* **Interactivo 3:** Un tren llegó con 30 pasajeros. Se habían bajado 5. ¿Cuántos había antes? **(Respuesta: 35)**
* **Interactivo 4:** El perro se comió 3 galletas y quedan 12. ¿Cuántas había al inicio? **(Respuesta: 15)**
* **Interactivo 5:** Tienes 50 puntos tras ganar un bono de 20. ¿Cuántos tenías antes? **(Respuesta: 30)**

#### 👑 Nivel 3: Aceleración y Reparto — El Tiempo Multiplicado

A veces las cantidades crecen de golpe (multiplicación) o se reparten en partes iguales (división). Detecta la operación correcta.

* **Interactivo 1:** Tomás tenía 5 carritos y se triplicaron. ¿Cuántos tiene? **(Respuesta: 15)**
* **Interactivo 2:** 24 chocolates repartidos entre 4 alumnos. ¿Cuántos tocan a cada uno? **(Respuesta: 6)**
* **Interactivo 3:** Sara tenía 8 pulseras y le regalaron para duplicar lo que tenía. ¿Cuántas tiene ahora? **(Respuesta: 16)**
* **Interactivo 4:** Había 30 manzanas y la mitad cayó al suelo. ¿Cuántas quedaron? **(Respuesta: 15)**
* **Interactivo 5:** Cosechó 7 zanahorias y luego 4 veces esa cantidad. ¿Cuántas fueron la segunda vez? **(Respuesta: 28)**

#### 👑 Nivel 4: Fluidez — El Laberinto del Tiempo

Historias de tres o más pasos combinando las 4 operaciones. Congela la historia en cada punto y actualiza tu inventario.

* **Interactivo 1:** Tenía 10 figuritas. Ganó 6. Regaló la mitad. Encontró 4. ¿Con cuántas terminó? **(Respuesta: 12)**
* **Interactivo 2:** Recolectó 24 huevos. Un zorro robó 4. Repartió el resto en 5 canastas. ¿Cuántos por canasta? **(Respuesta: 4)**
* **Interactivo 3:** Tenía R$ 20,00. Gastó R$ 5,00. Triplicó lo que quedaba. Gastó R$ 10,00. ¿Sobrante? **(Respuesta: 35)**
* **Interactivo 4:** Había 8 globos. Trajeron el doble. Se reventaron 4. Se repartieron entre 3 niños. ¿Cuántos por niño? **(Respuesta: 4)**
* **Interactivo 5:** 12 pasajeros. Se triplican. Bajan 10. Se dividen en 2 buses. ¿Cuántos por bus? **(Respuesta: 13)**
⚙️ Regla de Interfaz: Bucle Espejo Activo (Práctica)
Durante los 4 niveles de este módulo, si el alumno comete un error, el sistema actuará así:

Bloqueo y Explicación: Se muestra un recuadro señalando exactamente dónde está el error y por qué se equivocó.

Cascada Espejo: Se muestra la Pregunta Espejo 1. Si se equivoca, pasa a la Pregunta Espejo 2. Si vuelve a fallar, pasa a la Pregunta Espejo 3.

Cierre de Bucle: Si falla las tres oportunidades espejo, se cierra el bucle y se pasa a la siguiente pregunta del nivel.

👑 Nivel 1: Descubrimiento — El Reloj hacia Adelante
¡Bienvenido al segundo módulo, Viajero del Tiempo! En estas misiones, las cosas cambian a medida que avanzan las horas.

En la vida real, las historias matemáticas tienen un inicio, un medio y un final. Alguien "tenía" algo en la mañana, luego "ganó" o "perdió" cosas en la tarde, y debes averiguar con qué terminó en la noche. Tu superpoder en este nivel es escribir la historia en estricto orden cronológico.

En tu Constructor de Operaciones, deberás colocar los datos exactamente en el mismo orden en que el reloj de la historia fue avanzando.

⚠️ ¡Cuidado con la Trampa del Desorden Temporal!
El monstruo del desorden quiere que leas todo rápido, tomes los números sueltos y los sumes o restes como caigan, sin importar cuándo pasaron las cosas.

❌ El Camino Incorrecto: Ver los números 15, 5 y 2, emocionarte y restar el grande con el pequeño de golpe solo porque sí.

✅ El Camino Correcto: Haz una película en tu mente siguiendo el reloj.
Paso 1: ¿Cuánto había al inicio?
Paso 2: ¿Llegó más (suma) o se fue algo (resta)?
Paso 3: Calcula el final.

⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)
Interactivo 1:
Mateo tenía 15 tazos en la mañana. En el recreo ganó 5 tazos jugando, pero a la salida perdió 2. ¿Con cuántos tazos llegó a casa?

Pensamiento guía: 15 + 5 = 20; luego 20 - 2 = 18

Respuesta: 18 tazos.

Interactivo 2:
Un bus arranca con 20 personas a bordo. En la primera parada bajan 5 personas. En la segunda parada suben 8 personas nuevas. ¿Cuántas personas van ahora en el bus?

Pensamiento guía: 20 - 5 = 15; luego 15 + 8 = 23

Respuesta: 23 personas.

Interactivo 3:
Ana tenía R$ 10,00 ahorrados. Recibió una propina de R$ 5,00 por ayudar en casa y, más tarde, gastó R$ 3,00 en un refresco. ¿Con cuánto dinero se quedó al final del día?

Pensamiento guía: 10 + 5 = 15; luego 15 - 3 = 12

Respuesta: R$ 12,00.

Interactivo 4:
Juan tenía 8 canicas de vidrio. Su hermano mayor le prestó 4 canicas más para el torneo. Luego, jugando en el patio de tierra, perdió 3. ¿Con cuántas canicas terminó la tarde?

Pensamiento guía: 8 + 4 = 12; luego 12 - 3 = 9

Respuesta: 9 canicas.

Interactivo 5:
Un atleta corre 5 kilómetros en la mañana. En la tarde, con mucha energía, decide correr 2 kilómetros más. Por la noche descansa y no corre nada. ¿Cuántos kilómetros corrió en total durante todo el día?

Pensamiento guía: 5 + 2 = 7; luego 7 + 0 = 7

Respuesta: 7 kilómetros.

👑 Nivel 2: Consolidación — El Reloj en Reversa
¡Alerta de anomalía temporal, Viajero del Tiempo! En este nivel, el monstruo del desorden ha hecho de las suyas y se ha robado el dato del principio de la historia.

Nos dice qué pasó en el medio y con cuánto terminó el personaje, pero no sabemos cómo empezó todo. Para encontrar el inicio, debes encender tu Máquina del Tiempo en Reversa.

¿Recuerdas tus poderes de operaciones inversas? Aquí es donde brillan. Para viajar al pasado, debes hacer exactamente lo contrario de lo que pasó en la historia:

Si el personaje "perdió" o "gastó" (-), para volver al pasado tú debes "sumar" (+).

Si el personaje "ganó" o "recibió" (+), para volver al pasado tú debes "restar" (-).

⚠️ ¡Cuidado con la Trampa del Signo Falso!
El monstruo del desorden quiere que leas la palabra "gastó", te emociones y pongas inmediatamente un signo de resta (-) en tu Constructor de Operaciones.

❌ El Camino Incorrecto: Lees "Gastó R$ 5,00 y le quedaron R$ 10,00". Tomas el 10, le restas el 5 (10 - 5 = 5) y dices que al inicio tenía 5. ¡Error! Si tenía 5 y gastó 5, ¡le quedaría cero!

✅ El Camino Correcto: Si terminó con 10 después de gastar 5, para volver al pasado debes regresarle ese dinero usando la operación inversa: sumas 10 + 5 = 15. ¡Al inicio tenía 15!

⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)
Interactivo 1:
Lucas tenía algunos juguetes en su caja. Le regaló 4 a su hermano menor y ahora se quedó con 10 juguetes. ¿Cuántos juguetes tenía al principio?

Pensamiento guía: Viaje al pasado. Como regaló, realizamos la operación inversa: 10 + 4 = 14

Respuesta: 14 juguetes.

Interactivo 2:
Valentina tenía dinero ahorrado en su alcancía. Su tía le regaló R$ 15,00 por su cumpleaños y ahora tiene R$ 40,00 en total. ¿Cuánto dinero tenía ahorrado antes del regalo?

Pensamiento guía: Viaje al pasado. Como recibió un regalo, realizamos la operación inversa: 40 - 15 = 25

Respuesta: R$ 25,00.

Interactivo 3:
Un tren llegó a la estación final con 30 pasajeros. El revisor sabe que en la parada anterior se habían bajado 5 personas. ¿Cuántos pasajeros había en el tren antes de esa última parada?

Pensamiento guía: Viaje al pasado. Como se bajaron pasajeros, realizamos la operación inversa: 30 + 5 = 35

Respuesta: 35 pasajeros.

Interactivo 4:
Sofía horneó una bandeja de galletas. Mientras no miraba, su perro se comió 3 galletas a escondidas. Ahora solo quedan 12 galletas sanas en la bandeja. ¿Cuántas galletas había horneado Sofía al inicio?

Pensamiento guía: Viaje al pasado. Como el perro se las comió, realizamos la operación inversa: 12 + 3 = 15

Respuesta: 15 galletas.

Interactivo 5:
El marcador de tu videojuego dice que tienes 50 puntos. Justo un minuto antes, habías atrapado una estrella mágica que te dio un bono extra de 20 puntos. ¿Cuántos puntos tenías antes de agarrar la estrella?

Pensamiento guía: Viaje al pasado. Como ganaste un bono, realizamos la operación inversa: 50 - 20 = 30

Respuesta: 30 puntos.

👑 Nivel 3: Aceleración y Reparto — El Tiempo Multiplicado
¡Atención, Viajero del Tiempo! Hasta ahora, los cambios en tu historia ocurrían poco a poco. Pero en este nivel, el tiempo se acelera.

A veces, las cosas no solo crecen un poco, ¡sino que se multiplican (el doble, el triple)! Otras veces, un tesoro no se pierde, sino que se divide en partes iguales para repartirlo entre amigos. Tu nuevo superpoder es detectar cuándo la historia usa la multiplicación o la división por una cifra.

⚠️ ¡Cuidado con la Trampa de la Palabra Confusa!

❌ El Camino Incorrecto: "Tenía 20 dulces y los repartió entre 4 amigos". Escribir 20 - 4 = 16. ¡Error! Si los repartió en partes iguales, los dividió, no restó 4.

✅ El Camino Correcto: Haz la película en tu mente. Si la cantidad crece de golpe repitiendo el mismo número ("el triple", "4 veces"), multiplicas. Si la cantidad se corta en partes iguales ("la mitad", "repartir entre 3"), divides.

⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)
Interactivo 1:
Tomás tenía 5 carritos de juguete. En su cumpleaños, su colección se triplicó. ¿Cuántos carritos tiene ahora?

Pensamiento guía: El triple significa multiplicar la cantidad base por 3: 5 * 3 = 15

Respuesta: 15 carritos.

Interactivo 2:
Una caja tenía 24 chocolates. La profesora los repartió en partes iguales entre 4 alumnos. ¿Cuántos chocolates le tocaron a cada alumno?

Pensamiento guía: Repartir equitativamente indica una división exacta: 24 / 4 = 6

Respuesta: 6 chocolates.

Interactivo 3:
Sara tenía 8 pulseras. Su hermana mayor le regaló la cantidad necesaria para duplicar exactamente lo que Sara ya tenía. ¿Con cuántas pulseras terminó Sara?

Pensamiento guía: Duplicar implica multiplicar el inventario inicial por 2: 8 * 2 = 16

Respuesta: 16 pulseras.

Interactivo 4:
En un árbol había 30 manzanas. Un fuerte viento hizo que la mitad de las manzanas cayeran al suelo. ¿Cuántas manzanas quedaron en el árbol?

Pensamiento guía: Calcular la mitad equivale a dividir la estructura entre 2: 30 / 2 = 15

Respuesta: 15 manzanas.

Interactivo 5:
Un granjero cosechó 7 zanahorias el lunes, y el martes cosechó 4 veces esa misma cantidad. ¿Cuántas zanahorias cosechó el martes?

Pensamiento guía: El indicador "veces" establece una multiplicación directa: 7 * 4 = 28

Respuesta: 28 zanahorias.

👑 Nivel 4: Fluidez — El Laberinto del Tiempo
¡Felicidades por llegar a la prueba de fluidez de este módulo! Las historias reales tienen muchos capítulos. En este nivel, las cosas sucederán en tres o más pasos diferentes, y tendrás que mezclar sumas, restas, multiplicaciones y divisiones. Para salir de este laberinto, tu superpoder será actualizar tu inventario en cada parada, sin saltarte ningún evento.

⚠️ ¡Cuidado con la Trampa del Paso Olvidado!

❌ El Camino Incorrecto: "Tenía 10, se triplicó, y perdió 2". Decir 10 - 2 = 8 y olvidar la multiplicación.

✅ El Camino Correcto: Congela la historia en cada punto.
Paso 1: Tenía 10 y se triplicó -> Ahora tiene 30. (Guarda este 30 en tu mente).
Paso 2: De esos 30, perdió 2 -> 30 - 2 = 28. ¡El resultado real es 28!

⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)
Interactivo 1:
Luiz tenía 10 figuritas. El lunes ganó 6 jugando. El martes le regaló la mitad de todas sus figuritas a su hermano. El miércoles se encontró 4 figuritas tiradas. ¿Con cuántas figuritas terminó Luiz?

Pensamiento guía: Paso 1 (10 + 6 = 16) -> Paso 2 (16 / 2 = 8) -> Paso 3 (8 + 4 = 12)

Respuesta: 12 figuritas.

Interactivo 2:
El granjero recolectó 24 huevos en la mañana. Al mediodía, un zorro se robó 4 huevos. El granjero repartió los huevos que quedaron en partes iguales en 5 canastas. ¿Cuántos huevos hay en cada canasta?

Pensamiento guía: Paso 1 (24 - 4 = 20) -> Paso 2 (20 / 5 = 4)

Respuesta: 4 huevos.

Interactivo 3:
Mateo empezó la semana con R$ 20,00. El martes gastó R$ 5,00 en un sándwich. El jueves, su abuelo le dio un premio que triplicó el dinero que le quedaba en ese momento. El viernes gastó R$ 10,00 en un cine. ¿Cuánto dinero le sobró?

Pensamiento guía: Paso 1 (20 - 5 = 15) -> Paso 2 (15 * 3 = 45) -> Paso 3 (45 - 10 = 35)

Respuesta: R$ 35,00.

Interactivo 4:
En una fiesta de agua había 8 globos. Los organizadores trajeron más globos, logrando que la cantidad total fuera el doble. De repente, 4 globos se reventaron. Los globos que sobrevivieron se repartieron entre 3 niños. ¿Cuántos globos le tocaron a cada niño?

Pensamiento guía: Paso 1 (8 * 2 = 16) -> Paso 2 (16 - 4 = 12) -> Paso 3 (12 / 3 = 4)

Respuesta: 4 globos.

Interactivo 5:
Un autobús turístico arranca con 12 pasajeros. En la primera parada, la cantidad de personas se triplica porque sube un grupo grande. En la siguiente parada, 10 personas se bajan para tomar fotos y no vuelven. Los que quedan se dividen exactamente en 2 autobuses más pequeños. ¿Cuántas personas van en cada autobús pequeño?

Pensamiento guía: Paso 1 (12 * 3 = 36) -> Paso 2 (36 - 10 = 26) -> Paso 3 (26 / 2 = 13)

Respuesta: 13 personas.
---

### 4.3. MÓDULO 3: DEDUCCIÓN DE PRECIOS (EL OJO DEL COMERCIANTE)

#### 👑 Nivel 1: Descubrimiento — El Enigma de los Carritos

Si miras dos carritos casi idénticos, pero uno tiene un producto de más y un precio más alto, esa diferencia de dinero es el precio de ese producto oculto.

* **Interactivo 1:** Carrito A: 3 cuadernos, 1 lápiz = R$ 13,00. Carrito B: 3 cuadernos, 2 lápices = R$ 15,00. ¿1 lápiz? **(Respuesta: 2)**
* **Interactivo 2:** Carrito A: 2 hamburguesas, 1 refresco = R$ 25,00. Carrito B: 2 hamburguesas, 3 refrescos = R$ 35,00. ¿1 refresco? **(Respuesta: 5)**
* **Interactivo 3:** Carrito A: 5 balones = R$ 50,00. Carrito B: 5 balones, 1 camiseta = R$ 85,00. ¿Camiseta? **(Respuesta: 35)**
* **Interactivo 4:** Carrito A: 1 pizza, 1 helado = R$ 18,00. Carrito B: 1 pizza, 4 helados = R$ 33,00. ¿1 helado? **(Respuesta: 5)**
* **Interactivo 5:** Carrito A: 2 juegos = R$ 100,00. Carrito B: 3 juegos = R$ 150,00. ¿1 juego? **(Respuesta: 50)**

#### 👑 Nivel 2: Consolidación — Cruce de Datos

Cruza el precio descubierto de un cliente y mételo en la cuenta del segundo para revelar el precio que falta.

* **Interactivo 1:** Carlos: 2 jugos = R$ 8,00. Marta: 2 jugos, 1 galleta = R$ 11,00. ¿Galleta? **(Respuesta: 3)**
* **Interactivo 2:** 3 entradas = R$ 30,00. 1 entrada, 1 palomitas = R$ 18,00. ¿Palomitas? **(Respuesta: 8)**
* **Interactivo 3:** Lucas: 1 sándwich = R$ 12,00. Sofía: 2 sándwiches, 2 jugos = R$ 34,00. ¿1 jugo? **(Respuesta: 5)**
* **Interactivo 4:** Ana: 4 manzanas = R$ 12,00. Luis: 2 manzanas, 3 peras = R$ 21,00. ¿1 pera? **(Respuesta: 5)**
* **Interactivo 5:** Pedro: 1 juguete grande = R$ 40,00. Lucía: 1 grande, 5 pequeños = R$ 65,00. ¿1 pequeño? **(Respuesta: 5)**

#### 👑 Nivel 3: Fluidez — El Código Oculto

Sistemas camuflados: Resta la diferencia explícita del total, y divide el resultado en dos para hallar el valor del objeto menor.

* **Interactivo 1:** Pantalón y camisa = R$ 50,00. Pantalón cuesta R$ 10,00 más. ¿Camisa? **(Respuesta: 20)**
* **Interactivo 2:** Dos cajas pesan 16 kg. La roja pesa el triple que la azul. ¿Caja azul? **(Respuesta: 4)**
* **Interactivo 3:** Entre Juan y María tienen 24 canicas. Juan tiene el doble. ¿María? **(Respuesta: 8)**
* **Interactivo 4:** Sombrero y guantes = R$ 35,00. Sombrero cuesta R$ 15,00 más. ¿Guantes? **(Respuesta: 10)**
* **Interactivo 5:** El doble de un número más 5 puntos es 25. ¿Número? **(Respuesta: 10)**


---

### 4.4. MÓDULO 4: REPARTO Y RESIDUOS (EL MAESTRO DEL EMPAQUE)

* **Nivel 1: Descubrimiento — El Reparto Perfecto:** División exacta empaquetando inventarios gigantes.
* **Nivel 2: Consolidación — Las Piezas Sobrantes:** Encontrar el residuo; cuántos elementos no alcanzan para llenar un grupo completo.
* **Nivel 3: Fluidez — El Ciclo Infinito:** Usar el residuo de una división para predecir qué pasará en un patrón circular repetitivo.
📘 DOCUMENTO MAESTRO: MÓDULO 3 (DEDUCCIÓN DE PRECIOS)(El Bucle Espejo de 3 intentos descrito al inicio aplica también a toda la práctica de este módulo).👑 Nivel 1: Descubrimiento — El Enigma de los Carritos¡Atención, Detective Numérico! Has entrado a la zona comercial de la ciudad. El monstruo del desorden ha borrado las etiquetas de los precios individuales, pero cometió un error: ¡dejó los recibos de los carritos de compra a la vista!Tu superpoder en este nivel es la Comparación Directa. Si miras dos carritos de compra que son casi idénticos, pero uno tiene un solo producto de más y un precio un poco más alto, ¡esa diferencia de dinero es exactamente el precio de ese producto oculto!⚠️ ¡Cuidado con la Trampa del Reparto Ciego!❌ El Camino Incorrecto: Si un carrito tiene 2 manzanas y 1 hamburguesa por R$ 20,00, dividir 20 / 3 diciendo que todo cuesta igual.✅ El Camino Correcto: Busca el segundo carrito. Si el Carrito A tiene 2 manzanas y 1 hamburguesa por R$ 20,00, y el Carrito B tiene 2 manzanas y 2 hamburguesas por R$ 28,00... El Carrito B tiene 1 hamburguesa más y cuesta R$ 8,00 más. ¡1 hamburguesa cuesta R$ 8,00!⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)Interactivo 1:Carrito A: 3 cuadernos y 1 lápiz = R$ 13,00.Carrito B: 3 cuadernos y 2 lápices = R$ 15,00.Pregunta: ¿Cuánto cuesta 1 lápiz?Respuesta: R$ 2,00. (15 - 13).Interactivo 2:Carrito A: 2 hamburguesas y 1 refresco = R$ 25,00.Carrito B: 2 hamburguesas y 3 refrescos = R$ 35,00.Pregunta: ¿Cuánto cuesta 1 refresco?Respuesta: R$ 5,00. (Diferencia de 10 por 2 refrescos extras. 10 / 2 = 5).Interactivo 3:Carrito A: 5 balones de fútbol = R$ 50,00.Carrito B: 5 balones de fútbol y 1 camiseta = R$ 85,00.Pregunta: ¿Cuánto cuesta la camiseta?Respuesta: R$ 35,00.Interactivo 4:Carrito A: 1 combo de pizza y 1 helado = R$ 18,00.Carrito B: 1 combo de pizza y 4 helados = R$ 33,00.Pregunta: ¿Cuánto cuesta 1 helado?Respuesta: R$ 5,00.Interactivo 5:Carrito A: 2 videojuegos retro = R$ 100,00.Carrito B: 3 videojuegos retro del mismo tipo = R$ 150,00.Pregunta: ¿Cuánto cuesta 1 videojuego?Respuesta: R$ 50,00.👑 Nivel 2: Consolidación — Cruce de Datos¡El misterio se complica! Tenemos tablas de precios incompletas donde se cruzan las compras de diferentes usuarios.Tu superpoder en este nivel es Cruzar y Remplazar. Utilizarás el dato seguro de un cliente (el precio ya descubierto de un producto) y lo meterás en la cuenta del segundo cliente para limpiar los distractores y revelar el precio que falta.⚠️ ¡Cuidado con la Trampa de la Fila Equivocada!❌ El Camino Incorrecto: Restar el total de Ana del total de Luis sin multiplicar primero por la cantidad de objetos.✅ El Camino Correcto: Identifica qué producto ya tiene un valor fijo. Multiplica ese valor por la cantidad que compró el segundo cliente y réstalo de su total. Lo que sobre corresponderá al producto misterioso.⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)Interactivo 1:Registro 1 (Carlos): Compró 2 jugos por R$ 8,00.Registro 2 (Marta): Compró 2 jugos y 1 galleta por R$ 11,00.Pregunta: ¿Cuánto cuesta la galleta?Respuesta: R$ 3,00.Interactivo 2:Registro 1 (Cine): 3 entradas cuestan R$ 30,00.Registro 2 (Combo): 1 entrada y 1 bote de palomitas cuestan R$ 18,00.Pregunta: ¿Cuánto cuesta el bote de palomitas?Respuesta: R$ 8,00. (Entrada = 10. 18 - 10 = 8).Interactivo 3:Registro 1 (Lucas): 1 sándwich cuesta R$ 12,00.Registro 2 (Sofía): 2 sándwiches y 2 jugos cuestan R$ 34,00.Pregunta: ¿Cuánto cuesta 1 jugo?Respuesta: R$ 5,00.Interactivo 4:Registro 1 (Ana): 4 manzanas cuestan R$ 12,00.Registro 2 (Luis): 2 manzanas y 3 peras cuestan R$ 21,00.Pregunta: ¿Cuánto cuesta 1 pera?Respuesta: R$ 5,00.Interactivo 5:Registro 1 (Pedro): 1 juguete grande cuesta R$ 40,00.Registro 2 (Lucía): 1 juguete grande y 5 juguetes pequeños cuestan R$ 65,00.Pregunta: ¿Cuánto cuesta 1 juguete pequeño?Respuesta: R$ 5,00.👑 Nivel 3: Fluidez — El Código Oculto¡Has llegado al nivel de los maestros de la deducción! El enemigo ha camuflado los Sistemas de Ecuaciones directamente dentro de historias lógicas, sin carritos ni tablas.Tu superpoder definitivo es el Desmantelamiento del Total. Cuando te den el valor total de dos objetos combinados y te digan la diferencia que hay entre ellos, aplicarás la estrategia de la balanza.⚠️ ¡Cuidado con la Trampa del Tanteo Rápido!❌ El Camino Incorrecto: Si un pantalón y camisa cuestan 50, y el pantalón cuesta 10 más, decir rápidamente que el pantalón es 40 y la camisa 10. (¡Error! 40 - 10 = 30, no 10).✅ El Camino Correcto (La Balanza): >   Paso 1: Al total general, réstale la diferencia: 50 - 10 = 40.Paso 2: Divide el resultado en 2 partes iguales: 40 / 2 = 20 (Este es el precio de la camisa).Paso 3: Súmale la diferencia al otro objeto: 20 + 10 = 30 (Este es el pantalón).⚡ Entrenamiento de Desbloqueo (5 Misiones Interactivas)Interactivo 1:Un pantalón y una camisa cuestan R$ 50,00 en total. Si el pantalón cuesta R$ 10,00 más que la camisa, ¿cuánto cuesta la camisa?Respuesta: R$ 20,00.Interactivo 2:Dos cajas de herramientas pesan 16 kilos en total. La caja roja pesa el triple que la caja azul. ¿Cuánto pesa la caja azul?Respuesta: 4 kilos. (El triple significa 3 partes + 1 parte = 4 partes. 16 / 4 = 4).Interactivo 3:Entre Juan y María tienen 24 canicas en total. Juan tiene el doble de canicas que María. ¿Cuántas canicas tiene María?Respuesta: 8 canicas.Interactivo 4:Un sombrero cyberpunk y un par de guantes tácticos cuestan R$ 35,00 en total. El sombrero cuesta R$ 15,00 más que los guantes. ¿Cuánto cuestan los guantes?Respuesta: R$ 10,00.Interactivo 5:El doble de un número secreto, más un bono de 5 puntos, es igual a 25. ¿Cuál es ese número secreto?Respuesta: 10.🏆 ZONA DE EVALUACIÓN FINAL (Por Módulo)(Sin Bucle Espejo. Estructura obligatoria de 50 preguntas)⏱️ DESAFÍO 1: El Despertar del Cronómetro (20 Preguntas)Formato: Opción múltiple (A, B, C, D).Nivel: Integración de Nivel 1 y 2.(El banco de datos SQL poblará estas 20 preguntas basadas en los ejemplos directos de suma/resta y carritos gemelos generados anteriormente).⏱️ DESAFÍO 2: La Distorsión de las Cifras (20 Preguntas)Formato: Opción múltiple (A, B, C, D).Nivel: Alta densidad lectora y cruce de variables.(El banco poblará estas 20 preguntas con historias de 3 pasos, aceleración de tiempo y cruces de datos en tablas complejas).⏱️ DESAFÍO FINAL: La Paradoja del Maestro (10 Preguntas)Formato Estricto: Ingreso por teclado numérico (Sin opciones).Nivel: Sistemas de ecuaciones puros e historias temporales de 4 pasos.Criterio: Para aprobar, el alumno debe ingresar correctamente la cifra exacta en al menos 9 de las 10 preguntas.(Ejemplos representativos que el backend inyectará para este desafío sin opciones):[Módulo 2] "Un tren llega con 20 pasajeros. En la última parada la cantidad se duplicó. Antes, se habían bajado 5. ¿Cuántos había al inicio?" $\rightarrow$ Input esperado: 15[Módulo 2] "Gastó R$ 10,00. Recibió el triple de lo que le quedaba. Terminó con R$ 30,00. ¿Cuánto tenía al principio?" $\rightarrow$ Input esperado: 20[Módulo 3] "Zapatos y calcetines cuestan R$ 80,00 en total. Los zapatos cuestan R$ 60,00 más. ¿Cuánto cuestan los calcetines?" $\rightarrow$ Input esperado: 10[Módulo 3] "Una tablet y una funda cuestan R$ 220,00. La tablet cuesta R$ 200,00 más. ¿Cuánto cuesta la funda?" $\rightarrow$ Input esperado: 10
---

## 5. Evaluación Fase 3: El Guardián del Reloj (Desafíos Finales)

Al culminar los módulos, el Cuaderno del Detective se desactiva. El alumno debe aplicar los conocimientos mentalmente bajo una estructura de **50 preguntas**, divididas en tres bloques de exigencia escalonada.

### 5.1. Desafío 1: El Inspector Estándar (20 Preguntas)

* **Formato:** Opción múltiple (A, B, C, D).
* **Contenido:** Filtrado de 1 distractor, secuencias cronológicas de 2 pasos y carritos gemelos sencillos.
* **Mecánica:** Temporizador estándar. Sin Bucle Espejo.

### 5.2. Desafío 2: La Distorsión de las Cifras (20 Preguntas)

* **Formato:** Opción múltiple (A, B, C, D).
* **Contenido:** Historias de 3 pasos (directas e inversas), cruce de datos en tablas y problemas de residuos básicos.
* **Mecánica:** Temporizador extendido (por densidad lectora). Sin Bucle Espejo.

### 5.3. Desafío 3 (Final): El Detective Legendario (10 Preguntas)

* **Formato:** **Sin opciones.** Entrada de texto/teclado numérico puro.
* **Contenido:** Sistemas de ecuaciones camuflados y paradojas de 4 pasos de operaciones inversas (reversa total).
* **Mecánica:** Temporizador estricto. Nivel de exigencia para niños destacados/competencia.
* **Criterio de Aprobación:** Mínimo 9 de 10 correctas (90%) para desbloquear la siguiente fase de la aplicación.

---

## 6. Resumen Operativo y Matriz de Configuración (Backend)

| Bloque / Módulo | UI Interactiva | Preguntas | Bucle Espejo Activo | Cierre de Bucle |
| --- | --- | --- | --- | --- |
| **M1: Traducción y Filtro** | Cuaderno / Estantería | 15 fijas | Sí | Recuadro + 3 Espejos |
| **M2: Secuencia Temporal** | Constructor Temporal | 15 fijas | Sí | Recuadro + 3 Espejos |
| **M3: Deducción de Precios** | Ecuación Desplegable | 15 fijas | Sí | Recuadro + 3 Espejos |
| **M4: Reparto y Residuos** | Múltiple paso | 15 fijas | Sí | Recuadro + 3 Espejos |
| **Desafío 1 (Estándar)** | Opción Múltiple (4) | 20 evaluativas | No | N/A |
| **Desafío 2 (Avanzado)** | Opción Múltiple (4) | 20 evaluativas | No | N/A |
| **Desafío 3 (Maestría)** | Teclado (Input puro) | 10 evaluativas | No | N/A (Pase al 90%) |

*(Nota de DB: Para el renderizado de la UI de subrayado, los problemas de los Módulos 1-4 deben inyectarse mediante JSONB en `payload_tokenizado` para mapear los objetos `"seleccionable": true` con su validación exacta en backend).*