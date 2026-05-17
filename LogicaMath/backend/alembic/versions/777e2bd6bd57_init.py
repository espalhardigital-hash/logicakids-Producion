"""init

Revision ID: 777e2bd6bd57
Revises: 
Create Date: 2026-05-17 01:31:34.691629

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '777e2bd6bd57'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    # 1. users
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("username", sa.String(), nullable=False),
            sa.Column("email", sa.String(), unique=True, nullable=False),
            sa.Column("password_hash", sa.String(), nullable=True),
            sa.Column("role", sa.String(), server_default="USER", nullable=False),
            sa.Column("status", sa.String(), server_default="ACTIVE", nullable=False),
            sa.Column("avatar", sa.String(), nullable=True),
            sa.Column("settings", sa.JSON(), nullable=True),
            sa.Column("unlocked_level", sa.Integer(), server_default="0", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        )

    # 2. platform_settings
    if "platform_settings" not in existing_tables:
        op.create_table(
            "platform_settings",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("key", sa.String(length=100), unique=True, nullable=False, index=True),
            sa.Column("value", sa.JSON(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    # 3. fases
    if "fases" not in existing_tables:
        op.create_table(
            "fases",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("nombre", sa.String(length=120), nullable=False),
            sa.Column("descripcion", sa.Text(), nullable=True),
            sa.Column("orden", sa.Integer(), nullable=False),
            sa.Column("estado", sa.String(length=50), server_default="activo", nullable=False),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("ultima_modificacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    # 4. alumnos
    if "alumnos" not in existing_tables:
        op.create_table(
            "alumnos",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), unique=True, nullable=False),
            sa.Column("nombre", sa.String(length=120), nullable=False),
            sa.Column("edad", sa.Integer(), nullable=True),
            sa.Column("fase_actual_id", sa.Integer(), sa.ForeignKey("fases.id"), server_default="1", nullable=False),
            sa.Column("estado", sa.String(length=50), server_default="activo", nullable=False),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("ultima_modificacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    # 5. configuracion_progreso
    if "configuracion_progreso" not in existing_tables:
        op.create_table(
            "configuracion_progreso",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("fase_id", sa.Integer(), sa.ForeignKey("fases.id"), nullable=False),
            sa.Column("seccion", sa.Integer(), nullable=False),
            sa.Column("operacion", sa.String(length=50), nullable=False),
            sa.Column("cantidad_requerida", sa.Integer(), nullable=False),
            sa.Column("porcentaje_aprobacion", sa.Integer(), nullable=False),
            sa.Column("orden_desbloqueo", sa.Integer(), nullable=False),
            sa.Column("tipo_feedback", sa.String(length=20), server_default="simple", nullable=False),
            sa.Column("usa_cronometro", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("tiempo_default_segundos", sa.Integer(), nullable=True),
            sa.Column("activo", sa.Boolean(), server_default="true", nullable=False),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("ultima_modificacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("fase_id", "seccion", "operacion", name="uq_config_fase_seccion_operacion")
        )

    # 6. preguntas
    if "preguntas" not in existing_tables:
        op.create_table(
            "preguntas",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("fase_id", sa.Integer(), sa.ForeignKey("fases.id"), nullable=False),
            sa.Column("seccion", sa.Integer(), nullable=False),
            sa.Column("sub_nivel", sa.Integer(), nullable=True),
            sa.Column("operacion", sa.String(length=50), nullable=False),
            sa.Column("tipo_pregunta", sa.String(length=50), nullable=False),
            sa.Column("enunciado", sa.Text(), nullable=False),
            sa.Column("respuesta_correcta", sa.String(length=255), nullable=False),
            sa.Column("datos_numericos", sa.JSON(), nullable=True),
            sa.Column("explicacion_paso_a_paso", sa.JSON(), nullable=True),
            sa.Column("requiere_subrayado", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("palabras_clave", sa.JSON(), nullable=True),
            sa.Column("errores_previstos", sa.JSON(), nullable=True),
            sa.Column("creado_por", sa.String(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("modificado_por", sa.String(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("estado", sa.String(length=50), server_default="activo", nullable=False),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("ultima_modificacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    # 7. alternativas
    if "alternativas" not in existing_tables:
        op.create_table(
            "alternativas",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("pregunta_id", sa.Integer(), sa.ForeignKey("preguntas.id", ondelete="CASCADE"), nullable=False),
            sa.Column("texto", sa.String(length=255), nullable=False),
            sa.Column("es_correcta", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("orden", sa.Integer(), nullable=True),
            sa.Column("tipo_error", sa.String(length=50), nullable=True),
            sa.Column("feedback_error", sa.Text(), nullable=True),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("ultima_modificacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )

    # 8. pool_asignado_alumno
    if "pool_asignado_alumno" not in existing_tables:
        op.create_table(
            "pool_asignado_alumno",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("alumno_id", sa.Integer(), sa.ForeignKey("alumnos.id"), nullable=False),
            sa.Column("pregunta_id", sa.Integer(), sa.ForeignKey("preguntas.id"), nullable=False),
            sa.Column("fase_id", sa.Integer(), sa.ForeignKey("fases.id"), nullable=False),
            sa.Column("seccion", sa.Integer(), nullable=False),
            sa.Column("operacion", sa.String(length=50), nullable=False),
            sa.Column("respondida_correctamente", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("respondida_alguna_vez", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("numero_intentos", sa.Integer(), server_default="0", nullable=False),
            sa.Column("fecha_asignacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("ultima_actualizacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("alumno_id", "pregunta_id", name="uq_pool_alumno_pregunta")
        )

    # 9. progreso_maestria
    if "progreso_maestria" not in existing_tables:
        op.create_table(
            "progreso_maestria",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("alumno_id", sa.Integer(), sa.ForeignKey("alumnos.id"), nullable=False),
            sa.Column("fase_id", sa.Integer(), sa.ForeignKey("fases.id"), nullable=False),
            sa.Column("seccion", sa.Integer(), nullable=False),
            sa.Column("operacion", sa.String(length=50), nullable=False),
            sa.Column("estado", sa.String(length=50), server_default="bloqueado", nullable=False),
            sa.Column("aciertos_acumulados", sa.Integer(), server_default="0", nullable=False),
            sa.Column("intentos_totales", sa.Integer(), server_default="0", nullable=False),
            sa.Column("porcentaje_actual", sa.Integer(), server_default="0", nullable=False),
            sa.Column("fecha_inicio", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("fecha_aprobacion", sa.DateTime(), nullable=True),
            sa.Column("ultima_actualizacion", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("alumno_id", "fase_id", "seccion", "operacion", name="uq_progreso_alumno_fase_seccion_operacion")
        )

    # 10. intentos
    if "intentos" not in existing_tables:
        op.create_table(
            "intentos",
            sa.Column("id", sa.Integer(), primary_key=True, index=True, autoincrement=True),
            sa.Column("alumno_id", sa.Integer(), sa.ForeignKey("alumnos.id"), nullable=False),
            sa.Column("pregunta_id", sa.Integer(), sa.ForeignKey("preguntas.id"), nullable=False),
            sa.Column("alternativa_id", sa.Integer(), sa.ForeignKey("alternativas.id"), nullable=True),
            sa.Column("respuesta_dada", sa.String(length=255), nullable=True),
            sa.Column("es_correcta", sa.Boolean(), nullable=False),
            sa.Column("fase_id", sa.Integer(), sa.ForeignKey("fases.id"), nullable=False),
            sa.Column("seccion", sa.Integer(), nullable=False),
            sa.Column("operacion", sa.String(length=50), nullable=False),
            sa.Column("tipo_error", sa.String(length=50), nullable=True),
            sa.Column("feedback_mostrado", sa.Text(), nullable=True),
            sa.Column("explicacion_mostrada", sa.JSON(), nullable=True),
            sa.Column("tiempo_respuesta_segundos", sa.Float(), nullable=True),
            sa.Column("fecha", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("intentos")
    op.drop_table("progreso_maestria")
    op.drop_table("pool_asignado_alumno")
    op.drop_table("alternativas")
    op.drop_table("preguntas")
    op.drop_table("configuracion_progreso")
    op.drop_table("alumnos")
    op.drop_table("fases")
    op.drop_table("platform_settings")
    op.drop_table("users")
