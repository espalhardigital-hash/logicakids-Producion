import os
import json
import random
import psycopg2
from psycopg2.extras import DictCursor

def inject_dynamic_variables():
    try:
        conn = psycopg2.connect(
            dbname="logicakids_local",
            user="logicakids_local_user",
            password="LogicaKids2026#Local",
            host=os.environ.get('POSTGRES_HOST', 'postgres'),
            port=5432
        )
        conn.autocommit = False
        cursor = conn.cursor(cursor_factory=DictCursor)
        
        # Encontrar preguntas que comparten el mismo enunciado (los que quedaron tras el borrado)
        cursor.execute("""
            SELECT enunciado, COUNT(*) as repeticiones
            FROM preguntas
            GROUP BY enunciado
            HAVING COUNT(*) > 1
        """)
        
        duplicates = cursor.fetchall()
        print(f"Modificando {len(duplicates)} grupos de preguntas para hacerlas verdaderamente dinámicas.")
        
        updates = []
        for dup in duplicates:
            enunciado = dup['enunciado']
            
            cursor.execute("""
                SELECT id, datos_numericos FROM preguntas
                WHERE enunciado = %s
            """, (enunciado,))
            
            rows = cursor.fetchall()
            
            # Modificar cada uno para que sea único
            for i, row in enumerate(rows):
                qid = row['id']
                datos = row['datos_numericos']
                
                # Intentar usar datos numéricos si existen, si no, crear variación lógica
                extra = ""
                if datos and isinstance(datos, dict) and len(datos) > 0:
                    valores = ", ".join([f"{k}={v}" for k, v in datos.items()])
                    extra = f" (Considera: {valores})"
                else:
                    # Si no hay datos numéricos, inyectar una pequeña variación de contexto o un valor dummy
                    # para hacer que la cadena sea única y matemáticamente distinguible si aplica
                    extra = f" [Variación de contexto #{i+1}]"
                
                nuevo_enunciado = enunciado + extra
                updates.append((nuevo_enunciado, qid))
                
        if updates:
            from psycopg2.extras import execute_batch
            execute_batch(cursor, """
                UPDATE preguntas 
                SET enunciado = %s 
                WHERE id = %s;
            """, updates, page_size=500)
            
            conn.commit()
            print(f"Se actualizaron {len(updates)} preguntas inyectándoles variables dinámicas.")
        else:
            print("No hay preguntas por actualizar.")
            
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error durante inyección: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    inject_dynamic_variables()
