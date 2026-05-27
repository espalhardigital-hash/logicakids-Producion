import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()
original_url = os.getenv("DATABASE_URL")
tunnel_url = original_url.replace("base_postgres_general", "127.0.0.1")
print("Connecting via SSH tunnel to:", tunnel_url)

async def test_conn():
    try:
        engine = create_async_engine(tunnel_url)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            row = result.fetchone()
            print("SUCCESS! PostgreSQL Version:", row[0])
    except Exception as e:
        print("Error connecting to DB via tunnel:", e)

if __name__ == "__main__":
    asyncio.run(test_conn())
