"""
Seed Pedagogico - LogicaKids Pro
================================================
Crea datos iniciales para la plataforma:
  - Fases (Fase 0 y Fase 1)
  - Configuracion de progreso para cada bloque
  - Usuario administrador
  - Preguntas de ejemplo para Fase 1, Seccion 1 (suma)
  - Alternativas con diagnostico de errores

Uso:
  docker compose exec backend python seed_pedagogico.py
"""

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
    StatusEnum,
    OperacionEnum,
    TipoPreguntaEnum,
    TipoErrorEnum,
)
from app.auth import get_password_hash


# ============================================================
# DATOS: FASES
# ============================================================

FASES_DATA = [
    {
        "id": 1,
        "nombre": "Fase 0 - Operaciones Elementales",
        "descripcion": (
            "Practica libre de operaciones basicas con generacion dinamica. "
            "El alumno debe superar los 5 niveles de suma, resta, "
            "multiplicacion y division antes de pasar a la Fase 1."
        ),
        "orden": 0,
    },
    {
        "id": 2,
        "nombre": "Fase 1 - Operaciones Basicas",
        "descripcion": (
            "Aprendizaje por dominio con preguntas del banco de datos. "
            "Seccion 1: Calculo directo. "
            "Seccion 2: Inferencia y contexto. "
            "Seccion 3: Resistencia y combinacion."
        ),
        "orden": 1,
    },
]


# ============================================================
# DATOS: CONFIGURACION DE PROGRESO
# ============================================================

# Fase 1, Seccion 1 — Operaciones simples (50 preguntas, 95%)
# Fase 1, Seccion 2 — Inferencia y contexto (75 preguntas, 90%)
# Fase 1, Seccion 3 — Resistencia y combinacion (100 preguntas, 85%)

CONFIGURACION_DATA = [
    # --- SECCION 1: Calculo directo ---
    {"fase_id": 2, "seccion": 1, "operacion": OperacionEnum.SUMA,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 95,
     "orden_desbloqueo": 1, "tipo_feedback": "simple",
     "usa_cronometro": False},
    {"fase_id": 2, "seccion": 1, "operacion": OperacionEnum.RESTA,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 95,
     "orden_desbloqueo": 2, "tipo_feedback": "simple",
     "usa_cronometro": False},
    {"fase_id": 2, "seccion": 1, "operacion": OperacionEnum.MULTIPLICACION,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 95,
     "orden_desbloqueo": 3, "tipo_feedback": "simple",
     "usa_cronometro": False},
    {"fase_id": 2, "seccion": 1, "operacion": OperacionEnum.DIVISION,
     "cantidad_requerida": 50, "porcentaje_aprobacion": 95,
     "orden_desbloqueo": 4, "tipo_feedback": "simple",
     "usa_cronometro": False},

    # --- SECCION 2: Inferencia y contexto ---
    {"fase_id": 2, "seccion": 2, "operacion": OperacionEnum.SUMA,
     "cantidad_requerida": 75, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 1, "tipo_feedback": "detallado",
     "usa_cronometro": False},
    {"fase_id": 2, "seccion": 2, "operacion": OperacionEnum.RESTA,
     "cantidad_requerida": 75, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 2, "tipo_feedback": "detallado",
     "usa_cronometro": False},
    {"fase_id": 2, "seccion": 2, "operacion": OperacionEnum.MULTIPLICACION,
     "cantidad_requerida": 75, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 3, "tipo_feedback": "detallado",
     "usa_cronometro": False},
    {"fase_id": 2, "seccion": 2, "operacion": OperacionEnum.DIVISION,
     "cantidad_requerida": 75, "porcentaje_aprobacion": 90,
     "orden_desbloqueo": 4, "tipo_feedback": "detallado",
     "usa_cronometro": False},

    # --- SECCION 3: Resistencia y combinacion ---
    {"fase_id": 2, "seccion": 3, "operacion": OperacionEnum.MIXTA,
     "cantidad_requerida": 100, "porcentaje_aprobacion": 85,
     "orden_desbloqueo": 1, "tipo_feedback": "detallado",
     "usa_cronometro": False},
]


# ============================================================
# DATOS: PREGUNTAS DE EJEMPLO (Fase 1, Seccion 1, Suma)
# ============================================================

PREGUNTAS_SUMA_SECCION1 = [
    {
        "enunciado": "Quanto e 45 + 38?",
        "respuesta_correcta": "83",
        "datos_numericos": {"a": 45, "b": 38, "operacion_esperada": "suma"},
        "explicacion_paso_a_paso": {
            "titulo": "Vamos somar passo a passo",
            "pasos": [
                {"orden": 1, "texto": "Somamos as unidades", "calculo": "5 + 8 = 13. Escrevemos 3 e levamos 1."},
                {"orden": 2, "texto": "Somamos as dezenas", "calculo": "4 + 3 + 1 = 8."},
                {"orden": 3, "texto": "O resultado final e 83."},
            ]
        },
        "alternativas": [
            {"texto": "83", "es_correcta": True, "orden": 1},
            {"texto": "73", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Voce esqueceu de levar 1 na soma das unidades. 5 + 8 = 13, nao 3."},
            {"texto": "813", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.VALOR_POSICIONAL,
             "feedback_error": "Voce somou cada digito separadamente (4+3=7, 5+8=13) sem considerar o valor posicional."},
            {"texto": "82", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "Confira novamente: 5 + 8 = 13, nao 12. Lembre de conferir cada passo."},
        ]
    },
    {
        "enunciado": "Quanto e 127 + 56?",
        "respuesta_correcta": "183",
        "datos_numericos": {"a": 127, "b": 56, "operacion_esperada": "suma"},
        "explicacion_paso_a_paso": {
            "titulo": "Vamos somar passo a passo",
            "pasos": [
                {"orden": 1, "texto": "Somamos as unidades", "calculo": "7 + 6 = 13. Escrevemos 3 e levamos 1."},
                {"orden": 2, "texto": "Somamos as dezenas", "calculo": "2 + 5 + 1 = 8."},
                {"orden": 3, "texto": "Centenas", "calculo": "1 fica como esta."},
                {"orden": 4, "texto": "O resultado final e 183."},
            ]
        },
        "alternativas": [
            {"texto": "183", "es_correcta": True, "orden": 1},
            {"texto": "173", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Voce esqueceu de levar 1 das unidades para as dezenas."},
            {"texto": "193", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Confira a soma das dezenas: 2 + 5 + 1 = 8, nao 9."},
            {"texto": "1813", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.VALOR_POSICIONAL,
             "feedback_error": "Voce concatenou os numeros em vez de somar. Lembre de alinhar por valor posicional."},
        ]
    },
    {
        "enunciado": "Quanto e 89 + 11?",
        "respuesta_correcta": "100",
        "datos_numericos": {"a": 89, "b": 11, "operacion_esperada": "suma"},
        "explicacion_paso_a_paso": {
            "titulo": "Vamos somar passo a passo",
            "pasos": [
                {"orden": 1, "texto": "Somamos as unidades", "calculo": "9 + 1 = 10. Escrevemos 0 e levamos 1."},
                {"orden": 2, "texto": "Somamos as dezenas", "calculo": "8 + 1 + 1 = 10. Escrevemos 0 e levamos 1."},
                {"orden": 3, "texto": "Centenas", "calculo": "Levamos 1. O resultado e 100."},
            ]
        },
        "alternativas": [
            {"texto": "100", "es_correcta": True, "orden": 1},
            {"texto": "90", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Voce esqueceu de somar a dezena do 11. 89 + 11 nao e 89 + 1."},
            {"texto": "910", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.VALOR_POSICIONAL,
             "feedback_error": "Voce colocou os numeros lado a lado em vez de somar."},
            {"texto": "99", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "Confira: 9 + 1 = 10, nao 9. Leve o 1 para as dezenas."},
        ]
    },
    {
        "enunciado": "Quanto e 256 + 144?",
        "respuesta_correcta": "400",
        "datos_numericos": {"a": 256, "b": 144, "operacion_esperada": "suma"},
        "explicacion_paso_a_paso": {
            "titulo": "Vamos somar passo a passo",
            "pasos": [
                {"orden": 1, "texto": "Somamos as unidades", "calculo": "6 + 4 = 10. Escrevemos 0 e levamos 1."},
                {"orden": 2, "texto": "Somamos as dezenas", "calculo": "5 + 4 + 1 = 10. Escrevemos 0 e levamos 1."},
                {"orden": 3, "texto": "Somamos as centenas", "calculo": "2 + 1 + 1 = 4."},
                {"orden": 4, "texto": "O resultado final e 400."},
            ]
        },
        "alternativas": [
            {"texto": "400", "es_correcta": True, "orden": 1},
            {"texto": "390", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Voce esqueceu de levar 1 das dezenas para as centenas."},
            {"texto": "300", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Confira cada coluna: unidades (6+4=10), dezenas (5+4+1=10), centenas (2+1+1=4)."},
            {"texto": "4100", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.VALOR_POSICIONAL,
             "feedback_error": "Lembre que cada coluna so pode ter um digito. Se passa de 9, leve para a proxima coluna."},
        ]
    },
    {
        "enunciado": "Quanto e 78 + 22?",
        "respuesta_correcta": "100",
        "datos_numericos": {"a": 78, "b": 22, "operacion_esperada": "suma"},
        "explicacion_paso_a_paso": {
            "titulo": "Vamos somar passo a passo",
            "pasos": [
                {"orden": 1, "texto": "Somamos as unidades", "calculo": "8 + 2 = 10. Escrevemos 0 e levamos 1."},
                {"orden": 2, "texto": "Somamos as dezenas", "calculo": "7 + 2 + 1 = 10. Escrevemos 0 e levamos 1."},
                {"orden": 3, "texto": "O resultado e 100."},
            ]
        },
        "alternativas": [
            {"texto": "100", "es_correcta": True, "orden": 1},
            {"texto": "90", "es_correcta": False, "orden": 2,
             "tipo_error": TipoErrorEnum.CALCULO,
             "feedback_error": "Voce nao levou o 1 das unidades."},
            {"texto": "910", "es_correcta": False, "orden": 3,
             "tipo_error": TipoErrorEnum.VALOR_POSICIONAL,
             "feedback_error": "Colocou os resultados lado a lado em vez de alinhar por posicao."},
            {"texto": "110", "es_correcta": False, "orden": 4,
             "tipo_error": TipoErrorEnum.ATENCION,
             "feedback_error": "Confira as dezenas: 7 + 2 + 1 = 10, nao 11."},
        ]
    },
]


# ============================================================
# FUNCIONES DE INSERCION
# ============================================================

async def create_admin_user():
    """Crea el usuario administrador si no existe."""
    print("Creando usuario administrador...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == "admin@logicakids.pro")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("  Admin ya existe. Saltando.")
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
        await session.commit()
        print(f"  Admin creado: admin@logicakids.pro / admin123")
        return admin_id


async def create_fases():
    """Crea las fases del plan de estudio."""
    print("Creando fases...")
    async with AsyncSessionLocal() as session:
        for f in FASES_DATA:
            result = await session.execute(
                select(Fase).where(Fase.id == f["id"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  Fase '{f['nombre']}' ya existe. Saltando.")
                continue

            fase = Fase(**f, estado=StatusEnum.ACTIVO)
            session.add(fase)
            print(f"  Creada: {f['nombre']}")

        await session.commit()


async def create_configuracion_progreso():
    """Crea las reglas de avance para cada bloque."""
    print("Creando configuracion de progreso...")
    async with AsyncSessionLocal() as session:
        for c in CONFIGURACION_DATA:
            result = await session.execute(
                select(ConfiguracionProgreso).where(
                    ConfiguracionProgreso.fase_id == c["fase_id"],
                    ConfiguracionProgreso.seccion == c["seccion"],
                    ConfiguracionProgreso.operacion == c["operacion"],
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  Config F{c['fase_id']}-S{c['seccion']}-{c['operacion'].value} ya existe. Saltando.")
                continue

            config = ConfiguracionProgreso(**c)
            session.add(config)
            print(f"  Creada: F{c['fase_id']}-S{c['seccion']}-{c['operacion'].value} "
                  f"({c['cantidad_requerida']} preguntas, {c['porcentaje_aprobacion']}%)")

        await session.commit()


async def create_preguntas_ejemplo(admin_id: str):
    """Crea preguntas de ejemplo para Fase 1, Seccion 1, Suma."""
    print("Creando preguntas de ejemplo (Fase 1, Seccion 1, Suma)...")
    async with AsyncSessionLocal() as session:
        for i, p_data in enumerate(PREGUNTAS_SUMA_SECCION1):
            # Verificar si ya existe por enunciado
            result = await session.execute(
                select(Pregunta).where(Pregunta.enunciado == p_data["enunciado"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  Pregunta '{p_data['enunciado'][:40]}...' ya existe. Saltando.")
                continue

            # Crear pregunta
            pregunta = Pregunta(
                fase_id=2,  # Fase 1
                seccion=1,
                operacion=OperacionEnum.SUMA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION,
                enunciado=p_data["enunciado"],
                respuesta_correcta=p_data["respuesta_correcta"],
                datos_numericos=p_data["datos_numericos"],
                explicacion_paso_a_paso=p_data["explicacion_paso_a_paso"],
                creado_por=admin_id,
                estado=StatusEnum.ACTIVO,
            )
            session.add(pregunta)
            await session.flush()  # Para obtener el ID

            # Crear alternativas
            for alt_data in p_data["alternativas"]:
                alternativa = Alternativa(
                    pregunta_id=pregunta.id,
                    texto=alt_data["texto"],
                    es_correcta=alt_data["es_correcta"],
                    orden=alt_data["orden"],
                    tipo_error=alt_data.get("tipo_error"),
                    feedback_error=alt_data.get("feedback_error"),
                )
                session.add(alternativa)

            print(f"  Creada: '{p_data['enunciado']}' con {len(p_data['alternativas'])} alternativas")

        await session.commit()

    print(f"  Total: {len(PREGUNTAS_SUMA_SECCION1)} preguntas de ejemplo insertadas.")


# ============================================================
# MAIN
# ============================================================

async def main():
    print("=" * 60)
    print("LogicaKids Pro - Seed Pedagogico")
    print("=" * 60)
    print()

    # Crear tablas si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 1. Admin
    admin_id = await create_admin_user()

    # 2. Fases
    await create_fases()

    # 3. Configuracion de progreso
    await create_configuracion_progreso()

    # 4. Preguntas de ejemplo
    await create_preguntas_ejemplo(admin_id)

    await engine.dispose()

    print()
    print("=" * 60)
    print("Seed completado!")
    print("=" * 60)
    print()
    print("Resumen:")
    print(f"  - 1 usuario administrador (admin@logicakids.pro / admin123)")
    print(f"  - {len(FASES_DATA)} fases creadas (Fase 0 y Fase 1)")
    print(f"  - {len(CONFIGURACION_DATA)} reglas de progreso")
    print(f"  - {len(PREGUNTAS_SUMA_SECCION1)} preguntas de ejemplo (Fase 1, Seccion 1, Suma)")
    print()


if __name__ == "__main__":
    asyncio.run(main())
