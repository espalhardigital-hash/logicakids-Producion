# Blueprint de Implementación para Futuras Fases — LogicaKids Pro

> Nota de autoridad documental: Este documento traduce el Documento Rector Conceptual a una guía técnica de implementación. En caso de conflicto, prevalece primero el Documento Rector Conceptual, luego este Blueprint Técnico, luego el Manual del Administrador y finalmente la Guía UX/UI.

---

## 1. Propósito del Blueprint

Este documento sirve como guía maestra y plantilla técnica para la replicación y creación estandarizada de futuras fases en LogicaKids Pro. La arquitectura de aprendizaje sigue un patrón repetitivo, robusto y altamente parametrizado: cualquier nueva fase debe implementarse respetando la estructura descrita aquí.

El backend es **Server-Authoritative**. El frontend no calcula aprobación, respuestas correctas, desbloqueos, errores, avance, Early Exit ni rescates. El frontend renderiza el estado que recibe del backend.

La fuente de verdad del progreso académico es `ProgresoMaestria`. El objeto `user.settings["unlockedLevels"]` existe únicamente como espejo de compatibilidad visual para componentes heredados del frontend. Ninguna decisión de aprobación, bloqueo, desbloqueo o avance debe depender exclusivamente de `user.settings`.

---

## 2. Arquitectura General de una Fase

Cada fase se divide en tres componentes pedagógicos principales:

1. **Teoría y Evocación:** Carrusel de aprendizaje, ejemplos guiados e interactivos obligatorios.
2. **Práctica Libre:** Entrenamiento con Bucle Espejo, Tutor Invisible y Bloque de Rescate.
3. **Zona de Desafíos:** Evaluación estricta con temporizador y Early Exit.

### 2.1. Práctica Libre (Entrenamiento sin Frustración)

La práctica libre está enfocada en el aprendizaje activo y paso a paso. No lleva temporizador (cronómetro) y no evalúa al alumno; busca que afiance el concepto microestructural. Utiliza la metodología de **Bucle Espejo** para corregir errores recurrentes de manera pedagógica y sin bloquear al estudiante:

* Si el alumno se equivoca en la pregunta original o variantes, el sistema **activa un Modal Emergente (Mirror Modal)** que pausa la interfaz de la batería de preguntas.
* En este modal se revela automáticamente la respuesta que era correcta de la pregunta fallida y se entrega la siguiente variante espejo para ser resuelta inmediatamente.
* El bucle tiene una tolerancia máxima de **3 variantes espejo consecutivas** dentro de este flujo emergente.
* Si se comete un error en la Variante Espejo 3 (4º error consecutivo de la familia), se activa la **Explicación Profunda** (Bloque de Rescate) dentro del mismo modal o un modal superior, y al cerrar, el alumno avanza a la siguiente familia de preguntas de forma fluida en la interfaz principal.
* Al cerrar el modal de preguntas espejo (ya sea por acierto o por agotamiento de variantes), la interfaz principal continúa con la secuencia normal de la batería de preguntas.

Cada nivel práctico debe tener:

* 120 familias de preguntas;
* cada familia con 1 pregunta original y 3 variantes espejo;
* explicación profunda obligatoria en el banco;
* mapeo heurístico de errores para el Tutor Invisible;
* completitud estándar de 100%;
* sin requisito de precisión mínima (la completitud al 100% de la batería asignada es el único requisito para avanzar y desbloquear la siguiente lección).

### 2.2. Zona de Desafíos

La zona de desafíos corresponde a niveles virtuales `11`, `12` y `13`.

* Desafío 1: opción múltiple, 25 preguntas, 25 segundos por pregunta, Early Exit al 3er error.
* Desafío 2: opción múltiple, 25 preguntas, 40 segundos por pregunta, Early Exit al 3er error.
* Desafío Final: evocación pura, 10 preguntas, 50 segundos por pregunta, Early Exit al 2do error.

Cada desafío debe contar con un mínimo de 150 preguntas independientes precargadas.

---

## 3. Paso 1: Definición del Modelo y Base de Datos (Pools Segmentados por Fase)

Para garantizar aislamiento absoluto de lógicas, rendimiento e independencia en el mantenimiento de contenidos, el sistema descarta el uso de tablas maestras globales y monolíticas para las preguntas. **Cada Fase `X` se mapea mediante su propio conjunto físico e independiente de tablas segmentadas**, prefijadas con el identificador de la fase (ej: `fase{X}_...`).

> Regla de identificación: La fuente semántica de ubicación es `fase_id`, `modulo_id`, `nivel_id` o `desafio_id`. El campo `seccion` es un código de compatibilidad, filtros rápidos y sincronización de progreso. Las tablas se nombran físicamente como `fase{X}_teoria_pool`, `fase{X}_practica_pool` y `fase{X}_desafios_pool`.

### 3.1. Modelo de Teoría y Evocación (`fase{X}_teoria_pool`)

Toda la carga teórica y los interactivos de evocación se gestionan mediante una entidad relacional dedicada para contenido pre-renderizado e independiente por fase.

Campos:

* `id`: UUID Primary Key.
* `fase_id`: ID de la fase.
* `modulo_id`: ID del módulo.
* `nivel_id`: ID del nivel.
* `titulo`: Nombre del concepto.
* `bienvenida_superpoder`: Párrafo introductorio.
* `cuerpo_teoria`: JSONB con términos clave y párrafos secuenciales.
* `trampa_advertencia`: Trampa común o tip pedagógico.
* `diccionario_nivel`: JSONB con traducción de términos narrativos a operadores matemáticos.
* `ejemplo_guiado`: JSONB de ejemplos resueltos paso a paso.
* `interactivos_desbloqueo`: JSONB de minipreguntas interactivas para evocación obligatoria (retos sin tiempo).
* `estado`: Estado del registro.

### 3.2. Modelo de Práctica Libre (`fase{X}_practica_pool`)

Tabla especializada en Bucle Espejo y asistencia del Tutor Invisible por fase.

Campos:

* `id`: UUID Primary Key.
* `fase_id`: ID de la fase.
* `modulo_id`: ID del módulo.
* `nivel_id`: ID del nivel.
* `seccion`: Código derivado calculado como `modulo_id * 100 + nivel_id`.
* `estructura_padre_id`: ID que agrupa una pregunta original con sus 3 variantes espejo.
* `operacion`: Tipo de operación matemática (`suma`, `resta`, `multiplicacion`, `division`, `mixta`).
* `enunciado_visual`: Texto, fórmula o estructura que lee el alumno.
* `respuesta_correcta`: Valor esperado almacenado como String.
* `explicacion_profunda`: Texto HTML/Markdown con resolución de rescate paso a paso.
* `datos_numericos`: JSONB con flags de control espejo.
* `modo_interaccion`: Enum de interfaz (`INPUT_NUMERICO`, `MULTIPLE_OPCION`, `SUBRAYADO_TOKENS`).
* `requiere_subrayado`: Booleano para indicar selección obligatoria de tokens.
* `tokens_texto`: JSONB nullable con tokens renderizables.
* `tokens_correctos`: JSONB nullable con IDs esperados.
* `estado`: Estado del registro.

Ejemplo de `tokens_texto`:

```json
[
  { "id": 1, "texto": "Lucas", "rol": "sujeto" },
  { "id": 2, "texto": "tiene 5 manzanas rojas", "rol": "dato_util" }
]
```

### 3.3. Modelo de Desafíos (`fase{X}_desafios_pool`)

Tabla desvinculada de la lógica de asistencia, diseñada para exámenes de alta intensidad con temporizador, aislada por fase.

Campos:

* `id`: UUID Primary Key.
* `fase_id`: ID de la fase.
* `modulo_id`: ID del módulo. Usar **modulo_id 99** para el Desafío Final de Maestría de la Fase completa.
* `desafio_id`: Identificador del desafío (`1`, `2` o `3`).
* `seccion`: Código derivado calculado como `modulo_id * 1000 + nivel_virtual`. Para el Desafío Final de Fase el código estándar es **99099**.
* `tipo_segmento`: Tipo de sección (`desafio_1`, `desafio_2`, `desafio_final`, `maestria_fase`).
* `tipo_pregunta`: Enum estricto (`MULTIPLE_OPCION` o `EVOCACION_PURA`). El Desafío Final (Módulo 99) debe ser siempre `EVOCACION_PURA`.
* `enunciado_visual`: Texto, fórmula o problema.
* `respuesta_correcta`: Valor esperado.
* `datos_numericos`: JSONB configuracional de tiempos y flags.
* `modo_interaccion`: Enum de interfaz cuando aplique.
* `requiere_subrayado`: Booleano cuando aplique.
* `tokens_texto`: JSONB nullable cuando aplique.
* `tokens_correctos`: JSONB nullable cuando aplique.
* `estado`: Estado del registro.

### 3.4. Tabla Auxiliar de Alternativas (`fase{X}_alternativas_desafios_pool`)

Para desafíos de opción múltiple, vinculada mediante clave foránea a `fase{X}_desafios_pool`.

Campos:

* `id`: UUID Primary Key.
* `desafio_id`: ForeignKey hacia `fase{X}_desafios_pool`.
* `texto`: Texto mostrado.
* `texto_opcion`: Campo espejo obligatorio para compatibilidad.
* `es_correcta`: Booleano interno.
* `orden`: Orden de presentación.
* `tipo_error`: Tipo de error asociado si la alternativa es incorrecta.

El frontend jamás debe recibir `es_correcta`.

### 3.5. Tabla Auxiliar de Errores (`fase{X}_respuestas_erroneas`)

Para el Tutor Invisible, vinculada mediante clave foránea a `fase{X}_practica_pool`.

Campos:

* `id`: UUID Primary Key.
* `pregunta_id`: ForeignKey hacia `fase{X}_practica_pool`.
* `mapeo_errores`: JSONB con respuestas incorrectas previstas, tipo de error y feedback específico.

Ejemplo:

```json
{
  "respuestas_erroneas": [
    {
      "valor": "22",
      "tipo_error": "problema_incompleto",
      "feedback": "Calculaste bien los gastos, pero falta restarlos del dinero inicial."
    }
  ]
}
```

### 3.6. Modelo de Progreso Estudiantil (`ProgresoMaestria`)

Esta tabla es la fuente única de verdad autoritativa para el avance y nivel de dominio del alumno en cada bloque (nivel de práctica o desafío virtual).

Campos obligatorios:

* `id`: UUID Primary Key.
* `alumno_id`: ForeignKey hacia `alumnos`.
* `fase_id`: ID de la fase.
* `modulo_id`: ID del módulo.
* `nivel_id`: ID del nivel (nullable si es progreso de un desafío).
* `desafio_id`: Identificador del desafío (nullable si es progreso de práctica libre).
* `completado`: Booleano. Indica si el alumno ha completado la batería mínima.
* `porcentaje_precision`: Float/Integer. Porcentaje real de precisión calculado sobre las respuestas correctas.
* `intentos_fallidos`: Integer. Contador de fallas acumuladas.
* `fallas_consecutivas_bucle`: Integer. Para control del Bucle Espejo (0 a 4).
* `desbloqueado`: Booleano. Indica si el bloque está accesible para el estudiante.
* **Campos de Override Administrativo Manual (Flexibilidad):**
  * `desbloqueado_por_admin`: Booleano. Por defecto `false`. Indica si fue liberado manualmente (`unlock`) por un tutor para permitir saltar prerrequisitos.
  * `aprobado_por_admin`: Booleano. Por defecto `false`. Indica si el bloque fue aprobado por decreto administrativo (`approve`).
  * `override_motivo`: String/Text nullable. Explicación/justificación pedagógica del override obligatoria para auditoría.
  * `override_fecha`: DateTime nullable. Fecha y hora UTC del registro del override.

---

## 4. Estándares Visuales y Motivacionales

Para reducir la carga cognitiva y aumentar la sensación de logro, toda transición, finalización y salida de flujos debe incorporar componentes visuales dinámicos de alta fidelidad.

### 4.1. Animaciones de Transición (Ready Screen)

Al finalizar el carrusel de teoría (Paso 3), antes de que el alumno inicie la práctica libre, la interfaz debe presentar una **Pantalla de Lanzamiento** que incluya:

* **Emoji Vectorial Animado:** Un icono representativo del avance (ej: 🚀 para Fase 2) con movimiento de flotación (y-axis) y rotación aleatoria suave.
* **Efecto de Celebración:** Partículas o destellos (✨) pulsantes para reforzar el éxito del aprendizaje teórico.
* **Botón de Acción Pulsante:** El botón final ("¡Entendido, empezar!") debe tener una animación de pulso (glow) y efectos de escala al pasar el mouse para incentivar el clic de inicio.

### 4.2. Modal de Salida Temprana (Early Exit Modal)
Ante una expulsión de la zona de desafíos, el frontend no debe cerrar la pantalla abruptamente. Debe seguir la siguiente directriz técnica:
* **Estructura del Componente:** Modal prioritario sobre `AnimatePresence` de `framer-motion`. Utiliza una tarjeta esmerilada con `glass-card` con un grosor de borde superior destacado de `6px solid #EF4444` (rojo neón de advertencia).
* **Elementos Visuales:** Icono representativo de escudo protector (`🛡️`) en tamaño destacado (`3.5rem` / `56px`), título en negrita (`fontWeight: 900`) y copia motivacional con emojis para inspirar resiliencia.
* **Acción de Cierre:** Botón principal de tamaño completo con un degradado en la tonalidad cromática del módulo (`moduleColor`) que llama a `onBack()` para liberar la sesión limpiamente.

### 4.3. Modal de Celebración de Logros (Completion Achievements Modal)
Al terminar exitosamente un nivel o desafío, el frontend debe suspender temporalmente el flujo y gatillar un modal interactivo que premie la persistencia:
* **Estructura:** Montado en un overlay prioritario (`zIndex: 1100`) con `AnimatePresence`. Tarjeta principal con borde superior de color del módulo actual (`6px solid ${moduleColor}`).
* **Efecto de Corona:** Un trofeo animado (`🏆`) con animaciones periódicas de rotación y escalamiento (`rotate: [0, -10, 10, -10, 10, 0]`, `scale: [1, 1.1, 1.1, 1]`) mediante variables de transición infinitas.
* **Grid de Logros:** Un contenedor flexible de 3 columnas para mostrar tarjetas secundarias (Aciertos, Precisión % y Puntos) con Lucide Icons (`Award`, `Target`, `Star`) de colores temáticos para jerarquía de información.
* **Caja de Recomendación Pedagógica:** Caja con fondo semi-transparente y borde izquierdo destacado que muestra una recomendación inteligente basada en el nivel actual para guiar al estudiante a su próximo paso didáctico.
* **Botón de Continuidad Dinámico:** Botón de confirmación destacado cuyo texto se calcula en caliente (ej: *"Ir al Nivel X+1 🚀"*, *"Siguiente Módulo 🚀"*) y que al pulsarse redirige de forma segura al dashboard.

### 4.4. Botones de Confirmación Inline Obligatorios
Todo tipo de interacción y pregunta (numérica, opción múltiple o pasos encadenados) debe contar con su botón de acción inline (`Confirmar` / `Continuar`) directamente integrado en la tarjeta de juego para consistencia táctil en móviles y tabletas:
* **Especificaciones del Botón:** Clase `.f2-submit-btn` con `display: flex; align-items: center; justify-content: center; width: 100%; border: none; cursor: pointer; transition: all 0.2s ease;`.
* **Micro-interacciones CSS:** Al pasar el cursor (`:hover`), el botón debe escalar suavemente (`transform: translateY(-2px)`), brillar (`filter: brightness(1.15)`) y proyectar una sombra suave (`box-shadow: 0 6px 20px rgba(0,0,0,0.3)`). Al presionarse (`:active`), debe retornar a su posición original (`transform: translateY(0)`). Si está deshabilitado (`:disabled`), se reduce su opacidad a `0.5` y cambia el cursor a `not-allowed`.

### 4.5. Pantalla Monumental de Graduación de Fase (Phase Graduation Modal)
Al completar exitosamente toda la fase (por ejemplo, superando la batería final de maestría de modulo 99), el frontend debe bloquear la pantalla y gatillar una interfaz conmemorativa espectacular:
* **Estructura Técnica:** Overlay prioritario (`zIndex: 1200`) a pantalla completa esmerilada (`rgba(7, 11, 20, 0.95)`). Tarjeta principal destacada con borde superior de color de éxito (`6px solid #10B981`) y una gran sombra exterior (`box-shadow: 0 0 40px rgba(16, 185, 129, 0.15)`).
* **Animaciones de la Corona:** Icono de corona real (`👑`) en tamaño monumental (`5rem` / `80px`) que ejecuta giros tridimensionales y escalados continuos periódicos mediante variables infinitas de Framer Motion.
* **Infografía de Ruta Conquistada:** Contenedor con borde tenue que dibuja una línea horizontal o vertical con gradiente de colores neón representando la pista vial de la fase. Cada parada o nodo del módulo se representa por su círculo de color correspondiente con una marca animada de chequeo (`✓`), sirviendo como recuento dinámico.
* **Estadísticas de Gran Impacto (Grid de 2x2):** Renderización en dos columnas de tarjetas de logros secundarios que muestran de forma estructurada con Lucide Icons (`Award`, `Trophy`, `Star`, `Target` en tamaño `36px` y colores de prioridad) las marcas históricas:
  * **Niveles Superados:** ej: `26 / 26`
  * **Módulos Dominados:** ej: `4 / 4`
  * **Ejercicios Logrados:** ej: `300+`
  * **Conceptos Clave:** ej: `12+`
* **Botón de Enlace de Fase:** Botón de acción con degradado y sombreado luminoso destacado que llama al redireccionamiento inmediato hacia el mapamundi general (`/map`), promoviendo el inicio de la siguiente fase académica desbloqueada.

---

## 5. Paso 2: Plantilla de Seeder (`seed.py`)

El archivo `seed.py` de la fase debe crearse en `app/fase{X}/seed.py` y estructurarse en secciones deterministas. Cualquier error durante la inserción no debe silenciarse. Los bloques `try/except` deben imprimir el traceback completo y relanzar la excepción para que el contenedor falle explícitamente.

### 4.1. Parte A: Textos de Teoría y Validación Estricta

Para asegurar que el formato de datos coincide al 100% con las columnas relacionales, el seeder debe validar cada elemento mediante Pydantic.

```python
import traceback
from pydantic import BaseModel
from typing import List, Dict, Any

class NivelTeoriaSeederSchema(BaseModel):
    fase_id: int
    modulo_id: int
    nivel_id: int
    titulo: str
    bienvenida_superpoder: str
    cuerpo_teoria: Dict[str, str]
    trampa_advertencia: str
    diccionario_nivel: Dict[str, str]
    ejemplo_guiado: List[Dict[str, Any]]
    interactivos_desbloqueo: List[Dict[str, Any]]

niveles_teoria = [
    {
        "fase_id": FASE_ID,
        "modulo_id": 1,
        "nivel_id": 1,
        "titulo": "Título de Aprendizaje",
        "bienvenida_superpoder": "Explicación introductoria del concepto...",
        "cuerpo_teoria": {
            "Concepto Clave": "Definición exacta del término matemático."
        },
        "trampa_advertencia": "Cuidado con esta trampa común.",
        "diccionario_nivel": {
            "El doble": "× 2",
            "El triple": "× 3"
        },
        "ejemplo_guiado": [
            {
                "enunciado": "Ejemplo práctico guiado",
                "pasos_resolucion": [
                    "Paso uno: identificar la operación.",
                    "Paso dos: resolver."
                ]
            }
        ],
        "interactivos_desbloqueo": [
            {
                "pregunta_id": "interactivo_fX_m1_l1_01",
                "enunciado": "¿Qué operación se resuelve primero en: 5 + 4 × 2?",
                "respuesta_correcta": "multiplicacion",
                "feedback_acierto": "¡Excelente!",
                "feedback_error": "Piénsalo mejor."
            }
        ]
    }
]

try:
    for data in niveles_teoria:
        objeto_validado = NivelTeoriaSeederSchema(**data)
        registro = NivelTeoriaPool(**objeto_validado.model_dump())
        session.add(registro)
    await session.commit()
except Exception as e:
    print(f"Error crítico durante el sembrado de Teoría en Fase {FASE_ID}: {str(e)}")
    traceback.print_exc()
    raise
```

### 4.2. Parte B: Configuración de Progreso

Crear registros en `configuraciones_progreso` para cada nivel práctico y desafío virtual.

```python
configs = []

# Prácticas libres
configs.append({
    "fase_id": FASE_ID,
    "modulo_id": modulo,
    "nivel_id": nivel,
    "desafio_id": None,
    "seccion": modulo * 100 + nivel,
    "operacion": "mixta",
    "cantidad_requerida": 15,
    "completitud_requerida": 100,
    "porcentaje_aprobacion": 90,
    "usa_cronometro": False,
    "tiempo_default_segundos": 0,
    "tipo_feedback": "detallado",
    "modo_tutoria": "bucle_espejo",
    "activo": True
})

# Desafío 1
configs.append({
    "fase_id": FASE_ID,
    "modulo_id": modulo,
    "nivel_id": None,
    "desafio_id": 1,
    "seccion": modulo * 1000 + 11,
    "operacion": "mixta",
    "cantidad_requerida": 25,
    "completitud_requerida": 100,
    "porcentaje_aprobacion": 90,
    "usa_cronometro": True,
    "tiempo_default_segundos": 25,
    "tipo_feedback": "simple",
    "modo_tutoria": "normal",
    "activo": True
})

# ... configs adicionales para Desafío 2 y Final ...
```

> Nota de Calibración de Datos: Las volumetrías (`cantidad_requerida`), estados de temporizador (`usa_cronometro`) y tiempos por pregunta (`tiempo_default_segundos`) inicializados en el seeder representan baselines de referencia estándar. La arquitectura del backend está diseñada de forma modular para consultar dinámicamente estos parámetros en cada inicio de sesión, permitiendo al superusuario calibrar los valores de forma transparente y asíncrona.

> Nota de implementación: Aunque los valores del seeder se inicializan con estándares pedagógicos, toda la lógica del backend debe consumir estos parámetros dinámicamente desde la base de datos y no de forma hardcoded.

### 4.3. Parte C: Generación de Pool de Práctica y Rescate

Cada nivel debe poseer 120 familias. Cada familia contiene 1 pregunta original y 3 variantes espejo.

```python
import random

for fam in range(1, 121):
    padre_id = f"f{FASE_ID}_m{modulo}_l{nivel}_fam_{fam:03d}"

    explicacion_html = (
        "Recuerda: primero resolvemos la operación prioritaria y luego continuamos.<br><br>"
        "<b>Ejemplo 1:</b> 5 + <span style='color:#FF4D4D'>4 × 2</span> = 13<br>"
        "<b>Ejemplo 2:</b> 3 + <span style='color:#FF4D4D'>2 × 3</span> = 9<br>"
        "<b>Ejemplo 3:</b> 6 + <span style='color:#FF4D4D'>3 × 2</span> = 12"
    )

    for var in range(4):
        es_espejo = var > 0
        seed = FASE_ID * 100000 + modulo * 1000 + nivel * 100 + fam * 10 + var
        rng = random.Random(seed)
        q_data = generator(rng, fam, es_espejo, var)

        pregunta = PracticaLibrePool(
            fase_id=FASE_ID,
            modulo_id=modulo,
            nivel_id=nivel,
            seccion=modulo * 100 + nivel,
            estructura_padre_id=padre_id,
            operacion=op,
            enunciado_visual=q_data["enunciado"],
            respuesta_correcta=str(q_data["respuesta_correcta"]),
            datos_numericos={
                "es_espejo": es_espejo,
                "variante": var,
                **q_data["valores"]
            },
            explicacion_profunda=explicacion_html,
            modo_interaccion="INPUT_NUMERICO",
            requiere_subrayado=False,
            tokens_texto=None,
            tokens_correctos=None,
            estado=StatusEnum.ACTIVO
        )
        session.add(pregunta)

        registro_errores = RespuestasErroneas(
            pregunta_id=pregunta.id,
            mapeo_errores={
                "respuestas_erroneas": [
                    {
                        "valor": str(int(q_data["respuesta_correcta"]) + 2),
                        "tipo_error": "calculo",
                        "feedback": "Revisa el orden de las operaciones antes de responder."
                    }
                ]
            }
        )
        session.add(registro_errores)
```

### 4.4. Parte D: Generación de Pool de Desafíos

Cada desafío debe tener mínimo 150 preguntas independientes.

```python
desafio = DesafiosPool(
    fase_id=FASE_ID,
    modulo_id=modulo,
    desafio_id=1,
    seccion=modulo * 1000 + 11,
    operacion="mixta",
    tipo_segmento="desafio_1",
    tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION,
    enunciado_visual=enunciado,
    respuesta_correcta=str(valor_correcto),
    datos_numericos={
        "es_desafio": True,
        "usa_cronometro": True,
        "tiempo_default_segundos": 25
    },
    modo_interaccion="MULTIPLE_OPCION",
    requiere_subrayado=False,
    tokens_texto=None,
    tokens_correctos=None,
    estado=StatusEnum.ACTIVO
)

for idx, opt in enumerate(shuffled_options):
    alt = AlternativasDesafiosPool(
        texto=opt["texto"],
        texto_opcion=opt["texto"],
        es_correcta=opt["es_correcta"],
        orden=idx + 1,
        tipo_error=TipoErrorEnum.CALCULO if not opt["es_correcta"] else None
    )
    desafio.alternativas.append(alt)

session.add(desafio)
```

---

## 5. Paso 3: Router del Backend (`router.py`)

Crear `app/fase{X}/router.py` heredando los endpoints estándar de FastAPI.

### 5.1. Endpoints Canónicos de Juego

Los endpoints de juego deben seguir esta convención:

```text
GET  /api/fases/{fase_id}/dashboard
GET  /api/fases/{fase_id}/pregunta
POST /api/fases/{fase_id}/responder
POST /api/fases/{fase_id}/cerrar-rescate
```

No usar endpoints sueltos como `/pregunta` o `/responder` sin prefijo de fase.

### 5.2. Optimización de Consultas de Base de Datos

Para evitar sobrecarga de consultas frecuentes, implementar sesión compartida:

* `get_current_user` debe realizar una única consulta que traiga `User` y `Alumno` usando `outerjoin(Alumno)`.
* La instancia de `Alumno` debe almacenarse en el contexto bajo la clave `"alumno_obj"`.
* Los métodos del router deben buscar primero esa propiedad antes de realizar nuevas consultas.

```python
async def _get_alumno(db: AsyncSession, current_user: dict) -> Alumno:
    alumno = current_user.get("alumno_obj")
    if alumno:
        return alumno
    # fallback query solo si no existe en contexto
```

### 5.3. `GET /api/fases/{fase_id}/dashboard`

Construye el árbol de progresión de la fase. Para determinar la disponibilidad y estado de cada bloque, el backend debe priorizar los campos de **Override Administrativo**:

1. **Lógica de Aprobación por Override (`aprobado_por_admin == true`):**
   * El backend omite el cálculo estándar de respuestas correctas e intentos.
   * Considera automáticamente el nivel/módulo como `APROBADO` con 100% de completitud y 90% de precisión simulada.
   * **Regla de Aprobación Retrógada (Retro-Approval):** Al estar este bloque aprobado, la base de datos ya habrá ejecutado la cascada hacia atrás, de modo que todos los bloques anteriores correspondientes a esta fase también se resuelven y retornan automáticamente con el estado `APROBADO`.
   * Retorna información adicional: `intervenido: true`, `override_motivo`, `override_fecha` y la firma del administrador.
   * Habilita automáticamente el desbloqueo del bloque siguiente en la cascada de progresión.
2. **Lógica de Desbloqueo por Override (`desbloqueado_por_admin == true`):**
   * El backend fuerza el estado del bloque a `EN_PROGRESO` (desbloqueado y activo), permitiendo al alumno consumirlo de inmediato. (Nota: Al desbloquearse de forma aislada, el administrador no forzó la aprobación retrospectiva, por lo que el alumno puede cursar este bloque saltando los precedentes bloqueados).
3. **Lógica de Avance Automático Estándar (si no hay override activo):**
   * El backend evalúa si el alumno cumple con las condiciones basadas en su desempeño según la etapa pedagógica:
     * **En Práctica Libre (Entrenamiento Antifrustración):**
       * El *único* requisito para habilitar el acceso al siguiente bloque es alcanzar la completitud requerida (`completitud_actual >= completitud_requerida`, es decir, 100%).
       * No se requiere alcanzar ningún umbral de precisión (`porcentaje_aprobacion`); la precisión real (`porcentaje_actual`) se registra en la base de datos de manera estadística y de diagnóstico para el Tutor IA, sin actuar jamás como un bloqueo de avance.
     * **En la Zona de Desafíos (Evaluación Estricta):**
       * El backend exige estrictamente el cumplimiento de ambas condiciones basadas en su desempeño:
         1. `completitud_requerida`: el alumno completó el 100% de la batería asignada del desafío.
         2. `precision_minima`: el alumno alcanzó el `porcentaje_aprobacion` (por defecto 90%).
       * Solo cuando ambas condiciones se cumplen sin haber provocado un `early_exit`, el backend habilita el acceso al siguiente bloque o desafíos en cascada.

### 5.4. `GET /api/fases/{fase_id}/pregunta`

Reglas:

* **Control de Hidratación y Recarga en Práctica:** Si es una batería de Práctica Libre (Etapa 2) y el backend detecta una recarga de página o reinicio de sesión activa, **reinicia el progreso de la práctica a 0**. El alumno debe contestar desde el inicio toda la batería de `cantidad_requerida` preguntas.
* Si no existe sesión activa, crea una sesión en blanco desde la base de datos.
* Si el último intento fue incorrecto, localiza el `estructura_padre_id`.
* Si `fallas_consecutivas_bucle < 4`, entrega la variante espejo correspondiente.
* Si no hay falla activa, entrega una nueva pregunta original.
* Nunca expone `respuesta_correcta` al frontend.
* **Integración del Cronómetro Dinámico:** El payload de retorno de la pregunta debe incluir obligatoriamente los campos de calibración `usa_cronometro` (bool) y `tiempo_limite_segundos` (int), resueltos dinámicamente a través de la cascada de configuración del servidor. Esto le da al cliente la instrucción exacta del valor de inicio del temporizador reactivo.

```python
if fallas_consecutivas_bucle < 4:
    # Entregar la variante espejo correspondiente
else:
    # El rescate debe haber sido activado desde /responder
```

### 5.5. `POST /api/fases/{fase_id}/responder`

Reglas de práctica libre:

* Evalúa la respuesta del alumno.
* Si es correcta, actualiza progreso, resetea `fallas_consecutivas_bucle = 0` y solicita una nueva familia de preguntas independiente.
* Si es incorrecta:
  * Incrementa `fallas_consecutivas_bucle`.
  * **Revelación Inmediata de Respuesta Correcta:** Si el contador es menor que 4, el backend retorna en su payload `es_correcta = false` junto con la clave `respuesta_correcta` (el valor esperado sanitizado) y el `feedback` del Tutor Invisible para que la UI los muestre inmediatamente.
  * Si el contador llega a 4 (Variante Espejo 3 errada), el backend retorna:
    ```json
    {
      "activar_rescate": true,
      "explicacion_profunda": "<html o markdown explicativo paso a paso y el porqué>",
      "requiere_transcripcion": false,
      "bypass_avance": true
    }
    ```
    (Nota: El cliente no forzará transcripción anti-spam. Al hacer clic en continuar, llamará a `/cerrar-rescate` el cual limpia el contador `fallas_consecutivas_bucle = 0` y avanza a la siguiente familia de preguntas).

Reglas de desafío:

* Evalúa la respuesta sin Bucle Espejo.
* Si expira el tiempo, computa error automáticamente y avanza a la siguiente pregunta tras un breve feedback visual.
* Ante una respuesta incorrecta, el sistema muestra feedback (rojo) por 1.5 segundos y realiza un **auto-avance fluido** a la siguiente pregunta para mantener el ritmo de evaluación.
* Si `errores_sesion >= max_errores`, retorna:

```json
{
  "early_exit": true
}
```

#### Regla Crítica de Sincronización Legacy y Segmentación Multicapa:
Ante cualquier evento que modifique el estado de progreso en `ProgresoMaestria` (ya sea por desempeño del alumno, override manual o por la cascada de aprobación retrógrada), el backend **debe sincronizar de forma inmediata** el estado en `user.settings["unlockedLevels"]`. 
* Para evitar colisiones visuales de progreso entre fases, la clave se almacena de forma segmentada namespaced por Phase ID (ej. `user.settings["unlockedLevels"]["fase1"] = 6`, `user.settings["unlockedLevels"]["fase2"] = 1`).
* En caso de **Aprobación Retrógada**, la sincronización debe actualizar en reversa todas las claves de las sub-fases anteriores en `user.settings["unlockedLevels"]` asignándoles el valor `6`.

#### Regla de Aprobación Retrógada (Retro-Approval Action):
Cuando el router procesa un override `approve` en la base de datos, inicia una transacción de base de datos que:
1. Pone el bloque solicitado en estado `APROBADO`, `aprobado_por_admin = true`.
2. Actualiza en reversa (`UPDATE progreso_maestria SET estado = 'APROBADO', completado = true, porcentaje_precision = 90 WHERE alumno_id = :alumno_id AND fase_id = :fase_id AND seccion < :seccion_actual`).
3. Sincroniza en reversa el objeto `user.settings["unlockedLevels"]` para todos los niveles correspondientes.

### 5.6. `POST /api/fases/{fase_id}/cerrar-rescate`

Endpoint invocado cuando el frontend confirma que el alumno leyó y asimiló la explicación del Bloque de Rescate para avanzar de forma fluida.

Reglas:

* **Sin Bloqueo de Transcripción:** Al haberse eliminado la transcripción anti-spam de la Práctica Libre, el frontend no envía ningún valor de texto transcrito en el payload; solo envía una confirmación de lectura y asimilación conceptual.
* Al recibir este cierre, el backend:
  * Registra en la bitácora de intentos que la familia de preguntas actual se completó a través de la vía de `"Bypass de Explicación"` (marcando este metadato en la base de datos para no distorsionar las analíticas cognitivas del Tutor IA).
  * Incrementa la barra de completitud de la práctica libre de manera ordinaria (100% de completitud para esta familia) para no frustrar al alumno.
  * Resetea el contador de fallas consecutivas a cero (`fallas_consecutivas_bucle = 0`).
  * Libera la siguiente familia de preguntas original de forma inmediata en el flujo de la sesión.

---

## 6. Paso 4: Integración del Frontend

### 6.1. Deduplicación de Peticiones Concurrentes

Para mitigar llamadas duplicadas por re-renderizados, implementar un despachador en servicios API.

```typescript
const activeRequests = new Map<string, Promise<any>>();

async function fetchDeduplicated<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const existing = activeRequests.get(key);
  if (existing) return existing;

  const promise = fetchFn().finally(() => {
    activeRequests.delete(key);
  });

  activeRequests.set(key, promise);
  return promise;
}
```

### 6.2. Consistencia de Tipos y Seguridad del Cliente

* El frontend debe determinar su layout exclusivamente a partir de `tipo_pregunta` y `modo_interaccion`.
* El frontend debe ignorar flags frágiles o redundantes en JSONB.
* El backend no debe enviar `es_correcta` en payloads de preguntas activas.
* El backend no debe enviar `respuesta_correcta` en la evaluación estándar de desafíos, pero en Práctica Libre **sí debe enviarla obligatoriamente** cuando el alumno cometa un error para permitir la revelación inmediata contiguous en pantalla.
* En preguntas tokenizadas, el frontend envía `tokens_seleccionados`, no texto crudo.

### 6.3. Componentes Obligatorios

* **Controlador del Cronómetro:** Si `usa_cronometro` es true, inicializa cuenta regresiva por pregunta.
* **Modal de Mirror (Preguntas Espejo):** Al recibir una pregunta con el flag `es_espejo: true` en la Práctica Libre, debe abrirse un modal que contenga la interfaz de respuesta, pausando la batería principal.
* **Modal de Early Exit:** Al recibir `early_exit = true`, interrumpe el flujo, muestra expulsión y redirige al dashboard (exclusivo de la Zona de Desafíos).
* **Modal de Rescate:** Al recibir `activar_rescate = true`, bloquea la pantalla y muestra `explicacion_profunda` junto con el botón prioritario de bypass `"¡Entendido, continuar!"` (exclusivo de Práctica Libre).
* **Sin Entrada de Texto Anti-Spam:** El modal de rescate **no debe renderizar campos de entrada de texto** ni exigir transcripciones para desbloquear el botón de continuación, asegurando un avance rápido y fluido.
* **Subrayado por Tokens:** En interacciones textuales, el frontend selecciona IDs de tokens.

---

## 7. Configuración de Servidor e Infraestructura

Para asegurar el ruteo correcto en una Single Page Application y evitar falsos fallbacks con estado 200 en recursos inexistentes:

```nginx
location ~ \.[a-zA-Z0-9]+$ {
    try_files $uri =404;
}
```

---

## 8. Checklist de Implementación

* [ ] Definir módulos, niveles y desafíos de la nueva fase.
* [ ] Crear migración SQL o Alembic.
* [ ] Crear `app/fase{X}/seed.py`.
* [ ] Validar teoría con Pydantic.
* [ ] Insertar `diccionario_nivel`.
* [ ] Crear configuraciones con `completitud_requerida`.
* [ ] Usar `tipo_feedback = "detallado"` y `modo_tutoria = "bucle_espejo"` para práctica.
* [ ] Generar exactamente 120 familias por nivel.
* [ ] Garantizar 1 original + 3 variantes espejo por familia.
* [ ] Insertar `explicacion_profunda`.
* [ ] Insertar mapeo de errores en `respuestas_erroneas`.
* [ ] Inyectar `modulo_id`, `nivel_id` y `desafio_id`.
* [ ] Generar mínimo 150 preguntas por desafío.
* [ ] Eliminar redundancias de interfaz en JSONB.
* [ ] Usar `tipo_pregunta` y `modo_interaccion` como fuente de verdad visual.
* [ ] Implementar `/api/fases/{fase_id}/dashboard`.
* [ ] Implementar `/api/fases/{fase_id}/pregunta`.
* [ ] Implementar `/api/fases/{fase_id}/responder`.
* [ ] Implementar `/api/fases/{fase_id}/cerrar-rescate`.
* [ ] Validar el flujo completo de 4 errores y rescate.
* [ ] Validar Early Exit por desafío.
* [ ] Validar que el frontend no recibe `es_correcta`.
* [ ] Validar que el frontend no calcula progreso.
* [ ] Validar preguntas tokenizadas con `tokens_texto` y `tokens_correctos`.
* [ ] Probar backend con `python -m py_compile`.
* [ ] Probar frontend con `npx tsc --noEmit`.
