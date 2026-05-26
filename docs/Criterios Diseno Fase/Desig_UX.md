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

### 3.2. API Canónica de Juego y Enrutamiento de Pools Segmentados

El motor de juego del cliente interactúa exclusivamente con endpoints server-authoritative normalizados y estructurados por fase:

```text
GET  /api/fases/{fase_id}/dashboard
GET  /api/fases/{fase_id}/pregunta
POST /api/fases/{fase_id}/responder
POST /api/fases/{fase_id}/cerrar-rescate
```

#### Transparencia de Pools en Frontend:
Bajo esta arquitectura de aislamiento, el enrutador del backend intercepta el `{fase_id}` de la URL y dirige internamente la consulta a las tablas físicas segmentadas correspondientes (ej: `fase{fase_id}_practica_pool`). Esta separación física es enteramente transparente para el cliente frontend, el cual procesa los payloads estandarizados y unificados sin conocer los detalles de particionamiento subyacentes.

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

### 5.1. Bucle Espejo (Exclusivo de Práctica Libre)

Para garantizar la asimilación activa de conceptos sin atascar al estudiante, el sistema implementa una lógica de Bucle Espejo en la Práctica Libre:

1. **Error (Pregunta Original o Variantes):** El sistema **activa un Modal Emergente (Mirror Modal)** que se superpone a la batería principal de preguntas.
2. **Revelación y Variante:** En este modal, el frontend tiñe el borde de rojo, emite el sonido de error y **revela de inmediato la respuesta que era correcta** de la pregunta fallida. Acto seguido, entrega la siguiente Variante Espejo (misma estructura, diferentes números) para ser resuelta dentro del mismo modal.
3. **Persistencia del Bucle:** El modal permanece activo hasta que el alumno responda correctamente o agote las 3 variantes permitidas.
4. **Variante Espejo 3 Errada (4º Falla Consecutiva):** Dentro del mismo flujo emergente, el backend activa el **Bloque de Rescate Explicativo** (Explicación Profunda).
5. **Avance y Cierre:** El alumno lee la explicación, presiona el botón `"¡Entendido, ir al siguiente reto!"`, el modal se cierra y la interfaz principal lo mueve inmediatamente a la siguiente familia de preguntas original.

Este flujo garantiza que la batería principal se "pause" mientras el alumno resuelve su laguna cognitiva en un espacio dedicado y enfocado (el modal).

#### 5.1.1. UX ante Cierre o Recarga de Página (Reload Reset)

El comportamiento de la interfaz ante un cierre de pestaña o recarga accidental/intencional (`F5`) se divide estrictamente según la etapa pedagógica:

* **En Práctica Libre (Entrenamiento):**
  * **Reinicio Visual de Progreso:** Al recargar o reingresar al nivel, la barra de progreso circular se reinicia explícitamente a `0%` y el contador de preguntas vuelve a comenzar desde `0` de `cantidad_requerida`.
  * **Mensaje de Orientación:** Se despliega un banner superior flotante motivador que recuerda al estudiante: *"¡Entrenamiento reiniciado! Completa la batería sin interrupciones para consolidar tu superpoder"* para mitigar la frustración.
* **En Desafíos (Evaluación):**
  * **Restauración del Estado:** Se reanuda la evaluación en la pregunta exacta y tiempo restante en que se encontraba, sin penalizar el progreso pero manteniendo inalterados los errores acumulados (hidratación desde API).
  * **Auto-avance en Errores/Timeout:** Para mantener el ritmo de evaluación, ante un error o expiración del tiempo, el sistema muestra feedback visual (rojo) por 1.5 segundos y avanza automáticamente a la siguiente pregunta.

### 5.2. Feedback Visual de Error

En una respuesta incorrecta:

* borde rojo en input;
* fondo rojo suave;
* badge de error;
* resplandor ambiental rojo;
* **Revelación de Respuesta Correcta (Práctica Libre):** Un panel informativo contiguo muestra de forma inmediata: *"La respuesta correcta era: [Respuesta]"*;
* feedback textual del Tutor Invisible;
* bloqueo de avance hasta que el alumno presiona el botón `"Siguiente Variante Espejo"`.

El sistema revela la respuesta correcta de inmediato tras cada error en Práctica Libre para guiar el aprendizaje activo. En la Zona de Desafíos, no se revela la respuesta correcta y se avanza directamente descontando vidas/tiempo.

*Regla de Score:* Las fallas cometidas en **Variantes Espejo** no se contabilizan en el marcador visual de "Errores" ni afectan la precisión estadística del alumno, reforzando el concepto de entrenamiento sin miedo.

### 5.3. Bloque de Rescate Explicativo

El Bloque de Rescate debe:

* abrirse como Modal Overlay prioritario o sección prioritario esmerilada (`glassmorphism`);
* bloquear la interacción con el fondo de la pantalla;
* mostrar la explicación teórica, la resolución detallada paso a paso y el *porqué* conceptual de la respuesta;
* renderizar énfasis visual en HTML/Markdown controlado;
* **no incluir ningún input de transcripción forzada ni bloqueos anti-spam**;
* habilitar un botón prioritario reactivo de color cian *"¡Entendido, ir al siguiente reto!"*;
* al hacer clic, llamar a `/api/fases/{fase_id}/cerrar-rescate` y avanzar fluidamente a la siguiente familia de preguntas independiente.

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
  * **Estética:** Resplandor de aureola **dorada premium** (`gold glow`), indicando que el bloque ha sido superado con éxito por el desempeño del alumno:
    * **En Práctica Libre:** El alumno completó el 100% de la batería asignada (independientemente del porcentaje de errores o bypasses). Su perseverancia es recompensada.
    * **En Zona de Desafíos:** El alumno completó el 100% y alcanzó un porcentaje real de precisión ≥90%.
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
  * **Alerta Crítica de Aprobación Retrógada (Retro-Approval Warning):** Si la acción seleccionada es `approve`, el modal desplegará un banner de alerta de color naranja esmerilado con la advertencia: *"¡ATENCIÓN! Aprobar manualmente este nivel declarará automáticamente aprobados todos los niveles anteriores de esta fase para conservar la consistencia"*.
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
