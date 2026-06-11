import asyncio
import os
import sys

# Añadir el path raíz para que importe 'app' correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete, func

from app.db.base import Base
from app.models.sql_models import Pregunta, Alternativa
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def remove_duplicates():
    async with AsyncSessionLocal() as session:
        print("Buscando preguntas agrupadas por texto exacto de enunciado...")
        
        # Encontramos los enunciados que tienen más de 1 repetición
        query = select(Pregunta.enunciado, func.count(Pregunta.id).label("total"))\
                .group_by(Pregunta.enunciado)\
                .having(func.count(Pregunta.id) > 1)
        
        result = await session.execute(query)
        duplicates = result.fetchall()
        
        total_grupos = len(duplicates)
        print(f"Se encontraron {total_grupos} grupos de enunciados duplicados.")
        
        preguntas_a_borrar = 0
        grupos_procesados = 0
        
        for enunciado, total in duplicates:
            # Obtenemos todos los IDs de este grupo ordenados
            # Para conservar variedad si las respuestas cambian, agrupamos por hash de alternativas
            # Simplificación: Dejaremos un máximo de 5 variantes vivas por cada enunciado exacto.
            
            q_ids = select(Pregunta.id).where(Pregunta.enunciado == enunciado).order_by(Pregunta.id.asc())
            res_ids = await session.execute(q_ids)
            all_ids = [row[0] for row in res_ids.fetchall()]
            
            limite_retencion = 5
            ids_a_borrar = all_ids[limite_retencion:]
            
            if ids_a_borrar:
                # Borramos masivamente
                await session.execute(delete(Pregunta).where(Pregunta.id.in_(ids_a_borrar)))
                preguntas_a_borrar += len(ids_a_borrar)
            
            grupos_procesados += 1
            if grupos_procesados % 100 == 0:
                print(f"Procesados {grupos_procesados}/{total_grupos} grupos...")
                await session.commit()
                
        await session.commit()
        print(f"✅ Proceso terminado. Se eliminaron {preguntas_a_borrar} preguntas duplicadas.")

if __name__ == "__main__":
    asyncio.run(remove_duplicates())
