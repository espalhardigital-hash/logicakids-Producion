from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .routers import auth_users, admin, pedagogia, subjects

load_dotenv()

# S3 Configuration Check
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")

app = FastAPI(title="LogicaKids Pro API", version="3.0.0")

# Security Headers
if os.getenv("ENABLE_SECURITY_HEADERS", "true").lower() == "true":
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

# CORS
origins_str = os.environ.get("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .db.session import engine
from .db.base import Base
from .models.sql_models import (
    User, Fase, Alumno, Pregunta, Alternativa, 
    ConfiguracionProgreso, PoolAsignadoAlumno, ProgresoMaestria, Intento,
    PlatformSettings
)

@app.on_event("startup")
async def startup_event():
    # Inicializar Base de Datos (crear tablas si no existen)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Tablas de base de datos verificadas/creadas exitosamente.")
    except Exception as e:
        print(f"❌ Error al verificar/crear tablas: {e}")

    # S3 warning
    if not all([S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT_URL, S3_BUCKET_NAME]):
        print("WARNING: S3 configuration incomplete. Avatar upload will fail.")

@app.get("/")
def read_root():
    return {"message": "LogicaKids Pro - Backend API"}

# ============================================================
# INCLUDE ROUTERS
# ============================================================

app.include_router(auth_users.router)
app.include_router(admin.router)
app.include_router(pedagogia.router)
app.include_router(subjects.router)
