import asyncio
import sys
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add backend root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load .env from backend root directory explicitly
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

original_url = os.getenv("DATABASE_URL")
if not original_url:
    print("WARNING: DATABASE_URL not found in environment or .env file.")
    # Set a fallback/dummy so it doesn't crash on replace
    original_url = "postgresql+asyncpg://user:pass@base_postgres_general:5432/db"

vps_url = original_url.replace("base_postgres_general", "34.9.51.225")
print("Trying VPS URL:", vps_url)

async def test_conn():
    try:
        engine = create_async_engine(vps_url)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            row = result.fetchone()
            print("PostgreSQL Version:", row[0])
            
            # List tables
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            print("Tables found in 'public' schema:")
            for t in tables:
                print(f" - {t[0]}")
    except Exception as e:
        print("Error connecting to DB:", e)

if __name__ == "__main__":
    asyncio.run(test_conn())
