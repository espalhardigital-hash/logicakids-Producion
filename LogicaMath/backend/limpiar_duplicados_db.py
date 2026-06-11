import os
import psycopg2
from psycopg2.extras import DictCursor

def clean_duplicates():
    # Conexión a la base de datos (usando las credenciales locales del docker)
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
        
        print("Conectado a la base de datos local.")
        
        # 1. Encontrar enunciados repetidos
        cursor.execute("""
            SELECT enunciado, fase_id, seccion, COUNT(*) as repeticiones
            FROM preguntas
            GROUP BY enunciado, fase_id, seccion
            HAVING COUNT(*) > 10
            ORDER BY repeticiones DESC;
        """)
        
        duplicates = cursor.fetchall()
        print(f"Se encontraron {len(duplicates)} grupos de preguntas con más de 10 copias idénticas.")
        
        total_deleted = 0
        
        for dup in duplicates:
            enunciado = dup['enunciado']
            fase_id = dup['fase_id']
            seccion = dup['seccion']
            
            # Obtener todos los IDs de este grupo
            cursor.execute("""
                SELECT id FROM preguntas
                WHERE enunciado = %s AND fase_id = %s AND seccion = %s
                ORDER BY id;
            """, (enunciado, fase_id, seccion))
            
            ids = [row['id'] for row in cursor.fetchall()]
            
            # Mantener 10, borrar el resto
            if len(ids) > 10:
                ids_to_delete = ids[10:]
                ids_to_keep = ids[:10]
                
                # Ejecutar borrado
                cursor.execute("""
                    DELETE FROM preguntas WHERE id = ANY(%s);
                """, (ids_to_delete,))
                
                total_deleted += len(ids_to_delete)
                print(f"Enunciado (truncado): {enunciado[:50]}... | Mantenidos: 10 | Borrados: {len(ids_to_delete)}")
        
        conn.commit()
        print(f"\nLimpieza completada. Total de preguntas duplicadas borradas: {total_deleted}")
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error durante la limpieza: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    clean_duplicates()
