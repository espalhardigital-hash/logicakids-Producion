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

import base64

def _svg_to_base64(svg_str: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg_str.encode('utf-8')).decode('utf-8')

def _generate_svg_fase7(mod_id: int, rng: random.Random) -> str:
    if mod_id == 1:
        # Fracciones Visuales: Grilla
        svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#374151" stroke-width="4"/><rect x="10" y="10" width="40" height="40" fill="#10B981"/><rect x="50" y="10" width="40" height="40" fill="white"/><rect x="10" y="50" width="40" height="40" fill="white"/><rect x="50" y="50" width="40" height="40" fill="white"/></svg>'
        return _svg_to_base64(svg)
    elif mod_id == 2:
        # Operaciones con fracciones
        svg = '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="40" height="40" fill="#8B5CF6"/><text x="80" y="60" font-size="30" fill="black">+</text><rect x="120" y="30" width="40" height="40" fill="#C4B5FD"/></svg>'
        return _svg_to_base64(svg)
    else:
        # Decimales visuales
        svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" stroke-width="4"/><path d="M 50 50 L 50 10 A 40 40 0 0 1 90 50 Z" fill="#F59E0B"/></svg>'
        return _svg_to_base64(svg)

async def _gen_fase7_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    svg_data = _generate_svg_fase7(mod_id, rng)
    
    if mod_id == 1:
        # Fracciones Visuales
        numerador = rng.randint(1, 4)
        denominador = rng.randint(5, 10)
        ans_str = f"{numerador}/{denominador}"
        enunciado = f"¿Qué fracción representa la parte coloreada si hay {numerador} cuadros pintados de un total de {denominador}?"
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Numerador: {numerador}. Denominador: {denominador}.",
            "alts": [ans_str, f"{denominador}/{numerador}", f"{numerador+1}/{denominador}", f"{numerador}/{denominador+1}"],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": {}
        }
    elif mod_id == 2:
        # Operaciones
        num1 = rng.randint(1, 3)
        num2 = rng.randint(1, 3)
        den = rng.randint(4, 7)
        ans = num1 + num2
        ans_str = f"{ans}/{den}"
        enunciado = f"Calcula la suma: {num1}/{den} + {num2}/{den}"
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Al tener el mismo denominador, se suman los numeradores: {num1} + {num2} = {ans}.",
            "alts": [ans_str, f"{ans}/{den*2}", f"{num1}/{den}", f"{num2}/{den}"],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": {}
        }
    else:
        # Decimales
        frac_num = rng.randint(1, 9)
        frac_den = 10
        ans = frac_num / frac_den
        ans_str = f"0.{frac_num}"
        enunciado = f"Convierte la fracción {frac_num}/{frac_den} a decimal."
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Al dividir por 10, movemos el punto decimal un lugar: {ans_str}.",
            "alts": [ans_str, f"0.0{frac_num}", f"{frac_num}.0", f"1.{frac_num}"],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": {}
        }

async def seed_practica_pool_fase7(session: AsyncSession):
    print("Sembrando pool de práctica Fase 7...")
    # 3 modulos x (3 practica + 3 desafios)
    sections = [(m, l) for m in range(1, 4) for l in [1, 2, 3, 11, 12, 13]]
    
    for mod_id, lvl_id in sections:
        if lvl_id > 10:
            seccion_id = mod_id * 1000 + lvl_id
            num_questions = 25 if lvl_id < 13 else 10
        else:
            seccion_id = mod_id * 100 + lvl_id
            num_questions = 15
            
        for i in range(num_questions):
            rng = random.Random(FASE7_ID * 100000 + seccion_id * 1000 + i)
            q_data = await _gen_fase7_pool(rng, mod_id, lvl_id)
            
            payload = q_data.get("metadata_visual", {})
            payload["fase7"] = True
            
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
