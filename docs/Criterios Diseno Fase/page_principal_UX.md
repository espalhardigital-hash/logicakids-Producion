# Especificación de Diseño UI/UX: Pantalla de Mapa General (`PhaseMapScreen.tsx`) - Versión 3.0 (Certificada)

> **Versión:** 3.0 | **Última actualización:** 2026-06-08 | **Prioridad documental:** 4 (Extensión de [Guía UX/UI](Desig_UX.md))
>
> **Nota:** Este documento es una extensión especializada de la [Guía UX/UI](Desig_UX.md) centrada exclusivamente en la pantalla `PhaseMapScreen.tsx`.

Esta especificación actúa como guía técnica y estética para la pantalla del mapa interactivo de niveles para **LogicaKids Pro**. Tras la auditoría final, la pantalla se ha integrado en el sistema de enrutamiento declarativo de **React Router DOM v6+** y consume el estado global de **Zustand** y del **Contexto de Autenticación**, garantizando un rendimiento premium y eliminando el antipatrón de prop-drilling.

---

## 1. Rol y Enfoque de Desarrollo

* **Rol**: Desarrollador Frontend experto en React, Tailwind CSS y diseño UI/UX de alta calidad. El objetivo es construir una interfaz gamificada de un mapa de niveles (estilo "Journey" o "Timeline") cuidando los detalles premium, el diseño responsivo (Mobile-first), y usando `framer-motion` (para animaciones fluidas) y `lucide-react` (para iconografía moderna).

---

## 2. Tema y Estética General (Tokens Visuales)

El diseño general sigue una estética futurista, limpia y sumamente atractiva:

* **Modo Oscuro Profundo**: Fondo de pantalla general `bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#070A13]` con texto principal blanco o `text-slate-50`.
* **Fondo Ambiental (Glow Profundo)**: 
  - Cuatro grandes esferas desenfocadas de fondo con un desenfoque (blur) extremo de `150px` usando colores neón tenues (`bg-blue-950/20`, `bg-purple-950/20`, `bg-cyan-950/20`, y `bg-emerald-950/20`) ubicadas estratégicamente a lo largo de la altura vertical de scroll, eliminando cortes de color abruptos y brindando una atmósfera cósmica tridimensional.
* **Tipografía Modernizada**:
  - Títulos principales en tipografía Sans-Serif de Google Fonts (ej. Outfit o Inter) gruesa, utilizando las clases Tailwind `font-black tracking-tight`.
  - Subtítulos, descripciones y datos técnicos con tipografía de grosor medio, clase `font-medium text-slate-400`.

---

## 3. Dashboard Header (Estructura Responsiva)

El encabezado superior de la aplicación se adapta dinámicamente al tamaño del dispositivo:

* **Estructura Responsiva**:
  - **En Móviles (Mobile-first)**: Los elementos se apilan verticalmente en columna (`flex-col`) con un espaciado de `gap-6` y el título centrado.
  - **En Tablets/Escritorio (`md:` en adelante)**: Se organiza en una fila horizontal (`flex-row`), justificado en los extremos (`justify-between`).
* **Sección de Información (Lado Izquierdo)**:
  - Título principal: `"Tu Viaje Matemático"` (`text-4xl font-black text-white mb-2 tracking-tight`).
  - Subtítulo de estado del alumno: `"Fase Actual: X"` (donde X representa el número de la fase desbloqueada actual, leído del perfil del alumno en `currentUser.fase_actual_id`).
* **Sección de Controles (Lado Derecho)**:
  - Un contenedor horizontal (`flex gap-6 items-center`) que agrupa los controles premium:
    1. **Botón Perfil de Usuario (Estilo Cápsula)**:
       - Estructura: Botón redondeado completo (`rounded-full`), con fondo slate transparente `bg-slate-800/50` y borde suave `border border-transparent`.
       - Efecto Hover: Al pasar el cursor, cambia a `bg-slate-800 border-slate-700`.
       - Contenido: Un avatar circular a la izquierda (`w-12 h-12` o 48px) que al hacer hover se enciende en azul (`group-hover:border-blue-500`), el avatar dinámico del alumno cargado desde S3, y a la derecha el nombre de usuario de la cuenta (`currentUser.username`) en formato de texto extra-negrita.
       - Comportamiento: Al hacer clic, navega a la ruta `/profile` usando React Router.
    2. **Botón Cerrar Sesión**:
       - Estructura: Botón ancho con borde y fondo gris pizarra oscuro (`px-6 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold`).
       - Efecto Hover: Al pasar el ratón, se tiñe de color rojo sutil (`hover:bg-red-500/20 hover:text-red-400 transition-colors`).
       - Comportamiento: Dispara `logout()` del Contexto de Autenticación, limpiando los tokens JWT del almacenamiento local.

---

## 4. El Mapa de Niveles (Línea de Tiempo en Zig-Zag)

El corazón de la pantalla es un mapa lineal interactivo contenido en un contenedor central `max-w-4xl mx-auto px-4 mt-8 relative z-10`.

* **Comportamiento Adaptable**:
  - **En Móviles**: Las tarjetas de fases se apilan una sobre otra verticalmente (`flex-col`) con espaciados cómodos. No se dibuja la línea de tiempo conectora central.
  - **En Escritorio (`md:` en adelante)**:
    - **Línea Conectora Central**: Se dibuja una línea vertical fina (`w-1.5`) de color gris oscuro `bg-slate-800` justo en el centro absoluto de la pantalla (`absolute left-1/2 -translate-x-1/2 top-4 bottom-4 rounded-full`).
    - **Distribución en Zig-Zag**: Las tarjetas se alternan a la izquierda y derecha de la línea conectora utilizando alternancia de clases flexbox. La primera fase ocupa el 50% de la izquierda, la segunda fase ocupa el 50% de la derecha, y así sucesivamente (`md:flex-row` vs `md:flex-row-reverse`).
    - **Nodos Conectores**: Justo sobre la línea vertical central se renderiza un nodo circular flotante por cada fase (`w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 z-10 flex items-center justify-center`).
      - Si la fase está **Desbloqueada**: El nodo contiene un punto luminoso cian/azul con sombra brillante (`w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]`).
      - Si la fase está **Bloqueada**: El nodo muestra un candado interactivo gris (`Lock` de Lucide, `size={16} text-slate-600`).

---

## 5. Tarjetas de Fases (Cards)

Las tarjetas de niveles representan las unidades didácticas y adoptan una estética glassmorphism premium:

* **Geometría**: Bordes ultra-redondeados usando la clase de Tailwind `rounded-[2.5rem]`.
* **Estado Desbloqueada (Fase Disponible)**:
  - Estructura: Fondo semitransparente oscuro `bg-slate-800/80` y borde fino cian/gris `border-slate-700`.
  - Efecto Hover Premium: Al pasar el cursor sobre la tarjeta, esta realiza un desplazamiento suave hacia arriba (`hover:-translate-y-2`), aumenta drásticamente su sombra trasera (`hover:shadow-2xl`) y activa un brillo interno translúcido del color temático de la fase.
  - cursor: `cursor-pointer`.
* **Estado Bloqueada (Fase No Disponible)**:
  - Estructura: Fondo oscuro opaco `bg-slate-900/50` con borde muy atenuado `border-slate-800/50`.
  - Efecto Visual Premium: Para mantener la motivación, las fases bloqueadas se muestran con sus iconos y tarjetas en **colores vivos y resplanderes neon originales**, mientras que el bloqueo se representa mediante elegantes candados en los conectores, cabeceras y una opacidad reducida del texto.
  - cursor: `cursor-not-allowed` (salvo que el usuario tenga rol `ADMIN`, en cuyo caso se aplica un bypass total y el candado se desbloquea).

### 5.1. Distribución de Elementos Internos de la Tarjeta:
1. **Cabecera de Tarjeta (Fila Superior)**:
   - **Lado Izquierdo (Icono Temático)**: Un recuadro grande (`w-14 h-14 rounded-2xl flex items-center justify-center`) que contiene el icono de la fase (de Lucide) pintado en su color vibrante neón y sombra del color correspondiente (`shadow-lg shadow-[color]/50`).
   - **Lado Derecho (Metadatos e Insignias)**:
     - Muestra el número de fase en mayúsculas y espaciado de letras (`text-[10px] font-black uppercase tracking-widest text-slate-500`).
     - Si la fase está dominada al 100%, se despliega una insignia premium de color verde menta `bg-emerald-50 text-emerald-700 border-emerald-200` con el texto `✓ Dominado ✅`.
     - Si la fase está bloqueada, añade un indicador de bloqueo con un mini candado (`text-xs font-bold text-slate-600 flex items-center gap-1`).
2. **Cuerpo de Tarjeta (Información Central)**:
   - Título de la Fase: Fuente extra-gruesa de gran formato (`text-2xl font-black mb-2 relative z-10 md:text-3xl`).
     - Si está desbloqueada: Color blanco.
     - Si está bloqueada: Color gris atenuado `text-slate-400`.
   - Descripción Pedagógica: Párrafo de texto fluido que detalla los temas (`text-sm leading-relaxed relative z-10`).
     - Si está desbloqueada: Color `text-slate-300`.
     - Si está bloqueada: Color `text-slate-600`.
3. **Pie de Tarjeta (Botón de Acción)**:
   - Añade en la parte inferior un botón ancho `mt-8 relative z-10 py-3 rounded-xl bg-slate-700/50 text-white font-bold transition-colors w-full`.
   - Si la fase está dominada, el botón cambia dinámicamente su etiqueta a `✓ Repasar Fase (Dominada) ✅`.
   - Efecto Sincronizado: Al hacer hover en cualquier parte de la tarjeta completa, el botón de acción cambia su color de fondo a azul/cian brillante (`group-hover:bg-cyan-500`).

---

## 6. Animaciones de Entrada (Framer Motion)

Para garantizar una carga de pantalla premium y pulida, las tarjetas de las fases no se cargan estáticamente:

* **Contenedor Principal**: Envuelto en un componente animado `motion.div`.
* **Efecto Escalonado (Stagger Delay)**:
  - Cada tarjeta de nivel inicia su renderizado de forma invisible y desplazada hacia abajo: `initial={{ opacity: 0, y: 30 }}`.
  - Al cargar, se animan fluidamente hacia su estado final: `animate={{ opacity: 1, y: 0 }}`.
  - El retardo (delay) de animación de cada elemento se calcula dinámicamente multiplicando el índice de la fase por `0.1` (`transition={{ delay: index * 0.1 }}`). Esto provoca un efecto de cascada visual sumamente satisfactorio.

---

## 7. Modelo de Datos y Mapeo Pedagógico (9 Fases Reales)

El arreglo de datos con el que se renderiza el mapa en `PhaseMapScreen.tsx` mapea con total exactitud las 9 fases del Viaje Matemático:

```typescript
import { Zap, Brain, BookOpen, PieChart, Square, Box, Map, Lightbulb, GraduationCap } from 'lucide-react';

const PHASES_CONFIG = [
  {
    index: 1,
    title: 'Aritmética Básica',
    description: 'Sumas, restas, multiplicaciones y divisiones.',
    icon: Zap,
    color: 'bg-blue-500',
    shadow: 'shadow-blue-500/50',
    path: '/fase/1/welcome'
  },
  {
    index: 2,
    title: 'Desarrollo Numérico y Razonamiento',
    description: 'Cálculo mental, sistema monetario brasileño y lectura matemática.',
    icon: Brain,
    color: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/50',
    path: '/fase/2/welcome'
  },
  {
    index: 3,
    title: 'Problemas de Texto',
    description: 'Lectura, interpretación, elección de operación y problemas combinados.',
    icon: BookOpen,
    color: 'bg-orange-500',
    shadow: 'shadow-orange-500/50',
    path: '/fase/3/welcome'
  },
  {
    index: 4,
    title: 'Fracciones, Porcentajes y Gráficos',
    description: 'Relación parte-todo, métricas y visualización de datos.',
    icon: PieChart,
    color: 'bg-purple-500',
    shadow: 'shadow-purple-500/50',
    path: '/fase/4/welcome'
  },
  {
    index: 5,
    title: 'Geometría Plana',
    description: 'Figuras, áreas, perímetros y comprensión espacial bidimensional (Tangram).',
    icon: Square,
    color: 'bg-rose-500',
    shadow: 'shadow-rose-500/50',
    path: '/fase/5/welcome'
  },
  {
    index: 6,
    title: 'Geometría Espacial',
    description: 'Visualización 3D, prismas, cilindros y cálculo de volumen de bloques.',
    icon: Box,
    color: 'bg-indigo-500',
    shadow: 'shadow-indigo-500/50',
    path: '/fase/6/welcome'
  },
  {
    index: 7,
    title: 'Coordenadas y Desplazamientos',
    description: 'Mapas, rutas, plano cartesiano y orientación espacial.',
    icon: Map,
    color: 'bg-teal-500',
    shadow: 'shadow-teal-500/50',
    path: '/fase/7/welcome'
  },
  {
    index: 8,
    title: 'Probabilidad, Combinatoria y Lógica',
    description: 'Casos posibles, patrones de secuencias y razonamiento abstracto.',
    icon: Lightbulb,
    color: 'bg-amber-500',
    shadow: 'shadow-amber-500/50',
    path: '/fase/8/welcome'
  },
  {
    index: 9,
    title: 'Simulados Pedro II',
    description: 'Práctica para examen real, correcciones estructuradas e identificador de errores.',
    icon: GraduationCap,
    color: 'bg-yellow-600',
    shadow: 'shadow-yellow-600/50',
    path: '/fase/9/welcome'
  }
];
```

---

## 8. Integración del Controlador con React Router v6

La navegación ya no manipula variables de estado local en `App.tsx`. En su lugar, el componente `PhaseMapScreen.tsx` hace uso del hook `useNavigate()` de React Router y del estado asíncrono central de Zustand y el Contexto de Autenticación:

1. **Lectura de Autenticación**:
   - `const { currentUser } = useAuth();` obtiene los metadatos del usuario logueado en tiempo real, incluyendo su rol (ej: `ADMIN` o `ALUMNO`) y su `fase_actual_id` (progreso).
2. **Lectura de Progreso (Zustand)**:
   - `const { phaseStats, isPhaseUnlocked } = useAppStore();` evalúa la maestría y desbloqueo de cada nodo comunicándose asíncronamente con el backend PostgreSQL.
3. **Navegación al Hacer Clic en una Fase**:
   - Al pulsar "Entrar a Fase X", se valida el estado del nodo:
     - Si está **Desbloqueado** (o el usuario tiene rol `ADMIN` bypass):
       `navigate(phase.path);` redirige instantáneamente al enrutamiento de la fase (ej: para la Fase 1, `/fase/1/welcome` para abrir el selector de categorías).
     - Si está **Bloqueado**:
       Se dispara el modal premium con candado interactivo, desplegando los requisitos de desbloqueo sin cambiar la URL.
