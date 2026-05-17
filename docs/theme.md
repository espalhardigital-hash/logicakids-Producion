# 🎨 Especificación de Diseño: Sistema de Temas v3 (Claro / Oscuro)
## LogicaKids Pro

Este documento define la especificación técnica y la arquitectura de diseño semántico para incorporar el nuevo sistema de temas de **LogicaKids Pro** utilizando las variables de diseño **v3** con la función moderna de CSS `light-dark()`. 

Este sistema reemplaza las clases rígidas por variables adaptables a nivel del motor del navegador, garantizando que los colores fluyan de manera automática en base al esquema activo (`color-scheme`).

---

## 🏗️ 1. Concepto de Diseño y Análisis de Capturas

De acuerdo con las imágenes provistas del panel principal (**"Tu Viaje Matemático"**):
* **Fondo Principal**: El tema oscuro utiliza un color sólido e integrado (`--color-v3-surface-container`, `#1f1f1f` o `#181818` para gradiente), eliminando contrastes excesivos.
* **Tarjetas de Fases**: Tienen bordes curvos muy limpios, usando el fondo de contenedor (`--color-v3-surface-container`) o variantes suaves, con iconos encapsulados en cajas de color plano de acento (azul para Fase 1, verde para Fase 2, naranja para Fase 3, etc.) y botones discretos del tipo `--color-v3-button-container` para ingresar a la fase.
* **Botones Superiores (Pills)**: Los botones de perfil (`ana`), `Estadísticas` y `Cerrar Sesión` se representan como píldoras encapsuladas con bordes delgados usando `--color-v3-outline-var` y textos semánticos `--color-v3-text`, logrando una apariencia limpia y despejada.
* **Botón Flotante de Tema**: Es una píldora minimalista redonda que encaja perfectamente en la esquina inferior derecha.

---

## 🎛️ 2. Paleta de Variables CSS v3 (`light-dark()`)

Inyectaremos en `:root` el conjunto completo de variables de diseño provisto. La función `light-dark(valor_claro, valor_oscuro)` de CSS resolverá de manera automática el color correcto según el `color-scheme` asignado al elemento `<html>`.

```css
:root {
  /* Habilitar color-scheme nativo en el navegador */
  color-scheme: light dark;

  /* Superficies y Contenedores */
  --color-v3-surface: light-dark(#ffffff, #191919);
  --color-v3-overlay-background: light-dark(rgba(252, 252, 252, 0.3), rgba(25, 25, 25, 0.3));
  --color-v3-surface-left-nav: light-dark(#fafafa, #191919);
  --color-v3-surface-left-nav-border: light-dark(#e2e3e4, #262626);
  --color-v3-surface-container: light-dark(#ffffff, #1f1f1f);
  --color-v3-surface-container-high: light-dark(#fcfcfc, #252525);
  --color-v3-surface-container-highest: light-dark(#f4f5f5, #2a2a2a);

  /* Botones y Acciones */
  --color-v3-button-container: light-dark(#ffffff, #323232);
  --color-v3-button-container-high: light-dark(#eaeaeb, #424242);
  --color-v3-button-container-highest: light-dark(#caccce, #555555);
  --color-v3-button-container-accent: light-dark(#dbeafe, #393f51);
  --color-v3-hover: light-dark(#f4f5f5, #323232);

  /* Textos */
  --color-v3-text: light-dark(#2b2d31, #d4d4d4);
  --color-v3-text-var: light-dark(#6c717a, #8c8c8c);
  --color-v3-text-disable: light-dark(#bdc1c6, #3e3e3e);
  --color-v3-text-on-button: light-dark(#2b2d31, #fcfcfc);
  --color-v3-text-on-button-reverse: light-dark(#ffffff, #ffffff);
  --color-v3-text-link: light-dark(#2483e2, #87a9ff);
  --color-v3-chat-separator: light-dark(#b7babd, #8c8c8c);

  /* Bordes y Líneas */
  --color-v3-outline: light-dark(#e2e3e4, #333333);
  --color-v3-outline-var: light-dark(#eaeaeb, #262626);
  --color-v3-outline-accent: light-dark(#2483e2, #87a9ff);

  /* Estados y Alertas */
  --color-v3-error-text: light-dark(#690005, #690005);
  --color-v3-error-container: light-dark(#ffdad6, #ffdad6);
  --color-v3-warning-text: light-dark(#2a1700, #2a1700);
  --color-v3-warning-container: light-dark(#ffddb7, #ffddb7);

  /* Colores de Acento (Fases / Modulos) */
  --color-v3-accent-1: light-dark(#fcbd00, #fcbd00);
  --color-v3-accent-light-1: light-dark(#fff7e0, #3a321b);
  --color-v3-accent-2: light-dark(#c597ff, #c597ff);
  --color-v3-accent-light-2: light-dark(#f8f3ff, #332d3a);
  --color-v3-accent-3: light-dark(#d73a49, #d73a49);
  --color-v3-accent-4: light-dark(#3ca059, #3ddb85);
  --color-v3-accent-5: light-dark(#7887b5, #8790ab);
  --color-v3-accent-6: light-dark(#e87400, #ffb74d);

  /* Sombras Semánticas */
  --v3-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --v3-shadow-sm: 0 1px 3px 0 rgba(10, 13, 18, 0.1), 0 1px 2px -1px rgba(10, 13, 18, 0.1);
  --v3-shadow-md: 0 4px 6px -1px rgba(10, 13, 18, 0.1), 0 2px 4px -2px rgba(10, 13, 18, 0.06);
  --v3-shadow-lg: 0 12px 16px -4px rgba(10, 13, 18, 0.08), 0 4px 6px -2px rgba(10, 13, 18, 0.03), 0 2px 2px -1px rgba(10, 13, 18, 0.04);
  --v3-shadow-xl: 0 20px 24px -4px rgba(10, 13, 18, 0.08), 0 8px 8px -4px rgba(10, 13, 18, 0.03), 0 3px 3px -1.5px rgba(10, 13, 18, 0.04);
}
```

---

## ⚡ 3. Integración en el Bloque `@theme` de Tailwind CSS v4

Para poder utilizar estas variables en clases rápidas de Tailwind (ej. `bg-v3-surface-container`, `text-v3-text`, `border-v3-outline`), las mapearemos dentro de la directiva `@theme` en `frontend/index.css`.

### Configuración del CSS:
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Inter:wght@400;700&display=swap');

@theme {
  /* Enlace directo a las variables de color v3 */
  --color-v3-surface: var(--color-v3-surface);
  --color-v3-overlay-background: var(--color-v3-overlay-background);
  --color-v3-surface-left-nav: var(--color-v3-surface-left-nav);
  --color-v3-surface-left-nav-border: var(--color-v3-surface-left-nav-border);
  --color-v3-surface-container: var(--color-v3-surface-container);
  --color-v3-surface-container-high: var(--color-v3-surface-container-high);
  --color-v3-surface-container-highest: var(--color-v3-surface-container-highest);

  --color-v3-button-container: var(--color-v3-button-container);
  --color-v3-button-container-high: var(--color-v3-button-container-high);
  --color-v3-button-container-highest: var(--color-v3-button-container-highest);
  --color-v3-button-container-accent: var(--color-v3-button-container-accent);
  --color-v3-hover: var(--color-v3-hover);

  --color-v3-text: var(--color-v3-text);
  --color-v3-text-var: var(--color-v3-text-var);
  --color-v3-text-disable: var(--color-v3-text-disable);
  --color-v3-text-on-button: var(--color-v3-text-on-button);
  --color-v3-text-on-button-reverse: var(--color-v3-text-on-button-reverse);
  --color-v3-text-link: var(--color-v3-text-link);

  --color-v3-outline: var(--color-v3-outline);
  --color-v3-outline-var: var(--color-v3-outline-var);
  --color-v3-outline-accent: var(--color-v3-outline-accent);

  --color-v3-accent-1: var(--color-v3-accent-1);
  --color-v3-accent-light-1: var(--color-v3-accent-light-1);
  --color-v3-accent-2: var(--color-v3-accent-2);
  --color-v3-accent-light-2: var(--color-v3-accent-light-2);
  --color-v3-accent-3: var(--color-v3-accent-3);
  --color-v3-accent-4: var(--color-v3-accent-4);
  --color-v3-accent-5: var(--color-v3-accent-5);
  --color-v3-accent-6: var(--color-v3-accent-6);

  --font-outfit: 'Outfit', sans-serif;
  --font-inter: 'Inter', sans-serif;
}

@layer base {
  body {
    /* Fondo semántico nativo e Inter por defecto */
    background-color: var(--color-v3-surface-container);
    color: var(--color-v3-text);
    font-family: var(--font-inter);
    @apply antialiased;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
}
```

---

## 🏗️ 4. Ajustes del Orquestador Global (`ThemeContext.tsx`)

Para que la función `light-dark()` funcione en todo su esplendor, el contexto de React no solo añadirá/removerá la clase `.dark` (útil para variantes heredadas de Tailwind), sino que **inyectará la propiedad `colorScheme`** directamente en el HTML del documento.

### Lógica de Sincronización del Contexto:
```typescript
useEffect(() => {
  const root = window.document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  
  localStorage.setItem('app_theme', theme);
}, [theme]);
```

---

## 🎨 5. Mapeo Semántico en Componentes Clave

Para replicar con exactitud el aspecto de las capturas compartidas, utilizaremos las siguientes combinaciones de clases semánticas en la interfaz:

### 1. Pantalla del Mapa del Estudiante (`PhaseMapScreen.tsx`)
* **Contenedor General (Fondo)**:
  * Reemplazar gradientes manuales por `bg-v3-surface-container` (que cambia automáticamente de `#ffffff` a `#1f1f1f` o `#181818` para un fondo oscuro limpio).
* **Cabecera ("Tu Viaje Matemático")**:
  * Título: `text-v3-text` (claro: slate oscuro `#2b2d31`, oscuro: gris claro `#d4d4d4`).
  * Subtítulo / "Fase Actual": `text-v3-text-var` (`#6c717a` / `#8c8c8c`).
* **Botones Superiores (Pills)**:
  * Los botones `ana`, `Estadísticas` y `Cerrar Sesión` se estilizarán con bordes semánticos y fondos adaptables:
    `bg-v3-button-container border border-v3-outline-var text-v3-text hover:bg-v3-hover rounded-full px-4 py-2 transition-all duration-200`
* **Tarjetas de Fases**:
  * Cuerpo de la tarjeta:
    `bg-v3-surface-container-high border border-v3-outline-var rounded-2xl shadow-sm p-6`
  * Botón "Entrar a Fase":
    `bg-v3-button-container hover:bg-v3-hover text-v3-text border border-v3-outline px-6 py-2 rounded-lg transition-all duration-200`

### 2. Panel del Administrador (`PedagogyTab.tsx`)
* **Panel Split-Screen**:
  * Menú lateral de fases: `bg-v3-surface-left-nav border-r border-v3-surface-left-nav-border`
  * Fondo del panel de controles derecho: `bg-v3-surface-container`
* **Inputs y Sliders**:
  * Cajas de entrada: `bg-v3-button-container border border-v3-outline text-v3-text focus:border-v3-outline-accent`

### 3. Pantalla de Juego (`GameScreen.tsx`)
* **Contenedor de Preguntas**:
  * Utilizar `bg-v3-surface-container-high` con texto principal `text-v3-text`.
* **Teclado Táctil**:
  * Botones de números: `bg-v3-button-container hover:bg-v3-hover text-v3-text border border-v3-outline-var shadow-sm`

---

## 🚀 6. Plan de Ejecución de Código (Siguiente Fase)

Una vez aprobada esta especificación de variables CSS v3:
1. **Paso 1**: Sobrescribir `frontend/components/theme/ThemeContext.tsx` para sincronizar `root.style.colorScheme`.
2. **Paso 2**: Actualizar `frontend/index.css` inyectando las 40 variables de diseño v3 y mapeándolas en `@theme`.
3. **Paso 3**: Reemplazar progresivamente los colores estáticos de fondos, textos y tarjetas en `App.tsx`, `PhaseMapScreen.tsx`, `WelcomeScreen.tsx` y `ProgressScreen.tsx` por sus equivalentes semánticos `--color-v3-...` definidos en este manual.
4. **Paso 4**: Validar y empaquetar para producción.
