# Arquitectura Integral y Estándares UX/UI (LogicaKids Pro)

Este documento unifica la planificación técnica (Arquitectura y Estado) con la guía oficial de diseño (UX/UI) para **LogicaKids Pro**. El objetivo es garantizar que la plataforma no solo sea escalable y robusta a nivel de código, sino que también ofrezca una experiencia de usuario gamificada, coherente y adaptada para niños de alrededor de 10 años.

---

## 1. Filosofía del Sistema

La plataforma se construye sobre dos pilares complementarios:
*   **Filosofía Sistema-Céntrica (Arquitectura):** La estructura y la verdad de los datos lo son todo. Se prioriza un entorno en la nube (Server-Authoritative), enrutamiento declarativo y estado centralizado, donde el frontend obedece estrictamente al motor pedagógico del backend.
*   **Filosofía Usuario-Céntrica (UX/UI):** La percepción lo es todo. La interfaz debe sentirse como un videojuego espacial ("Space/Tech Dark Mode"), reduciendo la carga cognitiva mediante *chunking*, evitando la frustración y fomentando la interacción a través de micro-animaciones y retroalimentación visual inmediata.

---

## 2. Arquitectura de Navegación y Estado Global

### 2.1. Enrutamiento Declarativo (React Router v6)
El sistema utiliza React Router para manejar el historial, deep linking y carga perezosa. Se protege el acceso mediante un componente `<ProtectedRoute>`.

*   **Rutas Principales:** `/login`, `/map` (Mapa General), `/profile`, `/progress` y `/admin/*`.
*   **Rutas de Fase (Ej. Fase 1):** `/fase/1/welcome`, `/fase/1/levels`, `/fase/1/play`, `/fase/1/results`.

### 2.2. Gestión del Estado
Para evitar el *Prop Drilling*, se utilizan:
*   **AuthContext:** Centraliza el login, registro y tokens JWT. Incluye un interceptor HTTP global para manejar expiraciones (HTTP 401) redirigiendo a `/login`.
*   **appStore.ts (Zustand):** Almacén asíncrono para gestionar la progresión de niveles, configuración de la interfaz y sincronización con PostgreSQL.

---

## 3. Estándares Visuales y de Diseño (UX/UI)

### 3.1. Principios Core
*   **Estética Gamificada ("Space/Tech Dark Mode"):** Fondos oscuros profundos (ej. `#080e1c` o `#0b0f19`) combinados con un fondo cósmico continuo (gradiente a `#070A13` con esferas neón de resplandor `blur-[150px]`). Paneles estilo *glassmorphism* (fondos y bordes blancos translúcidos).
*   **Tipografía:** `Outfit` para títulos e indicadores; `Inter` para textos y descripciones generales.
*   **Micro-interacciones:**
    *   *Hover:* Escalado sutil (`scale(1.03)`) con resplandor/sombra neón temática.
    *   *Active:* Efecto de presión (`scale(0.97)`).
    *   *Transiciones:* Suaves y lineales (`0.2s ease`).

### 3.2. Identidad de Color
Cada fase posee un color dominante que dicta el fondo de los banners y resplandores:
*   **Fase 1:** Aritmética Básica (Color temático definido en UI).
*   **Fase 2:** Desarrollo Numérico - Verde brillante (`#10B981`).
*   **Fase 3:** Problemas de Texto - Naranja neón (`#F97316`).
*   *(Dentro de cada fase, los módulos tienen sus propios acentos menores).*

---

## 4. Estructura de Componentes Clave

### 4.1. Cabeceras (Header) y Navegación
*   **Botón "Salir del Nivel":** Siempre en la esquina superior izquierda. Reemplaza textos agresivos como "Abortar Misión". En móviles, oculta el texto.
*   **Avatar:** Foto real del alumno cargada dinámicamente. Prohibida en cabeceras de teoría para evitar ruido cognitivo; permitida en diálogos o menús principales.
*   **Métricas:** Nivel y módulo en un badge central/prominente. Monedas y rachas en la esquina superior derecha.

### 4.2. Dashboard de Fase / Selección de Niveles
*   **Grid Adaptativo:** Tarjetas de módulos en 2 columnas en desktop/tablet, 1 columna en móviles. Toda la tarjeta es clicable.
*   **Niveles:** Lista vertical de barras premium con iconos según el tipo (Nivel Estándar 🎯, Avanzado ⚡, Maestría 🏆, Dominado ✅).
*   **Desbloqueo Dinámico:** Las fases/módulos bloqueados muestran un candado interactivo. Un modal revela los requisitos obtenidos desde el backend.

### 4.3. Modales de Teoría (`FaseXTheoryModal`)
*   **Sin Scrollbars:** `height: auto` con `max-height: 95vh`. Scroll vertical solo como mecanismo de seguridad en pantallas muy pequeñas.
*   **Chunking y Concisión:** Máximo 2 elementos por diapositiva. Textos de máximo dos líneas por idea.
*   **Botones:** Botón principal de avance ocupa el 70% del ancho, botón secundario el 30%.

### 4.4. Interfaz de Práctica y Juego (Autoridad en el Servidor)
El motor de juego consulta dinámica y asíncronamente a `/pedagogia/responder`.
*   **Custom Input Box:** Prohibido el input nativo. Una caja interactiva recibe eventos de clic y muestra el estado:
    *   *Correcto:* Borde/fondo verde + badge (✓). Resplandor ambiental verde (`.ambient-glow.correct`). Transición automática (1.2s).
    *   *Incorrecto:* Borde/fondo rojo + badge (✗). Resplandor ambiental rojo (`.ambient-glow.incorrect`). Muestra la respuesta esperada. Requiere interacción para avanzar.
*   **Teclado Numérico Virtual (`CustomKeyboard.tsx`):** Uso obligatorio en todo el juego. Grid 3x4. Botones `1-9`, botón de borrar (rojo/coral), `0`, y confirmación (azul brillante). Previene la selección accidental de texto (`select-none`).
*   **Preguntas Tipográficas:** Ajuste automático del tamaño de fuente (1.6rem para problemas largos, 2.2rem para fórmulas cortas).

---

## 5. Modularización del Directorio Frontend

El frontend emplea un patrón de carpetas atómico y de *Lazy Loading*:
```text
frontend/
├── context/         # AuthContext (JWT)
├── store/           # appStore (Zustand)
├── services/        # api.ts (Axios + 401 Interceptor), pedagogiaService.ts
├── components/
│   ├── admin/       # Panel Admin
│   ├── map/         # Mapa General (Zig-zag Fases 1-9)
│   ├── fase1/       # Modulares por Fase (Welcome, Levels, Game, Results)
│   ├── common/      # CustomKeyboard, Buttons, Modals
│   └── ProfileScreen.tsx
```

---

## 6. Mapeo General de Fases (Camino de Aprendizaje)

Las fases se desbloquean dinámicamente según el progreso (`fase_actual_id` en PostgreSQL). Los administradores tienen Bypass total.

| Fase | Título | Descripción Pedagógica | Mecánica |
| :---: | :--- | :--- | :--- |
| **1** | Calentamiento Aritmético | Sumas, restas, multiplicaciones, divisiones. | Server-Authoritative (`/pedagogia`). |
| **2** | Desarrollo Numérico | Cálculo mental, sistema monetario, problemas lógicos. | Modelo híbrido interactivo. |
| **3** | Problemas de Texto | Comprensión lectora, datos relevantes. | Subrayado y resolución dirigida. |
| **4** | Fracciones y Gráficos | Relación parte-todo, barras de datos. | SVG interactivos. |
| **5** | Geometría Plana | Figuras 2D, perímetros, áreas (Tangram). | Canvas espaciales. |
| **6** | Geometría Espacial | Visualización 3D, volumen. | CSS/HTML 3D. |
| **7** | Coordenadas y Trayectos | Plano cartesiano, trayectorias. | Grillas cartesianas. |
| **8** | Probabilidad y Lógica | Deducción, árbol de probabilidad, secuencias. | Lógica abstracta. |
| **9** | Simulados Pedro II | Preparación real cronometrada. | Simulacro intensivo con IA. |

*Documento certificado - Consolidación de Arquitectura v3.0 y Guía UX/UI.*
