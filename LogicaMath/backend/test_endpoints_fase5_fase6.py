import asyncio
import os
import sys
import unittest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import event
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

from app.main import app
from app.db.session import get_db
from app.auth import get_current_student
from app.models.sql_models import Alumno

# Dummy dependency override
async def override_get_current_student():
    return Alumno(id=1, user_id="123", nombre="Test Student")

# The TestClient needs a sync DB session override if it expects one, but get_db yields an AsyncSession.
# Since FastApi TestClient with async db is complex to mock fully in a short script without setting up a real test DB, 
# we'll just check if the routers are registered correctly in the app instance.

class TestAppRoutes(unittest.TestCase):
    def test_routes_exist(self):
        routes = [route.path for route in app.routes]
        
        # Verify Fase 5 routes exist
        self.assertIn("/fase5/dashboard", routes)
        self.assertIn("/fase5/lectura/{modulo_id}/nivel/{nivel_id}", routes)
        
        # Verify Fase 6 routes exist
        self.assertIn("/fase6/dashboard", routes)
        self.assertIn("/fase6/lectura/{modulo_id}/nivel/{nivel_id}", routes)

if __name__ == "__main__":
    unittest.main()
