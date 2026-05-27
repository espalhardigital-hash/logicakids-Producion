"""
Unit Test Suite for Phase 2 Mirror Loop (Bucle Espejo) - LogicaKids Pro
========================================================================
This test suite validates:
1. Retrieval of the original question in new sessions.
2. Sequential activation of mirror questions upon answering incorrectly.
3. Correct selection and exclusion of already attempted questions within a family.
4. Protected scoring (no increment to intentos_totales on mirror questions).
5. Expiry of mirror loops (maximum attempts = MAX_ESPEJO) and Tutor Invisible rescue activation.
6. Bypass mechanism (/cerrar-rescate) recording BYPASS_EXPLICACION and resetting mirror states.

Usage:
  python test_mirror_loop.py
"""

import asyncio
import os
import sys
import unittest
import uuid
from datetime import datetime
from sqlalchemy import select, and_, delete, event
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles

# Register JSONB compilation override for SQLite compatibility
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

# Add current directory to path to locate modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.models.sql_models import (
    User, Alumno, Pregunta, Alternativa, Intento,
    ProgresoMaestria, EstadoProgresoEnum, TipoPreguntaEnum, TipoErrorEnum,
    Fase, ConfiguracionProgreso, StatusEnum, OperacionEnum
)
from app.fase2.router import (
    get_pregunta_fase2, responder_fase2, cerrar_rescate_fase2
)
from app.fase2.schemas import (
    Fase2ResponderPregunta, Fase2CerrarRescate
)


class TestPhase2MirrorLoop(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        """Set up in-memory SQLite tables and populate clean mirror-loop test seed data."""
        self.engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
        
        # Register standard MOD function on SQLite connection
        @event.listens_for(self.engine.sync_engine, "connect")
        def register_sqlite_functions(dbapi_connection, connection_record):
            dbapi_connection.create_function("mod", 2, lambda x, y: x % y)

        self.SessionLocal = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
        self.db = self.SessionLocal()
        
        # Create all tables on this fresh DB
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # 1. Insert Fases
        fase2 = Fase(id=2, nombre="Fase 2", orden=2, estado="activo")
        self.db.add(fase2)
        await self.db.flush()

        # 2. Insert practice configuration
        config = ConfiguracionProgreso(
            fase_id=2,
            seccion=101,  # Module 1 Nivel 1
            operacion="suma",
            cantidad_requerida=2,
            porcentaje_aprobacion=100,
            orden_desbloqueo=1,
            usa_cronometro=False
        )
        self.db.add(config)
        await self.db.flush()

        # 3. Seed clean pool of questions for Family 1: 1 original + 3 mirrors
        self.family1_id = "f2_m1_l1_fam_001"
        self.q_orig1 = Pregunta(
            id=1001,
            fase_id=2,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Encontrar el valor de Y dado que Y + 2 = 6",
            respuesta_correcta="4",
            datos_numericos={"es_espejo": False, "variante": 0},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            errores_previstos={"respuestas_erroneas": [{"valor": "8", "tipo_error": "inversa", "feedback": "¡Feedback!"}]},
            estado=StatusEnum.ACTIVO
        )
        self.q_mirror1 = Pregunta(
            id=1002,
            fase_id=2,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Encontrar el valor de A dado que A + 5 = 12",
            respuesta_correcta="7",
            datos_numericos={"es_espejo": True, "variante": 1},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            errores_previstos={"respuestas_erroneas": [{"valor": "17", "tipo_error": "inversa", "feedback": "¡Feedback!"}]},
            estado=StatusEnum.ACTIVO
        )
        self.q_mirror2 = Pregunta(
            id=1003,
            fase_id=2,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Encontrar el valor de M dado que M + 1 = 9",
            respuesta_correcta="8",
            datos_numericos={"es_espejo": True, "variante": 2},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            errores_previstos={"respuestas_erroneas": [{"valor": "10", "tipo_error": "inversa", "feedback": "¡Feedback!"}]},
            estado=StatusEnum.ACTIVO
        )
        self.q_mirror3 = Pregunta(
            id=1004,
            fase_id=2,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Encontrar el valor de P dado que P + 6 = 15",
            respuesta_correcta="9",
            datos_numericos={"es_espejo": True, "variante": 3},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            errores_previstos={"respuestas_erroneas": [{"valor": "21", "tipo_error": "inversa", "feedback": "¡Feedback!"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.q_orig1)
        self.db.add(self.q_mirror1)
        self.db.add(self.q_mirror2)
        self.db.add(self.q_mirror3)

        # 4. Seed clean pool for Family 2: 1 original (to allow transition out of Family 1)
        self.family2_id = "f2_m1_l1_fam_002"
        self.q_orig2 = Pregunta(
            id=2001,
            fase_id=2,
            seccion=101,
            estructura_padre_id=self.family2_id,
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Encontrar el valor de B dado que B + 3 = 10",
            respuesta_correcta="7",
            datos_numericos={"es_espejo": False, "variante": 0},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.q_orig2)

        # 5. Seed clean pool for Family 3: 1 original (to prevent complete level solving when testing transition)
        self.family3_id = "f2_m1_l1_fam_003"
        self.q_orig3 = Pregunta(
            id=3001,
            fase_id=2,
            seccion=101,
            estructura_padre_id=self.family3_id,
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Encontrar el valor de C dado que C + 4 = 44",
            respuesta_correcta="40",
            datos_numericos={"es_espejo": False, "variante": 0},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.q_orig3)
        await self.db.flush()

        # 6. Create a temporary Alumno linked to a temporary User
        self.test_user = User(
            id=str(uuid.uuid4()),
            username="student_tester",
            email="tester@logicakids.com",
            password_hash="pwdhash123",
            role="USER",
            status="ACTIVE",
            settings={}
        )
        self.db.add(self.test_user)
        await self.db.flush()

        self.test_student = Alumno(
            user_id=self.test_user.id,
            nombre="Tester Student",
            fase_actual_id=2
        )
        self.db.add(self.test_student)
        await self.db.commit()

        # Refresh
        await self.db.refresh(self.test_user)
        await self.db.refresh(self.test_student)

    async def _ensure_family1(self):
        """Helper to ensure the active question is from Family 1 (1001) deterministically."""
        while True:
            pregunta = await get_pregunta_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            if pregunta.id == 1001:
                return pregunta
            ans = "7" if pregunta.id == 2001 else "40"
            payload = Fase2ResponderPregunta(
                modulo_id=1,
                nivel_id=1,
                pregunta_id=pregunta.id,
                respuesta_dada=ans,
                tiempo_respuesta_segundos=1.0
            )
            await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)

    async def test_mirror_loop_success_on_mirror(self):
        """Verify that falling into the mirror loop and then answering correctly clears it."""
        # 1. Fetch first question -> ensure it is Family 1 (1001)
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        # 2. Answer incorrectly
        payload = Fase2ResponderPregunta(
            modulo_id=1,
            nivel_id=1,
            pregunta_id=1001,
            respuesta_dada="8",  # Trigger error
            tiempo_respuesta_segundos=1.0
        )
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response.es_correcta)
        self.assertTrue(response.es_espejo)
        self.assertEqual(response.intentos_espejo_actuales, 1)

        # 3. Get next question -> MUST be one of the mirror questions of Family 1 (1002, 1003, or 1004)
        next_preg = await get_pregunta_fase2(modulo_id=1, nivel_id=1, reload=False, db=self.db, alumno=self.test_student)
        self.assertIn(next_preg.id, [1002, 1003, 1004])

        # 4. Answer this mirror question correctly
        payload_corr = Fase2ResponderPregunta(
            modulo_id=1,
            nivel_id=1,
            pregunta_id=next_preg.id,
            respuesta_dada=next_preg.id == 1002 and "7" or (next_preg.id == 1003 and "8" or "9"),
            tiempo_respuesta_segundos=1.2
        )
        response_corr = await responder_fase2(payload=payload_corr, db=self.db, alumno=self.test_student)
        self.assertTrue(response_corr.es_correcta)

        # 5. Get next question -> Mirror loop should be cleared and serve next unsolved (either 2001 or 3001).
        next_preg_f2 = await get_pregunta_fase2(modulo_id=1, nivel_id=1, reload=False, db=self.db, alumno=self.test_student)
        self.assertIn(next_preg_f2.id, [2001, 3001])

    async def test_mirror_loop_score_protection(self):
        """Verify that failing mirror questions does NOT increment `intentos_totales` to protect student visual score."""
        # 1. Fetch first question -> ensure it is Family 1 (1001)
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        # Determine starting score
        prog_query = await self.db.execute(
            select(ProgresoMaestria).where(and_(
                ProgresoMaestria.alumno_id == self.test_student.id,
                ProgresoMaestria.seccion == 101
            ))
        )
        prog = prog_query.scalar_one_or_none()
        initial_intentos = prog.intentos_totales if prog else 0

        # 2. Answer original (1001) incorrectly -> should increment `intentos_totales` by 1.
        payload = Fase2ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=1001, respuesta_dada="8")
        resp1 = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        self.assertEqual(resp1.intentos_totales, initial_intentos + 1)

        # 3. Get mirror question
        next_preg = await get_pregunta_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        self.assertTrue(next_preg.id in [1002, 1003, 1004])

        # 4. Answer mirror incorrectly -> should NOT increment `intentos_totales`!
        payload_mirror = Fase2ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=next_preg.id, respuesta_dada="999")
        resp_mirror = await responder_fase2(payload=payload_mirror, db=self.db, alumno=self.test_student)
        self.assertEqual(resp_mirror.intentos_totales, initial_intentos + 1)  # SCORE PROTECTION ACTIVE!

    async def test_mirror_loop_exhaustion_and_tutor_rescue(self):
        """Verify loop exhaustion after 4 incorrect attempts and rescue activation by Tutor Invisible."""
        # 1. Fetch first question -> ensure it is Family 1 (1001)
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        q = pregunta
        for i in range(4):
            if i > 0:
                q = await get_pregunta_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            payload = Fase2ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=q.id, respuesta_dada="999")
            response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        
        # 4th failure must trigger advanced support and return tutor invisible step-by-step logic!
        self.assertFalse(response.es_correcta)
        self.assertTrue(response.soporte_avanzado)
        self.assertIsNotNone(response.explicacion)
        self.assertEqual(len(response.explicacion["pasos"]), 2)

        # 5. Fetch next question -> Mirror loop of Family 1 is fully exhausted.
        # It must break the loop and serve an original question (not a mirror!).
        next_preg5 = await get_pregunta_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        res_db = await self.db.execute(select(Pregunta).where(Pregunta.id == next_preg5.id))
        next_preg5_db = res_db.scalar_one()
        self.assertFalse(next_preg5_db.datos_numericos.get("es_espejo"))

    async def test_mirror_loop_bypass_rescue(self):
        """Verify that /cerrar-rescate successfully closes the rescue block and records a bypass attempt."""
        # 1. Fetch first question -> ensure it is Family 1 (1001)
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        # Run 4 failures to trigger advanced rescue block
        q = pregunta
        for i in range(4):
            if i > 0:
                q = await get_pregunta_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            payload = Fase2ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=q.id, respuesta_dada="999")
            response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)

        # Verify that rescue state is active
        self.assertTrue(response.soporte_avanzado)

        # Invoke the /cerrar-rescate endpoint to bypass explanation
        payload_bypass = Fase2CerrarRescate(modulo_id=1, nivel_id=1, pregunta_id=1001)
        response_bypass = await cerrar_rescate_fase2(payload=payload_bypass, db=self.db, alumno=self.test_student)

        # Check database records
        # There should be an Intento registered with answer = 'BYPASS_EXPLICACION'
        result_int = await self.db.execute(
            select(Intento).where(and_(
                Intento.alumno_id == self.test_student.id,
                Intento.respuesta_dada == "BYPASS_EXPLICACION"
            ))
        )
        bypass_attempts = result_int.scalars().all()
        self.assertEqual(len(bypass_attempts), 1)
        self.assertEqual(bypass_attempts[0].pregunta_id, 1001)

        # Fetch next question -> should transition cleanly out of the family since it is bypassed
        next_preg = await get_pregunta_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        self.assertIn(next_preg.id, [2001, 3001])


if __name__ == "__main__":
    print("=" * 60)
    print("LOGICAKIDS - RUNNING PHASE 2 DEDICATED MIRROR LOOP TESTS")
    print("=" * 60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPhase2MirrorLoop)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    sys.exit(0 if result.wasSuccessful() else 1)
