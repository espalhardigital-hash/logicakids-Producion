import asyncio
import sqlite3
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, and_
from app.models.sql_models import User, Alumno, Fase, ConfiguracionProgreso, ProgresoMaestria, EstadoProgresoEnum, OperacionEnum

# The updated recalcular function we are testing
async def recalcular_y_sincronizar_fase_actual_test(alumno_id: int, db: AsyncSession) -> int:
    result = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result.scalar_one_or_none()
    if not alumno:
        return 1

    result_fases = await db.execute(select(Fase).order_by(Fase.orden.asc()))
    fases = result_fases.scalars().all()

    nueva_fase_id = fases[0].id if fases else 1

    for fase in fases:
        # Exclude seccion 99099 (Desafío Mixto) from blocking the progression
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
            continue

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
        
        fase_completa = all((c.seccion, c.operacion) in aprobados_set for c in configs)

        if not fase_completa:
            nueva_fase_id = fase.id
            break
    else:
        if fases:
            nueva_fase_id = fases[-1].id

    if alumno.fase_actual_id != nueva_fase_id:
        alumno.fase_actual_id = nueva_fase_id
        db.add(alumno)
        await db.commit()
        
    return nueva_fase_id

async def setup_jhon(session: AsyncSession):
    # Check if user Jhon exists, delete if so to make it clean
    result = await session.execute(select(User).where(User.email == "jhon@gmail.com"))
    jhon_user = result.scalar_one_or_none()
    if jhon_user:
        result_alumno = await session.execute(select(Alumno).where(Alumno.user_id == jhon_user.id))
        alumno = result_alumno.scalar_one_or_none()
        if alumno:
            await session.execute(
                ProgresoMaestria.__table__.delete().where(ProgresoMaestria.alumno_id == alumno.id)
            )
            await session.delete(alumno)
        await session.delete(jhon_user)
        await session.commit()

    # Create User
    jhon_user = User(
        id="jhon-uuid-1234",
        username="Jhon",
        email="jhon@gmail.com",
        role="USER",
        status="ACTIVE",
        unlocked_level=0,
        settings={"unlockedLevels": {}}
    )
    session.add(jhon_user)
    await session.flush()

    # Create Alumno linked to User
    alumno = Alumno(
        user_id=jhon_user.id,
        nombre="Jhon",
        fase_actual_id=0  # Fase 0 initially
    )
    session.add(alumno)
    await session.commit()
    print(f"Created Jhon: alumno_id={alumno.id}")
    return alumno.id

async def approve_fase1(session: AsyncSession, alumno_id: int):
    f1_levels = [
        (1, OperacionEnum.SUMA),
        (1, OperacionEnum.RESTA),
        (1, OperacionEnum.MULTIPLICACION),
        (1, OperacionEnum.DIVISION)
    ]
    for sec, op in f1_levels:
        prog = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=1,
            seccion=sec,
            operacion=op,
            estado=EstadoProgresoEnum.APROBADO,
            aciertos_acumulados=15,
            intentos_totales=15,
            porcentaje_actual=90,
            aprobado_por_admin=True
        )
        session.add(prog)
    await session.commit()
    print("Approved all levels of Fase 1")

async def approve_fase2_partial(session: AsyncSession, alumno_id: int):
    # These are the 26 levels of Fase 2 defined in PHASE_MAPS
    f2_levels = [
        # M1
        (101, OperacionEnum.SUMA), (102, OperacionEnum.SUMA), (103, OperacionEnum.SUMA),
        (1011, OperacionEnum.MIXTA), (1012, OperacionEnum.MIXTA), (1013, OperacionEnum.MIXTA),
        # M2
        (201, OperacionEnum.MULTIPLICACION), (202, OperacionEnum.MULTIPLICACION), (203, OperacionEnum.MULTIPLICACION), (204, OperacionEnum.MULTIPLICACION),
        (2011, OperacionEnum.MIXTA), (2012, OperacionEnum.MIXTA), (2013, OperacionEnum.MIXTA),
        # M3
        (301, OperacionEnum.MIXTA), (302, OperacionEnum.MIXTA), (303, OperacionEnum.MIXTA), (304, OperacionEnum.MIXTA),
        (3011, OperacionEnum.MIXTA), (3012, OperacionEnum.MIXTA), (3013, OperacionEnum.MIXTA),
        # M4
        (401, OperacionEnum.MIXTA), (402, OperacionEnum.MIXTA), (403, OperacionEnum.MIXTA),
        (4011, OperacionEnum.MIXTA), (4012, OperacionEnum.MIXTA), (4013, OperacionEnum.MIXTA)
    ]
    for sec, op in f2_levels:
        prog = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=2,
            seccion=sec,
            operacion=op,
            estado=EstadoProgresoEnum.APROBADO,
            aciertos_acumulados=15,
            intentos_totales=15,
            porcentaje_actual=90,
            aprobado_por_admin=True
        )
        session.add(prog)
    await session.commit()
    print("Approved 26 levels of Fase 2 (excluding 99099)")

async def approve_fase3_partial_with_m5(session: AsyncSession, alumno_id: int):
    # Standard 25 levels of Fase 3 + auto-approving M5!
    f3_levels = [
        # M1
        (101, "mixta"), (102, "mixta"), (103, "mixta"),
        (1011, "mixta"), (1012, "mixta"), (1013, "mixta"),
        # M2
        (201, "mixta"), (202, "mixta"), (203, "mixta"), (204, "mixta"),
        (2011, "mixta"), (2012, "mixta"), (2013, "mixta"),
        # M3
        (301, "mixta"), (302, "mixta"), (303, "mixta"),
        (3011, "mixta"), (3012, "mixta"), (3013, "mixta"),
        # M4
        (401, "mixta"), (402, "mixta"), (403, "mixta"),
        (4011, "mixta"), (4012, "mixta"), (4013, "mixta")
    ]
    
    # We simulate the backend bulk override logic auto-approving M5!
    # Let's fetch all active configs for Fase 3 to get M5 configs too
    result_configs = await session.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == 3,
            ConfiguracionProgreso.activo == True
        ))
    )
    configs = result_configs.scalars().all()
    
    # Approve everything except 99099
    for config in configs:
        if config.seccion == 99099:
            continue
        prog = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=3,
            seccion=config.seccion,
            operacion=config.operacion,
            estado=EstadoProgresoEnum.APROBADO,
            aciertos_acumulados=config.cantidad_requerida,
            intentos_totales=config.cantidad_requerida,
            porcentaje_actual=90,
            aprobado_por_admin=True
        )
        session.add(prog)
    await session.commit()
    print("Approved all levels of Fase 3 (including M5 but excluding 99099)")

async def main():
    engine = create_async_engine("sqlite+aiosqlite:///local_verify.db")
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        alumno_id = await setup_jhon(session)
        
        # Test 1: Just created (Fase 0)
        print("\n--- TEST 1: Initial state ---")
        fase_id = await recalcular_y_sincronizar_fase_actual_test(alumno_id, session)
        print(f"Computed Fase Actual ID: {fase_id}")
        
        # Test 2: Approved Fase 1
        print("\n--- TEST 2: Approved Fase 1 ---")
        await approve_fase1(session, alumno_id)
        fase_id = await recalcular_y_sincronizar_fase_actual_test(alumno_id, session)
        print(f"Computed Fase Actual ID: {fase_id}")
        
        # Test 3: Approved Fase 2 (excluding 99099, but 99099 is now ignored by recalcular!)
        print("\n--- TEST 3: Approved Fase 2 (excl 99099) ---")
        await approve_fase2_partial(session, alumno_id)
        fase_id = await recalcular_y_sincronizar_fase_actual_test(alumno_id, session)
        print(f"Computed Fase Actual ID: {fase_id}")
        
        # Test 4: Approved Fase 3 (with M5 and excluding 99099)
        print("\n--- TEST 4: Approved Fase 3 (with M5 & excl 99099) ---")
        await approve_fase3_partial_with_m5(session, alumno_id)
        fase_id = await recalcular_y_sincronizar_fase_actual_test(alumno_id, session)
        print(f"Computed Fase Actual ID: {fase_id}")

if __name__ == "__main__":
    asyncio.run(main())
