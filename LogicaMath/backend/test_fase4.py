import asyncio
import os
import sys
import unittest
import uuid
from sqlalchemy import select, and_, event
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles

# Register JSONB compilation override for SQLite compatibility
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.models.sql_models import (
    User, Alumno, Pregunta, Intento,
    ProgresoMaestria, EstadoProgresoEnum, TipoPreguntaEnum,
    Fase, ConfiguracionProgreso, StatusEnum, OperacionEnum
)
from app.fase4.router import get_pregunta, responder_pregunta, get_dashboard, graduate_fase4
from app.fase2.schemas import Fase2ResponderPregunta as Fase4ResponderPregunta

class TestPhase4Logic(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
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
            
        # Seed Fases
        self.fases = []
        for i in range(6):
            fase = Fase(id=i, nombre=f"Fase {i}", orden=i, estado="activo")
            self.db.add(fase)
            self.fases.append(fase)
        await self.db.flush()

        # Config for Module 1, Level 1 (Section 101) - Practice
        config_p = ConfiguracionProgreso(
            fase_id=4,
            seccion=101,
            operacion="mixta",
            cantidad_requerida=2,
            porcentaje_aprobacion=90,
            orden_desbloqueo=1,
            usa_cronometro=False,
            tiempo_default_segundos=15,
            activo=True
        )
        self.db.add(config_p)

        # Config for Module 1, Challenge 11 (Section 1011) - Challenge
        config_c = ConfiguracionProgreso(
            fase_id=4,
            seccion=1011,
            operacion="mixta",
            cantidad_requerida=20,
            porcentaje_aprobacion=90,
            orden_desbloqueo=2,
            usa_cronometro=True,
            tiempo_default_segundos=25,
            activo=True
        )
        self.db.add(config_c)
        await self.db.flush()

        # Seed questions for Module 1, Level 1 (Practice)
        # We need a family of questions with variants 0, 1
        self.q_p0 = Pregunta(
            id=4001,
            fase_id=4,
            seccion=101,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="¿Qué fracción representa 1 de 4 partes?",
            respuesta_correcta="1/4",
            datos_numericos={"variante": 0, "cortes": 4, "sombreados": [1], "tipo_visual": "pizza"},
            estructura_padre_id="f4_m1_n1_q_001",
            estado=StatusEnum.ACTIVO
        )
        self.q_p1 = Pregunta(
            id=4002,
            fase_id=4,
            seccion=101,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="¿Qué fracción representa 2 de 8 partes?",
            respuesta_correcta="2/8",
            datos_numericos={"variante": 1, "cortes": 8, "sombreados": [1, 2], "tipo_visual": "pizza"},
            estructura_padre_id="f4_m1_n1_q_001",
            estado=StatusEnum.ACTIVO
        )
        # We need another family to satisfy cantidad_requerida = 2
        self.q_p2 = Pregunta(
            id=4003,
            fase_id=4,
            seccion=101,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="¿Qué fracción representa 2 de 4 partes?",
            respuesta_correcta="2/4",
            datos_numericos={"variante": 0, "cortes": 4, "sombreados": [1, 2], "tipo_visual": "pizza"},
            estructura_padre_id="f4_m1_n1_q_002",
            estado=StatusEnum.ACTIVO
        )
        self.db.add_all([self.q_p0, self.q_p1, self.q_p2])

        # Seed questions for Module 1, Challenge 11 (Challenge)
        self.q_c0 = Pregunta(
            id=4111,
            fase_id=4,
            seccion=1011,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Desafío de fracciones 1",
            respuesta_correcta="3/4",
            datos_numericos={"es_desafio": True},
            estado=StatusEnum.ACTIVO
        )
        self.q_c1 = Pregunta(
            id=4112,
            fase_id=4,
            seccion=1011,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Desafío de fracciones 2",
            respuesta_correcta="1/2",
            datos_numericos={"es_desafio": True},
            estado=StatusEnum.ACTIVO
        )
        self.db.add_all([self.q_c0, self.q_c1])
        await self.db.flush()

        # User and Student
        self.test_user = User(
            id=str(uuid.uuid4()),
            username="tester_student",
            email="tester@logicakids.com",
            password_hash="fake",
            role="USER",
            status="ACTIVE",
            settings={}
        )
        self.db.add(self.test_user)
        await self.db.flush()

        self.test_student = Alumno(
            user_id=self.test_user.id,
            nombre="Tester Student",
            fase_actual_id=4
        )
        self.db.add(self.test_student)
        await self.db.commit()

        await self.db.refresh(self.test_student)

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    async def test_get_dashboard(self):
        """Test retrieving the dashboard for student in Phase 4."""
        dash = await get_dashboard(db=self.db, alumno=self.test_student)
        self.assertEqual(dash.alumno_nombre, "Tester Student")
        self.assertFalse(dash.desafio_mixto_disponible)
        # Module 1 should be unlocked ("en_progreso") since phase_actual_id is 4
        m1 = next(m for m in dash.modulos if m.modulo_id == 1)
        self.assertEqual(m1.estado, "en_progreso")
        # Module 1 Level 1 should be unlocked ("en_progreso")
        l1 = next(l for l in m1.niveles if l.nivel_id == 1)
        self.assertEqual(l1.estado, "en_progreso")

    async def test_practice_mirror_loop(self):
        """Test that failing a practice question triggers the Mirror Loop (variante 1)."""
        # 1. Fetch first question (should be q_p0 or q_p2 since they are the original variant 0s)
        q_out = await get_pregunta(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
        self.assertIn(q_out.id, [4001, 4003])
        
        # Determine which question we got
        first_q_id = q_out.id
        
        # 2. Answer incorrectly to trigger Mirror Loop
        payload = Fase4ResponderPregunta(
            modulo_id=1,
            nivel_id=1,
            pregunta_id=first_q_id,
            respuesta_dada="incorrect_answer",
            tiempo_respuesta_segundos=2.0
        )
        res = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(res.es_correcta)
        
        # If it was 4001 (which has variant 0 and 4002 has variant 1 of the same family), it should trigger mirror loop (es_espejo = True)
        if first_q_id == 4001:
            self.assertTrue(res.es_espejo)
            # Now fetch the next question from the pool, it should be the mirror question 4002!
            q_next = await get_pregunta(modulo_id=1, nivel_id=1, db=self.db, alumno=self.test_student)
            self.assertEqual(q_next.id, 4002)

    async def test_challenge_early_exit(self):
        """Test that failing 3 times in a standard challenge triggers Early Exit."""
        # 1. Fetch first challenge question
        q_out = await get_pregunta(modulo_id=1, nivel_id=11, db=self.db, alumno=self.test_student)
        first_q_id = q_out.id
        
        # We need to answer incorrectly 3 times.
        payload = Fase4ResponderPregunta(
            modulo_id=1,
            nivel_id=11,
            pregunta_id=first_q_id,
            respuesta_dada="wrong",
            tiempo_respuesta_segundos=1.0
        )
        
        # Fail 1
        res1 = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(res1.es_correcta)
        self.assertFalse(res1.early_exit)
        
        # Fail 2
        res2 = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(res2.es_correcta)
        self.assertFalse(res2.early_exit)
        
        # Fail 3
        res3 = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(res3.es_correcta)
        self.assertTrue(res3.early_exit)
        
    async def test_graduation(self):
        """Test graduation behavior when all 25 blocks are dominated."""
        # Simulate having 25 dominated blocks by adding 25 ProgresoMaestria records approved.
        for sec in range(1, 26):
            prog = ProgresoMaestria(
                alumno_id=self.test_student.id,
                fase_id=4,
                seccion=sec,
                operacion="mixta",
                estado=EstadoProgresoEnum.APROBADO,
                aciertos_acumulados=15,
                intentos_totales=15,
                porcentaje_actual=100
            )
            self.db.add(prog)
        await self.db.commit()
        
        # Call graduation
        res = await graduate_fase4(db=self.db, alumno=self.test_student)
        self.assertIn("Fase 5", res["nueva_fase_nombre"])
        
        # Check student phase has updated
        await self.db.refresh(self.test_student)
        self.assertEqual(self.test_student.fase_actual_id, 5)

if __name__ == "__main__":
    unittest.main()
