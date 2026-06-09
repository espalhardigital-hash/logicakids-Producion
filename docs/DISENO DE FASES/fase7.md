# 🧭 FASE 7: COORDENADAS, RUTAS Y TIEMPO

**Propósito:** Dominar la orientación en un plano de referencia, la vectorización del movimiento y la aritmética del tiempo.

---

## PARTE 1: DOCUMENTO DE DISEÑO LÓGICO

La Fase 7 entrena al alumno en habilidades de localización espacial, navegación cartográfica y cálculo temporal — competencias de presencia constante en las pruebas del Pedro II (ej. trayecto casa-a-escuela 2023 Q11, Moovit 2020 Q15, ahorro semanal 2023 Q16, cronograma escolar 2024 Q20).

### 🗺️ Mapa de la Fase 7: Estructura de Módulos y Niveles

```text
[FASE 7: COORDENADAS, RUTAS Y TIEMPO]
│
├── [MÓDULO 1: Orientación Cardinal y Ángulos] -> Tema: Vectores de dirección, giros y navegación.
│    ├── Nivel 1: Puntos Cardinales y Giros de 90°/180° (Brújula interactiva, sin tiempo)
│    ├── Nivel 2: Traducción de instrucciones verbales a trayectos vectoriales (Trazador de rutas, Bucle Espejo)
│    ├── Nivel 3: Detección de rutas imposibles y distancias óptimas (Simulador vial, sin tiempo)
│    │
│    ├── DESAFÍO 1: Seguimiento de comandos cardinales + giros (Opción múltiple, 30s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: Ruta imposible oculta en lista de alternativas (Opción múltiple, 45s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Trayecto óptimo tipo Pedro II (Input numérico, 60s/Q, ≥90%, Early Exit al 2do error)
│
├── [MÓDULO 2: Plano Cartesiano] -> Tema: Coordenadas ortogonales y traslación bidimensional.
│    ├── Nivel 1: Pares ordenados (X,Y) en primer cuadrante (Marcado de puntos, sin tiempo)
│    ├── Nivel 2: Traslación de figuras sumando/restando a coordenadas (Desplazamiento dinámico, Bucle Espejo)
│    ├── Nivel 3: Distancia Manhattan — conteo de cuadras recorridas (Conteo vectorial, sin tiempo)
│    │
│    ├── DESAFÍO 1: Identificación de coordenadas en mapa (Opción múltiple, 30s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: Coordenadas invertidas (Y,X) como trampa (Opción múltiple, 45s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Desplazamiento vectorial en grilla 10×10 (Input numérico, 60s/Q, ≥90%, Early Exit al 2do error)
│
├── [MÓDULO 3: La Mecánica del Tiempo] -> Tema: Sistema sexagesimal y cálculo de intervalos.
│    ├── Nivel 1: Lectura de reloj y conversiones (horas, minutos, segundos) (Sincronización de manecillas, sin tiempo)
│    ├── Nivel 2: Duración de eventos cruzando AM/PM y formato 24h (Cronómetro de intervalos, Bucle Espejo)
│    ├── Nivel 3: Aritmética sexagesimal: suma y resta de tiempos (Calculadora sexagesimal, sin tiempo)
│    │
│    ├── DESAFÍO 1: Cálculo de duración de actividad (Opción múltiple, 30s/Q, Early Exit al 3er error)
│    ├── DESAFÍO 2: Hora de inicio a partir de la llegada — cálculo retrospectivo (Opción múltiple, 45s/Q, Early Exit al 3er error)
│    └── DESAFÍO FINAL: Ecuaciones temporales complejas tipo Pedro II (Input numérico, 60s/Q, ≥90%, Early Exit al 2do error)
│
└── [MÓDULO 4: Horarios y Apps] -> Tema: Matrices de doble entrada y optimización de recursos.
     ├── Nivel 1: Lectura de tablas de horarios de transporte (Selector matricial, sin tiempo)
     ├── Nivel 2: Tiempos compuestos: viaje + espera + transbordo (Planificador de viajes, Bucle Espejo)
     ├── Nivel 3: Optimización: comparar opciones de transporte (Toma de decisiones, sin tiempo)
     │
     ├── DESAFÍO 1: Hora de salida idónea desde tabla (Opción múltiple, 30s/Q, Early Exit al 3er error)
     ├── DESAFÍO 2: Tablas con desfases horarios ocultos (Opción múltiple, 45s/Q, Early Exit al 3er error)
     └── DESAFÍO FINAL: Movilidad urbana tipo Moovit — Pedro II (Input numérico, 60s/Q, ≥90% para abrir Fase 8)
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

### 🧭 MÓDULO 1: ORIENTACIÓN CARDINAL Y ÁNGULOS

#### 👑 Nivel 1: Puntos Cardinales y Giros de 90° y 180°

**Texto de Aprendizaje:** ¡Bienvenido al Centro de Control de Navegación, Explorador Estelar! Antes de pilotar naves y trazar rutas por las calles, necesitas dominar el idioma universal de la orientación: los **Puntos Cardinales**. Son como las 4 flechas de tu mando de control: **Norte (N)** apunta siempre hacia arriba en un mapa, **Sur (S)** hacia abajo, **Este (E)** hacia la derecha y **Oeste (O)** hacia la izquierda. Cuando alguien te dice "camina 3 cuadras al Norte y luego 2 al Este", te está dando un **vector de dirección**: una flecha invisible que indica hacia dónde debes moverte y cuántas casillas debes avanzar. Además, existen los **giros angulares**: un giro de **90°** es un cambio de dirección de esquina (como doblar en una calle), y un giro de **180°** es darte media vuelta completa y caminar en la dirección contraria.

**El Diccionario del Nivel:**

* **Norte (N):** Arriba en el mapa. La flecha que apunta al cielo.
* **Sur (S):** Abajo en el mapa. La flecha que apunta al suelo.
* **Este (E / Leste):** Derecha en el mapa. Donde sale el sol.
* **Oeste (O):** Izquierda en el mapa. Donde se pone el sol.
* **Giro de 90°:** Doblar en una esquina. Si ibas al Norte y giras 90° a la derecha, ahora vas al Este.
* **Giro de 180°:** Media vuelta. Si ibas al Norte, ahora vas al Sur.

⚠️ **¡Cuidado con la Trampa del Espejo Invertido!** Muchos niños confunden "mi derecha" con la derecha del mapa. En un mapa estándar, **tu derecha siempre es el Este** y **tu izquierda siempre es el Oeste**, sin importar hacia dónde "mire" el personaje. No gires el mapa en tu mente.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Un explorador está en la posición (A,1) de una cuadrícula 5×5. Le dicen: "Avanza 3 casillas al Norte".
  * *Paso 1:* Norte = hacia arriba.
  * *Paso 2:* Desde (A,1), subo 3 posiciones: (A,2), (A,3), (A,4).
  * *Resultado:* El explorador llega a la posición (A,4).

* **Ejemplo 2:** Un robot mira al Norte. Le ordenan: "Gira 90° a la derecha".
  * *Paso 1:* Si miro al Norte y giro 90° a la derecha, termino mirando al Este.
  * *Resultado:* El robot ahora mira al Este.

* **Ejemplo 3:** Ana camina 2 cuadras al Este y luego 4 cuadras al Norte.
  * *Paso 1:* Desde el punto de partida, se mueve 2 casillas a la derecha.
  * *Paso 2:* Desde ahí, sube 4 casillas.
  * *Resultado:* Ana se desplazó un total de 6 cuadras (2 + 4).

* **Ejemplo 4:** Pedro mira al Sur. Le dicen: "Gira 180°".
  * *Paso 1:* Un giro de 180° es media vuelta.
  * *Paso 2:* Si miraba al Sur, ahora mira en la dirección contraria.
  * *Resultado:* Pedro ahora mira al Norte.

* **Ejemplo 5:** Un dron parte de la esquina inferior izquierda de una cuadrícula 4×4. Instrucciones: "Norte 2, Este 3".
  * *Paso 1:* Sube 2 casillas (de fila 1 a fila 3).
  * *Paso 2:* Se mueve 3 casillas a la derecha (de columna 1 a columna 4).
  * *Resultado:* El dron termina en la posición (4, 3) — columna 4, fila 3.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** (Visual: cuadrícula 5×5 con un cohete en la posición central). Si el cohete avanza 2 casillas al Norte y luego 1 al Oeste, ¿cuántas casillas se movió en total? `[Input: 3]`
  * *Feedback Acierto:* ¡Navegación perfecta! 2 al Norte + 1 al Oeste = 3 movimientos.
  * *Feedback Error:* Cuenta cada casilla que recorres. Primero subes 2, luego vas 1 a la izquierda. Suma los movimientos.

* **Interactivo 2:** Un explorador mira al Este. Le dicen: "Gira 90° a la izquierda". ¿Hacia qué punto cardinal mira ahora? `[Input: Norte]`
  * *Feedback Acierto:* ¡Excelente! Desde el Este, girar 90° a la izquierda te lleva al Norte.
  * *Feedback Error:* Imagina la brújula: Este está a la derecha. Si giras a la izquierda desde ahí, apuntas hacia arriba = Norte.

* **Interactivo 3:** (Visual: cuadrícula con punto A y punto B marcados). El punto A está en (1,1) y el punto B en (4,1). ¿Hacia qué dirección cardinal debe caminar para llegar de A a B? `[Input: Este]`
  * *Feedback Acierto:* ¡Correcto! El punto B está a la derecha de A. Derecha en el mapa = Este.
  * *Feedback Error:* Mira las coordenadas: la fila no cambió (sigue siendo 1), pero la columna subió de 1 a 4. Moverse a la derecha en el mapa es ir al Este.

---

#### 👑 Nivel 2: Traducción de instrucciones verbales a trayectos vectoriales

**Texto de Aprendizaje:** Ahora que dominas las 4 direcciones y los giros básicos, es hora de recibir **misiones completas de navegación**. En este nivel, recibirás un párrafo con instrucciones de ruta completas: "Desde la plaza, camina 3 cuadras al Norte, gira al Este y avanza 2 cuadras, luego baja 1 cuadra al Sur". Tu superpoder es transformar ese texto verbal en un **trazado exacto** sobre la cuadrícula, leyendo cada instrucción como un vector independiente y ejecutándolos en secuencia estricta. Cada instrucción es un "tramo" de tu viaje. No puedes mezclar los tramos ni saltarte ninguno. Tu dedo debe dibujar el camino completo paso a paso como si estuvieras programando un GPS.

**El Diccionario del Nivel:**

* **Tramo:** Cada segmento de movimiento en una dirección fija (ej. "3 al Norte" es un tramo).
* **Trayecto completo:** La suma secuencial de todos los tramos desde el inicio al destino.
* **Distancia total:** El conteo acumulado de todas las cuadras recorridas en todos los tramos.

⚠️ **¡Cuidado con la Trampa del Atajo Mental!** El texto puede decir "avanza 3 al Norte y luego 3 al Sur". Tu cerebro querrá decir "eso es igual a cero, no se movió". ¡Pero la pregunta puede pedir la *distancia total recorrida* (que es 6), no la *posición final*! Lee siempre qué te piden antes de resolver.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Instrucción: "Norte 3, Este 2". ¿Cuántas cuadras recorrió en total?
  * *Paso 1:* Tramo 1: 3 cuadras al Norte.
  * *Paso 2:* Tramo 2: 2 cuadras al Este.
  * *Resultado:* Distancia total = 3 + 2 = 5 cuadras.

* **Ejemplo 2:** Instrucción: "Este 4, Norte 1, Oeste 2". ¿Posición final si partió de (1,1)?
  * *Paso 1:* (1,1) → Este 4 → (5,1).
  * *Paso 2:* (5,1) → Norte 1 → (5,2).
  * *Paso 3:* (5,2) → Oeste 2 → (3,2).
  * *Resultado:* Posición final: (3,2).

* **Ejemplo 3:** Un cartero parte de la oficina postal y camina: Norte 2, Este 3, Sur 2. ¿Regresó a la misma fila donde empezó?
  * *Paso 1:* Norte 2 lo sube 2 filas.
  * *Paso 2:* Este 3 lo mueve a la derecha (no cambia fila).
  * *Paso 3:* Sur 2 lo baja 2 filas.
  * *Resultado:* Sí, volvió a la misma fila. Subió 2 y bajó 2 = diferencia vertical de 0.

* **Ejemplo 4:** Instrucción: "Sur 1, Oeste 4, Norte 3, Este 4". ¿Cuántas cuadras caminó en total?
  * *Cálculo:* 1 + 4 + 3 + 4 = 12 cuadras.

* **Ejemplo 5:** Un mensaje cifrado dice: "Norte 5, gira 90° a la derecha, avanza 3". ¿En qué dirección avanzó después del giro?
  * *Paso 1:* Iba al Norte.
  * *Paso 2:* Gira 90° a la derecha → ahora va al Este.
  * *Paso 3:* Avanza 3 casillas al Este.
  * *Resultado:* Después del giro, avanzó al Este.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Un robot parte de (2,2) en una cuadrícula 6×6. Instrucciones: "Norte 3, Este 1". ¿En qué posición terminó? `[Input: (3,5)]`
  * *Feedback Acierto:* ¡Trazado perfecto! (2,2) → Norte 3 → (2,5) → Este 1 → (3,5).
  * *Feedback Error:* Recuerda: Norte sube la coordenada Y. Este aumenta la coordenada X. Aplica cada tramo por separado.

* **Interactivo 2:** Un explorador sigue las instrucciones: "Este 4, Sur 2, Oeste 4, Norte 2". ¿Volvió al punto de partida? `[Input: Sí]`
  * *Feedback Acierto:* ¡Exacto! El trayecto formó un rectángulo y volvió al origen.
  * *Feedback Error:* Suma los movimientos horizontales (Este 4, Oeste 4 = 0) y verticales (Sur 2, Norte 2 = 0). Si ambos son cero, regresó al inicio.

* **Interactivo 3:** Un dron recibe: "Norte 2, Este 3, Sur 1". ¿Cuántas cuadras caminó en total? `[Input: 6]`
  * *Feedback Acierto:* ¡Correcto! 2 + 3 + 1 = 6 cuadras de distancia total recorrida.
  * *Feedback Error:* Suma cada tramo individualmente: 2 + 3 + 1. No importa la dirección, la distancia total es la suma de todos los pasos.

---

#### 👑 Nivel 3: Detección de rutas imposibles y distancias óptimas

**Texto de Aprendizaje:** Los verdaderos maestros de la navegación no solo siguen instrucciones: también **detectan errores y optimizan caminos**. En este nivel, recibirás varias rutas posibles y deberás identificar cuál es imposible (porque sale de la cuadrícula o choca con un obstáculo), cuál es la más corta, o cuál es la única que llega correctamente al destino. Tu superpoder es el **análisis crítico de trayectos**: antes de caminar, simulas mentalmente cada ruta y verificas su validez y eficiencia. La ruta más corta entre dos puntos en una cuadrícula se calcula con la **Distancia Manhattan**: sumas la diferencia horizontal más la diferencia vertical.

⚠️ **¡Cuidado con la Trampa de la Ruta Diagonal!** En una cuadrícula de calles, NO puedes caminar en diagonal. Solo te mueves horizontal o verticalmente. La distancia más corta no es una línea recta, sino la suma de las cuadras que debes recorrer en cada eje.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** En una cuadrícula 5×5, de (1,1) a (4,3). ¿Cuál es la ruta más corta?
  * *Paso 1:* Diferencia horizontal: |4 - 1| = 3 cuadras.
  * *Paso 2:* Diferencia vertical: |3 - 1| = 2 cuadras.
  * *Resultado:* Ruta mínima = 3 + 2 = 5 cuadras.

* **Ejemplo 2:** Ruta A: "Norte 3, Este 5". Ruta B: "Este 5, Norte 3". ¿Cuál es más corta?
  * *Análisis:* Ambas recorren 3 + 5 = 8 cuadras.
  * *Resultado:* Misma distancia. En la Distancia Manhattan, el orden no altera el total.

* **Ejemplo 3:** Cuadrícula 4×4. Un robot en (1,1) recibe: "Norte 5". ¿Es posible?
  * *Análisis:* La cuadrícula tiene solo 4 filas. Norte 5 lo llevaría a la fila 6, que no existe.
  * *Resultado:* Ruta imposible. El robot saldría de la cuadrícula.

* **Ejemplo 4:** De la escuela (2,3) a la panadería (5,3). ¿Distancia mínima?
  * *Paso 1:* Diferencia horizontal: |5 - 2| = 3.
  * *Paso 2:* Diferencia vertical: |3 - 3| = 0.
  * *Resultado:* 3 + 0 = 3 cuadras (solo se mueve al Este).

* **Ejemplo 5:** Tres rutas de A(1,1) a B(3,4): Ruta 1 = "E2, N3"; Ruta 2 = "N3, E2"; Ruta 3 = "E2, N1, E1, N2". ¿Cuál es la más larga?
  * *Ruta 1:* 2 + 3 = 5. *Ruta 2:* 3 + 2 = 5. *Ruta 3:* 2 + 1 + 1 + 2 = 6.
  * *Resultado:* La Ruta 3 es la más larga (6 cuadras) porque tiene un desvío innecesario.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** En una cuadrícula 6×6, ¿cuál es la distancia mínima de (1,1) a (4,5)? `[Input: 7]`
  * *Feedback Acierto:* ¡Navegante experto! |4-1| + |5-1| = 3 + 4 = 7 cuadras.
  * *Feedback Error:* Calcula la diferencia horizontal (columnas) y la vertical (filas) por separado, luego súmalas.

* **Interactivo 2:** Cuadrícula 5×5. Ruta: "Norte 3, Este 6". ¿Es posible esta ruta? `[Input: No]`
  * *Feedback Acierto:* ¡Alerta detectada! La cuadrícula tiene solo 5 columnas. Este 6 la rebasa.
  * *Feedback Error:* La cuadrícula es de 5×5. Si la coordenada X llega a 7 (1+6), eso excede el límite de 5.

* **Interactivo 3:** Dos rutas de (2,1) a (5,4): Ruta A = "E3, N3" y Ruta B = "N1, E3, N2". ¿Cuántas cuadras tiene la más corta? `[Input: 6]`
  * *Feedback Acierto:* ¡Ambas tienen 6! Ruta A: 3+3=6. Ruta B: 1+3+2=6. Misma distancia Manhattan.
  * *Feedback Error:* Suma los tramos de cada ruta por separado. Si ambas van al mismo destino con movimientos solo H y V, la distancia mínima es la misma.

---

### 📍 MÓDULO 2: PLANO CARTESIANO

#### 👑 Nivel 1: Pares ordenados (X, Y) en el primer cuadrante

**Texto de Aprendizaje:** ¡Bienvenido a la Sala de Radar, Operador de Coordenadas! El **plano cartesiano** es el mapa más preciso del universo. Funciona con dos ejes perpendiculares: el **eje X** (horizontal, como el piso) y el **eje Y** (vertical, como un ascensor). Cualquier punto del plano se identifica con un **par ordenado (X, Y)**: el primer número te dice cuántos pasos das a la derecha sobre el piso, y el segundo te dice cuántos pasos subes por el ascensor. El orden es sagrado: primero el piso (X), luego el ascensor (Y). El punto donde los dos ejes se cruzan se llama **origen**, y su coordenada es (0, 0). Desde ahí empiezas a contar siempre.

**El Diccionario del Nivel:**

* **Eje X (horizontal):** El "pasillo" — caminas a la derecha para aumentar X.
* **Eje Y (vertical):** El "ascensor" — subes para aumentar Y.
* **Par ordenado (X, Y):** Primero el pasillo, después el ascensor. ¡Nunca al revés!
* **Origen (0, 0):** El punto de partida donde se cruzan los dos ejes.

⚠️ **¡Cuidado con la Trampa del Par Invertido!** El error más mortal en coordenadas es confundir (X, Y) con (Y, X). Si te dicen "ve al punto (3, 5)", primero caminas 3 al pasillo y luego subes 5 pisos. Si lo haces al revés, terminas en (5, 3), ¡un lugar completamente diferente!

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Ubica el punto (2, 4) en una cuadrícula.
  * *Paso 1:* Desde el origen (0,0), camina 2 pasos a la derecha por el eje X.
  * *Paso 2:* Desde ahí, sube 4 pasos por el eje Y.
  * *Resultado:* El punto (2, 4) está en la columna 2, fila 4.

* **Ejemplo 2:** ¿Cuáles son las coordenadas de un punto ubicado 5 a la derecha y 1 arriba?
  * *Paso 1:* X = 5 (derecha). Y = 1 (arriba).
  * *Resultado:* (5, 1).

* **Ejemplo 3:** Un tesoro está en (0, 3). ¿Cómo llego desde el origen?
  * *Paso 1:* X = 0 → no me muevo horizontalmente.
  * *Paso 2:* Y = 3 → subo 3 posiciones.
  * *Resultado:* El tesoro está justo encima del origen, en la fila 3.

* **Ejemplo 4:** ¿El punto (4, 2) y el punto (2, 4) son el mismo lugar?
  * *Análisis:* (4, 2) = 4 a la derecha, 2 arriba. (2, 4) = 2 a la derecha, 4 arriba.
  * *Resultado:* ¡No! Son dos puntos completamente diferentes.

* **Ejemplo 5:** En un mapa escolar, la biblioteca está en (3, 3) y el comedor en (3, 0). ¿Qué tienen en común?
  * *Análisis:* Ambos están en la columna X = 3. La diferencia es la altura Y.
  * *Resultado:* Están alineados verticalmente (misma columna, diferente fila).

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** (Visual: cuadrícula con punto marcado en columna 4, fila 2). ¿Cuáles son las coordenadas del punto marcado? `[Input: (4,2)]`
  * *Feedback Acierto:* ¡Lectura de radar perfecta! Primero el eje X (4), luego el Y (2).
  * *Feedback Error:* Recuerda: primero cuenta cuántos pasos dio a la derecha (eje X = pasillo), luego cuántos subió (eje Y = ascensor).

* **Interactivo 2:** ¿Cuántos pasos a la derecha y cuántos arriba necesitas dar para llegar al punto (6, 3) desde el origen? `[Input: 6 y 3]`
  * *Feedback Acierto:* ¡Ruta directa! 6 pasos por el pasillo y 3 por el ascensor.
  * *Feedback Error:* El primer número del par (6) son los pasos horizontales. El segundo (3) son los verticales.

* **Interactivo 3:** Un avión está en el punto (5, 5) y otro en el punto (5, 0). ¿Están en la misma columna o en la misma fila? `[Input: Columna]`
  * *Feedback Acierto:* ¡Correcto! Ambos tienen X = 5, así que están en la misma columna vertical.
  * *Feedback Error:* Fíjate en el primer número: ambos dicen 5. Eso significa que están en la misma posición horizontal (columna X = 5).

---

#### 👑 Nivel 2: Traslación de figuras sumando/restando a coordenadas

**Texto de Aprendizaje:** Mover un objeto en el plano cartesiano sin cambiarlo de forma se llama **traslación**. Es como si deslizaras una pieza de ajedrez por el tablero sin rotarla. Para trasladar un punto, simplemente sumas o restas valores a sus coordenadas: si quieres moverlo 3 posiciones a la derecha, **sumas 3 a X**. Si lo bajas 2 posiciones, **restas 2 a Y**. Si tienes una figura con varios vértices (como un triángulo), aplicas la misma regla a cada vértice para que la figura entera se deslice como un bloque.

⚠️ **¡Cuidado con la Trampa de la Resta Negativa!** Si te dicen "baja 4 unidades", es Y – 4. Si la coordenada Y original era 3, ¡el resultado es negativo! (3 – 4 = –1). En el primer cuadrante, esto significa que la figura salió del mapa.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** El punto (2, 3) se traslada 4 a la derecha. ¿Nueva posición?
  * *Cálculo:* (2 + 4, 3) = (6, 3).

* **Ejemplo 2:** El punto (5, 7) se traslada 2 abajo. ¿Nueva posición?
  * *Cálculo:* (5, 7 – 2) = (5, 5).

* **Ejemplo 3:** Un triángulo con vértices (1,1), (3,1), (2,4) se mueve 2 a la derecha y 1 arriba.
  * *(1+2, 1+1)* = (3, 2). *(3+2, 1+1)* = (5, 2). *(2+2, 4+1)* = (4, 5).
  * *Resultado:* Nuevos vértices: (3,2), (5,2), (4,5).

* **Ejemplo 4:** El punto (4, 1) se traslada 3 a la izquierda. ¿Nueva posición?
  * *Cálculo:* (4 – 3, 1) = (1, 1).

* **Ejemplo 5:** Un cuadrado con esquina inferior izquierda en (2, 2) y lado 3 se mueve 1 a la derecha y 3 arriba. ¿Dónde queda la esquina inferior izquierda?
  * *Cálculo:* (2 + 1, 2 + 3) = (3, 5).

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** El punto (3, 2) se traslada 5 a la derecha y 1 arriba. ¿Coordenada final? `[Input: (8,3)]`
  * *Feedback Acierto:* ¡Deslizamiento perfecto! (3+5, 2+1) = (8, 3).
  * *Feedback Error:* Suma el desplazamiento horizontal a X y el vertical a Y por separado.

* **Interactivo 2:** Un punto en (7, 6) se mueve 4 a la izquierda. ¿Cuál es su nueva coordenada X? `[Input: 3]`
  * *Feedback Acierto:* ¡Exacto! Moverse a la izquierda = restar de X. 7 – 4 = 3.
  * *Feedback Error:* "Izquierda" significa restar del eje X. Calcula 7 – 4.

* **Interactivo 3:** Un rectángulo tiene su esquina en (1, 5). Si se traslada 2 abajo, ¿cuál es la nueva coordenada Y de esa esquina? `[Input: 3]`
  * *Feedback Acierto:* ¡Preciso! Bajar = restar de Y. 5 – 2 = 3.
  * *Feedback Error:* "Abajo" resta del eje Y. Calcula 5 – 2.

---

#### 👑 Nivel 3: Distancia Manhattan (conteo vectorial de cuadras)

**Texto de Aprendizaje:** En la vida real no puedes volar en línea recta entre dos puntos. En una ciudad con calles, debes seguir las cuadras. La **Distancia Manhattan** (también llamada "distancia de taxi") mide exactamente cuántas cuadras caminas para ir de un punto A a un punto B moviéndote solo horizontal y verticalmente. La fórmula es elegante: `Distancia = |X₂ – X₁| + |Y₂ – Y₁|`. Las barras verticales significan "valor absoluto" (siempre positivo).

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** De (1, 1) a (4, 3). Distancia Manhattan:
  * *Horizontal:* |4 – 1| = 3. *Vertical:* |3 – 1| = 2.
  * *Resultado:* 3 + 2 = 5 cuadras.

* **Ejemplo 2:** De (5, 2) a (2, 6). Distancia Manhattan:
  * *Horizontal:* |2 – 5| = 3. *Vertical:* |6 – 2| = 4.
  * *Resultado:* 3 + 4 = 7 cuadras.

* **Ejemplo 3:** De (3, 3) a (3, 8). Distancia Manhattan:
  * *Horizontal:* |3 – 3| = 0. *Vertical:* |8 – 3| = 5.
  * *Resultado:* 0 + 5 = 5 cuadras (solo movimiento vertical).

* **Ejemplo 4:** De (0, 0) a (6, 6). Distancia Manhattan:
  * *Horizontal:* 6. *Vertical:* 6.
  * *Resultado:* 6 + 6 = 12 cuadras.

* **Ejemplo 5:** De (7, 1) a (2, 1). Distancia Manhattan:
  * *Horizontal:* |2 – 7| = 5. *Vertical:* |1 – 1| = 0.
  * *Resultado:* 5 + 0 = 5 cuadras (solo movimiento horizontal).

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** ¿Cuál es la distancia Manhattan de (2, 3) a (7, 5)? `[Input: 7]`
  * *Feedback Acierto:* ¡Taxista experto! |7–2| + |5–3| = 5 + 2 = 7.
  * *Feedback Error:* Resta las coordenadas X (|7–2|=5) y las Y (|5–3|=2) por separado, luego suma.

* **Interactivo 2:** De (4, 4) a (4, 9). ¿Cuántas cuadras? `[Input: 5]`
  * *Feedback Acierto:* ¡Directo! Misma columna X, así que solo cuentas la diferencia vertical: |9–4| = 5.
  * *Feedback Error:* Si la X es la misma, no hay movimiento horizontal. Solo cuenta la diferencia en Y.

* **Interactivo 3:** La escuela está en (1, 2) y la tienda en (6, 7). ¿Distancia Manhattan? `[Input: 10]`
  * *Feedback Acierto:* ¡Ruta calculada! |6–1| + |7–2| = 5 + 5 = 10 cuadras.
  * *Feedback Error:* Diferencia horizontal: 6–1 = 5. Diferencia vertical: 7–2 = 5. Total: 5+5 = 10.

---

### ⏰ MÓDULO 3: LA MECÁNICA DEL TIEMPO

#### 👑 Nivel 1: Lectura de reloj y conversiones temporales

**Texto de Aprendizaje:** ¡Bienvenido al Taller del Cronista, Maestro del Tiempo! El tiempo es el único recurso que no se puede devolver, ¡así que aprende a medirlo con precisión! El reloj usa un sistema especial llamado **sexagesimal**: cada hora tiene **60 minutos**, y cada minuto tiene **60 segundos**. Esto es diferente al sistema decimal que usas para contar monedas (donde cada unidad tiene 10 subunidades). Las conversiones fundamentales son: 1 hora = 60 minutos. 1 minuto = 60 segundos. 1 día = 24 horas. 1 semana = 7 días. Para convertir horas a minutos, multiplicas por 60. Para convertir minutos a horas, divides entre 60.

**El Diccionario del Nivel:**

* **Sistema sexagesimal:** Base 60. 60 segundos = 1 minuto. 60 minutos = 1 hora.
* **Formato analógico:** Reloj con manecillas. La corta = horas, la larga = minutos.
* **Formato digital:** Números separados por dos puntos (ej. 14:30 = 2 y media de la tarde).

⚠️ **¡Cuidado con la Trampa de la Base 10!** Si una actividad dura 1 hora y 30 minutos, NO escribas 1,30 horas. En el sistema de tiempo, 30 minutos es la **mitad** de una hora, que en decimal sería 1,5. Pero en formato de reloj se escribe 1:30. No mezcles los sistemas.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Convertir 2 horas a minutos.
  * *Cálculo:* 2 × 60 = 120 minutos.

* **Ejemplo 2:** Convertir 180 minutos a horas.
  * *Cálculo:* 180 ÷ 60 = 3 horas.

* **Ejemplo 3:** Convertir 1 hora y 45 minutos a minutos totales.
  * *Paso 1:* 1 hora = 60 minutos.
  * *Paso 2:* 60 + 45 = 105 minutos.

* **Ejemplo 4:** ¿Cuántos segundos hay en 3 minutos?
  * *Cálculo:* 3 × 60 = 180 segundos.

* **Ejemplo 5:** ¿Cuántas semanas son 21 días?
  * *Cálculo:* 21 ÷ 7 = 3 semanas.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Convierte 3 horas y 15 minutos a minutos totales. `[Input: 195]`
  * *Feedback Acierto:* ¡Cronista perfecto! 3 × 60 = 180, más 15 = 195 minutos.
  * *Feedback Error:* Primero convierte las horas: 3 × 60 = 180 minutos. Luego suma los 15 minutos extras.

* **Interactivo 2:** ¿Cuántas horas completas hay en 150 minutos? `[Input: 2]`
  * *Feedback Acierto:* ¡Exacto! 150 ÷ 60 = 2 horas completas (sobran 30 minutos).
  * *Feedback Error:* Divide 150 entre 60. El cociente entero (sin decimales) son las horas completas.

* **Interactivo 3:** Un partido de fútbol dura 90 minutos. ¿Cuántas horas y minutos son? `[Input: 1 hora y 30 minutos]`
  * *Feedback Acierto:* ¡Gol! 90 ÷ 60 = 1 hora con 30 minutos de resto.
  * *Feedback Error:* 60 minutos = 1 hora. 90 – 60 = 30 minutos sobrantes. Total: 1h 30min.

---

#### 👑 Nivel 2: Cálculo de duración cruzando fronteras AM/PM

**Texto de Aprendizaje:** Ahora que conviertes unidades, el verdadero reto del cronista temporal es calcular **cuánto tiempo dura un evento** que empieza en una hora y termina en otra. Si una película comienza a las 14:20 y termina a las 16:05, ¿cuánto duró? La estrategia maestra es dividir el cálculo en dos partes: primero cuántos minutos faltan para la hora siguiente (el "puente"), y luego cuántas horas y minutos quedan hasta la hora final.

⚠️ **¡Cuidado con la Trampa del Reloj que Cruza Medianoche!** Si una actividad comienza a las 22:00 y termina a las 02:00, la duración NO es 22 – 2 = 20 horas. Debes pensar: de 22:00 a medianoche (00:00) son 2 horas, y de 00:00 a 02:00 son 2 horas más. Total: 4 horas.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Una clase empieza a las 8:00 y termina a las 8:45. ¿Duración?
  * *Cálculo:* 8:45 – 8:00 = 45 minutos.

* **Ejemplo 2:** Una película empieza a las 14:20 y termina a las 16:05. ¿Duración?
  * *Paso 1:* De 14:20 a 15:00 = 40 minutos.
  * *Paso 2:* De 15:00 a 16:00 = 60 minutos.
  * *Paso 3:* De 16:00 a 16:05 = 5 minutos.
  * *Resultado:* 40 + 60 + 5 = 105 minutos = 1 hora 45 minutos.

* **Ejemplo 3:** Un examen de las 9:30 a las 11:15. ¿Duración?
  * *Paso 1:* De 9:30 a 10:00 = 30 min. De 10:00 a 11:00 = 60 min. De 11:00 a 11:15 = 15 min.
  * *Resultado:* 30 + 60 + 15 = 105 minutos = 1h 45min.

* **Ejemplo 4:** De las 23:00 a las 01:00 del día siguiente. ¿Duración?
  * *Paso 1:* De 23:00 a 00:00 = 1 hora. De 00:00 a 01:00 = 1 hora.
  * *Resultado:* 1 + 1 = 2 horas.

* **Ejemplo 5:** Un viaje empieza a las 7:50 y dura 2 horas y 30 minutos. ¿A qué hora llega?
  * *Paso 1:* 7:50 + 2 horas = 9:50.
  * *Paso 2:* 9:50 + 30 minutos = 10:20.
  * *Resultado:* Llega a las 10:20.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Una fiesta empieza a las 15:30 y termina a las 18:00. ¿Cuántas horas y minutos duró? `[Input: 2 horas y 30 minutos]`
  * *Feedback Acierto:* ¡Cronómetro exacto! De 15:30 a 18:00 = 2h 30min.
  * *Feedback Error:* Cuenta: de 15:30 a 16:00 = 30 min. De 16:00 a 18:00 = 2 horas. Total: 2h 30min.

* **Interactivo 2:** Un tren sale a las 10:45 y llega a las 13:15. ¿Cuántos minutos duró el viaje? `[Input: 150]`
  * *Feedback Acierto:* ¡Perfecto! 2 horas 30 min = 150 minutos.
  * *Feedback Error:* De 10:45 a 13:15 son 2h 30min. Convierte: 2 × 60 + 30 = 150 minutos.

* **Interactivo 3:** Lucas empezó la tarea a las 17:40 y la terminó a las 19:10. ¿Cuántos minutos le tomó? `[Input: 90]`
  * *Feedback Acierto:* ¡Velocidad académica! 1 hora 30 minutos = 90 minutos.
  * *Feedback Error:* De 17:40 a 18:00 = 20 min. De 18:00 a 19:00 = 60 min. De 19:00 a 19:10 = 10 min. Total: 90 min.

---

#### 👑 Nivel 3: Aritmética sexagesimal — suma y resta de tiempos

**Texto de Aprendizaje:** Los verdaderos Cronistas Estelares no solo leen relojes: realizan **operaciones aritméticas con el tiempo**. Para sumar horas y minutos, debes sumar las horas por un lado y los minutos por otro. Pero si los minutos resultantes suman 60 o más, debes **convertir el exceso en horas** (igual que cuando las unidades suman 10 o más y "aciertas" una decena). A esto lo llamamos **acarreo sexagesimal**: cada vez que acumulas 60 minutos, los transformas en 1 hora. Para restar, si los minutos del sustraendo son mayores que los del minuendo, "pides prestada" 1 hora (que son 60 minutos) y la sumas a los minutos del minuendo.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Sumar 2h 35min + 1h 40min.
  * *Horas:* 2 + 1 = 3. *Minutos:* 35 + 40 = 75.
  * *Acarreo:* 75 min = 1h 15min. → 3 + 1 = 4h 15min.
  * *Resultado:* 4 horas y 15 minutos.

* **Ejemplo 2:** Restar 5h 10min – 2h 45min.
  * *Minutos:* 10 – 45. ¡No alcanza! Pido 1 hora prestada.
  * *Ajuste:* 5h 10min → 4h 70min. Ahora: 70 – 45 = 25min. 4 – 2 = 2h.
  * *Resultado:* 2 horas y 25 minutos.

* **Ejemplo 3:** Sumar 3h 50min + 2h 50min.
  * *Horas:* 3 + 2 = 5. *Minutos:* 50 + 50 = 100.
  * *Acarreo:* 100 min = 1h 40min. → 5 + 1 = 6h 40min.

* **Ejemplo 4:** Un niño estudia 1h 20min por la mañana y 45min por la tarde. ¿Total?
  * *Suma:* 1h 20min + 0h 45min = 1h 65min = 2h 5min.

* **Ejemplo 5:** Restar 3h 00min – 1h 25min.
  * *Ajuste:* 3h 00min → 2h 60min. Resta: 60 – 25 = 35min. 2 – 1 = 1h.
  * *Resultado:* 1 hora y 35 minutos.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Suma: 1h 45min + 2h 30min. ¿Resultado? `[Input: 4h 15min]`
  * *Feedback Acierto:* ¡Acarreo sexagesimal dominado! 45+30=75 min → 1h 15min. Total: 1+2+1=4h 15min.
  * *Feedback Error:* Suma los minutos: 45+30=75. Como 75 ≥ 60, convierte: 75–60=15 minutos y suma 1 hora extra.

* **Interactivo 2:** Resta: 4h 15min – 1h 50min. ¿Resultado? `[Input: 2h 25min]`
  * *Feedback Acierto:* ¡Préstamo temporal perfecto! 4h 15min → 3h 75min. 75–50=25. 3–1=2h 25min.
  * *Feedback Error:* Como 15 < 50, pide 1 hora: 4h 15min → 3h 75min. Ahora resta: 75–50=25min, 3–1=2h.

* **Interactivo 3:** Un atleta entrena 55 minutos por la mañana y 1h 10min por la tarde. ¿Cuánto entrenó en total? `[Input: 2h 5min]`
  * *Feedback Acierto:* ¡Rutina calculada! 55+70=125 min = 2h 5min.
  * *Feedback Error:* Convierte todo a minutos: 55 + 70 = 125 min. Luego: 125 ÷ 60 = 2h con 5 min sobrantes.

---

### 🚌 MÓDULO 4: HORARIOS Y APPS

#### 👑 Nivel 1: Lectura de tablas de horarios de transporte

**Texto de Aprendizaje:** ¡Bienvenido al Centro de Logística, Planificador Urbano! En la vida real, los horarios de trenes, autobuses y metros se presentan en **tablas de doble entrada**: las filas representan las paradas y las columnas los diferentes viajes del día. Para leer una tabla de horarios debes cruzar dos datos: la **línea** (parada que te interesa) y la **columna** (el viaje o corrida del día). El número que aparece en la intersección es la hora exacta en que el transporte pasa por esa parada en ese viaje específico.

**El Diccionario del Nivel:**

* **Tabla de doble entrada:** Una cuadrícula donde filas y columnas representan categorías diferentes.
* **Celda:** La casilla donde se cruzan una fila y una columna. Contiene el dato que buscas.
* **Horario de salida:** La hora en que el transporte parte de una estación.
* **Horario de llegada:** La hora en que arriba a la estación destino.

⚠️ **¡Cuidado con la Trampa de la Columna Equivocada!** Muchos errores ocurren por leer la columna del viaje incorrecto (ej. leer el horario del bus de las 8:00 cuando necesitabas el de las 9:00). Señala con el dedo la columna correcta antes de buscar tu parada.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Tabla de bus: Salidas a las 7:00, 8:30, 10:00. La parada "Plaza" está 20 min después de la salida. ¿A qué hora pasa el segundo bus por la Plaza?
  * *Paso 1:* Segundo bus sale a las 8:30.
  * *Paso 2:* 8:30 + 20 min = 8:50.
  * *Resultado:* Pasa a las 8:50.

* **Ejemplo 2:** Un tren sale de la Terminal a las 6:15. Llega a la Estación Centro 45 min después. ¿Hora de llegada?
  * *Cálculo:* 6:15 + 45 min = 7:00.

* **Ejemplo 3:** Tabla con 3 paradas y 4 viajes. ¿Cuántas celdas de horario tiene la tabla?
  * *Cálculo:* 3 filas × 4 columnas = 12 celdas.

* **Ejemplo 4:** El bus A sale a las 9:00 y llega a las 9:40. El bus B sale a las 9:15 y llega a las 9:50. ¿Cuál tarda más?
  * *Bus A:* 40 min. *Bus B:* 35 min.
  * *Resultado:* El bus A tarda más (40 min vs. 35 min).

* **Ejemplo 5:** ¿Cuál es el último horario disponible si los trenes salen a las 6:00, 8:00, 10:00 y 12:00?
  * *Resultado:* El último tren sale a las 12:00.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** (Tabla de bus con salidas: 7:00, 9:00, 11:00. Parada "Mercado" = salida + 30 min). ¿A qué hora pasa el bus de las 9:00 por el Mercado? `[Input: 9:30]`
  * *Feedback Acierto:* ¡Lectura de tabla perfecta! 9:00 + 30min = 9:30.
  * *Feedback Error:* Busca la columna del bus de las 9:00. Luego suma los 30 minutos de recorrido hasta el Mercado.

* **Interactivo 2:** Un tren tiene 3 corridas al día: 6:30, 10:30, 14:30. ¿Cuántas horas pasan entre la primera y la última corrida? `[Input: 8]`
  * *Feedback Acierto:* ¡Correcto! De 6:30 a 14:30 = 8 horas exactas.
  * *Feedback Error:* Resta la hora de la última corrida menos la primera: 14:30 – 6:30 = 8 horas.

* **Interactivo 3:** La tabla dice que el metro pasa a las 7:10, 7:25, 7:40, 7:55. ¿Cada cuántos minutos pasa? `[Input: 15]`
  * *Feedback Acierto:* ¡Patrón detectado! 7:25 – 7:10 = 15 minutos de intervalo constante.
  * *Feedback Error:* Resta dos horarios consecutivos: 7:25 – 7:10 = 15 min. Verifica con el siguiente: 7:40 – 7:25 = 15 min.

---

#### 👑 Nivel 2: Tiempos compuestos — viaje + espera + transbordo

**Texto de Aprendizaje:** En el mundo real, un viaje rara vez es directo. Subes a un bus, bajas en una estación, **esperas** unos minutos, y luego tomas **otro transporte**. El tiempo total del viaje es la suma de todos los segmentos: **tiempo de viaje del primer transporte + tiempo de espera + tiempo de viaje del segundo transporte**. Tu superpoder es descomponer cada tramo y sumarlos con la aritmética sexagesimal que ya dominas.

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Bus: 25 min. Espera: 10 min. Metro: 15 min. ¿Tiempo total?
  * *Suma:* 25 + 10 + 15 = 50 minutos.

* **Ejemplo 2:** Caminar a la parada: 8 min. Bus: 40 min. Caminar al destino: 5 min. ¿Total?
  * *Suma:* 8 + 40 + 5 = 53 minutos.

* **Ejemplo 3:** Primer bus: 30 min. Espera: 20 min. Segundo bus: 45 min. Sale a las 7:00. ¿Hora de llegada?
  * *Tiempo total:* 30 + 20 + 45 = 95 min = 1h 35min.
  * *Llegada:* 7:00 + 1h 35min = 8:35.

* **Ejemplo 4:** Tren A: 1h 10min. Espera: 15 min. Tren B: 50 min. ¿Total en minutos?
  * *Suma:* 70 + 15 + 50 = 135 minutos = 2h 15min.

* **Ejemplo 5:** Sofía sale de casa a las 6:50. Camina 10 min a la estación. Espera 5 min. Viaja 35 min. ¿A qué hora llega?
  * *Suma:* 10 + 5 + 35 = 50 min.
  * *Llegada:* 6:50 + 50 min = 7:40.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Bus: 20 min. Espera: 15 min. Metro: 25 min. ¿Tiempo total del viaje? `[Input: 60]`
  * *Feedback Acierto:* ¡Planificador exacto! 20 + 15 + 25 = 60 minutos = 1 hora.
  * *Feedback Error:* Suma cada segmento: tiempo de bus + tiempo de espera + tiempo de metro.

* **Interactivo 2:** Ana sale a las 8:15. Camina 10 min, espera 5 min y viaja 30 min. ¿A qué hora llega? `[Input: 9:00]`
  * *Feedback Acierto:* ¡Logística perfecta! 8:15 + 45 min = 9:00.
  * *Feedback Error:* Total de viaje: 10+5+30=45 min. Suma eso a la hora de salida: 8:15 + 45 min = 9:00.

* **Interactivo 3:** Pedro tiene dos opciones. Ruta A: bus 40 min + espera 20 min + metro 10 min. Ruta B: taxi 55 min. ¿Cuántos minutos se ahorra con la ruta más rápida? `[Input: 15]`
  * *Feedback Acierto:* ¡Decisión inteligente! Ruta A = 70 min, Ruta B = 55 min. Diferencia: 70 – 55 = 15 min.
  * *Feedback Error:* Calcula el total de la Ruta A (40+20+10=70) y compáralo con la Ruta B (55). Resta: 70 – 55.

---

#### 👑 Nivel 3: Optimización — comparar opciones de transporte

**Texto de Aprendizaje:** El Planificador Urbano de élite no solo calcula tiempos: **compara opciones y elige la mejor**. Cuando tienes 2 o 3 rutas posibles, debes calcular el tiempo total de cada una y seleccionar la que te hace llegar más temprano o la que tiene menos transbordos. A veces la ruta "más rápida en transporte" no es la mejor porque tiene una espera muy larga. Aquí entra el análisis comparativo: calculas todo, armas una tabla mental, y decides con datos.

⚠️ **¡Cuidado con la Trampa de la Hora de Salida Diferente!** Si la Ruta A sale a las 8:00 y tarda 50 min (llega 8:50), y la Ruta B sale a las 8:20 y tarda 20 min (llega 8:40), la Ruta B llega antes a pesar de salir después. ¡Lo que importa es la hora de llegada, no la duración del viaje!

**📚 Ejemplos Guiados Estáticos:**

* **Ejemplo 1:** Ruta A: sale 7:00, dura 90 min. Ruta B: sale 7:30, dura 50 min. ¿Cuál llega antes?
  * *Ruta A:* 7:00 + 1h 30min = 8:30. *Ruta B:* 7:30 + 50min = 8:20.
  * *Resultado:* Ruta B llega primero (8:20 < 8:30).

* **Ejemplo 2:** Bus directo: 1h 20min. Bus + metro: 40min + 15min espera + 20min. ¿Cuál es más rápido?
  * *Directo:* 80 min. *Combinado:* 75 min.
  * *Resultado:* El combinado ahorra 5 minutos.

* **Ejemplo 3:** Tres opciones para ir al colegio: A pie (35 min), bicicleta (15 min), bus (espera 10 + viaje 12 = 22 min). ¿La más rápida?
  * *Resultado:* Bicicleta (15 min).

* **Ejemplo 4:** Metro A: sale cada 10 min desde las 6:00. Metro B: sale cada 15 min desde las 6:00. Si llegas a las 6:25, ¿cuál tomas primero?
  * *Metro A:* 6:00, 6:10, 6:20, **6:30**. *Metro B:* 6:00, 6:15, **6:30**.
  * *Resultado:* Ambos salen a las 6:30. Empate.

* **Ejemplo 5:** Ruta escolar sale a las 7:15 y tarda 45 min. El bus público sale a las 7:00 y tarda 1h 10min. ¿Cuál te deja primero en el colegio?
  * *Escolar:* 7:15 + 45 = 8:00. *Bus público:* 7:00 + 70min = 8:10.
  * *Resultado:* La ruta escolar llega primero a las 8:00.

**⚡ Interactivos de Práctica:**

* **Interactivo 1:** Ruta A: sale 9:00, tarda 40 min. Ruta B: sale 9:10, tarda 25 min. ¿A qué hora llega la más rápida? `[Input: 9:35]`
  * *Feedback Acierto:* ¡Estratega del transporte! Ruta B: 9:10 + 25 = 9:35, que es antes que Ruta A (9:40).
  * *Feedback Error:* Calcula la hora de llegada de cada ruta: A → 9:00+40=9:40. B → 9:10+25=9:35. La que tiene hora menor llega antes.

* **Interactivo 2:** Bus: espera 15 min + viaje 30 min = 45 min total. Taxi: 28 min sin espera. ¿Cuántos minutos ahorras con el taxi? `[Input: 17]`
  * *Feedback Acierto:* ¡Calculador financiero! 45 – 28 = 17 minutos de ahorro.
  * *Feedback Error:* Compara los totales: Bus = 45 min, Taxi = 28 min. Resta: 45 – 28.

* **Interactivo 3:** El metro pasa cada 12 minutos desde las 6:00. Si llegas a la estación a las 6:50, ¿a qué hora sale el próximo metro? `[Input: 7:00]`
  * *Feedback Acierto:* ¡Patrón de intervalos dominado! 6:00, 6:12, 6:24, 6:36, 6:48, 7:00.
  * *Feedback Error:* Cuenta múltiplos de 12 desde las 6:00: 6:12, 6:24, 6:36, 6:48, 7:00. El primero después de las 6:50 es las 7:00.

---

## PARTE 3: DISEÑO DE SCRIPTS INYECTORES (PYTHON)

Para poblar la base de datos PostgreSQL de la Fase 7 de manera consistente con el modelo `Server-Authoritative`, el script `seed_fase7.py` usará SQLAlchemy AsyncSession bajo las siguientes reglas:

1. **JSONB para Rutas y Mapas (Módulos 1 y 2):** Las preguntas de cuadrículas inyectarán la topología espacial en `metadata_tecnica` como un objeto JSONB:
   ```json
   {
     "tipo": "cuadricula",
     "ancho": 6, "alto": 6,
     "origen": [1, 1],
     "destino": [4, 5],
     "obstaculos": [],
     "instrucciones": ["N3", "E2", "N1"]
   }
   ```
2. **JSONB para Tablas de Horarios (Módulo 4):** Las tablas se inyectarán como matrices JSON:
   ```json
   {
     "tipo": "tabla_horarios",
     "paradas": ["Terminal", "Plaza", "Centro", "Escola"],
     "corridas": [
       {"salida": "06:30", "tiempos": [0, 15, 30, 45]},
       {"salida": "08:00", "tiempos": [0, 15, 30, 45]}
     ]
   }
   ```
3. **Generación de Familias de Coordenadas:** Para preguntas de plano cartesiano, el script genera pares (X, Y) aleatorios dentro de cuadrículas de 8×8 a 12×12, evitando coordenadas (0,0) y asegurando que el resultado de traslaciones no produzca valores negativos.
4. **Generación de Tiempos (Módulo 3):** Los tiempos se generan con minutos múltiplos de 5 (para simplificación infantil), y las diferencias se validan para evitar resultados negativos o que crucen medianoche en ejercicios de nivel 1 y 2.
5. **Generación de Familias (Práctica Libre):** Se crean 120 familias únicas por nivel (1 original + 3 espejos por familia = 480 preguntas por nivel) compartiendo el `estructura_padre_id`. Las variantes espejo alteran los valores numéricos pero mantienen la estructura del problema.

---

## PARTE 4: MAPEO DE ERRORES JSONB Y TUTOR INVISIBLE

El backend asociará los fallos a diagnósticos cognitivos precalculados en `respuestas_erroneas_jsonb`:

* **Error de Eje Invertido (Módulo 2 — Plano Cartesiano):**
  * *Detonante:* El alumno confunde (X, Y) con (Y, X), escribiendo las coordenadas al revés.
  * *Tutor:* "¡Recuerda la regla del Pasillo y el Ascensor! Primero caminas por el piso (X = derecha) y después subes (Y = arriba). Si el punto dice (3, 5), primero 3 pasos a la derecha y luego 5 arriba."

* **Error de Giro Espejo (Módulo 1 — Orientación):**
  * *Detonante:* El alumno gira en la dirección contraria (izquierda en vez de derecha o viceversa).
  * *Tutor:* "¡Ojo con el giro! Si miras al Norte y giras a la DERECHA, terminas al ESTE (donde sale el sol). Si giras a la IZQUIERDA, terminas al OESTE (donde se pone el sol). Imagina la brújula en tu mente."

* **Error de Acarreo Decimal en Tiempo (Módulo 3):**
  * *Detonante:* El alumno suma 45 + 30 = 75 minutos y escribe "75 min" en vez de "1h 15min".
  * *Tutor:* "¡El reloj no llega a 75 minutos! Cuando la suma de minutos pasa de 60, transforma el exceso: 75 – 60 = 15 minutos, y súmale 1 hora extra al total."

* **Error de Hora Fantasma (Módulo 3 — Cruce de AM/PM):**
  * *Detonante:* El alumno resta 14:00 – 8:00 = 6 pero se confunde con formato 12h.
  * *Tutor:* "¡Cuidado con las 12! Las 14:00 en formato 24h son las 2:00 PM. Si un evento va de las 8:00 AM a las 2:00 PM, la duración es 6 horas. Usa siempre el formato de 24 horas para restar sin confundirte."

* **Error de Columna Cruzada en Tablas (Módulo 4):**
  * *Detonante:* El alumno lee la hora de la corrida equivocada en la tabla de horarios.
  * *Tutor:* "¡Detente y señala! Antes de leer el horario, usa tu dedo para trazar la línea desde tu parada (fila) hasta la columna correcta del viaje. No saltes columnas, verifica el encabezado."

---

## PARTE 5: INTEGRACIÓN ARQUITECTÓNICA Y UX/UI

La Fase 7 extiende los estándares de diseño mediante componentes visuales interactivos especializados:

### Estética General: "Centro de Control de Navegación"
* **Paleta cromática:** Fondos oscuros (`slate-950`) con trazados cian brillante (`#06B6D4`), brújulas neón doradas (`#FFC800`) y elementos cartográficos minimalistas.
* **Color del Módulo (Acento):** Teal/Cian (`bg-teal-500`, `shadow-teal-500/50`).

### Componentes Interactivos Especializados

1. **El Radar Cartesiano (Módulo 2 — Plano de Coordenadas):**
   * Plano cartesiano holográfico con ejes X e Y renderizado en SVG, simulando una pantalla de radar.
   * Al colocar un "marcador", líneas guía temporales cruzan los ejes para evidenciar el par `(X, Y)`.
   * Los puntos se arrastran al destino exacto solicitado por el problema.
   * El backend envía la topología: `{"tipo": "plano_cartesiano", "puntos_destino": [[3,5]], "grid_size": 8}`.

2. **El Tablero de Exploración (Módulo 1 — Mapas y Rutas):**
   * Vista cenital de cuadras (grids urbanos) con iconos de edificios, árboles y calles.
   * Controles direccionales (N, S, E, O) mediante los cuales el niño traza el trayecto dejando una "estela de luz" cian que se pinta a medida que avanza.
   * Botones de giro (90° izquierda/derecha) con animación de rotación del avatar.

3. **Panel de Cronología y Relojes (Módulo 3):**
   * Reloj analógico interactivo con manecillas arrastrables para calcular tiempos.
   * Reloj digital sincronizado que muestra el formato 24h.
   * Barra de itinerario visual que se llena en segmentos de colores según cada tramo del viaje.

4. **Tabla de Horarios Interactiva (Módulo 4):**
   * Tablas de doble entrada con resaltado de celda al pasar el cursor.
   * Al seleccionar una parada y una corrida, la celda se ilumina en dorado neón.
   * Comparador visual de rutas: dos columnas paralelas que se llenan en tiempo real mostrando cuál ruta llega primero.

### Feedback Pedagógico Especializado
* **Error en Plano Cartesiano:** El sistema proyecta flechas rojas animadas primero sobre la línea horizontal ("Paso 1: caminar por el piso → X") y luego la vertical ("Paso 2: subir el edificio → Y"), para corregir el orden de lectura.
* **Error en Rutas:** La estela de luz del trayecto se tiñe de rojo en el tramo donde el alumno se equivocó, y una flecha verde muestra la dirección correcta.
* **Error en Tiempos:** Se despliega un mini-reloj animado que avanza visualmente minuto a minuto desde la hora de inicio hasta la hora correcta, mostrando el acarreo sexagesimal en acción.

### Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.
* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.

### Notas de Implementación Técnica
* **JSONB para Rutas y Mapas:** Las preguntas de rutas en cuadrícula y plano cartesiano se envían como listas de puntos o vectores para que el frontend dibuje el mapa de forma determinista y segura.
* **Renderizado SVG Controlado:** El frontend NO dibuja gráficos por sí solo. El backend envía la topología JSON y el frontend la renderiza.
* **Input Híbrido (Coordenadas):** La caja de entrada detectará si se requiere un par ordenado y mostrará dos casillas horizontales `(X, Y)` con separador visual de coma, o un input estándar para respuestas numéricas simples.