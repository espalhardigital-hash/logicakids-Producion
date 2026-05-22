# Guía de Estándares de Diseño y UX/UI (LogicaKids)

Este documento define la guía oficial y estandarizada de diseño UX/UI para la plataforma **LogicaKids**, asegurando que todos los niveles, módulos, desafíos y modales de teoría compartan la misma identidad visual, optimizada para niños de alrededor de 10 años.

---

## 1. Principios Core de Diseño
- **Estética Gamificada ("Space/Tech Dark Mode")**: Uso de fondos oscuros profundos con contrastes brillantes (neon-like) que hacen que el contenido resalte como un videojuego espacial.
- **Tipografía**: Fuentes sin serifa limpias, redondas y amigables. Se utiliza `Outfit` para títulos e indicadores destacados, e `Inter` para textos generales y descripciones.
- **Micro-interacciones Reactivas**:
  - **Hover (Ratón encima)**: Los elementos interactivos deben escalarse sutilmente (`scale(1.03)` o `scale(1.05)`) y ganar un resplandor o sombra de neón correspondiente a su color temático.
  - **Active (Clic/Tap)**: Efecto físico de presión táctil (`transform: scale(0.97)` o `scale(0.95)`).
  - **Transiciones**: Transiciones suaves y lineales (`transition: all 0.2s ease` o `transition: var(--f2-transition)`).

---

## 2. Paleta de Colores y Estructura de Fases
- **Fondo General**: Azul/Gris oscuro profundo (`#080e1c` o `#0b0f19`).
- **Tarjetas y Contenedores**: Paneles de tipo "vidrio" o *glassmorphism* (`rgba(255, 255, 255, 0.03)`) con bordes translúcidos (`rgba(255, 255, 255, 0.08)`) y esquinas redondeadas generosas (`border-radius: 16px` a `28px`).
- **Identidad de Color por Fase**:
  - Cada Fase tiene asignado un color característico que domina el tema visual de esa pantalla:
    - **Fase 2**: Verde brillante (`#10B981`)
    - **Fase 3**: Naranja neón (`#F97316`)
    - *Y así sucesivamente para las fases subsiguientes.*
  - El fondo de los banners del **Desafío Mixto** o **Desafío de Maestría** debe coincidir obligatoriamente con el color de la fase actual, usando gradientes y reflejos para dar profundidad.
- **Identidad de Color por Módulo**:
  - Dentro de una fase, cada módulo tiene su propio color de acento para la barra de progreso, iconos y detalles de texto, facilitando la diferenciación del contenido y reduciendo la monotonía.

---

## 3. Navegación y Cabeceras (Header)
Para asegurar que un niño nunca se sienta perdido en la navegación y tenga contexto completo de su ubicación:
- **Botón Atrás / Abortar**: Ubicado SIEMPRE en el extremo **superior izquierdo** (`.f2-back-btn` o `.f2-header-abort-btn`). En las pantallas de juego y de teoría, se utiliza un icono de salida o flecha limpia para retroceder (`ArrowLeft`/`LogOut`). Para evitar saturación visual, se puede omitir el texto descriptivo del botón en dispositivos compactos.
- **Avatar del Alumno**: En lugar de emojis genéricos, se muestra la foto de perfil o avatar real del usuario cargada dinámicamente (`getAvatarUrl` o `.avatar` desde el estado del usuario) en cabeceras de bienvenida, modales de teoría y diálogos guiados.
- **Métricas e Identificación de Nivel**: Las cabeceras de juego y de fase deben mostrar de forma prominente el **Nivel** y el **Nombre del Módulo** activo en el título o en un badge destacado. Las monedas, rachas o estadísticas globales se agrupan en la esquina **superior derecha** de forma compacta.

---

## 4. Estructura de Componentes Clave

### A. Dashboard / Hub de Fase (`WelcomeScreenPhase2` / `WelcomeScreenPhaseGeneric`)
- **Cuadrícula de Módulos (Grid 2x2)**: Las tarjetas de módulos se presentan en una cuadrícula adaptativa de **2 columnas** en resoluciones de tableta/escritorio (`repeat(2, 1fr)`) y **1 columna** en dispositivos móviles. Esto las hace más cuadradas y reduce el exceso de scroll vertical.
- **Reducción de Ruido Cognitivo**: Se eliminan etiquetas redundantes como "EN PROGRESO" o "BLOQUEADO".
- **Tarjetas Clicables**: Toda la tarjeta actúa como botón interactivo. Si el módulo está bloqueado, se muestra un candado simple y grande sobre el icono principal y la opacidad general de la tarjeta se reduce (`opacity: 0.5`).
- **Barras de Progreso Prominentes**: Tienen un grosor de **8px** (en lugar de `4px`) y usan un gradiente con brillo del color acento de su respectivo módulo.

### B. Zona de Selección de Niveles y Desafíos
- **Diseño en Barras Horizontales**: Reemplaza el antiguo formato de grid por una lista vertical de barras horizontales premium de color de acento dinámico.
- **Indicadores Claras de Nivel**: Cada barra muestra un icono distintivo a la izquierda según el tipo de nivel:
    - ✅ Nivel Dominado (estándar superado)
    - 🎯 Nivel Estándar activo
    - ⚡ Nivel Avanzado
    - 🏆 Nivel de Maestría
- **Animaciones en la Lista**: Al pasar el cursor, la barra correspondiente se desplaza ligeramente, su borde brilla con el color de acento y el botón de acción se expande sutilmente.

### C. Modal de Introducción de Nivel y Teoría (`Fase2TheoryModal`)
- **Eliminación Absoluta de Scrollbars**: Para garantizar una lectura cómoda sin desplazamientos en la tarjeta modal:
  - **Altura Dinámica**: El modal (`.flashcard-mode`) utiliza `height: auto` con una altura de seguridad de `max-height: 95vh`.
  - **Flujo de Contenido**: El contenido utiliza posicionamiento relativo (`position: relative`) con `height: auto`, permitiendo que el texto expanda naturalmente el tamaño del modal.
  - **Scrollbar de Seguridad**: Si y solo si el contenido es extremadamente largo o la pantalla es inferior a `700px` de altura, el contenedor del cuerpo del modal (`.flashcard-body`) activará un scrollbar vertical limpio.
- **Chunking (Paginación Corta)**: El contenido teórico (como ejemplos guiados y ejercicios interactivos) se subdivide en grupos pequeños de máximo 2 elementos por diapositiva para no abrumar al alumno.
- **Concisión del Texto**: La información textual teórica en diálogos y tarjetas explicativas debe limitarse, idealmente, a un máximo de **dos líneas** por idea/párrafo para facilitar una lectura ágil.
- **Identidad del Personaje**: Se debe incluir la foto de perfil o avatar del alumno (`userAvatar`) junto a los globos de diálogo o de bienvenida para incentivar la empatía en la lectura.
- **Botón Abortar**: Se proporciona un acceso rápido de abortar estudio integrado en la cabecera del modal para facilitar la salida en cualquier momento.

### D. Interfaz de Práctica Libre y Juego (`GameScreen` / `Fase2GameScreen` / `FaseGenericGameScreen`)
- **Distribución de Pantalla y Cabecera de Juego**:
  - **Cabecera Compacta y Unificada**: Se implementa una cabecera moderna (`.f2-game-header-modern` / `.fg-game-header-modern`) que contiene el botón de abortar misión a la izquierda, y en la derecha un grupo con un badge consolidado en formato de píldora única (`.f2-header-badge-pill` / `.fg-header-badge-pill`) estructurado con divisores verticales: `[MÓDULO] | NIVEL X | PREGUNTA Y/Z | [TIEMPO]S`.
  - **Barra de Progreso de Ancho Completo**: Situada directamente debajo de la cabecera principal, de extremo a extremo (`.f2-full-width-progress-bar` / `.fg-full-width-progress-bar`). Es una línea delgada que utiliza un degradado brillante del color correspondiente al módulo actual, liberando espacio en el área central.
- **Caja de Pregunta y Entrada Interactiva (Custom Input Box)**:
  - **Caja de Pregunta**: El enunciado se muestra en un bloque oscuro `.f2-question-text-box` / `.fg-question-text-box` con tipografía ampliada para alta visibilidad.
  - **Input Personalizado e Invisible**: La clásica caja de texto nativa es reemplazada por un contenedor interactivo personalizado (`.f2-custom-input-box` / `.fg-custom-input-box`) que alberga un input físico oculto (`.f2-hidden-input` / `.fg-hidden-input`). Esto permite que el estudiante haga clic o toque en cualquier zona de la caja para enfocar y teclear (tanto en móvil como en escritorio), visualizando el contenido de forma elegante:
    - **Estado Correcto**: La caja cambia a un borde y fondo verde translúcido, revelando a la derecha un badge circular verde con una marca de verificación (`✓`).
    - **Estado Incorrecto**: La caja cambia a un borde y fondo rojo translúcido, desplegando un badge circular rojo con una cruz (`✗`) y un indicador de respuesta esperada (`Era: X`).
  - **Marcador de Aciertos y Errores**: Se incorporan cajas en la base de la tarjeta (`.f2-scores-container` / `.fg-scores-container` y `.f2-score-box` / `.fg-score-box`) con bordes de color diferenciados (verde para aciertos, rojo para errores) que muestran las estadísticas en tiempo real sin interferir en la dinámica del juego.
- **Teclado Numérico Virtual en Grid 3x4**:
  - Organizado con una cuadrícula matemática clásica (`.f2-keypad-grid` / `.fg-keypad-grid`):
    - Botones del `1` al `9` ordenados en tres filas.
    - Fila inferior: Botón de borrar (`Delete`) a la izquierda, número `0` al centro, y el botón de confirmación (`confirm-key` / `[->]`) a la derecha.
  - El botón de confirmación se resalta en un color azul vibrante con degradado y brillo neón. Permanece activo durante la fase de retroalimentación para funcionar como botón de avance ("Continuar").
- **Flujo de Feedback en Línea y Bucle Espejo Progresivo**:
  - Queda prohibido el uso de modales emergentes o ventanas de diálogo intrusivas que interrumpen el ritmo de juego del alumno.
  - **En caso de Acierto**: Se activa un resplandor ambiental verde translúcido alrededor de la pantalla (`.f2-ambient-glow.correct` / `.fg-ambient-glow.correct`) y la interfaz avanza automáticamente a la siguiente pregunta tras 1.2 segundos.
  - **En caso de Error**: Se activa un resplandor ambiental rojo translúcido alrededor de la pantalla (`.f2-ambient-glow.incorrect` / `.fg-ambient-glow.incorrect`). El alumno puede visualizar su respuesta incorrecta al lado de la respuesta correcta directamente en la caja de entrada. Para continuar, el estudiante presiona la tecla `Enter` de su teclado físico o pulsa el botón de confirmación `[->]` en el teclado numérico virtual. Al hacerlo, avanza al siguiente paso o a la variante espejo provista por el backend de manera inmediata.
