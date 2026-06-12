import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SIM_DATABASE_URL = "postgresql+asyncpg://logicakids_local_user:LogicaKids2026#Local@postgres:5432/bd_logicakids_desarrollo"

async def simulate_dev_db():
    print("=" * 60)
    print("Simulando Base de Datos de Desarrollo (VPS) Localmente...")
    print("=" * 60)
    
    engine = create_async_engine(SIM_DATABASE_URL, echo=True)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # 1. Limpiar datos existentes en orden de dependencias de FK
        print("Limpiando tablas de simulación...")
        await session.execute(text("TRUNCATE TABLE intento_pasos CASCADE;"))
        await session.execute(text("TRUNCATE TABLE intento_preguntas CASCADE;"))
        await session.execute(text("TRUNCATE TABLE intentos CASCADE;"))
        await session.execute(text("TRUNCATE TABLE pool_asignado_alumno CASCADE;"))
        await session.execute(text("TRUNCATE TABLE progreso_maestria CASCADE;"))
        await session.execute(text("TRUNCATE TABLE alternativas CASCADE;"))
        await session.execute(text("TRUNCATE TABLE preguntas CASCADE;"))
        await session.execute(text("TRUNCATE TABLE niveles_teoria_pool CASCADE;"))
        await session.execute(text("TRUNCATE TABLE configuracion_progreso CASCADE;"))
        await session.execute(text("TRUNCATE TABLE alumnos CASCADE;"))
        await session.execute(text("TRUNCATE TABLE fases CASCADE;"))
        await session.execute(text("TRUNCATE TABLE users CASCADE;"))
        await session.flush()
        
        # 2. Insertar Fases antigua
        print("Insertando Fases (Antiguas)...")
        await session.execute(text(
            "INSERT INTO fases (id, nombre, descripcion, orden, estado) VALUES "
            "(1, 'Aritmética Básica (Antigua)', 'Descripción antigua de la Fase 1', 1, 'ACTIVO'),"
            "(2, 'Desarrollo Numérico (Antigua)', 'Descripción antigua de la Fase 2', 2, 'ACTIVO');"
        ))
        
        # 3. Insertar Configuraciones de progreso
        print("Insertando configuraciones de progreso (Antiguas)...")
        await session.execute(text(
            "INSERT INTO configuracion_progreso (id, fase_id, seccion, operacion, cantidad_requerida, porcentaje_aprobacion, orden_desbloqueo, tipo_feedback, usa_cronometro, tiempo_default_segundos, activo) VALUES "
            "(1, 1, 101, 'SUMA', 15, 90, 1, 'simple', true, 15, true),"
            "(2, 2, 201, 'MULTIPLICACION', 15, 90, 1, 'simple', true, 15, true);"
        ))
        
        # 4. Insertar Preguntas antiguas
        print("Insertando Preguntas (Antiguas) para emparejar...")
        # Fase 1 Suma: 3 preguntas antiguas (ID 1, 2, 3)
        await session.execute(text(
            "INSERT INTO preguntas (id, fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, estado) VALUES "
            "(1, 1, 101, 'SUMA', 'MULTIPLE_OPCION', '¿Cuánto es 10 + 15? (Version con erratas)', '25', 'ACTIVO'),"
            "(2, 1, 101, 'SUMA', 'MULTIPLE_OPCION', '¿Cuánto es 8 + 4? (Vieja)', '12', 'ACTIVO'),"
            "(3, 1, 101, 'SUMA', 'MULTIPLE_OPCION', '¿Cuánto es 50 + 20? (Con error)', '70', 'ACTIVO');"
        ))
        
        # 5. Alternativas antiguas
        print("Insertando Alternativas antiguas...")
        await session.execute(text(
            "INSERT INTO alternativas (id, pregunta_id, texto, es_correcta, orden) VALUES "
            # Pregunta 1 (10 + 15 = 25)
            "(10, 1, '20', false, 1),"
            "(11, 1, '25', true, 2),"
            "(12, 1, '30', false, 3),"
            # Pregunta 2 (8 + 4 = 12)
            "(20, 2, '10', false, 1),"
            "(21, 2, '12', true, 2),"
            "(22, 2, '14', false, 3),"
            # Pregunta 3 (50 + 20 = 70)
            "(30, 3, '60', false, 1),"
            "(31, 3, '70', true, 2),"
            "(32, 3, '80', false, 3);"
        ))
        
        # 6. Insertar Usuario de prueba
        print("Insertando usuario y alumno de prueba...")
        await session.execute(text(
            "INSERT INTO users (id, username, email, password_hash, role, status) VALUES "
            "('user-simulado-uuid', 'estudiante_simulado', 'simulado@logicakids.com', 'dummyhash', 'USER', 'ACTIVE');"
        ))
        await session.execute(text(
            "INSERT INTO alumnos (id, user_id, nombre, fase_actual_id) VALUES "
            "(100, 'user-simulado-uuid', 'Estudiante Simulado', 1);"
        ))
        
        # 7. Insertar Progreso de Maestría para el bloque
        print("Insertando progreso de maestría...")
        await session.execute(text(
            "INSERT INTO progreso_maestria (id, alumno_id, fase_id, seccion, operacion, estado, aciertos_acumulados, intentos_totales, porcentaje_actual, aprobado_por_admin) VALUES "
            "(200, 100, 1, 101, 'SUMA', 'APROBADO', 10, 10, 100, false);"
        ))
        
        # 8. Insertar Intentos asociados a las preguntas
        print("Insertando historial de intentos (progreso del alumno)...")
        await session.execute(text(
            "INSERT INTO intentos (id, alumno_id, pregunta_id, alternativa_id, respuesta_dada, es_correcta, fase_id, seccion, operacion, fecha) VALUES "
            "(300, 100, 1, 11, '25', true, 1, 101, 'SUMA', NOW()),"
            "(301, 100, 2, 21, '12', true, 1, 101, 'SUMA', NOW()),"
            "(302, 100, 3, 30, '60', false, 1, 101, 'SUMA', NOW());"
        ))
        
        # 9. Insertar Pool Asignado Alumno
        print("Insertando pool asignado...")
        await session.execute(text(
            "INSERT INTO pool_asignado_alumno (id, alumno_id, pregunta_id, fase_id, seccion, operacion, respondida_correctamente, respondida_alguna_vez) VALUES "
            "(400, 100, 1, 1, 101, 'SUMA', true, true),"
            "(401, 100, 2, 1, 101, 'SUMA', true, true),"
            "(402, 100, 3, 1, 101, 'SUMA', false, true);"
        ))
        
        # Forzar el seteo de secuencias de IDs para evitar colisiones en futuros inserts
        print("Actualizando secuencias de IDs de Postgres...")
        await session.execute(text("SELECT setval(pg_get_serial_sequence('preguntas', 'id'), coalesce(max(id), 1)) FROM preguntas;"))
        await session.execute(text("SELECT setval(pg_get_serial_sequence('alternativas', 'id'), coalesce(max(id), 1)) FROM alternativas;"))
        await session.execute(text("SELECT setval(pg_get_serial_sequence('fases', 'id'), coalesce(max(id), 1)) FROM fases;"))
        await session.execute(text("SELECT setval(pg_get_serial_sequence('configuracion_progreso', 'id'), coalesce(max(id), 1)) FROM configuracion_progreso;"))
        
        await session.commit()
        print("✅ Simulación de base de datos de desarrollo sembrada con éxito.")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(simulate_dev_db())
