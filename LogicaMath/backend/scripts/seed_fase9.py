import asyncio
import os
import sys
import random
from datetime import datetime

# Añadir el directorio raíz al path para poder importar 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.models.sql_models import Pregunta, Alternativa, OperacionEnum, TipoPreguntaEnum, StatusEnum

async def seed_fase9():
    print("Iniciando inyección de preguntas para Fase 9...")
    
    async with AsyncSessionLocal() as db:
        # Borrar preguntas existentes de fase 9 para evitar duplicados en re-ejecuciones
        print("Limpiando preguntas anteriores de la Fase 9...")
        from sqlalchemy import select, delete
        
        # Eliminar alternativas primero
        result = await db.execute(select(Pregunta.id).where(Pregunta.fase_id == 9))
        pregunta_ids = result.scalars().all()
        
        if pregunta_ids:
            await db.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids)))
            await db.execute(delete(Pregunta).where(Pregunta.fase_id == 9))
            await db.commit()
            print(f"Borradas {len(pregunta_ids)} preguntas antiguas.")

        # Estructura: (modulo_id, cantidad_niveles)
        estructura = [
            (1, 5),   # Fácil: 5 tests
            (2, 10),  # Intermedio: 10 tests
            (3, 5)    # Difícil: 5 tests
        ]

        total_insertadas = 0

        for modulo_id, num_niveles in estructura:
            for nivel_id in range(1, num_niveles + 1):
                seccion = modulo_id * 100 + nivel_id
                
                print(f"Generando Módulo {modulo_id} - Nivel {nivel_id} (Sección {seccion})...")
                
                for q_num in range(1, 11):  # 10 preguntas por test
                    # Enunciado tipo Markdown para incrustar imagen
                    # Ejemplo: ![Pregunta 1](/images/simulacros/fase9/m1_n1_q1.svg)
                    enunciado = f"![Pregunta {q_num}](/images/simulacros/fase9/m{modulo_id}_n{nivel_id}_q{q_num}.svg)"
                    
                    opciones = ["A", "B", "C", "D"]
                    correct_idx = random.randint(0, 3)
                    
                    nueva_pregunta = Pregunta(
                        fase_id=9,
                        seccion=seccion,
                        operacion=OperacionEnum.MIXTA,
                        tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION,
                        enunciado=enunciado,
                        respuesta_correcta=opciones[correct_idx],
                        requiere_subrayado=False,
                        estado=StatusEnum.ACTIVO,
                        fecha_creacion=datetime.utcnow()
                    )
                    
                    db.add(nueva_pregunta)
                    await db.flush()  # Para obtener el ID de la pregunta
                    
                    # Generar las 4 alternativas
                    for i, texto in enumerate(opciones):
                        alt = Alternativa(
                            pregunta_id=nueva_pregunta.id,
                            texto=texto,
                            es_correcta=(i == correct_idx),
                            orden=i + 1
                        )
                        db.add(alt)
                    
                    total_insertadas += 1

        print("Guardando cambios en la base de datos...")
        await db.commit()
        print(f"¡Éxito! Se han insertado {total_insertadas} preguntas para la Fase 9.")

if __name__ == "__main__":
    asyncio.run(seed_fase9())
