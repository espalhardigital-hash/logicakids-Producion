# Prompt para el Panel de Estadísticas Frontend (LogicaKids Pro Concept)

Copia y pega el siguiente prompt en una IA generadora de código para replicar el diseño y la funcionalidad del panel de estadísticas:

---

### PROMPT DE DISEÑO Y DESARROLLO: PANEL DE CONTROL DE PROGRESO Y ANALÍTICAS

**Objetivo:** Crear una pantalla de "Mi Progreso" (Dashboard) para una aplicación educativa, utilizando React, TypeScript, Tailwind CSS y Lucide Icons. El diseño debe ser premium, moderno y altamente visual, siguiendo una estética "Glassmorphism" Dark.

**1. Estética General y Sistema de Diseño:**
- **Fondo:** Gradientes oscuros profundos (Slate-900 / Zinc-950) con capas de desenfoque y efectos de cristal.
- **Jerarquía Visual:** Uso de tarjetas con bordes sutiles (`border-white/10`) y fondos translúcidos (`bg-white/5`).
- **Colores de Acento:** 
  - Éxito/Correcto: Verde (`#10b981`).
  - Error/Incorrecto: Rojo (`#ef4444`).
  - Niveles/Puntajes: Amarillo Neón (`#facc15`).
  - Categorías: Colores vibrantes (Verde, Rosa, Teal, Azul, Púrpura, Naranja) para los iconos.
- **Tipografía:** Moderna, con pesos variados. Números y porcentajes destacados en negrita.

**2. Componentes Principales:**

**A. Encabezado y Resumen (KPIs):**
- Título principal "Mi Progreso" con el nombre del usuario debajo en un tono gris suave.
- Un grid de 3 tarjetas horizontales que muestren:
  1. **Partidas:** Icono de control de juego, número total y etiqueta "PARTIDAS".
  2. **Promedio:** Icono de tendencia ascendente, porcentaje (ej: 76%) y etiqueta "PROMEDIO".
  3. **Correctas:** Icono de diana/objetivo, número total y etiqueta "CORRECTAS".
- Las tarjetas deben tener un diseño minimalista con el icono en la parte superior central.

**B. Listado de Progreso por Categoría (Sistema de Acordeón):**
- Título de sección: "PROGRESO POR CATEGORÍA" en gris tenue y mayúsculas.
- Cada categoría es una tarjeta colapsable (Accordion) con:
  - **Lado Izquierdo:** Icono de la categoría (ej: '+', '÷', '#') dentro de un cuadro con color de fondo vibrante y esquinas redondeadas.
  - **Centro:** Nombre de la categoría, seguido de un resumen (ej: "5 partidas • 81% precisión").
  - **Lado Derecho:** Indicador de nivel actual (ej: "Nivel 5") con una serie de puntos (dots) que representan el progreso visual (puntos rellenos en amarillo). Icono de chevron para expandir.
- **Estado Expandido (Detalle de Niveles):**
  - Al expandir, se muestra una lista vertical de intentos o niveles previos.
  - Cada fila de detalle incluye:
    - Etiqueta de nivel (ej: "Nv.5") en un badge gris.
    - Porcentaje de precisión destacado (ej: 82%).
    - Conteo de aciertos (icono check verde) y errores (icono 'x' roja).
    - Fecha del intento (icono calendario).
    - Botón de eliminar (icono papelera) en el extremo derecho.

**C. Pantalla de Resultados de Sesión (Feedback Inmediato):**
- Vista centrada con una tarjeta de "Trofeo/Medalla".
- Resumen de la sesión: Puntaje final, grid de aciertos/errores y tiempos (promedio y total).
- Botones de acción: Repetir, Inicio y Siguiente Nivel (con animación de pulso).

**3. Especificaciones Técnicas y UX:**
- **Interactividad:** Los acordeones deben tener transiciones suaves al abrirse/cerrarse.
- **Efectos Hover:** Las filas de nivel y tarjetas de categoría deben iluminarse sutilmente al pasar el cursor.
- **Responsividad:** El diseño debe adaptarse perfectamente a dispositivos móviles, manteniendo la legibilidad de los datos en las filas de detalle.
- **Iconografía:** Usar `lucide-react` para todos los iconos mencionados.

---

**Instrucción Adicional:** "Genera el código con una estructura de componentes limpia. El componente principal debe manejar el estado de apertura de los acordeones y los datos de ejemplo deben coincidir con la jerarquía de las capturas (Resumen -> Categoría -> Niveles/Intentos)."

