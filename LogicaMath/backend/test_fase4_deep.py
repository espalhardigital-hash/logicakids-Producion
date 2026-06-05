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
    User, Alumno, Pregunta, Alternativa, Intento,
    ProgresoMaestria, EstadoProgresoEnum, TipoPreguntaEnum,
    Fase, ConfiguracionProgreso, StatusEnum, OperacionEnum
)
from app.fase4.router import get_pregunta, responder_pregunta, get_dashboard, graduate_fase4
from app.fase2.schemas import Fase2ResponderPregunta as Fase4ResponderPregunta

class TestPhase4DeepSuite(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        # Configure SQLite connection with custom functions
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
        
        # Create all tables on this fresh DB
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        # Seed Fases (1 to 5)
        for i in range(1, 6):
            fase = Fase(id=i, nombre=f"Fase {i}", orden=i, estado="activo")
            self.db.add(fase)
        await self.db.flush()

        # Seed real Phase 4 Configs & Questions from app.fase4.seed
        from app.fase4.seed import (
            seed_teoria_niveles,
            seed_configuracion_progreso,
            seed_preguntas_practica,
            seed_preguntas_desafios
        )
        await seed_teoria_niveles(self.db)
        await seed_configuracion_progreso(self.db)
        await seed_preguntas_practica(self.db)
        await seed_preguntas_desafios(self.db)
        await self.db.commit()

        # Create student profile
        self.test_user = User(
            id=str(uuid.uuid4()),
            username="deep_tester",
            email="deep_tester@logicakids.com",
            password_hash="pwd",
            role="USER",
            status="ACTIVE",
            settings={}
        )
        self.db.add(self.test_user)
        await self.db.flush()

        self.test_student = Alumno(
            user_id=self.test_user.id,
            nombre="Deep Tester Student",
            fase_actual_id=4
        )
        self.db.add(self.test_student)
        await self.db.commit()
        await self.db.refresh(self.test_student)

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    async def test_all_practice_levels(self):
        """Test fetching and answering correctly on all practice levels of Phase 4."""
        print("\n--- STARTING DEEP TESTS: PRACTICE LEVELS ---")
        modulo_niveles = {1: 3, 2: 3, 3: 4, 4: 3}
        
        for modulo_id, max_niv in modulo_niveles.items():
            for nivel_id in range(1, max_niv + 1):
                # 1. Fetch question
                q_out = await get_pregunta(modulo_id=modulo_id, nivel_id=nivel_id, db=self.db, alumno=self.test_student)
                self.assertIsNotNone(q_out, f"Failed to get question for M{modulo_id} N{nivel_id}")
                self.assertIsNotNone(q_out.id)
                self.assertIsNotNone(q_out.enunciado)
                
                # Fetch question from DB to retrieve the correct answer
                result_q = await self.db.execute(select(Pregunta).where(Pregunta.id == q_out.id))
                db_q = result_q.scalar_one()
                correct_ans = db_q.respuesta_correcta
                
                print(f"M{modulo_id} L{nivel_id} -> Enunciado: '{q_out.enunciado[:50]}...' -> Correct: '{correct_ans}'")
                
                # Verify that visual metadata matches if present
                if db_q.datos_numericos:
                    tipo_visual = db_q.datos_numericos.get("tipo_visual")
                    if tipo_visual:
                        self.assertIn(tipo_visual, ["pizza", "thermometer", "pie", "percentage_thermometer"])
                        if tipo_visual in ["pizza", "thermometer"]:
                            self.assertIsNotNone(db_q.datos_numericos.get("cortes"))
                
                # 2. Answer correctly
                payload = Fase4ResponderPregunta(
                    modulo_id=modulo_id,
                    nivel_id=nivel_id,
                    pregunta_id=q_out.id,
                    respuesta_dada=correct_ans,
                    tiempo_respuesta_segundos=1.0
                )
                res = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
                self.assertTrue(res.es_correcta, f"Answer '{correct_ans}' was rejected as incorrect for Q{q_out.id}")
                self.assertEqual(res.aciertos_acumulados, 1)

    async def test_all_challenges(self):
        """Test fetching and answering correctly on all challenges of Phase 4."""
        print("\n--- STARTING DEEP TESTS: CHALLENGES ---")
        for modulo_id in range(1, 5):
            for desafio_id in [11, 12, 13]:
                # 1. Fetch challenge question
                q_out = await get_pregunta(modulo_id=modulo_id, nivel_id=desafio_id, db=self.db, alumno=self.test_student)
                self.assertIsNotNone(q_out)
                self.assertIsNotNone(q_out.id)
                
                # Fetch question from DB
                result_q = await self.db.execute(select(Pregunta).where(Pregunta.id == q_out.id))
                db_q = result_q.scalar_one()
                correct_ans = db_q.respuesta_correcta
                
                print(f"M{modulo_id} D{desafio_id} -> Enunciado: '{q_out.enunciado[:50]}...' -> Correct: '{correct_ans}'")
                
                # Check for alternatives if multiple choice
                alt_id = None
                if db_q.tipo_pregunta == TipoPreguntaEnum.MULTIPLE_OPCION:
                    self.assertIsNotNone(q_out.alternativas)
                    self.assertTrue(len(q_out.alternativas) > 0)
                    
                    # Find correct alternative ID
                    result_alt = await self.db.execute(select(Alternativa).where(and_(
                        Alternativa.pregunta_id == q_out.id,
                        Alternativa.es_correcta == True
                    )))
                    db_alt = result_alt.scalar_one()
                    alt_id = db_alt.id
                
                # 2. Answer correctly
                payload = Fase4ResponderPregunta(
                    modulo_id=modulo_id,
                    nivel_id=desafio_id,
                    pregunta_id=q_out.id,
                    respuesta_dada=correct_ans if not alt_id else None,
                    alternativa_id=alt_id,
                    tiempo_respuesta_segundos=1.0
                )
                res = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
                self.assertTrue(res.es_correcta)
                self.assertEqual(res.aciertos_acumulados, 1)

    async def test_full_maestry_domination(self):
        """Simulate a student dominating all 25 blocks and verify graduation triggers automatically."""
        print("\n--- STARTING DEEP TESTS: DOMINATION & GRADUATION ---")
        
        # Approve all 25 blocks
        # 13 practice blocks (M1:3, M2:3, M3:4, M4:3)
        # 12 challenges blocks (M1-4: 11, 12, 13)
        secciones = []
        # Practica
        for m in [1, 2, 4]:
            for n in range(1, 4):
                secciones.append(m * 100 + n)
        for n in range(1, 5):
            secciones.append(3 * 100 + n)
        # Desafíos
        for m in range(1, 5):
            for d in [11, 12, 13]:
                secciones.append(m * 1000 + d)
                
        self.assertEqual(len(secciones), 25)
        
        # Add approved masteries for first 24 blocks
        for sec in secciones[:-1]:
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
        
        # Now complete the last block (the 25th block) through the API responder endpoint to trigger automatic graduation!
        last_sec = secciones[-1]
        last_mod = last_sec // 1000
        last_des = last_sec % 1000
        
        # Get question for the last block
        q_out = await get_pregunta(modulo_id=last_mod, nivel_id=last_des, db=self.db, alumno=self.test_student)
        
        # Retrieve config required count (typically 10 for challenge 13, let's verify or mock/force aciertos to max_aciertos - 1)
        result_config = await self.db.execute(select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == 4,
            ConfiguracionProgreso.seccion == last_sec
        )))
        config = result_config.scalar_one()
        required = config.cantidad_requerida
        
        # Update existing progress (created by get_pregunta) to required - 1
        result_prog = await self.db.execute(select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == self.test_student.id,
            ProgresoMaestria.fase_id == 4,
            ProgresoMaestria.seccion == last_sec,
            ProgresoMaestria.operacion == "mixta"
        )))
        prog_last = result_prog.scalar_one()
        prog_last.aciertos_acumulados = required - 1
        prog_last.intentos_totales = required - 1
        prog_last.porcentaje_actual = 90
        await self.db.commit()
        
        # Fetch question details
        result_q = await self.db.execute(select(Pregunta).where(Pregunta.id == q_out.id))
        db_q = result_q.scalar_one()
        correct_ans = db_q.respuesta_correcta
        
        # Submit final answer to achieve mastery
        payload = Fase4ResponderPregunta(
            modulo_id=last_mod,
            nivel_id=last_des,
            pregunta_id=q_out.id,
            respuesta_dada=correct_ans,
            tiempo_respuesta_segundos=1.0
        )
        res = await responder_pregunta(payload=payload, db=self.db, alumno=self.test_student)
        self.assertTrue(res.es_correcta)
        self.assertTrue(res.bloque_completado)
        self.assertTrue(res.fase_completada) # Auto graduation check!
        
        # Call graduation explicitly
        await graduate_fase4(db=self.db, alumno=self.test_student)
        
        # Check student fase has updated to 5
        await self.db.refresh(self.test_student)
        self.assertEqual(self.test_student.fase_actual_id, 5)
        print("Automatic graduation to Phase 5 successfully verified!")


if __name__ == "__main__":
    unittest.main()
