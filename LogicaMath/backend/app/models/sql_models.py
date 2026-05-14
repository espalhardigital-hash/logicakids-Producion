"""
Modelos SQLAlchemy - Plataforma Educativa Pedro II
===================================================
Plan v4 - 8 tablas pedagogicas + users (autenticacion)

Tabla users:              Autenticacion JWT (copiada del proyecto actual)
Tabla fases:              Etapas del plan de estudio
Tabla alumnos:            Perfil pedagogico (vinculado a users)
Tabla preguntas:          Banco de ejercicios con explicaciones JSONB
Tabla alternativas:       Opciones de respuesta con diagnostico de errores
Tabla configuracion_progreso: Reglas de avance configurables por admin
Tabla pool_asignado_alumno:   Preguntas asignadas aleatoriamente a cada alumno
Tabla progreso_maestria:      Progreso POR BLOQUE (fase+seccion+operacion)
Tabla intentos:               Historial analitico de cada respuesta
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    JSON,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from ..db.base import Base


# ============================================================
# ENUMS
# ============================================================

class StatusEnum(str, enum.Enum):
    ACTIVO = "activo"
    INACTIVO = "inactivo"
    ELIMINADO = "eliminado"


class OperacionEnum(str, enum.Enum):
    SUMA = "suma"
    RESTA = "resta"
    MULTIPLICACION = "multiplicacion"
    DIVISION = "division"
    MIXTA = "mixta"


class TipoPreguntaEnum(str, enum.Enum):
    CALCULO_DIRECTO = "calculo_directo"
    PROBLEMA_CONTEXTO = "problema_contexto"
    PROBLEMA_MIXTO = "problema_mixto"
    IDENTIFICAR_OPERACION = "identificar_operacion"
    MULTIPLE_OPCION = "multiple_opcion"
    RESPUESTA_NUMERICA = "respuesta_numerica"


class EstadoProgresoEnum(str, enum.Enum):
    BLOQUEADO = "bloqueado"
    EN_PROGRESO = "en_progreso"
    EN_REVISION = "en_revision"
    APROBADO = "aprobado"


class TipoErrorEnum(str, enum.Enum):
    CALCULO = "calculo"
    LECTURA = "lectura"
    ATENCION = "atencion"
    OPERACION_INCORRECTA = "operacion_incorrecta"
    NO_IDENTIFICA_DATOS = "no_identifica_datos"
    PROBLEMA_INCOMPLETO = "problema_incompleto"
    TABUADA = "tabuada"
    DIVISION = "division"
    VALOR_POSICIONAL = "valor_posicional"
    TROCO = "troco"
    INFERENCIA = "inferencia"


# ============================================================
# TABLA 1: USERS — Autenticacion (copiada del proyecto actual)
# ============================================================

class User(Base):
    """
    Tabla de autenticacion. Se reutiliza auth.py completo:
    JWT, bcrypt, login, register, get_admin_user().
    El campo role='ADMIN' habilita el panel de administracion.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # UUID
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)  # For local auth
    role = Column(String, default="USER")  # USER / ADMIN
    status = Column(String, default="ACTIVE")  # ACTIVE / BANNED
    avatar = Column(String, nullable=True)
    settings = Column(JSON, default={})
    unlocked_level = Column(Integer, default=0)  # Compatibilidad con auth.py
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relacion con perfil pedagogico
    alumno = relationship("Alumno", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User id={self.id} username={self.username} role={self.role}>"


# ============================================================
# TABLA 2: FASES — Etapas del plan de estudio
# ============================================================

class Fase(Base):
    """
    Etapas generales del plan de estudio.
    Fase 0: Operaciones elementales (generacion dinamica, mathService.ts)
    Fase 1+: Operaciones basicas con preguntas en BD
    """
    __tablename__ = "fases"

    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(String(120), nullable=False)
    descripcion = Column(Text, nullable=True)
    orden = Column(Integer, nullable=False)

    estado = Column(
        Enum(StatusEnum, name="status_fases", native_enum=False),
        default=StatusEnum.ACTIVO,
        nullable=False,
    )

    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultima_modificacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    preguntas = relationship("Pregunta", back_populates="fase")
    configuraciones = relationship("ConfiguracionProgreso", back_populates="fase")
    progresos = relationship("ProgresoMaestria", back_populates="fase")

    def __repr__(self):
        return f"<Fase id={self.id} nombre={self.nombre} orden={self.orden}>"


# ============================================================
# TABLA 3: ALUMNOS — Perfil pedagogico
# ============================================================

class Alumno(Base):
    """
    Perfil pedagogico del alumno, vinculado a users por user_id.
    Separa autenticacion (users) de pedagogia (alumnos).
    fase_actual_id permite saber rapidamente en que fase esta.
    """
    __tablename__ = "alumnos"

    id = Column(Integer, primary_key=True, index=True)

    # Vinculo con autenticacion
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    nombre = Column(String(120), nullable=False)
    edad = Column(Integer, nullable=True)

    # Acceso rapido a la fase actual (Mejora #5)
    fase_actual_id = Column(Integer, ForeignKey("fases.id"), nullable=True)

    estado = Column(
        Enum(StatusEnum, name="status_alumnos", native_enum=False),
        default=StatusEnum.ACTIVO,
        nullable=False,
    )

    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultima_modificacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    user = relationship("User", back_populates="alumno")
    fase_actual = relationship("Fase")
    pools = relationship("PoolAsignadoAlumno", back_populates="alumno")
    progresos = relationship("ProgresoMaestria", back_populates="alumno")
    intentos = relationship("Intento", back_populates="alumno")

    def __repr__(self):
        return f"<Alumno id={self.id} nombre={self.nombre} fase={self.fase_actual_id}>"


# ============================================================
# TABLA 4: PREGUNTAS — Banco de ejercicios
# ============================================================

class Pregunta(Base):
    """
    Banco principal de ejercicios. Solo para Fases 1+.
    (Fase 0 usa generacion dinamica en mathService.ts)

    Soporta: calculo directo, problemas narrativos, problemas mixtos,
    multiple opcion y respuesta numerica.

    El cronometro NO se configura aqui (Mejora #1).
    Se configura a nivel de bloque en configuracion_progreso.
    """
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)

    # Jerarquia pedagogica
    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)
    seccion = Column(Integer, nullable=False)
    # 1 = Operaciones simples
    # 2 = Inferencia y contexto
    # 3 = Resistencia y combinacion

    sub_nivel = Column(Integer, nullable=True)  # Dificultad interna

    operacion = Column(Enum(OperacionEnum, name="operacion_preguntas", native_enum=False), nullable=False)
    tipo_pregunta = Column(Enum(TipoPreguntaEnum, name="tipo_pregunta_enum", native_enum=False), nullable=False)

    # Contenido principal
    enunciado = Column(Text, nullable=False)
    respuesta_correcta = Column(String(255), nullable=False)

    # Datos estructurados para analisis o generacion de variantes
    # Ejemplo: {"a": 35, "b": 128, "operacion_esperada": "suma"}
    datos_numericos = Column(JSONB, nullable=True)

    # Explicacion paso a paso para tutoria invisible
    # Ejemplo:
    # {
    #   "titulo": "Vamos resolver passo a passo",
    #   "pasos": [
    #       {"orden": 1, "texto": "Somamos as unidades", "calculo": "5 + 8 = 13"}
    #   ]
    # }
    explicacion_paso_a_paso = Column(JSONB, nullable=True)

    # Para ejercicios de inferencia
    requiere_subrayado = Column(Boolean, default=False, nullable=False)

    # Palabras clave y operacion sugerida
    # Ejemplo: {"palabras": ["ganhou", "ao todo"], "operacion_sugerida": "suma"}
    palabras_clave = Column(JSONB, nullable=True)

    # Para detectar errores sin IA en respuestas numericas
    # Ejemplo:
    # {
    #   "respuestas": [
    #       {"valor": "24", "tipo_error": "problema_incompleto", "feedback": "Voce esqueceu..."}
    #   ]
    # }
    errores_previstos = Column(JSONB, nullable=True)

    # Auditoria de administradores (Mejora #4)
    creado_por = Column(String, ForeignKey("users.id"), nullable=True)
    modificado_por = Column(String, ForeignKey("users.id"), nullable=True)

    # Administracion
    estado = Column(
        Enum(StatusEnum, name="status_preguntas", native_enum=False),
        default=StatusEnum.ACTIVO,
        nullable=False,
    )

    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultima_modificacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    fase = relationship("Fase", back_populates="preguntas")
    alternativas = relationship(
        "Alternativa",
        back_populates="pregunta",
        cascade="all, delete-orphan",
    )
    intentos = relationship("Intento", back_populates="pregunta")
    pools = relationship("PoolAsignadoAlumno", back_populates="pregunta")
    admin_creador = relationship("User", foreign_keys=[creado_por])
    admin_modificador = relationship("User", foreign_keys=[modificado_por])

    __table_args__ = (
        Index(
            "idx_preguntas_fase_seccion_operacion_estado",
            "fase_id",
            "seccion",
            "operacion",
            "estado",
        ),
    )

    def __repr__(self):
        return (
            f"<Pregunta id={self.id} "
            f"fase={self.fase_id} "
            f"seccion={self.seccion} "
            f"operacion={self.operacion}>"
        )


# ============================================================
# TABLA 5: ALTERNATIVAS — Opciones con diagnostico
# ============================================================

class Alternativa(Base):
    """
    Alternativas para preguntas de multiple opcion.
    Cada alternativa incorrecta puede estar asociada a un tipo de error,
    permitiendo feedback inteligente sin IA.
    """
    __tablename__ = "alternativas"

    id = Column(Integer, primary_key=True, index=True)

    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)

    texto = Column(String(255), nullable=False)
    es_correcta = Column(Boolean, default=False, nullable=False)
    orden = Column(Integer, nullable=True)  # Orden visual

    # Diagnostico pedagogico
    tipo_error = Column(Enum(TipoErrorEnum, name="tipo_error_alternativas", native_enum=False), nullable=True)
    feedback_error = Column(Text, nullable=True)

    # Timestamps (Mejora #6)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultima_modificacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    pregunta = relationship("Pregunta", back_populates="alternativas")

    __table_args__ = (
        Index("idx_alternativas_pregunta", "pregunta_id"),
    )

    def __repr__(self):
        return (
            f"<Alternativa id={self.id} "
            f"pregunta_id={self.pregunta_id} "
            f"correcta={self.es_correcta}>"
        )


# ============================================================
# TABLA 6: CONFIGURACION_PROGRESO — Reglas de avance
# ============================================================

class ConfiguracionProgreso(Base):
    """
    Reglas de negocio configurables por el administrador.
    Define cuantas preguntas, que porcentaje, si hay cronometro
    y que tipo de feedback usar por bloque.

    El cronometro se configura AQUI, no en preguntas (Mejora #1).
    """
    __tablename__ = "configuracion_progreso"

    id = Column(Integer, primary_key=True, index=True)

    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)

    seccion = Column(Integer, nullable=False)
    operacion = Column(Enum(OperacionEnum, name="operacion_config", native_enum=False), nullable=False)

    cantidad_requerida = Column(Integer, nullable=False)  # Ej: 50 preguntas
    porcentaje_aprobacion = Column(Integer, nullable=False)  # Ej: 95

    # Orden de desbloqueo dentro de una seccion
    # Ej: suma=1, resta=2, multiplicacion=3, division=4
    orden_desbloqueo = Column(Integer, nullable=False)

    # Tipo de feedback: "simple" (correcto/incorrecto) o "detallado" (paso a paso)
    tipo_feedback = Column(String(20), default="simple", nullable=False)

    # Cronometro a nivel de bloque (Decision #4)
    usa_cronometro = Column(Boolean, default=False, nullable=False)
    tiempo_default_segundos = Column(Integer, nullable=True)

    activo = Column(Boolean, default=True, nullable=False)

    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultima_modificacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    fase = relationship("Fase", back_populates="configuraciones")

    __table_args__ = (
        UniqueConstraint(
            "fase_id",
            "seccion",
            "operacion",
            name="uq_config_fase_seccion_operacion",
        ),
        Index(
            "idx_config_fase_seccion_operacion",
            "fase_id",
            "seccion",
            "operacion",
        ),
    )

    def __repr__(self):
        return (
            f"<ConfiguracionProgreso fase={self.fase_id} "
            f"seccion={self.seccion} "
            f"operacion={self.operacion} "
            f"cantidad={self.cantidad_requerida} "
            f"aprobacion={self.porcentaje_aprobacion}%>"
        )


# ============================================================
# TABLA 7: POOL_ASIGNADO_ALUMNO — Preguntas asignadas
# ============================================================

class PoolAsignadoAlumno(Base):
    """
    Preguntas asignadas aleatoriamente a un alumno para un bloque especifico.
    El admin puede cargar 120 preguntas, pero cada alumno recibe solo 50
    (segun configuracion_progreso.cantidad_requerida).
    """
    __tablename__ = "pool_asignado_alumno"

    id = Column(Integer, primary_key=True, index=True)

    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)

    seccion = Column(Integer, nullable=False)
    operacion = Column(Enum(OperacionEnum, name="operacion_pool", native_enum=False), nullable=False)

    respondida_correctamente = Column(Boolean, default=False, nullable=False)
    respondida_alguna_vez = Column(Boolean, default=False, nullable=False)

    # Cuantas veces intento esta pregunta (Mejora #3)
    numero_intentos = Column(Integer, default=0, nullable=False)

    fecha_asignacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultima_actualizacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    alumno = relationship("Alumno", back_populates="pools")
    pregunta = relationship("Pregunta", back_populates="pools")
    fase = relationship("Fase")

    __table_args__ = (
        UniqueConstraint(
            "alumno_id",
            "pregunta_id",
            name="uq_pool_alumno_pregunta",
        ),
        Index(
            "idx_pool_alumno_bloque",
            "alumno_id",
            "fase_id",
            "seccion",
            "operacion",
        ),
        Index(
            "idx_pool_pendientes",
            "alumno_id",
            "fase_id",
            "seccion",
            "operacion",
            "respondida_correctamente",
        ),
    )

    def __repr__(self):
        return (
            f"<PoolAsignadoAlumno alumno={self.alumno_id} "
            f"pregunta={self.pregunta_id} "
            f"intentos={self.numero_intentos} "
            f"correcta={self.respondida_correctamente}>"
        )


# ============================================================
# TABLA 8: PROGRESO_MAESTRIA — Progreso POR BLOQUE
# ============================================================

class ProgresoMaestria(Base):
    """
    Progreso del alumno POR BLOQUE (fase+seccion+operacion).
    Cada bloque tiene su propio registro permanente (Mejora #2).

    El historial NO se pierde cuando el alumno avanza.
    Para saber donde esta actualmente, consultar el primer
    bloque con estado != aprobado, ordenado por fase+seccion+orden_desbloqueo.
    """
    __tablename__ = "progreso_maestria"

    id = Column(Integer, primary_key=True, index=True)

    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)

    # Fijos para este registro (ya NO son "actuales")
    seccion = Column(Integer, nullable=False)
    operacion = Column(Enum(OperacionEnum, name="operacion_progreso", native_enum=False), nullable=False)

    estado = Column(
        Enum(EstadoProgresoEnum, name="estado_progreso_enum", native_enum=False),
        default=EstadoProgresoEnum.BLOQUEADO,
        nullable=False,
    )

    aciertos_acumulados = Column(Integer, default=0, nullable=False)
    intentos_totales = Column(Integer, default=0, nullable=False)
    porcentaje_actual = Column(Integer, default=0, nullable=False)

    fecha_inicio = Column(DateTime, default=datetime.utcnow, nullable=False)
    # Cuando aprobo este bloque (Mejora #2)
    fecha_aprobacion = Column(DateTime, nullable=True)
    ultima_actualizacion = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relaciones
    alumno = relationship("Alumno", back_populates="progresos")
    fase = relationship("Fase", back_populates="progresos")

    __table_args__ = (
        UniqueConstraint(
            "alumno_id",
            "fase_id",
            "seccion",
            "operacion",
            name="uq_progreso_alumno_fase_seccion_operacion",
        ),
        Index(
            "idx_progreso_alumno_fase",
            "alumno_id",
            "fase_id",
        ),
        Index(
            "idx_progreso_alumno_estado",
            "alumno_id",
            "estado",
        ),
    )

    def __repr__(self):
        return (
            f"<ProgresoMaestria alumno={self.alumno_id} "
            f"fase={self.fase_id} "
            f"seccion={self.seccion} "
            f"operacion={self.operacion} "
            f"estado={self.estado}>"
        )


# ============================================================
# TABLA 9: INTENTOS — Historial analitico
# ============================================================

class Intento(Base):
    """
    Historial analitico de cada respuesta del alumno.

    Permite:
    - Calcular aciertos y errores
    - Detectar errores frecuentes por tipo
    - Saber que alternativa eligio
    - Medir tiempo de respuesta
    - Alimentar estadisticas del admin
    """
    __tablename__ = "intentos"

    id = Column(Integer, primary_key=True, index=True)

    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    alternativa_id = Column(Integer, ForeignKey("alternativas.id"), nullable=True)

    respuesta_dada = Column(String(255), nullable=True)
    es_correcta = Column(Boolean, nullable=False)

    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)
    seccion = Column(Integer, nullable=False)
    operacion = Column(Enum(OperacionEnum, name="operacion_intentos", native_enum=False), nullable=False)

    tipo_error = Column(Enum(TipoErrorEnum, name="tipo_error_intentos", native_enum=False), nullable=True)

    feedback_mostrado = Column(Text, nullable=True)
    explicacion_mostrada = Column(JSONB, nullable=True)

    # Cuanto tardo en responder (util para analitica aunque no haya cronometro)
    tiempo_respuesta_segundos = Column(Float, nullable=True)

    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    alumno = relationship("Alumno", back_populates="intentos")
    pregunta = relationship("Pregunta", back_populates="intentos")
    alternativa = relationship("Alternativa")
    fase = relationship("Fase")

    __table_args__ = (
        Index(
            "idx_intentos_alumno_fecha",
            "alumno_id",
            "fecha",
        ),
        Index(
            "idx_intentos_alumno_bloque",
            "alumno_id",
            "fase_id",
            "seccion",
            "operacion",
        ),
        Index(
            "idx_intentos_pregunta",
            "pregunta_id",
        ),
        Index(
            "idx_intentos_tipo_error",
            "tipo_error",
        ),
    )

    def __repr__(self):
        return (
            f"<Intento alumno={self.alumno_id} "
            f"pregunta={self.pregunta_id} "
            f"correcta={self.es_correcta}>"
        )


# ============================================================
# TABLA 10: PLATFORM_SETTINGS — Configuración global de la plataforma
# ============================================================

class PlatformSettings(Base):
    """
    Tabla de configuración global de la plataforma.
    Almacena parámetros pedagógicos configurables por el administrador:
    - Preguntas por fase
    - Tiempos por nivel de dificultad
    - Porcentaje mínimo de aprobación
    - Estado del cronómetro global
    """
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, default=1)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<PlatformSettings key={self.key}>"

