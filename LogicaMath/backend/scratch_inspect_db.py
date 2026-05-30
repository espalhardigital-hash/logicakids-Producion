import sqlite3

conn = sqlite3.connect("local_verify.db")
cursor = conn.cursor()

print("--- CONFIGURACIONES PROGRESO (Fase 1) ---")
cursor.execute("SELECT id, seccion, operacion, cantidad_requerida, activo FROM configuracion_progreso WHERE fase_id = 1")
for row in cursor.fetchall():
    print(row)

conn.close()
