# Reporte de Análisis de Bugs: LogicaMath

## 1. Endpoints (Backend)
### Falta de Manejo de Errores y Brechas de Validación
- **Fuga de Datos de Puntajes (auth_users.py):** El endpoint `GET /scores?user=<username>` tiene una lógica de autorización defectuosa. Si un usuario no administrador proporciona el parámetro `user`, la condición inicial falla, pero luego la función permite asignar `target_username = user`. Esto habilita a cualquier usuario registrado a leer los puntajes de cualquier otro usuario.
- **Brecha de Seguridad en Settings (auth_users.py):** El endpoint `save_user` permite a los usuarios estándar actualizar su propio campo `settings` sin ninguna validación de esquema en el payload. Esto les permite inyectar JSON arbitrario, alterar manualmente sus puntajes (`scores`) o desbloquear niveles de forma no autorizada.
- **Falta de Validación de Nulos (pedagogia.py):** En `graduate_to_fase1` y `get_dashboard`, se asume que la variable `alumno` no es `None` tras consultar la base de datos. Si el perfil pedagógico de un usuario no se creó correctamente y `alumno` es nulo, el acceso a atributos como `alumno.fase_actual_id` provocará un `AttributeError` (500 Internal Server Error).

### Bugs de Lógica y Async
- **Repetición de la Misma Pregunta (pedagogia.py):** En `get_dashboard`, la consulta a la base de datos para obtener `siguiente_pregunta` usa `.limit(1)` sin excluir las preguntas que ya fueron respondidas correctamente o sin utilizar aleatoriedad (`ORDER BY RANDOM()`). Esto provoca que el alumno reciba la misma pregunta repetidas veces.
- **Excepciones por Tipos Nulos (pedagogia.py):** En `responder_pregunta`, la validación de texto libre asume la existencia de strings válidos (`respuesta.respuesta_dada.strip().lower() == pregunta.respuesta_correcta.strip().lower()`). Si `respuesta_dada` es `None`, la ejecución del servidor fallará.

## 2. Lógica de Componentes (Frontend)
### Promesas no Controladas (Unhandled Rejections)
- **Fallas Silenciosas en Configuración (App.tsx):** La función `loadAdminConfig` llama a `await getAdminSettings()` pero no está envuelta en un bloque `try/catch`. Si la petición de red falla o el servidor retorna un error, se producirá un *unhandled promise rejection*.
- **Pérdida de Progreso sin Aviso (App.tsx):** Dentro de `handleEndGame`, las llamadas a `service.unlockLevel` y `service.graduateToFase1()` no capturan errores con `.catch()`. Si el guardado del nivel en el servidor falla, el error es ignorado silenciosamente y el estado del frontend queda desincronizado respecto a la base de datos.

### Condiciones de Carrera (Race Conditions) y Estados
- **Mutación Ilegal en Callbacks de React (GameScreen.tsx):** Dentro del `useEffect` del cronómetro, la función `handleTimeOut()` (que ejecuta side-effects de UI y despacha estados como `setFeedback`) es llamada directamente dentro de la función evaluadora del setter `setTimeLeft(prev => ...)`. Ejecutar lógica secundaria dentro de un actualizador de estado viola los principios de React; en Strict Mode se invocará dos veces, provocando que se dupliquen las sumas de respuestas incorrectas.

## 3. Integridad de Base de Datos y Tipos
### Inconsistencias de Mapeo Frontend/Backend
- **unlockedLevel vs unlocked_level:** El backend (`/users/me` a través de `auth.py`) expone el nivel del usuario bajo la clave `unlocked_level` (snake_case). En contraste, la interfaz TypeScript `User` en `frontend/types.ts` exige la propiedad `unlockedLevel`. Al resolver `getCurrentUserFull()`, el mapeo se rompe, causando que `currentUser.unlockedLevel` sea sistemáticamente `undefined`, lo cual afecta los bloqueos visuales en el frontend.

### Inconsistencia de Idioma en Enums
- **Ruptura entre Modelos Híbridos:** En `types.ts`, `GameCategory` define los campos en inglés (`addition`, `subtraction`, `multiplication`), los cuales se almacenan textualmente en el campo NoSQL `user.settings["scores"]`. Sin embargo, las tablas relacionales (`schema.sql` y `sql_models.py`) operan con el enumerador `operacion_enum` en español (`suma`, `resta`, `multiplicacion`). Esta desconexión impedirá unificar el historial de estadísticas de forma consistente.

### Fallas en Restricciones (Constraints)
- **Relaciones Opcionales Peligrosas:** En `schema.sql`, la columna `fase_actual_id` de la tabla `alumnos` carece de una restricción `NOT NULL`. La función `create_user` busca "Fase 0" en la BD al registrar un usuario y, si dicha fase todavía no ha sido inicializada (seeded), el ID de fase será asignado como `NULL`, rompiendo de forma permanente la carga de la ruta `/dashboard`.

## 4. Consistencia en Docker
### Mismatching en Entornos
- **Modo de Desarrollo en Imagen de Producción (backend/Dockerfile):** El comando de arranque `CMD` ejecuta Uvicorn junto con la flag `--reload`. El uso de watchfiles de recarga en caliente en un entorno de producción consume muchos más recursos e interfiere con la estabilidad del servidor.
- **Omisión de Explicitación de Puertos (docker-compose.yml):** Aunque el `Dockerfile` del backend expone el puerto `8000`, la configuración de Traefik en `docker-compose.yml` omite la etiqueta `traefik.http.services.<name>.loadbalancer.server.port=8000`. Si el contenedor expusiera múltiples puertos o cambiara el default, Traefik fallaría al no saber a qué canal redireccionar el tráfico HTTP entrante.
```
