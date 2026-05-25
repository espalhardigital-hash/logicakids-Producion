# Arquitectura Integral y Estándares UX/UI — LogicaKids Pro

> Nota de autoridad documental: Este documento define la experiencia visual, navegación y comportamiento de interfaz. En caso de conflicto, prevalece primero el Documento Rector Conceptual, luego el Blueprint Técnico, luego el Manual del Administrador y finalmente esta Guía UX/UI.

---

## 1. Propósito del Documento

Este documento unifica la planificación técnica de interfaz con la guía oficial UX/UI de **LogicaKids Pro**. El objetivo es garantizar que la plataforma sea robusta, coherente, gamificada y adaptada para niños de alrededor de 10 años.

La plataforma debe sentirse como un videojuego educativo espacial, sin perder rigor pedagógico ni control server-authoritative.

---

## 2. Filosofía del Sistema

La plataforma se construye sobre dos pilares complementarios.

### 2.1. Filosofía Sistema-Céntrica

La estructura y la verdad de los datos lo son todo. El frontend obedece al motor pedagógico del backend.

Reglas:

* el backend decide preguntas;
* el backend valida respuestas;
* el backend controla progreso;
* el backend activa rescate;
* el backend aplica Early Exit;
* el frontend solo renderiza y envía interacciones.

### 2.2. Filosofía Usuario-Céntrica

La percepción lo es todo. La interfaz debe:

* reducir carga cognitiva;
* evitar frustración;
* usar chunking;
* mostrar retroalimentación visual inmediata;
* evitar pantallas densas;
* usar micro-animaciones;
* mantener una experiencia gamificada y motivadora.

---

## 3. Arquitectura de Navegación y Estado Global

### 3.1. Enrutamiento Declarativo

El sistema utiliza React Router para historial, deep linking y carga perezosa.

Rutas principales:

```text
/login
/map
/profile
/progress
/admin/*
```

Ruta de fase:

```text
/fase/:faseId/:moduloId/:nivelId
```

Los nombres `faseId`, `moduloId` y `nivelId` deben usarse de forma consistente para evitar ambigüedad con `id`.

### 3.2. API Canónica de Juego

El motor de juego consulta endpoints server-authoritative normalizados:

```text
GET  /api/fases/{fase_id}/dashboard
GET  /api/fases/{fase_id}/pregunta
POST /api/fases/{fase_id}/responder
POST /api/fases/{fase_id}/cerrar-rescate
```

No se deben usar endpoints sueltos como `/pregunta`, `/responder`, `/cerrar-rescate` o `/pedagogia` como rutas oficiales. Si existen en código heredado, deben considerarse rutas legacy y migrarse al patrón `/api/fases/{fase_id}/...`.

### 3.3. Estado Global

Toda la lógica de sesión, progreso de fase, parámetros de juego e hidratación debe manejarse en un store centralizado.

El frontend no calcula estado académico. Solo refleja el JSON entregado por backend.

La fuente de verdad del progreso es `ProgresoMaestria`. El objeto `user.settings["unlockedLevels"]` existe únicamente como espejo de compatibilidad visual para componentes heredados.

---

## 4. Estructura de Componentes

La jerarquía de archivos debe seguir un patrón atómico y modular:

```text
src/
 ├── components/
 │   ├── admin/       # Panel Admin
 │   ├── map/         # Mapa General Zig-zag Fases 1-9
 │   ├── fase/        # Welcome, Levels, Game, Results
 │   ├── common/      # Keyboard, Buttons, Modals
 │   └── theory/      # Carruseles, flashcards, interactivos
 ├── store/           # Auth, Progress, GameSession
 ├── services/        # API clients, deduplicación, hidratación
 └── types/           # Tipos compartidos
```

---

## 5. Guía de Interacción y Comportamiento UX

### 5.1. Bucle Espejo

Para evitar frustración, el sistema implementa una lógica de rescate automatizada.

1. **Intentos 1 a 3:** Si el niño falla, el sistema no revela la respuesta final. Se activa un feedback del Tutor Invisible y se permite un nuevo intento con Variante Espejo.
2. **Intento 4:** Si falla la pregunta original y 3 variantes espejo, el backend activa el Bloque de Rescate.
3. **Bloque de Rescate:** El modal exige transcribir la respuesta correcta final demostrada para desbloquear el avance y llamar a `/api/fases/{fase_id}/cerrar-rescate`.

### 5.2. Feedback Visual

En una respuesta incorrecta:

* borde rojo;
* fondo rojo suave;
* badge de error;
* resplandor ambiental rojo;
* feedback textual del Tutor Invisible;
* bloqueo de avance hasta la siguiente acción autorizada por backend.

El sistema no debe revelar la respuesta final durante los intentos 1 a 3.

### 5.3. Bloque de Rescate

El Bloque de Rescate debe:

* abrirse como Modal Overlay prioritario;
* bloquear la interacción con el fondo;
* mostrar explicación profunda;
* renderizar énfasis visual en HTML/Markdown controlado;
* incluir input anti-spam;
* mantener el botón de continuidad deshabilitado hasta que el alumno escriba el valor solicitado;
* enviar la transcripción a `/api/fases/{fase_id}/cerrar-rescate`.

### 5.4. Early Exit

Cuando el backend retorna:

```json
{
  "early_exit": true
}
```

El frontend debe:

* detener el flujo actual;
* mostrar modal de expulsión pedagógica;
* explicar que se superó el límite de errores;
* resetear visualmente la sesión del desafío;
* redirigir al dashboard de fase.

---

## 6. Dashboard de Fase

El dashboard de la fase organiza el progreso del alumno mapeando los niveles y desafíos virtuales como un trayecto espacial de **nodos estelares interactivos**.

### 6.1. Estados Visuales y Retroalimentación Cromática de los Nodos

Cada nodo del mapa estelar refleja visualmente su estado calculado en el backend mediante un sistema cromático premium con micro-animaciones en CSS y Framer Motion:

* **Bloqueado:**
  * **Estética:** Nodo gris semiopaco con un candado esmerilado de cristal (`glassmorphism`).
  * **Comportamiento:** Hover inactivo, escala neutra.
* **Disponible (Desbloqueado Linealmente):**
  * **Estética:** Nodo con color principal de la fase y un brillo exterior (`drop-shadow`) suave y estático.
  * **Comportamiento:** Al pasar el cursor (`hover`), escala suavemente (+5%) y activa un sonido sutil de sistema.
* **En Progreso / Siguiente Recomendado:**
  * **Estética:** Nodo rodeado por una órbita animada pulsante con gradiente dinámico.
  * **Comportamiento:** Invita activamente al alumno a hacer clic mediante micro-rebotes y pulsos de luz cíclicos.
* **Aprobado (Progresión Automática Ordinaria):**
  * **Estética:** Resplandor de aureola **dorada premium** (`gold glow`), indicando que el alumno alcanzó el ≥90% de precisión y completitud por su propio desempeño.
  * **Comportamiento:** Despliega estrellas doradas en una animación explosiva de partículas al momento de aprobarse.
* **Aprobado por Decreto Administrativo (Override Manual de Aprobación):**
  * **Estética:** Resplandor de aureola **cian/azul neón distintivo** (`cyan/neon glow`) en lugar de dorado. Esto diferencia inmediatamente un bloque aprobado de manera ordinaria de uno intervenido.
  * **Insignia de Intervención:** Se renderiza una pequeña insignia o icono de "Súper-Tutor" (icono de rayo o escudo cian esmerilado) en la esquina superior derecha del nodo.
  * **Tooltip de Retroalimentación:** Al hacer hover o clic, se muestra una tarjeta esmerilada explicativa que indica de forma transparente y motivadora: *"¡Liberado por tu tutor! Motivo: [Motivo de Override] - [Fecha de Override]"*.
* **Liberado por Administración (Override Manual de Desbloqueo):**
  * **Estética:** Nodo con órbita pulsante en **brillo cian/neón** (en lugar de color de fase estándar), indicando que está activo por bypass del administrador.
  * **Tooltip de Retroalimentación:** Muestra el mensaje: *"¡Habilitado por tu tutor para tu práctica especial!"*.

Los niveles y desafíos se desbloquean según la respuesta de `/api/fases/{fase_id}/dashboard`.

---

## 7. Módulos Teóricos

La teoría debe dividirse en carruseles de flashcards.

Reglas:

* no usar scrollbars largos;
* máximo 2 elementos principales por pantalla;
* usar lenguaje breve;
* usar ejemplos visuales;
* exigir interactivos para desbloquear práctica;
* no permitir avanzar si los interactivos obligatorios no fueron respondidos correctamente.

---

## 8. Interfaz de Práctica y Juego

### 8.1. Input Personalizado

La práctica debe usar un input numérico grande y claro.

### 8.2. Custom Keyboard

El teclado numérico personalizado evita distracciones del teclado nativo del dispositivo.

Debe incluir:

* números;
* borrar;
* confirmar;
* separador decimal si el módulo lo requiere;
* compatibilidad con dinero cuando aplique.

### 8.3. Subrayado por Tokens

En preguntas textuales, el frontend debe renderizar tokens seleccionables. Cada token tiene ID estable.

El frontend envía:

```json
{
  "tokens_seleccionados": [2, 5]
}
```

No debe enviar texto crudo para validación.

### 8.4. Seguridad Visual

El frontend no debe recibir ni renderizar:

* `es_correcta`;
* respuesta correcta oculta;
* distractores marcados internamente;
* reglas de validación completas.

### 8.5. Cronómetro Reactivo Dinámico

Para evitar discrepancias entre la calibración pedagógica y el comportamiento visual del juego, **se prohíbe hardcodear límites de tiempo en el frontend**:
* El componente del temporizador (`TimerController.tsx`) debe ser enteramente reactivo. Al recibir el payload de `/api/fases/{fase_id}/pregunta`, lee las variables de configuración de inicio:
  * Si `usa_cronometro` es `false`, oculta el elemento visual del reloj por completo y elimina toda lógica de expiración de tiempo.
  * Si `usa_cronometro` es `true`, renderiza la barra circular de progreso temporal e inicializa la cuenta regresiva con base en los segundos devueltos por `tiempo_limite_segundos`.
* Esta reactividad garantiza que cualquier calibración del superusuario en caliente impacte inmediatamente la experiencia del estudiante de forma fluida y sin redespliegue.

---

## 9. Mapeo General de Fases

Las fases se desbloquean dinámicamente según `ProgresoMaestria` y el dashboard server-authoritative. Los administradores tienen bypass total.

| Fase | Título | Descripción Pedagógica | Mecánica |
| --- | --- | --- | --- |
| **1** | Calentamiento Aritmético | Sumas, restas, multiplicaciones y divisiones. | Server-Authoritative (`/api/fases/{fase_id}/...`). |
| **2** | Desarrollo Numérico | Cálculo mental, sistema monetario y problemas lógicos. | Modelo interactivo con práctica y desafíos. |
| **3** | Problemas de Texto | Comprensión lectora, datos relevantes y resolución dirigida. | Subrayado por tokens y razonamiento guiado. |
| **4** | Fracciones y Gráficos | Relación parte-todo, fracciones y barras de datos. | SVG interactivos. |
| **5** | Geometría Plana | Figuras 2D, perímetros y áreas. | Canvas espaciales y manipulación visual. |
| **6** | Geometría Espacial | Visualización 3D, volumen y cuerpos geométricos. | CSS/HTML 3D. |
| **7** | Coordenadas y Trayectos | Plano cartesiano, rutas y desplazamientos. | Grillas cartesianas. |
| **8** | Estadística y Probabilidad | Lectura de datos, azar, comparación y predicción. | Gráficos interactivos y simulaciones. |
| **9** | Simulacro Final Pedro II | Integración completa de contenidos del examen. | Evaluación mixta con cronómetro y análisis de errores. |

> Nota de alcance: El mapa global contempla 9 fases. Las Fases 1 a 3 representan el núcleo actualmente construido y configurable desde el panel administrativo. Las Fases 4 a 9 pueden mostrarse visualmente como fases futuras, bloqueadas o en desarrollo hasta que su contenido relacional esté completamente implementado.

---

## 10. UX del Panel Admin

El Panel Admin debe mantener la misma identidad visual, pero con mayor densidad informativa.

### 10.1. Reglas de Interfaz del Panel Administrativo

* **Tablas de Alto Rendimiento:** Datos paginados y ordenables que permiten buscar estudiantes por nombre o correo con latencia cero.
* **Filtros Flexibles:** Selectores para filtrar rápidamente por fase, módulo y tipo de bloque (Práctica Libre vs Desafío).
* **Edición y Configuración en Modales:** Evitar redirecciones innecesarias de página; todos los parámetros pedagógicos y contenidos se editan mediante modales de vidrio esmerilado (`backdrop-blur`).
* **Visualización de Intentos:** Un subpanel interactivo de análisis cognitivo que muestra las respuestas dadas, los errores previstos identificados y el feedback recibido por el alumno en tiempo real.

### 10.2. UX/UI para Intervenciones y Overrides de Progreso

La interfaz de overrides de rendimiento debe cumplir con los siguientes estándares estrictos de usabilidad:

* **Control de Tres Estados:** Botones claramente separados y estilizados para `unlock` (Liberar), `approve` (Aprobar) y `reset` (Bloquear/Restablecer).
* **Modal de Confirmación Destructiva y Justificación:**
  * Al hacer clic en cualquier override, la UI despliega un modal prioritario con desenfoque del fondo (`backdrop-blur-md`).
  * Muestra una advertencia explícita sobre el impacto didáctico y el desencadenamiento automático de la cascada de desbloqueos.
  * **Campo de Texto Reactivo:** Área de entrada de texto para registrar el *Motivo del Override*. El botón de confirmación se habilita únicamente si el texto ingresado tiene al menos 10 caracteres, evitando registros de auditoría vacíos o de spam (como "ok" o "123").
* **Indicadores Visuales de Override Activo:**
  * Al completarse la petición de override, la UI del administrador aplica un resplandor cian/azul neón en el renglón o celda del alumno, con un badge con el texto *"INTERVENIDO POR ADMIN"* que permite identificar rápidamente qué alumnos tienen rutas personalizadas y por qué.

### 10.3. UI/UX para Calibración de Parámetros (Tiempos y Volúmenes)

La pestaña de gestión pedagógica avanzada debe contar con controles intuitivos que minimicen los errores de entrada operativa:

* **Toggles Claros de Tiempo:** Switch reactivo en Tailwind que al activarse expande un submenú deslizante con el slider de segundos.
* **Sliders de Control Fino con Indicador Dinámico:** Deslizadores para la duración temporal con marcas de escala legibles y un indicador textual en tiempo real (ej. *"Límite por pregunta: 35 segundos"*).
* **Campos Numéricos con Límites Lógicos (Min/Max):** Entradas para `cantidad_requerida` que bloquean o advierten mediante alertas preventivas rojas si se intentan registrar valores extremos (ej. menos de 5 preguntas o más de 50) que puedan romper el ritmo de atención infantil.
* **Indicadores de Herencia Activa:** Etiquetas visuales que muestran explícitamente el origen del valor actual (ej. *"Heredado de: Fase 2"* o *"Override Local Activo"*).

---

## 11. Accesibilidad

La experiencia debe contemplar:

* fuentes legibles;
* escala ajustable;
* contraste suficiente;
* botones grandes;
* retroalimentación visual y textual;
* reducción de carga cognitiva;
* evitar interfaces saturadas;
* compatibilidad con niños con dificultades de lectura.

---

## 12. Reglas Finales de Coherencia UX

* No revelar respuesta final antes del rescate.
* No permitir avanzar en teoría sin completar interactivos.
* No permitir que el frontend calcule progreso.
* No mostrar información interna como `es_correcta`.
* Mantener endpoints `/api/fases/{fase_id}/...`.
* Usar `ProgresoMaestria` como fuente de verdad visual y académica.
* Usar `user.settings["unlockedLevels"]` solo como espejo de compatibilidad.
