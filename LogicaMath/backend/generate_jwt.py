import sys
import os

# Añadir el backend al path
sys.path.append(r"d:\Antigravity\APP_Logica_Matematicas_kids\LogicaMath\backend")

# Cargar dummy env para inicializar módulos
os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@localhost/db"
os.environ["SECRET_KEY"] = "8f2b5c9a1e4d7f20258187b3d4e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d8t" # JWT secret real de Datos_Desarrollo/Producion
os.environ["ALLOWED_ORIGINS"] = "*"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

try:
    # Usar el generador de tokens del backend
    from app.auth import create_access_token
    from datetime import timedelta
    
    # Generamos un token JWT para 'amilcar_admin' (amilcar@gmail.com)
    # Con una duración muy larga (ej. 365 días) para que tu Agente no se quede sin acceso rápido
    access_token = create_access_token(
        data={"sub": "amilcar@gmail.com", "role": "ADMIN"},
        expires_delta=timedelta(days=365)
    )
    
    print("\n================ TOKEN GENERADO ================")
    print(access_token)
    print("================================================\n")
    
except Exception as e:
    print(f"Error al generar el token: {e}")
