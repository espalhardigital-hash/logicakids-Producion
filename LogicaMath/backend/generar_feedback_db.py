import os
import json
import psycopg2
from psycopg2.extras import DictCursor

def generate_missing_feedback():
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
        
        # Obtener preguntas sin explicacion
        cursor.execute("""
            SELECT id, respuesta_correcta, tipo_pregunta
            FROM preguntas
            WHERE explicacion_paso_a_paso IS NULL OR explicacion_paso_a_paso::text = 'null' OR explicacion_paso_a_paso::text = '""';
        """)
        
        questions = cursor.fetchall()
        print(f"Se encontraron {len(questions)} preguntas sin explicación (feedback).")
        
        updates = []
        for q in questions:
            qid = q['id']
            respuesta = q['respuesta_correcta']
            
            # Generar mock JSON feedback
            feedback_json = {
                "pasos": [
                    {
                        "titulo": "Análisis Inicial",
                        "descripcion": "Lee el enunciado detenidamente para identificar los datos clave del problema lógico o matemático."
                    },
                    {
                        "titulo": "Resolución",
                        "descripcion": f"Aplicando el método correcto, llegamos a la conclusión de que la respuesta es '{respuesta}'."
                    },
                    {
                        "titulo": "Verificación",
                        "descripcion": "Siempre es recomendable repasar tus pasos para asegurarte de no haber cometido un error de cálculo o interpretación."
                    }
                ]
            }
            
            updates.append((json.dumps(feedback_json), qid))
            
        if updates:
            from psycopg2.extras import execute_batch
            execute_batch(cursor, """
                UPDATE preguntas 
                SET explicacion_paso_a_paso = %s::json 
                WHERE id = %s;
            """, updates, page_size=500)
            
            conn.commit()
            print(f"Se actualizaron {len(updates)} preguntas con feedback simulado exitosamente.")
        else:
            print("No hay preguntas pendientes por actualizar.")
            
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error generando feedback: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    generate_missing_feedback()
