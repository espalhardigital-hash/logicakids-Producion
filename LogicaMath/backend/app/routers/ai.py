from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from ..db.session import get_db
from ..models.sql_models import User as UserModel, Alumno as AlumnoModel, Intento
from ..auth import get_current_user, get_admin_user
from ..services.ai_service import analyze_student_performance

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/analyze/{category}")
async def get_performance_analysis(
    category: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Usuario no identificado")

    # Obtener el alumno asociado a este usuario (asumimos un alumno principal por ahora o buscamos el primero)
    result = await db.execute(select(AlumnoModel).where(AlumnoModel.user_id == user_id))
    alumno = result.scalar_one_or_none()
    
    if not alumno:
        # Fallback for legacy
        result_user = await db.execute(select(UserModel).where(UserModel.id == user_id))
        user = result_user.scalar_one_or_none()
        return {"analysis": "El análisis de IA requiere que tengas un perfil de alumno creado."}

    # Buscar los últimos 15 intentos del alumno
    result_intentos = await db.execute(
        select(Intento)
        .where(Intento.alumno_id == alumno.id)
        .order_by(Intento.fecha.desc())
        .limit(15)
    )
    recent_intentos = result_intentos.scalars().all()
    
    if not recent_intentos:
        return {"analysis": "No hay suficientes datos de juego (intentos) para realizar un análisis de IA todavía. ¡Sigue jugando!"}

    # Call AI Service
    analysis_text = await analyze_student_performance(alumno.nombre, recent_intentos, category)
    
    return {"analysis": analysis_text}


@router.get("/admin/alumnos/{alumno_id}/insights")
async def get_admin_alumno_insights(
    alumno_id: int,
    db: AsyncSession = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    Nuevo endpoint para que el panel de administración solicite el informe de IA de un alumno específico.
    """
    result = await db.execute(select(AlumnoModel).where(AlumnoModel.id == alumno_id))
    alumno = result.scalar_one_or_none()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
        
    # Buscar los últimos 20 intentos del alumno
    result_intentos = await db.execute(
        select(Intento)
        .where(Intento.alumno_id == alumno.id)
        .order_by(Intento.fecha.desc())
        .limit(20)
    )
    recent_intentos = result_intentos.scalars().all()
    
    if not recent_intentos:
        return {"analysis": "El alumno no tiene suficientes intentos registrados para generar un informe pedagógico."}
        
    analysis_text = await analyze_student_performance(alumno.nombre, recent_intentos, "General (Todas las fases)")
    
    return {"analysis": analysis_text}


