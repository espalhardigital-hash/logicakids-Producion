"""
Schemas Pydantic — Fase 9: Simulados Colegio Pedro II
=============================================================
Schemas exclusivos de los 3 módulos de Fase 9. No modifica ni reemplaza
los schemas globales de app.schemas; conviven sin conflicto.

Módulos:
  1. Simulados Cortos (3 niveles + 3 desafíos)
  2. Simulados Completos (3 niveles + 3 desafíos)
  3. Revisión Dirigida y Tutoría IA (3 niveles + 3 desafíos)

Cada módulo posee 3 desafíos virtuales (nivel_id 11, 12, 13).
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ============================================================
# ALTERNATIVA (Opción Múltiple — Desafíos 1 y 2)
# ============================================================

class fase9AlternativaOut(BaseModel):
    """Una opción de respuesta para preguntas de opción múltiple."""
    id: int
    texto: str
    orden: Optional[int] = None
    # No se envía es_correcta al frontend antes de responder


# ============================================================
# TOKENS (Legado Módulo Detective — no se usa en Fase 2 refactorizada)
# ============================================================

class fase9Token(BaseModel):
    """Un segmento tokenizado del enunciado de un problema de texto."""
    id: int
    texto: str
    es_dato_relevante: bool
    categoria: Optional[str] = None


# ============================================================
# PREGUNTA PARA EL ALUMNO (Fase 2)
# ============================================================

class fase9PreguntaParaAlumno(BaseModel):
    """Lo que recibe el frontend para mostrar una pregunta de Fase 2."""
    id: Optional[int] = None           # None para preguntas generadas dinámicamente
    modulo_id: int
    nivel_id: int
    enunciado: str
    enunciado_seed: Optional[str] = None
    tipo_pregunta: str                  # respuesta_numerica | multiple_opcion | constructor_soluciones_chained
    respuesta_correcta: Optional[str] = None   # None para opción múltiple (no se revela)
    tiene_cronometro: bool = False
    tiempo_limite_segundos: Optional[int] = None

    # Opciones múltiples (Desafíos 1 y 2)
    alternativas: Optional[List[fase9AlternativaOut]] = None

    # Constructor de Soluciones (Módulo 4)
    pasos_encadenados: Optional[List[Dict[str, Any]]] = None

    # Datos estructurados (generadas dinámicamente o desde BD)
    datos_numericos: Optional[Dict[str, Any]] = None
    explicacion_referencia: Optional[Dict[str, Any]] = None

    # Legado: tokens (no se usa en la Fase 2 refactorizada)
    payload_tokenizado: Optional[List[fase9Token]] = None

    # Estado de progreso actual (para sincronización instantánea)
    aciertos_acumulados: int = 0
    intentos_totales: int = 0
    porcentaje_actual: int = 0
    cantidad_requerida: Optional[int] = None



# ============================================================
# RESPUESTA DEL ALUMNO (Fase 2)
# ============================================================

class fase9ResponderPregunta(BaseModel):
    """Payload que envía el alumno al responder en Fase 2."""
    modulo_id: int
    nivel_id: int
    pregunta_id: Optional[int] = None           # Para preguntas de BD
    enunciado_seed: Optional[str] = None        # Seed reproducible para mód 1-3

    # Modos de respuesta (mutuamente excluyentes)
    respuesta_dada: Optional[str] = None                  # Entrada numérica o texto
    alternativa_id: Optional[int] = None                  # ID de la alternativa elegida (opción múltiple)
    tokens_seleccionados: Optional[List[int]] = None      # Legado
    paso_numero: Optional[int] = None                     # Módulo 4 Constructor (1 o 2)

    tiempo_respuesta_segundos: Optional[float] = None


# ============================================================
# CIERRE DE RESCATE (Fase 2)
# ============================================================

class fase9CerrarRescate(BaseModel):
    """Payload que envía el alumno para omitir la explicación de rescate."""
    modulo_id: int
    nivel_id: int
    pregunta_id: int



# ============================================================
# RESULTADO DE RESPUESTA (Fase 2)
# ============================================================

class fase9ResultadoRespuesta(BaseModel):
    """Lo que recibe el frontend después de validar la respuesta en Fase 2."""
    es_correcta: bool
    respuesta_correcta: Optional[str] = None
    explicacion: Optional[Dict[str, Any]] = None

    # Feedback de error pedagógico (Tutor Invisible)
    feedback_error: Optional[str] = None

    # Estado de progreso
    aciertos_acumulados: int
    intentos_totales: int
    porcentaje_actual: int
    bloque_completado: bool = False
    fase_completada: bool = False

    # Bucle Espejo (Mirror Loop) — solo para práctica libre
    es_espejo: bool = False
    intentos_espejo_actuales: int = 0
    intentos_espejo_max: int = 3
    soporte_avanzado: bool = False

    # Early Exit — solo para desafíos
    early_exit: bool = False
    errores_sesion: int = 0
    max_errores_tolerados: int = 0

    # Para Módulo 4 Constructor
    paso_aprobado: Optional[int] = None
    valor_paso1_congelado: Optional[str] = None

    # Legado: tokens correctos
    tokens_correctos: Optional[List[int]] = None


# ============================================================
# NIVEL (dentro de un módulo)
# ============================================================

class fase9NivelInfo(BaseModel):
    """Estado de un nivel específico dentro de un módulo."""
    nivel_id: int
    nombre: str
    descripcion: str
    estado: str          # bloqueado | en_progreso | dominado
    porcentaje: int = 0
    aciertos: int = 0
    requeridos: int = 0
    usa_cronometro: bool = False


# ============================================================
# DESAFÍO (dentro de un módulo)
# ============================================================

class fase9DesafioInfo(BaseModel):
    """Estado de un desafío específico dentro de un módulo."""
    desafio_id: int       # 11, 12, o 13
    nombre: str
    dificultad: str       # estandar | avanzada | maestria
    estado: str           # bloqueado | en_progreso | dominado
    porcentaje: int = 0
    aciertos: int = 0
    requeridos: int = 0
    tiempo_limite: int = 0
    max_errores: int = 0


# ============================================================
# MÓDULO (dashboard de Fase 2)
# ============================================================

class fase9ModuloInfo(BaseModel):
    """Estado de un módulo completo de Fase 2 para el dashboard."""
    modulo_id: int
    nombre: str
    descripcion: str
    icono: str
    color: str
    estado: str              # bloqueado | en_progreso | dominado
    porcentaje_global: int = 0
    niveles: List[fase9NivelInfo] = []
    desafios: List[fase9DesafioInfo] = []


# ============================================================
# DASHBOARD FASE 2
# ============================================================

class fase9Dashboard(BaseModel):
    """Todo lo necesario para renderizar la pantalla principal de Fase 2."""
    alumno_nombre: str
    puntos_totales: int = 0
    modulos: List[fase9ModuloInfo]
    desafio_mixto_disponible: bool = False
    desafio_mixto_estado: str = "bloqueado"   # bloqueado | disponible | completado


# ============================================================
# LECTURA / TEORIA (ahora desde BD)
# ============================================================

class fase9InteractivoOut(BaseModel):
    """Un ejercicio interactivo dentro del contenido de teoría."""
    pregunta: str
    respuesta: str
    feedback_acierto: str
    feedback_error: str


class fase9EjemploOut(BaseModel):
    """Un ejemplo guiado dentro del contenido de teoría."""
    enunciado: str
    respuesta: str


class fase9ContenidoLectura(BaseModel):
    """Contenido teórico/tutorial de un nivel, cargado desde BD."""
    modulo_id: int
    nivel_id: int
    titulo: str
    parrafos: List[str]
    ejemplos: Optional[List[Dict[str, Any]]] = None
    tip_pedagogico: Optional[str] = None
    diccionario: Optional[Dict[str, str]] = None
    interactivos: Optional[List[Dict[str, Any]]] = None

