"""
Fase 2: Desarrollo Numérico y Razonamiento
============================================
Paquete modular que contiene todos los componentes exclusivos de la Fase 2:
  - models.py     → Modelos ORM (IntentoPregunta, IntentoPaso)
  - schemas.py    → Schemas Pydantic de request/response
  - generators.py → Generadores aleatorios controlados (Módulos 1, 2, 3)
  - router.py     → Endpoints FastAPI exclusivos de Fase 2
  - seed.py       → Datos semilla (configuraciones de progreso, pools de preguntas)
"""

from . import router  # noqa: F401 — expuesto para main.py

