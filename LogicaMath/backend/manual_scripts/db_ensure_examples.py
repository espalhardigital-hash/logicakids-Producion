import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update

from app.models.sql_models import Pregunta
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def generate_generic_explanation(pregunta: Pregunta):
    correcta = pregunta.respuesta_correcta
    return {
        "titulo": "Ejemplo Guiado (Generado)",
        "pasos": [
            {
                "orden": 1,
                "texto": "Lee cuidadosamente el enunciado e identifica la operación requerida.",
                "calculo": ""
            },
            {
                "orden": 2,
                "texto": "Aplica la lógica o cálculo matemático correspondiente paso a paso.",
                "calculo": ""
            },
            {
                "orden": 3,
                "texto": f"La respuesta correcta es {correcta}.",
                "calculo": "¡Recuerda revisar tus cálculos!"
            }
        ]
    }

async def ensure_guided_examples():
    async with AsyncSessionLocal() as session:
        print("Auditoría de Ejemplos Guiados por Fase y Sección...")
        
        # Obtener todas las fases y secciones únicas
        query_group = select(Pregunta.fase_id, Pregunta.seccion).distinct()
        res_groups = await session.execute(query_group)
        grupos = res_groups.fetchall()
        
        total_promovidos = 0
        secciones_revisadas = 0
        secciones_deficitarias = 0
        
        for fase_id, seccion in grupos:
            # Buscar cuántas tienen explicacion_paso_a_paso
            query_all = select(Pregunta).where(Pregunta.fase_id == fase_id, Pregunta.seccion == seccion)
            res_all = await session.execute(query_all)
            preguntas = res_all.scalars().all()
            
            con_ejemplo = [p for p in preguntas if p.explicacion_paso_a_paso is not None]
            sin_ejemplo = [p for p in preguntas if p.explicacion_paso_a_paso is None]
            
            count = len(con_ejemplo)
            secciones_revisadas += 1
            
            if count < 5:
                secciones_deficitarias += 1
                faltantes = 5 - count
                a_promover = sin_ejemplo[:faltantes]
                
                for p in a_promover:
                    p.explicacion_paso_a_paso = generate_generic_explanation(p)
                    total_promovidos += 1
        
        await session.commit()
        print(f"✅ Auditoría completada.")
        print(f"📊 Se revisaron {secciones_revisadas} secciones lógicas.")
        print(f"⚠️ Se detectaron {secciones_deficitarias} secciones con menos de 5 ejemplos guiados.")
        print(f"✨ Se promovieron {total_promovidos} preguntas regulares a Ejemplos Guiados con explicación paso a paso.")

if __name__ == "__main__":
    asyncio.run(ensure_guided_examples())
