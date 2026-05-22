import asyncio
import sys
import random
import json
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
)
from app.fase2.models import NivelTeoria

FASE3_ID = 3

async def clear_fase3_data(session: AsyncSession):
    print("Purging existing Fase 3 data for quick iteration (Overwrite)...")
    await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(
        select(Pregunta.id).where(Pregunta.fase_id == FASE3_ID)
    )))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE3_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE3_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE3_ID))
    await session.commit()
    print("Fase 3 data purged.")

async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando NivelTeoria para Fase 3...")
    
    niveles_teoria = [
        # --- MÓDULO 1 ---
        {
            "modulo_id": 1,
            "nivel_id": 1,
            "titulo": "El Lápiz Mágico",
            "texto_descubrimiento": "Enseña a leer la pregunta final antes de operar para filtrar distractores (Ej. Si preguntan por animales, ignorar las bicicletas).",
            "diccionario": {},
            "advertencia": "Lee la pregunta primero.",
            "ejemplos": [],
            "interactivos": []
        },
        {
            "modulo_id": 1,
            "nivel_id": 2,
            "titulo": "El Escudo Anti-Basura",
            "texto_descubrimiento": "Historias más largas con distractores numéricos engañosos que obligan a usar el escudo.",
            "diccionario": {},
            "advertencia": "Filtra la basura numérica.",
            "ejemplos": [],
            "interactivos": []
        },
        {
            "modulo_id": 1,
            "nivel_id": 3,
            "titulo": "El Laberinto Numérico",
            "texto_descubrimiento": "Problemas expertos donde todos los datos parecen importantes, pero solo algunos se relacionan directamente con la pregunta.",
            "diccionario": {},
            "advertencia": "Solo usa lo que te preguntan.",
            "ejemplos": [],
            "interactivos": []
        },
        # --- MÓDULO 2 ---
        {
            "modulo_id": 2,
            "nivel_id": 1,
            "titulo": "El Reloj hacia Adelante",
            "texto_descubrimiento": "¡Bienvenido al segundo módulo, Viajero del Tiempo! En estas misiones, las cosas cambian a medida que avanzan las horas. En la vida real, las historias matemáticas tienen un inicio, un medio y un final. Tu superpoder en este nivel es escribir la historia en estricto orden cronológico.",
            "diccionario": {
                "Paso 1": "¿Cuánto había al inicio?",
                "Paso 2": "¿Llegó más (suma) o se fue algo (resta)?",
                "Paso 3": "Calcula el final."
            },
            "advertencia": "¡Cuidado con la Trampa del Desorden Temporal! El monstruo del desorden quiere que leas todo rápido, tomes los números sueltos y los sumes o restes como caigan.",
            "ejemplos": [],
            "interactivos": [
                {
                    "pregunta": "Mateo tenía 15 tazos. Ganó 5, pero luego perdió 2. ¿Con cuántos llegó?",
                    "respuesta": "18",
                    "feedback_acierto": "¡Excelente!",
                    "feedback_error": "Pensamiento guía: 15 + 5 = 20; luego 20 - 2 = 18."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 2,
            "titulo": "El Reloj en Reversa",
            "texto_descubrimiento": "¡Alerta de anomalía temporal! Nos dice qué pasó en el medio y con cuánto terminó el personaje, pero no sabemos cómo empezó todo. Enciende tu Máquina del Tiempo en Reversa.",
            "diccionario": {
                "Perdió o gastó (-)": "Para volver al pasado tú debes sumar (+).",
                "Ganó o recibió (+)": "Para volver al pasado tú debes restar (-)."
            },
            "advertencia": "¡Cuidado con la Trampa del Signo Falso! No pongas un signo de resta solo porque leíste 'gastó'.",
            "ejemplos": [],
            "interactivos": [
                {
                    "pregunta": "Lucas regaló 4 juguetes y se quedó con 10. ¿Cuántos tenía al principio?",
                    "respuesta": "14",
                    "feedback_acierto": "¡Correcto!",
                    "feedback_error": "Viaje al pasado. Como regaló, realizamos la operación inversa: 10 + 4 = 14."
                }
            ]
        },
        {
            "modulo_id": 2,
            "nivel_id": 3,
            "titulo": "El Tiempo Multiplicado",
            "texto_descubrimiento": "A veces las cantidades crecen de golpe (multiplicación) o se reparten en partes iguales (división). Detecta la operación correcta.",
            "diccionario": {},
            "advertencia": "Si la cantidad crece de golpe repitiendo el mismo número, multiplicas. Si se corta en partes iguales, divides.",
            "ejemplos": [],
            "interactivos": []
        },
        {
            "modulo_id": 2,
            "nivel_id": 4,
            "titulo": "El Laberinto del Tiempo",
            "texto_descubrimiento": "Historias de tres o más pasos combinando las 4 operaciones. Congela la historia en cada punto y actualiza tu inventario.",
            "diccionario": {},
            "advertencia": "Congela la historia en cada punto.",
            "ejemplos": [],
            "interactivos": []
        },
        # --- MÓDULO 3 ---
        {
            "modulo_id": 3,
            "nivel_id": 1,
            "titulo": "El Enigma de los Carritos",
            "texto_descubrimiento": "Si miras dos carritos casi idénticos, pero uno tiene un producto de más y un precio más alto, esa diferencia de dinero es el precio de ese producto oculto.",
            "diccionario": {},
            "advertencia": "¡Cuidado con la Trampa del Reparto Ciego!",
            "ejemplos": [],
            "interactivos": [
                {
                    "pregunta": "Carrito A: 3 cuadernos, 1 lápiz = R$ 13,00. Carrito B: 3 cuadernos, 2 lápices = R$ 15,00. ¿1 lápiz?",
                    "respuesta": "2",
                    "feedback_acierto": "¡Correcto!",
                    "feedback_error": "Diferencia: 15 - 13 = 2."
                }
            ]
        },
        {
            "modulo_id": 3,
            "nivel_id": 2,
            "titulo": "Cruce de Datos",
            "texto_descubrimiento": "Cruza el precio descubierto de un cliente y mételo en la cuenta del segundo para revelar el precio que falta.",
            "diccionario": {},
            "advertencia": "Identifica qué producto ya tiene un valor fijo.",
            "ejemplos": [],
            "interactivos": []
        },
        {
            "modulo_id": 3,
            "nivel_id": 3,
            "titulo": "El Código Oculto",
            "texto_descubrimiento": "Sistemas camuflados: Resta la diferencia explícita del total, y divide el resultado en dos para hallar el valor del objeto menor.",
            "diccionario": {},
            "advertencia": "Aplica la estrategia de la balanza.",
            "ejemplos": [],
            "interactivos": [
                {
                    "pregunta": "Pantalón y camisa cuestan 50 en total. Pantalón cuesta 10 más. ¿Camisa?",
                    "respuesta": "20",
                    "feedback_acierto": "¡Correcto!",
                    "feedback_error": "50 - 10 = 40. 40 / 2 = 20."
                }
            ]
        },
        # --- MÓDULO 4 ---
        {
            "modulo_id": 4,
            "nivel_id": 1,
            "titulo": "El Reparto Perfecto",
            "texto_descubrimiento": "División exacta empaquetando inventarios gigantes.",
            "diccionario": {},
            "advertencia": "Asegura que el residuo sea cero.",
            "ejemplos": [],
            "interactivos": []
        },
        {
            "modulo_id": 4,
            "nivel_id": 2,
            "titulo": "Las Piezas Sobrantes",
            "texto_descubrimiento": "Encontrar el residuo; cuántos elementos no alcanzan para llenar un grupo completo.",
            "diccionario": {},
            "advertencia": "Calcula el resto de la división entera.",
            "ejemplos": [],
            "interactivos": []
        },
        {
            "modulo_id": 4,
            "nivel_id": 3,
            "titulo": "El Ciclo Infinito",
            "texto_descubrimiento": "Usar el residuo de una división para predecir qué pasará en un patrón circular repetitivo.",
            "diccionario": {},
            "advertencia": "El residuo te dice la posición en el ciclo.",
            "ejemplos": [],
            "interactivos": []
        }
    ]
    
    for nt in niveles_teoria:
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
    print("NivelTeoria Fase 3 insertados.")

async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando ConfiguracionProgreso para Fase 3...")
    configs = []
    modulo_niveles_map = {1: 3, 2: 4, 3: 3, 4: 3}
    
    for mod_id in range(1, 5):
        num_niveles = modulo_niveles_map[mod_id]
        
        # Practica
        for l in range(1, num_niveles + 1):
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
            "tiempo_default_segundos": 60,
            "tipo_feedback": "early_exit"
        })
        configs.append({
            "seccion": mod_id * 1000 + 12,
            "operacion": "mixta",
            "cantidad_requerida": 20,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 12,
            "usa_cronometro": True,
            "tiempo_default_segundos": 90,
            "tipo_feedback": "early_exit"
        })
        configs.append({
            "seccion": mod_id * 1000 + 13,
            "operacion": "mixta",
            "cantidad_requerida": 10,
            "porcentaje_aprobacion": 90,
            "orden_desbloqueo": 13,
            "usa_cronometro": True,
            "tiempo_default_segundos": 120,
            "tipo_feedback": "early_exit"
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
    print("ConfiguracionProgreso Fase 3 insertados.")

async def seed_preguntas_base(session: AsyncSession):
    print("Sembrando Preguntas base Fase 3...")
    
    preguntas = [
        # Módulo 2, Nivel 1 (Práctica)
        {
            "seccion": 201, "operacion": "mixta", "tipo": TipoPreguntaEnum.RESPUESTA_NUMERICA,
            "enunciado": "Un tren arranca con 20 pasajeros. Bajan 5 y suben 8. ¿Cuántos van ahora?",
            "respuesta_correcta": "23",
            "estructura_padre_id": "f3_m2_n1_p1",
            "datos_numericos": {"es_espejo": False, "seleccionable": True}
        },
        {
            "seccion": 201, "operacion": "mixta", "tipo": TipoPreguntaEnum.RESPUESTA_NUMERICA,
            "enunciado": "[ESPEJO 1] Un bus arranca con 30 pasajeros. Bajan 10 y suben 5. ¿Cuántos van ahora?",
            "respuesta_correcta": "25",
            "estructura_padre_id": "f3_m2_n1_p1",
            "datos_numericos": {"es_espejo": True, "explicacion_error": "Asegúrate de restar primero los que bajan y luego sumar los que suben."}
        },
        {
            "seccion": 201, "operacion": "mixta", "tipo": TipoPreguntaEnum.RESPUESTA_NUMERICA,
            "enunciado": "[ESPEJO 2] Un avión arranca con 50 pasajeros. Bajan 20 y suben 10. ¿Cuántos van ahora?",
            "respuesta_correcta": "40",
            "estructura_padre_id": "f3_m2_n1_p1",
            "datos_numericos": {"es_espejo": True, "explicacion_error": "¡Cuidado con el orden temporal! Resta primero, suma después."}
        },
        # Módulo 3, Nivel 1 (Práctica)
        {
            "seccion": 301, "operacion": "mixta", "tipo": TipoPreguntaEnum.RESPUESTA_NUMERICA,
            "enunciado": "Carrito A: 3 cuadernos, 1 lápiz = R$ 13,00. Carrito B: 3 cuadernos, 2 lápices = R$ 15,00. ¿1 lápiz?",
            "respuesta_correcta": "2",
            "estructura_padre_id": "f3_m3_n1_p1",
            "datos_numericos": {"es_espejo": False, "seleccionable": True}
        },
        {
            "seccion": 301, "operacion": "mixta", "tipo": TipoPreguntaEnum.RESPUESTA_NUMERICA,
            "enunciado": "[ESPEJO 1] Carrito A: 2 pizzas, 1 jugo = R$ 20,00. Carrito B: 2 pizzas, 2 jugos = R$ 25,00. ¿1 jugo?",
            "respuesta_correcta": "5",
            "estructura_padre_id": "f3_m3_n1_p1",
            "datos_numericos": {"es_espejo": True, "explicacion_error": "La diferencia de precio total es exactamente el valor del artículo extra."}
        },
    ]

    for p in preguntas:
        nueva_p = Pregunta(
            fase_id=FASE3_ID,
            seccion=p["seccion"],
            operacion=p["operacion"],
            tipo_pregunta=p["tipo"],
            enunciado=p["enunciado"],
            respuesta_correcta=p["respuesta_correcta"],
            estructura_padre_id=p["estructura_padre_id"],
            datos_numericos=p["datos_numericos"],
            estado=StatusEnum.ACTIVO,
            dificultad=1,
            nivel_taxonomia=1,
            tipo_error_frecuente=TipoErrorEnum.OPERACIONAL
        )
        session.add(nueva_p)

    print("Preguntas base Fase 3 insertadas.")

async def run_fase3_seed():
    async with AsyncSessionLocal() as session:
        try:
            # Overwrite logic
            await clear_fase3_data(session)
            await seed_teoria_niveles(session)
            await seed_configuracion_progreso(session)
            await seed_preguntas_base(session)
            await session.commit()
            print("✅ Sembrado de Fase 3 completado exitosamente.")
        except Exception as e:
            await session.rollback()
            print(f"❌ Error en seed Fase 3: {e}")

if __name__ == "__main__":
    asyncio.run(run_fase3_seed())
