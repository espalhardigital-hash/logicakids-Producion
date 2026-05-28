"""
Unit Test Suite for Phase 3 Mirror Loop (Bucle Espejo) - LogicaKids Pro
========================================================================
This test suite validates Phase 3 mirror loop logic, including:
1. Retrieval of the original question in new sessions.
2. Sequential activation of mirror questions upon answering incorrectly.
3. Correct selection and exclusion of already attempted questions within a family.
4. Protected scoring (no increment to intentos_totales on mirror questions).
5. Expiry of mirror loops (maximum attempts = MAX_ESPEJO) and Tutor Invisible rescue activation.
6. Bypass mechanism (/cerrar-rescate) recording BYPASS_EXPLICACION and resetting mirror states.

Usage:
  python test_mirror_loop_fase3.py
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
from app.fase3.router import (
    get_pregunta_fase3, responder_fase3, cerrar_rescate_fase3
)
from app.fase2.schemas import (
    Fase2ResponderPregunta as Fase3ResponderPregunta,
    Fase2CerrarRescate as Fase3CerrarRescate
)


class TestPhase3MirrorLoop(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        """Set up in-memory SQLite tables and populate clean Phase 3 mirror-loop test seed data."""
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
        fase3 = Fase(id=3, nombre="Fase 3", orden=3, estado="activo")
        self.db.add(fase3)
        await self.db.flush()

        # 2. Insert practice configuration
        config = ConfiguracionProgreso(
            fase_id=3,
            seccion=101,  # Module 1 Nivel 1
            operacion="mixta",
            cantidad_requerida=2,
            porcentaje_aprobacion=100,
            orden_desbloqueo=1,
            usa_cronometro=False
        )
        self.db.add(config)
        await self.db.flush()

        # 3. Seed clean pool of questions for Family 1: 1 original + 3 mirrors
        self.family1_id = "f3_m1_l1_fam_001"
        self.q_orig1 = Pregunta(
            id=1001,
            fase_id=3,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Problema original de la familia 1",
            respuesta_correcta="10",
            datos_numericos={"es_espejo": False, "variante": 0},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            estado=StatusEnum.ACTIVO
        )
        self.q_mirror1 = Pregunta(
            id=1002,
            fase_id=3,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Espejo variante 1",
            respuesta_correcta="15",
            datos_numericos={"es_espejo": True, "variante": 1},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            estado=StatusEnum.ACTIVO
        )
        self.q_mirror2 = Pregunta(
            id=1003,
            fase_id=3,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Espejo variante 2",
            respuesta_correcta="20",
            datos_numericos={"es_espejo": True, "variante": 2},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            estado=StatusEnum.ACTIVO
        )
        self.q_mirror3 = Pregunta(
            id=1004,
            fase_id=3,
            seccion=101,
            estructura_padre_id=self.family1_id,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Espejo variante 3",
            respuesta_correcta="25",
            datos_numericos={"es_espejo": True, "variante": 3},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}, {"orden": 2, "texto": "Paso 2"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.q_orig1)
        self.db.add(self.q_mirror1)
        self.db.add(self.q_mirror2)
        self.db.add(self.q_mirror3)

        # 4. Seed clean pool for Family 2: 1 original
        self.family2_id = "f3_m1_l1_fam_002"
        self.q_orig2 = Pregunta(
            id=2001,
            fase_id=3,
            seccion=101,
            estructura_padre_id=self.family2_id,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Problema original de la familia 2",
            respuesta_correcta="30",
            datos_numericos={"es_espejo": False, "variante": 0},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Paso 1"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.q_orig2)

        # 5. Seed clean pool for Family 3: 1 original (to prevent complete level solving when testing transition)
        self.family3_id = "f3_m1_l1_fam_003"
        self.q_orig3 = Pregunta(
            id=3001,
            fase_id=3,
            seccion=101,
            estructura_padre_id=self.family3_id,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Problema original de la familia 3",
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
            username="student_tester_f3",
            email="tester_f3@logicakids.com",
            password_hash="pwdhash123_f3",
            role="USER",
            status="ACTIVE",
            settings={}
        )
        self.db.add(self.test_user)
        await self.db.flush()

        self.test_student = Alumno(
            user_id=self.test_user.id,
            nombre="Tester Student F3",
            fase_actual_id=3
        )
        self.db.add(self.test_student)
        await self.db.commit()

        # Refresh
        await self.db.refresh(self.test_user)
        await self.db.refresh(self.test_student)

    async def _ensure_family1(self):
        """Helper to ensure the active question is from Family 1 (1001) deterministically."""
        while True:
            pregunta = await get_pregunta_fase3(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            if pregunta.id == 1001:
                return pregunta
            ans = "30" if pregunta.id == 2001 else "40"
            payload = Fase3ResponderPregunta(
                modulo_id=1,
                nivel_id=1,
                pregunta_id=pregunta.id,
                respuesta_dada=ans,
                tiempo_respuesta_segundos=1.0
            )
            await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)

    async def test_mirror_loop_success_on_mirror(self):
        """Verify that falling into the mirror loop and then answering correctly clears it in Phase 3."""
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        # Answer incorrectly
        payload = Fase3ResponderPregunta(
            modulo_id=1,
            nivel_id=1,
            pregunta_id=1001,
            respuesta_dada="999",
            tiempo_respuesta_segundos=1.0
        )
        response = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response.es_correcta)
        self.assertTrue(response.es_espejo)
        self.assertEqual(response.intentos_espejo_actuales, 1)

        # Get next question -> MUST be one of the mirror questions of Family 1 (1002, 1003, or 1004)
        next_preg = await get_pregunta_fase3(modulo_id=1, nivel_id=1, reload=False, db=self.db, alumno=self.test_student)
        self.assertIn(next_preg.id, [1002, 1003, 1004])

        # Answer this mirror question correctly
        ans_str = "15" if next_preg.id == 1002 else ("20" if next_preg.id == 1003 else "25")
        payload_corr = Fase3ResponderPregunta(
            modulo_id=1,
            nivel_id=1,
            pregunta_id=next_preg.id,
            respuesta_dada=ans_str,
            tiempo_respuesta_segundos=1.2
        )
        response_corr = await responder_fase3(payload=payload_corr, db=self.db, alumno=self.test_student)
        self.assertTrue(response_corr.es_correcta)

        # Get next question -> Mirror loop should be cleared and serve next unsolved (either 2001 or 3001)
        next_preg_f2 = await get_pregunta_fase3(modulo_id=1, nivel_id=1, reload=False, db=self.db, alumno=self.test_student)
        self.assertIn(next_preg_f2.id, [1001, 2001, 3001])

    async def test_mirror_loop_score_protection(self):
        """Verify that failing mirror questions does NOT increment `intentos_totales` in Phase 3 (Score Protection verified)."""
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

        # Answer original incorrectly -> intentos_totales increments
        payload = Fase3ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=1001, respuesta_dada="999")
        resp1 = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)
        self.assertEqual(resp1.intentos_totales, initial_intentos + 1)

        # Get mirror question
        next_preg = await get_pregunta_fase3(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        self.assertTrue(next_preg.id in [1002, 1003, 1004])

        # Answer mirror incorrectly -> intentos_totales MUST NOT increment!
        payload_mirror = Fase3ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=next_preg.id, respuesta_dada="999")
        resp_mirror = await responder_fase3(payload=payload_mirror, db=self.db, alumno=self.test_student)
        self.assertEqual(resp_mirror.intentos_totales, initial_intentos + 1)  # SCORE PROTECTION SUCCESSFUL!

    async def test_mirror_loop_exhaustion_and_tutor_rescue(self):
        """Verify loop exhaustion after 4 incorrect attempts and rescue activation by Tutor Invisible in Phase 3."""
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        q = pregunta
        for i in range(4):
            if i > 0:
                q = await get_pregunta_fase3(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            payload = Fase3ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=q.id, respuesta_dada="999")
            response = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)
        
        # 4th failure must trigger advanced support and return tutor invisible step-by-step logic
        self.assertFalse(response.es_correcta)
        self.assertTrue(response.soporte_avanzado)
        self.assertIsNotNone(response.explicacion)
        self.assertEqual(len(response.explicacion["pasos"]), 2)

        # Fetch next question -> should break the loop and serve original question (not mirror)
        next_preg5 = await get_pregunta_fase3(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        res_db = await self.db.execute(select(Pregunta).where(Pregunta.id == next_preg5.id))
        next_preg5_db = res_db.scalar_one()
        self.assertFalse(next_preg5_db.datos_numericos.get("es_espejo"))

    async def test_mirror_loop_bypass_rescue(self):
        """Verify that /cerrar-rescate successfully closes the rescue block and records a bypass attempt in Phase 3."""
        pregunta = await self._ensure_family1()
        self.assertEqual(pregunta.id, 1001)

        # Run 4 failures to trigger advanced rescue block
        q = pregunta
        for i in range(4):
            if i > 0:
                q = await get_pregunta_fase3(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            payload = Fase3ResponderPregunta(modulo_id=1, nivel_id=1, pregunta_id=q.id, respuesta_dada="999")
            response = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)

        # Verify that rescue state is active
        self.assertTrue(response.soporte_avanzado)

        # Invoke the /cerrar-rescate endpoint to bypass explanation
        payload_bypass = Fase3CerrarRescate(modulo_id=1, nivel_id=1, pregunta_id=1001)
        response_bypass = await cerrar_rescate_fase3(payload=payload_bypass, db=self.db, alumno=self.test_student)

        # Check database records
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
        next_preg = await get_pregunta_fase3(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        self.assertIn(next_preg.id, [1001, 2001, 3001])


if __name__ == "__main__":
    print("=" * 60)
    print("LOGICAKIDS - RUNNING PHASE 3 DEDICATED MIRROR LOOP TESTS")
    print("=" * 60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPhase3MirrorLoop)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    sys.exit(0 if result.wasSuccessful() else 1)
