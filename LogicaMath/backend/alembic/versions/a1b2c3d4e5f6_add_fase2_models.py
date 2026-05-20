"""add_fase2_models

Revision ID: a1b2c3d4e5f6
Revises: 777e2bd6bd57
Create Date: 2026-05-20 02:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '777e2bd6bd57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add Fase 2 specific tables and columns."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    # --- 1. Add payload_tokenizado column to preguntas (if not exists) ---
    if "preguntas" in existing_tables:
        columns = [col["name"] for col in inspector.get_columns("preguntas")]
        if "payload_tokenizado" not in columns:
            op.add_column(
                "preguntas",
                sa.Column("payload_tokenizado", sa.JSON(), nullable=True),
            )

    # --- 2. Create intento_preguntas (Fase 2 multi-step tracking) ---
    if "intento_preguntas" not in existing_tables:
        op.create_table(
            "intento_preguntas",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("alumno_id", sa.Integer(), sa.ForeignKey("alumnos.id"), nullable=False),
            sa.Column("pregunta_id", sa.Integer(), sa.ForeignKey("preguntas.id"), nullable=False),
            sa.Column("aprobada_completa", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("intentos_totales", sa.Integer(), server_default="0", nullable=False),
            sa.Column("tiempo_total", sa.Float(), server_default="0", nullable=False),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    # --- 3. Create intento_pasos (Fase 2 granular step tracking) ---
    if "intento_pasos" not in existing_tables:
        op.create_table(
            "intento_pasos",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column(
                "intento_pregunta_id",
                sa.Integer(),
                sa.ForeignKey("intento_preguntas.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("paso_numero", sa.Integer(), nullable=False),
            sa.Column("respuesta_dada", sa.String(length=255), nullable=True),
            sa.Column("es_correcta", sa.Boolean(), nullable=False),
            sa.Column("tipo_error_detectado", sa.String(length=50), nullable=True),
            sa.Column("es_espejo", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("tiempo_respuesta", sa.Float(), nullable=True),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    """Remove Fase 2 specific tables and columns."""
    op.drop_table("intento_pasos")
    op.drop_table("intento_preguntas")
    op.execute("ALTER TABLE preguntas DROP COLUMN IF EXISTS payload_tokenizado")
