from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from ..db.base import Base
from .enums import StatusEnum, OperacionEnum, TipoPreguntaEnum, TipoErrorEnum

class Pregunta(Base):
    """
    Banco principal de ejercicios. Solo para Fases 1+.
    (Fase 0 usa generacion dinamica en mathService.ts)

    Soporta: calculo directo, problemas narrativos, problemas mixtos,
    multiple opcion y respuesta numerica.

    El cronometro NO se configura aqui.
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
    estructura_padre_id = Column(String(255), nullable=True, index=True)

    operacion = Column(Enum(OperacionEnum, name="operacion_preguntas", native_enum=False), nullable=False)
    tipo_pregunta = Column(Enum(TipoPreguntaEnum, name="tipo_pregunta_enum", native_enum=False), nullable=False)

    # Contenido principal
    enunciado = Column(Text, nullable=False)
    respuesta_correcta = Column(String(255), nullable=False)

    # Datos estructurados para analisis o generacion de variantes
    datos_numericos = Column(JSONB, nullable=True)

    # Payload tokenizado para herramienta subrayadora (Modulo 4)
    payload_tokenizado = Column(JSONB, nullable=True)

    # Explicacion paso a paso para tutoria invisible
    explicacion_paso_a_paso = Column(JSONB, nullable=True)

    # Para ejercicios de inferencia
    requiere_subrayado = Column(Boolean, default=False, nullable=False)

    # Palabras clave y operacion sugerida
    palabras_clave = Column(JSONB, nullable=True)

    # Para detectar errores sin IA en respuestas numericas
    errores_previstos = Column(JSONB, nullable=True)

    # Auditoria de administradores
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

    # Campos de revisión de administración
    revisado_admin = Column(Boolean, default=False, nullable=False)
    revisado_por = Column(String, nullable=True)
    fecha_revision = Column(DateTime, nullable=True)

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
        Index(
            "idx_preguntas_errores_previstos_gin",
            "errores_previstos",
            postgresql_using="gin",
        ),
        Index(
            "idx_preguntas_datos_numericos_gin",
            "datos_numericos",
            postgresql_using="gin",
        ),
        Index(
            "idx_preguntas_palabras_clave_gin",
            "palabras_clave",
            postgresql_using="gin",
        ),
    )

    def __repr__(self):
        return (
            f"<Pregunta id={self.id} "
            f"fase={self.fase_id} "
            f"seccion={self.seccion} "
            f"operacion={self.operacion}>"
        )


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

    # Timestamps
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
