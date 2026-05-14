from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..schemas import (
    FaseCreate, FaseUpdate, FaseResponse,
    PreguntaCreate, PreguntaUpdate, PreguntaResponse,
    ConfiguracionProgresoCreate, ConfiguracionProgresoUpdate, ConfiguracionProgresoResponse
)
from ..db.session import get_db
from ..models.sql_models import Fase, Pregunta, Alternativa, ConfiguracionProgreso, StatusEnum, PlatformSettings
from ..auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

# ============================================================
# PLATFORM SETTINGS (Pedagogical Configuration)
# ============================================================

PEDAGOGY_CONFIG_KEY = "pedagogy_config"

DEFAULT_PEDAGOGY_CONFIG = {
    "questionsPerPhase": 50,
    "timers": {
        "easy": 10,
        "easy_medium": 12,
        "medium": 14,
        "medium_hard": 16,
        "hard": 18,
    },
    "useTimer": True,
    "passingScore": 85,
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
async def get_preguntas(fase_id: int = None, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    query = select(Pregunta).options(selectinload(Pregunta.alternativas))
    if fase_id is not None:
        query = query.where(Pregunta.fase_id == fase_id)
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

@router.patch("/preguntas/{pregunta_id}", response_model=PreguntaResponse)
async def update_pregunta(pregunta_id: int, pregunta_data: PreguntaUpdate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(Pregunta).options(selectinload(Pregunta.alternativas)).where(Pregunta.id == pregunta_id))
    pregunta = result.scalar_one_or_none()
    
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
        
    update_data = pregunta_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pregunta, key, value)
        
    pregunta.modificado_por = admin_user["id"]
    await db.commit()
    await db.refresh(pregunta)
    return pregunta
