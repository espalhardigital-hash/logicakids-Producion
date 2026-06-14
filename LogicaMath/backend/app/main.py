"""
LogicaKids Pro API - Punto de Entrada Principal
===============================================
"""
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from redis import asyncio as aioredis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

from .routers import auth_users, ai
from .admin.router import router as admin_router
from .fase1.router import router as fase1_router
from .fase2.router import router as fase2_router
from .fase3.router import router as fase3_router
from .fase4.router import router as fase4_router
from .fase5.router import router as fase5_router
from .fase6.router import router as fase6_router
from .fase7.router import router as fase7_router
from .fase8.router import router as fase8_router
from .fase9.router import router as fase9_router
from .api.rutas.simulados import router as simulados_router
from .config import settings
from .db.session import engine
from .db.base import Base
from .models.sql_models import (
    User, Fase, Alumno, Pregunta, Alternativa, 
    ConfiguracionProgreso, PoolAsignadoAlumno, ProgresoMaestria, Intento,
    PlatformSettings, IntentoPregunta, IntentoPaso
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar Base de Datos (crear tablas si no existen)
    if os.environ.get("SKIP_DB_ALTERATIONS", "false").lower() == "true":
        print("=============================================")
        print("⚠️ SKIP_DB_ALTERATIONS is ENABLED.")
        print("⚠️ Skipping Base.metadata.create_all to protect remote DB.")
        print("=============================================")
    else:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                print("✅ Tablas de base de datos verificadas/creadas exitosamente.")
        except Exception as e:
            print(f"❌ Error al verificar/crear tablas: {e}")

    # Inicializar Redis Cache
    try:
        redis = aioredis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=False)
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
        print("✅ Redis cache inicializado exitosamente.")
    except Exception as e:
        print(f"❌ Error al inicializar Redis: {e}")

    # S3 warning
    if not all([settings.S3_ACCESS_KEY, settings.S3_SECRET_KEY, settings.S3_ENDPOINT_URL, settings.S3_BUCKET_NAME]):
        print("WARNING: S3 configuration incomplete. Avatar upload will fail.")
        
    yield

class StripAPIPrefixMiddleware:
    """
    Middleware ASGI para eliminar el prefijo '/api' de las rutas entrantes.
    Esto permite que el entorno local funcione de forma idéntica al entorno
    del VPS (donde Traefik elimina el prefijo '/api' antes de pasar la solicitud).
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path.startswith("/api"):
                new_path = path[4:]
                if not new_path:
                    new_path = "/"
                scope["path"] = new_path
                
                if "raw_path" in scope:
                    raw_path = scope["raw_path"]
                    if raw_path.startswith(b"/api"):
                        scope["raw_path"] = raw_path[4:] or b"/"
                        
        await self.app(scope, receive, send)

app = FastAPI(title="LogicaKids Pro API", version="3.0.0", lifespan=lifespan)

app.add_middleware(StripAPIPrefixMiddleware)

# Security Headers
if settings.ENABLE_SECURITY_HEADERS:
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

# CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "LogicaKids Pro - Backend API"}

# ============================================================
# INCLUDE ROUTERS
# ============================================================

app.include_router(auth_users.router)
app.include_router(admin_router)
app.include_router(fase1_router)
app.include_router(ai.router)
app.include_router(fase2_router)
app.include_router(fase3_router)
app.include_router(fase4_router)
app.include_router(fase5_router)
app.include_router(fase6_router)
app.include_router(fase7_router)
app.include_router(fase8_router)
app.include_router(fase9_router)
app.include_router(simulados_router)

# ============================================================
# WEBSOCKETS (Sincronización en Tiempo Real)
# ============================================================

from fastapi import WebSocket, WebSocketDisconnect
from .utils.websocket_manager import manager

@app.websocket("/ws/admin-sync")
async def websocket_endpoint(websocket: WebSocket):
    """
    Endpoint para que los estudiantes escuchen actualizaciones en tiempo real
    del administrador (ej: nueva pregunta agregada, flujo modificado).
    """
    await manager.connect(websocket)
    try:
        while True:
            # Mantener la conexión viva y escuchar si envían algún mensaje (no se espera ninguno por ahora)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
