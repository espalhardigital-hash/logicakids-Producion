Blueprint de Implementación para Futuras Fases — LogicaKids
Este documento sirve como guía maestra y plantilla técnica para la replicación y creación estandarizada de futuras fases en LogicaKids (Fase 3 en adelante). Dado que la arquitectura de aprendizaje sigue un patrón repetitivo altamente optimizado y robusto, cualquier nueva fase puede ser implementada siguiendo de forma precisa los pasos y la estructura descrita aquí.

1. Arquitectura General de una Fase
Cada fase se divide en dos componentes principales de juego:

Práctica Libre (Niveles 1 a N): Enfocada en el aprendizaje paso a paso, utilizando el Bucle Espejo (Mirror Loop) para corregir errores recurrentes a través de variaciones de preguntas con la misma estructura pero diferentes valores.
Zona de Desafíos (Niveles virtuales 11, 12, 13): Evaluaciones de alta intensidad, con cronómetro forzado y Salida Temprana (Early Exit) si el alumno acumula demasiados errores antes de completar la meta de aciertos.
Mermaid diagram
2. Paso 1: Definición del Modelo y Base de Datos
Las tablas del core del backend (preguntas, alternativas, progreso_maestria, intentos, configuracion_progreso) son completamente polimórficas y genéricas. No requieren modificaciones físicas en cada fase, excepto si se define un modelo de teoría específico.

Si se requiere extender o verificar la teoría:

Utilizar la tabla niveles_teoria_pool (definida en app/fase2/models.py o movida a app/models/sql_models.py en producción).
Estructura de NivelTeoria:
fase_id: ID numérico único de la fase.
modulo_id: ID del módulo.
nivel_id: ID del nivel.
titulo: Nombre del concepto.
texto_descubrimiento: Párrafo introductorio.
diccionario: JSON con términos clave y sus definiciones.
advertencia: Trampa común o tip pedagógico.
ejemplos: JSON de ejemplos resueltos.
interactivos: JSON de minipreguntas interactivas para teoría.
3. Paso 2: Plantilla de Seeder (seed.py)
El archivo seed.py de la fase debe crearse en app/fase{X}/seed.py y estructurarse en 5 secciones deterministas:

Parte A: Textos de Teoría
Inyectar un registro de NivelTeoria por cada nivel práctico de la fase.

python

# app/faseX/seed.py
niveles_teoria = [
    {
        "modulo_id": 1,
        "nivel_id": 1,
        "titulo": "Título de Aprendizaje",
        "texto_descubrimiento": "Explicación introductoria del concepto...",
        "diccionario": {
            "Concepto Clave": "Definición exacta."
        },
        "advertencia": "¡Cuidado con esta trampa común!",
        "ejemplos": [
            {
                "enunciado": "Ejemplo práctico guiado",
                "pasos": [
                    {"orden": 1, "texto": "Paso uno a realizar..."},
                    {"orden": 2, "texto": "Paso dos..."}
                ]
            }
        ],
        "interactivos": [
            {
                "pregunta": "Pregunta rápida de autoevaluación",
                "respuesta": "10",
                "feedback_acierto": "¡Muy bien!",
                "feedback_error": "Intenta recordar..."
            }
        ]
    }
]
Parte B: Configuración de Progreso
Crear registros en configuraciones_progreso para cada nivel práctico y desafío virtual.

python

# Mapeo de configuraciones
# Prácticas libres:
configs.append({
    "seccion": modulo * 100 + nivel,
    "operacion": "mixta", # o "suma"/"multiplicacion"
    "cantidad_requerida": 15,
    "porcentaje_aprobacion": 80,
    "usa_cronometro": False,
    "tiempo_default_segundos": 0,
    "tipo_feedback": "espejo"
})
# Desafíos (Virtuales 11, 12, 13):
configs.append({
    "seccion": modulo * 1000 + 11, # D1
    "operacion": "mixta",
    "cantidad_requerida": 25,
    "porcentaje_aprobacion": 90,
    "usa_cronometro": True,
    "tiempo_default_segundos": 25, # Tiempo por pregunta
    "tipo_feedback": "simple"
})
Parte C: Generación de Pool de Práctica (120 familias por nivel)
Cada nivel debe poseer 120 familias para evitar la memorización. Cada familia tiene 1 pregunta original (variante 0, es_espejo=False) y 3 espejos (variantes 1, 2, 3, es_espejo=True), compartiendo el mismo estructura_padre_id:

python

for fam in range(1, 121):
    padre_id = f"f{FASE_ID}_m{modulo}_l{nivel}_fam_{fam:03d}"
    for var in range(4):
        es_espejo = (var > 0)
        seed = FASE_ID * 100000 + modulo * 10000 + nivel * 1000 + fam * 10 + var
        rng = random.Random(seed)
        q_data = generator(rng, fam, es_espejo, var)
        
        pregunta = Pregunta(
            fase_id=FASE_ID,
            seccion=modulo * 100 + nivel,
            estructura_padre_id=padre_id,
            operacion=op,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado=q_data["enunciado"],
            respuesta_correcta=q_data["respuesta_correcta"],
            datos_numericos={"es_espejo": es_espejo, "variante": var, **q_data["valores"]},
            estado=StatusEnum.ACTIVO
        )
        session.add(pregunta)
Parte D: Generación de Pool de Desafíos (150 D1, 150 D2, 100 DFinal por módulo)
Generar las preguntas de desafío con opciones múltiples e inyección automática de alternativas para D1 y D2:

python

# Desafíos Opción Múltiple
pregunta = Pregunta(
    fase_id=FASE_ID,
    seccion=modulo * 1000 + 11,
    tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION,
    enunciado=enunciado,
    respuesta_correcta=val_correcto,
    datos_numericos={"es_desafio": True, "tipo_interfaz": "opcion_multiple"},
    estado=StatusEnum.ACTIVO
)
# Distractores
for idx, opt in enumerate(shuffled_options):
    alt = Alternativa(
        texto=opt["texto"],
        es_correcta=opt["es_correcta"],
        orden=idx + 1,
        tipo_error=TipoErrorEnum.CALCULO if not opt["es_correcta"] else None
    )
    pregunta.alternativas.append(alt)
4. Paso 3: Router del Backend (router.py)
Crear app/fase{X}/router.py heredando los endpoints estándar de FastAPI.

### Optimización de Consultas de Base de Datos (Muy Importante)
Para evitar la sobrecarga de consultas redundantes al motor de base de datos en peticiones HTTP frecuentes (por ejemplo, al renderizar el dashboard o al contestar preguntas), se debe implementar la optimización de sesión compartida:
- **Query Única con Outerjoin**: El middleware o método `get_current_user` en `auth.py` debe realizar una única consulta que traiga tanto el `User` como el `Alumno` usando un `outerjoin(Alumno)`.
- **Pre-carga en Contexto**: Almacenar la instancia del modelo de `Alumno` directamente en el diccionario de retorno de `get_current_user` bajo la clave `"alumno_obj"`.
- **Reutilización**: Los métodos internos de resolución del router (ej. `_get_alumno`) y controladores afines deben buscar primero esta propiedad pre-cargada. Solo en caso de que esté ausente realizarán una consulta individual a la base de datos:
  ```python
  async def _get_alumno(db: AsyncSession, current_user: dict) -> Alumno:
      alumno = current_user.get("alumno_obj")
      if alumno:
          return alumno
      # ... fallback query ...
  ```

Métodos Clave a Implementar:
_seccion_operacion(modulo_id, nivel_id): Mapea los IDs al formato de base de datos (modulo_id * 1000 + nivel_id para desafíos; modulo_id * 100 + nivel_id para prácticas).

GET /dashboard: Construye la lista de módulos, niveles y desafíos virtuales. Verifica si el alumno tiene aprobada la práctica para habilitar los desafíos en cascada.

python

# Verificación en Cascada de Desafíos
all_practice_approved = all(n.estado == "dominado" for n in niveles)
d1_unlocked = all_practice_approved
d2_unlocked = d1_unlocked and d1_approved
dfinal_unlocked = d2_unlocked and d2_approved
GET /lectura/{modulo_id}/{nivel_id}: Retorna el guion directamente de NivelTeoria filtrando por fase_id = X.

GET /pregunta (Bucle Espejo en Práctica):

Si el último intento del alumno fue incorrecto, obtiene la familia (estructura_padre_id) de esa pregunta.
Si lleva menos de MAX_ESPEJO intentos en esa familia, le sirve una pregunta del mismo estructura_padre_id con es_espejo: True que no haya respondido aún.
De lo contrario, selecciona aleatoriamente una nueva pregunta original de una familia no dominada.
POST /responder (Early Exit en Desafíos):

Si es desafío (nivel 11, 12 o 13), evalúa el histórico de intentos del bloque actual desde que empezó la sesión (donde el número de aciertos acumulados partió en 0).
Cuenta los fallos en la sesión actual.
Si errores_sesion >= max_errores (3 para D1/D2, 2 para DFinal):
Reset de progreso: Pone aciertos acumulados, intentos totales y porcentaje del bloque a 0.
Retorna early_exit = True.
De lo contrario, actualiza los aciertos y evalúa si aprueba el nivel al llegar al 100%.
POST /graduate: Exige que la cuenta de registros dominados en progreso_maestria para fase_id = X sea igual al total de niveles de la fase (ej: niveles_practica + desafios_virtuales).

5. Paso 4: Integración del Frontend (React/Vue/Flutter)
Al crear los componentes de la interfaz gráfica de la nueva fase:

### Deduplicación de Peticiones Concurrentes
Debido al comportamiento de re-renderizado / remount de componentes en librerías de UI como React, se pueden disparar múltiples peticiones API idénticas al mismo tiempo. Se debe implementar un deduplicador en la capa de servicios:
- Mantener un mapa de promesas activas: `Map<string, Promise<any>>`.
- Interceptar las peticiones `GET` (dashboard, lecturas, preguntas), sirviendo la promesa existente si ya hay una petición idéntica en vuelo y removiéndola una vez resuelta/fallida:
  ```typescript
  const activeRequests = new Map<string, Promise<any>>();
  async function fetchDeduplicated<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const existing = activeRequests.get(key);
    if (existing) return existing;
    const promise = fetchFn().finally(() => { activeRequests.delete(key); });
    activeRequests.set(key, promise);
    return promise;
  }
  ```

### Consistencia de Tipos y Seguridad del Cliente
- **No Exponer Datos Críticos**: Evitar incluir banderas del backend como `es_correcta` en el tipo de alternativa retornado al cliente (`Fase2AlternativaOut`).
- **Compatibilidad en Mock Mode**: Al programar tests o mocks offline (`MOCK_RESULTADO`), el código del frontend debe usar aserciones de tipo (`(alt as any).es_correcta`) o comparar strings con `pregunta.respuesta_correcta` para evitar fallas en el validador TypeScript (`tsc`).

### Definición Limpia de Animaciones (Framer Motion)
Para animaciones complejas (como teclados virtuales o transiciones de feedback):
- Evitar referencias a variables externas globales no declaradas.
- Declarar siempre los objetos de transición (ej. `keypadVariants`, `keyVariants`) dentro del mismo archivo del componente o importarlos de un módulo compartido para evitar fallas de compilación.

Consumo de Dashboard:

Mapear el grid usando el objeto modulos devuelto por el dashboard.
Renderizar los niveles de práctica en un contenedor (ej: 4 columnas).
Renderizar la Zona de Desafíos abajo, en tarjetas especiales con el badge de dificultad (estandar, avanzada, maestria).
Controlador del Cronómetro:

Si la propiedad usa_cronometro o tiene_cronometro viene en True, el frontend debe forzar una cuenta regresiva visual y enviar automáticamente un responder incorrecto por expiración de tiempo si llega a 0.
Visualización de Opción Múltiple:

Si la pregunta es de tipo multiple_opcion, renderizar la lista de alternativas mezcladas como botones. Ocultar la caja de texto numérica tradicional.
Modal de Early Exit:

Escuchar la respuesta del endpoint /responder. Si early_exit es True, pausar el flujo, mostrar un modal interactivo informando que se superó el límite de fallas toleradas, y devolver al alumno al Dashboard con su progreso restablecido a 0%.

6. Configuración de Servidor e Infraestructura (Nginx)
Para asegurar el correcto funcionamiento del ruteo en el Frontend (SPA) sin comprometer las respuestas de la API en archivos inexistentes:
- **Restricción de Fallback**: Añadir un bloque de localización en Nginx para interceptar peticiones a archivos con extensiones. Si un recurso estático, script, o recurso dinámico inexistente es solicitado, debe responder `404 Not Found` en lugar de caer en el fallback del `index.html` de la SPA con un estado `200 OK`:
  ```nginx
  # Return 404 for any missing file with an extension, avoiding SPA index.html fallback
  location ~ \.[a-zA-Z0-9]+$ {
      try_files $uri =404;
  }
  ```

7. Checklist de Implementación
 Definir el mapeo de módulos, niveles y desafíos de la Fase X.
 Crear el script de migración SQL o Alembic si hay nuevos modelos relacionales.
 Escribir app/faseX/seed.py inyectando teoría, configuraciones y los pools (práctica y desafíos).
 Escribir app/faseX/router.py con las reglas de Bucle Espejo, Early Exit y Dashboard.
 Implementar optimización de consulta única (`outerjoin` + `alumno_obj`) en la lógica de resolución de Alumno.
 Registrar las rutas en el archivo central de la aplicación (app/main.py).
 Crear las pantallas en el Frontend interactuando con los nuevos endpoints de /faseX.
 Integrar deduplicador de promesas concurrentes en los servicios del Frontend.
 Verificar que el servidor Nginx responde con `404` para extensiones no mapeadas.
 Verificar compilación local del backend (`python -m py_compile` o usando el Python de `venv`).
 Verificar que la compilación de TypeScript en Frontend se ejecute sin errores (`npx tsc --noEmit`).
 Correr pruebas automatizadas / funcionales de flujo completo.