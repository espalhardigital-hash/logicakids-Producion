from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from ..db.base import Base
from .enums import StatusEnum

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
