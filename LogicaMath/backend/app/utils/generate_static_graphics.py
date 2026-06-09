import asyncio
import os
import sys
from PIL import Image, ImageDraw

# Configurar path de Python para poder importar desde app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.utils.graphics_generator import (
    generate_clock_image,
    generate_cartesian_plane_image
)
from app.core.storage import storage_service

async def main():
    print("Iniciando generación de gráficos estáticos para Fases 7 y 8...")
    
    # Asegurar que el backend cargue las settings necesarias
    urls = {}
    
    # 1. Generar e iniciar subida de relojes
    clocks_to_gen = [
        ("clock_8_15", 8, 15),
        ("clock_10_15", 10, 15),
        ("clock_9_00", 9, 0),
        ("clock_8_00", 8, 0),
        ("clock_7_00", 7, 0),
        ("clock_7_40", 7, 40),
        ("clock_8_25", 8, 25),
        ("clock_10_05", 10, 5)
    ]
    
    for name, h, m in clocks_to_gen:
        img_bytes = generate_clock_image(h, m)
        url = await storage_service.upload_question_graphic(img_bytes, f"{name}.png")
        urls[name] = url
        print(f"✅ Reloj {h:02d}:{m:02d} subido a: {url}")
        
    # 2. Generar e iniciar subida de planos cartesianos
    planes_to_gen = [
        ("cartesian_4_5", [{"x": 4, "y": 5, "label": "P"}]),
        ("cartesian_0_3", [{"x": 0, "y": 3, "label": "A"}]),
        ("cartesian_2_3", [{"x": 2, "y": 3, "label": "A"}]),
        ("cartesian_relative", [{"x": 3, "y": 2, "label": "A"}, {"x": 7, "y": 5, "label": "B"}])
    ]
    
    for name, pts in planes_to_gen:
        img_bytes = generate_cartesian_plane_image(pts)
        url = await storage_service.upload_question_graphic(img_bytes, f"{name}.png")
        urls[name] = url
        print(f"✅ Plano Cartesiano {name} subido a: {url}")

    # 3. Actualizar faseMetadata.ts
    metadata_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "components", "fase_generic", "faseMetadata.ts"))
    
    if not os.path.exists(metadata_path):
        print(f"❌ No se encontró faseMetadata.ts en {metadata_path}")
        return
        
    print(f"Actualizando referencias en: {metadata_path}")
    
    with open(metadata_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Reemplazar enunciados de preguntas específicas con sus imágenes
    replacements = {
        "¿Cuál es la posición del punto que está 4 a la derecha y 5 arriba del origen?": 
            f"¿Cuál es la posición del punto P que está 4 a la derecha y 5 arriba del origen?<br/><img src='{urls['cartesian_4_5']}' class='lk-question-graphic' />",
            
        "El punto (0, 3) está sobre cuál eje?": 
            f"El punto A(0, 3) está sobre cuál eje?<br/><img src='{urls['cartesian_0_3']}' class='lk-question-graphic' />",
            
        "Desde (2,3), aplica el vector (+4, +1). ¿A qué punto llegas?": 
            f"Desde el punto A(2,3), aplica el vector de movimiento (+4, +1). ¿A qué punto de destino llegas?<br/><img src='{urls['cartesian_2_3']}' class='lk-question-graphic' />",
            
        "El punto A está en (3,2) y B en (7,5). ¿Cuánto debes moverte en X?": 
            f"El punto A está en (3,2) y B en (7,5). ¿Cuánto debes moverte en la dirección horizontal X para ir de A a B?<br/><img src='{urls['cartesian_relative']}' class='lk-question-graphic' />",
            
        "¿Cuántos minutos tiene 2 horas y media?": 
            f"¿Cuántos minutos tiene 2 horas y media de duración?<br/><img src='{urls['clock_8_25']}' class='lk-question-graphic' />",
            
        "La clase empieza a las 8:15 y dura 45 minutos. ¿A qué hora termina?": 
            f"La clase empieza a la hora marcada en el reloj y dura exactamente 45 minutos. ¿A qué hora termina?<br/><img src='{urls['clock_8_15']}' class='lk-question-graphic' />",
            
        "El bus sale a las 8:00 y llega a las 8:45. ¿Cuánto dura el viaje?": 
            f"El bus escolar sale a la hora indicada en el reloj y llega a su destino a las 8:45. ¿Cuánto dura el viaje en minutos?<br/><img src='{urls['clock_8_00']}' class='lk-question-graphic' />",
            
        "El bus sale cada 20 minutos desde las 7:00. ¿A qué hora sale el tercer bus?": 
            f"El bus sale cada 20 minutos desde la hora inicial marcada en el reloj (7:00). ¿A qué hora sale el tercer bus?<br/><img src='{urls['clock_7_00']}' class='lk-question-graphic' />",
            
        "Salgo a las 10:15 y el viaje dura 1 hora 30 minutos. ¿A qué hora llego?": 
            f"Salgo a la hora indicada en el reloj y el viaje dura 1 hora 30 minutos. ¿A qué hora llego?<br/><img src='{urls['clock_10_15']}' class='lk-question-graphic' />",
            
        "Necesito llegar a las 9:00. El viaje dura 50 minutos. ¿A qué hora debo salir?": 
            f"Necesito llegar a la escuela a la hora exacta marcada en el reloj (9:00). Si el viaje dura 50 minutos, ¿a qué hora debo salir?<br/><img src='{urls['clock_9_00']}' class='lk-question-graphic' />",
            
        "Si las clases empiezan a las 7:30 y duran 255 minutos, ¿a qué hora terminan?": 
            f"Si las clases de la escuela empiezan a las 7:30 (como se ilustra) y duran 255 minutos, ¿a qué hora terminan?<br/><img src='{urls['clock_7_00']}' class='lk-question-graphic' />",
            
        "Salgo a las 8:25 y el viaje dura 1h40min. ¿A qué hora llego?": 
            f"Salgo a la hora indicada en el reloj (8:25) y el viaje dura 1h40min. ¿A qué hora llego?<br/><img src='{urls['clock_8_25']}' class='lk-question-graphic' />",
    }

    modified = False
    for old_text, new_text in replacements.items():
        # Evitar reemplazar si ya se reemplazó previamente (contiene lk-question-graphic)
        if old_text in content and "lk-question-graphic" not in content[content.find(old_text):content.find(old_text)+200]:
            content = content.replace(f"'{old_text}'", f"'{new_text}'")
            content = content.replace(f'"{old_text}"', f'"{new_text}"')
            modified = True
            print(f"✔ Reemplazado: {old_text}")
            
    if modified:
        with open(metadata_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("🎉 faseMetadata.ts actualizado con éxito.")
    else:
        print("⚠ No se realizaron cambios en faseMetadata.ts (posiblemente ya actualizado).")

if __name__ == "__main__":
    asyncio.run(main())
