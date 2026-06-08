"""add_estructura_padre_id

Revision ID: a1b2c3d4e5f7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-21 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add estructura_padre_id to preguntas table."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if "preguntas" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("preguntas")]
        if "estructura_padre_id" not in columns:
            op.add_column(
                "preguntas",
                sa.Column("estructura_padre_id", sa.String(length=255), nullable=True),
            )
            op.create_index(
                "idx_preguntas_estructura_padre_id",
                "preguntas",
                ["estructura_padre_id"],
                unique=False,
            )


def downgrade() -> None:
    """Remove estructura_padre_id from preguntas table."""
    op.drop_index("idx_preguntas_estructura_padre_id", table_name="preguntas")
    op.execute("ALTER TABLE preguntas DROP COLUMN IF EXISTS estructura_padre_id")
