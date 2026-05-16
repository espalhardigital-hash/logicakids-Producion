# Especificación de Interfaz de Usuario: Fase 6 — Geometría Espacial

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 6 de LogicaKids Pro**, enfocada en el desarrollo de la inteligencia espacial tridimensional (3D), el reconocimiento y disección de cuerpos geométricos (prismas, cilindros, esferas) y el conteo analítico de bloques tridimensionales.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Desarrollar en el alumno la capacidad de visualizar, rotar mentalmente y analizar objetos en tres dimensiones, comprendiendo las propiedades de volumen y capacidad de cuerpos geométricos.
* **Habilidades Desarrolladas**:
  1. Rotación y proyección espacial de sólidos (identificación de caras, aristas y vértices).
  2. Conteo tridimensional analítico (conteo de bloques apilados, incluyendo bloques ocultos a la vista directa).
  3. Concepto físico y matemático de volumen en prismas rectangulares y cilindros.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase requiere una interfaz **interactiva en 3D (o pseudo-3D)** responsiva, limpia y de alto rendimiento.

### 2.1. El Visualizador de Sólidos Rotativo
* **Visualizador**: Un contenedor central que aloja un cuerpo geométrico (ej. un cubo, pirámide o cilindro) renderizado con sombreado tridimensional sutil (`Three.js` o SVG con proyección isométrica responsiva).
* **Interactividad**:
  - El alumno puede arrastrar el cursor o deslizar el dedo en la pantalla para **rotar el sólido 360 grados** libremente en cualquier eje.
  - Al pulsar sobre un vértice, una arista o una cara, esta se ilumina con una luz de neón vibrante, sumando +1 a los contadores interactivos de la UI (ej. *Caras: 6, Aristas: 12, Vértices: 8*).

### 2.2. El Rompecabezas de Apilamiento de Bloques
* **Visualizador**: Una estructura isométrica tridimensional compuesta por cubos apilados al azar (estilo Minecraft/isométrico).
* **Interactividad**:
  - La pregunta requiere que el niño cuente cuántos bloques componen la figura.
  - El niño puede pulsar un botón "Rayos X" o "Girar Cámara" para ver la figura desde la parte trasera o de perfil, permitiendo detectar los bloques de soporte ocultos.
  - Se pueden "romper" o "desaparecer" bloques individuales al tocarlos para que el alumno cuente de manera manipulativa.

### 2.3. Simulador de Llenado (Volumen)
* **Visualizador**: Un prisma o cilindro hueco con un grifo animado en la parte superior.
* **Interactividad**:
  - El alumno vierte agua virtual (representando metros cúbicos o litros) y observa cómo sube el volumen paso a paso.
  - El sistema muestra de manera visual la multiplicación matemática: `Ancho x Largo x Alto = Volumen total`.

---

## 3. Estilo Visual y Feedback

* **Estética**: Renderizados semi-translúcidos con bordes brillantes tipo cristal (glassmorphism en 3D), luces direccionales de neón que realzan la volumetría y transiciones de cámara cinemáticas tridimensionales muy fluidas.
* **Feedback de Aciertos**: El sólido 3D se desarma dinámicamente en sus planos de desarrollo (red de caras desplegada en el piso) con un efecto de partículas luminosas.
* **Feedback Pedagógico**: Si el niño se equivoca al contar bloques, la cámara gira lentamente a una vista superior plana (planta) o explota la figura en capas separadas para mostrar claramente dónde estaban los bloques ocultos.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Ejercicios en BD con coordenadas de mallas 3D o matrices de bloques isométricos.
* **Habilitadores Clave**: Uso de librerías WebGL ligeras como `React Three Fiber` o renders isométricos SVG optimizados en CSS para garantizar que funcione suave a 60 FPS en celulares de gama media y baja.
