from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer
from sqlalchemy.sql import func
from ..db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(String, nullable=True) # ID of the admin who performed the action
    action = Column(String, nullable=False) # e.g. "UPDATE_USER", "DELETE_SCORE", "ANONYMIZE_USER"
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    payload_summary = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AuditLog id={self.id} admin={self.admin_id} action={self.action} time={self.timestamp}>"
