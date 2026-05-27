"""
test_db_conn.py - Probador de Conexión a la Base de Datos
======================================================
¿QUÉ HACE?
  Prueba la conectividad asíncrona (con SQLAlchemy + asyncpg) a la base de datos PostgreSQL.
  - Imprime la versión del motor de base de datos PostgreSQL.
  - Muestra una lista de todas las tablas existentes en el esquema 'public'.
  - Detecta automáticamente si se encuentra corriendo dentro de un contenedor Docker
    para decidir si se conecta localmente (PC a VPS) o dentro de la red interna del contenedor.

¿CUÁNDO SE DEBE EJECUTAR?
  - Al experimentar fallos o latencia de conexión con la base de datos.
  - Para verificar si las variables de entorno o el archivo `.env` se cargan correctamente.
  - Para comprobar si la migración de tablas con Alembic se aplicó con éxito.

¿CÓMO EJECUTARLO MANUALMENTE?
  - Localmente (en PC de desarrollo):
      .\venv\Scripts\python.exe manual_scripts/test_db_conn.py
  - En el Servidor VPS (dentro del contenedor backend):
      docker exec -it logica_kids_desarrollo-backend-1 python manual_scripts/test_db_conn.py
"""

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

is_docker = os.path.exists('/.dockerenv')
if is_docker:
    vps_url = original_url
    print("Running inside Docker. Using original DATABASE_URL:", vps_url)
else:
    vps_url = original_url.replace("base_postgres_general", "34.9.51.225")
    print("Running outside Docker. Trying VPS URL:", vps_url)

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
