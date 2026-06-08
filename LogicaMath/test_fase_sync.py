import asyncio
from sqlalchemy import select, and_
from app.db.session import AsyncSessionLocal
from app.models.sql_models import Alumno, Fase, ConfiguracionProgreso, ProgresoMaestria, EstadoProgresoEnum

async def main():
    async with AsyncSessionLocal() as db:
        # Get Eloisa
        result = await db.execute(select(Alumno).where(Alumno.nombre.ilike('%eloisa%')))
        eloisa = result.scalar_one_or_none()
        if not eloisa:
            print('Eloisa not found')
            return
        
        print(f'Eloisa ID: {eloisa.id}, Fase Actual ID: {eloisa.fase_actual_id}')
        
        # Check Fase 1 configs
        result_configs = await db.execute(
            select(ConfiguracionProgreso)
            .where(and_(
                ConfiguracionProgreso.fase_id == 1,
                ConfiguracionProgreso.seccion > 0,
                ConfiguracionProgreso.seccion != 99099,
                ConfiguracionProgreso.activo == True
            ))
        )
        configs = result_configs.scalars().all()
        print(f'Fase 1 Configs: {len(configs)}')
        for c in configs:
            print(f' - Seccion: {c.seccion}, Operacion: {c.operacion.value}')
            
        # Check Eloisa progress in Fase 1
        result_progresos = await db.execute(
            select(ProgresoMaestria)
            .where(and_(
                ProgresoMaestria.alumno_id == eloisa.id,
                ProgresoMaestria.fase_id == 1,
                ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
            ))
        )
        progresos = result_progresos.scalars().all()
        print(f'Eloisa Approved Progresses in Fase 1: {len(progresos)}')
        aprobados_set = {(p.seccion, p.operacion.value) for p in progresos}
        for p in progresos:
            print(f' - Seccion: {p.seccion}, Operacion: {p.operacion.value}')
            
        # Check which configs are missing
        configs_set = {(c.seccion, c.operacion.value) for c in configs}
        missing = configs_set - aprobados_set
        print(f'Missing Configs: {missing}')

        # Get Joaquin
        result = await db.execute(select(Alumno).where(Alumno.nombre.ilike('%joaquin%')))
        joaquin = result.scalar_one_or_none()
        if not joaquin:
            print('Joaquin not found')
            return
        
        print(f'\\nJoaquin ID: {joaquin.id}, Fase Actual ID: {joaquin.fase_actual_id}')
        
        # Check Joaquin progress in Fase 1
        result_progresos = await db.execute(
            select(ProgresoMaestria)
            .where(and_(
                ProgresoMaestria.alumno_id == joaquin.id,
                ProgresoMaestria.fase_id == 1,
                ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
            ))
        )
        progresos = result_progresos.scalars().all()
        print(f'Joaquin Approved Progresses in Fase 1: {len(progresos)}')
        aprobados_set = {(p.seccion, p.operacion.value) for p in progresos}
        for p in progresos:
            print(f' - Seccion: {p.seccion}, Operacion: {p.operacion.value}')
            
        missing = configs_set - aprobados_set
        print(f'Joaquin Missing Configs: {missing}')

asyncio.run(main())
