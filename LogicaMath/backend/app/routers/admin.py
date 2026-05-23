from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel

from ..schemas import (
    FaseCreate, FaseUpdate, FaseResponse,
    PreguntaCreate, PreguntaUpdate, PreguntaResponse,
    ConfiguracionProgresoCreate, ConfiguracionProgresoUpdate, ConfiguracionProgresoResponse
)
from ..db.session import get_db
from ..models.sql_models import (
    Fase, Pregunta, Alternativa, ConfiguracionProgreso, StatusEnum, PlatformSettings,
    Alumno, ProgresoMaestria, User, NivelTeoria, EstadoProgresoEnum
)
from ..auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

# ============================================================
# PLATFORM SETTINGS (Pedagogical Configuration)
# ============================================================

PEDAGOGY_CONFIG_KEY = "pedagogy_config"

DEFAULT_PEDAGOGY_CONFIG = {
    "practica_libre": {
        "cantidad_requerida": 15,
        "porcentaje_aprobacion": 80,
        "usa_cronometro": False,
        "tiempo_default_segundos": 15,
        "tipo_feedback": "simple"
    },
    "desafios": {
        "cantidad_requerida": 20,
        "porcentaje_aprobacion": 90,
        "usa_cronometro": True,
        "tiempo_default_segundos_11": 25,
        "tiempo_default_segundos_12": 40,
        "tiempo_default_segundos_13": 50,
        "tipo_feedback": "simple"
    }
}

@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Get platform pedagogical settings. Public endpoint (no auth required)."""
    result = await db.execute(
        select(PlatformSettings).where(PlatformSettings.key == PEDAGOGY_CONFIG_KEY)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        return DEFAULT_PEDAGOGY_CONFIG
    return settings.value

@router.put("/settings")
async def update_settings(payload: dict, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    """Update platform pedagogical settings. Admin only."""
    result = await db.execute(
        select(PlatformSettings).where(PlatformSettings.key == PEDAGOGY_CONFIG_KEY)
    )
    settings = result.scalar_one_or_none()
    
    if settings:
        settings.value = payload
    else:
        settings = PlatformSettings(key=PEDAGOGY_CONFIG_KEY, value=payload)
        db.add(settings)
    
    await db.commit()
    return {"status": "ok", "message": "Configuración guardada exitosamente"}

# ============================================================
# FASES
# ============================================================

@router.get("/fases", response_model=List[FaseResponse])
async def get_fases(db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(Fase).order_by(Fase.orden))
    return result.scalars().all()

@router.post("/fases", response_model=FaseResponse)
async def create_fase(fase_data: FaseCreate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    new_fase = Fase(**fase_data.model_dump())
    db.add(new_fase)
    await db.commit()
    await db.refresh(new_fase)
    return new_fase

@router.patch("/fases/{fase_id}", response_model=FaseResponse)
async def update_fase(fase_id: int, fase_data: FaseUpdate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(Fase).where(Fase.id == fase_id))
    fase = result.scalar_one_or_none()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    
    update_data = fase_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(fase, key, value)
        
    await db.commit()
    await db.refresh(fase)
    return fase

# ============================================================
# CONFIGURACION PROGRESO
# ============================================================

@router.get("/configuracion", response_model=List[ConfiguracionProgresoResponse])
async def get_configuraciones(fase_id: int = None, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    query = select(ConfiguracionProgreso)
    if fase_id is not None:
        query = query.where(ConfiguracionProgreso.fase_id == fase_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/configuracion", response_model=ConfiguracionProgresoResponse)
async def create_configuracion(config_data: ConfiguracionProgresoCreate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    # Check if exists
    result = await db.execute(
        select(ConfiguracionProgreso).where(
            ConfiguracionProgreso.fase_id == config_data.fase_id,
            ConfiguracionProgreso.seccion == config_data.seccion,
            ConfiguracionProgreso.operacion == config_data.operacion
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya existe configuración para este bloque")

    new_config = ConfiguracionProgreso(**config_data.model_dump())
    db.add(new_config)
    await db.commit()
    await db.refresh(new_config)
    return new_config

@router.patch("/configuracion/{config_id}", response_model=ConfiguracionProgresoResponse)
async def update_configuracion(config_id: int, config_data: ConfiguracionProgresoUpdate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(ConfiguracionProgreso).where(ConfiguracionProgreso.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    
    update_data = config_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)
        
    await db.commit()
    await db.refresh(config)
    return config

# ============================================================
# PREGUNTAS
# ============================================================

from sqlalchemy.orm import selectinload

@router.get("/preguntas", response_model=List[PreguntaResponse])
async def get_preguntas(
    fase_id: Optional[int] = None,
    seccion: Optional[int] = None,
    operacion: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    query = select(Pregunta).options(selectinload(Pregunta.alternativas))
    if fase_id is not None:
        query = query.where(Pregunta.fase_id == fase_id)
    if seccion is not None:
        query = query.where(Pregunta.seccion == seccion)
    if operacion is not None:
        query = query.where(Pregunta.operacion == operacion)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/preguntas", response_model=PreguntaResponse)
async def create_pregunta(pregunta_data: PreguntaCreate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    pregunta_dict = pregunta_data.model_dump(exclude={"alternativas"})
    pregunta_dict["creado_por"] = admin_user["id"]
    
    new_pregunta = Pregunta(**pregunta_dict)
    db.add(new_pregunta)
    await db.flush() # Get ID
    
    for alt_data in pregunta_data.alternativas:
        nueva_alt = Alternativa(**alt_data.model_dump(), pregunta_id=new_pregunta.id)
        db.add(nueva_alt)
        
    await db.commit()
    
    # Reload with alternativas
    result = await db.execute(select(Pregunta).options(selectinload(Pregunta.alternativas)).where(Pregunta.id == new_pregunta.id))
    return result.scalar_one()

from datetime import datetime

@router.patch("/preguntas/{pregunta_id}", response_model=PreguntaResponse)
async def update_pregunta(pregunta_id: int, pregunta_data: PreguntaUpdate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(Pregunta).options(selectinload(Pregunta.alternativas)).where(Pregunta.id == pregunta_id))
    pregunta = result.scalar_one_or_none()
    
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
        
    update_data = pregunta_data.model_dump(exclude_unset=True)
    
    # Manejar alternativas si vienen en la petición
    if "alternativas" in update_data:
        alts_data = update_data.pop("alternativas")
        # Eliminar las alternativas existentes
        await db.execute(delete(Alternativa).where(Alternativa.pregunta_id == pregunta_id))
        # Insertar las nuevas alternativas
        if alts_data:
            for alt in alts_data:
                nueva_alt = Alternativa(**alt, pregunta_id=pregunta_id)
                db.add(nueva_alt)
                
    for key, value in update_data.items():
        setattr(pregunta, key, value)
        
    pregunta.modificado_por = admin_user["id"]
    await db.commit()
    await db.refresh(pregunta)
    return pregunta

# ============================================================
# ADMINISTRACION ADICIONAL (PREGUNTAS, TEORIA, ALUMNOS)
# ============================================================

class NivelTeoriaSave(BaseModel):
    fase_id: int
    modulo_id: int
    nivel_id: int
    titulo: str
    texto_descubrimiento: str
    diccionario: Optional[dict] = None
    advertencia: Optional[str] = None
    ejemplos: Optional[list] = None
    interactivos: Optional[list] = None

class ProgressOverridePayload(BaseModel):
    fase_id: int
    seccion: int
    operacion: str
    action: str # "approve", "unlock", "lock"

@router.delete("/preguntas/{pregunta_id}")
async def delete_pregunta(pregunta_id: int, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(Pregunta).where(Pregunta.id == pregunta_id))
    pregunta = result.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    
    await db.delete(pregunta)
    await db.commit()
    return {"status": "ok", "message": "Pregunta eliminada exitosamente"}

@router.get("/teoria")
async def get_teoria(fase_id: int, modulo_id: int, nivel_id: int, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(
        select(NivelTeoria).where(and_(
            NivelTeoria.fase_id == fase_id,
            NivelTeoria.modulo_id == modulo_id,
            NivelTeoria.nivel_id == nivel_id
        ))
    )
    return result.scalar_one_or_none()

@router.put("/teoria")
async def save_teoria(payload: NivelTeoriaSave, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(
        select(NivelTeoria).where(and_(
            NivelTeoria.fase_id == payload.fase_id,
            NivelTeoria.modulo_id == payload.modulo_id,
            NivelTeoria.nivel_id == payload.nivel_id
        ))
    )
    theory = result.scalar_one_or_none()
    if theory:
        theory.titulo = payload.titulo
        theory.texto_descubrimiento = payload.texto_descubrimiento
        theory.diccionario = payload.diccionario
        theory.advertencia = payload.advertencia
        theory.ejemplos = payload.ejemplos
        theory.interactivos = payload.interactivos
    else:
        theory = NivelTeoria(**payload.model_dump())
        db.add(theory)
    
    await db.commit()
    return {"status": "ok", "message": "Teoría guardada exitosamente"}

@router.get("/alumnos/search")
async def search_alumnos(query: str = "", db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    q = select(User).options(selectinload(User.alumno)).where(User.role != "ADMIN")
    if query:
        filter_str = f"%{query}%"
        q = q.where(or_(User.username.ilike(filter_str), User.email.ilike(filter_str)))
    
    result = await db.execute(q)
    users = result.scalars().all()
    
    out = []
    for u in users:
        if u.alumno:
            out.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "alumno_id": u.alumno.id,
                "alumno_nombre": u.alumno.nombre,
                "fase_actual_id": u.alumno.fase_actual_id,
                "estado": u.alumno.estado.value if hasattr(u.alumno.estado, "value") else u.alumno.estado,
            })
    return out

@router.get("/alumnos/{alumno_id}/progress")
async def get_alumno_progress(alumno_id: int, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(
        select(ProgresoMaestria).where(ProgresoMaestria.alumno_id == alumno_id)
    )
    progresos = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "fase_id": p.fase_id,
            "seccion": p.seccion,
            "operacion": p.operacion.value if hasattr(p.operacion, "value") else p.operacion,
            "estado": p.estado.value if hasattr(p.estado, "value") else p.estado,
            "aciertos_acumulados": p.aciertos_acumulados,
            "intentos_totales": p.intentos_totales,
            "porcentaje_actual": p.porcentaje_actual,
            "aprobado_por_admin": getattr(p, "aprobado_por_admin", False),
        } for p in progresos
    ]

@router.post("/alumnos/{alumno_id}/progress/override")
async def override_alumno_progress(alumno_id: int, payload: ProgressOverridePayload, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == payload.fase_id,
            ProgresoMaestria.seccion == payload.seccion,
            ProgresoMaestria.operacion == payload.operacion
        ))
    )
    progreso = result.scalar_one_or_none()
    
    cant_req = 15
    result_config = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == payload.fase_id,
            ConfiguracionProgreso.seccion == payload.seccion,
            ConfiguracionProgreso.operacion == payload.operacion
        ))
    )
    config = result_config.scalar_one_or_none()
    if config:
        cant_req = config.cantidad_requerida
        
    if payload.action == "approve":
        if not progreso:
            progreso = ProgresoMaestria(
                alumno_id=alumno_id,
                fase_id=payload.fase_id,
                seccion=payload.seccion,
                operacion=payload.operacion,
                estado=EstadoProgresoEnum.APROBADO,
                aciertos_acumulados=cant_req,
                intentos_totales=cant_req,
                porcentaje_actual=90,
                aprobado_por_admin=True,
                fecha_aprobacion=datetime.utcnow()
            )
            db.add(progreso)
        else:
            progreso.estado = EstadoProgresoEnum.APROBADO
            progreso.aciertos_acumulados = cant_req
            progreso.porcentaje_actual = 90
            progreso.aprobado_por_admin = True
            progreso.fecha_aprobacion = datetime.utcnow()
            
    elif payload.action == "unlock":
        if not progreso:
            progreso = ProgresoMaestria(
                alumno_id=alumno_id,
                fase_id=payload.fase_id,
                seccion=payload.seccion,
                operacion=payload.operacion,
                estado=EstadoProgresoEnum.EN_PROGRESO,
                aciertos_acumulados=0,
                intentos_totales=0,
                porcentaje_actual=0,
                aprobado_por_admin=False
            )
            db.add(progreso)
        else:
            progreso.estado = EstadoProgresoEnum.EN_PROGRESO
            progreso.aprobado_por_admin = False
            
    elif payload.action == "lock":
        if progreso:
            progreso.estado = EstadoProgresoEnum.BLOQUEADO
            progreso.porcentaje_actual = 0
            progreso.aciertos_acumulados = 0
            progreso.aprobado_por_admin = False
            progreso.fecha_aprobacion = None
            
    await db.commit()
    return {"status": "ok", "message": "Progreso actualizado exitosamente"}
