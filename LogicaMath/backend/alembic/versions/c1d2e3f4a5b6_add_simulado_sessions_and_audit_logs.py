"""Add simulado_sessions and audit_logs tables

Revision ID: c1d2e3f4a5b6
Revises: bd37b111d579
Create Date: 2026-06-15 19:50:00.000000

CORRECCION CRITICA:
  - La migracion anterior 'bd37b111d579' se llamaba 'Add SimuladoSession table'
    pero NO creaba la tabla. Este script corrige ese error creando:
    1. simulado_sessions — tabla de sesiones de simulacros (Fase 9)
    2. audit_logs — tabla de auditoria de acciones de administradores
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'bd37b111d579'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Crear tablas simulado_sessions y audit_logs si no existen."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    # -------------------------------------------------------------------------
    # 1. simulado_sessions
    #    Almacena sesiones de simulacros de la Fase 9 (Simulados Pedro II).
    #    NOTA: Se usa JSONB en lugar de JSON para mayor performance en PostgreSQL.
    # -------------------------------------------------------------------------
    if "simulado_sessions" not in existing_tables:
        op.create_table(
            "simulado_sessions",
            sa.Column(
                "id",
                sa.String(36),
                primary_key=True,
                index=True,
            ),
            sa.Column(
                "alumno_id",
                sa.Integer(),
                sa.ForeignKey("alumnos.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column(
                "fase_id",
                sa.Integer(),
                sa.ForeignKey("fases.id"),
                nullable=False,
                index=True,
            ),
            sa.Column(
                "modulo_id",
                sa.Integer(),
                nullable=False,
            ),
            sa.Column(
                "nivel_id",
                sa.Integer(),
                nullable=False,
            ),
            sa.Column(
                "estado",
                sa.String(20),
                server_default="EN_CURSO",
                nullable=False,
                index=True,
            ),
            sa.Column(
                "respuestas_json",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default="{}",
                nullable=False,
            ),
            sa.Column(
                "marcadores_revision",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default="[]",
                nullable=False,
            ),
            sa.Column(
                "tiempo_restante_segundos",
                sa.Integer(),
                nullable=False,
            ),
            sa.Column(
                "fecha_inicio",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column(
                "fecha_fin",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
        )
        # Indice compuesto para queries de sesiones por alumno y fase
        op.create_index(
            "idx_simulado_sessions_alumno_fase",
            "simulado_sessions",
            ["alumno_id", "fase_id"],
        )
        # Indice para buscar sesiones en curso de un alumno
        op.create_index(
            "idx_simulado_sessions_alumno_estado",
            "simulado_sessions",
            ["alumno_id", "estado"],
        )
        # Indice GIN para busquedas dentro de respuestas_json
        op.create_index(
            "idx_simulado_sessions_respuestas_gin",
            "simulado_sessions",
            ["respuestas_json"],
            postgresql_using="gin",
        )
        print("Tabla 'simulado_sessions' creada exitosamente.")
    else:
        print("Tabla 'simulado_sessions' ya existe.")
        # Si la tabla ya existe (creada por Base.metadata.create_all),
        # verificamos si le falta el FK de fase_id
        fk_exists = any(
            fk for fk in inspector.get_foreign_keys("simulado_sessions")
            if fk.get("referred_table") == "fases"
        )
        if not fk_exists:
            try:
                op.create_foreign_key(
                    "fk_simulado_sessions_fase_id",
                    "simulado_sessions",
                    "fases",
                    ["fase_id"],
                    ["id"],
                )
                print("FK 'fk_simulado_sessions_fase_id' agregado a simulado_sessions.")
            except Exception as e:
                print(f"No se pudo agregar FK en simulado_sessions.fase_id: {e}")

    # -------------------------------------------------------------------------
    # 2. audit_logs
    #    Registro de acciones de administradores para auditoria.
    # -------------------------------------------------------------------------
    if "audit_logs" not in existing_tables:
        op.create_table(
            "audit_logs",
            sa.Column(
                "id",
                sa.Integer(),
                primary_key=True,
                autoincrement=True,
            ),
            sa.Column(
                "admin_id",
                sa.String(),
                nullable=True,
            ),
            sa.Column(
                "action",
                sa.String(100),
                nullable=False,
            ),
            sa.Column(
                "endpoint",
                sa.String(255),
                nullable=False,
            ),
            sa.Column(
                "method",
                sa.String(10),
                nullable=False,
            ),
            sa.Column(
                "payload_summary",
                sa.Text(),
                nullable=True,
            ),
            sa.Column(
                "ip_address",
                sa.String(45),
                nullable=True,
            ),
            sa.Column(
                "timestamp",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )
        # Indices para busquedas frecuentes de auditoria
        op.create_index(
            "idx_audit_logs_admin_id",
            "audit_logs",
            ["admin_id"],
        )
        op.create_index(
            "idx_audit_logs_timestamp",
            "audit_logs",
            ["timestamp"],
        )
        op.create_index(
            "idx_audit_logs_action",
            "audit_logs",
            ["action"],
        )
        print("Tabla 'audit_logs' creada exitosamente.")
    else:
        print("Tabla 'audit_logs' ya existe, saltando creacion.")


def downgrade() -> None:
    """Eliminar tablas en orden inverso (respetando FKs)."""
    # Eliminar indices primero
    op.drop_index("idx_audit_logs_action", table_name="audit_logs")
    op.drop_index("idx_audit_logs_timestamp", table_name="audit_logs")
    op.drop_index("idx_audit_logs_admin_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("idx_simulado_sessions_respuestas_gin", table_name="simulado_sessions")
    op.drop_index("idx_simulado_sessions_alumno_estado", table_name="simulado_sessions")
    op.drop_index("idx_simulado_sessions_alumno_fase", table_name="simulado_sessions")
    op.drop_table("simulado_sessions")
