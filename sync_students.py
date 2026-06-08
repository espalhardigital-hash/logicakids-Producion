import subprocess
import json
import sys

def query_db(db, sql):
    cmd = [
        "docker", "exec", "-i", "base_postgres_general",
        "psql", "-U", "amilcar_Usuario", "-d", db, "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error executing SQL in {db}: {res.stderr}\nSQL: {sql}", file=sys.stderr)
        raise Exception(f"SQL Error: {res.stderr}")
    return res.stdout.strip()

def fetch_rows(db, sql):
    wrapped_sql = f"SELECT json_build_object('data', COALESCE(json_agg(row_to_json(t)), '[]'::json)) FROM ({sql}) t;"
    output = query_db(db, wrapped_sql)
    if not output:
        return []
    try:
        data = json.loads(output)
        return data.get("data", [])
    except Exception as e:
        print(f"Failed to parse JSON: {e}\nOutput was: {output}")
        return []

def insert_rows(db, table, rows):
    if not rows:
        return
    
    query_db(db, f"ALTER TABLE {table} DISABLE TRIGGER ALL;")
    try:
        for row in rows:
            cols = []
            vals = []
            for col, val in row.items():
                cols.append(f'"{col}"')
                if val is None:
                    vals.append("NULL")
                elif isinstance(val, (int, float)):
                    vals.append(str(val))
                elif isinstance(val, bool):
                    vals.append("true" if val else "false")
                elif isinstance(val, (dict, list)):
                    escaped_json = json.dumps(val).replace("'", "''")
                    vals.append(f"'{escaped_json}'::jsonb")
                else:
                    escaped_str = str(val).replace("'", "''")
                    vals.append(f"'{escaped_str}'")
                    
            sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)});"
            query_db(db, sql)
    finally:
        query_db(db, f"ALTER TABLE {table} ENABLE TRIGGER ALL;")

def main():
    prod_db = "bd_logicakids_producion"
    dev_db = "bd_logicakids_desarrollo"
    
    print("Step 1: Reassigning Jhon (ID 4 -> 6) in development DB...")
    jhon_reassign_sql = """
    BEGIN;
    ALTER TABLE progreso_maestria DISABLE TRIGGER ALL;
    ALTER TABLE intentos DISABLE TRIGGER ALL;
    ALTER TABLE intento_preguntas DISABLE TRIGGER ALL;
    ALTER TABLE pool_asignado_alumno DISABLE TRIGGER ALL;
    ALTER TABLE alumnos DISABLE TRIGGER ALL;

    UPDATE progreso_maestria SET alumno_id = 6 WHERE alumno_id = 4;
    UPDATE intentos SET alumno_id = 6 WHERE alumno_id = 4;
    UPDATE intento_preguntas SET alumno_id = 6 WHERE alumno_id = 4;
    UPDATE pool_asignado_alumno SET alumno_id = 6 WHERE alumno_id = 4;
    UPDATE alumnos SET id = 6 WHERE id = 4;

    ALTER TABLE progreso_maestria ENABLE TRIGGER ALL;
    ALTER TABLE intentos ENABLE TRIGGER ALL;
    ALTER TABLE intento_preguntas ENABLE TRIGGER ALL;
    ALTER TABLE pool_asignado_alumno ENABLE TRIGGER ALL;
    ALTER TABLE alumnos ENABLE TRIGGER ALL;
    COMMIT;
    """
    query_db(dev_db, jhon_reassign_sql)
    
    print("Step 2: Cleaning up existing Eloisa and Joaquin records in development DB...")
    cleanup_sql = """
    BEGIN;
    ALTER TABLE intento_pasos DISABLE TRIGGER ALL;
    ALTER TABLE intento_preguntas DISABLE TRIGGER ALL;
    ALTER TABLE intentos DISABLE TRIGGER ALL;
    ALTER TABLE progreso_maestria DISABLE TRIGGER ALL;
    ALTER TABLE pool_asignado_alumno DISABLE TRIGGER ALL;
    ALTER TABLE alumnos DISABLE TRIGGER ALL;
    ALTER TABLE users DISABLE TRIGGER ALL;

    DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (4, 5));
    DELETE FROM intento_preguntas WHERE alumno_id IN (4, 5);
    DELETE FROM intentos WHERE alumno_id IN (4, 5);
    DELETE FROM progreso_maestria WHERE alumno_id IN (4, 5);
    DELETE FROM pool_asignado_alumno WHERE alumno_id IN (4, 5);
    DELETE FROM alumnos WHERE id IN (4, 5);
    DELETE FROM users WHERE id IN ('e15c06fb-40a2-4ed2-8dbb-89960cc91cd9', '505f0245-78ee-4be0-af60-124e1ed73fa4');

    ALTER TABLE intento_pasos ENABLE TRIGGER ALL;
    ALTER TABLE intento_preguntas ENABLE TRIGGER ALL;
    ALTER TABLE intentos ENABLE TRIGGER ALL;
    ALTER TABLE progreso_maestria ENABLE TRIGGER ALL;
    ALTER TABLE pool_asignado_alumno ENABLE TRIGGER ALL;
    ALTER TABLE alumnos ENABLE TRIGGER ALL;
    ALTER TABLE users ENABLE TRIGGER ALL;
    COMMIT;
    """
    query_db(dev_db, cleanup_sql)

    print("Step 3: Finding missing referenced questions from production DB...")
    # Fetch all referenced questions in production for students 4 and 5
    ref_preguntas_sql = "SELECT DISTINCT pregunta_id FROM intentos WHERE alumno_id IN (4, 5) UNION SELECT DISTINCT pregunta_id FROM intento_preguntas WHERE alumno_id IN (4, 5)"
    ref_preguntas_rows = fetch_rows(prod_db, ref_preguntas_sql)
    ref_pregunta_ids = [r["pregunta_id"] for r in ref_preguntas_rows if r["pregunta_id"] is not None]
    
    # Fetch existing questions in development
    exist_preguntas_sql = "SELECT id FROM preguntas"
    exist_preguntas_rows = fetch_rows(dev_db, exist_preguntas_sql)
    exist_pregunta_ids = set([r["id"] for r in exist_preguntas_rows])
    
    missing_pregunta_ids = [pid for pid in ref_pregunta_ids if pid not in exist_pregunta_ids]
    print(f"Total referenced questions in production: {len(ref_pregunta_ids)}")
    print(f"Missing questions in development: {len(missing_pregunta_ids)}")
    
    if missing_pregunta_ids:
        print(f"Copying {len(missing_pregunta_ids)} missing questions from production to development...")
        chunk_size = 100
        for i in range(0, len(missing_pregunta_ids), chunk_size):
            chunk = missing_pregunta_ids[i:i+chunk_size]
            chunk_str = ",".join(map(str, chunk))
            questions_data = fetch_rows(prod_db, f"SELECT * FROM preguntas WHERE id IN ({chunk_str})")
            insert_rows(dev_db, "preguntas", questions_data)
            
    print("Step 4: Copying Eloisa and Joaquin user records...")
    user_ids = ["e15c06fb-40a2-4ed2-8dbb-89960cc91cd9", "505f0245-78ee-4be0-af60-124e1ed73fa4"]
    user_ids_str = ",".join([f"'{uid}'" for uid in user_ids])
    users_data = fetch_rows(prod_db, f"SELECT * FROM users WHERE id IN ({user_ids_str})")
    insert_rows(dev_db, "users", users_data)
    
    print("Step 5: Copying Eloisa and Joaquin student records...")
    alumnos_data = fetch_rows(prod_db, "SELECT * FROM alumnos WHERE id IN (4, 5)")
    insert_rows(dev_db, "alumnos", alumnos_data)
    
    print("Step 6: Copying student progress, attempts, and history records...")
    
    progreso_data = fetch_rows(prod_db, "SELECT * FROM progreso_maestria WHERE alumno_id IN (4, 5)")
    insert_rows(dev_db, "progreso_maestria", progreso_data)
    
    intentos_data = fetch_rows(prod_db, "SELECT * FROM intentos WHERE alumno_id IN (4, 5)")
    insert_rows(dev_db, "intentos", intentos_data)
    
    intento_preguntas_data = fetch_rows(prod_db, "SELECT * FROM intento_preguntas WHERE alumno_id IN (4, 5)")
    insert_rows(dev_db, "intento_preguntas", intento_preguntas_data)
    
    intento_pasos_data = fetch_rows(prod_db, "SELECT * FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (4, 5))")
    insert_rows(dev_db, "intento_pasos", intento_pasos_data)
    
    pool_data = fetch_rows(prod_db, "SELECT * FROM pool_asignado_alumno WHERE alumno_id IN (4, 5)")
    insert_rows(dev_db, "pool_asignado_alumno", pool_data)
    
    print("Step 7: Synchronizing database auto-increment sequences in development...")
    sequences = [
        ("alumnos", "alumnos_id_seq"),
        ("progreso_maestria", "progreso_maestria_id_seq"),
        ("intentos", "intentos_id_seq"),
        ("intento_preguntas", "intento_preguntas_id_seq"),
        ("intento_pasos", "intento_pasos_id_seq"),
        ("pool_asignado_alumno", "pool_asignado_alumno_id_seq")
    ]
    for table, seq in sequences:
        query_db(dev_db, f"SELECT setval('{seq}', COALESCE((SELECT MAX(id) FROM {table}), 1));")
        
    print("=== Data Sync Completed Successfully! ===")

if __name__ == "__main__":
    main()
