import asyncio
import uuid
import random
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
PEDAGOGY_CONFIG_KEY = "pedagogy_config"
DEFAULT_PEDAGOGY_CONFIG = {
    "questionsPerPhase": 50,
    "timers": {
        "easy": 10,
        "easy_medium": 12,
        "medium": 14,
        "medium_hard": 16,
        "hard": 18,
    },
    "useTimer": True,
    "passingScore": 90,
}

# ============================================================
# DATOS: FASES (Viaje Matemático)
# ============================================================
FASES_DATA = [
    {
        "id": 1,
        "nombre": "Aritmética Básica",
        "descripcion": "Sumas, restas, multiplicaciones y divisiones. ¡Calentamiento mental!",
        "orden": 1,
    },
    {
        "id": 2,
        "nombre": "Desarrollo Numérico y Razonamiento",
        "descripcion": "Cálculo mental, comprensión del sistema monetario y lectura de problemas.",
        "orden": 2,
    },
    {
        "id": 3,
        "nombre": "Problemas de Texto",
        "descripcion": "Aprende a leer, interpretar y estructurar datos para resolver problemas matemáticos.",
        "orden": 3,
    },
    {
        "id": 4,
        "nombre": "Fracciones, Porcentajes y Gráficos",
        "descripcion": "Trabaja la relación parte-todo mediante fracciones simples, porcentajes y gráficos.",
        "orden": 4,
    },
    {
        "id": 5,
        "nombre": "Geometría Plana",
        "descripcion": "Preparación para ejercicios espaciales utilizando figuras bidimensionales y Tangram.",
        "orden": 5,
    },
    {
        "id": 6,
        "nombre": "Geometría Espacial",
        "descripcion": "Desarrolla visualización 3D interactuando con sólidos y calculando bloques.",
        "orden": 6,
    },
    {
        "id": 7,
        "nombre": "Coordenadas y Desplazamientos",
        "descripcion": "Plano cartesiano, pares ordenados y nociones de lateralidad / direcciones.",
        "orden": 7,
    },
    {
        "id": 8,
        "nombre": "Probabilidad, Combinatoria y Lógica",
        "descripcion": "Razonamiento estructurado: identificar casos favorables, secuencias y múltiplos/divisores.",
        "orden": 8,
    },
    {
        "id": 9,
        "nombre": "Simulados Pedro II",
        "descripcion": "Preparación decisiva para el formato real del examen con simulacros completos.",
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

    # --- FASE 2 (Desarrollo Numérico y Razonamiento) ---
    # Módulo 1 (Gimnasio Numérico Mental)
    {"fase_id": 2, "seccion": 1, "operacion": OperacionEnum.MIXTA,
     "cantidad_requerida": 15, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 1, "tipo_feedback": "detallado",
     "usa_cronometro": False, "tiempo_default_segundos": 0},
    # Módulo 2 (Tablas en Acción)
    {"fase_id": 2, "seccion": 2, "operacion": OperacionEnum.MIXTA,
     "cantidad_requerida": 15, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 2, "tipo_feedback": "detallado",
     "usa_cronometro": False, "tiempo_default_segundos": 0},
    # Módulo 3 (Tienda Matemática)
    {"fase_id": 2, "seccion": 3, "operacion": OperacionEnum.MIXTA,
     "cantidad_requerida": 20, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 3, "tipo_feedback": "detallado",
     "usa_cronometro": False, "tiempo_default_segundos": 0},
    # Módulo 4 (Detectives de Historias)
    {"fase_id": 2, "seccion": 4, "operacion": OperacionEnum.MIXTA,
     "cantidad_requerida": 10, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 4, "tipo_feedback": "detallado",
     "usa_cronometro": False, "tiempo_default_segundos": 0},
    # Módulo 5 (Constructor de Soluciones)
    {"fase_id": 2, "seccion": 5, "operacion": OperacionEnum.MIXTA,
     "cantidad_requerida": 10, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 5, "tipo_feedback": "detallado",
     "usa_cronometro": False, "tiempo_default_segundos": 0},
]

# ============================================================
# DATOS: PREGUNTAS DE EJEMPLO
# ============================================================
PREGUNTAS_EJEMPLO = [
    {
        "enunciado": "¿Cuánto es 45 + 38?",
        "respuesta_correcta": "83",
        "operacion": OperacionEnum.SUMA,
        "datos_numericos": {"a": 45, "b": 38, "operacion_esperada": "suma"},
        "explicacion_paso_a_paso": {
            "titulo": "Sumemos paso a paso",
            "pasos": [
                {"orden": 1, "texto": "Sumamos las unidades", "calculo": "5 + 8 = 13. Escribimos 3 y nos llevamos 1."},
                {"orden": 2, "texto": "Sumamos las decenas", "calculo": "4 + 3 + 1 = 8."},
                {"orden": 3, "texto": "El resultado final es 83."},
            ]
        },
        "alternativas": [
            {"texto": "83", "es_correcta": True, "orden": 1},
            {"texto": "73", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Olvidaste sumar el 1 que te llevabas de las unidades."},
            {"texto": "813", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.VALOR_POSICIONAL,
             "feedback_error": "Escribiste las columnas lado a lado sin considerar la posición decimal."},
            {"texto": "82", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "Revisa bien la suma: 5 + 8 = 13."},
        ]
    },
    {
        "enunciado": "¿Cuánto es 85 - 29?",
        "respuesta_correcta": "56",
        "operacion": OperacionEnum.RESTA,
        "datos_numericos": {"a": 85, "b": 29, "operacion_esperada": "resta"},
        "explicacion_paso_a_paso": {
            "titulo": "Restemos paso a paso",
            "pasos": [
                {"orden": 1, "texto": "Unidades: 5 es menor que 9, pedimos prestado 1 a las decenas", "calculo": "15 - 9 = 6."},
                {"orden": 2, "texto": "Decenas: El 8 queda en 7", "calculo": "7 - 2 = 5."},
                {"orden": 3, "texto": "El resultado final es 56."},
            ]
        },
        "alternativas": [
            {"texto": "56", "es_correcta": True, "orden": 1},
            {"texto": "66", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Olvidaste restar la decena prestada."},
            {"texto": "64", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Revisa bien la resta de las unidades (15 - 9 = 6)."},
            {"texto": "54", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "Revisa los cálculos de las unidades y decenas de forma detallada."},
        ]
    },
    {
        "enunciado": "¿Cuánto es 7 x 8?",
        "respuesta_correcta": "56",
        "operacion": OperacionEnum.MULTIPLICACION,
        "datos_numericos": {"a": 7, "b": 8, "operacion_esperada": "multiplicacion"},
        "explicacion_paso_a_paso": {
            "titulo": "Multiplicación de fábrica",
            "pasos": [
                {"orden": 1, "texto": "Consulta la tabla del 7 o del 8", "calculo": "7 veces 8 es igual a 56."},
            ]
        },
        "alternativas": [
            {"texto": "56", "es_correcta": True, "orden": 1},
            {"texto": "49", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.TABUADA,
             "feedback_error": "Ese es el resultado de 7 x 7."},
            {"texto": "63", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.TABUADA,
             "feedback_error": "Ese es el resultado de 7 x 9."},
            {"texto": "54", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "¡Cuidado! Revisa las tablas de multiplicar."},
        ]
    },
    {
        "enunciado": "¿Cuánto es 72 / 9?",
        "respuesta_correcta": "8",
        "operacion": OperacionEnum.DIVISION,
        "datos_numericos": {"a": 72, "b": 9, "operacion_esperada": "division"},
        "explicacion_paso_a_paso": {
            "titulo": "División de fábrica",
            "pasos": [
                {"orden": 1, "texto": "¿Qué número multiplicado por 9 da 72?", "calculo": "8 x 9 = 72. Por lo tanto, 72 / 9 = 8."},
            ]
        },
        "alternativas": [
            {"texto": "8", "es_correcta": True, "orden": 1},
            {"texto": "7", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.DIVISION,
             "feedback_error": "Cerca, pero 7 x 9 = 63."},
            {"texto": "9", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.DIVISION,
             "feedback_error": "Incorrecto, 9 x 9 = 81."},
            {"texto": "6", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "Revisa la división con cuidado."},
        ]
    },
]

# ============================================================
# FUNCIONES DE INSERCION
# ============================================================
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
    print("Inyectando preguntas de ejemplo...")
    for p_data in PREGUNTAS_EJEMPLO:
        result = await session.execute(
            select(Pregunta).where(Pregunta.enunciado == p_data["enunciado"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"  Pregunta '{p_data['enunciado'][:40]}...' ya existe. Saltando.")
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
        print(f"  Pregunta de {p_data['operacion'].value} insertada con alternativas.")

# ============================================================
# INYECCIÓN DILUIDA DE FASE 2
# ============================================================
async def seed_preguntas_fase2(session: AsyncSessionLocal, admin_id: str):
    print("Inyectando pool pedagógico estructurado para la Fase 2...")

    # Módulo 1: Gimnasio Numérico Mental (seccion=1, fase_id=2)
    # Generar 15 preguntas variadas para cada subnivel
    for sub in range(1, 5):
        for i in range(1, 6):
            if sub == 1:
                a = random.randint(10, 50)
                b = random.randint(5, 45)
                enunciado = f"Resuelve mentalmente: ¿Cuánto es {a} + {b}?"
                ans = str(a + b)
            elif sub == 2:
                a = random.randint(5, 10)
                b = random.randint(2, 6)
                c = random.randint(10, 30)
                enunciado = f"Aplica la jerarquía: ¿Cuánto es {c} + {a} x {b}?"
                ans = str(c + (a * b))
            elif sub == 3:
                a = random.randint(5, 15)
                b = random.randint(2, 8)
                c = random.randint(2, 5)
                enunciado = f"Resuelve con paréntesis: ¿Cuánto es ({a} - {b}) x {c}?"
                ans = str((a - b) * c)
            else:
                a = random.randint(10, 40)
                b = random.randint(5, 10)
                c = random.randint(2, 4)
                enunciado = f"Cálculo rápido integrado: ¿Cuánto es {a} - {b} x {c}?"
                ans = str(a - (b * c))

            pregunta = Pregunta(
                fase_id=2,
                seccion=1,
                sub_nivel=sub,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
                enunciado=enunciado,
                respuesta_correcta=ans,
                datos_numericos={"sub_nivel": sub, "variacion": i},
                creado_por=admin_id,
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)

    # Módulo 2: Tablas en Acción (seccion=2, fase_id=2)
    # Generar 15 preguntas de pares inversos y números faltantes
    for sub in range(1, 5):
        for i in range(1, 6):
            if sub == 1:
                n1, n2 = random.randint(10, 40), random.randint(5, 25)
                tot = n1 + n2
                enunciado = f"Si sabemos que {n1} + {n2} = {tot}, ¿cuánto da la resta inversa {tot} - {n1}?"
                ans = str(n2)
            elif sub == 2:
                n1, n2 = random.randint(3, 9), random.randint(4, 10)
                tot = n1 * n2
                enunciado = f"Si la multiplicación da {n1} x {n2} = {tot}, ¿cuánto da la división espejo {tot} / {n2}?"
                ans = str(n1)
            elif sub == 3:
                n1, tot = random.randint(10, 30), random.randint(35, 60)
                enunciado = f"Descubre el número faltante en la operación: {n1} + ___ = {tot}"
                ans = str(tot - n1)
            else:
                n1, tot = random.randint(3, 9), random.randint(15, 80)
                enunciado = f"Resuelve el espacio vacío multiplicativo: {n1} x ___ = {tot - (tot % n1)}"
                ans = str((tot - (tot % n1)) // n1)

            pregunta = Pregunta(
                fase_id=2,
                seccion=2,
                sub_nivel=sub,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
                enunciado=enunciado,
                respuesta_correcta=ans,
                datos_numericos={"sub_nivel": sub, "variacion": i},
                creado_por=admin_id,
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)

    # Módulo 3: Tienda Matemática (seccion=3, fase_id=2)
    # Generar 20 preguntas con centavos amigables (.00, .25, .50, .75)
    for sub in range(1, 5):
        for i in range(1, 6):
            cents = random.choice([0.0, 0.25, 0.50, 0.75])
            if sub == 1:
                val = float(random.randint(1, 10)) + cents
                enunciado = f"Tienes 1 billete de R$ 10,00 y compras un dulce de R$ {val:.2f}. ¿Cuánto te queda?"
                ans = f"{10.0 - val:.2f}"
            elif sub == 2:
                val = float(random.randint(5, 15)) + cents
                enunciado = f"Quieres comprar un juguete de R$ {val:.2f} con un billete de R$ 20,00. ¿Cuál es tu vuelto?"
                ans = f"{20.0 - val:.2f}"
            elif sub == 3:
                v1 = float(random.randint(1, 5)) + random.choice([0.0, 0.5])
                v2 = float(random.randint(1, 5)) + random.choice([0.0, 0.25, 0.5])
                enunciado = f"En tu carrito llevas un jugo de R$ {v1:.2f} y una galleta de R$ {v2:.2f}. ¿Cuánto pagarás en total?"
                ans = f"{v1 + v2:.2f}"
            else:
                val = float(random.randint(15, 25)) + cents
                enunciado = f"Tienes R$ 20,00 de presupuesto. Un libro cuesta R$ {val:.2f}. ¿Cuánto dinero te falta para poder comprarlo?"
                ans = f"{max(0.0, val - 20.0):.2f}"

            pregunta = Pregunta(
                fase_id=2,
                seccion=3,
                sub_nivel=sub,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
                enunciado=enunciado,
                respuesta_correcta=ans,
                datos_numericos={"sub_nivel": sub, "variacion": i},
                creado_por=admin_id,
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)

    # Módulo 4: Detectives de Historias (seccion=4, fase_id=2)
    # Generar 10 preguntas tokenizadas de filtro y comprensión
    for sub in range(1, 5):
        for i in range(1, 4):
            if sub == 1:
                enunciado = "En la frutería hay 15 manzanas rojas, 8 peras maduras y 3 gatos durmiendo al sol. ¿Cuántas frutas hay en total?"
                ans = "23"
            elif sub == 2:
                enunciado = "Sofía tenía 12 calcomanías. Ayer regaló 4 a su hermano y hoy duplicó las que le quedaban. ¿Con cuántas se quedó?"
                ans = "16"
            elif sub == 3:
                enunciado = "Completa la serie rítmica del detective: 4, 8, 12, 16, ___"
                ans = "20"
            else:
                enunciado = "Un tren lleva 45 pasajeros. En la primera estación bajan 10 y suben 5. ¿Cuántos pasajeros siguen en el tren?"
                ans = "40"

            pregunta = Pregunta(
                fase_id=2,
                seccion=4,
                sub_nivel=sub,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
                enunciado=enunciado,
                respuesta_correcta=ans,
                datos_numericos={"sub_nivel": sub, "variacion": i},
                creado_por=admin_id,
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)

    # Módulo 5: Constructor de Soluciones (seccion=5, fase_id=2)
    # Generar 10 preguntas encadenadas avanzadas
    for sub in range(1, 5):
        for i in range(1, 4):
            if sub == 1:
                enunciado = "Carlos compró 3 cajas de bombones. Cada caja contiene 10 bombones. Si decide regalarle 5 bombones a su tía, ¿cuántos le quedan?"
                ans = "25"
            elif sub == 2:
                enunciado = "Una fábrica empaca jugos en packs de 6 unidades. Si un camión lleva 5 packs y el conductor bebe 2 unidades en el viaje, ¿cuántos jugos llegan?"
                ans = "28"
            elif sub == 3:
                enunciado = "Lucas gana R$ 8,00 por hora limpiando jardines. Si trabajó 4 horas y gastó R$ 10,00 en el almuerzo, ¿cuánto dinero limpio ahorró?"
                ans = "22"
            else:
                enunciado = "Un álbum tiene espacio para 100 estampas. Compras 8 sobres con 5 estampas cada uno. ¿Cuántas estampas te faltan para llenar el álbum?"
                ans = "60"

            pregunta = Pregunta(
                fase_id=2,
                seccion=5,
                sub_nivel=sub,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
                enunciado=enunciado,
                respuesta_correcta=ans,
                datos_numericos={"sub_nivel": sub, "variacion": i},
                creado_por=admin_id,
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)

    print("  ¡Pool de preguntas de la Fase 2 inyectado exitosamente!")

async def create_admin_user(session: AsyncSessionLocal) -> str:
    print("Verificando usuario administrador...")
    result = await session.execute(
        select(User).where(User.email == "admin@logicakids.pro")
    )
    existing = result.scalar_one_or_none()

    if existing:
        print("  Admin ya existe.")
        return existing.id

    admin_id = str(uuid.uuid4())
    admin = User(
        id=admin_id,
        username="admin",
        email="admin@logicakids.pro",
        password_hash=get_password_hash("admin123"),
        role="ADMIN",
        status="ACTIVE",
        settings={},
    )
    session.add(admin)
    print("  Admin creado con éxito: admin@logicakids.pro / admin123")
    return admin_id

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
        
        # 5. Example questions
        await seed_preguntas_ejemplo(session, admin_id)

        # 6. Phase 2 Questions
        await seed_preguntas_fase2(session, admin_id)
        
        await session.commit()

    print("=" * 60)
    print("¡Datos semilla inyectados con éxito!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_seed())
