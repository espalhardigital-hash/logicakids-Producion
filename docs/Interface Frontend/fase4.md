# Especificación de Interfaz de Usuario: Fase 4 — Fracciones, Porcentajes y Proporciones

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 4 de LogicaKids Pro**, orientada a la visualización de la relación "parte-todo". El examen del Pedro II es sumamente gráfico en este aspecto (ej. áreas sombreadas 2023 Q19, gráficos circulares 2023 Q15, mezclas de pintura 2023 Q18).

---

## 1. Propósito Pedagógico

* **Objetivo General**: Visualizar la relación "parte-todo", dominar porcentajes rápidos y aplicar el razonamiento proporcional a mezclas y repartos, alineado con el enfoque gráfico del examen.

### 1.1. Estructura de Módulos

| Módulo | Nivel 1: Descubrimiento | Nivel 2: Consolidación | Nivel 3: Fluidez (Integración) |
| :--- | :--- | :--- | :--- |
| **1. La Fracción Visual** | Identificar la fracción sombreada en figuras simétricas simples. | Fracciones equivalentes visuales (cortar la figura en más pedazos). | Analizar rectángulos divididos asimétricamente (2023 Q19). |
| **2. Fracción de Cantidad** | Calcular 1/2, 1/3 y 1/4 de números enteros (inventarios). | Calcular fracciones compuestas (ej. 3/4 de 120 alumnos). | Resolver historias donde se pide "la fracción del resto". |
| **3. Porcentajes Rápidos** | Relacionar 50% (mitad), 25% (cuarto) y 10% (décima parte). | Extraer datos directos de gráficos circulares (pie charts - 2023 Q15). | Gráficos de barras comparativos (ej. empresas por región - 2020 Q20). |
| **4. Razón y Mezclas** | Proporciones simples: "2 tazas de agua por 1 de arroz". | Escalar mezclas totales (ej. 2 de azul y 3 de rojo para 70L - 2023 Q18). | Reparto proporcional en contextos cotidianos. |

### 1.2. Estructura de Evaluación
*   **Desafío 1 (Estándar):** Evalúa los niveles de descubrimiento y consolidación con opciones múltiples.
*   **Desafío 2 (Avanzado):** Integra habilidades de todos los módulos con mayor complejidad.
*   **Desafío Final (Maestría):** Exige la resolución mediante input de texto puro, con un criterio de aprobación estricto del 90%.

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

### 4.1. Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.
* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.
