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

FASE8_ID = 8

async def clear_fase8_data(session: AsyncSession):
    print("Purging existing Fase 8 data...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE8_ID))
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
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE8_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE8_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE8_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE8_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE8_ID))
    await session.commit()
    print("Fase 8 data purged.")

async def seed_teoria_niveles_fase8(session: AsyncSession):
    print("Sembrando guión de textos para Fase 8...")
    niveles_teoria = [
        {"modulo_id": 1, "nivel_id": 1, "titulo": "Secuencias Lógicas", "texto_descubrimiento": "Patrones...", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    ]
    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE8_ID, **data)
        session.add(nt)
    await session.commit()

async def _gen_fase8_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    if mod_id == 2: # Combinatoria Visual
        if lvl_id == 2:
            opciones = [rng.randint(2, 5) for _ in range(3)]
            ans = opciones[0] * opciones[1] * opciones[2]
            ans_str = str(ans)
            
            enunciado = f"Un candado de maleta tiene 3 rueditas. La primera tiene {opciones[0]} números, la segunda {opciones[1]} y la tercera {opciones[2]}. ¿Cuántas contraseñas distintas se pueden hacer?"
            expl = f"Usamos el Principio Multiplicativo: {opciones[0]} x {opciones[1]} x {opciones[2]} = {ans} combinaciones."
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans + 10), str(sum(opciones)), str(ans - 1)],
                "metadata_visual": {
                    "requiere_imagen": True,
                    "tipo_ilustracion": "caja_fuerte",
                    "ruedas": opciones
                },
                "errores_previstos": {
                    str(sum(opciones)): {"tutor_msg": "¡No los sumes! Por cada opción de la primera rueda, tienes varias en la segunda. Usa la multiplicación."}
                }
            }
    
    ans = "10"
    return {
        "enunciado": "Pregunta generada dinámicamente Fase 8",
        "respuesta_correcta": ans,
        "expl": "Explicación algorítmica.",
        "alts": [ans, "11", "12", "13"],
        "metadata_visual": {"requiere_imagen": False},
        "errores_previstos": {}
    }

async def seed_practica_pool_fase8(session: AsyncSession):
    print("Sembrando pool de práctica Fase 8...")
    sections = [(2, 2)]
    
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(10):
            rng = random.Random(FASE8_ID * 100000 + seccion_id * 1000 + i)
            q_data = await _gen_fase8_pool(rng, mod_id, lvl_id)
            
            payload = {
                "fase8": True,
                "metadata_visual": q_data.get("metadata_visual", {})
            }
            
            p = Pregunta(
                fase_id=FASE8_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
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

async def run_fase8_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de FASE 8...")
    async with AsyncSessionLocal() as session:
        fase = await session.get(Fase, FASE8_ID)
        if not fase:
            fase = Fase(id=FASE8_ID, nombre="Lógica, Combinatoria y Probabilidad", descripcion="Fase 8", orden=8, icono="🎲")
            session.add(fase)
            await session.commit()
            
        await clear_fase8_data(session)
        await seed_teoria_niveles_fase8(session)
        await seed_practica_pool_fase8(session)
    print("FASE 8 COMPLETADA.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase8_seed())
