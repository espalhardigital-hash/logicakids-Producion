import sqlite3

conn = sqlite3.connect("local_verify.db")
cursor = conn.cursor()

# Find questions with the azulejo enunciado in section 1011 and print their alternatives
cursor.execute("""
    SELECT q.id, q.seccion, q.enunciado, q.respuesta_correcta, q.datos_numericos, a.id, a.texto, a.es_correcta
    FROM preguntas q
    LEFT JOIN alternativas a ON a.pregunta_id = q.id
    WHERE q.seccion = 1011
""")
rows = cursor.fetchall()

print(f"Found {len(rows)} rows for section 1011:")
q_prev = None
for row in rows:
    q_id, seccion, enunciado, respuesta_correcta, datos_numericos, alt_id, alt_texto, es_correcta = row
    if q_id != q_prev:
        print("="*60)
        print(f"Question ID: {q_id}")
        print(f"Enunciado: {enunciado}")
        print(f"Correct Answer: {respuesta_correcta}")
        print(f"Datos Numericos: {datos_numericos}")
        q_prev = q_id
    print(f"  Alt ID: {alt_id} | Texto: {alt_texto} | Es Correcta: {es_correcta}")

conn.close()
