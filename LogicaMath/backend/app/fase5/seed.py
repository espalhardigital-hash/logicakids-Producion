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

FASE5_ID = 5

async def clear_fase5_data(session: AsyncSession):
    print("Purging existing Fase 5 data for a clean overwrite...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE5_ID))
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
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE5_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE5_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE5_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE5_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE5_ID))
    await session.commit()
    print("Fase 5 data purged.")

async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando guión de textos (NivelTeoria) para Fase 5...")
    
    niveles_teoria = [
        # --- MÓDULO 1: Perímetro y Borde ---
        {
            "modulo_id": 1, "nivel_id": 1,
            "titulo": "Conteo directo de unidades lineales",
            "texto_descubrimiento": "El perímetro es la medida de la frontera exterior de una figura bidimensional. Para calcularlo en una grilla cuadrada, debes contar cada segmento individual del borde externo.",
            "diccionario": {"Perímetro": "La longitud total del borde exterior de una forma geométrica."},
            "advertencia": "¡Cuidado! No cuentes las líneas que están adentro de la figura, solo el borde exterior.",
            "ejemplos": [{"enunciado": "Contar el borde de un cuadrado de 2x2.", "pasos": [{"orden": 1, "texto": "Sumamos los 4 lados de 2 unidades cada uno: 2+2+2+2=8."}]}],
            "interactivos": [
                {"pregunta": "Un rectángulo tiene lados de 3 y 4 unidades. ¿Cuál es su perímetro?", "respuesta": "14", "feedback_acierto": "¡Correcto!", "feedback_error": "Recuerda sumar todos los bordes: 3+4+3+4."},
                {"pregunta": "Un cuadrado tiene lado 5. Su perímetro es:", "respuesta": "20", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica el lado por 4: 5x4."},
                {"pregunta": "El perímetro de un triángulo equilátero de lado 6 es:", "respuesta": "18", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma los tres lados iguales: 6+6+6."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 2,
            "titulo": "Cálculo analítico de perímetros sumando magnitudes",
            "texto_descubrimiento": "Cuando las figuras no están en una grilla, usamos sumas de aristas conocidas.",
            "diccionario": {"Arista": "Segmento de línea donde se unen dos caras."},
            "advertencia": "Asegúrate de sumar absolutamente todos los lados.",
            "ejemplos": [{"enunciado": "Sumar aristas de un polígono irregular: 5, 4, 3, 4, 5.", "pasos": [{"orden": 1, "texto": "Sumamos: 5+4+3+4+5 = 21."}]}],
            "interactivos": [
                {"pregunta": "Figura de lados: 2, 3, 2, 3. Perímetro:", "respuesta": "10", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma: 2+3+2+3."},
                {"pregunta": "Figura de lados: 1, 1, 1, 1, 1. Perímetro:", "respuesta": "5", "feedback_acierto": "¡Excelente!", "feedback_error": "Suma cinco unos."},
                {"pregunta": "Figura de lados: 10, 5, 10, 5. Perímetro:", "respuesta": "30", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma: 10+5+10+5."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 3,
            "titulo": "Conversión de unidades de longitud",
            "texto_descubrimiento": "Las medidas pueden expresarse en distintas unidades. Conocer la escala de conversión te permite traducir milímetros, centímetros, decímetros, metros y kilómetros.",
            "diccionario": {"1 metro (m)": "100 centímetros (cm)", "1 kilómetro (km)": "1000 metros (m)"},
            "advertencia": "Recuerda multiplicar o dividir por múltiplos de 10 al convertir.",
            "ejemplos": [{"enunciado": "Convertir 2 metros a centímetros.", "pasos": [{"orden": 1, "texto": "Multiplicamos 2 x 100 = 200 cm."}]}],
            "interactivos": [
                {"pregunta": "¿Cuántos centímetros hay en 3 metros?", "respuesta": "300", "feedback_acierto": "¡Correcto!", "feedback_error": "Multiplica los metros por 100."},
                {"pregunta": "¿Cuántos metros hay en 5 kilómetros?", "respuesta": "5000", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica los kilómetros por 1000."},
                {"pregunta": "¿Cuántos milímetros hay en 2 centímetros?", "respuesta": "20", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica los centímetros por 10."}
            ]
        },
        # --- MÓDULO 2: Área en Malha ---
        {
            "modulo_id": 2, "nivel_id": 1,
            "titulo": "Conteo analítico de unidades confinadas",
            "texto_descubrimiento": "El área es la medida del espacio bidimensional encerrado en una figura.",
            "diccionario": {"Área": "Cantidad de unidades cuadradas dentro de un contorno."},
            "advertencia": "Asegúrate de contar toda celda completa.",
            "ejemplos": [{"enunciado": "Área de un rectángulo 2x3 en grilla.", "pasos": [{"orden": 1, "texto": "Contamos 6 cuadraditos. Área = 6 u²."}]}],
            "interactivos": [
                {"pregunta": "¿Cuál es el área de un cuadrado de 4x4 unidades?", "respuesta": "16", "feedback_acierto": "¡Correcto!", "feedback_error": "Multiplica 4x4 o cuenta los cuadros."},
                {"pregunta": "Un rectángulo mide 5 de base y 2 de altura. Su área es:", "respuesta": "10", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 5x2."},
                {"pregunta": "Si pinto 3 filas de 3 cuadros, pinto:", "respuesta": "9", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 3x3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 2,
            "titulo": "Fusión de sectores triangulares",
            "texto_descubrimiento": "Dos triángulos formados por la diagonal de un cuadrado forman exactamente una unidad entera (1 u²).",
            "diccionario": {"Fusión": "Juntar mitades para formar unidades enteras."},
            "advertencia": "Si te queda una mitad sin par, la medida del área será un decimal o fracción.",
            "ejemplos": [{"enunciado": "Área de figura con 2 cuadrados enteros y 2 mitades.", "pasos": [{"orden": 1, "texto": "2 mitades = 1 entero. Total: 2 + 1 = 3 u²."}]}],
            "interactivos": [
                {"pregunta": "Si tengo 4 cuadrados enteros y 2 mitades. Área total:", "respuesta": "5", "feedback_acierto": "¡Correcto!", "feedback_error": "Las dos mitades suman 1."},
                {"pregunta": "Figura con 0 enteros y 4 mitades. Área:", "respuesta": "2", "feedback_acierto": "¡Excelente!", "feedback_error": "4 mitades son 2 enteros."},
                {"pregunta": "Si tengo 10 enteros y 6 mitades, área total:", "respuesta": "13", "feedback_acierto": "¡Brillante!", "feedback_error": "6 mitades son 3 enteros. Suma 10+3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 3,
            "titulo": "Estimación analítica de áreas irregulares",
            "texto_descubrimiento": "Cálculo en mallas densas donde combinamos enteros y fracciones para obtener el área total.",
            "diccionario": {"Irregular": "Sin forma predefinida clásica."},
            "advertencia": "¡Atención al sumar mitades y cuartos!",
            "ejemplos": [{"enunciado": "Contar en figura compleja.", "pasos": [{"orden": 1, "texto": "Separa en enteros y luego mitades para sumar."}]}],
            "interactivos": [
                {"pregunta": "¿Cuánto es 8 enteros más 8 mitades?", "respuesta": "12", "feedback_acierto": "¡Correcto!", "feedback_error": "8 mitades son 4 enteros."},
                {"pregunta": "¿Cuánto es 12 enteros más 2 mitades?", "respuesta": "13", "feedback_acierto": "¡Excelente!", "feedback_error": "2 mitades son 1 entero."},
                {"pregunta": "Si un polígono ocupa 5 enteros y 4 mitades, su área es:", "respuesta": "7", "feedback_acierto": "¡Brillante!", "feedback_error": "4 mitades = 2. 5 + 2 = 7."}
            ]
        },
        # --- MÓDULO 3: Figuras Compuestas y Simetría ---
        {
            "modulo_id": 3, "nivel_id": 1,
            "titulo": "Descomposición estructural de polígonos",
            "texto_descubrimiento": "Podemos dividir formas complejas en rectángulos simples.",
            "diccionario": {"Descomponer": "Dividir en figuras más pequeñas conocidas."},
            "advertencia": "Asegúrate de no solapar áreas.",
            "ejemplos": [{"enunciado": "Descomponer una 'L'.", "pasos": [{"orden": 1, "texto": "Separar en dos rectángulos y sumar sus áreas."}]}],
            "interactivos": [
                {"pregunta": "Un rectángulo de 10 u² y otro de 8 u² pegados suman:", "respuesta": "18", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma ambas áreas."},
                {"pregunta": "Figura T compuesta por techo de 12 u² y base de 4 u². Área:", "respuesta": "16", "feedback_acierto": "¡Excelente!", "feedback_error": "Suma 12+4."},
                {"pregunta": "L de 15 u² en el alto y 5 u² en el piso. Total:", "respuesta": "20", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 15+5."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 2,
            "titulo": "Análisis de conservación del área mediante Tangram",
            "texto_descubrimiento": "Trasladar y rotar piezas no cambia su área total.",
            "diccionario": {"Conservación": "El área no varía aunque la figura cambie de forma."},
            "advertencia": "Una pieza movida ocupa el mismo espacio.",
            "ejemplos": [{"enunciado": "Mover un triángulo de un lado a otro.", "pasos": [{"orden": 1, "texto": "El área de las partes no cambia al moverse."}]}],
            "interactivos": [
                {"pregunta": "Si un triángulo de 3 u² se rota, su nueva área es:", "respuesta": "3", "feedback_acierto": "¡Correcto!", "feedback_error": "Rotar no cambia el área."},
                {"pregunta": "Corto un papel de 10 u² en dos. ¿Cuánto suman las piezas?", "respuesta": "10", "feedback_acierto": "¡Excelente!", "feedback_error": "Suman lo mismo que el original."},
                {"pregunta": "Armo una casa con un Tangram de 16 u². El área de la casa es:", "respuesta": "16", "feedback_acierto": "¡Brillante!", "feedback_error": "El área se conserva al usar todas las piezas."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 3,
            "titulo": "Cálculo analítico de áreas sombreadas",
            "texto_descubrimiento": "Resta geométrica: Área Mayor - Área Menor = Área Sombreada.",
            "diccionario": {"Resta Geométrica": "A un todo le quitamos un hueco."},
            "advertencia": "Asegúrate de calcular correctamente el hueco interior.",
            "ejemplos": [{"enunciado": "Cuadrado de 10x10 con agujero de 2x2.", "pasos": [{"orden": 1, "texto": "100 - 4 = 96 u²."}]}],
            "interactivos": [
                {"pregunta": "Área exterior 50, área interior en blanco 10. ¿Área pintada?", "respuesta": "40", "feedback_acierto": "¡Correcto!", "feedback_error": "Resta 50 - 10."},
                {"pregunta": "Caja de 100 cm² con agujero de 25 cm². Área restante:", "respuesta": "75", "feedback_acierto": "¡Excelente!", "feedback_error": "Resta 100 - 25."},
                {"pregunta": "Pared de 20 u² con ventana de 4 u². ¿Área a pintar?", "respuesta": "16", "feedback_acierto": "¡Brillante!", "feedback_error": "Resta 20 - 4."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 4,
            "titulo": "Identificación de Ejes de Simetría",
            "texto_descubrimiento": "Un eje de simetría divide a una figura en dos mitades exactamente idénticas como en un espejo.",
            "diccionario": {"Simetría": "Espejo perfecto."},
            "advertencia": "Algunas figuras parecen simétricas pero tienen diferencias sutiles.",
            "ejemplos": [{"enunciado": "Ejes de un cuadrado.", "pasos": [{"orden": 1, "texto": "Tiene 4 ejes: horizontal, vertical y 2 diagonales."}]}],
            "interactivos": [
                {"pregunta": "¿Cuántos ejes de simetría tiene un círculo (infinitos, 0, 1)? Escribe 'infinitos'.", "respuesta": "infinitos", "feedback_acierto": "¡Correcto!", "feedback_error": "El círculo es perfectamente simétrico en cualquier diámetro."},
                {"pregunta": "¿Cuántos ejes de simetría tiene un cuadrado perfecto?", "respuesta": "4", "feedback_acierto": "¡Excelente!", "feedback_error": "Vertical, horizontal y dos diagonales."},
                {"pregunta": "¿Cuántos ejes tiene un triángulo equilátero?", "respuesta": "3", "feedback_acierto": "¡Brillante!", "feedback_error": "Desde cada vértice al lado opuesto."}
            ]
        },
        # --- MÓDULO 4: Conversión y Pantallas ---
        {
            "modulo_id": 4, "nivel_id": 1,
            "titulo": "Interpretación de la escala gráfica base",
            "texto_descubrimiento": "Mapas: 1 unidad de malla equivale a X metros reales.",
            "diccionario": {"Escala": "Relación entre el dibujo y la realidad."},
            "advertencia": "La escala en mapas afecta multiplicando la medida dibujada.",
            "ejemplos": [{"enunciado": "Plano donde 1cm = 5m. Línea de 3cm.", "pasos": [{"orden": 1, "texto": "Multiplicamos 3 x 5 = 15m."}]}],
            "interactivos": [
                {"pregunta": "Escala 1 u = 10m. Si un borde mide 4 u, ¿cuántos metros son?", "respuesta": "40", "feedback_acierto": "¡Correcto!", "feedback_error": "Multiplica 4x10."},
                {"pregunta": "Escala 1 u = 5km. Viajo 6 u. ¿Distancia real?", "respuesta": "30", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 6x5."},
                {"pregunta": "Escala 1 u = 2m. Altura de 15 u en el plano. ¿Altura real?", "respuesta": "30", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 15x2."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 2,
            "titulo": "Modelado analítico de la diagonal (pantallas)",
            "texto_descubrimiento": "Las pantallas se miden por su diagonal, que cruza de esquina a esquina.",
            "diccionario": {"Diagonal": "Línea que conecta dos vértices no adyacentes."},
            "advertencia": "La diagonal siempre es más larga que la base o la altura individual.",
            "ejemplos": [{"enunciado": "TV de 40 pulgadas de diagonal.", "pasos": [{"orden": 1, "texto": "Medida estándar de la esquina inferior a la superior opuesta."}]}],
            "interactivos": [
                {"pregunta": "Si un monitor se anuncia como '24 pulgadas', ¿qué mide 24 pulgadas? (escribe: la diagonal)", "respuesta": "la diagonal", "feedback_acierto": "¡Correcto!", "feedback_error": "Las pantallas se miden en la diagonal."},
                {"pregunta": "En un rectángulo de 3x4, ¿la diagonal mide 5? (Escribe 1 para SÍ, 2 para NO)", "respuesta": "1", "feedback_acierto": "¡Excelente!", "feedback_error": "Por Pitágoras, 3^2 + 4^2 = 5^2."},
                {"pregunta": "¿Qué es más largo en un TV, la base o la diagonal? (escribe: diagonal)", "respuesta": "diagonal", "feedback_acierto": "¡Brillante!", "feedback_error": "La diagonal siempre es el lado más largo (hipotenusa)."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 3,
            "titulo": "Conversión de unidades de superficie",
            "texto_descubrimiento": "En dos dimensiones, las escalas se multiplican al cuadrado. Por eso 1m no son 10cm, sino 10x10=100cm cuadrados, ¡pero cuidado! 1m = 100cm, entonces 1m² = 100x100 = 10,000cm².",
            "diccionario": {"Matriz Multiplicadora": "Para áreas, la escala se aplica dos veces (al cuadrado)."},
            "advertencia": "Confusión clásica: no multipliques solo por 10 o 100 si es superficie.",
            "ejemplos": [{"enunciado": "Convertir 1m² a cm².", "pasos": [{"orden": 1, "texto": "Como 1m = 100cm, 1m² = 100 * 100 = 10,000 cm²."}]}],
            "interactivos": [
                {"pregunta": "¿Cuántos centímetros cuadrados hay en 1 m²?", "respuesta": "10000", "feedback_acierto": "¡Correcto!", "feedback_error": "100 x 100 = 10000."},
                {"pregunta": "Si 1 dm = 10 cm, ¿cuántos cm² hay en 1 dm²?", "respuesta": "100", "feedback_acierto": "¡Excelente!", "feedback_error": "10 x 10 = 100."},
                {"pregunta": "Si 1 m = 10 dm, ¿cuántos dm² hay en 2 m²?", "respuesta": "200", "feedback_acierto": "¡Brillante!", "feedback_error": "1 m² = 100 dm². 2 m² = 200 dm²."}
            ]
        }
    ]

    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE5_ID, **data)
        session.add(nt)

def _gen_fase5_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    a, b = rng.randint(2, 20), rng.randint(2, 20)
    ans = a + b # Dummy math for now
    ans_str = str(ans)
    return {
        "enunciado": f"Pregunta generica M{mod_id} L{lvl_id}: {a} + {b}",
        "respuesta_correcta": ans_str,
        "expl": f"Resolvemos {a} + {b} = {ans}",
        "alts": [{"t": ans_str, "c": True}, {"t": str(ans+1), "c": False}, {"t": str(ans-1), "c": False}, {"t": str(ans+2), "c": False}]
    }

async def seed_practica_pool(session: AsyncSession):
    print("Sembrando pool de práctica Fase 5...")
    # Seed 10 questions per level just for structure.
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3), (3, 4),
        (4, 1), (4, 2), (4, 3)
    ]
    
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(120): # Generate 120 per section
            rng = random.Random(FASE5_ID * 100000 + seccion_id * 1000 + i)
            q_data = _gen_fase5_pool(rng, mod_id, lvl_id)
            
            p = Pregunta(
                fase_id=FASE5_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"], datos_numericos={"fase5": True},
                explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                estado=StatusEnum.ACTIVO
            )
            for idx, alt in enumerate(q_data["alts"]):
                p.alternativas.append(Alternativa(texto=alt["t"], es_correcta=alt["c"], orden=idx+1))
            session.add(p)
    await session.commit()

async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando configuraciones de progreso Fase 5...")
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3), (3, 4),
        (4, 1), (4, 2), (4, 3)
    ]
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        config = ConfiguracionProgreso(
            fase_id=FASE5_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=10, porcentaje_aprobacion=80, orden_desbloqueo=seccion_id,
            tipo_feedback="completo", usa_cronometro=False, tiempo_default_segundos=0
        )
        session.add(config)
    await session.commit()

async def run_fase5_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 5...")
    from app.seed import should_seed_phase, update_seed_version, SEED_VERSIONS
    async with AsyncSessionLocal() as session:
        if not await should_seed_phase(session, "fase_5", FASE5_ID):
            return
        
        res = await session.execute(select(Fase).where(Fase.id == FASE5_ID))
        if not res.scalar_one_or_none():
            fase = Fase(id=FASE5_ID, nombre="Geometría Plana y Medidas", descripcion="Desarrollar la comprensión del espacio bidimensional mediante el análisis visual y la conservación de la superficie.", orden=5, estado=StatusEnum.ACTIVO)
            session.add(fase)
            await session.flush()
            
        await clear_fase5_data(session)
        await seed_teoria_niveles(session)
        await seed_configuracion_progreso(session)
        await seed_practica_pool(session)
        await update_seed_version(session, "fase_5", SEED_VERSIONS.get("fase_5", "20260602_v1"))
        await session.commit()
    print("Fase 5 inyectada con éxito!")

if __name__ == "__main__":
    asyncio.run(run_fase5_seed())
