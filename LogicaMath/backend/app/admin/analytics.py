from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta

from ..db.session import get_db
from ..auth import get_admin_user
from ..models.sql_models import User, Intento, Alumno

router = APIRouter(prefix="/admin/analytics", tags=["analytics"])

@router.get("/engagement")
async def get_engagement(db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)
    thirty_days_ago = now - timedelta(days=30)
    
    # DAU: Unique users active in the last 24 hours
    dau_query = select(func.count(func.distinct(User.id))).where(
        User.last_login >= one_day_ago
    )
    dau_result = await db.execute(dau_query)
    dau = dau_result.scalar_one_or_none() or 0
    
    # MAU: Unique users active in the last 30 days
    mau_query = select(func.count(func.distinct(User.id))).where(
        User.last_login >= thirty_days_ago
    )
    mau_result = await db.execute(mau_query)
    mau = mau_result.scalar_one_or_none() or 0
    
    # Total Users
    total_query = select(func.count(User.id))
    total_result = await db.execute(total_query)
    total_users = total_result.scalar_one_or_none() or 0
    
    # Churn: Users registered more than 30 days ago, who haven't logged in for 30 days
    churn_query = select(func.count(User.id)).where(
        and_(
            User.created_at <= thirty_days_ago,
            or_(User.last_login == None, User.last_login < thirty_days_ago)
        )
    )
    # Note: 'or_' is needed.
    from sqlalchemy import or_
    churn_query = select(func.count(User.id)).where(
        and_(
            User.created_at <= thirty_days_ago,
            or_(User.last_login == None, User.last_login < thirty_days_ago)
        )
    )
    churn_result = await db.execute(churn_query)
    churn_users = churn_result.scalar_one_or_none() or 0
    
    churn_rate = 0
    if total_users > 0:
        churn_rate = round((churn_users / total_users) * 100, 2)
        
    return {
        "dau": dau,
        "mau": mau,
        "total_users": total_users,
        "churn_rate": churn_rate,
        "churn_users": churn_users
    }

@router.get("/churn-by-level")
async def get_churn_by_level(db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    """Returns churned users grouped by their current phase (friction points)"""
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    from sqlalchemy import or_
    
    # Get all churned students and their current phase
    query = select(Alumno.fase_actual_id, func.count(Alumno.id)).join(User, User.id == Alumno.user_id).where(
        and_(
            User.created_at <= thirty_days_ago,
            or_(User.last_login == None, User.last_login < thirty_days_ago)
        )
    ).group_by(Alumno.fase_actual_id)
    
    result = await db.execute(query)
    data = result.all()
    
    return [
        {"fase_id": row[0], "churned_users": row[1]} for row in data
    ]
