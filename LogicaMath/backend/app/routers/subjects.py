from fastapi import APIRouter
from typing import List

router = APIRouter(tags=["subjects"])

@router.get("/subjects")
async def get_subjects():
    return [
        {
            "id": "1",
            "name": "Matemáticas",
            "slug": "math",
            "description": "Desafía tu mente con números y operaciones.",
            "icon": "calculator",
            "is_active": True,
            "active": True,
            "created_at": ""
        },
        {
            "id": "2",
            "name": "Lógica",
            "slug": "logic",
            "description": "Entrena tu cerebro con patrones y acertijos.",
            "icon": "brain",
            "is_active": True,
            "active": True,
            "created_at": ""
        }
    ]
