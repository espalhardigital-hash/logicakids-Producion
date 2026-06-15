from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import random

from app.db.session import get_db
from app.auth import get_current_user
from app.models.sql_models import User, Alumno, Pregunta, Alternativa, ConfiguracionProgreso
from app.models.simulado import SimuladoSession

router = APIRouter(prefix="/api/fases/9/simulados", tags=["simulados"])

class IniciarSimuladoRequest(BaseModel):
    modulo_id: int
    nivel_id: int

class SaveProgressRequest(BaseModel):
    respuestas: Dict[str, str] # pregunta_id -> alternativa_id
    marcadores_revision: List[str]
    tiempo_restante_segundos: int

class EntregarRequest(BaseModel):
    respuestas: Dict[str, str]
    tiempo_restante_segundos: int

@router.post("/iniciar")
async def iniciar_simulado(
    request: IniciarSimuladoRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.alumno:
        raise HTTPException(status_code=400, detail="El usuario no tiene un perfil de alumno.")
    
    alumno_id = current_user.alumno[0].id if isinstance(current_user.alumno, list) else current_user.alumno.id
    
    # 1. Fetch random questions for this section (e.g., 20 questions)
    # Seccion ID mapping logic (modulo * 100 + nivel) matching seed_fase9.py
    seccion = request.modulo_id * 100 + request.nivel_id
    
    result = await db.execute(
        select(Pregunta).where(
            and_(Pregunta.fase_id == 9, Pregunta.seccion == seccion)
        )
    )
    preguntas = result.scalars().all()
    
    if not preguntas:
        # Fallback to get any phase 9 questions
        result = await db.execute(select(Pregunta).where(Pregunta.fase_id == 9).limit(20))
        preguntas = result.scalars().all()
        
    if not preguntas:
        raise HTTPException(status_code=404, detail="No se encontraron preguntas para este simulado.")
        
    # Select up to 20 random questions
    selected = random.sample(preguntas, min(len(preguntas), 20))
    
    # Pre-fetch alternativas
    pregunta_ids = [p.id for p in selected]
    alt_result = await db.execute(
        select(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids))
    )
    alternativas = alt_result.scalars().all()
    
    alt_map = {}
    for a in alternativas:
        if a.pregunta_id not in alt_map:
            alt_map[a.pregunta_id] = []
        alt_map[a.pregunta_id].append(a)
    
    payload_preguntas = []
    for p in selected:
        alts = alt_map.get(p.id, [])
        # Do not include 'es_correcta' to prevent cheating!
        alt_payload = [
            {"id": a.id, "texto": a.texto} for a in sorted(alts, key=lambda x: x.orden)
        ]
        
        payload_preguntas.append({
            "id": p.id,
            "enunciado": p.enunciado,
            "datos_numericos": p.datos_numericos,
            "requiere_subrayado": p.requiere_subrayado,
            "alternativas": alt_payload
        })
        
    # 2. Consultar configuracion del cronometro
    config_result = await db.execute(
        select(ConfiguracionProgreso).where(
            and_(
                ConfiguracionProgreso.fase_id == 9,
                ConfiguracionProgreso.seccion == 0, # Configuracion general de la fase
                ConfiguracionProgreso.operacion == "mixta"
            )
        )
    )
    config = config_result.scalars().first()
    
    if config and config.usa_cronometro and config.tiempo_default_segundos:
        tiempo = config.tiempo_default_segundos * len(selected) # tiempo por test (tiempo_default = tiempo por pregunta)
    else:
        # Fallback a 2 minutos por pregunta si no hay config
        tiempo = 120 * len(selected)
    
    nueva_sesion = SimuladoSession(
        alumno_id=alumno_id,
        fase_id=9,
        modulo_id=request.modulo_id,
        nivel_id=request.nivel_id,
        estado="EN_CURSO",
        respuestas_json={},
        marcadores_revision=[],
        tiempo_restante_segundos=tiempo
    )
    db.add(nueva_sesion)
    await db.commit()
    await db.refresh(nueva_sesion)
    
    return {
        "session_id": nueva_sesion.id,
        "tiempo_total_segundos": tiempo,
        "preguntas": payload_preguntas
    }

@router.post("/{session_id}/save_progress")
async def save_progress(
    session_id: str,
    request: SaveProgressRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SimuladoSession).where(SimuladoSession.id == session_id))
    simulado = result.scalars().first()
    
    if not simulado or simulado.estado != "EN_CURSO":
        raise HTTPException(status_code=400, detail="Sesión no válida o ya finalizada.")
        
    simulado.respuestas_json = request.respuestas
    simulado.marcadores_revision = request.marcadores_revision
    simulado.tiempo_restante_segundos = request.tiempo_restante_segundos
    
    await db.commit()
    return {"status": "ok"}

@router.post("/{session_id}/entregar")
async def entregar_simulado(
    session_id: str,
    request: EntregarRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SimuladoSession).where(SimuladoSession.id == session_id))
    simulado = result.scalars().first()
    
    if not simulado or simulado.estado != "EN_CURSO":
        raise HTTPException(status_code=400, detail="Sesión no válida o ya finalizada.")
        
    simulado.respuestas_json = request.respuestas
    simulado.tiempo_restante_segundos = request.tiempo_restante_segundos
    simulado.estado = "FINALIZADO"
    simulado.fecha_fin = datetime.utcnow()
    
    await db.commit()
    
    # Calculate results immediately
    respuestas = request.respuestas
    pregunta_ids = [int(p) for p in respuestas.keys()]
    
    if not pregunta_ids:
        return {"status": "ok", "puntaje": 0, "total": 0}
        
    alt_result = await db.execute(
        select(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids))
    )
    todas_alts = alt_result.scalars().all()
    
    correctas = 0
    errores = []
    
    for alt in todas_alts:
        pid = str(alt.pregunta_id)
        if pid in respuestas:
            # Check if this alternative was selected
            if str(alt.id) == str(respuestas[pid]):
                if alt.es_correcta:
                    correctas += 1
                else:
                    errores.append({"pregunta_id": pid, "respuesta_incorrecta_id": alt.id})
                    
    total = len(respuestas)
    puntaje_porcentaje = (correctas / total) * 100 if total > 0 else 0
    
    return {
        "status": "ok",
        "puntaje": correctas,
        "total": total,
        "porcentaje": puntaje_porcentaje,
        "errores": errores
    }
