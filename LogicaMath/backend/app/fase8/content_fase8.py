niveles_teoria_fase8 = [
    # Módulo 1: Secuencias Lógicas
    {
        "modulo_id": 1, 
        "nivel_id": 1, 
        "titulo": "El Código Secreto", 
        "texto_descubrimiento": "¡Bienvenido al laboratorio matemático!\nNuestra primera misión es descubrir el 'Patrón'. Un patrón es una regla secreta que se repite para formar una Secuencia (una lista de números ordenados).\nPor ejemplo, en la secuencia: 2, 4, 6, 8...\n¿Qué está pasando? ¡Exacto! Estamos sumando 2 a cada paso. La regla secreta es '+2'.\nPara descubrir el patrón siempre debes fijarte en qué le pasa al primer número para convertirse en el segundo.", 
        "diccionario": {
            "Secuencia": "Lista de números u objetos en un orden especial.",
            "Patrón": "La regla secreta (suma o resta) que conecta los números de la secuencia."
        }, 
        "advertencia": "¡Comprueba la regla dos veces! Si de 2 a 4 sumaste 2, asegúrate que de 4 a 6 también se sume 2.", 
        "ejemplos": [
            {
                "enunciado": "Descubre el número que falta: 5, 10, 15, __, 25",
                "pasos": [
                    {"orden": 1, "texto": "Veo el cambio entre 5 y 10: ¡Se sumaron 5!"},
                    {"orden": 2, "texto": "Compruebo entre 10 y 15: ¡También se sumaron 5!"},
                    {"orden": 3, "texto": "Aplico el patrón al 15: 15 + 5 = 20."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Secuencia: 10, 8, 6, 4... ¿Cuál es el patrón o regla?",
                "respuesta": "-2",
                "feedback_acierto": "¡Excelente! Los números bajan de 2 en 2.",
                "feedback_error": "Fíjate bien, los números van disminuyendo, ¡es una resta!"
            }
        ]
    },
    {
        "modulo_id": 1, 
        "nivel_id": 2, 
        "titulo": "Patrones Compuestos", 
        "texto_descubrimiento": "Los códigos ahora son más difíciles.\nA veces el patrón no es solo sumar o restar... ¡también podemos Multiplicar!\nPor ejemplo: 2, 4, 8, 16...\nAquí no estamos sumando 2, porque 4+2=6, no 8.\n¡La regla secreta es 'Multiplicar por 2' (x2)!\nTambién existen los Patrones Intercalados, donde hay dos secuencias mezcladas saltándose un número a la vez.", 
        "diccionario": {
            "Progresión Geométrica": "Una secuencia donde el patrón es multiplicar (o dividir).",
            "Patrón Intercalado": "Dos reglas diferentes que se turnan. Ej: +2, luego -1, luego +2..."
        }, 
        "advertencia": "Si la suma no funciona o los números crecen súper rápido, ¡intenta multiplicar!", 
        "ejemplos": [
            {
                "enunciado": "¿Qué sigue? 3, 9, 27, __",
                "pasos": [
                    {"orden": 1, "texto": "Sumar no sirve: 3+6=9, pero 9+6=15 (y tenemos 27)."},
                    {"orden": 2, "texto": "Probamos multiplicar: 3 x 3 = 9. 9 x 3 = 27. ¡Funciona!"},
                    {"orden": 3, "texto": "Aplicamos: 27 x 3 = 81."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Encuentra el número que falta: 1, 5, 25, __",
                "pasos": [
                    {"orden": 1, "texto": "Número faltante = ?"}
                ],
                "respuesta": "125",
                "feedback_acierto": "¡Increíble! La regla es x5.",
                "feedback_error": "Intenta multiplicar por 5."
            }
        ]
    },
    {
        "modulo_id": 1, 
        "nivel_id": 3, 
        "titulo": "El Arte de la Interpolación", 
        "texto_descubrimiento": "¡Última misión de secuencias!\nA veces el número que falta no está al final, sino en el MEDIO de la secuencia.\nA esto lo llamamos 'Interpolar'.\nPara resolverlo, debes usar los números que sí están juntos para encontrar la regla, y luego aplicarla al número que está antes del hueco vacío.", 
        "diccionario": {
            "Interpolar": "Descubrir un valor escondido en el medio de una secuencia."
        }, 
        "advertencia": "Después de encontrar el número del medio, asegúrate de que la regla también funcione para saltar de ese número al siguiente. ¡Es la prueba de fuego!", 
        "ejemplos": [
            {
                "enunciado": "Secuencia: 10, __, 30, 40",
                "pasos": [
                    {"orden": 1, "texto": "Miro los que están juntos: 30 a 40 es +10."},
                    {"orden": 2, "texto": "La regla es sumar 10."},
                    {"orden": 3, "texto": "Aplico la regla al primero: 10 + 10 = 20."},
                    {"orden": 4, "texto": "Compruebo: ¿20 + 10 es 30? ¡Sí! Es correcto."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Completa el hueco: 3, 6, __, 12, 15",
                "pasos": [
                    {"orden": 1, "texto": "Número faltante = ?"}
                ],
                "respuesta": "9",
                "feedback_acierto": "¡Exacto! El patrón era +3.",
                "feedback_error": "Mira la diferencia entre 12 y 15."
            }
        ]
    },
    {"modulo_id": 1, "nivel_id": 11, "titulo": "Desafío 1", "texto_descubrimiento": "¡Prepárate para demostrar tus habilidades en las secuencias! No habrá pistas aquí.", "diccionario": {}, "advertencia": "Mantén la concentración y analiza bien las diferencias.", "ejemplos": [], "interactivos": []},
    {"modulo_id": 1, "nivel_id": 12, "titulo": "Desafío 2", "texto_descubrimiento": "Atención con las trampas. Algunos patrones pueden tener dos reglas simultáneas.", "diccionario": {}, "advertencia": "A veces es mejor probar con operaciones compuestas.", "ejemplos": [], "interactivos": []},
    {"modulo_id": 1, "nivel_id": 13, "titulo": "Desafío Final", "texto_descubrimiento": "El Candado Final del módulo de Secuencias. Usa todo lo aprendido.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},

    # Módulo 2: Combinatoria Visual
    {
        "modulo_id": 2, 
        "nivel_id": 1, 
        "titulo": "Diagramas de Árbol", 
        "texto_descubrimiento": "¡Hola, maestro de las opciones!\nLa Combinatoria nos enseña cómo agrupar y organizar las cosas sin que se nos escape ninguna opción.\nSi vas a comprar helado y hay 2 tipos de cono (Galleta o Vaso) y 3 sabores (Fresa, Vainilla, Chocolate). ¿Cuántos helados diferentes puedes armar?\nPara no confundirnos dibujamos un 'Diagrama de Árbol'. Es un dibujo donde trazamos ramitas desde cada cono hacia cada sabor.", 
        "diccionario": {
            "Combinatoria": "La ciencia matemática de contar opciones y agrupar cosas.",
            "Diagrama de Árbol": "Un dibujo con ramas para conectar todas las opciones posibles de forma organizada."
        }, 
        "advertencia": "Si tratas de contar en tu cabeza sin orden, seguro se te olvidará alguna combinación. ¡Dibuja o usa las matemáticas!", 
        "ejemplos": [
            {
                "enunciado": "Tienes 2 pantalones (Azul, Negro) y 2 camisas (Blanca, Roja). ¿Cuántos conjuntos puedes crear?",
                "pasos": [
                    {"orden": 1, "texto": "Pantalón Azul + Blanca = 1. Pantalón Azul + Roja = 2."},
                    {"orden": 2, "texto": "Pantalón Negro + Blanca = 3. Pantalón Negro + Roja = 4."},
                    {"orden": 3, "texto": "Total: 4 conjuntos."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si tienes 3 tipos de pan y 2 tipos de queso. ¿Cuántos sándwiches diferentes puedes hacer?",
                "respuesta": "6",
                "feedback_acierto": "¡Maravilloso! 3 panes x 2 quesos = 6.",
                "feedback_error": "Dibuja 3 panes y traza 2 flechas a cada uno."
            }
        ]
    },
    {
        "modulo_id": 2, 
        "nivel_id": 2, 
        "titulo": "El Principio Multiplicativo", 
        "texto_descubrimiento": "¡Un truco mágico para no dibujar árboles gigantes!\nEn lugar de trazar cientos de ramas, existe el 'Principio Multiplicativo'.\nSolo tienes que multiplicar la cantidad de opciones de la primera cosa, por la cantidad de opciones de la segunda cosa.\nEn el caso de los helados: 2 conos × 3 sabores = 6 helados diferentes. ¡Súper rápido y no tuvimos que dibujar nada!", 
        "diccionario": {
            "Principio Multiplicativo": "Multiplicar el número de opciones de cada grupo para obtener el total de combinaciones posibles."
        }, 
        "advertencia": "Este truco solo funciona si puedes elegir una cosa de cada grupo al mismo tiempo (ej: 1 camisa Y 1 pantalón).", 
        "ejemplos": [
            {
                "enunciado": "Tienes 4 colores de pintura, 3 tipos de pinceles y 2 tipos de lienzos. ¿Cuántas obras diferentes puedes hacer?",
                "pasos": [
                    {"orden": 1, "texto": "Simplemente multiplicamos todo."},
                    {"orden": 2, "texto": "4 × 3 × 2 = 24."},
                    {"orden": 3, "texto": "¡Puedes hacer 24 obras diferentes!"}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Un coche viene en 5 colores diferentes y con 2 tipos de motor. ¿Cuántas versiones de coche existen?",
                "respuesta": "10",
                "feedback_acierto": "¡Excelente! 5 × 2 = 10.",
                "feedback_error": "Aplica el principio: multiplica 5 por 2."
            }
        ]
    },
    {
        "modulo_id": 2, 
        "nivel_id": 3, 
        "titulo": "Empaquetado Exacto (MCD)", 
        "texto_descubrimiento": "A veces no queremos combinar cosas, ¡sino repartirlas!\nImagina que tienes 12 manzanas y 8 naranjas y quieres hacer canastas idénticas (con la misma cantidad de cada fruta) sin que sobre nada.\nPara hacer esto usamos el 'Máximo Común Divisor' (MCD). Es el número más grande que puede dividir a los dos números de forma exacta.", 
        "diccionario": {
            "Divisor": "Un número que cabe en otro número exactamente (sin dejar sobras).",
            "MCD": "El mayor número que divide exactamente a varios números a la vez."
        }, 
        "advertencia": "Haz una lista de los divisores de ambos números y busca el mayor número que se repita en ambas listas.", 
        "ejemplos": [
            {
                "enunciado": "¿Cuál es el MCD de 12 y 8 para armar las canastas?",
                "pasos": [
                    {"orden": 1, "texto": "Divisores de 12: 1, 2, 3, 4, 6, 12"},
                    {"orden": 2, "texto": "Divisores de 8: 1, 2, 4, 8"},
                    {"orden": 3, "texto": "El número más grande repetido es el 4. ¡Puedes armar 4 canastas exactas!"}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "¿Cuál es el Máximo Común Divisor de 10 y 15?",
                "pasos": [
                    {"orden": 1, "texto": "MCD = ?"}
                ],
                "respuesta": "5",
                "feedback_acierto": "¡Correctísimo! Ambos están en la tabla del 5.",
                "feedback_error": "Piensa en un número que divida exactamente a 10 y a 15."
            }
        ]
    },
    {"modulo_id": 2, "nivel_id": 11, "titulo": "Desafío 1", "texto_descubrimiento": "Tiempo de poner a prueba la combinatoria. Organiza las opciones rápidamente.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    {"modulo_id": 2, "nivel_id": 12, "titulo": "Desafío 2", "texto_descubrimiento": "Cuidado con las restricciones, a veces no todas las combinaciones son válidas.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    {"modulo_id": 2, "nivel_id": 13, "titulo": "Desafío Final", "texto_descubrimiento": "Demuestra tu dominio combinatorio para avanzar.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},

    # Módulo 3: Probabilidad
    {
        "modulo_id": 3, 
        "nivel_id": 1, 
        "titulo": "La Bola de Cristal", 
        "texto_descubrimiento": "¡La Probabilidad es la magia de predecir el futuro (matemáticamente)!\nSirve para medir qué tan posible es que algo ocurra.\nExisten 3 tipos de eventos:\n1. Seguro: ¡100% va a pasar! (Ej. Sacar una bola roja de una caja llena solo de rojas).\n2. Posible: Podría pasar, pero no es seguro (Ej. Que salga cara al lanzar una moneda).\n3. Imposible: ¡Nunca pasará! (Ej. Sacar un 7 en un dado normal de 6 caras).", 
        "diccionario": {
            "Probabilidad": "Medida de qué tan factible es que ocurra un evento."
        }, 
        "advertencia": "Si alguien te dice que la probabilidad de que llueva dinero es del 100%... ¡es un evento imposible disfrazado!", 
        "ejemplos": [
            {
                "enunciado": "Hay una bolsa con 5 dulces verdes. Sacas uno sin mirar. ¿Es un evento seguro, posible o imposible sacar un dulce azul?",
                "pasos": [
                    {"orden": 1, "texto": "Solo hay dulces verdes."},
                    {"orden": 2, "texto": "Por lo tanto, no existe el color azul en la bolsa."},
                    {"orden": 3, "texto": "¡Es IMPOSIBLE!"}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "En un dado normal de 6 caras, ¿sacar un número menor a 10 es Seguro, Posible o Imposible?",
                "respuesta": "Seguro",
                "feedback_acierto": "¡Totalmente! Todos los números del dado (1 al 6) son menores a 10.",
                "feedback_error": "Recuerda que los números del dado son 1,2,3,4,5,6... todos son menores a 10."
            }
        ]
    },
    {
        "modulo_id": 3, 
        "nivel_id": 2, 
        "titulo": "La Ley de Laplace", 
        "texto_descubrimiento": "Para no solo decir 'es posible', los matemáticos crearon una fórmula para ponerle un número exacto a la probabilidad: La Regla de Laplace.\nConsiste en armar una fracción:\nArriba ponemos los 'Casos Favorables' (lo que queremos que salga).\nAbajo ponemos los 'Casos Posibles' (el total de opciones que hay).\nEjemplo: Lanzar una moneda y que salga Cara.\nFavorables = 1 (solo hay una Cara). Posibles = 2 (Cara o Cruz).\n¡Probabilidad = 1/2!", 
        "diccionario": {
            "Casos Favorables": "Las opciones que nos hacen ganar el juego.",
            "Casos Posibles": "El total de opciones que existen en total."
        }, 
        "advertencia": "¡Cuidado! Nunca puedes tener más casos favorables que posibles. La fracción no puede ser mayor a 1.", 
        "ejemplos": [
            {
                "enunciado": "En una caja hay 3 bolas rojas y 2 azules. ¿Cuál es la probabilidad de sacar una roja?",
                "pasos": [
                    {"orden": 1, "texto": "Casos Favorables (rojas) = 3."},
                    {"orden": 2, "texto": "Casos Posibles (total) = 3 + 2 = 5."},
                    {"orden": 3, "texto": "Probabilidad = 3/5."}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Un dado tiene 6 caras. ¿Cuántos casos favorables hay para sacar el número 4?",
                "pasos": [
                    {"orden": 1, "texto": "Favorables = ?"}
                ],
                "respuesta": "1",
                "feedback_acierto": "¡Exacto! Solo hay un número 4 en el dado.",
                "feedback_error": "Solo existe una cara pintada con el número 4."
            }
        ]
    },
    {
        "modulo_id": 3, 
        "nivel_id": 3, 
        "titulo": "Duelo de Probabilidades", 
        "texto_descubrimiento": "¡Apostemos!\nA veces tenemos que comparar fracciones de probabilidad para saber quién tiene más chances de ganar.\nSi Ana tiene 1/2 de probabilidad de ganar, y Juan tiene 1/4... ¿Quién tiene ventaja?\nRecuerda las fracciones: 1/2 es la mitad (50%), mientras que 1/4 es solo una cuarta parte (25%). ¡Ana tiene el doble de probabilidad que Juan!\nPara comparar mejor, asegúrate de que el número de abajo (Denominador) sea igual o imagínate pasteles cortados.", 
        "diccionario": {
            "Comparación probabilística": "Ver qué evento tiene una fracción mayor para predecir al ganador."
        }, 
        "advertencia": "¡Un denominador grande NO significa mayor probabilidad! 1/100 es mucho menor que 1/2.", 
        "ejemplos": [
            {
                "enunciado": "Ruleta A: 2/4 rojo. Ruleta B: 1/4 rojo. ¿En cuál ruleta es más fácil sacar rojo?",
                "pasos": [
                    {"orden": 1, "texto": "Ambas están divididas en 4 partes (denominadores iguales)."},
                    {"orden": 2, "texto": "Comparamos los de arriba: 2 es mayor que 1."},
                    {"orden": 3, "texto": "¡La Ruleta A es mejor!"}
                ]
            }
        ], 
        "interactivos": [
            {
                "enunciado": "Si tienes 3/5 de chances de sacar un as y 2/5 de sacar un rey. ¿Qué es más probable sacar? (Responde 'as' o 'rey')",
                "respuesta": "as",
                "feedback_acierto": "¡Fantástico! 3 es mayor que 2.",
                "feedback_error": "El que tenga el número de arriba (numerador) más grande gana."
            }
        ]
    },
    {"modulo_id": 3, "nivel_id": 11, "titulo": "Desafío 1", "texto_descubrimiento": "Supera las fracciones de probabilidad bajo presión.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    {"modulo_id": 3, "nivel_id": 12, "titulo": "Desafío 2", "texto_descubrimiento": "Cuidado con los cambios en el espacio muestral. Piensa bien tus denominadores.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    {"modulo_id": 3, "nivel_id": 13, "titulo": "Desafío Final", "texto_descubrimiento": "El Candado definitivo de la Fase 8. Combina todo lo aprendido.", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []}
]
