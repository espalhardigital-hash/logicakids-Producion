import asyncio
import sys
import random
import json
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from app.db.session import AsyncSessionLocal
from app.models.sql_models import (
    Fase,
    Pregunta,
    Alternativa,
    ConfiguracionProgreso,
    StatusEnum,
    OperacionEnum,
    TipoPreguntaEnum,
    TipoErrorEnum,
    Intento,
    PoolAsignadoAlumno,
)
from app.fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso
from app.fase2.theory_examples import obtener_ejemplos_expandidos_fase2

# ID de la Fase 2 en la base de datos

FASE2_ID = 2

# Schema de Validación de Teoría para garantizar 3 interactivos obligatorios
class NivelTeoriaSeederSchema(BaseModel):
    modulo_id: int
    nivel_id: int
    titulo: str
    texto_descubrimiento: str
    diccionario: Dict[str, str]
    advertencia: str
    ejemplos: List[Dict[str, Any]]
    interactivos: List[Dict[str, Any]] = Field(..., min_items=3, max_items=3)

async def clear_fase2_data(session: AsyncSession):
    print("Purging existing Fase 2 data for a clean overwrite...")
    
    # Get all question IDs for Phase 2
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE2_ID))
    pregunta_ids_list = result.scalars().all()
    
    if pregunta_ids_list:
        # Delete references to prevent ForeignKeyViolationError
        await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids_list)))
        
        # Get attempt questions IDs
        res_int_q = await session.execute(select(IntentoPregunta.id).where(IntentoPregunta.pregunta_id.in_(pregunta_ids_list)))
        int_q_ids = res_int_q.scalars().all()
        if int_q_ids:
            await session.execute(delete(IntentoPaso).where(IntentoPaso.intento_pregunta_id.in_(int_q_ids)))
            await session.execute(delete(IntentoPregunta).where(IntentoPregunta.id.in_(int_q_ids)))
            
        await session.execute(delete(Intento).where(Intento.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(pregunta_ids_list)))
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE2_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE2_ID))
    
    # Delete main questions
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE2_ID))
    
    # Delete progress config and theory
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE2_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE2_ID))
    
    await session.commit()
    print("Fase 2 data purged.")

# ==============================================================================
# PART A: SEED NIVEL TEORIA (14 Levels)
# ==============================================================================
async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando guión de textos (NivelTeoria) para Fase 2...")
    
    niveles_teoria = [
        # --- MÓDULO 1 ---
        {
            "modulo_id": 1,
            "nivel_id": 1,
            "titulo": "Conceptos de doble, triple, mitad y cuádruple",
            "texto_descubrimiento": "Comprender el doble, el triple o el cuádruple de una cantidad significa aplicar un factor de escala mediante la multiplicación. Cuando calculas el doble de un número, no estás simplemente sumando; estás tomando esa misma cantidad exacta dos veces. De manera similar, la mitad de un número es un proceso de partición equitativa: significa dividir la cantidad original en dos partes exactamente iguales. Dominar estas escalas te permitirá proyectar y reducir cantidades de forma rápida y mental, lo cual es la base del pensamiento proporcional.",
            "diccionario": {
                "El Doble": "Multiplica por 2 (× 2).",
                "El Triple": "Multiplica por 3 (× 3).",
                "La Mitad": "Divide entre 2 (÷ 2).",
                "El Cuádruple": "Multiplica por 4 (× 4)."
            },
            "advertencia": "El monstruo del desorden quiere que sumes en lugar de multiplicar. Si te piden el triple de 4, la trampa es hacer 4 + 3 = 7. ¡Error! El triple significa tres veces el mismo número: 4 × 3 = 12.",
            "ejemplos": [
                {
                    "enunciado": "Hallar el triple de 6.",
                    "pasos": [
                        {"orden": 1, "texto": "Traducimos 'el triple' como multiplicar por 3 (× 3)."},
                        {"orden": 2, "texto": "Realizamos la operación: 6 × 3 = 18."}
                    ]
                },
                {
                    "enunciado": "Hallar la mitad de 10.",
                    "pasos": [
                        {"orden": 1, "texto": "Traducimos 'la mitad' como dividir entre 2 (÷ 2)."},
                        {"orden": 2, "texto": "Realizamos la operación: 10 ÷ 2 = 5."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Hallar el doble de 8.",
                    "pasos": [
                        {"orden": 1, "texto": "Traducimos 'el doble' como multiplicar por 2 (× 2)."},
                        {"orden": 2, "texto": "Realizamos la operación: 8 × 2 = ?"}
                    ],
                    "respuesta": "16",
                    "feedback_acierto": "¡Excelente! 8 × 2 = 16.",
                    "feedback_error": "Piénsalo mejor. 'El doble' es multiplicar por 2."
                },
                {
                    "enunciado": "Hallar el cuádruple de 3.",
                    "pasos": [
                        {"orden": 1, "texto": "Traducimos 'el cuádruple' como multiplicar por 4 (× 4)."},
                        {"orden": 2, "texto": "Realizamos la operación: 3 × 4 = ?"}
                    ],
                    "respuesta": "12",
                    "feedback_acierto": "¡Correcto! 3 × 4 = 12.",
                    "feedback_error": "Inténtalo de nuevo. 'El cuádruple' es multiplicar por 4."
                },
                {
                    "enunciado": "Hallar la mitad de 14.",
                    "pasos": [
                        {"orden": 1, "texto": "Traducimos 'la mitad' como dividir entre 2 (÷ 2)."},
                        {"orden": 2, "texto": "Realizamos la operación: 14 ÷ 2 = ?"}
                    ],
                    "respuesta": "7",
                    "feedback_acierto": "¡Increíble! 14 ÷ 2 = 7.",
                    "feedback_error": "¡Cuidado! 'La mitad' es dividir entre 2."
                }
            ]
        },
        {
            "modulo_id": 1,
            "nivel_id": 2,
            "titulo": "Prioridad algebraica: orden de operaciones y uso de paréntesis",
            "texto_descubrimiento": "¡Atención! Los números tienen reglas de oro y jerarquías como los caballeros antiguos. En una fila de operaciones matemáticas, la multiplicación y la división siempre se resuelven antes que la suma y la resta. Pero hay un escudo mágico supremo: Los Paréntesis ( ). Cualquier operación atrapada dentro de un paréntesis se resuelve primero, sin importar qué símbolo sea.",
            "diccionario": {
                "Jerarquía Mayor": "Primero multiplicaciones (×) y divisiones (÷).",
                "Jerarquía Menor": "Después sumas (+) y restas (-).",
                "Poder Absoluto": "Los paréntesis ( ) obligan a resolver lo que está dentro antes que cualquier otra cosa."
            },
            "advertencia": "Si ves 3 + 2 × 5, la tentación es leer de izquierda a derecha: 3 + 2 = 5, y luego 5 × 5 = 25. ¡Error! La multiplicación exige prioridad: primero calculas 2 × 5 = 10 y luego sumas el 3: 3 + 10 = 13.",
            "ejemplos": [
                {
                    "enunciado": "Resolver 8 + 4 ÷ 2.",
                    "pasos": [
                        {"orden": 1, "texto": "Identificamos que la división (÷) tiene mayor prioridad que la suma (+)."},
                        {"orden": 2, "texto": "Resolvemos primero la división: 4 ÷ 2 = 2."},
                        {"orden": 3, "texto": "Sumamos el resultado al primer número: 8 + 2 = 10."}
                    ]
                },
                {
                    "enunciado": "Resolver (4 + 6) × 3.",
                    "pasos": [
                        {"orden": 1, "texto": "Identificamos que el paréntesis ( ) tiene poder absoluto."},
                        {"orden": 2, "texto": "Resolvemos primero lo de adentro: 4 + 6 = 10."},
                        {"orden": 3, "texto": "Multiplicamos el resultado: 10 × 3 = 30."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Resuelve respetando la prioridad: 5 + 4 × 2 =",
                    "respuesta": "13",
                    "feedback_acierto": "¡Brillante! Calculaste primero 4 × 2 = 8 y luego sumaste 5 para obtener 13.",
                    "feedback_error": "¡Piénsalo mejor! No leas de corrido. La multiplicación va primero: calcula 4 × 2 y luego súmale 5."
                },
                {
                    "pregunta": "Los paréntesis tienen el poder absoluto. Resuelve: (5 + 4) × 2 =",
                    "respuesta": "18",
                    "feedback_acierto": "¡Impresionante! El paréntesis protegió la suma. Resolviste 5 + 4 = 9 y luego multiplicaste por 2 para obtener 18.",
                    "feedback_error": "Recuerda que el paréntesis rompe la regla normal. Resuelve primero la suma dentro de (5 + 4) y ese resultado multiplícalo por 2."
                },
                {
                    "pregunta": "Resuelve con calma: 20 - 10 ÷ 2 =",
                    "respuesta": "15",
                    "feedback_acierto": "¡Perfecto! Resolviste la división 10 ÷ 2 = 5 primero, y luego hiciste 20 - 5 = 15.",
                    "feedback_error": "¡Cuidado con el impulso! La división se hace primero. Calcula 10 ÷ 2 y luego réstalo de 20."
                }
            ]
        },
        {
            "modulo_id": 1,
            "nivel_id": 3,
            "titulo": "Traducción del lenguaje verbal a expresiones numéricas abstractas",
            "texto_descubrimiento": "¡Te has convertido en un traductor de élite! Las historias humanas están llenas de palabras que esconden fórmulas matemáticas abstractas. Tu misión es leer el enunciado, identificar la operación y ordenarla usando paréntesis si es necesario.",
            "diccionario": {
                "La suma de A y B multiplicada por C": "Se traduce como (A + B) × C.",
                "El triple de la diferencia entre A y B": "Se traduce como 3 × (A - B).",
                "A la mitad de A sumarle B": "Se traduce como (A ÷ 2) + B."
            },
            "advertencia": "Si la historia dice: 'A la suma de 3 y 4 multiplícala por 2', no debes escribir 3 + 4 × 2 porque la multiplicación se comería al 4 primero. Tienes que proteger la suma con un paréntesis: (3 + 4) × 2.",
            "ejemplos": [
                {
                    "enunciado": "Traducir y resolver: 'El doble de la suma de 3 y 5'.",
                    "pasos": [
                        {"orden": 1, "texto": "La suma de 3 y 5 se escribe (3 + 5)."},
                        {"orden": 2, "texto": "El doble significa multiplicar por 2: 2 × (3 + 5)."},
                        {"orden": 3, "texto": "Resolvemos el paréntesis: 3 + 5 = 8."},
                        {"orden": 4, "texto": "Multiplicamos: 2 × 8 = 16."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Traduce y resuelve: 'El triple de la suma de 2 y 3'.",
                    "respuesta": "15",
                    "feedback_acierto": "¡Qué gran traducción! Sumaste primero 2 + 3 = 5, y luego lo triplicaste: 5 × 3 = 15.",
                    "feedback_error": "¡Atención! Primero debes sumar 2 + 3. Protege esa suma en tu mente para resolverla antes de triplicarla (multiplicar por 3)."
                },
                {
                    "pregunta": "Traduce y resuelve: 'A 20 le resto la mitad de 8'.",
                    "respuesta": "16",
                    "feedback_acierto": "¡Excelente! Calculaste la mitad de 8 que es 4, y luego restaste: 20 - 4 = 16.",
                    "feedback_error": "Piénsalo paso a paso. Primero encuentra la mitad de 8 (dividendo entre 2) y luego réstale ese valor a 20."
                },
                {
                    "pregunta": "Traduce y resuelve: 'El doble de 10, y al resultado le sumo 5'.",
                    "respuesta": "25",
                    "feedback_acierto": "¡Lo lograste! El doble de 10 es 20, y al sumarle 5 resulta 25.",
                    "feedback_error": "Sigue el orden de la lectura. Calcula el doble de 10 (10 × 2) y al número obtenido súmale 5."
                }
            ]
        },
        
        # --- MÓDULO 2 ---
        {
            "modulo_id": 2,
            "nivel_id": 1,
            "titulo": "Operación Inversa - Suma y Resta",
            "texto_descubrimiento": "¡Bienvenido al mundo al revés! Hoy vas a aprender el superpoder del Camino de Regreso. Si una máquina matemática le sumó un número a tu inventario secreto y quieres descubrir cuál era tu número original, solo debes viajar hacia atrás aplicando una Resta. La resta destruye a la suma, y la suma destruye a la resta.",
            "diccionario": {
                "Inverso de la Suma (+)": "La Resta (-).",
                "Inverso de la Resta (-)": "La Suma (+).",
                "Cruzar el Igual (=)": "Para pasar un número al otro lado de la balanza, debes cambiar su símbolo al opuesto."
            },
            "advertencia": "Si el número sumaba al lado de tu incógnita, no lo pases al otro lado sumando también. Romperías el equilibrio. Para cruzar la frontera del igual (=), debe cambiar de bando usando su operación contraria.",
            "ejemplos": [
                {
                    "enunciado": "Si X + 6 = 14, hallar X.",
                    "pasos": [
                        {"orden": 1, "texto": "El 6 está sumando a la X."},
                        {"orden": 2, "texto": "Para despejar X, pasamos el 6 restando al otro lado del igual: X = 14 - 6."},
                        {"orden": 3, "texto": "Resolvemos: X = 8."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Un número misterioso se junta con 5 y el resultado final es 12. ¿Cuál es el número misterioso?",
                    "respuesta": "7",
                    "feedback_acierto": "¡Correcto! Viajaste de regreso haciendo 12 - 5 = 7. ¡Cazaste al número!",
                    "feedback_error": "Deshaz la suma. Si al número se le sumó 5 para llegar a 12, haz el camino de vuelta: resta 12 - 5."
                },
                {
                    "pregunta": "A un cofre con gemas le roban 4 y quedan 10 gemas dentro. ¿Cuántas gemas tenía el cofre al inicio?",
                    "respuesta": "14",
                    "feedback_acierto": "¡Exacto! Si le robaron (restaron) 4 y quedaron 10, recuperas el inicio sumando: 10 + 4 = 14.",
                    "feedback_error": "Aplica la operación inversa. El robo es una resta. Para volver al total inicial, suma las gemas que quedan más las que se llevaron (10 + 4)."
                },
                {
                    "pregunta": "Resuelve el regreso: Si X - 8 = 2, entonces X vale...",
                    "respuesta": "10",
                    "feedback_acierto": "¡Excelente balance! Pasaste el 8 sumando al otro lado del igual: X = 2 + 8 = 10.",
                    "feedback_error": "Recuerda que para cruzar la frontera del igual, el -8 debe cambiar al inverso: +8. Calcula X = 2 + 8."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 2,
            "titulo": "Operación Inversa - Multiplicación y División",
            "texto_descubrimiento": "¡Subimos la velocidad! Ahora la máquina misteriosa multiplica y divide en secreto. Si un número fue multiplicado por 3 para crecer, el camino de regreso para rescatar al número original es Dividir entre 3. La multiplicación y la división son espejos perfectos: una arma grupos y la otra los desarma.",
            "diccionario": {
                "Inverso de la Multiplicación (×)": "La División (÷).",
                "Inverso de la División (÷)": "La Multiplicación (×)."
            },
            "advertencia": "Si te dicen que el triple de un número es 15, no multipliques 15 × 3 = 45. Estarías haciendo crecer el número dos veces. Usa el espejo inverso: divide 15 ÷ 3 = 5.",
            "ejemplos": [
                {
                    "enunciado": "Si 4 × Y = 32, hallar Y.",
                    "pasos": [
                        {"orden": 1, "texto": "El 4 está multiplicando a la Y."},
                        {"orden": 2, "texto": "Usamos el espejo inverso: pasamos el 4 dividiendo al otro lado del igual: Y = 32 ÷ 4."},
                        {"orden": 3, "texto": "Resolvemos: Y = 8."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "El doble de mi edad actual da como resultado 20 años. ¿Cuántos años tengo?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Genial! Desarmaste el doble dividiendo 20 ÷ 2 = 10. ¡Esa es mi edad!",
                    "feedback_error": "¡Piénsalo! Si el doble de tu edad es 20, debes hacer lo contrario de duplicar (dividir entre 2). Calcula 20 ÷ 2."
                },
                {
                    "pregunta": "Repartí mis estampas entre 4 amigos en partes iguales y a cada uno le tocaron 5. ¿Cuántas estampas tenía yo al principio?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Espectacular! Si repartir es dividir, la inversa es multiplicar: 5 estampas × 4 amigos = 20 estampas.",
                    "feedback_error": "La división se revierte multiplicando. Si dividiste tus estampas entre 4 y dio 5, multiplica 5 × 4 para recuperar tu total original."
                },
                {
                    "pregunta": "Resuelve el espejo: Si 3 × Y = 18, entonces Y vale...",
                    "respuesta": "6",
                    "feedback_acierto": "¡Perfecto! Despejaste la Y dividiendo 18 entre 3. Y = 6.",
                    "feedback_error": "Para dejar sola a la Y, el 3 que multiplica debe pasar al otro bando dividiendo. Resuelve 18 ÷ 3."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 3,
            "titulo": "El Número Faltante",
            "texto_descubrimiento": "¡Es hora de convertirte en un cazador de espacios vacíos! En este nivel, las ecuaciones se presentan como un reto de casillas en blanco. Verás un espacio desierto [ ] o una incógnita pura mezclada en cualquier posición de la operación. Tu trabajo es mantener la balanza equilibrada despejando el espacio vacío.",
            "diccionario": {
                "Balanza Equilibrada": "Lo que está a la izquierda del igual (=) debe valer exactamente lo mismo que lo que está a la derecha.",
                "Despejar [ ]": "Mover los números al otro lado de la balanza aplicando operaciones inversas hasta que la casilla vacía quede sola."
            },
            "advertencia": "Si ves 15 - [ ] = 10, ten cuidado con sumar 15 + 10. Piensa de forma intuitiva: a 15 le tienes que quitar algo para que se convierta en 10. El espacio faltante se calcula restando 15 - 10 = 5.",
            "ejemplos": [
                {
                    "enunciado": "Hallar el espacio vacío: 12 - [ ] = 8.",
                    "pasos": [
                        {"orden": 1, "texto": "Razonamos de forma intuitiva: ¿Qué le resto a 12 para obtener 8?"},
                        {"orden": 2, "texto": "La operación correcta para averiguar la diferencia es restar el resultado del total original: 12 - 8."},
                        {"orden": 3, "texto": "Obtenemos 4. Verificamos: 12 - 4 = 8."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Completa el espacio faltante: 8 + [ ] = 20",
                    "respuesta": "12",
                    "feedback_acierto": "¡Conseguido! Restaste 20 - 8 para encontrar que faltaba 12.",
                    "feedback_error": "Piensa en la balanza: 8 más un número da 20. Usa la inversa de la suma: resta 20 - 8 para hallar el valor."
                },
                {
                    "pregunta": "Completa el espacio faltante: [ ] ÷ 3 = 6",
                    "respuesta": "18",
                    "feedback_acierto": "¡Brillante! Multiplicaste 6 × 3 = 18 para descubrir el número que al dividirse da 6.",
                    "feedback_error": "Un número al dividirse entre 3 da 6. Aplica la inversa de la división: multiplica 6 × 3 para saber cuál es."
                },
                {
                    "pregunta": "Completa el espacio faltante: 25 - [ ] = 15",
                    "respuesta": "10",
                    "feedback_acierto": "¡Lo tienes! A 25 le quitas 10 para llegar a 15. Calculaste 25 - 15 = 10.",
                    "feedback_error": "¡Alerta de trampa! Si haces 25 + 15 = 40, al ponerlo en la ecuación diría 25 - 40 = 15, lo cual está mal. Resta 25 - 15 para saber qué le falta quitar."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 4,
            "titulo": "Gran Integración",
            "texto_descubrimiento": "¡Felicidades, estratega! Has unificado tus conocimientos de operaciones inversas. En este nivel de máxima velocidad operacional, el servidor barajará incógnitas aditivas y multiplicativas al azar. Tendrás que cambiar tu chip mental en milisegundos para decidir si regresas sumando, restando, multiplicando o dividiendo.",
            "diccionario": {
                "Estrategia Unificada": "Si el número suma -> pasa restando; si resta -> pasa sumando; si multiplica -> pasa dividiendo; si divide -> pasa multiplicando."
            },
            "advertencia": "No apliques una resta para deshacer una división, ni uses una división para deshacer una resta. Mira fijamente el símbolo original de la balanza antes de ejecutar el contraataque matemático.",
            "ejemplos": [
                {
                    "enunciado": "Resolver para X: 2 × X + 3 = 11.",
                    "pasos": [
                        {"orden": 1, "texto": "Deshacemos primero la operación de jerarquía menor (la suma). Pasamos el +3 restando: 2 × X = 11 - 3 -> 2 × X = 8."},
                        {"orden": 2, "texto": "Ahora deshacemos la multiplicación. Pasamos el 2 dividiendo: X = 8 ÷ 2."},
                        {"orden": 3, "texto": "Resolvemos: X = 4."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Resuelve la incógnita: X + 14 = 30",
                    "respuesta": "16",
                    "feedback_acierto": "¡Excelente! Aplicaste la resta inversa: 30 - 14 = 16.",
                    "feedback_error": "La suma se deshace restando. Resta 14 al número 30 para despejar X."
                },
                {
                    "pregunta": "Resuelve la incógnita: 4 × Z = 32",
                    "respuesta": "8",
                    "feedback_acierto": "¡Así se hace! La multiplicación se deshizo dividiendo 32 ÷ 4 = 8.",
                    "feedback_error": "El 4 multiplica a Z. Pásalo al otro lado dividiendo: calcula Z = 32 ÷ 4."
                },
                {
                    "pregunta": "Resuelve la incógnita: Y - 9 = 11",
                    "respuesta": "20",
                    "feedback_acierto": "¡Fantástico! La resta se deshizo sumando: 11 + 9 = 20.",
                    "feedback_error": "Como el 9 estaba restando, pasa al otro lado sumando. Calcula Y = 11 + 9."
                }
            ]
        },

        # --- MÓDULO 3 ---
        {
            "modulo_id": 3,
            "nivel_id": 1,
            "titulo": "Reconozco el Dinero",
            "texto_descubrimiento": "¡Bienvenido a la Tienda de Logicakids! Hoy te damos tu billetera oficial de entrenamiento. Para que manejar dinero sea súper fácil, los centavos están agrupados en bloques mágicos y limpios: 0,25, 0,50, 0,75 y el peso completo ,00. Piensa en los centavos como piezas de un rompecabezas: cuatro piezas de 0,25 arman un peso entero.",
            "diccionario": {
                "1 moneda de 0,25": "25 centavos.",
                "1 moneda de 0,50": "50 centavos (o dos de 0,25).",
                "1 moneda de 0,75": "75 centavos (o tres de 0,25).",
                "1,00 real": "100 centavos (cuatro de 0,25 o dos de 0,50)."
            },
            "advertencia": "No te asustes al ver la coma decimal. Leer 1,50 es exactamente igual a decir: 'Tengo un real entero con una moneda de cincuenta centavos'.",
            "ejemplos": [
                {
                    "enunciado": "¿Cuánto dinero suman 3 monedas de 0,50?",
                    "pasos": [
                        {"orden": 1, "texto": "Dos monedas de 0,50 forman un real entero (1,00)."},
                        {"orden": 2, "texto": "Agregamos la tercera moneda de 0,50."},
                        {"orden": 3, "texto": "Obtenemos en total 1,50 reais."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Si tengo dos monedas de 0,50 centavos, ¿cuántos reais enteros he acumulado?",
                    "respuesta": "1,00",
                    "feedback_acierto": "¡Muy bien! 0,50 + 0,50 = 1,00 real completo.",
                    "feedback_error": "Recuerda que dos monedas de 50 centavos forman 100 centavos, lo que equivale a 1 real entero. La respuesta es 1,00."
                },
                {
                    "pregunta": "¿Cuánto dinero tengo en total si junto un billete de 5,00 reais y una moneda de 0,25 centavos?",
                    "respuesta": "5,25",
                    "feedback_acierto": "¡Excelente! Sumaste el entero con los centavos para obtener 5,25 reais.",
                    "feedback_error": "Solo junta la parte entera con los centavos: escribe la suma del billete de 5 y la moneda de 0,25, que se representa como 5,25."
                },
                {
                    "pregunta": "Si tengo tres monedas de 0,25 centavos, ¿cuántos centavos tengo en total en formato decimal?",
                    "respuesta": "0,75",
                    "feedback_acierto": "¡Gran conteo! 0,25 + 0,25 + 0,25 = 0,75 centavos.",
                    "feedback_error": "Suma tres veces 25 centavos: 25 + 25 = 50, y 50 + 25 = 75 centavos. Escríbelo como 0,75."
                }
            ]
        },
        {
            "modulo_id": 3,
            "nivel_id": 2,
            "titulo": "Pago y Cambio",
            "texto_descubrimiento": "¡Eres el cajero oficial! Cuando un cliente compra un juguete, te pagará con un billete más grande que el precio. Tu misión es calcular el Vuelto o Cambio restando el precio del artículo del dinero recibido.",
            "diccionario": {
                "Vuelto (Cambio)": "Dinero Recibido - Precio del Artículo.",
                "Regla de Resta Decimal": "Resta centavos con centavos y pesos con pesos. Si los centavos del precio son mayores, pide prestado 1 peso (100 centavos) al entero."
            },
            "advertencia": "Si un chocolate cuesta 0,75 centavos y te pagan con un peso entero (1,00), no digas que el vuelto es 0,35. Recuerda que un peso se compone de 100 centavos, por lo que 100 - 75 = 25. El vuelto limpio es 0,25.",
            "ejemplos": [
                {
                    "enunciado": "Pagas con un billete de 5,00 por un juguete de 3,50. ¿Cuánto vuelto recibes?",
                    "pasos": [
                        {"orden": 1, "texto": "Convertimos los pesos a centavos para no equivocarnos: 5,00 son 500 centavos y 3,50 son 350 centavos."},
                        {"orden": 2, "texto": "Restamos los centavos: 500 - 350 = 150 centavos."},
                        {"orden": 3, "texto": "Convertimos de vuelta a decimal: 1,50 pesos."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Compro una paleta que cuesta 1,50 pesos y pago con un billete de 2,00 pesos. ¿Cuánto cambio recibo?",
                    "respuesta": "0,50",
                    "feedback_acierto": "¡Exacto! 2,00 - 1,50 = 0,50 pesos de vuelto. ¡Cambio justo!",
                    "feedback_error": "Resta el precio de 1,50 al billete de 2,00. Piensa en cuántos centavos le faltan a 50 para llegar a 100 (un peso): la respuesta es 0,50."
                },
                {
                    "pregunta": "Un juguete cuesta 3,00 pesos. El cliente me paga con un billete de 5,00 pesos. ¿Cuánto vuelto debo regresarle?",
                    "respuesta": "2,00",
                    "feedback_acierto": "¡Muy bien! 5,00 - 3,00 = 2,00 pesos. ¡Transacción completada!",
                    "feedback_error": "Esta es una resta directa de enteros: resta 5 - 3 y exprésalo en formato de dinero con coma (2,00)."
                },
                {
                    "pregunta": "Compro un cuaderno de 4,25 pesos y pago con un billete limpio de 5,00 pesos. ¿Cuánto es mi vuelto exacto?",
                    "respuesta": "0,75",
                    "feedback_acierto": "¡Brillante cajero! 5,00 - 4,25 = 0,75 centavos de vuelto.",
                    "feedback_error": "Pide prestado 1 peso al billete de 5,00 para convertirlo en 100 centavos. Resta 100 centavos menos 25 centavos = 75 centavos. Escríbelo como 0,75."
                }
            ]
        },
        {
            "modulo_id": 3,
            "nivel_id": 3,
            "titulo": "Carrito de Compras",
            "texto_descubrimiento": "¡Hora de llenar el carrito! Vas a combinar múltiples artículos. Junta los pesos con los pesos y los bloques de centavos con sus bloques hermanos. ¡Si tus centavos suman 100, se convierten automáticamente en un peso extra!",
            "diccionario": {
                "Suma de Precios": "1. Suma las partes enteras (pesos). 2. Suma los centavos. 3. Si los centavos dan 100 o más, sumas 1,00 al entero y restas 100 a los centavos."
            },
            "advertencia": "Si sumas un artículo de 1,50 y otro de 2,50, no escribas 3,100. Suma los centavos: 50 + 50 = 100 centavos (1 peso). Ahora suma todo: 1 + 2 + 1 (extra) = 4,00 pesos.",
            "ejemplos": [
                {
                    "enunciado": "Sumar en el carrito: un jugo de 2,75 y unas papas de 1,50.",
                    "pasos": [
                        {"orden": 1, "texto": "Sumamos los pesos: 2 + 1 = 3 pesos."},
                        {"orden": 2, "texto": "Sumamos los centavos: 75 + 50 = 125 centavos."},
                        {"orden": 3, "texto": "Como 125 centavos supera 100, formamos 1 peso extra y nos quedan 25 centavos."},
                        {"orden": 4, "texto": "Consolidamos la cuenta: 3 pesos + 1 peso (extra) = 4 pesos con 25 centavos. Escribimos 4,25."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Llevo al carrito un jugo de 1,25 pesos y unas galletas de 1,25 pesos. ¿Cuánto pagaré en total?",
                    "respuesta": "2,50",
                    "feedback_acierto": "¡Excelente! 1,25 + 1,25 = 2,50 pesos. ¡Una merienda económica!",
                    "feedback_error": "Suma por partes: 1 peso + 1 peso = 2 pesos. Luego los centavos: 25 + 25 = 50 centavos. Juntos forman 2,50."
                },
                {
                    "pregunta": "Sumo a mi cuenta un helado de 2,75 pesos y un chicle de 0,25 centavos. ¿Cuál es el costo total?",
                    "respuesta": "3,00",
                    "feedback_acierto": "¡Brillante! Sumaste 75 centavos y 25 centavos para formar 100 centavos (1 peso entero), que sumado a los 2 del helado da 3,00 pesos.",
                    "feedback_error": "¡Cuidado con los centavos! 75 + 25 suman 100 centavos, lo que equivale a un peso extra. Suma ese peso a los 2 del helado. Escribe 3,00."
                },
                {
                    "pregunta": "En mi carrito hay un cómic de 5,50 pesos y un lápiz de 1,50 pesos. ¿Cuánto marca la caja registradora?",
                    "respuesta": "7,00",
                    "feedback_acierto": "¡Perfecto! 5,50 + 1,50 = 7,00 pesos. ¡A leer y escribir!",
                    "feedback_error": "Suma los enteros: 5 + 1 = 6. Luego suma los centavos: 50 + 50 = 100 centavos (1 peso). Une todo: 6 + 1 = 7,00."
                }
            ]
        },
        {
            "modulo_id": 3,
            "nivel_id": 4,
            "titulo": "Comprador Inteligente",
            "texto_descubrimiento": "¡Has sido promovido a Gerente de Presupuesto! Compara el dinero que llevas con el costo de tu carrito antes de pagar para determinar si el dinero te alcanza o calcular exactamente cuánto te falta.",
            "diccionario": {
                "¿Alcanza?": "Si Dinero Llevado ≥ Costo total -> SÍ alcanza (escribe 1). Si Dinero Llevado < Costo total -> NO alcanza (escribe 2).",
                "¿Cuánto Falta?": "Costo Total - Dinero Llevado."
            },
            "advertencia": "Si tienes 5,00 pesos e intentas comprar algo de 6,25 pesos, el costo es mayor que tu billetera. La respuesta correcta es que te faltan 1,25 pesos.",
            "ejemplos": [
                {
                    "enunciado": "Tengo 4,00 y quiero comprar galletas de 4,50. ¿Cuánto dinero me falta?",
                    "pasos": [
                        {"orden": 1, "texto": "Comparamos: 4,00 es menor que 4,50. No nos alcanza."},
                        {"orden": 2, "texto": "Restamos el costo menos nuestro dinero: 4,50 - 4,00 = 0,50."},
                        {"orden": 3, "texto": "Nos faltan 0,50 pesos."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Tengo un billete de 10,00 pesos y mi carrito suma 8,50 pesos. ¿Me alcanza el dinero para pagar? (1 para SÍ, 2 para NO)",
                    "respuesta": "1",
                    "feedback_acierto": "¡Correcto! 10,00 es mayor que 8,50, así que sí te alcanza y te sobra cambio.",
                    "feedback_error": "Compara los números: 10 es mayor que 8 y medio. Por lo tanto, el dinero SÍ te alcanza. Escribe 1."
                },
                {
                    "pregunta": "Mi billetera tiene 4,00 pesos, pero el libro cuesta 5,75 pesos. ¿Cuánto dinero me hace falta?",
                    "respuesta": "1,75",
                    "feedback_acierto": "¡Muy bien calculado! Te hacen falta 1,75 pesos para poder comprar el libro.",
                    "feedback_error": "Para saber cuánto falta, resta el precio del libro menos tu billetera: 5,75 - 4,00. Escribe el resultado exacto."
                },
                {
                    "pregunta": "Llevo un presupuesto de 6,50 pesos y compro un pastelito de 6,50 pesos. ¿Cuánto vuelto me queda?",
                    "respuesta": "0,00",
                    "feedback_acierto": "¡Exacto! Pagaste el valor justo, no te queda nada de vuelto: 0,00 pesos.",
                    "feedback_error": "Si pagas con la misma cantidad exacta que cuesta el pastelito, restas 6,50 - 6,50. Tu vuelto es cero centavos. Escríbelo como 0,00."
                }
            ]
        },

        # --- MÓDULO 4 ---
        {
            "modulo_id": 4,
            "nivel_id": 1,
            "titulo": "Problemas de Dos Pasos Guiados",
            "texto_descubrimiento": "¡Bienvenido al centro de control, ingeniero de soluciones! En este nivel, los problemas de palabras se vuelven misiones estructuradas. El sistema te guiará usando un Diagrama de Flujo. Primero resolverás el Bloque A, y luego el sistema congelará ese número en pantalla para que resuelvas el Bloque B.",
            "diccionario": {
                "Paso 1 (Bloque A)": "Resolver la primera parte de la historia (usualmente una multiplicación o suma del inventario).",
                "Paso 2 (Bloque B)": "Tomar el resultado anterior y aplicar la operación final (una resta de pérdida o suma de regalo)."
            },
            "advertencia": "No intentes operar los números del inicio con los números del final de inmediato. Sigue la guía: primero averigua el total y luego aplica la última acción.",
            "ejemplos": [
                {
                    "enunciado": "Mateo compra 4 cajas de lápices. Cada caja tiene 6 lápices. Luego regala 5 lápices a su amigo.",
                    "pasos": [
                        {"orden": 1, "texto": "Calculamos cuántos lápices compró en total: 4 × 6 = 24 lápices."},
                        {"orden": 2, "texto": "Usando los 24 lápices, le restamos los 5 que regaló: 24 - 5 = 19 lápices."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Lucas compra 3 cajas de crayones con 6 crayones dentro cada una. ¿Cuántos crayones tiene en total?",
                    "respuesta": "18",
                    "feedback_acierto": "¡Correcto! 3 cajas × 6 crayones = 18 crayones. ¡Paso 1 completado!",
                    "feedback_error": "Multiplica las 3 cajas por los 6 crayones que tiene cada una para hallar el total inicial."
                },
                {
                    "pregunta": "¡El sistema bloquea tus 18 crayones en pantalla! Si en el camino se le rompen 4 crayones, ¿cuántos crayones útiles le quedan?",
                    "respuesta": "14",
                    "feedback_acierto": "¡Sensacional! A tus 18 crayones les restaste 4 rotos, quedando 14 útiles.",
                    "feedback_error": "Toma el total que calculamos en el paso anterior (18) y réstale los 4 que se rompieron."
                },
                {
                    "pregunta": "En un árbol hay 2 nidos y cada nido tiene 5 pajaritos (Total = 10). Si llegan 3 pájaros más, ¿cuántos hay en total?",
                    "respuesta": "13",
                    "feedback_acierto": "¡Excelente! Partiste de 10 pajaritos iniciales y sumaste 3 nuevos para llegar a 13.",
                    "feedback_error": "Primero calcula el total de pajaritos en los nidos (2 × 5 = 10) y luego súmale los 3 nuevos que llegaron."
                }
            ]
        },
        {
            "modulo_id": 4,
            "nivel_id": 2,
            "titulo": "Encadenamiento de Resultados",
            "texto_descubrimiento": "¡Fabuloso! Tu mente debe aprender a Encadenar las Ecuaciones de forma secuencial sin andamios. La respuesta que digites en la primera sub-pregunta se inyectará automáticamente como el valor de inicio de la segunda ecuación.",
            "diccionario": {
                "Eslabón 1": "Ecuación primaria que calcula la cantidad de partida.",
                "Eslabón 2": "Inyección del resultado anterior en la segunda ecuación del problema."
            },
            "advertencia": "Nuestro servidor congelará el dato correcto para el Paso 2 aunque falles el Paso 1, aislando el error para que aprendas sin frustrarte.",
            "ejemplos": [
                {
                    "enunciado": "Luisa cosecha 15 naranjas por la mañana y 5 por la tarde. Luego, vende la mitad.",
                    "pasos": [
                        {"orden": 1, "texto": "Total cosechado = 15 + 5 = 20 naranjas."},
                        {"orden": 2, "texto": "Vende la mitad de las 20 naranjas = 20 ÷ 2 = 10 naranjas restantes."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Sofía recolectó 12 manzanas rojas y 8 manzanas verdes. ¿Cuántas manzanas cosechó en total?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Exacto! 12 + 8 = 20 manzanas cosechadas.",
                    "feedback_error": "Realiza la suma directa de las manzanas rojas y verdes: 12 + 8."
                },
                {
                    "pregunta": "Usando las 20 manzanas calculadas: Si utiliza la mitad para hornear un pastel, ¿cuántas manzanas le quedan?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Correcto! 20 ÷ 2 = 10 manzanas restantes. ¡Rico pastel!",
                    "feedback_error": "Divide las 20 manzanas de la cosecha entre 2 para saber la mitad que le queda."
                },
                {
                    "pregunta": "Enzo compró 4 paquetes con 5 calcomanías cada uno (Total = 20). Si decide repartirlas entre sus 2 hermanos en partes iguales, ¿cuántas le tocan a cada uno?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Brillante encadenamiento! Primero calculaste el total de 20 calcomanías y luego lo dividiste entre 2 hermanos para dar 10 a cada uno.",
                    "feedback_error": "Calcula primero el total multiplicando 4 paquetes por 5 calcomanías. Ese resultado (20) divídelo en partes iguales entre 2."
                }
            ]
        },
        {
            "modulo_id": 4,
            "nivel_id": 3,
            "titulo": "Minimización de Error de Arrastre",
            "texto_descubrimiento": "Estás en la sala de control avanzado. Las historias contienen datos basura camuflados (distractores). Tu superpoder será la Auto-verificación activa: levantarás un escudo contra los datos inútiles y asegurarás el orden del tiempo de la historia.",
            "diccionario": {
                "Dato Basura": "Números u objetos descritos en el problema que no tienen relación con la pregunta matemática final (ej. colores, edades de personas no involucradas, objetos distintos).",
                "Reloj de la Historia": "Resolver las operaciones en el orden cronológico estricto en que ocurren los eventos."
            },
            "advertencia": "Sigue el reloj: primero quita lo que se gastó o perdió, y únicamente al resultado remanente aplícale el multiplicador final.",
            "ejemplos": [
                {
                    "enunciado": "Tomás tiene 10 estampas y 4 lápices de colores. Pierde 2 estampas. Su hermano luego le duplica las estampas que le quedan. ¿Cuántas estampas tiene ahora?",
                    "pasos": [
                        {"orden": 1, "texto": "Los '4 lápices de colores' no importan, la pregunta es sobre estampas."},
                        {"orden": 2, "texto": "Tenía 10 estampas y perdió 2 -> le quedan 10 - 2 = 8 estampas."},
                        {"orden": 3, "texto": "Su hermano le duplica lo que le quedaba -> 8 × 2 = 16 estampas."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "pregunta": "Valentina tenía 15 bombones en una caja. Se comió 5. También vio que había 3 sillas de madera. ¿Cuántos bombones le quedaron?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Excelente! Identificaste que las 3 sillas no tienen nada que ver con los bombones. 15 - 5 = 10.",
                    "feedback_error": "¡Cuidado con el distractor! Las '3 sillas de madera' no influyen en la cantidad de bombones. Solo resta los 5 bombones que se comió de los 15 iniciales."
                },
                {
                    "pregunta": "¡Perfecto! Nos quedan 10 bombones. Su abuela llegó y le duplicó (×2) exactamente la cantidad que le quedaba. ¿Con cuántos bombones cuenta ahora?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Brillante! Multiplicaste por 2 las 10 bombones restantes para obtener 20 bombones.",
                    "feedback_error": "Toma la cantidad limpia del paso anterior (10) y multiplícala por 2 (ya que su abuela se los duplicó)."
                },
                {
                    "pregunta": "Mateo tiene 2 cajas con 6 tazos cada una (Total = 12 tazos). Tiene también 5 camisas rojas. Si jugando pierde 3 tazos de su colección, ¿cuántos le quedan?",
                    "respuesta": "9",
                    "feedback_acierto": "¡Increíble! Ignoraste las camisas y resolviste: 12 tazos iniciales menos 3 tazos perdidos = 9 tazos.",
                    "feedback_error": "Las '5 camisas rojas' son datos basura. Calcula el total de tazos (2 × 6 = 12) y réstale los 3 que perdió."
                }
            ]
        }
    ]
    
    for nt in niveles_teoria:
        # Expandir ejemplos a exactamente 5 premium keyword-highlighted ejemplos
        nt["ejemplos"] = obtener_ejemplos_expandidos_fase2(nt["modulo_id"], nt["nivel_id"])
        # Validación de teoría con Pydantic para asegurar que tiene exactamente 3 interactivos
        NivelTeoriaSeederSchema(**nt)

        # Verificar si ya existe
        res = await session.execute(
            select(NivelTeoria).where(and_(
                NivelTeoria.fase_id == FASE2_ID,
                NivelTeoria.modulo_id == nt["modulo_id"],
                NivelTeoria.nivel_id == nt["nivel_id"]
            ))
        )
        existing = res.scalar_one_or_none()
        if not existing:
            rec = NivelTeoria(
                fase_id=FASE2_ID,
                modulo_id=nt["modulo_id"],
                nivel_id=nt["nivel_id"],
                titulo=nt["titulo"],
                texto_descubrimiento=nt["texto_descubrimiento"],
                diccionario=nt["diccionario"],
                advertencia=nt["advertencia"],
                ejemplos=nt["ejemplos"],
                interactivos=nt["interactivos"]
            )
            session.add(rec)
            print(f"  Creado NivelTeoria M{nt['modulo_id']} L{nt['nivel_id']}")
        else:
            # Actualizar
            existing.titulo = nt["titulo"]
            existing.texto_descubrimiento = nt["texto_descubrimiento"]
            existing.diccionario = nt["diccionario"]
            existing.advertencia = nt["advertencia"]
            existing.ejemplos = nt["ejemplos"]
            existing.interactivos = nt["interactivos"]
            print(f"  Actualizado NivelTeoria M{nt['modulo_id']} L{nt['nivel_id']}")

# ==============================================================================
# PART B: SEED CONFIGURACION PROGRESO (14 Practice + 12 Challenges)
# ==============================================================================
async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando ConfiguracionProgreso para Fase 2...")
    
    # 14 practice levels
    # M1: SUMA, M2: MULTIPLICACION, M3: MIXTA, M4: MIXTA
    configs = []
    
    # M1: levels 1, 2, 3
    for l in [1, 2, 3]:
        configs.append({
            "seccion": 1 * 100 + l,
            "operacion": OperacionEnum.SUMA,
            "cantidad_requerida": 15,
            "porcentaje_aprobacion": 80,
            "orden_desbloqueo": l,
            "usa_cronometro": False,
            "tiempo_default_segundos": 0,
            "tipo_feedback": "espejo"
        })
        
    # M2: levels 1, 2, 3, 4
    for l in [1, 2, 3, 4]:
        configs.append({
            "seccion": 2 * 100 + l,
            "operacion": OperacionEnum.MULTIPLICACION,
            "cantidad_requerida": 15,
            "porcentaje_aprobacion": 80,
            "orden_desbloqueo": l,
            "usa_cronometro": False,
            "tiempo_default_segundos": 0,
            "tipo_feedback": "espejo"
        })
        
    # M3: levels 1, 2, 3, 4
    for l in [1, 2, 3, 4]:
        configs.append({
            "seccion": 3 * 100 + l,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 15,
            "porcentaje_aprobacion": 80,
            "orden_desbloqueo": l,
            "usa_cronometro": False,
            "tiempo_default_segundos": 0,
            "tipo_feedback": "espejo"
        })
        
    # M4: levels 1, 2, 3
    for l in [1, 2, 3]:
        configs.append({
            "seccion": 4 * 100 + l,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 15,
            "porcentaje_aprobacion": 80,
            "orden_desbloqueo": l,
            "usa_cronometro": False,
            "tiempo_default_segundos": 0,
            "tipo_feedback": "detallado"
        })
        
    # 12 challenges: 3 per module (virtual levels 11, 12, 13)
    # D1 (nivel 11): 25 req, timer 25s, 90%
    # D2 (nivel 12): 25 req, timer 40s, 90%
    # DFinal (nivel 13): 10 req, timer 50s, 90%
    for m in [1, 2, 3, 4]:
        configs.append({
            "seccion": m * 1000 + 11,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 25,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 1,
            "usa_cronometro": True,
            "tiempo_default_segundos": 25,
            "tipo_feedback": "simple"
        })
        configs.append({
            "seccion": m * 1000 + 12,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 25,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 2,
            "usa_cronometro": True,
            "tiempo_default_segundos": 40,
            "tipo_feedback": "simple"
        })
        configs.append({
            "seccion": m * 1000 + 13,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 10,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 3,
            "usa_cronometro": True,
            "tiempo_default_segundos": 50,
            "tipo_feedback": "simple"
        })
        
    # --- CONFIGURACIÓN GLOBAL DE DESAFÍO MIXTO (MÓDULO 99) ---
    configs.append({
        "fase_id": FASE2_ID,
        "seccion": 99099,
        "operacion": OperacionEnum.MIXTA,
        "cantidad_requerida": 20,
        "porcentaje_aprobacion": 90,
        "orden_desbloqueo": 4,
        "usa_cronometro": True,
        "tiempo_default_segundos": 60,
        "tipo_feedback": "simple"
    })

    for c in configs:

        res = await session.execute(
            select(ConfiguracionProgreso).where(and_(
                ConfiguracionProgreso.fase_id == FASE2_ID,
                ConfiguracionProgreso.seccion == c["seccion"],
                ConfiguracionProgreso.operacion == c["operacion"]
            ))
        )
        existing = res.scalar_one_or_none()
        if not existing:
            config = ConfiguracionProgreso(
                fase_id=FASE2_ID,
                seccion=c["seccion"],
                operacion=c["operacion"],
                cantidad_requerida=c["cantidad_requerida"],
                porcentaje_aprobacion=c["porcentaje_aprobacion"],
                orden_desbloqueo=c["orden_desbloqueo"],
                usa_cronometro=c["usa_cronometro"],
                tiempo_default_segundos=c["tiempo_default_segundos"],
                tipo_feedback=c["tipo_feedback"]
            )
            session.add(config)
            print(f"  Creada config progreso para Sección {c['seccion']}")
        else:
            existing.cantidad_requerida = c["cantidad_requerida"]
            existing.porcentaje_aprobacion = c["porcentaje_aprobacion"]
            existing.orden_desbloqueo = c["orden_desbloqueo"]
            existing.usa_cronometro = c["usa_cronometro"]
            existing.tiempo_default_segundos = c["tiempo_default_segundos"]
            existing.tipo_feedback = c["tipo_feedback"]
            print(f"  Actualizada config progreso para Sección {c['seccion']}")

# Helper generators
def _gen_m1l1(rng, fam, es_espejo, var):
    op = rng.choice(["doble", "triple", "mitad", "cuádruple"])
    respuestas_erroneas = []
    
    if op == "mitad":
        base = rng.randint(4, 50) * 2
        ans = base // 2
        enunciado = f"Halla la mitad de {base}."
        expl = f"Para hallar la mitad, dividimos entre 2: {base} ÷ 2 = {ans}."
        
        err_val = base - 2
        err_feedback = "¡Cuidado! La mitad significa dividir entre 2 (partir en dos partes iguales), no restarle 2."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
    elif op == "doble":
        base = rng.randint(3, 50)
        ans = base * 2
        enunciado = f"Halla el doble de {base}."
        expl = f"Para hallar el doble, multiplicamos por 2: {base} × 2 = {ans}."
        
        err_val = base + 2
        err_feedback = "¡Cuidado con la trampa del apuro! El doble significa multiplicar por 2 (tomar esa cantidad dos veces), no sumarle 2."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
    elif op == "triple":
        base = rng.randint(3, 33)
        ans = base * 3
        enunciado = f"Halla el triple de {base}."
        expl = f"Para hallar el triple, multiplicamos por 3: {base} × 3 = {ans}."
        
        err_val = base + 3
        err_feedback = "¡Cuidado con la trampa del apuro! El triple significa multiplicar por 3 (tres veces el mismo número), no sumarle 3."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
    else:
        base = rng.randint(3, 25)
        ans = base * 4
        enunciado = f"Halla el cuádruple de {base}."
        expl = f"Para hallar el cuádruple, multiplicamos por 4: {base} × 4 = {ans}."
        
        err_val = base + 4
        err_feedback = "¡Cuidado con la trampa del apuro! El cuádruple significa multiplicar por 4 (cuatro veces el mismo número), no sumarle 4."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"base": base, "operacion": op, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "impulso": "¡Cuidado! Recuerda que no debes sumar el multiplicador, sino multiplicar el número base.",
            "calculo": "Revisa bien las tablas de multiplicar y dividir."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Resolución del Tutor",
            "pasos": [
                {"orden": 1, "texto": f"Identificamos la operación solicitada: {op}."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m1l2(rng, fam, es_espejo, var):
    patron = rng.choice(["a + b * c", "a * b + c", "a - b / c", "(a + b) * c"])
    respuestas_erroneas = []
    
    if patron == "a + b * c":
        a = rng.randint(2, 20)
        b = rng.randint(2, 9)
        c = rng.randint(2, 9)
        ans = a + b * c
        enunciado = f"Resuelve respetando la jerarquía: {a} + {b} × {c}"
        expl = f"Primero resolvemos la multiplicación por jerarquía: {b} × {c} = {b*c}. Luego sumamos: {a} + {b*c} = {ans}."
        
        linear_val = (a + b) * c
        if linear_val != ans:
            respuestas_erroneas.append({
                "valor": str(linear_val),
                "tipo_error": "impulso",
                "feedback": "¡Alto ahí! Le diste prioridad a la suma. Recuerda que la multiplicación y la división tienen escudo de oro y se resuelven antes."
            })
    elif patron == "a * b + c":
        a = rng.randint(2, 9)
        b = rng.randint(2, 9)
        c = rng.randint(2, 20)
        ans = a * b + c
        enunciado = f"Resuelve respetando la jerarquía: {a} × {b} + {c}"
        expl = f"Primero resolvemos la multiplicación: {a} × {b} = {a*b}. Luego sumamos: {a*b} + {c} = {ans}."
        
        parenthesis_val = a * (b + c)
        if parenthesis_val != ans:
            respuestas_erroneas.append({
                "valor": str(parenthesis_val),
                "tipo_error": "impulso",
                "feedback": "¡Alto ahí! Resolviste la suma antes que la multiplicación. Recuerda que la multiplicación tiene prioridad a menos que esté protegida por paréntesis."
            })
    elif patron == "a - b / c":
        c = rng.randint(2, 8)
        ans = rng.randint(2, 10)
        b = ans * c
        a = rng.randint(b + 2, b + 30)
        final_ans = a - ans
        enunciado = f"Resuelve respetando la jerarquía: {a} - {b} ÷ {c}"
        expl = f"Primero resolvemos la división: {b} ÷ {c} = {ans}. Luego restamos: {a} - {ans} = {final_ans}."
        ans = final_ans
        
        linear_val = (a - b) // c
        if linear_val != ans and linear_val > 0:
            respuestas_erroneas.append({
                "valor": str(linear_val),
                "tipo_error": "impulso",
                "feedback": "¡Alto ahí! Le diste prioridad a la resta. Recuerda que la multiplicación y la división se resuelven antes."
            })
    else: # (a + b) * c
        a = rng.randint(2, 10)
        b = rng.randint(2, 10)
        c = rng.randint(2, 5)
        ans = (a + b) * c
        enunciado = f"Resuelve: ({a} + {b}) × {c}"
        expl = f"Primero resolvemos el paréntesis protector: {a} + {b} = {a+b}. Luego multiplicamos: {a+b} × {c} = {ans}."
        
        ignore_val = a + b * c
        if ignore_val != ans:
            respuestas_erroneas.append({
                "valor": str(ignore_val),
                "tipo_error": "parentesis",
                "feedback": "¡El escudo mágico fue ignorado! Resuelve primero la operación que está protegida dentro del paréntesis ( )."
            })
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"patron": patron, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "impulso": "¡Jerarquía de operaciones! Primero se resuelven los paréntesis, luego multiplicaciones/divisiones, y al final sumas/restas."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Orden de Operaciones",
            "pasos": [
                {"orden": 1, "texto": "Identificamos las jerarquías operacionales."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m1l3(rng, fam, es_espejo, var):
    patron = rng.choice(["doble_suma", "triple_resta", "mitad_suma"])
    respuestas_erroneas = []
    
    if patron == "doble_suma":
        a = rng.randint(2, 15)
        b = rng.randint(2, 15)
        ans = 2 * (a + b)
        enunciado = f"¿Cuál es el doble de la suma de {a} y {b}?"
        expl = f"Primero sumamos {a} y {b}: {a} + {b} = {a+b}. Luego multiplicamos por 2 para el doble: 2 × {a+b} = {ans}."
        
        ignore_val = 2 * a + b
        if ignore_val != ans:
            respuestas_erroneas.append({
                "valor": str(ignore_val),
                "tipo_error": "parentesis",
                "feedback": "¡Cuidado con la traducción! Protege la suma con un paréntesis en tu mente antes de multiplicarla por 2."
            })
    elif patron == "triple_resta":
        b = rng.randint(2, 15)
        a = rng.randint(b + 2, b + 20)
        ans = 3 * (a - b)
        enunciado = f"¿Cuál es el triple de la diferencia entre {a} y {b}?"
        expl = f"La diferencia es la resta: {a} - {b} = {a-b}. El triple significa multiplicar por 3: 3 × {a-b} = {ans}."
        
        ignore_val = 3 * a - b
        if ignore_val != ans:
            respuestas_erroneas.append({
                "valor": str(ignore_val),
                "tipo_error": "parentesis",
                "feedback": "¡Cuidado con la traducción! Protege la diferencia con un paréntesis en tu mente antes de triplicarla."
            })
    else: # mitad_suma
        a = rng.randint(2, 20) * 2
        b = rng.randint(2, 20)
        ans = (a // 2) + b
        enunciado = f"A la mitad de {a} sumarle {b}."
        expl = f"Primero hallamos la mitad de {a}: {a} ÷ 2 = {a//2}. Luego le sumamos {b}: {a//2} + {b} = {ans}."
        
        ignore_val = a // (2 + b)
        if ignore_val != ans:
            respuestas_erroneas.append({
                "valor": str(ignore_val),
                "tipo_error": "calculo",
                "feedback": "Sigue el orden de la lectura. Primero calcula la mitad de A y al resultado súmale B."
            })
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"patron": patron, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "parentesis": "¡Cuidado con la traducción! Protege la suma o resta con un paréntesis en tu mente antes de multiplicarla."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Traducción Verbal",
            "pasos": [
                {"orden": 1, "texto": "Leemos despacio y convertimos palabras a símbolos lógicos."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m2l1(rng, fam, es_espejo, var):
    op = rng.choice(["suma", "resta"])
    a = rng.randint(2, 40)
    respuestas_erroneas = []
    
    if op == "suma":
        ans = rng.randint(2, 40)
        b = ans + a
        enunciado = f"Descubre el valor de X: X + {a} = {b}"
        expl = f"El {a} está sumando. La inversa es restar: X = {b} - {a} = {ans}."
        
        err_val = b + a
        respuestas_erroneas.append({
            "valor": str(err_val),
            "tipo_error": "inversa",
            "feedback": "¡La balanza se inclinó de más! Para descubrir el número original que sumaba, debes usar el camino de regreso haciendo una resta."
        })
    else:
        ans = rng.randint(2, 40)
        b = ans - a
        if b <= 0:
            b = rng.randint(2, 40)
            ans = b + a
        enunciado = f"Descubre el valor de X: X - {a} = {b}"
        expl = f"El {a} está restando. La inversa es sumar: X = {b} + {a} = {ans}."
        
        err_val = b - a
        if err_val > 0:
            respuestas_erroneas.append({
                "valor": str(err_val),
                "tipo_error": "inversa",
                "feedback": "¡La balanza se desequilibró! Como el número estaba restando, para regresar al valor original debes sumarlo."
            })
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"a": a, "b": b, "operacion": op, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "inversa": "Para despejar X, pasa el número al otro lado usando su operación contraria (resta si suma, suma si resta)."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Operación Inversa",
            "pasos": [
                {"orden": 1, "texto": f"Identificamos que {a} acompaña a X in una {op}."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m2l2(rng, fam, es_espejo, var):
    op = rng.choice(["mult", "div"])
    a = rng.randint(2, 10)
    ans = rng.randint(2, 12)
    respuestas_erroneas = []
    
    if op == "mult":
        b = a * ans
        enunciado = f"Resuelve para Y: {a} × Y = {b}"
        expl = f"El {a} está multiplicando. Pasamos dividiendo al otro lado del igual: Y = {b} ÷ {a} = {ans}."
        
        err_val = b * a
        respuestas_erroneas.append({
            "valor": str(err_val),
            "tipo_error": "inversa",
            "feedback": "¡Espejo equivocado! Si el número ya fue multiplicado para llegar a B, debes dividirlo para regresar al original."
        })
    else:
        b = ans
        total = a * b
        enunciado = f"Resuelve para Y: Y ÷ {a} = {b}"
        expl = f"El {a} está dividiendo. Pasamos multiplicando al otro lado del igual: Y = {b} × {a} = {total}."
        ans = total
        
        err_val = b // a
        if err_val > 0:
            respuestas_erroneas.append({
                "valor": str(err_val),
                "tipo_error": "inversa",
                "feedback": "¡Balanza desarmada! Como el número estaba dividido, para recuperarlo debes multiplicar."
            })
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"a": a, "b": b, "operacion": op, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "inversa": "La multiplicación se deshace con división. La división se deshace con multiplicación."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Multiplicación y División Inversa",
            "pasos": [
                {"orden": 1, "texto": "Aplicamos el espejo de operaciones."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m2l3(rng, fam, es_espejo, var):
    tipo = rng.choice(["a + [] = b", "[] * a = b", "a - [] = b", "[] / a = b"])
    respuestas_erroneas = []
    
    if tipo == "a + [] = b":
        a = rng.randint(3, 50)
        ans = rng.randint(3, 50)
        b = a + ans
        enunciado = f"Completa el espacio faltante: {a} + [ ] = {b}"
        expl = f"Buscamos qué sumar a {a} para obtener {b}. Restamos: {b} - {a} = {ans}."
        
        err_val = b + a
        respuestas_erroneas.append({
            "valor": str(err_val),
            "tipo_error": "balanza",
            "feedback": "¡La balanza se inclinó! Recuerda que para encontrar el sumando que falta debes restar."
        })
    elif tipo == "[] * a = b":
        a = rng.randint(2, 10)
        ans = rng.randint(2, 12)
        b = a * ans
        enunciado = f"Completa el espacio faltante: [ ] × {a} = {b}"
        expl = f"Buscamos qué número multiplicado por {a} da {b}. Dividimos: {b} ÷ {a} = {ans}."
        
        err_val = b * a
        respuestas_erroneas.append({
            "valor": str(err_val),
            "tipo_error": "balanza",
            "feedback": "Para encontrar el factor faltante, realiza la operación inversa: divide el total entre el factor conocido."
        })
    elif tipo == "a - [] = b":
        a = rng.randint(15, 60)
        ans = rng.randint(2, a - 2)
        b = a - ans
        enunciado = f"Completa el espacio faltante: {a} - [ ] = {b}"
        expl = f"A {a} le quitamos cierta cantidad para llegar a {b}. Calculamos la diferencia: {a} - {b} = {ans}."
        
        err_val = a + b
        respuestas_erroneas.append({
            "valor": str(err_val),
            "tipo_error": "balanza",
            "feedback": "¡Cuidado! Si sumas, obtendrás un número mayor. A ese número le tienes que quitar algo para llegar al resultado."
        })
    else: # [] / a = b
        a = rng.randint(2, 9)
        b = rng.randint(2, 10)
        ans = a * b
        enunciado = f"Completa el espacio faltante: [ ] ÷ {a} = {b}"
        expl = f"Un número dividido entre {a} da {b}. Multiplicamos para hallarlo: {b} × {a} = {ans}."
        
        err_val = b // a
        if err_val > 0:
            respuestas_erroneas.append({
                "valor": str(err_val),
                "tipo_error": "balanza",
                "feedback": "Para encontrar el número dividido, realiza la operación inversa: multiplica."
            })
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"tipo": tipo, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "balanza": "¡Piensa de forma intuitiva! El valor en la casilla vacía debe equilibrar la balanza en ambos lados."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Número Faltante",
            "pasos": [
                {"orden": 1, "texto": "Razonamos la relación entre los números dados."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m2l4(rng, fam, es_espejo, var):
    # Mix M2 levels 1-3 randomly
    selector = rng.randint(1, 3)
    if selector == 1:
        return _gen_m2l1(rng, fam, es_espejo, var)
    elif selector == 2:
        return _gen_m2l2(rng, fam, es_espejo, var)
    else:
        return _gen_m2l3(rng, fam, es_espejo, var)

def _gen_m3l1(rng, fam, es_espejo, var):
    n50 = rng.randint(1, 15)
    n25 = rng.randint(1, 15)
    total_cents = n50 * 50 + n25 * 25
    reais = total_cents / 100.0
    enunciado = f"¿Cuánto dinero tienes en total si juntas {n50} monedas de 0,50 y {n25} de 0,25?"
    
    # Asegurar formato exacto de respuesta string
    ans_str = f"{reais:.2f}".replace(".", ",")
    respuestas_erroneas = []
    
    # Error: escribir en centavos directos sin coma (ej: 150 en lugar de 1,50)
    respuestas_erroneas.append({
        "valor": str(total_cents),
        "tipo_error": "decimal",
        "feedback": "¡Cuidado con los centavos! Escribe tu respuesta en formato de dinero con coma (ej. 1,50), no en centavos sueltos."
    })
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": ans_str,
        "datos_numericos": {"n50": n50, "n25": n25, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "decimal": "Cuidado con los decimales. 0,50 + 0,50 es 1,00 real entero."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Conteo de Dinero",
            "pasos": [
                {"orden": 1, "texto": f"Multiplicamos monedas de 0,50: {n50} × 0,50 = {n50*0.50:.2f}."},
                {"orden": 2, "texto": f"Multiplicamos monedas de 0,25: {n25} × 0,25 = {n25*0.25:.2f}."},
                {"orden": 3, "texto": f"Sumamos todo para obtener el total: {reais:.2f} pesos."}
            ]
        }
    }

def _gen_m3l2(rng, fam, es_espejo, var):
    # Widen parameters to avoid duplicates (thousands of possible combinations)
    precio = rng.randint(1, 15) + rng.choice([0.25, 0.50, 0.75])
    pago = rng.choice([5.00, 10.00, 20.00, 50.00])
    while pago <= precio:
        pago += 10.00
    
    cambio = pago - precio
    ans_str = f"{cambio:.2f}".replace(".", ",")
    
    enunciado = f"Compro un dulce de {precio:.2f} pesos y pago con un billete de {pago:.2f} pesos. ¿Cuánto cambio recibo?"
    respuestas_erroneas = []
    
    # Vuelto mocho error común: restar centavos con centavos sin pedir prestado
    err_cents = int((pago - precio) * 100) + 10
    err_str = f"{err_cents/100:.2f}".replace(".", ",")
    respuestas_erroneas.append({
        "valor": err_str,
        "tipo_error": "vuelto",
        "feedback": "¡Cuenta incompleta! Recuerda restar centavos con centavos y pedir prestado 1 real (100 centavos) si es necesario."
    })
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": ans_str,
        "datos_numericos": {"precio": precio, "pago": pago, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "vuelto": "Recuerda restar centavos con centavos. 1 peso entero son 100 centavos."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Cálculo del Cambio",
            "pasos": [
                {"orden": 1, "texto": f"Escribimos la resta: {pago:.2f} - {precio:.2f}."},
                {"orden": 2, "texto": f"Restamos la parte entera y decimal para obtener el cambio final: {cambio:.2f} pesos."}
            ]
        }
    }

def _gen_m3l3(rng, fam, es_espejo, var):
    # Widen parameters to avoid duplicates (thousands of possible combinations)
    p1 = rng.randint(1, 10) + rng.choice([0.00, 0.25, 0.50, 0.75])
    p2 = rng.randint(1, 10) + rng.choice([0.00, 0.25, 0.50, 0.75])
    p3 = rng.randint(1, 10) + rng.choice([0.00, 0.25, 0.50, 0.75])
    
    total = p1 + p2 + p3
    ans_str = f"{total:.2f}".replace(".", ",")
    
    enunciado = f"En tu carrito llevas tres cosas: un chicle de {p1:.2f} pesos, un lápiz de {p2:.2f} pesos y un helado de {p3:.2f} pesos. ¿Cuánto es el total?"
    respuestas_erroneas = []
    
    # Error: sumar centavos y no llevarse 1 a la parte entera (ej: .75 + .25 = .100)
    err_str = f"{int(p1) + int(p2) + int(p3)},100"
    respuestas_erroneas.append({
        "valor": err_str,
        "tipo_error": "suma_decimal",
        "feedback": "¡Cuidado con los centavos! 75 centavos + 25 centavos forman 100 centavos, lo que equivale a un peso extra que debes añadir a los enteros."
    })
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": ans_str,
        "datos_numericos": {"p1": p1, "p2": p2, "p3": p3, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "suma_decimal": "Suma los centavos por un lado. Si superan 100 centavos, agrúpalos como 1 peso entero extra."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Suma del Carrito",
            "pasos": [
                {"orden": 1, "texto": f"Sumamos los tres productos: {p1:.2f} + {p2:.2f} + {p3:.2f}."},
                {"orden": 2, "texto": f"La suma da un total de {total:.2f} pesos."}
            ]
        }
    }

def _gen_m3l4(rng, fam, es_espejo, var):
    tipo = rng.choice(["alcanza", "falta"])
    costo = rng.randint(3, 20) + rng.choice([0.00, 0.25, 0.50, 0.75])
    respuestas_erroneas = []
    
    if tipo == "alcanza":
        presupuesto = costo + rng.randint(1, 15) + rng.choice([0.00, 0.25, 0.50, 0.75])
        ans_str = "1"
        enunciado = f"Tienes {presupuesto:.2f} pesos de presupuesto. Tu carrito de compras suma {costo:.2f} pesos. ¿Te alcanza el dinero? (Escribe 1 para SÍ, 2 para NO)"
        expl = f"Como el presupuesto ({presupuesto:.2f}) es mayor o igual al costo ({costo:.2f}), sí te alcanza (1)."
    else:
        presupuesto = costo - rng.randint(1, 4) - rng.choice([0.25, 0.50, 0.75])
        if presupuesto <= 0:
            presupuesto = 1.00
        falta = costo - presupuesto
        ans_str = f"{falta:.2f}".replace(".", ",")
        enunciado = f"Llevas {presupuesto:.2f} pesos en el bolsillo. Si tu carrito cuesta {costo:.2f} pesos, ¿cuánto dinero te hace falta para pagar?"
        expl = f"Restamos el costo menos el presupuesto: {costo:.2f} - {presupuesto:.2f} = {falta:.2f} pesos faltantes."
        
        # Error común: sumar en lugar de restar
        err_str = f"{(costo + presupuesto):.2f}".replace(".", ",")
        respuestas_erroneas.append({
            "valor": err_str,
            "tipo_error": "presupuesto",
            "feedback": "Para saber cuánto falta, resta el precio total menos tu presupuesto."
        })
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": ans_str,
        "datos_numericos": {"presupuesto": presupuesto, "costo": costo, "tipo": tipo, "es_espejo": es_espejo, "variante": var},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "presupuesto": "Compara detenidamente los valores decimales para ver si te sobra o te falta."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Presupuesto Inteligente",
            "pasos": [
                {"orden": 1, "texto": f"Comparamos la billetera ({presupuesto:.2f}) con el total de compra ({costo:.2f})."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m4l1(rng, fam, es_espejo, var):
    cajas = rng.randint(2, 6)
    crayones = rng.randint(4, 10)
    rotos = rng.randint(2, cajas * crayones - 3)
    p1_ans = cajas * crayones
    p2_ans = p1_ans - rotos
    
    enunciado = f"Lucas compra {cajas} cajas de crayones con {crayones} crayones cada una. Si en el camino se le rompen {rotos} crayones, ¿cuántos útiles le quedan?"
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(p2_ans),
        "datos_numericos": {
            "es_espejo": es_espejo,
            "variante": var,
            "pasos": [
                {"titulo": "Paso 1", "descripcion": f"¿Cuántos crayones compró Lucas en total en las {cajas} cajas?", "respuesta_correcta": str(p1_ans)},
                {"titulo": "Paso 2", "descripcion": "¿Cuántos crayones útiles le quedan en total?", "respuesta_correcta": str(p2_ans)}
            ]
        },
        "errores_previstos": {
            "respuestas_erroneas": [],
            "arrastre": "Resuelve paso a paso. Primero el total de crayones y luego resta los dañados."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Resolución Multi-Paso",
            "pasos": [
                {"orden": 1, "texto": f"Multiplicamos para hallar el total inicial: {cajas} × {crayones} = {p1_ans} crayones."},
                {"orden": 2, "texto": f"Restamos la pérdida de crayones rotos: {p1_ans} - {rotos} = {p2_ans} crayones."}
            ]
        }
    }

def _gen_m4l2(rng, fam, es_espejo, var):
    rojas = rng.randint(5, 20)
    verdes = rng.randint(5, 20)
    if (rojas + verdes) % 2 != 0:
        verdes += 1
    p1_ans = rojas + verdes
    p2_ans = p1_ans // 2
    
    enunciado = f"Sofía recolectó {rojas} manzanas rojas y {verdes} manzanas verdes en el jardín. Si utiliza exactamente la mitad para hornear un pastel, ¿cuántas manzanas le quedan?"
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(p2_ans),
        "datos_numericos": {
            "es_espejo": es_espejo,
            "variante": var,
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántas manzanas cosechó en total Sofía?", "respuesta_correcta": str(p1_ans)},
                {"titulo": "Paso 2", "descripcion": "¿Cuántas manzanas le quedan al final?", "respuesta_correcta": str(p2_ans)}
            ]
        },
        "errores_previstos": {
            "respuestas_erroneas": [],
            "secuencia": "Primero suma todas las manzanas recolectadas y luego divide ese total entre 2."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Encadenamiento Lógico",
            "pasos": [
                {"orden": 1, "texto": f"Sumamos la cosecha total: {rojas} + {verdes} = {p1_ans} manzanas."},
                {"orden": 2, "texto": f"Dividimos a la mitad: {p1_ans} ÷ 2 = {p2_ans} manzanas restantes."}
            ]
        }
    }

def _gen_m4l3(rng, fam, es_espejo, var):
    bombones = rng.randint(10, 25)
    sillas = rng.randint(2, 8) # distractor
    comidos = rng.randint(2, 6)
    p1_ans = bombones - comidos
    p2_ans = p1_ans * 2
    
    enunciado = f"Valentina tenía {bombones} bombones en una caja y también vio {sillas} sillas de madera. Si se comió {comidos} bombones, y luego su abuela le duplicó la cantidad restante, ¿con cuántos bombones cuenta ahora?"
    respuestas_erroneas = []
    
    # Error: operar incluyendo el distractor (sillas)
    err_ans = (bombones + sillas - comidos) * 2
    respuestas_erroneas.append({
        "valor": str(err_ans),
        "tipo_error": "distractor",
        "feedback": "¡Caíste en la trampa del distractor! Antes de operar, levanta tu escudo y separa solo los datos útiles para resolver la pregunta."
    })
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(p2_ans),
        "datos_numericos": {
            "es_espejo": es_espejo,
            "variante": var,
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántos bombones le quedaron después de comerse los primeros?", "respuesta_correcta": str(p1_ans)},
                {"titulo": "Paso 2", "descripcion": "¿Con cuántos bombones cuenta Valentina al final?", "respuesta_correcta": str(p2_ans)}
            ]
        },
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "distractor": "¡Escudo de datos basura activado! Ignora por completo las sillas de madera, solo importan los bombones."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Filtrado de Distractores",
            "pasos": [
                {"orden": 1, "texto": f"Las {sillas} sillas son un dato distractor. Restamos los bombones: {bombones} - {comidos} = {p1_ans} bombones."},
                {"orden": 2, "texto": f"Duplicamos los bombones restantes: {p1_ans} × 2 = {p2_ans}."}
            ]
        }
    }

_PRACTICE_GENERATORS = {
    (1, 1): _gen_m1l1, (1, 2): _gen_m1l2, (1, 3): _gen_m1l3,
    (2, 1): _gen_m2l1, (2, 2): _gen_m2l2, (2, 3): _gen_m2l3, (2, 4): _gen_m2l4,
    (3, 1): _gen_m3l1, (3, 2): _gen_m3l2, (3, 3): _gen_m3l3, (3, 4): _gen_m3l4,
    (4, 1): _gen_m4l1, (4, 2): _gen_m4l2, (4, 3): _gen_m4l3
}

async def seed_practica_pool(session: AsyncSession):
    print("Sembrando pool de práctica libre (120 familias por nivel)...")
    
    # 14 levels total
    levels_list = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3), (2, 4),
        (3, 1), (3, 2), (3, 3), (3, 4),
        (4, 1), (4, 2), (4, 3)
    ]
    
    batch_count = 0
    for mod, niv in levels_list:
        seccion = mod * 100 + niv
        
        # Check if already seeded to save time
        res = await session.execute(
            select(func.count(Pregunta.id)).where(and_(
                Pregunta.fase_id == FASE2_ID,
                Pregunta.seccion == seccion
            ))
        )
        count = res.scalar()
        if count >= 480: # 120 families * 4 questions = 480
            print(f"  Nivel M{mod} L{niv} ya cuenta con preguntas suficientes ({count}). Saltando.")
            continue
            
        print(f"  Generando 120 familias de preguntas para Módulo {mod} Nivel {niv}...")
        
        # Determine operacion
        if mod == 1:
            op_enum = OperacionEnum.SUMA
        elif mod == 2:
            op_enum = OperacionEnum.MULTIPLICACION
        else:
            op_enum = OperacionEnum.MIXTA
            
        # Determine tipo_pregunta
        if mod == 4:
            tipo_enum = TipoPreguntaEnum.CONSTRUCTOR_CHAINED
        else:
            tipo_enum = TipoPreguntaEnum.RESPUESTA_NUMERICA
            
        generator = _PRACTICE_GENERATORS[(mod, niv)]
        
        for fam in range(1, 121):
            padre_id = f"f2_m{mod}_l{niv}_fam_{fam:03d}"
            
            # 1 original (variante 0, es_espejo=False) + 3 mirrors (variantes 1,2,3, es_espejo=True)
            for var in range(4):
                es_espejo = (var > 0)
                seed = mod * 10000 + niv * 1000 + fam * 10 + var
                
                rng = random.Random(seed)
                q_data = generator(rng, fam, es_espejo, var)
                
                pregunta = Pregunta(
                    fase_id=FASE2_ID,
                    seccion=seccion,
                    estructura_padre_id=padre_id,
                    operacion=op_enum,
                    tipo_pregunta=tipo_enum,
                    enunciado=q_data["enunciado"],
                    respuesta_correcta=q_data["respuesta_correcta"],
                    datos_numericos=q_data["datos_numericos"],
                    explicacion_paso_a_paso=q_data["explicacion_paso_a_paso"],
                    errores_previstos=q_data["errores_previstos"],
                    estado=StatusEnum.ACTIVO
                )
                session.add(pregunta)
                batch_count += 1
                
                if batch_count >= 500:
                    await session.commit()
                    batch_count = 0
                    
        # Force commit at end of level
        if batch_count > 0:
            await session.commit()
            batch_count = 0
            
    print("  Pool de práctica libre sembrado correctamente.")

# ==============================================================================
# PART D: CHALLENGES POOL (150 D1, 150 D2, 100 DFinal per Module)
# ==============================================================================
def _gen_desafio_pregunta(rng, mod, lvl_id, sub_dif):
    """
    Generates a challenge question depending on the module and difficulty sub_dif.
    D1 (lvl 11): estandar
    D2 (lvl 12): avanzada
    DFinal (lvl 13): maestria
    """
    # Create harder variations of standard modules
    if mod == 1:
        # Gimnasio Numérico Mental
        if sub_dif == "estandar":
            # Direct double / triple / halves / order of operations
            a = rng.randint(5, 30)
            b = rng.randint(2, 9)
            c = rng.randint(2, 9)
            ans = a + b * c
            enunciado = f"Calcula mentalmente: {a} + {b} × {c}"
            expl = f"Multiplicación primero: {b} × {c} = {b*c}. Luego sumamos {a} + {b*c} = {ans}."
        elif sub_dif == "avanzada":
            # Parenthesis and negative/larger numbers
            a = rng.randint(10, 40)
            b = rng.randint(5, 15)
            c = rng.randint(3, 8)
            ans = (a - b) * c
            enunciado = f"Calcula con cuidado: ({a} - {b}) × {c}"
            expl = f"Paréntesis primero: {a} - {b} = {a-b}. Luego multiplicamos: {a-b} × {c} = {ans}."
        else: # maestria
            # Harder combinations
            a = rng.randint(5, 15)
            b = rng.randint(2, 6)
            c = rng.randint(10, 30)
            ans = a * b + c * 2
            enunciado = f"Evocación Mental Suprema: ¿Cuánto es {a} × {b} + {c} × 2?"
            expl = f"Ambas multiplicaciones primero: {a} × {b} = {a*b} y {c} × 2 = {c*2}. Luego sumamos: {a*b} + {c*2} = {ans}."
            
    elif mod == 2:
        # Tablas en Acción
        if sub_dif == "estandar":
            a = rng.randint(5, 25)
            ans = rng.randint(4, 25)
            b = a * ans
            enunciado = f"Halla la incógnita: Y × {a} = {b}"
            expl = f"Dividimos ambos lados entre {a}: Y = {b} ÷ {a} = {ans}."
        elif sub_dif == "avanzada":
            a = rng.randint(15, 100)
            b = rng.randint(120, 250)
            ans = b - a
            enunciado = f"Completa la casilla vacía: {a} + [ ] = {b}"
            expl = f"Restamos para despejar: {b} - {a} = {ans}."
        else: # maestria
            a = rng.randint(2, 8)
            b = rng.randint(3, 20)
            ans = rng.randint(2, 15)
            c = a * ans + b
            enunciado = f"Despeja la incógnita paso a paso: {a} × X + {b} = {c}"
            expl = f"Restamos primero: {a} × X = {c} - {b} = {a*ans}. Luego dividimos entre {a}: X = {ans}."
            
    elif mod == 3:
        # Tienda Matemática
        if sub_dif == "estandar":
            precio = 0.25 * rng.randint(4, 38)
            pago = rng.choice([10.00, 20.00, 50.00])
            while pago <= precio:
                pago = rng.choice([10.00, 20.00, 50.00])
            cambio = pago - precio
            enunciado = f"Pagas un artículo de {precio:.2f} pesos con un billete de {pago:.2f} pesos. ¿Cuánto cambio recibes?"
            ans = cambio
            expl = f"Restamos el precio al billete: {pago:.2f} - {precio:.2f} = {cambio:.2f} pesos."
        elif sub_dif == "avanzada":
            p1 = 0.25 * rng.randint(4, 20)
            p2 = 0.25 * rng.randint(4, 30)
            total = p1 + p2
            presupuesto = rng.choice([10.00, 20.00, 50.00])
            while presupuesto <= total:
                presupuesto = rng.choice([10.00, 20.00, 50.00])
            cambio = presupuesto - total
            enunciado = f"Llevas un billete de {presupuesto:.2f} pesos. Compras dos artículos que cuestan {p1:.2f} y {p2:.2f} pesos. ¿Cuánto cambio te queda?"
            ans = cambio
            expl = f"Sumamos costo de compra: {p1:.2f} + {p2:.2f} = {total:.2f} pesos. Restamos al billete: {presupuesto:.2f} - {total:.2f} = {cambio:.2f} pesos."
        else: # maestria
            p1 = 0.25 * rng.randint(2, 12)
            n = rng.randint(2, 6)
            total = p1 * n
            presupuesto = rng.choice([10.00, 20.00, 50.00])
            if presupuesto >= total:
                ans = presupuesto - total
                enunciado = f"Compras {n} pasteles de {p1:.2f} pesos cada uno. Pagas con un billete de {presupuesto:.2f} pesos. ¿Cuánto cambio te queda?"
                expl = f"Multiplicamos costo: {n} × {p1:.2f} = {total:.2f} pesos. Restamos al billete: {presupuesto:.2f} - {total:.2f} = {ans:.2f} pesos."
            else:
                ans = total - presupuesto
                enunciado = f"Quieres comprar {n} pasteles de {p1:.2f} pesos cada uno, pero solo tienes un billete de {presupuesto:.2f} pesos. ¿Cuánto te falta?"
                expl = f"Multiplicamos costo: {n} × {p1:.2f} = {total:.2f} pesos. Restamos el billete: {total:.2f} - {presupuesto:.2f} = {ans:.2f} pesos."

    else:
        # Constructor de Soluciones
        if sub_dif == "estandar":
            cajas = rng.randint(3, 12)
            lapices = rng.randint(6, 20)
            rotos = rng.randint(2, 25)
            ans = cajas * lapices - rotos
            enunciado = f"Un carpintero fabrica {cajas} cajas y mete {lapices} tornillos en cada una. Si gasta {rotos} tornillos sueltos en otro mueble, ¿cuántos le quedan en las cajas?"
            expl = f"Total en cajas = {cajas} × {lapices} = {cajas*lapices}. Restamos los usados: {cajas*lapices} - {rotos} = {ans}."
        elif sub_dif == "avanzada":
            rojas = rng.randint(10, 60)
            distractor = rng.randint(5, 30) # distractor
            perdidas = rng.randint(3, 15)
            ans = (rojas - perdidas) * 3
            enunciado = f"Enzo tiene {rojas} canicas rojas y {distractor} lápices amarillos. Jugando pierde {perdidas} canicas rojas. Luego, triplica las canicas rojas que le quedan. ¿Cuántas canicas tiene ahora?"
            expl = f"Ignoramos los {distractor} lápices (dato basura). Restamos canicas: {rojas} - {perdidas} = {rojas-perdidas}. Triplicamos: {rojas-perdidas} × 3 = {ans}."
        else: # maestria
            cajas = rng.randint(3, 12)
            libros = rng.randint(5, 25)
            tot_lib = cajas * libros
            cajones = rng.choice([2, 3, 4, 5, 6, 8])
            tot_lib_cajon = tot_lib // cajones
            if tot_lib % cajones != 0:
                tot_lib_cajon = tot_lib // 2
                cajones = 2
            ans = tot_lib_cajon
            enunciado = f"Un camión lleva {cajas} cajas con {libros} libros de regalo cada una. Reparten todos los libros por igual entre {cajones} bibliotecas escolares. ¿Cuántos libros recibe cada biblioteca?"
            expl = f"Total de libros = {cajas} × {libros} = {tot_lib}. Repartimos entre las {cajones} bibliotecas: {tot_lib} ÷ {cajones} = {ans}."

    # Return structured dict
    if isinstance(ans, float):
        ans_str = f"{ans:.2f}".replace(".", ",")
    else:
        ans_str = str(ans)
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": ans_str,
        "expl": expl
    }

async def seed_desafios_pool(session: AsyncSession):
    print("Sembrando pool de desafíos (D1=150, D2=150, DFinal=100 por módulo)...")
    
    batch_count = 0
    for mod in [1, 2, 3, 4]:
        # Desafío 1 (Virtual lvl 11, Standard Multiple Choice)
        # Desafío 2 (Virtual lvl 12, Advanced Multiple Choice)
        # Desafío Final (Virtual lvl 13, Mastery Input)
        
        challenges = [
            (11, 150, "estandar", "opcion_multiple"),
            (12, 150, "avanzada", "opcion_multiple"),
            (13, 100, "maestria", "input")
        ]
        
        for lvl_id, qty, sub_dif, interfaz in challenges:
            seccion = mod * 1000 + lvl_id
            
            # Check existing count
            res = await session.execute(
                select(func.count(Pregunta.id)).where(and_(
                    Pregunta.fase_id == FASE2_ID,
                    Pregunta.seccion == seccion
                ))
            )
            count = res.scalar()
            if count >= qty:
                print(f"  Desafío M{mod} L{lvl_id} ya cuenta con preguntas suficientes ({count}). Saltando.")
                continue
                
            print(f"  Generando {qty} preguntas del Desafío {lvl_id - 10} para Módulo {mod}...")
            
            # Operacion
            op_enum = OperacionEnum.MIXTA
            
            # Tipo pregunta
            if interfaz == "opcion_multiple":
                tipo_enum = TipoPreguntaEnum.MULTIPLE_OPCION
            else:
                tipo_enum = TipoPreguntaEnum.RESPUESTA_NUMERICA
                
            for q_idx in range(1, qty + 1):
                seed = mod * 50000 + lvl_id * 1000 + q_idx
                rng = random.Random(seed)
                
                q_data = _gen_desafio_pregunta(rng, mod, lvl_id, sub_dif)
                
                datos_num = {
                    "es_desafio": True,
                    "tipo_interfaz": interfaz,
                    "sub_dificultad": sub_dif
                }
                
                pregunta = Pregunta(
                    fase_id=FASE2_ID,
                    seccion=seccion,
                    operacion=op_enum,
                    tipo_pregunta=tipo_enum,
                    enunciado=q_data["enunciado"],
                    respuesta_correcta=q_data["respuesta_correcta"],
                    datos_numericos=datos_num,
                    explicacion_paso_a_paso={
                        "titulo": f"Resolución Desafío",
                        "pasos": [{"orden": 1, "texto": q_data["expl"]}]
                    },
                    estado=StatusEnum.ACTIVO
                )
                
                if interfaz == "opcion_multiple":
                    # Generate 3 distractors
                    corr_val = q_data["respuesta_correcta"]
                    
                    # Parse as int or float
                    is_float = "," in corr_val
                    if is_float:
                        val = float(corr_val.replace(",", "."))
                    else:
                        val = int(corr_val)
                        
                    distractors = set()
                    
                    # 1st distractor: value + random small offset
                    # 2nd distractor: value - random small offset (or positive alternative)
                    # 3rd distractor: value * 2 or similar common error
                    attempts = 0
                    while len(distractors) < 3 and attempts < 100:
                        attempts += 1
                        offset = rng.choice([1, 2, 3, 4, 5, 10])
                        if is_float:
                            d_val = val + rng.choice([-1.0, -0.5, 0.5, 1.0, -0.25, 0.25])
                            d_str = f"{abs(d_val):.2f}".replace(".", ",")
                        else:
                            d_val = val + rng.choice([-offset, offset])
                            d_str = str(abs(d_val))
                            
                        if d_str != corr_val and d_str not in distractors:
                            distractors.add(d_str)
                            
                    # If failed to generate 3 unique, pad them
                    while len(distractors) < 3:
                        if is_float:
                            val += 1.0
                            distractors.add(f"{val:.2f}".replace(".", ","))
                        else:
                            val += 5
                            distractors.add(str(val))
                            
                    # Shuffle and build Alternativas
                    options = [{"texto": corr_val, "es_correcta": True}]
                    for d in list(distractors):
                        options.append({"texto": d, "es_correcta": False})
                        
                    rng.shuffle(options)
                    
                    for idx, opt in enumerate(options):
                        alt = Alternativa(
                            texto=opt["texto"],
                            es_correcta=opt["es_correcta"],
                            orden=idx + 1,
                            tipo_error=TipoErrorEnum.CALCULO if not opt["es_correcta"] else None,
                            feedback_error="¡Cuidado con la trampa! Recuerda repasar las reglas de esta operación." if not opt["es_correcta"] else None
                        )
                        pregunta.alternativas.append(alt)
                        
                session.add(pregunta)
                batch_count += 1
                
                if batch_count >= 500:
                    await session.commit()
                    batch_count = 0
                    
        # Force commit at end of module
        if batch_count > 0:
            await session.commit()
            batch_count = 0
            
    print("  Pool de desafíos sembrado correctamente.")

# ==============================================================================
# PART E: ENTRY POINT run_fase2_seed()
# ==============================================================================
async def run_fase2_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 2 (Refactorizada)...")
    print("=" * 60)
    
    async with AsyncSessionLocal() as session:
        # 1. Asegurar existencia de Fase 2
        res = await session.execute(select(Fase).where(Fase.id == FASE2_ID))
        fase2 = res.scalar_one_or_none()
        if not fase2:
            print("  Fase 2 no existe. Creándola...")
            fase2 = Fase(
                id=FASE2_ID,
                nombre="Desarrollo Numérico y Razonamiento",
                descripcion="Cálculo mental, comprensión del sistema monetario y lectura de problemas.",
                orden=2,
                estado=StatusEnum.ACTIVO
            )
            session.add(fase2)
            await session.flush()
            
        # 1.5. Limpiar datos de Fase 2 para evitar duplicados e inactivos
        await clear_fase2_data(session)
            
        # 2. Seed theory and configs
        await seed_teoria_niveles(session)
        await seed_configuracion_progreso(session)
        await session.commit()
        
        # 3. Seed practice pools (120 families per level)
        await seed_practica_pool(session)
        
        # 4. Seed challenge pools
        await seed_desafios_pool(session)
        
        await session.commit()
        
    print("=" * 60)
    print("¡Datos semilla de Fase 2 (Refactorizada) completados con éxito!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase2_seed())

