# Documentación Detallada del Tema Oscuro (Dark Theme)

Este documento especifica todos los parámetros visuales, colores y estilos utilizados en el tema oscuro de la aplicación. Este esquema está diseñado para una estética "Futurista/Nocturna" con alto contraste en elementos interactivos.

## 1. Tipografía
- **Fuente Principal (Sans):** "Inter", ui-sans-serif, system-ui, sans-serif.
- **Fuente de Pantalla (Display):** "Outfit", sans-serif.
- **Peso de Títulos:** `font-black` (900).
- **Tracking:** `tracking-tight`.

## 2. Fondos y Superficies Generales
- **Fondo de Pantalla Base:** `bg-[#070b14]` (Azul oscuro casi negro).
- **Superficies de Tarjetas (Cards):** `bg-[#162033]` (Azul medianoche profundo).
- **Bordes de Superficies:** `border-slate-800` (`#1e293b`) o `border-slate-700` (`#334155`).
- **Sombras:** `shadow-2xl` con opacidad reducida o sombras específicas de color.
- **Transición:** `transition-colors duration-300`.

## 3. Colores de Texto
- **Encabezados Principales:** `text-white`.
- **Subtítulos/Labels Destacados:** `text-slate-400` (`#94a3b8`).
- **Texto de Cuerpo / Párrafos:** `text-slate-300` (`#cbd5e1`).
- **Texto Secundario / Bloqueado:** `text-slate-600` (`#475569`) o `text-slate-500` (`#64748b`).

## 4. Componentes de la Interfaz del Mapa (GeneralMap)
- **Badge "Logicakids":** 
  - Fondo: `bg-blue-900/40`, Borde: `border-blue-500/30`, Texto: `text-blue-400`.
- **Cápsula de Perfil de Usuario:** 
  - Contenedor: `bg-[#162033]`, Borde: `border-slate-800`.
  - Avatar: Borde `border-slate-700`, Fondo `bg-slate-800`.
- **Botón de Estadísticas:** 
  - Fondo: `bg-[#162033]`, Borde: `border-slate-800`, Texto: `text-slate-300`.
  - Hover: `bg-slate-800`, Texto: `text-white`.
- **Línea de Tiempo (Conector):** `bg-slate-800/50`.
- **Nodos de la Línea de Tiempo:** `bg-[#070b14]`, Borde: `border-slate-800`.
- **Tarjetas de Fase (Desbloqueadas):** 
  - Fondo: `bg-[#162033]`, Borde: `border-slate-800`.
  - Hover: `bg-[#1a263d]`, Borde: `border-blue-500/50`.
  - Efecto Aura: `opacity-20` del color de la fase con `blur-[60px]`.
- **Tarjetas de Fase (Bloqueadas):** 
  - Fondo: `bg-[#0a0f1c]`, Borde: `border-slate-800/40`, Opacidad: `opacity-70`, Grayscale.

## 5. Formularios (Login/Registro)
- **Campos de Entrada (Inputs):** 
  - Fondo: `bg-slate-900`, Borde: `border-slate-700`, Texto: `text-white`.
  - Placeholder: `text-slate-600`.
- **Botón Primario:** `bg-blue-600`, Hover: `bg-blue-700`, Sombra: (Sin sombras claras, se prefiere resplandor interno).

## 6. Decoración de Fondo
- **Gradientes de Brillo (Blur):**
  - Superior Izquierda: `bg-blue-600/10` con `blur-[120px]`.
  - Inferior Derecha: `bg-indigo-600/10` con `blur-[120px]`.

## 7. Temas de Fase (Acentos de Color)
Colores vibrantes que resaltan en el entorno oscuro:
- Fase 1: `bg-blue-500` (Efecto resplandor `rgba(59,130,246,0.9)`).
- Fase 2: `bg-emerald-500`.
- Fase 3: `bg-orange-500`.
- Fase 4: `bg-purple-500`.
- Fase 5: `bg-rose-500`.
- Fase 6: `bg-indigo-500`.
- Fase 7: `bg-teal-500`.
- Fase 8: `bg-amber-500`.
- Fase 9: `bg-yellow-600`.
