# Plan de Implementación: Panel de Administrador (Superusuario)

Este documento centraliza la planificación, requerimientos y el prompt maestro para el desarrollo de la interfaz gráfica y la lógica del **Panel de Administrador** en la plataforma LogicaKids Pro.

---

## PROMPT MAESTRO PARA GENERACIÓN DE UI

Actúa como un desarrollador experto en React, Frontend y diseño UX/UI avanzado. Necesito que estructures, diseñes e implementes el Panel de Administración (Dashboard) para "LogicaKids Pro", una plataforma educativa de matemáticas para niños.

Tu objetivo principal es desarrollar una interfaz administrativa de alta gama que permita a los educadores (superusuarios) gestionar el contenido pedagógico y monitorear la plataforma.

A continuación te detallo las reglas, funciones, privilegios y la configuración exacta de la interfaz que debes implementar:

### 1. FUNCIONES Y PRIVILEGIOS DEL ADMINISTRADOR (Superusuario)
El administrador es el educador o gestor de la plataforma. El panel debe incluir las siguientes funcionalidades clave:

- **Gestión Pedagógica y Parámetros del Juego:** 
  - Ajustar el número de preguntas por fase dentro de los desafíos de operaciones (Sumas, Restas, Multiplicaciones, Divisiones).
  - Modificar los tiempos límite exactos para cada uno de los niveles de dificultad (ej. Nivel 1: 10s, Nivel 5: 18s). En los niveles donde el tiempo está estipulado por defecto (ej. Fase 0), el administrador debe poder aumentarlos o disminuirlos, así como habilitar o deshabilitar el uso del cronómetro según el bloque.
- **Monitoreo y Progreso (Estadísticas):**
  - Dashboard analítico con métricas de desempeño de los estudiantes (progreso, operaciones donde más fallan gracias al sistema de "tutoría invisible").
- **Control de Acceso (Privilegios):**
  - Toda la interfaz administrativa debe ser de acceso restringido, comprobando que el usuario tenga el rol de `admin` o `superuser` antes de renderizar la vista.

### 2. CONFIGURACIÓN DE LA INTERFAZ Y ESTÉTICA (UX/UI)
El panel no debe ser un dashboard corporativo aburrido. Debe mantener la identidad visual atractiva y gamificada de LogicaKids Pro, pero enfocada en la productividad del educador.

- **Estilo de Diseño (High-End & Glassmorphism):** El diseño debe sentirse premium. Utiliza técnicas de *Glassmorphism* (paneles semitransparentes, `backdrop-blur`, bordes sutiles y sombras suaves).
- **Stack Tecnológico:**
  - **Tailwind CSS v4:** Para todo el estilado, aprovechando la paleta de colores vibrantes pero armoniosa (soporte para un diseño moderno y limpio).
  - **Framer Motion:** Implementa micro-animaciones para interacciones (hovers en botones, apertura de modales, transiciones fluidas entre secciones).
- **Estructura y Navegación:**
  - Un *Sidebar* (menú lateral) plegable y responsivo con navegación fluida entre: "Vista General", "Configuración Pedagógica", y "Rendimiento Estudiantil".
  - Tarjetas de estadísticas (*Cards*) para datos rápidos y formularios intuitivos para modificar los tiempos/preguntas.
- **Responsividad Total:** Debe adaptarse perfectamente tanto a computadoras de escritorio como a tablets (que suelen usar los educadores).

### 3. QUÉ SE DEBE GENERAR:
Basado en estas instrucciones, el código fuente de los componentes de la interfaz de administración debe incluir:
1. El Layout principal del Dashboard (con Sidebar y Header).
2. La pantalla de "Configuración Pedagógica" con los controles/deslizadores para editar los límites de tiempo y preguntas.
3. Las clases de Tailwind v4 aplicadas para lograr el efecto cristal (*Glassmorphism*).
4. Animaciones básicas de Framer Motion en la carga de elementos y transiciones.
5. Código limpio, bien tipado e integrado.
