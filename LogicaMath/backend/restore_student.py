import asyncio
import sys
import argparse
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.sql_models import User, Alumno, Fase, ConfiguracionProgreso, ProgresoMaestria, EstadoProgresoEnum

async def restore_student_progress(search_query: str, target_fase_id_or_orden: int, approve_all_previous: bool = True):
    async with AsyncSessionLocal() as session:
        # 1. Search for the student
        print(f"Buscando alumno con el término: '{search_query}'...")
        
        stmt = (
            select(Alumno)
            .join(User, Alumno.user_id == User.id)
            .where(
                (Alumno.nombre.ilike(f"%{search_query}%")) |
                (User.email.ilike(f"%{search_query}%")) |
                (User.username.ilike(f"%{search_query}%"))
            )
            .options(selectinload(Alumno.user))
        )
        result = await session.execute(stmt)
        alumnos = result.scalars().all()
        
        if not alumnos:
            print(f"❌ No se encontró ningún alumno que coincida con '{search_query}'.")
            return False
        
        if len(alumnos) > 1:
            print("⚠️ Se encontraron múltiples alumnos:")
            for idx, al in enumerate(alumnos):
                print(f"  [{idx}] ID: {al.id} | Nombre: {al.nombre} | Email: {al.user.email} | Fase actual: {al.fase_actual_id}")
            print("Por favor, proporciona un término de búsqueda más específico.")
            return False
            
        alumno = alumnos[0]
        user = alumno.user
        print(f"✅ Alumno encontrado: {alumno.nombre} (ID: {alumno.id}, Email: {user.email})")
        print(f"   Fase actual en DB: {alumno.fase_actual_id}")
        
        # 2. Get target Fase
        stmt = select(Fase).order_by(Fase.orden)
        result = await session.execute(stmt)
        fases = result.scalars().all()
        
        target_fase = None
        for f in fases:
            if f.id == target_fase_id_or_orden or f.orden == target_fase_id_or_orden:
                target_fase = f
                break
                
        if not target_fase:
            print(f"❌ No se encontró la fase con ID u Orden = {target_fase_id_or_orden}.")
            print("Fases disponibles en el sistema:")
            for f in fases:
                print(f"  - ID: {f.id} | Orden: {f.orden} | Nombre: {f.nombre}")
            return False
            
        print(f"🎯 Fase objetivo seleccionada: {target_fase.nombre} (ID: {target_fase.id}, Orden: {target_fase.orden})")
        
        # 3. Process preceding phases
        if approve_all_previous:
            print("\n🔄 Aprobando bloques de fases anteriores...")
            preceding_fase_ids = [f.id for f in fases if f.orden < target_fase.orden]
            
            if preceding_fase_ids:
                # Get all configurations for preceding phases
                stmt_configs = select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id.in_(preceding_fase_ids))
                result_configs = await session.execute(stmt_configs)
                configs = result_configs.scalars().all()
                
                print(f"   Se encontraron {len(configs)} configuraciones de progreso para las fases anteriores.")
                
                for config in configs:
                    # Check if progress record exists
                    stmt_prog = select(ProgresoMaestria).where(
                        and_(
                            ProgresoMaestria.alumno_id == alumno.id,
                            ProgresoMaestria.fase_id == config.fase_id,
                            ProgresoMaestria.seccion == config.seccion,
                            ProgresoMaestria.operacion == config.operacion
                        )
                    )
                    result_prog = await session.execute(stmt_prog)
                    prog = result_prog.scalar_one_or_none()
                    
                    if prog:
                        # Update
                        prog.estado = EstadoProgresoEnum.APROBADO
                        prog.aciertos_acumulados = max(prog.aciertos_acumulados, config.cantidad_requerida)
                        prog.intentos_totales = max(prog.intentos_totales, config.cantidad_requerida)
                        prog.porcentaje_actual = 100
                        prog.fecha_aprobacion = prog.fecha_aprobacion or datetime.utcnow()
                        print(f"   [Actualizado] Fase {config.fase_id} - Secc {config.seccion} - Op {config.operacion.value} ➔ APROBADO")
                    else:
                        # Insert
                        new_prog = ProgresoMaestria(
                            alumno_id=alumno.id,
                            fase_id=config.fase_id,
                            seccion=config.seccion,
                            operacion=config.operacion,
                            estado=EstadoProgresoEnum.APROBADO,
                            aciertos_acumulados=config.cantidad_requerida,
                            intentos_totales=config.cantidad_requerida,
                            porcentaje_actual=100,
                            fecha_inicio=datetime.utcnow(),
                            fecha_aprobacion=datetime.utcnow()
                        )
                        session.add(new_prog)
                        print(f"   [Creado] Fase {config.fase_id} - Secc {config.seccion} - Op {config.operacion.value} ➔ APROBADO")
            else:
                print("   No hay fases anteriores que aprobar.")
                
        # 4. Set current target phase
        print(f"\n🔄 Configurando la fase actual del alumno a la Fase ID: {target_fase.id}...")
        alumno.fase_actual_id = target_fase.id
        
        # 5. Initialize the first block of the target phase as EN_PROGRESO so the student can start playing
        stmt_target_configs = select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == target_fase.id).order_by(ConfiguracionProgreso.orden_desbloqueo)
        result_target_configs = await session.execute(stmt_target_configs)
        target_configs = result_target_configs.scalars().all()
        
        if target_configs:
            print(f"   Inicializando bloques para la fase objetivo (Fase {target_fase.id})...")
            for idx, config in enumerate(target_configs):
                stmt_prog = select(ProgresoMaestria).where(
                    and_(
                        ProgresoMaestria.alumno_id == alumno.id,
                        ProgresoMaestria.fase_id == config.fase_id,
                        ProgresoMaestria.seccion == config.seccion,
                        ProgresoMaestria.operacion == config.operacion
                    )
                )
                result_prog = await session.execute(stmt_prog)
                prog = result_prog.scalar_one_or_none()
                
                target_state = EstadoProgresoEnum.EN_PROGRESO if idx == 0 else EstadoProgresoEnum.BLOQUEADO
                
                if prog:
                    if prog.estado != EstadoProgresoEnum.APROBADO:
                        prog.estado = target_state
                        print(f"   [Actualizado] Fase objetivo {config.fase_id} - Secc {config.seccion} - Op {config.operacion.value} ➔ {target_state.value}")
                else:
                    new_prog = ProgresoMaestria(
                        alumno_id=alumno.id,
                        fase_id=config.fase_id,
                        seccion=config.seccion,
                        operacion=config.operacion,
                        estado=target_state,
                        aciertos_acumulados=0,
                        intentos_totales=0,
                        porcentaje_actual=0,
                        fecha_inicio=datetime.utcnow()
                    )
                    session.add(new_prog)
                    print(f"   [Creado] Fase objetivo {config.fase_id} - Secc {config.seccion} - Op {config.operacion.value} ➔ {target_state.value}")
        else:
            print(f"   ⚠️ Advertencia: No se encontraron configuraciones de progreso (ConfiguracionProgreso) para la fase objetivo {target_fase.id}.")
            print("   Si el alumno ingresa y no ve preguntas, asegúrate de configurar los bloques para esta fase en el Panel de Administración.")
            
        # 6. Synchronize User Level settings
        print("\n🔄 Sincronizando niveles desbloqueados en la configuración del usuario...")
        user_settings = user.settings or {}
        unlocked_levels = user_settings.get("unlockedLevels", {})
        
        target_level = min(5, max(1, target_fase.orden // 2 + 1))
        
        categories = ["addition", "subtraction", "multiplication", "division", "challenge"]
        for cat in categories:
            current_val = unlocked_levels.get(cat, 1)
            unlocked_levels[cat] = max(current_val, target_level)
            
        user_settings["unlockedLevels"] = unlocked_levels
        user.settings = user_settings
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(user, "settings")
        
        await session.commit()
        print("\n✨ ¡Proceso completado exitosamente! El progreso del alumno ha sido restaurado.")
        return True

async def main_interactive():
    async with AsyncSessionLocal() as session:
        print("=" * 60)
        print("   RESTAURAR PROGRESO DE ALUMNO - LOGICAKIDS PRO")
        print("=" * 60)
        
        stmt = (
            select(Alumno)
            .join(User, Alumno.user_id == User.id)
            .options(selectinload(Alumno.user))
        )
        result = await session.execute(stmt)
        alumnos = result.scalars().all()
        
        if not alumnos:
            print("❌ No hay alumnos registrados en la base de datos.")
            return
            
        print("Alumnos registrados:")
        for idx, al in enumerate(alumnos):
            print(f"  [{idx}] Nombre: {al.nombre} | Email: {al.user.email} | Fase actual: {al.fase_actual_id}")
            
        try:
            choice = input("\nSeleccione el número del alumno a restaurar: ")
            choice_idx = int(choice)
            if choice_idx < 0 or choice_idx >= len(alumnos):
                print("❌ Selección inválida.")
                return
        except ValueError:
            print("❌ Entrada inválida. Debe ser un número.")
            return
            
        alumno = alumnos[choice_idx]
        
        stmt_fases = select(Fase).order_by(Fase.orden)
        result_fases = await session.execute(stmt_fases)
        fases = result_fases.scalars().all()
        
        print("\nFases disponibles:")
        for f in fases:
            print(f"  [{f.id}] Orden: {f.orden} | Nombre: {f.nombre}")
            
        try:
            fase_choice = input("\nSeleccione el ID de la fase objetivo para el alumno: ")
            fase_id = int(fase_choice)
            if not any(f.id == fase_id for f in fases):
                print("❌ ID de fase inválido.")
                return
        except ValueError:
            print("❌ Entrada inválida. Debe ser un número.")
            return
            
        confirm = input(f"\n¿Está seguro de que desea mover a {alumno.nombre} a la fase {fase_id} y aprobar todos los niveles anteriores? (s/n): ")
        if confirm.lower() not in ['s', 'si', 'y', 'yes']:
            print("❌ Operación cancelada.")
            return
            
        await restore_student_progress(alumno.nombre, fase_id, approve_all_previous=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Restaurar progreso de un alumno en LogicaKids.")
    parser.add_argument("--query", type=str, help="Nombre, email o usuario del alumno a buscar.")
    parser.add_argument("--fase", type=int, help="ID u Orden de la fase objetivo a la que se desea mover al alumno.")
    parser.add_argument("--no-previous", action="store_true", help="No marcar como aprobados los niveles de fases anteriores.")
    
    args = parser.parse_args()
    
    if args.query is not None and args.fase is not None:
        asyncio.run(restore_student_progress(args.query, args.fase, approve_all_previous=not args.no_previous))
    else:
        asyncio.run(main_interactive())
