"""
Schemas Pydantic - LogicaKids Pro
=================================
Schemas de validacion y serializacion para todos los endpoints.

Organizados por dominio:
  - Auth (User, Token, Register, Login)
  - Fase
  - Alumno
  - Pregunta + Alternativa
  - ConfiguracionProgreso
  - PoolAsignadoAlumno
  - ProgresoMaestria
  - Intento
  - Admin (respuestas agregadas para analitica)
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================
# AUTH — Se mantienen para compatibilidad con auth.py
# ============================================================

class UserSettings(BaseModel):
    customTimers: Optional[Dict[str, int]] = None
    unlockedLevels: Optional[Dict[str, int]] = {}


class UserBase(BaseModel):
    username: str
    email: str
    role: str = "USER"
    status: str = "ACTIVE"
    avatar: Optional[str] = None
    settings: Optional[UserSettings] = None
    unlockedLevel: int = 0


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "USER"
    status: str = "ACTIVE"
    avatar: Optional[str] = None
    settings: Optional[Dict[str, Any]] = {}
    unlockedLevel: int = 0


class UserLogin(BaseModel):
    email: str
    password: str


class User(UserBase):
    id: str
    createdAt: str
    lastLogin: Optional[str] = None


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CategoryLevelUpdate(BaseModel):
    category: str
    new_level: int


# ============================================================
# FASE
# ============================================================

class FaseBase(BaseModel):
    nombre: str = Field(..., max_length=120)
    descripcion: Optional[str] = None
    orden: int


class FaseCreate(FaseBase):
    """Para crear una nueva fase (POST admin)."""
    pass


class FaseUpdate(BaseModel):
    """Para actualizar una fase (PATCH admin). Todos opcionales."""
    nombre: Optional[str] = Field(None, max_length=120)
    descripcion: Optional[str] = None
    orden: Optional[int] = None
    estado: Optional[str] = None  # activo / inactivo / eliminado


class FaseResponse(FaseBase):
    """Respuesta al frontend."""
    id: int
    estado: str
    fecha_creacion: datetime
    ultima_modificacion: datetime

    class Config:
        from_attributes = True


# ============================================================
# ALUMNO
# ============================================================

class AlumnoBase(BaseModel):
    nombre: str = Field(..., max_length=120)
    edad: Optional[int] = None


class AlumnoCreate(AlumnoBase):
    """Se crea automaticamente al registrar un usuario."""
    pass


class AlumnoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=120)
    edad: Optional[int] = None
    estado: Optional[str] = None
    fase_actual_id: Optional[int] = None


class AlumnoResponse(AlumnoBase):
    id: int
    user_id: str
    fase_actual_id: Optional[int] = None
    estado: str
    fecha_creacion: datetime
    ultima_modificacion: datetime

    class Config:
        from_attributes = True


class AlumnoConProgreso(AlumnoResponse):
    """Alumno con resumen de progreso para el admin."""
    fase_actual_nombre: Optional[str] = None
    bloques_aprobados: int = 0
    bloques_totales: int = 0
    porcentaje_global: int = 0


# ============================================================
# ALTERNATIVA
# ============================================================

class AlternativaBase(BaseModel):
    texto: str = Field(..., max_length=255)
    es_correcta: bool = False
    orden: Optional[int] = None
    tipo_error: Optional[str] = None
    feedback_error: Optional[str] = None


class AlternativaCreate(AlternativaBase):
    """Para crear alternativa junto con una pregunta."""
    pass


class AlternativaUpdate(BaseModel):
    texto: Optional[str] = Field(None, max_length=255)
    es_correcta: Optional[bool] = None
    orden: Optional[int] = None
    tipo_error: Optional[str] = None
    feedback_error: Optional[str] = None


class AlternativaResponse(AlternativaBase):
    id: int
    pregunta_id: int

    class Config:
        from_attributes = True


class AlternativaFeedback(BaseModel):
    """Lo que ve el alumno despues de responder (sin revelar las correctas)."""
    id: int
    texto: str
    es_correcta: bool
    tipo_error: Optional[str] = None
    feedback_error: Optional[str] = None


# ============================================================
# PREGUNTA
# ============================================================

class PreguntaBase(BaseModel):
    fase_id: int
    seccion: int
    sub_nivel: Optional[int] = None
    operacion: str  # OperacionEnum value
    tipo_pregunta: str  # TipoPreguntaEnum value
    enunciado: str
    respuesta_correcta: str = Field(..., max_length=255)
    datos_numericos: Optional[Dict[str, Any]] = None
    explicacion_paso_a_paso: Optional[Dict[str, Any]] = None
    requiere_subrayado: bool = False
    palabras_clave: Optional[Dict[str, Any]] = None
    errores_previstos: Optional[Dict[str, Any]] = None


class PreguntaCreate(PreguntaBase):
    """Para crear pregunta con alternativas (POST admin)."""
    alternativas: List[AlternativaCreate] = []


class PreguntaUpdate(BaseModel):
    """Para actualizar pregunta (PATCH admin). Todos opcionales."""
    seccion: Optional[int] = None
    sub_nivel: Optional[int] = None
    operacion: Optional[str] = None
    tipo_pregunta: Optional[str] = None
    enunciado: Optional[str] = None
    respuesta_correcta: Optional[str] = None
    datos_numericos: Optional[Dict[str, Any]] = None
    explicacion_paso_a_paso: Optional[Dict[str, Any]] = None
    requiere_subrayado: Optional[bool] = None
    palabras_clave: Optional[Dict[str, Any]] = None
    errores_previstos: Optional[Dict[str, Any]] = None
    estado: Optional[str] = None


class PreguntaResponse(PreguntaBase):
    """Respuesta completa (admin)."""
    id: int
    creado_por: Optional[str] = None
    modificado_por: Optional[str] = None
    estado: str
    fecha_creacion: datetime
    ultima_modificacion: datetime
    alternativas: List[AlternativaResponse] = []

    class Config:
        from_attributes = True


class AlternativaParaAlumno(BaseModel):
    """Alternativa sin revelar si es correcta ni el tipo de error."""
    id: int
    texto: str
    orden: Optional[int] = None


class PreguntaParaAlumno(BaseModel):
    """Lo que ve el alumno: pregunta + alternativas SIN revelar la correcta."""
    id: int
    enunciado: str
    tipo_pregunta: str
    operacion: str
    requiere_subrayado: bool = False
    tiene_cronometro: bool = False
    tiempo_limite_segundos: Optional[int] = None
    alternativas: List[AlternativaParaAlumno] = []

    class Config:
        from_attributes = True




# ============================================================
# CONFIGURACION PROGRESO
# ============================================================

class ConfiguracionProgresoBase(BaseModel):
    fase_id: int
    seccion: int
    operacion: str
    cantidad_requerida: int
    porcentaje_aprobacion: int
    orden_desbloqueo: int
    tipo_feedback: str = "simple"
    usa_cronometro: bool = False
    tiempo_default_segundos: Optional[int] = None


class ConfiguracionProgresoCreate(ConfiguracionProgresoBase):
    pass


class ConfiguracionProgresoUpdate(BaseModel):
    cantidad_requerida: Optional[int] = None
    porcentaje_aprobacion: Optional[int] = None
    orden_desbloqueo: Optional[int] = None
    tipo_feedback: Optional[str] = None
    usa_cronometro: Optional[bool] = None
    tiempo_default_segundos: Optional[int] = None
    activo: Optional[bool] = None


class ConfiguracionProgresoResponse(ConfiguracionProgresoBase):
    id: int
    activo: bool
    fecha_creacion: datetime
    ultima_modificacion: datetime

    class Config:
        from_attributes = True


# ============================================================
# POOL ASIGNADO ALUMNO
# ============================================================

class PoolItemResponse(BaseModel):
    """Item del pool de preguntas asignadas a un alumno."""
    id: int
    alumno_id: int
    pregunta_id: int
    fase_id: int
    seccion: int
    operacion: str
    respondida_correctamente: bool
    respondida_alguna_vez: bool
    numero_intentos: int
    fecha_asignacion: datetime

    class Config:
        from_attributes = True


class PoolResumen(BaseModel):
    """Resumen del pool de un alumno para un bloque."""
    total_asignadas: int
    total_respondidas: int
    total_correctas: int
    total_pendientes: int
    porcentaje_avance: int


# ============================================================
# PROGRESO MAESTRIA
# ============================================================

class ProgresoMaestriaResponse(BaseModel):
    """Progreso de un bloque especifico."""
    id: int
    alumno_id: int
    fase_id: int
    seccion: int
    operacion: str
    estado: str  # bloqueado / en_progreso / en_revision / aprobado
    aciertos_acumulados: int
    intentos_totales: int
    porcentaje_actual: int
    fecha_inicio: datetime
    fecha_aprobacion: Optional[datetime] = None
    ultima_actualizacion: datetime

    class Config:
        from_attributes = True


class ProgresoResumenFase(BaseModel):
    """Resumen de todos los bloques de una fase para un alumno."""
    fase_id: int
    fase_nombre: str
    bloques: List[ProgresoMaestriaResponse] = []
    bloques_aprobados: int = 0
    bloques_totales: int = 0
    fase_completada: bool = False


class ProgresoForzar(BaseModel):
    """Para que el admin fuerce un avance o retroceso."""
    estado: str  # bloqueado / en_progreso / aprobado


# ============================================================
# INTENTO (Respuesta del alumno)
# ============================================================

class ResponderPregunta(BaseModel):
    """El alumno envia su respuesta."""
    pregunta_id: int
    alternativa_id: Optional[int] = None  # Para multiple opcion
    respuesta_dada: Optional[str] = None  # Para respuesta numerica
    tiempo_respuesta_segundos: Optional[float] = None


class ResultadoRespuesta(BaseModel):
    """Lo que recibe el alumno despues de responder."""
    es_correcta: bool
    respuesta_correcta: str
    tipo_feedback: str  # "simple" o "detallado"

    # Solo si tipo_feedback == "detallado"
    tipo_error: Optional[str] = None
    feedback_error: Optional[str] = None
    explicacion_paso_a_paso: Optional[Dict[str, Any]] = None

    # Estado del progreso actualizado
    aciertos_acumulados: int
    intentos_totales: int
    porcentaje_actual: int

    # Para que el frontend sepa si el alumno avanzo
    bloque_completado: bool = False
    fase_completada: bool = False
    siguiente_operacion: Optional[str] = None


class IntentoResponse(BaseModel):
    """Intento individual (para historial admin)."""
    id: int
    alumno_id: int
    pregunta_id: int
    alternativa_id: Optional[int] = None
    respuesta_dada: Optional[str] = None
    es_correcta: bool
    fase_id: int
    seccion: int
    operacion: str
    tipo_error: Optional[str] = None
    feedback_mostrado: Optional[str] = None
    tiempo_respuesta_segundos: Optional[float] = None
    fecha: datetime

    class Config:
        from_attributes = True


# ============================================================
# ADMIN — ANALITICA
# ============================================================

class EstadisticaAlumno(BaseModel):
    """Resumen de un alumno para la vista admin."""
    alumno_id: int
    nombre: str
    fase_actual: Optional[str] = None
    bloques_aprobados: int = 0
    total_intentos: int = 0
    porcentaje_aciertos: float = 0.0
    errores_frecuentes: List[Dict[str, Any]] = []


class EstadisticaPregunta(BaseModel):
    """Analitica de una pregunta para la vista admin."""
    pregunta_id: int
    enunciado: str
    total_intentos: int = 0
    tasa_acierto: float = 0.0
    alternativa_mas_elegida_incorrecta: Optional[str] = None
    tipo_error_mas_comun: Optional[str] = None


class EstadisticaOperacion(BaseModel):
    """Analitica por operacion."""
    operacion: str
    total_intentos: int = 0
    tasa_acierto: float = 0.0
    tiempo_promedio: float = 0.0


class EstadisticaTipoError(BaseModel):
    """Ranking de tipos de error."""
    tipo_error: str
    cantidad: int = 0
    porcentaje: float = 0.0


# ============================================================
# DASHBOARD — Respuestas compuestas para el frontend
# ============================================================

class DashboardAlumno(BaseModel):
    """Todo lo que necesita el frontend para renderizar el dashboard."""
    alumno: AlumnoResponse
    fase_actual: Optional[FaseResponse] = None
    progreso_fase: Optional[ProgresoResumenFase] = None
    siguiente_pregunta: Optional[PreguntaParaAlumno] = None
    configuracion_bloque: Optional[ConfiguracionProgresoResponse] = None


class IniciarFaseResponse(BaseModel):
    """Respuesta al iniciar una fase o bloque."""
    fase: FaseResponse
    configuracion: ConfiguracionProgresoResponse
    progreso: ProgresoMaestriaResponse
    pool_resumen: PoolResumen
    primera_pregunta: Optional[PreguntaParaAlumno] = None
