niveles_teoria_fase7 = [
    # MODULO 1: Orientación Cardinal y Ángulos
    {
        "modulo_id": 1, 
        "nivel_id": 1, 
        "titulo": "La Brújula Mágica", 
        "texto_descubrimiento": "¡Hola explorador!\nImagina que estás en medio de un mapa del tesoro gigante. Para no perderte, usamos una Brújula Mágica que nos señala los 4 Puntos Cardinales: Norte (N), Sur (S), Este (E) y Oeste (O).\nCuando giras hacia un lado, estás haciendo un 'Giro Angular'. Un giro completo es como dar una vuelta entera. Si solo giras un cuarto de vuelta (como de mirar al frente a mirar a tu derecha), estás haciendo un giro de 90 grados (90°).\n¡Es muy fácil! Si miras al Norte y giras 90° a tu derecha, ¡ahora miras al Este!", 
        "diccionario": {
            "Puntos Cardinales": "Las 4 direcciones principales del mapa: Norte (arriba), Sur (abajo), Este (derecha) y Oeste (izquierda).",
            "Giro de 90°": "Un cuarto de vuelta. Como la esquina de un cuadrado perfecto."
        }, 
        "advertencia": "¡Cuidado! A veces te pedirán girar a la izquierda (en contra de las agujas del reloj). Piensa siempre desde dónde estás mirando.", 
        "ejemplos": [
            {
                "enunciado": "Estás mirando al Norte. Haces un giro de 90° a la derecha. ¿Hacia dónde miras ahora?",
                "pasos": [
                    {"orden": 1, "texto": "Nos ubicamos en el Norte (N)."},
                    {"orden": 2, "texto": "Giramos un cuarto de vuelta a la derecha."},
                    {"orden": 3, "texto": "Llegamos al Este (E)."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si estás mirando al Este y giras 90° a la derecha, ¿Hacia dónde miras?",
                "respuesta": "Sur",
                "feedback_acierto": "¡Excelente! Del Este hacia la derecha llegas al Sur.",
                "feedback_error": "Dibuja una cruz. N arriba, E derecha. Si estás en E y giras a la derecha (abajo), es el Sur."
            }
        ]
    },
    {
        "modulo_id": 1, 
        "nivel_id": 2, 
        "titulo": "Cazadores de Vectores", 
        "texto_descubrimiento": "¡Subiendo de nivel!\nAhora que sabes girar, vamos a movernos. Un 'Vector' es como una flecha mágica que te dice dos cosas: Hacia dónde ir (Dirección) y cuántos pasos dar (Distancia).\nPor ejemplo, '3 pasos al Norte' es un vector. Si un pirata te dice: 'Camina 4 pasos al Este y luego 2 al Norte', estás siguiendo una ruta vectorial.\nVamos a traducir palabras en trayectos matemáticos.", 
        "diccionario": {
            "Vector": "Una flecha matemática que indica una distancia y una dirección.",
            "Ruta": "Una secuencia de vectores encadenados."
        }, 
        "advertencia": "El orden de los pasos no cambia el destino final, ¡pero sí cambia el camino que dibujas en el mapa!", 
        "ejemplos": [
            {
                "enunciado": "¿Qué significa la ruta: 2E + 1S?",
                "pasos": [
                    {"orden": 1, "texto": "2E significa 2 pasos hacia el Este (derecha)."},
                    {"orden": 2, "texto": "1S significa 1 paso hacia el Sur (abajo)."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si el mapa dice 'Mueve 3 pasos a la izquierda', ¿Qué letra de punto cardinal usas?",
                "respuesta": "O",
                "feedback_acierto": "¡Muy bien! Izquierda es Oeste (O).",
                "feedback_error": "Recuerda: Izquierda es Oeste, Derecha es Este."
            }
        ]
    },
    {
        "modulo_id": 1, 
        "nivel_id": 3, 
        "titulo": "El Laberinto de la Ciudad", 
        "texto_descubrimiento": "¡Bienvenido a la ciudad matemática!\nAquí las calles forman una cuadrícula. A veces hay obstáculos o calles cerradas, por lo que no siempre podemos caminar en línea recta.\nDebemos analizar cuál es la mejor ruta para llegar a la meta esquivando los bloqueos. Para esto, contamos los bloques o cuadras totales que debemos caminar.", 
        "diccionario": {
            "Cuadrícula": "Un mapa lleno de cuadrados (como el papel cuadriculado).",
            "Trayectoria Óptima": "El camino más corto posible sin chocar con paredes."
        }, 
        "advertencia": "¡Atento a los bloqueos! Aunque una ruta parezca más corta, si hay una pared, tendrás que rodearla gastando más pasos.", 
        "ejemplos": [
            {
                "enunciado": "Estás a 2 bloques al Sur de tu casa. ¿Qué ruta óptima tomas para llegar?",
                "pasos": [
                    {"orden": 1, "texto": "Como estoy al Sur, mi casa está arriba de mí."},
                    {"orden": 2, "texto": "Debo caminar 2 bloques hacia el Norte (2N)."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si debes ir 1 paso al Este y 2 al Norte. ¿Cuántos pasos das en total?",
                "pasos": [
                    {"orden": 1, "texto": "Total de pasos = ?"}
                ],
                "respuesta": "3",
                "feedback_acierto": "¡Correcto! 1 + 2 = 3 pasos totales.",
                "feedback_error": "Suma la cantidad de pasos de cada dirección."
            }
        ]
    },

    # MODULO 2: Plano Cartesiano
    {
        "modulo_id": 2, 
        "nivel_id": 1, 
        "titulo": "El Secreto de (X, Y)", 
        "texto_descubrimiento": "¡Conoce el Plano Cartesiano!\nEs una cuadrícula gigante inventada por el matemático René Descartes. \nTiene dos líneas principales (Ejes):\nEl Eje X es la línea horizontal (el suelo). \nEl Eje Y es la línea vertical (un árbol que crece hacia arriba).\nPara encontrar un tesoro, usamos Coordenadas (X, Y). Siempre leemos primero la X (cuánto avanzamos por el suelo) y luego la Y (cuánto subimos al árbol).", 
        "diccionario": {
            "Eje X": "Línea horizontal ↔",
            "Eje Y": "Línea vertical ↕",
            "Coordenadas (X, Y)": "Dirección secreta para encontrar un punto."
        }, 
        "advertencia": "¡Jamás los confundas! Siempre primero caminas por el suelo (X), y luego subes la escalera (Y).", 
        "ejemplos": [
            {
                "enunciado": "Ubica la estrella en (3, 4).",
                "pasos": [
                    {"orden": 1, "texto": "Me paro en el (0,0)."},
                    {"orden": 2, "texto": "Avanzo 3 pasos a la derecha por el suelo (X)."},
                    {"orden": 3, "texto": "Subo 4 pisos hacia arriba (Y)."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si el tesoro está en X=5 y Y=2. Escríbelo en formato coordenada con paréntesis: (X,Y)",
                "respuesta": "(5,2)",
                "feedback_acierto": "¡Perfecto! Siempre la X primero.",
                "feedback_error": "Recuerda usar paréntesis y una coma: (5,2)"
            }
        ]
    },
    {
        "modulo_id": 2, 
        "nivel_id": 2, 
        "titulo": "Teletransportación Mágica", 
        "texto_descubrimiento": "¡Ahora vamos a mover objetos!\nA este movimiento mágico sin girar lo llamamos 'Traslación'.\nSi estás en el punto (2, 3) y el juego te dice 'Traslada el punto 2 pasos a la derecha', simplemente le sumamos 2 al eje X (el suelo).\nNueva coordenada: X = 2 + 2 = 4. ¡Boom! Apareces en (4, 3).\nSi dice 'hacia arriba', le sumas a la Y. Si dice 'abajo', le restas a la Y.", 
        "diccionario": {
            "Traslación": "Mover una figura de un lugar a otro sin cambiar su forma ni rotarla."
        }, 
        "advertencia": "Derecha (+X), Izquierda (-X), Arriba (+Y), Abajo (-Y).", 
        "ejemplos": [
            {
                "enunciado": "Tu robot está en (1, 1). Lo trasladas 3 pasos arriba. ¿Dónde queda?",
                "pasos": [
                    {"orden": 1, "texto": "Arriba afecta al Eje Y."},
                    {"orden": 2, "texto": "Y actual es 1. Le sumo 3: 1 + 3 = 4."},
                    {"orden": 3, "texto": "El Eje X queda igual (1)."},
                    {"orden": 4, "texto": "Nuevo punto: (1, 4)."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Estás en (2, 4) y te mueves 1 paso a la derecha. ¿Cuál es tu nueva X?",
                "pasos": [
                    {"orden": 1, "texto": "Nueva X = ?"}
                ],
                "respuesta": "3",
                "feedback_acierto": "¡Correcto! 2 + 1 = 3.",
                "feedback_error": "Mover a la derecha significa sumar al primer número."
            }
        ]
    },
    {
        "modulo_id": 2, 
        "nivel_id": 3, 
        "titulo": "La Distancia del Taxista", 
        "texto_descubrimiento": "En el mundo real no podemos atravesar edificios volando.\nPara saber a cuántas cuadras está un lugar de otro en una ciudad, usamos la 'Distancia Manhattan' (o la distancia del taxista).\nSolo contamos cuántas calles debes caminar horizontalmente y luego sumamos las calles verticales.\nSi tu casa está en (1, 1) y la escuela en (4, 5). \nHaces: (4 - 1) = 3 calles en X. (5 - 1) = 4 calles en Y. \nTotal = 3 + 4 = 7 cuadras.", 
        "diccionario": {
            "Distancia Manhattan": "La suma de la distancia horizontal y vertical entre dos puntos."
        }, 
        "advertencia": "No intentes calcular la línea diagonal, ¡aquí siempre caminamos por las calles rectas!", 
        "ejemplos": [
            {
                "enunciado": "Distancia desde (2, 2) hasta (5, 2)",
                "pasos": [
                    {"orden": 1, "texto": "Están en la misma calle Y (2 y 2)."},
                    {"orden": 2, "texto": "Restamos la X: 5 - 2 = 3."},
                    {"orden": 3, "texto": "Distancia total = 3."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Calcula la distancia desde (1, 1) hasta (3, 2).",
                "pasos": [
                    {"orden": 1, "texto": "Distancia horizontal: 3 - 1 = 2"},
                    {"orden": 2, "texto": "Distancia vertical: 2 - 1 = 1"},
                    {"orden": 3, "texto": "Suma total = ?"}
                ],
                "respuesta": "3",
                "feedback_acierto": "¡Exacto! 2 cuadras horizontales + 1 vertical.",
                "feedback_error": "Resta los números X, resta los números Y, y luego suma ambos resultados."
            }
        ]
    },

    # MODULO 3: La Mecánica del Tiempo
    {
        "modulo_id": 3, 
        "nivel_id": 1, 
        "titulo": "Los Tres Relojes", 
        "texto_descubrimiento": "¡Bienvenido a la cuarta dimensión: El Tiempo!\nEl tiempo se mide de una forma muy especial. No contamos de 10 en 10 como en los decimales, sino de 60 en 60 (Sistema Sexagesimal).\n1 Hora tiene exactamente 60 minutos.\n1 Minuto tiene exactamente 60 segundos.\nPara convertir horas a minutos, solo multiplicamos por 60. Para convertir minutos a horas, dividimos entre 60.", 
        "diccionario": {
            "Sistema Sexagesimal": "Contar de 60 en 60.",
            "Conversión": "Cambiar la forma de decir el tiempo sin alterar su duración (ej. 1 hora = 60 mins)."
        }, 
        "advertencia": "¡Cuidado! Media hora no son 50 minutos, ¡son 30 minutos! (La mitad de 60).", 
        "ejemplos": [
            {
                "enunciado": "¿Cuántos minutos son 2 horas?",
                "pasos": [
                    {"orden": 1, "texto": "1 hora = 60 minutos."},
                    {"orden": 2, "texto": "2 horas = 2 x 60."},
                    {"orden": 3, "texto": "Resultado: 120 minutos."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "¿Cuántos segundos hay en 2 minutos?",
                "pasos": [
                    {"orden": 1, "texto": "Total = ?"}
                ],
                "respuesta": "120",
                "feedback_acierto": "¡Excelente! 2 x 60 = 120 segundos.",
                "feedback_error": "Recuerda multiplicar la cantidad de minutos por 60."
            }
        ]
    },
    {
        "modulo_id": 3, 
        "nivel_id": 2, 
        "titulo": "Viajeros de la Tarde (AM/PM)", 
        "texto_descubrimiento": "El día tiene 24 horas, pero nuestros relojes de pared solo tienen 12 números.\nPor eso el día se divide en dos partes: AM (Mañana) y PM (Tarde/Noche).\nSi quieres saber cuánto tiempo pasó de las 10:00 AM a las 2:00 PM, ¡no puedes solo restar 2 - 10!\nTruco: Convierte la hora PM a formato de 24 horas sumándole 12. \nEjemplo: 2:00 PM = 14:00. Ahora sí, restamos: 14:00 - 10:00 = ¡4 horas!", 
        "diccionario": {
            "AM": "Antes del Mediodía (madrugada y mañana).",
            "PM": "Pasado el Mediodía (tarde y noche).",
            "Formato 24h": "Contar las horas del 0 al 23 sin usar AM o PM."
        }, 
        "advertencia": "Las 12:00 PM es el mediodía (hora de almorzar), NO la medianoche.", 
        "ejemplos": [
            {
                "enunciado": "Un tren sale a las 11:00 AM y llega a la 1:00 PM. ¿Cuánto tardó?",
                "pasos": [
                    {"orden": 1, "texto": "1:00 PM = 13:00 h."},
                    {"orden": 2, "texto": "13:00 - 11:00 = 2 horas."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Convierte las 3:00 PM al formato de 24 horas sumando 12.",
                "pasos": [
                    {"orden": 1, "texto": "Hora = ?"}
                ],
                "respuesta": "15",
                "feedback_acierto": "¡Bingo! 3 + 12 = 15.",
                "feedback_error": "Solo suma 12 + 3."
            }
        ]
    },
    {
        "modulo_id": 3, 
        "nivel_id": 3, 
        "titulo": "Aritmética del Reloj", 
        "texto_descubrimiento": "Sumar y restar tiempos es un poco distinto a la suma normal.\nSi un partido empieza a las 3:40 y dura 30 minutos...\nSi sumamos normal: 40 + 30 = 70 minutos. ¡Pero el reloj no marca las 3:70!\nCada vez que los minutos llegan a 60, ¡explota y se convierte en 1 Hora!\nEntonces, 70 minutos = 1 hora y 10 minutos sueltos.\nEl partido terminará a las 4:10.", 
        "diccionario": {
            "Reagrupación de Tiempo": "Convertir 60 minutos en 1 hora al sumar, o romper 1 hora en 60 minutos al restar."
        }, 
        "advertencia": "Cuando restes y no te alcancen los minutos, pídele prestada 1 Hora al vecino y conviértela en 60 minutos mágicos.", 
        "ejemplos": [
            {
                "enunciado": "Suma 2:50 + 0:20 (20 minutos)",
                "pasos": [
                    {"orden": 1, "texto": "Suma minutos: 50 + 20 = 70 minutos."},
                    {"orden": 2, "texto": "70 minutos es lo mismo que 1 hora y 10 minutos."},
                    {"orden": 3, "texto": "Sumamos la hora al 2. Resultado: 3:10."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si tienes 80 minutos, ¿cuántos minutos sueltos quedan después de sacar 1 hora?",
                "pasos": [
                    {"orden": 1, "texto": "Minutos sueltos = ?"}
                ],
                "respuesta": "20",
                "feedback_acierto": "¡Perfecto! 80 - 60 = 20 minutos sobrantes (y 1 hora).",
                "feedback_error": "Resta 60 a los 80 minutos."
            }
        ]
    },

    # MODULO 4: Horarios y Apps
    {
        "modulo_id": 4, 
        "nivel_id": 1, 
        "titulo": "El Detective de Autobuses", 
        "texto_descubrimiento": "En la vida real usamos el tiempo para saber cuándo llega el tren o el autobús.\nPara esto miramos 'Tablas de Horarios', que son como cuadros mágicos donde las columnas nos dicen la Línea del bus y las filas la Hora de salida.\nLeer una tabla es como jugar Batalla Naval: cruzas la información de la fila con la de la columna para encontrar el dato exacto.", 
        "diccionario": {
            "Matriz de Horarios": "Una tabla con columnas y filas donde se organiza el tiempo de salida o llegada.",
            "Frecuencia": "El tiempo que tarda en pasar el siguiente autobús de la misma línea."
        }, 
        "advertencia": "Revisa bien si la tabla muestra hora de SALIDA (cuando arranca) o hora de LLEGADA (cuando termina el viaje).", 
        "ejemplos": [
            {
                "enunciado": "El Bus A sale a las 8:00, 8:15 y 8:30. ¿Cuál es su frecuencia?",
                "pasos": [
                    {"orden": 1, "texto": "Restamos el segundo viaje del primero."},
                    {"orden": 2, "texto": "8:15 - 8:00 = 15 minutos."},
                    {"orden": 3, "texto": "El bus pasa cada 15 minutos."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si un bus pasa cada 20 minutos y el primero salió a las 9:00. ¿A qué hora sale el segundo? (Escribe el formato exacto: 9:20)",
                "respuesta": "9:20",
                "feedback_acierto": "¡Correcto! Solo sumaste 20 minutos.",
                "feedback_error": "Agrega 20 a los minutos del 9:00."
            }
        ]
    },
    {
        "modulo_id": 4, 
        "nivel_id": 2, 
        "titulo": "Calculadora de Transbordos", 
        "texto_descubrimiento": "A veces un solo autobús no es suficiente y tenemos que cambiar a otro a mitad del camino.\nA esto le llamamos 'Transbordo'.\nPara saber el tiempo TOTAL de tu viaje, debes sumar tres cosas:\n1. El tiempo que viajas en el primer bus.\n2. El tiempo de ESPERA en la parada.\n3. El tiempo que viajas en el segundo bus.", 
        "diccionario": {
            "Transbordo": "Cambiar de un vehículo a otro durante el mismo viaje.",
            "Tiempo de Espera": "El tiempo muerto en la parada aguardando al siguiente transporte."
        }, 
        "advertencia": "¡No olvides sumar el tiempo de espera! Es el error más común al calcular el tiempo de viaje total.", 
        "ejemplos": [
            {
                "enunciado": "Viajas 10 mins, esperas 5 mins, y viajas 15 mins más. ¿Tiempo total?",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos todo: 10 + 5 + 15."},
                    {"orden": 2, "texto": "Total = 30 minutos de viaje."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Tu viaje duró 40 minutos en total. Viajaste 15 mins en el Bus A y 20 mins en el Bus B. ¿Cuánto tiempo estuviste ESPERANDO?",
                "pasos": [
                    {"orden": 1, "texto": "Minutos de espera = ?"}
                ],
                "respuesta": "5",
                "feedback_acierto": "¡Gran deducción! 40 - (15+20) = 5.",
                "feedback_error": "Suma 15 + 20 y luego réstaselo al total (40)."
            }
        ]
    },
    {
        "modulo_id": 4, 
        "nivel_id": 3, 
        "titulo": "Optimizador de Viajes", 
        "texto_descubrimiento": "¡Bienvenido al nivel de los expertos!\nAquí actúas como una verdadera aplicación de GPS.\nTendrás varias opciones de transporte y tu misión será 'Optimizar' el recurso, que significa elegir la mejor opción según lo que necesites.\nA veces la mejor opción es la que llega más temprano. Otras veces es la que camina menos. Debes leer muy bien la regla de oro de cada problema para tomar la decisión ganadora.", 
        "diccionario": {
            "Optimizar": "Analizar todas las opciones para escoger la mejor y más eficiente.",
            "Algoritmo": "La serie de pasos lógicos que usa tu cerebro para elegir el ganador."
        }, 
        "advertencia": "La opción que sale primero no siempre es la que llega primero. ¡Un tren rápido puede salir más tarde y ganar la carrera!", 
        "ejemplos": [
            {
                "enunciado": "El Bus A sale a las 8:00 y tarda 30m. El Tren B sale a las 8:15 y tarda 10m. ¿Quién llega primero?",
                "pasos": [
                    {"orden": 1, "texto": "Bus A llega a las 8:30 (8:00 + 30m)."},
                    {"orden": 2, "texto": "Tren B llega a las 8:25 (8:15 + 10m)."},
                    {"orden": 3, "texto": "El Tren B llega primero."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Bus X tarda 20m. Bus Y tarda 15m. Ambos salen a las 10:00. ¿Cuál optimiza el tiempo de llegada? (Responde X o Y)",
                "respuesta": "Y",
                "feedback_acierto": "¡Correcto! El Y llega en menos tiempo.",
                "feedback_error": "El que tarda menos tiempo, llega más rápido."
            }
        ]
    }
]
