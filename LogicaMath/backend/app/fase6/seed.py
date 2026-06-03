import asyncio
import random
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
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

FASE6_ID = 6

async def clear_fase6_data(session: AsyncSession):
    print("Purging existing Fase 6 data for a clean overwrite...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE6_ID))
    pregunta_ids_list = result.scalars().all()
    
    if pregunta_ids_list:
        await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids_list)))
        res_int_q = await session.execute(select(IntentoPregunta.id).where(IntentoPregunta.pregunta_id.in_(pregunta_ids_list)))
        int_q_ids = res_int_q.scalars().all()
        if int_q_ids:
            await session.execute(delete(IntentoPaso).where(IntentoPaso.intento_pregunta_id.in_(int_q_ids)))
            await session.execute(delete(IntentoPregunta).where(IntentoPregunta.id.in_(int_q_ids)))
            
        await session.execute(delete(Intento).where(Intento.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(pregunta_ids_list)))
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE6_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE6_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE6_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE6_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE6_ID))
    await session.commit()
    print("Fase 6 data purged.")

async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando guión de textos (NivelTeoria) para Fase 6...")
    
    niveles_teoria = [
        # --- MÓDULO 1: Reconocimiento 3D ---
        {
            "modulo_id": 1, "nivel_id": 1,
            "titulo": "Identificación de poliedros",
            "texto_descubrimiento": "Los poliedros son formas 3D con caras planas, aristas y vértices. Las aristas son los bordes, los vértices son las esquinas, y las caras son las superficies planas.",
            "diccionario": {"Vértice": "Esquina donde se unen las aristas.", "Cara": "Superficie plana del poliedro.", "Arista": "Línea donde se unen dos caras."},
            "advertencia": "No confundas las caras con las aristas. Un cubo tiene 6 caras pero 12 aristas.",
            "ejemplos": [{"enunciado": "Contar en un cubo.", "pasos": [{"orden": 1, "texto": "6 caras, 12 aristas, 8 vértices."}]}],
            "interactivos": [
                {"pregunta": "¿Cuántas caras tiene un cubo?", "respuesta": "6", "feedback_acierto": "¡Correcto!", "feedback_error": "Cuenta las superficies superior, inferior y los 4 lados."},
                {"pregunta": "¿Cuántos vértices tiene un cubo?", "respuesta": "8", "feedback_acierto": "¡Excelente!", "feedback_error": "Cuenta las esquinas: 4 arriba y 4 abajo."},
                {"pregunta": "¿Cuántas aristas tiene un cubo?", "respuesta": "12", "feedback_acierto": "¡Brillante!", "feedback_error": "Cuenta los bordes: 4 arriba, 4 abajo y 4 verticales."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 2,
            "titulo": "Detección de bloques ocultos",
            "texto_descubrimiento": "En las estructuras 3D, algunos bloques quedan ocultos a la vista. Necesitas imaginar qué sostiene a los bloques de arriba.",
            "diccionario": {"Perspectiva": "La forma en que se ve un objeto desde cierto ángulo."},
            "advertencia": "Todo bloque elevado necesita bloques debajo que lo sostengan.",
            "ejemplos": [{"enunciado": "Torre de 3 bloques de alto.", "pasos": [{"orden": 1, "texto": "Si ves el bloque superior, hay 2 debajo sosteniéndolo."}]}],
            "interactivos": [
                {"pregunta": "Si veo un bloque a una altura de 3 niveles, ¿cuántos bloques hay en su columna completa?", "respuesta": "3", "feedback_acierto": "¡Correcto!", "feedback_error": "Incluye el que ves y los que lo sostienen."},
                {"pregunta": "En una estructura en forma de cruz, el bloque central está en el nivel 2. ¿Cuántos bloques ocultos hay debajo?", "respuesta": "1", "feedback_acierto": "¡Excelente!", "feedback_error": "El nivel 1 sostiene al nivel 2."},
                {"pregunta": "Si cuento 5 bloques en total pero solo veo 4, ¿cuántos están ocultos?", "respuesta": "1", "feedback_acierto": "¡Brillante!", "feedback_error": "Resta el total menos los visibles."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 3,
            "titulo": "Asociación de moldes desplegados",
            "texto_descubrimiento": "Un molde (o planificación) es cómo se ve una forma 3D si la desdoblamos y la aplanamos.",
            "diccionario": {"Planificación": "Despliegue 2D de un poliedro 3D."},
            "advertencia": "Asegúrate de que las caras no se superpongan al armarlo.",
            "ejemplos": [{"enunciado": "Molde de cubo en forma de cruz.", "pasos": [{"orden": 1, "texto": "Tiene 4 cuadrados en línea y 2 a los lados. Al doblar, cierra perfecto."}]}],
            "interactivos": [
                {"pregunta": "¿Cuántos cuadrados debe tener un molde para formar un cubo cerrado?", "respuesta": "6", "feedback_acierto": "¡Correcto!", "feedback_error": "El cubo tiene 6 caras."},
                {"pregunta": "Si un molde tiene 5 caras, ¿formará un cubo cerrado? (1 para SÍ, 2 para NO)", "respuesta": "2", "feedback_acierto": "¡Excelente!", "feedback_error": "Faltará una tapa."},
                {"pregunta": "Un molde de cilindro tiene 2 círculos y un...", "respuesta": "rectángulo", "feedback_acierto": "¡Brillante!", "feedback_error": "El cuerpo del cilindro se aplana como rectángulo."}
            ]
        },
        # --- MÓDULO 2: Patrones de Crecimiento ---
        {
            "modulo_id": 2, "nivel_id": 1,
            "titulo": "Análisis de sucesiones espaciales",
            "texto_descubrimiento": "Un patrón espacial crece siguiendo una regla fija, por ejemplo, agregando 2 bloques en cada paso.",
            "diccionario": {"Sucesión": "Lista ordenada de elementos que sigue una regla."},
            "advertencia": "Identifica cuántos bloques se agregan en cada etapa.",
            "ejemplos": [{"enunciado": "Etapa 1: 1 bloque, Etapa 2: 3 bloques.", "pasos": [{"orden": 1, "texto": "La regla es sumar 2 bloques cada vez."}]}],
            "interactivos": [
                {"pregunta": "Si el patrón es 1, 3, 5, 7. ¿Cuántos bloques en la etapa 5?", "respuesta": "9", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma 2 al 7."},
                {"pregunta": "Si en la etapa 1 hay 2 bloques, etapa 2 hay 4 bloques, etapa 3 hay 6. ¿Regla? (escribe: suma 2)", "respuesta": "suma 2", "feedback_acierto": "¡Excelente!", "feedback_error": "Aumenta en 2."},
                {"pregunta": "Patrón: 2, 5, 8. Siguiente número:", "respuesta": "11", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 2,
            "titulo": "Conteo volumétrico estratificado",
            "texto_descubrimiento": "Cuentas los bloques capa por capa (estratos) para no perder ninguno.",
            "diccionario": {"Estrato": "Capa horizontal de bloques."},
            "advertencia": "Suma las cantidades de cada piso.",
            "ejemplos": [{"enunciado": "Pirámide de 2 pisos: 4 bloques abajo, 1 arriba.", "pasos": [{"orden": 1, "texto": "Total = 4 + 1 = 5."}]}],
            "interactivos": [
                {"pregunta": "Piso inferior 9, piso medio 4, piso superior 1. Total:", "respuesta": "14", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma 9+4+1."},
                {"pregunta": "Edificio de 3 pisos, 4 bloques por piso. Total:", "respuesta": "12", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 4x3."},
                {"pregunta": "Capa 1: 5 bloques, Capa 2: 3 bloques. Total:", "respuesta": "8", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 5+3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 3,
            "titulo": "Generalización algebraica",
            "texto_descubrimiento": "Usa fórmulas para saber cuántos bloques habrá en cualquier etapa 'N'.",
            "diccionario": {"Fórmula": "Regla matemática para calcular rápidamente."},
            "advertencia": "Sustituye la N por el número de etapa para calcular.",
            "ejemplos": [{"enunciado": "Regla 2xN. ¿Etapa 5?", "pasos": [{"orden": 1, "texto": "Sustituimos N=5. 2x5 = 10."}]}],
            "interactivos": [
                {"pregunta": "Regla: Nx3. ¿Etapa 4?", "respuesta": "12", "feedback_acierto": "¡Correcto!", "feedback_error": "Multiplica 4x3."},
                {"pregunta": "Regla: NxN. ¿Etapa 5?", "respuesta": "25", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 5x5."},
                {"pregunta": "Regla: N+4. ¿Etapa 10?", "respuesta": "14", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 10+4."}
            ]
        },
        # --- MÓDULO 3: Cubos Unitarios ---
        {
            "modulo_id": 3, "nivel_id": 1,
            "titulo": "Modelado del concepto de volumen (u³)",
            "texto_descubrimiento": "El volumen cuenta cuántos cubos pequeños caben dentro de una figura 3D.",
            "diccionario": {"Unidad cúbica (u³)": "Un cubo de 1x1x1."},
            "advertencia": "Cuentas espacio tridimensional, no solo el contorno.",
            "ejemplos": [{"enunciado": "Caja con 6 cubos adentro.", "pasos": [{"orden": 1, "texto": "Volumen = 6 u³."}]}],
            "interactivos": [
                {"pregunta": "Si apilo 4 cubos y luego pongo 4 cubos encima. Volumen total:", "respuesta": "8", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma 4+4."},
                {"pregunta": "Una línea de 5 cubos, repetida 2 veces. Volumen:", "respuesta": "10", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 5x2."},
                {"pregunta": "Tres columnas de 3 cubos. Volumen:", "respuesta": "9", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 3x3."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 2,
            "titulo": "Cálculo analítico formal de prismas",
            "texto_descubrimiento": "Usa la fórmula: Volumen = Largo × Ancho × Alto.",
            "diccionario": {"Fórmula Volumen": "Multiplica las tres dimensiones."},
            "advertencia": "Verifica que todas las medidas estén en la misma unidad antes de multiplicar.",
            "ejemplos": [{"enunciado": "Caja 2 x 3 x 4.", "pasos": [{"orden": 1, "texto": "Multiplicamos 2 x 3 x 4 = 24."}]}],
            "interactivos": [
                {"pregunta": "Caja de largo 5, ancho 2, alto 2. Volumen:", "respuesta": "20", "feedback_acierto": "¡Correcto!", "feedback_error": "Multiplica 5x2x2."},
                {"pregunta": "Cubo de lado 3. Volumen:", "respuesta": "27", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 3x3x3."},
                {"pregunta": "Habitación 4x4x3. Volumen:", "respuesta": "48", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 4x4x3."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 3,
            "titulo": "Relación entre volumen cúbico y líquidos",
            "texto_descubrimiento": "El volumen se relaciona directamente con los líquidos. 1 decímetro cúbico (dm³) equivale a 1 Litro (L).",
            "diccionario": {"1 Litro (L)": "1 dm³", "1 mL": "1 cm³"},
            "advertencia": "¡Ojo! 1 m³ son 1000 Litros, no 1 Litro.",
            "ejemplos": [{"enunciado": "Caja de 5 dm³. ¿Cuántos Litros caben?", "pasos": [{"orden": 1, "texto": "Como 1 dm³ = 1 L, entonces caben 5 L."}]}],
            "interactivos": [
                {"pregunta": "Un recipiente tiene 10 dm³. ¿Cuántos Litros de agua contiene?", "respuesta": "10", "feedback_acierto": "¡Correcto!", "feedback_error": "Los dm³ son iguales a los Litros."},
                {"pregunta": "Una botella tiene 500 cm³. ¿Cuántos mL tiene?", "respuesta": "500", "feedback_acierto": "¡Excelente!", "feedback_error": "Los cm³ son iguales a los mL."},
                {"pregunta": "Un tanque de 1 m³. ¿Cuántos Litros?", "respuesta": "1000", "feedback_acierto": "¡Brillante!", "feedback_error": "1 m³ contiene 1000 Litros."}
            ]
        },
        # --- MÓDULO 4: Medidas de Masa y Temperatura ---
        {
            "modulo_id": 4, "nivel_id": 1,
            "titulo": "Balanzas y Termómetros",
            "texto_descubrimiento": "Las balanzas miden masa (peso) y los termómetros miden temperatura. 1 kilogramo (kg) equivale a 1000 gramos (g).",
            "diccionario": {"1 kg": "1000 g", "Celsius (°C)": "Unidad de temperatura."},
            "advertencia": "Fíjate bien si la balanza marca kg o g.",
            "ejemplos": [{"enunciado": "Convertir 2 kg a gramos.", "pasos": [{"orden": 1, "texto": "Multiplicamos 2 x 1000 = 2000 g."}]}],
            "interactivos": [
                {"pregunta": "¿Cuántos gramos hay en 3 kg?", "respuesta": "3000", "feedback_acierto": "¡Correcto!", "feedback_error": "Multiplica 3x1000."},
                {"pregunta": "Medio kilo (0,5 kg) son cuántos gramos:", "respuesta": "500", "feedback_acierto": "¡Excelente!", "feedback_error": "La mitad de 1000 es 500."},
                {"pregunta": "Si un termómetro sube de 10° a 25°, aumentó:", "respuesta": "15", "feedback_acierto": "¡Brillante!", "feedback_error": "Resta 25 - 10."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 2,
            "titulo": "Variaciones térmicas y signo negativo",
            "texto_descubrimiento": "Las temperaturas pueden bajar por debajo de cero (negativas). Bajar de 5° a -2° significa bajar 7 grados.",
            "diccionario": {"Temperaturas Negativas": "Valores por debajo del cero."},
            "advertencia": "Cuando restas y pasas de cero, sumas las distancias.",
            "ejemplos": [{"enunciado": "Estaba a 3°, bajó 5°. ¿A qué temperatura quedó?", "pasos": [{"orden": 1, "texto": "3 - 5 = -2°."}]}],
            "interactivos": [
                {"pregunta": "Temperatura inicial 2°. Baja 5°. ¿Nueva temperatura?", "respuesta": "-3", "feedback_acierto": "¡Correcto!", "feedback_error": "2 - 5 = -3."},
                {"pregunta": "Temperatura inicial -4°. Sube 10°. ¿Nueva temperatura?", "respuesta": "6", "feedback_acierto": "¡Excelente!", "feedback_error": "-4 + 10 = 6."},
                {"pregunta": "Estaba a 10°, ahora está a -5°. ¿Cuánto bajó?", "respuesta": "15", "feedback_acierto": "¡Brillante!", "feedback_error": "10 hasta 0 son 10, y de 0 a -5 son 5 más."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 3,
            "titulo": "La Máquina Kelvin",
            "texto_descubrimiento": "Para convertir Celsius a Kelvin, sumamos 273. Para convertir de Kelvin a Celsius, restamos 273.",
            "diccionario": {"Kelvin a Celsius": "K - 273", "Celsius a Kelvin": "C + 273"},
            "advertencia": "La temperatura Kelvin nunca es negativa.",
            "ejemplos": [{"enunciado": "Convertir 10°C a Kelvin.", "pasos": [{"orden": 1, "texto": "10 + 273 = 283 K."}]}],
            "interactivos": [
                {"pregunta": "0°C en Kelvin es:", "respuesta": "273", "feedback_acierto": "¡Correcto!", "feedback_error": "0 + 273."},
                {"pregunta": "100°C en Kelvin es:", "respuesta": "373", "feedback_acierto": "¡Excelente!", "feedback_error": "100 + 273."},
                {"pregunta": "Si tengo 300 K, ¿cuántos grados Celsius son?", "respuesta": "27", "feedback_acierto": "¡Brillante!", "feedback_error": "Resta 300 - 273."}
            ]
        }
    ]

    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE6_ID, **data)
        session.add(nt)

def _gen_fase6_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    a, b = rng.randint(2, 20), rng.randint(2, 20)
    ans = a * b # Dummy math for now
    ans_str = str(ans)
    return {
        "enunciado": f"Pregunta generica M{mod_id} L{lvl_id}: {a} x {b}",
        "respuesta_correcta": ans_str,
        "expl": f"Calculamos {a} x {b} = {ans}",
        "alts": [{"t": ans_str, "c": True}, {"t": str(ans+1), "c": False}, {"t": str(ans-1), "c": False}, {"t": str(ans+2), "c": False}]
    }

async def seed_practica_pool(session: AsyncSession):
    print("Sembrando pool de práctica Fase 6...")
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3),
        (4, 1), (4, 2), (4, 3)
    ]
    
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(120): # Generate 120 per section
            rng = random.Random(FASE6_ID * 100000 + seccion_id * 1000 + i)
            q_data = _gen_fase6_pool(rng, mod_id, lvl_id)
            
            p = Pregunta(
                fase_id=FASE6_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"], datos_numericos={"fase6": True},
                explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                estado=StatusEnum.ACTIVO
            )
            for idx, alt in enumerate(q_data["alts"]):
                p.alternativas.append(Alternativa(texto=alt["t"], es_correcta=alt["c"], orden=idx+1))
            session.add(p)
    await session.commit()

async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando configuraciones de progreso Fase 6...")
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3),
        (4, 1), (4, 2), (4, 3)
    ]
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        config = ConfiguracionProgreso(
            fase_id=FASE6_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=10, porcentaje_aprobacion=80, orden_desbloqueo=seccion_id,
            tipo_feedback="completo", usa_cronometro=False, tiempo_default_segundos=0
        )
        session.add(config)
    await session.commit()

async def run_fase6_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 6...")
    from app.seed import should_seed_phase, update_seed_version, SEED_VERSIONS
    async with AsyncSessionLocal() as session:
        if not await should_seed_phase(session, "fase_6", FASE6_ID):
            return
        
        res = await session.execute(select(Fase).where(Fase.id == FASE6_ID))
        if not res.scalar_one_or_none():
            fase = Fase(id=FASE6_ID, nombre="Geometría Espacial, Volumen y Magnitudes Físicas", descripcion="Desarrollar la visualización tridimensional, el razonamiento abstracto analítico y la medición de magnitudes.", orden=6, estado=StatusEnum.ACTIVO)
            session.add(fase)
            await session.flush()
            
        await clear_fase6_data(session)
        await seed_teoria_niveles(session)
        await seed_configuracion_progreso(session)
        await seed_practica_pool(session)
        await update_seed_version(session, "fase_6", SEED_VERSIONS.get("fase_6", "20260602_v1"))
        await session.commit()
    print("Fase 6 inyectada con éxito!")

if __name__ == "__main__":
    asyncio.run(run_fase6_seed())
