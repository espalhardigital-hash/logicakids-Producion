# Especificación de Diseño UI/UX: Pantalla de Mapa General (`GeneralMap.tsx`)

Esta especificación actúa como guía e instrucción de diseño técnica y estética que describe cómo construir la interfaz de usuario del mapa interactivo de niveles para **LogicaKids Pro**. Esta especificación es idónea para ser leída por un desarrollador Frontend Senior o una Inteligencia Artificial para implementar la vista con máxima fidelidad visual y comportamiento interactivo.

---

## 1. Rol y Enfoque de Desarrollo
* **Rol**: Desarrollador Frontend experto en React, Tailwind CSS y diseño UI/UX de alta calidad. El objetivo es construir una interfaz gamificada de un mapa de niveles (estilo "Journey" o "Timeline") cuidando los detalles premium, el diseño responsivo (Mobile-first), y usando `framer-motion` (para animaciones fluidas) y `lucide-react` (para iconografía moderna).

---

## 2. Tema y Estética General (Tokens Visuales)

El diseño general sigue una estética futurista, limpia y sumamente atractiva:

* **Modo Oscuro Profundo**: Fondo de pantalla general `bg-slate-900` con texto principal blanco o `text-slate-50`.
* **Fondo Ambiental (Glow Profundo)**: 
  - Añade dos esferas desenfocadas de fondo con un desenfoque (blur) extremo de `120px` usando colores tenues como `bg-blue-900/20` y `bg-purple-900/20` ubicadas en las esquinas opuestas de la pantalla (`top-[-20%] left-[-10%]` y `bottom-[-20%] right-[-10%]`) para dar una atmósfera de profundidad tridimensional.
* **Tipografía Modernizada**:
  - Títulos principales en tipografía Sans-Serif gruesa, utilizando las clases Tailwind `font-black tracking-tight`.
  - Subtítulos, descripciones y datos técnicos con tipografía de grosor medio, clase `font-medium text-slate-400`.

---

## 3. Dashboard Header (Estructura Responsiva)

El encabezado superior de la aplicación se adapta dinámicamente al tamaño del dispositivo:

* **Estructura Responsiva**:
  - **En Móviles (Mobile-first)**: Los elementos se apilan verticalmente en columna (`flex-col`) con un espaciado de `gap-6` y el título centrado.
  - **En Tablets/Escritorio (`md:` en adelante)**: Se reorganiza en una fila horizontal (`flex-row`), justificado en los extremos (`justify-between`).
* **Sección de Información (Lado Izquierdo)**:
  - Título principal: `"Tu Viaje Matemático"` (`text-4xl font-black text-white mb-2 tracking-tight`).
  - Subtítulo de estado del alumno: `"Fase Actual: X"` (donde X representa el número dinámico de la fase desbloqueada actual, calculado desde `user.current_phase + 1`).
* **Sección de Controles (Lado Derecho)**:
  - Un contenedor horizontal (`flex gap-6`) que agrupa dos botones de control premium:
    1. **Botón Perfil de Usuario (Estilo Cápsula)**:
       - Estructura: Botón redondeado completo (`rounded-full`), con fondo slate transparente `bg-slate-800/50`, y borde suave `border border-transparent`.
       - Efecto Hover: Al pasar el cursor, cambia a `bg-slate-800 border-slate-700`.
       - Contenido: Un avatar circular a la izquierda con un borde que al hacer hover se enciende en azul (`group-hover:border-blue-500`), el icono `User` de Lucide centrado, y a la derecha el nombre de usuario de la cuenta (`user.username`) junto con la etiqueta `"Ver Perfil"` en mayúsculas pequeñas (solo visible en pantallas `sm` en adelante).
    2. **Botón Cerrar Sesión**:
       - Estructura: Botón ancho con borde y fondo gris pizarra oscuro (`px-6 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold`).
       - Efecto Hover: Al pasar el ratón, se tiñe de color rojo sutil (`hover:bg-red-500/20 hover:text-red-400 transition-colors`).

---

## 4. El Mapa de Niveles (Línea de Tiempo en Zig-Zag)

El corazón de la pantalla es un mapa lineal interactivo contenido en un contenedor central `max-w-4xl mx-auto px-4 mt-8 relative z-10`.

* **Comportamiento Adaptable**:
  - **En Móviles**: Las tarjetas de fases se apilan una sobre otra verticalmente (`flex-col`) con espaciados cómodos. No se dibuja la línea de tiempo conectora central.
  - **En Escritorio (`md:` en adelante)**:
    - **Línea Conectora Central**: Se dibuja una línea vertical fina (`w-1.5`) de color gris oscuro `bg-slate-800` justo en el centro absoluto de la pantalla (`absolute left-1/2 -translate-x-1/2 top-4 bottom-4 rounded-full`).
    - **Distribución en Zig-Zag**: Las tarjetas se alternan a la izquierda y derecha de la línea conectora utilizando alternancia de clases flexbox. La primera fase ocupa el 50% de la izquierda, la segunda fase ocupa el 50% de la derecha, y así sucesivamente (`md:flex-row` vs `md:flex-row-reverse`).
    - **Nodos Conectores**: Justo sobre la línea vertical central se renderiza un nodo circular flotante por cada fase (`w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 z-10 flex items-center justify-center`).
      - Si la fase está **Desbloqueada**: El nodo contiene un punto luminoso azul con sombra brillante (`w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]`).
      - Si la fase está **Bloqueada**: El nodo muestra un icono de candado gris (`Lock` de Lucide, `size={16} text-slate-600`).

---

## 5. Tarjetas de Fases (Cards)

Las tarjetas de niveles representan las unidades didácticas y adoptan una estética glassmorphism premium:

* **Geometría**: Bordes ultra-redondeados usando la clase de Tailwind `rounded-[2.5rem]`.
* **Estado Desbloqueada (Fase Disponible)**:
  - Estructura: Fondo semitransparente oscuro `bg-slate-800/80` y borde cian/gris fino `border-slate-700`.
  - Efecto Hover Premium: Al pasar el cursor sobre la tarjeta, esta realiza un desplazamiento suave hacia arriba (`hover:-translate-y-2`), aumenta drásticamente su sombra trasera (`hover:shadow-2xl`) y activa un brillo interno translúcido del color temático de la fase (`absolute inset-0 opacity-10 group-hover:opacity-10 transition-opacity duration-300` + clase de color de acento).
  - cursor: `cursor-pointer`.
* **Estado Bloqueada (Fase No Disponible)**:
  - Estructura: Fondo oscuro opaco `bg-slate-900/50` con borde muy atenuado `border-slate-800/50`.
  - Efecto Visual: La tarjeta se dibuja con una opacidad global reducida (`opacity-60`). No responde a interacciones de hover ni desplazamientos.
  - cursor: `cursor-not-allowed`.

### 5.1. Distribución de Elementos Internos de la Tarjeta:
1. **Cabecera de Tarjeta (Fila Superior)**:
   - **Lado Izquierdo (Icono Temático)**: Un recuadro grande (`w-14 h-14 rounded-2xl flex items-center justify-center`) que contiene el icono de la fase (de Lucide).
     - Si está desbloqueada: Se pinta con el color vibrante de la fase, texto blanco y un efecto de sombra proyectada del color correspondiente (`shadow-lg shadow-[color]/50`).
     - Si está bloqueada: Se dibuja en gris opaco `bg-slate-800 text-slate-500`.
   - **Lado Derecho (Metadatos)**:
     - Muestra el número de fase en mayúsculas y espaciado de letras (`text-[10px] font-black uppercase tracking-widest text-slate-500`).
     - Si la fase está bloqueada, añade debajo un indicador de bloqueo con un mini candado (`text-xs font-bold text-slate-600 flex items-center gap-1`).
2. **Cuerpo de Tarjeta (Información Central)**:
   - Título de la Fase: Fuente extra-gruesa de gran formato (`text-2xl font-black mb-2 relative z-10 md:text-3xl`).
     - Si está desbloqueada: Color blanco.
     - Si está bloqueada: Color gris atenuado `text-slate-400`.
   - Descripción Pedagógica: Párrafo de texto fluido que detalla los temas (`text-sm leading-relaxed relative z-10`).
     - Si está desbloqueada: Color `text-slate-300`.
     - Si está bloqueada: Color `text-slate-600`.
3. **Pie de Tarjeta (Botón de Acción - Exclusivo Desbloqueadas)**:
   - Añade en la parte inferior un botón ancho `mt-8 relative z-10 py-3 rounded-xl bg-slate-700/50 text-white font-bold transition-colors w-full`.
   - Efecto Sincronizado: Al hacer hover en **cualquier parte de la tarjeta completa**, el botón de acción cambia su color de fondo automáticamente a azul brillante (`group-hover:bg-blue-500`).

---

## 6. Animaciones de Entrada (Framer Motion)

Para garantizar una carga de pantalla premium y pulida, las tarjetas de las fases no se cargan estáticamente:

* **Contenedor Principal**: Envuelto en un componente animado `motion.div`.
* **Efecto Escalonado (Stagger Delay)**:
  - Cada tarjeta de nivel inicia su renderizado de forma invisible y desplazada hacia abajo: `initial={{ opacity: 0, y: 30 }}`.
  - Al cargar, se animan fluidamente hacia su estado final: `animate={{ opacity: 1, y: 0 }}`.
  - El retardo (delay) de animación de cada elemento se calcula dinámicamente multiplicando el índice de la fase por `0.1` (`transition={{ delay: index * 0.1 }}`). Esto provoca un efecto de cascada visual sumamente satisfactorio conforme el alumno desciende en el scroll.

---

## 7. Modelo de Datos y Mapeo Pedagógico (9 Fases Reales)

El arreglo de datos con el que se renderiza el mapa en `GeneralMap.tsx` debe mapear con total exactitud las 9 fases del Viaje Matemático:

```typescript
import { Zap, Brain, BookOpen, PieChart, Square, Box, Map, Lightbulb, GraduationCap } from 'lucide-react';

const PHASES_CONFIG = [
  {
    index: 1,
    title: 'Aritmética Básica',
    description: 'Sumas, restas, multiplicaciones y divisiones.',
    icon: Zap,
    color: 'bg-blue-500',
    shadow: 'shadow-blue-500/50'
  },
  {
    index: 2,
    title: 'Desarrollo Numérico y Razonamiento',
    description: 'Cálculo mental, sistema monetario y lectura matemática.',
    icon: Brain,
    color: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/50'
  },
  {
    index: 3,
    title: 'Problemas de Texto',
    description: 'Lectura, interpretación, elección de operación y problemas combinados.',
    icon: BookOpen,
    color: 'bg-orange-500',
    shadow: 'shadow-orange-500/50'
  },
  {
    index: 4,
    title: 'Fracciones, Porcentajes y Gráficos',
    description: 'Relación parte-todo, métricas y visualización de datos.',
    icon: PieChart,
    color: 'bg-purple-500',
    shadow: 'shadow-purple-500/50'
  },
  {
    index: 5,
    title: 'Geometría Plana',
    description: 'Figuras, áreas, perímetros y comprensión espacial bidimensional.',
    icon: Square,
    color: 'bg-rose-500',
    shadow: 'shadow-rose-500/50'
  },
  {
    index: 6,
    title: 'Geometría Espacial',
    description: 'Visualización 3D, prismas, cilindros y cálculo de volumen.',
    icon: Box,
    color: 'bg-indigo-500',
    shadow: 'shadow-indigo-500/50'
  },
  {
    index: 7,
    title: 'Coordenadas y Desplazamientos',
    description: 'Mapas, rutas, plano cartesiano y orientación.',
    icon: Map,
    color: 'bg-teal-500',
    shadow: 'shadow-teal-500/50'
  },
  {
    index: 8,
    title: 'Probabilidad, Combinatoria y Lógica',
    description: 'Casos posibles, patrones y razonamiento abstracto.',
    icon: Lightbulb,
    color: 'bg-amber-500',
    shadow: 'shadow-amber-500/50'
  },
  {
    index: 9,
    title: 'Simulados Pedro II',
    description: 'Práctica para examen real, correcciones e identificador de errores.',
    icon: GraduationCap,
    color: 'bg-yellow-600',
    shadow: 'shadow-yellow-600/50'
  }
];
```

---

## 8. Integración del Controlador en `App.tsx`

La máquina de estados de navegación centralizada en `App.tsx` debe ser configurada de tal manera que:
1. Al autenticarse correctamente, el estado cambie a `GameScreenState.PHASE_MAP` (renderizando `<GeneralMap user={currentUser} onSelectPhase={handleSelectPhase} onLogout={handleLogout} />`).
2. Al hacer clic en un botón "Entrar a Fase X", `handleSelectPhase(phaseIndex)` capturará el índice y cambiará el estado de la pantalla al flujo específico de esa fase (ej: para la Fase 1, se redirige a `GameScreenState.WELCOME` para abrir el selector de categorías del Calentamiento Aritmético).
