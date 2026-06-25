# PAUTAS Y DIRECTRICES DE DISEÑO VISUAL (DESIGN-GUIDELINES.md)

Este documento define el sistema de diseño visual, paletas de colores, tipografía, espaciado y directrices de interfaz para asegurar la consistencia y la excelencia estética del panel de administración en sus modos Claro y Oscuro.

---

## 1. Paletas de Colores y Temas

Adoptando las referencias de diseño moderno y limpio validadas en el discovery:

### ☀️ Modo Claro (Light Theme)
- **Fondo del Canvas:** Gris neutro frío muy suave (`#f8fafc` / Tailwind `slate-50`).
- **Contenedores y Tarjetas:** Blanco puro (`#ffffff` / Tailwind `white`).
- **Sidebar Primario:** Azul marino profundo (`#0b1528` / Slate/Navy oscuro).
- **Sidebar de Filtros/Módulos:** Blanco o gris ultra suave (`#f1f5f9` / Tailwind `slate-100`).
- **Bordes y Separadores:** Gris tenue (`#e2e8f0` / Tailwind `slate-200`).
- **Color de Acento Principal:** Índigo Eléctrico (`#4f46e5` / Tailwind `indigo-600`) y hover en Índigo Oscuro (`#4338ca` / Tailwind `indigo-700`).
- **Estados Semánticos:**
  - *Activo/Aprobado:* Verde suave (`#ecfdf5` / `emerald-50`) con texto verde oscuro (`#047857` / `emerald-700`).
  - *Inactivo/Pendiente:* Gris suave (`#f3f4f6` / `gray-100`) con texto gris oscuro (`#4b5563` / `gray-600`).
  - *Error/Alerta:* Rojo suave (`#fef2f2` / `red-50`) con texto rojo oscuro (`#b91c1c` / `red-700`).

### 🌙 Modo Oscuro (Dark Theme)
- **Fondo del Canvas:** Gris carbón profundo (`#09090b` / Tailwind `zinc-950`).
- **Contenedores y Tarjetas:** Gris oscuro elevado (`#18181b` / Tailwind `zinc-900`).
- **Sidebar Primario:** Gris negro (`#09090b` / Tailwind `zinc-950`).
- **Bordes y Separadores:** Gris zinc sutil (`#27272a` / Tailwind `zinc-800`).
- **Acción Primaria (CTAs):** Botón Blanco Puro (`#ffffff` / `bg-white`) con texto Negro (`#09090b` / `text-zinc-950`).
- **Tipografía Principal:** Blanco zinc brillante (`#f4f4f5` / Tailwind `zinc-100`).
- **Tipografía Secundaria/Descripciones:** Gris medio apagado (`#a1a1aa` / Tailwind `zinc-400`).
- **Overlay de Modales:** Negro traslúcido con desenfoque de fondo (`#000000/60` con clase `backdrop-blur-md`).

---

## 2. Tipografía y Escala de Textos
- **Fuente Principal:** `Inter` o `Outfit` (importadas desde Google Fonts).
- **Estilos:**
  - *Títulos de Sección (H1):* `text-2xl` / `font-black` (negrita extrema).
  - *Títulos de Tarjetas (H2):* `text-lg` / `font-bold`.
  - *Texto de Tabla y Datos:* `text-sm` / `font-medium`.
  - *Metadatos y Etiquetas (Labels):* `text-xs` / `font-bold` / `uppercase` / `tracking-wider`.

---

## 3. Espaciado, Bordes y Sombras
- **Rejilla base:** Sistema basado en **8px** (Tailwind spacing unit: `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Radios de Borde (Border Radius):**
  - Botones, inputs y pequeños badges: `rounded-xl` (12px).
  - Tarjetas principales, modales y tablas: `rounded-2xl` (16px) o `rounded-3xl` (24px).
- **Sombras (Box Shadows):**
  - Modo Claro: Sombras muy difusas y suaves (`shadow-sm` o `shadow-md` con opacidad reducida).
  - Modo Oscuro: Sin sombras de caja, delimitación hecha puramente a través de bordes finos de color `border-zinc-800`.

---

## 4. Guía de Uso del Framework de Componentes
- Utilizar iconos limpios de la librería **Lucide React**.
- Evitar deocraciones innecesarias o bordes gruesos. La interfaz debe lucir plana, con elevaciones basadas únicamente en sutiles contrastes de fondo o líneas de acento de 2px a 4px.
- Todos los formularios deben usar transiciones de color en el estado `:focus` (borde índigo con un anillo sutil difuminado alrededor).
