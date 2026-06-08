from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from ..db.base import Base

class PlatformSettings(Base):
    """
    Tabla de configuración global de la plataforma.
    Almacena parámetros pedagógicos configurables por el administrador
    """
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSONB, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<PlatformSettings key={self.key}>"
