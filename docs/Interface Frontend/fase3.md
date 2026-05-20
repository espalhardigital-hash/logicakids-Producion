# Especificación de Interfaz de Usuario: Fase 3 — Problemas de Texto y Sistemas Simples

Esta especificación detalla las reglas de diseño visual e interacción para la **Fase 3 de LogicaKids Pro**, enfocada en dominar la lectura matemática, el filtrado de distractores y la deducción de valores ocultos (sistemas de ecuaciones camuflados).

---

## 1. Propósito Pedagógico

* **Objetivo General**: Dominar la lectura matemática, el filtrado de distractores y la deducción de valores ocultos (sistemas de ecuaciones camuflados). Basado en las preguntas de compras simultáneas (ej. 2024 Q16) y secuencias de eventos (ej. 2024 Q15).

### 1.1. Estructura de Módulos

| Módulo | Nivel 1: Descubrimiento | Nivel 2: Consolidación | Nivel 3: Fluidez (Integración) |
| :--- | :--- | :--- | :--- |
| **1. Traducción y Filtro** | Subrayar datos útiles mediante tokens (herramienta interactiva). | Ignorar datos basura en historias largas de 1 solo paso. | Resolver problemas con distractores numéricos explícitos. |
| **2. Secuencia Temporal** | Problemas de "Tenía, ganó, perdió" en estricto orden cronológico. | Control de eventos invertidos (hallar el valor inicial). | Historias de 3 pasos (ej. Luiz y las figuritas de bafo - 2024 Q15). |
| **3. Deducción de Precios** | Comparar dos carritos de compra idénticos con 1 diferencia para aislar el valor unitario. | Completar tablas de precios faltantes cruzando datos de clientes. | Sistemas simples: "Si 4 libros y 2 cuadernos cuestan R$ 457..." (2023 Q17). |
| **4. Reparto y Residuos** | Problemas de división exacta a partir de un inventario macro. | Divisiones con residuo: empaquetar objetos donde sobran elementos. | Ciclos repetitivos (ej. predecir un patrón circular usando el resto de la división). |

### 1.2. Estructura de Evaluación
*   **Desafío 1 (Estándar):** Evalúa los niveles de descubrimiento y consolidación con opciones múltiples.
*   **Desafío 2 (Avanzado):** Integra habilidades de todos los módulos con mayor complejidad.
*   **Desafío Final (Maestría):** Exige la resolución mediante input de texto puro, con un criterio de aprobación estricto del 90%.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase adopta una interfaz de **investigación y diagnóstico paso a paso**.

### 2.1. Sección 1: El Cuaderno del Detective (Izquierda)
* Un lienzo de texto interactivo que imita una hoja de libreta digital con fondo oscuro translúcido (`bg-slate-900/40 backdrop-blur-md`).
* **Subrayado Interactivo**: El niño puede pulsar o hacer clic sobre palabras o números en el enunciado para "resaltarlos" como **Datos Importantes** (destello verde) o **Datos Distractores** (destello rojo/gris).

### 2.2. Sección 2: La Estantería de Datos (Derecha / Base)
* Tarjetas flotantes que se van rellenando a medida que el alumno identifica los elementos en el enunciado:
  - **Caja de Pregunta Principal**: Campo para colocar o seleccionar qué es exactamente lo que el problema pide calcular.
  - **Caja de Datos Numéricos**: Lista de los valores clave aislados (ej. *35 caramelos*, *12 bolsas*).

### 2.3. Sección 3: Constructor de Operaciones
* Una zona de "arrastrar y soltar" o selección múltiple donde el niño ensambla la ecuación para resolver el problema:
  - Espacio interactivo: `[ Dato A ]   [ Operador (+, -, *, /) ]   [ Dato B ]   =   [ Resultado ]`
  - Feedback visual inmediato: Si el niño elige una operación que no corresponde a la lógica del texto, la interfaz le guiará sutilmente resaltando la palabra clave en el enunciado (ej. *"repartir"* $\rightarrow$ resalta en azul, sugiriendo división).

---

## 3. Estilo Visual y Feedback

* **Estética**: Acorde a la identidad global (cyberpunk, glassmorphism con fondos profundos `slate-950`).
* **Feedback de Aciertos**: Animación de resolución de enigma (ej. lupas o destellos cian/púrpura flotando).
* **Feedback Pedagógico (Tutoría Invisible)**: En caso de error, no dar la respuesta, sino desglosar la libreta explicando: *"¿Notaste que el problema nos dice que Carlos 'regaló' sus juguetes? Eso significa que su cantidad disminuyó. ¿Qué operación deberíamos usar?"*.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Ejercicios Preparados en PostgreSQL.
* **Estructura Requerida**:
  - Enunciado claro y adecuado para niños de primaria.
  - Al menos 1 dato irrelevante (distractor) para evaluar la atención selectiva.
  - Explicación de tutoría estructurada por pasos.

### 4.1. Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.
* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.
