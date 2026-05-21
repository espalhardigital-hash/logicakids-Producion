from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.base import Base

class IntentoPregunta(Base):
    """
    Rastrea la resolución general de una pregunta de Fase 2 (especialmente de tipo constructor/multi-paso).
    """
    __tablename__ = "intento_preguntas"

    id = Column(Integer, primary_key=True, index=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    aprobada_completa = Column(Boolean, default=False, nullable=False)
    intentos_totales = Column(Integer, default=0, nullable=False)
    tiempo_total = Column(Float, default=0.0, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    alumno = relationship("Alumno")
    pregunta = relationship("Pregunta")
    pasos = relationship("IntentoPaso", back_populates="intento_pregunta", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<IntentoPregunta id={self.id} alumno_id={self.alumno_id} pregunta_id={self.pregunta_id} aprobada={self.aprobada_completa}>"


class IntentoPaso(Base):
    """
    Registra cada intento individual de respuesta en un paso específico de la pregunta de Fase 2.
    """
    __tablename__ = "intento_pasos"

    id = Column(Integer, primary_key=True, index=True)
    intento_pregunta_id = Column(Integer, ForeignKey("intento_preguntas.id"), nullable=False)
    paso_numero = Column(Integer, nullable=False)
    respuesta_dada = Column(String(255), nullable=True)
    es_correcta = Column(Boolean, nullable=False)
    tipo_error_detectado = Column(String(50), nullable=True)
    es_espejo = Column(Boolean, default=False, nullable=False)
    tiempo_respuesta = Column(Float, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    intento_pregunta = relationship("IntentoPregunta", back_populates="pasos")

    def __repr__(self):
        return f"<IntentoPaso id={self.id} intento_pregunta_id={self.intento_pregunta_id} paso={self.paso_numero} correcta={self.es_correcta}>"


from sqlalchemy.dialects.postgresql import JSONB

class NivelTeoria(Base):
    """
    Almacena el guion de textos de aprendizaje y evocación por nivel.
    """
    __tablename__ = "niveles_teoria_pool"

    id = Column(Integer, primary_key=True, index=True)
    fase_id = Column(Integer, ForeignKey("fases.id"), nullable=False)
    modulo_id = Column(Integer, nullable=False, index=True)
    nivel_id = Column(Integer, nullable=False, index=True)
    titulo = Column(String(255), nullable=False)
    texto_descubrimiento = Column(Text, nullable=False)
    diccionario = Column(JSONB, nullable=True)      # Clave-valor (Palabras clave y definiciones)
    advertencia = Column(Text, nullable=True)        # Trampa o Tip pedagógico
    ejemplos = Column(JSONB, nullable=True)         # Ejemplos guiados de práctica
    interactivos = Column(JSONB, nullable=True)     # Preguntas interactivas con feedback

    # Relaciones
    fase = relationship("Fase")

    def __repr__(self):
        return f"<NivelTeoria id={self.id} modulo={self.modulo_id} nivel={self.nivel_id} titulo='{self.titulo}'>"

