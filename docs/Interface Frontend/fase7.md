# Especificación de Interfaz de Usuario: Fase 7 — Coordenadas y Desplazamientos

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 7 de LogicaKids Pro**, orientada a la ubicación de puntos en el plano cartesiano, el uso de coordenadas de pares ordenados $(x, y)$, la navegación mediante direcciones cardinales y la programación lógica de trayectorias.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Enseñar al alumno a orientarse y codificar desplazamientos sobre una rejilla bidimensional estructurada, comprendiendo el significado de las coordenadas X e Y, y desarrollando nociones sólidas de lateralidad (izquierda/derecha) y puntos cardinales (Norte, Sur, Este, Oeste).
* **Habilidades Desarrolladas**:
  1. Ubicación de puntos en el plano de coordenadas del primer cuadrante.
  2. Planificación lógica de secuencias de movimiento (rutas sin colisiones).
  3. Conversión de instrucciones direccionales en desplazamientos geométricos exactos.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase adopta un diseño lúdico similar a un **juego de exploración espacial o arqueología de mapas**.

### 2.1. El Radar Cartesiano (El Plano Rejilla)
* **Visualizador**: Un plano cartesiano iluminado en azul neón (`border-slate-800 bg-slate-950/80`) con los ejes X (horizontal) e Y (vertical) claramente señalizados con números de escala brillantes.
* **Interactividad**:
  - **Pintor de Puntos**: Al hacer clic en una intersección de la rejilla, aparece una estrella de luz y se revela el par ordenado (ej. `(3, 5)`).
  - **El Tesoro Escondido**: El sistema le pide al alumno: *"Desentierra la gema oculta en la coordenada (4, 2)"*. El alumno debe pulsar en la intersección correcta. Si acierta, la gema brilla y sale a la superficie.

### 2.2. El Panel del Programador de Rutas (Izquierda / Base)
* **Visualizador**: Un conjunto de bloques de instrucciones lógicas sencillas (ej. `[ Mover Norte 2 ]`, `[ Mover Este 3 ]`, `[ Girar Derecha ]`).
* **Interactividad**:
  - El alumno ensambla una secuencia de bloques para guiar a un avatar (un pequeño robot o cohete espacial) desde un punto de partida A hasta un punto de llegada B en la rejilla, sorteando asteroides u obstáculos fijos.
  - Al hacer clic en "Ejecutar Misión" (`Play`), el avatar se mueve paso a paso sobre el plano con una animación fluida siguiendo los comandos programados.

### 2.3. La Rosa de los Vientos
* Un widget interactivo de brújula en una esquina del mapa que sirve como leyenda de referencia rápida de las direcciones cardinales (N, S, E, O).

---

## 3. Estilo Visual y Feedback

* **Estética**: Estilo Sci-Fi retro-futurista, con efectos de barrido de radar sobre la cuadrícula y luces de rastro parpadeantes en los caminos recorridos.
* **Feedback de Aciertos**: El cohete despega o el robot celebra con un baile de luces intermitentes, encendiendo toda la trayectoria en un verde neón brillante.
* **Feedback Pedagógico**: Si el niño comete un error de lateralidad o choca con un obstáculo, el avatar regresa a la última posición segura y la rejilla parpadea suavemente en rojo, iluminando las flechas del eje X e Y correspondientes al par de coordenadas para guiarlo paso a paso.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Ejercicios en BD que guarda matrices de mapas de laberintos de coordenadas y obstáculos.
* **Habilitadores Clave**: Uso de animaciones CSS fluidas para los desplazamientos paso a paso del avatar y eventos interactivos en el SVG de la rejilla para clics de precisión.
