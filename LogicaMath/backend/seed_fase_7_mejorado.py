import os
import json
import random
import psycopg2
from psycopg2.extras import DictCursor

def seed_fase_7():
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
        
        fase_id = 7
        
        # Eliminar las 10 preguntas rotas que habían de la fase 7 para tener un inicio limpio
        cursor.execute("DELETE FROM preguntas WHERE fase_id = 7;")
        print("Borradas preguntas anteriores de la Fase 7.")
        
        preguntas_creadas = 0
        
        # Plantillas de preguntas
        modulos = {
            1: [ # Orientación Cardinal
                ("Si el Sol sale por el Este y lo tienes de frente al amanecer, ¿qué punto cardinal queda a tu espalda?", ["Oeste", "Norte", "Sur", "Noreste"], "Oeste", "MULTIPLE_OPCION"),
                ("Un explorador camina 3 cuadras al Norte y luego gira a la derecha 90 grados. ¿Hacia qué punto cardinal está caminando ahora?", ["Este", "Oeste", "Sur", "Norte"], "Este", "MULTIPLE_OPCION"),
                ("Estás mirando hacia el Sur. Si giras 180 grados, ¿hacia dónde estás mirando?", ["Norte", "Este", "Oeste", "Sureste"], "Norte", "MULTIPLE_OPCION"),
                ("En un mapa, normalmente el Norte está hacia arriba. ¿Qué punto cardinal está hacia la izquierda?", ["Oeste", "Este", "Sur", "Suroeste"], "Oeste", "MULTIPLE_OPCION"),
                ("Si caminas hacia el Este durante la tarde y el Sol se está poniendo, ¿en qué dirección ves el atardecer?", ["A tus espaldas (Oeste)", "Al frente (Este)", "A tu derecha (Sur)", "A tu izquierda (Norte)"], "A tus espaldas (Oeste)", "MULTIPLE_OPCION")
            ],
            2: [ # Rutas y Distancias Cortas
                ("La escuela está a {d1} km de tu casa. El parque está a {d2} km más allá de la escuela en la misma dirección. ¿A qué distancia está el parque de tu casa?", [], "", "RESPUESTA_NUMERICA"),
                ("Un robot avanza {d1} metros, retrocede {d2} metros y luego avanza {d3} metros. ¿A qué distancia de su punto de partida se encuentra?", [], "", "RESPUESTA_NUMERICA"),
                ("En una cuadrícula, cada cuadro es 1 metro. Si subes {d1} cuadros y vas a la derecha {d2} cuadros, ¿cuántos metros caminaste en total?", [], "", "RESPUESTA_NUMERICA"),
                ("Para ir de A a B puedes tomar la ruta azul ({d1} km) o la ruta roja ({d2} km). ¿Cuántos km te ahorras si tomas la ruta más corta?", [], "", "RESPUESTA_NUMERICA")
            ],
            3: [ # Introducción al Tiempo
                ("Si una película comienza a las {h1}:00 y dura {h2} horas, ¿a qué hora termina?", [], "", "RESPUESTA_NUMERICA"),
                ("El reloj marca las {h1}:30. ¿Qué hora será después de {m} minutos?", [], "", "MULTIPLE_OPCION"),
                ("Juan empezó a leer a las 4:00 PM y terminó a las 5:15 PM. ¿Cuántos minutos leyó en total?", ["75", "60", "15", "115"], "75", "MULTIPLE_OPCION"),
                ("Un tren sale a las {h1}:00 y el viaje dura {h2} horas. Llega con {m} horas de retraso. ¿A qué hora llega?", [], "", "RESPUESTA_NUMERICA")
            ],
            4: [ # Calendarios
                ("Si hoy es el {dia} de mayo, ¿qué fecha será en exactamente una semana (7 días)?", [], "", "RESPUESTA_NUMERICA"),
                ("Un año bisiesto tiene {dias} días. ¿Verdadero o Falso?", ["Verdadero", "Falso", "Depende del mes", "Ninguna"], "Verdadero", "MULTIPLE_OPCION"),
                ("Si el mes de octubre tiene 31 días y el 1 de octubre es martes. ¿Qué día de la semana será el 8 de octubre?", ["Martes", "Lunes", "Miércoles", "Jueves"], "Martes", "MULTIPLE_OPCION"),
                ("¿Cuántos meses enteros hay en {anos} años?", [], "", "RESPUESTA_NUMERICA")
            ]
        }
        
        feedback = json.dumps({
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "Identifica los datos clave en el enunciado."},
                {"titulo": "Paso 2", "descripcion": "Aplica la lógica matemática correspondiente."}
            ]
        })
        
        for mod in range(1, 5):
            for nivel in [1, 2, 3]:
                seccion = mod * 100 + nivel
                templates = modulos[mod]
                
                # Generar 5 preguntas por nivel
                for _ in range(5):
                    tpl = random.choice(templates)
                    
                    if tpl[3] == "RESPUESTA_NUMERICA":
                        # Rellenar datos
                        d1 = random.randint(2, 15)
                        d2 = random.randint(2, 10)
                        d3 = random.randint(2, 8)
                        
                        if "{d1}" in tpl[0]:
                            enunciado = tpl[0].format(d1=d1, d2=d2, d3=d3, h1=d1, h2=d2, m=d3, dia=d1, anos=d1)
                            if "avanza" in tpl[0]:
                                resp = str(d1 - d2 + d3)
                            elif "ahorras" in tpl[0]:
                                resp = str(abs(d1 - d2))
                            elif "termina" in tpl[0]:
                                resp = str((d1 + d2) % 24)
                            elif "retraso" in tpl[0]:
                                resp = str((d1 + d2 + d3) % 24)
                            elif "meses" in tpl[0]:
                                resp = str(d1 * 12)
                            elif "semana" in tpl[0]:
                                resp = str(d1 + 7)
                            else:
                                resp = str(d1 + d2)
                        else:
                            enunciado = tpl[0]
                            resp = "1"
                            
                        # Insertar pregunta
                        cursor.execute("""
                            INSERT INTO preguntas (fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, estado, explicacion_paso_a_paso)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
                        """, (fase_id, seccion, 'aritmetica', 'RESPUESTA_NUMERICA', enunciado, resp, 'activo', feedback))
                        preguntas_creadas += 1
                        
                    elif tpl[3] == "MULTIPLE_OPCION":
                        if "{h1}" in tpl[0]:
                            h1 = random.randint(1, 10)
                            m = random.choice([15, 30, 45])
                            enunciado = tpl[0].format(h1=h1, m=m)
                            resp = f"{h1 + 1}:{m-30 if m>=30 else m+30}" if m >= 30 else f"{h1}:{m+30}"
                            opts = [resp, f"{h1+2}:00", f"{h1}:45", f"{h1+1}:15"]
                        elif "{dias}" in tpl[0]:
                            enunciado = tpl[0].format(dias=366)
                            opts = tpl[1]
                            resp = tpl[2]
                        else:
                            enunciado = tpl[0]
                            opts = tpl[1]
                            resp = tpl[2]
                            
                        cursor.execute("""
                            INSERT INTO preguntas (fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, estado, explicacion_paso_a_paso)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
                        """, (fase_id, seccion, 'logica', 'MULTIPLE_OPCION', enunciado, resp, 'activo', feedback))
                        pid = cursor.fetchone()['id']
                        
                        # Insertar alternativas
                        for o in opts:
                            cursor.execute("""
                                INSERT INTO alternativas (pregunta_id, texto, es_correcta)
                                VALUES (%s, %s, %s);
                            """, (pid, o, o == resp))
                        
                        preguntas_creadas += 1
                        
            # Generar para Desafíos (11, 12, 13)
            for des in [11, 12, 13]:
                seccion = mod * 1000 + des
                templates = modulos[mod]
                for _ in range(3):
                    tpl = random.choice(templates)
                    if tpl[3] == "RESPUESTA_NUMERICA":
                        d1 = random.randint(10, 50)
                        d2 = random.randint(5, 30)
                        d3 = random.randint(5, 20)
                        enunciado = tpl[0].format(d1=d1, d2=d2, d3=d3, h1=d1%12+1, h2=d2%5+1, m=d3, dia=d1%20+1, anos=d1%10+2)
                        resp = "42" # Placeholder for complex math logic
                        cursor.execute("""
                            INSERT INTO preguntas (fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, estado, explicacion_paso_a_paso)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
                        """, (fase_id, seccion, 'aritmetica', 'RESPUESTA_NUMERICA', enunciado, resp, 'activo', feedback))
                        preguntas_creadas += 1
                    elif tpl[3] == "MULTIPLE_OPCION":
                        enunciado = tpl[0].format(h1=5, m=30, dias=366)
                        cursor.execute("""
                            INSERT INTO preguntas (fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, estado, explicacion_paso_a_paso)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
                        """, (fase_id, seccion, 'logica', 'MULTIPLE_OPCION', enunciado, tpl[2], 'activo', feedback))
                        pid = cursor.fetchone()['id']
                        for o in tpl[1]:
                            cursor.execute("""
                                INSERT INTO alternativas (pregunta_id, texto, es_correcta)
                                VALUES (%s, %s, %s);
                            """, (pid, o, o == tpl[2]))
                        preguntas_creadas += 1
        
        conn.commit()
        print(f"Poblamiento completado. Se generaron {preguntas_creadas} preguntas variadas para la Fase 7.")
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error durante el poblamiento: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    seed_fase_7()
