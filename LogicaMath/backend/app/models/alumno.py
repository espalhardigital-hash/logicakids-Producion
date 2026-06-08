from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..db.base import Base
from .enums import StatusEnum

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

    # Acceso rapido a la fase actual
    fase_actual_id = Column(Integer, ForeignKey("fases.id"), nullable=False, default=1)

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
