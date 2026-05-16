# Especificación de Interfaz de Usuario: Fase 3 — Problemas de Texto

Esta especificación detalla las reglas de diseño visual e interacción para la **Fase 3 de LogicaKids Pro**, enfocada en la lectura comprensiva, identificación de datos y resolución analítica de problemas matemáticos contextualizados.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Capacitar al alumno para leer críticamente enunciados matemáticos, aislar datos relevantes de distractores, elegir la operación matemática correcta y estructurar la resolución en pasos ordenados.
* **Habilidades Desarrolladas**:
  1. Comprensión lectora aplicada a las ciencias exactas.
  2. Pensamiento analítico (clasificación de información: importante vs distractor).
  3. Secuenciación y planificación de operaciones en múltiples etapas.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase abandona la velocidad del cálculo mental puro y adopta una interfaz de **investigación y diagnóstico paso a paso**.

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
