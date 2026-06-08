# 🎨 Especificación Maestra de Diseño: Sistema de Temas Claro y Oscuro (Tailwind CSS)
## LogicaKids Pro

Este documento especifica de forma unificada y detallada todos los parámetros visuales, colores, fuentes y estilos para el **Tema Claro (Light Theme)** y el **Tema Oscuro (Dark Theme)** de la aplicación. Sirve como referencia técnica definitiva para mantener la consistencia en el diseño utilizando clases nativas de Tailwind CSS y la variante `dark:`.

---

## 🔤 1. Tipografía y Fuentes de Pantalla
- **Fuente Principal (Sans):** `"Inter"`, ui-sans-serif, system-ui, sans-serif.
- **Fuente de Pantalla (Display):** `"Outfit"`, sans-serif (Usada en títulos y encabezados).
- **Pesos de Títulos:** `font-black` (900) o `font-bold` (700).
- **Tracking (Espaciado):** 
  * Títulos Grandes: `tracking-tight`
  * Etiquetas Pequeñas: `tracking-widest`

---

## ☀️ 2. Documentación Detallada del Tema Claro (Light Theme)

Diseñado para una apariencia limpia, de alto contraste y excelente legibilidad.

### 2.1 Fondos y Superficies Generales
- **Fondo de Pantalla Base:** `bg-slate-50` (`#f8fafc`).
- **Superficies de Tarjetas (Cards):** `bg-white` (`#ffffff`).
- **Bordes Predeterminados:** `border-slate-100` (`#f1f5f9`) o `border-slate-200` (`#e2e8f0`).
- **Sombras:** `shadow-xl` o `shadow-lg` resaltando sobre el fondo claro.

### 2.2 Colores de Texto
- **Encabezados Principales:** `text-slate-900` (`#0f172a`).
- **Texto de Cuerpo / Párrafos:** `text-slate-600` (`#475569`).
- **Texto Secundario / Labels:** `text-slate-500` (`#64748b`) o `text-slate-400` (`#94a3b8`).
- **Texto sobre Color Sólido:** `text-white`.

### 2.3 Componentes del Mapa de Fases (GeneralMap)
- **Badge "Logicakids":** `bg-blue-50` | `border-blue-200` | `text-blue-600`.
- **Cápsula de Perfil de Usuario:** Contenedor `bg-white` | Borde `border-slate-200`. Avatar: Borde `border-slate-100` | Fondo `bg-slate-100`.
- **Botón de Estadísticas:** `bg-white` | Borde `border-slate-200` | Texto `text-slate-600` (Hover: `bg-slate-50` | Texto `text-slate-900`).
- **Línea de Tiempo (Conector):** `bg-slate-200`.
- **Nodos de la Línea de Tiempo:** `bg-slate-50` | Borde `border-slate-200`.
- **Tarjetas de Fase (Desbloqueadas):** `bg-white` | Borde `border-slate-100` (Hover: `bg-slate-50` | Borde `border-blue-500/50`).
- **Tarjetas de Fase (Bloqueadas):** `bg-slate-100` | Borde `border-slate-200` | Opacidad `opacity-70`.

### 2.4 Formularios e Inputs
- **Campos de Entrada (Inputs):** `bg-white` | Borde `border-slate-200` | Texto `text-slate-900` (Placeholder: `text-slate-400`).
- **Botón Primario:** `bg-blue-600` (Hover: `bg-blue-700` | Sombra: `shadow-blue-200`).

### 2.5 Decoración de Fondo
- **Gradientes de Brillo (Blur):**
  * Superior Izquierda: `bg-blue-500/10` con `blur-[120px]`.
  * Inferior Derecha: `bg-purple-500/10` con `blur-[120px]`.

---

## 🌙 3. Documentación Detallada del Tema Oscuro (Dark Theme)

Esquema de colores diseñado para una estética "Futurista/Nocturna" con alto contraste en elementos interactivos y uso de azul medianoche profundo y negro.

### 3.1 Fondos y Superficies Generales
- **Fondo de Pantalla Base:** `bg-[#070b14]` (Azul oscuro casi negro).
- **Superficies de Tarjetas (Cards):** `bg-[#162033]` (Azul medianoche profundo).
- **Bordes de Superficies:** `border-slate-800` (`#1e293b`) o `border-slate-700` (`#334155`).
- **Sombras:** `shadow-2xl` con opacidad reducida o resplandores específicos de color.

### 3.2 Colores de Texto
- **Encabezados Principales:** `text-white`.
- **Subtítulos/Labels Destacados:** `text-slate-400` (`#94a3b8`).
- **Texto de Cuerpo / Párrafos:** `text-slate-300` (`#cbd5e1`).
- **Texto Secundario / Bloqueado:** `text-slate-600` (`#475569`) o `text-slate-500` (`#64748b`).

### 3.3 Componentes del Mapa de Fases (GeneralMap)
- **Badge "Logicakids":** `bg-blue-900/40` | Borde `border-blue-500/30` | Texto `text-blue-400`.
- **Cápsula de Perfil de Usuario:** Contenedor `bg-[#162033]` | Borde `border-slate-800`. Avatar: Borde `border-slate-700` | Fondo `bg-slate-800`.
- **Botón de Estadísticas:** `bg-[#162033]` | Borde `border-slate-800` | Texto `text-slate-300` (Hover: `bg-slate-800` | Texto `text-white`).
- **Línea de Tiempo (Conector):** `bg-slate-800/50`.
- **Nodos de la Línea de Tiempo:** `bg-[#070b14]` | Borde `border-slate-800`.
- **Tarjetas de Fase (Desbloqueadas):** `bg-[#162033]` | Borde `border-slate-800` (Hover: `bg-[#1a263d]` | Borde `border-blue-500/50` | Efecto Aura `opacity-20` del color de la fase con `blur-[60px]`).
- **Tarjetas de Fase (Bloqueadas):** `bg-[#0a0f1c]` | Borde `border-slate-800/40` | Opacidad `opacity-70` | Filtro Grayscale.

### 3.4 Formularios e Inputs
- **Campos de Entrada (Inputs):** `bg-slate-900` | Borde `border-slate-700` | Texto `text-white` (Placeholder: `text-slate-600`).
- **Botón Primario:** `bg-blue-600` (Hover: `bg-blue-700` | Resplandor interno sutil).

### 3.5 Decoración de Fondo
- **Gradientes de Brillo (Blur):**
  * Superior Izquierda: `bg-blue-600/10` con `blur-[120px]`.
  * Inferior Derecha: `bg-indigo-600/10` con `blur-[120px]`.

---

## 🎨 4. Temas de Fase (Acentos de Color por Defecto)
Cada fase utiliza un color de acento vibrante idéntico en ambos modos:
* **Fase 1:** `bg-blue-500` (Efecto resplandor `rgba(59,130,246,0.9)` en dark).
* **Fase 2:** `bg-emerald-500`
* **Fase 3:** `bg-orange-500`
* **Fase 4:** `bg-purple-500`
* **Fase 5:** `bg-rose-500`
* **Fase 6:** `bg-indigo-500`
* **Fase 7:** `bg-teal-500`
* **Fase 8:** `bg-amber-500`
* **Fase 9:** `bg-yellow-600`

---

## 🛠️ 5. Configuración de Tailwind CSS v4 (`index.css`)

El archivo principal `index.css` de la aplicación define el comportamiento semántico de base, variables de color del tema oscuro y clases utilitarias (`.glass-card`, `.text-heading`, etc.).

### 5.1 Variables Semánticas del Tema Oscuro

Tailwind v4 utiliza `@theme` para definir tokens. Se han implementado variables CSS globales para unificar los colores de las superficies oscuras:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  --animate-shake: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;

  /* Colores de Superficie (Tema Oscuro) */
  --color-surface-base: #070b14;
  --color-surface-card: #162033;
  --color-surface-deep: #0a0f1c;
  --color-surface-hover: #1a263d;
}
```

### 5.2 Transiciones Globales

Para evitar saltos visuales abruptos al cambiar entre temas, se aplica una transición global a todos los elementos:

```css
@layer base {
  *, *::before, *::after {
    transition-property: background-color, border-color, color, fill, stroke, box-shadow;
    transition-duration: 200ms;
    transition-timing-function: ease-out;
  }

  body {
    @apply bg-slate-50 text-slate-900 font-sans;
    @apply dark:bg-[--color-surface-base] dark:text-slate-100;
  }
}
```

---

## 🧱 6. Clases Utilitarias (Design System)

Para evitar repetir largas cadenas de clases responsivas (`bg-white dark:bg-[#162033]...`), se han creado clases base en `index.css`:

### 6.1 Superficies y Componentes Glass
- **`.glass-card`**: Tarjetas elevadas con sombra en modo claro y fondo sólido (`surface-card`) en modo oscuro.
- **`.glass-panel`**: Contenedores de fondo plano (`bg-slate-50`) que se oscurecen al nivel base en modo oscuro.
- **`.glass-surface-deep`**: Paneles de fondo profundo para destacar elementos anidados (`surface-deep`).
- **`.glass-button`**: Botón secundario estandarizado.
- **`.glass-button-primary`**: Botón principal azul con brillo.
- **`.glass-input`**: Campo de entrada con bordes responsivos y contraste correcto.
- **`.glass-overlay`**: Fondo semi-transparente para modales (`backdrop-blur`).

### 6.2 Tipografía Semántica
- **`.text-heading`**: Para títulos principales (`text-slate-900` → `dark:text-white`).
- **`.text-body`**: Para párrafos normales (`text-slate-600` → `dark:text-slate-300`).
- **`.text-muted`**: Para texto secundario (`text-slate-500` → `dark:text-slate-400`).
- **`.text-faint`**: Para etiquetas diminutas o texto muy sutil (`text-slate-400` → `dark:text-slate-600`).
