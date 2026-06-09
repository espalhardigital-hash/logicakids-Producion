# 🎲 FASE 8: LÓGICA, COMBINATORIA Y PROBABILIDAD

**Propósito:** Desarrollar el pensamiento algorítmico, la capacidad de predecir escenarios posibles y el análisis estructurado del azar.

---

## PARTE 1: DOCUMENTO DE DISEÑO LÓGICO

La Fase 8 introduce a los alumnos en el análisis de patrones complejos, la organización de opciones múltiples sin dejarse ninguna atrás (combinatoria) y el cálculo matemático de las posibilidades (probabilidad). Estos temas exigen una abstracción mental alta y son frecuentes en los exámenes Pedro II (ej. combinaciones de ropa 2018 Q14, probabilidad en ruletas 2023 Q18, secuencias lógicas gráficas 2024 Q12).

### 🗺️ Mapa de la Fase 8: Estructura de Módulos y Niveles

```text
[FASE 8: LÓGICA, COMBINATORIA Y PROBABILIDAD]
│
├── [MÓDULO 1: Secuencias Lógicas] -> Tema: Patrones de formación, interpolación y recurrencia.
│    ├── Nivel 1: Progresiones aritméticas (patrón de suma/resta constante) (Descifrador, sin tiempo)
│    ├── Nivel 2: Progresiones compuestas y multiplicativas (Crecimiento acelerado, Bucle Espejo)
│    ├── Nivel 3: Interpolación — deducir el término central faltante (Reparador de puentes, sin tiempo)
│    │
│    ├── DESAFÍO 1: Continuación directa de secuencia (Opción múltiple, 30s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: Identificación de la ley de formación (Opción múltiple, 45s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Hallar el término lejano (ej. el décimo) (Input numérico, 60s/Q, ≥90%, Early Exit al 2do error)
│
├── [MÓDULO 2: Combinatoria Visual] -> Tema: Principio multiplicativo y organización de posibilidades.
│    ├── Nivel 1: Diagramas de árbol y combinaciones filas × columnas (Armador de Menús, sin tiempo)
│    ├── Nivel 2: Principio multiplicativo de 3 o más variables (Cajas fuertes y contraseñas, Bucle Espejo)
│    ├── Nivel 3: Combinatoria con restricciones (ej. colores que no se pueden repetir) (Constructor estricto, sin tiempo)
│    │
│    ├── DESAFÍO 1: Cálculo total de combinaciones simples (Opción múltiple, 30s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: Diagramas de árbol incompletos (Opción múltiple, 45s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Contraseñas y placas con restricciones (Input numérico, 60s/Q, ≥90%, Early Exit al 2do error)
│
└── [MÓDULO 3: Probabilidad] -> Tema: Análisis del azar, espacio muestral y fracciones de probabilidad.
     ├── Nivel 1: Clasificación de eventos (seguro, posible, imposible) (El Oráculo, sin tiempo)
     ├── Nivel 2: Definición de Laplace — Casos Favorables / Casos Posibles (Urnas y ruletas, Bucle Espejo)
     ├── Nivel 3: Probabilidad en experimentos sin reposición (Bolsas que se vacían, sin tiempo)
     │
     ├── DESAFÍO 1: Cálculo de probabilidad en fracción (Opción múltiple, 30s/Q, Early Exit al 3er error)
     ├── DESAFÍO 2: Comparación: ¿qué urna tiene mayor probabilidad? (Opción múltiple, 45s/Q, Early Exit al 3er error)
     └── DESAFÍO FINAL: Azar compuesto tipo Pedro II (Input numérico, 60s/Q, ≥90% para abrir Fase 9)
```

### ⏱️ Zona de Evaluación: Reglas y Tiempos de los Desafíos

| Componente | Dificultad | Interfaz | Cantidad | Temporizador | Regla de Cierre (Early Exit) |
| --- | --- | --- | --- | --- | --- |
| **Desafío 1** | Estándar | Opción Múltiple | 25 | 30 segundos / preg | Expulsión al 3er error |
| **Desafío 2** | Avanzada | Opción Múltiple | 25 | 45 segundos / preg | Expulsión al 3er error |
| **Desafío Final** | Maestría | Evocación Pura (Input) | 10 | 60 segundos / preg | Expulsión al 2do error |

*Puntaje Mínimo de Aprobación:* 90% (23/25 en D1 y D2; 9/10 en el Desafío Final).

---

## PARTE 2: GUION DE TEXTOS DE APRENDIZAJE Y EVOCACIÓN

### 🧩 MÓDULO 1: SECUENCIAS LÓGICAS

#### 👑 Nivel 1: Progresiones aritméticas (Suma y Resta Constante)

**Texto de Aprendizaje:** ¡Bienvenido al Laboratorio de Criptografía, Descifrador! Una **secuencia lógica** no es un montón de números tirados al azar; es un tren de vagones unidos por una regla secreta llamada **Ley de Formación**. En este primer nivel, las leyes son simples: para pasar de un vagón al siguiente, siempre se suma o siempre se resta la misma cantidad. Tu superpoder es **medir la distancia entre dos números vecinos**: si ves un 2 y luego un 5, el tren avanzó 3 pasos (+3). Si el siguiente es un 8, ¡el patrón está confirmado! Una vez que descubres la regla, puedes predecir cualquier número en el futuro.

**El Diccionario del Nivel:**

* **Secuencia:** Una fila ordenada de números o figuras.
* **Ley de Formación:** La regla matemática oculta (ej. "sumar 4 cada vez").
* **Progresión Aritmética:** Cuando la regla es siempre sumar o siempre restar el mismo número fijo.
* **Término:** Cada uno de los números que forman la secuencia.

⚠️ **¡Cuidado con la Trampa del Salto Falso!** No adivines la regla mirando solo los primeros dos números. Si ves 2 y 4, la regla podría ser "sumar 2" (2, 4, 6) o podría ser "multiplicar por 2" (2, 4, 8). **Siempre prueba tu regla con el tercer número** antes de darla por correcta.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Secuencia: 3, 7, 11, 15, ?
  * *Paso 1:* Diferencia entre 7 y 3: 7 - 3 = +4.
  * *Paso 2:* Diferencia entre 11 y 7: 11 - 7 = +4. ¡Regla confirmada!
  * *Paso 3:* Al último (15) le sumo 4: 15 + 4 = 19.
  * *Resultado:* El siguiente número es 19.

* **Ejemplo 2:** Secuencia: 20, 17, 14, 11, ?
  * *Paso 1:* Los números bajan. 20 a 17 es -3.
  * *Paso 2:* De 17 a 14 es -3.
  * *Paso 3:* 11 - 3 = 8.
  * *Resultado:* 8.

* **Ejemplo 3:** Secuencia: 5, 10, 15, 20, ?
  * *Análisis:* Se suma 5 en cada paso. 20 + 5 = 25.
  * *Resultado:* 25.

* **Ejemplo 4:** Secuencia gráfica: Triángulo de 3 palitos, luego de 6 palitos, luego de 9. ¿Cuántos palitos en el cuarto?
  * *Análisis:* 3, 6, 9. La regla es +3.
  * *Resultado:* 9 + 3 = 12 palitos.

* **Ejemplo 5:** Secuencia: 100, 90, 80, 70, ?
  * *Análisis:* La regla es restar 10. 70 - 10 = 60.
  * *Resultado:* 60.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Descubre el número que sigue: 4, 10, 16, 22, ? `[Input: 28]`
  * *Feedback Acierto:* ¡Código roto! La regla es sumar 6. 22 + 6 = 28.
  * *Feedback Error:* Resta un número del anterior (10 - 4 = 6). Verifica con el siguiente (16 - 10 = 6). Suma ese 6 al 22.

* **Interactivo 2:** Encuentra el siguiente: 50, 45, 40, 35, ? `[Input: 30]`
  * *Feedback Acierto:* ¡Perfecto! La secuencia va restando 5 cada vez.
  * *Feedback Error:* Observa que los números se van achicando. ¿Cuánto le quitas a 50 para llegar a 45? Quítale eso a 35.

* **Interactivo 3:** Completa la serie: 12, 19, 26, 33, ? `[Input: 40]`
  * *Feedback Acierto:* ¡Exacto! Sumaste 7 al último término.
  * *Feedback Error:* La diferencia entre 19 y 12 es 7. La diferencia entre 26 y 19 es 7. Añade 7 al 33.

---

#### 👑 Nivel 2: Progresiones compuestas y multiplicativas

**Texto de Aprendizaje:** ¡Las secuencias han evolucionado! Ahora se defienden con reglas más complejas. En este nivel enfrentarás dos nuevos tipos de códigos. **1. Progresiones Multiplicativas:** Aquí el tren no suma, sino que multiplica de golpe (crece muy rápido, ej: 2, 4, 8, 16... multiplicando por 2). **2. Progresiones Compuestas (Alternadas):** Estas son dos secuencias mezcladas en una sola fila. La regla salta un vagón sí y otro no. Por ejemplo: Sumar 2, luego restar 1, sumar 2, restar 1... Tu superpoder ahora es **buscar operaciones grandes (multiplicación) o patrones saltarines (operaciones que cambian en cada paso)**.

⚠️ **¡Cuidado con la Trampa del Crecimiento Falso!** Si ves la secuencia 2, 6, 18... y crees que de 2 a 6 sumaste 4, al intentar sumar 4 a 6 te dará 10 (¡pero el número es 18!). Si la suma no cuadra y el número crece agresivamente, inmediatamente prueba con la multiplicación (2 × 3 = 6, 6 × 3 = 18).

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Secuencia: 3, 6, 12, 24, ?
  * *Paso 1:* De 3 a 6 hay +3. De 6 a 12 hay +6. ¡La suma cambia, no es aritmética!
  * *Paso 2:* Prueba multiplicar. 3 × 2 = 6. 6 × 2 = 12. 12 × 2 = 24. ¡Regla: ×2!
  * *Paso 3:* 24 × 2 = 48.
  * *Resultado:* 48.

* **Ejemplo 2:** Secuencia Alternada: 10, 15, 13, 18, 16, ?
  * *Paso 1:* De 10 a 15 (+5). De 15 a 13 (-2).
  * *Paso 2:* De 13 a 18 (+5). De 18 a 16 (-2).
  * *Paso 3:* La regla es "+5, -2, repite". El último fue -2, toca +5.
  * *Resultado:* 16 + 5 = 21.

* **Ejemplo 3:** Secuencia: 1, 5, 25, 125, ?
  * *Análisis:* Crecimiento enorme. Multiplica por 5 en cada paso.
  * *Resultado:* 125 × 5 = 625.

* **Ejemplo 4:** Secuencia Alternada: 2, 4, 8, 10, 20, 22, ?
  * *Análisis:* De 2 a 4 (×2 o +2). De 4 a 8 (×2 o +4). De 8 a 10 (+2). De 10 a 20 (×2).
  * *Regla:* "×2, luego +2". El último paso (de 20 a 22) fue +2. Toca ×2.
  * *Resultado:* 22 × 2 = 44.

* **Ejemplo 5:** Secuencia de saltos: 5, 50, 6, 40, 7, 30, ?
  * *Análisis:* Lee uno sí y uno no. (5, 6, 7...) suben de a 1. El otro grupo (50, 40, 30...) bajan de a 10.
  * *Resultado:* Después del 30 toca el siguiente del primer grupo (7 + 1) = 8.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** ¿Qué número sigue en: 2, 6, 18, 54, ? `[Input: 162]`
  * *Feedback Acierto:* ¡Multiplicador experto! La regla es ×3. 54 × 3 = 162.
  * *Feedback Error:* La suma no funciona aquí porque los números crecen demasiado rápido. ¿Por qué número debes multiplicar el 2 para que dé 6? Aplica eso al 54.

* **Interactivo 2:** Descubre el patrón compuesto: 5, 10, 8, 13, 11, ? `[Input: 16]`
  * *Feedback Acierto:* ¡Doble agente! Sumaste 5 y restaste 2. A 11 le tocaba sumar 5.
  * *Feedback Error:* Observa los movimientos: de 5 a 10 sumas 5. De 10 a 8 restas 2. De 8 a 13 sumas 5. La regla se intercala. Si acabas de restar 2 para llegar a 11, ahora debes sumar 5.

* **Interactivo 3:** Secuencia multiplicativa: 5, 20, 80, ? `[Input: 320]`
  * *Feedback Acierto:* ¡Bingo! Multiplicaste por 4.
  * *Feedback Error:* ¿5 por cuánto da 20? Esa es tu regla (×4). Ahora multiplica 80 × 4.

---

#### 👑 Nivel 3: Interpolación — Deducir el término central

**Texto de Aprendizaje:** Hasta ahora siempre te faltaba el vagón del final. En el nivel maestro, el enemigo ha borrado **un vagón del medio** del tren. Tendrás secuencias como: 2, 6, ?, 14, 18. Para reparar este puente, tienes que **calcular la distancia total sobre el hueco y dividirla a la mitad**. Tu superpoder de Interpolación te permite calcular la regla mirando los vagones que quedaron unidos al final (14 a 18 es +4). Con eso, armas el puente y verificas que encaje perfectamente tanto con el vagón anterior como con el siguiente.

⚠️ **¡Cuidado con la Trampa del Parche Ciego!** Si completas el hueco asumiendo que la regla es "+2" porque te pareció lindo, ¡debes comprobarlo! Si pones un 8 en el hueco (6 + 2 = 8), debes verificar si el siguiente paso llega al 14 (8 + 2 = 10, ¡no es 14!). El número que pongas en el hueco debe hacer que TODA la secuencia funcione sin trabarse.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Secuencia: 5, 10, ?, 20, 25.
  * *Paso 1:* Los vagones unidos son 5→10 (+5) y 20→25 (+5).
  * *Paso 2:* Si la regla es +5, probamos en el hueco: 10 + 5 = 15.
  * *Paso 3:* Verificación: ¿15 + 5 da 20? Sí.
  * *Resultado:* El número es 15.

* **Ejemplo 2:** Secuencia: 10, ?, 18, 22.
  * *Paso 1:* Vagones unidos: 18→22 es +4.
  * *Paso 2:* Rellenar hueco: 10 + 4 = 14.
  * *Paso 3:* Verifica: 14 + 4 = 18. Correcto.
  * *Resultado:* 14.

* **Ejemplo 3:** Secuencia: 2, ?, 18, 54. (Atención al crecimiento).
  * *Paso 1:* 18→54 es un salto gigante. Multiplicación: 18 × 3 = 54.
  * *Paso 2:* Rellenar: 2 × 3 = 6.
  * *Paso 3:* Verifica: 6 × 3 = 18. Correcto.
  * *Resultado:* 6.

* **Ejemplo 4:** Secuencia: 50, 43, ?, 29, 22.
  * *Paso 1:* 50→43 es -7. 29→22 es -7.
  * *Paso 2:* Rellenar: 43 - 7 = 36.
  * *Paso 3:* Verifica: 36 - 7 = 29. Correcto.
  * *Resultado:* 36.

* **Ejemplo 5:** Secuencia: 1, 4, ?, 16, 25. (Trampa especial: Cuadrados perfectos).
  * *Paso 1:* Distancias: 1→4 (+3). 16→25 (+9). La distancia crece.
  * *Análisis:* Son números multiplicados por sí mismos: 1×1, 2×2, ?, 4×4, 5×5.
  * *Resultado:* 3×3 = 9.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Rellena el hueco: 8, 13, ?, 23, 28. `[Input: 18]`
  * *Feedback Acierto:* ¡Puente reparado! La regla en ambos lados es +5. 13 + 5 = 18.
  * *Feedback Error:* Mira los números que están juntos (23 y 28). La diferencia es 5. Aplica esa misma suma (+5) al 13 para llenar el hueco.

* **Interactivo 2:** Encuentra el número perdido: 100, 90, 80, ?, 60. `[Input: 70]`
  * *Feedback Acierto:* ¡Conexión perfecta! Todo el tren baja restando 10.
  * *Feedback Error:* ¿Qué pasa entre 100, 90 y 80? Restan 10 cada vez. Réstale 10 al 80.

* **Interactivo 3:** Cuidado aquí: 4, ?, 36, 108. `[Input: 12]`
  * *Feedback Acierto:* ¡Maestro de la multiplicación! 36 × 3 = 108. Entonces 4 × 3 = 12.
  * *Feedback Error:* Como los números crecen muy rápido, averigua por qué número se multiplicó el 36 para llegar a 108. Es ×3. Multiplica 4 × 3.

---

### 🧥 MÓDULO 2: COMBINATORIA VISUAL

#### 👑 Nivel 1: Diagramas de árbol y combinaciones filas × columnas

**Texto de Aprendizaje:** ¡Bienvenido al Armario de Posibilidades! La **Combinatoria** es el arte de contar cuántas opciones diferentes tienes sin tener que contarlas una por una con el dedo. Imagina que tienes 3 camisetas (Roja, Azul, Verde) y 2 pantalones (Jean, Corto). Si haces un dibujo uniendo cada camiseta con cada pantalón usando líneas, formas un **Diagrama de Árbol**. ¡Pero hay un atajo matemático increíble! El **Principio Multiplicativo**: solo tienes que contar cuántos tipos de camisetas tienes (3), cuántos tipos de pantalones (2), y multiplicarlos. ¡3 × 2 = 6 formas diferentes de vestirte!

**El Diccionario del Nivel:**

* **Combinación:** Mezclar un elemento de un grupo con un elemento de otro grupo.
* **Diagrama de Árbol:** Un mapa visual de líneas que conecta todas las opciones posibles.
* **Principio Multiplicativo:** El atajo mágico: multiplicar las cantidades de cada categoría para hallar el total.

⚠️ **¡Cuidado con la Trampa de la Suma!** El error clásico es decir: "Tengo 3 camisetas y 2 pantalones, entonces 3 + 2 = 5 combinaciones". ¡NO! Las prendas se multiplican porque por CADA camiseta, tienes 2 opciones de pantalón.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Menú de restaurante: 4 tipos de sándwiches y 3 tipos de jugos. ¿Cuántos almuerzos diferentes puedes armar?
  * *Categoría 1 (Sándwich):* 4 opciones.
  * *Categoría 2 (Jugo):* 3 opciones.
  * *Cálculo:* 4 × 3 = 12 almuerzos diferentes.

* **Ejemplo 2:** 5 colores de autos y 2 tipos de asientos (cuero o tela). ¿Cuántas versiones del auto se fabrican?
  * *Cálculo:* 5 × 2 = 10 versiones.

* **Ejemplo 3:** Una tienda vende helados con 6 sabores diferentes y puedes elegir 3 tipos de jarabe. ¿Cuántas combinaciones de 1 sabor y 1 jarabe hay?
  * *Cálculo:* 6 × 3 = 18 combinaciones.

* **Ejemplo 4:** Para un torneo, puedes elegir entre 4 personajes de fuego y 5 espadas diferentes.
  * *Cálculo:* 4 × 5 = 20 guerreros diferentes.

* **Ejemplo 5:** En un juego, lanzas una moneda (2 opciones: cara/cruz) y tiras un dado (6 opciones: 1,2,3,4,5,6). ¿Cuántos resultados distintos pueden salir?
  * *Cálculo:* 2 × 6 = 12 combinaciones.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Un cine ofrece 3 tamaños de palomitas (pequeño, mediano, grande) y 4 tipos de refrescos. ¿Cuántos combos diferentes de 1 palomita y 1 refresco puedes comprar? `[Input: 12]`
  * *Feedback Acierto:* ¡Multiplicación deliciosa! 3 tamaños × 4 bebidas = 12 opciones.
  * *Feedback Error:* No los sumes. Por cada tamaño tienes 4 opciones de bebida. Multiplica la cantidad de tamaños por la cantidad de bebidas.

* **Interactivo 2:** Tienes 5 camisetas diferentes y 4 gorras. ¿De cuántas formas distintas te puedes vestir usando una de cada una? `[Input: 20]`
  * *Feedback Acierto:* ¡Guardarropa al máximo! 5 camisetas × 4 gorras = 20 combinaciones.
  * *Feedback Error:* Usa el Principio Multiplicativo. Multiplica el número de camisetas (5) por el número de gorras (4).

* **Interactivo 3:** En una pizzería ofrecen 6 tipos de masa y 2 tipos de borde (relleno o normal). ¿Cuántas pizzas diferentes puedes pedir si solo eliges 1 masa y 1 borde? `[Input: 12]`
  * *Feedback Acierto:* ¡Chef matemático! 6 masas × 2 bordes = 12 combinaciones.
  * *Feedback Error:* Multiplica las opciones de la primera decisión (6 masas) por las opciones de la segunda decisión (2 bordes).

---

#### 👑 Nivel 2: Principio multiplicativo de 3 o más variables (Contraseñas)

**Texto de Aprendizaje:** El Principio Multiplicativo es tan poderoso que no se limita a dos cosas. ¿Qué pasa si armas un muñeco y tienes que elegir 3 categorías: cabeza, cuerpo y piernas? La regla es la misma: **multiplicas todas las categorías**. Si tienes 2 cabezas, 4 cuerpos y 3 piernas, haces 2 × 4 × 3. Primero multiplicas 2 × 4 = 8, y luego 8 × 3 = 24. Esta es la misma matemática que usan los piratas informáticos para saber cuántas contraseñas posibles existen para abrir una caja fuerte. Cada rueda de la caja es una "categoría" que se multiplica.

⚠️ **¡Cuidado con el Olvido del Cero!** Si una rueda de candado tiene los números del 0 al 9, ¡tiene 10 opciones, no 9! El cero cuenta como una opción válida.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Menú completo: 2 entradas, 3 platos principales, 2 postres.
  * *Cálculo:* 2 × 3 × 2 = 12 menús.

* **Ejemplo 2:** Armar una bicicleta: 3 marcos, 2 tipos de llantas, 4 colores.
  * *Cálculo:* 3 × 2 × 4 = 24 bicicletas.

* **Ejemplo 3:** Una maleta con candado de 3 ruedas. Cada rueda tiene números del 1 al 5.
  * *Análisis:* Rueda 1 (5 opciones). Rueda 2 (5 opciones). Rueda 3 (5 opciones).
  * *Cálculo:* 5 × 5 × 5 = 125 combinaciones posibles.

* **Ejemplo 4:** Crear un personaje de juego: 2 géneros, 5 peinados, 3 clases (mago, guerrero, arquero).
  * *Cálculo:* 2 × 5 × 3 = 30 personajes.

* **Ejemplo 5:** Vestimenta con 4 sombreros, 3 camisas, 2 pantalones y 2 pares de zapatos.
  * *Cálculo:* 4 × 3 × 2 × 2 = 48 combinaciones.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Un restaurante ofrece 3 tipos de sopa, 4 platos fuertes y 2 jugos. ¿Cuántas combinaciones de sopa, plato y jugo hay? `[Input: 24]`
  * *Feedback Acierto:* ¡Combo triple! 3 × 4 × 2 = 24 menús posibles.
  * *Feedback Error:* Multiplica las tres cantidades en cadena: 3 (sopas) × 4 (platos) × 2 (jugos).

* **Interactivo 2:** Un candado de maleta tiene 3 rueditas. Cada ruedita solo tiene los números 1, 2, 3 y 4. ¿Cuántas contraseñas distintas se pueden hacer? `[Input: 64]`
  * *Feedback Acierto:* ¡Caja fuerte hackeada! 4 × 4 × 4 = 64 combinaciones.
  * *Feedback Error:* La primera rueda tiene 4 opciones. La segunda 4. La tercera 4. Multiplica 4 × 4 × 4.

* **Interactivo 3:** En la agencia de viajes hay 5 destinos de playa, 2 tipos de hotel (lujo o económico) y 3 aerolíneas. ¿Cuántos paquetes de viaje diferentes puedes armar? `[Input: 30]`
  * *Feedback Acierto:* ¡Viaje planificado! 5 × 2 × 3 = 30 opciones.
  * *Feedback Error:* Multiplica el número de destinos (5) por el número de hoteles (2) por el número de aerolíneas (3).

---

#### 👑 Nivel 3: Combinatoria con restricciones (El espacio que se agota)

**Texto de Aprendizaje:** ¡Nivel Maestro de Combinatoria! Hasta ahora podías elegir cualquier cosa, incluso repetir (como poner un 1 en todas las ruedas del candado). Pero en la vida real hay **restricciones**. Imagina que tienes 3 sillas y 3 amigos (Ana, Beto y Carlos). Cuando Ana se sienta en la primera silla (tiene 3 sillas para elegir), ¡la silla queda ocupada! Para el siguiente amigo, **ya solo quedan 2 sillas disponibles**. Y para el último amigo, **solo queda 1 silla**. Entonces, en lugar de multiplicar 3 × 3 × 3, haces **3 × 2 × 1 = 6**. ¡Tus opciones se van agotando paso a paso! A esto se le llama calcular permutaciones sin repetición.

⚠️ **¡Cuidado con Asumir que Siempre Puedes Repetir!** Si te piden formar una bandera de 3 franjas con colores "diferentes" usando 4 colores disponibles, la primera franja tiene 4 opciones, pero la segunda solo tiene 3 (porque no puedes usar el color de la primera), y la tercera franja solo tiene 2. El cálculo correcto es 4 × 3 × 2. Leer bien la palabra "diferentes" o "sin repetir" es de vida o muerte aquí.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** 4 corredores llegan a la meta. ¿De cuántas formas pueden repartirse el oro, plata y bronce?
  * *Oro:* 4 opciones (cualquiera puede ganar).
  * *Plata:* 3 opciones (el que ganó oro ya no puede).
  * *Bronce:* 2 opciones (quedan 2 corredores).
  * *Cálculo:* 4 × 3 × 2 = 24 formas.

* **Ejemplo 2:** Formar un código de 3 cifras diferentes usando los números 1, 2, 3, 4, 5.
  * *Cifra 1:* 5 opciones. *Cifra 2:* 4 opciones. *Cifra 3:* 3 opciones.
  * *Cálculo:* 5 × 4 × 3 = 60 códigos.

* **Ejemplo 3:** Pintar una pared de 2 secciones con 5 colores, pero sin usar el mismo color dos veces.
  * *Sección 1:* 5 opciones. *Sección 2:* 4 opciones (la que sobra).
  * *Cálculo:* 5 × 4 = 20 formas.

* **Ejemplo 4:** 3 cuadros para colgar en 3 clavos.
  * *Clavo 1:* 3 opciones. *Clavo 2:* 2 opciones. *Clavo 3:* 1 opción.
  * *Cálculo:* 3 × 2 × 1 = 6 formas.

* **Ejemplo 5:** Elegir un presidente y vicepresidente en una clase de 10 alumnos.
  * *Presidente:* 10 opciones.
  * *Vicepresidente:* 9 opciones (el presidente no puede tener ambos cargos).
  * *Cálculo:* 10 × 9 = 90 formas.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Hay 5 niños y 2 sillas en un escenario. ¿De cuántas formas distintas pueden sentarse (sin que se repita un niño en las dos sillas al mismo tiempo)? `[Input: 20]`
  * *Feedback Acierto:* ¡Acomodador experto! Silla 1 = 5 niños. Silla 2 = 4 niños restantes. 5 × 4 = 20.
  * *Feedback Error:* Para la primera silla hay 5 niños disponibles. Cuando uno se sienta, quedan 4 niños para la segunda silla. Multiplica esas dos opciones.

* **Interactivo 2:** Tienes 4 colores de pintura. Vas a pintar una bandera de 3 franjas usando colores diferentes (no se pueden repetir). ¿Cuántas banderas distintas puedes pintar? `[Input: 24]`
  * *Feedback Acierto:* ¡Bandera única! Franja 1 (4 opciones) × Franja 2 (3 opciones) × Franja 3 (2 opciones). 4 × 3 × 2 = 24.
  * *Feedback Error:* La primera franja tiene 4 opciones. Como no puedes repetir, la segunda tiene 3. La tercera franja tendrá 2. Multiplica: 4 × 3 × 2.

* **Interactivo 3:** De un grupo de 6 jugadores, el entrenador va a elegir un capitán y un subcapitán. ¿De cuántas formas puede armar esa pareja líder? `[Input: 30]`
  * *Feedback Acierto:* ¡Táctica perfecta! Capitán (6 opciones) × Subcapitán (5 opciones) = 30.
  * *Feedback Error:* Para el puesto de capitán hay 6 jugadores. Una vez elegido, quedan 5 jugadores disponibles para ser subcapitán. Multiplica 6 × 5.

---

### 🎲 MÓDULO 3: PROBABILIDAD

#### 👑 Nivel 1: Clasificación de eventos (Seguro, Posible, Imposible)

**Texto de Aprendizaje:** ¡Bienvenido a la Sala del Oráculo! La **Probabilidad** es la rama de las matemáticas que estudia el futuro y el azar. Antes de calcular números, debes usar tu sentido común para clasificar qué tan probable es que ocurra un evento. Hay 3 grandes categorías: **1. Evento Seguro:** ¡Va a pasar 100% garantizado! (Ej. Sacar una bola roja de una urna donde todas las bolas son rojas). **2. Evento Imposible:** ¡No va a pasar jamás! 0% de chances (Ej. Sacar una bola azul de una urna donde todas son rojas). **3. Evento Posible (o Probable):** Puede pasar, pero no estamos seguros, depende de la suerte (Ej. Sacar una bola roja de una urna mezclada con bolas azules).

**El Diccionario del Nivel:**

* **Azar:** Suerte, aleatoriedad. No sabes qué va a salir hasta que lo intentas.
* **Evento Seguro:** Ocurre siempre.
* **Evento Imposible:** No ocurre nunca.
* **Evento Posible:** Ocurre a veces sí y a veces no.

⚠️ **¡Cuidado con la Trampa de "Casi Seguro"!** Si en una urna hay 99 bolas rojas y 1 azul, sacar una bola roja es **muy probable**, pero NO es "Seguro", porque existe una pequeña chance de que saques la azul. Para que sea "Seguro", la opción azul no puede existir.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Urna con 10 bolas verdes. ¿Sacar una verde es seguro, posible o imposible?
  * *Análisis:* Solo hay verdes adentro. No puede salir otro color.
  * *Resultado:* Seguro.

* **Ejemplo 2:** Urna con 10 bolas verdes. ¿Sacar una roja?
  * *Análisis:* No hay rojas adentro.
  * *Resultado:* Imposible.

* **Ejemplo 3:** Urna con 5 verdes y 5 rojas. ¿Sacar una roja?
  * *Análisis:* Hay rojas, pero también hay verdes. Depende del azar.
  * *Resultado:* Posible.

* **Ejemplo 4:** Lanzar un dado normal (del 1 al 6) y sacar un 7.
  * *Análisis:* El número 7 no existe en el dado.
  * *Resultado:* Imposible.

* **Ejemplo 5:** Lanzar un dado normal y sacar un número menor que 10.
  * *Análisis:* Todos los números del dado (1,2,3,4,5,6) son menores que 10.
  * *Resultado:* Seguro.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** En una bolsa hay 5 dulces de fresa y 2 de limón. ¿El evento "Sacar un dulce de menta" es seguro, posible o imposible? `[Input: Imposible]`
  * *Feedback Acierto:* ¡Lógica clara! No hay menta en la bolsa.
  * *Feedback Error:* Mira lo que hay adentro: fresa y limón. Como no hay ningún dulce de menta, jamás podrás sacar uno.

* **Interactivo 2:** Tiras una moneda al aire. ¿El evento "Que caiga Cara" es seguro, posible o imposible? `[Input: Posible]`
  * *Feedback Acierto:* ¡Exacto! Puede salir Cara, pero también puede salir Cruz. Es cuestión de suerte.
  * *Feedback Error:* Aunque puede salir Cara, no estás 100% seguro porque también podría salir Cruz. Es posible.

* **Interactivo 3:** En una caja hay 100 pelotas negras. Metes la mano sin mirar. ¿El evento "Sacar una pelota negra" es seguro, posible o imposible? `[Input: Seguro]`
  * *Feedback Acierto:* ¡Garantizado! No hay forma de que saques otro color.
  * *Feedback Error:* Como el 100% de las pelotas adentro son negras, no hay otra opción. La victoria está asegurada.

---

#### 👑 Nivel 2: Definición de Laplace (Fracciones de Probabilidad)

**Texto de Aprendizaje:** Los matemáticos no se conforman con decir "es posible"; quieren darle un número exacto a la suerte usando la **Regla de Laplace**. Para calcular tu probabilidad de ganar, debes construir una fracción matemática. Abajo (el **Denominador**), colocas el número de **Casos Posibles** (el total absoluto de cosas que hay en el juego, te sirvan o no). Arriba (el **Numerador**), colocas el número de **Casos Favorables** (solo las cosas que te hacen ganar). Si en una ruleta hay 8 espacios en total y 3 son de premio, tu probabilidad de ganar es 3/8. ¡Literalmente tienes "3 de 8" chances!

**El Diccionario del Nivel:**

* **Casos Posibles (Abajo):** El total de todas las opciones en el universo del juego.
* **Casos Favorables (Arriba):** Las opciones que te convienen para ganar la apuesta.
* **Probabilidad:** La fracción que divide Favorables entre Posibles.

⚠️ **¡Cuidado con la Trampa del Numerador como Total!** Si tienes 3 bolas rojas y 2 azules, el total no es ni 3 ni 2. El total es 5 (3+2). La probabilidad de sacar rojo NO es 3/2 (eso ni siquiera es posible en probabilidad). Es 3/5. Siempre suma todo para hallar el número de abajo.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** En una urna hay 4 bolas blancas y 6 bolas negras. ¿Probabilidad de sacar blanca?
  * *Paso 1 (Abajo - Total):* 4 blancas + 6 negras = 10 bolas totales.
  * *Paso 2 (Arriba - Favorables):* Hay 4 blancas.
  * *Resultado:* 4/10.

* **Ejemplo 2:** Lanzas un dado normal (6 caras). ¿Probabilidad de sacar un 5?
  * *Paso 1 (Abajo - Total):* El dado tiene 6 caras.
  * *Paso 2 (Arriba - Favorables):* Solo hay una cara con el número 5.
  * *Resultado:* 1/6.

* **Ejemplo 3:** Lanzas un dado normal. ¿Probabilidad de sacar un número par?
  * *Paso 1 (Abajo - Total):* 6 caras totales.
  * *Paso 2 (Arriba - Favorables):* Los números pares son 2, 4 y 6 (son 3 caras).
  * *Resultado:* 3/6 (o 1/2).

* **Ejemplo 4:** Una ruleta está dividida en 8 porciones iguales: 5 amarillas y 3 rojas. ¿Probabilidad de que la flecha caiga en amarillo?
  * *Paso 1 (Abajo - Total):* 8 porciones totales.
  * *Paso 2 (Arriba - Favorables):* 5 porciones amarillas.
  * *Resultado:* 5/8.

* **Ejemplo 5:** En una baraja de 52 cartas, ¿cuál es la probabilidad de sacar el As de Picas?
  * *Paso 1 (Abajo - Total):* 52 cartas.
  * *Paso 2 (Arriba - Favorables):* Solo hay un As de Picas en toda la baraja (1).
  * *Resultado:* 1/52.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** En una caja hay 7 lápices azules y 3 lápices rojos. Si sacas uno sin mirar, ¿cuál es la probabilidad en fracción de sacar un lápiz rojo? `[Input: 3/10]`
  * *Feedback Acierto:* ¡Regla de Laplace dominada! 3 rojos (arriba) y 10 en total (abajo).
  * *Feedback Error:* Primero suma todos los lápices para hallar el total de abajo (7 + 3 = 10). Arriba pon solo la cantidad de lápices rojos que hay.

* **Interactivo 2:** Una ruleta tiene los números del 1 al 10. ¿Cuál es la probabilidad de que la flecha caiga en el número 8? `[Input: 1/10]`
  * *Feedback Acierto:* ¡Tirada de suerte! Solo hay un número 8 entre las 10 opciones.
  * *Feedback Error:* Cuidado, el número es el 8, pero ¿cuántos "ochos" hay en la ruleta? Solo 1. Entonces la parte de arriba de tu fracción debe ser 1.

* **Interactivo 3:** En un salón hay 12 niñas y 8 niños. Si el profesor elige a un alumno al azar, ¿cuál es la probabilidad de que sea niña? `[Input: 12/20]`
  * *Feedback Acierto:* ¡Cálculo perfecto! 12 niñas (favorables) de un total de 20 alumnos (12+8).
  * *Feedback Error:* Suma todos los niños y niñas para saber cuántos alumnos hay en total (eso va abajo). Arriba pon la cantidad de niñas.

---

#### 👑 Nivel 3: Experimentos sin reposición (La realidad cambiante)

**Texto de Aprendizaje:** En el mundo real, cuando sacas un objeto de una bolsa, a veces **no lo devuelves** a la bolsa. A esto se le llama evento "Sin Reposición", ¡y hace que la probabilidad cambie dinámicamente! Si en una urna hay 5 bolas rojas y 5 azules, la probabilidad de sacar roja en tu primer intento es 5/10. Pero, ¡magia matemática!, si sacas una roja y te la guardas en el bolsillo, **ahora el universo dentro de la urna ha cambiado**. Para tu segundo intento, la cantidad de bolas totales (el número de abajo) ya no es 10, ¡es 9! Y la cantidad de bolas rojas (el número de arriba) ya no es 5, ¡es 4! El nuevo cálculo es 4/9. Debes ser muy atento a las historias que vacían el inventario.

⚠️ **¡Cuidado con la Trampa del Universo Estático!** Si la historia dice "sacó un caramelo de limón, se lo comió, y luego sacó otro", no uses el total original para calcular la segunda probabilidad. Debes restar el caramelo comido tanto de la cantidad de limones (arriba) como de la cantidad total de la bolsa (abajo).

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Hay 3 bolas rojas y 2 azules (total 5). Sacas una roja y no la devuelves. ¿Cuál es la probabilidad de que la SEGUNDA bola sea roja también?
  * *Paso 1 (Primera extracción):* El universo era 3 rojas de 5 totales. Sacaste 1 roja.
  * *Paso 2 (Actualizar Universo):* Ahora quedan 2 rojas y 2 azules. Nuevo total = 4.
  * *Resultado:* La nueva probabilidad es 2/4.

* **Ejemplo 2:** Hay 4 billetes de R$ 10 y 6 billetes de R$ 5 en una caja opaca (Total: 10 billetes). Sacas un billete de R$ 10. ¿Cuál es la probabilidad de que el segundo billete sea de R$ 5?
  * *Paso 1:* Sacaste un R$ 10. Quedan 3 de R$ 10 y 6 de R$ 5.
  * *Paso 2:* Nuevo total en caja = 9 billetes. Cantidad de R$ 5 sigue siendo 6 (no sacaste de esos).
  * *Resultado:* 6/9.

* **Ejemplo 3:** Una bolsa tiene 5 cartas (A, E, I, O, U). Sacas la 'A' y te la guardas. ¿Probabilidad de sacar una vocal fuerte (A, E, O) en el segundo intento?
  * *Paso 1:* Vocales fuertes originales: A, E, O (son 3). Pero sacaste la A. Ahora solo quedan 2 fuertes (E, O).
  * *Paso 2:* Nuevo total de cartas: 4.
  * *Resultado:* 2/4.

* **Ejemplo 4:** Caja con 10 chocolates: 8 de leche, 2 amargos. Comes un amargo. ¿Probabilidad de sacar amargo en el segundo intento?
  * *Análisis:* Quedan 1 amargo y 8 de leche. Total: 9 chocolates.
  * *Resultado:* 1/9.

* **Ejemplo 5:** Estuche con 5 marcadores negros. Prestas uno y no te lo devuelven. ¿Probabilidad de sacar negro en el siguiente intento?
  * *Análisis:* Quedan 4 negros. Todos son negros.
  * *Resultado:* 4/4 (¡Sigue siendo un evento seguro!).

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** En una nevera hay 4 latas de cola y 4 latas de naranja (Total 8). Tomas una lata de naranja y te la bebes. ¿Cuál es la probabilidad de que tu hermano, al abrir la nevera, saque otra lata de naranja? `[Input: 3/7]`
  * *Feedback Acierto:* ¡Universo actualizado! Quedaban 3 de naranja y 7 latas en total.
  * *Feedback Error:* Al beberte una de naranja, el total de latas bajó a 7. Y la cantidad de naranjas bajó a 3. Arma la nueva fracción.

* **Interactivo 2:** Hay 6 llaves en un anillo, pero solo 1 abre la puerta. Pruebas la primera llave y falla. Como ya sabes que no sirve, la apartas. ¿Cuál es la probabilidad de que la segunda llave que pruebes abra la puerta? `[Input: 1/5]`
  * *Feedback Acierto:* ¡Deducción brillante! Descartaste 1 llave mala, así que el total bajó a 5, y tu llave ganadora sigue ahí (1).
  * *Feedback Error:* Al descartar la llave que falló, el total de llaves en el anillo bajó a 5. Como no tiraste la llave correcta, sigues teniendo 1 oportunidad ganadora.

* **Interactivo 3:** En una caja hay 2 esferas de oro y 3 esferas de plata (Total 5). Robas una esfera de oro. ¿Cuál es la probabilidad en fracción de que saques una esfera de PLATA en tu segundo robo? `[Input: 3/4]`
  * *Feedback Acierto:* ¡Ladrón analítico! El total bajó a 4, pero las de plata siguen intactas (3).
  * *Feedback Error:* Robaste oro, así que el total general bajó a 4 (abajo). Pero como no robaste ninguna de plata, siguen habiendo 3 de plata (arriba).

---

## PARTE 3: DISEÑO DE SCRIPTS INYECTORES (PYTHON)

Para poblar la base de datos PostgreSQL de la Fase 8, el script `seed_fase8.py` usará reglas especiales para la generación algorítmica:

1. **Generación de Secuencias (Módulo 1):** El backend no usará datos quemados; construirá secuencias al vuelo asegurando que la Ley de Formación sea exacta.
   * `tipo: "aritmetica"`, `razon: +/- randint(2, 12)`, `inicio: randint(1, 100)`.
   * Para secuencias compuestas, generará dos listas entrelazadas y unificará sus índices.
   * Para la interpolación, la pregunta será `[A, B, '?', D, E]` guardando el valor real en `respuesta_exacta`.

2. **JSONB Estructural para Combinatoria (Módulo 2):** Se inyectarán árboles de decisión y objetos visuales.
   ```json
   {
     "tipo": "diagrama_arbol",
     "niveles": [
       {"nombre": "Camisas", "opciones": 3},
       {"nombre": "Pantalones", "opciones": 2}
     ],
     "render_ui": "drag_drop_combos"
   }
   ```

3. **Mapeo de Urnas (Módulo 3):**
   ```json
   {
     "tipo": "urna_probabilidad",
     "estado_inicial": {"bolas_rojas": 5, "bolas_azules": 3},
     "evento_intermedio": {"accion": "extraer_sin_reposicion", "color": "bolas_rojas", "cantidad": 1},
     "pregunta": {"objetivo": "bolas_rojas"}
   }
   ```

4. **120 Familias:** Cada nivel tendrá 120 familias, garantizando 1 variante original y 3 variantes espejo por familia. Las variantes espejo modificarán los datos de base (ej. cambiar las cantidades en las urnas o el número base de la secuencia) manteniendo la estructura del desafío cognitivo.

---

## PARTE 4: MAPEO DE ERRORES JSONB Y TUTOR INVISIBLE

El backend asociará los fallos a diagnósticos cognitivos precalculados en `respuestas_erroneas_jsonb`:

* **Error de Salto Falso (Módulo 1 — Secuencias):**
  * *Detonante:* El alumno aplica la diferencia del primer paso al último, ignorando que es una secuencia multiplicativa o compuesta.
  * *Tutor:* "¡El tren se descarriló! No te confíes solo de los dos primeros vagones. Si aplicas esa suma, no llegas al tercer número. Esta secuencia crece muy rápido... ¡intenta multiplicar en lugar de sumar!"

* **Error de Suma Combinatoria (Módulo 2 — Árboles):**
  * *Detonante:* El alumno suma las opciones (3 camisetas + 2 pantalones = 5) en lugar de usar el Principio Multiplicativo.
  * *Tutor:* "¡Recuerda el Principio Multiplicativo! Por cada una de tus 3 camisetas, puedes usar 2 pantalones. Para hallar el total de combos, no debes sumarlos, ¡debes multiplicarlos!"

* **Error de Universo Estático (Módulo 3 — Sin reposición):**
  * *Detonante:* El alumno usa el denominador original después de extraer un objeto.
  * *Tutor:* "¡La historia ha cambiado! Como sacaste una bola y te la quedaste, ya no hay la misma cantidad de bolas totales adentro de la urna. Réstale 1 al número de abajo antes de crear tu nueva fracción."

* **Error de Numerador/Denominador Invertido (Módulo 3):**
  * *Detonante:* El alumno escribe 10/3 en lugar de 3/10.
  * *Tutor:* "¡Fracción al revés! El número más grande (el total de TODAS las opciones posibles) siempre es el jefe pesado que va abajo (denominador). Lo que te hace ganar va arriba."

---

## PARTE 5: INTEGRACIÓN ARQUITECTÓNICA Y UX/UI

La Fase 8 introduce una estética de **"Laboratorio y Casino Matemático"**, combinando máquinas de precisión, engranajes y herramientas de sorteo:

### Estética General: "Laboratorio de Patrones"
* **Paleta cromática:** Fondos oscuros con toques de **Violeta** y **Magenta neón** (`bg-purple-900`, `text-fuchsia-400`). El violeta se asocia tradicionalmente al misterio, la magia y la predicción.
* **Componentes visuales:** Engranajes giratorios, luces que se encienden al confirmar un patrón, y contenedores de cristal tridimensionales.

### Componentes Interactivos Especializados

1. **Reparador de Secuencias (Módulo 1):**
   * Un tren o cinta transportadora con vagones o huecos.
   * El alumno tipea el número en un vagón vacío y presiona "Enganchar".
   * Si es correcto, una chispa eléctrica morada conecta los vagones. Si es incorrecto, el vagón se cae y hace cortocircuito.

2. **Probador de Combinaciones (Módulo 2):**
   * Un maniquí interactivo o máquina expendedora de 3 ranuras.
   * Diagrama de árbol dinámico al lado que se va "dibujando" a medida que el alumno selecciona opciones. El alumno ve visualmente cómo las ramas se multiplican en lugar de sumarse.

3. **Urna Física Interactiva (Módulo 3):**
   * Un cilindro de vidrio transparente con esferas de física 2D que rebotan simulando gravedad.
   * Botón de "Extraer" que dispara una pinza robótica, saca una bola y la deposita en un inventario externo, demostrando visualmente el concepto "Sin Reposición".
   * Indicador flotante en tiempo real: `Total Adentro: 9`.

4. **Input Híbrido (Fracciones en Probabilidad):**
   * Al igual que en Fase 4, la interfaz de entrada para Módulo 3 detectará el formato fracción y mostrará dos cajas de texto apiladas con la barra de división en medio, forzando visualmente a separar Favorables (arriba) de Posibles (abajo).

*(Nota: En algunas preguntas del examen Pedro II, como se vio en exámenes anteriores, la probabilidad geométrica se asocia a "áreas pintadas en grillas de centímetros cuadrados". En esta fase se reforzará el concepto numérico, y la interacción con áreas para cálculo probabilístico se inyectará como un híbrido en los Desafíos o Simulados de la Fase 9).*
