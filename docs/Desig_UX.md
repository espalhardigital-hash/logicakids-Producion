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

El dashboard muestra los niveles como nodos estelares.

Estados visuales:

* **Bloqueado:** candado esmerilado.
* **Disponible:** nodo activo con brillo suave.
* **En progreso:** animación pulsante.
* **Aprobado:** resplandor dorado.
* **Aprobado por Admin:** insignia especial de intervención.

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

Reglas:

* tablas claras;
* filtros visibles;
* acciones destructivas con confirmación;
* edición en modales;
* indicadores de estado;
* separación entre práctica libre y desafíos;
* vista diferenciada para teoría, preguntas, tokens y feedbacks.

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
