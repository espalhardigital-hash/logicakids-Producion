from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from ..db.session import get_db
from ..models.sql_models import User as UserModel
from ..auth import get_current_user
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

    # Fetch user from DB to get their scores from settings
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    settings = user.settings or {}
    all_scores = settings.get("scores", [])
    
    # Filter scores for the requested category and sort by date (newest first)
    cat_scores = [s for s in all_scores if s.get("category") == category]
    cat_scores.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    # Take the last 5 games for analysis
    recent_scores = cat_scores[:5]
    
    if not recent_scores:
        return {"analysis": "No hay suficientes datos para realizar un análisis de IA todavía. ¡Sigue jugando!"}

    # Call AI Service
    analysis_text = await analyze_student_performance(user.username, recent_scores, category)
    
    return {"analysis": analysis_text}

