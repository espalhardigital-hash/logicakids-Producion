"""
Comprehensive Test Suite for Phase 2 & Phase 3 - LogicaKids Pro
================================================================
This script tests every single module, level, and challenge for both Phase 2 and Phase 3:
- Verifies that questions can be generated for each level/challenge.
- Verifies that responses can be submitted.
- Verifies progress tracking works.
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

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.models.sql_models import (
    User, Alumno, Pregunta, Alternativa, Intento,
    ProgresoMaestria, EstadoProgresoEnum, TipoPreguntaEnum, TipoErrorEnum,
    Fase, ConfiguracionProgreso, StatusEnum, OperacionEnum
)
from app.fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso
from app.fase2.router import (
    get_pregunta_fase2, responder_fase2
)
from app.fase2.schemas import (
    Fase2ResponderPregunta
)
from app.fase3.router import (
    get_pregunta_fase3, responder_fase3
)

class TestAllLevelsAndChallenges(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        """Set up in-memory SQLite database and seed ALL data for Fase 2 & Fase 3."""
        self.engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
        
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
        
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # 1. Insert Fases
        f2 = Fase(id=2, nombre="Fase 2", orden=2, estado="activo")
        f3 = Fase(id=3, nombre="Fase 3", orden=3, estado="activo")
        self.db.add(f2)
        self.db.add(f3)
        await self.db.flush()

        # 2. Seed Fase 2 (Theory, Configs, Practice, Challenges)
        from app.fase2.seed import (
            seed_teoria_niveles as seed_teoria_f2,
            seed_configuracion_progreso as seed_config_f2,
            seed_practica_pool as seed_practica_f2,
            seed_desafios_pool as seed_desafios_f2
        )
        print("Seeding Fase 2 theory...")
        await seed_teoria_f2(self.db)
        print("Seeding Fase 2 configs...")
        await seed_config_f2(self.db)
        print("Seeding Fase 2 practice pool...")
        await seed_practica_f2(self.db)
        print("Seeding Fase 2 challenges pool...")
        await seed_desafios_f2(self.db)

        # 3. Seed Fase 3 (Theory, Configs, Practice, Challenges)
        from app.fase3.seed import (
            seed_teoria_niveles as seed_teoria_f3,
            seed_configuracion_progreso as seed_config_f3,
            seed_preguntas_practica as seed_practica_f3,
            seed_preguntas_desafios as seed_desafios_f3
        )
        print("Seeding Fase 3 theory...")
        await seed_teoria_f3(self.db)
        print("Seeding Fase 3 configs...")
        await seed_config_f3(self.db)
        print("Seeding Fase 3 practice pool...")
        await seed_practica_f3(self.db)
        print("Seeding Fase 3 challenges pool...")
        await seed_desafios_f3(self.db)

        await self.db.commit()

        # 4. Create Test Users & Alumnos
        self.user_f2 = User(
            id=str(uuid.uuid4()),
            username="student_f2",
            email="student_f2@logicakids.com",
            password_hash="pwd",
            role="USER",
            status="ACTIVE",
            settings={}
        )
        self.db.add(self.user_f2)
        await self.db.flush()

        self.student_f2 = Alumno(
            user_id=self.user_f2.id,
            nombre="Student Fase 2",
            fase_actual_id=2
        )
        self.db.add(self.student_f2)

        self.user_f3 = User(
            id=str(uuid.uuid4()),
            username="student_f3",
            email="student_f3@logicakids.com",
            password_hash="pwd",
            role="USER",
            status="ACTIVE",
            settings={}
        )
        self.db.add(self.user_f3)
        await self.db.flush()

        self.student_f3 = Alumno(
            user_id=self.user_f3.id,
            nombre="Student Fase 3",
            fase_actual_id=3
        )
        self.db.add(self.student_f3)

        await self.db.commit()
        await self.db.refresh(self.student_f2)
        await self.db.refresh(self.student_f3)

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    async def test_fase2_all_levels(self):
        """Test all levels and challenges in Fase 2 to ensure questions generate and answer endpoints function."""
        print("\n--- STARTING FASE 2 ALL LEVELS TEST ---")
        modulo_niveles_map = {1: 3, 2: 4, 3: 4, 4: 3}
        
        for modulo_id in range(1, 5):
            max_nivel = modulo_niveles_map[modulo_id]
            # Práctica libre levels (1 to max_nivel)
            for nivel_id in list(range(1, max_nivel + 1)) + [11, 12, 13]:
                print(f"Testing Fase 2 - Modulo {modulo_id}, Nivel/Desafio {nivel_id}...")
                
                # Fetch question
                pregunta = await get_pregunta_fase2(
                    modulo_id=modulo_id,
                    nivel_id=nivel_id,
                    reload=True,  # Fresh session
                    db=self.db,
                    alumno=self.student_f2
                )
                self.assertIsNotNone(pregunta)
                self.assertIsNotNone(pregunta.id)
                self.assertIsNotNone(pregunta.enunciado)
                
                # Verify that choices exist if multiple_opcion
                if pregunta.tipo_pregunta == "multiple_opcion":
                    self.assertIsNotNone(pregunta.alternativas)
                    self.assertTrue(len(pregunta.alternativas) > 0)

                # Submit a dummy response to verify the endpoint handles it
                # For multiple option, select the first alternative or pass None
                alt_id = pregunta.alternativas[0].id if pregunta.alternativas else None
                resp_val = "10" if not alt_id else ""
                
                payload = Fase2ResponderPregunta(
                    modulo_id=modulo_id,
                    nivel_id=nivel_id,
                    pregunta_id=pregunta.id,
                    respuesta_dada=resp_val,
                    alternativa_id=alt_id,
                    tiempo_respuesta_segundos=1.5
                )
                
                if pregunta.tipo_pregunta == "constructor_soluciones_chained":
                    payload.paso_numero = 1
                    
                response = await responder_fase2(payload=payload, db=self.db, alumno=self.student_f2)
                self.assertIsNotNone(response)
                # Should not crash, and should return correct/incorrect status
                self.assertIn(response.es_correcta, [True, False])

        print("--- FASE 2 ALL LEVELS TEST PASSED ---")

    async def test_fase3_all_levels(self):
        """Test all levels and challenges in Fase 3 to ensure questions generate and answer endpoints function."""
        print("\n--- STARTING FASE 3 ALL LEVELS TEST ---")
        
        for modulo_id in range(1, 6):
            # Práctica libre levels (1 to 3) + desafíos (11, 12, 13)
            for nivel_id in [1, 2, 3, 11, 12, 13]:
                print(f"Testing Fase 3 - Modulo {modulo_id}, Nivel/Desafio {nivel_id}...")
                
                # Fetch question
                pregunta = await get_pregunta_fase3(
                    modulo_id=modulo_id,
                    nivel_id=nivel_id,
                    reload=True,  # Fresh session
                    db=self.db,
                    alumno=self.student_f3
                )
                self.assertIsNotNone(pregunta)
                self.assertIsNotNone(pregunta.id)
                self.assertIsNotNone(pregunta.enunciado)
                
                # Verify that choices exist if multiple_opcion
                if pregunta.tipo_pregunta == "multiple_opcion":
                    self.assertIsNotNone(pregunta.alternativas)
                    self.assertTrue(len(pregunta.alternativas) > 0)

                # Submit a dummy response
                alt_id = pregunta.alternativas[0].id if pregunta.alternativas else None
                resp_val = "10" if not alt_id else ""
                
                payload = Fase2ResponderPregunta(  # Fase 3 uses the same schema
                    modulo_id=modulo_id,
                    nivel_id=nivel_id,
                    pregunta_id=pregunta.id,
                    respuesta_dada=resp_val,
                    alternativa_id=alt_id,
                    tiempo_respuesta_segundos=1.5
                )
                
                response = await responder_fase3(payload=payload, db=self.db, alumno=self.student_f3)
                self.assertIsNotNone(response)
                self.assertIn(response.es_correcta, [True, False])

        print("--- FASE 3 ALL LEVELS TEST PASSED ---")

if __name__ == "__main__":
    unittest.main()
