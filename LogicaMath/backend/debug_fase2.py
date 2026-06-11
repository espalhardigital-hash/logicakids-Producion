import asyncio
from sqlalchemy import select, and_
from app.db.session import AsyncSessionLocal
from app.models.sql_models import User, Alumno, ProgresoMaestria, ConfiguracionProgreso
from app.fase2.router import get_fase2_dashboard, FASE2_ID

async def debug():
    db = AsyncSessionLocal()
    try:
        # Find user
        email = "test_e2e_1781179778039@logicakids.test"
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user:
            print(f"User {email} not found!")
            return

        res = await db.execute(select(Alumno).where(Alumno.user_id == user.id))
        alumno = res.scalar_one_or_none()
        if not alumno:
            print(f"Alumno for {email} not found!")
            return

        print(f"Found Alumno: {alumno.nombre} (ID: {alumno.id})")

        # Let's run get_fase2_dashboard logic manually to inspect
        result = await db.execute(
            select(ProgresoMaestria).where(and_(
                ProgresoMaestria.alumno_id == alumno.id,
                ProgresoMaestria.fase_id == FASE2_ID,
            ))
        )
        progresos = {p.seccion: p for p in result.scalars().all()}
        print(f"Loaded {len(progresos)} progresos:")
        for sec, p in progresos.items():
            print(f"  Sec {sec}: estado={p.estado}, operacion={p.operacion}, porcentaje={p.porcentaje_actual}")

        dashboard = await get_fase2_dashboard(db, alumno)
        print("\n--- Dashboard Response ---")
        for mod in dashboard.modulos:
            print(f"Mod {mod.modulo_id}: {mod.nombre} - estado={mod.estado}, porcentaje={mod.porcentaje_global}")
            for niv in mod.niveles:
                print(f"  Niv {niv.nivel_id}: estado={niv.estado}, porcentaje={niv.porcentaje}")
            for des in mod.desafios:
                print(f"  Des {des.desafio_id}: estado={des.estado}, porcentaje={des.porcentaje}")

    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(debug())
