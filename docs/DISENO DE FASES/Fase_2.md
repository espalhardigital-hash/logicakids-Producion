# 🏗️ FASE 2: DESARROLLO NUMÉRICO Y RAZONAMIENTO

**Propósito:** Pasar del cálculo puramente mecánico al pensamiento numérico estructurado y abstracto.

---

# PARTE 1: DOCUMENTO DE DISEÑO LÓGICO

La **Fase 2: Desarrollo Numérico y Razonamiento** está diseñada para alumnos de aproximadamente 10 años, con el objetivo de consolidar su agilidad operativa y transicionar hacia el pensamiento algebraico y resolución de problemas cotidianos de la vida real.

## 🗺️ Mapa de la Fase 2: Estructura de Módulos y Niveles

```
================================================================================
[FASE 2: DESARROLLO NUMÉRICO Y RAZONAMIENTO]
================================================================================
 │
 ├── [MÓDULO 1: Gimnasio Numérico Mental] -> Tema: Escalas, relaciones distributivas y jerarquía.
 │    ├── Nivel 1: Conceptos de doble, triple, mitad y cuádruple (Visual, guiado, input numérico, sin tiempo)
 │    ├── Nivel 2: Prioridad algebraica: orden de operaciones y uso de paréntesis (Prioridad algebraica, sin tiempo)
 │    ├── Nivel 3: Traducción del lenguaje verbal a expresiones numéricas abstractas (Circuito mixto, Bucle Espejo)
 │    │
 │    ├── DESAFÍO 1: Operaciones lineales (Opción múltiple, lineal, 25s/Q, Early Exit al 3er error)
 │    ├── DESAFÍO 2: Jerarquía avanzada (Opción múltiple, jerarquía avanzada, 40s/Q, Early Exit al 3er error)
 │    └── DESAFÍO FINAL: Evocación pura (Evocación pura, input vacío, 50s/Q, requiere ≥90%, Early Exit al 2do error)
 │
 ├── [MÓDULO 2: Tablas en Acción] -> Tema: Ecuaciones de un paso y operaciones inversas.
 │    ├── Nivel 1: Operación Inversa - Suma y Resta (Camino de regreso aditivo, sin tiempo)
 │    ├── Nivel 2: Operación Inversa - Multiplicación y División (Espejos multiplicativos, sin tiempo)
 │    ├── Nivel 3: El Número Faltante (Despeje del espacio vacío, ecuación de un paso, sin tiempo)
 │    ├── Nivel 4: Gran Integración (Cambio de velocidades operacionales, Bucle Espejo)
 │    │
 │    ├── DESAFÍO 1: Inversa directa (Opción múltiple, inversa directa, 25s/Q, Early Exit al 3er error)
 │    ├── DESAFÍO 2: Incógnitas complejas (Opción múltiple, incógnitas complejas, 40s/Q, Early Exit al 3er error)
 │    └── DESAFÍO FINAL: Evocación pura (Evocación pura, input vacío, 50s/Q, requiere ≥90%, Early Exit al 2do error)
 │
 ├── [MÓDULO 3: Tienda Matemática] -> Tema: Sistema monetario, presupuestos y decimales amigables.
 │    ├── Nivel 1: Reconozco el Dinero (Agrupación de centavos amigables (,00, ,25, ,50, ,75), sin tiempo)
 │    ├── Nivel 2: Pago y Cambio (Cálculo intuitivo del vuelto desglosado, sin tiempo)
 │    ├── Nivel 3: Carrito de Compras (Sumas multiobjeto consolidando reales extra, sin tiempo)
 │    ├── Nivel 4: Comprador Inteligente (Decisión de presupuesto: alcanza o falta, Bucle Espejo)
 │    │
 │    ├── DESAFÍO 1: Conteo y vuelto simple (Opción múltiple, conteo y vuelto simple, 25s/Q, Early Exit al 3er error)
 │    ├── DESAFÍO 2: La Trampa Financiera (Opción múltiple, carritos y balances cruzados, 40s/Q, Early Exit al 3er error)
 │    └── DESAFÍO FINAL: Evocación pura decimal (Evocación pura, input flotante vacío, 50s/Q, requiere ≥90%, Early Exit al 2do error)
 │
 └── [MÓDULO 4: Constructor de Soluciones] -> Tema: Encadenamiento y problemas multi-paso simples.
      ├── Nivel 1: Problemas de Dos Pasos Guiados (Diagrama de flujo guiado, sin tiempo)
      ├── Nivel 2: Encadenamiento de Resultados (Ecuaciones en cadena secuenciales, sin tiempo)
      ├── Nivel 3: Minimización de Error de Arrastre (Auto-verificación activa, Bucle Espejo)
      │
      ├── DESAFÍO 1: Problema estándar (Opción múltiple, 25s/Q, Early Exit al 3er error)
      ├── DESAFÍO 2: Trampa intermedia (Opción múltiple, 40s/Q, Early Exit al 3er error)
      └── DESAFÍO FINAL: Resolución libre (Evocación pura, 50s/Q, requiere ≥90%, Early Exit al 2do error para desbloquear Fase 3)
```

## ⏱️ Zona de Evaluación: Reglas y Tiempos de los Desafíos

Al terminar los niveles de práctica libre, cada módulo se cierra con la **Zona de Desafíos**. Aquí se elimina por completo la red de seguridad del Bucle Espejo y del Bloque de Rescate, exigiéndose velocidad de procesamiento y precisión.

| Componente | Dificultad | Interfaz | Cantidad Preguntas | Temporizador | Regla de Cierre (Early Exit) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Desafío 1** | Estándar | Opción Múltiple | 25 | **25 segundos** / pregunta | Expulsión al **3er error** |
| **Desafío 2** | Avanzada | Opción Múltiple | 25 | **40 segundos** / pregunta | Expulsión al **3er error** |
| **Desafío Final** | Maestría | Evocación Pura (`input`) | 10 | **50 segundos** / pregunta | Expulsión al **2do error** |

*   **Puntaje Mínimo de Aprobación:** **90%** (23/25 en Desafío 1 y 2; 9/10 en el Desafío Final).
*   **Regla de Expulsión Rápida (Early Exit):** El servidor aborta la sesión de inmediato cuando el alumno comete más errores de los tolerados pedagógicamente (3er error para sesiones de 25 preguntas; 2do error para sesiones de 10 preguntas), redirigiéndolo a repasar.

---

# PARTE 2: GUION DE TEXTOS DE APRENDIZAJE Y EVOCACIÓN

Para cada nivel de aprendizaje, se definen a continuación de manera rigurosa todos los componentes obligatorios de entrega estática en base de datos.

---

## 🧠 MÓDULO 1: GIMNASIO NUMÉRICO MENTAL

### 👑 Nivel 1: Conceptos de doble, triple, mitad y cuádruple

*   **Texto de Descubrimiento (Superpoder):** ¡Hola, atleta de la mente! Bienvenido al Gimnasio Numérico. Hoy vas a entrenar tus músculos lógicos con los **Multiplicadores de Tamaño**. Cuando doblas, triplicas o cuadruplicas un número, estás usando un rayo de crecimiento matemático. Si lo partes a la mitad, usas un rayo reductor.
*   **El Diccionario del Nivel:**
    *   **El Doble:** Multiplica por 2 (× 2).
    *   **El Triple:** Multiplica por 3 (× 3).
    *   **La Mitad:** Divide entre 2 (÷ 2).
    *   **El Cuádruple:** Multiplica por 4 (× 4).
*   **⚠️ ¡Cuidado con la Trampa del Apuro!** El monstruo del desorden quiere que sumes en lugar de multiplicar. Si te piden el triple de 4, la trampa es hacer 4 + 3 = 7. ¡Error! El triple significa tres veces el mismo número: 4 × 3 = 12.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Hallar el triple de 6.
        *   *Paso 1:* Traducimos "el triple" como multiplicar por 3 (× 3).
        *   *Paso 2:* Realizamos la operación: 6 × 3 = 18.
    *   *Ejemplo 2:* Hallar la mitad de 10.
        *   *Paso 1:* Traducimos "la mitad" como dividir entre 2 (÷ 2).
        *   *Paso 2:* Realizamos la operación: 10 ÷ 2 = 5.
*   **⚡ Interactivo 1:** Tengo 6 tazos coleccionables en mi cajón y mi hermano tiene el doble. ¿Cuántos tazos tiene mi hermano? `[ Input ]` *(Respuesta: 12)*
    *   *Feedback Acierto:* ¡Excelente! El doble de 6 es 6 × 2 = 12. ¡Tu hermano tiene un buen arsenal!
    *   *Feedback Error:* Piénsalo mejor. "El doble" significa multiplicar por 2. Haz 6 × 2, no sumes 6 + 2.
*   **🧠 Interactivo 2:** Sofía preparó 16 panqués y se comió la mitad con sus amigos. ¿Cuántos panqués quedan? `[ Input ]` *(Respuesta: 8)*
    *   *Feedback Acierto:* ¡Correcto! La mitad de 16 es 16 ÷ 2 = 8. ¡Delicioso entrenamiento!
    *   *Feedback Error:* Inténtalo de nuevo. "La mitad" significa partir el número en 2 partes iguales (dividir entre 2). Calcula 16 ÷ 2.
*   **🎯 Interactivo 3:** En un árbol hay 5 pájaros, pero en el tejado hay el cuádruple. ¿Cuántos pájaros hay en el tejado? `[ Input ]` *(Respuesta: 20)*
    *   *Feedback Acierto:* ¡Increíble! El cuádruple de 5 es 5 × 4 = 20. ¡Un gran tejado de aves!
    *   *Feedback Error:* ¡Cuidado con la trampa! "El cuádruple" significa multiplicar por 4. Haz 5 × 4, no sumes 5 + 4.

---

### 👑 Nivel 2: Prioridad algebraica: orden de operaciones y uso de paréntesis

*   **Texto de Descubrimiento (Superpoder):** ¡Atención! Los números tienen reglas de oro y jerarquías como los caballeros antiguos. En una fila de operaciones matemáticas, **la multiplicación y la división siempre se resuelven antes que la suma y la resta**. Pero hay un escudo mágico supremo: **Los Paréntesis ( )**. Cualquier operación atrapada dentro de un paréntesis se resuelve primero, sin importar qué símbolo sea.
*   **El Diccionario del Nivel:**
    *   **Jerarquía Mayor:** Primero multiplicaciones (×) y divisiones (÷).
    *   **Jerarquía Menor:** Después sumas (+) y restas (-).
    *   **Poder Absoluto:** Los paréntesis `( )` obligan a resolver lo que está dentro antes que cualquier otra cosa.
*   **⚠️ ¡Cuidado con la Trampa de Leer de Corrido!** Si ves 3 + 2 × 5, la tentación es leer de izquierda a derecha: 3 + 2 = 5, y luego 5 × 5 = 25. ¡Error! La multiplicación exige prioridad: primero calculas 2 × 5 = 10 y luego sumas el 3: 3 + 10 = 13.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Resolver 8 + 4 ÷ 2.
        *   *Paso 1:* Identificamos que la división (÷) tiene mayor prioridad que la suma (+).
        *   *Paso 2:* Resolvemos primero la división: 4 ÷ 2 = 2.
        *   *Paso 3:* Sumamos el resultado al primer número: 8 + 2 = 10.
    *   *Ejemplo 2:* Resolver (4 + 6) × 3.
        *   *Paso 1:* Identificamos que el paréntesis `( )` tiene poder absoluto.
        *   *Paso 2:* Resolvemos primero lo de adentro: 4 + 6 = 10.
        *   *Paso 3:* Multiplicamos el resultado: 10 × 3 = 30.
*   **⚡ Interactivo 1:** Resuelve respetando la prioridad: 5 + 4 × 2 = `[ Input ]` *(Respuesta: 13)*
    *   *Feedback Acierto:* ¡Brillante! Calculaste primero 4 × 2 = 8 y luego sumaste 5 para obtener 13.
    *   *Feedback Error:* ¡Piénsalo mejor! No leas de corrido. La multiplicación va primero: calcula 4 × 2 y luego súmale 5.
*   **🧠 Interactivo 2:** Los paréntesis tienen el poder absoluto. Resuelve: (5 + 4) × 2 = `[ Input ]` *(Respuesta: 18)*
    *   *Feedback Acierto:* ¡Impresionante! El paréntesis protegió la suma. Resolviste 5 + 4 = 9 y luego multiplicaste por 2 para obtener 18.
    *   *Feedback Error:* Recuerda que el paréntesis rompe la regla normal. Resuelve primero la suma dentro de `(5 + 4)` y ese resultado multiplícalo por 2.
*   **🎯 Interactivo 3:** Resuelve con calma: 20 - 10 ÷ 2 = `[ Input ]` *(Respuesta: 15)*
    *   *Feedback Acierto:* ¡Perfecto! Resolviste la división 10 ÷ 2 = 5 primero, y luego hiciste 20 - 5 = 15.
    *   *Feedback Error:* ¡Cuidado con el impulso! La división se hace primero. Calcula 10 ÷ 2 y luego réstalo de 20.

---

### 👑 Nivel 3: Traducción del lenguaje verbal a expresiones numéricas abstractas

*   **Texto de Descubrimiento (Superpoder):** ¡Te has convertido en un traductor de élite! Las historias humanas están llenas de palabras que esconden fórmulas matemáticas abstractas. Tu misión es leer el enunciado, identificar la operación y ordenarla usando paréntesis si es necesario.
*   **El Diccionario del Nivel:**
    *   **"La suma de A y B multiplicada por C":** Se traduce como `(A + B) × C`.
    *   **"El triple de la diferencia entre A y B":** Se traduce como `3 × (A - B)`.
    *   **"A la mitad de A sumarle B":** Se traduce como `(A ÷ 2) + B`.
*   **⚠️ ¡Cuidado con la Trampa de los Cables Cruzados!** Si la historia dice: "A la suma de 3 y 4 multiplícala por 2", no debes escribir 3 + 4 × 2 porque la multiplicación se comería al 4 primero. Tienes que proteger la suma con un paréntesis: (3 + 4) × 2.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Traducir y resolver: "El doble de la suma de 3 y 5".
        *   *Paso 1:* La suma de 3 y 5 se escribe `(3 + 5)`.
        *   *Paso 2:* "El doble" significa multiplicar por 2: `2 × (3 + 5)`.
        *   *Paso 3:* Resolvemos el paréntesis: 3 + 5 = 8.
        *   *Paso 4:* Multiplicamos: 2 × 8 = 16.
*   **⚡ Interactivo 1:** Traduce y resuelve: "El triple de la suma de 2 y 3". `[ Input ]` *(Respuesta: 15)*
    *   *Feedback Acierto:* ¡Qué gran traducción! Sumaste primero 2 + 3 = 5, y luego lo triplicaste: 5 × 3 = 15.
    *   *Feedback Error:* ¡Atención! Primero debes sumar 2 + 3. Protege esa suma en tu mente para resolverla antes de triplicarla (multiplicar por 3).
*   **🧠 Interactivo 2:** Traduce y resuelve: "A 20 le resto la mitad de 8". `[ Input ]` *(Respuesta: 16)*
    *   *Feedback Acierto:* ¡Excelente! Calculaste la mitad de 8 que es 4, y luego restaste: 20 - 4 = 16.
    *   *Feedback Error:* Piénsalo paso a paso. Primero encuentra la mitad de 8 (dividendo entre 2) y luego réstale ese valor a 20.
*   **🎯 Interactivo 3:** Traduce y resuelve: "El doble de 10, y al resultado le sumo 5". `[ Input ]` *(Respuesta: 25)*
    *   *Feedback Acierto:* ¡Lo lograste! El doble de 10 es 20, y al sumarle 5 resulta 25.
    *   *Feedback Error:* Sigue el orden de la lectura. Calcula el doble de 10 (10 × 2) y al número obtenido súmale 5.

---

## 🔄 MÓDULO 2: TABLAS EN ACCIÓN

### 👑 Nivel 1: Operación Inversa - Suma y Resta

*   **Texto de Descubrimiento (Superpoder):** ¡Bienvenido al mundo al revés! Hoy vas a aprender el superpoder del **Camino de Regreso**. Si una máquina matemática le sumó un número a tu inventario secreto y quieres descubrir cuál era tu número original, solo debes viajar hacia atrás aplicando una **Resta**. La resta destruye a la suma, y la suma destruye a la resta.
*   **El Diccionario del Nivel:**
    *   **Inverso de la Suma (+):** La Resta (-).
    *   **Inverso de la Resta (-):** La Suma (+).
    *   **Cruzar el Igual (=):** Para pasar un número al otro lado de la balanza, debes cambiar su símbolo al opuesto.
*   **⚠️ ¡Cuidado con la Trampa de la Balanza Desequilibrada!** Si ves que un número sumaba al lado de tu incógnita, no lo pases al otro lado sumando también. Romperías el equilibrio. Para cruzar la frontera del igual (=), debe cambiar de bando usando su operación contraria.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Si X + 6 = 14, hallar X.
        *   *Paso 1:* El 6 está sumando a la X.
        *   *Paso 2:* Para despejar X, pasamos el 6 restando al otro lado del igual: X = 14 - 6.
        *   *Paso 3:* Resolvemos: X = 8.
*   **⚡ Interactivo 1:** Un número misterioso se junta con 5 y el resultado final es 12. ¿Cuál es el número misterioso? `[ Input ]` *(Respuesta: 7)*
    *   *Feedback Acierto:* ¡Correcto! Viajaste de regreso haciendo 12 - 5 = 7. ¡Cazaste al número!
    *   *Feedback Error:* Deshaz la suma. Si al número se le sumó 5 para llegar a 12, haz el camino de vuelta: resta 12 - 5.
*   **🧠 Interactivo 2:** A un cofre con gemas le roban 4 y quedan 10 gemas dentro. ¿Cuántas gemas tenía el cofre al inicio? `[ Input ]` *(Respuesta: 14)*
    *   *Feedback Acierto:* ¡Exacto! Si le robaron (restaron) 4 y quedaron 10, recuperas el inicio sumando: 10 + 4 = 14.
    *   *Feedback Error:* Aplica la operación inversa. El robo es una resta. Para volver al total inicial, suma las gemas que quedan más las que se llevaron (10 + 4).
*   **🎯 Interactivo 3:** Resuelve el regreso: Si X - 8 = 2, entonces X vale... `[ Input ]` *(Respuesta: 10)*
    *   *Feedback Acierto:* ¡Excelente balance! Pasaste el 8 sumando al otro lado del igual: X = 2 + 8 = 10.
    *   *Feedback Error:* Recuerda que para cruzar la frontera del igual, el -8 debe cambiar al inverso: +8. Calcula X = 2 + 8.

---

### 👑 Nivel 2: Operación Inversa - Multiplicación y División

*   **Texto de Descubrimiento (Superpoder):** ¡Subimos la velocidad! Ahora la máquina misteriosa multiplica y divide en secreto. Si un número fue multiplicado por 3 para crecer, el camino de regreso para rescatar al número original es **Dividir entre 3**. La multiplicación y la división son espejos perfectos: una arma grupos y la otra los desarma.
*   **El Diccionario del Nivel:**
    *   **Inverso de la Multiplicación (×):** La División (÷).
    *   **Inverso de la División (÷):** La Multiplicación (×).
*   **⚠️ ¡Cuidado con la Trampa del Espejo Roto!** Si te dicen que el triple de un número es 15, no multipliques 15 × 3 = 45. Estarías haciendo crecer el número dos veces. Usa el espejo inverso: divide 15 ÷ 3 = 5.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Si 4 × Y = 32, hallar Y.
        *   *Paso 1:* El 4 está multiplicando a la Y.
        *   *Paso 2:* Usamos el espejo inverso: pasamos el 4 dividiendo al otro lado del igual: Y = 32 ÷ 4.
        *   *Paso 3:* Resolvemos: Y = 8.
*   **⚡ Interactivo 1:** El doble de mi edad actual da como resultado 20 años. ¿Cuántos años tengo? `[ Input ]` *(Respuesta: 10)*
    *   *Feedback Acierto:* ¡Genial! Desarmaste el doble dividiendo 20 ÷ 2 = 10. ¡Esa es mi edad!
    *   *Feedback Error:* ¡Piénsalo! Si el doble de tu edad es 20, debes hacer lo contrario de duplicar (dividir entre 2). Calcula 20 ÷ 2.
*   **🧠 Interactivo 2:** Repartí mis estampas entre 4 amigos en partes iguales y a cada uno le tocaron 5. ¿Cuántas estampas tenía yo al principio? `[ Input ]` *(Respuesta: 20)*
    *   *Feedback Acierto:* ¡Espectacular! Si repartir es dividir, la inversa es multiplicar: 5 estampas × 4 amigos = 20 estampas.
    *   *Feedback Error:* La división se revierte multiplicando. Si dividiste tus estampas entre 4 y dio 5, multiplica 5 × 4 para recuperar tu total original.
*   **🎯 Interactivo 3:** Resuelve el espejo: Si 3 × Y = 18, entonces Y vale... `[ Input ]` *(Respuesta: 6)*
    *   *Feedback Acierto:* ¡Perfecto! Despejaste la Y dividiendo 18 entre 3. Y = 6.
    *   *Feedback Error:* Para dejar sola a la Y, el 3 que multiplica debe pasar al otro bando dividiendo. Resuelve 18 ÷ 3.

---

### 👑 Nivel 3: El Número Faltante

*   **Texto de Descubrimiento (Superpoder):** ¡Es hora de convertirte en un cazador de espacios vacíos! En este nivel, las ecuaciones se presentan como un reto de casillas en blanco. Verás un espacio desierto `[ ]` o una incógnita pura mezclada en cualquier posición de la operación. Tu trabajo es mantener la balanza equilibrada despejando el espacio vacío.
*   **El Diccionario del Nivel:**
    *   **Balanza Equilibrada:** Lo que está a la izquierda del igual (=) debe valer exactamente lo mismo que lo que está a la derecha.
    *   **Despejar `[ ]`:** Mover los números al otro lado de la balanza aplicando operaciones inversas hasta que la casilla vacía quede sola.
*   **⚠️ ¡Cuidado con la Trampa del Espacio Cambiado!** Si ves 15 - [ ] = 10, ten cuidado con sumar 15 + 10. Piensa de forma intuitiva: a 15 le tienes que quitar algo para que se convierta en 10. El espacio faltante se calcula restando 15 - 10 = 5.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Hallar el espacio vacío: `12 - [ ] = 8`.
        *   *Paso 1:* Razonamos de forma intuitiva: ¿Qué le resto a 12 para obtener 8?
        *   *Paso 2:* La operación correcta para averiguar la diferencia es restar el resultado del total original: 12 - 8.
        *   *Paso 3:* Obtenemos 4. Verificamos: 12 - 4 = 8.
*   **⚡ Interactivo 1:** Completa el espacio faltante: 8 + [ ] = 20 `[ Input ]` *(Respuesta: 12)*
    *   *Feedback Acierto:* ¡Conseguido! Restaste 20 - 8 para encontrar que faltaba 12.
    *   *Feedback Error:* Piensa en la balanza: 8 más un número da 20. Usa la inversa de la suma: resta 20 - 8 para hallar el valor.
*   **🧠 Interactivo 2:** Completa el espacio faltante: [ ] ÷ 3 = 6 `[ Input ]` *(Respuesta: 18)*
    *   *Feedback Acierto:* ¡Brillante! Multiplicaste 6 × 3 = 18 para descubrir el número que al dividirse da 6.
    *   *Feedback Error:* Un número al dividirse entre 3 da 6. Aplica la inversa de la división: multiplica 6 × 3 para saber cuál es.
*   **🎯 Interactivo 3:** Completa el espacio faltante: 25 - [ ] = 15 `[ Input ]` *(Respuesta: 10)*
    *   *Feedback Acierto:* ¡Lo tienes! A 25 le quitas 10 para llegar a 15. Calculaste 25 - 15 = 10.
    *   *Feedback Error:* ¡Alerta de trampa! Si haces 25 + 15 = 40, al ponerlo en la ecuación diría 25 - 40 = 15, lo cual está mal. Resta 25 - 15 para saber qué le falta quitar.

---

### 👑 Nivel 4: Gran Integración

*   **Texto de Descubrimiento (Superpoder):** ¡Felicidades, estratega! Has unificado tus conocimientos de operaciones inversas. En este nivel de máxima velocidad operacional, el servidor barajará incógnitas aditivas y multiplicativas al azar. Tendrás que cambiar tu chip mental en milisegundos para decidir si regresas sumando, restando, multiplicando o dividiendo.
*   **El Diccionario del Nivel:**
    *   **Estrategia Unificada:**
        *   Si el número suma $\rightarrow$ pasa restando.
        *   Si el número resta $\rightarrow$ pasa sumando.
        *   Si el número multiplica $\rightarrow$ pasa dividiendo.
        *   Si el número divide $\rightarrow$ pasa multiplicando.
*   **⚠️ ¡Cuidado con la Trampa del Cruce de Cables!** No apliques una resta para deshacer una división, ni uses una división para deshacer una resta. Mira fijamente el símbolo original de la balanza antes de ejecutar el contraataque matemático.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Resolver para X: 2 × X + 3 = 11.
        *   *Paso 1:* Deshacemos primero la operación de jerarquía menor (la suma). Pasamos el +3 restando: 2 × X = 11 - 3 $\rightarrow$ 2 × X = 8.
        *   *Paso 2:* Ahora deshacemos la multiplicación. Pasamos el 2 dividiendo: X = 8 ÷ 2.
        *   *Paso 3:* Resolvemos: X = 4.
*   **⚡ Interactivo 1:** Resuelve la incógnita: X + 14 = 30 `[ Input ]` *(Respuesta: 16)*
    *   *Feedback Acierto:* ¡Excelente! Aplicaste la resta inversa: 30 - 14 = 16.
    *   *Feedback Error:* La suma se deshace restando. Resta 14 al número 30 para despejar X.
*   **🧠 Interactivo 2:** Resuelve la incógnita: 4 × Z = 32 `[ Input ]` *(Respuesta: 8)*
    *   *Feedback Acierto:* ¡Así se hace! La multiplicación se deshizo dividiendo 32 ÷ 4 = 8.
    *   *Feedback Error:* El 4 multiplica a Z. Pásalo al otro lado dividiendo: calcula Z = 32 ÷ 4.
*   **🎯 Interactivo 3:** Resuelve la incógnita: Y - 9 = 11 `[ Input ]` *(Respuesta: 20)*
    *   *Feedback Acierto:* ¡Fantástico! La resta se deshizo sumando: 11 + 9 = 20.
    *   *Feedback Error:* Como el 9 estaba restando, pasa al otro lado sumando. Calcula Y = 11 + 9.

---

## 🛒 MÓDULO 3: TIENDA MATEMÁTICA

*(Restricción estricta de punto decimal monetario: finales en ,00, ,25, ,50 y ,75).*

### 👑 Nivel 1: Reconozco el Dinero

*   **Texto de Descubrimiento (Superpoder):** ¡Bienvenido a la Tienda de Logicakids! Hoy te damos tu billetera oficial de entrenamiento. Para que manejar dinero sea súper fácil, los centavos están agrupados en bloques mágicos y limpios: 0,25, 0,50, 0,75 y el peso completo ,00. Piensa en los centavos como piezas de un rompecabezas: cuatro piezas de 0,25 arman un peso entero.
*   **El Diccionario del Nivel:**
    *   **1 moneda de 0,25:** 25 centavos.
    *   **1 moneda de 0,50:** 50 centavos (o dos de 0,25).
    *   **1 moneda de 0,75:** 75 centavos (o tres de 0,25).
    *   **1,00 peso:** 100 centavos (cuatro de 0,25 o dos de 0,50).
*   **⚠️ ¡Cuidado con la Trampa del Centavo Flotante!** No te asustes al ver la coma decimal. Leer 1,50 es exactamente igual a decir: "Tengo un peso entero con una moneda de cincuenta centavos".
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* ¿Cuánto dinero suman 3 monedas de 0,50?
        *   *Paso 1:* Dos monedas de 0,50 forman un peso entero (1,00).
        *   *Paso 2:* Agregamos la tercera moneda de 0,50.
        *   *Paso 3:* Obtenemos en total 1,50 pesos.
*   **⚡ Interactivo 1:** Si tengo dos monedas de 0,50 centavos, ¿cuántos pesos enteros he acumulado? `[ Input ]` *(Respuesta: 1)*
    *   *Feedback Acierto:* ¡Muy bien! 0,50 + 0,50 es igual a 1,00 peso completo.
    *   *Feedback Error:* Recuerda que dos monedas de 50 centavos forman 100 centavos, lo que equivale a 1 peso entero. La respuesta es 1.
*   **🧠 Interactivo 2:** ¿Cuánto dinero tengo en total si junto un billete de 5,00 pesos y una moneda de 0,25 centavos? `[ Input ]` *(Respuesta: 5,25)*
    *   *Feedback Acierto:* ¡Excelente! Sumaste el entero con los centavos para obtener 5,25 pesos.
    *   *Feedback Error:* Solo junta la parte entera con los centavos: escribe la suma del billete de 5 y la moneda de 0,25, que se representa como 5,25.
*   **🎯 Interactivo 3:** Si tengo tres monedas de 0,25 centavos, ¿cuántos centavos tengo en total en formato decimal? `[ Input ]` *(Respuesta: 0,75)*
    *   *Feedback Acierto:* ¡Gran conteo! 0,25 + 0,25 + 0,25 = 0,75 centavos.
    *   *Feedback Error:* Suma tres veces 25 centavos: 25 + 25 = 50, y 50 + 25 = 75 centavos. Escríbelo como 0,75.

---

### 👑 Nivel 2: Pago y Cambio

*   **Texto de Descubrimiento (Superpoder):** ¡Eres el cajero oficial! Cuando un cliente compra un juguete, te pagará con un billete más grande que el precio. Tu misión es calcular el **Vuelto o Cambio** restando el precio del artículo del dinero recibido.
*   **El Diccionario del Nivel:**
    *   **Vuelto (Cambio):** Dinero Recibido - Precio del Artículo.
    *   **Regla de Resta Decimal:** Resta centavos con centavos y pesos con pesos. Si los centavos del precio son mayores, pide prestado 1 peso (100 centavos) al entero.
*   **⚠️ ¡Cuidado con la Trampa del Vuelto Mocho!** Si un chocolate cuesta 0,75 centavos y te pagan con un peso entero (1,00), no digas que el vuelto es 0,35. Recuerda que un peso se compone de 100 centavos, por lo que 100 - 75 = 25. El vuelto limpio es 0,25.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Pagas con un billete de 5,00 por un juguete de 3,50. ¿Cuánto vuelto recibes?
        *   *Paso 1:* Convertimos los pesos a centavos para no equivocarnos: 5,00 son 500 centavos y 3,50 son 350 centavos.
        *   *Paso 2:* Restamos los centavos: 500 - 350 = 150 centavos.
        *   *Paso 3:* Convertimos de vuelta a decimal: 1,50 pesos.
*   **⚡ Interactivo 1:** Compro una paleta que cuesta 1,50 pesos y pago con un billete de 2,00 pesos. ¿Cuánto cambio recibo? `[ Input ]` *(Respuesta: 0,50)*
    *   *Feedback Acierto:* ¡Exacto! 2,00 - 1,50 = 0,50 pesos de vuelto. ¡Cambio justo!
    *   *Feedback Error:* Resta el precio de 1,50 al billete de 2,00. Piensa en cuántos centavos le faltan a 50 para llegar a 100 (un peso): la respuesta es 0,50.
*   **🧠 Interactivo 2:** Un juguete cuesta 3,00 pesos. El cliente me paga con un billete de 5,00 pesos. ¿Cuánto vuelto debo regresarle? `[ Input ]` *(Respuesta: 2,00)*
    *   *Feedback Acierto:* ¡Muy bien! 5,00 - 3,00 = 2,00 pesos. ¡Transacción completada!
    *   *Feedback Error:* Esta es una resta directa de enteros: resta 5 - 3 y exprésalo en formato de dinero con coma (2,00).
*   **🎯 Interactivo 3:** Compro un cuaderno de 4,25 pesos y pago con un billete limpio de 5,00 pesos. ¿Cuánto es mi vuelto exacto? `[ Input ]` *(Respuesta: 0,75)*
    *   *Feedback Acierto:* ¡Brillante cajero! 5,00 - 4,25 = 0,75 centavos de vuelto.
    *   *Feedback Error:* Pide prestado 1 peso al billete de 5,00 para convertirlo en 100 centavos. Resta 100 centavos menos 25 centavos = 75 centavos. Escríbelo como 0,75.

---

### 👑 Nivel 3: Carrito de Compras

*   **Texto de Descubrimiento (Superpoder):** ¡Hora de llenar el carrito! Vas a combinar múltiples artículos. Junta los pesos con los pesos y los bloques de centavos con sus bloques hermanos. ¡Si tus centavos suman 100, se convierten automáticamente en un peso extra!
*   **El Diccionario del Nivel:**
    *   **Suma de Precios:**
        1.  Suma las partes enteras (pesos).
        2.  Suma los centavos.
        3.  Si los centavos dan 100 o más, sumas 1,00 al entero y restas 100 a los centavos.
*   **⚠️ ¡Cuidado con la Trampa del Centavo Escondido!** Si sumas un artículo de 1,50 y otro de 2,50, no escribas 3,100. Suma los centavos: 50 + 50 = 100 centavos (1 peso). Ahora suma todo: 1 + 2 + 1 (extra) = 4,00 pesos.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Sumar en el carrito: un jugo de 2,75 y unas papas de 1,50.
        *   *Paso 1:* Sumamos los pesos: 2 + 1 = 3 pesos.
        *   *Paso 2:* Sumamos los centavos: 75 + 50 = 125 centavos.
        *   *Paso 3:* Como 125 centavos supera 100, formamos 1 peso extra y nos quedan 25 centavos.
        *   *Paso 4:* Consolidamos la cuenta: 3 pesos + 1 peso (extra) = 4 pesos con 25 centavos. Escribimos 4,25.
*   **⚡ Interactivo 1:** Llevo al carrito un jugo de 1,25 pesos y unas galletas de 1,25 pesos. ¿Cuánto pagaré en total? `[ Input ]` *(Respuesta: 2,50)*
    *   *Feedback Acierto:* ¡Excelente! 1,25 + 1,25 = 2,50 pesos. ¡Una merienda económica!
    *   *Feedback Error:* Suma por partes: 1 peso + 1 peso = 2 pesos. Luego los centavos: 25 + 25 = 50 centavos. Juntos forman 2,50.
*   **🧠 Interactivo 2:** Sumo a mi cuenta un helado de 2,75 pesos y un chicle de 0,25 centavos. ¿Cuál es el costo total? `[ Input ]` *(Respuesta: 3,00)*
    *   *Feedback Acierto:* ¡Brillante! Sumaste 75 centavos y 25 centavos para formar 100 centavos (1 peso entero), que sumado a los 2 del helado da 3,00 pesos.
    *   *Feedback Error:* ¡Cuidado con los centavos! 75 + 25 suman 100 centavos, lo que equivale a 1 peso extra. Suma ese peso a los 2 del helado. Escribe 3,00.
*   **🎯 Interactivo 3:** En mi carrito hay un cómic de 5,50 pesos y un lápiz de 1,50 pesos. ¿Cuánto marca la caja registradora? `[ Input ]` *(Respuesta: 7,00)*
    *   *Feedback Acierto:* ¡Perfecto! 5,50 + 1,50 = 7,00 pesos. ¡A leer y escribir!
    *   *Feedback Error:* Suma los enteros: 5 + 1 = 6. Luego suma los centavos: 50 + 50 = 100 centavos (1 peso). Une todo: 6 + 1 = 7,00.

---

### 👑 Nivel 4: Comprador Inteligente

*   **Texto de Descubrimiento (Superpoder):** ¡Has sido promovido a Gerente de Presupuesto! Compara el dinero que llevas con el costo de tu carrito antes de pagar para determinar si el dinero **te alcanza** o calcular exactamente **cuánto te falta**.
*   **El Diccionario del Nivel:**
    *   **¿Alcanza?:**
        *   Si Dinero Llevado ≥ Costo total $\rightarrow$ SÍ alcanza (escribe `1`).
        *   Si Dinero Llevado < Costo total $\rightarrow$ NO alcanza (escribe `2`).
    *   **¿Cuánto Falta?:** Costo Total - Dinero Llevado.
*   **⚠️ ¡Cuidado con la Trampa del Saldo Negativo!** Si tienes 5,00 pesos e intentas comprar algo de 6,25 pesos, el costo es mayor que tu billetera. La respuesta correcta es que te faltan 1,25 pesos.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Tengo R$ 4,00 y quiero comprar galletas de R$ 4,50. ¿Cuánto dinero me falta?
        *   *Paso 1:* Comparamos: R$ 4,00 es menor que R$ 4,50. No nos alcanza.
        *   *Paso 2:* Restamos el costo menos nuestro dinero: 4,50 - 4,00 = 0,50.
        *   *Paso 3:* Nos faltan R$ 0,50.
*   **⚡ Interactivo 1:** Tengo un billete de 10,00 pesos y mi carrito suma 8,50 pesos. ¿Me alcanza el dinero para pagar? (1 para SÍ, 2 para NO) `[ Input ]` *(Respuesta: 1)*
    *   *Feedback Acierto:* ¡Correcto! 10,00 es mayor que 8,50, así que sí te alcanza y te sobra cambio.
    *   *Feedback Error:* Compara los números: 10 es mayor que 8 y medio. Por lo tanto, el dinero SÍ te alcanza. Escribe 1.
*   **🧠 Interactivo 2:** Mi billetera tiene 4,00 pesos, pero el libro cuesta 5,75 pesos. ¿Cuánto dinero me hace falta? `[ Input ]` *(Respuesta: 1,75)*
    *   *Feedback Acierto:* ¡Muy bien calculado! Te hacen falta 1,75 pesos para poder comprar el libro.
    *   *Feedback Error:* Para saber cuánto falta, resta el precio del libro menos tu billetera: 5,75 - 4,00. Escribe el resultado exacto.
*   **🎯 Interactivo 3:** Llevo un presupuesto de 6,50 pesos y compro un pastelito de 6,50 pesos. ¿Cuánto vuelto me queda? `[ Input ]` *(Respuesta: 0,00)*
    *   *Feedback Acierto:* ¡Exacto! Pagaste el valor justo, no te queda nada de vuelto: 0,00 pesos.
    *   *Feedback Error:* Si pagas con la misma cantidad exacta que cuesta el pastelito, restas 6,50 - 6,50. Tu vuelto es cero centavos. Escríbelo como 0,00.

---

## 🏗️ MÓDULO 4: CONSTRUCTOR DE SOLUCIONES

### 👑 Nivel 1: Problemas de Dos Pasos Guiados

*   **Texto de Descubrimiento (Superpoder):** ¡Bienvenido al centro de control, ingeniero de soluciones! En este nivel, los problemas de palabras se vuelven misiones estructuradas. El sistema te guiará usando un **Diagrama de Flujo**. Primero resolverás el Bloque A, y luego el sistema congelará ese número en pantalla para que resuelvas el Bloque B.
*   **El Diccionario del Nivel:**
    *   **Paso 1 (Bloque A):** Resolver la primera parte de la historia (usualmente una multiplicación o suma del inventario).
    *   **Paso 2 (Bloque B):** Tomar el resultado anterior y aplicar la operación final (una resta de pérdida o suma de regalo).
*   **⚠️ ¡Cuidado con la Trampa del Salto Ciego!** No intentes operar los números del inicio con los números del final de inmediato. Sigue la guía: primero averigua el total y luego aplica la última acción.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Mateo compra 4 cajas de lápices. Cada caja tiene 6 lápices. Luego regala 5 lápices a su amigo.
        *   *Paso 1 (Guiado):* Calculamos cuántos lápices compró en total: 4 × 6 = 24 lápices.
        *   *Paso 2 (Guiado):* Usando los 24 lápices, le restamos los 5 que regaló: 24 - 5 = 19 lápices.
*   **⚡ Interactivo 1 (Paso 1):** Lucas compra 3 cajas de crayones con 6 crayones dentro cada una. ¿Cuántos crayones tiene en total? `[ Input ]` *(Respuesta: 18)*
    *   *Feedback Acierto:* ¡Correcto! 3 cajas × 6 crayones = 18 crayones. ¡Paso 1 completado!
    *   *Feedback Error:* Multiplica las 3 cajas por los 6 crayones que tiene cada una para hallar el total inicial.
*   **🧠 Interactivo 2 (Paso 2):** ¡El sistema bloquea tus 18 crayones en pantalla! Si en el camino se le rompen 4 crayones, ¿cuántos crayones útiles le quedan? `[ Input ]` *(Respuesta: 14)*
    *   *Feedback Acierto:* ¡Sensacional! A tus 18 crayones les restaste 4 rotos, quedando 14 útiles.
    *   *Feedback Error:* Toma el total que calculamos en el paso anterior (18) y réstale los 4 que se rompieron.
*   **🎯 Interactivo 3 (Cadena Completa):** En un árbol hay 2 nidos y cada nido tiene 5 pajaritos (Total = 10). Si llegan 3 pájaros más, ¿cuántos hay en total? `[ Input ]` *(Respuesta: 13)*
    *   *Feedback Acierto:* ¡Excelente! Partiste de 10 pajaritos iniciales y sumaste 3 nuevos para llegar a 13.
    *   *Feedback Error:* Primero calcula el total de pajaritos en los nidos (2 × 5 = 10) y luego súmale los 3 nuevos que llegaron.

---

### 👑 Nivel 2: Encadenamiento de Resultados

*   **Texto de Descubrimiento (Superpoder):** ¡Fabuloso! Tu mente debe aprender a **Encadenar las Ecuaciones de forma secuencial** sin andamios. La respuesta que digites en la primera sub-pregunta se inyectará automáticamente como el valor de inicio de la segunda ecuación.
*   **El Diccionario del Nivel:**
    *   **Eslabón 1:** Ecuación primaria que calcula la cantidad de partida.
    *   **Eslabón 2:** Inyección del resultado anterior en la segunda ecuación del problema.
*   **⚠️ ¡Cuidado con la Trampa del Eslabón Roto!** Nuestro servidor congelará el dato correcto para el Paso 2 aunque falles el Paso 1, aislando el error para que aprendas sin frustrarte.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Luisa cosecha 15 naranjas por la mañana y 5 por la tarde. Luego, vende la mitad.
        *   *Eslabón 1:* Total cosechado = 15 + 5 = 20 naranjas.
        *   *Eslabón 2:* Vende la mitad de las 20 naranjas = 20 ÷ 2 = 10 naranjas restantes.
*   **⚡ Interactivo 1 (Eslabón 1):** Sofía recolectó 12 manzanas rojas y 8 manzanas verdes. ¿Cuántas manzanas cosechó en total? `[ Input ]` *(Respuesta: 20)*
    *   *Feedback Acierto:* ¡Exacto! 12 + 8 = 20 manzanas cosechadas.
    *   *Feedback Error:* Realiza la suma directa de las manzanas rojas y verdes: 12 + 8.
*   **🧠 Interactivo 2 (Eslabón 2):** Usando las 20 manzanas calculadas: Si utiliza la mitad para hornear un pastel, ¿cuántas manzanas le quedan? `[ Input ]` *(Respuesta: 10)*
    *   *Feedback Acierto:* ¡Correcto! 20 ÷ 2 = 10 manzanas restantes. ¡Rico pastel!
    *   *Feedback Error:* Divide las 20 manzanas de la cosecha entre 2 para saber la mitad que le queda.
*   **🎯 Interactivo 3:** Enzo compró 4 paquetes con 5 calcomanías cada uno (Total = 20). Si decide repartirlas entre sus 2 hermanos en partes iguales, ¿cuántas le tocan a cada uno? `[ Input ]` *(Respuesta: 10)*
    *   *Feedback Acierto:* ¡Brillante encadenamiento! Primero calculaste el total de 20 calcomanías y luego lo dividiste entre 2 hermanos para dar 10 a cada uno.
    *   *Feedback Error:* Calcula primero el total multiplicando 4 paquetes por 5 calcomanías. Ese resultado (20) divídelo en partes iguales entre 2.

---

### 👑 Nivel 3: Minimización de Error de Arrastre

*   **Texto de Descubrimiento (Superpoder):** Estás en la sala de control avanzado. Las historias contienen **datos basura camuflados (distractores)**. Tu superpoder será la **Auto-verificación activa**: levantarás un escudo contra los datos inútiles y asegurarás el orden del tiempo de la historia.
*   **El Diccionario del Nivel:**
    *   **Dato Basura:** Números u objetos descritos en el problema que no tienen relación con la pregunta matemática final (ej. colores, edades de personas no involucradas, objetos distintos).
    *   **Reloj de la Historia:** Resolver las operaciones en el orden cronológico estricto en que ocurren los eventos.
*   **⚠️ ¡Cuidado con el Cruce de Cables de Tiempo!** Sigue el reloj: primero quita lo que se gastó o perdió, y únicamente al resultado remanente aplícale el multiplicador final.
*   **📚 Ejemplos Guiados Estáticos:**
    *   *Ejemplo 1:* Tomás tiene 10 estampas y 4 lápices de colores. Pierde 2 estampas. Su hermano luego le duplica las estampas que le quedan. ¿Cuántas estampas tiene ahora?
        *   *Paso 1 (Ignorar basura):* Los "4 lápices de colores" no importan, la pregunta es sobre estampas.
        *   *Paso 2 (Seguir reloj):* Tenía 10 estampas y perdió 2 $\rightarrow$ le quedan 10 - 2 = 8 estampas.
        *   *Paso 3 (Multiplicador final):* Su hermano le duplica lo que le quedaba $\rightarrow$ 8 × 2 = 16 estampas.
*   **⚡ Interactivo 1:** Valentina tenía 15 bombones en una caja. Se comió 5. También vio que había 3 sillas de madera. ¿Cuántos bombones le quedaron? `[ Input ]` *(Respuesta: 10)*
    *   *Feedback Acierto:* ¡Excelente! Identificaste que las 3 sillas no tienen nada que ver con los bombones. 15 - 5 = 10.
    *   *Feedback Error:* ¡Cuidado con el distractor! Las "3 sillas de madera" no influyen en la cantidad de bombones. Solo resta los 5 bombones que se comió de los 15 iniciales.
*   **🧠 Interactivo 2:** ¡Perfecto! Nos quedan 10 bombones. Su abuela llegó y le duplicó (×2) exactamente la cantidad que le quedaba. ¿Con cuántos bombones cuenta ahora? `[ Input ]` *(Respuesta: 20)*
    *   *Feedback Acierto:* ¡Brillante! Multiplicaste por 2 las 10 manzanas restantes para obtener 20 bombones.
    *   *Feedback Error:* Toma la cantidad limpia del paso anterior (10) y multiplícala por 2 (ya que su abuela se los duplicó).
*   **🎯 Interactivo 3:** Mateo tiene 2 cajas con 6 tazos cada una (Total = 12 tazos). Tiene también 5 camisas rojas. Si jugando pierde 3 tazos de su colección, ¿cuántos le quedan? `[ Input ]` *(Respuesta: 9)*
    *   *Feedback Acierto:* ¡Increíble! Ignoraste las camisas y resolviste: 12 tazos iniciales menos 3 tazos perdidos = 9 tazos.
    *   *Feedback Error:* Las "5 camisas rojas" son datos basura. Calcula el total de tazos (2 × 6 = 12) y réstale los 3 que perdió.

---

# PARTE 3: DISEÑO DE SCRIPTS INYECTORES (PYTHON)

Para poblar de manera íntegra, segura y estructurada la base de datos PostgreSQL de la Fase 2, se utilizará un script inyector en Python conectado mediante SQLAlchemy AsyncSession.

El script automatiza los siguientes procesos para evitar inconsistencias en el backend:

1.  **Inserción de Teoría (`niveles_teoria_pool`):**
    Carga de forma pre-renderizada toda la información correspondiente a la Fase A de aprendizaje (Superpoderes, Diccionario, Ejemplos e Interactivos con sus correspondientes JSONB de feedbacks).

2.  **Inserción de Preguntas de Práctica Libre (`preguntas_pool`):**
    Pobla la base de datos con familias estructuradas bajo un mismo `estructura_padre_id`. Por cada ejercicio de práctica en los 4 módulos, se inyectan 4 registros:
    *   **1 Pregunta Original** (con `estructura_padre_id` definido).
    *   **3 Variantes Espejo** (compartiendo el mismo `estructura_padre_id`).
    *   El script calcula automáticamente los resultados correctos (`respuesta_correcta`) y asocia las explicaciones profundas (`explicacion_profunda`) correspondientes para ser usadas en el Bloque de Rescate.

3.  **Inserción del Pool de Desafíos (`preguntas_pool`):**
    Para cada uno de los 3 desafíos de cada módulo (Desafío 1, Desafío 2, Desafío Final), se inyectan **150 preguntas estáticas precalculadas** (indicadas con `tipo_segmento = 'desafio_1'`, `'desafio_2'` o `'desafio_final'`). El script inyecta opciones de respuesta para los desafíos de opción múltiple (almacenando distractores) y respuestas vacías para el desafío final.

---

# PARTE 4: MAPEO DE ERRORES JSONB Y TUTOR INVISIBLE

Para ofrecer retroalimentación pedagógica inmediata durante la Práctica Libre sin sobrecargar el servidor, se asocia a cada pregunta un mapeo JSONB precalculado de errores previsto en la tabla `respuestas_erroneas_jsonb`.

El backend FastAPI utiliza este mapeo para identificar la causa cognitiva del fallo del alumno y devolver el mensaje adecuado del Tutor Invisible.

## 📋 Catálogo de Mapeos de Errores por Módulo (Fase 2)

### 🧠 Módulo 1: Gimnasio Numérico Mental
*   **Error de Impulso Lineal (Izquierda a Derecha):**
    *   *Detonante:* El alumno opera sumas o restas antes de multiplicaciones/divisiones (ej. en `5 + 3 × 2`, responde `16`).
    *   *Feedback del Tutor:* "¡Alto ahí! Le diste prioridad a la suma. Recuerda que la multiplicación y la división tienen escudo de oro y se resuelven antes."
*   **Error de Confusión de Multiplicador:**
    *   *Detonante:* El alumno suma la cantidad en vez de multiplicar (ej. en "el triple de 4", responde `7` en lugar de `12`).
    *   *Feedback del Tutor:* "¡Cuidado con la trampa del apuro! El triple significa multiplicar por 3 (tres veces el mismo número), no sumarle 3."
*   **Error de Ignorar Paréntesis:**
    *   *Detonante:* El alumno multiplica primero ignorando la suma protegida por el paréntesis (ej. en `(3 + 2) × 4`, responde `11` en lugar de `20`).
    *   *Feedback del Tutor:* "¡El escudo mágico fue ignorado! Resuelve primero la operación que está protegida dentro del paréntesis ( )."

### 🔄 Módulo 2: Tablas en Acción
*   **Error de Operación en el Mismo Sentido:**
    *   *Detonante:* El alumno aplica la misma operación en lugar de la inversa (ej. en `X + 5 = 12`, responde `17`).
    *   *Feedback del Tutor:* "¡La balanza se inclinó de más! Para descubrir el número original que sumaba, debes usar el camino de regreso haciendo una resta."
*   **Error de Espejo Multiplicativo Directo:**
    *   *Detonante:* El alumno multiplica en lugar de dividir (ej. si "el doble de Y es 18", responde `36`).
    *   *Feedback del Tutor:* "¡Espejo equivocado! Si el número ya fue duplicado para llegar a 18, debes dividirlo entre 2 para regresar al original."

### 🛒 Módulo 3: Tienda Matemática
*   **Error de Vuelto Mocho (Resta Incompleta):**
    *   *Detonante:* El alumno no resta correctamente a partir de la centena (ej. paga con R$ 1,00 un chocolate de R$ 0,75 y responde R$ 0,35 en vez de R$ 0,25).
    *   *Feedback del Tutor:* "¡Cuenta incompleta! Recuerda que 1 peso entero tiene 100 centavos. Si restas 100 - 75 centavos, tu vuelto exacto es 0,25."
*   **Error de Suma Decimal Incorrecta (Alineación):**
    *   *Detonante:* El alumno suma enteros con decimales de forma directa (ej. en R$ 2,75 + R$ 0,25 responde R$ 2,100 o R$ 2,00).
    *   *Feedback del Tutor:* "¡Cuidado con los centavos! 75 centavos + 25 centavos forman 100 centavos, lo que equivale a un peso extra que debes añadir a los enteros."

### 🏗️ Módulo 4: Constructor de Soluciones
*   **Error de Arrastre de Datos Basura:**
    *   *Detonante:* El alumno opera con los distractores provistos en la historia (ej. incluye la cantidad de camisas en la operación de tazos).
    *   *Feedback del Tutor:* "¡Caíste en la trampa del distractor! Antes de operar, levanta tu escudo y separa solo los datos útiles para resolver la pregunta."
*   **Error de Secuencia Cronológica Rotura:**
    *   *Detonante:* El alumno altera el orden de los eventos del tiempo de la historia al operar (ej. duplica la cantidad inicial antes de restar la pérdida).
    *   *Feedback del Tutor:* "¡El reloj de la historia se rompió! Sigue el orden de la historia: primero resta las pérdidas y luego aplica el multiplicador final al remanente."
