import asyncio
import random
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal

from app.models.sql_models import (
    Fase, Pregunta, Alternativa, ConfiguracionProgreso,
    StatusEnum, OperacionEnum, TipoPreguntaEnum, TipoErrorEnum,
    Intento, PoolAsignadoAlumno
)
from app.fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso

FASE7_ID = 7

async def clear_fase7_data(session: AsyncSession):
    print("Purging existing Fase 7 data...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE7_ID))
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
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE7_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE7_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE7_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE7_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE7_ID))
    await session.commit()
    print("Fase 7 data purged.")

async def seed_teoria_niveles_fase7(session: AsyncSession):
    print("Sembrando guión de textos para Fase 7...")
    # Se agregarían aquí los textos largos definidos en fase7.md.
    # Por brevedad en la inicialización, insertamos placeholders que serán expandidos.
    niveles_teoria = [
        {"modulo_id": 1, "nivel_id": 1, "titulo": "La Brújula del Navegante", "texto_descubrimiento": "Orientación espacial...", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        # ... otros niveles
    ]
    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE7_ID, **data)
        session.add(nt)
    await session.commit()

async def _gen_fase7_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    # Generador algorítmico de variantes
    if mod_id == 4: # Tiempo y Horarios
        if lvl_id == 1:
            hora_inicio = rng.randint(8, 11)
            min_inicio = rng.choice([0, 15, 30])
            duracion = rng.choice([25, 45, 50])
            
            # Cálculo
            total_min = min_inicio + duracion
            hora_fin = hora_inicio + (total_min // 60)
            min_fin = total_min % 60
            
            ans = f"{hora_fin:02d}:{min_fin:02d}"
            
            enunciado = f"El bus sale a las {hora_inicio:02d}:{min_inicio:02d} y el viaje dura {duracion} minutos. ¿A qué hora llega?"
            expl = f"Sumamos los minutos: {min_inicio} + {duracion} = {total_min}. Esto es {total_min//60} hora(s) y {total_min%60} minutos. La hora final es {ans}."
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans,
                "expl": expl,
                "alts": [ans, f"{hora_fin+1:02d}:{min_fin:02d}", f"{hora_inicio:02d}:{min_fin:02d}", f"{hora_inicio+1:02d}:{(min_fin+10)%60:02d}"],
                "datos_numericos": {
                    "tipo_visual": "reloj",
                    "hora": f"{hora_inicio:02d}:{min_inicio:02d}"
                },
                "errores_previstos": {
                    f"{hora_inicio+1:02d}:{(total_min):02d}": {"tutor_msg": "Recuerda que una hora tiene 60 minutos, no 100."}
                }
            }
    
    # Default estandar para otros niveles no implementados completamente en el seeder aún
    ans = "10"
    return {
        "enunciado": "Pregunta generada dinámicamente Fase 7",
        "respuesta_correcta": ans,
        "expl": "Explicación algorítmica.",
        "alts": [ans, "11", "12", "13"],
        "metadata_visual": {"requiere_imagen": False},
        "errores_previstos": {}
    }

async def seed_practica_pool_fase7(session: AsyncSession):
    print("Sembrando pool de práctica Fase 7...")
    sections = [(4, 1)] # Ejemplo
    
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(10): # 10 variantes por nivel para testing
            rng = random.Random(FASE7_ID * 100000 + seccion_id * 1000 + i)
            q_data = await _gen_fase7_pool(rng, mod_id, lvl_id)
            
            payload = q_data.get("datos_numericos", {"fase7": True})
            
            p = Pregunta(
                fase_id=FASE7_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"], 
                datos_numericos=payload,
                errores_previstos=q_data.get("errores_previstos", {}),
                explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                estado=StatusEnum.ACTIVO
            )
            for idx, alt in enumerate(q_data["alts"]):
                is_correct = (alt == q_data["respuesta_correcta"])
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx+1))
            session.add(p)
    await session.commit()

async def run_fase7_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de FASE 7...")
    async with AsyncSessionLocal() as session:
        fase = await session.get(Fase, FASE7_ID)
        if not fase:
            fase = Fase(id=FASE7_ID, nombre="Coordenadas, Rutas y Tiempo", descripcion="Fase 7", orden=7, icono="🧭")
            session.add(fase)
            await session.commit()
            
        await clear_fase7_data(session)
        await seed_teoria_niveles_fase7(session)
        await seed_practica_pool_fase7(session)
    print("FASE 7 COMPLETADA.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase7_seed())
