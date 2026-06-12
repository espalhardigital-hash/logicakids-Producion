import psycopg2
import os
import json

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    db_url = "postgresql://logicakids_local_user:LogicaKids2026#Local@logicakids_local_db:5432/logicakids_local"
db_url = db_url.replace("+asyncpg", "")

tables = [
    "fases",
    "configuracion_progreso",
    "niveles_teoria_pool",
    "preguntas",
    "alternativas"
]

def generate_upserts():
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    with open("upsert_migration.sql", "w", encoding="utf-8") as f:
        f.write("-- MIGRACIÓN SEGURA CON UPSERT (No requiere permisos de Superusuario)\n")
        
        for table in tables:
            # Get columns
            cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = 'public' ORDER BY ordinal_position;")
            columns = [row[0] for row in cur.fetchall()]
            
            # Fetch all rows
            cur.execute(f"SELECT * FROM public.{table};")
            rows = cur.fetchall()
            
            if not rows:
                continue
                
            cols_str = ", ".join([f'"{c}"' for c in columns])
            update_set = ", ".join([f'"{c}" = EXCLUDED."{c}"' for c in columns if c != 'id'])
            
            f.write(f"-- Tabla: {table}\n")
            for row in rows:
                vals = []
                for val in row:
                    if val is None:
                        vals.append("NULL")
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    elif isinstance(val, bool):
                        vals.append("true" if val else "false")
                    elif isinstance(val, (dict, list)):
                        escaped = json.dumps(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                    else:
                        # Escape single quotes
                        escaped = str(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                
                vals_str = ", ".join(vals)
                
                sql = f'INSERT INTO public."{table}" ({cols_str}) VALUES ({vals_str})'
                if update_set:
                    sql += f' ON CONFLICT (id) DO UPDATE SET {update_set};'
                else:
                    sql += f' ON CONFLICT (id) DO NOTHING;'
                
                f.write(sql + "\n")
            
            # Reset sequence
            f.write(f"SELECT pg_catalog.setval(pg_catalog.pg_get_serial_sequence('public.{table}', 'id'), coalesce(max(id), 1)) FROM public.{table};\n\n")
        
    cur.close()
    conn.close()
    print("✅ upsert_migration.sql generado con éxito!")

if __name__ == "__main__":
    generate_upserts()
