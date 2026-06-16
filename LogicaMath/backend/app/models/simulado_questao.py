"""
Modelo SQLAlchemy — SimuladoQuestao
====================================
Tabla que almacena las 60 preguntas reales del Colégio Pedro II
distribuidas en 20 simulacros (10 preguntas por simulacro).

Cada pregunta tiene:
- Enunciado completo
- 4 alternativas (A/B/C/D)
- Gabarito (alternativa_correta) — NUNCA enviado al frontend antes de la entrega
- Resolução paso a paso (JSON)
- Metadatos: tema, dificuldade, ano_prova, simulacro_numero
"""

from sqlalchemy import Column, Integer, String, Text, JSON, Index
from app.db.base import Base


class SimuladoQuestao(Base):
    """
    Banco de preguntas del sistema de simulacros Pedro II.
    Un simulacro tiene exactamente 10 preguntas (ordem_na_prova 1-10).
    Los 20 simulacros cubren simulacro_numero 1-20.
    """
    __tablename__ = "simulado_questao"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    # Identificación del simulacro y posición
    simulacro_numero = Column(Integer, nullable=False, index=True)   # 1–20
    ordem_na_prova   = Column(Integer, nullable=False)               # 1–10

    # Enunciado completo de la pregunta
    enunciado = Column(Text, nullable=False)

    # Las 4 alternativas
    alternativa_a = Column(Text, nullable=False)
    alternativa_b = Column(Text, nullable=False)
    alternativa_c = Column(Text, nullable=False)
    alternativa_d = Column(Text, nullable=False)

    # Gabarito — almacenado en backend, NUNCA enviado al frontend antes de entregar
    alternativa_correta = Column(String(1), nullable=False)          # "A", "B", "C" o "D"

    # Resolução paso a paso (lista de dicts: [{paso: 1, texto: "..."}, ...])
    resolucao = Column(JSON, nullable=False, default=list)

    # Metadatos pedagógicos
    tema       = Column(String(150), nullable=False)
    dificuldade = Column(String(10), nullable=False)                  # "facil" | "medio" | "dificil"
    ano_prova  = Column(Integer, nullable=True)                      # 2017–2024

    # Índice compuesto para consultas eficientes por simulacro
    __table_args__ = (
        Index("ix_simulado_questao_num_ordem", "simulacro_numero", "ordem_na_prova"),
    )

    def __repr__(self):
        return (
            f"<SimuladoQuestao simulacro={self.simulacro_numero} "
            f"ordem={self.ordem_na_prova} correta={self.alternativa_correta}>"
        )
