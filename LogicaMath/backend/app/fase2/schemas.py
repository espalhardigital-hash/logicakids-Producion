"""
Schemas Pydantic — Fase 2: Desarrollo Numérico y Razonamiento
=============================================================
Schemas exclusivos de los 5 módulos de Fase 2. No modifica ni reemplaza
los schemas globales de app.schemas; conviven sin conflicto.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ============================================================
# TOKENS (Módulo 4 — Detective de Historias)
# ============================================================

class Fase2Token(BaseModel):
    """Un segmento tokenizado del enunciado de un problema de texto."""
    id: int
    texto: str
    es_dato_relevante: bool  # True = dato numérico o clave que hay que subrayar
    categoria: Optional[str] = None  # 'cantidad', 'unidad', 'operacion', 'irrelevante'


# ============================================================
# PREGUNTA PARA EL ALUMNO (Fase 2)
# ============================================================

class Fase2PreguntaParaAlumno(BaseModel):
    """Lo que recibe el frontend para mostrar una pregunta de Fase 2."""
    id: Optional[int] = None           # None para preguntas generadas dinámicamente
    modulo_id: int
    nivel_id: int
    enunciado: str
    enunciado_seed: Optional[str] = None
    tipo_pregunta: str                  # respuesta_numerica | subrayado_tokens | constructor_soluciones_chained
    respuesta_correcta: Optional[str] = None   # None para tokens (no se revela al frontend)
    tiene_cronometro: bool = False
    tiempo_limite_segundos: Optional[int] = None
    # Módulo 4
    payload_tokenizado: Optional[List[Fase2Token]] = None
    # Módulo 5
    pasos_encadenados: Optional[List[Dict[str, Any]]] = None  # [{titulo, descripcion, respuesta_correcta}]
    # Generadas dinámicamente (mód 1-3)
    datos_numericos: Optional[Dict[str, Any]] = None
    explicacion_referencia: Optional[Dict[str, Any]] = None


# ============================================================
# RESPUESTA DEL ALUMNO (Fase 2)
# ============================================================

class Fase2ResponderPregunta(BaseModel):
    """Payload que envía el alumno al responder en Fase 2."""
    modulo_id: int
    nivel_id: int
    pregunta_id: Optional[int] = None           # Para preguntas de BD (mód 4 y 5)
    enunciado_seed: Optional[str] = None        # Seed reproducible para mód 1-3

    # Modos de respuesta (mutuamente excluyentes)
    respuesta_dada: Optional[str] = None                  # Mód 1, 2, 3
    tokens_seleccionados: Optional[List[int]] = None      # Mód 4 (IDs de tokens)
    paso_numero: Optional[int] = None                     # Mód 5 (1 o 2)

    tiempo_respuesta_segundos: Optional[float] = None


# ============================================================
# RESULTADO DE RESPUESTA (Fase 2)
# ============================================================

class Fase2ResultadoRespuesta(BaseModel):
    """Lo que recibe el frontend después de validar la respuesta en Fase 2."""
    es_correcta: bool
    respuesta_correcta: Optional[str] = None
    explicacion: Optional[Dict[str, Any]] = None

    # Estado de progreso
    aciertos_acumulados: int
    intentos_totales: int
    porcentaje_actual: int
    bloque_completado: bool = False
    fase_completada: bool = False

    # Bucle Espejo (Mirror Loop)
    es_espejo: bool = False                      # True si el sistema generó una variante espejo
    intentos_espejo_actuales: int = 0            # Cuántos intentos espejo han ocurrido
    intentos_espejo_max: int = 3                 # Máximo de intentos espejo
    soporte_avanzado: bool = False               # True cuando se agotaron los espejos → mostrar explicación completa

    # Para Módulo 4
    tokens_correctos: Optional[List[int]] = None   # IDs de tokens que SÍ debían marcarse

    # Para Módulo 5
    paso_aprobado: Optional[int] = None             # Qué paso fue aprobado
    valor_paso1_congelado: Optional[str] = None     # Valor de paso 1 para inyectar en paso 2


# ============================================================
# NIVEL (dentro de un módulo)
# ============================================================

class Fase2NivelInfo(BaseModel):
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
# MÓDULO (dashboard de Fase 2)
# ============================================================

class Fase2ModuloInfo(BaseModel):
    """Estado de un módulo completo de Fase 2 para el dashboard."""
    modulo_id: int
    nombre: str
    descripcion: str
    icono: str                # emoji o código de ícono
    color: str                # color hex para el ícono/acento
    estado: str              # bloqueado | en_progreso | dominado
    porcentaje_global: int = 0
    niveles: List[Fase2NivelInfo] = []


# ============================================================
# DASHBOARD FASE 2
# ============================================================

class Fase2Dashboard(BaseModel):
    """Todo lo necesario para renderizar la pantalla principal de Fase 2."""
    alumno_nombre: str
    puntos_totales: int = 0
    modulos: List[Fase2ModuloInfo]
    desafio_mixto_disponible: bool = False
    desafio_mixto_estado: str = "bloqueado"   # bloqueado | disponible | completado


# ============================================================
# LECTURA / TEORIA
# ============================================================

class Fase2ContenidoLectura(BaseModel):
    """Contenido teórico/tutorial de un nivel."""
    modulo_id: int
    nivel_id: int
    titulo: str
    parrafos: List[str]
    ejemplos: Optional[List[Dict[str, Any]]] = None
    tip_pedagogico: Optional[str] = None
