import asyncio
import uuid
from sqlalchemy import select
from app.db.session import engine, AsyncSessionLocal
from app.models.sql_models import User
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

        await session.commit()
    
    await engine.dispose()
    print("Proceso completado.")

if __name__ == "__main__":
    asyncio.run(create_users())
