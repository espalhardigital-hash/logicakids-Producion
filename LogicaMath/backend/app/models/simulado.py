from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.db.base import Base

class SimuladoSession(Base):
    __tablename__ = "simulado_sessions"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    alumno_id = Column(Integer, ForeignKey('alumnos.id'), nullable=False, index=True)
    fase_id = Column(Integer, nullable=False, index=True)
    modulo_id = Column(Integer, nullable=False)
    nivel_id = Column(Integer, nullable=False)
    
    estado = Column(String, default="EN_CURSO", index=True) # EN_CURSO, FINALIZADO
    
    respuestas_json = Column(JSON, default=dict)
    marcadores_revision = Column(JSON, default=list)
    tiempo_restante_segundos = Column(Integer, nullable=False)
    
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=True)

    alumno = relationship("Alumno", back_populates="simulados")
