"""
Setup DB Script - LogicaKids Pro
Crea las tablas en la base de datos PostgreSQL usando SQLAlchemy.

Uso:
  docker compose exec backend python setup_db.py
  
  O directamente:
  python setup_db.py
"""

import asyncio
from app.db.session import engine
from app.db.base import Base

# Importar TODOS los modelos para que Base.metadata los conozca
from app.models.sql_models import (
    User,
    Fase,
    Alumno,
    Pregunta,
    Alternativa,
    ConfiguracionProgreso,
    PoolAsignadoAlumno,
    ProgresoMaestria,
    Intento,
)


async def setup():
    print("=" * 60)
    print("LogicaKids Pro - Database Setup")
    print("=" * 60)
    print()

    try:
        async with engine.begin() as conn:
            print("Creando tablas...")
            print("  - users (autenticacion)")
            print("  - fases")
            print("  - alumnos")
            print("  - preguntas")
            print("  - alternativas")
            print("  - configuracion_progreso")
            print("  - pool_asignado_alumno")
            print("  - progreso_maestria")
            print("  - intentos")
            print()

            await conn.run_sync(Base.metadata.create_all)
            print("✅ Todas las tablas creadas exitosamente!")

        await engine.dispose()
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(setup())
