"""
Unit Test Suite for Phase 1 Graduation & Synchronization - LogicaKids Pro
========================================================================
This test suite validates that recalcular_y_sincronizar_fase_actual correctly
handles Phase 1 graduation using the user's settings["unlockedLevels"] dict.

Usage:
  python test_graduation_sync.py
"""

import asyncio
import os
import sys
import unittest
from sqlalchemy import select
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
    User, Alumno, Fase, ConfiguracionProgreso, StatusEnum
)
from app.services.pedagogia_service import recalcular_y_sincronizar_fase_actual


class TestPhase1GraduationSync(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        """Set up in-memory SQLite database and seed initial phases/configs."""
        self.engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
        self.SessionLocal = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
        self.db = self.SessionLocal()
        
        # Create all tables
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # 1. Insert Fases
        self.fase0 = Fase(id=0, nombre="Fase 0", orden=0, estado=StatusEnum.ACTIVO)
        self.fase1 = Fase(id=1, nombre="Fase 1", orden=1, estado=StatusEnum.ACTIVO)
        self.fase2 = Fase(id=2, nombre="Fase 2", orden=2, estado=StatusEnum.ACTIVO)
        
        self.db.add(self.fase0)
        self.db.add(self.fase1)
        self.db.add(self.fase2)
        await self.db.flush()

        # 2. Insert at least one active config for Fase 1 so it is not skipped
        config_f1 = ConfiguracionProgreso(
            fase_id=1,
            seccion=101,
            operacion="suma",
            cantidad_requerida=15,
            porcentaje_aprobacion=90,
            orden_desbloqueo=1,
            activo=True
        )
        # Add a config for Fase 2 so it is not skipped either
        config_f2 = ConfiguracionProgreso(
            fase_id=2,
            seccion=201,
            operacion="suma",
            cantidad_requerida=15,
            porcentaje_aprobacion=90,
            orden_desbloqueo=1,
            activo=True
        )
        self.db.add(config_f1)
        self.db.add(config_f2)
        await self.db.commit()

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    async def test_fase1_incomplete_progress(self):
        """Verify that a student with incomplete Phase 1 progress remains in Phase 1."""
        # 1. Create a user with incomplete Phase 1 progress
        user = User(
            id="user_incomplete_id",
            username="student_incomplete",
            email="incomplete@logicakids.pro",
            settings={
                "unlockedLevels": {
                    "addition": 6,
                    "subtraction": 6,
                    "multiplication": 5,  # Incomplete: needs to be >= 6
                    "division": 1,         # Incomplete
                    "challenge": 1         # Incomplete
                }
            }
        )
        self.db.add(user)
        await self.db.flush()
        
        alumno = Alumno(
            user_id=user.id,
            nombre=user.username,
            fase_actual_id=1
        )
        self.db.add(alumno)
        await self.db.commit()
        
        # 2. Run recalculation
        fase_sincronizada = await recalcular_y_sincronizar_fase_actual(alumno.id, self.db)
        
        # 3. Assertions
        self.assertEqual(fase_sincronizada, 1, "Student should remain in Phase 1.")
        
        # Check database persistence
        await self.db.refresh(alumno)
        self.assertEqual(alumno.fase_actual_id, 1, "Student's phase in db should be 1.")

    async def test_fase1_completed_progress(self):
        """Verify that a student with completed Phase 1 progress graduates to Phase 2."""
        # 1. Create a user with completed Phase 1 progress
        user = User(
            id="user_completed_id",
            username="student_completed",
            email="completed@logicakids.pro",
            settings={
                "unlockedLevels": {
                    "addition": 6,
                    "subtraction": 6,
                    "multiplication": 6,
                    "division": 6,
                    "challenge": 6
                }
            }
        )
        self.db.add(user)
        await self.db.flush()
        
        alumno = Alumno(
            user_id=user.id,
            nombre=user.username,
            fase_actual_id=1
        )
        self.db.add(alumno)
        await self.db.commit()
        
        # 2. Run recalculation
        fase_sincronizada = await recalcular_y_sincronizar_fase_actual(alumno.id, self.db)
        
        # 3. Assertions
        self.assertEqual(fase_sincronizada, 2, "Student should be promoted/synchronized to Phase 2.")
        
        # Check database persistence
        await self.db.refresh(alumno)
        self.assertEqual(alumno.fase_actual_id, 2, "Student's phase in db should be updated to 2.")


if __name__ == "__main__":
    unittest.main()
