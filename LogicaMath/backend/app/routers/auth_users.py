from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
import uuid
import io
import os
from PIL import Image, ImageOps
from typing import List
from datetime import datetime
from pydantic import BaseModel as PydanticBaseModel

from ..schemas import Token, UserRegister, UserLogin, User, CategoryLevelUpdate, UserCreate
from ..db.session import get_db
from ..core.storage import storage_service
from ..models.sql_models import (
    User as UserModel,
    Fase,
    Alumno,
    ConfiguracionProgreso,
    ProgresoMaestria,
    Intento,
    EstadoProgresoEnum
)
from ..auth import (
    authenticate_user,
    create_user,
    create_access_token,
    get_current_user,
    get_admin_user,
    get_password_hash
)

router = APIRouter()




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
async def get_all_users(
    skip: int = 0,
    limit: int = 20,
    search: str = "",
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    db: AsyncSession = Depends(get_db), 
    admin_user: dict = Depends(get_admin_user)
):
    from sqlalchemy import or_, func, desc, asc
    query = select(UserModel)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(or_(
            UserModel.username.ilike(search_term),
            UserModel.email.ilike(search_term)
        ))
    
    # Sorting
    sort_column = getattr(UserModel, sort_by, UserModel.created_at)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one_or_none() or 0

    # Pagination
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "data": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "status": u.status,
                "avatar": u.avatar,
                "unlocked_level": u.unlocked_level,
                "unlockedLevel": u.unlocked_level,
                "createdAt": u.created_at.isoformat() if u.created_at else None,
                "lastLogin": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ],
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "limit": limit
    }

@router.get("/users/me")
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alumno_id = current_user.get("alumno_id")
    if alumno_id:
        from ..services.pedagogia_service import recalcular_y_sincronizar_fase_actual
        nueva_fase = await recalcular_y_sincronizar_fase_actual(alumno_id, db)
        current_user["fase_actual_id"] = nueva_fase
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
        allowed = ["username", "avatar"]
        for key in allowed:
            if key in user_data:
                setattr(user, key, user_data[key])
        if "settings" in user_data and isinstance(user_data["settings"], dict):
            new_settings = user_data["settings"]
            current_settings = user.settings or {}
            for protected in ["scores", "unlockedLevels"]:
                if protected in current_settings:
                    new_settings[protected] = current_settings[protected]
                elif protected in new_settings:
                    del new_settings[protected]
            user.settings = new_settings
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(user, "settings")
    else:
        for key in ["username", "avatar", "settings", "role", "status", "unlocked_level"]:
            if key in user_data:
                setattr(user, key, user_data[key])
                if key == "settings":
                    from sqlalchemy.orm.attributes import flag_modified
                    flag_modified(user, "settings")
    
    await db.commit()
    await db.refresh(user)
    return {
        "id": user.id, "username": user.username, "email": user.email,
        "role": user.role, "status": user.status, "avatar": user.avatar,
        "unlocked_level": user.unlocked_level,
        "unlockedLevel": user.unlocked_level,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "lastLogin": user.last_login.isoformat() if user.last_login else None
    }

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Manually delete Alumno first to avoid cascade issues with asyncpg
    from ..models.sql_models import Alumno
    await db.execute(delete(Alumno).where(Alumno.user_id == user_id))
    
    await db.delete(user)
    await db.commit()
    return {"message": "Usuario eliminado correctamente", "id": user_id}

@router.post("/admin/users/{user_id}/forget")
async def anonymize_user(user_id: str, db: AsyncSession = Depends(get_db), admin_user: dict = Depends(get_admin_user)):
    """
    Derecho al Olvido (GDPR-K / COPPA): Anonymizes the user to remove PII
    but keeps statistical data intact.
    """
    import uuid
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    anon_id = str(uuid.uuid4())[:8]
    user.username = f"Anonimo_{anon_id}"
    user.email = f"{anon_id}@deleted.com"
    user.password_hash = None
    user.avatar = None
    user.status = "BANNED" # Optional, or just leave as is. Usually we prevent login.
    
    # Anonymize linked Alumno if exists
    from ..models.sql_models import Alumno
    alumno_result = await db.execute(select(Alumno).where(Alumno.user_id == user_id))
    alumno = alumno_result.scalar_one_or_none()
    if alumno:
        alumno.nombre = f"Estudiante_{anon_id}"
        alumno.avatar = None
    
    await db.commit()
    return {"message": "Usuario anonimizado correctamente (Derecho al olvido)", "id": user_id}

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
        status="ACTIVE",
        unlocked_level=0,
        settings={
            "unlockedLevels": {
                "addition": 0,
                "subtraction": 0,
                "multiplication": 0,
                "division": 0,
                "challenge": 0
            },
            "scores": []
        }
    )
    db.add(user)
    await db.flush()
    
    from ..models.sql_models import Fase, Alumno, StatusEnum
    # Buscar la fase activa con el menor orden (generalmente Fase 1)
    result = await db.execute(
        select(Fase)
        .where(Fase.estado == StatusEnum.ACTIVO)
        .order_by(Fase.orden.asc())
        .limit(1)
    )
    fase_inicial = result.scalar_one_or_none()
    
    if not fase_inicial:
        # Fallback: buscar la fase de menor orden sin importar estado
        result = await db.execute(select(Fase).order_by(Fase.orden.asc()).limit(1))
        fase_inicial = result.scalar_one_or_none()
        
    alumno = Alumno(
        user_id=user.id,
        nombre=user.username,
        fase_actual_id=fase_inicial.id if fase_inicial else None
    )
    db.add(alumno)
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
    except Exception as img_err:
        print(f"Image processing failed: {img_err}")
        raise HTTPException(status_code=422, detail="Error procesando la imagen.")

    filename = f"{current_user['id']}_{uuid.uuid4()}.webp"
    
    try:
        # Usar el storage_service unificado
        avatar_url = await storage_service.upload_avatar(image_bytes, filename)
        return {"success": True, "url": avatar_url}
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {str(e)}")

@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    safe_filename = os.path.basename(filename)
    local_path = os.path.join("app", "static", "avatars", safe_filename)
    if os.path.exists(local_path):
        from fastapi.responses import FileResponse
        return FileResponse(local_path, media_type="image/webp")

    if not storage_service.s3_client:
        raise HTTPException(status_code=404, detail="Avatar no encontrado localmente y S3 no configurado.")
        
    import asyncio
    from botocore.exceptions import ClientError
    
    def _fetch_from_s3():
        try:
            response = storage_service.s3_client.get_object(Bucket=storage_service.bucket_name, Key=safe_filename)
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
    if user and current_user.get("role") != "ADMIN" and user != current_user.get("username"):
        raise HTTPException(status_code=403, detail="Not authorized to view other users' scores")

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
            "unlocked_level": 5 if user.role == "ADMIN" else unlocked_levels.get(cat, 1),
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


def get_block_metadata(fase_id: int, seccion: int, operacion: str, fase_nombre: str):
    fase_titulo = fase_nombre or f"Fase {fase_id}"
    modulo_id = 1
    modulo_titulo = "Módulo General"
    nivel_id = None
    nivel_titulo = None
    desafio_id = None
    desafio_titulo = None

    op_clean = operacion.value if hasattr(operacion, "value") else operacion
    op_clean = op_clean.lower() if op_clean else ""

    if fase_id == 1:
        if seccion >= 100 and seccion < 200:
            modulo_id = 1
            modulo_titulo = "Sumas"
            sub_id = seccion - 100
        elif seccion >= 200 and seccion < 300:
            modulo_id = 2
            modulo_titulo = "Restas"
            sub_id = seccion - 200
        elif seccion >= 300 and seccion < 400:
            modulo_id = 3
            modulo_titulo = "Tablas"
            sub_id = seccion - 300
        elif seccion >= 400 and seccion < 500:
            modulo_id = 4
            modulo_titulo = "Divisiones"
            sub_id = seccion - 400
        else:
            modulo_id = 5
            modulo_titulo = "Desafío Mixto"
            sub_id = seccion

        if sub_id <= 3:
            nivel_id = sub_id
            nivel_titles = {
                1: {1: "Algoritmo tradicional", 2: "Restas con reagrupación", 3: "Tablas de multiplicar", 4: "División exacta", 5: "Alternancia básica"},
                2: {1: "Sumas encadenadas", 2: "La trampa del cero", 3: "Tablas extendidas", 4: "Divisiones inexactas", 5: "Operaciones lineales"},
                3: {1: "Cálculo veloz", 2: "Hallar el valor faltante", 3: "Atajos rápidos", 4: "Divisiones rápidas", 5: "Fusión de velocidad"}
            }
            nivel_titulo = nivel_titles.get(nivel_id, {}).get(modulo_id, f"Nivel {nivel_id}")
        elif sub_id in (4, 104, 204, 304, 404):
            desafio_id = 1
            desafio_titulo = "Desafío 1"
        elif sub_id in (5, 105, 205, 305, 405):
            desafio_id = 2
            desafio_titulo = "Desafío 2"
        elif sub_id in (6, 106, 206, 306, 406):
            desafio_id = 3
            desafio_titulo = "Desafío Final"
        else:
            nivel_id = 1
            nivel_titulo = f"Práctica {sub_id}"

    elif fase_id in (2, 3, 4, 5, 6, 7, 8, 9):
        if seccion >= 1000:
            modulo_id = seccion // 1000
            sub_id = seccion % 1000
        else:
            modulo_id = seccion // 100
            sub_id = seccion % 100
            
        fase_modules = {
            2: {
                1: ("Gimnasio Numérico Mental", {1: "Doble y Mitad", 2: "Prioridad Operativa", 3: "Lenguaje Verbal"}),
                2: ("Tablas en Acción", {1: "Inversa Suma/Resta", 2: "Inversa Mult/Div", 3: "Número Faltante", 4: "Gran Integración"}),
                3: ("Tienda Matemática", {1: "Reconozco el Dinero", 2: "Pago y Cambio", 3: "Carrito de Compras", 4: "Comprador Inteligente"}),
                4: ("Constructor de Soluciones", {1: "Problemas de Dos Pasos", 2: "Encadenamiento", 3: "Minimización de Error"})
            },
            3: {
                1: ("El Detective Literario", {1: "Aislamiento de Variables", 2: "Datos Útiles", 3: "Descarte"}),
                2: ("Secuencia Temporal", {1: "Operaciones Cronológicas", 2: "Álgebra Retrospectiva", 3: "Mutaciones Sucesivas"}),
                3: ("Deducción de Precios", {1: "Comparación de Carritos", 2: "Grilla de Doble Entrada", 3: "Álgebra Visual"}),
                4: ("Reparto y Residuos", {1: "Agrupación Visual", 2: "Análisis de Resto", 3: "Sucesión Circular"}),
                5: ("Ciclos y Agrupaciones Máximas", {1: "Visualización de Saltos", 2: "Encuentros Periódicos", 3: "División Máxima MCD"})
            },
            4: {
                1: ("La Fracción Visual", {1: "Fracción Sombreada", 2: "Fracciones Equivalentes", 3: "Divisiones Asimétricas"}),
                2: ("Fracción de Cantidad", {1: "Fracción como División", 2: "Fracciones Compuestas", 3: "Fracción del Resto"}),
                3: ("Porcentajes Rápidos", {1: "Porcentajes Básicos", 2: "Gráficos Circulares", 3: "Lectura de Gráficos", 4: "Punto de Equilibrio"}),
                4: ("Razón y Mezclas", {1: "Proporciones", 2: "Mezclas a Escala", 3: "Reparto Proporcional"})
            }
        }
        
        mod_meta = fase_modules.get(fase_id, {}).get(modulo_id, (f"Módulo {modulo_id}", {}))
        modulo_titulo = mod_meta[0]
        
        if sub_id >= 11:
            desafio_id = sub_id - 10
            desafio_names = {1: "Desafío 1", 2: "Desafío 2", 3: "Desafío Final"}
            desafio_titulo = desafio_names.get(desafio_id, f"Desafío {desafio_id}")
        else:
            nivel_id = sub_id
            nivel_titulo = mod_meta[1].get(nivel_id, f"Nivel {nivel_id}")
            
    return fase_titulo, modulo_id, modulo_titulo, nivel_id, nivel_titulo, desafio_id, desafio_titulo


@router.get("/users/me/progress/summary")
async def get_progress_summary(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        return {
            "alumno_id": "",
            "total_bloques_trabajados": 0,
            "total_bloques_aprobados": 0,
            "total_bloques_liberados_admin": 0,
            "total_bloques_aprobados_admin": 0,
            "precision_promedio": 0,
            "completitud_promedio": 0,
            "total_aciertos": 0,
            "total_errores": 0,
            "tiempo_total_segundos": 0
        }

    result_prog = await db.execute(
        select(ProgresoMaestria).where(ProgresoMaestria.alumno_id == alumno_id)
    )
    progresos = result_prog.scalars().all()

    result_c = await db.execute(
        select(ConfiguracionProgreso).where(ConfiguracionProgreso.activo == True)
    )
    configs = result_c.scalars().all()
    configs_map = {
        (c.fase_id, c.seccion, c.operacion.value if hasattr(c.operacion, "value") else c.operacion): c
        for c in configs
    }

    total_bloques_trabajados = 0
    total_bloques_aprobados = 0
    total_bloques_liberados_admin = 0
    total_bloques_aprobados_admin = 0
    
    total_aciertos = 0
    total_errores = 0
    total_completitud = 0
    total_precision = 0
    count_for_precision = 0

    for p in progresos:
        op_val = p.operacion.value if hasattr(p.operacion, "value") else p.operacion
        config = configs_map.get((p.fase_id, p.seccion, op_val))
        
        if p.intentos_totales > 0 or p.estado == EstadoProgresoEnum.APROBADO or p.aprobado_por_admin:
            total_bloques_trabajados += 1

        if p.estado == EstadoProgresoEnum.APROBADO:
            total_bloques_aprobados += 1
            if p.aprobado_por_admin:
                total_bloques_aprobados_admin += 1
        
        if p.estado == EstadoProgresoEnum.EN_PROGRESO and p.intentos_totales == 0:
            total_bloques_liberados_admin += 1

        total_aciertos += p.aciertos_acumulados
        total_errores += max(p.intentos_totales - p.aciertos_acumulados, 0)

        if config and config.cantidad_requerida > 0:
            if p.estado == EstadoProgresoEnum.APROBADO:
                total_completitud += 100
            else:
                total_completitud += min(int((p.intentos_totales / config.cantidad_requerida) * 100), 100)
        
        if p.intentos_totales > 0:
            total_precision += int((p.aciertos_acumulados / p.intentos_totales) * 100)
            count_for_precision += 1

    precision_promedio = int(total_precision / count_for_precision) if count_for_precision > 0 else 0
    num_configs = len(configs)
    completitud_promedio = int(total_completitud / num_configs) if num_configs > 0 else 0

    from sqlalchemy import func
    result_time = await db.execute(
        select(func.sum(Intento.tiempo_respuesta_segundos))
        .where(and_(Intento.alumno_id == alumno_id, Intento.tiempo_respuesta_segundos != None))
    )
    tiempo_total = result_time.scalar() or 0

    return {
        "alumno_id": str(alumno_id),
        "total_bloques_trabajados": total_bloques_trabajados,
        "total_bloques_aprobados": total_bloques_aprobados,
        "total_bloques_liberados_admin": total_bloques_liberados_admin,
        "total_bloques_aprobados_admin": total_bloques_aprobados_admin,
        "precision_promedio": precision_promedio,
        "completitud_promedio": completitud_promedio,
        "total_aciertos": total_aciertos,
        "total_errores": total_errores,
        "tiempo_total_segundos": int(tiempo_total)
    }


@router.get("/users/me/progress/blocks")
async def get_progress_blocks(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        return []

    # Get all phases to map their names
    result_f = await db.execute(select(Fase).order_by(Fase.orden.asc()))
    fases = result_f.scalars().all()
    fases_map = {f.id: f.nombre for f in fases}

    # Query all active configurations
    result_c = await db.execute(
        select(ConfiguracionProgreso)
        .where(ConfiguracionProgreso.activo == True)
        .order_by(ConfiguracionProgreso.fase_id, ConfiguracionProgreso.seccion)
    )
    configs = result_c.scalars().all()

    # Query student's progress
    result_p = await db.execute(
        select(ProgresoMaestria).where(ProgresoMaestria.alumno_id == alumno_id)
    )
    progresos = result_p.scalars().all()
    progress_map = {
        (p.fase_id, p.seccion, p.operacion.value if hasattr(p.operacion, "value") else p.operacion): p
        for p in progresos
    }

    out = []
    for c in configs:
        op_val = c.operacion.value if hasattr(c.operacion, "value") else c.operacion
        p = progress_map.get((c.fase_id, c.seccion, op_val))

        fase_name = fases_map.get(c.fase_id, f"Fase {c.fase_id}")
        fase_titulo, modulo_id, modulo_titulo, nivel_id, nivel_titulo, desafio_id, desafio_titulo = get_block_metadata(
            c.fase_id, c.seccion, op_val, fase_name
        )

        estado = "BLOQUEADO"
        porcentaje_actual = 0
        completitud_actual = 0
        aciertos_acumulados = 0
        intentos_totales = 0
        aprobado_por_admin = False
        desbloqueado_por_admin = False
        override_tipo = None
        override_motivo = None
        override_fecha = None
        ultimo_intento_at = None

        if p:
            raw_est = p.estado.value if hasattr(p.estado, "value") else p.estado
            estado = raw_est.upper() if raw_est else "BLOQUEADO"
            porcentaje_actual = p.porcentaje_actual
            aciertos_acumulados = p.aciertos_acumulados
            intentos_totales = p.intentos_totales
            aprobado_por_admin = p.aprobado_por_admin
            ultimo_intento_at = p.ultima_actualizacion.isoformat() if p.ultima_actualizacion else None

            if c.cantidad_requerida > 0:
                completitud_actual = min(int((p.intentos_totales / c.cantidad_requerida) * 100), 100)
            else:
                completitud_actual = 0

            if estado == "APROBADO":
                completitud_actual = 100

            if p.estado == EstadoProgresoEnum.EN_PROGRESO and p.intentos_totales == 0:
                desbloqueado_por_admin = True

            if aprobado_por_admin:
                override_tipo = "approve"
                override_motivo = "Aprobado por el tutor."
                override_fecha = p.fecha_aprobacion.isoformat() if p.fecha_aprobacion else (p.ultima_actualizacion.isoformat() if p.ultima_actualizacion else None)
            elif desbloqueado_por_admin:
                override_tipo = "unlock"
                override_motivo = "Habilitado por el tutor."
                override_fecha = p.ultima_actualizacion.isoformat() if p.ultima_actualizacion else None

        out.append({
            "fase_id": c.fase_id,
            "fase_titulo": fase_titulo,
            "modulo_id": modulo_id,
            "modulo_titulo": modulo_titulo,
            "nivel_id": nivel_id,
            "nivel_titulo": nivel_titulo,
            "desafio_id": desafio_id,
            "desafio_titulo": desafio_titulo,
            "seccion": c.seccion,
            "operacion": op_val,
            "estado": estado,
            "porcentaje_actual": porcentaje_actual,
            "completitud_actual": completitud_actual,
            "aciertos_acumulados": aciertos_acumulados,
            "intentos_totales": intentos_totales,
            "desbloqueado_por_admin": desbloqueado_por_admin,
            "aprobado_por_admin": aprobado_por_admin,
            "override_tipo": override_tipo,
            "override_motivo": override_motivo,
            "override_fecha": override_fecha,
            "ultimo_intento_at": ultimo_intento_at
        })

    return out


@router.get("/users/me/progress/history")
async def get_progress_history(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        return []

    result = await db.execute(
        select(Intento)
        .where(Intento.alumno_id == alumno_id)
        .order_by(Intento.fecha.desc())
        .limit(100)
    )
    intentos = result.scalars().all()

    sessions = []
    intentos_sorted = sorted(intentos, key=lambda x: x.fecha)
    
    active_sessions = {}
    for i in intentos_sorted:
        op_val = i.operacion.value if hasattr(i.operacion, "value") else i.operacion
        key = (i.fase_id, i.seccion, op_val)
        
        sess = active_sessions.get(key)
        if sess and (i.fecha - sess["last_date"]).total_seconds() < 1800:
            sess["intentos_totales"] += 1
            if i.es_correcta:
                sess["aciertos"] += 1
            else:
                sess["errores"] += 1
            sess["times"].append(i.tiempo_respuesta_segundos or 0)
            sess["last_date"] = i.fecha
            sess["fecha_fin"] = i.fecha.isoformat()
        else:
            sess = {
                "id": str(i.id),
                "alumno_id": str(alumno_id),
                "session_id": str(i.id),
                "fase_id": i.fase_id,
                "seccion": i.seccion,
                "operacion": op_val,
                "aciertos": 1 if i.es_correcta else 0,
                "errores": 0 if i.es_correcta else 1,
                "intentos_totales": 1,
                "times": [i.tiempo_respuesta_segundos or 0],
                "last_date": i.fecha,
                "fecha_inicio": i.fecha.isoformat(),
                "fecha_fin": i.fecha.isoformat(),
            }
            active_sessions[key] = sess
            sessions.append(sess)
            
    out = []
    for s in sessions:
        fase_titulo, modulo_id, modulo_titulo, nivel_id, nivel_titulo, desafio_id, desafio_titulo = get_block_metadata(
            s["fase_id"], s["seccion"], s["operacion"], ""
        )
        
        avg_time = sum(s["times"]) / len(s["times"]) if s["times"] else 0
        porcentaje = int((s["aciertos"] / s["intentos_totales"]) * 100)
        completitud = min(int((s["intentos_totales"] / 15) * 100), 100)
        
        is_challenge = s["seccion"] >= 1000 or modulo_id == 99
        tipo_pool = "desafio" if is_challenge else "practica"
        
        estado_resultado = "EN_PROGRESO"
        if is_challenge:
            if porcentaje >= 90:
                estado_resultado = "APROBADO"
            else:
                estado_resultado = "NO_APROBADO"
        else:
            if s["aciertos"] >= 15:
                estado_resultado = "APROBADO"
            else:
                estado_resultado = "EN_PROGRESO"
                
        out.append({
            "id": s["id"],
            "alumno_id": s["alumno_id"],
            "session_id": s["session_id"],
            "fase_id": s["fase_id"],
            "modulo_id": modulo_id,
            "nivel_id": nivel_id,
            "desafio_id": desafio_id,
            "seccion": s["seccion"],
            "operacion": s["operacion"],
            "porcentaje": porcentaje,
            "completitud": completitud,
            "aciertos": s["aciertos"],
            "errores": s["errores"],
            "intentos_totales": s["intentos_totales"],
            "tiempo_promedio_segundos": round(avg_time, 2),
            "tipo_pool": tipo_pool,
            "estado_resultado": estado_resultado,
            "fecha_inicio": s["fecha_inicio"],
            "fecha_fin": s["fecha_fin"]
        })
        
    return sorted(out, key=lambda x: x["fecha_fin"], reverse=True)
