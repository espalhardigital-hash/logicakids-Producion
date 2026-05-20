import asyncio
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.sql_models import User, Alumno, Fase, ConfiguracionProgreso, ProgresoMaestria, EstadoProgresoEnum, OperacionEnum

async def approve_sums_for_students():
    emails = ["eloisa@gmail.com", "joaquin@gmail.com"]
    
    async with AsyncSessionLocal() as session:
        print("=" * 60)
        print("   APROBAR NIVELES DE SUMA EN FASE 1 (ELOISA & JOAQUIN)")
        print("=" * 60)
        
        # 1. Get Fase 1
        stmt_fase = select(Fase).where(Fase.orden == 1)
        result_fase = await session.execute(stmt_fase)
        fase_1 = result_fase.scalar_one_or_none()
        
        if not fase_1:
            # Fallback if search by ID
            stmt_fase = select(Fase).where(Fase.id == 1)
            result_fase = await session.execute(stmt_fase)
            fase_1 = result_fase.scalar_one_or_none()
            
        if not fase_1:
            print("❌ Error: No se encontró la Fase 1 en la base de datos.")
            return
            
        print(f"✅ Fase 1 encontrada: {fase_1.nombre} (ID: {fase_1.id})")
        
        # 2. Get ConfiguracionProgreso for SUMA in Fase 1
        stmt_config_suma = select(ConfiguracionProgreso).where(
            and_(
                ConfiguracionProgreso.fase_id == fase_1.id,
                ConfiguracionProgreso.seccion == 1,
                ConfiguracionProgreso.operacion == OperacionEnum.SUMA
            )
        )
        result_config_suma = await session.execute(stmt_config_suma)
        config_suma = result_config_suma.scalar_one_or_none()
        
        qty_suma = config_suma.cantidad_requerida if config_suma else 50
        
        for email in emails:
            print(f"\nProcesando usuario: {email}...")
            
            # Find User & Alumno
            stmt_user = (
                select(User)
                .where(User.email.ilike(email))
                .options(selectinload(User.alumno))
            )
            result_user = await session.execute(stmt_user)
            user = result_user.scalar_one_or_none()
            
            if not user:
                print(f"❌ Usuario con email '{email}' no encontrado.")
                continue
                
            if not user.alumno:
                print(f"❌ Alumno no vinculado al usuario '{email}' no encontrado.")
                continue
                
            alumno = user.alumno
            print(f"✅ Alumno encontrado: {alumno.nombre} (ID: {alumno.id})")
            
            # Update user settings (unlockedLevels["addition"] = 6)
            user_settings = user.settings or {}
            unlocked_levels = user_settings.get("unlockedLevels", {})
            unlocked_levels["addition"] = 6  # 6 means all 5 levels are passed
            user_settings["unlockedLevels"] = unlocked_levels
            user.settings = user_settings
            
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(user, "settings")
            print(f"   - Se actualizó unlockedLevels['addition'] a 6 en settings de usuario.")
            
            # Update Alumno's current phase to Fase 1
            alumno.fase_actual_id = fase_1.id
            print(f"   - Se actualizó fase_actual_id del Alumno a {fase_1.id}.")
            
            # Create/Update SUMA progress record in ProgresoMaestria
            stmt_prog_suma = select(ProgresoMaestria).where(
                and_(
                    ProgresoMaestria.alumno_id == alumno.id,
                    ProgresoMaestria.fase_id == fase_1.id,
                    ProgresoMaestria.seccion == 1,
                    ProgresoMaestria.operacion == OperacionEnum.SUMA
                )
            )
            result_prog_suma = await session.execute(stmt_prog_suma)
            prog_suma = result_prog_suma.scalar_one_or_none()
            
            # 95% of qty_suma (e.g. 95% of 50 is 47.5, so 47 aciertos)
            correct_count = int(qty_suma * 0.95)
            if correct_count < 1:
                correct_count = qty_suma
                
            if prog_suma:
                prog_suma.estado = EstadoProgresoEnum.APROBADO
                prog_suma.aciertos_acumulados = correct_count
                prog_suma.intentos_totales = qty_suma
                prog_suma.porcentaje_actual = 95
                prog_suma.fecha_aprobacion = prog_suma.fecha_aprobacion or datetime.utcnow()
                print(f"   - [Actualizado] ProgresoMaestria SUMA ➔ APROBADO (95%)")
            else:
                new_prog_suma = ProgresoMaestria(
                    alumno_id=alumno.id,
                    fase_id=fase_1.id,
                    seccion=1,
                    operacion=OperacionEnum.SUMA,
                    estado=EstadoProgresoEnum.APROBADO,
                    aciertos_acumulados=correct_count,
                    intentos_totales=qty_suma,
                    porcentaje_actual=95,
                    fecha_inicio=datetime.utcnow(),
                    fecha_aprobacion=datetime.utcnow()
                )
                session.add(new_prog_suma)
                print(f"   - [Creado] ProgresoMaestria SUMA ➔ APROBADO (95%)")
                
            # Unlock RESTA as EN_PROGRESO so they can continue to next block
            stmt_prog_resta = select(ProgresoMaestria).where(
                and_(
                    ProgresoMaestria.alumno_id == alumno.id,
                    ProgresoMaestria.fase_id == fase_1.id,
                    ProgresoMaestria.seccion == 1,
                    ProgresoMaestria.operacion == OperacionEnum.RESTA
                )
            )
            result_prog_resta = await session.execute(stmt_prog_resta)
            prog_resta = result_prog_resta.scalar_one_or_none()
            
            if prog_resta:
                if prog_resta.estado != EstadoProgresoEnum.APROBADO:
                    prog_resta.estado = EstadoProgresoEnum.EN_PROGRESO
                    print(f"   - [Actualizado] ProgresoMaestria RESTA ➔ EN_PROGRESO")
            else:
                new_prog_resta = ProgresoMaestria(
                    alumno_id=alumno.id,
                    fase_id=fase_1.id,
                    seccion=1,
                    operacion=OperacionEnum.RESTA,
                    estado=EstadoProgresoEnum.EN_PROGRESO,
                    aciertos_acumulados=0,
                    intentos_totales=0,
                    porcentaje_actual=0,
                    fecha_inicio=datetime.utcnow()
                )
                session.add(new_prog_resta)
                print(f"   - [Creado] ProgresoMaestria RESTA ➔ EN_PROGRESO")
                
        await session.commit()
        print("\n✨ ¡Proceso completado exitosamente para ambos alumnos!")

if __name__ == "__main__":
    asyncio.run(approve_sums_for_students())
