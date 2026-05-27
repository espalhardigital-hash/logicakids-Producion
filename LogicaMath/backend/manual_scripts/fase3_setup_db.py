"""
fase3_setup_db.py — Setup and Seeding Script for Phase 3
=========================================================
¿QUÉ HACE?
  1. Verifica y crea las tablas requeridas para la Fase 3 en la base de datos.
  2. Ejecuta el seeder de la Fase 3, insertando las preguntas de práctica y los desafíos
     con las narrativas y variaciones didácticas correspondientes.

¿CUÁNDO SE DEBE EJECUTAR?
  - Cuando se requiera inicializar o actualizar la estructura de tablas para la Fase 3.
  - Cuando se desee re-sembrar y actualizar todas las preguntas y la teoría de la Fase 3 en la base de datos.
  - Después de aplicar cambios mayores en los generadores o lógica de las preguntas de la Fase 3.

¿CÓMO EJECUTARLO MANUALMENTE?
  - Localmente (en PC de desarrollo):
      .\venv\Scripts\python.exe manual_scripts/fase3_setup_db.py
  - En el Servidor VPS (dentro del contenedor backend):
      docker exec -it logica_kids_desarrollo-backend-1 python manual_scripts/fase3_setup_db.py
"""

import asyncio
import sys
import os

# Add backend root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import Base
from app.db.session import engine
from app.fase3.seed import run_fase3_seed

async def main():
    print("=" * 60)
    print("LOGICAKIDS - PHASE 3 DATABASE SETUP & SEEDING")
    print("=" * 60)
    
    # 1. Wait for database or verify connection
    from wait_for_db import wait_for_db
    try:
        wait_for_db()
        print("[OK] Database connection verified.")
    except Exception as e:
        print(f"[ERROR] Could not connect to the database: {e}")
        sys.exit(1)

    # 2. Verify/create tables
    print("\n[STEP 1/2] Verifying and creating required database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("[OK] All database tables verified and created successfully.")
    except Exception as e:
        print(f"[ERROR] Error creating database tables: {e}")
        sys.exit(1)

    # 3. Seed Phase 3 questions and theory
    print("\n[STEP 2/2] Running Phase 3 Seeder (this might take a moment)...")
    try:
        await run_fase3_seed()
        print("\n[OK] Phase 3 seeding completed successfully!")
    except Exception as e:
        import traceback
        print(f"\n[ERROR] Error seeding Phase 3 database: {e}")
        traceback.print_exc()
        sys.exit(1)

    print("\n" + "=" * 60)
    print("PHASE 3 DATABASE SETUP FINISHED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
