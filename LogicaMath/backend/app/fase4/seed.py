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
from app.fase4.theory_examples import obtener_ejemplos_expandidos_fase4

# ID de la Fase 4 en la base de datos
FASE4_ID = 4

class NivelTeoriaSeederSchema(BaseModel):
    modulo_id: int
    nivel_id: int
    titulo: str
    texto_descubrimiento: str
    diccionario: Dict[str, str]
    advertencia: str
    ejemplos: List[Dict[str, Any]]
    interactivos: List[Dict[str, Any]] = Field(..., min_items=3, max_items=3)

async def clear_fase4_data(session: AsyncSession):
    print("Purging existing Fase 4 data for quick iteration (Overwrite)...")
    
    # Get all question IDs for Phase 4
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE4_ID))
    pregunta_ids_list = result.scalars().all()
    
    if pregunta_ids_list:
        # Delete references to prevent ForeignKeyViolationError
        await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(IntentoPregunta).where(IntentoPregunta.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(Intento).where(Intento.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(pregunta_ids_list)))
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE4_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE4_ID))
    
    # Delete main questions
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE4_ID))
    
    # Delete progress config and theory
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE4_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE4_ID))
    
    await session.commit()
    print("Fase 4 data purged.")

async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando NivelTeoria para Fase 4...")
    
    niveles_teoria = [
        # --- MÓDULO 1: LA FRACCIÓN VISUAL ---
        # Nivel 1: Lectura y modelado en polígonos simétricos
        {
            "modulo_id": 1,
            "nivel_id": 1,
            "titulo": "Lectura de Fracciones",
            "texto_descubrimiento": "¡Bienvenido a la Fase 4! Los números pueden representar 'pedazos' de un bloque total. En una fracción, el denominador (abajo) es el creador de partes idénticas, y el numerador (arriba) indica cuántas de esas partes tomas o coloreas.",
            "diccionario": {
                "Numerador": "Número de partes coloreadas o seleccionadas de la unidad.",
                "Denominador": "Número total de partes idénticas en las que se divide el todo."
            },
            "advertencia": "El total de partes (pintadas y no pintadas) va abajo. Si una pizza se corta en 8 rebanadas y tomas 3, la fracción es 3/8, no 3/5.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(1, 1),
            "interactivos": [
                {
                    "enunciado": "Un círculo está dividido en 5 partes iguales y 2 están sombreadas. ¿Qué fracción representa? (Escribe en formato N/D)",
                    "respuesta": "2/5",
                    "feedback_acierto": "¡Excelente! 2 partes de un total de 5 se escribe como 2/5.",
                    "feedback_error": "Cuenta todos los sectores para el de abajo (5) y los pintados para el de arriba (2)."
                },
                {
                    "enunciado": "Si pintas 4 partes de un rectángulo de 6 porciones simétricas, ¿qué fracción has coloreado?",
                    "respuesta": "4/6",
                    "feedback_acierto": "¡Muy bien! 4 de 6 porciones se escribe 4/6.",
                    "feedback_error": "El total de divisiones es 6 (denominador) y tomas 4 (numerador)."
                },
                {
                    "enunciado": "Un círculo tiene 4 partes y todas están coloreadas. ¿Qué fracción representa?",
                    "respuesta": "4/4",
                    "feedback_acierto": "¡Correcto! 4/4 es lo mismo que la unidad entera.",
                    "feedback_error": "Si tomas 4 partes de 4 disponibles, la fracción es 4/4."
                }
            ]
        },
        # Nivel 2: Construcción de equivalencias
        {
            "modulo_id": 1,
            "nivel_id": 2,
            "titulo": "Fracciones Equivalentes",
            "texto_descubrimiento": "Las fracciones pueden usar disfraces. 1/2 pizza es lo mismo que 2/4. Representan la misma cantidad geométrica pero dividida de diferente manera. Multiplicar o dividir arriba y abajo por el mismo número crea un clon exacto.",
            "diccionario": {
                "Amplificación": "Multiplicar numerador y denominador por el mismo número para obtener una fracción equivalente.",
                "Equivalencia": "Fracciones con diferentes números que representan exactamente la misma porción del todo."
            },
            "advertencia": "Un denominador mayor no significa más cantidad. Si cortas la pizza en 8, los pedazos son menores que si la cortas en 2. ¡1/8 es menor que 1/2!",
            "ejemplos": obtener_ejemplos_expandidos_fase4(1, 2),
            "interactivos": [
                {
                    "enunciado": "Encuentra la fracción equivalente a 1/2 si multiplicamos arriba y abajo por 3. (Formato N/D)",
                    "respuesta": "3/6",
                    "feedback_acierto": "¡Excelente! 1/2 y 3/6 representan exactamente la mitad.",
                    "feedback_error": "Multiplica 1 × 3 y 2 × 3 para encontrar el resultado."
                },
                {
                    "enunciado": "Amplifica 2/3 por un factor de 2. ¿Cuál es el clon equivalente?",
                    "respuesta": "4/6",
                    "feedback_acierto": "¡Bien hecho! 2/3 es equivalente a 4/6.",
                    "feedback_error": "Duplica tanto el numerador (2 × 2) como el denominador (3 × 2)."
                },
                {
                    "enunciado": "¿Qué fracción equivalente a 4/8 se obtiene si dividimos numerador y denominador entre 4?",
                    "respuesta": "1/2",
                    "feedback_acierto": "¡Perfecto! Simplificaste la fracción a su expresión más simple: 1/2.",
                    "feedback_error": "Divide 4 ÷ 4 y 8 ÷ 4."
                }
            ]
        },
        # Nivel 3: Áreas fraccionarias en composiciones geométricas asimétricas
        {
            "modulo_id": 1,
            "nivel_id": 3,
            "titulo": "Áreas y Asimetrías",
            "texto_descubrimiento": "¡Cuidado con las divisiones desiguales! Para definir una fracción directamente contando pedazos, todas las porciones deben tener exactamente la misma área. Si son asimétricas, debemos usar deducción geométrica.",
            "diccionario": {
                "Simetría": "Porciones de forma y tamaño idénticos.",
                "Asimetría": "Partes de tamaños diferentes. Requiere subdivisión mental para hallar la fracción real."
            },
            "advertencia": "Si una figura está dividida en 4 y una de las partes es gigante, no puedes decir simplemente que cada porción es 1/4. ¡Primero debes igualar las áreas!",
            "ejemplos": obtener_ejemplos_expandidos_fase4(1, 3),
            "interactivos": [
                {
                    "enunciado": "Un cuadrado se divide en 2 rectángulos iguales por la mitad. ¿Qué fracción representa un rectángulo?",
                    "respuesta": "1/2",
                    "feedback_acierto": "¡Muy bien! Cada mitad es 1/2.",
                    "feedback_error": "Al ser dos partes idénticas, cada una representa 1/2."
                },
                {
                    "enunciado": "Un cuadrado de 4x4 cuadraditos tiene 8 pintados. ¿Qué fracción del total está pintada? (Simplificada, ej: 1/2)",
                    "respuesta": "1/2",
                    "feedback_acierto": "¡Exacto! 8 de 16 cuadraditos representa la mitad (1/2).",
                    "feedback_error": "Suma el total de cuadraditos (16) y los coloreados (8). Esto da 8/16, equivalente a 1/2."
                },
                {
                    "enunciado": "Si cortamos un círculo en 4 porciones, pero 2 de ellas son el triple de grandes que las otras, ¿son todas de 1/4?",
                    "respuesta": "no",
                    "feedback_acierto": "¡Correcto! En fracciones, todas las partes deben medir lo mismo.",
                    "feedback_error": "Responde 'sí' o 'no'. Las fracciones exigen que las partes sean exactamente iguales."
                }
            ]
        },

        # --- MÓDULO 2: FRACCIÓN DE CANTIDAD ---
        # Nivel 1: Cálculo de porciones unitarias (1/n) sobre grupos
        {
            "modulo_id": 2,
            "nivel_id": 1,
            "titulo": "Porciones de un Grupo",
            "texto_descubrimiento": "Las fracciones también operan sobre conjuntos de cosas: monedas, cartas o amigos. Calcular 1/n de un grupo significa repartir el grupo en n cajas de igual tamaño. El resultado de 1 caja es la porción unitaria.",
            "diccionario": {
                "Grupo Finito": "Un conjunto cerrado de unidades u objetos.",
                "Porción Unitaria": "El valor de una de las partes en que se divide el conjunto (1/n)."
            },
            "advertencia": "Para hallar 1/n de un número, simplemente divide el número total entre el denominador n.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(2, 1),
            "interactivos": [
                {
                    "enunciado": "Calcula 1/4 de 16 caramelos.",
                    "respuesta": "4",
                    "feedback_acierto": "¡Correcto! 16 ÷ 4 = 4.",
                    "feedback_error": "Divide 16 entre 4."
                },
                {
                    "enunciado": "Si tienes 15 manzanas y regalas 1/3, ¿cuántas manzanas regalas?",
                    "respuesta": "5",
                    "feedback_acierto": "¡Muy bien! 1/3 de 15 es 5 manzanas.",
                    "feedback_error": "Divide el total de manzanas (15) entre 3."
                },
                {
                    "enunciado": "Calcula 1/5 de 40 monedas.",
                    "respuesta": "8",
                    "feedback_acierto": "¡Excelente! 40 ÷ 5 = 8.",
                    "feedback_error": "Divide 40 entre 5."
                }
            ]
        },
        # Nivel 2: Operador compuesto (m/n de X) y algoritmo de dos pasos
        {
            "modulo_id": 2,
            "nivel_id": 2,
            "titulo": "El Motor de Dos Pasos",
            "texto_descubrimiento": "Para fracciones complejas como 3/4 de un número, aplicamos un motor de dos pasos: 1) Divide el total entre el denominador (abajo) para saber cuántos objetos van por caja. 2) Multiplica ese valor por el numerador (arriba) para reunir las cajas deseadas. Fórmula: (Total ÷ Denominador) × Numerador.",
            "diccionario": {
                "Paso de División": "Dividir el total entre el denominador para armar grupos.",
                "Paso de Multiplicación": "Multiplicar por el numerador para tomar los grupos deseados."
            },
            "advertencia": "Siempre divide primero entre el número de abajo. Si intentas multiplicar primero, obtendrás números gigantescos difíciles de calcular.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(2, 2),
            "interactivos": [
                {
                    "enunciado": "Calcula 3/4 de 24 cartas.",
                    "respuesta": "18",
                    "feedback_acierto": "¡Perfecto! 24 ÷ 4 = 6; luego 6 × 3 = 18.",
                    "feedback_error": "Primero divide 24 entre 4 (da 6), luego multiplica ese 6 por 3."
                },
                {
                    "enunciado": "Un cofre tiene 30 monedas. Tomas 2/3 de ellas. ¿Cuántas monedas tomas?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Brillante! 30 ÷ 3 = 10; luego 10 × 2 = 20.",
                    "feedback_error": "Divide 30 entre 3, y el resultado lo multiplicas por 2."
                },
                {
                    "enunciado": "Calcula 4/5 de 50 tazos.",
                    "respuesta": "40",
                    "feedback_acierto": "¡Impresionante! 50 ÷ 5 = 10; luego 10 × 4 = 40.",
                    "feedback_error": "Divide 50 entre 5 y multiplica por 4."
                }
            ]
        },
        # Nivel 3: Lógica del complemento y deducción del resto
        {
            "modulo_id": 2,
            "nivel_id": 3,
            "titulo": "Lógica del Complemento",
            "texto_descubrimiento": "Los matemáticos listos usan el 'complemento': si gastas 2/5 de tu dinero, sabes de inmediato que te queda 3/5, sin tener que calcular el gasto intermedio. La suma de lo que gastas y lo que te queda siempre debe dar la unidad completa (5/5).",
            "diccionario": {
                "Complemento": "La fracción necesaria para alcanzar la unidad entera.",
                "Fracción Restante": "Lo que queda después de restar la porción gastada o perdida."
            },
            "advertencia": "Presta atención a si la pregunta pide 'lo que se gastó' o 'lo que quedó'. ¡Ahí está la trampa!",
            "ejemplos": obtener_ejemplos_expandidos_fase4(2, 3),
            "interactivos": [
                {
                    "enunciado": "Si gastas 3/8 de tu dinero, ¿qué fracción te queda? (Formato N/D)",
                    "respuesta": "5/8",
                    "feedback_acierto": "¡Exacto! 8/8 - 3/8 = 5/8.",
                    "feedback_error": "Resta 3 de los 8 octavos totales para saber cuántos te quedan."
                },
                {
                    "enunciado": "Tenías 30 manzanas y regalaste 1/3. ¿Cuántas manzanas te QUEDAN?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Deducción perfecta! Regalaste 10 (1/3), por lo tanto te quedan 20 (2/3).",
                    "feedback_error": "Calcula 1/3 de 30 (que es 10) y réstaselo al total de 30."
                },
                {
                    "enunciado": "Un tanque de 50 litros vacía 2/5 de su agua. ¿Cuántos litros de agua QUEDAN adentro?",
                    "respuesta": "30",
                    "feedback_acierto": "¡Espectacular! Se vaciaron 20 litros, así que quedan 30.",
                    "feedback_error": "Calcula 2/5 de 50 (que es 20) y réstaselo a los 50 iniciales."
                }
            ]
        },

        # --- MÓDULO 3: PORCENTAJES RÁPIDOS Y PROMEDIOS ---
        # Nivel 1: Mapeo de porcentajes intuitivos: 50%, 25%, 10%
        {
            "modulo_id": 3,
            "nivel_id": 1,
            "titulo": "Porcentajes Intuitivos",
            "texto_descubrimiento": "Un porcentaje es solo una fracción que usa el 100 como denominador. Por ejemplo, 50% es 50/100, es decir, la mitad. Aprender a mapear los porcentajes comunes te dará velocidad sobrehumana de cálculo.",
            "diccionario": {
                "Porcentaje": "Relación numérica expresada como fracción de 100 partes.",
                "Mapeo Rápido": "50% es dividir entre 2, 25% es dividir entre 4, y 10% es dividir entre 10."
            },
            "advertencia": "Para calcular el 10% de un número terminado en cero, simplemente eliminas el último cero.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(3, 1),
            "interactivos": [
                {
                    "enunciado": "Calcula el 50% de 80.",
                    "respuesta": "40",
                    "feedback_acierto": "¡Excelente! La mitad de 80 es 40.",
                    "feedback_error": "50% significa la mitad. Divide 80 entre 2."
                },
                {
                    "enunciado": "Calcula el 25% de 120.",
                    "respuesta": "30",
                    "feedback_acierto": "¡Muy bien! Una cuarta parte de 120 es 30.",
                    "feedback_error": "25% equivale a dividir entre 4. Divide 120 entre 4."
                },
                {
                    "enunciado": "Calcula el 10% de 450.",
                    "respuesta": "45",
                    "feedback_acierto": "¡Perfecto! Quitamos el cero final y nos queda 45.",
                    "feedback_error": "10% es dividir entre 10. Divide 450 entre 10."
                }
            ]
        },
        # Nivel 2: Lectura e interpretación de gráficos circulares
        {
            "modulo_id": 3,
            "nivel_id": 2,
            "titulo": "Gráficos Circulares",
            "texto_descubrimiento": "Los gráficos circulares dividen un círculo completo en porciones que representan porcentajes. La suma de todos los sectores siempre equivale al 100% (la unidad entera).",
            "diccionario": {
                "Gráfico Circular": "Diagrama de sectores para visualizar la proporción de cada categoría.",
                "Porcentaje de Sector": "La porción de pastel asignada a cada variable."
            },
            "advertencia": "Lee siempre los porcentajes con cuidado. Si el gráfico completo representa un total de personas, debes aplicar el porcentaje a ese total.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(3, 2),
            "interactivos": [
                {
                    "enunciado": "En una encuesta del 100%, 45% prefiere chocolate, 30% vainilla y el resto frutilla. ¿Qué porcentaje prefiere frutilla?",
                    "respuesta": "25",
                    "feedback_acierto": "¡Correcto! 100% - 45% - 30% = 25%.",
                    "feedback_error": "Suma 45% y 30% y réstale el resultado a 100%."
                },
                {
                    "enunciado": "De un total de 400 personas, el 50% prefiere viajar en auto. ¿Cuántas personas son?",
                    "respuesta": "200",
                    "feedback_acierto": "¡Muy bien! El 50% de 400 es 200.",
                    "feedback_error": "50% es la mitad. Divide 400 entre 2."
                },
                {
                    "enunciado": "Si el 10% de un pastel representa 8 porciones, ¿de cuántas porciones era el pastel completo?",
                    "respuesta": "80",
                    "feedback_acierto": "¡Estupendo! Si 10% es 8, entonces el 100% es 8 × 10 = 80.",
                    "feedback_error": "Multiplica el valor del 10% por 10 para llegar al 100%."
                }
            ]
        },
        # Nivel 3: Comparación de tasas en gráficos de barras
        {
            "modulo_id": 3,
            "nivel_id": 3,
            "titulo": "Gráficos de Barras",
            "texto_descubrimiento": "Las barras nos permiten comparar cantidades rápidamente. La altura de la barra es el valor numérico. Podemos sumar barras para hallar totales o restarlas para ver diferencias.",
            "diccionario": {
                "Gráfico de Barras": "Diagrama que representa datos mediante columnas rectangulares.",
                "Eje Y": "La escala numérica vertical que define el valor de cada barra."
            },
            "advertencia": "Asegúrate de mirar bien las etiquetas del eje Y para no confundir las líneas de nivel.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(3, 3),
            "interactivos": [
                {
                    "enunciado": "Tres barras marcan: A=100, B=150, C=50. ¿Cuál es el total acumulado entre las tres?",
                    "respuesta": "300",
                    "feedback_acierto": "¡Excelente! 100 + 150 + 50 = 300.",
                    "feedback_error": "Suma los tres valores de forma directa."
                },
                {
                    "enunciado": "Usando las barras anteriores: ¿cuánto más grande es la barra B que la barra C?",
                    "respuesta": "100",
                    "feedback_acierto": "¡Exacto! 150 - 50 = 100.",
                    "feedback_error": "Resta el valor de la barra C (50) de la barra B (150)."
                },
                {
                    "enunciado": "Si sumamos las barras A (100) y C (50), ¿es el total igual a la barra B?",
                    "respuesta": "sí",
                    "feedback_acierto": "¡Bien pensado! 100 + 50 = 150, que es igual a B.",
                    "feedback_error": "Responde 'sí' o 'no'. Compara (100 + 50) con 150."
                }
            ]
        },
        # Nivel 4: El Punto de Equilibrio - Media Aritmética
        {
            "modulo_id": 3,
            "nivel_id": 4,
            "titulo": "La Media Aritmética",
            "texto_descubrimiento": "El promedio o media es el 'punto de equilibrio'. Imagina tener tres torres de bloques desiguales. Si juntas todos los bloques en una gran pila y luego los repartes en partes iguales para que todas las torres midan lo mismo, ¡ese es el promedio!",
            "diccionario": {
                "Promedio (Media)": "La suma de todos los valores dividida entre la cantidad de valores.",
                "Pila Única": "La suma acumulativa de todos los datos antes de dividir."
            },
            "advertencia": "No olvides realizar la división final. Si solo sumas los números, habrás completado la pila pero no la nivelación.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(3, 4),
            "interactivos": [
                {
                    "enunciado": "Calcula el promedio de las puntuaciones: 4, 8 y 12.",
                    "respuesta": "8",
                    "feedback_acierto": "¡Correcto! (4 + 8 + 12) = 24; luego 24 ÷ 3 = 8.",
                    "feedback_error": "Suma los tres números y divide el resultado entre 3."
                },
                {
                    "enunciado": "Dos amigos gastan R$ 10 y R$ 20. ¿Cuál es el promedio de gasto entre los dos?",
                    "respuesta": "15",
                    "feedback_acierto": "¡Muy bien! (10 + 20) ÷ 2 = 15.",
                    "feedback_error": "Suma los dos gastos (30) y divide entre 2."
                },
                {
                    "enunciado": "En tres días llovió 6 mm, 6 mm y 12 mm. ¿Cuál es el promedio de lluvia diaria?",
                    "respuesta": "8",
                    "feedback_acierto": "¡Brillante! (6 + 6 + 12) = 24; luego 24 ÷ 3 = 8.",
                    "feedback_error": "Suma los milímetros (24) y divide entre los 3 días."
                }
            ]
        },

        # --- MÓDULO 4: RAZÓN Y MEZCLAS ---
        # Nivel 1: Razones simples (a:b) y proporcionalidad directa
        {
            "modulo_id": 4,
            "nivel_id": 1,
            "titulo": "Razones y Proporciones",
            "texto_descubrimiento": "Una razón es cómo se relacionan dos cantidades. Si preparas limonada usando 3 tazas de agua por 1 de limón, la razón es 3:1. Para mantener el sabor en una jarra más grande, debes aplicar el mismo factor de escala a ambos ingredientes.",
            "diccionario": {
                "Razón (a:b)": "La relación proporcional entre dos cantidades.",
                "Factor de Escala": "El número por el cual multiplicas ambos ingredientes para ampliar la receta."
            },
            "advertencia": "Nunca cambies la proporción sumando. Si la receta es 3:1 y doblas el limón, debes doblar el agua (de 3 a 6), no sumarle 1.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(4, 1),
            "interactivos": [
                {
                    "enunciado": "La receta es 3 tazas de agua por 1 de limón (3:1). Si pones 3 tazas de limón, ¿cuánta agua necesitas?",
                    "respuesta": "9",
                    "feedback_acierto": "¡Excelente! Multiplicaste la receta por 3. 3 × 3 = 9.",
                    "feedback_error": "Si triplicaste el limón (de 1 a 3), debes triplicar el agua (de 3 a 9)."
                },
                {
                    "enunciado": "Pintura rosa usa 1 litro de rojo por 4 de blanco (1:4). Si pones 2 litros de rojo, ¿cuánto blanco usas?",
                    "respuesta": "8",
                    "feedback_acierto": "¡Perfecto! Duplicaste el rojo, así que duplicas el blanco (4 × 2 = 8).",
                    "feedback_error": "Multiplica el blanco (4) por 2 ya que duplicaste el rojo."
                },
                {
                    "enunciado": "Una masa requiere 1 huevo por 3 tazas de harina. Si usas 9 tazas de harina, ¿cuántos huevos necesitas?",
                    "respuesta": "3",
                    "feedback_acierto": "¡Muy bien! Triplicaste la harina (de 3 a 9), así que necesitas 3 huevos.",
                    "feedback_error": "Divide 9 entre 3 para saber cuántas veces se amplió la receta."
                }
            ]
        },
        # Nivel 2: Reparto proporcional de volúmenes macro
        {
            "modulo_id": 4,
            "nivel_id": 2,
            "titulo": "Reparto de Volúmenes",
            "texto_descubrimiento": "A veces debes preparar una cantidad total final. Para hacer 5 litros de verde mezclas 2 de azul y 3 de amarillo. ¿Qué pasa si te piden 50 litros de verde? Divides el pedido entre el total de tu receta (50 ÷ 5 = 10 veces) y escalas cada ingrediente por 10.",
            "diccionario": {
                "Volumen Macro": "La cantidad total final deseada de la mezcla.",
                "Receta Base": "La suma inicial de las partes de cada ingrediente."
            },
            "advertencia": "Primero suma las partes para saber cuánto produce una receta básica. Luego divide el pedido entre ese total para hallar el multiplicador.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(4, 2),
            "interactivos": [
                {
                    "enunciado": "Mezclas 2 litros de azul y 3 de amarillo (5L verde en total). Para hacer 15 litros de verde, ¿cuántos de azul usas?",
                    "respuesta": "6",
                    "feedback_acierto": "¡Muy bien! 15 ÷ 5 = 3 veces la receta. 2 azul × 3 = 6 litros.",
                    "feedback_error": "Divide 15 entre 5 para saber el multiplicador (3). Luego multiplica 2 por 3."
                },
                {
                    "enunciado": "Pintura rosa usa 1 de rojo y 4 de blanco (5L total). Para hacer 25 litros de rosa, ¿cuánto blanco necesitas?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Correcto! 25 ÷ 5 = 5 lotes. 4 blanco × 5 = 20 litros.",
                    "feedback_error": "Divide 25 entre 5 para hallar el lote (5) y multiplica el blanco por 5."
                },
                {
                    "enunciado": "Concreto lleva 3 de arena y 7 de grava (10 en total). Para hacer 30 paladas de mezcla, ¿cuántas son de arena?",
                    "respuesta": "9",
                    "feedback_acierto": "¡Excelente! 30 ÷ 10 = 3 lotes. 3 arena × 3 = 9 paladas.",
                    "feedback_error": "Divide 30 entre 10 (da 3) y multiplica la arena (3) por 3."
                }
            ]
        },
        # Nivel 3: Homogeneización de mezclas complejas
        {
            "modulo_id": 4,
            "nivel_id": 3,
            "titulo": "Mezclas Complejas",
            "texto_descubrimiento": "Las mezclas avanzadas operan con proporciones porcentuales. Si un perfume tiene 1 parte de esencia y 4 de alcohol, hay 5 partes totales. La esencia es 1/5 del total, lo que equivale al 20%.",
            "diccionario": {
                "Homogeneidad": "Distribución uniforme de los ingredientes en toda la mezcla.",
                "Fracción de Mezcla": "La relación entre un ingrediente y el volumen total de la mezcla."
            },
            "advertencia": "Recuerda que para hallar la fracción de un ingrediente, debes dividir su porción entre el TOTAL de las partes, no entre el otro ingrediente.",
            "ejemplos": obtener_ejemplos_expandidos_fase4(4, 3),
            "interactivos": [
                {
                    "enunciado": "Una mezcla tiene 1 parte de concentrado y 9 de agua (10 partes total). ¿Qué porcentaje es de concentrado? (Escribe el número, ej: 10)",
                    "respuesta": "10",
                    "feedback_acierto": "¡Perfecto! 1 de 10 partes equivale al 10%.",
                    "feedback_error": "La fracción es 1/10, multiplica por 100 para hallar el porcentaje."
                },
                {
                    "enunciado": "Un jugo de 200 ml contiene 25% de pulpa. ¿Cuántos ml de pulpa tiene?",
                    "respuesta": "50",
                    "feedback_acierto": "¡Excelente! 25% (un cuarto) de 200 es 50 ml.",
                    "feedback_error": "25% es dividir entre 4. Divide 200 entre 4."
                },
                {
                    "enunciado": "Si en 100 gramos de chocolate hay 10% de leche, ¿cuántos gramos son de chocolate puro?",
                    "respuesta": "90",
                    "feedback_acierto": "¡Brillante! Si 10% es leche, el 90% es chocolate puro. 90 gramos.",
                    "feedback_error": "Resta el 10% de leche (10g) del total de 100g."
                }
            ]
        }
    ]
    
    for t in niveles_teoria:
        # Validate using schema
        NivelTeoriaSeederSchema(**t)
        
        # Check if already exists
        result = await session.execute(
            select(NivelTeoria).where(and_(
                NivelTeoria.fase_id == FASE4_ID,
                NivelTeoria.modulo_id == t["modulo_id"],
                NivelTeoria.nivel_id == t["nivel_id"]
            ))
        )
        existing = result.scalar_one_or_none()
        if not existing:
            nt = NivelTeoria(
                fase_id=FASE4_ID,
                modulo_id=t["modulo_id"],
                nivel_id=t["nivel_id"],
                titulo=t["titulo"],
                texto_descubrimiento=t["texto_descubrimiento"],
                diccionario=t["diccionario"],
                advertencia=t["advertencia"],
                ejemplos=t["ejemplos"],
                interactivos=t["interactivos"]
            )
            session.add(nt)
    await session.commit()
    print("NivelTeoria para Fase 4 insertados exitosamente.")

async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando ConfiguracionProgreso para Fase 4...")
    
    # Módulo 1 (La Fracción Visual): 3 niveles de práctica
    # Módulo 2 (Fracción de Cantidad): 3 niveles de práctica
    # Módulo 3 (Porcentajes Rápidos y Promedios): 4 niveles de práctica
    # Módulo 4 (Razón y Mezclas): 3 niveles de práctica
    
    configs = []
    orden = 1
    
    # ── MÓDULOS 1, 2, 4 (3 niveles cada uno) ──
    for m_id in [1, 2, 4]:
        for n_id in range(1, 4):
            configs.append({
                "seccion": m_id * 100 + n_id,
                "operacion": OperacionEnum.MIXTA,
                "cantidad_requerida": 15,
                "porcentaje_aprobacion": 90,
                "orden_desbloqueo": orden,
                "usa_cronometro": False,
                "tiempo_default_segundos": None,
                "tipo_feedback": "detallado"
            })
            orden += 1
            
        # Desafíos
        configs.append({
            "seccion": m_id * 1000 + 11,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 20,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": orden,
            "usa_cronometro": True,
            "tiempo_default_segundos": 25,
            "tipo_feedback": "simple"
        })
        orden += 1
        configs.append({
            "seccion": m_id * 1000 + 12,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 20,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": orden,
            "usa_cronometro": True,
            "tiempo_default_segundos": 40,
            "tipo_feedback": "simple"
        })
        orden += 1
        configs.append({
            "seccion": m_id * 1000 + 13,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 10,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": orden,
            "usa_cronometro": True,
            "tiempo_default_segundos": 50,
            "tipo_feedback": "simple"
        })
        orden += 1

    # ── MÓDULO 3 (4 niveles de práctica) ──
    m_id = 3
    for n_id in range(1, 5):
        configs.append({
            "seccion": m_id * 100 + n_id,
            "operacion": OperacionEnum.MIXTA,
            "cantidad_requerida": 15,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": orden,
            "usa_cronometro": False,
            "tiempo_default_segundos": None,
            "tipo_feedback": "detallado"
        })
        orden += 1
        
    # Desafíos Módulo 3
    configs.append({
        "seccion": m_id * 1000 + 11,
        "operacion": OperacionEnum.MIXTA,
        "cantidad_requerida": 20,
        "porcentaje_aprobacion": 90,
        "orden_desbloqueo": orden,
        "usa_cronometro": True,
        "tiempo_default_segundos": 25,
        "tipo_feedback": "simple"
    })
    orden += 1
    configs.append({
        "seccion": m_id * 1000 + 12,
        "operacion": OperacionEnum.MIXTA,
        "cantidad_requerida": 20,
        "porcentaje_aprobacion": 90,
        "orden_desbloqueo": orden,
        "usa_cronometro": True,
        "tiempo_default_segundos": 40,
        "tipo_feedback": "simple"
    })
    orden += 1
    configs.append({
        "seccion": m_id * 1000 + 13,
        "operacion": OperacionEnum.MIXTA,
        "cantidad_requerida": 10,
        "porcentaje_aprobacion": 90,
        "orden_desbloqueo": orden,
        "usa_cronometro": True,
        "tiempo_default_segundos": 50,
        "tipo_feedback": "simple"
    })
    orden += 1

    # Default de la fase
    configs.append({
        "seccion": 0,
        "operacion": OperacionEnum.MIXTA,
        "cantidad_requerida": 15,
        "porcentaje_aprobacion": 90,
        "orden_desbloqueo": 99,
        "usa_cronometro": True,
        "tiempo_default_segundos": 60,
        "tipo_feedback": "simple"
    })

    for c in configs:
        conf = ConfiguracionProgreso(
            fase_id=FASE4_ID,
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
    print("ConfiguracionProgreso Fase 4 insertados exitosamente.")

def generate_practice_question_fase4(modulo_id: int, nivel_id: int, fam: int, var: int) -> Dict[str, Any]:
    seed = FASE4_ID * 100000 + modulo_id * 1000 + nivel_id * 100 + fam * 10 + var
    rng = random.Random(seed)
    es_espejo = var > 0
    prefix = "[ESPEJO] " if es_espejo else ""
    
    # ── MÓDULO 1: La Fracción Visual ─────────────────────────────────────────
    if modulo_id == 1:
        if nivel_id == 1: # Polígonos Simétricos
            den = rng.choice([3, 4, 5, 6, 8, 10])
            num = rng.randint(1, den - 1)
            ans = f"{num}/{den}"
            enunciado = f"{prefix}Identifica qué fracción representa la parte pintada de la pizza en la ilustración."
            feedback = f"Cuenta los trozos sombreados para el numerador ({num}) y los trozos totales para el denominador ({den})."
            vals = {"tipo_visual": "pizza", "cortes": den, "sombreados": list(range(num))}
        elif nivel_id == 2: # Equivalencias
            den_base = rng.choice([2, 3, 4, 5])
            num_base = rng.randint(1, den_base - 1)
            factor = rng.choice([2, 3])
            num = num_base * factor
            den = den_base * factor
            ans = f"{num}/{den}"
            enunciado = f"{prefix}Si amplificas la fracción {num_base}/{den_base} multiplicando tanto el numerador como el denominador por {factor}, ¿cuál es la nueva fracción?"
            feedback = f"Multiplica el de arriba ({num_base} × {factor} = {num}) y el de abajo ({den_base} × {factor} = {den})."
            vals = {"num_base": num_base, "den_base": den_base, "factor": factor}
        else: # Asimetría
            ans = "no"
            enunciado = f"{prefix}Un cuadrado está cortado en 4 secciones. Si 2 de ellas son rectángulos gigantes y las otras son cuadrangulares pequeños, ¿representa cada sección exactamente 1/4?"
            feedback = "En las fracciones, cada porción debe tener la misma área. Si el tamaño de las partes difiere, no representa la fracción 1/4. Escribe 'sí' o 'no'."
            vals = {}

    # ── MÓDULO 2: Fracción de Cantidad ───────────────────────────────────────
    elif modulo_id == 2:
        if nivel_id == 1: # Porción unitaria (1/n)
            den = rng.choice([3, 4, 5, 8, 10])
            mult = rng.randint(2, 10)
            total = den * mult
            ans = mult
            enunciado = f"{prefix}Calcula exactamente 1/{den} de {total} monedas de oro."
            feedback = f"Para hallar 1/{den} de {total}, dividimos el total entre el denominador {den}: {total} ÷ {den} = {ans}."
            vals = {"total": total, "den": den}
        elif nivel_id == 2: # Operador compuesto (m/n de X)
            den = rng.choice([3, 4, 5, 8])
            num = rng.randint(2, den - 1)
            mult = rng.randint(2, 8)
            total = den * mult
            ans = num * mult
            enunciado = f"{prefix}Calcula {num}/{den} de {total} manzanas de madera."
            feedback = f"Primero divide {total} entre el denominador {den} ({total} ÷ {den} = {mult}). Luego multiplica por el numerador {num} ({mult} × {num} = {ans})."
            vals = {"total": total, "num": num, "den": den}
        else: # Lógica del complemento
            den = rng.choice([4, 5, 8, 10])
            num = rng.randint(1, den - 2)
            comp_num = den - num
            mult = rng.randint(2, 6)
            total = den * mult
            ans = comp_num * mult
            enunciado = f"{prefix}Tenías {total} tazos. Regalaste {num}/{den} del total. ¿Cuántos tazos te QUEDAN?"
            feedback = f"Si regalaste {num}/{den}, te quedan {comp_num}/{den} del total. Calculamos {comp_num}/{den} de {total} = ({total} ÷ {den}) × {comp_num} = {ans}."
            vals = {"total": total, "num": num, "den": den, "comp_num": comp_num}

    # ── MÓDULO 3: Porcentajes Rápidos y Promedios ────────────────────────────
    elif modulo_id == 3:
        if nivel_id == 1: # Porcentajes intuitivos (50, 25, 10)
            pct = rng.choice([50, 25, 10])
            total = 100 if pct == 25 else 200
            total = total * rng.randint(1, 5)
            if pct == 50:
                ans = total // 2
                feedback = f"El 50% representa exactamente la mitad. Dividimos {total} entre 2: {ans}."
            elif pct == 25:
                ans = total // 4
                feedback = f"El 25% representa una cuarta parte. Dividimos {total} entre 4: {ans}."
            else:
                ans = total // 10
                feedback = f"El 10% representa una décima parte. Dividimos {total} entre 10: {ans}."
            enunciado = f"{prefix}Halla rápidamente el {pct}% de {total} tazas de café."
            vals = {"total": total, "pct": pct}
        elif nivel_id == 2: # Gráficos circulares
            pct_a = rng.choice([25, 30, 40, 50])
            pct_b = rng.choice([10, 20, 30])
            ans = 100 - pct_a - pct_b
            enunciado = f"{prefix}En un gráfico circular de preferencias, el {pct_a}% prefiere manzanas rojas, el {pct_b}% prefiere manzanas verdes y el resto prefiere uvas. ¿Qué porcentaje prefiere uvas?"
            feedback = f"La suma de los sectores de un gráfico circular es siempre 100%. Restamos: 100 - {pct_a} - {pct_b} = {ans}%."
            vals = {"pct_a": pct_a, "pct_b": pct_b}
        elif nivel_id == 3: # Gráficos de barras
            val_a = rng.randint(10, 50) * 10
            val_b = rng.randint(10, 50) * 10
            ans = abs(val_a - val_b)
            enunciado = f"{prefix}La barra A del gráfico indica {val_a} y la barra B indica {val_b}. ¿Cuál es la diferencia de valor entre la barra A y la barra B?"
            feedback = f"Restamos ambos valores para hallar la diferencia: |{val_a} - {val_b}| = {ans}."
            vals = {"val_a": val_a, "val_b": val_b}
        else: # Media Aritmética
            a = rng.randint(2, 10)
            b = rng.randint(3, 12)
            c = rng.randint(1, 15)
            # Asegurar divisible por 3
            while (a + b + c) % 3 != 0:
                c = rng.randint(1, 15)
            ans = (a + b + c) // 3
            enunciado = f"{prefix}Las alturas de tres torres de bloques son {a}, {b} y {c}. ¿Cuál es la altura promedio al nivelar las tres torres?"
            feedback = f"Suma los tres valores para hacer la pila única ({a} + {b} + {c} = {a+b+c}) y divide el resultado entre 3 ({a+b+c} ÷ 3 = {ans})."
            vals = {"a": a, "b": b, "c": c}

    # ── MÓDULO 4: Razón y Mezclas ────────────────────────────────────────────
    else:
        if nivel_id == 1: # Razones simples
            agua = rng.randint(2, 5)
            limon = 1
            factor = rng.randint(2, 5)
            ans = agua * factor
            enunciado = f"{prefix}La limonada clásica usa una razón de {agua} tazas de agua por 1 de limón ({agua}:1). Si usas {factor} tazas de limón en la jarra, ¿cuántas tazas de agua necesitas para conservar la proporción?"
            feedback = f"El limón se multiplicó por {factor}. Escala el agua multiplicándola por {factor}: {agua} × {factor} = {ans}."
            vals = {"agua": agua, "limon": limon, "factor": factor}
        elif nivel_id == 2: # Reparto proporcional
            azul = rng.randint(1, 3)
            amarillo = rng.randint(2, 4)
            receta_total = azul + amarillo
            factor = rng.randint(3, 8)
            pedido = receta_total * factor
            ans = azul * factor
            enunciado = f"{prefix}Una pintura mezcla {azul} litros de azul con {amarillo} litros de amarillo (haciendo {receta_total} litros de verde). Para preparar {pedido} litros de verde, ¿cuántos litros de azul necesitas?"
            feedback = f"Divide el pedido total ({pedido}) entre la receta base ({receta_total}) para hallar el lote: {pedido} ÷ {receta_total} = {factor} veces. Multiplica el azul: {azul} × {factor} = {ans}."
            vals = {"azul": azul, "amarillo": amarillo, "pedido": pedido}
        else: # Mezclas complejas
            ess = 1
            alc = rng.choice([3, 4, 9])
            total = ess + alc
            ans = (ess * 100) // total
            enunciado = f"{prefix}Una colonia se hace mezclando {ess} parte de esencia por {alc} partes de alcohol (haciendo {total} partes en total). ¿Qué porcentaje representa la esencia en la colonia?"
            feedback = f"La fracción de esencia es 1 de {total} partes totales (1/{total}). Multiplicamos por 100 para hallar el porcentaje: 100 ÷ {total} = {ans}%."
            vals = {"ess": ess, "alc": alc, "total": total}

    explicacion_html = (
        f"Recuerda seguir el orden pedagógico del Tutor Invisible:<br>"
        f"<b>Demostración:</b> {feedback}<br>"
        f"<b>Resultado esperado:</b> <span style='color:#A855F7'>{ans}</span>"
    )

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "valores": vals,
        "explicacion_profunda": explicacion_html,
        "operacion": "mixta"
    }

async def seed_preguntas_practica(session: AsyncSession):
    print("Generando pool de Práctica Libre de Fase 4 (15 familias por nivel)...")
    
    # 4 módulos
    modulos_niveles = {1: 3, 2: 3, 3: 4, 4: 3}
    for modulo_id, max_niv in modulos_niveles.items():
        for nivel_id in range(1, max_niv + 1):
            seccion = modulo_id * 100 + nivel_id
            
            # Generar 15 familias de preguntas por nivel
            for fam in range(1, 16):
                padre_id = f"f4_m{modulo_id}_l{nivel_id}_fam_{fam:03d}"
                
                for var in range(4):
                    q_data = generate_practice_question_fase4(modulo_id, nivel_id, fam, var)
                    
                    pregunta = Pregunta(
                        fase_id=FASE4_ID,
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
            print(f"  Módulo {modulo_id} Nivel {nivel_id} (15 familias × 4 variantes) insertados.")
            await session.flush()
            
    await session.commit()
    print("Pool de Práctica Libre de Fase 4 insertado.")

def generate_challenge_question_fase4(modulo_id: int, desafio_id: int, idx: int) -> Dict[str, Any]:
    seed = FASE4_ID * 1000000 + modulo_id * 10000 + desafio_id * 1000 + idx
    rng = random.Random(seed)
    
    # Múltiple opción para Desafíos 11 y 12. Evocación pura para 13.
    tipo = TipoPreguntaEnum.MULTIPLE_OPCION if desafio_id in (11, 12) else TipoPreguntaEnum.RESPUESTA_NUMERICA
    
    if modulo_id == 1:
        den = rng.choice([4, 5, 8, 10])
        num = rng.randint(1, den - 1)
        ans = f"{num}/{den}"
        enunciado = f"Un azulejo cuadrado está dividido en {den} tiras del mismo tamaño y {num} de ellas son de color morado. ¿Qué fracción representa el morado?"
    elif modulo_id == 2:
        den = rng.choice([3, 4, 5, 8])
        num = rng.randint(1, den - 1)
        mult = rng.randint(2, 6)
        total = den * mult
        ans = str(num * mult)
        enunciado = f"En una caja de herramientas con {total} tornillos, se usaron exactamente {num}/{den} del total. ¿Cuántos tornillos se utilizaron?"
    elif modulo_id == 3:
        if idx % 2 == 0:
            pct = rng.choice([50, 25, 10])
            total = 100 if pct == 25 else 200
            total = total * rng.randint(1, 3)
            ans = str(total // 2 if pct == 50 else total // 4 if pct == 25 else total // 10)
            enunciado = f"Un informe reporta que el {pct}% de los {total} encuestados votó a favor. ¿Cuántas personas votaron a favor?"
        else:
            a = rng.randint(3, 15)
            b = rng.randint(2, 12)
            c = rng.randint(1, 10)
            while (a + b + c) % 3 != 0:
                c = rng.randint(1, 10)
            ans = str((a + b + c) // 3)
            enunciado = f"Las notas de tres exámenes de Sofía son {a}, {b} y {c}. ¿Cuál es la nota promedio de Sofía?"
    else: # Módulo 4
        agua = rng.randint(2, 5)
        factor = rng.choice([2, 3, 4])
        ans = str(agua * factor)
        enunciado = f"Un perfume requiere {agua} partes de solvente por 1 parte de fragancia. Si se elabora un frasco usando {factor} partes de fragancia, ¿cuánto solvente lleva para mantener la razón?"
        
    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(ans),
        "tipo_pregunta": tipo,
        "operacion": "mixta"
    }

async def seed_preguntas_desafios(session: AsyncSession):
    print("Generando pool de Desafíos de Fase 4 (30 preguntas por desafío)...")
    
    # 4 módulos, cada uno con 3 desafíos (11, 12, 13)
    for modulo_id in range(1, 5):
        for desafio_id in (11, 12, 13):
            seccion = modulo_id * 1000 + desafio_id
            
            for idx in range(1, 31):
                q_data = generate_challenge_question_fase4(modulo_id, desafio_id, idx)
                
                pregunta = Pregunta(
                    fase_id=FASE4_ID,
                    seccion=seccion,
                    operacion=OperacionEnum.MIXTA,
                    tipo_pregunta=q_data["tipo_pregunta"],
                    enunciado=q_data["enunciado"],
                    respuesta_correcta=q_data["respuesta_correcta"],
                    estructura_padre_id=f"f4_m{modulo_id}_d{desafio_id}_q_{idx:03d}",
                    datos_numericos={"es_desafio": True, "indice": idx},
                    explicacion_paso_a_paso={
                        "html": f"<b>Resolución de Desafío:</b> La respuesta correcta es {q_data['respuesta_correcta']}."
                    },
                    estado=StatusEnum.ACTIVO
                )
                session.add(pregunta)
                await session.flush()
                
                # Seeding alternativas for multiple choice challenges
                if q_data["tipo_pregunta"] == TipoPreguntaEnum.MULTIPLE_OPCION:
                    # Generate three incorrect choices
                    correct_val = q_data["respuesta_correcta"]
                    incorrect_choices = set()
                    
                    rng = random.Random(FASE4_ID * 100000 + seccion * 100 + idx)
                    
                    while len(incorrect_choices) < 3:
                        if "/" in correct_val:
                            # Fraction distractors
                            n_str, d_str = correct_val.split("/")
                            n, d = int(n_str), int(d_str)
                            dist_n = max(1, n + rng.choice([-1, 1, 2]))
                            dist_d = max(2, d + rng.choice([-1, 1, 2]))
                            val = f"{dist_n}/{dist_d}"
                        else:
                            # Integer distractors
                            c_val = int(correct_val)
                            dist = c_val + rng.choice([-2, -1, 1, 2, 5, 10])
                            val = str(max(0, dist))
                        
                        if val != correct_val:
                            incorrect_choices.add(val)
                            
                    choices = list(incorrect_choices) + [correct_val]
                    rng.shuffle(choices)
                    
                    for o_idx, opt in enumerate(choices):
                        alt = Alternativa(
                            pregunta_id=pregunta.id,
                            texto=opt,
                            es_correcta=(opt == correct_val),
                            orden=o_idx + 1,
                            tipo_error=TipoErrorEnum.CALCULO if opt != correct_val else None,
                            feedback_error="Esa alternativa es incorrecta. Vuelve a calcular." if opt != correct_val else None
                        )
                        session.add(alt)
            print(f"  Módulo {modulo_id} Desafío {desafio_id} (30 preguntas) insertadas.")
            await session.flush()
            
    await session.commit()
    print("Pool de Desafíos de Fase 4 insertado.")

async def run_fase4_seed():
    print("Iniciando inyección de Fase 4 en base de datos...")
    async with AsyncSessionLocal() as session:
        # Clear existing Fase 4 entries to prevent duplicates
        await clear_fase4_data(session)
        
        # 1. Seed Theory content
        await seed_teoria_niveles(session)
        
        # 2. Seed configs
        await seed_configuracion_progreso(session)
        
        # 3. Seed practice questions
        await seed_preguntas_practica(session)
        
        # 4. Seed challenges
        await seed_preguntas_desafios(session)
        
    print("Fase 4 seeded successfully!")

if __name__ == "__main__":
    asyncio.run(run_fase4_seed())
