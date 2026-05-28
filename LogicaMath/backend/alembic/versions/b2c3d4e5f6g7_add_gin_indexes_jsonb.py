"""add gin indexes jsonb

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f9
Create Date: 2026-05-28 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First convert json columns to jsonb (safe in Postgres)
    op.execute("ALTER TABLE preguntas ALTER COLUMN errores_previstos TYPE jsonb USING errores_previstos::jsonb")
    op.execute("ALTER TABLE preguntas ALTER COLUMN datos_numericos TYPE jsonb USING datos_numericos::jsonb")
    op.execute("ALTER TABLE preguntas ALTER COLUMN palabras_clave TYPE jsonb USING palabras_clave::jsonb")
    op.execute("ALTER TABLE users ALTER COLUMN settings TYPE jsonb USING settings::jsonb")

    # Create indexes using raw SQL to support IF NOT EXISTS safely
    op.execute("CREATE INDEX IF NOT EXISTS idx_preguntas_errores_previstos_gin ON preguntas USING gin (errores_previstos)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_preguntas_datos_numericos_gin ON preguntas USING gin (datos_numericos)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_preguntas_palabras_clave_gin ON preguntas USING gin (palabras_clave)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_users_settings_gin ON users USING gin (settings)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_preguntas_errores_previstos_gin")
    op.execute("DROP INDEX IF EXISTS idx_preguntas_datos_numericos_gin")
    op.execute("DROP INDEX IF EXISTS idx_preguntas_palabras_clave_gin")
    op.execute("DROP INDEX IF EXISTS idx_users_settings_gin")
    
    op.execute("ALTER TABLE preguntas ALTER COLUMN errores_previstos TYPE json USING errores_previstos::json")
    op.execute("ALTER TABLE preguntas ALTER COLUMN datos_numericos TYPE json USING datos_numericos::json")
    op.execute("ALTER TABLE preguntas ALTER COLUMN palabras_clave TYPE json USING palabras_clave::json")
    op.execute("ALTER TABLE users ALTER COLUMN settings TYPE json USING settings::json")

