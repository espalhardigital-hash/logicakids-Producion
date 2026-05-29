"""
LogicaKids Pro API - Punto de Entrada Principal
===============================================
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth_users, admin, pedagogia, ai
from .fase2.router import router as fase2_router
from .fase3.router import router as fase3_router
from .fase4.router import router as fase4_router
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
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Tablas de base de datos verificadas/creadas exitosamente.")

    except Exception as e:
        print(f"❌ Error al verificar/crear tablas: {e}")

    # S3 warning
    if not all([settings.S3_ACCESS_KEY, settings.S3_SECRET_KEY, settings.S3_ENDPOINT_URL, settings.S3_BUCKET_NAME]):
        print("WARNING: S3 configuration incomplete. Avatar upload will fail.")
        
    yield

app = FastAPI(title="LogicaKids Pro API", version="3.0.0", lifespan=lifespan)

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
app.include_router(admin.router)
app.include_router(pedagogia.router)
app.include_router(ai.router)
app.include_router(fase2_router)
app.include_router(fase3_router)
app.include_router(fase4_router)

