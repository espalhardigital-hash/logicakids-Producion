import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select, delete

from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.sql_models import (
    User,
    Fase,
    Alumno,
    Pregunta,
    Alternativa,
    ConfiguracionProgreso,
    ProgresoMaestria,
    PlatformSettings,
    StatusEnum,
    OperacionEnum,
    TipoPreguntaEnum,
    TipoErrorEnum,
)
from app.auth import get_password_hash

# ============================================================
# DATOS: PLATFORM SETTINGS (Pedagogy Config)
# ============================================================
SEED_VERSIONS_KEY = "database_seed_versions"
SEED_VERSIONS = {
    "fase_1": "20260601_v1",
    "fase_2": "20260609_v2",
    "fase_3": "20260609_v1",
    "fase_4": "20260609_v1",
    "fase_5": "20260609_v1",
    "fase_6": "20260609_v1",
    "fase_7": "20260609_v1",
    "fase_8": "20260609_v1",
    "fase_9": "20260609_v1"
}

PEDAGOGY_CONFIG_KEY = "pedagogy_config"
DEFAULT_PEDAGOGY_CONFIG = {
    "questionsPerPhase": 50,
    "timers": {
        "easy": 10,
        "easy_medium": 12,
        "medium": 18,
        "medium_hard": 22,
        "hard": 25,
    },
    "useTimer": True,
    "passingScore": 90,
}

# ============================================================
# DATOS: FASES (Viaje Matemático)
# ============================================================
FASES_DATA = [
    {
        "id": 0,
        "nombre": "Operaciones Elementales",
        "descripcion": "Fase inicial: Sumas y restas básicas para calentar motores.",
        "orden": 0,
    },
    {
        "id": 1,
        "nombre": "Aritmética Básica",
        "descripcion": "Sumas, restas, multiplicaciones y divisiones. ¡Calentamiento mental!",
        "orden": 1,
    },
    {
        "id": 2,
        "nombre": "Desarrollo Numérico y Razonamiento",
        "descripcion": "Pasar del cálculo puramente mecánico al pensamiento numérico estructurado y abstracto.",
        "orden": 2,
    },
    {
        "id": 3,
        "nombre": "Problemas de Texto y Sistemas Simples",
        "descripcion": "Entrenar el formato de examen: leer, filtrar distractores narrativos, deducir sistemas lógicos y aplicar ciclos (MCM/MCD).",
        "orden": 3,
    },
    {
        "id": 4,
        "nombre": "Fracciones, Porcentajes y Proporciones",
        "descripcion": "Romper el pensamiento del número entero; dominar relaciones relacionales complejas de forma visual y análisis estadístico.",
        "orden": 4,
    },
    {
        "id": 5,
        "nombre": "Geometría Plana y Medidas",
        "descripcion": "Desarrollar la comprensión del espacio bidimensional mediante el análisis visual y la conservación de la superficie.",
        "orden": 5,
    },
    {
        "id": 6,
        "nombre": "Geometría Espacial, Volumen y Magnitudes Físicas",
        "descripcion": "Desarrollar la visualización tridimensional, el razonamiento abstracto analítico y la medición de magnitudes.",
        "orden": 6,
    },
    {
        "id": 7,
        "nombre": "Coordenadas, Rutas y Tiempo",
        "descripcion": "Dominar la orientación en un plano de referencia, la vectorización del movimiento y la aritmética del tiempo.",
        "orden": 7,
    },
    {
        "id": 8,
        "nombre": "Lógica, Combinatoria y Probabilidad",
        "descripcion": "Desarrollar el razonamiento abstracto puro, el análisis combinatorio primario y el cálculo de posibilidades.",
        "orden": 8,
    },
    {
        "id": 9,
        "nombre": "Simulados Pedro II",
        "descripcion": "Entrenar en las condiciones formales, el formato, los límites de tiempo y la variedad de temas del examen real Pedro II.",
        "orden": 9,
    },
]

CONFIGURACION_DATA = []

# Suma: seccion 101 a 105
for lvl in range(1, 6):
    time_limit = {1: 15, 2: 15, 3: 20, 4: 25, 5: 30}[lvl]
    CONFIGURACION_DATA.append({
        "fase_id": 1, "seccion": 100 + lvl, "operacion": OperacionEnum.SUMA,
        "cantidad_requerida": 15, "porcentaje_aprobacion": 90,
        "orden_desbloqueo": lvl, "tipo_feedback": "simple",
        "usa_cronometro": True, "tiempo_default_segundos": time_limit
    })

# Resta: seccion 201 a 205
for lvl in range(1, 6):
    time_limit = {1: 15, 2: 15, 3: 20, 4: 25, 5: 30}[lvl]
    CONFIGURACION_DATA.append({
        "fase_id": 1, "seccion": 200 + lvl, "operacion": OperacionEnum.RESTA,
        "cantidad_requerida": 15, "porcentaje_aprobacion": 90,
        "orden_desbloqueo": lvl, "tipo_feedback": "simple",
        "usa_cronometro": True, "tiempo_default_segundos": time_limit
    })

# Multiplicación: seccion 301 a 306
for lvl in range(1, 7):
    time_limit = {1: 15, 2: 15, 3: 20, 4: 25, 5: 30, 6: 20}[lvl]
    CONFIGURACION_DATA.append({
        "fase_id": 1, "seccion": 300 + lvl, "operacion": OperacionEnum.MULTIPLICACION,
        "cantidad_requerida": 15, "porcentaje_aprobacion": 90,
        "orden_desbloqueo": lvl, "tipo_feedback": "simple",
        "usa_cronometro": True, "tiempo_default_segundos": time_limit
    })

# División: seccion 401 a 405
for lvl in range(1, 6):
    time_limit = {1: 15, 2: 15, 3: 20, 4: 25, 5: 30}[lvl]
    CONFIGURACION_DATA.append({
        "fase_id": 1, "seccion": 400 + lvl, "operacion": OperacionEnum.DIVISION,
        "cantidad_requerida": 15, "porcentaje_aprobacion": 90,
        "orden_desbloqueo": lvl, "tipo_feedback": "simple",
        "usa_cronometro": True, "tiempo_default_segundos": time_limit
    })

# Agregar también las configuraciones legacy seccion = 1 para compatibilidad/fallback
CONFIGURACION_DATA.extend([
    {"fase_id": 1, "seccion": 1, "operacion": OperacionEnum.SUMA,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 1, "tipo_feedback": "simple",
     "usa_cronometro": True, "tiempo_default_segundos": 14},
    {"fase_id": 1, "seccion": 1, "operacion": OperacionEnum.RESTA,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 2, "tipo_feedback": "simple",
     "usa_cronometro": True, "tiempo_default_segundos": 14},
    {"fase_id": 1, "seccion": 1, "operacion": OperacionEnum.MULTIPLICACION,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 3, "tipo_feedback": "simple",
     "usa_cronometro": True, "tiempo_default_segundos": 14},
    {"fase_id": 1, "seccion": 1, "operacion": OperacionEnum.DIVISION,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 4, "tipo_feedback": "simple",
     "usa_cronometro": True, "tiempo_default_segundos": 14},
])

# ============================================================
# DATOS: PREGUNTAS DE EJEMPLO
# ============================================================
def generar_preguntas_fase1(admin_id: str) -> list:
    import random
    rng = random.Random(12345)
    preguntas = []

    # 1. SUMA (100 preguntas)
    for i in range(100):
        if i < 50:
            a = rng.randint(10, 99)
            b = rng.randint(10, 99)
        else:
            a = rng.randint(100, 500)
            b = rng.randint(10, 99)
        
        ans = a + b
        ans_str = str(ans)
        
        has_carry = (a % 10 + b % 10) >= 10 or ((a // 10 % 10) + (b // 10 % 10)) >= 10
        
        alt_set = {ans}
        if has_carry:
            d1 = ans - 10
        else:
            d1 = ans + 10
        if d1 > 0 and d1 != ans:
            alt_set.add(d1)
            
        d2 = ans + 1 if rng.choice([True, False]) else ans - 1
        if d2 != ans:
            alt_set.add(d2)
            
        d3 = ans - 2 if rng.choice([True, False]) else ans + 2
        if d3 != ans:
            alt_set.add(d3)
            
        while len(alt_set) < 4:
            dummy = ans + rng.randint(-15, 15)
            if dummy > 0:
                alt_set.add(dummy)
                
        alts_list = sorted(list(alt_set))
        alternativas = []
        for idx, val in enumerate(alts_list):
            val_str = str(val)
            is_correct = (val == ans)
            
            tipo_error = None
            feedback_error = None
            if not is_correct:
                if val == ans - 10 and has_carry:
                    tipo_error = TipoErrorEnum.CALCULO
                    feedback_error = "Olvidaste sumar el 1 que te llevabas de las unidades o decenas."
                elif abs(val - ans) == 1:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "Revisa bien la suma de las unidades."
                else:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "Revisa detalladamente la suma de las columnas."
            
            alternativas.append({
                "texto": val_str,
                "es_correcta": is_correct,
                "orden": idx + 1,
                "tipo_error": tipo_error,
                "feedback_error": feedback_error
            })
            
        preguntas.append({
            "enunciado": f"¿Cuánto es {a} + {b}?",
            "respuesta_correcta": ans_str,
            "operacion": OperacionEnum.SUMA,
            "seccion": 101 + (i // 20),
            "datos_numericos": {"a": a, "b": b, "operacion_esperada": "suma"},
            "explicacion_paso_a_paso": {
                "titulo": "Sumemos paso a paso",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos las unidades", "calculo": f"{a%10} + {b%10} = {a%10 + b%10}."},
                    {"orden": 2, "texto": "Sumamos las decenas y centenas con sus acarreos correspondientes.", "calculo": ""},
                    {"orden": 3, "texto": f"El resultado final es {ans}."}
                ]
            },
            "alternativas": alternativas
        })

    # 2. RESTA (100 preguntas)
    for i in range(100):
        if i < 50:
            a = rng.randint(20, 99)
            b = rng.randint(10, a - 1)
        else:
            a = rng.randint(100, 500)
            b = rng.randint(10, a - 1)
            
        ans = a - b
        ans_str = str(ans)
        
        has_borrow = (a % 10) < (b % 10)
        
        alt_set = {ans}
        if has_borrow:
            d1 = ans + 10
        else:
            d1 = ans - 10
        if d1 > 0 and d1 != ans:
            alt_set.add(d1)
            
        if has_borrow:
            d2 = ans + 2 * (b%10 - a%10)
            if d2 != ans:
                alt_set.add(d2)
                
        d3 = ans + 1 if rng.choice([True, False]) else ans - 1
        if d3 > 0 and d3 != ans:
            alt_set.add(d3)
            
        while len(alt_set) < 4:
            dummy = ans + rng.randint(-15, 15)
            if dummy > 0:
                alt_set.add(dummy)
                
        alts_list = sorted(list(alt_set))
        alternativas = []
        for idx, val in enumerate(alts_list):
            val_str = str(val)
            is_correct = (val == ans)
            
            tipo_error = None
            feedback_error = None
            if not is_correct:
                if val == ans + 10 and has_borrow:
                    tipo_error = TipoErrorEnum.CALCULO
                    feedback_error = "Olvidaste restar la decena que le prestaste a las unidades."
                elif has_borrow and val == ans + 2 * (b%10 - a%10):
                    tipo_error = TipoErrorEnum.CALCULO
                    feedback_error = "Recuerda pedir prestado a las decenas cuando el dígito superior es menor que el inferior."
                elif abs(val - ans) == 1:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "Revisa bien las unidades de la resta."
                else:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "Revisa los cálculos de las unidades y decenas detalladamente."
                    
            alternativas.append({
                "texto": val_str,
                "es_correcta": is_correct,
                "orden": idx + 1,
                "tipo_error": tipo_error,
                "feedback_error": feedback_error
            })
            
        preguntas.append({
            "enunciado": f"¿Cuánto es {a} - {b}?",
            "respuesta_correcta": ans_str,
            "operacion": OperacionEnum.RESTA,
            "seccion": 201 + (i // 20),
            "datos_numericos": {"a": a, "b": b, "operacion_esperada": "resta"},
            "explicacion_paso_a_paso": {
                "titulo": "Restemos paso a paso",
                "pasos": [
                    {"orden": 1, "texto": "Revisamos las unidades", "calculo": "Si las unidades del minuendo son menores, pedimos una decena prestada."},
                    {"orden": 2, "texto": "Restamos las decenas y centenas considerando el préstamo si aplica.", "calculo": ""},
                    {"orden": 3, "texto": f"El resultado final es {ans}."}
                ]
            },
            "alternativas": alternativas
        })

    # 3. MULTIPLICACION (100 preguntas)
    mult_pairs = []
    for a in range(2, 13):
        for b in range(2, 13):
            mult_pairs.append((a, b))
    rng.shuffle(mult_pairs)
    mult_pairs = mult_pairs[:100]
    
    for i, (a, b) in enumerate(mult_pairs):
        ans = a * b
        ans_str = str(ans)
        
        alt_set = {ans}
        d1 = a * (b - 1)
        if d1 > 0 and d1 != ans:
            alt_set.add(d1)
        d2 = a * (b + 1)
        if d2 != ans:
            alt_set.add(d2)
        d3 = a + b
        if d3 != ans:
            alt_set.add(d3)
            
        while len(alt_set) < 4:
            dummy = ans + rng.randint(-10, 10)
            if dummy > 0:
                alt_set.add(dummy)
                
        alts_list = sorted(list(alt_set))
        alternativas = []
        for idx, val in enumerate(alts_list):
            val_str = str(val)
            is_correct = (val == ans)
            
            tipo_error = None
            feedback_error = None
            if not is_correct:
                if val == a * (b - 1):
                    tipo_error = TipoErrorEnum.TABUADA
                    feedback_error = f"Ese es el resultado de {a} x {b - 1}."
                elif val == a * (b + 1):
                    tipo_error = TipoErrorEnum.TABUADA
                    feedback_error = f"Ese es el resultado de {a} x {b + 1}."
                elif val == a + b:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "¡Cuidado! Sumaste los números en lugar de multiplicarlos."
                else:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "¡Cuidado! Revisa las tablas de multiplicar."
                    
            alternativas.append({
                "texto": val_str,
                "es_correcta": is_correct,
                "orden": idx + 1,
                "tipo_error": tipo_error,
                "feedback_error": feedback_error
            })
            
        preguntas.append({
            "enunciado": f"¿Cuánto es {a} x {b}?",
            "respuesta_correcta": ans_str,
            "operacion": OperacionEnum.MULTIPLICACION,
            "seccion": 301 + min(i // 17, 5),
            "datos_numericos": {"a": a, "b": b, "operacion_esperada": "multiplicacion"},
            "explicacion_paso_a_paso": {
                "titulo": "Multiplicación paso a paso",
                "pasos": [
                    {"orden": 1, "texto": "Consultamos la tabla de multiplicar", "calculo": f"{a} veces {b} es igual a {ans}."}
                ]
            },
            "alternativas": alternativas
        })

    # 4. DIVISION (100 preguntas)
    div_pairs = []
    for b in range(2, 13):
        for q in range(2, 13):
            div_pairs.append((b, q))
    rng.shuffle(div_pairs)
    div_pairs = div_pairs[:100]
    
    for i, (b, q) in enumerate(div_pairs):
        a = b * q
        ans = q
        ans_str = str(ans)
        
        alt_set = {ans}
        d1 = q - 1
        if d1 > 0:
            alt_set.add(d1)
        d2 = q + 1
        alt_set.add(d2)
        d3 = b
        if d3 != ans:
            alt_set.add(d3)
            
        while len(alt_set) < 4:
            dummy = ans + rng.randint(-3, 3)
            if dummy > 0:
                alt_set.add(dummy)
                
        alts_list = sorted(list(alt_set))
        alternativas = []
        for idx, val in enumerate(alts_list):
            val_str = str(val)
            is_correct = (val == ans)
            
            tipo_error = None
            feedback_error = None
            if not is_correct:
                if val == q - 1:
                    tipo_error = TipoErrorEnum.DIVISION
                    feedback_error = f"Cerca, pero {q - 1} x {b} = {(q - 1) * b}."
                elif val == q + 1:
                    tipo_error = TipoErrorEnum.DIVISION
                    feedback_error = f"Cerca, pero {q + 1} x {b} = {(q + 1) * b}."
                else:
                    tipo_error = TipoErrorEnum.ATENCION
                    feedback_error = "Revisa la división con cuidado."
                    
            alternativas.append({
                "texto": val_str,
                "es_correcta": is_correct,
                "orden": idx + 1,
                "tipo_error": tipo_error,
                "feedback_error": feedback_error
            })
            
        preguntas.append({
            "enunciado": f"¿Cuánto es {a} / {b}?",
            "respuesta_correcta": ans_str,
            "operacion": OperacionEnum.DIVISION,
            "seccion": 401 + (i // 20),
            "datos_numericos": {"a": a, "b": b, "operacion_esperada": "division"},
            "explicacion_paso_a_paso": {
                "titulo": "División paso a paso",
                "pasos": [
                    {"orden": 1, "texto": "Buscamos qué número multiplicado por el divisor da el dividendo", "calculo": f"¿Qué número x {b} = {a}? Es {q} porque {q} x {b} = {a}."}
                ]
            },
            "alternativas": alternativas
        })

    return preguntas


async def seed_pedagogy_settings(session: AsyncSessionLocal):
    print("Inyectando configuraciones pedagógicas (adminConfig)...")
    result = await session.execute(
        select(PlatformSettings).where(PlatformSettings.key == PEDAGOGY_CONFIG_KEY)
    )
    existing = result.scalar_one_or_none()

    if existing:
        print("  Configuración pedagógica ya existe. Actualizando...")
        existing.value = DEFAULT_PEDAGOGY_CONFIG
    else:
        settings = PlatformSettings(key=PEDAGOGY_CONFIG_KEY, value=DEFAULT_PEDAGOGY_CONFIG)
        session.add(settings)
        print("  Configuración pedagógica insertada con éxito.")

async def seed_fases(session: AsyncSessionLocal):
    print("Inyectando fases iniciales...")
    for f in FASES_DATA:
        result = await session.execute(
            select(Fase).where(Fase.id == f["id"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"  Fase '{f['nombre']}' ya existe. Actualizando descripción...")
            existing.nombre = f["nombre"]
            existing.descripcion = f["descripcion"]
            existing.orden = f["orden"]
        else:
            fase = Fase(
                id=f["id"],
                nombre=f["nombre"],
                descripcion=f["descripcion"],
                orden=f["orden"],
                estado=StatusEnum.ACTIVO
            )
            session.add(fase)
            print(f"  Fase '{f['nombre']}' inyectada con éxito.")

async def seed_configuracion_progreso(session: AsyncSessionLocal):
    print("Inyectando configuración de progreso para disciplinas base...")
    for c in CONFIGURACION_DATA:
        result = await session.execute(
            select(ConfiguracionProgreso).where(
                ConfiguracionProgreso.fase_id == c["fase_id"],
                ConfiguracionProgreso.seccion == c["seccion"],
                ConfiguracionProgreso.operacion == c["operacion"]
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"  Regla de progreso F{c['fase_id']}-S{c['seccion']}-{c['operacion'].value} ya existe. Saltando.")
        else:
            config = ConfiguracionProgreso(**c)
            session.add(config)
            print(f"  Regla de progreso F{c['fase_id']}-S{c['seccion']}-{c['operacion'].value} creada.")


async def seed_preguntas_ejemplo(session: AsyncSessionLocal, admin_id: str):
    print("Generando e inyectando pool de preguntas de la Fase 1...")
    
    # Eliminar preguntas y alternativas antiguas de Fase 1 para evitar duplicados y actualizar las secciones
    # IMPORTANTE: respetar el orden de dependencias FK para evitar ForeignKeyViolationError:
    #   Intento → Pregunta / Alternativa
    #   PoolAsignadoAlumno → Pregunta
    #   Alternativa → Pregunta
    from app.models.sql_models import Alternativa
    from app.models.progreso import Intento, PoolAsignadoAlumno

    fase1_pregunta_ids_subq = select(Pregunta.id).where(Pregunta.fase_id == 1)

    # 1. Eliminar intentos que apuntan a preguntas de Fase 1
    await session.execute(
        delete(Intento).where(Intento.pregunta_id.in_(fase1_pregunta_ids_subq))
    )
    # 2. Eliminar registros del pool asignado que apuntan a preguntas de Fase 1
    await session.execute(
        delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(fase1_pregunta_ids_subq))
    )
    # 3. Eliminar alternativas de esas preguntas
    await session.execute(
        delete(Alternativa).where(Alternativa.pregunta_id.in_(fase1_pregunta_ids_subq))
    )
    # 4. Finalmente eliminar las preguntas
    await session.execute(
        delete(Pregunta).where(Pregunta.fase_id == 1)
    )
    await session.flush()
    
    preguntas_pool = generar_preguntas_fase1(admin_id)
    
    # Llevar cuenta de cuántas se insertan
    insertadas = 0
    omitidas = 0
    
    for p_data in preguntas_pool:
        result = await session.execute(
            select(Pregunta).where(Pregunta.enunciado == p_data["enunciado"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            omitidas += 1
            continue

        pregunta = Pregunta(
            fase_id=1, # Aritmética Básica
            seccion=p_data.get("seccion", 1),
            operacion=p_data["operacion"],
            tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION,
            enunciado=p_data["enunciado"],
            respuesta_correcta=p_data["respuesta_correcta"],
            datos_numericos=p_data["datos_numericos"],
            explicacion_paso_a_paso=p_data["explicacion_paso_a_paso"],
            creado_por=admin_id,
            estado=StatusEnum.ACTIVO,
        )
        session.add(pregunta)
        await session.flush()

        for alt_data in p_data["alternativas"]:
            alt = Alternativa(
                pregunta_id=pregunta.id,
                texto=alt_data["texto"],
                es_correcta=alt_data["es_correcta"],
                orden=alt_data["orden"],
                tipo_error=alt_data.get("tipo_error"),
                feedback_error=alt_data.get("feedback_error")
            )
            session.add(alt)
        insertadas += 1
        
    print(f"  Finalizado: {insertadas} preguntas nuevas inyectadas, {omitidas} ya existían.")

async def create_admin_user(session: AsyncSessionLocal) -> str:
    print("Verificando usuario administrador...")
    result = await session.execute(
        select(User).where(User.email == "admin@logicakids.pro")
    )
    existing = result.scalar_one_or_none()

    admin_user = existing
    if not existing:
        admin_id = str(uuid.uuid4())
        admin_user = User(
            id=admin_id,
            username="admin",
            email="admin@logicakids.pro",
            password_hash=get_password_hash("admin123"),
            role="ADMIN",
            status="ACTIVE",
            unlocked_level=0,
            settings={
                "unlockedLevels": {
                    "addition": 0,
                    "subtraction": 0,
                    "multiplication": 0,
                    "division": 0,
                    "challenge": 0
                },
                "scores": []
            },
        )
        session.add(admin_user)
        print("  Admin creado con éxito: admin@logicakids.pro / admin123")
    else:
        print("  Admin ya existe.")
        if not admin_user.settings:
            admin_user.settings = {
                "unlockedLevels": {
                    "addition": 0,
                    "subtraction": 0,
                    "multiplication": 0,
                    "division": 0,
                    "challenge": 0
                },
                "scores": []
            }

    # Ensure admin has Alumno profile
    await session.flush()
    result = await session.execute(
        select(Alumno).where(Alumno.user_id == admin_user.id)
    )
    existing_alumno = result.scalar_one_or_none()
    if not existing_alumno:
        # Find Fase 0
        result = await session.execute(select(Fase).where(Fase.orden == 0))
        fase_cero = result.scalar_one_or_none()
        if not fase_cero:
            result = await session.execute(select(Fase).order_by(Fase.orden.asc()).limit(1))
            fase_cero = result.scalar_one_or_none()
            
        alumno = Alumno(
            user_id=admin_user.id,
            nombre=admin_user.username,
            fase_actual_id=fase_cero.id if fase_cero else None,
        )
        session.add(alumno)
        print("  Perfil Alumno creado para Administrador.")
        
    return admin_user.id

async def should_seed_phase(session, fase_key: str, fase_id: int) -> bool:
    import os
    if os.getenv("FORCE_SEED", "false").lower() == "true":
        print(f"  [FORCE_SEED] Seeding is forced for '{fase_key}'.")
        return True

    # Check if any questions exist for this phase
    result_q = await session.execute(
        select(Pregunta.id).where(Pregunta.fase_id == fase_id).limit(1)
    )
    if not result_q.scalar_one_or_none():
        print(f"  No questions found for Phase {fase_id} ('{fase_key}'). Seeding required.")
        return True

    # Check versions registry
    result_settings = await session.execute(
        select(PlatformSettings).where(PlatformSettings.key == SEED_VERSIONS_KEY)
    )
    settings = result_settings.scalar_one_or_none()
    if not settings:
        print(f"  Seed registry not found in database. Seeding required for '{fase_key}'.")
        return True

    db_versions = settings.value or {}
    db_version = db_versions.get(fase_key)
    target_version = SEED_VERSIONS.get(fase_key)

    if db_version != target_version:
        print(f"  Version mismatch for '{fase_key}': DB={db_version}, Target={target_version}. Seeding required.")
        return True

    print(f"  [SKIP] Phase '{fase_key}' is up to date (version {db_version}).")
    return False

async def update_seed_version(session, fase_key: str, version: str):
    result_settings = await session.execute(
        select(PlatformSettings).where(PlatformSettings.key == SEED_VERSIONS_KEY)
    )
    settings = result_settings.scalar_one_or_none()
    if not settings:
        settings = PlatformSettings(key=SEED_VERSIONS_KEY, value={})
        session.add(settings)
        await session.flush()

    current_val = dict(settings.value or {})
    current_val[fase_key] = version
    settings.value = current_val
    print(f"  Updated database seed version registry: '{fase_key}' -> {version}")

from sqlalchemy import and_

async def migrar_datos_fase1_legacy(session):
    print("Ejecutando migración de datos legacy de Fase 1...")
    
    # 1. Obtener todos los progresos de Fase 1 con seccion = 1
    result = await session.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.fase_id == 1,
            ProgresoMaestria.seccion == 1
        ))
    )
    progresos_legacy = result.scalars().all()
    
    migrados = 0
    from app.models.sql_models import EstadoProgresoEnum, Intento
    for p_leg in progresos_legacy:
        # Determinar qué secciones dinámicas corresponden a esta operación
        secciones_destino = []
        op_val = (p_leg.operacion.value if hasattr(p_leg.operacion, "value") else p_leg.operacion).upper()
        if op_val == "SUMA":
            secciones_destino = [101, 102, 103, 104, 105]
        elif op_val == "RESTA":
            secciones_destino = [201, 202, 203, 204, 205]
        elif op_val == "MULTIPLICACION":
            secciones_destino = [301, 302, 303, 304, 305, 306]
        elif op_val == "DIVISION":
            secciones_destino = [401, 402, 403, 404, 405]
            
        for sec in secciones_destino:
            # Verificar si ya existe progreso para esta sección
            result_ex = await session.execute(
                select(ProgresoMaestria).where(and_(
                    ProgresoMaestria.alumno_id == p_leg.alumno_id,
                    ProgresoMaestria.fase_id == 1,
                    ProgresoMaestria.seccion == sec,
                    ProgresoMaestria.operacion == p_leg.operacion
                ))
            )
            progreso_ex = result_ex.scalar_one_or_none()
            
            if not progreso_ex:
                # Crear progreso para la sección dinámica heredando el estado legacy
                new_p = ProgresoMaestria(
                    alumno_id=p_leg.alumno_id,
                    fase_id=1,
                    seccion=sec,
                    operacion=p_leg.operacion,
                    estado=p_leg.estado,
                    aciertos_acumulados=p_leg.aciertos_acumulados,
                    intentos_totales=p_leg.intentos_totales,
                    porcentaje_actual=p_leg.porcentaje_actual,
                    aprobado_por_admin=p_leg.aprobado_por_admin,
                    fecha_inicio=p_leg.fecha_inicio,
                    fecha_aprobacion=p_leg.fecha_aprobacion
                )
                session.add(new_p)
                migrados += 1
            else:
                # Si el legacy estaba aprobado pero el dinámico no, actualizarlo
                if p_leg.estado == EstadoProgresoEnum.APROBADO and progreso_ex.estado != EstadoProgresoEnum.APROBADO:
                    progreso_ex.estado = EstadoProgresoEnum.APROBADO
                    progreso_ex.aciertos_acumulados = max(progreso_ex.aciertos_acumulados, p_leg.aciertos_acumulados)
                    progreso_ex.intentos_totales = max(progreso_ex.intentos_totales, p_leg.intentos_totales)
                    progreso_ex.porcentaje_actual = 100
                    progreso_ex.fecha_aprobacion = p_leg.fecha_aprobacion or datetime.utcnow()
                    session.add(progreso_ex)
                    migrados += 1
                    
        # También duplicar los intentos para que aparezcan en el historial
        result_intentos = await session.execute(
            select(Intento).where(and_(
                Intento.alumno_id == p_leg.alumno_id,
                Intento.fase_id == 1,
                Intento.seccion == 1,
                Intento.operacion == p_leg.operacion
            ))
        )
        intentos_legacy = result_intentos.scalars().all()
        for int_leg in intentos_legacy:
            # Sincronizar el intento al nivel 3 (medio) como default
            default_sec = 103
            if op_val == "SUMA":
                default_sec = 103
            elif op_val == "RESTA":
                default_sec = 203
            elif op_val == "MULTIPLICACION":
                default_sec = 303
            elif op_val == "DIVISION":
                default_sec = 403
                
            int_leg.seccion = default_sec
            session.add(int_leg)
            
    print(f"  Sincronizados {migrados} registros de progreso para secciones dinámicas.")

# ============================================================
# MAIN SEEDER EXECUTION
# ============================================================
async def run_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla - LogicaKids Pro")
    print("=" * 60)
    
    async with AsyncSessionLocal() as session:
        # 1. Admin User
        admin_id = await create_admin_user(session)
        
        # 2. Pedagogy config settings
        await seed_pedagogy_settings(session)
        
        # 3. Fases
        await seed_fases(session)
        
        # 4. Progress configs
        await seed_configuracion_progreso(session)
        
        # 5. Example questions (Fase 1)
        if await should_seed_phase(session, "fase_1", 1):
            await seed_preguntas_ejemplo(session, admin_id)
            await update_seed_version(session, "fase_1", SEED_VERSIONS["fase_1"])
            
        # 6. Sincronizar progresos antiguos a secciones dinámicas
        await migrar_datos_fase1_legacy(session)
        
        await session.commit()

    # Inyectar datos semilla de la Fase 2
    try:
        from app.fase2.seed import run_fase2_seed
        await run_fase2_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 2:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 3
    try:
        from app.fase3.seed import run_fase3_seed
        await run_fase3_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 3:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 4
    try:
        from app.fase4.seed import run_fase4_seed
        await run_fase4_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 4:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 5
    try:
        from app.fase5.seed import run_fase5_seed
        await run_fase5_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 5:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 6
    try:
        from app.fase6.seed import run_fase6_seed
        await run_fase6_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 6:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 7
    try:
        from app.fase7.seed_fase7 import run_fase7_seed
        await run_fase7_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 7:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 8
    try:
        from app.fase8.seed_fase8 import run_fase8_seed
        await run_fase8_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 8:")
        traceback.print_exc()
        raise e

    # Inyectar datos semilla de la Fase 9
    try:
        from app.fase9.seed_fase9 import run_fase9_seed
        await run_fase9_seed()
    except Exception as e:
        import traceback
        print("❌ Error al inyectar datos de Fase 9:")
        traceback.print_exc()
        raise e

    print("=" * 60)
    print("¡Datos semilla inyectados con éxito!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_seed())

