# Especificación de Interfaz de Usuario: Fase 1 — Calentamiento Aritmético (Fase 0)

Esta fase representa la base matemática y el calentamiento aritmético de la plataforma **LogicaKids Pro**. Consiste en un juego interactivo de cálculo mental veloz y generación 100% dinámica que evalúa y refuerza las destrezas operativas elementales de los alumnos antes de adentrarse en dinámicas lógicas abstractas.

---

## 1. Propósito Pedagógico y Objetivo

* **Objetivo General**: Asegurar la nivelación, agilidad y maestría operativa del alumno en las cuatro disciplinas matemáticas elementales (**Sumas, Restas, Tablas de Multiplicar y Divisiones**) junto a un **Desafío Mixto** final, garantizando que posee la fluidez matemática necesaria para abordar los retos más abstractos de fases posteriores.
* **Habilidades Desarrolladas**:
  1. Agilidad de cálculo mental y recuperación rápida de memoria numérica.
  2. Concentración sostenida bajo presión de tiempo dinámico (cronómetro por pregunta).
  3. Relación de operaciones complementarias (ej. suma-resta, multiplicación-división).

---

## 2. Layout y Diseño Visual de la Interfaz (`GameScreen.tsx`)

La interfaz de juego utiliza una distribución de pantalla dividida (split-layout) orientada a la inmersión visual y a la comodidad táctil tanto en dispositivos móviles como de escritorio.

```
+-------------------------------------------------------------+
|  [Abortar Misión]                Fase 1 | Nivel X | P. 1/50 |
|  [=========================== Progress ===================] |
|                                                             |
|   +-----------------------+     +-----------------------+   |
|   |                       |     |     7     8     9     |   |
|   |         35 + 18       |     |     4     5     6     |   |
|   |                       |     |     1     2     3     |   |
|   |        [   ?   ]      |     |     <-    0     OK    |   |
|   |                       |     |                       |   |
|   |  (Aciertos) (Errores) |     |  [Teclado Numérico]   |   |
|   +-----------------------+     +-----------------------+   |
|                                                             |
+-------------------------------------------------------------+
```

### 2.1. Panel de Pregunta (Lado Izquierdo)
* **Contenedor Principal**: Tarjeta de vidrio esmerilado (`glass-card`) de gran formato con bordes súper redondeados (`rounded-[3rem]`).
* **Cronómetro Lineal Superior**: Una barra de tiempo animada que decrece de manera lineal de izquierda a derecha. Si el tiempo restante es menor o igual a 3 segundos, la barra cambia a color rojo intenso parpadeante.
* **Enunciado Gigante**: Operación matemática en el centro en tamaño extra grande (`text-7xl` a `text-8xl`), en color blanco y con sombra tridimensional.
* **Input Centralizado**: Un campo de texto numérico grande y centrado. Muestra un marcador `?` en baja opacidad cuando está vacío.
* **Feedback de Respuesta Inmediato**:
  - **Correcto**: El borde de la tarjeta destella en verde esmerilado (`ring-4 ring-green-500/50`) y la pantalla se inunda de un aura de luz verde. Se muestra una marca de verificación animada (`CheckCircle2`).
  - **Incorrecto/Tiempo Agotado**: El borde de la tarjeta destella en rojo (`ring-4 ring-red-500/50`) con un efecto de sacudida horizontal (shake) y se muestra una `XCircle` junto con la revelación del resultado correcto: *"Era: [Resultado]"*.
* **Tarjeta de Aciertos/Errores**: Ubicada en la base del panel, muestra en paralelo los contadores acumulados de respuestas correctas (en verde) y fallos (en rojo).

### 2.2. Teclado Numérico Virtual (Lado Derecho - Opcional en Desktop)
* **Diseño**: Grid de 3x4 con botones cuadrados redondeados (`aspect-square rounded-2xl bg-white/5 border border-white/10`).
* **Botones del 0 al 9**: Tipografía blanca gruesa (`text-4xl font-black`) con hover interactivo de escala.
* **Botón Borrar**: Icono de retroceso (`Delete`) pintado en tono rojo suave que limpia el último carácter ingresado.
* **Botón Confirmar (OK)**: Icono de flecha derecha (`ArrowRight`) en fondo azul brillante (`bg-brand-primary`) para enviar la respuesta.

---

## 3. Lógica de Generación de Preguntas por Nivel

La generación de ejercicios es totalmente dinámica, adaptándose con precisión al nivel de dificultad seleccionado:

### ➕ Sumas (Adición)
* **Nivel 1**: 1 dígito + 1 dígito (Números del 1 al 9).
* **Nivel 2**: 2 dígitos + 1 dígito (A: 10-20, B: 1-9).
* **Nivel 3**: 2 dígitos + 2 dígitos (Ambos entre 10-50).
* **Nivel 4**: Tres números de 1 dígito (A + B + C, todos 1-9).
* **Nivel 5**: Suma de 3 números (A, B: 10-50, C: 1-9).

### ➖ Restas (Sustracción)
* **Nivel 1**: A (2-10) menos B (1 a A-1). *Garantiza resultado > 0 para evitar negativos*.
* **Nivel 2**: A (10-20) menos B (1-9).
* **Nivel 3**: A (20-50) menos B (2-9).
* **Nivel 4**: 2 dígitos menos 2 dígitos simples (A: 30-99, B: 10-25). *Garantiza A > B*.
* **Nivel 5**: 2 dígitos menos 2 dígitos complejos (A: 50-99, B: 20 a A-10).

### ✖️ Multiplicaciones
* **Nivel 1**: Multiplicar por 1, 2 o 10 (A ∈ {1, 2, 10}, B: 1-10).
* **Nivel 2**: Tablas del 2 al 5 (A: 2-5, B: 1-10).
* **Nivel 3**: Tablas del 2 al 9 (A: 2-9, B: 2-10).
* **Nivel 4**: Tablas extendidas (A: 6-12, B: 3-10).
* **Nivel 5**: 2 dígitos por 1 dígito (A: 12-15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100; B: 3-9).

### ➗ Divisiones
*Técnica: Se genera primero la multiplicación (Divisor × Cociente = Dividendo) para asegurar resultados exactos enteros.*
* **Nivel 1**: Divisor 2-3, Cociente 2-5.
* **Nivel 2**: Divisor 2-5, Cociente 2-10.
* **Nivel 3**: Divisor 3-9, Cociente 3-9.
* **Nivel 4**: Divisor 4-12, Cociente 4-12.
* **Nivel 5**: Divisor y cociente combinados con dividendos complejos de hasta 3 dígitos.

### ⚡ Modo "Desafío Mixto" (Progresión Dinámica)
En este modo, las 50 preguntas escalan de dificultad y combinan operaciones de forma progresiva dentro de la misma sesión de juego:
* **Preguntas 1 al 10**: Nivel 1 — Sumas (50%) o Restas (50%).
* **Preguntas 11 al 20**: Nivel 2 — Sumas (33%), Restas (33%) o Multiplicaciones (33%).
* **Preguntas 21 al 30**: Nivel 3 — Mezcla equitativa de las 4 operaciones (25% c/u).
* **Preguntas 31 al 40**: Nivel 4 — Operaciones de nivel 4 y mezcla de divisiones.
* **Preguntas 41 al 50**: Nivel 5 — Mezcla completa de nivel 4+ y operaciones complejas.

---

## 4. Comportamiento y Flujo de Juego

1. **Selección de Nivel**:
   * El alumno selecciona la disciplina y visualiza los 5 niveles en la interfaz interactiva.
   * Los niveles se desbloquean secuencialmente al superar el nivel anterior con el criterio de aciertos exigido. El Administrador goza de un bypass de desbloqueo completo para pruebas.
2. **Entrada a Juego**:
   * Carga inmediata de la primera pregunta. El temporizador inicia automáticamente.
   * El input numérico recibe el foco activo para permitir respuesta fluida con teclado físico o en pantalla.
3. **Procesamiento de Respuestas**:
   * Al presionar *Enter* o pulsar *OK*, el temporizador se detiene, muestra el feedback visual (verde/rojo) por 1.5 segundos y avanza a la siguiente pregunta.
4. **Fin de Misión**:
   * Al completar las **50 preguntas**, se detiene el cronómetro y se redirige a `ResultsScreen.tsx`.
   * **Pantalla de Resultados**: Tarjeta premium con puntuación, análisis de la IA con fortalezas/debilidades y botón para avanzar o repetir.

---

## 5. Parámetros de Configuración Técnica

Los siguientes parámetros representan los valores estándar de fábrica, los cuales son **100% editables en tiempo real** por los docentes desde el **Panel de Administrador** para flexibilizar la exigencia:

* **Preguntas por Bloque / Sesión**: 50 preguntas.
* **Puntaje Mínimo de Aprobación (Estándar)**: **95%** (ej. 48 aciertos de 50 preguntas).
* **Control de Tiempo por Pregunta (Estándar)**:
  * **Nivel 1 (Fácil)**: 10 segundos.
  * **Nivel 2 (Fácil-Medio)**: 12 segundos.
  * **Nivel 3 (Medio)**: 14 segundos.
  * **Nivel 4 (Medio-Difícil)**: 16 segundos.
  * **Nivel 5 (Difícil)**: 18 segundos.
  *(A mayor dificultad algorítmica, se otorgan más segundos para incentivar la resolución mental reflexiva sin frustración)*.
