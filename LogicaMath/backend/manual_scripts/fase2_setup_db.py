"""
fase2_setup_db.py — Setup and Seeding Script for Phase 2
=========================================================
This script:
1. Verifies/creates the database tables required for Phase 2:
   - intento_preguntas
   - intento_pasos
   - niveles_teoria_pool
2. Runs the Phase 2 seeder to insert the 120 practice families and 150 challenge questions per level.

Usage:
  python fase2_setup_db.py
"""

import asyncio
import sys
import os

# Add backend root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import Base
from app.db.session import engine
# Import Phase 2 models to register them on Base metadata
from app.fase2.models import IntentoPregunta, IntentoPaso, NivelTeoria
from app.fase2.seed import run_fase2_seed

async def main():
    print("=" * 60)
    print("LOGICAKIDS - PHASE 2 DATABASE SETUP & SEEDING")
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

    # 3. Seed Phase 2 questions and theory
    print("\n[STEP 2/2] Running Phase 2 Seeder (this might take a moment)...")
    try:
        await run_fase2_seed()
        print("\n[OK] Phase 2 seeding completed successfully!")
    except Exception as e:
        import traceback
        print(f"\n[ERROR] Error seeding Phase 2 database: {e}")
        traceback.print_exc()
        sys.exit(1)

    print("\n" + "=" * 60)
    print("PHASE 2 DATABASE SETUP FINISHED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
