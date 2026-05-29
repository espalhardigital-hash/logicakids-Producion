"""
Unit Test Suite for Admin Panel Endpoints - LogicaKids Pro
==========================================================
Validates all administrative backend logic:
1. Pedagogical settings (retrieve, update).
2. Phase management (get, create, update).
3. Progression configurations (get, create, update).
4. Question bank CRUD operations (get, create, update, delete).
5. Level theory management (get, update).
6. Student search and progress retrieval.
7. Progress overriding (single level approve/unlock/lock with settings sync).
8. Bulk progress overriding (multiple levels approve/unlock/lock in one transaction).

Usage:
  python test_admin.py
"""

import asyncio
import os
import sys
import unittest
import uuid
from datetime import datetime
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
    User, Alumno, Pregunta, Alternativa, ProgresoMaestria,
    Fase, ConfiguracionProgreso, StatusEnum, OperacionEnum,
    TipoPreguntaEnum, EstadoProgresoEnum, PlatformSettings, NivelTeoria
)

from app.schemas import (
    FaseCreate, FaseUpdate, ConfiguracionProgresoCreate, ConfiguracionProgresoUpdate,
    PreguntaCreate, PreguntaUpdate, AlternativaCreate
)

from app.routers.admin import (
    get_settings, update_settings, get_fases, create_fase, update_fase,
    get_configuraciones, create_configuracion, update_configuracion,
    get_preguntas, create_pregunta, update_pregunta, delete_pregunta,
    get_teoria, save_teoria, search_alumnos, get_alumno_progress,
    override_alumno_progress, override_alumno_progress_bulk,
    NivelTeoriaSave, ProgressOverridePayload, ProgressOverrideBulkPayload, ProgressOverrideItem
)


class TestAdminPanelLogic(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        """Set up isolated in-memory database and seed essential base records."""
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
            
        # Seed test admin user
        self.admin_user_record = User(
            id=str(uuid.uuid4()),
            username="admin_tester",
            email="admin@logicakids.com",
            password_hash="admin_hash",
            role="ADMIN",
            status="ACTIVE",
            unlocked_level=5,
            settings={}
        )
        self.db.add(self.admin_user_record)
        await self.db.flush()

        self.admin_ctx = {
            "id": self.admin_user_record.id,
            "username": self.admin_user_record.username,
            "email": self.admin_user_record.email,
            "role": "ADMIN",
            "alumno_id": None
        }

        # Seed test student user + profile
        self.student_user_record = User(
            id=str(uuid.uuid4()),
            username="student_tester",
            email="student@logicakids.com",
            password_hash="student_hash",
            role="USER",
            status="ACTIVE",
            unlocked_level=0,
            settings={"unlockedLevels": {"addition": 0, "subtraction": 0, "multiplication": 0, "division": 0, "challenge": 0}}
        )
        self.db.add(self.student_user_record)
        await self.db.flush()

        self.student_alumno_record = Alumno(
            user_id=self.student_user_record.id,
            nombre="Student Tester",
            fase_actual_id=1,
            estado=StatusEnum.ACTIVO
        )
        self.db.add(self.student_alumno_record)
        
        # Seed a base Fase
        self.fase1 = Fase(
            id=1,
            nombre="Fase 1: Aritmética Básica",
            orden=1,
            estado="activo"
        )
        self.db.add(self.fase1)
        await self.db.commit()

        # Refresh instances
        await self.db.refresh(self.admin_user_record)
        await self.db.refresh(self.student_user_record)
        await self.db.refresh(self.student_alumno_record)
        await self.db.refresh(self.fase1)

    async def asyncTearDown(self):
        await self.db.close()
        await self.engine.dispose()

    # ============================================================
    # PLATFORM SETTINGS TESTS
    # ============================================================
    async def test_platform_settings_flow(self):
        """Test getting and updating pedagogical settings."""
        # 1. Get default settings (when not in DB)
        settings = await get_settings(db=self.db)
        self.assertIn("practica_libre", settings)
        self.assertEqual(settings["practica_libre"]["cantidad_requerida"], 15)

        # 2. Update settings
        new_config = {
            "practica_libre": {
                "cantidad_requerida": 10,
                "porcentaje_aprobacion": 85,
                "usa_cronometro": True,
                "tiempo_default_segundos": 20,
                "tipo_feedback": "detallado"
            },
            "desafios": {
                "cantidad_requerida": 15,
                "porcentaje_aprobacion": 95,
                "usa_cronometro": True,
                "tiempo_default_segundos_11": 30,
                "tiempo_default_segundos_12": 45,
                "tiempo_default_segundos_13": 60,
                "tipo_feedback": "simple"
            }
        }
        res = await update_settings(payload=new_config, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(res["status"], "ok")

        # 3. Retrieve settings again -> should match new config
        settings_updated = await get_settings(db=self.db)
        self.assertEqual(settings_updated["practica_libre"]["cantidad_requerida"], 10)
        self.assertTrue(settings_updated["practica_libre"]["usa_cronometro"])

    # ============================================================
    # FASES TESTS
    # ============================================================
    async def test_fases_crud_flow(self):
        """Test listing, creating, and updating school phases."""
        # 1. Get phases -> should list seeded Fase 1
        fases = await get_fases(db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(fases), 1)
        self.assertEqual(fases[0].id, 1)

        # 2. Create a new Fase
        payload_create = FaseCreate(
            nombre="Fase 2: Fracciones",
            descripcion="Módulo de fracciones y proporciones",
            orden=2
        )
        new_fase = await create_fase(fase_data=payload_create, db=self.db, admin_user=self.admin_ctx)
        self.assertIsNotNone(new_fase.id)
        self.assertEqual(new_fase.nombre, "Fase 2: Fracciones")
        self.assertEqual(new_fase.orden, 2)

        # 3. Update the Fase
        payload_update = FaseUpdate(
            nombre="Fase 2: Fracciones Mejorada",
            estado="activo"
        )
        updated_fase = await update_fase(fase_id=new_fase.id, fase_data=payload_update, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(updated_fase.nombre, "Fase 2: Fracciones Mejorada")

    # ============================================================
    # CONFIGURACION PROGRESO TESTS
    # ============================================================
    async def test_configuracion_progreso_flow(self):
        """Test creating, reading, and updating section-level progression parameters."""
        # 1. Create progress configuration for Phase 1, Section 101, addition
        config_create = ConfiguracionProgresoCreate(
            fase_id=1,
            seccion=101,
            operacion="suma",
            cantidad_requerida=12,
            porcentaje_aprobacion=80,
            orden_desbloqueo=1,
            usa_cronometro=False,
            tiempo_default_segundos=15
        )
        new_config = await create_configuracion(config_data=config_create, db=self.db, admin_user=self.admin_ctx)
        self.assertIsNotNone(new_config.id)
        self.assertEqual(new_config.cantidad_requerida, 12)

        # 2. Retrieve progression config
        configs = await get_configuraciones(fase_id=1, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(configs), 1)
        self.assertEqual(configs[0].seccion, 101)

        # 3. Update progress configuration
        config_update = ConfiguracionProgresoUpdate(
            cantidad_requerida=8,
            porcentaje_aprobacion=90
        )
        updated_config = await update_configuracion(config_id=new_config.id, config_data=config_update, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(updated_config.cantidad_requerida, 8)
        self.assertEqual(updated_config.porcentaje_aprobacion, 90)

    # ============================================================
    # QUESTIONS CRUD TESTS
    # ============================================================
    async def test_questions_crud_flow(self):
        """Test comprehensive question bank management flow."""
        # 1. Create a question with alternatives
        alt1 = AlternativaCreate(texto="4", es_correcta=True, orden=1)
        alt2 = AlternativaCreate(texto="5", es_correcta=False, orden=2, tipo_error="calculo", feedback_error="Prueba")
        
        q_create = PreguntaCreate(
            fase_id=1,
            seccion=101,
            operacion="suma",
            tipo_pregunta="multiple_opcion",
            enunciado="¿Cuánto es 2 + 2?",
            respuesta_correcta="4",
            datos_numericos={"variante": 0, "tipo_visual": "pizza", "cortes": 4},
            explicacion_paso_a_paso={"pasos": [{"orden": 1, "texto": "Sumar dos unidades a dos"}]},
            requiere_subrayado=False,
            alternativas=[alt1, alt2]
        )
        
        new_q = await create_pregunta(pregunta_data=q_create, db=self.db, admin_user=self.admin_ctx)
        self.assertIsNotNone(new_q.id)
        self.assertEqual(new_q.enunciado, "¿Cuánto es 2 + 2?")
        self.assertEqual(len(new_q.alternativas), 2)

        # 2. Get questions with filters
        questions = await get_preguntas(fase_id=1, seccion=101, operacion="suma", db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(questions), 1)
        self.assertEqual(questions[0].id, new_q.id)

        # 3. Update the question
        q_update = PreguntaUpdate(
            enunciado="¿Cuál es el resultado de 2 + 2?",
            respuesta_correcta="4"
        )
        updated_q = await update_pregunta(pregunta_id=new_q.id, pregunta_data=q_update, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(updated_q.enunciado, "¿Cuál es el resultado de 2 + 2?")

        # 4. Delete the question
        del_res = await delete_pregunta(pregunta_id=new_q.id, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(del_res["status"], "ok")

        # Verify deletion
        rem_questions = await get_preguntas(fase_id=1, seccion=101, operacion="suma", db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(rem_questions), 0)

    # ============================================================
    # THEORY TESTS
    # ============================================================
    async def test_theory_management(self):
        """Test retrieving and saving level-specific theory contents."""
        # 1. Theory doesn't exist initially -> should return None
        theory = await get_teoria(fase_id=1, modulo_id=2, nivel_id=3, db=self.db, admin_user=self.admin_ctx)
        self.assertIsNone(theory)

        # 2. Save theory content
        payload = NivelTeoriaSave(
            fase_id=1,
            modulo_id=2,
            nivel_id=3,
            titulo="Concepto de Sumas Rápidas",
            texto_descubrimiento="La suma consiste en agrupar elementos...",
            diccionario={"término": "Suma", "definición": "Operación de adición"},
            advertencia="¡No olvides llevar las decenas!",
            ejemplos=[{"enunciado": "10 + 20 = 30"}],
            interactivos=[{"pregunta": "5 + 5", "respuesta": "10"}]
        )
        res = await save_teoria(payload=payload, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(res["status"], "ok")

        # 3. Get theory -> should return successfully populated record
        theory_saved = await get_teoria(fase_id=1, modulo_id=2, nivel_id=3, db=self.db, admin_user=self.admin_ctx)
        self.assertIsNotNone(theory_saved)
        self.assertEqual(theory_saved.titulo, "Concepto de Sumas Rápidas")
        self.assertEqual(theory_saved.texto_descubrimiento, "La suma consiste en agrupar elementos...")

    # ============================================================
    # STUDENT PROGRESS & SEARCH TESTS
    # ============================================================
    async def test_student_search_and_progress(self):
        """Test searching students and loading mastery progress records."""
        # 1. Search for students (matching query)
        students = await search_alumnos(query="student", db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(students), 1)
        self.assertEqual(students[0]["alumno_nombre"], "Student Tester")

        # 2. Get student progress -> initially empty
        progress = await get_alumno_progress(alumno_id=self.student_alumno_record.id, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(progress), 0)

    # ============================================================
    # PROGRESS OVERRIDE TESTS (SINGLE & BULK)
    # ============================================================
    async def test_progress_override_single(self):
        """Test overriding student progress on a single level and settings synchronization."""
        # 1. Override progress to 'approve'
        payload = ProgressOverridePayload(
            fase_id=1,
            seccion=101,
            operacion="suma",
            action="approve"
        )
        res = await override_alumno_progress(alumno_id=self.student_alumno_record.id, payload=payload, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(res["status"], "ok")

        # 2. Check that progress record is created and set to approved
        progress = await get_alumno_progress(alumno_id=self.student_alumno_record.id, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(progress), 1)
        self.assertEqual(progress[0]["estado"], "aprobado")
        self.assertTrue(progress[0]["aprobado_por_admin"])

        # Check sync in user settings unlocked levels
        await self.db.refresh(self.student_user_record)
        self.assertEqual(self.student_user_record.settings["unlockedLevels"]["addition"], 6)

        # 3. Override progress to 'lock'
        payload_lock = ProgressOverridePayload(
            fase_id=1,
            seccion=101,
            operacion="suma",
            action="lock"
        )
        await override_alumno_progress(alumno_id=self.student_alumno_record.id, payload=payload_lock, db=self.db, admin_user=self.admin_ctx)
        
        # Verify locked state
        progress_locked = await get_alumno_progress(alumno_id=self.student_alumno_record.id, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(progress_locked[0]["estado"], "bloqueado")
        
        await self.db.refresh(self.student_user_record)
        self.assertEqual(self.student_user_record.settings["unlockedLevels"]["addition"], 0)

    async def test_progress_override_bulk(self):
        """Test bulk progress overrides covering multiple sections in a single transaction."""
        # 1. Prepare bulk items
        item1 = ProgressOverrideItem(fase_id=1, seccion=101, operacion="suma")
        item2 = ProgressOverrideItem(fase_id=1, seccion=102, operacion="suma")
        item3 = ProgressOverrideItem(fase_id=1, seccion=201, operacion="resta")
        
        payload_bulk = ProgressOverrideBulkPayload(
            items=[item1, item2, item3],
            action="approve"
        )
        
        # 2. Execute bulk override
        res = await override_alumno_progress_bulk(alumno_id=self.student_alumno_record.id, payload=payload_bulk, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["processed"], 3)

        # 3. Verify progress records in DB
        progress = await get_alumno_progress(alumno_id=self.student_alumno_record.id, db=self.db, admin_user=self.admin_ctx)
        self.assertEqual(len(progress), 3)
        for p in progress:
            self.assertEqual(p["estado"], "aprobado")
            self.assertTrue(p["aprobado_por_admin"])

        # Verify combined settings synchronization
        await self.db.refresh(self.student_user_record)
        self.assertEqual(self.student_user_record.settings["unlockedLevels"]["addition"], 6)
        self.assertEqual(self.student_user_record.settings["unlockedLevels"]["subtraction"], 6)


if __name__ == "__main__":
    print("=" * 60)
    print("LOGICAKIDS - RUNNING COMPREHENSIVE BACKEND ADMIN TESTS")
    print("=" * 60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestAdminPanelLogic)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    sys.exit(0 if result.wasSuccessful() else 1)
