import asyncio
import re
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def clean_enunciados():
    print("Iniciando saneamiento de enunciados de preguntas...")
    query_select = text("SELECT id, enunciado FROM preguntas WHERE enunciado LIKE '%Considera:%';")
    query_update = text("UPDATE preguntas SET enunciado = :new_enunciado WHERE id = :id;")
    
    cleaned_count = 0
    async with AsyncSessionLocal() as session:
        result = await session.execute(query_select)
        rows = result.fetchall()
        print(f"Encontradas {len(rows)} preguntas que contienen 'Considera:'.")
        
        for row in rows:
            q_id = row[0]
            old_text = row[1]
            
            # Remove (Considera: es_desafio=True/False) or similar variations
            # Handle possible trailing space/newlines
            new_text = re.sub(r'\s*\(Considera:\s*es_desafio=(True|False)\)', '', old_text)
            
            if new_text != old_text:
                await session.execute(query_update, {"new_enunciado": new_text, "id": q_id})
                cleaned_count += 1
                print(f"Pregunta {q_id} saneada.")
                print(f"  Antes: {old_text}")
                print(f"  Ahora: {new_text}")
        
        if cleaned_count > 0:
            await session.commit()
            print(f"¡Saneamiento finalizado con éxito! {cleaned_count} preguntas actualizadas y guardadas.")
        else:
            print("No se encontraron cambios pendientes para realizar.")

if __name__ == "__main__":
    asyncio.run(clean_enunciados())
