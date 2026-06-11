import asyncio
import os
import sys
import re
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.models.sql_models import Pregunta
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def generate_pizza_svg(cortes, sombreados):
    import math
    svg = f'<svg viewBox="-110 -110 220 220" width="150" height="150" xmlns="http://www.w3.org/2000/svg">'
    svg += '<circle cx="0" cy="0" r="100" fill="#fdf6e3" stroke="#d3b58d" stroke-width="4"/>'
    angle_step = 360 / cortes if cortes > 0 else 360
    
    for i in range(cortes):
        start_angle = math.radians(i * angle_step - 90)
        end_angle = math.radians((i + 1) * angle_step - 90)
        
        x1 = 100 * math.cos(start_angle)
        y1 = 100 * math.sin(start_angle)
        x2 = 100 * math.cos(end_angle)
        y2 = 100 * math.sin(end_angle)
        
        large_arc = 1 if angle_step > 180 else 0
        
        fill_color = "#ff6b6b" if i in sombreados else "transparent"
        
        path_d = f"M 0 0 L {x1} {y1} A 100 100 0 {large_arc} 1 {x2} {y2} Z"
        svg += f'<path d="{path_d}" fill="{fill_color}" stroke="#d3b58d" stroke-width="2"/>'
    
    svg += '</svg>'
    return svg

def generate_rectangle_svg(width_cm, height_cm):
    # Base scale: 1 cm = 20px
    w_px = width_cm * 20
    h_px = height_cm * 20
    
    svg = f'<svg viewBox="-10 -10 {w_px + 20} {h_px + 20}" width="200" height="{max(100, int(200*(h_px/w_px)))}" xmlns="http://www.w3.org/2000/svg">'
    # Grid background (1 cm = 20px)
    svg += f'<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">'
    svg += f'<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="1"/>'
    svg += f'</pattern></defs>'
    
    svg += f'<rect width="{w_px}" height="{h_px}" fill="url(#grid)"/>'
    
    # Shaded rectangle
    svg += f'<rect width="{w_px}" height="{h_px}" fill="#4ade80" fill-opacity="0.5" stroke="#16a34a" stroke-width="3"/>'
    
    # Dimensions text
    svg += f'<text x="{w_px/2}" y="-5" font-family="sans-serif" font-size="14" fill="#333" text-anchor="middle">{width_cm} cm</text>'
    svg += f'<text x="-5" y="{h_px/2}" font-family="sans-serif" font-size="14" fill="#333" text-anchor="end" dominant-baseline="middle">{height_cm} cm</text>'
    
    svg += '</svg>'
    return svg

async def fix_missing_images():
    async with AsyncSessionLocal() as session:
        print("Inyectando SVGs en Fase 4 (Fracciones - Pizzas)...")
        query_f4 = select(Pregunta).where(Pregunta.fase_id == 4)
        res_f4 = await session.execute(query_f4)
        preguntas_f4 = res_f4.scalars().all()
        
        modificadas_f4 = 0
        for p in preguntas_f4:
            if isinstance(p.datos_numericos, dict) and p.datos_numericos.get("tipo_visual") == "pizza":
                cortes = p.datos_numericos.get("cortes", 0)
                sombreados = p.datos_numericos.get("sombreados", [])
                
                if cortes > 0 and "<svg" not in p.enunciado:
                    svg = generate_pizza_svg(cortes, sombreados)
                    p.enunciado = p.enunciado + f"<br><div class='flex justify-center my-4'>{svg}</div>"
                    modificadas_f4 += 1
        
        print(f"Modificadas {modificadas_f4} preguntas de Fase 4 con SVGs de Pizza.")

        print("Inyectando SVGs en Fase 5 (Geometría - Rectángulos)...")
        query_f5 = select(Pregunta).where(Pregunta.fase_id == 5)
        res_f5 = await session.execute(query_f5)
        preguntas_f5 = res_f5.scalars().all()
        
        modificadas_f5 = 0
        for p in preguntas_f5:
            # Detectar menciones de URL y medidas
            if "(Considera: url=http://localhost:9100/logicakids/graphics/" in p.enunciado:
                # Extraer "miden X cm y Y cm"
                match = re.search(r'miden (\d+)\s*cm y (\d+)\s*cm', p.enunciado)
                if match and "<svg" not in p.enunciado:
                    w = int(match.group(1))
                    h = int(match.group(2))
                    
                    svg = generate_rectangle_svg(w, h)
                    
                    # Remover el texto "(Considera: url=...)"
                    nuevo_enunciado = re.sub(r'\(Considera: url=http://localhost:9100/logicakids/graphics/[^\)]+\)', '', p.enunciado)
                    nuevo_enunciado = nuevo_enunciado.strip()
                    
                    p.enunciado = nuevo_enunciado + f"<br><div class='flex justify-center my-4'>{svg}</div>"
                    modificadas_f5 += 1
                    
        print(f"Modificadas {modificadas_f5} preguntas de Fase 5 con SVGs de Geometría.")
        
        await session.commit()
        print("✅ Generación de SVGs dinámicos completada exitosamente.")

if __name__ == "__main__":
    asyncio.run(fix_missing_images())
