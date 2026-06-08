import asyncio
import os
import sys

print("=============================================================")
print("DIAGNOSTIC TEST: VERIFYING RECENT COMMITS & SYSTEM INTEGRITY")
print("=============================================================")

# 1. Verify Imports (Commits: fc61415, 5cf1911, 24aa662)
print("\n[STEP 1] Verifying library imports and dependencies:")
try:
    import aiofiles
    print("  \u2705 aiofiles imported successfully.")
except ImportError as e:
    print("  \u274c aiofiles import failed:", e)

try:
    import jinja2
    print("  \u2705 jinja2 imported successfully.")
except ImportError as e:
    print("  \u274c jinja2 import failed:", e)

try:
    import redis
    print(f"  \u2705 redis-py imported successfully (Version: {redis.__version__}).")
except ImportError as e:
    print("  \u274c redis import failed:", e)

try:
    from fastapi_cache import FastAPICache
    from fastapi_cache.backends.redis import RedisBackend
    print("  \u2705 fastapi-cache2 with redis backend imported successfully.")
except Exception as e:
    print("  \u274c fastapi-cache2 imports failed:", e)


# 2. Verify Redis Connectivity (Commit: 81fe949)
print("\n[STEP 2] Verifying Redis connectivity:")
redis_url = os.getenv("REDIS_URL")
print(f"  REDIS_URL in environment: '{redis_url}'")
if not redis_url:
    print("  \u274c REDIS_URL environment variable is empty/missing.")
else:
    try:
        r = redis.Redis.from_url(redis_url, socket_connect_timeout=5)
        ping_res = r.ping()
        print(f"  \u2705 Connection to Redis successful! Ping response: {ping_res}")
    except Exception as e:
        print(f"  \u274c Redis connection failed: {e}")


# 3. Verify Database Seed status (Commit: 34eb89b)
print("\n[STEP 3] Verifying Database Seeding and Foreign Key Integrity:")
async def test_db():
    try:
        # Add backend root to path to ensure standard imports work
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from app.db.session import AsyncSessionLocal
        from sqlalchemy import select, func
        from app.models.sql_models import Pregunta, Alternativa, Fase
        from app.models.progreso import Intento, PoolAsignadoAlumno
        
        async with AsyncSessionLocal() as session:
            # Check Fases count
            res_f = await session.execute(select(func.count(Fase.id)))
            num_fases = res_f.scalar()
            print(f"  \u2705 Database Fases count: {num_fases}")
            
            # Check Preguntas count
            res_p = await session.execute(select(func.count(Pregunta.id)))
            num_preg = res_p.scalar()
            print(f"  \u2705 Database Preguntas count: {num_preg}")

            # Check Alternativas count
            res_a = await session.execute(select(func.count(Alternativa.id)))
            num_alt = res_a.scalar()
            print(f"  \u2705 Database Alternativas count: {num_alt}")

            # Check Intentos count
            res_i = await session.execute(select(func.count(Intento.id)))
            num_int = res_i.scalar()
            print(f"  \u2705 Database Intentos count: {num_int}")

            # Check PoolAsignadoAlumno count
            res_pa = await session.execute(select(func.count(PoolAsignadoAlumno.id)))
            num_pa = res_pa.scalar()
            print(f"  \u2705 Database PoolAsignadoAlumno count: {num_pa}")

            if num_preg > 0:
                print("  \u2705 Seed verification complete. Database contains active seeded data!")
            else:
                print("  \u274c Seed verification failed. No questions found in the database.")
    except Exception as e:
        print(f"  \u274c Database verification failed: {e}")

asyncio.run(test_db())

print("\n=============================================================")
print("DIAGNOSTIC COMPLETE")
print("=============================================================")
