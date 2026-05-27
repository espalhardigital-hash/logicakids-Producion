"""
Unit Test Suite for Phase 2 - LogicaKids Pro
=============================================
This test suite verifies all key functionalities, design changes, and logical corrections
made to Phase 2:
1. Dashboard loading and unlocked states.
2. Theory loading.
3. Mirror Loop (Bucle Espejo) and Tutor Invisible cognitive error feedback.
4. Multi-step question solving (Constructor de Soluciones, Module 4) using IntentoPregunta and IntentoPaso.
5. Early Exit in challenges.

Usage:
  python test_fase2.py
"""

import asyncio
import os
import sys
import unittest
from datetime import datetime
from sqlalchemy import select, and_, delete

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import event
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles

# Register JSONB compilation override for SQLite compatibility
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

from app.db.base import Base
from app.models.sql_models import (
    User, Alumno, Pregunta, Alternativa, Intento,
    ProgresoMaestria, EstadoProgresoEnum, TipoPreguntaEnum, TipoErrorEnum,
    Fase, ConfiguracionProgreso, StatusEnum, OperacionEnum
)
from app.fase2.models import IntentoPregunta, IntentoPaso
from app.fase2.router import (
    get_fase2_dashboard, get_lectura_fase2, get_pregunta_fase2,
    responder_fase2, cerrar_rescate_fase2
)
from app.fase2.schemas import (
    Fase2ResponderPregunta, Fase2CerrarRescate
)


class TestPhase2Integration(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        """Set up in-memory SQLite tables and populate minimal seed data."""
        # Create a completely isolated, fresh in-memory database engine for this test
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
        fase3 = Fase(id=3, nombre="Fase 3", orden=3, estado="activo")
        self.db.add(fase2)
        self.db.add(fase3)
        await self.db.flush()

        # 2. Insert minimal Configs for progression
        configs = [
            ConfiguracionProgreso(fase_id=2, seccion=101, operacion="suma", cantidad_requerida=2, porcentaje_aprobacion=80, orden_desbloqueo=1, usa_cronometro=False),
            ConfiguracionProgreso(fase_id=2, seccion=102, operacion="suma", cantidad_requerida=2, porcentaje_aprobacion=80, orden_desbloqueo=2, usa_cronometro=False),
            ConfiguracionProgreso(fase_id=2, seccion=401, operacion="mixta", cantidad_requerida=1, porcentaje_aprobacion=80, orden_desbloqueo=14, usa_cronometro=False),
            ConfiguracionProgreso(fase_id=2, seccion=1011, operacion="mixta", cantidad_requerida=3, porcentaje_aprobacion=90, orden_desbloqueo=15, usa_cronometro=True, tiempo_default_segundos=25)
        ]
        self.db.add_all(configs)
        await self.db.flush()

        # 3. Seed theory (using the actual seeder)
        from app.fase2.seed import seed_teoria_niveles
        await seed_teoria_niveles(self.db)

        # 4. Seed practice questions (original + mirror) for Module 1 Nivel 1
        q_orig = Pregunta(
            fase_id=2,
            seccion=101,
            estructura_padre_id="f2_m1_l1_fam_001",
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Halla el doble de 10.",
            respuesta_correcta="20",
            datos_numericos={"base": 10, "operacion": "doble", "es_espejo": False, "variante": 0},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Multiplicar por 2"}]},
            errores_previstos={
                "respuestas_erroneas": [
                    {"valor": "12", "tipo_error": "impulso", "feedback": "¡Cuidado con la trampa del apuro!"}
                ],
                "calculo": "Revisa bien las tablas."
            },
            estado=StatusEnum.ACTIVO
        )
        q_mirror = Pregunta(
            fase_id=2,
            seccion=101,
            estructura_padre_id="f2_m1_l1_fam_001",
            operacion=OperacionEnum.SUMA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Halla el doble de 8.",
            respuesta_correcta="16",
            datos_numericos={"base": 8, "operacion": "doble", "es_espejo": True, "variante": 1},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Multiplicar por 2"}]},
            errores_previstos={
                "respuestas_erroneas": [
                    {"valor": "10", "tipo_error": "impulso", "feedback": "¡Cuidado con la trampa del apuro!"}
                ]
            },
            estado=StatusEnum.ACTIVO
        )
        self.db.add(q_orig)
        self.db.add(q_mirror)

        # 5. Seed constructor multi-step question for Module 4 Nivel 1
        q_const = Pregunta(
            fase_id=2,
            seccion=401,
            estructura_padre_id="f2_m4_l1_fam_001",
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.CONSTRUCTOR_CHAINED,
            enunciado="Lucas tiene cajas y crayones...",
            respuesta_correcta="14",
            datos_numericos={
                "es_espejo": False,
                "variante": 0,
                "pasos": [
                    {"titulo": "Paso 1", "descripcion": "Crayones total", "respuesta_correcta": "18"},
                    {"titulo": "Paso 2", "descripcion": "Utiles final", "respuesta_correcta": "14"}
                ]
            },
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Multiplica y resta"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(q_const)

        # 6. Seed 1 challenge question for Module 1 Desafío 1 (seccion 1011)
        q_chal = Pregunta(
            fase_id=2,
            seccion=1011,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Desafio: 5 + 4 * 2",
            respuesta_correcta="13",
            datos_numericos={"es_desafio": True},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Multiplica primero"}]},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(q_chal)
        await self.db.flush()

        # 7. Create a temporary User
        import uuid
        self.test_user = User(
            id=str(uuid.uuid4()),
            username="test_fase2_student",
            email="test_fase2_student@logicakids.com",
            password_hash="fakehashpwd123",
            role="USER",
            status="ACTIVE",
            settings={"unlockedLevels": {}}
        )
        self.db.add(self.test_user)
        await self.db.flush()

        # 8. Create a temporary Alumno linked to User
        self.test_student = Alumno(
            user_id=self.test_user.id,
            nombre="Test Student",
            fase_actual_id=2
        )
        self.db.add(self.test_student)
        await self.db.commit()

        # Refresh instances
        await self.db.refresh(self.test_user)
        await self.db.refresh(self.test_student)

    async def asyncTearDown(self):
        """Close SQLite session and dispose of the isolated engine."""
        await self.db.close()
        await self.engine.dispose()

    async def test_dashboard_loading(self):
        """Test that dashboard loads correctly and indicates unlocked status."""
        dashboard = await get_fase2_dashboard(db=self.db, alumno=self.test_student)
        self.assertEqual(dashboard.alumno_nombre, "Test Student")
        self.assertEqual(len(dashboard.modulos), 4)
        
        # M1L1 should be unlocked (en_progreso), others locked
        m1 = next((m for m in dashboard.modulos if m.modulo_id == 1), None)
        self.assertIsNotNone(m1)
        
        l1 = next((l for l in m1.niveles if l.nivel_id == 1), None)
        self.assertIsNotNone(l1)
        self.assertEqual(l1.estado, "en_progreso")

        l2 = next((l for l in m1.niveles if l.nivel_id == 2), None)
        self.assertIsNotNone(l2)
        self.assertEqual(l2.estado, "bloqueado")

    async def test_theory_loading(self):
        """Test loading theory content for a level."""
        # Load Module 1 Nivel 1 theory
        theory = await get_lectura_fase2(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        self.assertEqual(theory.modulo_id, 1)
        self.assertEqual(theory.nivel_id, 1)
        self.assertIsNotNone(theory.titulo)
        self.assertTrue(len(theory.parrafos) > 0)
        self.assertTrue(len(theory.interactivos) == 3)

    async def test_mirror_loop_and_tutor_invisible(self):
        """Test Bucle Espejo and cognitive error feedback (Tutor Invisible)."""
        # 1. Fetch first practice question for Module 1 Nivel 1
        pregunta = await get_pregunta_fase2(modulo_id=1, nivel_id=1, reload=False, db=self.db, alumno=self.test_student)
        self.assertIsNotNone(pregunta.id)
        
        # Load details from DB
        res_q = await self.db.execute(select(Pregunta).where(Pregunta.id == pregunta.id))
        db_pregunta = res_q.scalar_one()
        
        # Get correct answer
        correct_ans = db_pregunta.respuesta_correcta
        
        # Formulate an incorrect answer that triggers a mapped cognitive error (e.g. sum instead of multiply)
        # If the question is "Halla el doble de X", correct_ans is X*2. A common error is X+2.
        # Let's check the mistakes mapped in seed.py: "base + 2" or "base + 3" or "base + 4"
        base = db_pregunta.datos_numericos.get("base", 10)
        op = db_pregunta.datos_numericos.get("operacion", "doble")
        
        wrong_ans = str(base + (2 if op == "doble" else (3 if op == "triple" else (4 if op == "cuádruple" else -2))))
        
        # If the wrong answer happens to equal the correct one (unlikely), choose another one
        if wrong_ans == correct_ans:
            wrong_ans = "999"

        # 2. Submit wrong answer
        payload = Fase2ResponderPregunta(
            modulo_id=1,
            nivel_id=1,
            pregunta_id=pregunta.id,
            respuesta_dada=wrong_ans,
            tiempo_respuesta_segundos=2.5
        )
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        
        # Assertions for wrong response
        self.assertFalse(response.es_correcta)
        # Check that Tutor Invisible feedback is present! (Fix 2 verified!)
        self.assertIsNotNone(response.feedback_error)
        self.assertTrue("trampa" in response.feedback_error.lower() or "cuidado" in response.feedback_error.lower() or "alto" in response.feedback_error.lower())
        self.assertTrue(response.es_espejo)

        # 3. Retrieve next question (should be a mirror question!)
        next_pregunta = await get_pregunta_fase2(modulo_id=1, nivel_id=1, reload=False, db=self.db, alumno=self.test_student)
        self.assertNotEqual(next_pregunta.id, pregunta.id)
        
        # Load next question details
        res_next_q = await self.db.execute(select(Pregunta).where(Pregunta.id == next_pregunta.id))
        db_next_pregunta = res_next_q.scalar_one()
        
        # Check that it shares the same family (estructura_padre_id) and is indeed a mirror question
        self.assertEqual(db_next_pregunta.estructura_padre_id, db_pregunta.estructura_padre_id)
        self.assertTrue(db_next_pregunta.datos_numericos.get("es_espejo"))

    async def test_multistep_logic_and_modular_tables(self):
        """Test multi-step question grade isolation (Fix 1 verified)."""
        # Find a constructor_soluciones_chained question in Module 4 Nivel 1
        res_q = await self.db.execute(
            select(Pregunta).where(and_(
                Pregunta.fase_id == 2,
                Pregunta.seccion == 401, # M4L1
                Pregunta.tipo_pregunta == TipoPreguntaEnum.CONSTRUCTOR_CHAINED
            )).limit(1)
        )
        pregunta = res_q.scalar_one_or_none()
        if not pregunta:
            self.skipTest("No constructor questions found in M4L1.")
            
        pasos = pregunta.datos_numericos["pasos"]
        paso1_ans = pasos[0]["respuesta_correcta"]
        paso2_ans = pasos[1]["respuesta_correcta"]

        # 1. Answer Step 1 correctly
        payload = Fase2ResponderPregunta(
            modulo_id=4,
            nivel_id=1,
            pregunta_id=pregunta.id,
            respuesta_dada=paso1_ans,
            paso_numero=1,
            tiempo_respuesta_segundos=1.5
        )
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        
        # Should be correct for Step 1
        self.assertTrue(response.es_correcta)
        self.assertEqual(response.paso_aprobado, 1)
        self.assertEqual(response.valor_paso1_congelado, paso1_ans)

        # CRITICAL TEST: Check that the general completion did NOT increase to 100% yet!
        # Because we only solved Step 1 of a 2-step question.
        self.assertEqual(response.porcentaje_actual, 0)
        
        # Check database records
        # There should be an Intento in general table with es_correcta = False (isolated)
        res_attempts = await self.db.execute(
            select(Intento).where(and_(
                Intento.alumno_id == self.test_student.id,
                Intento.pregunta_id == pregunta.id
            ))
        )
        attempts = res_attempts.scalars().all()
        self.assertEqual(len(attempts), 1)
        self.assertFalse(attempts[0].es_correcta) # Must be False for intermediate step

        # There should be an IntentoPregunta and an IntentoPaso
        res_ip = await self.db.execute(select(IntentoPregunta).where(IntentoPregunta.pregunta_id == pregunta.id))
        int_preg = res_ip.scalar_one_or_none()
        self.assertIsNotNone(int_preg)
        self.assertFalse(int_preg.aprobada_completa)
        self.assertEqual(int_preg.intentos_totales, 1)

        res_steps = await self.db.execute(select(IntentoPaso).where(IntentoPaso.intento_pregunta_id == int_preg.id))
        steps = res_steps.scalars().all()
        self.assertEqual(len(steps), 1)
        self.assertEqual(steps[0].paso_numero, 1)
        self.assertTrue(steps[0].es_correcta)

        # 2. Answer Step 2 correctly
        payload = Fase2ResponderPregunta(
            modulo_id=4,
            nivel_id=1,
            pregunta_id=pregunta.id,
            respuesta_dada=paso2_ans,
            paso_numero=2,
            tiempo_respuesta_segundos=2.0
        )
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)

        self.assertTrue(response.es_correcta)
        self.assertEqual(response.paso_aprobado, 2)
        
        # CRITICAL TEST: Now that Step 2 (final) is solved, the level progress must rise!
        # Completion should be calculated.
        self.assertTrue(response.porcentaje_actual > 0)

        # Check database records
        # Now there should be an Intento with es_correcta = True
        res_attempts = await self.db.execute(
            select(Intento).where(and_(
                Intento.alumno_id == self.test_student.id,
                Intento.pregunta_id == pregunta.id,
                Intento.es_correcta == True
            ))
        )
        correct_attempts = res_attempts.scalars().all()
        self.assertEqual(len(correct_attempts), 1)

        # Check IntentoPregunta is now complete
        await self.db.refresh(int_preg)
        self.assertTrue(int_preg.aprobada_completa)
        self.assertEqual(int_preg.intentos_totales, 2)

        # Check IntentoPaso has Paso 2
        res_steps = await self.db.execute(
            select(IntentoPaso).where(and_(
                IntentoPaso.intento_pregunta_id == int_preg.id,
                IntentoPaso.paso_numero == 2
            ))
        )
        step2 = res_steps.scalar_one_or_none()
        self.assertIsNotNone(step2)
        self.assertTrue(step2.es_correcta)

    async def test_challenge_early_exit(self):
        """Test Early Exit aborts challenge and resets progress upon 3 errors."""
        # Retrieve first question of Desafío 1 in Module 1 (nivel_id 11)
        pregunta = await get_pregunta_fase2(modulo_id=1, nivel_id=11, reload=False, db=self.db, alumno=self.test_student)
        self.assertIsNotNone(pregunta.id)

        # Load details
        res_q = await self.db.execute(select(Pregunta).where(Pregunta.id == pregunta.id))
        db_pregunta = res_q.scalar_one()
        correct_ans = db_pregunta.respuesta_correcta
        wrong_ans = "9999"
        if wrong_ans == correct_ans:
            wrong_ans = "8888"

        # Submit 1st error
        payload = Fase2ResponderPregunta(
            modulo_id=1,
            nivel_id=11,
            pregunta_id=pregunta.id,
            respuesta_dada=wrong_ans,
            tiempo_respuesta_segundos=1.0
        )
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response.es_correcta)
        self.assertFalse(response.early_exit)
        self.assertEqual(response.errores_sesion, 1)

        # Submit 2nd error (on a potentially new question, but we reuse for ease of testing)
        payload.tiempo_respuesta_segundos = 1.2
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response.es_correcta)
        self.assertFalse(response.early_exit)
        self.assertEqual(response.errores_sesion, 2)

        # Submit 3rd error (should trigger Early Exit!)
        payload.tiempo_respuesta_segundos = 1.5
        response = await responder_fase2(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response.es_correcta)
        
        # Early Exit assertions (Fixes verified!)
        self.assertTrue(response.early_exit)
        self.assertEqual(response.errores_sesion, 3)
        self.assertEqual(response.aciertos_acumulados, 0)
        self.assertEqual(response.porcentaje_actual, 0)

        # Database checks: All attempts for this challenge section must have been cleaned up
        res_attempts = await self.db.execute(
            select(Intento).where(and_(
                Intento.alumno_id == self.test_student.id,
                Intento.seccion == 1011 # M1 D1
            ))
        )
        attempts = res_attempts.scalars().all()
        self.assertEqual(len(attempts), 0)


if __name__ == "__main__":
    print("=" * 60)
    print("LOGICAKIDS - RUNNING PHASE 2 UNIT & INTEGRATION TESTS")
    print("=" * 60)
    
    # Run using unittest runner
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPhase2Integration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Exit with code 0 on success, 1 on failure
    sys.exit(0 if result.wasSuccessful() else 1)
