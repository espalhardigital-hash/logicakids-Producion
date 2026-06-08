Aquí tienes el documento **Fase 4: Fracciones, Porcentajes y Proporciones** completamente actualizado. He enriquecido los "Textos de Aprendizaje" con mayor profundidad analítica y he expandido estrictamente cada nivel para que contenga exactamente **4 Ejemplos Guiados** paso a paso y **3 Interactivos** de práctica, manteniendo la estructura GDD intacta para que puedas copiar y pegar directamente.

---

# 🏗️ FASE 4: FRACCIONES, PORCENTAJES Y PROPORCIONES

**Propósito:** Romper el pensamiento del número entero; dominar relaciones relacionales complejas de forma visual y análisis estadístico.

## PARTE 1: DOCUMENTO DE DISEÑO LÓGICO

La Fase 4 está diseñada para transicionar al alumno desde los números enteros absolutos hacia la comprensión de las proporciones, las partes de un todo, y el manejo fluido de datos y estadísticas visuales.

### 🗺️ Mapa de la Fase 4: Estructura de Módulos y Niveles

```text
[FASE 4: FRACCIONES, PORCENTAJES Y PROPORCIONES]
│
├── [MÓDULO 1: La Fracción Visual] -> Tema: Concepto parte-todo y fracciones equivalentes.
│    ├── Nivel 1: Lectura y modelado de numerador/denominador en polígonos simétricos (Sombrear áreas, sin tiempo)
│    ├── Nivel 2: Construcción de equivalencias mediante la subdivisión de redes (División dinámica, Bucle Espejo)
│    ├── Nivel 3: Áreas fraccionarias en composiciones geométricas asimétricas (Análisis geométrico, sin tiempo)
│    │
│    ├── DESAFÍO 1: Identificación directa (Opción múltiple con SVG, 25s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: La Trampa Asimétrica (Opción múltiple visual, 40s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Examen visual complejo (Input numérico, 50s/Q, requiere ≥90%, Early Exit al 2do error)
│
├── [MÓDULO 2: Fracción de Cantidad] -> Tema: Operador fraccionario sobre conjuntos finitos.
│    ├── Nivel 1: Cálculo de porciones unitarias (1/n) sobre grupos (Selección de grupos, sin tiempo)
│    ├── Nivel 2: Operador compuesto (m/n de X) y algoritmo de dos pasos (Input numérico, Bucle Espejo)
│    ├── Nivel 3: Lógica del complemento y deducción del resto (Input numérico, sin tiempo)
│    │
│    ├── DESAFÍO 1: Cálculo directo sobre inventarios (Opción múltiple, 25s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: Historias de encadenamiento (Opción múltiple, 40s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Evocación pura de cantidades (Input vacío, 50s/Q, requiere ≥90%, Early Exit al 2do error)
│
├── [MÓDULO 3: Porcentajes Rápidos y Promedios] -> Tema: Equivalencias, estadística y media aritmética.
│    ├── Nivel 1: Mapeo de porcentajes intuitivos: 50%, 25%, 10% (Conexión de bloques, sin tiempo)
│    ├── Nivel 2: Lectura e interpretación de gráficos circulares (Extracción visual, Bucle Espejo)
│    ├── Nivel 3: Comparación de tasas en gráficos de barras (Lectura de métricas, sin tiempo)
│    ├── Nivel 4: El Punto de Equilibrio - Media Aritmética (Nivelador interactivo, Bucle Espejo)
│    │
│    ├── DESAFÍO 1: Cálculo mental y promedios simples (Opción múltiple, 25s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: La trampa inversa del promedio (Opción múltiple, 40s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Fusión de tablas y porcentajes (Input vacío, 50s/Q, requiere ≥90%, Early Exit al 2do error)
│
└── [MÓDULO 4: Razón y Mezclas] -> Tema: Escalas numéricas, razones y reparto proporcional.
     ├── Nivel 1: Razones simples (a:b) y proporcionalidad directa (Multiplicadores, sin tiempo)
     ├── Nivel 2: Reparto proporcional de volúmenes macro (Distribución guiada, Bucle Espejo)
     ├── Nivel 3: Homogeneización de mezclas complejas (Simulación de fluidos, sin tiempo)
     │
     ├── DESAFÍO 1: Escalado directo en narrativas (Opción múltiple, 25s/Q, Early Exit al 3er error)
     ├── DESAFÍO 2: Cambio dinámico de la razón (Opción múltiple, 40s/Q, Early Exit al 3er error)
     └── DESAFÍO FINAL: Mezclas industriales tipo Pedro II (Input vacío, 50s/Q, requiere ≥90% para abrir Fase 5)

```

### ⏱️ Zona de Evaluación: Reglas y Tiempos de los Desafíos

| Componente | Dificultad | Interfaz | Cantidad | Temporizador | Regla de Cierre (Early Exit) |
| --- | --- | --- | --- | --- | --- |
| **Desafío 1** | Estándar | Opción Múltiple / SVG | 25 | 25 segundos / preg | Expulsión al 3er error |
| **Desafío 2** | Avanzada | Opción Múltiple / Lógica | 25 | 40 segundos / preg | Expulsión al 3er error |
| **Desafío Final** | Maestría | Evocación Pura (Input) | 10 | 50 segundos / preg | Expulsión al 2do error |

*Puntaje Mínimo de Aprobación:* 90% (23/25 en D1 y D2; 9/10 en el Desafío Final).

---

## PARTE 2: GUION DE TEXTOS DE APRENDIZAJE Y EVOCACIÓN

### 🧠 MÓDULO 1: LA FRACCIÓN VISUAL

#### 👑 Nivel 1: Lectura y modelado en polígonos simétricos

**Texto de Aprendizaje:** Hasta ahora has trabajado con unidades completas (1 espada, 2 manzanas). Pero, ¿qué pasa cuando rompemos esa unidad? Aquí nacen las fracciones. Los números pueden representar "pedazos rotos" de un bloque entero. En una fracción, el número de abajo (el **denominador**) es el "jefe arquitecto": él decide exactamente en cuántos pedazos idénticos se corta el objeto total. El número de arriba (el **numerador**) es el "recolector": él te dice cuántos de esos pedazos vas a tomar, usar o colorear. Leer fracciones es entender la relación entre lo que tomas y el total disponible.

**El Diccionario del Nivel:**

* **Denominador (Abajo):** El inventario total de cortes idénticos en la figura.
* **Numerador (Arriba):** Los pedazos sombreados o seleccionados.

⚠️ **¡Cuidado con la Trampa del Conteo Separado!** Si ves una pizza cortada en 4 y 1 pedazo tiene pepperoni, no digas "1 y 3". El total de pedazos siempre va abajo. Es 1/4.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Una pizza cortada en 8 pedazos, 3 pintados.
* *Paso 1:* Contamos todos los pedazos. Son 8. (Denominador = 8).
* *Paso 2:* Contamos los pintados. Son 3. (Numerador = 3).
* *Resultado:* 3/8.


* **Ejemplo 2:** Una barra de chocolate con 4 cuadrados, te comes 1.
* *Paso 1:* El chocolate entero tiene 4 cuadrados. (Denominador = 4).
* *Paso 2:* Tomaste 1 cuadrado. (Numerador = 1).
* *Resultado:* 1/4.


* **Ejemplo 3:** Una bandera dividida en 3 franjas, 2 son rojas.
* *Paso 1:* La bandera tiene 3 franjas totales. (Denominador = 3).
* *Paso 2:* Hay 2 rojas. (Numerador = 2).
* *Resultado:* 2/3.


* **Ejemplo 4:** Una ventana con 6 cristales, 5 están limpios.
* *Paso 1:* Total de cristales es 6. (Denominador = 6).
* *Paso 2:* Cristales limpios son 5. (Numerador = 5).
* *Resultado:* 5/6.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** (Visual: Rectángulo dividido en 5, 2 pintados). ¿Qué fracción del rectángulo está pintada? `[Input: 2/5]`
* *Feedback Acierto:* ¡Exacto! 2 pedazos pintados de un total de 5.
* *Feedback Error:* Cuenta todos los recuadros para el número de abajo, y solo los pintados para el de arriba.


* **Interactivo 2:** (Visual: Cuadrícula de 6 vacía). Haz clic para pintar exactamente 4/6 de esta barra. `[Clics en UI]`
* *Feedback Acierto:* ¡Perfecto! Pintaste 4 de los 6 disponibles.
* *Feedback Error:* El jefe (6) ya cortó la barra. Tú solo debes pintar 4 pedazos.


* **Interactivo 3:** (Visual: Círculo dividido en 4, todos pintados). ¿Qué fracción representa el círculo entero pintado? `[Input: 4/4]`
* *Feedback Acierto:* ¡Correcto! 4/4 es lo mismo que 1 unidad entera.
* *Feedback Error:* Si hay 4 pedazos en total y los 4 están pintados, la fracción es 4/4.



#### 👑 Nivel 2: Construcción de equivalencias

**Texto de Aprendizaje:** Las fracciones son expertas en usar disfraces. Imagina que tienes media pizza (1/2). Si tomas un cuchillo y cortas ese pedazo grande exactamente por la mitad, ahora tienes 2 pedazos más pequeños, pero, ¡atención!, sigues teniendo exactamente la misma cantidad total de comida. A esto lo llamamos **fracciones equivalentes**. Matemáticamente, se crean aplicando un factor de escala: multiplicar o dividir el número de arriba y el de abajo por el mismo valor genera un "clon perfecto" de tu fracción, alterando su apariencia geométrica, pero conservando su masa exacta.

**El Diccionario del Nivel:**

* **Clonación:** Multiplicar numerador y denominador por el mismo número (ej. x2).
* **Equivalencia:** 1/2 es visual y matemáticamente idéntico a 2/4.

⚠️ **¡Cuidado con la Trampa del Denominador Mayor!** Un número grande abajo no significa "más cantidad". Si el denominador es 8, significa que partiste el objeto en 8 pedazos. 1/8 es un pedazo mucho más enano que 1/2.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Encontrar el clon x2 de 1/2.
* *Paso 1:* Multiplicamos el numerador por 2: 1 × 2 = 2.
* *Paso 2:* Multiplicamos el denominador por 2: 2 × 2 = 4.
* *Resultado:* 2/4.


* **Ejemplo 2:** Encontrar el clon x3 de 1/3.
* *Paso 1:* Numerador: 1 × 3 = 3.
* *Paso 2:* Denominador: 3 × 3 = 9.
* *Resultado:* 3/9.


* **Ejemplo 3:** Amplificar 2/5 multiplicando por 2.
* *Paso 1:* Numerador: 2 × 2 = 4.
* *Paso 2:* Denominador: 5 × 2 = 10.
* *Resultado:* 4/10.


* **Ejemplo 4:** Amplificar 3/4 multiplicando por 2.
* *Paso 1:* Numerador: 3 × 2 = 6.
* *Paso 2:* Denominador: 4 × 2 = 8.
* *Resultado:* 6/8.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Escribe una fracción equivalente a 1/2 multiplicando por 3. `[Input: 3/6]`
* *Feedback Acierto:* ¡Magia matemática! 1/2 y 3/6 son clones.
* *Feedback Error:* Multiplica el 1 por 3 y el 2 por 3 para encontrar el clon.


* **Interactivo 2:** Ordena de menor a mayor cantidad visual: 1/8, 1/2, 1/4. `[Drag & Drop]`
* *Feedback Acierto:* ¡Excelente! A mayor denominador, más pequeño el pedazo. 1/8 < 1/4 < 1/2.
* *Feedback Error:* Recuerda, si cortas la pizza en 8, los pedazos son enanos. 1/8 es el menor.


* **Interactivo 3:** (Visual: 2/3 pintados). Si multiplicamos arriba y abajo por 4, ¿cuál es la nueva fracción equivalente? `[Input: 8/12]`
* *Feedback Acierto:* ¡Brillante! Cortaste cada pedazo en 4 y obtuviste 8/12.
* *Feedback Error:* Multiplica el numerador (2) por 4 y el denominador (3) por 4.



---

### 🧠 MÓDULO 2: FRACCIÓN DE CANTIDAD

#### 👑 Nivel 2: Operador compuesto (Algoritmo de dos pasos)

**Texto de Aprendizaje:** Hemos dominado las figuras, ahora pasemos a cantidades reales como inventarios de monedas, tropas o puntos de vida. Aquí la fracción deja de ser un dibujo y se convierte en un **"operador"**, es decir, un motor de cálculo que ejecuta dos acciones consecutivas. Para extraer una fracción de un número grande (por ejemplo, 3/4 de 20 monedas): Primero, usas el denominador como divisor para repartir el inventario en cajas iguales. Segundo, usas el numerador como multiplicador para tomar las cajas que necesitas.
La fórmula infalible es: $(Total \div Denominador) \times Numerador$.

**El Diccionario del Nivel:**

* **Paso 1 (Corta):** Divide la cantidad total entre el denominador (crea los grupos).
* **Paso 2 (Recolecta):** Multiplica ese resultado por el numerador (toma tus grupos).

⚠️ **¡Cuidado con la Trampa Invertida!** Nunca intentes dividir el total entre el número de arriba. El jefe que corta los grupos siempre es el número de abajo.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Calcular 2/5 de 50 monedas.
* *Paso 1 (Corta):* 50 ÷ 5 = 10. (Cada caja tiene 10 monedas).
* *Paso 2 (Recolecta):* 10 × 2 = 20.
* *Resultado:* 20 monedas.


* **Ejemplo 2:** Calcular 3/4 de 12 puntos.
* *Paso 1 (Corta):* 12 ÷ 4 = 3.
* *Paso 2 (Recolecta):* 3 × 3 = 9.
* *Resultado:* 9 puntos.


* **Ejemplo 3:** Calcular 2/3 de 15 manzanas.
* *Paso 1 (Corta):* 15 ÷ 3 = 5.
* *Paso 2 (Recolecta):* 5 × 2 = 10.
* *Resultado:* 10 manzanas.


* **Ejemplo 4:** Calcular 5/8 de 40 cartas.
* *Paso 1 (Corta):* 40 ÷ 8 = 5.
* *Paso 2 (Recolecta):* 5 × 5 = 25.
* *Resultado:* 25 cartas.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Calcula 3/4 de 20 tazos. `[Input: 15]`
* *Feedback Acierto:* ¡Perfecto! 20 ÷ 4 = 5, y 5 × 3 = 15.
* *Feedback Error:* Sigue el motor: primero divide 20 entre 4, y luego multiplica por 3.


* **Interactivo 2:** En una clase de 30 alumnos, 2/3 llevan gafas. ¿Cuántos alumnos llevan gafas? `[Input: 20]`
* *Feedback Acierto:* ¡Visión perfecta! 30 ÷ 3 = 10; 10 × 2 = 20 alumnos.
* *Feedback Error:* Divide los 30 alumnos en 3 grupos (10). Luego toma 2 de esos grupos (10 × 2).


* **Interactivo 3:** Calcula 4/5 de R$ 50. `[Input: 40]`
* *Feedback Acierto:* ¡Gran administrador! 50 ÷ 5 = 10; 10 × 4 = 40.
* *Feedback Error:* El 5 divide al 50, dándote 10. Multiplica ese 10 por el 4 de arriba.



#### 👑 Nivel 3: Lógica del complemento

**Texto de Aprendizaje:** Los matemáticos avanzados no pierden tiempo contando todo dos veces. Utilizan la lógica deductiva del "complemento". Si sabes qué parte de un total se gastó, automáticamente sabes qué parte sobró, porque ambas fracciones deben sumar el entero perfecto. Por ejemplo, si te comes 1/4 de las galletas del frasco, no necesitas contar los restos: la lógica te dicta que sobra 3/4, porque 1/4 + 3/4 = 4/4 (el frasco entero). Esta es una técnica de atajo mental poderosa para problemas complejos.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Si regalo 1/4 de mis juguetes, ¿qué fracción me queda?
* *Lógica:* El entero es 4/4. 4/4 - 1/4 = 3/4.
* *Resultado:* Me quedan 3/4 de mis juguetes.


* **Ejemplo 2:** Si gasto 2/5 de mi dinero, ¿qué fracción me sobra?
* *Lógica:* El entero es 5/5. 5/5 - 2/5 = 3/5.
* *Resultado:* Sobran 3/5.


* **Ejemplo 3:** Mateo tiene 30 cartas. Regala 1/3. ¿Cuántas cartas le quedan?
* *Paso 1:* Calcula lo regalado: 1/3 de 30 = 10.
* *Paso 2:* Resta del total: 30 - 10 = 20.
* *Resultado:* Le quedan 20 cartas.


* **Ejemplo 4:** Una caja tiene 40 chocolates. Pierdo 3/10. ¿Cuántos chocolates quedan?
* *Paso 1:* Pierde (40 ÷ 10) × 3 = 4 × 3 = 12.
* *Paso 2:* Quedan 40 - 12 = 28.
* *Resultado:* Quedan 28 chocolates.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Sofía preparó 40 cupcakes y vendió 1/4 en la feria. ¿Cuántos cupcakes le QUEDARON sin vender? `[Input: 30]`
* *Feedback Acierto:* ¡Lógica pura! Vendió 10 (1/4), así que le sobraron 30.
* *Feedback Error:* Calcula primero cuánto es 1/4 de 40 (que es 10). Luego resta eso al total: 40 - 10.


* **Interactivo 2:** Un tanque tiene 50 litros de agua. Si se derraman 2/5 del tanque, ¿cuántos litros de agua QUEDAN dentro? `[Input: 30]`
* *Feedback Acierto:* ¡Excelente deducción! Se derramaron 20 litros, así que quedan 30.
* *Feedback Error:* Usa el algoritmo de dos pasos: (50 ÷ 5) × 2 para saber cuánto se derramó. Luego réstaselo a los 50 originales.


* **Interactivo 3:** Si gasto 3/8 de mis ahorros, ¿qué fracción exacta de mis ahorros sigue guardada en el banco? `[Input: 5/8]`
* *Feedback Acierto:* ¡Atajo mental perfecto! 3/8 + 5/8 = 8/8 (el total).
* *Feedback Error:* Si tu dinero total son 8/8 y gastaste 3 de esos octavos, ¿cuántos octavos te quedan?



---

### 📊 MÓDULO 3: PORCENTAJES RÁPIDOS Y PROMEDIOS

#### 👑 Nivel 1: Mapeo de porcentajes intuitivos

**Texto de Aprendizaje:** Muchas personas le temen al símbolo `%`, pero en realidad es solo una fracción "perezosa". El porcentaje significa literalmente "por cada cien". Es una fracción que siempre, sin excepción, usa el número 100 como denominador. El 50% de algo es literalmente 50/100. En lugar de hacer cálculos largos, los calculistas mentales memorizan "las tres fracciones amigables". Al traducir estos tres porcentajes a operaciones básicas, adquirirás una velocidad sobrehumana al calcular descuentos en tiendas o estadísticas de videojuegos.

**El Diccionario del Nivel:**

* **50%:** Es exactamente la mitad. Para hallarlo, simplemente **Divide entre 2**.
* **25%:** Es la cuarta parte. Para hallarlo, **Divide entre 4** (o saca la mitad de la mitad).
* **10%:** Es la décima parte. Para hallarlo, **Divide entre 10** (quítale un cero al número o corre la coma).

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Calcular el 50% de 60.
* *Lógica:* 50% es la mitad.
* *Cálculo:* 60 ÷ 2 = 30.


* **Ejemplo 2:** Calcular el 25% de 100.
* *Lógica:* 25% es la cuarta parte.
* *Cálculo:* 100 ÷ 4 = 25.


* **Ejemplo 3:** Calcular el 10% de 40.
* *Lógica:* 10% es quitar un cero.
* *Cálculo:* 40 ÷ 10 = 4.


* **Ejemplo 4:** Un objeto de 20 pesos tiene un descuento del 50%.
* *Lógica:* Descuento de la mitad. 20 ÷ 2 = 10 de descuento.
* *Precio final:* 20 - 10 = 10 pesos.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Un escudo mágico cuesta 80 puntos de maná. Hoy tiene un 50% de descuento. ¿De cuántos puntos es el descuento? `[Input: 40]`
* *Feedback Acierto:* ¡Directo al blanco! 50% es la mitad geométrica de 80.
* *Feedback Error:* 50% significa exactamente la mitad. Divide 80 entre 2.


* **Interactivo 2:** Calcula rápidamente el 10% de 250 monedas de oro. `[Input: 25]`
* *Feedback Acierto:* ¡Veloz! Solo le quitaste el cero final al dividir entre 10.
* *Feedback Error:* El 10% de un número terminado en cero se halla eliminando ese cero (dividiendo entre 10).


* **Interactivo 3:** La barra de vida de un jefe de 40 puntos baja al 25%. ¿Cuántos puntos de vida le quedan? `[Input: 10]`
* *Feedback Acierto:* ¡Golpe crítico! 25% es la cuarta parte. 40 ÷ 4 = 10.
* *Feedback Error:* 25% equivale a un cuarto (1/4). Divide los 40 puntos entre 4.



#### 👑 Nivel 4: El Punto de Equilibrio (Media Aritmética)

**Texto de Aprendizaje:** En el análisis de datos, el promedio (o media aritmética) no es solo un número; es el "Punto de Equilibrio Absoluto" de un conjunto de elementos desiguales. Imagina tres torres de bloques con diferentes alturas (3, 7 y 5 bloques). Calcular el promedio significa nivelar el terreno: debes quitar bloques de la torre más alta y pasarlos a las más bajas hasta que todas midan exactamente lo mismo. Para hacerlo numéricamente sin dibujar, juntamos todos los bloques en una gran pila (sumamos) y luego repartimos esa pila a partes iguales entre el número de torres (dividimos).

**El Diccionario del Nivel:**

* **Sumatoria:** Consolidar todos los datos en un total único.
* **Media / Promedio:** El resultado de dividir la Sumatoria entre la cantidad total de elementos participantes.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Promedio de libros leídos: 3, 7 y 5.
* *Paso 1 (Sumar):* 3 + 7 + 5 = 15.
* *Paso 2 (Dividir):* 15 ÷ 3 (elementos) = 5.
* *Resultado:* Promedio es 5.


* **Ejemplo 2:** Promedio de edades: 10 y 20 años.
* *Paso 1 (Sumar):* 10 + 20 = 30.
* *Paso 2 (Dividir):* 30 ÷ 2 (elementos) = 15.
* *Resultado:* Promedio es 15 años.


* **Ejemplo 3:** Promedio de notas: 2, 4, 6 y 8.
* *Paso 1 (Sumar):* 2 + 4 + 6 + 8 = 20.
* *Paso 2 (Dividir):* 20 ÷ 4 (elementos) = 5.
* *Resultado:* Promedio es 5.


* **Ejemplo 4:** Promedio de puntajes iguales: 100, 100, 100.
* *Paso 1 (Sumar):* 300.
* *Paso 2 (Dividir):* 300 ÷ 3 = 100. (Nota: ¡Si todos son iguales, el promedio es el mismo número!).



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** (UI Nivelador). Las puntuaciones de tus tres partidas son 6, 8 y 10. ¿Cuál es tu promedio de puntuación? `[Input: 8]`
* *Feedback Acierto:* ¡Equilibrio perfecto! (6+8+10) = 24. 24 ÷ 3 = 8.
* *Feedback Error:* Suma las tres notas para hacer una gran pila (24), y luego divide ese gran total entre 3.


* **Interactivo 2:** Dos amigos compran cartas. Uno gasta 4 pesos y el otro 10 pesos. ¿Cuál es el promedio de gasto entre los dos? `[Input: 7]`
* *Feedback Acierto:* ¡Justicia financiera! 14 ÷ 2 = 7 pesos por persona.
* *Feedback Error:* Suma el gasto total (4 + 10). Luego, como son 2 amigos, divide el resultado entre 2.


* **Interactivo 3:** En tres días llovió 5 mm, 5 mm y 14 mm. ¿Cuál es el promedio de lluvia diaria? `[Input: 8]`
* *Feedback Acierto:* ¡Clima dominado! (5+5+14) = 24. 24 ÷ 3 = 8 mm.
* *Feedback Error:* Suma los milímetros de los 3 días. Luego divide ese total entre 3 para encontrar el equilibrio.



---

### 🧪 MÓDULO 4: RAZÓN Y MEZCLAS

#### 👑 Nivel 1: Razones simples (a:b)

**Texto de Aprendizaje:** Una "razón" es el idioma secreto de las recetas y las fórmulas industriales; nos dice cómo se relacionan dos cantidades distintas para formar una mezcla estable. Si una instrucción dice "2 tazas de pintura azul por cada 1 taza de pintura amarilla", la razón matemática se escribe como 2:1. Este es tu "Bloque Base". Si tu objetivo es fabricar el doble de pintura sin alterar el tono del color, la regla de proporcionalidad exige que multipliques *ambos* ingredientes por el mismo factor de escala.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Limonada (Razón 3 Agua : 1 Limón). Si uso 2 de limón (x2).
* *Cálculo:* Multiplico el agua también x2: 3 × 2 = 6.
* *Resultado:* 6 tazas de agua.


* **Ejemplo 2:** Pintura (Razón 2 Rojo : 3 Blanco). Si quiero hacer la receta 3 veces (x3).
* *Cálculo:* Rojo = 2 × 3 = 6. Blanco = 3 × 3 = 9.
* *Resultado:* 6 de rojo y 9 de blanco.


* **Ejemplo 3:** Mezcla de cemento (1 Cemento : 4 Arena). Si pongo 2 de cemento.
* *Cálculo:* Arena = 4 × 2 = 8.
* *Resultado:* 8 partes de arena.


* **Ejemplo 4:** Jarabe (5 Agua : 2 Azúcar). Si fabrico el cuádruple (x4).
* *Cálculo:* Agua = 5 × 4 = 20. Azúcar = 2 × 4 = 8.
* *Resultado:* 20 de agua y 8 de azúcar.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** La receta de limonada es 3 tazas de agua por 1 de limón (3:1). Si en la jarra pones 2 tazas de limón, ¿cuántas tazas de agua necesitas para no arruinarla? `[Input: 6]`
* *Feedback Acierto:* ¡Mezcla perfecta! Multiplicaste el agua también por 2.
* *Feedback Error:* Si duplicaste el limón (de 1 a 2), debes duplicar el agua (de 3 a 6) para mantener el balance.


* **Interactivo 2:** Una pared usa 2 litros de pintura roja y 3 de blanca (2:3). Si compras 6 litros de roja (triplicaste la receta), ¿cuántos de blanca necesitas? `[Input: 9]`
* *Feedback Acierto:* ¡Color idéntico! Multiplicaste 3 × 3 = 9.
* *Feedback Error:* Si el rojo pasó de 2 a 6, multiplicaste por 3. Haz lo mismo con la pintura blanca (3 × 3).


* **Interactivo 3:** La masa requiere 1 vaso de leche por 2 de harina (1:2). Si pones 4 vasos de harina, ¿cuántos de leche usarás? `[Input: 2]`
* *Feedback Acierto:* ¡Gran panadero! La relación se mantiene estable.
* *Feedback Error:* La harina se duplicó (de 2 a 4). Por lógica proporcional, la leche también debe duplicarse (de 1 a 2).



#### 👑 Nivel 2: Reparto proporcional de volúmenes macro

**Texto de Aprendizaje:** En evaluaciones analíticas avanzadas, rara vez te pedirán un ingrediente aislado; te pedirán fabricar un volumen total macroscópico. Para resolver esto, primero debes crear tu "Bloque Total". Si mezclas 2 litros de pintura azul y 3 litros de amarilla, físicamente fabricas 5 litros de pintura verde en el balde. ¡Ese 5 es tu bloque base! Si el cliente te exige entregar un mega-pedido de 50 litros de pintura verde, usas la división para saber cuántas veces cabe tu receta en el pedido (50 ÷ 5 = 10 veces). Sabiendo que necesitas "10 lotes", multiplicas tus ingredientes originales por 10.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Receta base (2 Azul + 3 Amarillo = 5 Total). Pedido: 30 litros.
* *Paso 1 (Escala):* 30 ÷ 5 = 6 veces la receta.
* *Paso 2 (Cantidades):* 2×6 = 12 Azul; 3×6 = 18 Amarillo.


* **Ejemplo 2:** Receta base (1 Rojo + 4 Blanco = 5 Total). Pedido: 50 litros.
* *Paso 1 (Escala):* 50 ÷ 5 = 10 veces la receta.
* *Paso 2 (Cantidades):* 1×10 = 10 Rojo; 4×10 = 40 Blanco.


* **Ejemplo 3:** Mezcla (3 Arena + 7 Cemento = 10 Total). Pedido: 40 kg.
* *Paso 1 (Escala):* 40 ÷ 10 = 4 veces.
* *Paso 2 (Cantidades):* 3×4 = 12 Arena; 7×4 = 28 Cemento.


* **Ejemplo 4:** Jarabe (1 Agua + 1 Fruta = 2 Total). Pedido: 20 litros.
* *Paso 1 (Escala):* 20 ÷ 2 = 10 veces.
* *Paso 2 (Cantidades):* 10 Agua; 10 Fruta.



**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Mezclas 2 litros de azul y 3 de amarillo para hacer 5 litros de verde en total. Si quieres fabricar 30 litros de verde, ¿cuántos litros de azul usas? `[Input: 12]`
* *Feedback Acierto:* ¡Producción industrial! La receta se multiplicó x6. Usaste 2 × 6 = 12 de azul.
* *Feedback Error:* Para llegar a 30 litros desde 5, necesitas multiplicar la receta por 6. Multiplica los 2 litros de azul por 6.


* **Interactivo 2:** Haces pintura rosa con 1 litro rojo y 4 blancos (Total: 5 litros). Para vender un barril de 50 litros, ¿cuántos litros de blanco comprarás? `[Input: 40]`
* *Feedback Acierto:* ¡Escalado perfecto! 50 ÷ 5 = 10 lotes. 4 × 10 = 40 litros blancos.
* *Feedback Error:* Tu receta base hace 5 litros. Para hacer 50, debes repetir la receta 10 veces. Multiplica el blanco (4) por 10.


* **Interactivo 3:** Una mezcla de concreto usa 3 paladas de arena y 7 de grava (10 en total). Si para una obra necesitas 40 paladas de mezcla en total, ¿cuántas paladas de arena aportarás? `[Input: 12]`
* *Feedback Acierto:* ¡Ingeniero civil! 40 ÷ 10 = 4 lotes. 3 × 4 = 12 de arena.
* *Feedback Error:* Divide el total deseado (40) entre el total de tu receta (10) para hallar tu multiplicador (4). Luego aplica ese 4 a la arena (3 × 4).



---

## PARTE 3: DISEÑO DE SCRIPTS INYECTORES (PYTHON)

Para poblar la base de datos PostgreSQL de la Fase 4 de manera consistente con el modelo `Server-Authoritative`, el script en Python (`seed_fase4.py`) usará SQLAlchemy AsyncSession bajo las siguientes reglas:

1. **JSONB Estructurales:** Los niveles que requieran representaciones visuales (Módulo 1 y Módulo 3 - Gráficos) inyectarán la topología en `metadata_tecnica`.
2. **Operadores Sin Decimales:** Para el Módulo 2 (Fracción de Cantidad), el script generará aleatoriamente un denominador de la lista `[3, 4, 5, 8, 10]`. El "Total" del inventario se generará estrictamente como un múltiplo de este denominador `(Total = Denominador * randint(2, 12))` para asegurar divisiones enteras.
3. **Generación de Familias (Práctica Libre):** Se crean 15 familias únicas por nivel (1 original + 3 espejos por familia) compartiendo el `estructura_padre_id`.
4. **Desafíos:** Se inyectan de forma precalculada marcados con `tipo_segmento = 'desafio_x'` con 3 distractores controlados (por ejemplo, en fracciones de cantidad, un distractor será el resultado de solo hacer el Paso 1).

---

## PARTE 4: MAPEO DE ERRORES JSONB Y TUTOR INVISIBLE

El backend asociará los fallos a diagnósticos cognitivos precalculados en `respuestas_erroneas_jsonb`:

* **Error de Numerador Ciego (Módulo 1):**
* *Detonante:* El alumno suma partes coloreadas y no coloreadas para crear la fracción (ej. escribe 1/3 en lugar de 1/4).
* *Tutor:* "¡El denominador es el jefe del total! El número de abajo debe ser TODOS los cortes de la pizza, no solo los que quedaron vacíos."


* **Error de Multiplicación Temprana (Módulo 2):**
* *Detonante:* Multiplica el total por el numerador primero, resultando en números gigantes (ej. $20 \times 3 \div 4$).
* *Tutor:* "¡Motor al revés! Siempre reduce el número primero. Divide por el denominador (el de abajo) antes de multiplicar."


* **Error de Promedio Incompleto (Módulo 3):**
* *Detonante:* El alumno suma los datos pero olvida dividir por la cantidad (respondiendo la sumatoria).
* *Tutor:* "¡Te faltó el paso de equilibrio! Juntaste todos los bloques correctamente, pero ahora debes repartirlos entre la cantidad de torres."



---

## PARTE 5: INTEGRACIÓN ARQUITECTÓNICA Y UX/UI

La Fase 4 extiende los estándares mediante componentes visuales reactivos:

* **Renderizado de SVG Controlado por JSON:** El Frontend NO dibuja gráficos por sí solo. El Backend envía: `{"tipo": "pie_chart", "cortes": 8, "sombreados": [0,1,2]}` y el Frontend simplemente mapea el SVG. Esto evita que el cliente pueda adivinar respuestas leyendo el DOM.
* **Input Híbrido (Fracciones):** La Caja de Entrada Personalizada detectará si se requiere una fracción y mostrará dos casillas apiladas (Numerador / Denominador) o un Input estándar si es cantidad.
* **Bypass de Rescate Fluido:** Al igual que en la Fase 2, si un alumno cae en el Bucle Espejo en un nivel, puede saltar la lectura profunda usando `/fase4/cerrar-rescate`, reseteando los contadores y cargando la pregunta espejo instantáneamente.
* **Animaciones de Transferencia (Media Aritmética):** En el nivel M3N4, al cometer un error, el `Bucle Espejo` enviará una orden de animación (`"bucle_espejo_animacion": "mostrar_transferencia_barras"`), haciendo que las barras del gráfico en pantalla transfieran bloques visualmente hacia el promedio antes de formular la pregunta espejo.