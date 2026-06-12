import os

src_path = "/app/questions_dump.sql"
dest_path = "/app/final_migration.sql"

header = """-- Pre-migration: Bypassing foreign key triggers and clearing tables
SET session_replication_role = 'replica';
DELETE FROM public.alternativas;
DELETE FROM public.preguntas;
DELETE FROM public.niveles_teoria_pool;
DELETE FROM public.configuracion_progreso;
DELETE FROM public.fases;

"""

footer = """
-- Post-migration: Re-enabling triggers and resetting sequences
SET session_replication_role = 'origin';
SELECT pg_catalog.setval(pg_catalog.pg_get_serial_sequence('public.preguntas', 'id'), coalesce(max(id), 1)) FROM public.preguntas;
SELECT pg_catalog.setval(pg_catalog.pg_get_serial_sequence('public.alternativas', 'id'), coalesce(max(id), 1)) FROM public.alternativas;
SELECT pg_catalog.setval(pg_catalog.pg_get_serial_sequence('public.fases', 'id'), coalesce(max(id), 1)) FROM public.fases;
SELECT pg_catalog.setval(pg_catalog.pg_get_serial_sequence('public.configuracion_progreso', 'id'), coalesce(max(id), 1)) FROM public.configuracion_progreso;
"""

print(f"Reading {src_path} and writing to {dest_path}...")
try:
    with open(dest_path, "w", encoding="utf-8") as dest:
        dest.write(header)
        with open(src_path, "r", encoding="utf-16") as src:
            while True:
                chunk = src.read(1024 * 1024) # 1MB chunks
                if not chunk:
                    break
                dest.write(chunk)
        dest.write(footer)
    print("✅ final_migration.sql created inside container successfully (with UTF-16 to UTF-8 conversion).")
except Exception as e:
    print(f"Failed with UTF-16, trying UTF-8. Error: {e}")
    # Fallback to UTF-8
    with open(dest_path, "w", encoding="utf-8") as dest:
        dest.write(header)
        with open(src_path, "r", encoding="utf-8") as src:
            while True:
                chunk = src.read(1024 * 1024)
                if not chunk:
                    break
                dest.write(chunk)
        dest.write(footer)
    print("✅ final_migration.sql created inside container successfully (with UTF-8).")
