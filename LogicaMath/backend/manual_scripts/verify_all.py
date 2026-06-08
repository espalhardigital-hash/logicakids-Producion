import asyncio
import os
import sys
import shutil
from sqlalchemy import event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

# Fix Windows console unicode encode issues
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Add current directory and parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Register JSONB compilation override for SQLite compatibility
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

async def run():
    print("=" * 70)
    # 1. Back up .env
    env_path = ".env"
    env_backup_path = ".env.backup"
    
    if os.path.exists(env_path):
        shutil.copyfile(env_path, env_backup_path)
        print("[OK] Backed up .env file.")
    else:
        print("[WARNING] .env file not found!")
        
    # 2. Write SQLite .env preserving other variables like SECRET_KEY
    new_lines = []
    if os.path.exists(env_backup_path):
        with open(env_backup_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("DATABASE_URL="):
                    new_lines.append("DATABASE_URL=sqlite+aiosqlite:///local_verify.db\n")
                else:
                    new_lines.append(line)
    else:
        new_lines.append("DATABASE_URL=sqlite+aiosqlite:///local_verify.db\n")
        new_lines.append("SECRET_KEY=math-challenge-jwt-secret-key-change-me-in-pruebaslocas\n")

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("[OK] Temporarily pointed DATABASE_URL to local SQLite database, preserving other config variables.")
    
    # Clean any old db
    db_file = "local_verify.db"
    if os.path.exists(db_file):
        os.remove(db_file)
        
    try:
        # Import app components inside since they load settings immediately
        from app.db.base import Base
        from app.db.session import engine
        from app.fase2.seed import run_fase2_seed
        from app.fase3.seed import run_fase3_seed
        from app.utils.analyze_database import run_analysis
        from app.utils.auditor_preguntas import run_audit
        
        # Register standard MOD function on SQLite connection
        @event.listens_for(engine.sync_engine, "connect")
        def register_sqlite_functions(dbapi_connection, connection_record):
            dbapi_connection.create_function("mod", 2, lambda x, y: x % y)

        # 3. Create tables
        print("\n--- Creating database tables on SQLite ---")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[OK] SQLite tables created.")
        
        # 4. Run seed first time
        print("\n--- Seeding First Time (Should seed all) ---")
        from app.seed import run_seed
        await run_seed()
        print("[OK] First seeding finished.")
        
        # 5. Run seed second time (Should skip all)
        print("\n--- Seeding Second Time (Should skip all) ---")
        await run_seed()
        print("[OK] Second seeding finished.")
        
        # 6. Run database structure analysis
        print("\n--- Running analyze_database.py ---")
        await run_analysis()
        
        # 7. Run question quality audit
        print("\n--- Running auditor_preguntas.py ---")
        await run_audit()
        
    except Exception as e:
        print(f"\n[ERROR] Verification script failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # 8. Restore .env
        if os.path.exists(env_backup_path):
            shutil.copyfile(env_backup_path, env_path)
            os.remove(env_backup_path)
            print("\n[OK] Restored original .env file.")
        else:
            print("\n[WARNING] Could not restore .env, backup not found.")
            
        # Clean up database file
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
                print("[OK] Cleaned up local SQLite verify database.")
            except Exception as ex:
                print(f"[WARNING] Could not delete local SQLite verify database file: {ex}")

if __name__ == "__main__":
    asyncio.run(run())
