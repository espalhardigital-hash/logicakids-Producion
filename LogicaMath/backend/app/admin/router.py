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
from ..services.pedagogia_service import recalcular_y_sincronizar_fase_actual

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
    
    # Recalcular porcentajes de todos los alumnos afectados, respetando "Derecho Adquirido" (Opción A)
    result_progresos = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.fase_id == config.fase_id,
            ProgresoMaestria.seccion == config.seccion,
            ProgresoMaestria.operacion == config.operacion
        ))
    )
    progresos = result_progresos.scalars().all()
    
    if progresos:
        from datetime import datetime
        for progreso in progresos:
            if progreso.estado == EstadoProgresoEnum.APROBADO:
                # Opción A: Derecho Adquirido. Mantener 100% independientemente de aciertos
                progreso.porcentaje_actual = 100
            else:
                # Recalcular matemáticamente
                nuevo_pct = int((progreso.aciertos_acumulados / config.cantidad_requerida) * 100) if config.cantidad_requerida > 0 else 0
                progreso.porcentaje_actual = min(nuevo_pct, 100)
                
                # Evaluar si ahora sí cumple con los nuevos criterios y pasa a Aprobado (ej. si bajaron la cantidad)
                if progreso.porcentaje_actual >= config.porcentaje_aprobacion and progreso.aciertos_acumulados >= config.cantidad_requerida:
                    progreso.estado = EstadoProgresoEnum.APROBADO
                    if not progreso.fecha_aprobacion:
                        progreso.fecha_aprobacion = datetime.utcnow()
            db.add(progreso)
            
        await db.commit()
    
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

from .schemas import NivelTeoriaSave, ProgressOverridePayload, ProgressOverrideItem, ProgressOverrideBulkPayload, SystemConfigUpdate

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
    # 1. Obtener los progresos
    from ..models.sql_models import Intento
    
    result = await db.execute(
        select(ProgresoMaestria).where(ProgresoMaestria.alumno_id == alumno_id)
    )
    progresos = result.scalars().all()
    
    # 2. Obtener los últimos 50 errores del alumno para cruzarlos con el progreso
    result_errores = await db.execute(
        select(Intento.fase_id, Intento.seccion, Intento.operacion, Intento.tipo_error)
        .where(and_(
            Intento.alumno_id == alumno_id,
            Intento.es_correcta == False,
            Intento.tipo_error != None
        ))
        .order_by(Intento.fecha.desc())
        .limit(100)
    )
    
    errores_raw = result_errores.all()
    errores_por_bloque = {}
    for err in errores_raw:
        # err[0]=fase_id, err[1]=seccion, err[2]=operacion, err[3]=tipo_error
        op_val = err[2].value if hasattr(err[2], "value") else err[2]
        key = f"{err[0]}-{err[1]}-{op_val}"
        if key not in errores_por_bloque:
            errores_por_bloque[key] = {}
            
        tipo_err = err[3].value if hasattr(err[3], "value") else err[3]
        errores_por_bloque[key][tipo_err] = errores_por_bloque[key].get(tipo_err, 0) + 1
    
    out = []
    for p in progresos:
        op_val = p.operacion.value if hasattr(p.operacion, "value") else p.operacion
        key = f"{p.fase_id}-{p.seccion}-{op_val}"
        
        # Format errores as list of top errors
        errores_dict = errores_por_bloque.get(key, {})
        ultimos_errores = [{"tipo": k, "count": v} for k, v in errores_dict.items()]
        ultimos_errores.sort(key=lambda x: x["count"], reverse=True)
        
        out.append({
            "id": p.id,
            "fase_id": p.fase_id,
            "seccion": p.seccion,
            "operacion": op_val,
            "estado": p.estado.value if hasattr(p.estado, "value") else p.estado,
            "aciertos_acumulados": p.aciertos_acumulados,
            "intentos_totales": p.intentos_totales,
            "porcentaje_actual": p.porcentaje_actual,
            "aprobado_por_admin": getattr(p, "aprobado_por_admin", False),
            "ultimos_errores": ultimos_errores[:3] # Devolver solo los 3 más frecuentes de este bloque
        })
        
    return out

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
    
    # Sync with user.settings para todas las fases ya que algunos frontends dependen de unlockedLevels
    from sqlalchemy.orm.attributes import flag_modified
    result_alumno = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result_alumno.scalar_one_or_none()
    if alumno:
        result_user = await db.execute(select(User).where(User.id == alumno.user_id))
        user = result_user.scalar_one_or_none()
        if user:
            # Need to use dict() or copy if settings is a SQLAlchemy mutable dict, but typically reassigning and flag_modified is enough
            settings = user.settings or {}
            if "unlockedLevels" not in settings:
                settings["unlockedLevels"] = {}
            
            cat_map = {
                "suma": "addition",
                "resta": "subtraction",
                "multiplicacion": "multiplication",
                "division": "division",
                "mixta": "challenge"
            }
            cat = cat_map.get(payload.operacion)
            if cat:
                if payload.action == "approve":
                    settings["unlockedLevels"][cat] = 6
                elif payload.action == "unlock":
                    settings["unlockedLevels"][cat] = 1
                elif payload.action == "lock":
                    settings["unlockedLevels"][cat] = 0
                    
                user.settings = settings
                flag_modified(user, "settings")
                await db.commit()
            
            from ..services.pedagogia_service import recalcular_y_sincronizar_fase_actual
            await recalcular_y_sincronizar_fase_actual(alumno_id, db)

    return {"status": "ok", "message": "Progreso actualizado exitosamente"}

@router.post("/alumnos/{alumno_id}/progress/override-bulk")
async def override_alumno_progress_bulk(
    alumno_id: int,
    payload: ProgressOverrideBulkPayload,
    db: AsyncSession = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    Apply a bulk progress override (approve / unlock / lock) to a set of sections
    belonging to the same module or phase in a single database transaction.
    This is significantly more efficient than calling the single-item endpoint
    once per level when operating on an entire module (~7 levels) or phase (~28+ levels).
    """
    from sqlalchemy.orm.attributes import flag_modified

    if payload.action not in ("approve", "unlock", "lock"):
        raise HTTPException(status_code=400, detail="Acción inválida. Use 'approve', 'unlock' o 'lock'.")
    if not payload.items:
        raise HTTPException(status_code=400, detail="La lista de items no puede estar vacía.")

    # Collect all (fase_id, seccion, operacion) tuples for efficient batch query
    for item in payload.items:
        result = await db.execute(
            select(ProgresoMaestria).where(and_(
                ProgresoMaestria.alumno_id == alumno_id,
                ProgresoMaestria.fase_id == item.fase_id,
                ProgresoMaestria.seccion == item.seccion,
                ProgresoMaestria.operacion == item.operacion
            ))
        )
        progreso = result.scalar_one_or_none()

        # Fetch ConfiguracionProgreso to know cantidad_requerida
        cant_req = 15
        result_config = await db.execute(
            select(ConfiguracionProgreso).where(and_(
                ConfiguracionProgreso.fase_id == item.fase_id,
                ConfiguracionProgreso.seccion == item.seccion,
                ConfiguracionProgreso.operacion == item.operacion
            ))
        )
        config = result_config.scalar_one_or_none()
        if config:
            cant_req = config.cantidad_requerida

        if payload.action == "approve":
            if not progreso:
                progreso = ProgresoMaestria(
                    alumno_id=alumno_id,
                    fase_id=item.fase_id,
                    seccion=item.seccion,
                    operacion=item.operacion,
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
                    fase_id=item.fase_id,
                    seccion=item.seccion,
                    operacion=item.operacion,
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

    # Single commit for all items in the batch
    await db.commit()

    # Detect if we should auto-approve unmapped active levels (e.g. Módulo 5 in Phase 3 or 99099)
    if payload.action == "approve":
        items_by_fase = {}
        for item in payload.items:
            items_by_fase[item.fase_id] = items_by_fase.get(item.fase_id, 0) + 1
            
        for fase_id, count in items_by_fase.items():
            # If count of levels is >= 4, the admin approved the entire phase (since individual modules have max 3 levels)
            if count >= 4:
                result_all_configs = await db.execute(
                    select(ConfiguracionProgreso).where(and_(
                        ConfiguracionProgreso.fase_id == fase_id,
                        ConfiguracionProgreso.seccion > 0,
                        ConfiguracionProgreso.activo == True
                    ))
                )
                all_configs = result_all_configs.scalars().all()
                for config in all_configs:
                    result_prog = await db.execute(
                        select(ProgresoMaestria).where(and_(
                            ProgresoMaestria.alumno_id == alumno_id,
                            ProgresoMaestria.fase_id == fase_id,
                            ProgresoMaestria.seccion == config.seccion,
                            ProgresoMaestria.operacion == config.operacion
                        ))
                    )
                    prog = result_prog.scalar_one_or_none()
                    if not prog:
                        prog = ProgresoMaestria(
                            alumno_id=alumno_id,
                            fase_id=fase_id,
                            seccion=config.seccion,
                            operacion=config.operacion,
                            estado=EstadoProgresoEnum.APROBADO,
                            aciertos_acumulados=config.cantidad_requerida,
                            intentos_totales=config.cantidad_requerida,
                            porcentaje_actual=90,
                            aprobado_por_admin=True,
                            fecha_aprobacion=datetime.utcnow()
                        )
                        db.add(prog)
                    else:
                        prog.estado = EstadoProgresoEnum.APROBADO
                        prog.aciertos_acumulados = config.cantidad_requerida
                        prog.porcentaje_actual = 90
                        prog.aprobado_por_admin = True
                        prog.fecha_aprobacion = datetime.utcnow()
        await db.commit()

    # Sync user.settings["unlockedLevels"] aggregated across all unique categories in the batch
    result_alumno = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result_alumno.scalar_one_or_none()
    if alumno:
        result_user = await db.execute(select(User).where(User.id == alumno.user_id))
        user = result_user.scalar_one_or_none()
        if user:
            settings = user.settings or {}
            if "unlockedLevels" not in settings:
                settings["unlockedLevels"] = {}

            cat_map = {
                "suma": "addition",
                "resta": "subtraction",
                "multiplicacion": "multiplication",
                "division": "division",
                "mixta": "challenge"
            }
            # Determine the maximum level value per category from the batch
            # (approve = 6, unlock = 1, lock = 0)
            action_level = {"approve": 6, "unlock": 1, "lock": 0}[payload.action]
            affected_cats = set()
            for item in payload.items:
                cat = cat_map.get(item.operacion)
                if cat:
                    affected_cats.add(cat)

            for cat in affected_cats:
                current = settings["unlockedLevels"].get(cat, 0)
                if payload.action == "lock":
                    settings["unlockedLevels"][cat] = 0
                else:
                    # Only upgrade, never downgrade existing unlocked level
                    settings["unlockedLevels"][cat] = max(current, action_level)

            user.settings = settings
            flag_modified(user, "settings")
            await db.commit()
        
        await recalcular_y_sincronizar_fase_actual(alumno_id, db)

    processed = len(payload.items)
    return {
        "status": "ok",
        "message": f"Se aplicó '{payload.action}' a {processed} sección(es) exitosamente.",
        "processed": processed
    }


# ============================================================
# SYSTEM CONFIGURATION (.env)
# ============================================================
import os
from dotenv import set_key, dotenv_values



@router.get("/system-config")
async def get_system_config(admin_user: dict = Depends(get_admin_user)):
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    env_vars = dotenv_values(env_path)
    
    return {
        "vps_host": env_vars.get("VPS_HOST", ""),
        "ssh_user": env_vars.get("SSH_USER", ""),
        "database_url": env_vars.get("DATABASE_URL", "")
    }

@router.post("/system-config")
async def update_system_config(payload: SystemConfigUpdate, admin_user: dict = Depends(get_admin_user)):
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    
    set_key(env_path, "VPS_HOST", payload.vps_host)
    set_key(env_path, "SSH_USER", payload.ssh_user)
    set_key(env_path, "DATABASE_URL", payload.database_url)
    
    return {"status": "ok", "message": "Configuración del sistema guardada. Se requiere reiniciar el backend para aplicar la nueva base de datos."}


