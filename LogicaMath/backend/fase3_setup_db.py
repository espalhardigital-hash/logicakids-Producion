"""
fase3_setup_db.py — Setup and Seeding Script for Phase 3
=========================================================
This script:
1. Verifies/creates the database tables required for Phase 3.
2. Runs the Phase 3 seeder to insert the 120 practice families and 150 challenge questions per level.

Usage:
  python fase3_setup_db.py
"""

import asyncio
import sys
import os

# Add current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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
