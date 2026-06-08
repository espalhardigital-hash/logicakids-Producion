# Especificación de Interfaz de Usuario: Fase 1 — Calentamiento Aritmético (Fase 1) - Versión 3.5 (Estable y Certificada)

Esta fase representa la base matemática y el calentamiento aritmético de la plataforma **LogicaKids Pro**. Tras la auditoría final y los ajustes de robustez visual, la interfaz y su lógica de navegación han sido blindadas contra bugs de estado ("Off-by-one") y errores de renderizado. El juego opera bajo un modelo de **Autoridad en el Servidor (Server-Authoritative)**, garantizando que el frontend consuma en tiempo real el motor pedagógico del backend y persista de manera segura el progreso en PostgreSQL.

---

## 1. Propósito Pedagógico y Objetivo

* **Objetivo General**: Asegurar la nivelación, agilidad y maestría operativa del alumno en las cuatro disciplinas matemáticas elementales (**Sumas, Restas, Tablas de Multiplicar y Divisiones**) junto a un **Desafío Mixto** final, garantizando que posee la fluidez matemática necesaria para abordar los retos abstractos de fases posteriores.
* **Habilidades Desarrolladas**:
  1. Agilidad de cálculo mental y recuperación rápida de memoria numérica.
  2. Concentración sostenida bajo presión de tiempo dinámico (cronómetro controlado por servidor).
  3. Relación de operaciones complementarias (ej. suma-resta, multiplicación-división).

---

## 2. Layout y Diseño Visual de la Interfaz (`GameScreen.tsx`)

La interfaz de juego utiliza una distribución de pantalla dividida (split-layout) orientada a la inmersión visual y a la comodidad táctil tanto en dispositivos móviles como de escritorio.

```
+-------------------------------------------------------------+
|  [Volver al Mapa]                 Fase 1 | Nivel X | P. 1/50 |
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
* **Contenedor Principal**: Tarjeta de vidrio esmerilado (`glass-card`) de gran formato con bordes súper redondeados (`rounded-[3rem]`) y sombreado ambiental neón continuo.
* **Cronómetro Lineal Superior**: Una barra de tiempo animada que decrece de manera lineal de izquierda a derecha. El límite de tiempo es dictado por el backend para cada nivel y pregunta. Si el tiempo restante es menor o igual a 3 segundos, la barra cambia a color rojo intenso parpadeante.
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
* **Botón Confirmar (OK)**: Icono de flecha derecha (`ArrowRight`) en fondo cian brillante para enviar la respuesta.

---

## 3. Lógica de Generación y Suministro de Preguntas

Para erradicar la asimetría técnica con el backend, **la generación local en el cliente ha sido desactivada**. El frontend consume el pool de preguntas estructuradas y algoritmos de generación dinámica provistos por el backend FastAPI, garantizando consistencia pedagógica absoluta y persistencia segura del progreso.

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
*Técnica: Se genera primero la multiplicación (Divisor × Cociente = Dividendo) en el backend para asegurar resultados exactos enteros.*
* **Nivel 1**: Divisor 2-3, Cociente 2-5.
* **Nivel 2**: Divisor 2-5, Cociente 2-10.
* **Nivel 3**: Divisor 3-9, Cociente 3-9.
* **Nivel 4**: Divisor 4-12, Cociente 4-12.
* **Nivel 5**: Divisor y cociente combinados con dividendos complejos de hasta 3 dígitos.

### ⚡ Modo "Desafío Mixto" (Server-Authoritative Progression)
El backend controla el pool de preguntas secuenciales e híbridas y el temporizador acumulativo, entregándolas de forma progresiva según el avance de la sesión de juego:
* **Preguntas 1 al 10**: Nivel 1 — Sumas o Restas.
* **Preguntas 11 al 20**: Nivel 2 — Sumas, Restas o Multiplicaciones.
* **Preguntas 21 al 30**: Nivel 3 — Mezcla equitativa de las 4 operaciones.
* **Preguntas 31 al 40**: Nivel 4 — Operaciones de nivel 4 y mezcla de divisiones.
* **Preguntas 41 al 50**: Nivel 5 — Mezcla completa de nivel 5 y operaciones complejas.

---

## 4. Comportamiento, Control de Estado y Lógica de Progreso

Para evitar inconsistencias en el progreso de usuarios recién registrados y en el cálculo de las barras visuales, se ha separado estrictamente la lógica matemática en React utilizando un sistema **1-indexed** alineado con PostgreSQL:

### 4.1. Conceptos Clave de Progreso
* **Nivel Desbloqueado (`unlockedLevel`)**: Indica el nivel actual en el que se encuentra trabajando el alumno. Los valores posibles van del **`1` al `6`** (donde `1` = Nivel 1, y `6` = Todos los niveles superados).
  - Un usuario nuevo inicializa con `unlockedLevel = 1`.
  - Un usuario con rol `ADMIN` inicializa con `unlockedLevel = 6` (bypass total).
* **Niveles Superados**: Corresponde al total de niveles completados exitosamente. Se calcula matemáticamente como:
  $$\text{Niveles Superados} = \max(0, \text{unlockedLevel} - 1)$$
  - Un usuario nuevo tiene $1 - 1 = 0$ niveles superados (0% de progreso).

### 4.2. Renderizado de Tarjetas de Selección (`LevelSelectionScreen.tsx`)
Se dibuja un arreglo de 5 niveles basados en índices de programación del `0` al `4` (representando los Niveles 1 al 5). Las banderas de estado se calculan así:
* **Desbloqueado (`isUnlocked`)**: El alumno tiene acceso para jugar el nivel si:
  $$\text{levelIndex} < \text{unlockedLevel}$$
  - Para un usuario nuevo (`unlockedLevel = 1`), el Nivel 1 (index 0) cumple `0 < 1` (desbloqueado), mientras que el Nivel 2 (index 1) no cumple `1 < 1` (bloqueado).
* **Superado (`isPassed`)**: Se muestra con un checkmark verde de maestría si:
  $$\text{levelIndex} < \text{unlockedLevel} - 1$$
  - Para un usuario nuevo, el Nivel 1 (index 0) no cumple `0 < 0` (no superado), mostrándose azul y editable. Al ganar el Nivel 1, `unlockedLevel` pasa a `2`, haciendo que el Nivel 1 se marque como superado (`0 < 1` = true) y el Nivel 2 pase a estar desbloqueado y activo (`1 < 2` = true).

### 4.3. Visualización y Porcentajes de Progreso (`WelcomeScreen.tsx`)
* **Niveles Superados por Disciplina (`passedLevels`)**:
  $$\text{passedLevels} = \max(0, \text{levelIdx} - 1)$$
* **Porcentaje de Progreso de la Disciplina (`progressPercent`)**:
  $$\text{progressPercent} = \min\left(\frac{\text{passedLevels}}{5} \times 100, 100\right)$$
  - *Nivel 1 en curso*: 0 niveles superados = **0%**.
  - *Nivel 2 en curso*: 1 nivel superado = **20%**.
  - *Nivel 3 en curso*: 2 niveles superados = **40%**.
  - *Nivel 4 en curso*: 3 niveles superados = **60%**.
  - *Nivel 5 en curso*: 4 niveles superados = **80%**.
  - *Todos superados*: 5 niveles superados = **100%** (unlockedLevel = 6).
* **Progreso Global del Alumno**:
  Se calcula sumando los niveles superados reales en cada una de las disciplinas matemáticas básicas.

### 4.4. Guardado al Ganar (`App.tsx`)
Cuando el alumno completa exitosamente una sesión de juego con un puntaje aprobatorio, el frontend actualiza el backend enviando el nuevo nivel desbloqueado como:
$$\text{Nuevo Nivel} = \text{currentDiffIndex} + 2$$
- Al superar el Nivel 1 (index 0), el backend almacena `2` (lo que desbloquea el Nivel 2 y marca el Nivel 1 como superado).

---

## 5. Parámetros de Configuración Centralizada (Backend Admin)

Los parámetros de control y exigencia residen en modelos relacionales (`ConfiguracionProgreso`) gobernados en tiempo real por el **Panel de Administrador**:

* **Preguntas por Bloque / Sesión**: 50 preguntas estándar (configurable de 10 a 50).
* **Puntaje Mínimo de Aprobación**: **90%** por bloque (ej. 45 aciertos de 50 preguntas) a nivel global en frontend y backend.
* **Control de Tiempo Dinámico por Pregunta (Estándar)**:
  - **Nivel 1 (Fácil)**: 10 segundos.
  - **Nivel 2 (Fácil-Medio)**: 12 segundos.
  - **Nivel 3 (Medio)**: 14 segundos.
  - **Nivel 4 (Medio-Difícil)**: 16 segundos.
  - **Nivel 5 (Difícil)**: 18 segundos.
  *(A mayor complejidad matemática, el servidor despacha un límite de tiempo superior para incentivar la reflexión y evitar la frustración)*.

---

## 6. Guía de Prevención de Bugs (Desarrollo Futuro)

Para mantener la Fase 1 libre de fallos críticos, observe rigurosamente las siguientes reglas:

### ⚠️ Regla 1: Evitar el Error de Referencia en Variables Globales
* **Historial de Fallos**: El uso de la variable inexistente `totalLevelsUnlocked` causaba un crash total de React (pantalla azul/oscura).
* **Solución**: La variable del total de niveles completados se llama estrictamente **`totalLevelsPassed`** en todas las vistas de progreso (`WelcomeScreen.tsx`). Bajo ninguna circunstancia vuelva a introducir la nomenclatura `totalLevelsUnlocked` en el renderizado.

### ⚠️ Regla 2: Mantener la Correspondencia de Índices
* Las llamadas a `unlockLevel` y las lecturas de base de datos siempre asumen valores **1-indexed** (1 a 6).
* Al mapear sobre arrays locales en React (ej. `[0, 1, 2, 3, 4]`), el índice local `i` corresponde al Nivel `i + 1`. Asegúrese de sumar o restar `1` en las conversiones de interfaz.

### ⚠️ Regla 3: Consistencia en el Puntaje de Aprobación
* La constante por defecto para aprobar sesiones de juego en el cliente (fallbacks de offline/invitado) es estrictamente **`90`** (90%). No asuma `85` ni otros valores hardcodeados para evitar discrepancias con la base de datos pedagógica real.
