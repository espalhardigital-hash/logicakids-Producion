# Especificación de Interfaz de Usuario: Fase 1 — Calentamiento Aritmético

Esta fase representa la base matemática y el calentamiento aritmético de la plataforma **LogicaKids Pro**. Consiste en un juego interactivo de cálculo mental veloz que evalúa y refuerza las destrezas operativas elementales de los alumnos antes de adentrarse en dinámicas lógicas abstractas.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Desarrollar agilidad de cálculo mental y exactitud en las cuatro disciplinas matemáticas elementales: **Sumas, Restas, Tablas de Multiplicar y Divisiones**, además de un **Desafío Mixto** final.
* **Habilidades Desarrolladas**:
  1. Cálculo y recuperación de memoria numérica a corto plazo.
  2. Concentración bajo presión de tiempo (cronómetro).
  3. Reconocimiento ágil del valor de operaciones invertidas (multiplicación vs división).

---

## 2. Layout y Diseño Visual de la Interfaz (`GameScreen.tsx`)

La interfaz de juego utiliza una distribución de pantalla dividida (split-layout) orientada a la inmersión visual y a la comodidad táctil en dispositivos móviles y de escritorio.

```
+-------------------------------------------------------------+
|  [Abortar Misión]                Fase 1 | Nivel X | P. 1/40 |
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

## 3. Comportamiento y Flujo de Juego

1. **Selección de Nivel**:
   - El alumno selecciona la categoría (Sumas, Restas, etc.) y se le presentan 5 niveles en un mapa lineal.
   - Cada nivel se desbloquea superando el nivel anterior con el porcentaje de precisión objetivo.
2. **Entrada a Juego**:
   - Carga inmediata del primer desafío. El temporizador inicia automáticamente.
   - El input numérico recibe el foco activo de forma automática.
3. **Procesamiento de Respuestas**:
   - El alumno puede ingresar la respuesta mediante el teclado físico o el teclado en pantalla.
   - Al presionar *Enter* o hacer clic en *OK*, el temporizador se detiene, se muestra el feedback visual y auditivo durante 1 a 2 segundos y se pasa a la siguiente pregunta.
4. **Fin de Misión**:
   - Al completar la cantidad total de preguntas configuradas para la fase (por defecto 40 preguntas), se detiene el juego y se renderiza `ResultsScreen.tsx`.
   - **Pantalla de Resultados**: Tarjeta premium con puntuación, análisis de tutoría IA de LogicaKids detallando fortalezas y debilidades, y el botón de graduación al siguiente nivel.

---

## 4. Parámetros de Configuración Técnica

* **Preguntas por Nivel**: 40 preguntas.
* **Puntaje Mínimo de Aprobación**: 90% (36 de 40 correctas).
* **Control de Tiempo por Pregunta**:
  - Nivel 1 (Fácil): 15 segundos.
  - Nivel 2: 12 segundos.
  - Nivel 3: 10 segundos.
  - Nivel 4: 8 segundos.
  - Nivel 5 (Difícil): 6 segundos.
