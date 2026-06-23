import asyncio
import random
import base64
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

# --- DICCIONARIOS DE CONTEXTO FASE 7 ---
NOMBRES = ["Andrés", "Lucía", "Martín", "Elena", "Tomás", "Julia"]
LUGARES = ["parque", "zoológico", "museo", "colegio", "cine", "estadio"]
OBJETOS = ["brújula", "rosa de los vientos", "carta", "pista"]

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
    from app.fase7.content_fase7 import niveles_teoria_fase7
    
    for data in niveles_teoria_fase7:
        nt = NivelTeoria(fase_id=FASE7_ID, **data)
        session.add(nt)
    await session.commit()

def _svg_to_base64(svg_str: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg_str.encode('utf-8')).decode('utf-8')

def _generate_svg_compass(direction: str) -> str:
    needle_map = {
        "N": '<polygon points="100,35 93,100 107,100" fill="#ef4444"/><polygon points="100,165 93,100 107,100" fill="#64748b"/>',
        "S": '<polygon points="100,165 93,100 107,100" fill="#ef4444"/><polygon points="100,35 93,100 107,100" fill="#64748b"/>',
        "E": '<polygon points="165,100 100,93 100,107" fill="#ef4444"/><polygon points="35,100 100,93 100,107" fill="#64748b"/>',
        "O": '<polygon points="35,100 100,93 100,107" fill="#ef4444"/><polygon points="165,100 100,93 100,107" fill="#64748b"/>'
    }
    needle_svg = needle_map.get(direction, needle_map["N"])
    
    svg = f"""<svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="85" fill="#0f172a" stroke="#14B8A6" stroke-width="4"/>
  <circle cx="100" cy="100" r="75" fill="none" stroke="#334155" stroke-dasharray="4 4" stroke-width="1"/>
  <text x="100" y="32" font-family="Arial" font-size="16" font-weight="900" fill="#14B8A6" text-anchor="middle">N</text>
  <text x="100" y="185" font-family="Arial" font-size="16" font-weight="900" fill="#14B8A6" text-anchor="middle">S</text>
  <text x="180" y="106" font-family="Arial" font-size="16" font-weight="900" fill="#14B8A6" text-anchor="middle">E</text>
  <text x="20" y="106" font-family="Arial" font-size="16" font-weight="900" fill="#14B8A6" text-anchor="middle">O</text>
  {needle_svg}
  <circle cx="100" cy="100" r="5" fill="#f8fafc"/>
</svg>"""
    return _svg_to_base64(svg)

def _generate_svg_cartesian(x1: int, y1: int, x2: int = None, y2: int = None) -> str:
    grid_lines = []
    for i in range(7):
        cx = 30 + i * 25
        grid_lines.append(f'<line x1="{cx}" y1="20" x2="{cx}" y2="180" stroke="#334155" stroke-width="1"/>')
        grid_lines.append(f'<text x="{cx}" y="195" font-family="Arial" font-size="10" fill="#64748b" text-anchor="middle">{i}</text>')
        
        cy = 180 - i * 25
        grid_lines.append(f'<line x1="30" y1="{cy}" x2="180" y2="{cy}" stroke="#334155" stroke-width="1"/>')
        grid_lines.append(f'<text x="20" y="{cy + 3}" font-family="Arial" font-size="10" fill="#64748b" text-anchor="end">{i}</text>')
        
    grid_lines_str = "\n  ".join(grid_lines)
    
    cx1 = 30 + x1 * 25
    cy1 = 180 - y1 * 25
    
    point_b_svg = ""
    path_line_svg = ""
    if x2 is not None and y2 is not None:
        cx2 = 30 + x2 * 25
        cy2 = 180 - y2 * 25
        point_b_svg = f"""
  <circle cx="{cx2}" cy="{cy2}" r="6" fill="#ef4444" stroke="#f8fafc" stroke-width="1.5"/>
  <text x="{cx2}" y="{cy2 - 10}" font-family="Arial" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">B</text>
"""
        path_line_svg = f"""
  <path d="M {cx1} {cy1} L {cx2} {cy1} L {cx2} {cy2}" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="4 4"/>
"""

    svg = f"""<svg viewBox="0 0 210 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="210" height="210" rx="8" fill="#0f172a"/>
  {grid_lines_str}
  <line x1="30" y1="180" x2="185" y2="180" stroke="#94a3b8" stroke-width="2"/>
  <line x1="30" y1="20" x2="30" y2="180" stroke="#94a3b8" stroke-width="2"/>
  <text x="195" y="184" font-family="Arial" font-size="11" font-weight="bold" fill="#94a3b8">X</text>
  <text x="27" y="12" font-family="Arial" font-size="11" font-weight="bold" fill="#94a3b8">Y</text>
  {path_line_svg}
  <circle cx="{cx1}" cy="{cy1}" r="6" fill="#0d9488" stroke="#f8fafc" stroke-width="1.5"/>
  <text x="{cx1}" y="{cy1 - 10}" font-family="Arial" font-size="10" font-weight="bold" fill="#0d9488" text-anchor="middle">A</text>
  {point_b_svg}
</svg>"""
    return _svg_to_base64(svg)

def _generate_svg_clock(hours: int, minutes: int) -> str:
    hour_angle = (hours % 12) * 30 + minutes * 0.5
    minute_angle = minutes * 6
    
    svg = f"""<svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="85" fill="#0f172a" stroke="#0F766E" stroke-width="4"/>
  <circle cx="100" cy="100" r="78" fill="none" stroke="#1e293b" stroke-width="1"/>
  
  <text x="100" y="32" font-family="Arial" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">12</text>
  <text x="100" y="182" font-family="Arial" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">6</text>
  <text x="175" y="105" font-family="Arial" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">3</text>
  <text x="25" y="105" font-family="Arial" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">9</text>
  
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(30 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(60 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(120 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(150 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(210 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(240 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(300 100 100)"/>
  <line x1="150" y1="13.4" x2="145" y2="22" stroke="#475569" stroke-width="2" transform="rotate(330 100 100)"/>

  <line x1="100" y1="100" x2="100" y2="60" stroke="#f8fafc" stroke-width="4" stroke-linecap="round" transform="rotate({hour_angle} 100 100)"/>
  <line x1="100" y1="100" x2="100" y2="42" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" transform="rotate({minute_angle} 100 100)"/>
  
  <circle cx="100" cy="100" r="5" fill="#f8fafc"/>
</svg>"""
    return _svg_to_base64(svg)

def _generate_svg_schedule(line1_name: str, line1_t1: str, line1_t2: str, line2_name: str, line2_t1: str, line2_t2: str) -> str:
    svg = f"""<svg viewBox="0 0 300 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="290" height="140" rx="10" fill="#0f172a" stroke="#115E59" stroke-width="2"/>
  
  <rect x="15" y="15" width="80" height="25" rx="4" fill="#1e293b"/>
  <text x="55" y="32" font-family="Arial" font-size="11" font-weight="bold" fill="#14B8A6" text-anchor="middle">Línea</text>
  
  <rect x="105" y="15" width="80" height="25" rx="4" fill="#1e293b"/>
  <text x="145" y="32" font-family="Arial" font-size="11" font-weight="bold" fill="#14B8A6" text-anchor="middle">Salida 1</text>
  
  <rect x="195" y="15" width="80" height="25" rx="4" fill="#1e293b"/>
  <text x="235" y="32" font-family="Arial" font-size="11" font-weight="bold" fill="#14B8A6" text-anchor="middle">Salida 2</text>
  
  <text x="55" y="65" font-family="Arial" font-size="11" fill="#f8fafc" text-anchor="middle">{line1_name}</text>
  <text x="145" y="65" font-family="Arial" font-size="11" fill="#f8fafc" text-anchor="middle">{line1_t1}</text>
  <text x="235" y="65" font-family="Arial" font-size="11" fill="#f8fafc" text-anchor="middle">{line1_t2}</text>
  <line x1="15" y1="80" x2="285" y2="80" stroke="#334155" stroke-width="1"/>
  
  <text x="55" y="105" font-family="Arial" font-size="11" fill="#f8fafc" text-anchor="middle">{line2_name}</text>
  <text x="145" y="105" font-family="Arial" font-size="11" fill="#f8fafc" text-anchor="middle">{line2_t1}</text>
  <text x="235" y="105" font-family="Arial" font-size="11" fill="#f8fafc" text-anchor="middle">{line2_t2}</text>
  <line x1="15" y1="120" x2="285" y2="120" stroke="#334155" stroke-width="1"/>
</svg>"""
    return _svg_to_base64(svg)

def _generate_svg_fase7(mod_id: int, rng: random.Random, params: dict = None) -> str:
    if not params:
        params = {}
    if mod_id == 1:
        direction = params.get("direction", "N")
        return _generate_svg_compass(direction)
    elif mod_id == 2:
        x1 = params.get("x1", 2)
        y1 = params.get("y1", 2)
        x2 = params.get("x2", None)
        y2 = params.get("y2", None)
        return _generate_svg_cartesian(x1, y1, x2, y2)
    elif mod_id == 3:
        hours = params.get("hours", 10)
        minutes = params.get("minutes", 10)
        return _generate_svg_clock(hours, minutes)
    else:
        l1 = params.get("line1_name", "A")
        t1_1 = params.get("line1_t1", "08:00")
        t1_2 = params.get("line1_t2", "08:30")
        l2 = params.get("line2_name", "B")
        t2_1 = params.get("line2_t1", "09:00")
        t2_2 = params.get("line2_t2", "09:20")
        return _generate_svg_schedule(l1, t1_1, t1_2, l2, t2_1, t2_2)

async def _gen_fase7_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    nombre = rng.choice(NOMBRES)
    errores_previstos = {}
    
    if mod_id == 1:
        if lvl_id in (1, 11):
            directions = ["Norte", "Este", "Sur", "Oeste"]
            dir_abbrev = {"Norte": "N", "Este": "E", "Sur": "S", "Oeste": "O"}
            start_idx = rng.randint(0, 3)
            turn_right = rng.choice([True, False])
            turn_deg = rng.choice([90, 180, 270])
            
            steps = turn_deg // 90
            if not turn_right:
                steps = -steps
            end_idx = (start_idx + steps) % 4
            
            start_dir = directions[start_idx]
            end_dir = directions[end_idx]
            
            direction_word = "derecha" if turn_right else "izquierda"
            enunciado = f"Si estás mirando al {start_dir} y haces un giro de {turn_deg} grados hacia la {direction_word}, ¿hacia qué dirección terminas mirando?"
            
            ans_str = end_dir
            alts = list(directions)
            
            errores_previstos[start_dir] = "No realizaste ningún giro. Debes cambiar de dirección."
            opposite_idx = (start_idx + 2) % 4
            opposite_dir = directions[opposite_idx]
            if opposite_dir != ans_str:
                errores_previstos[opposite_dir] = f"Esa es la dirección opuesta al {start_dir}."
            
            svg_params = {"direction": dir_abbrev[start_dir]}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Comenzando en el {start_dir}, al girar {turn_deg} grados a la {direction_word}, terminas apuntando al {end_dir}.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
            
        elif lvl_id in (2, 12):
            x = rng.randint(1, 5)
            y = rng.randint(1, 5)
            lugar = rng.choice(LUGARES)
            enunciado = f"{nombre} comienza en el punto (0,0). Camina {x} pasos al Este y luego {y} pasos al Norte para ir al {lugar}. ¿Cuántos pasos caminó en total?"
            ans_str = str(x + y)
            
            alts = [ans_str, str(abs(x - y)), str(x * y), str(x + y + 2)]
            alts = list(set(alts))
            while len(alts) < 4:
                alts.append(str(rng.randint(2, 15)))
            rng.shuffle(alts)
            
            errores_previstos[str(abs(x - y))] = "Restaste los pasos en lugar de sumarlos para obtener la distancia total."
            errores_previstos[str(x * y)] = "Multiplicaste los pasos en lugar de sumarlos."
            
            svg_params = {"x1": 0, "y1": 0, "x2": x, "y2": y}
            svg_data = _generate_svg_fase7(2, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"La distancia total recorrida es la suma de los pasos: {x} Este + {y} Norte = {x + y} pasos.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
            
        else:
            directions = ["Norte", "Este", "Sur", "Oeste"]
            dir_abbrev = {"Norte": "N", "Este": "E", "Sur": "S", "Oeste": "O"}
            start_dir_idx = rng.randint(0, 3)
            start_dir = directions[start_dir_idx]
            
            deg = rng.choice([180, 270])
            end_dir_idx = (start_dir_idx + (deg // 90)) % 4
            end_dir = directions[end_dir_idx]
            
            enunciado = f"Si estás mirando hacia el {start_dir} y giras {deg} grados a la derecha (sentido horario), ¿hacia dónde terminas mirando?"
            ans_str = end_dir
            alts = list(directions)
            
            svg_params = {"direction": dir_abbrev[start_dir]}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Al girar {deg} grados en sentido horario desde el {start_dir}, terminas apuntando al {end_dir}.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
            
    elif mod_id == 2:
        if lvl_id in (1, 11):
            x = rng.randint(1, 5)
            y = rng.randint(1, 5)
            objeto = rng.choice(OBJETOS)
            enunciado = f"Un cofre con una {objeto} está en el punto A. Si está en la columna X={x} y fila Y={y}, ¿cuál es su coordenada (X,Y)?"
            ans_str = f"({x},{y})"
            alts = [f"({x},{y})", f"({y},{x})", f"({x + 1},{y})", f"({x},{y + 1})"]
            
            errores_previstos[f"({y},{x})"] = "Confundiste el orden. Recuerda que el eje horizontal X va primero y el vertical Y va después: (X, Y)."
            
            svg_params = {"x1": x, "y1": y}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Eje horizontal X es {x}, eje vertical Y es {y}. Coordenada correcta: ({x},{y}).",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
        elif lvl_id in (2, 12):
            x = rng.randint(1, 3)
            y = rng.randint(1, 3)
            dx = rng.randint(1, 3)
            dy = rng.randint(1, 3)
            
            enunciado = f"Estás en el punto A({x},{y}). Te trasladas {dx} unidades a la derecha y {dy} unidades hacia arriba. ¿Cuál es tu nueva coordenada (X,Y)?"
            new_x = x + dx
            new_y = y + dy
            ans_str = f"({new_x},{new_y})"
            alts = [f"({new_x},{new_y})", f"({x - dx},{y - dy})", f"({new_y},{new_x})", f"({x + dx},{y})"]
            
            errores_previstos[f"({x - dx},{y - dy})"] = "Restaste en lugar de sumar. Ir a la derecha y arriba aumenta los valores X e Y."
            
            svg_params = {"x1": x, "y1": y, "x2": new_x, "y2": new_y}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Sumamos a la X: {x} + {dx} = {new_x}. Sumamos a la Y: {y} + {dy} = {new_y}. Queda ({new_x},{new_y}).",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
        else:
            x1 = rng.randint(1, 2)
            y1 = rng.randint(1, 2)
            x2 = rng.randint(4, 5)
            y2 = rng.randint(4, 5)
            
            dist_x = abs(x2 - x1)
            dist_y = abs(y2 - y1)
            ans = dist_x + dist_y
            ans_str = str(ans)
            
            lugar = rng.choice(LUGARES)
            enunciado = f"Calcula la distancia Manhattan (suma de pasos horizontales y verticales) entre A({x1},{y1}) y el {lugar} en B({x2},{y2})."
            
            alts = [ans_str, str(ans - 1), str(ans + 1), str(dist_x * dist_y)]
            alts = list(set(alts))
            while len(alts) < 4:
                alts.append(str(rng.randint(2, 12)))
            rng.shuffle(alts)
            
            svg_params = {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Distancia horizontal: |{x2} - {x1}| = {dist_x}. Distancia vertical: |{y2} - {y1}| = {dist_y}. Suma: {dist_x} + {dist_y} = {ans}.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
            
    elif mod_id == 3:
        if lvl_id in (1, 11):
            hours = rng.randint(1, 12)
            minutes = rng.choice([0, 15, 30, 45])
            
            if minutes == 0:
                minutes_str = "00"
                minutes_lbl = "12"
            else:
                minutes_str = str(minutes)
                minutes_lbl = str(minutes // 5)
                
            ans_str = f"{hours}:{minutes_str}"
            enunciado = f"Mira el reloj. Si la aguja corta apunta al número {hours} y la larga apunta al número {minutes_lbl}, ¿qué hora marca?"
            
            alt_hours = (hours + 1) if hours < 12 else 1
            alts = [ans_str, f"{hours}:{(minutes+15)%60:02d}", f"{alt_hours}:{minutes_str}", f"{hours}:05"]
            alts = list(set(alts))
            while len(alts) < 4:
                alts.append(f"{rng.randint(1, 12)}:{rng.choice([10, 20, 40])}")
            rng.shuffle(alts)
            
            svg_params = {"hours": hours, "minutes": minutes}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"La aguja corta marca la hora ({hours}) y la larga los minutos ({minutes}m). Son las {ans_str}.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
        elif lvl_id in (2, 12):
            hours_12 = rng.randint(1, 11)
            hours_24 = hours_12 + 12
            
            enunciado = f"Si un reloj de 12 horas marca las {hours_12}:00 PM, ¿cuál es su equivalente exacto en formato de 24 horas?"
            ans_str = f"{hours_24}:00"
            alts = [ans_str, f"{hours_12}:00", f"{hours_12 + 10}:00", f"{hours_24 + 1}:00"]
            
            errores_previstos[f"{hours_12}:00"] = "En formato de 24 horas, para el tiempo PM se le suma 12."
            
            svg_params = {"hours": hours_12, "minutes": 0}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Sumamos 12 a la hora PM: {hours_12} + 12 = {hours_24}:00.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
        else:
            hours1 = rng.randint(1, 2)
            mins1 = rng.choice([30, 40, 45, 50])
            hours2 = rng.randint(1, 2)
            mins2 = rng.choice([20, 30, 40, 45])
            
            total_mins = mins1 + mins2
            total_hours = hours1 + hours2 + (total_mins // 60)
            rem_mins = total_mins % 60
            
            ans_str = f"{total_hours}h {rem_mins}m"
            enunciado = f"Un viaje dura {hours1}h {mins1}m y el siguiente tramo dura {hours2}h {mins2}m. ¿Cuánto dura en total? (Formato: Xh Ym)"
            
            wrong_hours = hours1 + hours2
            wrong_mins = mins1 + mins2
            alts = [ans_str, f"{wrong_hours}h {wrong_mins}m", f"{total_hours + 1}h {rem_mins}m", f"{total_hours}h {(rem_mins + 10) % 60}m"]
            alts = list(set(alts))
            while len(alts) < 4:
                alts.append(f"{rng.randint(2, 5)}h {rng.choice([10, 15, 25])}m")
            rng.shuffle(alts)
            
            errores_previstos[f"{wrong_hours}h {wrong_mins}m"] = "Sumaste minutos directo, pero cada 60m se convierten en 1 hora."
            
            svg_params = {"hours": total_hours, "minutes": rem_mins}
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Horas: {hours1}+{hours2}={hours1+hours2}h. Minutos: {mins1}+{mins2}={total_mins}m (1h {rem_mins}m). Total = {total_hours}h {rem_mins}m.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
            
    else:
        line1_name = "Línea A"
        line2_name = "Línea B"
        t1_1 = "08:15"
        t1_2 = "08:45"
        t2_1 = "08:30"
        t2_2 = "09:10"
        
        if lvl_id in (1, 11):
            enunciado = f"Según el horario, la Línea A sale a las {t1_1} y luego a las {t1_2}. ¿Cuál es la frecuencia (diferencia en minutos) de la Línea A?"
            ans_str = "30"
            alts = ["30", "15", "45", "60"]
            
            errores_previstos["15"] = "De las 08:15 a las 08:45 transcurren 30 minutos."
            
            svg_params = {
                "line1_name": line1_name, "line1_t1": t1_1, "line1_t2": t1_2,
                "line2_name": line2_name, "line2_t1": t2_1, "line2_t2": t2_2
            }
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Restamos las horas de salida: 8:45 - 8:15 = 30 minutos.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
        elif lvl_id in (2, 12):
            trip1 = rng.choice([10, 15, 20])
            wait = rng.choice([5, 10])
            trip2 = rng.choice([15, 20, 25])
            total = trip1 + wait + trip2
            
            enunciado = f"Viajas {trip1} minutos en el bus A, esperas {wait} minutos en la parada y viajas {trip2} minutos en el bus B. ¿Cuánto tardó tu trayecto total en minutos?"
            ans_str = str(total)
            alts = [ans_str, str(trip1 + trip2), str(total + 5), str(total - 5)]
            
            errores_previstos[str(trip1 + trip2)] = "No sumaste el tiempo muerto de espera en la parada."
            
            svg_params = {
                "line1_name": line1_name, "line1_t1": f"A: {trip1}m", "line1_t2": f"espera: {wait}m",
                "line2_name": line2_name, "line2_t1": f"B: {trip2}m", "line2_t2": "meta"
            }
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"Sumamos todo: {trip1} + {wait} + {trip2} = {total} minutos.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }
        else:
            tA = rng.randint(25, 30)
            tB = rng.randint(15, 20)
            tC = rng.randint(35, 40)
            
            enunciado = f"Tienes tres opciones: Opción A tarda {tA} min, Opción B tarda {tB} min, y Opción C tarda {tC} min. ¿Cuál es la opción óptima para llegar más rápido? (A, B o C)"
            ans_str = "B"
            alts = ["A", "B", "C"]
            
            errores_previstos["A"] = f"La opción A ({tA}m) es más lenta que la opción B ({tB}m)."
            
            svg_params = {
                "line1_name": "Velocidades", "line1_t1": f"A: {tA}m", "line1_t2": f"B: {tB}m",
                "line2_name": "Opción C", "line2_t1": f"C: {tC}m", "line2_t2": "GPS"
            }
            svg_data = _generate_svg_fase7(mod_id, rng, svg_params)
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": f"La opción B es la más rápida ya que tarda {tB} minutos en total.",
                "alts": alts,
                "metadata_visual": {"requiere_imagen": True, "svg_base64": svg_data},
                "errores_previstos": errores_previstos
            }

async def seed_configuracion_progreso_fase7(session: AsyncSession):
    print("Sembrando configuraciones de progreso Fase 7...")
    sections = [(m, l) for m in range(1, 5) for l in [1, 2, 3, 11, 12, 13]]
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
            fase_id=FASE7_ID,
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

async def seed_practica_pool_fase7(session: AsyncSession):
    print("Sembrando pool de práctica Fase 7...")
    sections = [(m, l) for m in range(1, 5) for l in [1, 2, 3, 11, 12, 13]]
    
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
                error_msg = q_data.get("errores_previstos", {}).get(alt, "Esa alternativa es incorrecta. Vuelve a intentarlo.") if not is_correct else None
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx+1, tipo_error=TipoErrorEnum.CALCULO if not is_correct else None, feedback_error=error_msg))
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
        await seed_configuracion_progreso_fase7(session)
        await seed_practica_pool_fase7(session)
    print("FASE 7 COMPLETADA.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase7_seed())
