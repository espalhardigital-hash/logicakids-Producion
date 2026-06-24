# Documento de Especificaciones: Auditoría de Código y Detección de Bugs

Este documento recopila el análisis de auditoría de los archivos de la aplicación **LogicaMath** (`LogicaMath/frontend` y `LogicaMath/backend`), utilizando la **Metodología de Auditoría Interactiva Q&A** definida en [Metodologia_Auditoria_QA.md](file:///d:/Antigravity/APP_Logica_Matematicas_kids/docs/Metodologia_Auditoria_QA.md).

---

## 🎯 Resumen Ejecutivo e Inventario de Archivos Críticos

Hemos mapeado las carpetas reales de la aplicación para establecer la prioridad de auditoría. Se omiten los scripts temporales, carpetas de tests antiguos o de apoyo para enfocarse exclusivamente en el núcleo funcional:

### 🌐 Backend (`LogicaMath/backend/app`)
*   🔑 **Seguridad y Core**: `auth.py`, `main.py`, `config.py`
*   💾 **Modelos y Base de Datos**: `models/sql_models.py`, `schemas.py`, `seed.py`
*   ⚙️ **Servicios y Reglas Pedagógicas**: `services/pedagogia_service.py`, `admin/router.py`
*   🎮 **Lógica de Fases**: `fase2/router.py`, `fase3/router.py`, etc.

### 🎨 Frontend (`LogicaMath/frontend/components`)
*   🛠️ **Infraestructura y Rutas**: `ErrorBoundary.tsx`, `App.tsx`, `useWebSocket.ts`
*   📊 **Vistas de Progreso**: `ProgressScreen.tsx`, `ProfileScreen.tsx`
*   ⚙️ **Administración**: `admin/PedagogyTab.tsx`, `admin/phaseMaps.ts`
*   🎮 **Juegos**: `fase_generic/FaseGenericGameScreen.tsx`, `fase3/Fase3GameScreen.tsx`, etc.

---

## 🔍 Registro de Auditoría Q&A por Archivo

A continuación, se presentan las primeras auditorías detalladas de archivos identificados como críticos o con fallos de compilación.

---

### 📄 Archivo: `LogicaMath/frontend/components/ErrorBoundary.tsx`

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Cuál es el rol de este archivo dentro de la aplicación?
> 2. ¿Qué dependencias críticas tiene y con cuáles archivos interactúa?
> 3. ¿Cómo es el flujo de entrada, procesamiento y salida de datos?
> 4. ¿Qué bugs lógicos, problemas de tipado, inconsistencias de lógica, fallos de rendimiento o edge cases no controlados existen en el código?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Rol e Integración en la Arquitectura
Es un componente React de tipo clase para capturar errores de JavaScript en cualquier parte de su árbol de componentes hijos, evitando que toda la aplicación web se caiga (pantalla en blanco) ante un error no controlado en un componente específico.

#### 2. Dependencias y Relaciones
*   **Importaciones clave**: `react` (`Component`, `ErrorInfo`, `ReactNode`), `lucide-react` (`AlertTriangle`, `RefreshCw`).
*   **Archivos dependientes**: Envuelve a componentes principales en `App.tsx` para proporcionar resiliencia UI.

#### 3. Flujo de Datos
*   **Entrada**: Recibe `children` (los componentes hijos a renderizar) y un `fallback` opcional (interfaz a mostrar en caso de error).
*   **Procesamiento**: Si ocurre un error de renderizado en los hijos, React llama a `getDerivedStateFromError` para actualizar el estado `hasError: true` y a `componentDidCatch` para registrar el error en la consola.
*   **Salida**: Renderiza el componente `fallback`, o una pantalla de error por defecto con la descripción del fallo y un botón de "Reintentar", o renderiza `children` si no hay error.

#### 4. Registro de Inconsistencias y Bugs Detectados

*   ❌ **BUG-01: Omisión de Tipos Genéricos de React en `package.json`** (Severidad: **Crítica** / Configuración)
    *   *Descripción*: Al compilar con `tsc`, reporta que `setState` y `props` no existen en `ErrorBoundary`. Esto se debe a que `devDependencies` en `package.json` carece de `@types/react` y `@types/react-dom`. Sin estas definiciones, TypeScript no sabe que `Component` de React posee las propiedades `props` y el método `setState`.
    *   *Ubicación*: [package.json](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/package.json)
    *   *Efecto*: Error de compilación general al compilar en producción o correr `tsc --noEmit`.
*   ❌ **BUG-02: Referencia incorrecta en `handleReload`** (Severidad: **Media** / Tipos)
    *   *Descripción*: Aunque semánticamente el método `handleReload` es correcto en JavaScript, en TypeScript es necesario que la clase `ErrorBoundary` herede de `Component<Props, State>` y que React esté debidamente tipado para evitar que el compilador rechace el acceso a `this.setState`.
    *   *Ubicación*: [ErrorBoundary.tsx#L29](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/ErrorBoundary.tsx#L29)
    *   *Efecto*: Error de tipado TS2339.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Agregar `@types/react` y `@types/react-dom` a `devDependencies` en el archivo `package.json` del frontend.
*   Paso 2: Asegurar que el tipado de la declaración de clase sea resuelto correctamente importando explícitamente React (ya se hace en la línea 1).

---

### 📄 Archivo: `LogicaMath/backend/app/auth.py`

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Cuál es el rol de este archivo dentro de la aplicación?
> 2. ¿Qué dependencias críticas tiene y con cuáles archivos interactúa?
> 3. ¿Cómo es el flujo de entrada, procesamiento y salida de datos?
> 4. ¿Qué bugs lógicos, problemas de tipado, inconsistencias de lógica, fallos de rendimiento o edge cases no controlados existen en el código?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Rol e Integración en la Arquitectura
Módulo central de autenticación y autorización del backend. Administra el hash de contraseñas (bcrypt), la creación y validación de tokens JWT, la recuperación del usuario y alumno activo de la base de datos por petición, y la creación automática de cuentas/perfiles durante el registro de usuarios.

#### 2. Dependencias y Relaciones
*   **Importaciones clave**: `jose` (JWT), `passlib` (bcrypt), `fastapi` (Depends, HTTPException, OAuth2), `sqlalchemy` (AsyncSession), modelos internos (`User`, `Alumno`, `Fase`, `ProgresoMaestria`).
*   **Archivos dependientes**: Importado por todos los enrutadores API para proteger rutas mediante `Depends(get_current_user)` o `Depends(get_admin_user)`.

#### 3. Flujo de Datos
*   **Entrada**: Credenciales de usuario (email, contraseña), token JWT en los encabezados HTTP ("Authorization: Bearer <token>").
*   **Procesamiento**:
    *   *Registro*: Hashing de password, creación de registro `User` con configuración inicial de niveles desbloqueados (`settings`), verificación y asignación de la `Fase` inicial (Fase 0 o Fase 1 para casos especiales), y creación del perfil del `Alumno` correspondiente.
    *   *Autenticación*: Decodificación de JWT, consulta combinada via `outerjoin` entre `User` y `Alumno` en base al `user_id` extraído.
*   **Salida**: Un objeto de tipo diccionario con datos de sesión e ID de alumno, o una excepción HTTP 401/403 si las credenciales fallan o el rol no coincide.

#### 4. Registro de Inconsistencias y Bugs Detectados

*   ❌ **BUG-01: Estructura de Niveles en settings incompatible con Fases 2-8** (Severidad: **Media** / Escalabilidad)
    *   *Descripción*: Al registrar un usuario, la configuración por defecto de `unlockedLevels` inicializa las llaves `"addition"`, `"subtraction"`, `"multiplication"`, `"division"`, `"challenge"`. Sin embargo, a partir de la Fase 2, todas las operaciones se definen como `"mixta"`. El backend no contempla la inicialización ni el progreso de llaves de operación genéricas o mixtas en este diccionario.
    *   *Ubicación*: [auth.py#L182-L192](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/auth.py#L182-L192)
    *   *Efecto*: Posibles errores o fallos silenciosos al consultar el estado de desbloqueo de niveles en fases avanzadas que dependen de operaciones de tipo `"mixta"`.
*   ❌ **BUG-02: Uso de `datetime.utcnow()` Deprecado** (Severidad: **Baja** / Mantenibilidad)
    *   *Descripción*: Se emplea `datetime.utcnow()` para establecer fechas de inicio y aprobación de progresos. Este método está deprecado en Python 3.12+ porque genera objetos *naive* (sin zona horaria), lo que puede provocar desfases o inconsistencias horarias con motores de base de datos que esperen husos timezone-aware.
    *   *Ubicación*: [auth.py#L49](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/auth.py#L49), [auth.py#L51](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/auth.py#L51), [auth.py#L228-L229](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/auth.py#L228-L229)
    *   *Efecto*: Advertencias en tiempo de ejecución en entornos modernos; posibles inconsistencias en husos horarios en registros de base de datos.
*   ⚠️ **BUG-03: Posible excepción en usuarios antiguos sin perfil de Alumno** (Severidad: **Media** / Edge Case)
    *   *Descripción*: En `get_current_user`, se realiza un `outerjoin` con la tabla `Alumno`. Si por algún motivo existe un usuario sin perfil de alumno asociado en la BD (ej. cuentas creadas manualmente en fases de prueba previas), `alumno` será `None`. Al llamar a servicios protegidos que consumen `get_current_student`, el sistema arrojará HTTP 400.
    *   *Ubicación*: [auth.py#L78-L105](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/auth.py#L78-L105), [auth.py#L123-L135](file:///D:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/auth.py#L123-L135)
    *   *Efecto*: Caída o bloqueo de la API para usuarios antiguos o cuentas administrativas creadas manualmente sin perfil de alumno.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Migrar `datetime.utcnow()` a `datetime.now(timezone.utc)` importando `from datetime import timezone`.
*   Paso 2: Dinamizar la inicialización del objeto `settings` de niveles desbloqueados para soportar el mapa completo de fases o la operación `"mixta"`.
*   Paso 3: Añadir un mecanismo de auto-recuperación/creación en `get_current_student` para que, si un usuario válido no posee un `Alumno` registrado, este se cree bajo demanda de manera segura en lugar de retornar un error 400.

---

### 📄 Archivo: `LogicaMath/frontend/types.ts`

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Cuál es el rol de este archivo dentro de la aplicación?
> 2. ¿Qué dependencias críticas tiene y con cuáles archivos interactúa?
> 3. ¿Cómo es el flujo de entrada, procesamiento y salida de datos?
> 4. ¿Qué bugs lógicos, problemas de tipado, inconsistencias de lógica, fallos de rendimiento o edge cases no controlados existen en el código?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Rol e Integración en la Arquitectura
Es el archivo central de tipados y declaraciones de interfaces TypeScript del frontend. Define las estructuras de datos de negocio (`User`, `ScoreRecord`, `PedagogyConfig`, `ConfiguracionProgreso`, `ProgressSummary`, etc.) que garantizan consistencia en toda la UI.

#### 2. Dependencias y Relaciones
*   **Importaciones**: Ninguna externa (tipos puros).
*   **Archivos dependientes**: Casi todos los componentes del frontend y servicios (`storageService.ts`, `App.tsx`, pantallas de juego).

#### 3. Flujo de Datos
Define los moldes estructurales para el paso de props en componentes de React, y para parsear las respuestas JSON de la API.

#### 4. Registro de Inconsistencias y Bugs Detectados
*   ❌ **BUG-FRONT-02: Campos faltantes en `PedagogyConfig`** (Severidad: **Crítica** / Tipos)
    *   *Descripción*: El tipo `PedagogyConfig` no define los campos `passingScore`, `questionsPerPhase`, `useTimer`, ni `timers`. Sin embargo, `App.tsx` y pantallas de Fase 1 intentan acceder a estas propiedades directamente en `adminConfig` (que está tipado como `PedagogyConfig`).
    *   *Ubicación*: [types.ts#L154-L157](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/types.ts#L154-L157)
    *   *Efecto*: Error de compilación TS2339 en `App.tsx`, `GameScreen.tsx`, etc.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Agregar las propiedades opcionales `passingScore?: number;`, `questionsPerPhase?: number;`, `useTimer?: boolean;`, y `timers?: { easy?: number; easy_medium?: number; medium?: number; medium_hard?: number; hard?: number };` en la interfaz `PedagogyConfig`.

---

### 📄 Archivo: `LogicaMath/frontend/components/admin/phaseMaps.ts`

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Cuál es el rol de este archivo?
> 2. ¿Qué dependencias tiene?
> 3. ¿Cómo es el flujo de datos?
> 4. ¿Qué bugs de tipado tiene?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Rol e Integración en la Arquitectura
Define el mapa estático del flujo de las fases (`PHASE_MAPS`). Especifica qué módulos y niveles componen cada fase desde la Fase 1 hasta la 8.

#### 2. Dependencias y Relaciones
*   **Archivos dependientes**: `PhaseMapContext.tsx` y `ContentTab.tsx` para renderizar o gestionar flujos y contenidos.

#### 3. Flujo de Datos
Constante estática que sirve de fallback o base de datos de navegación de fases del sistema.

#### 4. Registro de Inconsistencias y Bugs Detectados
*   ❌ **BUG-FRONT-03: Falta propiedad `levels` en tipo `PhaseMap`** (Severidad: **Alta** / Tipos)
    *   *Descripción*: En `ContentTab.tsx` se intenta verificar `phase.levels` directamente sobre objetos del tipo `PhaseMap`. Sin embargo, la interfaz `PhaseMap` solo define `modules` (los cuales contienen `levels`).
    *   *Ubicación*: [phaseMaps.ts#L15-L19](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/admin/phaseMaps.ts#L15-L19)
    *   *Efecto*: Errores TS2339 en `ContentTab.tsx`.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Agregar `levels?: LevelMap[];` de manera opcional en la interfaz `PhaseMap`.

---

### 📄 Archivo: `LogicaMath/frontend/components/admin/AdminPanel.tsx`

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Cuál es el rol de este archivo?
> 2. ¿Qué bugs de tipado tiene?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Rol
Componente que unifica y encapsula las distintas pestañas de administración (General, Pedagógica, Rendimiento, Contenido).

#### 2. Registro de Inconsistencias y Bugs Detectados
*   ❌ **BUG-FRONT-04: Props incorrectas en `PedagogyTab`** (Severidad: **Media** / Tipos)
    *   *Descripción*: El componente `PedagogyTab` está definido en `PedagogyTab.tsx` como `React.FC` sin aceptar props, pero en `AdminPanel.tsx` se invoca con `showConfirm={showConfirm} showAlert={showAlert}`.
    *   *Ubicación*: [AdminPanel.tsx#L224](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/admin/AdminPanel.tsx#L224)
    *   *Efecto*: Error TS2322 al compilar.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Remover los props innecesarios en la invocación de `PedagogyTab` dentro de `AdminPanel.tsx`, dado que la pestaña pedagógica no consume `showConfirm` ni `showAlert`.

---

### 📄 Archivo: `LogicaMath/frontend/components/fase2/Fase2GameScreen.tsx` y `Fase8GameScreen.tsx`

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Cuál es el rol de estos archivos?
> 2. ¿Qué bugs lógicos y de tipado presentan?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Rol
Son los componentes controladores de las pantallas de juego de las fases 2 y 8. Manejan la interacción, cronómetros y el envío de respuestas de los estudiantes al backend.

#### 2. Registro de Inconsistencias y Bugs Detectados
*   ❌ **BUG-FRONT-05: Estructura incompleta de `Fase2AnswerResult` en Skip** (Severidad: **Alta** / Tipos)
    *   *Descripción*: Al saltar una pregunta (`Skipped`), el estado del feedback asigna un objeto `resultado` al que le faltan campos obligatorios de la interfaz `Fase2AnswerResult` (tales como `bloque_completado`, `fase_completada`, `es_espejo`, etc.).
    *   *Ubicación*: [Fase2GameScreen.tsx#L1066](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/fase2/Fase2GameScreen.tsx#L1066)
    *   *Efecto*: Error de tipado TS2740.
*   ❌ **BUG-FRONT-06: Firma incorrecta del callback en botón de salto** (Severidad: **Media** / Tipos)
    *   *Descripción*: Se asocia el botón de saltar pregunta con `onClick={loadPregunta}`. Al hacer click, React pasa el evento como primer parámetro, lo cual causa conflicto ya que la firma espera `isFirstLoad?: boolean`.
    *   *Ubicación*: [Fase2GameScreen.tsx#L1541](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/fase2/Fase2GameScreen.tsx#L1541), [Fase8GameScreen.tsx#L1561](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/fase8/Fase8GameScreen.tsx#L1561)
    *   *Efecto*: Error TS2322.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Añadir todos los campos requeridos en el objeto literal de feedback resultado cuando es omitido.
*   Paso 2: Cambiar la llamada en onClick a una función anónima: `onClick={() => loadPregunta()}`.

---

### 📄 Archivos de UI (Varios): Errores de Tipado en Transiciones Framer Motion

> **❓ Pregunta al LLM (Q&A de Auditoría)**
> 1. ¿Por qué las transiciones de Framer Motion con `type: 'spring'` o `type: 'tween'` fallan en TypeScript?

#### 💡 Respuesta de la App (Análisis Técnico)

#### 1. Causa del Error
TypeScript infiere la propiedad `type: 'spring'` dentro de los objetos de animación como `type: string`. Framer Motion espera el tipo literal exacto (`'spring' | 'tween' | 'keyframes'`).

#### 2. Registro de Inconsistencias y Bugs Detectados
*   ❌ **BUG-FRONT-07: Tipo de animación incompatible** (Severidad: **Baja** / Tipos)
    *   *Ubicación*: `components/ProgressScreen.tsx`, `components/fase_generic/FaseGenericGameScreen.tsx`, `components/fase2/Fase2GameScreen.tsx`, `components/fase3/Fase3GameScreen.tsx`, `components/fase8/Fase8GameScreen.tsx`, `components/admin/GeneralTab.tsx`, entre otros.
    *   *Efecto*: Advertencias TS2322 que impiden compilar.

#### 5. Plan de Mitigación Recomendado
*   Paso 1: Declarar los objetos de variantes con el operador `as const` (ej. `const itemVariants = { ... } as const;`). Esto fuerza a TypeScript a inferir `'spring'` como un literal exacto de tipo y no como una cadena de texto genérica.

---

## 📅 Bug Tracker y Plan de Acción General

| ID Bug | Archivo | Gravedad | Estado | Descripción Corta | Plan de Acción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-FRONT-01** | `package.json` | **Crítica** | **Solucionado** | Falta de dependencias de tipos de React | Añadidos `@types/react` y `@types/react-dom` a devDependencies. |
| **BUG-FRONT-02** | `types.ts` | **Crítica** | Pendiente | Propiedades faltantes en `PedagogyConfig` | Añadir campos opcionales `passingScore`, `questionsPerPhase`, `useTimer` y `timers` a `PedagogyConfig`. |
| **BUG-FRONT-03** | `phaseMaps.ts` | **Alta** | Pendiente | Falta propiedad `levels` en tipo `PhaseMap` | Añadir `levels?: LevelMap[]` a la interfaz `PhaseMap`. |
| **BUG-FRONT-04** | `AdminPanel.tsx` | **Media** | Pendiente | Props inválidas pasadas a `PedagogyTab` | Quitar `showConfirm` y `showAlert` de la invocación de `PedagogyTab`. |
| **BUG-FRONT-05** | `Fase2GameScreen.tsx` | **Alta** | Pendiente | Objeto Skip carece de campos obligatorios | Rellenar campos faltantes de `Fase2AnswerResult` en el objeto feedback resultado. |
| **BUG-FRONT-06** | `Fase2/8GameScreen.tsx` | **Media** | Pendiente | Firma onClick incorrecta en botón Skip | Cambiar a callback anónimo `onClick={() => loadPregunta()}`. |
| **BUG-FRONT-07** | Múltiples `.tsx` | **Baja** | Pendiente | Incompatibilidad de tipo string en Framer Motion | Declarar objetos de variantes de animación usando `as const`. |
| **BUG-BACK-01** | `auth.py` | **Media** | Pendiente | settings inicial de niveles acoplado a Fase 1 | Adaptar la estructura de unlockedLevels para admitir "mixta" y operaciones de Fase 2-8. |
| **BUG-BACK-02** | `auth.py` | **Media** | Pendiente | Excepción en usuarios sin registro Alumno | Auto-crear perfil Alumno en `get_current_student` si no existe. |
| **BUG-BACK-03** | `auth.py` | **Baja** | Pendiente | Uso de `datetime.utcnow()` deprecado | Reemplazar por timezone-aware datetimes (`datetime.now(timezone.utc)`). |
