import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()
original_url = os.getenv("DATABASE_URL")
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
