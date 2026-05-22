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
Para asegurar que un niño nunca se sienta perdido en la navegación:
- **Botón Atrás / Abortar**: Ubicado SIEMPRE en el extremo **superior izquierdo** (`.f2-back-btn`).
- **Avatar del Alumno**: Integrado en el extremo izquierdo al lado del saludo (`¡Hola, [Nombre]! 👋`), cargando dinámicamente la imagen de perfil real elegida por el alumno desde el servicio de almacenamiento local (`getAvatarUrl`).
- **Métricas y Estadísticas**: Las monedas, racha de días u otros indicadores globales del alumno se agrupan en la esquina **superior derecha** de forma compacta.

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
- **Botón Abortar**: Se proporciona un acceso rápido de abortar estudio integrado en la cabecera del modal para facilitar la salida en cualquier momento.

### D. Interfaz de Práctica Libre y Juego (`GameScreen` / `FaseGenericGameScreen`)
- **Distribución de Pantalla ("Calculadora")**:
  - **Panel Izquierdo**: Enunciado de la pregunta en fuentes grandes, caja de respuesta clásica, barra de progreso general del nivel y contadores de respuestas correctas e incorrectas.
  - **Panel Derecho**: Teclado numérico integrado tipo cuadrícula `3x4` con botones grandes de fácil pulsación táctil. Integra las funciones de borrar (`Delete`) y confirmación (`Verificar`) en la base del teclado.
  - **Cabecera**: Contiene el botón superior izquierdo `[← Abortar Misión]` y el temporizador en la esquina opuesta.
- **Sistema de Feedback en Línea (Inline Feedback)**:
  - Se prohíben las ventanas emergentes (*overlays*) tras responder, las cuales interrumpen el flujo y aburren al niño.
  - **Acierto**: Un destello verde rápido rodea la zona del juego y pasa automáticamente a la siguiente pregunta de forma fluida.
  - **Error**: El recuadro del enunciado se tiñe de rojo y despliega en la parte inferior de la pregunta la respuesta correcta y el soporte del *Bucle Espejo* (explicación paso a paso de por qué esa es la respuesta), con un botón inferior "Volver a intentar" para reintentar la operación.
