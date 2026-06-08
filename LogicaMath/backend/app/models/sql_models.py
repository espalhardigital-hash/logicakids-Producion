"""
Modelos SQLAlchemy - LogicaKids Pro (Fachada Unificada de Compatibilidad)
========================================================================
Este archivo actúa como una interfaz unificada (Facade Pattern) para el paquete 
modular de modelos. Re-exporta todos los enums y modelos ORM desde sus respectivos 
archivos específicos por dominio, asegurando una compatibilidad del 100% con 
los routers, seeders, setups y validadores existentes de FastAPI sin romper 
ningún endpoint.
"""

from .enums import StatusEnum, OperacionEnum, TipoPreguntaEnum, EstadoProgresoEnum, TipoErrorEnum
from .user import User
from .fase import Fase
from .alumno import Alumno
from .pregunta import Pregunta, Alternativa
from .progreso import ConfiguracionProgreso, PoolAsignadoAlumno, ProgresoMaestria, Intento
from .settings import PlatformSettings
from app.fase2.models import IntentoPregunta, IntentoPaso, NivelTeoria
