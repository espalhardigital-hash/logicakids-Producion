Aquí tienes el archivo **`blueprint.md`** completamente actualizado.

Se han integrado todas las correcciones discutidas: la **nueva arquitectura de tres tablas independientes** (para alinear con el documento rector), la **inserción explícita de analíticas** (`modulo_id`, `nivel_id`), la **inyección del mapeo heurístico de errores** en el *Bucle Espejo* y la **eliminación de la redundancia** de `tipo_interfaz` en los desafíos para garantizar una única fuente de verdad.

Puedes copiar este bloque y reemplazar tu archivo `blueprint.md`:

```markdown
# Blueprint de Implementación para Futuras Fases — LogicaKids

Este documento sirve como guía maestra y plantilla técnica para la replicación y creación estandarizada de futuras fases en LogicaKids (Fase 3 en adelante). Dado que la arquitectura de aprendizaje sigue un patrón repetitivo altamente optimizado y robusto, cualquier nueva fase puede ser implementada siguiendo de forma precisa los pasos y la estructura descrita aquí.

## 1. Arquitectura General de una Fase

Cada fase se divide en dos componentes principales de juego:

* **Práctica Libre (Niveles 1 a N):** Enfocada en el aprendizaje paso a paso, utilizando el Bucle Espejo (Mirror Loop) para corregir errores recurrentes a través de variaciones de preguntas con la misma estructura pero diferentes valores.
* **Zona de Desafíos (Niveles virtuales 11, 12, 13):** Evaluaciones de alta intensidad, con cronómetro forzado y Salida Temprana (Early Exit) si el alumno acumula demasiados errores antes de completar la meta de aciertos.

---

## 2. Paso 1: Definición del Modelo y Base de Datos

Para garantizar el aislamiento de lógicas, el rendimiento y evitar campos nulos innecesarios, el sistema descarta el uso de una tabla maestra polimórfica única. El modelo de datos en cada fase se mapea mediante **tres tablas independientes**:

### 2.1. Modelo de Teoría (`niveles_teoria_pool`)
Toda la carga teórica se gestiona a través de la entidad relacional dedicada para contenido pre-renderizado:
* `id`: UUID Primary Key.
* `fase_id`, `modulo_id`, `nivel_id`: Claves de ubicación.
* `titulo`: Nombre del concepto.
* `bienvenida_superpoder`: Párrafo introductorio (narrativa y superpoder).
* `cuerpo_teoria`: JSONB con términos clave y párrafos secuenciales.
* `trampa_advertencia`: Trampa común o tip pedagógico.
* `diccionario_nivel`: JSONB con la traducción de términos narrativos a operadores matemáticos.
* `ejemplo_guiado`: JSONB de ejemplos resueltos paso a paso.
* `interactivos_desbloqueo`: JSONB de minipreguntas interactivas para evocación obligatoria.

### 2.2. Modelo de Práctica Libre (`practica_libre_pool`)
Tabla especializada en el Bucle Espejo. No maneja opciones múltiples y requiere siempre la explicación de rescate.
* `id`: UUID Primary Key.
* `fase_id`, `modulo_id`, `nivel_id`: Claves de ubicación (Obligatorias para analíticas).
* `seccion`: Código matemático de sección (modulo * 100 + nivel).
* `estructura_padre_id`: ID que agrupa una pregunta original con sus 3 variantes espejo.
* `operacion`: Tipo de operación matemática ('mixta', 'suma', 'multiplicacion', etc.).
* `enunciado_visual`: Texto o fórmula que lee el alumno.
* `respuesta_correcta`: Valor esperado (almacenado como String).
* `explicacion_profunda`: Texto HTML/Markdown con la resolución paso a paso y colores de énfasis para el Bloque de Rescate.
* `datos_numericos`: JSONB con flags de control espejo (`{"es_espejo": false, "variante": 0}`).

### 2.3. Modelo de Desafíos (`desafios_pool`)
Tabla desvinculada de la lógica pedagógica de asistencia, diseñada para exámenes de alta intensidad con temporizador.
* `id`: UUID Primary Key.
* `fase_id`, `modulo_id`, `desafio_id`: Claves de ubicación.
* `seccion`: Código matemático de sección (modulo * 1000 + 11/12/13).
* `tipo_segmento`: Tipo de sección ('desafio_1', 'desafio_2', 'desafio_final').
* `tipo_pregunta`: Enum estricto (`MULTIPLE_OPCION` o `EVOCACION_PURA`). Es la **única fuente de verdad** para la interfaz.
* `enunciado_visual` y `respuesta_correcta`.
* `datos_numericos`: JSONB configuracional de tiempos y booleanos.

---

## 3. Paso 2: Plantilla de Seeder (`seed.py`)

El archivo `seed.py` de la fase debe crearse en `app/fase{X}/seed.py` y estructurarse en secciones deterministas. Cualquier error durante la inserción (violaciones Not-Null o de clave foránea) no debe silenciarse; los bloques `try...except` deben imprimir el *traceback* completo y relanzar la excepción para que el contenedor de Docker falle explícitamente.

### Parte A: Textos de Teoría y Validación Estricta
Para asegurar que el formato de los datos en `seed.py` coincide al 100% con las columnas relacionales, el seeder debe parsear cada elemento a través de un esquema estricto de Pydantic.

```python
import traceback
from pydantic import BaseModel
from typing import List, Dict

class NivelTeoriaSeederSchema(BaseModel):
    fase_id: int
    modulo_id: int
    nivel_id: int
    titulo: str
    bienvenida_superpoder: str
    cuerpo_teoria: Dict[str, str]
    trampa_advertencia: str
    diccionario_nivel: Dict[str, str] # Obligatorio según Documento Rector
    ejemplo_guiado: List[Dict]
    interactivos_desbloqueo: List[Dict]

# Diccionario unificado con el Documento Rector
niveles_teoria = [
    {
        "fase_id": 1,
        "modulo_id": 1,
        "nivel_id": 1,
        "titulo": "Título de Aprendizaje",
        "bienvenida_superpoder": "Explicación introductoria del concepto y declaración de tu superpoder...",
        "cuerpo_teoria": {
            "Concepto Clave": "Definición exacta del término matemático dentro de la narrativa."
        },
        "trampa_advertencia": "¡Cuidado con esta trampa común! El Monstruo del Desorden te acecha si no respetas el orden.",
        "diccionario_nivel": {
            "El doble": "× 2",
            "El triple": "× 3"
        },
        "ejemplo_guiado": [
            {
                "enunciado": "Ejemplo práctico guiado número 1",
                "pasos_resolucion": [
                    "Paso uno: identificar el operador con mayor jerarquía.",
                    "Paso dos: resolver y sustituir."
                ]
            }
        ],
        "interactivos_desbloqueo": [
            {
                "pregunta_id": "interactivo_fX_m1_l1_01",
                "enunciado": "¿Qué operación se resuelve primero en: 5 + 4 × 2?",
                "respuesta_correcta": "multiplicacion",
                "feedback_acierto": "¡Excelente! La multiplicación manda.",
                "feedback_error": "¡Piénsalo mejor! Recuerda que la multiplicación tiene el escudo de oro."
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
    print(f"Error crítico durante el sembrado de Teoría en Fase X: {str(e)}")
    traceback.print_exc()
    raise

```

### Parte B: Configuración de Progreso

Crear registros en `configuraciones_progreso` para cada nivel práctico y desafío virtual.

```python
# Mapeo de configuraciones
configs = []

# Prácticas libres:
configs.append({
    "seccion": modulo * 100 + nivel,
    "operacion": "mixta", 
    "cantidad_requerida": 15,
    "porcentaje_aprobacion": 90, # 90% requerido por regla universal
    "usa_cronometro": False,
    "tiempo_default_segundos": 0,
    "tipo_feedback": "espejo"
})

# Desafíos (Virtuales 11, 12, 13):
configs.append({
    "seccion": modulo * 1000 + 11, # Desafío 1
    "operacion": "mixta",
    "cantidad_requerida": 25,
    "porcentaje_aprobacion": 90,
    "usa_cronometro": True,
    "tiempo_default_segundos": 25, # Segundos por pregunta
    "tipo_feedback": "simple"
})

```
> ⚠️ **Nota de Implementación para el Desarrollador:**
> Aunque los valores del seeder se inicializan con los estándares de la plataforma (ej. `porcentaje_aprobacion: 90` o `tiempo_default_segundos: 25`), toda la lógica del backend (calculadores de temporizador, validadores de aciertos y triggers de *Early Exit*) debe consumir estos parámetros **dinámicamente desde la base de datos** en cada petición y no de forma estática (hardcoded). El modelo debe permitir la edición libre de estos campos desde el panel administrativo, garantizando que el sistema sea completamente dirigido por datos (*Data-Driven*).

### Parte C: Generación de Pool de Práctica y Bloque de Rescate

Cada nivel debe poseer obligatoriamente **120 familias** para evitar la memorización. Cada familia tiene 1 pregunta original (variante 0) y 3 espejos. Es obligatorio popular el campo `explicacion_profunda` y agregar su respectivo mapeo de heurística de errores en la tabla adjunta.

```python
import random

for fam in range(1, 121):
    padre_id = f"f{FASE_ID}_m{modulo}_l{nivel}_fam_{fam:03d}"
    
    # Explicación estructurada con etiquetas HTML de colores para énfasis visual
    explicacion_html = (
        f"Recuerda: Primero resolvemos la <b>multiplicación</b> "
        f"(marcada en <span style='color:#FF4D4D'>rojo</span>) y luego sumamos.<br><br>"
        f"<b>Ejemplo 1:</b> 5 + <span style='color:#FF4D4D'>4 × 2</span> ➔ 5 + <span style='color:#FF4D4D'>8</span> = 13<br>"
        f"<b>Ejemplo 2:</b> 3 + <span style='color:#FF4D4D'>2 × 3</span> ➔ 3 + <span style='color:#FF4D4D'>6</span> = 9"
    )

    for var in range(4):
        es_espejo = (var > 0)
        seed = FASE_ID * 100000 + modulo * 1000 + nivel * 100 + fam * 10 + var
        rng = random.Random(seed)
        q_data = generator(rng, fam, es_espejo, var)
        
        pregunta = PracticaLibrePool(
            fase_id=FASE_ID,
            modulo_id=modulo,     # Analítica Obligatoria
            nivel_id=nivel,       # Analítica Obligatoria
            seccion=modulo * 100 + nivel,
            estructura_padre_id=padre_id,
            operacion=op,
            enunciado_visual=q_data["enunciado"],
            respuesta_correcta=q_data["respuesta_correcta"],
            datos_numericos={"es_espejo": es_espejo, "variante": var, **q_data["valores"]},
            explicacion_profunda=explicacion_html,
            estado=StatusEnum.ACTIVO
        )
        session.add(pregunta)

        # Inyección del mapeo heurístico de errores asociado a la pregunta para el Tutor Invisible
        mapeo_errores_data = {
            "respuestas_erroneas": [
                {
                    "valor": str(int(q_data["respuesta_correcta"]) + 2), # Valor de ejemplo dependiente del generador
                    "tipo_error": "falla_jerarquia",
                    "feedback": "¡Cuidado! Recuerda que la multiplicación se resuelve primero."
                }
            ]
        }
        registro_errores = RespuestasErroneas(
            pregunta_id=pregunta.id,
            mapeo_errores=mapeo_errores_data
        )
        session.add(registro_errores)

```

### Parte D: Generación de Pool de Desafíos

Generar las preguntas de desafío inyectando alternativas y validando que el Enum sea el único director del frontend (evitando redundancias en el JSONB). Se exige un mínimo de **150 preguntas por desafío**.

```python
# Desafíos Opción Múltiple (Tabla Exclusiva de Desafíos)
desafio = DesafiosPool(
    fase_id=FASE_ID,
    modulo_id=modulo,         # Analítica Obligatoria
    desafio_id=1,             # Identificador del desafío (1, 2 o 3)
    seccion=modulo * 1000 + 11,
    operacion="mixta",
    tipo_segmento="desafio_1",
    tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, # Única fuente de verdad para la interfaz visual
    enunciado_visual=enunciado,
    respuesta_correcta=val_correcto,
    # CORRECCIÓN: Se eliminó tipo_interfaz del JSONB para mantener un modelo fuertemente tipado
    datos_numericos={"es_desafio": True, "usa_cronometro": True},
    estado=StatusEnum.ACTIVO
)

for idx, opt in enumerate(shuffled_options):
    alt = AlternativasDesafiosPool(
        texto=opt["texto"],
        texto_opcion=opt["texto"],  # Sincronización obligatoria para evitar IntegrityError
        es_correcta=opt["es_correcta"],
        orden=idx + 1,
        tipo_error=TipoErrorEnum.CALCULO if not opt["es_correcta"] else None
    )
    desafio.alternativas.append(alt)
session.add(desafio)

```

---

## 4. Paso 3: Router del Backend (`router.py`)

Crear `app/fase{X}/router.py` heredando los endpoints estándar de FastAPI.

### 4.1. Optimización de Consultas de Base de Datos

Para evitar sobrecarga de consultas en peticiones frecuentes, se debe implementar la optimización de sesión compartida:

* **Query Única con Outerjoin:** El middleware `get_current_user` en `auth.py` debe realizar una única consulta que traiga tanto el `User` como el `Alumno` usando `outerjoin(Alumno)`.
* **Pre-carga en Contexto:** Almacenar la instancia del modelo de `Alumno` en el diccionario bajo la clave `"alumno_obj"`.
* **Reutilización:** Los métodos del router deben buscar primero esta propiedad pre-cargada antes de realizar consultas individuales:

```python
async def _get_alumno(db: AsyncSession, current_user: dict) -> Alumno:
    alumno = current_user.get("alumno_obj")
    if alumno:
        return alumno
    # ... fallback query ...

```

### 4.2. Endpoints y Lógica del Bucle Espejo y Rescate (Práctica)

* **GET /dashboard:** Construye el árbol de progresión. Verifica si la práctica libre está aprobada al 100% conceptual para habilitar el acceso a los desafíos en cascada.
* **GET /pregunta:** * Si el último intento fue incorrecto, localiza el `estructura_padre_id`.
* Sirve secuencialmente la siguiente variante espejo (`es_espejo: True`) disponible en el pool verificando el límite:



```python
# Corrección para evitar el error "Limbo" antes del Rescate Pedagógico
# Antes:
# if fallas_consecutivas_bucle < 3:

# Después:
if fallas_consecutivas_bucle < 4:
    # Entregar la variante espejo correspondiente

```

* **POST /responder:**
* Evalúa la respuesta del alumno. Si es incorrecta y se encuentra en Práctica Libre, incrementa `fallas_consecutivas_bucle`.
* **Activación del Rescate (4ta Falla Consecutiva):** Si el contador llega a `4` (falla la pregunta original y sus 3 variantes espejo), el backend **NO** salta a otra pregunta ni penaliza restando progreso. El servidor debe retornar inmediatamente el payload: `{"activar_rescate": true, "explicacion_profunda": pregunta.explicacion_profunda}`.


* **POST /cerrar-rescate:**
* Endpoint invocado cuando el frontend confirma que el alumno leyó la explicación y **transcribió la respuesta correcta**. El payload debe incluir el valor transcrito para que el backend lo valide contra la base de datos. Solo si la transcripción es correcta, el servidor fuerza el estado de la pregunta a **completada con éxito**, incrementa la barra de progreso del alumno, resetea `fallas_consecutivas_bucle = 0` y libera una familia original de preguntas completamente nueva.



### 4.3. Lógica de Evaluación (Early Exit en Desafíos)

* **POST /responder (Zonas de Desafío):**
* Evalúa el histórico de la sesión actual de examen.
* Si `errores_sesion >= max_errores` (3 para Desafío 1 y 2; 2 para Desafío Final), el backend ejecuta inmediatamente la expulsión automática: destruye el progreso acumulado de la sesión, lo resetea a `0` y retorna `{"early_exit": true}`.



---

## 5. Paso 4: Integración del Frontend (React/Vue/Flutter)

Al crear los componentes de la interfaz gráfica de la nueva fase:

### 5.1. Deduplicación de Peticiones Concurrentes

Para mitigar re-renderizados accidentales de componentes que gatillan llamadas duplicadas, implementar un despachador en la capa de servicios API:

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

### 5.2. Consistencia de Tipos y Seguridad del Cliente

* **Lectura de Interfaz desde SSOT:** El frontend debe determinar su layout de componentes basándose **exclusivamente** en el Enum `tipo_pregunta` (`MULTIPLE_OPCION` o `EVOCACION_PURA`), ignorando flags desestructuradas en los JSONB para evitar dependencias frágiles.
* **No Exponer Datos Críticos:** Evitar incluir banderas del backend como `es_correcta` en el JSON enviado al cliente.
* **Animaciones (Framer Motion):** Declarar siempre los objetos de transición (ej. `keypadVariants`) dentro del mismo archivo del componente para mitigar fallas en la compilación estática.

### 5.3. Componentes de Interfaz Obligatorios

* **Controlador del Cronómetro:** Si `usa_cronometro` es True (Desafíos), el frontend inicializa la cuenta regresiva visual por pregunta (25s, 40s o 50s). Al llegar a 0, envía de forma automática una petición `/responder` con valor vacío para computar el error por expiración.
* **Modal de Early Exit:** Al recibir del backend `early_exit = true`, interrumpe el flujo, muestra la animación de expulsión informando que se superó el límite de fallas toleradas y redirige al alumno al Dashboard con su progreso en 0%.
* **Ventana Emergente de Rescate Pedagógico (Filosofía Antifrustración y Anti-Spam):**
* **Interrupción Prioritaria:** Al recibir `activar_rescate: true` en el payload de `/responder`, el frontend debe renderizar de inmediato una ventana emergente propia (Modal Overlay) bloqueando cualquier otra interacción en pantalla.
* **Renderizado de Énfasis:** Debe inyectar el campo `explicacion_profunda` interpretando el código HTML, asegurando que se visualicen los textos resaltados.
* **Candado Anti-Spam:** Debajo de la explicación, el modal **debe incluir un cuadro de texto (`input`)** que le exija al alumno transcribir la respuesta final mostrada en los ejemplos. El botón de continuidad debe estar deshabilitado hasta que se ingrese un valor.
* **Botón de Continuidad:** Al presionar "¡Entendido, sigamos!", el frontend despacha la petición con el valor transcrito al endpoint `/cerrar-rescate`. Tras el éxito, desvanece el modal, anima la barra de progreso hacia adelante de forma visible y solicita la siguiente pregunta original.



---

## 6. Configuración de Servidor e Infraestructura (Nginx)

Para asegurar el correcto funcionamiento del ruteo en la Single Page Application (SPA) evitando falsos fallbacks con estado 200 en recursos inexistentes:

```nginx
# Return 404 for any missing file with an extension, avoiding SPA index.html fallback
location ~ \.[a-zA-Z0-9]+$ {
    try_files $uri =404;
}

```

---

## 7. Checklist de Implementación

* [ ] Definir el mapeo de módulos, niveles y desafíos de la nueva Fase adaptados a la estructura de 3 tablas independientes.
* [ ] Crear el script de migración SQL o Alembic en la base de datos PostgreSQL.
* [ ] Escribir `app/faseX/seed.py` aplicando el esquema de validación Pydantic de la teoría.
* [ ] Asegurar la inyección del campo `explicacion_profunda` con formato HTML en las estrictas 120 familias de la Práctica Libre.
* [ ] **Mapeo de Errores (JSONB):** Asegurar la inserción en la tabla de heurística para habilitar al Tutor Invisible tras un fallo.
* [ ] **Inyección de Analíticas:** Garantizar que los modelos instancian explícitamente `modulo_id`, `nivel_id` y `desafio_id` durante el seeder.
* [ ] **Única Fuente de Verdad (SSOT):** Eliminar redundancias estructurales en el JSONB; asegurar que el Enum `tipo_pregunta` dicte el frontend.
* [ ] Garantizar que los errores de clave o nulos en el seeder no se silencien (relanzar excepciones).
* [ ] Implementar en `router.py` los endpoints `/pregunta` y `/responder` con soporte al Bucle Espejo (límite < 4).
* [ ] Escribir la ruta `/cerrar-rescate` para aplicar el avance garantizado antifrustración a la 4ta falla.
* [ ] Configurar las reglas de aborto fulminante (*Early Exit*) en las Zonas de Desafíos (sembradas con un mínimo de 150 preguntas base).
* [ ] Aplicar la optimización de consulta única (`outerjoin` + `alumno_obj`) en la autenticación del router.
* [ ] Desarrollar en el Frontend el componente de Ventana Emergente (Modal Overlay) de Rescate que interprete las etiquetas HTML de color.
* [ ] Integrar el módulo de deduplicación de promesas concurrentes en los servicios de fetching.
* [ ] Probar la compilación limpia del backend con `python -m py_compile`.
* [ ] Validar la compilación estricta de TypeScript mediante `npx tsc --noEmit`.
* [ ] Ejecutar una prueba de estrés simulando 4 errores intencionales en una familia para verificar el flujo completo de rescate, cierre y avance.
* [ ] Añadir `diccionario_nivel` al esquema de validación Pydantic y asegurar su inserción en el `seed.py`.
* [ ] Validar que el Modal de Rescate en el frontend exija transcribir la respuesta (Anti-Spam) antes de llamar a `/cerrar-rescate`.
* [ ] Asegurar la inyección redundante de `texto` en `texto_opcion` dentro del modelo de Alternativas para evitar fallos de integridad SQL.

```

```