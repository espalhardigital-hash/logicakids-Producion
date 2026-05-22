# Guía General de Interfaz y Diseño UX/UI (LogicaKids)

Este documento centraliza las instrucciones y convenciones de diseño para asegurar que todos los niveles, módulos y ventanas de la plataforma LogicaKids compartan el mismo lenguaje visual y ofrezcan una experiencia coherente, especialmente optimizada para niños (~10 años).

---

## 1. Principios Core de Diseño
- **Público Objetivo**: Niños. La interfaz no debe sentirse como un software empresarial o administrativo.
- **Estética "Gamificada"**: Uso del modo oscuro (Dark Mode) profundo, contrastado con colores vibrantes, elementos brillantes (neón/pastel) y "glassmorphism" (transparencias sutiles).
- **Tipografía**: Fuentes sin serifa, limpias y amigables (ej. Inter, Poppins). Los textos deben ser grandes, legibles y concisos.
- **Interacciones Vivas**: 
  - Todo elemento clicable debe tener un efecto *hover* (ej. escalar a `1.05`, levantar ligeramente).
  - Al hacer clic (*active*) debe sentirse un rebote físico (`scale 0.95`).
  - Transiciones suaves (`0.3s ease`).

## 2. Paleta de Colores y Estados
- **Fondo Global**: Azul/Gris muy oscuro (Ej. `#0B1120` o `#0F172A`).
- **Paneles y Tarjetas**: Fondos translúcidos (`rgba(255, 255, 255, 0.03)`) con bordes muy sutiles (`rgba(255, 255, 255, 0.05)`).
- **Identidad de Fases y Módulos**: 
  - Cada **Fase** tiene un color principal que la representa (Ej. Fase 2 es Verde, Fase 3 es Naranja). Este color debe bañar los elementos principales de la fase, como los iconos globales y el **banner del desafío final**.
  - Cada **Módulo** interno de la fase puede tener variaciones tonales o un color de acento único para diferenciar las tarjetas.
- **Feedback Universal**: 
  - Acierto / Completado: Verde brillante (`#10B981`).
  - Error / Peligro: Rojo vibrante (`#EF4444`).
  - Bloqueado / Inactivo: Escala de grises con baja opacidad (`opacity: 0.5`).

## 3. Elementos Estructurales Comunes
- **Header (Cabecera)**:
  - **Navegación**: Los botones de retroceso ("Atrás" o "Abortar Misión") deben ir SIEMPRE en la **esquina superior izquierda**.
  - **Información del Usuario**: Avatar o nombre en la esquina superior derecha o centro-izquierda.
  - **Métricas**: Monedas, rachas o gemas agrupadas a la derecha.
- **Botones Primarios**:
  - Deben parecer "presionables". Uso de gradientes sutiles y sombras de colores (`box-shadow: 0 4px 15px rgba(color, 0.3)`).
  - Bordes redondeados (`12px` a `16px`).
- **Feedback (Bucle Espejo)**:
  - En escenarios de práctica, el feedback debe ser **Inline** (en línea), sin ventanas emergentes que bloqueen la pantalla, para mantener el estado de "flow" del alumno.

---

## 4. Análisis y Propuestas de Mejora (Dashboard Fase 2)
*(Análisis basado en la captura de pantalla provista del Dashboard de inicio de la Fase 2)*

### Análisis Visual Actual
La interfaz actual es muy limpia y elegante. Cuenta con un header con saludo, 4 tarjetas de módulos verticales (con icono, título, descripción y botón de estado) y un gran banner verde inferior para el Desafío Mixto. 

### Oportunidades de Mejora (Propuestas)

1. **Posicionamiento del Botón Atrás (Header)**
   - **Problema**: La flecha de regreso `[←]` se encuentra en el extremo derecho.
   - **Solución**: Mover el botón de retroceso a la esquina superior izquierda (antes del saludo "¡Hola, amilcar_admin!"). Esto obedece a los estándares universales de navegación y evita que los usuarios lo busquen.

2. **Diseño de las Tarjetas de Módulo (Cards)**
   - **Proporción y Layout (Grid 2x2)**: Las tarjetas ya no deben ser rectángulos verticales y altos (1x4 columnas). Deben ser más **cuadradas y proporcionadas**, organizadas en una cuadrícula de 2 columnas por 2 filas (2x2). Esto distribuye mejor el texto y reduce la altura excesiva.
   - **Iconografía**: Los iconos actuales son funcionales pero un poco "serios". **Mejora**: Usar iconos más grandes, amigables o ilustraciones 3D/emojis que conecten mejor con la temática de "Gimnasio", "Tienda", etc.
   - **Carga Cognitiva (Textos)**: Las descripciones son muy pequeñas y grises. Al usar el formato cuadrado, el texto tiene más espacio horizontal para respirar. Aún así, **Mejora**: Reducir la descripción a 1 o 2 líneas máximas y usar un interlineado cómodo.
   - **Eliminación del Botón de Estado**: El botón de texto "EN PROGRESO" ocupa espacio innecesario y confunde. **Mejora**: Eliminar ese falso botón y dejar que toda la tarjeta sea el elemento clicable.
   - **Barra de Progreso**: La barra inferior es muy delgada (`2px-4px`). **Mejora**: Hacerla más gruesa (`6px-8px`) y colorida (usando el color del módulo), integrándola limpiamente en la parte inferior de la tarjeta cuadrada.

3. **Banner del Desafío Mixto**
   - El contenedor inferior resalta perfectamente y capta la atención como el objetivo final.
   - **Regla de Color Dinámico**: El fondo de este gran recuadro (banner) **debe tener siempre el color representativo de la fase actual** (por ejemplo, verde para la Fase 2, naranja para la Fase 3, etc.).
   - **Mejora**: Al botón blanco "Iniciar Desafío Mixto" se le podría agregar un icono (ej. `[Iniciar Desafío Mixto →]`) y una sutil sombra paralela (o usar el color de la fase en su texto) para que se vea más tridimensional e invite al clic.

4. **Avatar del Usuario**
   - **Mejora**: El saludo "¡Hola, amilcar_admin! 👋" podría estar acompañado por la foto de perfil o el avatar configurado por el usuario (como se hizo en la ventana de teoría), dándole un toque más personalizado.
