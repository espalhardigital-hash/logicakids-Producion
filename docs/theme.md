# 🎨 Especificación de Diseño: Sistema de Temas Dual (Light & Dark Theme)
## LogicaKids Pro

Este documento define la especificación técnica y el plan de diseño semántico para incorporar soporte nativo de **Tema Claro (Light Theme)** y **Tema Oscuro (Dark Theme)** en la interfaz de **LogicaKids Pro**.

El sistema se basa en **Tailwind CSS v4** y un estado global de React inyectado en el nodo raíz de la aplicación, garantizando transiciones suaves y consistencia visual sin colores estáticos (hardcoded).

---

## 🏗️ 1. Arquitectura del Estado Global: `ThemeContext`

El sistema utilizará un contexto de React (`ThemeContext`) que gestionará el estado `'light' | 'dark'`. Este contexto se creará siguiendo el blueprint de referencia en `docs/Interface Frontend/archivos apoyo y referencia/ThemeContext.tsx`.

### Especificaciones del Mecanismo:
1. **Persistencia**: El tema se almacena en el navegador bajo la clave `localStorage.getItem('app_theme')`.
2. **Preferencia del Sistema**: Si no existe una preferencia guardada, el sistema detectará automáticamente la configuración del sistema operativo usando `window.matchMedia('(prefers-color-scheme: dark)').matches`.
3. **Inyección en el DOM**: Al cambiar el estado, se añadirá o removerá la clase `.dark` en `document.documentElement` (`<html>`), lo cual habilitará la directiva de Tailwind para oscurecer los elementos correspondientes.

### Estructura del Archivo Planificado (`frontend/components/theme/ThemeContext.tsx`):
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
```

---

## ⚡ 2. Integración con Tailwind CSS v4

Dado que **LogicaKids Pro** utiliza **Tailwind CSS v4**, la integración del selector de clase `.dark` requiere registrar la directiva personalizada dentro de `index.css`.

### Cambios a realizar en `frontend/index.css`:
Añadiremos la variante personalizada inmediatamente después del `@import` de Tailwind para indicarle al compilador de Vite que evalúe la clase `.dark` inyectada en el HTML:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Inter:wght@400;700&display=swap');

/* Habilitar selector basado en la clase .dark del nodo raíz en Tailwind v4 */
@custom-variant dark (&:is(.dark *));

@theme {
  --color-brand-dark: #0f172a;
  --color-brand-primary: #3b82f6;
  --color-brand-secondary: #8b5cf6;
  --font-outfit: 'Outfit', sans-serif;
}

@layer base {
  body {
    /* Fondos y textos semánticos con transiciones suaves */
    @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased;
    font-family: var(--font-outfit);
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
}
```

---

## 🎨 3. Diseño Semántico y Paleta de Colores

Para mantener la estética premium de **LogicaKids Pro**, el diseño sustituirá los colores fijos u oscuros obligatorios por variables semánticas de Tailwind. Esto garantizará que tanto la versión clara como la oscura se vean armoniosas y profesionales.

### Tabla de Equivalencias Semánticas:

| Capa / Elemento | Estilo Tema Claro (Light) | Estilo Tema Oscuro (Dark) | Clases Tailwind Planificadas |
| :--- | :--- | :--- | :--- |
| **Fondo Principal** | Gris ultra-claro suave | Azul pizarra profundo / Negro | `bg-slate-50 dark:bg-slate-950` |
| **Tarjetas / Contenedores** | Blanco puro (semi-translúcido) | Vidrio oscuro esmerilado | `bg-white/80 backdrop-blur-md dark:bg-white/5 dark:backdrop-blur-2xl` |
| **Texto Principal** | Slate Oscuro (casi negro) | Blanco Puro / Gris muy claro | `text-slate-900 dark:text-white` |
| **Texto Secundario** | Gris medio apagado | Gris slate suave | `text-slate-500 dark:text-slate-400` |
| **Bordes y Divisores** | Gris sutil claro | Blanco sutil (10% opacidad) | `border-slate-200/50 dark:border-white/10` |
| **Botones Neutros** | Gris claro táctil | Cristal negro | `bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20` |
| **Insignias y Estados** | Bordes suaves definidos | Resplandores (glow) de color | `border-slate-200/80 dark:border-white/5` |

### Modificación de Clases Especiales:
1. **`.glass-card`**:
   * **Antes**: `@apply bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl;`
   * **Ahora (Semántico)**:
     ```css
     .glass-card {
       @apply bg-white/80 border-slate-200/50 shadow-lg 
              dark:bg-white/5 dark:backdrop-blur-2xl dark:border-white/10 dark:shadow-2xl;
       transition: background-color 0.3s ease, border-color 0.3s ease;
     }
     ```
2. **`.glass-button`**:
   * **Antes**: `@apply bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10;`
   * **Ahora (Semántico)**:
     ```css
     .glass-button {
       @apply bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 
              dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:text-white;
       transition: all 0.3s ease;
     }
     ```

---

## 🎛️ 4. Botón Flotante de Cambio de Tema (`ThemeToggle`)

Para que el usuario pueda alternar libremente el tema, diseñaremos un botón flotante altamente estético ubicado de forma fija (`fixed`) en la esquina de la pantalla.

### Diseño Visual del Botón:
* **Tema Claro**: Fondo blanco brillante, bordes definidos, icono de Sol (`Sun`) en color ámbar brillante con sutil rotación en hover.
* **Tema Oscuro**: Cristal esmerilado oscuro, icono de Luna (`Moon`) en color azul violeta neón con animación de pulso.

### Código del Componente Planificado (`frontend/components/theme/ThemeToggle.tsx`):
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: theme === 'light' ? 45 : -15 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border cursor-pointer 
                 bg-white border-slate-200 text-amber-500 hover:bg-slate-50
                 dark:bg-slate-900 dark:border-white/10 dark:text-indigo-400 dark:hover:bg-slate-800
                 transition-colors duration-300"
      aria-label="Cambiar tema"
    >
      {theme === 'light' ? <Sun size={22} className="fill-amber-500/20" /> : <Moon size={22} className="fill-indigo-500/20" />}
    </motion.button>
  );
};
```

---

## 🚀 5. Plan de Implementación de Código (Fase Futura)

Cuando finalice esta etapa de diseño y decidas codificar, los pasos exactos a seguir serán:

1. **Crear la Carpeta y Contexto**:
   * Escribir `frontend/components/theme/ThemeContext.tsx` con el código especificado.
2. **Inyectar el Proveedor (`ThemeProvider`)**:
   * En [App.tsx](file:///d:/Antigravity/Apps_LogicaKids/LogicaMath/frontend/App.tsx), envolver toda la aplicación:
     ```typescript
     import { ThemeProvider } from './components/theme/ThemeContext';
     
     const App: React.FC = () => {
       return (
         <ThemeProvider>
           {/* Estructura actual de la aplicación */}
         </ThemeProvider>
       );
     };
     ```
3. **Inyectar el Botón Flotante**:
   * Renderizar `<ThemeToggle />` en la base de `App.tsx` para que esté disponible en todas las vistas (Mapas, Administrador, Juegos).
4. **Refactorizar Vistas de Pantalla**:
   * Reemplazar las clases de fondo fijo (`bg-[radial-gradient(...)]` o `bg-black`) por clases semánticas duales en `App.tsx`, `WelcomeScreen.tsx`, `PedagogyTab.tsx`, `ProgressScreen.tsx`, etc.
   * Utilizar la transición suave de CSS en los elementos contenedor para evitar parpadeos bruscos al cambiar el tema.
5. **Configurar el CSS Principal**:
   * Incorporar la línea `@custom-variant dark (&:is(.dark *));` en la cabecera de `index.css`.
