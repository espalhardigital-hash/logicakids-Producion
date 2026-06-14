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
        # Módulo 1: Secuencias Lógicas
        {"modulo_id": 1, "nivel_id": 1, "titulo": "Progresiones aritméticas", "texto_descubrimiento": "Hallar patrón de suma/resta", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 1, "nivel_id": 2, "titulo": "Progresiones compuestas", "texto_descubrimiento": "Multiplicación e intercaladas", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 1, "nivel_id": 3, "titulo": "Interpolación", "texto_descubrimiento": "Deducir término faltante", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 1, "nivel_id": 4, "titulo": "Desafío 1: Extensión directa", "texto_descubrimiento": "El Filtro", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 1, "nivel_id": 5, "titulo": "Desafío 2: Dos reglas simultáneas", "texto_descubrimiento": "La Trampa", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 1, "nivel_id": 6, "titulo": "Desafío Final: Exponencial", "texto_descubrimiento": "El Candado", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        
        # Módulo 2: Combinatoria Visual
        {"modulo_id": 2, "nivel_id": 1, "titulo": "Diagramas de árbol", "texto_descubrimiento": "Combinaciones filas × columnas", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 2, "nivel_id": 2, "titulo": "Principio multiplicativo", "texto_descubrimiento": "Opciones sin repetición", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 2, "nivel_id": 3, "titulo": "Divisores comunes", "texto_descubrimiento": "Empacar grupos exactos", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 2, "nivel_id": 4, "titulo": "Desafío 1: Multiplicación de uniformes", "texto_descubrimiento": "El Filtro", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 2, "nivel_id": 5, "titulo": "Desafío 2: Restricciones combinatorias", "texto_descubrimiento": "La Trampa", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 2, "nivel_id": 6, "titulo": "Desafío Final: Empaquetado tech", "texto_descubrimiento": "El Candado", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        
        # Módulo 3: Probabilidad
        {"modulo_id": 3, "nivel_id": 1, "titulo": "Clasificación determinística", "texto_descubrimiento": "Evento seguro, posible, imposible", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 3, "nivel_id": 2, "titulo": "Definición de Laplace", "texto_descubrimiento": "Casos Favorables / Posibles", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 3, "nivel_id": 3, "titulo": "Análisis probabilístico", "texto_descubrimiento": "Fracciones comparativas", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 3, "nivel_id": 4, "titulo": "Desafío 1: Fracción de probabilidad", "texto_descubrimiento": "El Filtro", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 3, "nivel_id": 5, "titulo": "Desafío 2: Cambio de espacio muestral", "texto_descubrimiento": "La Trampa", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
        {"modulo_id": 3, "nivel_id": 6, "titulo": "Desafío Final: Sólidos en cajas", "texto_descubrimiento": "El Candado", "diccionario": {}, "advertencia": "", "ejemplos": [], "interactivos": []},
    ]
    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE8_ID, **data)
        session.add(nt)
    await session.commit()

import base64

def _svg_to_base64(svg_str: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg_str.encode('utf-8')).decode('utf-8')

def _generate_svg_fase8(mod_id: int, rng: random.Random) -> str:
    if mod_id == 1:
        # Secuencias: Bolas amarillas en fila
        svg = '<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">'
        for i in range(4):
            svg += f'<circle cx="{50 + i*100}" cy="50" r="30" fill="#FDE047" stroke="#CA8A04" stroke-width="4"/>'
            if i < 3:
                svg += f'<path d="M {85 + i*100} 50 L {115 + i*100} 50" stroke="#CA8A04" stroke-width="4" marker-end="url(#arrow)"/>'
        svg += '</svg>'
        return _svg_to_base64(svg)
    elif mod_id == 2:
        # Combinatoria: Árbol simple
        svg = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="30" r="15" fill="#8B5CF6"/><path d="M 100 45 L 50 120" stroke="#8B5CF6" stroke-width="3"/><path d="M 100 45 L 150 120" stroke="#8B5CF6" stroke-width="3"/><circle cx="50" cy="135" r="15" fill="#C4B5FD"/><circle cx="150" cy="135" r="15" fill="#C4B5FD"/></svg>'
        return _svg_to_base64(svg)
    else:
        # Probabilidad: Dado
        svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" rx="10" fill="white" stroke="#374151" stroke-width="4"/><circle cx="50" cy="50" r="6" fill="#EF4444"/></svg>'
        return _svg_to_base64(svg)

async def _gen_fase8_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    svg_data = _generate_svg_fase8(mod_id, rng)
    
    if mod_id == 1:
        start = rng.randint(2, 10)
        step = rng.randint(2, 5)
        ans = start + step * 4
        ans_str = str(ans)
        enunciado = f"Observa la secuencia: {start}, {start+step}, {start+step*2}, {start+step*3}, ___. ¿Qué número sigue?"
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"El patrón es sumar {step}.",
            "alts": [ans_str, str(ans+1), str(ans-1), str(ans+step)],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": {}
        }
    elif mod_id == 2:
        op1 = rng.randint(3, 6)
        op2 = rng.randint(2, 5)
        ans = op1 * op2
        ans_str = str(ans)
        enunciado = f"Tienes {op1} opciones del primer tipo y {op2} del segundo. ¿Cuántas combinaciones diferentes puedes armar en total?"
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Multiplicamos {op1} x {op2} = {ans}.",
            "alts": [ans_str, str(op1+op2), str(ans+1), str(ans-1)],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": {}
        }
    else:
        rojas = rng.randint(2, 5)
        azules = rng.randint(2, 5)
        total = rojas + azules
        ans_str = f"{rojas}/{total}"
        enunciado = f"En una caja hay {rojas} esferas rojas y {azules} esferas azules. ¿Cuál es la probabilidad de sacar una roja?"
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Casos favorables = {rojas}. Total = {total}.",
            "alts": [ans_str, f"{azules}/{total}", f"{rojas}/{azules}", f"1/{total}"],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": {}
        }

async def seed_practica_pool_fase8(session: AsyncSession):
    print("Sembrando pool de práctica Fase 8...")
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
            rng = random.Random(FASE8_ID * 100000 + seccion_id * 1000 + i)
            q_data = await _gen_fase8_pool(rng, mod_id, lvl_id)
            
            payload = q_data.get("metadata_visual", {})
            payload["fase8"] = True
            
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
