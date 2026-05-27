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
from app.fase3.router import get_pregunta_fase3, responder_fase3
from app.fase2.schemas import Fase2ResponderPregunta as Fase3ResponderPregunta

class TestPhase3EarlyExitBug(unittest.IsolatedAsyncioTestCase):

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
            
        # Seed Fase 3
        fase3 = Fase(id=3, nombre="Fase 3", orden=3, estado="activo")
        self.db.add(fase3)
        await self.db.flush()

        # Config for Challenge 1 (Section 1011)
        config = ConfiguracionProgreso(
            fase_id=3,
            seccion=1011,
            operacion="mixta",
            cantidad_requerida=5,
            porcentaje_aprobacion=80,
            orden_desbloqueo=1,
            usa_cronometro=False
        )
        self.db.add(config)
        await self.db.flush()

        # Seed 1 challenge question
        self.q_chal = Pregunta(
            id=9901,
            fase_id=3,
            seccion=1011,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Desafío de prueba",
            respuesta_correcta="10",
            datos_numericos={"es_desafio": True},
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.q_chal)
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
            fase_actual_id=3
        )
        self.db.add(self.test_student)
        await self.db.commit()

        await self.db.refresh(self.test_student)

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    async def test_early_exit_bug_reproduction(self):
        """Test if consecutive errors at current_aciertos=0 trigger Early Exit (it should, but it will fail due to the bug)."""
        # We fail 3 times consecutively (max_errores is 3 for level 11).
        # We expect early_exit = True on the 3rd error.
        
        # 1. First error
        payload = Fase3ResponderPregunta(
            modulo_id=1,
            nivel_id=11,
            pregunta_id=9901,
            respuesta_dada="999",
            tiempo_respuesta_segundos=1.0
        )
        response1 = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response1.es_correcta)
        self.assertEqual(response1.errores_sesion, 1)
        self.assertFalse(response1.early_exit)

        # 2. Second error
        response2 = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response2.es_correcta)
        # BUG EXPECTED: errores_sesion will be 1 instead of 2!
        print(f"\n[DEBUG] Errors after 2 failures: {response2.errores_sesion}")
        
        # 3. Third error
        response3 = await responder_fase3(payload=payload, db=self.db, alumno=self.test_student)
        self.assertFalse(response3.es_correcta)
        print(f"[DEBUG] Errors after 3 failures: {response3.errores_sesion}")
        print(f"[DEBUG] Early exit triggered: {response3.early_exit}")

        # Assert early exit is triggered
        self.assertTrue(response3.early_exit, "BUG: Early exit was not triggered after 3 consecutive failures!")
        self.assertEqual(response3.errores_sesion, 3)

if __name__ == "__main__":
    unittest.main()
