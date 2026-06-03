"""
Unit Test Suite for Phase 5 and Phase 6 Seeds - LogicaKids Pro
"""

import asyncio
import os
import sys
import unittest
from sqlalchemy import select, and_, delete

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import event
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

from app.db.base import Base
from app.models.sql_models import Fase, Pregunta, ConfiguracionProgreso
from app.fase2.models import NivelTeoria
from app.fase5.seed import seed_teoria_niveles as seed_t5, seed_practica_pool as seed_p5, seed_configuracion_progreso as seed_c5, FASE5_ID
from app.fase6.seed import seed_teoria_niveles as seed_t6, seed_practica_pool as seed_p6, seed_configuracion_progreso as seed_c6, FASE6_ID

class TestPhases5and6Seeding(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
        self.SessionLocal = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
        self.db = self.SessionLocal()
        
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        fase5 = Fase(id=FASE5_ID, nombre="Fase 5", orden=5, estado="activo")
        fase6 = Fase(id=FASE6_ID, nombre="Fase 6", orden=6, estado="activo")
        self.db.add(fase5)
        self.db.add(fase6)
        await self.db.flush()

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    async def test_fase5_seeding(self):
        await seed_t5(self.db)
        await seed_c5(self.db)
        await seed_p5(self.db)
        await self.db.commit()
        
        # Verify theory
        res = await self.db.execute(select(NivelTeoria).where(NivelTeoria.fase_id == FASE5_ID))
        theories = res.scalars().all()
        self.assertTrue(len(theories) > 0, "No theory seeded for Fase 5")
        
        # Verify configs
        res = await self.db.execute(select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE5_ID))
        configs = res.scalars().all()
        self.assertTrue(len(configs) > 0, "No configs seeded for Fase 5")
        
        # Verify questions pool
        res = await self.db.execute(select(Pregunta).where(Pregunta.fase_id == FASE5_ID))
        questions = res.scalars().all()
        self.assertTrue(len(questions) > 0, "No questions seeded for Fase 5")

    async def test_fase6_seeding(self):
        await seed_t6(self.db)
        await seed_c6(self.db)
        await seed_p6(self.db)
        await self.db.commit()
        
        # Verify theory
        res = await self.db.execute(select(NivelTeoria).where(NivelTeoria.fase_id == FASE6_ID))
        theories = res.scalars().all()
        self.assertTrue(len(theories) > 0, "No theory seeded for Fase 6")
        
        # Verify configs
        res = await self.db.execute(select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE6_ID))
        configs = res.scalars().all()
        self.assertTrue(len(configs) > 0, "No configs seeded for Fase 6")
        
        # Verify questions pool
        res = await self.db.execute(select(Pregunta).where(Pregunta.fase_id == FASE6_ID))
        questions = res.scalars().all()
        self.assertTrue(len(questions) > 0, "No questions seeded for Fase 6")

if __name__ == "__main__":
    unittest.main()
