"""add simulado_questao table and update simulado_sessions

Revision ID: d4e5f6a7b8c9
Revises: c1d2e3f4a5b6
Create Date: 2026-06-15

Crea la tabla simulado_questao para almacenar las 60 preguntas reales
del Colegio Pedro II. También agrega los campos simulacro_numero y
pregunta_ids_json a simulado_sessions.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'd4e5f6a7b8c9'
down_revision = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ─── Crear tabla simulado_questao ──────────────────────────────────────────
    op.create_table(
        'simulado_questao',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('simulacro_numero', sa.Integer(), nullable=False),
        sa.Column('ordem_na_prova', sa.Integer(), nullable=False),
        sa.Column('enunciado', sa.Text(), nullable=False),
        sa.Column('alternativa_a', sa.Text(), nullable=False),
        sa.Column('alternativa_b', sa.Text(), nullable=False),
        sa.Column('alternativa_c', sa.Text(), nullable=False),
        sa.Column('alternativa_d', sa.Text(), nullable=False),
        sa.Column('alternativa_correta', sa.String(length=1), nullable=False),
        sa.Column('resolucao', sa.JSON(), nullable=False),
        sa.Column('tema', sa.String(length=150), nullable=False),
        sa.Column('dificuldade', sa.String(length=10), nullable=False),
        sa.Column('ano_prova', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_simulado_questao_id', 'simulado_questao', ['id'])
    op.create_index('ix_simulado_questao_simulacro_numero', 'simulado_questao', ['simulacro_numero'])
    op.create_index('ix_simulado_questao_num_ordem', 'simulado_questao', ['simulacro_numero', 'ordem_na_prova'])

    # ─── Agregar columnas a simulado_sessions ──────────────────────────────────
    # simulacro_numero: identifica cuál de los 20 simulacros es la sesión
    op.add_column(
        'simulado_sessions',
        sa.Column('simulacro_numero', sa.Integer(), nullable=True)
    )
    # pregunta_ids_json: snapshot de IDs de simulado_questao usados en la sesión
    op.add_column(
        'simulado_sessions',
        sa.Column('pregunta_ids_json', sa.JSON(), nullable=True)
    )
    op.create_index('ix_simulado_sessions_simulacro_numero', 'simulado_sessions', ['simulacro_numero'])


def downgrade() -> None:
    op.drop_index('ix_simulado_sessions_simulacro_numero', table_name='simulado_sessions')
    op.drop_column('simulado_sessions', 'pregunta_ids_json')
    op.drop_column('simulado_sessions', 'simulacro_numero')

    op.drop_index('ix_simulado_questao_num_ordem', table_name='simulado_questao')
    op.drop_index('ix_simulado_questao_simulacro_numero', table_name='simulado_questao')
    op.drop_index('ix_simulado_questao_id', table_name='simulado_questao')
    op.drop_table('simulado_questao')
