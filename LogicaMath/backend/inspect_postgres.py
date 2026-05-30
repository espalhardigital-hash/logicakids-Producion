import psycopg2

def main():
    db_url = "postgresql://logicakids_admin_desarrollo:logicakids_admin_desarrollo20258187@127.0.0.1:5432/bd_logicakids_desarrollo"
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        print("Connected to PostgreSQL successfully!")
        
        # Check users and alumnos
        print("--- USERS ---")
        cursor.execute("SELECT id, email, role, status FROM users")
        users = cursor.fetchall()
        for u in users:
            print(u)
            
        print("\n--- ALUMNOS ---")
        cursor.execute("SELECT id, user_id, nombre, fase_actual_id, estado FROM alumnos")
        alumnos = cursor.fetchall()
        for a in alumnos:
            print(a)
            
        # Check Fases
        print("\n--- FASES ---")
        cursor.execute("SELECT id, nombre, orden FROM fases")
        fases = cursor.fetchall()
        for f in fases:
            print(f)
            
        # Let's find Jhon's alumno_id
        cursor.execute("""
            SELECT a.id, a.nombre, u.email 
            FROM alumnos a 
            JOIN users u ON a.user_id = u.id 
            WHERE u.email = 'jhon@gmail.com'
        """)
        jhon = cursor.fetchone()
        if not jhon:
            print("\nJhon not found under 'jhon@gmail.com'")
            cursor.execute("SELECT id, nombre FROM alumnos WHERE nombre LIKE '%Jhon%'")
            jhon = cursor.fetchone()
            
        if jhon:
            alumno_id = jhon[0]
            print(f"\nFound Jhon: alumno_id={alumno_id}, nombre={jhon[1]}")
            
            # Check current progress
            print(f"\n--- PROGRESO MAESTRIA FOR alumno_id={alumno_id} ---")
            cursor.execute("""
                SELECT id, fase_id, seccion, operacion, estado, completado 
                FROM progreso_maestria 
                WHERE alumno_id = %s
                ORDER BY fase_id, seccion, operacion
            """, (alumno_id,))
            progresos = cursor.fetchall()
            for p in progresos:
                print(p)
                
            # Check configs for phases
            print(f"\n--- CONFIGURACION PROGRESO ---")
            cursor.execute("""
                SELECT id, fase_id, seccion, operacion, activo 
                FROM configuracion_progreso
                ORDER BY fase_id, seccion, operacion
            """)
            configs = cursor.fetchall()
            print(f"Total configs: {len(configs)}")
            for c in configs[:30]:  # print first 30
                print(c)
        else:
            print("\nJhon not found!")
            
        conn.close()
    except Exception as e:
        print(f"Failed to connect or query: {e}")

if __name__ == "__main__":
    main()
