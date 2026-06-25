# ESPECIFICACIÓN DE ESTRUCTURA Y NAVEGACIÓN (LANDING-PAGE-SPEC.md)

Este documento especifica la estructura visual, distribución de componentes y navegación jerárquica para la pantalla principal del **Banco de Preguntas** y la vista del **Modo Simulación Alumno** (WYSIWYG).

---

## 1. Estructura de la Pantalla Principal (Banco de Preguntas)

```
+-----------------------------------------------------------------------------+
|  LogicaKids Admin                       [Estado API]        [Avatar Usuario]|
+-----------------------------------------------------------------------------+
| Pestañas de Fases:  [ FASE 1 ]    [ FASE 2 ]    [ FASE 3 ]    [ FASE 4 ]    |
+-----------------------------------------------------------------------------+
|  [Módulos]           |  Sub-pestañas:                                       |
|  * Módulo 1 (Sumas)  |  [ General ]   [ Teoría ]   [ Preguntas ]   [Desafíos]|
|  * Módulo 2 (Restas) |  +-------------------------------------------------+ |
|  * Módulo 3 (Tablas) |  |                                                 | |
|                      |  |              Área de Contenido                  | |
|                      |  |             (Tabla o Formulario)                | |
|                      |  |                                                 | |
|                      |  +-------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

### Secciones y Distribución de Layout:
- **Cabecera Superior (Header):**
  - Alineado a la izquierda: Nombre de la aplicación ("LogicaKids Admin").
  - Centro: Indicador visual de conexión con la API ("API Conectada" con icono y fondo verde pastel).
  - Derecha: Botón de tema (claro/oscuro) y foto de perfil del tutor con su nombre.
- **Navegación de Nivel 1 (Fases):**
  - Una fila horizontal de botones grandes y planos justo debajo de la cabecera.
  - La fase activa se destaca con fondo blanco (en modo claro) o gris elevado (en modo oscuro), sombra suave y texto índigo.
- **Área de Contenido de Doble Columna:**
  - **Columna Izquierda (Sidebar Secundario - 25% de ancho):**
    - Un menú vertical que lista los módulos disponibles para la fase seleccionada.
    - Se muestran los nombres descriptivos mapeados (ej: "Gimnasio Numérico Mental").
    - El módulo activo se resalta con un borde izquierdo de 4px color índigo y tipografía semibold.
  - **Columna Derecha (Área de Trabajo Principal - 75% de ancho):**
    - Cabecera con el título del módulo y el botón "Nueva Pregunta".
    - Fila de sub-pestañas horizontales para alternar entre: General, Teoría, Preguntas Libres y Desafíos.
    - **Navegación de Nivel 2 (Sub-pestañas de Desafíos):** Al activar la pestaña "Desafíos", se muestra una fila secundaria para segmentar por nivel: *Todos, Desafío 1: Estándar, Desafío 2: Avanzada, Desafío Final: Maestría*.

---

## 2. Estructura del "Modo Simulación Alumno" (WYSIWYG)

Este modo se activa mediante un botón en la tabla de preguntas o teoría. Renderiza una interfaz simulada del alumno.

```
+-----------------------------------------------------------------------------+
| [Atrás]               Pregunta 3 de 15 (20% Revisado)            [Adelante] |
+-----------------------------------------------------------------------------+
|  +-----------------------------------------------------------------------+  |
|  |                             VISTA SIMULADA                            |  |
|  |                                                                       |  |
|  |    ¿Cuánto es 5 + 3?                                                  |  |
|  |                                                                       |  |
|  |    [ A ] 7          [ B ] 8          [ C ] 9          [ D ] 6         |  |
|  |                                                                       |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
| [ ] Aprobada y revisada por el Admin              [Editar]       [Eliminar] |
+-----------------------------------------------------------------------------+
```

### Elementos Estructurales:
- **Fila de Control Superior (Navegación Sequencial):**
  - Extremo izquierdo: Botón "Atrás" (flecha izquierda) para retroceder a la pregunta anterior.
  - Centro: Texto indicador del progreso de la cola actual ("Pregunta X de Y") y una barra de progreso horizontal que representa el porcentaje de revisión general del módulo.
  - Extremo derecho: Botón "Adelante" (flecha derecha) para avanzar al siguiente ejercicio.
- **Área Central (Simulador de Dispositivo):**
  - Una tarjeta contenedora centrada con bordes muy redondeados y sombra pronunciada que imita el estilo lúdico y colorido del juego del alumno (tarjeta del problema, alternativas en cuadrícula de botones interactivos con respuestas clicables).
- **Fila de Control Inferior (Acciones del Admin):**
  - Extremo izquierdo: Un checkbox interactivo grande con la leyenda *"Aprobada y revisada por el Administrador"*.
  - Extremo derecho: Botones rápidos para "Editar/Reformular" (abre formulario de edición) y "Eliminar" (con confirmación).
