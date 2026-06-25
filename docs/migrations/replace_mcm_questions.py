import psycopg2
import random
import json

questions_data = [
  {
    "id": 1,
    "pregunta": "Un faro del puerto enciende su luz azul cada 2 minutos y su luz roja cada 3 minutos. Si ambas luces se acaban de encender al mismo tiempo, ¿en cuántos minutos volverán a coincidir?",
    "opciones": {
      "A": "5 minutos",
      "B": "6 minutos",
      "C": "12 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 2,
    "pregunta": "En un jardín, el cactus se riega cada 2 días y el helecho cada 3 días. Si hoy regaste ambas plantas, ¿dentro de cuántos días volverás a regarlas el mismo día?",
    "opciones": {
      "A": "6 días",
      "B": "5 días",
      "C": "10 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 3,
    "pregunta": "Un perrito debe tomar su pastilla para las pulgas cada 2 horas y sus vitaminas cada 3 horas. Si le diste ambas a las 8:00 a.m., ¿cuántas horas deben pasar para que le toquen las dos juntas de nuevo?",
    "opciones": {
      "A": "4 horas",
      "B": "6 horas",
      "C": "8 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 4,
    "pregunta": "En la escuela de música, la clase de guitarra es cada 3 días y la de piano cada 4 días. Si hoy tuviste ambas, ¿en cuántos días volverás a tener las dos clases el mismo día?",
    "opciones": {
      "A": "12 días",
      "B": "7 días",
      "C": "24 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 5,
    "pregunta": "En una fábrica, la máquina de juguetes de madera hace un sonido cada 3 minutos y la de plástico cada 4 minutos. ¿En cuántos minutos sonarán las dos al mismo tiempo?",
    "opciones": {
      "A": "15 minutos",
      "B": "12 minutos",
      "C": "7 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 6,
    "pregunta": "El autobús rojo pasa por la parada cada 3 minutos y el azul cada 4 minutos. Si acaban de pasar juntos, ¿cuántos minutos tardarán en volver a coincidir?",
    "opciones": {
      "A": "12 minutos",
      "B": "6 minutos",
      "C": "16 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 7,
    "pregunta": "A Juan le toca sacar la basura cada 4 días y lavar los platos cada 5 días. Si hoy hizo las dos tareas, ¿dentro de cuántos días tendrá que volver a hacer ambas cosas juntas?",
    "opciones": {
      "A": "9 días",
      "B": "40 días",
      "C": "20 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 8,
    "pregunta": "En una tienda, revisan el inventario de juguetes cada 4 semanas y el de ropa cada 5 semanas. ¿Cada cuántas semanas coinciden ambas revisiones?",
    "opciones": {
      "A": "20 semanas",
      "B": "9 semanas",
      "C": "15 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 9,
    "pregunta": "En un árbol de Navidad, las estrellas brillan cada 4 segundos y las esferas cada 5 segundos. ¿En cuántos segundos brillarán todas a la vez?",
    "opciones": {
      "A": "10 segundos",
      "B": "20 segundos",
      "C": "40 segundos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 10,
    "pregunta": "Sofía come helado cada 5 días y va al parque cada 2 días. Si hoy hizo las dos cosas, ¿dentro de cuántos días volverá a repetirse este día tan divertido?",
    "opciones": {
      "A": "10 días",
      "B": "7 días",
      "C": "15 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 11,
    "pregunta": "Dos relojes cucú están en la misma pared. Uno canta cada 2 minutos y el otro cada 5 minutos. ¿Cada cuántos minutos cantan los dos pajaritos a la vez?",
    "opciones": {
      "A": "10 minutos",
      "B": "20 minutos",
      "C": "7 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 12,
    "pregunta": "En una avenida plantan un árbol cada 2 metros y ponen un poste de luz cada 5 metros. ¿A los cuántos metros habrá un árbol y un poste de luz juntos por primera vez?",
    "opciones": {
      "A": "7 metros",
      "B": "10 metros",
      "C": "20 metros"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 13,
    "pregunta": "Lucas visita a sus abuelos cada 3 días y a sus tíos cada 5 días. ¿Cada cuántos días coincide para visitar a toda la familia?",
    "opciones": {
      "A": "15 días",
      "B": "8 días",
      "C": "30 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 14,
    "pregunta": "El camión de reciclaje de cartón pasa cada 3 horas y el de plástico cada 5 horas. ¿En cuántas horas pasarán ambos camiones juntos otra vez?",
    "opciones": {
      "A": "15 horas",
      "B": "8 horas",
      "C": "20 horas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 15,
    "pregunta": "Una alarma del celular suena cada 3 minutos y otra de un reloj suena cada 5 minutos. ¿Cuándo volverán a sonar las dos juntas?",
    "opciones": {
      "A": "A los 8 minutos",
      "B": "A los 15 minutos",
      "C": "A los 30 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 16,
    "pregunta": "Martín entrena fútbol cada 4 días y natación cada 6 días. Si hoy tuvo ambos entrenamientos, ¿dentro de cuántos días tendrá un día igual de ocupado?",
    "opciones": {
      "A": "10 días",
      "B": "12 días",
      "C": "24 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 17,
    "pregunta": "La feria del pueblo llega cada 4 meses y el circo cada 6 meses. ¿Cada cuántos meses coinciden la feria y el circo en el pueblo?",
    "opciones": {
      "A": "12 meses",
      "B": "10 meses",
      "C": "24 meses"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 18,
    "pregunta": "Una rana de juguete salta cada 4 segundos y una de verdad cada 6 segundos. Si saltaron juntas justo ahora, ¿en cuántos segundos volverán a coincidir en el salto?",
    "opciones": {
      "A": "10 segundos",
      "B": "24 segundos",
      "C": "12 segundos"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 19,
    "pregunta": "Leo lee un libro nuevo cada 6 días y ve una película nueva cada 8 días. ¿Cada cuántos días termina un libro y ve una película el mismo día?",
    "opciones": {
      "A": "14 días",
      "B": "48 días",
      "C": "24 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 20,
    "pregunta": "En la torre, la campana grande suena cada 8 minutos y la pequeña cada 6 minutos. ¿En cuántos minutos sonarán las dos juntas?",
    "opciones": {
      "A": "24 minutos",
      "B": "14 minutos",
      "C": "48 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 21,
    "pregunta": "Dos satélites orbitan la Tierra. Uno da la vuelta cada 6 horas y el otro cada 8 horas. Si pasaron sobre tu ciudad a la vez, ¿en cuántas horas volverán a hacerlo?",
    "opciones": {
      "A": "48 horas",
      "B": "24 horas",
      "C": "14 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 22,
    "pregunta": "El club de lectura se reúne cada 5 días y el de ciencias cada 6 días. ¿Cada cuántos días coinciden las dos reuniones?",
    "opciones": {
      "A": "11 días",
      "B": "15 días",
      "C": "30 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 23,
    "pregunta": "En un parque de diversiones, el tren rápido da una vuelta cada 5 minutos y el lento cada 6 minutos. ¿En qué minuto exacto vuelven a salir juntos de la estación?",
    "opciones": {
      "A": "A los 30 minutos",
      "B": "A los 11 minutos",
      "C": "A los 60 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 24,
    "pregunta": "Un torneo de ajedrez se celebra cada 5 semanas y uno de damas chinas cada 6 semanas. ¿Cada cuántas semanas coinciden ambos torneos?",
    "opciones": {
      "A": "30 semanas",
      "B": "11 semanas",
      "C": "60 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 25,
    "pregunta": "Emma pasea en bicicleta cada 2 días y va a nadar cada 7 días. Si hoy hizo las dos cosas, ¿cuántos días pasarán hasta que vuelva a repetir ambas actividades juntas?",
    "opciones": {
      "A": "9 días",
      "B": "14 días",
      "C": "21 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 26,
    "pregunta": "Un reloj de arena pequeño se vacía cada 2 horas y uno grande cada 7 horas. Si los volteas al mismo tiempo, ¿en cuántas horas terminarán de vaciarse exactamente a la vez?",
    "opciones": {
      "A": "14 horas",
      "B": "9 horas",
      "C": "28 horas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 27,
    "pregunta": "En un pasillo largo, ponen una baldosa roja cada 2 metros y una azul cada 7 metros. ¿A los cuántos metros coincidirán una baldosa roja y una azul?",
    "opciones": {
      "A": "9 metros",
      "B": "14 metros",
      "C": "21 metros"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 28,
    "pregunta": "En casa cenan pizza cada 7 días y hamburguesas cada 3 días. ¿Cada cuántos días hay una gran fiesta con ambas comidas juntas?",
    "opciones": {
      "A": "21 días",
      "B": "10 días",
      "C": "42 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 29,
    "pregunta": "El tren de la línea verde pasa cada 3 minutos y el de la línea amarilla cada 7 minutos. ¿Cada cuántos minutos coinciden ambos trenes en la estación principal?",
    "opciones": {
      "A": "21 minutos",
      "B": "10 minutos",
      "C": "42 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 30,
    "pregunta": "En clase de arte usan acuarelas cada 3 semanas y arcilla cada 7 semanas. ¿Cada cuántas semanas les toca usar ambos materiales?",
    "opciones": {
      "A": "10 semanas",
      "B": "21 semanas",
      "C": "42 semanas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 31,
    "pregunta": "El camión de la basura pasa por tu calle cada 4 días y el del reciclaje cada 10 días. ¿En cuántos días coincidirán los dos camiones el mismo día?",
    "opciones": {
      "A": "14 días",
      "B": "40 días",
      "C": "20 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 32,
    "pregunta": "En un semáforo especial, la luz amarilla destella cada 4 segundos y la blanca cada 10 segundos. ¿En cuántos segundos destellarán juntas?",
    "opciones": {
      "A": "20 segundos",
      "B": "40 segundos",
      "C": "14 segundos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 33,
    "pregunta": "En un parque, colocan un basurero cada 4 metros y una banca cada 10 metros. ¿A los cuántos metros encontrarás un basurero y una banca juntos?",
    "opciones": {
      "A": "14 metros",
      "B": "20 metros",
      "C": "40 metros"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 34,
    "pregunta": "Papá compra una revista deportiva cada 6 días y una de ciencias cada 10 días. ¿Cada cuántos días irá al quiosco a comprar ambas revistas a la vez?",
    "opciones": {
      "A": "60 días",
      "B": "30 días",
      "C": "16 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 35,
    "pregunta": "En la televisión, un programa de animales dura 6 minutos y uno de dibujos 10 minutos (incluyendo cortes). Si ambos empiezan al mismo tiempo, ¿en cuántos minutos volverán a empezar juntos nuevos episodios?",
    "opciones": {
      "A": "16 minutos",
      "B": "60 minutos",
      "C": "30 minutos"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 36,
    "pregunta": "Mamá cambia la esponja de los platos cada 6 semanas y el filtro del agua cada 10 semanas. ¿Cada cuántas semanas hará ambos cambios al mismo tiempo?",
    "opciones": {
      "A": "30 semanas",
      "B": "16 semanas",
      "C": "60 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 37,
    "pregunta": "Hay que cortar el césped cada 9 días y regar las flores grandes cada 6 días. ¿Cada cuántos días coinciden las dos tareas en el jardín?",
    "opciones": {
      "A": "18 días",
      "B": "15 días",
      "C": "54 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 38,
    "pregunta": "Un avión hace la ruta al norte cada 6 horas y otro a la ruta sur cada 9 horas. Si despegaron juntos, ¿cuántas horas deben pasar para que vuelvan a despegar al mismo tiempo?",
    "opciones": {
      "A": "15 horas",
      "B": "18 horas",
      "C": "54 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 39,
    "pregunta": "Se revisan los frenos de una bicicleta cada 6 meses y las llantas cada 9 meses. ¿Cada cuántos meses se le hace la revisión completa de ambas partes?",
    "opciones": {
      "A": "18 meses",
      "B": "15 meses",
      "C": "36 meses"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 40,
    "pregunta": "Los scouts tienen reunión de patrulla cada 8 días y excursión al bosque cada 12 días. ¿Cada cuántos días tienen reunión y excursión el mismo día?",
    "opciones": {
      "A": "24 días",
      "B": "20 días",
      "C": "96 días"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 41,
    "pregunta": "Un barco turístico sale del muelle cada 8 minutos y un ferry cada 12 minutos. ¿En cuántos minutos saldrán ambos al mismo tiempo?",
    "opciones": {
      "A": "24 minutos",
      "B": "20 minutos",
      "C": "48 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 42,
    "pregunta": "En una fábrica, suena un timbre cada 8 horas y suena una sirena de cambio de turno cada 12 horas. ¿Cada cuántas horas coinciden ambos sonidos?",
    "opciones": {
      "A": "48 horas",
      "B": "24 horas",
      "C": "20 horas"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 43,
    "pregunta": "El equipo de béisbol de la escuela juega en casa cada 10 días y el de fútbol cada 15 días. ¿Dentro de cuántos días jugarán ambos equipos en la escuela el mismo día?",
    "opciones": {
      "A": "25 días",
      "B": "150 días",
      "C": "30 días"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 44,
    "pregunta": "Un pastelero saca una bandeja de galletas cada 10 minutos y una de pan cada 15 minutos. ¿Cada cuántos minutos saca ambos alimentos del horno al mismo tiempo?",
    "opciones": {
      "A": "25 minutos",
      "B": "30 minutos",
      "C": "60 minutos"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 45,
    "pregunta": "Un paseador lleva al parque a un perro dálmata cada 3 días y a un bulldog cada 8 días. ¿Cada cuántos días se encontrarán ambos perros en el parque?",
    "opciones": {
      "A": "11 días",
      "B": "24 días",
      "C": "48 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 46,
    "pregunta": "Hay una competencia de matemáticas en el colegio cada 3 semanas y una de deletreo cada 8 semanas. ¿Cada cuántas semanas hay dos competencias en la misma semana?",
    "opciones": {
      "A": "24 semanas",
      "B": "11 semanas",
      "C": "48 semanas"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 47,
    "pregunta": "Tres amigos van a la biblioteca: Ana va cada 2 días, Beto cada 3 días y Carlos cada 4 días. Si hoy coincidieron, ¿en cuántos días volverán a encontrarse los tres juntos?",
    "opciones": {
      "A": "9 días",
      "B": "12 días",
      "C": "24 días"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 48,
    "pregunta": "En un videojuego, aparecen monedas cada 2 segundos, escudos cada 3 segundos y estrellas cada 4 segundos. ¿En cuántos segundos aparecerán los tres objetos al mismo tiempo?",
    "opciones": {
      "A": "9 segundos",
      "B": "24 segundos",
      "C": "12 segundos"
    },
    "respuesta_correcta": "C",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 49,
    "pregunta": "Tres barcos piratas regresan a su isla secreta: el primer barco cada 3 meses, el segundo cada 4 meses y el tercero cada 5 meses. ¿En cuántos meses se encontrarán los tres barcos en la isla?",
    "opciones": {
      "A": "12 meses",
      "B": "60 meses",
      "C": "20 meses"
    },
    "respuesta_correcta": "B",
    "tema": "mínimo común múltiplo"
  },
  {
    "id": 50,
    "pregunta": "En una pista de carreras, el auto rojo da una vuelta en 3 minutos, el azul en 4 minutos y el amarillo en 5 minutos. Si todos arrancaron de la meta al mismo tiempo, ¿en cuántos minutos volverán a cruzar los tres juntos por la meta?",
    "opciones": {
      "A": "60 minutos",
      "B": "12 minutos",
      "C": "120 minutos"
    },
    "respuesta_correcta": "A",
    "tema": "mínimo común múltiplo"
  }
]

try:
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="logicakids_local",
        user="logicakids_local_user",
        password="LogicaKids2026#Local"
    )
    conn.autocommit = False
    cur = conn.cursor()
    
    # 1. Obtener todas las preguntas de la Fase 3, Modulo 5 (secciones 5011, 5012, 5013)
    cur.execute("SELECT id FROM preguntas WHERE fase_id = 3 AND seccion IN (5011, 5012, 5013)")
    q_ids = [row[0] for row in cur.fetchall()]
    
    if len(q_ids) < 50:
        raise Exception(f"No hay suficientes preguntas para sustituir (se encontraron {len(q_ids)}, se requieren 50)")
        
    # 2. Seleccionar 50 al azar
    random.seed(42)  # semilla fija para reproductibilidad
    to_delete = random.sample(q_ids, 50)
    
    print(f"Preguntas seleccionadas para eliminar: {to_delete}")
    
    # 3. Eliminar alternativas y preguntas
    cur.execute("DELETE FROM alternativas WHERE pregunta_id IN %s", (tuple(to_delete),))
    cur.execute("DELETE FROM preguntas WHERE id IN %s", (tuple(to_delete),))
    
    # Secciones destino distribuidas equitativamente
    target_sections = [5011]*17 + [5012]*17 + [5013]*16
    
    # 4. Insertar las nuevas preguntas
    for i, q in enumerate(questions_data):
        section = target_sections[i]
        
        # Mapear respuesta_correcta a su texto
        correct_letter = q["respuesta_correcta"]
        correct_text = q["opciones"][correct_letter]
        
        # Insertar pregunta
        cur.execute(\"\"\"
            INSERT INTO preguntas (
                fase_id, seccion, operacion, tipo_pregunta, enunciado, respuesta_correcta, 
                datos_numericos, requiere_subrayado, estado, revisado_admin, creado_por, modificado_por
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        \"\"\", (
            3, section, 'MIXTA', 'MULTIPLE_OPCION', q["pregunta"], correct_text,
            '{"es_desafio": true}', False, 'ACTIVO', False, 'admin_migration', 'admin_migration'
        ))
        
        pregunta_id = cur.fetchone()[0]
        
        # Insertar alternativas
        options_order = ["A", "B", "C"]
        for idx, letter in enumerate(options_order):
            opt_text = q["opciones"][letter]
            is_correct = (letter == correct_letter)
            
            cur.execute(\"\"\"
                INSERT INTO alternativas (
                    pregunta_id, texto, es_correcta, orden
                ) VALUES (%s, %s, %s, %s)
            \"\"\", (
                pregunta_id, opt_text, is_correct, idx + 1
            ))
            
    conn.commit()
    print("MIGRACION DE PREGUNTAS MCM COMPLETADA CON EXITO!")
    
except Exception as e:
    print(f"Error durante la migración: {e}")
    if 'conn' in locals() and conn:
        conn.rollback()
finally:
    if 'conn' in locals() and conn:
        conn.close()
