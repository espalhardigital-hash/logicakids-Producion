from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import uuid
import boto3
import io
import os
from PIL import Image, ImageOps
from typing import List
from datetime import datetime

from ..schemas import Token, UserRegister, UserLogin, User, CategoryLevelUpdate, UserCreate
from ..db.session import get_db
from ..models.sql_models import User as UserModel
from ..auth import (
    authenticate_user,
    create_user,
    create_access_token,
    get_current_user,
    get_admin_user,
    get_password_hash
)

router = APIRouter()

# S3 Configuration
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")
S3_REGION = os.environ.get("S3_REGION", "us-east-1")


@router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    try:
        user = await create_user(db, user_data.username, user_data.email, user_data.password)
        access_token = create_access_token(data={"sub": user.id})
        return Token(access_token=access_token)
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno en el servidor: {str(e)}")

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user.last_login = datetime.utcnow()
    await db.commit()
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token)

@router.get("/users")
async def get_all_users(db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(UserModel))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "avatar": u.avatar,
            "unlocked_level": u.unlocked_level,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
            "lastLogin": u.last_login.isoformat() if u.last_login else None,
        }
        for u in users
    ]

@router.get("/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.patch("/users/me/progress/level")
async def update_user_level(
    level_update: CategoryLevelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(UserModel).where(UserModel.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    settings = user.settings or {}
    unlocked_levels = settings.get("unlockedLevels", {})
    current_level = unlocked_levels.get(level_update.category, 0)
    
    if level_update.new_level > current_level:
        unlocked_levels[level_update.category] = level_update.new_level
        settings["unlockedLevels"] = unlocked_levels
        from sqlalchemy.orm.attributes import flag_modified
        user.settings = settings
        flag_modified(user, "settings")
        await db.commit()
    
    return {"message": "Nivel actualizado", "unlockedLevels": unlocked_levels}

@router.post("/users")
async def save_user(
    user_data: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = user_data.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    if current_user["role"] != "ADMIN" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="No permission to update this user")
    
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if current_user["role"] != "ADMIN":
        allowed = ["username", "avatar", "settings"]
        for key in allowed:
            if key in user_data:
                setattr(user, key, user_data[key])
    else:
        for key in ["username", "avatar", "settings", "role", "status", "unlocked_level"]:
            if key in user_data:
                setattr(user, key, user_data[key])
    
    await db.commit()
    await db.refresh(user)
    return {
        "id": user.id, "username": user.username, "email": user.email,
        "role": user.role, "status": user.status, "avatar": user.avatar,
        "unlocked_level": user.unlocked_level,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "lastLogin": user.last_login.isoformat() if user.last_login else None
    }

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await db.delete(user)
    await db.commit()
    return {"message": "Usuario eliminado correctamente", "id": user_id}

class AdminUserCreate(UserCreate):
    pass

@router.post("/admin/users")
async def admin_create_user(user_data: AdminUserCreate, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(UserModel).where(UserModel.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user = UserModel(
        id=str(uuid.uuid4()),
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        status="ACTIVE"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {
        "id": user.id, "username": user.username, "email": user.email,
        "role": user.role, "status": user.status,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "message": "Usuario creado correctamente"
    }

from pydantic import BaseModel
class PasswordChange(BaseModel):
    new_password: str

@router.patch("/admin/users/{user_id}/password")
async def admin_change_password(user_id: str, password_data: PasswordChange, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.password_hash = get_password_hash(password_data.new_password)
    await db.commit()
    return {"message": "Contraseña actualizada correctamente", "user_id": user_id}

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes")
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        image = ImageOps.fit(image, (500, 500), method=Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=80, optimize=True)
        buffer.seek(0)
        file_extension = "webp"
        content_type = "image/webp"
    except Exception as img_err:
        print(f"Image processing failed: {img_err}")
        raise HTTPException(status_code=422, detail="Error procesando la imagen.")

    filename = f"{current_user['id']}_{uuid.uuid4()}.{file_extension}"
    if not all([S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT_URL, S3_BUCKET_NAME]):
        raise HTTPException(status_code=503, detail="Configuración S3 incompleta.")
    try:
        s3 = boto3.client('s3', endpoint_url=S3_ENDPOINT_URL, aws_access_key_id=S3_ACCESS_KEY, aws_secret_access_key=S3_SECRET_KEY, region_name=S3_REGION)
        s3.upload_fileobj(buffer, S3_BUCKET_NAME, filename, ExtraArgs={'ContentType': content_type})
        url = f"/api/avatars/{filename}"
        return {"success": True, "url": url}
    except Exception as e:
        print(f"S3 Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {str(e)}")

@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    if not all([S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT_URL, S3_BUCKET_NAME]):
        raise HTTPException(status_code=503, detail="Configuración S3 incompleta.")
    try:
        s3 = boto3.client('s3', endpoint_url=S3_ENDPOINT_URL, aws_access_key_id=S3_ACCESS_KEY, aws_secret_access_key=S3_SECRET_KEY, region_name=S3_REGION)
        response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=filename)
        return StreamingResponse(response['Body'], media_type="image/webp")
    except s3.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="Avatar no encontrado")
    except Exception as e:
        print(f"Error fetching avatar {filename}: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo imagen")
