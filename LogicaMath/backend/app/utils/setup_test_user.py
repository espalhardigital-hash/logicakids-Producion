import asyncio
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.auth import get_password_hash
from app.models.sql_models import User, Alumno

async def run_setup():
    print("Iniciando setup de usuario de prueba automático...")
    async with AsyncSessionLocal() as session:
        user_email = "test_automaticoas@gmail.com"
        result = await session.execute(select(User).where(User.email == user_email))
        user = result.scalars().first()
        
        if not user:
            print(f"Creando usuario {user_email}...")
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                email=user_email,
                username="test_automaticoas",
                password_hash=get_password_hash("test_automaticoas_123"),
                status="ACTIVE",
                role="USER",
                unlocked_level=9,
                settings={"unlockedLevels": {str(i): [1,2,3,4,5,6] for i in range(1, 10)}}
            )
            session.add(user)
            
            # Create Alumno profile
            alumno = Alumno(
                user_id=user_id,
                nombre="test_automaticoas",
                fase_actual_id=9
            )
            session.add(alumno)
            
            await session.commit()
            print("Usuario y Alumno creados.")
        else:
            print(f"El usuario {user_email} ya existe. Actualizando fase...")
            user.unlocked_level = 9
            user.settings = {"unlockedLevels": {str(i): [1,2,3,4,5,6] for i in range(1, 10)}}
            
            # Update Alumno if exists
            result = await session.execute(select(Alumno).where(Alumno.user_id == user.id))
            alumno = result.scalars().first()
            if alumno:
                alumno.fase_actual_id = 9
            else:
                alumno = Alumno(
                    user_id=user.id,
                    nombre="test_automaticoas",
                    fase_actual_id=9
                )
                session.add(alumno)
                
            await session.commit()
            print("Usuario y Alumno actualizados.")
            user.unlocked_level = 9
            user.settings = {"unlockedLevels": {str(i): [1,2,3,4,5,6] for i in range(1, 10)}}
            await session.commit()
            print("Usuario actualizado.")
            
    print("Setup de usuario finalizado.")

if __name__ == "__main__":
    asyncio.run(run_setup())
