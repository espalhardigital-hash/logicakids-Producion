import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        try:
            # Check connection
            res = await session.execute(text("SELECT 1"))
            print("Database connection: SUCCESS")
            
            # Inspect table columns for 'preguntas'
            res = await session.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'preguntas'
            """))
            columns = res.fetchall()
            print("Columns in 'preguntas' table:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]}")
        except Exception as e:
            print("Error connecting or querying database:", e)

if __name__ == "__main__":
    asyncio.run(check())
