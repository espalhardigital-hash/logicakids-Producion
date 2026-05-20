"""
Auth Module - LogicaKids Pro
============================
Maneja JWT, bcrypt, login, register y get_admin_user.

Actualizado para crear automaticamente un perfil de Alumno
al registrar un nuevo usuario.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import uuid
from dotenv import load_dotenv

from .db.session import get_db
from .models.sql_models import User, Alumno, Fase, ProgresoMaestria, EstadoProgresoEnum, OperacionEnum

load_dotenv()

# Configuration
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in environment variables")
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    # Fetch alumno profile if exists
    result = await db.execute(select(Alumno).where(Alumno.user_id == user_id))
    alumno = result.scalar_one_or_none()
    
    # Convert to dict for compatibility
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "avatar": user.avatar,
        "settings": user.settings or {},
        # Datos pedagogicos del alumno
        "alumno_id": alumno.id if alumno else None,
        "fase_actual_id": alumno.fase_actual_id if alumno else None,
        "unlocked_level": 5 if user.role == "ADMIN" else user.unlocked_level,
        "unlockedLevel": 5 if user.role == "ADMIN" else user.unlocked_level,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "lastLogin": user.last_login.isoformat() if user.last_login else None,
    }


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Se requieren privilegios de administrador"
        )
    return current_user


async def authenticate_user(db: AsyncSession, email: str, password: str):
    """Verify user credentials and return user if valid."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    if not user.password_hash:
        return None
    if not verify_password(password, user.password_hash):
        return None
    
    return user


async def create_user(db: AsyncSession, username: str, email: str, password: str) -> User:
    """
    Create a new user with hashed password.
    Also creates the Alumno profile linked to the user,
    with fase_actual_id set to Fase 0 (orden=0).
    Special logic: for eloisa@gmail.com and joaquin@gmail.com,
    set addition level to 6, phase to Fase 1, and approve Suma in ProgresoMaestria.
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    is_special_student = email.lower() in ["eloisa@gmail.com", "joaquin@gmail.com"]
    
    # Create auth user
    new_user = User(
        id=str(uuid.uuid4()),
        username=username,
        email=email,
        password_hash=get_password_hash(password),
        role="USER",
        status="ACTIVE",
        unlocked_level=0,
        settings={}
    )
    
    # Pre-populate unlockedLevels in settings
    addition_unlocked = 6 if is_special_student else 0
    new_user.settings = {
        "unlockedLevels": {
            "addition": addition_unlocked,
            "subtraction": 0,
            "multiplication": 0,
            "division": 0,
            "challenge": 0
        },
        "scores": []
    }
    
    db.add(new_user)
    await db.flush()  # Flush to get the user ID before creating alumno
    
    # Find active target phase (Fase 1 for special students, Fase 0 otherwise)
    target_order = 1 if is_special_student else 0
    result = await db.execute(select(Fase).where(Fase.orden == target_order))
    target_fase = result.scalar_one_or_none()
    
    if not target_fase:
        # Fallback to whatever phase exists
        result = await db.execute(select(Fase).order_by(Fase.orden.asc()).limit(1))
        target_fase = result.scalar_one_or_none()
        
    # Create alumno profile linked to user
    alumno = Alumno(
        user_id=new_user.id,
        nombre=username,  # Default name = username
        fase_actual_id=target_fase.id if target_fase else None,
    )
    db.add(alumno)
    await db.flush()
    
    # If special student, automatically approve SUMA in Fase 1 and start RESTA
    if is_special_student and target_fase:
        # Create approved SUMA progress
        new_prog_suma = ProgresoMaestria(
            alumno_id=alumno.id,
            fase_id=target_fase.id,
            seccion=1,
            operacion=OperacionEnum.SUMA,
            estado=EstadoProgresoEnum.APROBADO,
            aciertos_acumulados=47,  # 95% of 50
            intentos_totales=50,
            porcentaje_actual=95,
            fecha_inicio=datetime.utcnow(),
            fecha_aprobacion=datetime.utcnow()
        )
        db.add(new_prog_suma)
        
        # Create EN_PROGRESO RESTA progress
        new_prog_resta = ProgresoMaestria(
            alumno_id=alumno.id,
            fase_id=target_fase.id,
            seccion=1,
            operacion=OperacionEnum.RESTA,
            estado=EstadoProgresoEnum.EN_PROGRESO,
            aciertos_acumulados=0,
            intentos_totales=0,
            porcentaje_actual=0,
            fecha_inicio=datetime.utcnow()
        )
        db.add(new_prog_resta)
        
    await db.commit()
    await db.refresh(new_user)
    
    return new_user
