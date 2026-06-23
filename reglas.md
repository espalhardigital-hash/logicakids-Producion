# 14 Reglas para IDEs Agénticas
### Cursor | Antigravity | Claude Code | Windsurf | Cline

**Autor**: J. Lujan, 22 Junio 2026, RJ  
**Versión**: 1.0  
**Licencia**: Libre para uso y modificación  
---

## Índice de Reglas

1.  [Regla 01 - Aislamiento de Seguridad y Base de Datos (Postgres-Docker)](#regla-01---aislamiento-de-seguridad-y-base-de-datos-postgres-docker)
2.  [Regla 02 - Rendimiento y Concurrencia Asíncrona (FastAPI)](#regla-02---rendimiento-y-concurrencia-asíncrona-fastapi)
3.  [Regla 03 - Aislamiento de Datos de Usuario (User Data Isolation)](#regla-03---aislamiento-de-datos-de-usuario-user-data-isolation)
4.  [Regla 04 - Cofre de Secretos (Secrets Management)](#regla-04---cofre-de-secretos-secrets-management)
5.  [Regla 05 - Robustecimiento de Sesión (Session Hardening)](#regla-05---robustecimiento-de-sesión-session-hardening)
6.  [Regla 06 - Arquitectura Limpia (Clean Architecture)](#regla-06---arquitectura-limpia-clean-architecture)
7.  [Regla 07 - Higiene de Credenciales](#regla-07---higiene-de-credenciales)
8.  [Regla 08 - Tratamiento de Errores con Contexto](#regla-08---tratamiento-de-errores-con-contexto)
9.  [Regla 09 - Higiene de Dependencias](#regla-09---higiene-de-dependencias)
10. [Regla 10 - Pruebas Primero (Test-First)](#regla-10---pruebas-primero-test-first)
11. [Regla 11 - Consistencia de API REST](#regla-11---consistencia-de-api-rest)
12. [Regla 12 - Disciplina de Commits (Conventional Commits)](#regla-12---disciplina-de-commits-conventional-commits)
13. [Regla 13 - Aislamiento de Ambientes](#regla-13---aislamiento-de-ambientes)
14. [Regla 14 - Documentación como Código](#regla-14---documentación-como-código)

---

### Estructura de Carpetas

```
tu-proyecto/
└── .agent/
    └── rules/
        ├── rule-01-security-isolation.md
        ├── rule-02-async-performance.md
        ├── rule-03-multi-tenant-shield.md
        └── ... (demás reglas)
```

---

# Regla 01 - Aislamiento de Seguridad y Base de Datos (Postgres-Docker)
---

**MOTIVO**: 
Garantizar el aislamiento total de la base de datos. El frontend y el backend DEBEN comunicarse única y exclusivamente a través de rutas de API internas. Se prohíbe cualquier intento de conexión directa o compartición de estado bypasseando la capa de red del backend.

**GATILHO**: 
Activado al crear o modificar archivos en /app, /components, /hooks o cualquier código client-side que gestione datos, peticiones HTTP o lógica de sesión.

**RESTRICCIONES INEGOCIABLES**:
- **Comunicación Exclusiva Frontend-Backend vía API**: El frontend JAMÁS se conecta directamente a la base de datos PostgreSQL. Toda interacción, consulta o mutación de datos solicitada por el cliente debe realizarse mediante peticiones HTTP a la capa de API (`/api/*`) o a través de Server Actions seguros que actúen como intermediarios.
- **Prohibición de Credenciales de DB en el Frontend**: Nunca, bajo ningún pretexto, utilices ni expongas variables de entorno de la base de datos (`DATABASE_URL`, `POSTGRES_PASSWORD`) en código del lado del cliente.
- **Zero Client-Side DB Access**: El frontend no puede importar clientes de base de datos (`Drizzle`, `Prisma`, `pg`, etc.). El acceso a la instancia de Postgres en Docker está restringido estrictamente al entorno de ejecución del servidor.
- **Headers de Seguridad**: Toda nueva ruta o middleware debe mantener los headers de CSP y Anti-Clickjacking (`frame-ancestors 'none'` para áreas de administración).

**PATRÓN DE AUTENTICACIÓN**:
- Usa siempre `getIronSession` con AES-256-GCM en el backend para verificar la identidad y roles del usuario antes de ejecutar cualquier consulta en la base de datos.

**EJEMPLO ERRÓNEO**:
```typescript
// app/components/UserTable.tsx
// ¡ERROR CRÍTICO: Intentar usar el cliente de la DB en un componente de cliente!
import { db } from '@/lib/db' 

export function UserTable() {
  const deleteUser = async (id: string) => {
    // VIOLACIÓN DE LEY: Conexión directa desde el cliente saltándose la API
    await db.deleteFrom('users').where('id', '=', id).execute() 
  }
}
```

**EJEMPLO CORRECTO**:
```typescript
// app/components/UserTable.tsx
'use client'

export function UserTable() {
  const deleteUser = async (id: string) => {
    // CUMPLIMIENTO: El frontend habla con la API, nunca con la DB
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) console.error('Error al eliminar')
  }
}

// app/api/users/[id]/route.ts
import { db } from '@/lib/db' // Seguro: corre solo en el servidor (red interna de Docker)
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getIronSession(cookies(), sessionOptions)
  
  if (!session.user?.isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // El backend procesa la petición y es el ÚNICO que toca la DB en Docker
  await db.deleteFrom('users').where('id', '=', params.id).execute()
  
  return Response.json({ success: true })
}
```

---

# Regla 02 - Rendimiento y Concurrencia Asíncrona (FastAPI)
---

**MOTIVO**:
Garantizar que el servidor de FastAPI nunca se bloquee debido a operaciones bloqueantes (E/S síncrona).

**GATILHO**:
Se activa siempre que el agente cree o modifique archivos en `/backend/app/api` o `/backend/app/services` (o rutas y lógica del backend).

**DIRECTRICES TÉCNICAS**:
- **Async First**: Toda comunicación con la base de datos, Redis o APIs externas (como OpenAI, Anthropic, Gemini) DEBE ser asíncrona (`async`/`await`).
- **Prohibición de Código Bloqueante**: Nunca utilices `time.sleep()` o librerías síncronas (como `requests`) dentro de las rutas o servicios de FastAPI. Utiliza `asyncio.sleep()` y `httpx.AsyncClient()`.
- **Tareas en Segundo Plano (Background Tasks)**: Para operaciones de larga duración que no requieran responder de inmediato, utiliza `BackgroundTasks` de FastAPI o delégalas a un sistema de colas en segundo plano si es necesario, evitando mantener al cliente esperando en la petición HTTP.

**EJEMPLO ERRÓNEO**:
```python
from fastapi import FastAPI
import requests
import time

app = FastAPI()

@app.get("/fetch-data")
def fetch_data():
    time.sleep(2)  # ¡Bloquea el bucle de eventos (Event Loop)!
    response = requests.get("https://api.externa.com/data")  # ¡Llamada bloqueante!
    return response.json()
```

**EJEMPLO CORRECTO**:
```python
from fastapi import FastAPI
import httpx
import asyncio

app = FastAPI()

@app.get("/fetch-data")
async def fetch_data():
    await asyncio.sleep(2)  # No bloquea
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.externa.com/data")
    return response.json()

# Para operaciones en segundo plano:
from fastapi import BackgroundTasks

def procesar_pdf_pesado(file_id: str):
    # Lógica de procesamiento...
    pass

@app.post("/process-document")
async def process_document(file_id: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(procesar_pdf_pesado, file_id)  # Se ejecuta después de responder
    return {"status": "processing", "file_id": file_id}
```

---

# Regla 03 - Aislamiento de Datos de Usuario (User Data Isolation)
---

**MOTIVO**:
Evitar la filtración de datos confidenciales (progreso, intentos, datos pedagógicos) entre diferentes estudiantes o usuarios de la plataforma.

**GATILHO**:
Se activa siempre que el agente cree consultas a la base de datos (SQLAlchemy, SQL directo) o desarrolle endpoints que manejen información específica del usuario.

**DIRECTRICES TÉCNICAS**:
- **Cláusula de Usuario/Alumno**: Toda y cada una de las consultas que busquen o actualicen información sensible deben filtrar explícitamente por `user_id` o `alumno_id` en SQLAlchemy (ejemplo: `.where(Modelo.user_id == user_id)`).
- **Origen de la Identidad Seguro**: El identificador del usuario/alumno NUNCA debe ser aceptado como un parámetro libre desde el frontend en el cuerpo de la petición (JSON) o en parámetros de consulta (query params) para realizar operaciones sobre datos del usuario. Debe extraerse obligatoriamente de la sesión autenticada o token JWT verificado en el backend utilizando la dependencia `get_current_user` o `get_current_student`.

**EJEMPLO ERRÓNEO**:
```python
from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.sql_models import Intento

router = APIRouter()

@router.get("/intentos")
async def listar_intentos(alumno_id: int, db: AsyncSession = Depends(get_db)):
    # ¡ERROR CRÍTICO! alumno_id viene del query param libremente. Un usuario malicioso podría alterar
    # el query param y consultar los intentos de juego de cualquier otro estudiante.
    result = await db.execute(select(Intento).where(Intento.alumno_id == alumno_id))
    return result.scalars().all()
```

**EJEMPLO CORRECTO**:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.auth import get_current_user
from app.models.sql_models import Intento, Alumno

router = APIRouter()

@router.get("/intentos")
async def listar_intentos(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # CUMPLIMIENTO: Se obtiene el alumno_id directamente de la sesión verificada en el JWT
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="Perfil de alumno no encontrado")
        
    result = await db.execute(
        select(Intento)
        .where(Intento.alumno_id == alumno_id)
    )
    return result.scalars().all()
```

---

# Regla 04 - Cofre de Secretos (Secrets Management)
---

**MOTIVO**:
Garantizar que claves de API de terceros y datos personales confidenciales (PII) de los niños y tutores nunca queden expuestos en logs ni se expongan de forma insegura.

**GATILHO**:
Se activa al manipular claves de API, tokens, contraseñas, credenciales o crear logs que puedan contener datos sensibles.

**DIRECTRICES TÉCNICAS**:
- **Criptografía en Reposo**: Si en algún momento se almacenan claves de API de proveedores externos (como OpenAI o Google Gemini para análisis pedagógicos) o contraseñas en bases de datos, estas deben estar debidamente hasheadas (ej. contraseñas con bcrypt) o cifradas si requieren recuperación en texto plano (ej. claves de API usando un servicio de cifrado simétrico).
- **Sanitización Estricta de Logs**: Está terminantemente prohibido sugerir o escribir líneas de logs que impriman variables de entorno sensibles (como `SECRET_KEY`), contraseñas en texto plano, tokens JWT o datos PII (nombres completos de niños, correos electrónicos, etc.).
- **Validación de Variables de Env en el Inicio (Startup)**: Toda nueva variable de entorno crítica debe ser validada durante el arranque del servidor para asegurar que esté configurada y tenga el formato correcto.

**EJEMPLO ERRÓNEO**:
```python
import logging
logger = logging.getLogger(__name__)

async def login_usuario(credentials: LoginSchema):
    # ¡ERROR CRÍTICO! Exponer la contraseña en texto plano en los logs de producción
    logger.info(f"Intento de login para usuario {credentials.email} con contraseña: {credentials.password}")
    ...
```

**EJEMPLO CORRECTO**:
```python
import logging
logger = logging.getLogger(__name__)

async def login_usuario(credentials: LoginSchema):
    # CUMPLIMIENTO: Log sanitizado y sin datos sensibles expuestos
    logger.info(f"Intento de login para usuario: {credentials.email}")
    ...
```

---

# Regla 05 - Robustecimiento de Sesión (Session Hardening)
---

**MOTIVO**:
Protección contra ataques de secuestro de sesión, ataques XSS que busquen robar credenciales y manipulación de cookies.

**GATILHO**:
Se activa al configurar cookies, sesiones, middlewares de autenticación o lógica de login/logout tanto en el backend como en el frontend (Next.js).

**DIRECTRICES TÉCNICAS**:
- **Atributos Seguros de Cookies**: Todas las cookies de sesión (incluyendo las de `iron-session` o JWT) deben configurarse obligatoriamente con los atributos `httpOnly: true`, `secure: true` (en entornos de producción/VPS) y `sameSite: "lax"`.
- **Limpieza en Cierre de Sesión**: Asegurar que el cierre de sesión destruya la sesión en el servidor y elimine explícitamente las cookies del cliente para evitar estados inconsistentes.

**EJEMPLO ERRÓNEO**:
```typescript
// app/api/auth/session.ts
export const sessionOptions = {
  cookieName: "session_id",
  cookieOptions: {
    secure: false,     // ¡Permite el envío sobre conexiones HTTP no cifradas!
    httpOnly: false,   // ¡Accesible mediante scripts JS (vulnerable a XSS)!
    sameSite: "none",  // ¡Vulnerable a ataques CSRF!
  }
}
```

**EJEMPLO CORRECTO**:
```typescript
// app/api/auth/session.ts
export const sessionOptions = {
  cookieName: "__Host-session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production", // true en prod
    httpOnly: true,                                // Inaccesible para JS del cliente
    sameSite: "lax" as const,                      // Mitigación de CSRF
    maxAge: 60 * 60 * 24 * 7,                      // Expiración dinámica (7 días)
  }
}
```

---

# Regla 06 - Arquitectura Limpia (Clean Architecture)
---

**MOTIVO**:
Evitar el código desorganizado, redundante y la mezcla de responsabilidades (por ejemplo, lógica compleja de juego o cálculos pedagógicos directamente en los routers de la API).

**GATILHO**:
Se activa al crear nuevos archivos de routers, servicios, o al agregar lógica de negocio en cualquier capa del backend.

**DIRECTRICES TÉCNICAS**:
- **Services (Lógica de Negocio)**: Toda lógica compleja, reglas de juego, cálculos de maestría pedagógica, comunicación con APIs de IA, o lógica de base de datos avanzada debe residir estrictamente en la capa de servicios (`/backend/app/services/`).
- **Routers (Interface de API)**: Los controladores y routers de API deben encargarse únicamente de recibir la solicitud, validar los inputs (usando esquemas Pydantic), delegar la operación al servicio correspondiente y retornar la respuesta estructurada.
- **Principio DRY (Don't Repeat Yourself)**: Si una lógica de cálculo de puntuación, progreso o auditoría se necesita en más de un lugar, debe estar centralizada en un servicio común o utilidad.

**EJEMPLO ERRÓNEO**:
```python
# backend/app/routers/fase.py
# ¡ERROR: Lógica compleja de negocio y consultas directas pesadas metidas en el router!
@router.post("/completar-fase")
async def completar_fase(alumno_id: int, fase_id: int, aciertos: int, db: AsyncSession = Depends(get_db)):
    if aciertos >= 10:
        # Lógica de cálculo de maestría aquí mismo...
        porcentaje = (aciertos / 12) * 100
        # ... 40 líneas de cálculos y updates de BD ...
        return {"status": "aprobado"}
```

**EJEMPLO CORRECTO**:
```python
# backend/app/services/progreso_service.py
class ProgresoService:
    @staticmethod
    async def procesar_completitud_fase(db: AsyncSession, alumno_id: int, fase_id: int, aciertos: int):
        # Lógica de negocio encapsulada y testeable
        porcentaje = (aciertos / 12) * 100
        # ... procesamiento y base de datos ...
        return {"status": "aprobado", "porcentaje": porcentaje}

# backend/app/routers/fase.py
@router.post("/completar-fase")
async def completar_fase(
    request: CompletarFaseRequest,
    db: AsyncSession = Depends(get_db)
):
    # El router solo delega la lógica al servicio
    resultado = await ProgresoService.procesar_completitud_fase(
        db, request.alumno_id, request.fase_id, request.aciertos
    )
    return resultado
```

---

# Regla 07 - Higiene de Credenciales
---

**MOTIVO**:
Impedir el uso de contraseñas débiles o algoritmos de hashing obsoletos (como MD5 o SHA-1) para proteger las cuentas de los usuarios.

**GATILHO**:
Se activa al implementar registro de usuarios, cambios de contraseña, restablecimiento de accesos o cualquier función que manipule contraseñas o tokens.

**DIRECTRICES TÉCNICAS**:
- **Hashing Seguro**: Toda contraseña debe hashearse estrictamente utilizando `bcrypt` (en Python, preferiblemente con la librería `passlib` o `bcrypt` nativa con factor de costo 12).
- **Validación de Complejidad**: Se debe validar la complejidad de la contraseña en el registro (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número).
- **Generación de Tokens Criptográficamente Seguros**: Para generar tokens de restablecimiento de contraseña o invitaciones, usa `secrets.token_urlsafe(32)` de Python, nunca la librería `random`.

**EJEMPLO ERRÓNEO**:
```python
import hashlib
import random

def registrar_usuario(password: str):
    # ¡ERROR CRÍTICO: SHA-256 es muy rápido y vulnerable a ataques de fuerza bruta/tablas rainbow!
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    return password_hash

def generar_token_reset():
    # ¡ERROR: random.randint es predecible!
    return str(random.randint(100000, 999999))
```

**EJEMPLO CORRECTO**:
```python
from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def registrar_usuario(password: str):
    # CUMPLIMIENTO: Hashing seguro con bcrypt
    return pwd_context.hash(password)

def generar_token_reset():
    # CUMPLIMIENTO: Generación criptográficamente segura
    return secrets.token_urlsafe(32)
```

---

# Regla 08 - Tratamiento de Errores con Contexto
---

**MOTIVO**:
Evitar depuraciones a ciegas debido a la falta de logs descriptivos, trazas de error silenciadas o mensajes de error genéricos que no aportan información técnica.

**GATILHO**:
Se activa al escribir bloques try/except, try/catch, controladores globales de excepciones o middlewares de error.

**DIRECTRICES TÉCNICAS**:
- **Prohibición de Excepciones Silenciadas**: Nunca captures una excepción para simplemente ignorarla (`except: pass` o `catch(e) {}` vacíos). Siempre loguea la excepción con su traza completa (`exc_info=True` en Python o `console.error` en JS).
- **Identificador de Petición (Request ID)**: Propaga un identificador único de petición (`X-Request-ID` o similar) en los middlewares para correlacionar logs del backend en caso de errores en cascada.
- **Separación de Audiencia**: Los mensajes retornados al cliente o frontend deben ser amigables y no exponer información interna de la infraestructura (ej. consultas SQL o trazas del sistema). Los logs del backend, por el contrario, deben ser lo más detallados posible (stack traces, variables de contexto).

**EJEMPLO ERRÓNEO**:
```python
# ¡ERROR: Silenciar el error por completo!
try:
    await db.commit()
except Exception:
    pass

# ¡ERROR: Devolver un error técnico expuesto al cliente!
try:
    data = await db.execute(select(User))
except Exception as e:
    return {"error": f"Database failed: {str(e)}"} # Expone detalles internos del motor de BD
```

**EJEMPLO CORRECTO**:
```python
import logging
logger = logging.getLogger(__name__)

# CUMPLIMIENTO: Capturar, loguear con contexto y lanzar una excepción controlada
try:
    await db.commit()
except Exception as e:
    logger.error("Error al confirmar transacción en base de datos", exc_info=True)
    raise HTTPException(
        status_code=500,
        detail="Ha ocurrido un error interno al procesar su solicitud. Por favor, intente de nuevo."
    )
```

---

# Regla 09 - Higiene de Dependencias
---

**MOTIVO**:
Prevenir ataques de cadena de suministro (supply chain) e impedir la acumulación de dependencias obsoletas, no mantenidas o inseguras.

**GATILHO**:
Se activa al sugerir la instalación de paquetes de terceros (`npm install`, `pip install`, etc.) o añadir dependencias a `package.json` o `requirements.txt`.

**DIRECTRICES TÉCNICAS**:
- **Mantenimiento y Popularidad**: Solo sugerir librerías consolidadas que tengan actualizaciones recientes (últimos 12 meses) y una comunidad activa (descargas/estrellas significativas).
- **Análisis de Vulnerabilidad**: Antes de sugerir cualquier paquete, verifica que no tenga reportes de vulnerabilidades conocidos (CVEs críticos o altos).
- **Minimizar Dependencias**: Evita sugerir la instalación de librerías de terceros para resolver tareas triviales que se pueden resolver de forma nativa en JavaScript o Python.

**EJEMPLO ERRÓNEO**:
```python
# ¡ERROR: Añadir una dependencia externa completa de terceros solo para formatear texto simple!
import string_formatter_ext  # No es necesario agregar paquetes extra
```

**EJEMPLO CORRECTO**:
```python
# CUMPLIMIENTO: Implementar lógica estándar utilizando las capacidades nativas del lenguaje
def formatear_nombre(nombre: str) -> str:
    return nombre.strip().title()
```

---

# Regla 10 - Pruebas Primero (Test-First)
---

**MOTIVO**:
Garantizar la estabilidad a largo plazo del código y asegurar que los cambios no rompan la funcionalidad actual del juego ni de la lógica pedagógica.

**GATILHO**:
Se activa al desarrollar nuevas funcionalidades, endpoints, servicios o algoritmos complejos de puntuación y progreso de fases.

**DIRECTRICES TÉCNICAS**:
- **TDD / Enfoque Test-First**: Al diseñar una nueva funcionalidad lógica, define y escribe primero los casos de prueba unitarios correspondientes (usando `pytest` en backend o `playwright`/`vitest` en frontend) antes de implementar el código de producción.
- **Cobertura de Casos Límite**: Asegura incluir pruebas para valores nulos/vacíos (`None`, `""`), valores fuera de rango (ej. puntuaciones negativas) y escenarios de excepción.
- **Automatización**: Asegurar que las pruebas pasen localmente (`docker compose exec backend pytest`) antes de dar por completado un cambio.

**EJEMPLO DE FLUJO CORRECTO**:
1. Crear el archivo de pruebas (ej. `test_progreso.py`) definiendo las expectativas para un método que aún no está desarrollado.
2. Comprobar que las pruebas fallan inicialmente (estado RED).
3. Implementar el código mínimo en el servicio (ej. `progreso_service.py`) para hacer que las pruebas pasen (estado GREEN).
4. Refactorizar el código para mejorar su diseño y legibilidad sin alterar el comportamiento verificado (estado REFACTOR).

---

# Regla 11 - Consistencia de API REST
---

**MOTIVO**:
Las APIs predecibles reducen los errores de integración y facilitan el desarrollo tanto en el frontend como en el backend.

**GATILHO**:
Se activa al crear o modificar routers, controladores o endpoints de API en el backend.

**CONVENCIONES DE RUTAS**:
| Acción     | Método | Ruta             | Respuesta       |
|------------|--------|------------------|-----------------|
| Listar     | GET    | /recursos        | 200 + array     |
| Detalle    | GET    | /recursos/:id    | 200 + objeto    |
| Crear      | POST   | /recursos        | 201 + objeto    |
| Actualizar  | PATCH  | /recursos/:id    | 200 + objeto    |
| Reemplazar | PUT    | /recursos/:id    | 200 + objeto    |
| Eliminar   | DELETE | /recursos/:id    | 204 (no content)|

**ESTRUCTURA DE RESPUESTA DE ERRORES**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "field": "email",
    "request_id": "req_abc123"
  }
}
```

**EJEMPLO ERRÓNEO**:
```python
@app.get("/getUsers")           # ¡ERROR: Verbo en la ruta!
@app.post("/user/create")       # ¡ERROR: Singular y verbo!
@app.post("/delete-user/{id}")  # ¡ERROR: POST para eliminar!
```

**EJEMPLO CORRECTO**:
```python
@router.get("")                              # GET /users
async def list_users(): ...

@router.get("/{user_id}")                    # GET /users/:id
async def get_user(user_id: str): ...

@router.post("", status_code=201)            # POST /users
async def create_user(payload: UserCreate): ...

@router.patch("/{user_id}")                  # PATCH /users/:id
async def update_user(user_id: str, payload: UserUpdate): ...

@router.delete("/{user_id}", status_code=204) # DELETE /users/:id
async def delete_user(user_id: str): ...
```

---

# Regla 12 - Disciplina de Commits (Conventional Commits)
---

**MOTIVO**:
Mantener un historial legible que facilite la depuración, revisiones de código y la generación de registros de cambios (changelogs) automáticos.

**GATILHO**:
Se activa al redactar mensajes de commit o preparar publicaciones (releases) del software.

**FORMATO OBLIGATORIO (Conventional Commits)**:
```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[pie de página opcional]
```

**TIPOS PERMITIDOS**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de un error (bug)
- `docs`: Cambios únicamente en la documentación
- `style`: Cambios de formato (espacios, punto y coma) que no afectan la lógica del código
- `refactor`: Refactorización de código que no añade características ni corrige bugs
- `test`: Añadir o corregir pruebas (tests)
- `chore`: Tareas de mantenimiento, configuraciones del proyecto o actualización de dependencias

**REGLAS ADICIONALES**:
- La descripción de la primera línea debe comenzar en minúscula y no terminar con punto.
- Máximo 72 caracteres de longitud en la primera línea.
- El cuerpo del commit debe explicar "el qué" y "el porqué", no "el cómo".

**EJEMPLOS ERRÓNEOS**:
```bash
git commit -m "fix"
git commit -m "wip"
git commit -m "cambios agregados"
```

**EJEMPLOS CORRECTOS**:
```bash
git commit -m "feat(auth): add google oauth2 login flow"
git commit -m "fix(pedagogia): correct score calculation for phase 3 multiplication"
git commit -m "docs(api): document websocket events for synchronization"
git commit -m "chore(deps): upgrade fastapi dependency to v0.109.0"
```

---

# Regla 13 - Aislamiento de Ambientes
---

**MOTIVO**:
Prevenir la fuga de datos de producción a entornos de desarrollo y evitar la ejecución accidental de comandos destructivos en bases de datos o entornos reales.

**GATILHO**:
Se activa al configurar variables de entorno, cadenas de conexión a bases de datos (connection strings) o configuraciones de despliegue (Docker, docker-compose).

**DIRECTRICES TÉCNICAS**:
- **Bases de Datos Segregadas**: Cada entorno (Desarrollo, Producción y Local) DEBE tener su propia base de datos totalmente independiente. Está estrictamente prohibido compartir bases de datos entre entornos.
- **Prefijos de Variables de Entorno**: Usar prefijos claros en los archivos de configuración para diferenciar variables si es necesario, o mantener archivos `.env` separados y bien identificados (ej. `.env.local` en pruebas locales, `.env` en Datos_Desarrollo y `.env` en Datos_Producion).
- **Bloqueo de Datos de Producción Localmente**: Queda prohibido conectar la base de datos de producción a la ejecución local del agente o del entorno de desarrollo.
- **Prohibición de Datos Reales en Desarrollo**: Nunca uses datos reales de los alumnos en el entorno local o de desarrollo. Usa datos ficticios/semillas (seeders).

**PROTECCIÓN EN SCRIPTS DE BASE DE DATOS**:
```python
# Ejemplo de validación para evitar destrucción accidental
async def seed_test_data(db_url: str):
    # Validar que no estemos apuntando a producción
    if "logicakids-prod" in db_url or "34.9.51.225" in db_url:
        raise RuntimeError("¡EJECUCIÓN DE SEED BLOQUEADA EN EL ENTORNO DE PRODUCCIÓN!")
    
    # Proceder a poblar datos de prueba
    ...
```

---

# Regla 14 - Documentación como Código
---

**MOTIVO**:
El código autodocumentado reduce drásticamente el esfuerzo de mantenimiento del software y evita que la documentación quede obsoleta.

**GATILHO**:
Se activa al escribir nuevas funciones, clases, módulos o archivos de documentación (README, guías).

**DIRECTRICES TÉCNICAS**:
- **Nombres Descriptivos y Claros**: Prefiere siempre nombres explícitos y legibles sobre abreviaturas confusas (por ejemplo, usar `correo_usuario` en lugar de `cu`, y `calcular_promedio_intentos` en lugar de `calc_prom`).
- **Funciones de Propósito Único**: Cada función debe hacer una sola cosa bien. Si necesitas usar la conjunción "y" para describir lo que hace una función, divídela en dos o más funciones más pequeñas.
- **Docstrings Obligatorios**: Toda función o clase pública en el backend debe tener docstrings descriptivos detallando: propósito, argumentos (parámetros), tipo de retorno y excepciones lanzadas.
- **Prohibición de Código Muerto Comentado**: No mantengas bloques grandes de código comentado en producción. Para mantener el histórico de cambios, confía únicamente en Git.

**EJEMPLO ERRÓNEO**:
```python
def calc(a, b, c, t):
    # calcula el valor
    x = a * b  # multiplica a por b
    if t:
        x = x - c  # subtrai c se t
    return x

# TODO: arreglar esto luego
# def old_calc():
#     ... 50 líneas comentadas de código antiguo ...
```

**EJEMPLO CORRECTO**:
```python
def calcular_total_pedido(
    precio_unitario: float,
    cantidad: int,
    descuento: float = 0.0,
    aplicar_descuento: bool = True
) -> float:
    """
    Calcula el costo total de un pedido de items de la tienda pedagógica.
    
    Args:
        precio_unitario: El costo individual de cada item (debe ser >= 0).
        cantidad: El número total de unidades compradas (debe ser >= 1).
        descuento: La cantidad absoluta a deducir del precio.
        aplicar_descuento: Si es True, resta el valor del descuento al subtotal.
        
    Returns:
        El costo final calculado.
        
    Raises:
        ValueError: Si el precio unitario es menor a 0 o la cantidad menor a 1.
    """
    if precio_unitario < 0:
        raise ValueError("El precio unitario no puede ser negativo")
    if cantidad < 1:
        raise ValueError("La cantidad debe ser mayor o igual a 1")
        
    subtotal = precio_unitario * cantidad
    
    if aplicar_descuento:
        return max(subtotal - descuento, 0.0)
        
    return subtotal
```