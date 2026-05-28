import asyncio
import math
import sys
import random
import json
import traceback
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

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
    IntentoPregunta,
    PoolAsignadoAlumno,
)
from app.fase2.models import NivelTeoria
from app.fase3.theory_examples import obtener_ejemplos_expandidos_fase3

# ID de la Fase 3 en la base de datos
FASE3_ID = 3


# Schema de Validación de Teoría para garantizar exactamente 3 interactivos obligatorios
class NivelTeoriaSeederSchema(BaseModel):
    modulo_id: int
    nivel_id: int
    titulo: str
    texto_descubrimiento: str
    diccionario: Dict[str, str]
    advertencia: str
    ejemplos: List[Dict[str, Any]]
    interactivos: List[Dict[str, Any]] = Field(..., min_items=3, max_items=3)


async def clear_fase3_data(session: AsyncSession):
    print("Purging existing Fase 3 data for quick iteration (Overwrite)...")
    
    # Get all question IDs for Phase 3
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE3_ID))
    pregunta_ids_list = result.scalars().all()
    
    if pregunta_ids_list:
        # Delete references to prevent ForeignKeyViolationError
        await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(IntentoPregunta).where(IntentoPregunta.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(Intento).where(Intento.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(pregunta_ids_list)))
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE3_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE3_ID))
    
    # Delete main questions
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE3_ID))
    
    # Delete progress config and theory
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE3_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE3_ID))
    
    await session.commit()
    print("Fase 3 data purged.")


async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando NivelTeoria para Fase 3...")
    
    niveles_teoria = [
        # --- MÓDULO 1: El Detective Literario ---
        {
            "modulo_id": 1,
            "nivel_id": 1,
            "titulo": "Aislamiento de Variables Críticas",
            "texto_descubrimiento": "¡Bienvenido, Detective! Tu primer superpoder es el Resaltador Lógico. En problemas extensos, el monstruo del desorden mezclará bicicletas con manzanas. Tu misión es leer primero la pregunta final e ignorar todo lo que no se relacione con ella. Si te preguntan por manzanas, las bicicletas no importan en absoluto. Enfócate solo en lo operable.",
            "diccionario": {
                "Ignorar": "Pasar por alto los objetos que no aparecen en la pregunta.",
                "Variable Crítica": "El objeto principal por el que te están preguntando."
            },
            "advertencia": "No dejes que los números te engañen. El hecho de que haya un número en el texto no significa que debas usarlo. Resalta solo lo que responde a la pregunta.",
            "ejemplos": [
                {
                    "enunciado": "Lucas tiene 5 manzanas rojas y 3 bicicletas azules. Regala 2 manzanas. ¿Cuántas manzanas le quedan?",
                    "pasos": [
                        {"orden": 1, "texto": "La pregunta es sobre manzanas. Ignoramos las 3 bicicletas azules por completo."},
                        {"orden": 2, "texto": "Operamos con las manzanas: 5 - 2 = 3 manzanas."}
                    ]
                },
                {
                    "enunciado": "Sofía compró 4 libros y 2 lápices. Perdió 1 libro en el camino. ¿Cuántos libros le quedan?",
                    "pasos": [
                        {"orden": 1, "texto": "La pregunta es sobre libros. Ignoramos los 2 lápices."},
                        {"orden": 2, "texto": "Operamos con los libros: 4 - 1 = 3 libros."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "María tiene 10 globos y 3 gatos. Se le revientan 4 globos. ¿Cuántos globos le quedan?",
                    "respuesta": "6",
                    "feedback_acierto": "¡Excelente! Los gatos eran un distractor y los ignoraste correctamente. 10 - 4 = 6.",
                    "feedback_error": "Recuerda que te preguntan por globos, ignora la cantidad de gatos."
                },
                {
                    "enunciado": "En un garaje hay 8 autos y 5 bicicletas. Salen 3 autos. ¿Cuántos autos quedan?",
                    "respuesta": "5",
                    "feedback_acierto": "¡Perfecto! Las bicicletas no importan para calcular los autos. 8 - 3 = 5.",
                    "feedback_error": "Ignora las bicicletas. Resta los autos que salieron de los autos iniciales."
                },
                {
                    "enunciado": "Lucas tiene 15 figuritas y 4 pelotas. Le regala 5 figuritas a su hermano. ¿Cuántas figuritas tiene ahora?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Estupendo! 15 - 5 = 10 figuritas.",
                    "feedback_error": "Enfócate en las figuritas y resta las que regaló."
                }
            ]
        },
        {
            "modulo_id": 1,
            "nivel_id": 2,
            "titulo": "Datos Útiles vs. Datos Basura",
            "texto_descubrimiento": "Historias más largas con distractores numéricos engañosos que obligan a usar el Escudo Anti-Basura. Fechas, edades o números telefónicos son arrojados para confundirte. ¡Filtra la basura numérica!",
            "diccionario": {
                "Dato Útil": "Información numérica necesaria para resolver la operación.",
                "Dato Basura": "Números descriptivos irrelevantes (ej. años del personaje, la hora, el número de autobús)."
            },
            "advertencia": "El monstruo pondrá números grandes como fechas (año 2026) o edades (10 años). Ignora esos números, no forman parte de las cantidades operables del problema.",
            "ejemplos": [
                {
                    "enunciado": "Lucas tiene 12 años. Tomó el autobús número 5 a las 3:00 PM y compró 8 dulces. Si se comió 3 dulces, ¿cuántos le quedan?",
                    "pasos": [
                        {"orden": 1, "texto": "Identificamos datos basura: 12 años, autobús 5, hora 3:00 PM."},
                        {"orden": 2, "texto": "Identificamos datos útiles: 8 dulces iniciales, 3 dulces consumidos."},
                        {"orden": 3, "texto": "Operamos: 8 - 3 = 5 dulces."}
                    ]
                },
                {
                    "enunciado": "En el año 2024, Juan de 9 años tenía 15 tazos. Perdió 4 tazos. ¿Cuántos tazos le quedan?",
                    "pasos": [
                        {"orden": 1, "texto": "Basura: año 2024, edad 9 años."},
                        {"orden": 2, "texto": "Útiles: 15 tazos iniciales, 4 perdidos."},
                        {"orden": 3, "texto": "Operamos: 15 - 4 = 11 tazos."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Pedro tiene 11 años. Ayer compró 10 chocolates y 4 chupetines. Se comió 3 chocolates. ¿Cuántos chocolates le quedan?",
                    "respuesta": "7",
                    "feedback_acierto": "¡Impresionante! Ignoraste la edad de 11 años y los chupetines. 10 - 3 = 7 chocolates.",
                    "feedback_error": "Busca solo los chocolates. La edad y los chupetines no afectan el cálculo."
                },
                {
                    "enunciado": "A las 4:00 PM, un tren partió con 20 pasajeros. En el año 2025, el tren sumó 5 pasajeros en la estación. ¿Cuántos pasajeros van ahora?",
                    "respuesta": "25",
                    "feedback_acierto": "¡Correcto! Ignoraste la hora 4:00 PM y el año 2025. 20 + 5 = 25.",
                    "feedback_error": "Suma los pasajeros iniciales con los nuevos. Ignora la hora y el año."
                },
                {
                    "enunciado": "En una tienda que abre a las 8:00 AM, un niño de 12 años compra 15 galletas. Le regala 6 a su amigo. ¿Cuántas galletas le quedan?",
                    "respuesta": "9",
                    "feedback_acierto": "¡Perfecto! 15 - 6 = 9 galletas.",
                    "feedback_error": "Ignora la hora y la edad del niño. Solo opera con las galletas."
                }
            ]
        },
        {
            "modulo_id": 1,
            "nivel_id": 3,
            "titulo": "Descarte por Incongruencia",
            "texto_descubrimiento": "Problemas expertos donde todos los datos parecen importantes, pero representan magnitudes diferentes que no se pueden mezclar. ¡No puedes sumar años con litros ni peras con autos! Identifica qué magnitudes pertenecen a la misma familia conceptual.",
            "diccionario": {
                "Magnitud": "El tipo de unidad física (litros, kilogramos, unidades, metros).",
                "Incongruencia": "Intentar sumar o restar unidades que miden cosas totalmente diferentes."
            },
            "advertencia": "Cuidado con mezclar litros de agua con kilogramos de harina o libros con manzanas. Agrupa solo las magnitudes solicitadas por la pregunta final.",
            "ejemplos": [
                {
                    "enunciado": "En un estante hay 12 libros de historia, 15 litros de agua y 4 cuadernos. ¿Cuántas unidades de papelería/lectura hay en total?",
                    "pasos": [
                        {"orden": 1, "texto": "Identificamos magnitudes: 12 libros (papelería), 15 litros (líquido), 4 cuadernos (papelería)."},
                        {"orden": 2, "texto": "La pregunta es sobre papelería. Descartamos los 15 litros por incongruencia."},
                        {"orden": 3, "texto": "Sumamos papelería: 12 + 4 = 16 unidades."}
                    ]
                },
                {
                    "enunciado": "Un chef tiene 5 kg de harina, 3 litros de leche y 2 kg de azúcar. ¿Cuántos kg de ingredientes secos (harina y azúcar) tiene?",
                    "pasos": [
                        {"orden": 1, "texto": "Harina y azúcar están en kg. Leche está en litros (líquido). Descartamos leche."},
                        {"orden": 2, "texto": "Sumamos ingredientes secos: 5 kg + 2 kg = 7 kg."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "En una mochila hay 8 lápices, 2 botellas de agua (litros) y 3 gomas. ¿Cuántos útiles escolares (lápices y gomas) hay?",
                    "respuesta": "11",
                    "feedback_acierto": "¡Maravilloso! Las botellas de agua representan líquido y se descartan por incongruencia. 8 + 3 = 11.",
                    "feedback_error": "Suma los lápices y las gomas. Descarta el agua."
                },
                {
                    "enunciado": "Un camión transporta 10 cajas de manzanas, 50 litros de gasolina en el tanque y 4 cajas de peras. ¿Cuántas cajas de frutas transporta en total?",
                    "respuesta": "14",
                    "feedback_acierto": "¡Excelente! Los litros de gasolina no se pueden sumar con las cajas de frutas. 10 + 4 = 14.",
                    "feedback_error": "Suma las cajas de manzanas y peras. Ignora la gasolina."
                },
                {
                    "enunciado": "Un pintor compró 6 latas de pintura, 2 escaleras y 3 pinceles. ¿Cuántas herramientas de aplicación (latas y pinceles) tiene?",
                    "respuesta": "9",
                    "feedback_acierto": "¡Genial! 6 + 3 = 9.",
                    "feedback_error": "Suma las latas y los pinceles, ignora las escaleras."
                }
            ]
        },
        # --- MÓDULO 2: Secuencia Temporal ---
        {
            "modulo_id": 2,
            "nivel_id": 1,
            "titulo": "Operaciones Cronológicas",
            "texto_descubrimiento": "¡Viajero del Tiempo! Los eventos ocurren en un orden riguroso. Tu superpoder es escribir la historia cronológicamente: identificar el inicio, aplicar los cambios en estricto orden y calcular el final. ¡No saltes pasos!",
            "diccionario": {
                "Inicio": "La cantidad de partida.",
                "Orden Cronológico": "El orden temporal en que suceden los cambios."
            },
            "advertencia": "El monstruo del desorden temporal quiere que operes los números como caigan. Sigue la historia: resta lo que se va y suma lo que llega en el orden correcto.",
            "ejemplos": [
                {
                    "enunciado": "Un tren arranca con 20 pasajeros. Bajan 5 y luego suben 8. ¿Cuántos van ahora?",
                    "pasos": [
                        {"orden": 1, "texto": "Punto de partida: 20 pasajeros."},
                        {"orden": 2, "texto": "Primer evento cronológico: Bajan 5. Quedan 20 - 5 = 15."},
                        {"orden": 3, "texto": "Segundo evento: Suben 8. Ahora van 15 + 8 = 23 pasajeros."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Sofía inicia el día con 15 tazos. Pierde 5 jugando, y luego su hermano le regala 8. ¿Cuántos tiene ahora?",
                    "respuesta": "18",
                    "feedback_acierto": "¡Espectacular! Seguiste el orden: 15 - 5 = 10; luego 10 + 8 = 18.",
                    "feedback_error": "Sigue los pasos: primero resta los 5 perdidos de 15, y al resultado súmale 8."
                },
                {
                    "enunciado": "Una alcancía tiene 30 monedas. Sacamos 10 para comprar un juguete, y luego metemos 5. ¿Cuántas monedas quedan?",
                    "respuesta": "25",
                    "feedback_acierto": "¡Correcto! 30 - 10 = 20; 20 + 5 = 25.",
                    "feedback_error": "Saca primero las 10 monedas (resta) y luego ingresa las 5 (suma)."
                },
                {
                    "enunciado": "Un árbol tenía 12 pájaros. Se volaron 4, y luego llegaron 6 nuevos. ¿Cuántos pájaros hay ahora?",
                    "respuesta": "14",
                    "feedback_acierto": "¡Perfecto! 12 - 4 = 8; 8 + 6 = 14.",
                    "feedback_error": "Resta los 4 que se fueron y suma los 6 que llegaron."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 2,
            "titulo": "Álgebra Retrospectiva",
            "texto_descubrimiento": "¡Viaje al Pasado! Conocemos el final de la historia y los cambios intermedios, pero el inicio es un misterio. Para descubrirlo, reconstruiremos los hechos hacia atrás aplicando el Algoritmo Inverso: si en el presente restaron, en el pasado sumaremos. ¡La operación inversa es tu boleto de regreso!",
            "diccionario": {
                "Pasado": "El estado inicial que deseamos descubrir.",
                "Operación Inversa": "Deshacer los cambios (suma se deshace con resta, resta con suma)."
            },
            "advertencia": "Si la historia dice que el personaje 'perdió' 4 juguetes y terminó con 10, no restes 10 - 4. Para volver al pasado, debes sumarlos: 10 + 4 = 14.",
            "ejemplos": [
                {
                    "enunciado": "Lucas regaló 4 juguetes y se quedó con 10. ¿Cuántos tenía al principio?",
                    "pasos": [
                        {"orden": 1, "texto": "Estado final: 10 juguetes."},
                        {"orden": 2, "texto": "Viajamos al pasado: Como regaló (restó) 4, aplicamos la inversa (sumar 4)."},
                        {"orden": 3, "texto": "Calculamos el inicio: 10 + 4 = 14 juguetes."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Un cofre de monedas fue asaltado y le quitaron 8 monedas. Ahora quedan 12. ¿Cuántas monedas tenía al inicio?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Increíble! Viajaste al pasado sumando las monedas robadas al estado actual: 12 + 8 = 20.",
                    "feedback_error": "Como le quitaron 8, para volver al inicio debes sumar 12 + 8."
                },
                {
                    "enunciado": "Sofía recibió 5 chocolates de su tío y ahora tiene 15 en total. ¿Cuántos chocolates tenía Sofía antes del regalo?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Estupendo! Recibir es sumar, por lo que para viajar al pasado restas: 15 - 5 = 10.",
                    "feedback_error": "Usa la operación inversa: resta los 5 chocolates que recibió de los 15 actuales."
                },
                {
                    "enunciado": "Un autobús deja 6 pasajeros en la estación y se queda con 14. ¿Cuántos pasajeros llevaba al inicio?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Correcto! 14 + 6 = 20 pasajeros.",
                    "feedback_error": "Suma los pasajeros que bajaron a los que se quedaron para hallar el total inicial."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 3,
            "titulo": "Mutaciones Sucesivas",
            "texto_descubrimiento": "Historias de alta complejidad con 3 o más mutaciones sucesivas. Tendrás que congelar la historia en cada cambio y resolver el inventario intermedio. ¡Mantén el orden de las mutaciones!",
            "diccionario": {
                "Mutación": "Cada cambio o alteración que sufre la cantidad inicial.",
                "Inventario Parcial": "El resultado acumulado en un punto medio del tiempo."
            },
            "advertencia": "Con tres pasos, es fácil perder el hilo. Resuelve el primer paso, anota el resultado en tu mente, aplícale el segundo paso y luego el tercero.",
            "ejemplos": [
                {
                    "enunciado": "Un estanque de agua tiene 50 litros. Se vacían 20 litros, luego se duplica el agua restante, y finalmente se evaporan 10 litros. ¿Cuántos litros quedan?",
                    "pasos": [
                        {"orden": 1, "texto": "Paso 1: 50 litros - 20 litros vaciados = 30 litros."},
                        {"orden": 2, "texto": "Paso 2: Se duplica el restante. 30 × 2 = 60 litros."},
                        {"orden": 3, "texto": "Paso 3: Se evaporan 10 litros. 60 - 10 = 50 litros finales."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Un comerciante tiene 10 manzanas. Compra 5 más, luego duplica toda su mercadería, y al final vende 8 manzanas. ¿Cuántas manzanas le quedan?",
                    "respuesta": "22",
                    "feedback_acierto": "¡Sublime! 10 + 5 = 15; 15 × 2 = 30; 30 - 8 = 22. ¡Excelente resolución secuencial!",
                    "feedback_error": "Resuelve paso a paso: primero suma (10+5=15), luego duplica (15×2=30), y finalmente resta (30-8)."
                },
                {
                    "enunciado": "Un globo aerostático sube a 100 metros. Desciende 40 metros, luego sube el doble de lo que descendió (80 metros), y baja 10 metros. ¿A qué altura está ahora?",
                    "respuesta": "130",
                    "feedback_acierto": "¡Brillante! 100 - 40 = 60; 60 + 80 = 140; 140 - 10 = 130 metros.",
                    "feedback_error": "Sigue los movimientos: 100 menos 40 es 60. Agrégale 80 (el doble de 40) y réstale 10."
                },
                {
                    "enunciado": "Un jugador de cartas tiene 20 fichas. Gana 10, pierde la mitad de lo que tiene ahora, y luego gana 5 fichas más. ¿Cuántas tiene al final?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Correcto! 20 + 10 = 30; la mitad es 15; 15 + 5 = 20.",
                    "feedback_error": "Suma primero (20+10=30), calcula la mitad (15), y súmale 5."
                }
            ]
        },
        # --- MÓDULO 3: Deducción de Precios ---
        {
            "modulo_id": 3,
            "nivel_id": 1,
            "titulo": "Comparación de Carritos",
            "texto_descubrimiento": "¡Bienvenido al mercado de la deducción! Si miras dos carritos de compras casi idénticos, pero uno tiene un producto extra y cuesta más dinero, esa diferencia de dinero es exactamente el precio unitario del producto extra. ¡Deducción visual sin fórmulas!",
            "diccionario": {
                "Diferencia Visual": "Comparar los elementos de dos conjuntos para hallar el elemento extra.",
                "Valor de la Diferencia": "Restar el precio total del grupo menor al grupo mayor."
            },
            "advertencia": "Cuidado con repartir a ciegas. Si el Carrito A tiene 2 libros y cuesta R$ 10, y el Carrito B tiene 2 libros y 1 lápiz y cuesta R$ 12, el lápiz cuesta R$ 2,00 (12 - 10).",
            "ejemplos": [
                {
                    "enunciado": "Carrito A: 3 cuadernos, 1 lápiz = R$ 13,00. Carrito B: 3 cuadernos, 2 lápices = R$ 15,00. ¿Cuánto cuesta 1 lápiz?",
                    "pasos": [
                        {"orden": 1, "texto": "La única diferencia entre los dos carritos es que el Carrito B tiene 1 lápiz extra."},
                        {"orden": 2, "texto": "La diferencia de precio es de R$ 15,00 - R$ 13,00 = R$ 2,00."},
                        {"orden": 3, "texto": "Por lo tanto, 1 lápiz cuesta R$ 2,00."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Carrito A: 2 pizzas y 1 refresco cuesta R$ 20. Carrito B: 2 pizzas y 2 refrescos cuesta R$ 25. ¿Cuánto cuesta 1 refresco?",
                    "respuesta": "5",
                    "feedback_acierto": "¡Excelente deducción! El refresco extra aumentó el costo por R$ 5.",
                    "feedback_error": "Resta el total del Carrito A al Carrito B para encontrar el valor del refresco extra."
                },
                {
                    "enunciado": "Grupo A: 5 lápices y 1 goma cuesta R$ 10. Grupo B: 5 lápices y 2 gomas cuesta R$ 12. ¿Cuánto cuesta 1 goma?",
                    "respuesta": "2",
                    "feedback_acierto": "¡Correcto! 1 goma cuesta R$ 2.",
                    "feedback_error": "La goma extra cuesta la diferencia de los precios de los grupos: 12 - 10."
                },
                {
                    "enunciado": "Paquete A: 3 libros cuesta R$ 30. Paquete B: 3 libros y 1 cuaderno cuesta R$ 38. ¿Cuánto cuesta 1 cuaderno?",
                    "respuesta": "8",
                    "feedback_acierto": "¡Perfecto! 38 - 30 = 8.",
                    "feedback_error": "Resta el valor de los libros del total del Paquete B."
                }
            ]
        },
        {
            "modulo_id": 3,
            "nivel_id": 2,
            "titulo": "Grilla de Doble Entrada",
            "texto_descubrimiento": "¡Cruza tus datos! Una vez que descubres el precio de un artículo, puedes inyectar ese valor conocido en otra cuenta para despejar el valor del segundo artículo. ¡Es como resolver un crucigrama de dinero!",
            "diccionario": {
                "Sustitución": "Reemplazar un objeto por su valor numérico conocido.",
                "Despeje": "Restar el valor conocido del total para encontrar la otra incógnita."
            },
            "advertencia": "Asegúrate de multiplicar el valor conocido por la cantidad de veces que aparece en la segunda cuenta antes de restarlo del total.",
            "ejemplos": [
                {
                    "enunciado": "Si sabemos que 1 lápiz cuesta R$ 2,00. Y una cuenta de 2 cuadernos y 2 lápices da R$ 14,00. ¿Cuánto cuesta 1 cuaderno?",
                    "pasos": [
                        {"orden": 1, "texto": "Calculamos el costo de los lápices conocidos: 2 lápices × R$ 2,00 = R$ 4,00."},
                        {"orden": 2, "texto": "Restamos ese valor del total: R$ 14,00 - R$ 4,00 = R$ 10,00 (eso cuestan los 2 cuadernos)."},
                        {"orden": 3, "texto": "Dividimos entre la cantidad de cuadernos: R$ 10,00 ÷ 2 = R$ 5,00 por cuaderno."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Sabemos que 1 refresco cuesta R$ 4. Si 2 hamburguesas y 1 refresco cuestan R$ 24 en total, ¿cuánto cuesta 1 hamburguesa?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Espectacular! Restaste el refresco (24 - 4 = 20) y dividiste entre las 2 hamburguesas (20 ÷ 2 = 10).",
                    "feedback_error": "Primero resta los R$ 4 del refresco a R$ 24, y el resultado divídelo entre 2."
                },
                {
                    "enunciado": "Si 1 manzana cuesta R$ 2, y 3 plátanos con 2 manzanas cuestan R$ 19, ¿cuánto cuesta 1 plátano?",
                    "respuesta": "5",
                    "feedback_acierto": "¡Correcto! 2 manzanas cuestan R$ 4. 19 - 4 = 15. 15 ÷ 3 = 5.",
                    "feedback_error": "Resta el valor de las 2 manzanas (R$ 4) del total de R$ 19, y divide lo que queda entre 3."
                },
                {
                    "enunciado": "Sabemos que 1 regla cuesta R$ 3. Si 2 cuadernos y 3 reglas cuestan R$ 19, ¿cuánto cuesta 1 cuaderno?",
                    "fancy_format": True,
                    "respuesta": "5",
                    "feedback_acierto": "¡Excelente! 3 reglas cuestan R$ 9. 19 - 9 = 10. 10 ÷ 2 = 5.",
                    "feedback_error": "Resta R$ 9 del total y divide entre 2."
                }
            ]
        },
        {
            "modulo_id": 3,
            "nivel_id": 3,
            "titulo": "Álgebra Visual",
            "texto_descubrimiento": "¡Sistemas de Ecuaciones Camuflados! Dos objetos juntos tienen un precio total. Nos dicen que uno cuesta cierta cantidad 'más' que el otro. La estrategia del equilibrio (balanza) es: resta la diferencia del total, divide el resultado entre dos para hallar el objeto menor, y súmale la diferencia para hallar el mayor.",
            "diccionario": {
                "Diferencia Explícita": "La cantidad extra que cuesta el objeto más caro.",
                "Estrategia de la Balanza": "Quitar el exceso, repartir a la mitad, y reponer el exceso al más caro."
            },
            "advertencia": "No dividas el total directamente entre 2 si uno es más caro. Si pantalón y camisa cuestan R$ 50, y el pantalón cuesta R$ 10 más, la camisa no cuesta R$ 25. Cuesta (50 - 10) ÷ 2 = R$ 20,00.",
            "ejemplos": [
                {
                    "enunciado": "Un pantalón y una camisa cuestan R$ 50,00 en total. El pantalón cuesta R$ 10,00 más que la camisa. ¿Cuánto cuesta la camisa?",
                    "pasos": [
                        {"orden": 1, "texto": "Restamos la diferencia del total: R$ 50,00 - R$ 10,00 = R$ 40,00."},
                        {"orden": 2, "texto": "Dividimos el resultado en dos partes iguales: R$ 40,00 ÷ 2 = R$ 20,00."},
                        {"orden": 3, "texto": "El artículo menor (camisa) cuesta R$ 20,00. (El pantalón cuesta 20 + 10 = 30)."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Un libro y un cuaderno cuestan R$ 30 en total. El libro cuesta R$ 6 más que el cuaderno. ¿Cuánto cuesta el cuaderno?",
                    "respuesta": "12",
                    "feedback_acierto": "¡Brillante! 30 - 6 = 24; 24 ÷ 2 = 12. ¡La balanza está equilibrada!",
                    "feedback_error": "Resta la diferencia (6) del total (30), y divide lo que queda (24) entre 2."
                },
                {
                    "enunciado": "Un estuche y una mochila cuestan R$ 60 en total. La mochila cuesta R$ 20 más que el estuche. ¿Cuánto cuesta el estuche?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Perfecto! 60 - 20 = 40. 40 ÷ 2 = 20.",
                    "feedback_error": "Resta la diferencia (20) de 60, y divide el resultado entre 2."
                },
                {
                    "enunciado": "Una pelota y un bate cuestan R$ 100 en total. El bate cuesta R$ 40 más que la pelota. ¿Cuánto cuesta la pelota?",
                    "respuesta": "30",
                    "feedback_acierto": "¡Espectacular! 100 - 40 = 60. 60 ÷ 2 = 30.",
                    "feedback_error": "Resta 40 de 100, y divide el remanente (60) entre 2."
                }
            ]
        },
        # --- MÓDULO 4: Reparto y Residuos ---
        {
            "modulo_id": 4,
            "nivel_id": 1,
            "titulo": "Agrupación Visual",
            "texto_descubrimiento": "¡El Reparto Perfecto! Distribuir inventarios masivos en grupos idénticos de manera exacta. La división entera te permite calcular cuántas cuotas completas se pueden armar. ¡Visualiza los empaques exactos!",
            "diccionario": {
                "Reparto Exacto": "Dividir una cantidad en partes iguales con residuo cero.",
                "Cuotabilización": "Calcular la cantidad de elementos asignados a cada grupo."
            },
            "advertencia": "Asegúrate de realizar la división de forma exacta. En este nivel, todos los repartos serán perfectos y sin sobrantes.",
            "ejemplos": [
                {
                    "enunciado": "Tenemos 120 dulces y queremos empaquetarlos en 6 cajas en partes iguales. ¿Cuántos dulces van en cada caja?",
                    "pasos": [
                        {"orden": 1, "texto": "Realizamos la división directa: 120 dulces ÷ 6 cajas."},
                        {"orden": 2, "texto": "Calculamos: 120 ÷ 6 = 20 dulces por caja."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Se quieren repartir 150 lápices en 5 estuches en partes iguales. ¿Cuántos lápices van en cada estuche?",
                    "respuesta": "30",
                    "feedback_acierto": "¡Excelente división! 150 ÷ 5 = 30 lápices por estuche.",
                    "feedback_error": "Divide 150 entre 5 para hallar la cantidad exacta por estuche."
                },
                {
                    "enunciado": "Una biblioteca tiene 240 libros para acomodar en 8 estantes. ¿Cuántos libros van en cada estante?",
                    "respuesta": "30",
                    "feedback_acierto": "¡Correcto! 240 ÷ 8 = 30 libros.",
                    "feedback_error": "Divide el total de libros (240) entre los 8 estantes."
                },
                {
                    "enunciado": "Un agricultor recolectó 400 papas y las colocó en 10 sacos en partes iguales. ¿Cuántas papas van en cada saco?",
                    "respuesta": "40",
                    "feedback_acierto": "¡Perfecto! 400 ÷ 10 = 40 papas.",
                    "feedback_error": "Divide 400 entre 10."
                }
            ]
        },
        {
            "modulo_id": 4,
            "nivel_id": 2,
            "titulo": "Análisis de Resto",
            "texto_descubrimiento": "¡Las Piezas Sobrantes! En la vida real, a veces las cosas no caben de forma perfecta. El residuo o resto de una división te dice exactamente cuántos artículos se quedaron fuera de las cajas. ¡Interpreta el sobrante de forma lógica!",
            "diccionario": {
                "Residuo (Resto)": "La cantidad sobrante que no alcanza para llenar un grupo completo.",
                "Caja Incompleta": "El grupo que quedó a medias debido a la falta de elementos."
            },
            "advertencia": "Lee bien la pregunta. Si te preguntan 'cuántos sobran', la respuesta es el residuo. Si te preguntan 'cuántas cajas completas se llenan', es el cociente de la división.",
            "ejemplos": [
                {
                    "enunciado": "Tenemos 17 manzanas y las guardamos en cajas de 5 unidades. ¿Cuántas manzanas sobran?",
                    "pasos": [
                        {"orden": 1, "texto": "Dividimos 17 entre 5: 17 ÷ 5 = 3 cajas completas (3 × 5 = 15)."},
                        {"orden": 2, "texto": "Calculamos el residuo: 17 - 15 = 2 manzanas."},
                        {"orden": 3, "texto": "Por lo tanto, sobran 2 manzanas."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Tenemos 26 chocolates para armar bolsitas de 4 chocolates cada una. ¿Cuántos chocolates sobran?",
                    "respuesta": "2",
                    "feedback_acierto": "¡Brillante! Se llenan 6 bolsitas completas (24 chocolates) y sobran 2.",
                    "feedback_error": "Divide 26 entre 4 y calcula el residuo o resto de la división."
                },
                {
                    "enunciado": "Un profesor tiene 33 alumnos y los agrupa en equipos de 5. ¿Cuántos alumnos quedan sin equipo?",
                    "respuesta": "3",
                    "feedback_acierto": "¡Perfecto! Se forman 6 equipos y sobran 3 alumnos sin grupo. 33 = 6 × 5 + 3.",
                    "feedback_error": "Calcula el resto de dividir 33 entre 5."
                },
                {
                    "enunciado": "Queremos colocar 53 juguetes en cajas de 10 unidades. ¿Cuántos juguetes quedan en la última caja incompleta?",
                    "respuesta": "3",
                    "feedback_acierto": "¡Espectacular! Sobran 3 juguetes que irán en la última caja. 53 % 10 = 3.",
                    "feedback_error": "El residuo de dividir entre 10 es simplemente la cifra de las unidades (3)."
                }
            ]
        },
        {
            "modulo_id": 4,
            "nivel_id": 3,
            "titulo": "Sucesión Circular",
            "texto_descubrimiento": "¡Patrones Cíclicos! Si un semáforo cambia continuamente en el orden: rojo, amarillo, verde, y se repite infinitamente, puedes predecir qué color saldrá en el paso 100 usando el residuo de la división entre la longitud del ciclo. ¡Domina los ciclos con aritmética modular!",
            "diccionario": {
                "Longitud del Ciclo": "La cantidad de elementos distintos antes de que el patrón se repita.",
                "Aritmética Modular": "Usar el residuo para ubicar la posición exacta dentro del ciclo."
            },
            "advertencia": "Si el residuo es cero, significa que el patrón cayó exactamente en el último elemento del ciclo. ¡No lo olvides!",
            "ejemplos": [
                {
                    "enunciado": "Una tira de luces parpadea en orden: Rojo (1), Verde (2), Azul (3), y repite. ¿De qué color es el parpadeo número 14?",
                    "pasos": [
                        {"orden": 1, "texto": "El ciclo tiene longitud 3 (Rojo, Verde, Azul)."},
                        {"orden": 2, "texto": "Dividimos el paso entre la longitud: 14 ÷ 3 = 4 ciclos completos y residuo 2."},
                        {"orden": 3, "texto": "El residuo 2 corresponde al segundo color del ciclo: Verde."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Un semáforo cambia de color en orden: Rojo (1), Amarillo (2), Verde (3), y repite. ¿Qué color saldrá en el parpadeo 20? (Escribe el número: 1, 2 o 3)",
                    "respuesta": "2",
                    "feedback_acierto": "¡Excelente! 20 ÷ 3 da residuo 2, que corresponde a Amarillo.",
                    "feedback_error": "Divide 20 entre 3 (longitud del ciclo). El residuo te dirá el color (1=Rojo, 2=Amarillo, 3=Verde)."
                },
                {
                    "enunciado": "Una rueda de la fortuna tiene 4 canastillas numeradas en orden: 1, 2, 3, 4, y gira continuamente. Si avanza 45 posiciones, ¿qué número de canastilla queda abajo? (residuo de 45 ÷ 4)",
                    "respuesta": "1",
                    "feedback_acierto": "¡Maravilloso! 45 ÷ 4 da residuo 1. Queda abajo la canastilla 1.",
                    "feedback_error": "Divide 45 entre 4. El residuo es 1."
                },
                {
                    "enunciado": "Un juego de cartas reparte a 3 jugadores: Lucas (1), Ana (2), Juan (3) en orden cíclico. ¿A quién le cae la carta número 18? (1 para Lucas, 2 para Ana, 3 para Juan)",
                    "respuesta": "3",
                    "feedback_acierto": "¡Correcto! 18 ÷ 3 da residuo 0 (perfecto), por lo que le cae al último jugador: Juan (3).",
                    "feedback_error": "Como 18 es múltiplo de 3, el residuo es 0, lo que corresponde al jugador 3."
                }
            ]
        },
        # --- MÓDULO 5: Ciclos y Agrupaciones Máximas ---
        {
            "modulo_id": 5,
            "nivel_id": 1,
            "titulo": "Visualización de Saltos y Empaques",
            "texto_descubrimiento": "¡Recta Numérica Interactiva! Para recorrer una distancia dando saltos iguales, o llenar cajas de forma exacta, debes calcular cuántos saltos exactos caben. Es una introducción visual a los múltiplos comunes.",
            "diccionario": {
                "Salto": "La distancia fija recorrida en cada paso.",
                "Múltiplo": "El punto exacto de la recta donde cae un salto."
            },
            "advertencia": "Divide la distancia total entre el tamaño del salto para obtener la cantidad de saltos requeridos de forma exacta.",
            "ejemplos": [
                {
                    "enunciado": "Una rana da saltos de 3 metros cada uno en la recta numérica. ¿Cuántos saltos debe dar para llegar exactamente a los 18 metros?",
                    "pasos": [
                        {"orden": 1, "texto": "Distancia a recorrer: 18 metros. Tamaño del salto: 3 metros."},
                        {"orden": 2, "texto": "Dividimos la distancia entre el salto: 18 ÷ 3 = 6 saltos."},
                        {"orden": 3, "texto": "La rana debe dar exactamente 6 saltos."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Un saltamontes da saltos de 5 metros. ¿Cuántos saltos necesita para recorrer 35 metros?",
                    "respuesta": "7",
                    "feedback_acierto": "¡Genial! 35 ÷ 5 = 7 saltos perfectos.",
                    "feedback_error": "Divide la distancia total (35) entre la longitud de cada salto (5)."
                },
                {
                    "enunciado": "Queremos llenar cajas de 6 bombones. Si tenemos 48 bombones en total, ¿cuántas cajas exactas podemos completar?",
                    "respuesta": "8",
                    "feedback_acierto": "¡Correcto! 48 ÷ 6 = 8 cajas.",
                    "feedback_error": "Divide 48 entre 6."
                },
                {
                    "enunciado": "Un robot avanza dando pasos de 4 centímetros. ¿Cuántos pasos debe dar para recorrer 40 centímetros?",
                    "respuesta": "10",
                    "feedback_acierto": "¡Perfecto! 40 ÷ 4 = 10 pasos.",
                    "feedback_error": "Divide 40 entre 4."
                }
            ]
        },
        {
            "modulo_id": 5,
            "nivel_id": 2,
            "titulo": "Encuentros Periódicos - MCM",
            "texto_descubrimiento": "¡Sincronización de Eventos! Dos ciclistas giran en una pista a ritmos diferentes, o dos faros parpadean en intervalos distintos. Para descubrir cuándo coincidirán o se encontrarán de nuevo en el punto de partida, calcularemos el Mínimo Común Múltiplo (MCM). ¡El menor de los múltiplos que comparten!",
            "diccionario": {
                "Periodicidad": "El intervalo fijo en que ocurre un evento.",
                "Mínimo Común Múltiplo (MCM)": "El menor número entero que es múltiplo de dos o más números."
            },
            "advertencia": "No sumes los dos números. Si un autobús sale cada 4 minutos y otro cada 6 minutos, no saldrán juntos en el minuto 10. Saldrán juntos en el MCM(4, 6) = 12 minutos.",
            "ejemplos": [
                {
                    "enunciado": "Un autobús sale cada 4 minutos y otro cada 6 minutos. Si salen juntos a las 12:00, ¿en cuántos minutos volverán a coincidir?",
                    "pasos": [
                        {"orden": 1, "texto": "Listamos múltiplos de 4: 4, 8, 12, 16, 20..."},
                        {"orden": 2, "texto": "Listamos múltiplos de 6: 6, 12, 18, 24..."},
                        {"orden": 3, "texto": "El menor múltiplo común que comparten es 12. Coincidirán en 12 minutos."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Un faro parpadea cada 3 segundos y otro cada 5 segundos. Si parpadean juntos ahora, ¿en cuántos segundos volverán a parpadear juntos?",
                    "respuesta": "15",
                    "feedback_acierto": "¡Impresionante! El MCM de 3 y 5 es 15, ya que son números primos entre sí (3 × 5 = 15).",
                    "feedback_error": "Encuentra el menor número que sea múltiplo de 3 y 5 a la vez. Es 15."
                },
                {
                    "enunciado": "Dos campanas suenan en una iglesia: una cada 6 minutos y otra cada 8 minutos. Si suenan juntas ahora, ¿en cuántos minutos volverán a sonar juntas?",
                    "respuesta": "24",
                    "feedback_acierto": "¡Correcto! Los múltiplos de 6 son 6, 12, 18, 24... y los de 8 son 8, 16, 24... El menor es 24.",
                    "feedback_error": "Calcula el MCM de 6 y 8. El menor múltiplo común es 24."
                },
                {
                    "enunciado": "Un semáforo se pone en verde cada 4 segundos y otro cada 8 segundos. ¿En cuántos segundos coinciden si arrancan juntos?",
                    "respuesta": "8",
                    "feedback_acierto": "¡Excelente! Como 8 es múltiplo de 4, el MCM es simplemente 8.",
                    "feedback_error": "Busca el menor múltiplo común de 4 y 8. Al ser 8 divisible por 4, la respuesta es 8."
                }
            ]
        },
        {
            "modulo_id": 5,
            "nivel_id": 3,
            "titulo": "División Máxima Exacta - MCD",
            "texto_descubrimiento": "¡Corte de Listones sin Sobrantes! Tenemos dos o más cuerdas de longitudes diferentes y queremos cortarlas en trozos exactamente iguales lo más largos posible. Para descubrir la longitud máxima de corte, calcularemos el Máximo Común Divisor (MCD). ¡El mayor número que los divide a todos de forma exacta!",
            "diccionario": {
                "Divisor Común": "Un número que divide de forma exacta a varias cantidades.",
                "Máximo Común Divisor (MCD)": "El mayor de los divisores comunes de un conjunto de números."
            },
            "advertencia": "El MCD nunca será mayor que el menor de los números originales. Debe dividir a ambos sin dejar ningún residuo.",
            "ejemplos": [
                {
                    "enunciado": "Tenemos dos cuerdas de 12 metros y 18 metros. Queremos cortarlas en trozos de igual longitud lo más largos posible sin que sobre nada. ¿De cuántos metros debe ser cada trozo?",
                    "pasos": [
                        {"orden": 1, "texto": "Divisores de 12: 1, 2, 3, 4, 6, 12."},
                        {"orden": 2, "texto": "Divisores de 18: 1, 2, 3, 6, 9, 18."},
                        {"orden": 3, "texto": "Los divisores comunes son 1, 2, 3, 6. El mayor es 6. Cada trozo medirá 6 metros."}
                    ]
                }
            ],
            "interactivos": [
                {
                    "enunciado": "Queremos armar bolsas idénticas de dulces sin que sobre nada, usando 15 bombones de fresa y 20 de menta. ¿Cuál es el número máximo de bolsas idénticas que podemos armar?",
                    "respuesta": "5",
                    "feedback_acierto": "¡Excelente! El MCD de 15 y 20 es 5. Podemos armar 5 bolsas (cada una con 3 de fresa y 4 de menta).",
                    "feedback_error": "Calcula el Máximo Común Divisor (MCD) de 15 y 20. El mayor número que divide a ambos es 5."
                },
                {
                    "enunciado": "Tenemos dos tablones de madera de 24 cm y 32 cm. Queremos cortarlos en piezas de igual longitud lo más largas posible sin desperdiciar nada. ¿De cuántos cm debe ser cada pieza?",
                    "respuesta": "8",
                    "feedback_acierto": "¡Correcto! El MCD de 24 y 32 es 8.",
                    "feedback_error": "Calcula el MCD de 24 y 32. El mayor divisor común es 8."
                },
                {
                    "enunciado": "Queremos agrupar 12 niños y 18 niñas en filas idénticas con el mismo número de integrantes. ¿Cuál es el tamaño máximo de cada fila?",
                    "respuesta": "6",
                    "feedback_acierto": "¡Espectacular! El MCD de 12 y 18 es 6.",
                    "feedback_error": "Calcula el MCD de 12 y 18. El mayor divisor común es 6."
                }
            ]
        }
    ]
    
    for nt in niveles_teoria:
        # Expandir ejemplos a exactamente 5 premium keyword-highlighted ejemplos
        nt["ejemplos"] = obtener_ejemplos_expandidos_fase3(nt["modulo_id"], nt["nivel_id"])
        # Validación
        NivelTeoriaSeederSchema(**nt)

        rec = NivelTeoria(
            fase_id=FASE3_ID,
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
    
    await session.commit()
    print("NivelTeoria Fase 3 insertados exitosamente.")


async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando ConfiguracionProgreso para Fase 3...")
    configs = []
    
    # 5 módulos en la Fase 3, cada uno con 3 niveles prácticos y 3 desafíos
    for mod_id in range(1, 6):
        # Práctica Libre
        for l in range(1, 4):
            configs.append({
                "seccion": mod_id * 100 + l,
                "operacion": "mixta",
                "cantidad_requerida": 15,
                "porcentaje_aprobacion": 80,
                "orden_desbloqueo": l,
                "usa_cronometro": False,
                "tiempo_default_segundos": 0,
                "tipo_feedback": "espejo"
            })
            
        # Desafíos
        configs.append({
            "seccion": mod_id * 1000 + 11,
            "operacion": "mixta",
            "cantidad_requerida": 20,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 11,
            "usa_cronometro": True,
            "tiempo_default_segundos": 25,
            "tipo_feedback": "early_exit"
        })
        configs.append({
            "seccion": mod_id * 1000 + 12,
            "operacion": "mixta",
            "cantidad_requerida": 20,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 12,
            "usa_cronometro": True,
            "tiempo_default_segundos": 40,
            "tipo_feedback": "early_exit"
        })
        configs.append({
            "seccion": mod_id * 1000 + 13,
            "operacion": "mixta",
            "cantidad_requerida": 10,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 13,
            "usa_cronometro": True,
            "tiempo_default_segundos": 50,
            "tipo_feedback": "early_exit"
        })

    # --- CONFIGURACIÓN GLOBAL DE DESAFÍO MIXTO (MÓDULO 99) ---
    configs.append({
        "seccion": 99099,
        "operacion": "mixta",
        "cantidad_requerida": 20,
        "porcentaje_aprobacion": 90,
        "orden_desbloqueo": 4,
        "usa_cronometro": True,
        "tiempo_default_segundos": 60,
        "tipo_feedback": "simple"
    })

    for c in configs:
        conf = ConfiguracionProgreso(
            fase_id=FASE3_ID,
            seccion=c["seccion"],
            operacion=c["operacion"],
            cantidad_requerida=c["cantidad_requerida"],
            porcentaje_aprobacion=c["porcentaje_aprobacion"],
            orden_desbloqueo=c["orden_desbloqueo"],
            usa_cronometro=c["usa_cronometro"],
            tiempo_default_segundos=c["tiempo_default_segundos"],
            tipo_feedback=c["tipo_feedback"]
        )
        session.add(conf)
        
    await session.commit()
    print("ConfiguracionProgreso Fase 3 insertados exitosamente.")


# ─────────────────────────────────────────────────────────────────────────────
# GENERADOR DETERMINISTA DE PREGUNTAS Y VARIANTES ESPEJO
# ─────────────────────────────────────────────────────────────────────────────

def generate_practice_question(modulo_id: int, nivel_id: int, fam: int, var: int) -> Dict[str, Any]:
    """Genera deterministamente una pregunta original (var=0) o variante espejo (var=1,2,3)."""
    # Usar una seed fija para reproducibilidad absoluta
    seed = FASE3_ID * 100000 + modulo_id * 1000 + nivel_id * 100 + fam * 10 + var
    rng = random.Random(seed)
    
    es_espejo = var > 0
    prefix = "[ESPEJO] " if es_espejo else ""
    
    # ── MÓDULO 1: El Detective Literario ─────────────────────────────────────
    if modulo_id == 1:
        if nivel_id == 1: # Aislamiento de Variables Críticas
            manzanas = rng.randint(10, 30)
            bicicletas = rng.randint(3, 10)
            regala = rng.randint(2, 8)
            ans = manzanas - regala
            enunciado = f"{prefix}Lucas tiene {manzanas} manzanas rojas y {bicicletas} bicicletas azules en su garaje. Regala {regala} manzanas a su amigo. ¿Cuántas manzanas le quedan?"
            feedback = "Resta solo la cantidad de manzanas y descarta las bicicletas, ya que la pregunta es sobre manzanas."
            vals = {"manzanas": manzanas, "bicicletas": bicicletas, "regala": regala}
        elif nivel_id == 2: # Datos Útiles vs. Datos Basura
            edad = rng.randint(8, 12)
            chocolates = rng.randint(15, 30)
            paletas = rng.randint(4, 12)
            regalo = rng.randint(3, 9)
            ans = chocolates - regalo
            enunciado = f"{prefix}María tiene {edad} años. Ayer a las 4:00 PM compró {chocolates} chocolates y {paletas} paletas en la tienda. Le regaló {regalo} chocolates a su hermano de 6 años. ¿Cuántos chocolates le quedan?"
            feedback = "Ignora la edad de María, la hora y los chupetines/paletas. Solo resta los chocolates que regaló de los iniciales."
            vals = {"edad": edad, "chocolates": chocolates, "paletas": paletas, "regalo": regalo}
        else: # Descarte por Incongruencia
            libros = rng.randint(10, 25)
            litros = rng.randint(5, 15)
            cuadernos = rng.randint(5, 15)
            ans = libros + cuadernos
            enunciado = f"{prefix}En un estante hay {libros} libros de aventuras, {litros} litros de jugo de naranja y {cuadernos} cuadernos escolares. ¿Cuántas unidades de papelería/lectura hay en total?"
            feedback = "Los litros de jugo miden líquido y se descartan por incongruencia física. Suma solo libros y cuadernos."
            vals = {"libros": libros, "litros": litros, "cuadernos": cuadernos}

    # ── MÓDULO 2: Secuencia Temporal ──────────────────────────────────────────
    elif modulo_id == 2:
        if nivel_id == 1: # Operaciones Cronológicas
            inicial = rng.randint(20, 50)
            bajan = rng.randint(5, 15)
            suben = rng.randint(6, 18)
            ans = inicial - bajan + suben
            enunciado = f"{prefix}Un tren arranca la marcha con {inicial} pasajeros. En la primera parada se bajan {bajan} pasajeros y luego suben {suben}. ¿Cuántos pasajeros van en el tren?"
            feedback = "Sigue la línea del tiempo paso a paso: resta primero los pasajeros que bajan, y a ese resultado súmale los que suben."
            vals = {"inicial": inicial, "bajan": bajan, "suben": suben}
        elif nivel_id == 2: # Álgebra Retrospectiva
            gasto = rng.randint(10, 30)
            final = rng.randint(15, 40)
            ans = final + gasto
            enunciado = f"{prefix}Lucas gastó {gasto} monedas de oro en la armería. Ahora le quedan exactamente {final} monedas de oro. ¿Cuántas monedas tenía Lucas al inicio?"
            feedback = "Camino inverso al pasado: si en el presente restaste lo gastado, para volver al inicio debes sumar lo que le queda más lo gastado."
            vals = {"gasto": gasto, "final": final}
        else: # Mutaciones Sucesivas
            agua = rng.randint(40, 80)
            consumo = rng.randint(10, 25)
            cresce = (agua - consumo)
            ans = cresce * 2 - 10
            enunciado = f"{prefix}Un tanque tiene {agua} litros de agua. Se consumen {consumo} litros por la mañana, luego se duplica la cantidad restante, y por la tarde se evaporan 10 litros. ¿Cuántos litros de agua quedan?"
            feedback = "Resuelve en estricto orden: 1) resta el consumo, 2) multiplica por 2 el resultado, 3) resta 10 litros."
            vals = {"agua": agua, "consumo": consumo}

    # ── MÓDULO 3: Deducción de Precios ───────────────────────────────────────
    elif modulo_id == 3:
        if nivel_id == 1: # Comparación de Carritos
            lapices = rng.randint(2, 12)
            gomas = rng.randint(1, 10)
            precio_lapiz = rng.randint(2, 15)
            precio_goma = rng.randint(4, 25)
            tot_a = lapices * precio_lapiz + gomas * precio_goma
            tot_b = tot_a + precio_goma
            ans = precio_goma
            enunciado = f"{prefix}Carrito A: {lapices} lápices y {gomas} gomas cuesta R$ {tot_a}. Carrito B: {lapices} lápices y {gomas+1} gomas cuesta R$ {tot_b}. ¿Cuánto cuesta 1 goma?"
            feedback = "Deduce la diferencia: el Carrito B tiene exactamente una goma más y cuesta la diferencia de los precios totales."
            vals = {"lapices": lapices, "gomas": gomas, "tot_a": tot_a, "tot_b": tot_b}
        elif nivel_id == 2: # Grilla de Doble Entrada
            precio_regla = rng.randint(2, 15)
            precio_cuaderno = rng.randint(6, 30)
            cant_cuadernos = rng.randint(2, 8)
            tot_a = cant_cuadernos * precio_cuaderno
            tot_b = tot_a + 2 * precio_regla
            ans = precio_regla
            enunciado = f"{prefix}Si {cant_cuadernos} cuadernos cuestan R$ {tot_a} en total, y {cant_cuadernos} cuadernos con 2 reglas cuestan R$ {tot_b}, ¿cuánto cuesta 1 regla?"
            feedback = "Sustituye el valor conocido de los cuadernos en la segunda cuenta, resta ese valor del total, y divide el sobrante entre las 2 reglas."
            vals = {"cuadernos": cant_cuadernos, "tot_a": tot_a, "tot_b": tot_b}
        else: # Álgebra Visual
            total = rng.randint(20, 250)
            dif = rng.randint(2, 40)
            # Asegurar consistencia para evitar decimales extraños
            if (total - dif) % 2 != 0:
                total += 1
            ans = (total - dif) // 2
            enunciado = f"{prefix}Un estuche y una mochila cuestan R$ {total} en total. La mochila cuesta R$ {dif} más que el estuche. ¿Cuánto cuesta el estuche?"
            feedback = "Estrategia de la Balanza: resta la diferencia (mochila extra) del total general, y divide la cantidad remanente entre 2."
            vals = {"total": total, "dif": dif}

    # ── MÓDULO 4: Reparto y Residuos ─────────────────────────────────────────
    elif modulo_id == 4:
        if nivel_id == 1: # Agrupación Visual
            cajas = rng.choice([4, 5, 6, 8, 10])
            dulces = cajas * rng.randint(15, 40)
            ans = dulces // cajas
            enunciado = f"{prefix}Queremos empaquetar {dulces} dulces en {cajas} cajas de forma que cada una tenga exactamente la misma cantidad. ¿Cuántos dulces van en cada caja?"
            feedback = "Esta es una división perfecta. Divide el total de dulces entre la cantidad de cajas de manera directa."
            vals = {"dulces": dulces, "cajas": cajas}
        elif nivel_id == 2: # Análisis de Resto
            capacidad = rng.randint(4, 8)
            manzanas = capacidad * rng.randint(5, 12) + rng.randint(1, capacidad - 1)
            ans = manzanas % capacidad
            enunciado = f"{prefix}Tenemos {manzanas} manzanas para guardar en cajas de {capacidad} unidades cada una. ¿Cuántas manzanas sobran al completar el máximo número de cajas posibles?"
            feedback = "El sobrante es el resto o residuo de la división entera. Divide las manzanas entre la capacidad y calcula el residuo."
            vals = {"manzanas": manzanas, "capacidad": capacidad}
        else: # Sucesión Circular
            luces = ["Rojo", "Verde", "Azul", "Amarillo"]
            pasos = rng.randint(15, 60)
            ans_idx = (pasos - 1) % 4
            ans = ans_idx + 1  # 1 para Rojo, 2 para Verde, etc.
            enunciado = f"{prefix}Una tira de luces parpadea cíclicamente en orden: Rojo (1), Verde (2), Azul (3), Amarillo (4), y repite. ¿Qué número de color saldrá en el parpadeo {pasos}?"
            feedback = "Divide los pasos entre la longitud del ciclo (4). El residuo te indicará la posición exacta (un residuo de 0 representa la última posición, 4)."
            vals = {"pasos": pasos}

    # ── MÓDULO 5: Ciclos y Agrupaciones Máximas ──────────────────────────────
    else:
        if nivel_id == 1: # Visualización de Saltos y Empaques
            salto = rng.randint(3, 15)
            dist = salto * rng.randint(6, 40)
            ans = dist // salto
            enunciado = f"{prefix}Una rana da saltos de {salto} metros de longitud en la recta numérica. ¿Cuántos saltos debe dar para llegar exactamente a los {dist} metros?"
            feedback = "Divide la distancia total que debe recorrer entre la longitud de cada uno de sus saltos."
            vals = {"salto": salto, "dist": dist}
        elif nivel_id == 2: # Encuentros Periódicos - MCM
            a = rng.randint(3, 15)
            b = rng.randint(4, 25)
            while a == b:
                b = rng.randint(4, 25)
            ans = math.lcm(a, b)
            enunciado = f"{prefix}Un semáforo se enciende en verde cada {a} segundos, y otro semáforo lo hace cada {b} segundos. Si ambos se encienden juntos ahora, ¿en cuántos segundos volverán a coincidir?"
            feedback = "Calcula el Mínimo Común Múltiplo (MCM) de ambos intervalos de tiempo. El menor múltiplo común es el point de encuentro."
            vals = {"a": a, "b": b}
        else: # División Máxima Exacta - MCD
            g = rng.randint(2, 10)
            a_mult = rng.randint(2, 8)
            b_mult = rng.randint(2, 10)
            while a_mult == b_mult:
                b_mult = rng.randint(2, 10)
            a = g * a_mult
            b = g * b_mult
            ans = math.gcd(a, b)
            enunciado = f"{prefix}Queremos cortar dos cuerdas de {a} metros y {b} metros en pedazos iguales lo más largos posible, sin que sobre nada. ¿De cuántos metros medirá cada pedazo?"
            feedback = "Calcula el Máximo Común Divisor (MCD) de las dos longitudes de cuerda para hallar el tamaño máximo de corte idéntico."
            vals = {"a": a, "b": b}

    explicacion_html = (
        f"Recuerda seguir el orden pedagógico del Tutor Invisible:<br>"
        f"<b>Demostración:</b> {feedback}<br>"
        f"<b>Resultado esperado:</b> <span style='color:#10B981'>{ans}</span>"
    )

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "valores": vals,
        "explicacion_profunda": explicacion_html,
        "operacion": "mixta"
    }


async def seed_preguntas_practica(session: AsyncSession):
    print("Generando pool de Práctica Libre (120 familias por nivel, total 1800 preguntas)...")
    
    # 5 módulos, cada uno con 3 niveles prácticos
    for modulo_id in range(1, 6):
        for nivel_id in range(1, 4):
            seccion = modulo_id * 100 + nivel_id
            
            # Generar exactamente 120 familias de preguntas por nivel
            for fam in range(1, 121):
                padre_id = f"f3_m{modulo_id}_l{nivel_id}_fam_{fam:03d}"
                
                # Cada familia tiene 1 original (var=0) y 3 variantes espejo (var=1,2,3)
                for var in range(4):
                    q_data = generate_practice_question(modulo_id, nivel_id, fam, var)
                    
                    pregunta = Pregunta(
                        fase_id=FASE3_ID,
                        seccion=seccion,
                        operacion=OperacionEnum.MIXTA,
                        tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
                        enunciado=q_data["enunciado"],
                        respuesta_correcta=q_data["respuesta_correcta"],
                        estructura_padre_id=padre_id,
                        datos_numericos={
                            "es_espejo": var > 0,
                            "variante": var,
                            "valores": q_data["valores"]
                        },
                        explicacion_paso_a_paso={
                            "html": q_data["explicacion_profunda"]
                        },
                        estado=StatusEnum.ACTIVO
                    )
                    session.add(pregunta)
            print(f"  Módulo {modulo_id} Nivel {nivel_id} (120 familias × 4 variantes) insertados.")
            await session.flush()
            
    await session.commit()
    print("Pool de Práctica Libre insertado exitosamente.")


# ─────────────────────────────────────────────────────────────────────────────
# GENERADOR DETERMINISTA DE PREGUNTAS DE DESAFÍO
# ─────────────────────────────────────────────────────────────────────────────

def generate_challenge_question(modulo_id: int, desafio_id: int, idx: int) -> Dict[str, Any]:
    """Genera una pregunta única para los desafíos de la Fase 3."""
    seed = FASE3_ID * 1000000 + modulo_id * 10000 + desafio_id * 1000 + idx
    rng = random.Random(seed)
    
    # Múltiple opción para Desafíos 11 y 12. Evocación pura para 13.
    tipo = TipoPreguntaEnum.MULTIPLE_OPCION if desafio_id in (11, 12) else TipoPreguntaEnum.RESPUESTA_NUMERICA
    
    if modulo_id == 1:
        a = rng.randint(20, 60)
        b = rng.randint(4, 15)
        c = rng.randint(3, 10)
        ans = a - c
        enunciado = f"María de 12 años tiene {a} globos y {b} pelotas de tenis. Ayer a las 3:00 PM regaló {c} globos. ¿Cuántos globos tiene ahora?"
    elif modulo_id == 2:
        a = rng.randint(15, 45)
        b = rng.randint(5, 12)
        c = rng.randint(6, 15)
        ans = a - b + c
        enunciado = f"Un camión sale del patio con {a} cajas de frutas. Entrega {b} cajas en el supermercado y luego carga {c} cajas nuevas. ¿Cuántas cajas lleva?"
    elif modulo_id == 3:
        p_item = rng.randint(3, 180)
        ans = p_item
        tot_a = 2 * p_item + 10
        tot_b = 3 * p_item + 10
        enunciado = f"Si 2 cuadernos y una cartuchera de R$ 10,00 cuestan R$ {tot_a}, y 3 cuadernos con la misma cartuchera cuestan R$ {tot_b}, ¿cuánto cuesta 1 cuaderno?"
    elif modulo_id == 4:
        cap = rng.randint(4, 8)
        tot = cap * rng.randint(6, 12) + rng.randint(1, cap - 1)
        ans = tot % cap
        enunciado = f"Un panadero hizo {tot} panes y los agrupó en bolsas de {cap} panes cada una. ¿Cuántos panes quedaron sueltos fuera de las bolsas completas?"
    else: # Módulo 5
        g = rng.randint(2, 4)
        a_mult = rng.randint(2, 7)
        b_mult = rng.randint(2, 10)
        while a_mult == b_mult:
            b_mult = rng.randint(2, 10)
        a = g * a_mult
        b = g * b_mult
        ans = math.lcm(a, b)
        enunciado = f"Un atleta corre en una pista y tarda {a} minutos por vuelta, y su compañero tarda {b} minutos. Si salen juntos, ¿en cuántos minutos se encuentran de nuevo?"
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "tipo_pregunta": tipo,
        "operacion": "mixta"
    }


async def seed_preguntas_desafios(session: AsyncSession):
    print("Generando pool de Desafíos (mínimo 150 preguntas por desafío)...")
    
    # 5 módulos, cada uno con 3 desafíos (11, 12, 13)
    for modulo_id in range(1, 6):
        for desafio_id in (11, 12, 13):
            seccion = modulo_id * 1000 + desafio_id
            
            for idx in range(1, 151):
                q_data = generate_challenge_question(modulo_id, desafio_id, idx)
                ans_val = int(q_data["respuesta_correcta"])
                
                desafio_q = Pregunta(
                    fase_id=FASE3_ID,
                    seccion=seccion,
                    operacion=OperacionEnum.MIXTA,
                    tipo_pregunta=q_data["tipo_pregunta"],
                    enunciado=q_data["enunciado"],
                    respuesta_correcta=q_data["respuesta_correcta"],
                    estructura_padre_id=f"f3_m{modulo_id}_d{desafio_id}_q_{idx:03d}",
                    datos_numericos={"es_desafio": True},
                    estado=StatusEnum.ACTIVO
                )
                session.add(desafio_q)
                await session.flush()
                
                # Crear alternativas para opción múltiple (Desafíos 11 y 12)
                if q_data["tipo_pregunta"] == TipoPreguntaEnum.MULTIPLE_OPCION:
                    # Crear opciones erróneas plausibles
                    wrong_answers = {
                        ans_val + 2,
                        max(1, ans_val - 2),
                        ans_val * 2
                    }
                    if len(wrong_answers) < 3:
                        wrong_answers.add(ans_val + 5)
                        wrong_answers.add(ans_val + 8)
                    
                    options = [{"texto": str(ans_val), "es_correcta": True, "tipo_error": None}]
                    for idx_w, w in enumerate(list(wrong_answers)[:3]):
                        options.append({
                            "texto": str(w),
                            "es_correcta": False,
                            "tipo_error": TipoErrorEnum.CALCULO
                        })
                    
                    # Mezclar opciones
                    random.shuffle(options)
                    for order_idx, opt in enumerate(options):
                        alt = Alternativa(
                            pregunta_id=desafio_q.id,
                            texto=opt["texto"],
                            es_correcta=opt["es_correcta"],
                            orden=order_idx + 1,
                            tipo_error=opt["tipo_error"],
                            feedback_error="Revisa el cálculo matemático con calma." if not opt["es_correcta"] else None
                        )
                        session.add(alt)
                        
            print(f"  Módulo {modulo_id} Desafío {desafio_id} (150 preguntas con alternativas) insertados.")
            await session.flush()
            
    # Seed Desafío Mixto (99099) for Fase 3 to avoid sufficiency warnings
    # It requires 20 questions, but we will seed 150 for robustness
    print("  Generando 150 preguntas del Desafío Mixto (99099) para Fase 3...")
    for q_idx in range(1, 151):
        # Select random module (1 to 5) and level (13) to generate questions
        rng = random.Random(99099 * 1000 + q_idx)
        rnd_mod = rng.choice([1, 2, 3, 4, 5])
        q_data = generate_challenge_question(rnd_mod, 13, q_idx)
        
        desafio_q = Pregunta(
            fase_id=FASE3_ID,
            seccion=99099,
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado=q_data["enunciado"],
            respuesta_correcta=q_data["respuesta_correcta"],
            estructura_padre_id=f"f3_m99_d99_q_{q_idx:03d}",
            datos_numericos={"es_desafio": True},
            estado=StatusEnum.ACTIVO
        )
        session.add(desafio_q)
    await session.commit()
    print("  Pool de Desafío Mixto (99099) sembrado correctamente para Fase 3.")

    print("Pool de Desafíos insertado exitosamente.")


async def run_fase3_seed():
    from app.seed import should_seed_phase, update_seed_version, SEED_VERSIONS
    
    async with AsyncSessionLocal() as session:
        # Check if we should seed
        if not await should_seed_phase(session, "fase_3", FASE3_ID):
            print("=============================================")
            print("¡Datos semilla de Fase 3 omitidos (ya está actualizada)!")
            print("=============================================")
            return

        try:
            # Flujo determinista
            await clear_fase3_data(session)
            await seed_teoria_niveles(session)
            await seed_configuracion_progreso(session)
            await seed_preguntas_practica(session)
            await seed_preguntas_desafios(session)
            
            # Update version in registry
            await update_seed_version(session, "fase_3", SEED_VERSIONS["fase_3"])
            await session.commit()
            print("✅ Sembrado de Fase 3 completado exitosamente.")
        except Exception as e:
            await session.rollback()
            print(f"❌ Error en seed Fase 3: {e}")
            traceback.print_exc()
            raise


if __name__ == "__main__":
    asyncio.run(run_fase3_seed())
