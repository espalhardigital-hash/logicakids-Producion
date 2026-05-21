# Plan de Acción y Arquitectura: Mapa General de Fases (Fases 1 - 9) - Versión 3.0 (Certificada)

Este documento detalla la planificación técnica, la modularización del frontend, la integración con el backend asíncrono y el diseño estético de la interfaz principal para **LogicaKids Pro**. Tras la auditoría de estabilización y certificación final, el sistema ha transicionado de una arquitectura desconectada offline (v1.0) a un entorno estructurado en la nube (v3.0) con enrutamiento dinámico, estado centralizado y un motor de juego con autoridad en el servidor (Server-Authoritative).

---

## 1. Objetivos del Proyecto

1. **Nueva Interfaz Principal (Dashboard Modular)**: Crear una pantalla de entrada post-login (`PhaseMapScreen`) alojada dentro de su propia estructura modular, la cual muestra un mapa visual del camino de aprendizaje con las 9 fases en zig-zag (estilo Duolingo/Candy Crush, desde la Fase 1 a la Fase 9).
2. **Encapsulamiento de la Fase 1**: Convertir todo el flujo de la aplicación de matemáticas en el contenido exclusivo de la **Fase 1** (Aritmética Básica), integrándolo directamente con el backend.
3. **Navegación Basada en Progreso Asíncrono**:
   - **Fase 1**: Disponible para todos de inicio.
   - **Fases 2 a 9**: Desbloqueadas dinámicamente según el progreso real del alumno persistido en la base de datos PostgreSQL (`fase_actual_id` o `unlockedLevel`). Al dar clic en una fase bloqueada, se abre un modal premium con candado interactivo y los requisitos exactos de desbloqueo obtenidos en tiempo real de la API de pedagogía.
4. **Desacoplamiento y Modularización Estricta**: Reorganizar el frontend en carpetas por fases (`fase1` a `fase9`) y consolidar módulos independientes para el mapa principal (`components/map/`) y el panel de administración (`components/admin/`).
5. **Arquitectura Conectada (Server-Authoritative)**: Eliminar el estado zombie e independiente del generador de preguntas local (`mathService.ts`). La UI del juego interactúa directamente con el motor pedagógico del backend a través de endpoints seguros en FastAPI.

---

## 2. Arquitectura de Navegación y Enrutamiento Declarativo

Para cumplir con las directrices del **Reporte de Análisis**, el sistema ha eliminado la máquina de estados local en `App.tsx` (basada en el estado manual `screen` de `useState`) y ha adoptado **React Router DOM v6+**. Esto permite el uso correcto del historial del navegador (botón "Atrás"), soporte de enlaces directos (deep linking) y carga perezosa de vistas pesadas.

### Árbol de Rutas y Flujo Declarativo

```mermaid
graph TD
    A[Cargar Aplicación] --> B{¿Autenticado?}
    B -- No --> C[Ruta: /login]
    B -- Sí --> D{¿Rol de Usuario?}
    
    D -- ADMIN --> E[Ruta: /admin/*]
    D -- ALUMNO --> F[Ruta: /map]
    
    F --> G[Ruta: /fase/1/*]
    F --> H[Ruta: /profile]
    F --> I[Ruta: /progress]
    
    subgraph Módulo Fase 1
        G --> G1[/fase/1/welcome - Categorías]
        G1 --> G2[/fase/1/level-selection - Niveles]
        G2 --> G3[/fase/1/play - Jugando]
        G3 --> G4[/fase/1/results - Resultados]
        G4 --> G1
    end
```

### Gestión de Rutas en React Router v6

La navegación y renderizado se maneja a través de un enrutador declarativo (`BrowserRouter` / `<Routes>`), protegiendo los accesos mediante un componente `<ProtectedRoute>` que valida la sesión activa del usuario:

```typescript
// Estructura declarativa del enrutamiento
<Routes>
  <Route path="/login" element={<LoginScreen />} />
  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route index element={<Navigate to="/map" replace />} />
    <Route path="map" element={<PhaseMapScreen />} />
    <Route path="profile" element={<ProfileScreen />} />
    <Route path="progress" element={<ProgressScreen />} />
    <Route path="admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />
    
    {/* Sub-rutas específicas para la Fase 1 */}
    <Route path="fase/1">
      <Route path="welcome" element={<WelcomeScreen />} />
      <Route path="levels" element={<LevelSelectionScreen />} />
      <Route path="play" element={<GameScreen />} />
      <Route path="results" element={<ResultsScreen />} />
      <Route path="tables" element={<StudyTablesScreen />} />
    </Route>
  </Route>
</Routes>
```

---

## 3. Arquitectura del Estado Global y Autenticación

Para evitar el antipatrón de *Prop Drilling* (paso excesivo de props) y asegurar un flujo robusto en el frontend, se implementaron dos soluciones complementarias:

### 3.1. Contexto de Autenticación (`AuthContext`)
Centraliza el inicio de sesión, el registro, la recarga del usuario actual (`currentUser`) y la gestión de tokens JWT almacenados en `localStorage`.
- **Auditoría de Seguridad - Interceptor Global**: Para blindar el ciclo JWT, se añade un interceptor HTTP global en el cliente de peticiones (Axios/Fetch). Si la API devuelve un código `HTTP 401 Unauthorized` por expiración de token, el interceptor limpia automáticamente la sesión local y redirige de inmediato a la ruta `/login`, evitando estados inconsistentes o loops de carga infinitos.

### 3.2. Gestión de Progreso con Zustand (`appStore.ts`)
Un almacén ligero y asíncrono para gestionar:
- Progresión de niveles y logros pedagógicos de la sesión.
- Parámetros de juego dinámicos y configuración de la interfaz.
- Estado de sincronización en tiempo real con el backend PostgreSQL.

---

## 4. Modularización del Frontend (Estructura de Directorios)

El frontend está estructurado en módulos atómicos desacoplados para mejorar la mantenibilidad y permitir **Lazy Loading (Carga Perezosa)** en producción mediante `React.lazy`:

```
frontend/
├── context/
│   └── AuthContext.tsx        # Gestión global de sesión y JWT (Bearer token)
├── store/
│   └── appStore.ts            # Almacén Zustand para progreso y configuraciones
├── services/
│   ├── api.ts                 # Cliente HTTP central con Interceptor de Error 401
│   ├── authService.ts         # Login, registro y token refresh
│   └── pedagogiaService.ts    # Endpoints asíncronos de /pedagogia en el backend
├── components/
│   ├── admin/                 # MÓDULO DEL PANEL DE ADMINISTRACIÓN (Acceso Exclusivo)
│   │   ├── AdminPanel.tsx     # Controlador principal de administración
│   │   └── components/        # Sub-componentes específicos (Alumnos, Configuraciones, Logs)
│   │
│   ├── map/                   # MÓDULO DE LA VISTA PRINCIPAL (MAPA GENERAL)
│   │   ├── PhaseMapScreen.tsx # Mapa interactivo en zig-zag vertical (Fases 1 - 9)
│   │   └── components/        # Burbujas de Nodos, Conectores, Candados y Modales
│   │
│   ├── fase1/                 # Módulo de la Fase 1 (Calentamiento Aritmético)
│   │   ├── WelcomeScreen.tsx  # Categorías del calentamiento
│   │   ├── LevelSelectionScreen.tsx
│   │   ├── GameScreen.tsx     # Juego con Autoridad en Servidor
│   │   ├── ResultsScreen.tsx  # Resultados con feedback IA
│   │   └── StudyTablesScreen.tsx
│   │
│   ├── common/                # Componentes comunes (Botones, Modales, Cards, Loaders)
│   └── ProfileScreen.tsx      # Gestión del perfil de usuario y avatar
```

---

## 5. Mapeo de Fases y su Contenido Técnico (Viaje Matemático)

La progresión se gestiona a través de la base de datos PostgreSQL, sirviendo el backend como la **Autoridad Pedagógica** de control de flujo.

| Fase | Título de la Fase | Descripción Pedagógica | Tipo de Preguntas y Mecánica | Estado de Desarrollo |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Calentamiento Aritmético** | Evaluación y soltura en Aritmética Básica: sumas, restas, multiplicaciones y divisiones. | Server-Authoritative (`/pedagogia`) con validación y despacho de preguntas en base de datos. | **Certificado & Conectado** |
| **2** | **Desarrollo Numérico** | Cálculo mental avanzado, sistema monetario brasileño y lectura lógica de problemas. | Modelo híbrido (Generación controlada y Base de Datos) con `/pedagogia/responder`. | **Listo para Conexión** |
| **3** | **Problemas de Texto** | Comprensión lectora aplicada, datos relevantes vs. distractores y resolución dirigida. | Banco de Ejercicios en BD con motor interactivo de subrayado. | *Bloqueado en el Mapa* |
| **4** | **Fracciones y Gráficos** | Relación parte-todo (pasteles/pizzas) y visualización estructurada de datos (gráficas de barras). | Elementos manipulativos SVG interactivos y lecturas de bases de datos. | *Bloqueado en el Mapa* |
| **5** | **Geometría Plana** | Figuras bidimensionales, perímetros, áreas y resolución espacial interactiva (Tangram). | Banco de datos espacial y canvas interactivos. | *Bloqueado en el Mapa* |
| **6** | **Geometría Espacial** | Visualización 3D, prismas, cilindros y cálculo visual de volumen (bloques). | Ejercicios espaciales 3D renderizados con HTML/CSS. | *Bloqueado en el Mapa* |
| **7** | **Coordenadas y Trayectos** | Ubicación en el plano cartesiano, pares ordenados y nociones de direcciones y trayectorias. | Grillas interactivas y caminos cartesianos. | *Bloqueado en el Mapa* |
| **8** | **Probabilidad y Lógica** | Casos favorables vs posibles, secuencias abstractas, divisores, múltiplos y deducción. | Banco lógico con diagramas de árbol e inputs. | *Bloqueado en el Mapa* |
| **9** | **Simulados Pedro II** | Preparación de formato real con temporizador para el Examen de Admisión al Colégio Pedro II. | Simulacros cronometrados estructurados, analítica de errores y tutoría IA intensiva. | *Bloqueado en el Mapa* |

---

## 6. Siguientes Pasos y Auditoría Técnica (Resuelto & Certificado)

### 6.1. Transición Exclusiva a API Asíncrona (Server-Authoritative)
- **Cambio Realizado**: Se ha desactivado el motor local offline `mathService.ts` en `GameScreen.tsx`. El juego ahora consume `/pedagogia/responder` enviando la respuesta del usuario para ser procesada en la base de datos de forma segura, actualizando de forma atómica el `ProgresoMaestria` de PostgreSQL.
- **Ventaja**: Desaparece el "Estado Zombie" del frontend; los parámetros de tiempo límite, aciertos para aprobar (90%) y cantidad de preguntas son consultados dinámicamente desde el backend.

### 6.2. Sincronización Completa de Base de Datos y Alembic
- **Cambio Realizado**: El esquema físico de la base de datos se ha desacoplado en modelos estructurados bajo el patrón Facade en `sql_models.py` (con `alumno.py`, `pregunta.py`, `progreso.py`, etc.).
- **Optimización**: Se aplican restricciones `UniqueConstraint` para evitar duplicidad de progresiones y se crearon índices estratégicos como `idx_progreso_alumno_fase` y `idx_pool_alumno_bloque` para optimizar el rendimiento y la velocidad de carga de la API. Las migraciones están bajo control estricto de Alembic.

### 6.3. Solución S3 Environment y Subida de Avatares
- **Cambio Realizado**: Se configuraron las variables del entorno MinIO/S3 en el entorno de docker/producción. El flujo de subida de avatares en `/upload-avatar` (desde `ProfileScreen.tsx`) es funcional y seguro, eliminando las alertas de arranque del backend.

### 6.4. Eliminación de Archivos Basura y Depósitos Temporales
- **Cambio Realizado**: Purga del repositorio de scripts temporales de testing local (`check_db_scores.py`) y duplicaciones de configuración sensible (`.env_copia`), garantizando la higiene y seguridad del código base.

---

## 7. Refinamientos de UI/UX y Funcionalidades Premium Integradas

1. **🎨 Estética de Fondo Cósmico Continuo**: Gradiente unificado `bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#070A13]` con esferas de resplandor ambiental neón de fondo (`blur-[150px]`) que fluyen armónicamente con el scroll.
2. **✨ Iconos de Fases en Colores Vívidos**: Los nodos bloqueados conservan su identidad y color neón original, y el bloqueo se representa mediante elegantes candados interactivos para mantener alta la motivación del alumno.
3. **🏆 Insignias de Dominio**: Cápsulas interactivas de color verde menta con la leyenda `✓ Dominado ✅` al superar una fase o módulo al 100%, variando dinámicamente el botón de acceso a `✓ Repasar Fase (Dominada) ✅`.
4. **👑 Bypass Total para Administradores**: Cuentas con rol `ADMIN` omiten restricciones de bloqueo para facilitar la auditoría interactiva de cualquier fase o nivel.
5. **↩️ Retorno Intuitivo**: Botón de regreso al Mapa General integrado en todas las pantallas de fase, eliminando deslogueos accidentales.
