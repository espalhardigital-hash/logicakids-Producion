from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from ..db.base import Base
from .enums import OperacionEnum, EstadoProgresoEnum, TipoErrorEnum

class ConfiguracionProgreso(Base):
    """
    Reglas de negocio configurables por el administrador.
    Define cuantas preguntas, que porcentaje, si hay cronometro
    y que tipo de feedback usar por bloque.
    """
    __tablename__ = "configuracion_progreso"

    id = Column(Integer, primary_key=True)

    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)

    seccion = Column(Integer, nullable=False)
    operacion = Column(Enum(OperacionEnum, name="operacion_config", native_enum=False), nullable=False)

    cantidad_requerida = Column(Integer, nullable=False)  # Ej: 50 preguntas
    porcentaje_aprobacion = Column(Integer, nullable=False)  # Ej: 95

    # Orden de desbloqueo dentro de una seccion
    orden_desbloqueo = Column(Integer, nullable=False)

    # Tipo de feedback: "simple" (correcto/incorrecto) o "detallado" (paso a paso)
    tipo_feedback = Column(String(20), default="simple", nullable=False)

    # Cronometro a nivel de bloque
    usa_cronometro = Column(Boolean, default=False, nullable=False)
    tiempo_default_segundos = Column(Integer, nullable=True)

    activo = Column(Boolean, default=True, nullable=False)

    fecha_creacion = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    ultima_modificacion = Column(
        DateTime(timezone=True),
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


class PoolAsignadoAlumno(Base):
    """
    Preguntas asignadas aleatoriamente a un alumno para un bloque especifico.
    El admin puede cargar 120 preguntas, pero cada alumno recibe solo 50
    """
    __tablename__ = "pool_asignado_alumno"

    id = Column(Integer, primary_key=True)

    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)

    seccion = Column(Integer, nullable=False)
    operacion = Column(Enum(OperacionEnum, name="operacion_pool", native_enum=False), nullable=False)

    respondida_correctamente = Column(Boolean, default=False, nullable=False)
    respondida_alguna_vez = Column(Boolean, default=False, nullable=False)

    # Cuantas veces intento esta pregunta
    numero_intentos = Column(Integer, default=0, nullable=False)

    fecha_asignacion = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    ultima_actualizacion = Column(
        DateTime(timezone=True),
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


class ProgresoMaestria(Base):
    """
    Progreso del alumno POR BLOQUE (fase+seccion+operacion).
    Cada bloque tiene su propio registro permanente.
    """
    __tablename__ = "progreso_maestria"

    id = Column(Integer, primary_key=True)

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

    fecha_inicio = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    # Cuando aprobo este bloque
    fecha_aprobacion = Column(DateTime(timezone=True), nullable=True)
    ultima_actualizacion = Column(
        DateTime(timezone=True),
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


class Intento(Base):
    """
    Historial analitico de cada respuesta del alumno.
    """
    __tablename__ = "intentos"

    id = Column(Integer, primary_key=True)

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

    # Cuanto tardo en responder
    tiempo_respuesta_segundos = Column(Float, nullable=True)

    fecha = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

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


class SesionEvaluacion(Base):
    """
    Rastrea el progreso en tiempo real de una sesión de evaluación/desafío
    para evitar agregaciones costosas sobre intentos pasados.
    """
    __tablename__ = "sesiones_evaluacion"

    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False, index=True)
    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False, index=True)
    seccion = Column(Integer, nullable=False) # modulo
    operacion = Column(Enum(OperacionEnum, name="operacion_sesion_eval", native_enum=False), nullable=False)
    
    # Nuevos campos de producción de LogicaKids Pro
    modulo_id = Column(Integer, nullable=True, index=True)
    nivel_id = Column(Integer, nullable=True, index=True)
    tipo_sesion = Column(String(50), nullable=True) # practica, desafio
    tipo_desafio = Column(String(50), nullable=True) # desafio_1, desafio_2, desafio_final
    porcentaje_acierto = Column(Float, nullable=True)
    tiempo_total_segundos = Column(Integer, nullable=True)
    maestria_alcanzada = Column(Boolean, default=False, nullable=True)
    motivo_finalizacion = Column(String(100), nullable=True) # completado, fallo_temprano, abandono

    intentos_totales = Column(Integer, default=0, nullable=False)
    intentos_correctos = Column(Integer, default=0, nullable=False)
    intentos_incorrectos = Column(Integer, default=0, nullable=False)
    
    # Bucle Espejo / Mirror Loop state
    fallas_consecutivas = Column(Integer, default=0, nullable=False)
    pregunta_espejo_activa = Column(Boolean, default=False, nullable=False)
    pregunta_espejo_id = Column(Integer, ForeignKey("preguntas.id"), nullable=True) # ID de la pregunta original que falló

    fecha_inicio = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    fecha_fin = Column(DateTime(timezone=True), nullable=True)
    completada = Column(Boolean, default=False, nullable=False, index=True)

    # Relaciones
    alumno = relationship("Alumno")
    fase = relationship("Fase")
    pregunta_espejo = relationship("Pregunta")
