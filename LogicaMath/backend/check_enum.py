import asyncio
from app.db.session import AsyncSessionLocal
from app.models.pregunta import Pregunta
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Pregunta).where(Pregunta.id == 8624))
        p = res.scalar_one()
        print('tipo_pregunta:', p.tipo_pregunta)
        print('value:', p.tipo_pregunta.value)
        print('type:', type(p.tipo_pregunta))

asyncio.run(main())
