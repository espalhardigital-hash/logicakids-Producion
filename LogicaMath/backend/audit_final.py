import os
import psycopg2
from psycopg2.extras import DictCursor

def final_audit():
    try:
        conn = psycopg2.connect(
            dbname="logicakids_local",
            user="logicakids_local_user",
            password="LogicaKids2026#Local",
            host=os.environ.get('POSTGRES_HOST', 'postgres'),
            port=5432
        )
        cursor = conn.cursor(cursor_factory=DictCursor)
        
        report = []
        
        # A. Distribución General (Resumen por Fases)
        cursor.execute("""
            SELECT fase_id, COUNT(*) as total
            FROM preguntas
            GROUP BY fase_id
            ORDER BY fase_id;
        """)
        report.append("=== A. Distribución General de Preguntas por Fase ===")
        for row in cursor.fetchall():
            report.append(f"Fase {row['fase_id']}: {row['total']} preguntas")
            
        # B & C. Opciones Múltiples (Revisando tabla alternativas)
        cursor.execute("""
            SELECT COUNT(*) as total_defectuosas
            FROM (
                SELECT p.id 
                FROM preguntas p 
                LEFT JOIN alternativas a ON p.id = a.pregunta_id 
                WHERE p.tipo_pregunta = 'MULTIPLE_OPCION' 
                GROUP BY p.id 
                HAVING COUNT(a.id) < 3 OR SUM(CASE WHEN a.es_correcta THEN 1 ELSE 0 END) = 0
            ) as sub;
        """)
        defectuosas = cursor.fetchone()['total_defectuosas']
        report.append(f"\n=== B & C. Integridad de Opciones Múltiples ===")
        report.append(f"Preguntas con menos de 3 opciones o sin respuesta correcta: {defectuosas}")
        
        # D. Feedback y Ejemplos Guiados
        cursor.execute("SELECT COUNT(*) as sin_feedback FROM preguntas WHERE explicacion_paso_a_paso IS NULL OR explicacion_paso_a_paso::text = 'null' OR explicacion_paso_a_paso::text = '\"\"';")
        sin_feedback = cursor.fetchone()['sin_feedback']
        
        cursor.execute("SELECT COUNT(*) as ejemplos FROM preguntas WHERE enunciado ILIKE 'EJEMPLO GUIADO%';")
        ejemplos = cursor.fetchone()['ejemplos']
        
        report.append(f"\n=== D. Explicaciones y Ejemplos Guiados ===")
        report.append(f"Preguntas sin feedback: {sin_feedback}")
        report.append(f"Total de Ejemplos Guiados marcados en DB: {ejemplos}")
        
        # E. Duplicados Idénticos
        cursor.execute("""
            SELECT COUNT(*) as total_duplicados 
            FROM (
                SELECT enunciado, COUNT(*) 
                FROM preguntas 
                GROUP BY enunciado 
                HAVING COUNT(*) > 1
            ) as sub;
        """)
        dups = cursor.fetchone()['total_duplicados']
        report.append(f"\n=== E. Duplicados Exactos Restantes ===")
        report.append(f"Grupos de preguntas con enunciado estático idéntico: {dups}")
        
        # F. Uso de Imágenes Paramétricas
        cursor.execute("SELECT COUNT(*) as con_svg FROM preguntas WHERE enunciado ILIKE '%<svg%';")
        svgs = cursor.fetchone()['con_svg']
        report.append(f"\n=== F. Gráficos Paramétricos Inyectados ===")
        report.append(f"Preguntas con SVGs dinámicos: {svgs}")
        
        with open("/app/audit_final_report.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(report))
            
        print("Auditoría completada.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    final_audit()
