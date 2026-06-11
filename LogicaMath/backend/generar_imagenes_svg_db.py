import os
import psycopg2
from psycopg2.extras import DictCursor

def fix_missing_images():
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
        
        # Obtener preguntas con "en la imagen" sin <img o <svg
        cursor.execute("""
            SELECT id, enunciado
            FROM preguntas
            WHERE (enunciado ILIKE '%en la imagen%' OR enunciado ILIKE '%en la figura%')
              AND enunciado NOT ILIKE '%<img%'
              AND enunciado NOT ILIKE '%<svg%';
        """)
        
        questions = cursor.fetchall()
        print(f"Se encontraron {len(questions)} preguntas que mencionan imágenes pero no las tienen.")
        
        updates = []
        for q in questions:
            qid = q['id']
            enunciado = q['enunciado']
            
            # Reemplazar la frase problemática o añadir un SVG genérico
            if "prisma rectangular" in enunciado.lower() or "volumen" in enunciado.lower():
                # Añadir un SVG simple de un cubo 3D al final
                svg_cubo = '''
                <br/><svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="#60A5FA" stroke="#2563EB" stroke-width="2"/>
                  <path d="M30 30 L50 10 L90 10 L70 30 Z" fill="#93C5FD" stroke="#2563EB" stroke-width="2"/>
                  <path d="M70 30 L90 10 L90 50 L70 70 Z" fill="#3B82F6" stroke="#2563EB" stroke-width="2"/>
                </svg>
                '''
                nuevo_enunciado = enunciado + svg_cubo
            elif "termómetro" in enunciado.lower() or "escala" in enunciado.lower():
                 svg_term = '''
                <br/><svg width="40" height="100" viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
                  <rect x="15" y="10" width="10" height="70" rx="5" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2"/>
                  <circle cx="20" cy="80" r="10" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
                  <rect x="17" y="40" width="6" height="40" fill="#EF4444"/>
                </svg>
                '''
                 nuevo_enunciado = enunciado + svg_term
            else:
                # Si no sabemos qué imagen es, simplemente cambiamos el texto
                nuevo_enunciado = enunciado.replace("que se muestra en la imagen", "descrito")
                nuevo_enunciado = nuevo_enunciado.replace("en la imagen", "")
                nuevo_enunciado = nuevo_enunciado.replace("en la figura", "")
            
            updates.append((nuevo_enunciado, qid))
            
        if updates:
            from psycopg2.extras import execute_batch
            execute_batch(cursor, """
                UPDATE preguntas 
                SET enunciado = %s 
                WHERE id = %s;
            """, updates, page_size=500)
            
            conn.commit()
            print(f"Se repararon {len(updates)} preguntas inyectando SVG o ajustando el texto.")
        else:
            print("No hay preguntas por reparar.")
            
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error reparando imágenes: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    fix_missing_images()
