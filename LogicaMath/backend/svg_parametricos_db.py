import os
import json
import psycopg2
from psycopg2.extras import DictCursor

def generate_parametric_svgs():
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
        
        # Obtener preguntas de volumen o que tengan SVG de la iteración anterior
        cursor.execute("""
            SELECT id, enunciado, datos_numericos 
            FROM preguntas
            WHERE enunciado ILIKE '%<svg%' AND (enunciado ILIKE '%volumen%' OR enunciado ILIKE '%prisma%')
        """)
        
        questions = cursor.fetchall()
        print(f"Reemplazando SVGs genéricos por paramétricos en {len(questions)} preguntas.")
        
        updates = []
        for q in questions:
            qid = q['id']
            enunciado = q['enunciado']
            datos = q['datos_numericos']
            
            # Parametrizar dimensiones (default a cubo perfecto si no hay datos)
            ancho = 40
            alto = 40
            prof = 20
            
            if datos and isinstance(datos, dict):
                # Intentar buscar claves como 'base', 'altura', 'profundidad', 'largo', etc.
                valores = list(datos.values())
                nums = [int(v) for v in valores if isinstance(v, (int, str)) and str(v).isdigit()]
                if len(nums) >= 3:
                    ancho = max(20, min(100, nums[0] * 10))
                    alto = max(20, min(100, nums[1] * 10))
                    prof = max(10, min(50, nums[2] * 5))
                elif len(nums) >= 1:
                    ancho = alto = max(20, min(100, nums[0] * 10))
                    
            # Eliminar el SVG anterior buscando "<br/><svg"
            base_text = enunciado.split("<br/><svg")[0]
            
            # Construir SVG isométrico paramétrico (aproximación visual)
            x0, y0 = 10, alto + prof
            x1, y1 = x0 + ancho, y0
            x2, y2 = x1 + prof, y0 - prof
            x3, y3 = x0 + prof, y0 - prof
            
            svg_dinamico = f'''
            <br/><svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
              <!-- Cara frontal -->
              <polygon points="{x0},{y0} {x1},{y1} {x1},{y1-alto} {x0},{y0-alto}" fill="#60A5FA" stroke="#2563EB" stroke-width="2"/>
              <!-- Cara superior -->
              <polygon points="{x0},{y0-alto} {x1},{y1-alto} {x2},{y2-alto} {x3},{y3-alto}" fill="#93C5FD" stroke="#2563EB" stroke-width="2"/>
              <!-- Cara lateral -->
              <polygon points="{x1},{y1} {x2},{y2} {x2},{y2-alto} {x1},{y1-alto}" fill="#3B82F6" stroke="#2563EB" stroke-width="2"/>
              <text x="10" y="140" font-family="Arial" font-size="10" fill="#4B5563">Paramétrico: {ancho}x{alto}x{prof}</text>
            </svg>
            '''
            
            nuevo_enunciado = base_text + svg_dinamico
            updates.append((nuevo_enunciado, qid))
            
        if updates:
            from psycopg2.extras import execute_batch
            execute_batch(cursor, """
                UPDATE preguntas 
                SET enunciado = %s 
                WHERE id = %s;
            """, updates, page_size=500)
            
            conn.commit()
            print(f"Se actualizaron {len(updates)} SVGs paramétricos.")
        else:
            print("No hay preguntas por actualizar con SVG.")
            
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error generando SVGs: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    generate_parametric_svgs()
