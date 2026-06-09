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
            "texto_descubrimiento": "En matemáticas, no leemos las operaciones simplemente de izquierda a derecha como si fuera un texto común. Las ecuaciones requieren un orden universal para evitar confusiones, conocido como la jerarquía de las operaciones. La multiplicación y la división representan agrupaciones complejas, por lo que siempre deben resolverse antes que las sumas y las restas. Sin embargo, existe una herramienta superior: los paréntesis (). Cualquier cálculo, por simple que sea, que se encuentre dentro de un paréntesis tiene prioridad absoluta y debe resolverse primero.",
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
            "texto_descubrimiento": "Resolver un problema matemático en el mundo real comienza por traducir el lenguaje natural a un modelo simbólico. A esto lo llamamos modelado algebraico básico. Tu objetivo aquí es leer detenidamente una afirmación y extraer la estructura matemática que la define. Frases como 'la diferencia', 'el producto' o 'la suma de' te indican exactamente dónde colocar tus operaciones y tus paréntesis. Aprender a escribir el problema correctamente es el paso más importante antes de comenzar a calcular.",
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
            "texto_descubrimiento": "Una ecuación matemática funciona bajo el principio de equivalencia: es una balanza en perfecto equilibrio donde el signo igual (=) es el centro. Si desconocemos un valor inicial al que se le sumó o restó una cantidad, podemos deducirlo utilizando las operaciones inversas. La resta es la operación inversa de la suma, y viceversa. Si un valor se añadió a un lado de nuestra ecuación, para mantener el equilibrio y descubrir la incógnita, debemos aplicar la sustracción en el sentido contrario.",
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
            "texto_descubrimiento": "Así como la resta deshace la suma, la división es la herramienta analítica que revierte la multiplicación. Cuando un número ha sido multiplicado (escalado), no podemos encontrar el valor original simplemente restando. Debemos aplicar la reversibilidad multiplicativa. Si una incógnita fue multiplicada por un factor, debemos dividir el resultado final por ese mismo factor para despejar nuestra variable y volver al estado inicial.",
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
            "texto_descubrimiento": "Encontrar un valor faltante en el centro de una operación requiere que apliques la lógica deductiva para aislar la incógnita. En lugar de adivinar, debes reorganizar la información matemática. Si tienes un total y conoces una de las partes que lo conforman, el uso estructurado de las operaciones inversas te permitirá despejar exactamente el valor del espacio en blanco. Mantener la igualdad en ambos lados de la ecuación es tu principal herramienta de comprobación.",
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
            "texto_descubrimiento": "Al enfrentar ecuaciones compuestas, debes combinar todo lo aprendido resolviendo las operaciones de manera sistemática. Para despejar una incógnita en una ecuación estructurada (por ejemplo, encontrar el valor de X en la ecuación 2 × X + 3 = 11), debes deshacer las operaciones en el orden cronológico inverso. Primero se neutralizan las sumas y restas para simplificar la expresión, y finalmente se aplican las divisiones o multiplicaciones necesarias para aislar la variable por completo.",
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
            "texto_descubrimiento": "El sistema monetario es una aplicación práctica fundamental de los números racionales y el sistema decimal. Los valores ubicados a la derecha de la coma decimal representan fracciones de un entero (centavos). Sabiendo que 100 centavos equivalen exactamente a 1 unidad entera, podemos realizar agrupaciones fraccionarias. Comprender que 0,50 representa la mitad geométrica de un entero, o que 0,25 representa un cuarto, agilizará tu capacidad de análisis cuantitativo.",
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
            "texto_descubrimiento": "El cálculo del cambio en una transacción requiere precisión en la sustracción de números decimales. La regla fundamental es respetar el valor posicional: debes restar las unidades enteras con las unidades enteras, y las fracciones decimales con las fracciones decimales. Cuando la porción decimal del precio es mayor que la porción decimal del dinero entregado, es matemáticamente necesario reagrupar (o \"pedir prestado\") una unidad entera, convirtiéndola en 100 centésimas para poder ejecutar la sustracción correctamente.",
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
            "texto_descubrimiento": "Al consolidar múltiples valores financieros, aplicamos la adición con reagrupación decimal. El proceso es sistemático: sumamos las partes fraccionarias por un lado y las enteras por el otro. Si la suma de las fracciones alcanza o supera las 100 unidades (por ejemplo, al sumar 0,75 y 0,50), aplicamos una reagrupación base 10: convertimos esos 100 centavos en 1 unidad entera, la cual se transfiere inmediatamente al registro de los números enteros, dejando únicamente el residuo en la columna decimal.",
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
            "texto_descubrimiento": "La planificación financiera requiere el análisis de desigualdades matemáticas. Antes de efectuar un cálculo de vuelto, primero debes evaluar la viabilidad de la operación comparando dos magnitudes: el capital disponible frente al costo total. Si el costo es mayor que el capital, la transacción arroja un déficit (lo que te falta). In este caso, la sustracción del capital respecto al precio total te indicará exactamente la diferencia numérica necesaria para lograr el balance.",
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
            "texto_descubrimiento": "Los problemas matemáticos reales rara vez se resuelven con una sola operación directa; requieren un pensamiento algorítmico. Esto significa dividir una situación compleja en pasos lógicos secuenciales. No puedes calcular el estado final de un sistema sin haber resuelto primero su estado intermedio. Aprender a organizar tu proceso, resolviendo la primera incógnita y utilizando ese resultado verificado como punto de partida para la segunda operación, es la clave para la exactitud analítica.",
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
            "texto_descubrimiento": "En el modelado matemático, las operaciones suelen presentar una dependencia secuencial. Esto significa que el resultado obtenido en tu primera ecuación se convierte inmediatamente en el dato de entrada (input) para tu siguiente cálculo. Mantener la concentración en el traspaso de este valor es vital; un cálculo correcto en la primera etapa perderá todo su valor si no se encadena lógicamente con la premisa final del problema.",
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
            "texto_descubrimiento": "Uno de los mayores retos en la matemática aplicada es la capacidad de realizar un filtrado de datos. En un entorno real, estarás rodeado de información irrelevante (ruido analítico). Tu primer paso analítico siempre debe ser identificar y descartar los datos numéricos que no tienen relación directa con la variable que estás intentando despejar. Además, debes respetar estrictamente la cronología del problema, aplicando las operaciones secuencialmente tal cual dictan los eventos, para garantizar que tu modelo matemático sea preciso.",
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
    # Modules 1-2 keep standard times, Modules 3-4 get updated times
    for m in [1, 2]:
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

    for m in [3, 4]:
        configs.append({
            "seccion": m * 1000 + 11,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 25,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 1,
            "usa_cronometro": True,
            "tiempo_default_segundos": 30,
            "tipo_feedback": "simple"
        })
        configs.append({
            "seccion": m * 1000 + 12,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 25,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 2,
            "usa_cronometro": True,
            "tiempo_default_segundos": 45,
            "tipo_feedback": "simple"
        })
        configs.append({
            "seccion": m * 1000 + 13,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 10,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 3,
            "usa_cronometro": True,
            "tiempo_default_segundos": 60,
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
        "tiempo_default_segundos": 90,
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

# Nombres de personajes, objetos, recipientes y verbos para diversificar las preguntas
NOMBRES_POOL = [
    "Camila", "Mateo", "Valentina", "Enzo", "Isabella", "Thiago", "Sofía", "Lucas", "Clara", "Benjamín",
    "Gabriela", "Daniel", "Sara", "Gabriel", "Victoria", "Miguel", "Laura", "Rafael", "Helena", "Samuel"
]

ARTICULOS_TIENDA = [
    "dulce", "alfajor", "chocolate", "piruleta", "galleta", "chupetín", "dona", "muffin", "bombón", "goma de mascar"
]

UTILES_ESCOLARES = [
    "lápiz", "cuaderno", "goma", "regla", "sacapuntas", "marcador", "estuche", "pincel", "block de notas", "carpeta"
]

OBJETOS_RECREO = [
    "canica", "tazo", "figurita", "pelota de tenis", "coche de juguete", "spinner", "yo-yo", "llavero", "carta coleccionable"
]

INGREDIENTES_COMIDA = [
    "manzana", "pera", "naranja", "plátano", "frutilla", "limón", "panqué", "magdalena", "bombón", "galleta de avena"
]

RECIPIENTES = [
    "caja", "bolsa", "estuche", "frasco", "canasta", "cajón", "paquete", "sobre"
]

VERBOS_COMPRA = [
    "compra", "adquiere", "lleva", "pide"
]

VERBOS_PERDIDA = [
    "rompe", "pierde", "regala", "consume", "come", "gasta"
]

VERBOS_OBTENCION = [
    "recolecta", "cosecha", "junta", "encuentra", "recibe", "acumula"
]

def _genero_fem(palabra):
    # Returns True if the word is feminine, False if masculine
    fem_words = {
        "piruleta", "galleta", "dona", "goma de mascar",
        "goma", "regla", "carpeta",
        "canica", "figurita", "pelota de tenis", "carta coleccionable",
        "manzana", "pera", "naranja", "frutilla", "magdalena", "galleta de avena",
        "caja", "bolsa", "canasta"
    }
    return palabra in fem_words

def _plural(palabra):
    # Explicit mapping for exact spelling and grammatical correctness in Spanish
    mapping = {
        "dulce": "dulces",
        "alfajor": "alfajores",
        "chocolate": "chocolates",
        "piruleta": "piruletas",
        "galleta": "galletas",
        "chupetín": "chupetines",
        "dona": "donas",
        "muffin": "muffins",
        "bombón": "bombones",
        "goma de mascar": "gomas de mascar",
        
        "lápiz": "lápices",
        "cuaderno": "cuadernos",
        "goma": "gomas",
        "regla": "reglas",
        "sacapuntas": "sacapuntas",
        "marcador": "marcadores",
        "estuche": "estuches",
        "pincel": "pinceles",
        "block de notas": "blocks de notas",
        "carpeta": "carpetas",
        
        "canica": "canicas",
        "tazo": "tazos",
        "figurita": "figuritas",
        "pelota de tenis": "pelotas de tenis",
        "coche de juguete": "coches de juguete",
        "spinner": "spinners",
        "yo-yo": "yo-yos",
        "llavero": "llaveros",
        "carta coleccionable": "cartas coleccionables",
        
        "manzana": "manzanas",
        "pera": "peras",
        "naranja": "naranjas",
        "plátano": "plátanos",
        "frutilla": "frutillas",
        "limón": "limones",
        "panqué": "panqués",
        "magdalena": "magdalenas",
        "galleta de avena": "galletas de avena",
        
        "caja": "cajas",
        "bolsa": "bolsas",
        "frasco": "frascos",
        "canasta": "canastas",
        "cajón": "cajones",
        "paquete": "paquetes",
        "sobre": "sobres"
    }
    return mapping.get(palabra, palabra + "s") # Helper generators
def _get_random_context(rng):
    nombre = rng.choice(NOMBRES_POOL)
    
    # Pool of all items
    item_pool = ARTICULOS_TIENDA + UTILES_ESCOLARES + OBJETOS_RECREO + INGREDIENTES_COMIDA
    objeto = rng.choice(item_pool)
    plural = _plural(objeto)
    
    recipiente = rng.choice(RECIPIENTES)
    recipiente_pl = _plural(recipiente)
    
    v_compra = rng.choice(VERBOS_COMPRA)
    v_perdida = rng.choice(VERBOS_PERDIDA)
    v_obtencion = rng.choice(VERBOS_OBTENCION)
    
    art_obj = "una" if _genero_fem(objeto) else "un"
    art_rec = "una" if _genero_fem(recipiente) else "un"
    cuantos_obj = "cuántas" if _genero_fem(objeto) else "cuántos"
    rojo_color = "rojas" if _genero_fem(objeto) else "rojos"
    verde_color = "verdes"
    
    return {
        "nombre": nombre,
        "objeto": objeto,
        "plural": plural,
        "recipiente": recipiente,
        "recipiente_plural": recipiente_pl,
        "verbo_compra": v_compra,
        "verbo_perdida": v_perdida,
        "verbo_obtencion": v_obtencion,
        "art_obj": art_obj,
        "art_rec": art_rec,
        "cuantos_obj": cuantos_obj,
        "rojo_color": rojo_color,
        "verde_color": verde_color,
    }

def _gen_m1l1(rng, fam, es_espejo, var):
    op = rng.choice(["doble", "triple", "mitad", "cuádruple"])
    respuestas_erroneas = []
    ctx = _get_random_context(rng)
    use_story = rng.random() < 0.75
    
    if op == "mitad":
        base = rng.randint(4, 50) * 2
        ans = base // 2
        if use_story:
            templates = [
                f"{ctx['nombre']} tiene {base} {ctx['plural']}. Si {ctx['verbo_perdida']} la mitad a su hermano, ¿con {ctx['cuantos_obj']} {ctx['plural']} se queda?",
                f"En {ctx['art_rec']} {ctx['recipiente']} hay {base} {ctx['plural']}. Si usamos la mitad para una actividad, ¿{ctx['cuantos_obj']} {ctx['plural']} nos quedan?",
                f"{ctx['nombre']} {ctx['verbo_obtencion']} {base} {ctx['plural']} y su hermano tiene la mitad de esa cantidad. ¿{ctx['cuantos_obj']} {ctx['plural']} tiene su hermano?"
            ]
            enunciado = rng.choice(templates)
        else:
            enunciado = f"Halla la mitad de {base}."
        expl = f"Para hallar la mitad, dividimos entre 2: {base} ÷ 2 = {ans}."
        
        err_val = base - 2
        err_feedback = "¡Cuidado! La mitad significa dividir entre 2 (partir en dos partes iguales), no restarle 2."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
    elif op == "doble":
        base = rng.randint(3, 50)
        ans = base * 2
        if use_story:
            templates = [
                f"Si {ctx['art_rec']} {ctx['recipiente']} tiene {base} {ctx['plural']} y compramos otra idéntica para tener el doble, ¿{ctx['cuantos_obj']} {ctx['plural']} tendremos en total?",
                f"{ctx['nombre']} {ctx['verbo_obtencion']} {base} {ctx['plural']} y su prima tiene el doble. ¿{ctx['cuantos_obj']} {ctx['plural']} tiene su prima?",
                f"Ayer {ctx['nombre']} tenía {base} {ctx['plural']}, y hoy tiene el doble. ¿{ctx['cuantos_obj']} {ctx['plural']} tiene hoy?"
            ]
            enunciado = rng.choice(templates)
        else:
            enunciado = f"Halla el doble de {base}."
        expl = f"Para hallar el doble, multiplicamos por 2: {base} × 2 = {ans}."
        
        err_val = base + 2
        err_feedback = "¡Cuidado con la trampa del apuro! El doble significa multiplicar por 2 (tomar esa cantidad dos veces), no sumarle 2."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
    elif op == "triple":
        base = rng.randint(3, 33)
        ans = base * 3
        if use_story:
            templates = [
                f"Si en un estante hay {base} {ctx['plural']} y en el de arriba hay el triple, ¿{ctx['cuantos_obj']} {ctx['plural']} hay arriba?",
                f"{ctx['nombre']} tiene {base} {ctx['plural']} y su profesor tiene el triple. ¿{ctx['cuantos_obj']} {ctx['plural']} tiene su profesor?",
                f"El triple de {base} {ctx['plural']} equivale a..."
            ]
            enunciado = rng.choice(templates)
        else:
            enunciado = f"Halla el triple de {base}."
        expl = f"Para hallar el triple, multiplicamos por 3: {base} × 3 = {ans}."
        
        err_val = base + 3
        err_feedback = "¡Cuidado con la trampa del apuro! El triple significa multiplicar por 3 (tres veces el mismo número), no sumarle 3."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
    else:
        base = rng.randint(3, 25)
        ans = base * 4
        if use_story:
            templates = [
                f"En {ctx['art_rec']} {ctx['recipiente']} vienen {base} {ctx['plural']}. Si compramos 4 {ctx['recipiente_plural']} para tener el cuádruple, ¿{ctx['cuantos_obj']} {ctx['plural']} tendremos en total?",
                f"{ctx['nombre']} ahorró {base} {ctx['plural']} y Elena tiene el cuádruple. ¿{ctx['cuantos_obj']} {ctx['plural']} tiene Elena?",
                f"El cuádruple de {base} {ctx['plural']} es igual a..."
            ]
            enunciado = rng.choice(templates)
        else:
            enunciado = f"Halla el cuádruple de {base}."
        expl = f"Para hallar el cuádruple, multiplicamos por 4: {base} × 4 = {ans}."
        
        err_val = base + 4
        err_feedback = "¡Cuidado con la trampa del apuro! El cuádruple significa multiplicar por 4 (cuatro veces el mismo número), no sumarle 4."
        respuestas_erroneas.append({"valor": str(err_val), "tipo_error": "impulso", "feedback": err_feedback})
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "datos_numericos": {"base": base, "operacion": op, "es_espejo": es_espejo, "variante": var, "nombre": ctx["nombre"], "objeto": ctx["objeto"]},
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
    ctx = _get_random_context(rng)
    use_story = rng.random() < 0.75
    
    if patron == "a + b * c":
        a = rng.randint(2, 20)
        b = rng.randint(2, 9)
        c = rng.randint(2, 9)
        ans = a + b * c
        if use_story:
            enunciado = f"{ctx['nombre']} tiene {a} {ctx['plural']} sueltas. Si compra {b} {ctx['recipiente_plural']} que contienen {c} {ctx['plural']} cada uno, ¿{ctx['cuantos_obj']} {ctx['plural']} tiene en total?"
        else:
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
        if use_story:
            enunciado = f"En {ctx['art_rec']} estante hay {a} {ctx['recipiente_plural']} con {b} {ctx['plural']} cada uno. Si también hay {c} {ctx['plural']} sueltas en la mesa, ¿{ctx['cuantos_obj']} {ctx['plural']} hay en total?"
        else:
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
        if use_story:
            enunciado = f"{ctx['nombre']} tiene {a} pesos. Si compra un juguete que cuesta la división de {b} pesos entre {c} amigos (donde cada uno paga su parte justa), ¿con cuántos pesos se queda?"
        else:
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
        if use_story:
            enunciado = f"Si colocamos {a} {ctx['plural']} {ctx['rojo_color']} y {b} {ctx['verde_color']} en {ctx['art_rec']} {ctx['recipiente']}, y luego compramos {c} {ctx['recipiente_plural']} idénticos, ¿{ctx['cuantos_obj']} {ctx['plural']} tendremos en total?"
        else:
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
        "datos_numericos": {"patron": patron, "es_espejo": es_espejo, "variante": var, "nombre": ctx["nombre"], "objeto": ctx["objeto"]},
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
        templates = [
            f"¿Cuál es el doble de la suma de {a} y {b}?",
            f"Si sumamos {a} y {b}, y luego duplicamos el resultado, ¿cuánto obtenemos?",
            f"Multiplica por 2 la suma de {a} y {b}."
        ]
        enunciado = rng.choice(templates)
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
        templates = [
            f"¿Cuál es el triple de la diferencia entre {a} y {b}?",
            f"Halla la diferencia entre {a} y {b}, y luego calcula su triple.",
            f"Multiplica por 3 la diferencia de restarle {b} a {a}."
        ]
        enunciado = rng.choice(templates)
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
        templates = [
            f"A la mitad de {a} sumarle {b}.",
            f"Divide {a} a la mitad y al resultado agrégale {b}.",
            f"Suma {b} a la mitad de {a}."
        ]
        enunciado = rng.choice(templates)
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
    letra = rng.choice(['A', 'B', 'C', 'D', 'M', 'N', 'P', 'R', 'Y'])
    ctx = _get_random_context(rng)
    use_story = rng.random() < 0.75
    
    if op == "suma":
        ans = rng.randint(2, 40)
        b = ans + a
        if use_story:
            enunciado = f"{ctx['nombre']} tenía cierta cantidad de {ctx['plural']} ({letra}). Si su tío le regaló {a} más y ahora tiene {b}, ¿{ctx['cuantos_obj']} {ctx['plural']} {letra} tenía al inicio?"
        else:
            enunciado = f"Encontrar el valor de {letra} dado que {letra} + {a} = {b}"
        expl = f"El {a} está sumando. La inversa es restar: {letra} = {b} - {a} = {ans}."
        
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
        if use_story:
            enunciado = f"Un cofre tenía {letra} monedas de oro. Si un pirata retiró {a} monedas y quedaron {b}, ¿cuántas monedas {letra} había al principio?"
        else:
            enunciado = f"Encontrar el valor de {letra} dado que {letra} - {a} = {b}"
        expl = f"El {a} está restando. La inversa es sumar: {letra} = {b} + {a} = {ans}."
        
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
        "datos_numericos": {"a": a, "b": b, "operacion": op, "es_espejo": es_espejo, "variante": var, "letra": letra, "nombre": ctx["nombre"], "objeto": ctx["objeto"]},
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "inversa": f"Para despejar {letra}, pasa el número al otro lado usando su operación contraria (resta si suma, suma si resta)."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Operación Inversa",
            "pasos": [
                {"orden": 1, "texto": f"Identificamos que {a} acompaña a {letra} en una {op}."},
                {"orden": 2, "texto": expl}
            ]
        }
    }

def _gen_m2l2(rng, fam, es_espejo, var):
    op = rng.choice(["mult", "div"])
    a = rng.randint(2, 10)
    ans = rng.randint(2, 12)
    respuestas_erroneas = []
    letra = rng.choice(['A', 'B', 'C', 'D', 'M', 'N', 'P', 'R', 'X'])
    ctx = _get_random_context(rng)
    use_story = rng.random() < 0.75
    
    if op == "mult":
        b = a * ans
        if use_story:
            enunciado = f"{ctx['nombre']} compró {a} {ctx['recipiente_plural']} de {ctx['plural']} ({letra}) idénticos. Si en total tiene {b} {ctx['plural']}, ¿{ctx['cuantos_obj']} {ctx['plural']} {letra} hay en cada {ctx['recipiente']}?"
        else:
            enunciado = f"Encontrar el valor de {letra} dado que {a} × {letra} = {b}"
        expl = f"El {a} está multiplicando. Pasamos dividiendo al otro lado del igual: {letra} = {b} ÷ {a} = {ans}."
        
        err_val = b * a
        respuestas_erroneas.append({
            "valor": str(err_val),
            "tipo_error": "inversa",
            "feedback": "¡Espejo equivocado! Si el número ya fue multiplicado para llegar a B, debes dividirlo para regresar al original."
        })
    else:
        b = ans
        total = a * b
        if use_story:
            enunciado = f"Si repartimos un paquete de {ctx['plural']} ({letra}) entre {a} amigos en partes iguales y a cada uno le tocan {b}, ¿{ctx['cuantos_obj']} {ctx['plural']} {letra} había al inicio?"
        else:
            enunciado = f"Encontrar el valor de {letra} dado que {letra} ÷ {a} = {b}"
        expl = f"El {a} está dividiendo. Pasamos multiplicando al otro lado del igual: {letra} = {b} × {a} = {total}."
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
        "datos_numericos": {"a": a, "b": b, "operacion": op, "es_espejo": es_espejo, "variante": var, "letra": letra, "nombre": ctx["nombre"], "objeto": ctx["objeto"]},
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
    ctx = _get_random_context(rng)
    use_story = rng.random() < 0.75
    
    if tipo == "a + [] = b":
        a = rng.randint(3, 50)
        ans = rng.randint(3, 50)
        b = a + ans
        if use_story:
            enunciado = f"{ctx['nombre']} tiene {a} {ctx['plural']} y quiere juntar un total de {b}. ¿{ctx['cuantos_obj']} {ctx['plural']} [ ] le hace falta conseguir?"
        else:
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
        if use_story:
            enunciado = f"Queremos organizar {b} {ctx['plural']} colocando {a} unidades por {ctx['recipiente']}. ¿{ctx['cuantos_obj']} {ctx['recipiente_plural']} [ ] completas utilizaremos?"
        else:
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
        if use_story:
            enunciado = f"De un total de {a} {ctx['plural']} coleccionadas, {ctx['nombre']} regala algunas [ ] a sus amigos y le quedan {b}. ¿{ctx['cuantos_obj']} {ctx['plural']} [ ] regaló?"
        else:
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
        if use_story:
            enunciado = f"Se repartió una cantidad misteriosa de {ctx['plural']} [ ] entre {a} personas y cada una recibió {b}. ¿{ctx['cuantos_obj']} {ctx['plural']} [ ] se repartieron en total?"
        else:
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
        "datos_numericos": {"tipo": tipo, "es_espejo": es_espejo, "variante": var, "nombre": ctx["nombre"], "objeto": ctx["objeto"]},
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
    
    nombre = rng.choice(NOMBRES_POOL)
    sitio = rng.choice(["alcancía", "billetera", "bolsillo", "monedero"])
    juntar_verb = rng.choice(["junta", "tiene", "guarda", "acumula"])
    
    enunciado = f"{nombre} tiene en su {sitio} {n50} monedas de 0,50 y {n25} de 0,25. ¿Cuánto dinero {juntar_verb} en total?"
    
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
        "datos_numericos": {"n50": n50, "n25": n25, "es_espejo": es_espejo, "variante": var, "nombre": nombre, "sitio": sitio},
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
    
    nombre = rng.choice(NOMBRES_POOL)
    compra_verb = rng.choice(VERBOS_COMPRA)
    objeto = rng.choice(ARTICULOS_TIENDA)
    
    articulo = "una" if _genero_fem(objeto) else "un"
    enunciado = f"{nombre} {compra_verb} {articulo} {objeto} de {precio:.2f} pesos y paga con un billete de {pago:.2f} pesos. ¿Cuánto cambio recibe?"
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
        "datos_numericos": {"precio": precio, "pago": pago, "es_espejo": es_espejo, "variante": var, "nombre": nombre, "objeto": objeto},
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
    
    nombre = rng.choice(NOMBRES_POOL)
    pool = ARTICULOS_TIENDA + UTILES_ESCOLARES
    obj1, obj2, obj3 = rng.sample(pool, 3)
    
    art1 = "una" if _genero_fem(obj1) else "un"
    art2 = "una" if _genero_fem(obj2) else "un"
    art3 = "una" if _genero_fem(obj3) else "un"
    
    enunciado = f"{nombre} lleva en su carrito: {art1} {obj1} de {p1:.2f} pesos, {art2} {obj2} de {p2:.2f} pesos y {art3} {obj3} de {p3:.2f} pesos. ¿Cuánto es el total?"
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
        "datos_numericos": {"p1": p1, "p2": p2, "p3": p3, "es_espejo": es_espejo, "variante": var, "nombre": nombre, "obj1": obj1, "obj2": obj2, "obj3": obj3},
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
    
    nombre = rng.choice(NOMBRES_POOL)
    bolsillo = rng.choice(["monedero", "bolsillo", "billetera", "cartera"])
    
    if tipo == "alcanza":
        presupuesto = costo + rng.randint(1, 15) + rng.choice([0.00, 0.25, 0.50, 0.75])
        ans_str = "1"
        enunciado = f"{nombre} tiene {presupuesto:.2f} pesos en su {bolsillo}. Su carrito de compras suma {costo:.2f} pesos. ¿Le alcanza el dinero para pagar? (Escribe 1 para SÍ, 2 para NO)"
        expl = f"Como el presupuesto ({presupuesto:.2f}) es mayor o igual al costo ({costo:.2f}), sí le alcanza (1)."
    else:
        presupuesto = costo - rng.randint(1, 4) - rng.choice([0.25, 0.50, 0.75])
        if presupuesto <= 0:
            presupuesto = 1.00
        falta = costo - presupuesto
        ans_str = f"{falta:.2f}".replace(".", ",")
        enunciado = f"{nombre} lleva {presupuesto:.2f} pesos en su {bolsillo}. Si su carrito cuesta {costo:.2f} pesos, ¿cuánto dinero le hace falta para completar el pago?"
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
        "datos_numericos": {"presupuesto": presupuesto, "costo": costo, "tipo": tipo, "es_espejo": es_espejo, "variante": var, "nombre": nombre, "bolsillo": bolsillo},
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
    
    nombre = rng.choice(NOMBRES_POOL)
    compra_verb = rng.choice(VERBOS_COMPRA)
    contenedor = rng.choice(RECIPIENTES)
    util = rng.choice(UTILES_ESCOLARES)
    perdida_verb = rng.choice(["se le rompen", "pierde", "se le dañan", "extravía"])
    
    contenedor_pl = _plural(contenedor)
    util_pl = _plural(util)
    
    cada_uno_str = "cada una" if _genero_fem(util) else "cada uno"
    cuantos_str = "cuántas" if _genero_fem(util) else "cuántos"
    
    enunciado = f"{nombre} {compra_verb} {cajas} {contenedor_pl} de {util_pl} con {crayones} {util_pl} {cada_uno_str}. Si en el camino {perdida_verb} {rotos} {util_pl}, ¿{cuantos_str} {util_pl} útiles le quedan?"
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(p2_ans),
        "datos_numericos": {
            "es_espejo": es_espejo,
            "variante": var,
            "nombre": nombre,
            "util": util,
            "contenedor": contenedor,
            "pasos": [
                {"titulo": "Paso 1", "descripcion": f"¿{cuantos_str.capitalize()} {util_pl} compró {nombre} en total en los/las {cajas} {contenedor_pl}?", "respuesta_correcta": str(p1_ans)},
                {"titulo": "Paso 2", "descripcion": f"¿{cuantos_str.capitalize()} {util_pl} útiles le quedan en total?", "respuesta_correcta": str(p2_ans)}
            ]
        },
        "errores_previstos": {
            "respuestas_erroneas": [],
            "arrastre": f"Resuelve paso a paso. Primero calcula el total de {util_pl} y luego resta los dañados."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Resolución Multi-Paso",
            "pasos": [
                {"orden": 1, "texto": f"Multiplicamos para hallar el total inicial: {cajas} × {crayones} = {p1_ans} {util_pl}."},
                {"orden": 2, "texto": f"Restamos la pérdida de {util_pl} {perdida_verb}: {p1_ans} - {rotos} = {p2_ans} {util_pl}."}
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
    
    nombre = rng.choice(NOMBRES_POOL)
    recolecta_verb = rng.choice(VERBOS_OBTENCION)
    fruta = rng.choice(INGREDIENTES_COMIDA)
    
    fruta_pl = _plural(fruta)
    rojas_color = "rojas" if _genero_fem(fruta) else "rojos"
    verdes_color = "verdes"
    
    cuantas_str = "cuántas" if _genero_fem(fruta) else "cuántos"
    receta = rng.choice(["hornear un pastel", "hacer una ensalada", "preparar una mermelada", "hacer un postre"])
    
    enunciado = f"{nombre} {recolecta_verb} {rojas} {fruta_pl} {rojas_color} y {verdes} {fruta_pl} {verdes_color} en el jardín. Si utiliza exactamente la mitad para {receta}, ¿{cuantas_str} {fruta_pl} le quedan?"
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(p2_ans),
        "datos_numericos": {
            "es_espejo": es_espejo,
            "variante": var,
            "nombre": nombre,
            "fruta": fruta,
            "pasos": [
                {"titulo": "Paso 1", "descripcion": f"¿{cuantas_str.capitalize()} {fruta_pl} en total {recolecta_verb} {nombre}?", "respuesta_correcta": str(p1_ans)},
                {"titulo": "Paso 2", "descripcion": f"¿{cuantas_str.capitalize()} {fruta_pl} le quedan al final?", "respuesta_correcta": str(p2_ans)}
            ]
        },
        "errores_previstos": {
            "respuestas_erroneas": [],
            "secuencia": f"Primero suma todas las {fruta_pl} recolectadas y luego divide ese total entre 2."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Encadenamiento Lógico",
            "pasos": [
                {"orden": 1, "texto": f"Sumamos la cosecha total: {rojas} + {verdes} = {p1_ans} {fruta_pl}."},
                {"orden": 2, "texto": f"Dividimos a la mitad: {p1_ans} ÷ 2 = {p2_ans} {fruta_pl} restantes."}
            ]
        }
    }

def _gen_m4l3(rng, fam, es_espejo, var):
    bombones = rng.randint(10, 25)
    sillas = rng.randint(2, 8) # distractor
    comidos = rng.randint(2, 6)
    p1_ans = bombones - comidos
    p2_ans = p1_ans * 2
    
    nombre = rng.choice(NOMBRES_POOL)
    objeto_dulce = rng.choice(ARTICULOS_TIENDA)
    contenedor = rng.choice(RECIPIENTES)
    
    distractor_obj = rng.choice(["sillas de madera", "camisas rojas", "mesas de plástico", "libros viejos", "bicicletas azules"])
    tutor = rng.choice(["abuela", "tío", "hermano mayor", "profesor", "padre"])
    
    objeto_dulce_pl = _plural(objeto_dulce)
    consumo_verb = rng.choice(["comió", "perdió", "regaló", "gastó"])
    consumo_str = "se comió" if consumo_verb == "comió" else consumo_verb
    
    articulo_cont = "una" if _genero_fem(contenedor) else "un"
    cuantos_str = "cuántas" if _genero_fem(objeto_dulce) else "cuántos"
    
    enunciado = f"{nombre} tenía {bombones} {objeto_dulce_pl} en {articulo_cont} {contenedor} y también vio {sillas} {distractor_obj}. Si {consumo_str} {comidos} {objeto_dulce_pl}, y luego su {tutor} le duplica la cantidad restante, ¿con {cuantos_str} {objeto_dulce_pl} cuenta ahora?"
    respuestas_erroneas = []
    
    # Error: operar incluyendo el distractor (sillas)
    err_ans = (bombones + sillas - comidos) * 2
    respuestas_erroneas.append({
        "valor": str(err_ans),
        "tipo_error": "distractor",
        "feedback": "¡Caíste en la trampa del distractor! Antes de operar, levanta tu escudo y separa solo los datos útiles para resolver la pregunta."
    })
    
    art_los_las = "las" if _genero_fem(objeto_dulce) else "los"
    art_dist = "las" if distractor_obj in ["sillas de madera", "camisas rojas", "mesas de plástico", "bicicletas azules"] else "los"
    art_primeros = "las primeras" if _genero_fem(objeto_dulce) else "los primeros"
    
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(p2_ans),
        "datos_numericos": {
            "es_espejo": es_espejo,
            "variante": var,
            "nombre": nombre,
            "objeto_dulce": objeto_dulce,
            "pasos": [
                {"titulo": "Paso 1", "descripcion": f"¿{cuantos_str.capitalize()} {objeto_dulce_pl} le quedaron después de que {consumo_str} {art_primeros}?", "respuesta_correcta": str(p1_ans)},
                {"titulo": "Paso 2", "descripcion": f"¿Con {cuantos_str} {objeto_dulce_pl} cuenta {nombre} al final?", "respuesta_correcta": str(p2_ans)}
            ]
        },
        "errores_previstos": {
            "respuestas_erroneas": respuestas_erroneas,
            "distractor": f"¡Escudo de datos basura activado! Ignora por completo {art_dist} {distractor_obj}, solo importan {art_los_las} {objeto_dulce_pl}."
        },
        "explicacion_paso_a_paso": {
            "titulo": "Filtrado de Distractores",
            "pasos": [
                {"orden": 1, "texto": f"{art_dist.capitalize()} {sillas} {distractor_obj} son un dato distractor. Restamos {art_los_las} {objeto_dulce_pl}: {bombones} - {comidos} = {p1_ans} {objeto_dulce_pl}."},
                {"orden": 2, "texto": f"Duplicamos {art_los_las} {objeto_dulce_pl} restantes: {p1_ans} × 2 = {p2_ans}."}
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
        if sub_dif == "estandar":
            a, ans = rng.randint(5, 25), rng.randint(4, 25)
            b = a * ans
            enunciado = f"Halla la incógnita: Y × {a} = {b}"
            expl = f"Dividimos: Y = {b} ÷ {a} = {ans}."
        elif sub_dif == "avanzada":
            a, b = rng.randint(15, 100), rng.randint(120, 250)
            ans = b - a
            enunciado = f"Completa la casilla vacía: {a} + [ ] = {b}"
            expl = f"Restamos para despejar: {b} - {a} = {ans}."
        else:
            a, b, ans = rng.randint(2, 8), rng.randint(3, 20), rng.randint(2, 15)
            c = a * ans + b
            enunciado = f"Despeja la incógnita paso a paso: {a} × X + {b} = {c}"
            expl = f"Restamos primero: {c} - {b} = {a*ans}. Luego dividimos entre {a}: X = {ans}."
            
    elif mod == 3:
        nombre = rng.choice(NOMBRES_POOL)
        objeto_tienda = rng.choice(ARTICULOS_TIENDA)
        compra_verb = rng.choice(VERBOS_COMPRA)
        
        if sub_dif == "estandar":
            precio = 0.25 * rng.randint(4, 20)
            pago = rng.choice([5.00, 10.00, 20.00])
            while pago <= precio: pago += 10.00
            cambio = pago - precio
            articulo = "una" if _genero_fem(objeto_tienda) else "un"
            enunciado = f"{nombre} {compra_verb} {articulo} {objeto_tienda} de {precio:.2f} pesos y paga con un billete de {pago:.2f} pesos. ¿Cuánto cambio le queda?"
            ans = cambio
            expl = f"Resta directa: {pago:.2f} - {precio:.2f} = {cambio:.2f} pesos."
        elif sub_dif == "avanzada":
            p1, p2 = 0.25 * rng.randint(4, 20), 0.25 * rng.randint(4, 30)
            total = p1 + p2
            presupuesto = rng.choice([10.00, 20.00, 50.00])
            while presupuesto <= total: presupuesto = rng.choice([10.00, 20.00, 50.00])
            cambio = presupuesto - total
            obj1, obj2 = rng.sample(ARTICULOS_TIENDA + UTILES_ESCOLARES, 2)
            bolsillo = rng.choice(["billetera", "cartera", "bolsillo"])
            articulo1 = "una" if _genero_fem(obj1) else "un"
            articulo2 = "una" if _genero_fem(obj2) else "un"
            enunciado = f"{nombre} lleva un billete de {presupuesto:.2f} pesos en su {bolsillo}. {compra_verb.capitalize()} dos artículos: {articulo1} {obj1} de {p1:.2f} pesos y {articulo2} {obj2} de {p2:.2f} pesos. ¿Cuánto cambio le queda?"
            ans = cambio
            expl = f"Sumamos costo: {p1:.2f} + {p2:.2f} = {total:.2f} pesos. Restamos al billete: {presupuesto:.2f} - {total:.2f} = {cambio:.2f} pesos."
        else:
            p1 = 0.25 * rng.randint(2, 12)
            n = rng.randint(2, 6)
            total = p1 * n
            presupuesto = rng.choice([10.00, 20.00, 50.00])
            postre = rng.choice(INGREDIENTES_COMIDA)
            postre_pl = _plural(postre)
            cada_uno_str = "cada una" if _genero_fem(postre) else "cada uno"
            if presupuesto >= total:
                ans = presupuesto - total
                enunciado = f"{nombre} {compra_verb} {n} {postre_pl} de {p1:.2f} pesos {cada_uno_str}. Paga con un billete de {presupuesto:.2f} pesos. ¿Cuánto cambio le queda?"
                expl = f"Multiplicamos costo: {n} × {p1:.2f} = {total:.2f} pesos. Restamos al billete: {presupuesto:.2f} - {total:.2f} = {ans:.2f} pesos."
            else:
                ans = total - presupuesto
                enunciado = f"{nombre} quiere comprar {n} {postre_pl} de {p1:.2f} pesos {cada_uno_str}, pero solo tiene un billete de {presupuesto:.2f} pesos. ¿Cuánto le falta?"
                expl = f"Multiplicamos costo: {n} × {p1:.2f} = {total:.2f} pesos. Restamos el billete: {total:.2f} - {presupuesto:.2f} = {ans:.2f} pesos."

    else:
        nombre = rng.choice(NOMBRES_POOL)
        util = rng.choice(UTILES_ESCOLARES)
        util_pl = _plural(util)
        contenedor = rng.choice(RECIPIENTES)
        contenedor_pl = _plural(contenedor)
        
        if sub_dif == "estandar":
            cajas, lapices, rotos = rng.randint(3, 12), rng.randint(6, 20), rng.randint(2, 25)
            ans = cajas * lapices - rotos
            fabricante = rng.choice(["carpintero", "artesano", "ayudante", "estudiante"])
            insumo = rng.choice(["tornillos", "clavos", "remaches", "piezas de madera"])
            fabricar_verb = rng.choice(["fabrica", "arma", "construye"])
            cada_uno_insumo = "cada una" if insumo == "piezas de madera" else "cada uno"
            cuantos_insumo = "cuántas" if insumo == "piezas de madera" else "cuántos"
            enunciado = f"Un {fabricante} {fabricar_verb} {cajas} {contenedor_pl} y mete {lapices} {insumo} en {cada_uno_insumo}. Si gasta {rotos} {insumo} sueltos en otro mueble, ¿{cuantos_insumo} le quedan en los {contenedor_pl}?"
            expl = f"Total = {cajas} × {lapices} = {cajas*lapices}. Restamos los usados: {cajas*lapices} - {rotos} = {ans}."
        elif sub_dif == "avanzada":
            rojas, distractor, perdidas = rng.randint(10, 60), rng.randint(5, 30), rng.randint(3, 15)
            ans = (rojas - perdidas) * 3
            item_obj = rng.choice(OBJETOS_RECREO)
            item_obj_pl = _plural(item_obj)
            rojos_color = "rojas" if _genero_fem(item_obj) else "rojos"
            dist_obj = rng.choice(["lápices amarillos", "hojas secas", "cuadernos viejos", "camisas de colores"])
            pierde_verb = rng.choice(VERBOS_PERDIDA)
            art_los_las = "las" if _genero_fem(item_obj) else "los"
            cuantos_item_str = "cuántas" if _genero_fem(item_obj) else "cuántos"
            art_dist = "las" if dist_obj in ["hojas secas", "camisas de colores"] else "los"
            enunciado = f"{nombre} tiene {rojas} {item_obj_pl} {rojos_color} y {distractor} {dist_obj}. Jugando {pierde_verb} {perdidas} {item_obj_pl} {rojos_color}. Luego, triplica {art_los_las} {item_obj_pl} que le quedan. ¿{cuantos_item_str} tiene ahora?"
            expl = f"Ignoramos {art_dist} {distractor} {dist_obj}. Restamos: {rojas} - {perdidas} = {rojas-perdidas}. Triplicamos: {rojas-perdidas} × 3 = {ans}."
        else:
            cajas, libros = rng.randint(3, 12), rng.randint(5, 25)
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

    # Seed Desafío Mixto (99099) for Fase 2 to avoid sufficiency warnings
    # It requires 20 questions, but we will seed 150 for robustness
    print("  Generando 150 preguntas del Desafío Mixto (99099) para Fase 2...")
    for q_idx in range(1, 151):
        rng = random.Random(99099 * 1000 + q_idx)
        # Select random module (1 to 4) and level (13) to generate questions
        rnd_mod = rng.choice([1, 2, 3, 4])
        q_data = _gen_desafio_pregunta(rng, rnd_mod, 13, "maestria")
        
        pregunta = Pregunta(
            fase_id=FASE2_ID,
            seccion=99099,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado=q_data["enunciado"],
            respuesta_correcta=q_data["respuesta_correcta"],
            datos_numericos={
                "es_desafio": True,
                "tipo_interfaz": "input",
                "sub_dificultad": "maestria"
            },
            explicacion_paso_a_paso={
                "titulo": "Resolución Desafío Mixto",
                "pasos": [{"orden": 1, "texto": q_data["expl"]}]
            },
            estado=StatusEnum.ACTIVO
        )
        session.add(pregunta)
    await session.commit()
    print("  Pool de Desafío Mixto (99099) sembrado correctamente.")
            
    print("  Pool de desafíos sembrado correctamente.")

# ==============================================================================
# PART E: ENTRY POINT run_fase2_seed()
# ==============================================================================
async def run_fase2_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 2 (Refactorizada)...")
    print("=" * 60)
    
    from app.seed import should_seed_phase, update_seed_version, SEED_VERSIONS
    
    async with AsyncSessionLocal() as session:
        # Check if we should seed
        if not await should_seed_phase(session, "fase_2", FASE2_ID):
            print("=" * 60)
            print("¡Datos semilla de Fase 2 omitidos (ya está actualizada)!")
            print("=" * 60)
            return

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
        
        # Update version in registry
        await update_seed_version(session, "fase_2", SEED_VERSIONS["fase_2"])
        await session.commit()
        
    print("=" * 60)
    print("¡Datos semilla de Fase 2 (Refactorizada) completados con éxito!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase2_seed())

