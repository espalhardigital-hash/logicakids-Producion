from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base import Base

class User(Base):
    """
    Tabla de autenticacion. Se reutiliza auth.py completo:
    JWT, bcrypt, login, register, get_admin_user().
    El campo role='ADMIN' habilita el panel de administracion.
    """
    __tablename__ = "users"

    __table_args__ = (
        Index(
            "idx_users_settings_gin",
            "settings",
            postgresql_using="gin",
        ),
    )


    id = Column(String, primary_key=True)  # UUID
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)  # For local auth
    role = Column(String, default="USER")  # USER / ADMIN
    status = Column(String, default="ACTIVE")  # ACTIVE / BANNED
    avatar = Column(String, nullable=True)
    settings = Column(JSONB, default={})
    unlocked_level = Column(Integer, default=0)  # Compatibilidad con auth.py
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relacion con perfil pedagogico
    alumno = relationship("Alumno", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User id={self.id} username={self.username} role={self.role}>"
