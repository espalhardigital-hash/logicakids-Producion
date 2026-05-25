Aquí tienes el documento **`Desig_UX.md`** completamente actualizado y corregido.

He integrado los ajustes necesarios para eliminar el conflicto pedagógico (la revelación de respuestas) y he estandarizado la nomenclatura de las rutas para que coincida exactamente con la arquitectura de backend definida en el *Blueprint*. Puedes copiar y pegar este bloque directamente en tu archivo:

```markdown
# Arquitectura Integral y Estándares UX/UI (LogicaKids Pro)

Este documento unifica la planificación técnica (Arquitectura y Estado) con la guía oficial de diseño (UX/UI) para **LogicaKids Pro**. El objetivo es garantizar que la plataforma no solo sea escalable y robusta a nivel de código, sino que también ofrezca una experiencia de usuario gamificada, coherente y adaptada para niños de alrededor de 10 años.

---

## 1. Filosofía del Sistema

La plataforma se construye sobre dos pilares complementarios:
* **Filosofía Sistema-Céntrica (Arquitectura):** La estructura y la verdad de los datos lo son todo. Se prioriza un entorno en la nube (Server-Authoritative), enrutamiento declarativo y estado centralizado, donde el frontend obedece estrictamente al motor pedagógico del backend.
* **Filosofía Usuario-Céntrica (UX/UI):** La percepción lo es todo. La interfaz debe sentirse como un videojuego espacial ("Space/Tech Dark Mode"), reduciendo la carga cognitiva mediante *chunking*, evitando la frustración y fomentando la interacción a través de micro-animaciones y retroalimentación visual inmediata.

---

## 2. Arquitectura de Navegación y Estado Global

### 2.1. Enrutamiento Declarativo (React Router v6)
El sistema utiliza React Router para manejar el historial, deep linking y carga perezosa. Se protege el acceso mediante un componente `<ProtectedRoute>`.

* **Rutas Principales:** `/login`, `/map` (Mapa General), `/profile`, `/progress` y `/admin/*`.
* **Rutas de Fase:** `/fase/:id/:modulo/:nivel`

### 2.2. Estado Global (Zustand)
Toda la lógica de la sesión, progreso de fase y parámetros del juego (`useParams`) se gestiona en un store centralizado. **El frontend no calcula el estado**, simplemente refleja el JSON entregado por los endpoints del backend.

---

## 3. Estructura de Componentes

La jerarquía de archivos sigue un patrón de diseño atómico para facilitar el mantenimiento:

```text
src/
 ├── components/
 │   ├── admin/       # Panel Admin
 │   ├── map/         # Mapa General (Zig-zag Fases 1-9)
 │   ├── fase/        # Modulares por Fase (Welcome, Levels, Game, Results)
 │   ├── common/      # CustomKeyboard, Buttons, Modals
 └── store/           # Zustand Store (Auth, Progress, GameSession)

```

---

## 4. Guía de Interacción y Comportamiento UX

### 4.1. El Bucle Espejo (Mirror Loop)

Para evitar la frustración, el sistema implementa una lógica de rescate automatizada:

1. **Intento 1-3:** Si el niño falla, el sistema no revela la respuesta. Se activa un mensaje de feedback del "Tutor Invisible" y se permite un nuevo intento con una "Variante Espejo".
2. **Intento 4 (Bloque de Rescate):** Se dispara el `Modal Overlay` de Rescate, el cual exige transcribir la respuesta correcta (Anti-Spam) para desbloquear el avance y llamar a `/cerrar-rescate`.

### 4.2. Dashboard de Fase

* **Grid Adaptativo:** Muestra los niveles como nodos estelares. Los niveles bloqueados presentan una animación de "candado esmerilado".
* **Estado Visual:** Los nodos aprobados brillan con un resplandor dorado (`.glow-gold`).

### 4.3. Módulos Teóricos

* **Chunking:** Se prohíbe el uso de scrollbars. La teoría se divide en carruseles de máximo 2 elementos por diapositiva para mantener la atención enfocada.

### 4.4. Interfaz de Práctica y Juego

* **Custom Input Box:** Se utiliza un input numérico personalizado.
* *Incorrecto:* Borde/fondo rojo + badge (✗). Resplandor ambiental rojo (`.ambient-glow.incorrect`). Muestra el mensaje de feedback del Tutor Invisible (sin revelar la respuesta final). Requiere interacción para avanzar hacia la siguiente Variante Espejo o activar el Modal de Rescate.


* **Motor de Juego:** Consulta dinámica y asíncronamente a los endpoints del backend (`/pregunta`, `/responder`, `/cerrar-rescate`).
* **Custom Keyboard:** Teclado numérico gigante y bloqueado para evitar distracciones del teclado nativo del dispositivo.

---

## 5. Mapeo General de Fases (Camino de Aprendizaje)

Las fases se desbloquean dinámicamente según el progreso (`fase_actual_id` en PostgreSQL). Los administradores tienen Bypass total.

| Fase | Título | Descripción Pedagógica | Mecánica |
| --- | --- | --- | --- |
| **1** | Calentamiento Aritmético | Sumas, restas, multiplicaciones, divisiones. | Server-Authoritative (`/pedagogia`). |
| **2** | Desarrollo Numérico | Cálculo mental, sistema monetario, problemas lógicos. | Modelo híbrido interactivo. |
| **3** | Problemas de Texto | Comprensión lectora, datos relevantes. | Subrayado y resolución dirigida. |
| **4** | Fracciones y Gráficos | Relación parte-todo, barras de datos. | SVG interactivos. |
| **5** | Geometría Plana | Figuras 2D, perímetros, áreas (Tangram). | Canvas espaciales. |
| **6** | Geometría Espacial | Visualización 3D, volumen. | CSS/HTML 3D. |
| **7** | Coordenadas y Trayectos | Plano cartesiano, trayectorias. | Grillas cartesianas. |

```

```