import os
import json
import psycopg2
from psycopg2.extras import DictCursor

def generate_ejemplos_guiados():
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
        
        # Obtener todas las combinaciones únicas de fase y seccion
        cursor.execute("""
            SELECT DISTINCT fase_id, seccion
            FROM preguntas
            ORDER BY fase_id, seccion
        """)
        
        niveles = cursor.fetchall()
        print(f"Se encontraron {len(niveles)} niveles (fase+seccion) únicos en la BD.")
        
        updates = []
        for nivel in niveles:
            fase = nivel['fase_id']
            sec = nivel['seccion']
            
            # Seleccionar hasta 5 preguntas de este nivel para convertirlas en ejemplos guiados
            cursor.execute("""
                SELECT id, enunciado, respuesta_correcta
                FROM preguntas
                WHERE fase_id = %s AND seccion = %s
                ORDER BY id ASC
                LIMIT 5
            """, (fase, sec))
            
            preguntas = cursor.fetchall()
            
            for i, q in enumerate(preguntas):
                qid = q['id']
                enunciado = q['enunciado']
                resp = q['respuesta_correcta']
                
                # Evitar prefijar múltiples veces
                if not enunciado.startswith("EJEMPLO GUIADO"):
                    nuevo_enunciado = f"EJEMPLO GUIADO #{i+1}: {enunciado}"
                else:
                    nuevo_enunciado = enunciado
                    
                feedback_guiado = {
                    "pasos": [
                        {
                            "titulo": "Tutorial Paso 1: Leer e identificar",
                            "descripcion": f"Este es un ejercicio de ejemplo. Observa detenidamente los datos presentados: '{nuevo_enunciado[:50]}...'."
                        },
                        {
                            "titulo": "Tutorial Paso 2: Análisis y Resolución",
                            "descripcion": f"Aplicando los conceptos de la fase {fase}, determinamos que la respuesta lógica es: {resp}."
                        },
                        {
                            "titulo": "Tutorial Paso 3: Tip",
                            "descripcion": "Recuerda esta metodología para cuando resuelvas los desafíos sin ayuda guiada."
                        }
                    ]
                }
                
                updates.append((nuevo_enunciado, json.dumps(feedback_guiado), qid))
                
        if updates:
            from psycopg2.extras import execute_batch
            execute_batch(cursor, """
                UPDATE preguntas 
                SET enunciado = %s, explicacion_paso_a_paso = %s::json
                WHERE id = %s;
            """, updates, page_size=500)
            
            conn.commit()
            print(f"Se marcaron y actualizaron {len(updates)} preguntas como Ejemplos Guiados en toda la plataforma.")
        else:
            print("No hay preguntas por actualizar.")
            
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error generando ejemplos guiados: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    generate_ejemplos_guiados()
