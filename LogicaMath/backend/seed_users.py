import asyncio
import uuid
import os
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, engine
from app.auth import get_password_hash, create_user
from app.models.sql_models import User, Alumno, Fase

async def seed_users():
    print("🚀 Iniciando creación de usuarios...")
    
    async with AsyncSessionLocal() as db:
        # 1. Crear Administrador
        admin_email = "amilcae@gmail.com"
        admin_pass = "12345"
        
        result = await db.execute(select(User).where(User.email == admin_email))
        existing_admin = result.scalar_one_or_none()
        
        if not existing_admin:
            print(f"➕ Creando administrador: {admin_email}")
            admin_user = User(
                id=str(uuid.uuid4()),
                username="Admin",
                email=admin_email,
                password_hash=get_password_hash(admin_pass),
                role="ADMIN",
                status="ACTIVE",
                unlocked_level=5
            )
            db.add(admin_user)
            await db.commit()
            print("✅ Administrador creado con éxito.")
        else:
            print(f"ℹ️ El administrador {admin_email} ya existe.")

        # 2. Crear Usuario de Prueba (Estudiante)
        user_email = "prueba@gmail.com"
        user_pass = "12345"
        
        result = await db.execute(select(User).where(User.email == user_email))
        existing_user = result.scalar_one_or_none()
        
        if not existing_user:
            print(f"➕ Creando usuario de prueba: {user_email}")
            # Usamos create_user de auth.py para que también cree el perfil de Alumno y Fase 0
            try:
                await create_user(db, "Prueba", user_email, user_pass)
                print("✅ Usuario de prueba y perfil de alumno creados con éxito.")
            except Exception as e:
                print(f"❌ Error al crear usuario de prueba: {e}")
        else:
            print(f"ℹ️ El usuario {user_email} ya existe.")

    await engine.dispose()
    print("\n✨ Proceso finalizado.")

if __name__ == "__main__":
    asyncio.run(seed_users())
