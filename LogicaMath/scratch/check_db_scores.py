import asyncio
import os
import sys
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append('d:/Antigravity/Apps_LogicaKids/LogicaMath/backend')

from app.models.sql_models import User
from app.db.session import DATABASE_URL

async def check_scores():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        for user in users:
            settings = user.settings or {}
            scores = settings.get("scores", [])
            print(f"User: {user.username}, Scores count: {len(scores)}")
            for s in scores:
                print(f"  Score: {s.get('score')}%, Category: {s.get('category')}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_scores())
