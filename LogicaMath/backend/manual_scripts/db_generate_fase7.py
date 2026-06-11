import asyncio
import os
import sys
import random
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete

from app.models.sql_models import Pregunta, Alternativa
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def generate_fase7_questions():
    preguntas_generadas = []
    
    # Módulo 1 (seccion 101-105): Rutas y Movimientos (Norte, Sur, Este, Oeste)
    for _ in range(50):
        x = random.randint(0, 5)
        y = random.randint(0, 5)
        mov_norte = random.randint(1, 4)
        mov_este = random.randint(1, 4)
        
        final_x = x + mov_este
        final_y = y + mov_norte
        
        enunciado = f"El robot está en la posición ({x}, {y}). Si camina {mov_norte} pasos hacia el Norte (arriba) y {mov_este} pasos hacia el Este (derecha), ¿en qué posición final se encontrará?"
        correcta = f"({final_x}, {final_y})"
        
        alternativas = [
            correcta,
            f"({final_x + 1}, {final_y})",
            f"({final_x}, {final_y - 1})",
            f"({y}, {x})"
        ]
        random.shuffle(alternativas)
        
        preguntas_generadas.append({
            "seccion": random.randint(101, 105),
            "enunciado": enunciado,
            "respuesta_correcta": correcta,
            "alternativas": alternativas,
            "datos_numericos": {"x": x, "y": y, "mov_n": mov_norte, "mov_e": mov_este, "tipo_visual": "cuadricula"}
        })
        
    # Módulo 2 (seccion 201-205): Distancia (Pasos mínimos - Manhattan)
    for _ in range(50):
        x1, y1 = random.randint(1, 8), random.randint(1, 8)
        x2, y2 = random.randint(1, 8), random.randint(1, 8)
        while x1 == x2 and y1 == y2:
            x2, y2 = random.randint(1, 8), random.randint(1, 8)
            
        distancia = abs(x2 - x1) + abs(y2 - y1)
        
        enunciado = f"El pirata está en la isla ({x1}, {y1}) y el tesoro está en ({x2}, {y2}). ¿Cuántos pasos mínimos en línea recta (horizontal o vertical) debe dar para llegar al tesoro?"
        correcta = f"{distancia} pasos"
        
        alternativas = [
            correcta,
            f"{distancia + 1} pasos",
            f"{distancia - 1} pasos",
            f"{abs(x2 - x1)} pasos"
        ]
        # Asegurar unicidad rápida
        alternativas = list(dict.fromkeys(alternativas))
        while len(alternativas) < 4:
            alternativas.append(f"{random.randint(1, 15)} pasos")
            alternativas = list(dict.fromkeys(alternativas))
        random.shuffle(alternativas)
        
        preguntas_generadas.append({
            "seccion": random.randint(201, 205),
            "enunciado": enunciado,
            "respuesta_correcta": correcta,
            "alternativas": alternativas[:4],
            "datos_numericos": {"x1": x1, "y1": y1, "x2": x2, "y2": y2, "tipo_visual": "mapa_tesoro"}
        })
        
    # Módulo 3 (seccion 301-305): Reflejos y Simetría
    for _ in range(50):
        x = random.randint(1, 8)
        y = random.randint(1, 8)
        eje = random.choice(["X", "Y"])
        
        if eje == "X":
            ref_x, ref_y = x, -y
            enunciado = f"Si colocas un espejo sobre el eje X (horizontal), ¿cuál es el reflejo del punto ({x}, {y})?"
        else:
            ref_x, ref_y = -x, y
            enunciado = f"Si colocas un espejo sobre el eje Y (vertical), ¿cuál es el reflejo del punto ({x}, {y})?"
            
        correcta = f"({ref_x}, {ref_y})"
        
        alternativas = [
            correcta,
            f"({-ref_x}, {-ref_y})",
            f"({y}, {x})",
            f"({-x}, {-y})"
        ]
        alternativas = list(dict.fromkeys(alternativas))
        while len(alternativas) < 4:
            alternativas.append(f"({random.randint(-8, 8)}, {random.randint(-8, 8)})")
            alternativas = list(dict.fromkeys(alternativas))
        random.shuffle(alternativas)
        
        preguntas_generadas.append({
            "seccion": random.randint(301, 305),
            "enunciado": enunciado,
            "respuesta_correcta": correcta,
            "alternativas": alternativas[:4],
            "datos_numericos": {"x": x, "y": y, "eje": eje, "tipo_visual": "plano_cartesiano"}
        })

    return preguntas_generadas

async def populate_fase7():
    async with AsyncSessionLocal() as session:
        print("Eliminando preguntas base de Fase 7 para re-generación limpia...")
        # Primero borramos las de Fase 7 que existan para no duplicar en reejecuciones
        q_ids = select(Pregunta.id).where(Pregunta.fase_id == 7)
        res_ids = await session.execute(q_ids)
        ids_f7 = [r[0] for r in res_ids.fetchall()]
        
        if ids_f7:
            await session.execute(delete(Pregunta).where(Pregunta.id.in_(ids_f7)))
            await session.commit()
            print(f"Limpiadas {len(ids_f7)} preguntas antiguas de Fase 7.")

        print("Generando nuevo pool paramétrico de Fase 7...")
        nuevas = generate_fase7_questions()
        
        total_insertadas = 0
        for data in nuevas:
            p = Pregunta(
                fase_id=7,
                seccion=data["seccion"],
                operacion="rutas",
                tipo_pregunta="multiple",
                enunciado=data["enunciado"],
                respuesta_correcta=data["respuesta_correcta"],
                datos_numericos=data["datos_numericos"],
                explicacion_paso_a_paso={"pasos": ["Analiza la posición inicial.", "Aplica el movimiento o transformación indicada.", "Obtén la nueva coordenada."]},
                estado="activo"
            )
            session.add(p)
            await session.flush()  # Para obtener p.id
            
            for alt_texto in data["alternativas"]:
                alt = Alternativa(
                    pregunta_id=p.id,
                    texto=alt_texto,
                    es_correcta=(alt_texto == data["respuesta_correcta"])
                )
                session.add(alt)
                
            total_insertadas += 1
            
        await session.commit()
        print(f"✅ Población completada. Se inyectaron {total_insertadas} preguntas nuevas en la Fase 7.")

if __name__ == "__main__":
    asyncio.run(populate_fase7())
