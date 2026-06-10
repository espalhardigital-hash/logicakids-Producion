import asyncio
from app.db.session import AsyncSessionLocal
from app.models.sql_models import User, Alumno, ProgresoMaestria
from app.auth import get_password_hash
from sqlalchemy.future import select

from app.core.storage import storage_service
import os

async def seed_users():
    async with AsyncSessionLocal() as session:
        # --- 0. Subir avatar de tigresa ---
        avatar_url = "/static/avatars/tigresa.png"
        tigresa_path = "/app/tigresa.png"
        if os.path.exists(tigresa_path):
            with open(tigresa_path, "rb") as f:
                content = f.read()
            print("Subiendo tigresa.png a MinIO...")
            avatar_url = await storage_service.upload_avatar(content, "tigresa.png")
            print(f"Avatar subido con éxito: {avatar_url}")
        else:
            print(f"No se encontró tigresa.png en {tigresa_path}")

        # --- 1. Crear el Admin ---
        admin_email = "amilcar@gmail.com"
        result = await session.execute(select(User).filter(User.email == admin_email))
        admin = result.scalars().first()
        if not admin:
            import uuid
            print("Creando usuario ADMIN: amilcar@gmail.com")
            admin = User(
                id=uuid.uuid4().hex,
                username="amilcar",
                email=admin_email,
                password_hash=get_password_hash("Colombia1#_"),
                role="ADMIN",
                status="ACTIVE"
            )
            session.add(admin)
            await session.commit()
            
        # --- 2. Crear a Eloisa ---
        eloisa_email = "eloisa@gmail.com"
        result = await session.execute(select(User).filter(User.email == eloisa_email))
        eloisa_user = result.scalars().first()
        if not eloisa_user:
            import uuid
            print("Creando usuario ESTUDIANTE: eloisa@gmail.com")
            eloisa_user = User(
                id=uuid.uuid4().hex,
                username="Eloisa",
                email=eloisa_email,
                password_hash=get_password_hash("eloisa"),
                role="USER",
                status="ACTIVE",
                avatar=avatar_url
            )
            session.add(eloisa_user)
            await session.commit()
            
            # Crear el perfil de alumno
            alumno_eloisa = Alumno(
                user_id=eloisa_user.id,
                nombre="Eloisa",
                edad=8,
                fase_actual_id=2 # Empieza en fase 2 según lo solicitado
            )
            session.add(alumno_eloisa)
            await session.commit()
            
            # Insertar progreso maestria para Eloisa
            progresos_eloisa = [
                # Fase 1: aprobada
                ProgresoMaestria(alumno_id=alumno_eloisa.id, fase_id=1, seccion=0, operacion='mixta', porcentaje_actual=100, estado='COMPLETADO'),
                # Fase 2, mod 1: aprobado
                ProgresoMaestria(alumno_id=alumno_eloisa.id, fase_id=2, seccion=1, operacion='suma', porcentaje_actual=100, estado='COMPLETADO'),
                # Fase 2, mod 2: aprobado
                ProgresoMaestria(alumno_id=alumno_eloisa.id, fase_id=2, seccion=2, operacion='multiplicacion', porcentaje_actual=100, estado='COMPLETADO'),
                # Fase 2, mod 3: aprobado
                ProgresoMaestria(alumno_id=alumno_eloisa.id, fase_id=2, seccion=3, operacion='mixta', porcentaje_actual=100, estado='COMPLETADO'),
                # Fase 2, mod 4: desbloqueado
                ProgresoMaestria(alumno_id=alumno_eloisa.id, fase_id=2, seccion=4, operacion='mixta', porcentaje_actual=0, estado='DESBLOQUEADO')
            ]
            session.add_all(progresos_eloisa)
            await session.commit()

        # --- 3. Crear a Joaquin ---
        joaquin_email = "joaquin@gmail.com"
        result = await session.execute(select(User).filter(User.email == joaquin_email))
        joaquin_user = result.scalars().first()
        if not joaquin_user:
            import uuid
            print("Creando usuario ESTUDIANTE: joaquin@gmail.com")
            joaquin_user = User(
                id=uuid.uuid4().hex,
                username="Joaquin",
                email=joaquin_email,
                password_hash=get_password_hash("joaquin"),
                role="USER",
                status="ACTIVE"
            )
            session.add(joaquin_user)
            await session.commit()
            
            # Crear el perfil de alumno
            alumno_joaquin = Alumno(
                user_id=joaquin_user.id,
                nombre="Joaquin",
                edad=9,
                fase_actual_id=2
            )
            session.add(alumno_joaquin)
            await session.commit()
            
            # Insertar progreso maestria para Joaquin
            progresos_joaquin = [
                # Fase 1: aprobada
                ProgresoMaestria(alumno_id=alumno_joaquin.id, fase_id=1, seccion=0, operacion='mixta', porcentaje_actual=100, estado='COMPLETADO'),
                # Fase 2, mod 1: aprobado
                ProgresoMaestria(alumno_id=alumno_joaquin.id, fase_id=2, seccion=1, operacion='suma', porcentaje_actual=100, estado='COMPLETADO'),
                # Fase 2, mod 2: desbloqueado
                ProgresoMaestria(alumno_id=alumno_joaquin.id, fase_id=2, seccion=2, operacion='multiplicacion', porcentaje_actual=0, estado='DESBLOQUEADO')
            ]
            session.add_all(progresos_joaquin)
            await session.commit()
            
        print("Usuarios de prueba creados exitosamente con sus progresos asignados.")

if __name__ == "__main__":
    asyncio.run(seed_users())
