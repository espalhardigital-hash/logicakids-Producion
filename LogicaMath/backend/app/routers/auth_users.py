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
from pydantic import BaseModel as PydanticBaseModel

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

from pydantic import BaseModel as PydanticBaseModel
class SelfProfileUpdate(PydanticBaseModel):
    username: str | None = None
    email: str | None = None
    new_password: str | None = None

@router.patch("/users/me/profile")
async def update_own_profile(
    data: SelfProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(UserModel).where(UserModel.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.username:
        user.username = data.username
    if data.email:
        # Check uniqueness
        dup = await db.execute(select(UserModel).where(UserModel.email == data.email, UserModel.id != user.id))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="El email ya está en uso por otro usuario")
        user.email = data.email
    if data.new_password:
        if len(data.new_password) < 6:
            raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
        user.password_hash = get_password_hash(data.new_password)

    await db.commit()
    await db.refresh(user)
    return {"message": "Perfil actualizado", "username": user.username, "email": user.email}


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
        image_bytes = buffer.getvalue()
        content_type = "image/webp"
    except Exception as img_err:
        print(f"Image processing failed: {img_err}")
        raise HTTPException(status_code=422, detail="Error procesando la imagen.")

    filename = f"{current_user['id']}_{uuid.uuid4()}.webp"
    if not all([S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT_URL, S3_BUCKET_NAME]):
        raise HTTPException(status_code=503, detail="Configuración S3 incompleta.")

    import asyncio
    def _upload_to_s3():
        s3 = boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT_URL,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY,
            region_name=S3_REGION
        )
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=filename,
            Body=image_bytes,
            ContentType=content_type
        )

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _upload_to_s3)
        
        # Return the proxy URL instead of direct MinIO URL because the bucket is PRIVATE
        # The frontend will resolve this using getAvatarUrl
        proxy_url = f"/api/avatars/{filename}"
        return {"success": True, "url": proxy_url}
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {str(e)}")

@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    if not all([S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT_URL, S3_BUCKET_NAME]):
        raise HTTPException(status_code=503, detail="Configuración S3 incompleta.")
    import asyncio
    from botocore.exceptions import ClientError
    
    def _fetch_from_s3():
        s3 = boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT_URL,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY,
            region_name=S3_REGION
        )
        try:
            response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=filename)
            content = response['Body'].read()
            content_type = response.get('ContentType', 'image/webp')
            return content, content_type
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code in ('NoSuchKey', '404'):
                return None, None
            raise

    try:
        loop = asyncio.get_event_loop()
        content, content_type = await loop.run_in_executor(None, _fetch_from_s3)
        if content is None:
            raise HTTPException(status_code=404, detail="Avatar no encontrado")
        from fastapi.responses import Response
        return Response(content=content, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching avatar {filename}: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo imagen")

# --- SCORES AND PROGRESS (Saved in User Settings) ---

class ScoreRecordBase(PydanticBaseModel):
    id: str
    user: str
    score: int
    correctCount: int
    errorCount: int
    avgTime: float
    date: str
    subject_id: str | None = None
    category: str | None = None
    difficulty: str | None = None

@router.post("/scores")
async def save_score(
    score: ScoreRecordBase,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(UserModel).where(UserModel.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    settings = user.settings or {}
    scores = settings.get("scores", [])
    scores.append(score.model_dump() if hasattr(score, "model_dump") else score.dict())
    
    settings["scores"] = scores
    from sqlalchemy.orm.attributes import flag_modified
    user.settings = settings
    flag_modified(user, "settings")
    await db.commit()
    return {"message": "Score guardado exitosamente"}

@router.get("/scores")
async def get_scores(
    user: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") == "ADMIN" and not user:
        result = await db.execute(select(UserModel))
        users = result.scalars().all()
        all_scores = []
        for u in users:
            s = (u.settings or {}).get("scores", [])
            all_scores.extend(s)
        return all_scores
    
    target_username = user if user else current_user.get("username")
    result = await db.execute(select(UserModel).where(UserModel.username == target_username))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        return []
    
    return (target_user.settings or {}).get("scores", [])

@router.delete("/scores/{score_id}")
async def delete_score(
    score_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific score by ID. Admin can delete any score, users can only delete their own."""
    if current_user.get("role") == "ADMIN":
        # Admin: search all users for the score
        result = await db.execute(select(UserModel))
        all_users = result.scalars().all()
        for u in all_users:
            settings = u.settings or {}
            scores = settings.get("scores", [])
            original_len = len(scores)
            scores = [s for s in scores if s.get("id") != score_id]
            if len(scores) < original_len:
                settings["scores"] = scores
                from sqlalchemy.orm.attributes import flag_modified
                u.settings = settings
                flag_modified(u, "settings")
                await db.commit()
                return {"message": "Score eliminado exitosamente"}
        raise HTTPException(status_code=404, detail="Score no encontrado")
    else:
        # Regular user: only delete own scores
        result = await db.execute(select(UserModel).where(UserModel.id == current_user["id"]))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        settings = user.settings or {}
        scores = settings.get("scores", [])
        original_len = len(scores)
        scores = [s for s in scores if s.get("id") != score_id]
        if len(scores) == original_len:
            raise HTTPException(status_code=404, detail="Score no encontrado")
        settings["scores"] = scores
        from sqlalchemy.orm.attributes import flag_modified
        user.settings = settings
        flag_modified(user, "settings")
        await db.commit()
        return {"message": "Score eliminado exitosamente"}

@router.get("/users/me/progress")
async def get_user_progress(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(UserModel).where(UserModel.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        return []

    settings = user.settings or {}
    unlocked_levels = settings.get("unlockedLevels", {})
    scores = settings.get("scores", [])

    progress_by_cat = {}
    categories = ["addition", "subtraction", "multiplication", "division", "challenge"]
    for cat in categories:
        progress_by_cat[cat] = {
            "category": cat,
            "unlocked_level": unlocked_levels.get(cat, 0),
            "total_games": 0,
            "total_score": 0,
            "total_correct": 0,
            "total_errors": 0,
            "total_time_seconds": 0,
        }
    
    for s in scores:
        cat = s.get("category")
        if cat in progress_by_cat:
            progress_by_cat[cat]["total_games"] += 1
            progress_by_cat[cat]["total_score"] += s.get("score", 0)
            progress_by_cat[cat]["total_correct"] += s.get("correctCount", 0)
            progress_by_cat[cat]["total_errors"] += s.get("errorCount", 0)
            progress_by_cat[cat]["total_time_seconds"] += s.get("avgTime", 0) * (s.get("correctCount", 0) + s.get("errorCount", 0))

    for cat_data in progress_by_cat.values():
        tq = cat_data["total_correct"] + cat_data["total_errors"]
        if tq > 0:
            cat_data["accuracy_rate"] = round((cat_data["total_correct"] / tq) * 100)
            cat_data["avg_response_time"] = round(cat_data["total_time_seconds"] / tq, 2)
        else:
            cat_data["accuracy_rate"] = 0
            cat_data["avg_response_time"] = 0

    return list(progress_by_cat.values())
