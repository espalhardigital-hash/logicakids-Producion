"""add_nivel_teoria

Revision ID: a1b2c3d4e5f8
Revises: a1b2c3d4e5f7
Create Date: 2026-05-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f8'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create niveles_teoria_pool table."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if "niveles_teoria_pool" not in inspector.get_table_names():
        op.create_table(
            "niveles_teoria_pool",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("fase_id", sa.Integer(), nullable=False),
            sa.Column("modulo_id", sa.Integer(), nullable=False),
            sa.Column("nivel_id", sa.Integer(), nullable=False),
            sa.Column("titulo", sa.String(length=255), nullable=False),
            sa.Column("texto_descubrimiento", sa.Text(), nullable=False),
            sa.Column("diccionario", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column("advertencia", sa.Text(), nullable=True),
            sa.Column("ejemplos", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column("interactivos", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.ForeignKeyConstraint(["fase_id"], ["fases.id"]),
            sa.PrimaryKeyConstraint("id")
        )
        op.create_index("idx_niveles_teoria_pool_modulo", "niveles_teoria_pool", ["modulo_id"], unique=False)
        op.create_index("idx_niveles_teoria_pool_nivel", "niveles_teoria_pool", ["nivel_id"], unique=False)


def downgrade() -> None:
    """Drop niveles_teoria_pool table."""
    op.drop_table("niveles_teoria_pool")
