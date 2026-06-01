import sqlite3

conn = sqlite3.connect("local_verify.db")
cursor = conn.cursor()

print("--- CONFIGURACIONES PROGRESO (Fase 1) ---")
cursor.execute("SELECT id, seccion, operacion, cantidad_requerida, activo FROM configuracion_progreso WHERE fase_id = 1")
for row in cursor.fetchall():
    print(row)

print("\n--- DISTINCT SECTIONS IN PREGUNTAS (Fase 1) ---")
cursor.execute("SELECT seccion, COUNT(*), operacion FROM preguntas WHERE fase_id = 1 GROUP BY seccion, operacion")
for row in cursor.fetchall():
    print(row)

print("\n--- PROGRESO MAESTRIA (Fase 1) ---")
cursor.execute("SELECT id, alumno_id, seccion, operacion, estado, aciertos_acumulados, intentos_totales FROM progreso_maestria WHERE fase_id = 1")
for row in cursor.fetchall():
    print(row)

conn.close()
