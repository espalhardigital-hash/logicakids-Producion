import asyncio
import sys
import os
import argparse
from collections import defaultdict
from sqlalchemy import select, text, and_, delete
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add parent directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models
from app.models.sql_models import (
    Fase,
    Pregunta,
    Alternativa,
    ConfiguracionProgreso,
    StatusEnum,
    OperacionEnum,
    TipoPreguntaEnum,
    TipoErrorEnum
)
from app.fase2.models import NivelTeoria

# Database Connection URLs
# Source: Local Docker PostgreSQL
SRC_DATABASE_URL = os.environ.get(
    "SRC_DATABASE_URL",
    "postgresql+asyncpg://logicakids_local_user:LogicaKids2026#Local@postgres:5432/logicakids_local"
)

# Target: VPS PostgreSQL (via SSH tunnel host.docker.internal:5434)
TGT_DATABASE_URL = os.environ.get(
    "TGT_DATABASE_URL",
    "postgresql+asyncpg://logicakids_admin_desarrollo:logicakids_admin_desarrollo20258187@host.docker.internal:5434/bd_logicakids_desarrollo"
)

async def sync_fases(src_session: AsyncSession, tgt_session: AsyncSession, dry_run: bool):
    print("\n--- Sincronizando Fases ---")
    src_fases = (await src_session.execute(select(Fase))).scalars().all()
    
    for src_f in src_fases:
        tgt_f = (await tgt_session.execute(select(Fase).where(Fase.id == src_f.id))).scalar_one_or_none()
        
        if tgt_f:
            # Check if updated
            updated = False
            if tgt_f.nombre != src_f.nombre:
                print(f"  [FASE {src_f.id}] Nombre: '{tgt_f.nombre}' -> '{src_f.nombre}'")
                tgt_f.nombre = src_f.nombre
                updated = True
            if tgt_f.descripcion != src_f.descripcion:
                print(f"  [FASE {src_f.id}] Descripción actualizada.")
                tgt_f.descripcion = src_f.descripcion
                updated = True
            if tgt_f.orden != src_f.orden:
                print(f"  [FASE {src_f.id}] Orden: {tgt_f.orden} -> {src_f.orden}")
                tgt_f.orden = src_f.orden
                updated = True
            if tgt_f.estado != src_f.estado:
                print(f"  [FASE {src_f.id}] Estado: {tgt_f.estado} -> {src_f.estado}")
                tgt_f.estado = src_f.estado
                updated = True
                
            if updated and not dry_run:
                tgt_session.add(tgt_f)
        else:
            print(f"  [FASE {src_f.id}] [NUEVA] Añadiendo '{src_f.nombre}'")
            if not dry_run:
                new_f = Fase(
                    id=src_f.id,
                    nombre=src_f.nombre,
                    descripcion=src_f.descripcion,
                    orden=src_f.orden,
                    estado=src_f.estado
                )
                tgt_session.add(new_f)

async def sync_config_progreso(src_session: AsyncSession, tgt_session: AsyncSession, dry_run: bool):
    print("\n--- Sincronizando Configuraciones de Progreso ---")
    src_configs = (await src_session.execute(select(ConfiguracionProgreso))).scalars().all()
    
    for src_c in src_configs:
        # Match by fase_id, seccion, operacion
        tgt_c = (await tgt_session.execute(select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == src_c.fase_id,
            ConfiguracionProgreso.seccion == src_c.seccion,
            ConfiguracionProgreso.operacion == src_c.operacion
        )))).scalar_one_or_none()
        
        if tgt_c:
            updated = False
            if tgt_c.cantidad_requerida != src_c.cantidad_requerida:
                print(f"  [CP F{src_c.fase_id}-S{src_c.seccion}] cantidad_requerida: {tgt_c.cantidad_requerida} -> {src_c.cantidad_requerida}")
                tgt_c.cantidad_requerida = src_c.cantidad_requerida
                updated = True
            if tgt_c.porcentaje_aprobacion != src_c.porcentaje_aprobacion:
                print(f"  [CP F{src_c.fase_id}-S{src_c.seccion}] porcentaje_aprobacion: {tgt_c.porcentaje_aprobacion} -> {src_c.porcentaje_aprobacion}")
                tgt_c.porcentaje_aprobacion = src_c.porcentaje_aprobacion
                updated = True
            if tgt_c.orden_desbloqueo != src_c.orden_desbloqueo:
                tgt_c.orden_desbloqueo = src_c.orden_desbloqueo
                updated = True
            if tgt_c.tipo_feedback != src_c.tipo_feedback:
                tgt_c.tipo_feedback = src_c.tipo_feedback
                updated = True
            if tgt_c.usa_cronometro != src_c.usa_cronometro:
                tgt_c.usa_cronometro = src_c.usa_cronometro
                updated = True
            if tgt_c.tiempo_default_segundos != src_c.tiempo_default_segundos:
                tgt_c.tiempo_default_segundos = src_c.tiempo_default_segundos
                updated = True
            if tgt_c.activo != src_c.activo:
                tgt_c.activo = src_c.activo
                updated = True
                
            if updated and not dry_run:
                tgt_session.add(tgt_c)
        else:
            print(f"  [CP F{src_c.fase_id}-S{src_c.seccion}-{src_c.operacion.value}] [NUEVO] Creando configuración")
            if not dry_run:
                new_c = ConfiguracionProgreso(
                    fase_id=src_c.fase_id,
                    seccion=src_c.seccion,
                    operacion=src_c.operacion,
                    cantidad_requerida=src_c.cantidad_requerida,
                    porcentaje_aprobacion=src_c.porcentaje_aprobacion,
                    orden_desbloqueo=src_c.orden_desbloqueo,
                    tipo_feedback=src_c.tipo_feedback,
                    usa_cronometro=src_c.usa_cronometro,
                    tiempo_default_segundos=src_c.tiempo_default_segundos,
                    activo=src_c.activo
                )
                tgt_session.add(new_c)

async def sync_niveles_teoria(src_session: AsyncSession, tgt_session: AsyncSession, dry_run: bool):
    print("\n--- Sincronizando Niveles de Teoría ---")
    src_levels = (await src_session.execute(select(NivelTeoria))).scalars().all()
    
    for src_l in src_levels:
        # Match by fase_id, modulo_id, nivel_id
        tgt_l = (await tgt_session.execute(select(NivelTeoria).where(and_(
            NivelTeoria.fase_id == src_l.fase_id,
            NivelTeoria.modulo_id == src_l.modulo_id,
            NivelTeoria.nivel_id == src_l.nivel_id
        )))).scalar_one_or_none()
        
        if tgt_l:
            updated = False
            if tgt_l.titulo != src_l.titulo:
                print(f"  [Teoría F{src_l.fase_id}-M{src_l.modulo_id}-L{src_l.nivel_id}] Título: '{tgt_l.titulo}' -> '{src_l.titulo}'")
                tgt_l.titulo = src_l.titulo
                updated = True
            if tgt_l.texto_descubrimiento != src_l.texto_descubrimiento:
                tgt_l.texto_descubrimiento = src_l.texto_descubrimiento
                updated = True
            if tgt_l.diccionario != src_l.diccionario:
                tgt_l.diccionario = src_l.diccionario
                updated = True
            if tgt_l.advertencia != src_l.advertencia:
                tgt_l.advertencia = src_l.advertencia
                updated = True
            if tgt_l.ejemplos != src_l.ejemplos:
                tgt_l.ejemplos = src_l.ejemplos
                updated = True
            if tgt_l.interactivos != src_l.interactivos:
                tgt_l.interactivos = src_l.interactivos
                updated = True
                
            if updated and not dry_run:
                tgt_session.add(tgt_l)
        else:
            print(f"  [Teoría F{src_l.fase_id}-M{src_l.modulo_id}-L{src_l.nivel_id}] [NUEVO] Creando nivel de teoría")
            if not dry_run:
                new_l = NivelTeoria(
                    fase_id=src_l.fase_id,
                    modulo_id=src_l.modulo_id,
                    nivel_id=src_l.nivel_id,
                    titulo=src_l.titulo,
                    texto_descubrimiento=src_l.texto_descubrimiento,
                    diccionario=src_l.diccionario,
                    advertencia=src_l.advertencia,
                    ejemplos=src_l.ejemplos,
                    interactivos=src_l.interactivos
                )
                tgt_session.add(new_l)

async def check_relation_referenced(tgt_session: AsyncSession, table_name: str, column_name: str, record_id: int) -> bool:
    """Checks if a record_id is referenced in the progress/attempts tables."""
    # Check attempts table
    res_intentos = await tgt_session.execute(text(f"SELECT COUNT(*) FROM intentos WHERE {column_name} = :rid"), {"rid": record_id})
    if res_intentos.scalar() > 0:
        return True
    
    # Check pool table (for preguntas only)
    if table_name == "preguntas":
        res_pool = await tgt_session.execute(text("SELECT COUNT(*) FROM pool_asignado_alumno WHERE pregunta_id = :rid"), {"rid": record_id})
        if res_pool.scalar() > 0:
            return True
        res_int_q = await tgt_session.execute(text("SELECT COUNT(*) FROM intento_preguntas WHERE pregunta_id = :rid"), {"rid": record_id})
        if res_int_q.scalar() > 0:
            return True
            
    return False

async def sync_preguntas_y_alternativas(src_session: AsyncSession, tgt_session: AsyncSession, dry_run: bool):
    print("\n--- Sincronizando Preguntas y Alternativas ---")
    
    # Fetch all questions from source and target
    print("Obteniendo preguntas...")
    src_questions = (await src_session.execute(select(Pregunta))).scalars().all()
    tgt_questions = (await tgt_session.execute(select(Pregunta))).scalars().all()
    
    # Group questions by (fase_id, seccion, operacion)
    src_groups = defaultdict(list)
    for q in src_questions:
        src_groups[(q.fase_id, q.seccion, q.operacion)].append(q)
        
    tgt_groups = defaultdict(list)
    for q in tgt_questions:
        tgt_groups[(q.fase_id, q.seccion, q.operacion)].append(q)
        
    # Sort groups in place by ID to guarantee deterministic relative ordering
    for group_key in src_groups:
        src_groups[group_key].sort(key=lambda x: x.id)
    for group_key in tgt_groups:
        tgt_groups[group_key].sort(key=lambda x: x.id)
        
    total_updated = 0
    total_inserted = 0
    total_inactivated = 0
    total_deleted = 0
    
    # Iterate over all source groups
    all_group_keys = set(src_groups.keys()).union(set(tgt_groups.keys()))
    
    for group_key in all_group_keys:
        fase_id, seccion, operacion = group_key
        src_list = src_groups[group_key]
        tgt_list = tgt_groups[group_key]
        
        # Pair them up by index
        min_len = min(len(src_list), len(tgt_list))
        
        for i in range(min_len):
            src_q = src_list[i]
            tgt_q = tgt_list[i]
            
            # Check fields and update tgt_q
            updated = False
            if tgt_q.enunciado != src_q.enunciado:
                updated = True
            if tgt_q.respuesta_correcta != src_q.respuesta_correcta:
                updated = True
            if tgt_q.datos_numericos != src_q.datos_numericos:
                updated = True
            if tgt_q.payload_tokenizado != src_q.payload_tokenizado:
                updated = True
            if tgt_q.explicacion_paso_a_paso != src_q.explicacion_paso_a_paso:
                updated = True
            if tgt_q.requiere_subrayado != src_q.requiere_subrayado:
                updated = True
            if tgt_q.palabras_clave != src_q.palabras_clave:
                updated = True
            if tgt_q.errores_previstos != src_q.errores_previstos:
                updated = True
            if tgt_q.estado != src_q.estado:
                updated = True
                
            if updated:
                total_updated += 1
                if not dry_run:
                    tgt_q.enunciado = src_q.enunciado
                    tgt_q.respuesta_correcta = src_q.respuesta_correcta
                    tgt_q.datos_numericos = src_q.datos_numericos
                    tgt_q.payload_tokenizado = src_q.payload_tokenizado
                    tgt_q.explicacion_paso_a_paso = src_q.explicacion_paso_a_paso
                    tgt_q.requiere_subrayado = src_q.requiere_subrayado
                    tgt_q.palabras_clave = src_q.palabras_clave
                    tgt_q.errores_previstos = src_q.errores_previstos
                    tgt_q.estado = src_q.estado
                    tgt_session.add(tgt_q)
                    
            # Sync alternatives for this question
            src_alts = (await src_session.execute(select(Alternativa).where(Alternativa.pregunta_id == src_q.id).order_by(Alternativa.orden))).scalars().all()
            tgt_alts = (await tgt_session.execute(select(Alternativa).where(Alternativa.pregunta_id == tgt_q.id).order_by(Alternativa.orden))).scalars().all()
            
            min_alt_len = min(len(src_alts), len(tgt_alts))
            for j in range(min_alt_len):
                src_a = src_alts[j]
                tgt_a = tgt_alts[j]
                
                alt_updated = False
                if tgt_a.texto != src_a.texto: alt_updated = True
                if tgt_a.es_correcta != src_a.es_correcta: alt_updated = True
                if tgt_a.tipo_error != src_a.tipo_error: alt_updated = True
                if tgt_a.feedback_error != src_a.feedback_error: alt_updated = True
                
                if alt_updated and not dry_run:
                    tgt_a.texto = src_a.texto
                    tgt_a.es_correcta = src_a.es_correcta
                    tgt_a.tipo_error = src_a.tipo_error
                    tgt_a.feedback_error = src_a.feedback_error
                    tgt_session.add(tgt_a)
                    
            # Extra alternatives in source: Insert
            for j in range(min_alt_len, len(src_alts)):
                src_a = src_alts[j]
                if not dry_run:
                    new_a = Alternativa(
                        pregunta_id=tgt_q.id,
                        texto=src_a.texto,
                        es_correcta=src_a.es_correcta,
                        orden=src_a.orden,
                        tipo_error=src_a.tipo_error,
                        feedback_error=src_a.feedback_error
                    )
                    tgt_session.add(new_a)
                    
            # Extra alternatives in target: Delete if safe
            for j in range(min_alt_len, len(tgt_alts)):
                tgt_a = tgt_alts[j]
                referenced = await check_relation_referenced(tgt_session, "alternativas", "alternativa_id", tgt_a.id)
                if referenced:
                    print(f"    [AVISO] Alternativa ID {tgt_a.id} sobrante tiene progreso asociado. No se puede eliminar.")
                else:
                    if not dry_run:
                        await tgt_session.delete(tgt_a)
                        
        # Extra questions in source: Insert into target
        for i in range(min_len, len(src_list)):
            src_q = src_list[i]
            total_inserted += 1
            if not dry_run:
                new_q = Pregunta(
                    fase_id=src_q.fase_id,
                    seccion=src_q.seccion,
                    sub_nivel=src_q.sub_nivel,
                    estructura_padre_id=src_q.estructura_padre_id,
                    operacion=src_q.operacion,
                    tipo_pregunta=src_q.tipo_pregunta,
                    enunciado=src_q.enunciado,
                    respuesta_correcta=src_q.respuesta_correcta,
                    datos_numericos=src_q.datos_numericos,
                    payload_tokenizado=src_q.payload_tokenizado,
                    explicacion_paso_a_paso=src_q.explicacion_paso_a_paso,
                    requiere_subrayado=src_q.requiere_subrayado,
                    palabras_clave=src_q.palabras_clave,
                    errores_previstos=src_q.errores_previstos,
                    estado=src_q.estado
                )
                tgt_session.add(new_q)
                await tgt_session.flush() # Flush to get new_q.id
                
                # Copy alternatives
                src_alts = (await src_session.execute(select(Alternativa).where(Alternativa.pregunta_id == src_q.id))).scalars().all()
                for src_a in src_alts:
                    new_a = Alternativa(
                        pregunta_id=new_q.id,
                        texto=src_a.texto,
                        es_correcta=src_a.es_correcta,
                        orden=src_a.orden,
                        tipo_error=src_a.tipo_error,
                        feedback_error=src_a.feedback_error
                    )
                    tgt_session.add(new_a)
                    
        # Extra questions in target: Inactivate or delete
        for i in range(min_len, len(tgt_list)):
            tgt_q = tgt_list[i]
            referenced = await check_relation_referenced(tgt_session, "preguntas", "pregunta_id", tgt_q.id)
            if referenced:
                total_inactivated += 1
                print(f"  [PREGUNTA ID {tgt_q.id}] Sobrante en desarrollo con progreso. Marcando como INACTIVO.")
                if not dry_run:
                    tgt_q.estado = StatusEnum.INACTIVO
                    tgt_session.add(tgt_q)
            else:
                total_deleted += 1
                print(f"  [PREGUNTA ID {tgt_q.id}] Sobrante sin progreso. Eliminando...")
                if not dry_run:
                    # Delete alternatives first
                    await tgt_session.execute(delete(Alternativa).where(Alternativa.pregunta_id == tgt_q.id))
                    await tgt_session.delete(tgt_q)
                    
    print(f"\nResumen de Preguntas:")
    print(f"  - Actualizadas: {total_updated}")
    print(f"  - Nuevas insertadas: {total_inserted}")
    print(f"  - Desactivadas (con progreso): {total_inactivated}")
    print(f"  - Eliminadas (sin progreso): {total_deleted}")

async def run_migration(dry_run: bool):
    print("=" * 60)
    print(f"MIGRACIÓN Y REFRACTORIZACIÓN DE PREGUNTAS (DRY RUN = {dry_run})")
    print("=" * 60)
    
    src_engine = create_async_engine(SRC_DATABASE_URL)
    tgt_engine = create_async_engine(TGT_DATABASE_URL)
    
    SrcSession = sessionmaker(src_engine, class_=AsyncSession, expire_on_commit=False)
    TgtSession = sessionmaker(tgt_engine, class_=AsyncSession, expire_on_commit=False)
    
    async with SrcSession() as src_session:
        async with TgtSession() as tgt_session:
            # 1. Sync Fases
            await sync_fases(src_session, tgt_session, dry_run)
            
            # 2. Sync Progress Configurations
            await sync_config_progreso(src_session, tgt_session, dry_run)
            
            # 3. Sync Theory
            await sync_niveles_teoria(src_session, tgt_session, dry_run)
            
            # 4. Sync Preguntas and Alternativas
            await sync_preguntas_y_alternativas(src_session, tgt_session, dry_run)
            
            if not dry_run:
                print("\nGuardando cambios (COMMIT)...")
                await tgt_session.commit()
                print("✅ Cambios aplicados con éxito.")
                
                # Reset Postgres ID sequences to prevent next insert failures
                print("\nRestableciendo secuencias de IDs en destino...")
                await tgt_session.execute(text("SELECT setval(pg_get_serial_sequence('preguntas', 'id'), coalesce(max(id), 1)) FROM preguntas;"))
                await tgt_session.execute(text("SELECT setval(pg_get_serial_sequence('alternativas', 'id'), coalesce(max(id), 1)) FROM alternativas;"))
                await tgt_session.execute(text("SELECT setval(pg_get_serial_sequence('fases', 'id'), coalesce(max(id), 1)) FROM fases;"))
                await tgt_session.execute(text("SELECT setval(pg_get_serial_sequence('configuracion_progreso', 'id'), coalesce(max(id), 1)) FROM configuracion_progreso;"))
                await tgt_session.commit()
                print("✅ Secuencias restablecidas.")
            else:
                print("\n[DRY RUN] No se aplicaron cambios.")
                
    await src_engine.dispose()
    await tgt_engine.dispose()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate questions from local DB to VPS DB.")
    parser.add_argument("--commit", action="store_true", help="Apply changes to the target database.")
    args = parser.parse_args()
    
    dry_run = not args.commit
    asyncio.run(run_migration(dry_run))
