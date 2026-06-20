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
        # Módulos 1-4 (globales 5-8) obtienen tiempos actualizados, módulo 5 (global 9) mantiene estándar
        if mod_id in [1, 2, 3, 4]:
            configs.append({
                "seccion": mod_id * 1000 + 11,
                "operacion": "mixta",
                "cantidad_requerida": 20,
                "porcentaje_aprobacion": 90,
                "orden_desbloqueo": 11,
                "usa_cronometro": True,
                "tiempo_default_segundos": 30,
                "tipo_feedback": "early_exit"
            })
            configs.append({
                "seccion": mod_id * 1000 + 12,
                "operacion": "mixta",
                "cantidad_requerida": 20,
                "porcentaje_aprobacion": 90,
                "orden_desbloqueo": 12,
                "usa_cronometro": True,
                "tiempo_default_segundos": 45,
                "tipo_feedback": "early_exit"
            })
            configs.append({
                "seccion": mod_id * 1000 + 13,
                "operacion": "mixta",
                "cantidad_requerida": 10,
                "porcentaje_aprobacion": 90,
                "orden_desbloqueo": 13,
                "usa_cronometro": True,
                "tiempo_default_segundos": 60,
                "tipo_feedback": "early_exit"
            })
        else:
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
        "tiempo_default_segundos": 90,
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


# --- DICCIONARIOS DE CONTEXTOS PARA PRÁCTICA LIBRE ---

CONTEXTOS_M1_L1 = [
    {"sujeto": "Lucas", "util": "manzanas rojas", "short_util": "manzanas", "basura": "bicicletas azules", "short_basura": "bicicletas", "ubicacion": "garaje", "accion": "Regala", "pregunta": "¿Cuántas manzanas le quedan?"},
    {"sujeto": "Sofía", "util": "lápices de colores", "short_util": "lápices", "basura": "globos amarillos", "short_basura": "globos", "ubicacion": "mochila", "accion": "Pierde", "pregunta": "¿Cuántos lápices le quedan?"},
    {"sujeto": "Enzo", "util": "naranjas dulces", "short_util": "naranjas", "basura": "camisetas verdes", "short_basura": "camisetas", "ubicacion": "cesta", "accion": "Comparte", "pregunta": "¿Cuántas naranjas le quedan?"},
    {"sujeto": "Clara", "util": "libros de aventuras", "short_util": "libros", "basura": "muñecas de trapo", "short_basura": "muñecas", "ubicacion": "estante", "accion": "Regala", "pregunta": "¿Cuántos libros le quedan?"}
]

CONTEXTOS_M1_L2 = [
    {"sujeto": "María", "util": "chocolates", "basura": "paletas", "accion": "regaló", "pregunta": "¿Cuántos chocolates le quedan?"},
    {"sujeto": "Diego", "util": "tazos de superhéroes", "basura": "canicas de vidrio", "accion": "perdió", "pregunta": "¿Cuántos tazos le quedan?"},
    {"sujeto": "Camila", "util": "galletas con chispas", "basura": "caramelos masticables", "accion": "regaló", "pregunta": "¿Cuántas galletas le quedan?"},
    {"sujeto": "Mateo", "util": "figuritas de fútbol", "basura": "llaveros pequeños", "accion": "perdió", "pregunta": "¿Cuántas figuritas le quedan?"}
]

CONTEXTOS_M1_L3 = [
    {"util_1": "libros de aventuras", "short_util_1": "libros", "basura": "litros de jugo de naranja", "short_basura": "litros", "util_2": "cuadernos escolares", "short_util_2": "cuadernos", "ubicacion": "un estante", "pregunta": "¿Cuántas unidades de papelería/lectura hay en total?"},
    {"util_1": "juguetes de madera", "short_util_1": "juguetes", "basura": "kilogramos de harina", "short_basura": "kilogramos", "util_2": "rompecabezas de cartón", "short_util_2": "rompecabezas", "ubicacion": "una caja", "pregunta": "¿Cuántos juguetes/juegos hay en total?"},
    {"util_1": "pelotas de tenis", "short_util_1": "pelotas", "basura": "litros de agua mineral", "short_basura": "litros", "util_2": "raquetas de metal", "short_util_2": "raquetas", "ubicacion": "un armario", "pregunta": "¿Cuántos artículos deportivos hay en total?"},
    {"util_1": "plantas en maceta", "short_util_1": "plantas", "basura": "sacos de abono orgánico", "short_basura": "sacos", "util_2": "flores en florero", "short_util_2": "flores", "ubicacion": "un jardín", "pregunta": "¿Cuántas plantas y flores decorativas hay en total?"}
]

CONTEXTOS_M2_L1 = [
    {"vehiculo": "tren", "inicial": "pasajeros", "bajan": "pasajeros", "suben": "nuevos pasajeros", "pregunta": "¿Cuántos pasajeros van en el tren?"},
    {"vehiculo": "autobús", "inicial": "pasajeros", "bajan": "pasajeros", "suben": "nuevos pasajeros", "pregunta": "¿Cuántos pasajeros van en el autobús?"},
    {"vehiculo": "ascensor", "inicial": "personas", "bajan": "personas", "suben": "nuevas personas", "pregunta": "¿Cuántas personas van en el ascensor?"},
    {"vehiculo": "barco", "inicial": "turistas", "bajan": "turistas", "suben": "nuevos turistas", "pregunta": "¿Cuántos turistas van en el barco?"}
]

CONTEXTOS_M2_L2 = [
    {"sujeto": "Lucas", "accion": "gastó", "objeto": "monedas de oro", "ubicacion": "la armería", "pregunta": "¿Cuántas monedas tenía Lucas al inicio?"},
    {"sujeto": "Sofía", "accion": "regaló", "objeto": "figuritas brillantes", "ubicacion": "el colegio", "pregunta": "¿Cuántas figuritas tenía Sofía al inicio?"},
    {"sujeto": "Pedro", "accion": "perdió", "objeto": "globos inflados", "ubicacion": "el parque", "pregunta": "¿Cuántos globos tenía Pedro al inicio?"},
    {"sujeto": "Julia", "accion": "repartió", "objeto": "dulces de fresa", "ubicacion": "la fiesta", "pregunta": "¿Cuántos dulces tenía Julia al inicio?"}
]

CONTEXTOS_M2_L3 = [
    {"objeto": "un tanque", "unidad": "litros de agua", "accion_resta": "se consumen", "accion_evaporacion": "se evaporan", "pregunta": "¿Cuántos litros de agua quedan?"},
    {"objeto": "un almacén", "unidad": "cajas de galletas", "accion_resta": "se venden", "accion_evaporacion": "se dañan", "pregunta": "¿Cuántas cajas de galletas quedan?"},
    {"objeto": "una alcancía", "unidad": "monedas de plata", "accion_resta": "se retiran", "accion_evaporacion": "se pierden", "pregunta": "¿Cuántas monedas de plata quedan?"},
    {"objeto": "un huerto", "unidad": "zanahorias frescas", "accion_resta": "se cosechan", "accion_evaporacion": "se comen los conejos", "pregunta": "¿Cuántas zanahorias frescas quedan?"}
]

CONTEXTOS_M3_L1 = [
    {"nombre_a": "Carrito A", "nombre_b": "Carrito B", "util": "lápices", "basura": "gomas", "singular_basura": "goma", "unidad_moneda": "R$"},
    {"nombre_a": "Combo A", "nombre_b": "Combo B", "util": "pizzas", "basura": "refrescos", "singular_basura": "refresco", "unidad_moneda": "R$"},
    {"nombre_a": "Paquete A", "nombre_b": "Paquete B", "util": "libros", "basura": "cuadernos", "singular_basura": "cuaderno", "unidad_moneda": "R$"},
    {"nombre_a": "Caja A", "nombre_b": "Caja B", "util": "manzanas", "basura": "peras", "singular_basura": "pera", "unidad_moneda": "R$"}
]

CONTEXTOS_M3_L2 = [
    {"util": "cuadernos", "basura": "reglas", "singular_basura": "regla", "unidad_moneda": "R$"},
    {"util": "hamburguesas", "basura": "refrescos", "singular_basura": "refresco", "unidad_moneda": "R$"},
    {"util": "plátanos", "basura": "manzanas", "singular_basura": "manzana", "unidad_moneda": "R$"},
    {"util": "libros", "basura": "marcadores", "singular_basura": "marcador", "unidad_moneda": "R$"}
]

CONTEXTOS_M3_L3 = [
    {"menor": "estuche", "mayor": "mochila", "unidad_moneda": "R$"},
    {"menor": "pelota", "mayor": "bate", "unidad_moneda": "R$"},
    {"menor": "camisa", "mayor": "pantalón", "unidad_moneda": "R$"},
    {"menor": "cuaderno", "mayor": "libro", "unidad_moneda": "R$"}
]

CONTEXTOS_M4_L1 = [
    {"total": "dulces", "contenedor": "cajas", "pregunta": "¿Cuántos dulces van en cada caja?"},
    {"total": "lápices", "contenedor": "estuches", "pregunta": "¿Cuántos lápices van en cada estuche?"},
    {"total": "libros", "contenedor": "estantes", "pregunta": "¿Cuántos libros van en cada estante?"},
    {"total": "papas", "contenedor": "sacos", "pregunta": "¿Cuántas papas van en cada saco?"}
]

CONTEXTOS_M4_L2 = [
    {"total": "manzanas", "contenedor": "cajas", "pregunta_sobra": "¿Cuántas manzanas sobran al completar el máximo número de cajas posibles?"},
    {"total": "chocolates", "contenedor": "bolsitas", "pregunta_sobra": "¿Cuántos chocolates sobran al completar el máximo número de bolsitas posibles?"},
    {"total": "alumnos", "contenedor": "equipos", "pregunta_sobra": "¿Cuántos alumnos quedan sin equipo al formar la mayor cantidad de equipos de tamaño fijo?"},
    {"total": "juguetes", "contenedor": "cajas", "pregunta_sobra": "¿Cuántos juguetes quedan en la última caja incompleta al llenar todas las posibles?"}
]

CONTEXTOS_M4_L3 = [
    {"ciclo": ["Rojo (1)", "Verde (2)", "Azul (3)", "Amarillo (4)"], "nombre_dispositivo": "Una tira de luces", "accion": "parpadea cíclicamente", "paso_nombre": "parpadeo", "pregunta": "¿Qué número de color saldrá?"},
    {"ciclo": ["Rojo (1)", "Amarillo (2)", "Verde (3)", "Azul (4)"], "nombre_dispositivo": "Un semáforo inteligente", "accion": "cambia cíclicamente de color", "paso_nombre": "cambio", "pregunta": "¿Qué número de color saldrá?"},
    {"ciclo": ["Canastilla 1", "Canastilla 2", "Canastilla 3", "Canastilla 4"], "nombre_dispositivo": "Una rueda de la fortuna", "accion": "gira continuamente", "paso_nombre": "posición", "pregunta": "¿Qué canastilla queda abajo? (escribe el número de canastilla del 1 al 4)"},
    {"ciclo": ["Lucas (1)", "Ana (2)", "Juan (3)", "Sofía (4)"], "nombre_dispositivo": "Un juego de cartas", "accion": "reparte cartas", "paso_nombre": "carta", "pregunta": "¿A qué número de jugador le cae?"}
]

CONTEXTOS_M5_L1 = [
    {"sujeto": "una rana", "salto": "saltos", "unidad": "metros", "destino": "llegar exactamente a", "pregunta": "¿Cuántos saltos debe dar?"},
    {"sujeto": "un saltamontes", "salto": "saltos", "unidad": "metros", "destino": "recorrer exactamente", "pregunta": "¿Cuántos saltos necesita?"},
    {"sujeto": "un robot de juguete", "salto": "pasos", "unidad": "centímetros", "destino": "avanzar exactamente", "pregunta": "¿Cuántos pasos debe dar?"},
    {"sujeto": "un canguro", "salto": "saltos", "unidad": "metros", "destino": "recorrer exactamente", "pregunta": "¿Cuántos saltos debe dar?"}
]

CONTEXTOS_M5_L2 = [
    {"sujeto_a": "Un semáforo", "sujeto_b": "otro semáforo", "accion": "se enciende en verde", "unidad": "segundos", "pregunta": "¿en cuántos segundos volverán a coincidir?"},
    {"sujeto_a": "Un faro marítimo", "sujeto_b": "otro faro", "accion": "parpadea", "unidad": "segundos", "pregunta": "¿en cuántos segundos volverán a parpadear juntos?"},
    {"sujeto_a": "Una campana", "sujeto_b": "otra campana", "accion": "suena", "unidad": "minutos", "pregunta": "¿en cuántos minutos volverán a sonar juntas?"},
    {"sujeto_a": "Un autobús de la línea A", "sujeto_b": "un autobús de la línea B", "accion": "sale de la terminal", "unidad": "minutos", "pregunta": "¿en cuántos minutos volverán a salir juntos?"}
]

CONTEXTOS_M5_L3 = [
    {"sujeto": "dos cuerdas", "unidad": "metros", "pregunta": "¿De cuántos metros medirá cada pedazo?"},
    {"sujeto": "dos listones de madera", "unidad": "centímetros", "pregunta": "¿De cuántos centímetros medirá cada listón?"},
    {"sujeto": "dos cables eléctricos", "unidad": "metros", "pregunta": "¿De cuántos metros medirá cada cable?"},
    {"sujeto": "dos tablas de metal", "unidad": "centímetros", "pregunta": "¿De cuántos centímetros medirá cada tabla?"}
]

# Mapa para vincular (modulo_id, nivel_id) con el pool de contextos correspondiente
CONTEXTOS_MAP = {
    (1, 1): CONTEXTOS_M1_L1,
    (1, 2): CONTEXTOS_M1_L2,
    (1, 3): CONTEXTOS_M1_L3,
    (2, 1): CONTEXTOS_M2_L1,
    (2, 2): CONTEXTOS_M2_L2,
    (2, 3): CONTEXTOS_M2_L3,
    (3, 1): CONTEXTOS_M3_L1,
    (3, 2): CONTEXTOS_M3_L2,
    (3, 3): CONTEXTOS_M3_L3,
    (4, 1): CONTEXTOS_M4_L1,
    (4, 2): CONTEXTOS_M4_L2,
    (4, 3): CONTEXTOS_M4_L3,
    (5, 1): CONTEXTOS_M5_L1,
    (5, 2): CONTEXTOS_M5_L2,
    (5, 3): CONTEXTOS_M5_L3,
}

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
    
    # Obtener el contexto correspondiente a la familia (fam) para que original y espejos coincidan en el tema
    pool = CONTEXTOS_MAP.get((modulo_id, nivel_id))
    if not pool:
        raise ValueError(f"No hay contexto definido para modulo {modulo_id} nivel {nivel_id}")
    contexto = pool[(fam - 1) % len(pool)]
    
    # ── MÓDULO 1: El Detective Literario ─────────────────────────────────────
    if modulo_id == 1:
        if nivel_id == 1: # Aislamiento de Variables Críticas
            manzanas = rng.randint(10, 30)
            bicicletas = rng.randint(3, 10)
            regala = rng.randint(2, 8)
            ans = manzanas - regala
            enunciado = f"{prefix}{contexto['sujeto']} tiene {manzanas} {contexto['util']} y {bicicletas} {contexto['basura']} en su {contexto['ubicacion']}. {contexto['accion']} {regala} {contexto['short_util']} a su amigo. {contexto['pregunta']}"
            feedback = f"Resta solo la cantidad de {contexto['short_util']} y descarta las {contexto['short_basura']}, ya que la pregunta es sobre {contexto['short_util']}."
            vals = {"manzanas": manzanas, "bicicletas": bicicletas, "regala": regala}
        elif nivel_id == 2: # Datos Útiles vs. Datos Basura
            edad = rng.randint(8, 12)
            chocolates = rng.randint(15, 30)
            paletas = rng.randint(4, 12)
            regalo = rng.randint(3, 9)
            ans = chocolates - regalo
            enunciado = f"{prefix}{contexto['sujeto']} tiene {edad} años. Ayer a las 4:00 PM compró {chocolates} {contexto['util']} y {paletas} {contexto['basura']} en la tienda. Le regaló {regalo} {contexto['util']} a su hermano de 6 años. {contexto['pregunta']}"
            feedback = f"Ignora la edad de {contexto['sujeto']}, la hora y las {contexto['basura']}. Solo resta los {contexto['util']} que regaló/perdió de los iniciales."
            vals = {"edad": edad, "chocolates": chocolates, "paletas": paletas, "regalo": regalo}
        else: # Descarte por Incongruencia
            libros = rng.randint(10, 25)
            litros = rng.randint(5, 15)
            cuadernos = rng.randint(5, 15)
            ans = libros + cuadernos
            enunciado = f"{prefix}En {contexto['ubicacion']} hay {libros} {contexto['util_1']}, {litros} {contexto['basura']} y {cuadernos} {contexto['util_2']}. {contexto['pregunta']}"
            feedback = f"Las unidades de {contexto['short_basura']} se descartan por incongruencia física. Suma solo {contexto['short_util_1']} y {contexto['short_util_2']}."
            vals = {"libros": libros, "litros": litros, "cuadernos": cuadernos}

    # ── MÓDULO 2: Secuencia Temporal ──────────────────────────────────────────
    elif modulo_id == 2:
        if nivel_id == 1: # Operaciones Cronológicas
            inicial = rng.randint(20, 50)
            bajan = rng.randint(5, 15)
            suben = rng.randint(6, 18)
            ans = inicial - bajan + suben
            enunciado = f"{prefix}Un {contexto['vehiculo']} arranca la marcha con {inicial} {contexto['inicial']}. En la primera parada se bajan {bajan} {contexto['bajan']} y luego suben {suben} {contexto['suben']}. {contexto['pregunta']}"
            feedback = "Sigue la línea del tiempo paso a paso: resta primero los que bajan, y a ese resultado súmale los que suben."
            vals = {"inicial": inicial, "bajan": bajan, "suben": suben}
        elif nivel_id == 2: # Álgebra Retrospectiva
            gasto = rng.randint(10, 30)
            final = rng.randint(15, 40)
            ans = final + gasto
            enunciado = f"{prefix}{contexto['sujeto']} {contexto['accion']} {gasto} {contexto['objeto']} en {contexto['ubicacion']}. Ahora le quedan exactamente {final} {contexto['objeto']}. {contexto['pregunta']}"
            feedback = f"Camino inverso al pasado: si en el presente restaste lo gastado/regalado, para volver al inicio debes sumar lo que le queda más lo gastado/regalado."
            vals = {"gasto": gasto, "final": final}
        else: # Mutaciones Sucesivas
            agua = rng.randint(40, 80)
            consumo = rng.randint(10, 25)
            cresce = (agua - consumo)
            ans = cresce * 2 - 10
            enunciado = f"{prefix}En {contexto['objeto']} hay {agua} {contexto['unidad']}. {contexto['accion_resta'].capitalize()} {consumo} {contexto['unidad'].split()[0]} por la mañana, luego se duplica la cantidad restante, y por la tarde {contexto['accion_evaporacion']} 10 {contexto['unidad'].split()[0]}. {contexto['pregunta']}"
            feedback = "Resuelve en estricto orden: 1) resta lo consumido/vendido, 2) multiplica por 2 el resultado, 3) resta 10."
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
            enunciado = f"{prefix}{contexto['nombre_a']}: {lapices} {contexto['util']} y {gomas} {contexto['basura']} cuesta {contexto['unidad_moneda']} {tot_a}. {contexto['nombre_b']}: {lapices} {contexto['util']} y {gomas+1} {contexto['basura']} cuesta {contexto['unidad_moneda']} {tot_b}. ¿Cuánto cuesta 1 {contexto['singular_basura']}?"
            feedback = f"Deduce la diferencia: el {contexto['nombre_b']} tiene exactamente una {contexto['singular_basura']} más y cuesta la diferencia de los precios totales."
            vals = {"lapices": lapices, "gomas": gomas, "tot_a": tot_a, "tot_b": tot_b}
        elif nivel_id == 2: # Grilla de Doble Entrada
            precio_regla = rng.randint(2, 15)
            precio_cuaderno = rng.randint(6, 30)
            cant_cuadernos = rng.randint(2, 8)
            tot_a = cant_cuadernos * precio_cuaderno
            tot_b = tot_a + 2 * precio_regla
            ans = precio_regla
            enunciado = f"{prefix}Si {cant_cuadernos} {contexto['util']} cuestan {contexto['unidad_moneda']} {tot_a} en total, y {cant_cuadernos} {contexto['util']} con 2 {contexto['basura']} cuestan {contexto['unidad_moneda']} {tot_b}, ¿cuánto cuesta 1 {contexto['singular_basura']}?"
            feedback = f"Sustituye el valor conocido de los {contexto['util']} en la segunda cuenta, resta ese valor del total, y divide el sobrante entre las 2 {contexto['basura']}."
            vals = {"cuadernos": cant_cuadernos, "tot_a": tot_a, "tot_b": tot_b}
        else: # Álgebra Visual
            dif = rng.randint(2, 40)
            total = rng.randint(dif + 10, 250)
            if (total - dif) % 2 != 0:
                total += 1
            ans = (total - dif) // 2
            enunciado = f"{prefix}Un {contexto['menor']} y un {contexto['mayor']} cuestan {contexto['unidad_moneda']} {total} en total. El/la {contexto['mayor']} cuesta {contexto['unidad_moneda']} {dif} más que el/la {contexto['menor']}. ¿Cuánto cuesta el/la {contexto['menor']}?"
            feedback = "Estrategia de la Balanza: resta la diferencia del total general, y divide la cantidad remanente entre 2."
            vals = {"total": total, "dif": dif}

    # ── MÓDULO 4: Reparto y Residuos ─────────────────────────────────────────
    elif modulo_id == 4:
        if nivel_id == 1: # Agrupación Visual
            cajas = rng.choice([4, 5, 6, 8, 10])
            dulces = cajas * rng.randint(15, 40)
            ans = dulces // cajas
            enunciado = f"{prefix}Queremos empaquetar {dulces} {contexto['total']} en {cajas} {contexto['contenedor']} de forma que cada una tenga exactamente la misma cantidad. {contexto['pregunta']}"
            feedback = "Esta es una división perfecta. Divide el total de elementos entre la cantidad de contenedores de manera directa."
            vals = {"dulces": dulces, "cajas": cajas}
        elif nivel_id == 2: # Análisis de Resto
            capacidad = rng.randint(4, 8)
            manzanas = capacidad * rng.randint(5, 12) + rng.randint(1, capacidad - 1)
            ans = manzanas % capacidad
            enunciado = f"{prefix}Tenemos {manzanas} {contexto['total']} para guardar en {contexto['contenedor']} de {capacidad} unidades cada una. {contexto['pregunta_sobra']}"
            feedback = "El sobrante es el resto o residuo de la división entera. Divide el total entre la capacidad y calcula el residuo."
            vals = {"manzanas": manzanas, "capacidad": capacidad}
        else: # Sucesión Circular
            pasos = rng.randint(15, 60)
            ans_idx = (pasos - 1) % len(contexto['ciclo'])
            ans = ans_idx + 1
            elementos_ciclo = ", ".join(contexto['ciclo'])
            enunciado = f"{prefix}{contexto['nombre_dispositivo']} {contexto['accion']} en orden: {elementos_ciclo}. ¿Qué número de color/posición/jugador saldrá en el/la {contexto['paso_nombre']} {pasos}?"
            feedback = f"Divide el número de paso entre la longitud del ciclo ({len(contexto['ciclo'])}). El residuo te indicará la posición exacta."
            vals = {"pasos": pasos}

    # ── MÓDULO 5: Ciclos y Agrupaciones Máximas ──────────────────────────────
    else:
        if nivel_id == 1: # Visualización de Saltos y Empaques
            salto = rng.randint(3, 15)
            dist = salto * rng.randint(6, 40)
            ans = dist // salto
            enunciado = f"{prefix}{contexto['sujeto']} da {contexto['salto']} de {salto} {contexto['unidad']} de longitud en la recta numérica. ¿Cuántos {contexto['salto']} debe dar para {contexto['destino']} {dist} {contexto['unidad']}?"
            feedback = f"Divide la distancia total que debe recorrer entre la longitud de cada uno de sus {contexto['salto']}."
            vals = {"salto": salto, "dist": dist}
        elif nivel_id == 2: # Encuentros Periódicos - MCM
            a = rng.randint(3, 15)
            b = rng.randint(4, 25)
            while a == b:
                b = rng.randint(4, 25)
            ans = math.lcm(a, b)
            enunciado = f"{prefix}{contexto['sujeto_a']} {contexto['accion']} cada {a} {contexto['unidad']}, y {contexto['sujeto_b']} lo hace cada {b} {contexto['unidad']}. Si ambos coinciden ahora, {contexto['pregunta']}"
            feedback = "Calcula el Mínimo Común Múltiplo (MCM) de ambos intervalos de tiempo para hallar el momento de encuentro."
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
            enunciado = f"{prefix}Queremos cortar {contexto['sujeto']} de {a} {contexto['unidad']} y {b} {contexto['unidad']} en pedazos iguales lo más largos posible, sin que sobre nada. {contexto['pregunta']}"
            feedback = "Calcula el Máximo Común Divisor (MCD) de las dos longitudes para hallar el tamaño máximo de corte idéntico."
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
# GENERADOR DETERMINISTA DE PREGUNTAS DE DESAFÍO Y SUS DISTRACTORES INTELIGENTES
# ─────────────────────────────────────────────────────────────────────────────

def generate_challenge_question(modulo_id: int, desafio_id: int, idx: int) -> Dict[str, Any]:
    """Genera una pregunta única para los desafíos de la Fase 3, calculando distractores inteligentes."""
    seed = FASE3_ID * 1000000 + modulo_id * 10000 + desafio_id * 1000 + idx
    rng = random.Random(seed)
    
    # Múltiple opción para Desafíos 11 y 12. Evocación pura para 13.
    tipo = TipoPreguntaEnum.MULTIPLE_OPCION if desafio_id in (11, 12) else TipoPreguntaEnum.RESPUESTA_NUMERICA
    
    opciones = []
    
    if modulo_id == 1:
        a = rng.randint(20, 60) # globos (útil)
        b = rng.randint(4, 15)  # pelotas (basura)
        c = rng.randint(3, 10)  # regaló
        ans = a - c
        enunciado = f"María de 12 años tiene {a} globos y {b} pelotas de tenis. Ayer a las 3:00 PM regaló {c} globos. ¿Cuántos globos tiene ahora?"
        
        # Opciones pedagógicas
        opciones = [
            {"texto": str(ans), "es_correcta": True, "tipo_error": None, "feedback_error": None},
            {"texto": str(a - b), "es_correcta": False, "tipo_error": TipoErrorEnum.ATENCION, "feedback_error": "¡Cuidado! Restaste las pelotas de tenis en lugar de los globos."},
            {"texto": str(a + c), "es_correcta": False, "tipo_error": TipoErrorEnum.OPERACION_INCORRECTA, "feedback_error": "¡Atención! Sumaste los globos regalados en lugar de restarlos."},
            {"texto": str(ans + 2), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "Revisa bien tu resta, cometiste un pequeño error de cálculo."}
        ]
        
    elif modulo_id == 2:
        a = rng.randint(15, 45) # inicial
        b = rng.randint(5, 12)  # entregó (resta)
        c = rng.randint(6, 15)  # cargó (suma)
        ans = a - b + c
        enunciado = f"Un camión sale del patio con {a} cajas de frutas. Entrega {b} cajas en el supermercado y luego carga {c} cajas nuevas. ¿Cuántas cajas lleva?"
        
        opciones = [
            {"texto": str(ans), "es_correcta": True, "tipo_error": None, "feedback_error": None},
            {"texto": str(a + b - c), "es_correcta": False, "tipo_error": TipoErrorEnum.OPERACION_INCORRECTA, "feedback_error": "¡Cuidado! Sumaste las cajas entregadas y restaste las cargadas."},
            {"texto": str(a - b), "es_correcta": False, "tipo_error": TipoErrorEnum.PROBLEMA_INCOMPLETO, "feedback_error": "¡Atención! Olvidaste sumar las cajas nuevas que cargó el camión."},
            {"texto": str(ans + 2), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "Revisa tus cálculos aritméticos finales."}
        ]
        
    elif modulo_id == 3:
        p_item = rng.randint(15, 45)
        ans = p_item
        tot_a = 2 * p_item + 10
        tot_b = 3 * p_item + 10
        enunciado = f"Si 2 cuadernos y una cartuchera de R$ 10,00 cuestan R$ {tot_a}, y 3 cuadernos con la misma cartuchera cuestan R$ {tot_b}, ¿cuánto cuesta 1 cuaderno?"
        
        opciones = [
            {"texto": str(ans), "es_correcta": True, "tipo_error": None, "feedback_error": None},
            {"texto": str(tot_b - tot_a - 10), "es_correcta": False, "tipo_error": TipoErrorEnum.ATENCION, "feedback_error": "¡Cuidado! Restaste el valor de la cartuchera que ya estaba incluido en ambos totales."},
            {"texto": str(tot_a // 2), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "¡Atención! Dividiste el total entre los cuadernos sin descontar la cartuchera."},
            {"texto": str(ans + 5), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "Revisa bien la resta de la diferencia de precios."}
        ]
        
    elif modulo_id == 4:
        cap = rng.randint(4, 8)
        tot = cap * rng.randint(6, 12) + rng.randint(1, cap - 1)
        ans = tot % cap
        enunciado = f"Un panadero hizo {tot} panes y los agrupó en bolsas de {cap} panes cada una. ¿Cuántos panes quedaron sueltos fuera de las bolsas completas?"
        
        opciones = [
            {"texto": str(ans), "es_correcta": True, "tipo_error": None, "feedback_error": None},
            {"texto": str(tot // cap), "es_correcta": False, "tipo_error": TipoErrorEnum.OPERACION_INCORRECTA, "feedback_error": "¡Cuidado! Ese es el número de bolsas completas. Te preguntamos por los panes sueltos (el residuo)."},
            {"texto": str(cap - ans), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "¡Atención! Calculaste cuántos panes faltan para completar otra bolsa, no el sobrante actual."},
            {"texto": str((ans + 1) % cap), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "Revisa el cálculo del resto de tu división."}
        ]
        
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
        
        opciones = [
            {"texto": str(ans), "es_correcta": True, "tipo_error": None, "feedback_error": None},
            {"texto": str(a + b), "es_correcta": False, "tipo_error": TipoErrorEnum.OPERACION_INCORRECTA, "feedback_error": "¡Cuidado! No coinciden simplemente sumando ambos tiempos; debes hallar el Mínimo Común Múltiplo (MCM)."},
            {"texto": str(a * b), "es_correcta": False, "tipo_error": TipoErrorEnum.CALCULO, "feedback_error": "¡Atención! Multiplicar directamente no da el menor punto de encuentro si comparten divisores."},
            {"texto": str(math.gcd(a, b)), "es_correcta": False, "tipo_error": TipoErrorEnum.ATENCION, "feedback_error": "¡Cuidado! Calculaste el Máximo Común Divisor (MCD) en lugar del Mínimo Común Múltiplo (MCM)."}
        ]
        
    # Asegurar unicidad de las respuestas erróneas por si se solapan en casos fortuitos
    seen_texts = {str(ans)}
    filtered_opciones = [{"texto": str(ans), "es_correcta": True, "tipo_error": None, "feedback_error": None}]
    for opt in opciones:
        if opt["es_correcta"]:
            continue
        opt_text = str(opt["texto"])
        if opt_text not in seen_texts:
            seen_texts.add(opt_text)
            filtered_opciones.append(opt)
            
    # Rellenar con genéricos si hay colisiones fortuitas de números
    offset = 1
    while len(filtered_opciones) < 4:
        dummy_val = int(ans) + offset * 3
        offset += 1
        if str(dummy_val) not in seen_texts:
            seen_texts.add(str(dummy_val))
            filtered_opciones.append({
                "texto": str(dummy_val),
                "es_correcta": False,
                "tipo_error": TipoErrorEnum.CALCULO,
                "feedback_error": "Revisa los cálculos matemáticos con calma."
            })
            
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "tipo_pregunta": tipo,
        "operacion": "mixta",
        "opciones": filtered_opciones
    }


async def seed_preguntas_desafios(session: AsyncSession):
    print("Generando pool de Desafíos (mínimo 150 preguntas por desafío)...")
    
    # 5 módulos, cada uno con 3 desafíos (11, 12, 13)
    for modulo_id in range(1, 6):
        for desafio_id in (11, 12, 13):
            seccion = modulo_id * 1000 + desafio_id
            
            for idx in range(1, 151):
                q_data = generate_challenge_question(modulo_id, desafio_id, idx)
                
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
                    # Copiar y mezclar las opciones calculadas
                    options = list(q_data["opciones"])
                    random.shuffle(options)
                    
                    for order_idx, opt in enumerate(options):
                        alt = Alternativa(
                            pregunta_id=desafio_q.id,
                            texto=opt["texto"],
                            es_correcta=opt["es_correcta"],
                            orden=order_idx + 1,
                            tipo_error=opt["tipo_error"],
                            feedback_error=opt["feedback_error"]
                        )
                        session.add(alt)
                        
            print(f"  Módulo {modulo_id} Desafío {desafio_id} (150 preguntas con alternativas inteligentes) insertados.")
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
