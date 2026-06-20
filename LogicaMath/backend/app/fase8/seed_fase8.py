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

# --- DICCIONARIOS DE CONTEXTO FASE 8 ---
NOMBRES = ["Samuel", "Camila", "Julieta", "Emilio", "Valentina", "Nicolás"]
ROPA_1 = ["camisas", "poleras", "chaquetas", "pantalones"]
ROPA_2 = ["pantalones", "faldas", "zapatos", "gorras"]
CONTENEDORES = ["caja", "bolsa", "urna", "sombrero"]

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
    from app.fase8.content_fase8 import niveles_teoria_fase8
    
    for data in niveles_teoria_fase8:
        nt = NivelTeoria(fase_id=FASE8_ID, **data)
        session.add(nt)
    await session.commit()

import base64

def _svg_to_base64(svg_str: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg_str.encode('utf-8')).decode('utf-8')

def _generate_svg_fase8(mod_id: int, rng: random.Random, params: dict) -> str:
    if mod_id == 1:
        # Secuencias: Cajas con numeros
        start = params.get('start', 2)
        step = params.get('step', 2)
        svg = '<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" style="background:#F8FAFC; border-radius:8px;">'
        for i in range(5):
            val = start + step * i
            txt = "?" if i == 4 else str(val)
            color = "#EF4444" if i == 4 else "#3B82F6"
            svg += f'<rect x="{30 + i*90}" y="30" width="60" height="60" rx="10" fill="{color}" stroke="#1E3A8A" stroke-width="3"/>'
            svg += f'<text x="{60 + i*90}" y="68" font-size="24" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle">{txt}</text>'
            if i < 4:
                # flecha
                svg += f'<path d="M {95 + i*90} 60 Q {105 + i*90} 30 {115 + i*90} 60" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow)"/>'
                svg += f'<text x="{105 + i*90}" y="25" font-size="14" font-family="Arial" fill="#64748B" text-anchor="middle">+{step}</text>'
        svg += '</svg>'
        return _svg_to_base64(svg)
    elif mod_id == 2:
        # Combinatoria: Matriz de opciones o arbol
        op1 = params.get('op1', 3)
        op2 = params.get('op2', 2)
        svg = '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="background:#F0FDF4; border-radius:8px;">'
        svg += '<text x="200" y="30" font-size="16" font-family="Arial" font-weight="bold" fill="#166534" text-anchor="middle">Diagrama de Árbol (Opciones)</text>'
        
        # Draw central node
        svg += '<circle cx="20" cy="100" r="10" fill="#16A34A"/>'
        
        # Draw branches op1
        for i in range(op1):
            y1 = 50 + i * (120 / max(1, op1 - 1)) if op1 > 1 else 100
            svg += f'<path d="M 30 100 L 100 {y1}" stroke="#22C55E" stroke-width="2"/>'
            svg += f'<rect x="100" y="{y1-15}" width="30" height="30" rx="5" fill="#4ADE80"/>'
            # Draw branches op2
            for j in range(op2):
                y2 = y1 - 20 + j * (40 / max(1, op2 - 1)) if op2 > 1 else y1
                svg += f'<path d="M 130 {y1} L 220 {y2}" stroke="#86EFAC" stroke-width="2"/>'
                svg += f'<circle cx="230" cy="{y2}" r="8" fill="#10B981"/>'
        svg += '</svg>'
        return _svg_to_base64(svg)
    else:
        # Probabilidad: Urna con esferas rojas y azules
        rojas = params.get('rojas', 2)
        azules = params.get('azules', 3)
        svg = '<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg" style="background:#FEF2F2; border-radius:8px;">'
        # Draw jar
        svg += '<path d="M 100 50 L 100 200 A 50 20 0 0 0 200 200 L 200 50" fill="none" stroke="#94A3B8" stroke-width="6"/>'
        svg += '<ellipse cx="150" cy="50" rx="50" ry="15" fill="none" stroke="#94A3B8" stroke-width="6"/>'
        # Draw rojas
        for i in range(rojas):
            cx = 120 + (i % 3) * 30
            cy = 180 - (i // 3) * 30
            svg += f'<circle cx="{cx}" cy="{cy}" r="12" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>'
        # Draw azules
        for i in range(azules):
            cx = 135 + (i % 2) * 30
            cy = 120 - (i // 2) * 30
            svg += f'<circle cx="{cx}" cy="{cy}" r="12" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>'
        
        svg += f'<text x="150" y="240" font-size="16" font-family="Arial" font-weight="bold" fill="#475569" text-anchor="middle">Rojas: {rojas} | Azules: {azules}</text>'
        svg += '</svg>'
        return _svg_to_base64(svg)

async def _gen_fase8_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    nombre = rng.choice(NOMBRES)
    errores_previstos = {}

    if mod_id == 1:
        start = rng.randint(2, 10)
        step = rng.randint(2, 5)
        ans = start + step * 4
        ans_str = str(ans)
        enunciado = f"{nombre} está analizando la siguiente secuencia de números: {start}, {start+step}, {start+step*2}, {start+step*3}, ___. ¿Qué número sigue en la serie?"
        svg_data = _generate_svg_fase8(mod_id, rng, {'start': start, 'step': step})
        
        errores_previstos[str(ans+step)] = "Te saltaste un término. Calculaste el número que va después del espacio en blanco."
        
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"El patrón es sumar {step}.",
            "alts": [ans_str, str(ans+1), str(ans-1), str(ans+step)],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": errores_previstos
        }
    elif mod_id == 2:
        op1 = rng.randint(3, 6)
        op2 = rng.randint(2, 5)
        ans = op1 * op2
        ans_str = str(ans)
        ropa1 = rng.choice(ROPA_1)
        ropa2 = rng.choice(ROPA_2)
        enunciado = f"{nombre} tiene {op1} {ropa1} diferentes y {op2} {ropa2} distintos. ¿Cuántas combinaciones diferentes de atuendos puede armar usando uno de cada tipo?"
        svg_data = _generate_svg_fase8(mod_id, rng, {'op1': op1, 'op2': op2})
        
        errores_previstos[str(op1+op2)] = "Sumaste las opciones. Para hallar el total de combinaciones debes multiplicar las opciones de cada grupo."
        
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Multiplicamos {op1} x {op2} = {ans}.",
            "alts": [ans_str, str(op1+op2), str(ans+1), str(ans-1)],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": errores_previstos
        }
    else:
        rojas = rng.randint(2, 5)
        azules = rng.randint(2, 5)
        total = rojas + azules
        ans_str = f"{rojas}/{total}"
        contenedor = rng.choice(CONTENEDORES)
        enunciado = f"En un(a) {contenedor}, {nombre} guardó {rojas} esferas rojas y {azules} esferas azules. ¿Cuál es la probabilidad de sacar al azar una esfera que sea de color rojo?"
        svg_data = _generate_svg_fase8(mod_id, rng, {'rojas': rojas, 'azules': azules})
        
        errores_previstos[f"{azules}/{total}"] = "Calculaste la probabilidad de sacar una esfera azul, pero te piden una roja."
        errores_previstos[f"{rojas}/{azules}"] = "Comparaste rojas con azules. La probabilidad es la cantidad de rojas dividida por el TOTAL de esferas."
        
        return {
            "enunciado": enunciado,
            "respuesta_correcta": ans_str,
            "expl": f"Casos favorables = {rojas}. Total = {total}.",
            "alts": [ans_str, f"{azules}/{total}", f"{rojas}/{azules}", f"1/{total}"],
            "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
            "errores_previstos": errores_previstos
        }

async def seed_configuracion_progreso_fase8(session: AsyncSession):
    print("Sembrando configuraciones de progreso Fase 8...")
    sections = [(m, l) for m in range(1, 4) for l in [1, 2, 3, 11, 12, 13]]
    for mod_id, lvl_id in sections:
        if lvl_id > 10:
            seccion_id = mod_id * 1000 + lvl_id
            num_questions = 25 if lvl_id < 13 else 10
            usa_crono = True
            if lvl_id == 11:
                tiempo = 30
            elif lvl_id == 12:
                tiempo = 45
            else:
                tiempo = 60
        else:
            seccion_id = mod_id * 100 + lvl_id
            num_questions = 15
            usa_crono = False
            tiempo = None
            
        config = ConfiguracionProgreso(
            fase_id=FASE8_ID,
            seccion=seccion_id,
            operacion=OperacionEnum.MIXTA,
            cantidad_requerida=num_questions,
            porcentaje_aprobacion=90,
            orden_desbloqueo=lvl_id,
            usa_cronometro=usa_crono,
            tiempo_default_segundos=tiempo
        )
        session.add(config)
    await session.commit()

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
                error_msg = q_data.get("errores_previstos", {}).get(alt, "Esa alternativa es incorrecta. Vuelve a intentarlo.") if not is_correct else None
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx+1, tipo_error=TipoErrorEnum.CALCULO if not is_correct else None, feedback_error=error_msg))
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
        await seed_configuracion_progreso_fase8(session)
        await seed_practica_pool_fase8(session)
    print("FASE 8 COMPLETADA.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase8_seed())
