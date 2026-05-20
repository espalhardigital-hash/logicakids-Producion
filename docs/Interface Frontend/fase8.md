# Especificación de Interfaz de Usuario: Fase 8 — Probabilidad, Combinatoria y Lógica

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 8 de LogicaKids Pro**, orientada al desarrollo del razonamiento probabilístico, cálculo combinatorio elemental, detección de patrones lógicos secuenciales y dominio conceptual de divisores y múltiplos.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Entrenar al alumno en la deducción lógica abstracta y el análisis combinatorio, dotándole de herramientas para predecir escenarios (probabilidad de eventos simples), estructurar agrupaciones lógicas de objetos y resolver rompecabezas numéricos y de secuencia.
* **Habilidades Desarrolladas**:
  1. Comprensión conceptual de posibilidad (casos favorables / casos totales) mediante experimentos visuales.
  2. Pensamiento combinatorio estructurado (árboles de decisión y combinaciones de ropa/colores).
  3. Reconocimiento de leyes de formación en sucesiones y series lógicas.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase requiere una interfaz **mentalmente estimulante, limpia y rica en micro-animaciones reactivas**.

### 2.1. La Máquina de Ruleta y Urnas (Probabilidad)
* **Visualizador**: Una urna de cristal brillante translúcida que contiene bolas de colores neón (ej. 3 verdes, 5 rojas) o una ruleta de sectores coloridos.
* **Interactividad**:
  - El alumno puede pulsar sobre la ruleta para hacerla girar físicamente con animación de desaceleración.
  - La pregunta requiere calcular la probabilidad de obtener un color específico (ej. *"¿Qué probabilidad hay de sacar una bola verde?"*).
  - Un panel a la derecha desglosa la fracción de probabilidad interactiva: `[ Casos Favorables (Verdes: 3) ] / [ Casos Totales (Total: 8) ]`.

### 2.2. El Probador de Combinaciones (Combinatoria)
* **Visualizador**: Un maniquí o avatar al que se le deben equipar prendas (ej. 3 camisetas de colores y 2 pantalones diferentes) representados como tarjetas de cartas interactivas.
* **Interactividad**:
  - El niño arrastra las prendas sobre el maniquí. A medida que arma una combinación, esta se registra en un **Diagrama de Árbol** lateral que se va dibujando dinámicamente con líneas luminosas.
  - El objetivo es calcular cuántas combinaciones distintas de ropa se pueden armar en total.

### 2.3. El Reparador de Patrones (Lógica y Secuencias)
* **Visualizador**: Una cinta transportadora que lleva una fila de gemas con formas y patrones numéricos.
* **Interactividad**:
  - Hay un "eslabón roto" en la serie (representado con un destello parpadeante `?`).
  - El niño debe arrastrar de un cajón de opciones la figura o número que continúa lógicamente la secuencia matemática o visual.

---

## 3. Estilo Visual y Feedback

* **Estética**: Acabados tipo gema pulida y cristal de cuarzo. Animaciones físicas de rebotes realistas para las bolas de la urna (`matter.js` o animaciones CSS 2D con simulación de gravedad sutil).
* **Feedback de Aciertos**: El maniquí brilla en arcoíris o la secuencia de gemas se enciende en un flujo continuo de luz dorada, revelando el "Patrón Resuelto".
* **Feedback Pedagógico**: En caso de error en combinatoria, el sistema realiza todas las combinaciones posibles en cámara rápida en la pantalla para mostrar visualmente el resultado de la multiplicación: `3 x 2 = 6 caminos diferentes`.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Preguntas preparadas de lógica y secuencias numéricas/visuales en BD.
* **Habilitadores Clave**: Uso de gráficos vectoriales (SVG) responsivos para la ruleta, urnas y diagramas de árbol, garantizando una excelente tasa de refresco.

### 4.1. Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.
* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.
