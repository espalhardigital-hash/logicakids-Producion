# Especificación de Interfaz de Usuario: Fase 4 — Fracciones, Porcentajes y Gráficos

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 4 de LogicaKids Pro**, orientada a la manipulación visual de la relación parte-todo, la comprensión de porcentajes y el análisis crítico de información gráfica/estructurada.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Desarrollar la capacidad de razonar de manera concreta y abstracta sobre partes de un entero (fracciones), equivalencias de escala (porcentajes) y consolidar la lectura e interpretación de gráficos y tablas de datos.
* **Habilidades Desarrolladas**:
  1. Comprensión conceptual y visual de fracciones y denominadores.
  2. Razonamiento proporcional (porcentajes de cantidades).
  3. Extracción y síntesis de datos representados visualmente (gráficos de barras y sectores).

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase se enfoca en componentes **altamente visuales, manipulativos y coloridos**.

### 2.1. El Cortador de Pizza Interactivo (Fracciones)
* **Visualizador**: Un objeto circular 2D (ej. pizza, pastel o gema) dividido dinámicamente en $N$ porciones configurables.
* **Interactividad**:
  - El alumno puede arrastrar un slider para variar el denominador (partir el círculo en 2, 3, 4, 6 u 8 partes).
  - El alumno puede pulsar sobre porciones específicas para colorearlas, representando el numerador de forma interactiva.
  - Ecuación dinámica sincronizada: Al pintar las rebanadas, se actualiza en tiempo real la fracción en pantalla (ej. `3/8`).

### 2.2. El Termómetro de Porcentajes
* **Visualizador**: Una barra vertical estilo batería o termómetro que se llena dinámicamente.
* **Interactividad**:
  - El niño desliza una perilla para indicar una equivalencia de porcentaje (ej. *"Llena el termómetro hasta el 50% de su capacidad"*).
  - Efectos visuales: Cambios de color reactivos (de azul frío a rosa caliente) y destellos numéricos a medida que se alcanzan valores de referencia (25%, 50%, 75%, 100%).

### 2.3. Panel de Gráficos y Tablas Reactivas
* **Visualizador**: Gráficos de barras minimalistas con colores neón o tablas de datos sencillas en glassmorphism.
* **Interactividad**:
  - Al pulsar sobre una barra del gráfico, se despliega una ficha que revela el número exacto que representa.
  - La pregunta interactiva requiere que el niño compare barras o sume valores representados para responder un cuestionario en base al gráfico.

---

## 3. Estilo Visual y Feedback

* **Estética**: Neon-Glow y animaciones de llenado fluidas (`framer-motion` para transiciones de barras y rebanadas).
* **Feedback de Aciertos**: Explosión de confeti digital en tonos cian y esmeralda.
* **Feedback Pedagógico**: En caso de error en fracciones, la pizza se reorganiza visualmente para comparar: *"Mira, dividiste en 4 partes y tomaste 2. Eso es exactamente la mitad, ¡igual que 2/4!"*.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Ejercicios en BD combinados con layouts SVG interactivos del frontend.
* **Habilitadores Clave**: Uso de SVG responsivos y adaptables para asegurar que las pizzas y gráficos se rendericen nítidos en cualquier pantalla.
