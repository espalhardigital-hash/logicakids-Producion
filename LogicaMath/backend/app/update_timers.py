import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.sql_models import PlatformSettings

async def update_timers():
    PEDAGOGY_CONFIG_KEY = "pedagogy_config"
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PlatformSettings).where(PlatformSettings.key == PEDAGOGY_CONFIG_KEY)
        )
        settings = result.scalar_one_or_none()
        
        new_timers = {
            "easy": 10,
            "easy_medium": 12,
            "medium": 18,
            "medium_hard": 22,
            "hard": 25
        }
        
        if settings:
            val = dict(settings.value)
            val["timers"] = new_timers
            settings.value = val
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(settings, "value")
            print("✅ Configuración existente encontrada. Actualizando timers en la base de datos...")
        else:
            payload = {
                "questionsPerPhase": 50,
                "timers": new_timers,
                "useTimer": True,
                "passingScore": 90,
            }
            settings = PlatformSettings(key=PEDAGOGY_CONFIG_KEY, value=payload)
            session.add(settings)
            print("✅ Creando nueva configuración de plataforma con los nuevos timers...")
            
        await session.commit()
        print("\n✨ ¡Cronómetros actualizados con éxito en la base de datos de producción!")
        print(f"   - Nivel 1 (Fácil): 10s")
        print(f"   - Nivel 2 (Fácil-Medio): 12s")
        print(f"   - Nivel 3 (Medio): 18s")
        print(f"   - Nivel 4 (Medio-Difícil): 22s")
        print(f"   - Nivel 5 (Difícil): 25s")

if __name__ == "__main__":
    asyncio.run(update_timers())
