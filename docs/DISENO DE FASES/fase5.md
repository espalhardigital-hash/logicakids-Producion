# Especificación de Interfaz de Usuario: Fase 5 — Geometría Plana y Medidas

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 5 de LogicaKids Pro**, enfocada en dominar la malha quadriculada (cuadrícula), áreas compuestas, perímetros y escalas. Este es un núcleo fuerte del examen (ej. teclado iKeybo 2020 Q11, Tangram 2024 Q14).

---

## 1. Propósito Pedagógico

* **Objetivo General**: Dominar la cuadrícula, el cálculo de áreas compuestas, perímetros y la aplicación de escalas, habilidades centrales en el examen.

### 1.1. Estructura de Módulos

| Módulo | Nivel 1: Descubrimiento | Nivel 2: Consolidación | Nivel 3: Fluidez (Integración) |
| :--- | :--- | :--- | :--- |
| **1. Perímetro y Borde** | Contar el contorno exterior en mallas cuadradas simples. | Calcular perímetro de polígonos irregulares sumando lados. | Conversión lineal básica (ej. 2,68 dm a cm - 2020 Q11). |
| **2. Área en Malha** | Contar cuadraditos completos (unidad de área). | Unir medios cuadrados (triángulos) para formar unidades enteras. | Calcular el área de figuras complejas (ej. bandera junina - 2020 Q19). |
| **3. Figuras Compuestas** | Rompecabezas geométricos: encajar piezas. | Identificar el área proporcional en un Tangram (2024 Q14). | Restar el área interior ("el hueco") de una figura exterior. |
| **4. Conversión y Pantallas**| Noción de área real vs área dibujada. | La diagonal como medida estándar (ej. pulgadas de TV - 2024 Q13). | Unidades cuadradas cotidianas (cm², m²). |

### 1.2. Estructura de Evaluación
*   **Desafío 1 (Estándar):** Evalúa los niveles de descubrimiento y consolidación con opciones múltiples.
*   **Desafío 2 (Avanzado):** Integra habilidades de todos los módulos con mayor complejidad.
*   **Desafío Final (Maestría):** Exige la resolución mediante input de texto puro, con un criterio de aprobación estricto del 90%.

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

---

## 5. Notas de Implementación Técnica

*   **JSONB para Patrones:** Las preguntas de cuadrículas y figuras compuestas deben generarse paramétricamente en el backend y enviarse al frontend como una lista de coordenadas (ej. `[{"x": 1, "y": 2, "tipo": "full"}]`) para que React dibuje el SVG de forma determinista, evitando la carga de imágenes pesadas.
*   **Restricción de Flotantes:** Para el módulo de Perímetros y Conversiones, el backend debe realizar todos los cálculos internamente usando la unidad más pequeña como entero (ej. milímetros) para evitar errores de precisión de punto flotante (IEEE 754). La conversión a formato decimal con coma solo se realiza en la capa de presentación (UI).

### 4.1. Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.
* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.
