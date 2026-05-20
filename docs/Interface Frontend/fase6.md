# Especificación de Interfaz de Usuario: Fase 6 — Geometría Espacial

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 6 de LogicaKids Pro**, orientada a desarrollar la visualización 3D y el volumen mediante unidades cúbicas, apoyándose fuertemente en estéticas tipo "Minecraft" (2020 Q18, 2024 Q18).

---

## 1. Propósito Pedagógico

* **Objetivo General**: Desarrollar la visualización 3D y el concepto de volumen a través del conteo de unidades cúbicas, alineado con las preguntas de bloques y estructuras del examen.

### 1.1. Estructura de Módulos

| Módulo | Nivel 1: Descubrimiento | Nivel 2: Consolidación | Nivel 3: Fluidez (Integración) |
| :--- | :--- | :--- | :--- |
| **1. Reconocimiento 3D** | Diferenciar prismas, pirámides, cilindros y esferas. | Identificar las caras ocultas de un sólido apoyado en el suelo. | Asociar moldes bidimensionales (planificaciones) con su sólido. |
| **2. Patrones de Crecimiento**| Progresiones espaciales (sumar capas base a una pirámide). | Contar bloques en estructuras simétricas (árboles Minecraft - 2020 Q18). | Predecir la cantidad de piezas de la etapa 10 de un patrón. |
| **3. Cubos Unitarios** | Contar cubos en bloques compactos regulares (largo x ancho x alto). | Contar cubos en figuras huecas o rompecabezas 3D. | Volumen de piezas encajadas (tetris 3D / cubo perfecto - 2024 Q18). |

### 1.2. Estructura de Evaluación
*   **Desafío 1 (Estándar):** Evalúa los niveles de descubrimiento y consolidación con opciones múltiples.
*   **Desafío 2 (Avanzado):** Integra habilidades de todos los módulos con mayor complejidad.
*   **Desafío Final (Maestría):** Exige la resolución mediante input de texto puro, con un criterio de aprobación estricto del 90%.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase se apoya fuertemente en representaciones isométricas y visualizadores 3D simulados o interactivos.

### 2.1. El Visualizador de Sólidos y Vistas
* **Visualizador**: Un lienzo central donde se renderiza un sólido geométrico interactivo (estilo Voxel/Minecraft o WebGL).
* **Interactividad**: El alumno puede arrastrar con el dedo o el ratón para rotar el objeto 360 grados. Cuenta con botones rápidos para cambiar entre "Vista Superior", "Vista Frontal" y "Vista Lateral".

### 2.2. Constructor de Cubos Unitarios
* **Visualizador**: Una cuadrícula base isométrica sobre la que reposan bloques.
* **Interactividad**: El alumno puede tocar partes vacías de la cuadrícula para "apilar" cubos translúcidos de colores neón, para completar prismas y deducir cuántos bloques faltan para rellenar un volumen específico.

### 2.3. Animador de Planificaciones (Moldes)
* **Visualizador**: Un polígono plano 2D que actúa como un molde de cartón.
* **Interactividad**: Un deslizador interactivo (slider) que el alumno puede arrastrar para "doblar" virtualmente las caras de la figura, observando cómo un plano se cierra hasta formar una figura 3D (ej. una caja).

---

## 3. Estilo Visual y Feedback

* **Estética**: Entornos isométricos limpios, iluminación direccional y sombras proyectadas para enfatizar los vértices, aristas y profundidad geométrica.
* **Feedback Pedagógico**: En problemas de conteo de volumen (cubos unitarios), un error acciona un "despiece explosivo": el bloque gigante se separa en sus niveles horizontales para que el niño descubra visualmente los bloques ocultos que olvidó contar.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de configuraciones 3D, mapas de matrices de vóxeles e imágenes SVG desde PostgreSQL.
### 4.1. Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.

---

## 5. Notas de Implementación Técnica

*   **JSONB para Patrones:** Las preguntas de conteo de bloques y visualización 3D deben generarse paramétricamente en el backend y enviarse al frontend como una lista de coordenadas de vóxeles (ej. `[{"x": 0, "y": 0, "z": 0, "color": "wood"}]`) para que una librería como `three.js` o un motor de renderizado isométrico dibuje la escena de forma determinista.

* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.