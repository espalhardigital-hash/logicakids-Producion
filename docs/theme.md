# 🎨 Especificación de Diseño: Sistema de Temas v3 (Alta Legibilidad y Contraste)
## LogicaKids Pro

Este documento actualiza la especificación técnica del sistema de temas v3 para resolver los problemas de bajo contraste en el **Tema Claro (Light Theme)** y asegurar que el **Tema Oscuro (Dark Theme)** replique con total exactitud los colores de las capturas de soporte (gamas de azul profundo y slate, en lugar de un gris oscuro apagado).

---

## 🏗️ 1. Redefinición del Concepto de Diseño y Contraste

Para garantizar una experiencia visual del más alto nivel:
1. **Contraste en Tema Claro**:
   * El fondo de la pantalla ya no será blanco puro plano, sino un degradado gris pizarra suave y moderno (`#f8fafc` a `#e2e8f0`).
   * Las **tarjetas** serán de color blanco puro (`#ffffff`), lo cual las hace destacar con elegancia gracias a sombras semánticas.
   * Los **bordes** de las tarjetas y píldoras superiores se definirán con un gris pizarra medio visible (`#cbd5e1`), delimitando perfectamente los contenedores.
   * Las tipografías principales serán casi negras (`#0f172a`, contraste excelente de 16.5:1) y las descripciones serán gris carbón oscuro (`#334155`, contraste de 9.5:1), garantizando una **lectura perfecta y sin fatiga**.

2. **Identidad del Tema Oscuro (Exactitud con Capturas)**:
   * Reemplazamos los grises planos oscuros (`#1f1f1f`) por la gama de azules marinos y pizarras profundos originales.
   * El **fondo general** utilizará un degradado fluido de azul-negro a azul pizarra: `from-[#0b0f19] via-[#0f172a] to-[#070a13]`.
   * Las **tarjetas** tendrán el tono pizarra azulado original (`#131b2e` con bordes `#1e293b`), conservando los destellos e iconos de colores de acento brillantes.
   * Los textos de botones superiores y píldoras heredarán una base limpia y nítida.

---

## 🎛️ 2. Paleta de Variables CSS v3 Optimizada (`light-dark()`)

Declararemos estas variables adaptables en `:root` de `frontend/index.css`. La función `light-dark()` resolverá automáticamente los valores según el esquema de color activo.

```css
:root {
  /* Habilitar color-scheme nativo en el navegador */
  color-scheme: light dark;

  /* Superficies y Degradados de Fondo */
  --color-v3-surface-container: light-dark(#f8fafc, #0b0f19);       /* Pizarra claro inicial / Navy oscuro inicial */
  --color-v3-bg-mid: light-dark(#f1f5f9, #0f172a);                  /* Pizarra claro medio / Navy oscuro medio */
  --color-v3-bg-end: light-dark(#e2e8f0, #070a13);                  /* Pizarra claro final / Navy oscuro final */

  /* Contenedores de Tarjetas y Modales */
  --color-v3-surface: light-dark(#ffffff, #090d16);                 /* Fondo modal: Blanco / Negro azulado */
  --color-v3-surface-container-high: light-dark(#ffffff, #131b2e);  /* Fondo tarjeta: Blanco / Navy slate */
  --color-v3-surface-container-highest: light-dark(#f8fafc, #1e293b); /* Tarjeta hover: Gris sutil / Slate */
  --color-v3-surface-left-nav: light-dark(#f1f5f9, #0f172a);
  --color-v3-surface-left-nav-border: light-dark(#cbd5e1, #1e293b);
  --color-v3-overlay-background: light-dark(rgba(255, 255, 255, 0.4), rgba(11, 15, 25, 0.4));

  /* Botones y Acciones */
  --color-v3-button-container: light-dark(#ffffff, #1e293b);        /* Botón neutro: Blanco / Slate */
  --color-v3-button-container-high: light-dark(#e2e8f0, #334155);
  --color-v3-button-container-highest: light-dark(#cbd5e1, #475569);
  --color-v3-button-container-accent: light-dark(#dbeafe, #1e3a8a); /* Botón azul: Celeste claro / Azul marino */
  --color-v3-hover: light-dark(#f1f5f9, #2d3748);                   /* Hover neutro: Gris claro / Gris slate */

  /* Textos de Alta Legibilidad */
  --color-v3-text: light-dark(#0f172a, #ffffff);                    /* Título principal: Slate Negro / Blanco puro */
  --color-v3-text-var: light-dark(#334155, #94a3b8);                /* Descripciones: Slate Carbón / Gris suave */
  --color-v3-text-disable: light-dark(#94a3b8, #475569);            /* Deshabilitado: Gris medio / Slate apagado */
  --color-v3-text-on-button: light-dark(#0f172a, #ffffff);
  --color-v3-text-on-button-reverse: light-dark(#ffffff, #ffffff);
  --color-v3-text-link: light-dark(#2563eb, #3b82f6);
  --color-v3-chat-separator: light-dark(#cbd5e1, #334155);

  /* Bordes de Alta Definición */
  --color-v3-outline: light-dark(#94a3b8, #334155);                 /* Bordes activos: Gris pizarra / Slate */
  --color-v3-outline-var: light-dark(#cbd5e1, #1e293b);             /* Bordes normales: Gris medio / Slate oscuro */
  --color-v3-outline-accent: light-dark(#2563eb, #3b82f6);

  /* Estados y Alertas */
  --color-v3-error-text: light-dark(#991b1b, #f87171);
  --color-v3-error-container: light-dark(#fee2e2, #7f1d1d);
  --color-v3-warning-text: light-dark(#854d0e, #fbbf24);
  --color-v3-warning-container: light-dark(#fef9c3, #78350f);

  /* Colores de Acento Estables */
  --color-v3-accent-1: #fcbd00;
  --color-v3-accent-light-1: light-dark(#fff7e0, #3a321b);
  --color-v3-accent-2: #c597ff;
  --color-v3-accent-light-2: light-dark(#f8f3ff, #332d3a);
  --color-v3-accent-3: #d73a49;
  --color-v3-accent-4: light-dark(#16a34a, #3ddb85);
  --color-v3-accent-5: light-dark(#4f46e5, #8790ab);
  --color-v3-accent-6: #e87400;

  /* Sombras */
  --v3-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --v3-shadow-sm: 0 1px 3px 0 rgba(10, 13, 18, 0.1), 0 1px 2px -1px rgba(10, 13, 18, 0.1);
  --v3-shadow-md: 0 4px 6px -1px rgba(10, 13, 18, 0.1), 0 2px 4px -2px rgba(10, 13, 18, 0.06);
  --v3-shadow-lg: 0 12px 16px -4px rgba(10, 13, 18, 0.08), 0 4px 6px -2px rgba(10, 13, 18, 0.03), 0 2px 2px -1px rgba(10, 13, 18, 0.04);
  --v3-shadow-xl: 0 20px 24px -4px rgba(10, 13, 18, 0.08), 0 8px 8px -4px rgba(10, 13, 18, 0.03), 0 3px 3px -1.5px rgba(10, 13, 18, 0.04);
}
```

---

## ⚡ 3. Registro en `@theme` en Tailwind CSS v4

Registraremos las variables de degradado (`bg-mid`, `bg-end`) y adaptaremos el `body` para pintar el fondo degradado en toda la pantalla de forma semántica.

```css
@theme {
  /* Registro de colores v3 */
  --color-v3-surface: var(--color-v3-surface);
  --color-v3-surface-container: var(--color-v3-surface-container);
  --color-v3-bg-mid: var(--color-v3-bg-mid);
  --color-v3-bg-end: var(--color-v3-bg-end);
  --color-v3-surface-container-high: var(--color-v3-surface-container-high);
  --color-v3-surface-container-highest: var(--color-v3-surface-container-highest);
  ...
}

@layer base {
  body {
    /* Fondo degradado dinámico en lugar de plano */
    background-image: linear-gradient(to bottom, var(--color-v3-surface-container), var(--color-v3-bg-mid), var(--color-v3-bg-end));
    color: var(--color-v3-text);
    font-family: var(--font-inter);
    @apply antialiased min-h-screen w-full;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
}
```

---

## 🚀 4. Plan de Implementación de Código

1. **index.css**: Sobrescribir los tokens hexadecimales y la definición de degradados semánticos en `index.css`.
2. **App.tsx**: Cambiar el contenedor general para usar:
   `className="min-h-screen w-full text-v3-text bg-gradient-to-b from-v3-surface-container via-v3-bg-mid to-v3-bg-end flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-300"`
3. **PhaseMapScreen.tsx**: Cambiar el contenedor principal para que use el mismo degradado dinámico de alta definición:
   `className="min-h-screen bg-gradient-to-b from-v3-surface-container via-v3-bg-mid to-v3-bg-end text-v3-text font-sans pb-20 relative overflow-hidden transition-colors duration-300"`
