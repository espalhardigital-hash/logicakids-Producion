# Especificación de Interfaz de Usuario: Fase 5 — Geometría Plana

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 5 de LogicaKids Pro**, enfocada en el reconocimiento de figuras geométricas bidimensionales, el cálculo experimental de perímetro y área, y la resolución de puzzles espaciales (Tangram).

---

## 1. Propósito Pedagógico

* **Objetivo General**: Fomentar la percepción espacial del alumno en el plano 2D, comprendiendo las propiedades de cuadrados, rectángulos y triángulos, aprendiendo a calcular el contorno (perímetro) y la superficie (área) mediante cuadrículas, y manipulando formas complejas.
* **Habilidades Desarrolladas**:
  1. Identificación y clasificación de polígonos por lados y vértices.
  2. Comprensión concreta y abstracta del concepto de área (conteo de unidades cuadradas).
  3. Razonamiento espacial y rotación de figuras para armar siluetas geométricas.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase requiere una interfaz interactiva y lúdica de **manipulación directa de formas**.

### 2.1. El Tablero de Rejilla (Áreas y Perímetros)
* **Visualizador**: Una cuadrícula o rejilla de puntos interactiva (`dot-grid`) con estética cyberpunk.
* **Interactividad**:
  - Se dibuja una figura brillante sobre la rejilla.
  - El alumno puede pulsar en los bordes de la figura para ver cómo se ilumina un camino de neón que explica el concepto de **Perímetro** (contando unidades de longitud).
  - El alumno puede pulsar en el interior de la figura para rellenar los "cuadraditos de rejilla" uno a uno, comprendiendo que el **Área** es la suma de los cuadrados interiores.
  - Contadores visuales de apoyo a la fórmula matemática en la barra lateral.

### 2.2. El Rompecabezas Tangram Interactivo
* **Visualizador**: Un lienzo central donde se muestra una silueta oscura (ej. un gato, un barco o un pato formado por figuras geométricas) y un juego de piezas de colores brillantes (triángulos, cuadrados, paralelogramos) a un lado.
* **Interactividad**:
  - El niño puede arrastrar (`drag and drop`) las piezas hacia la silueta.
  - El niño puede dar doble clic en una pieza o usar dos dedos en móviles para **rotar la pieza 45 grados** de forma suave.
  - Efecto de atracción (snap): Al arrastrar la pieza y soltarla cerca de su posición correcta en la silueta, esta encaja magnéticamente con un destello brillante y un sonido satisfactorio.

---

## 3. Estilo Visual y Feedback

* **Estética**: Colores neón súper contrastantes para diferenciar las figuras (triángulos cian, cuadrados amarillos, rectángulos fucsias) sobre un fondo negro profundo.
* **Feedback de Aciertos**: La figura completada se enciende con un gradiente arcoíris fluido y se despliega una animación de fuegos artificiales vectoriales.
* **Feedback Pedagógico**: En caso de error de cálculo de área, el sistema resalta la cuadrícula en un color cálido y cuenta en voz alta o muestra números correlativos del 1 al N sobre cada bloque interior para guiar al alumno.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Ejercicios en BD que almacena posiciones relativas de siluetas y fórmulas de áreas/perímetros.
* **Habilitadores Clave**: Uso intensivo de la librería de física e interacción HTML5 Drag-and-Drop o `react-rnd`/`framer-motion` para una manipulación fluida y suave de las piezas de Tangram.
