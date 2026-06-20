import json
import sys
import os

# Añadir el directorio del backend al path para que Python encuentre el módulo 'app'
sys.path.append(r"d:\Antigravity\APP_Logica_Matematicas_kids\LogicaMath\backend")

# Establecer variables de entorno mínimas para evitar fallos de configuración al cargar
os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@localhost/db"
os.environ["SECRET_KEY"] = "dummy_secret_key_for_openapi_generation"
os.environ["ALLOWED_ORIGINS"] = "*"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

try:
    from app.main import app
    
    # Extraer el esquema OpenAPI autogenerado por FastAPI
    openapi_schema = app.openapi()
    
    # Ruta de destino
    output_path = r"d:\Antigravity\APP_Logica_Matematicas_kids\openapi_schema.json"
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)
        
    print(f"SUCCESS: Esquema OpenAPI guardado exitosamente en {output_path}")
except Exception as e:
    print(f"ERROR: No se pudo generar el esquema: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
