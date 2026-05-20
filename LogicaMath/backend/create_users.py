import asyncio
import uuid
from sqlalchemy import select
from app.db.session import engine, AsyncSessionLocal
from app.models.sql_models import User, Alumno, Fase
from app.auth import get_password_hash

async def create_users():
    print("=" * 50)
    print("Creando usuario Administrador y de Prueba")
    print("=" * 50)

    async with AsyncSessionLocal() as session:
        # 1. Crear usuario Administrador
        admin_email = "amilcar@gmail.com"
        admin_pass = "Colombia1#_"
        
        result = await session.execute(
            select(User).where(User.email == admin_email)
        )
        admin_user = result.scalar_one_or_none()

        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                username="amilcar_admin",
                email=admin_email,
                password_hash=get_password_hash(admin_pass),
                role="ADMIN",
                status="ACTIVE",
            )
            session.add(admin_user)
            print(f"✅ Administrador creado: {admin_email} / {admin_pass}")
        else:
            # Si ya existe, actualizamos la clave para asegurar que sea la solicitada
            admin_user.password_hash = get_password_hash(admin_pass)
            admin_user.role = "ADMIN"
            print(f"⚠️ Administrador ya existía. Contraseña y rol actualizados: {admin_email}")

        # 2. Crear usuario de Prueba
        test_email = "prueba@gmail.com"
        test_pass = "Prueba123"

        result = await session.execute(
            select(User).where(User.email == test_email)
        )
        test_user = result.scalar_one_or_none()

        if not test_user:
            test_user = User(
                id=str(uuid.uuid4()),
                username="usuario_prueba",
                email=test_email,
                password_hash=get_password_hash(test_pass),
                role="USER",
                status="ACTIVE",
            )
            session.add(test_user)
            print(f"✅ Usuario de prueba creado: {test_email} / {test_pass}")
        else:
            test_user.password_hash = get_password_hash(test_pass)
            print(f"⚠️ Usuario de prueba ya existía. Contraseña actualizada: {test_email}")

        # Guardar cambios preliminares
        await session.flush()

        # Inicializar settings por defecto si están vacías
        for user in [admin_user, test_user]:
            if not user.settings:
                user.settings = {
                    "unlockedLevels": {
                        "addition": 0,
                        "subtraction": 0,
                        "multiplication": 0,
                        "division": 0,
                        "challenge": 0
                    },
                    "scores": []
                }
                from sqlalchemy.orm.attributes import flag_modified
                flag_modified(user, "settings")

        # Buscar la fase inicial (Fase 0 o de orden menor)
        result = await session.execute(select(Fase).where(Fase.orden == 0))
        fase_cero = result.scalar_one_or_none()
        if not fase_cero:
            result = await session.execute(select(Fase).order_by(Fase.orden.asc()).limit(1))
            fase_cero = result.scalar_one_or_none()

        # Asegurar perfil Alumno para Administrador
        result = await session.execute(select(Alumno).where(Alumno.user_id == admin_user.id))
        if not result.scalar_one_or_none():
            alumno_admin = Alumno(
                user_id=admin_user.id,
                nombre=admin_user.username,
                fase_actual_id=fase_cero.id if fase_cero else None
            )
            session.add(alumno_admin)
            print(f"✅ Alumno creado para administrador: {admin_user.username}")

        # Asegurar perfil Alumno para Usuario de Prueba
        result = await session.execute(select(Alumno).where(Alumno.user_id == test_user.id))
        if not result.scalar_one_or_none():
            alumno_test = Alumno(
                user_id=test_user.id,
                nombre=test_user.username,
                fase_actual_id=fase_cero.id if fase_cero else None
            )
            session.add(alumno_test)
            print(f"✅ Alumno creado para usuario prueba: {test_user.username}")

        await session.commit()
    
    await engine.dispose()
    print("Proceso completado.")

if __name__ == "__main__":
    asyncio.run(create_users())
