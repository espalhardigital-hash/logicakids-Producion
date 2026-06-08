# Documentación Detallada del Tema Claro (Light Theme)

Este documento especifica todos los parámetros visuales, colores y estilos utilizados en el tema claro de la aplicación. Sirve como referencia técnica para mantener la consistencia en el diseño.

## 1. Tipografía
- **Fuente Principal (Sans):** "Inter", ui-sans-serif, system-ui, sans-serif.
- **Fuente de Pantalla (Display):** "Outfit", sans-serif (Usada en títulos y encabezados).
- **Peso de Títulos:** `font-black` (900) o `font-bold` (700).
- **Tracking:** `tracking-tight` para títulos grandes; `tracking-widest` para etiquetas pequeñas.

## 2. Fondos y Superficies Generales
- **Fondo de Pantalla Base:** `bg-slate-50` (`#f8fafc`).
- **Superficies de Tarjetas (Cards):** `bg-white` (`#ffffff`).
- **Bordes Predeterminados:** `border-slate-100` (`#f1f5f9`) o `border-slate-200` (`#e2e8f0`).
- **Sombras:** `shadow-xl` o `shadow-lg` resaltando sobre el fondo claro.

## 3. Colores de Texto
- **Encabezados Principales:** `text-slate-900` (`#0f172a`).
- **Texto de Cuerpo / Párrafos:** `text-slate-600` (`#475569`).
- **Texto Secundario / Labels:** `text-slate-500` (`#64748b`) o `text-slate-400` (`#94a3b8`).
- **Texto sobre Color Sólido:** `text-white`.

## 4. Componentes de la Interfaz del Mapa (GeneralMap)
- **Badge "Logicakids":** 
  - Fondo: `bg-blue-50`, Borde: `border-blue-200`, Texto: `text-blue-600`.
- **Cápsula de Perfil de Usuario:** 
  - Contenedor: `bg-white`, Borde: `border-slate-200`.
  - Avatar: Borde `border-slate-100`, Fondo `bg-slate-100`.
- **Botón de Estadísticas:** 
  - Fondo: `bg-white`, Borde: `border-slate-200`, Texto: `text-slate-600`.
  - Hover: `bg-slate-50`, Texto: `text-slate-900`.
- **Línea de Tiempo (Conector):** `bg-slate-200`.
- **Nodos de la Línea de Tiempo:** `bg-slate-50`, Borde: `border-slate-200`.
- **Tarjetas de Fase (Desbloqueadas):** 
  - Fondo: `bg-white`, Borde: `border-slate-100`.
  - Hover: `bg-slate-50`, Borde: `border-blue-500/50`.
- **Tarjetas de Fase (Bloqueadas):** 
  - Fondo: `bg-slate-100`, Borde: `border-slate-200`, Opacidad: `opacity-70`.

## 5. Formularios (Login/Registro)
- **Campos de Entrada (Inputs):** 
  - Fondo: `bg-white`, Borde: `border-slate-200`, Texto: `text-slate-900`.
  - Placeholder: `text-slate-400`.
- **Botón Primario:** `bg-blue-600`, Hover: `bg-blue-700`, Sombra: `shadow-blue-200`.

## 6. Decoración de Fondo
- **Gradientes de Brillo (Blur):**
  - Superior Izquierda: `bg-blue-500/10` con `blur-[120px]`.
  - Inferior Derecha: `bg-purple-500/10` con `blur-[120px]`.

## 7. Temas de Fase (Acentos de Color)
Cada fase utiliza un color de acento específico para su ícono y efectos:
- Fase 1: `bg-blue-500`.
- Fase 2: `bg-emerald-500`.
- Fase 3: `bg-orange-500`.
- Fase 4: `bg-purple-500`.
- Fase 5: `bg-rose-500`.
- Fase 6: `bg-indigo-500`.
- Fase 7: `bg-teal-500`.
- Fase 8: `bg-amber-500`.
- Fase 9: `bg-yellow-600`.
