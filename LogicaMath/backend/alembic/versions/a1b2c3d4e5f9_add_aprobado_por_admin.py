"""add aprobado_por_admin to progreso_maestria

Revision ID: a1b2c3d4e5f9
Revises: a1b2c3d4e5f8
Create Date: 2026-05-28 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f9'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('progreso_maestria')]
    if 'aprobado_por_admin' not in columns:
        op.add_column('progreso_maestria', sa.Column('aprobado_por_admin', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('progreso_maestria')]
    if 'aprobado_por_admin' in columns:
        op.drop_column('progreso_maestria', 'aprobado_por_admin')
