import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select

from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.sql_models import (
    User,
    Fase,
    Alumno,
    Pregunta,
    Alternativa,
    ConfiguracionProgreso,
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
    "fase_1": "1.0",
    "fase_2": "20260527_v1",
    "fase_3": "20260527_v2",
    "fase_4": "20260529_v3"
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

# ============================================================
# DATOS: CONFIGURACION DE PROGRESO (Disciplinas Base)
# ============================================================
CONFIGURACION_DATA = [
    # --- FASE 1 (Aritmética Básica) ---
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
]

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
    
    for a, b in mult_pairs:
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
    
    for b, q in div_pairs:
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
            seccion=1,
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

    print("=" * 60)
    print("¡Datos semilla inyectados con éxito!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_seed())

