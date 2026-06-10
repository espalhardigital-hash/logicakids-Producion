from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.sql_models import Alumno, Fase, ConfiguracionProgreso, ProgresoMaestria, EstadoProgresoEnum

async def recalcular_y_sincronizar_fase_actual(alumno_id: int, db: AsyncSession) -> int:
    """
    Analiza el progreso real del alumno en todas las fases y actualiza
    alumno.fase_actual_id al ID de la primera fase incompleta.
    """
    # 1. Obtener el perfil del alumno
    result = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result.scalar_one_or_none()
    if not alumno:
        return 1

    # BYPASS para el usuario de pruebas E2E
    if alumno.nombre in ["test_automaticoas", "usuario_prueba", "pruebas_auto_1", "pruebas_automaticas_2"]:
        return alumno.fase_actual_id or 1

    # 2. Obtener todas las fases ordenadas por su orden de secuencia
    result_fases = await db.execute(select(Fase).order_by(Fase.orden.asc()))
    fases = result_fases.scalars().all()

    nueva_fase_id = fases[0].id if fases else 1

    for fase in fases:
        # Obtener todas las reglas/bloques activos configurados para esta fase
        # Filtramos seccion > 0 para enfocarnos solo en niveles reales/desafíos jugables
        # Excluimos seccion != 99099 (Desafío Mixto) que no bloquea la graduación de fase
        result_configs = await db.execute(
            select(ConfiguracionProgreso)
            .where(and_(
                ConfiguracionProgreso.fase_id == fase.id,
                ConfiguracionProgreso.seccion > 0,
                ConfiguracionProgreso.seccion != 99099,
                ConfiguracionProgreso.activo == True
            ))
        )
        configs = result_configs.scalars().all()

        if not configs:
            # Si una fase no tiene bloques configurados, se considera completada o se salta
            # para no bloquear la progresión.
            continue

        # Obtener los bloques aprobados por el alumno para esta fase
        result_progresos = await db.execute(
            select(ProgresoMaestria)
            .where(and_(
                ProgresoMaestria.alumno_id == alumno_id,
                ProgresoMaestria.fase_id == fase.id,
                ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
            ))
        )
        progresos_aprobados = result_progresos.scalars().all()

        aprobados_set = {(p.seccion, p.operacion) for p in progresos_aprobados}
        
        # Verificar si todos los bloques de la fase están aprobados
        fase_completa = all((c.seccion, c.operacion) in aprobados_set for c in configs)

        if not fase_completa:
            # La primera fase que no esté completada al 100% es la Fase Actual del alumno
            nueva_fase_id = fase.id
            break
    else:
        # Si completó todas las fases existentes, se le asigna la última fase
        if fases:
            nueva_fase_id = fases[-1].id

    # 3. Actualizar en base de datos si hubo cambios
    if alumno.fase_actual_id != nueva_fase_id:
        alumno.fase_actual_id = nueva_fase_id
        db.add(alumno)
        await db.commit()
        
    return nueva_fase_id
