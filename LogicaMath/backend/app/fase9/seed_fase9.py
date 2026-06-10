import asyncio
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal

from app.models.sql_models import (
    Fase, Pregunta, Alternativa, ConfiguracionProgreso,
    StatusEnum, OperacionEnum, TipoPreguntaEnum, TipoErrorEnum,
    Intento, PoolAsignadoAlumno
)
from app.fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso

FASE9_ID = 9

async def clear_fase9_data(session: AsyncSession):
    print("Purging existing Fase 9 data...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE9_ID))
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
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE9_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE9_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE9_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE9_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE9_ID))
    await session.commit()
    print("Fase 9 data purged.")

async def seed_teoria_niveles_fase9(session: AsyncSession):
    print("Sembrando guión de textos para Fase 9...")
    niveles_teoria = [
        {"modulo_id": 1, "nivel_id": 1, "titulo": "Simulados Pedro II", "texto_descubrimiento": "Simulados...", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    ]
    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE9_ID, **data)
        session.add(nt)
    await session.commit()

async def inject_pedro_ii_history(session: AsyncSession):
    print("Inyectando Banco Histórico Pedro II...")
    
    # JSON estático simulado de preguntas reales de Pedro II
    preguntas_historicas = [
        {
            "seccion": 201, # Módulo 2 (Simulado Medio), Nivel 1
            "origen_examen": "Pedro II 2023",
            "enunciado": "Após uma aula passeio ao Museu Nacional, um estudante decidiu calcular o volume do sarcófago que viu, imaginando-o formado por peças de encastre. Se a imagem muestra 64 piezas visibles pero sabemos que es un cubo perfecto, ¿cuál es el volumen en cm³?",
            "tipo_pregunta": TipoPreguntaEnum.RESPUESTA_NUMERICA,
            "respuesta_correcta": "64",
            "alts": ["64", "27", "16", "128"],
            "datos_numericos": {
                "tipo_visual": "imagen",
                "url": "/assets/pedro2/2023_q14_sarcofago.jpg"
            },
            "errores_previstos": {
                "27": {"tutor_msg": "Ese es el volumen de un cubo de 3x3x3. Revisa el tamaño de la cuadrícula en la imagen."},
                "16": {"tutor_msg": "Esa es el área de una sola cara (4x4). El volumen es Largo × Ancho × Alto."}
            },
            "expl": "El bloque en la imagen forma un cubo de 4 unidades de largo, 4 de ancho y 4 de alto. El volumen es 4 × 4 × 4 = 64 cm³."
        },
        {
            "seccion": 201,
            "origen_examen": "Pedro II 2022",
            "enunciado": "Joana gasta el 25% de su mesada en pasajes. Si recibe R$ 120 al mes, ¿cuánto gasta en pasajes?",
            "tipo_pregunta": TipoPreguntaEnum.MULTIPLE_OPCION,
            "respuesta_correcta": "R$ 30",
            "alts": ["R$ 30", "R$ 25", "R$ 40", "R$ 15"],
            "datos_numericos": {
                "tipo_visual": "imagen",
                "url": "/assets/pedro2/2022_q08_torta.png"
            },
            "errores_previstos": {
                "R$ 25": {"tutor_msg": "Confundiste el porcentaje (25%) con el valor en reales."}
            },
            "expl": "El 25% es equivalente a 1/4. Dividimos 120 entre 4, lo que da R$ 30."
        }
    ]
    
    for idx, q_data in enumerate(preguntas_historicas):
        payload = {
            "fase9": True,
            "origen_examen": q_data["origen_examen"],
        }
        if "datos_numericos" in q_data:
            payload.update(q_data["datos_numericos"])
        
        p = Pregunta(
            fase_id=FASE9_ID, seccion=q_data["seccion"], operacion=OperacionEnum.MIXTA,
            tipo_pregunta=q_data["tipo_pregunta"], enunciado=q_data["enunciado"],
            respuesta_correcta=q_data["respuesta_correcta"], 
            datos_numericos=payload,
            errores_previstos=q_data.get("errores_previstos", {}),
            explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
            estado=StatusEnum.ACTIVO
        )
        
        if q_data["tipo_pregunta"] == TipoPreguntaEnum.MULTIPLE_OPCION:
            for idx_alt, alt in enumerate(q_data["alts"]):
                is_correct = (alt == q_data["respuesta_correcta"])
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx_alt+1))
        
        session.add(p)
    await session.commit()

async def run_fase9_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de FASE 9...")
    async with AsyncSessionLocal() as session:
        fase = await session.get(Fase, FASE9_ID)
        if not fase:
            fase = Fase(id=FASE9_ID, nombre="Simulados Colegio Pedro II", descripcion="Fase 9", orden=9, icono="🎓")
            session.add(fase)
            await session.commit()
            
        await clear_fase9_data(session)
        await seed_teoria_niveles_fase9(session)
        await inject_pedro_ii_history(session)
    print("FASE 9 COMPLETADA.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase9_seed())
