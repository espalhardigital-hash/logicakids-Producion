import math
import io
import random
from PIL import Image, ImageDraw, ImageFont

def get_font(size: int):
    """Intenta cargar una fuente limpia, si no, usa la por defecto."""
    try:
        # Intenta cargar Arial o DejaVu Sans si existen en Windows/Linux/Docker
        font_names = ["arial.ttf", "DejaVuSans.ttf", "LiberationSans-Regular.ttf"]
        for name in font_names:
            try:
                return ImageFont.truetype(name, size)
            except IOError:
                continue
        return ImageFont.load_default()
    except Exception:
        return ImageFont.load_default()

def draw_antialiased_circle(draw: ImageDraw.Draw, xy, fill=None, outline=None, width=1):
    """Dibuja un círculo suave usando el método de elipse."""
    draw.ellipse(xy, fill=fill, outline=outline, width=width)

def generate_clock_image(hour: int, minute: int) -> bytes:
    """
    Genera la imagen de un reloj analógico con las manecillas apuntando a la hora especificada.
    Usa supersampling (dibujar a 600x600 y reducir a 300x300) para lograr antialiasing impecable.
    """
    size = 600
    img = Image.new("RGBA", (size, size), (30, 41, 59, 0)) # Fondo transparente
    draw = ImageDraw.Draw(img)

    center = size // 2
    radius = int(center * 0.85)

    # 1. Borde y fondo del reloj
    # Fondo oscuro premium
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=8)
    
    # Brillo interno sutil
    draw.ellipse([center - radius + 8, center - radius + 8, center + radius - 8, center + radius - 8], outline=(56, 189, 248, 40), width=4)

    # 2. Marcas de horas (1-12) y ticks de minutos
    font = get_font(32)
    
    # Ticks de minutos
    for m in range(60):
        angle = math.radians(6 * m - 90)
        is_hour = (m % 5 == 0)
        tick_length = 24 if is_hour else 10
        tick_width = 4 if is_hour else 2
        tick_color = (255, 255, 255, 220) if is_hour else (100, 116, 139, 150)
        
        x1 = center + (radius - 12 - tick_length) * math.cos(angle)
        y1 = center + (radius - 12 - tick_length) * math.sin(angle)
        x2 = center + (radius - 12) * math.cos(angle)
        y2 = center + (radius - 12) * math.sin(angle)
        
        draw.line([x1, y1, x2, y2], fill=tick_color, width=tick_width)

    # Números 1 a 12
    for h in range(1, 13):
        angle = math.radians(30 * h - 90)
        # Posicionar los números un poco más adentro de las marcas
        dist = radius - 55
        nx = center + dist * math.cos(angle)
        ny = center + dist * math.sin(angle)
        
        text = str(h)
        # Centrar el texto en Pillow
        try:
            # Versión moderna de Pillow
            bbox = draw.textbbox((0, 0), text, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
        except AttributeError:
            tw, th = draw.textsize(text, font=font)
            
        draw.text((nx - tw // 2, ny - th // 2 - 4), text, fill=(248, 250, 252, 255), font=font)

    # 3. Manecillas del reloj
    # Hora normalizada para la manecilla de la hora (avanza un poco con los minutos)
    hour_angle = math.radians(30 * (hour % 12 + minute / 60.0) - 90)
    minute_angle = math.radians(6 * minute - 90)

    # Manecilla de la Hora: más corta y gruesa, color azul claro
    hour_len = int(radius * 0.52)
    hx = center + hour_len * math.cos(hour_angle)
    hy = center + hour_len * math.sin(hour_angle)
    draw.line([center, center, hx, hy], fill=(56, 189, 248, 255), width=12)

    # Manecilla de los Minutos: más larga y delgada, color naranja
    minute_len = int(radius * 0.76)
    mx = center + minute_len * math.cos(minute_angle)
    my = center + minute_len * math.sin(minute_angle)
    draw.line([center, center, mx, my], fill=(249, 115, 22, 255), width=8)

    # Pin central tapando el eje
    draw.ellipse([center - 12, center - 12, center + 12, center + 12], fill=(255, 255, 255, 255), outline=(15, 23, 42, 255), width=3)
    draw.ellipse([center - 4, center - 4, center + 4, center + 4], fill=(249, 115, 22, 255))

    # Reducir imagen a 300x300 para antialiasing perfecto
    img_resized = img.resize((300, 300), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img_resized.save(output, format="PNG")
    return output.getvalue()

def generate_cartesian_plane_image(points: list) -> bytes:
    """
    Genera un plano cartesiano (X, Y) con cuadrícula, ejes rotulados y puntos etiquetados.
    Puntos provistos como lista de dicts: [{"x": 3, "y": 4, "label": "A"}]
    Rango de visualización estándar: X de -1 a 7, Y de -1 a 7.
    """
    size = 800
    img = Image.new("RGBA", (size, size), (30, 41, 59, 0)) # Fondo transparente
    draw = ImageDraw.Draw(img)

    margin = 80
    grid_area = size - 2 * margin
    
    # Rango de coordenadas de -1 a 7 (9 unidades en total)
    min_val, max_val = -1, 7
    units = max_val - min_val # 8
    
    cell_size = grid_area / units
    
    def to_pixel(x, y):
        # Mapea (x, y) lógicos a (px, py) de imagen
        px = margin + (x - min_val) * cell_size
        py = margin + (max_val - y) * cell_size
        return int(px), int(py)

    # 1. Dibujar cuadrícula de fondo
    grid_color = (71, 85, 105, 100) # Gris oscuro tenue
    for i in range(units + 1):
        val = min_val + i
        # Línea vertical
        x1, y1 = to_pixel(val, min_val)
        x2, y2 = to_pixel(val, max_val)
        draw.line([x1, y1, x2, y2], fill=grid_color, width=2)
        
        # Línea horizontal
        x1_h, y1_h = to_pixel(min_val, val)
        x2_h, y2_h = to_pixel(max_val, val)
        draw.line([x1_h, y1_h, x2_h, y2_h], fill=grid_color, width=2)

    # 2. Dibujar ejes X e Y (estilo resaltado)
    axis_color = (248, 250, 252, 220) # Blanco grisáceo brillante
    
    # Eje Y (en X=0)
    x0, y0_min = to_pixel(0, min_val)
    _, y0_max = to_pixel(0, max_val)
    draw.line([x0, y0_min, x0, y0_max], fill=axis_color, width=5)
    # Flecha Y arriba
    draw.polygon([x0, y0_max - 15, x0 - 10, y0_max, x0 + 10, y0_max], fill=axis_color)
    
    # Eje X (en Y=0)
    x0_min, y0 = to_pixel(min_val, 0)
    x0_max, _ = to_pixel(max_val, 0)
    draw.line([x0_min, y0, x0_max, y0], fill=axis_color, width=5)
    # Flecha X derecha
    draw.polygon([x0_max + 15, y0, x0_max, y0 - 10, x0_max, y0 + 10], fill=axis_color)

    # 3. Etiquetas de los números en los ejes
    font = get_font(22)
    for val in range(min_val, max_val + 1):
        if val == 0:
            # El origen (0,0)
            x, y = to_pixel(0, 0)
            draw.text((x - 20, y + 10), "0", fill=(226, 232, 240, 255), font=font)
            continue
            
        # Etiquetas en eje X
        x, y = to_pixel(val, 0)
        text_x = str(val)
        bbox = draw.textbbox((0, 0), text_x, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, y + 10), text_x, fill=(203, 213, 225, 255), font=font)
        
        # Etiquetas en eje Y
        x, y = to_pixel(0, val)
        text_y = str(val)
        bbox = draw.textbbox((0, 0), text_y, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((x - tw - 12, y - th // 2), text_y, fill=(203, 213, 225, 255), font=font)

    # Rótulo de Ejes
    label_font = get_font(28)
    # Eje X
    ex_x, ex_y = to_pixel(max_val, 0)
    draw.text((ex_x + 25, ex_y - 12), "X", fill=(56, 189, 248, 255), font=label_font)
    # Eje Y
    ey_x, ey_y = to_pixel(0, max_val)
    draw.text((ey_x - 12, ey_y - 35), "Y", fill=(56, 189, 248, 255), font=label_font)

    # 4. Dibujar puntos de datos e interactivos
    point_font = get_font(24)
    for p in points:
        px = p["x"]
        py = p["y"]
        label = p.get("label", "")
        
        cx, cy = to_pixel(px, py)
        
        # Líneas de proyección punteadas (líneas grises discontinuas)
        # Proyección a eje X
        cx_0, cy_0 = to_pixel(px, 0)
        draw.line([cx, cy, cx_0, cy_0], fill=(203, 213, 225, 120), width=2)
        # Proyección a eje Y
        cx_y0, cy_y0 = to_pixel(0, py)
        draw.line([cx, cy, cx_y0, cy_y0], fill=(203, 213, 225, 120), width=2)
        
        # Dibujar punto circular (color naranja llamativo)
        dot_r = 10
        draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=(249, 115, 22, 255), outline=(255, 255, 255, 255), width=2)
        
        # Etiqueta del punto, ej: A(3, 4)
        label_text = f"{label}({px},{py})" if label else f"({px},{py})"
        bbox = draw.textbbox((0, 0), label_text, font=point_font)
        tw = bbox[2] - bbox[0]
        # Dibujar la etiqueta arriba y a la derecha del punto para que no se superponga
        draw.text((cx + 14, cy - 30), label_text, fill=(255, 255, 255, 255), font=point_font)

    # Reducir imagen a 400x400 para antialiasing
    img_resized = img.resize((400, 400), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img_resized.save(output, format="PNG")
    return output.getvalue()

def generate_grid_shape_image(vertices: list, grid_size: tuple = (10, 10), fill_color=(168, 85, 247, 120), outline_color=(168, 85, 247, 255)) -> bytes:
    """
    Dibuja una cuadrícula matemática con un polígono relleno y una leyenda de escala (Pedro II style).
    - vertices: lista de tuplas [(x, y)] que forman el polígono. Coordenadas lógicas de la cuadrícula de 0 a grid_size[0].
    """
    size = 800
    img = Image.new("RGBA", (size, size), (30, 41, 59, 0))
    draw = ImageDraw.Draw(img)

    # Dimensiones de la cuadrícula principal
    left_margin = 60
    top_margin = 60
    grid_w = 520
    grid_h = 520
    
    cols, rows = grid_size
    cell_w = grid_w / cols
    cell_h = grid_h / rows
    
    def to_pixel(gx, gy):
        px = left_margin + gx * cell_w
        py = top_margin + gy * cell_h
        return int(px), int(py)

    # 1. Dibujar líneas de cuadrícula de fondo
    grid_line_color = (255, 255, 255, 35)
    for c in range(cols + 1):
        x1, y1 = to_pixel(c, 0)
        x2, y2 = to_pixel(c, rows)
        draw.line([x1, y1, x2, y2], fill=grid_line_color, width=2)
        
    for r in range(rows + 1):
        x1, y1 = to_pixel(0, r)
        x2, y2 = to_pixel(cols, r)
        draw.line([x1, y1, x2, y2], fill=grid_line_color, width=2)
        
    # Borde de la cuadrícula
    border_color = (148, 163, 184, 180)
    x1, y1 = to_pixel(0, 0)
    x2, y2 = to_pixel(cols, rows)
    draw.rectangle([x1, y1, x2, y2], outline=border_color, width=4)

    # 2. Rellenar y trazar el polígono principal
    if len(vertices) >= 3:
        px_vertices = [to_pixel(vx, vy) for vx, vy in vertices]
        # Relleno semi-transparente
        draw.polygon(px_vertices, fill=fill_color)
        # Contorno grueso
        for idx in range(len(px_vertices)):
            v1 = px_vertices[idx]
            v2 = px_vertices[(idx + 1) % len(px_vertices)]
            draw.line([v1[0], v1[1], v2[0], v2[1]], fill=outline_color, width=6)

    # 3. Dibujar leyenda de escala al lado derecho
    legend_x = 620
    legend_y = 200
    sq_size = 50
    
    # Cuadro de escala relleno como la figura
    draw.rectangle([legend_x, legend_y, legend_x + sq_size, legend_y + sq_size], fill=fill_color, outline=outline_color, width=3)
    
    # Texto descriptivo al lado del cuadro de escala
    font = get_font(24)
    label_text1 = "Área = 1 cm²"
    label_text2 = "Cuadrado escala"
    
    draw.text((legend_x - 10, legend_y + sq_size + 15), label_text1, fill=(248, 250, 252, 255), font=font)
    draw.text((legend_x - 25, legend_y + sq_size + 50), label_text2, fill=(148, 163, 184, 255), font=get_font(20))

    # Reducir imagen a 400x400 para antialiasing
    img_resized = img.resize((400, 400), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img_resized.save(output, format="PNG")
    return output.getvalue()

def generate_isometric_cubes_image(cubes: list) -> bytes:
    """
    Dibuja bloques 3D isométricos apilados (estilo Minecraft).
    - cubes: lista de coordenadas 3D (x, y, z).
      Ej: [(0,0,0), (1,0,0), (0,1,0), (0,0,1)]
    """
    # Imagen más ancha para evitar recortes isométricos
    width, height = 800, 600
    img = Image.new("RGBA", (width, height), (30, 41, 59, 0))
    draw = ImageDraw.Draw(img)

    # Parámetros isométricos
    # Tamaño de la arista del cubo
    block_size = 45
    # Ángulo isométrico de 30 grados
    cos30 = math.cos(math.radians(30))
    sin30 = math.sin(math.radians(30))

    # Dimensiones proyectadas de las caras del cubo
    w_iso = block_size * cos30
    h_iso = block_size * sin30
    
    # Altura del bloque vertical (normalmente igual a block_size)
    block_h = block_size

    # Centro de la pantalla para el punto de origen (0,0,0)
    origin_x = width // 2
    origin_y = height // 2 + 100

    def get_iso_coords(x, y, z):
        # En proyección isométrica:
        # +X se mueve abajo y derecha
        # +Y se mueve abajo e izquierda
        # +Z se mueve hacia arriba directamente
        px = origin_x + (x - y) * w_iso
        py = origin_y + (x + y) * h_iso - z * block_h
        return px, py

    # Algoritmo del pintor: ordenar cubos de atrás hacia adelante
    # Para la vista de cámara habitual, los bloques más alejados son los que tienen
    # menor X y menor Y, y menor Z.
    # Así que se ordena por: z ascendente, luego x ascendente, luego y ascendente.
    sorted_cubes = sorted(cubes, key=lambda c: (c[2], c[0], c[1]))

    for x, y, z in sorted_cubes:
        cx, cy = get_iso_coords(x, y, z)

        # Coordenadas de los vértices de las tres caras visibles de un cubo
        # Cara Superior (Top Face) - Diamante
        top_pts = [
            (cx, cy - h_iso),
            (cx + w_iso, cy),
            (cx, cy + h_iso),
            (cx - w_iso, cy)
        ]
        
        # Cara Izquierda (Left Face) - Paralelogramo izquierdo
        left_pts = [
            (cx - w_iso, cy),
            (cx, cy + h_iso),
            (cx, cy + h_iso + block_h),
            (cx - w_iso, cy + block_h)
        ]
        
        # Cara Derecha (Right Face) - Paralelogramo derecho
        right_pts = [
            (cx, cy + h_iso),
            (cx + w_iso, cy),
            (cx + w_iso, cy + block_h),
            (cx, cy + h_iso + block_h)
        ]

        # Estilo visual de los bloques (Gris/Blanco premium)
        # Sombreado realista de caras según la dirección de la luz (que viene desde arriba-izquierda)
        top_fill = (241, 245, 249, 255)    # Slate 50 (muy brillante)
        right_fill = (148, 163, 184, 255)  # Slate 400 (medio)
        left_fill = (71, 85, 105, 255)     # Slate 600 (oscuro/sombra)
        
        outline_color = (15, 23, 42, 255) # Slate 900 para bordes nítidos
        outline_width = 3

        # Dibujar cara superior
        draw.polygon(top_pts, fill=top_fill)
        # Dibujar cara izquierda
        draw.polygon(left_pts, fill=left_fill)
        # Dibujar cara derecha
        draw.polygon(right_pts, fill=right_fill)

        # Dibujar contornos
        draw.polygon(top_pts, outline=outline_color, width=outline_width)
        draw.polygon(left_pts, outline=outline_color, width=outline_width)
        draw.polygon(right_pts, outline=outline_color, width=outline_width)

    # Redimensionar para reducir sierra de píxeles
    img_resized = img.resize((400, 300), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    img_resized.save(output, format="PNG")
    return output.getvalue()

def generate_thermometer_image(temp: float) -> bytes:
    """
    Dibuja un termómetro vertical clásico con mercurio rojo que marca la temperatura dada.
    Usa supersampling (300x800) y reduce a 150x400.
    """
    width, height = 300, 800
    img = Image.new("RGBA", (width, height), (30, 41, 59, 0))
    draw = ImageDraw.Draw(img)
    
    # Coordenadas físicas
    tube_w = 30
    bulb_r = 55
    center_x = width // 2
    
    bulb_y = height - 120
    tube_top = 100
    tube_bottom = bulb_y - 20
    
    # Dibujar la estructura de vidrio exterior
    # Bulbo exterior
    draw.ellipse([center_x - bulb_r, bulb_y - bulb_r, center_x + bulb_r, bulb_y + bulb_r], fill=(15, 23, 42, 255), outline=(148, 163, 184, 255), width=6)
    # Tubo exterior
    draw.rectangle([center_x - tube_w, tube_top, center_x + tube_w, tube_bottom], fill=(15, 23, 42, 255), outline=(148, 163, 184, 255), width=6)
    # Tapa redondeada del tubo
    draw.ellipse([center_x - tube_w, tube_top - tube_w, center_x + tube_w, tube_top + tube_w], fill=(15, 23, 42, 255), outline=(148, 163, 184, 255), width=6)
    # Borrar la línea de unión del tubo y la tapa redondeada adentro
    draw.rectangle([center_x - tube_w + 3, tube_top + 1, center_x + tube_w - 3, tube_bottom - 1], fill=(15, 23, 42, 255))
    draw.ellipse([center_x - tube_w + 3, tube_top - tube_w + 3, center_x + tube_w - 3, tube_top + tube_w - 3], fill=(15, 23, 42, 255))
    # Borrar la unión del tubo y el bulbo
    draw.rectangle([center_x - tube_w + 6, tube_bottom - 10, center_x + tube_w - 6, bulb_y - 10], fill=(15, 23, 42, 255))

    # Escala de temperaturas: de -20 a 50
    min_temp, max_temp = -20, 50
    temp_range = max_temp - min_temp
    pixel_range = tube_bottom - tube_top - 40
    
    def temp_to_y(t):
        pct = (t - min_temp) / temp_range
        y = tube_bottom - 20 - pct * pixel_range
        return y

    # Dibujar graduaciones y textos
    font = get_font(26)
    for t in range(min_temp, max_temp + 1, 10):
        ty = temp_to_y(t)
        # Línea de graduación
        draw.line([center_x + tube_w, ty, center_x + tube_w + 20, ty], fill=(203, 213, 225, 200), width=3)
        # Texto al lado
        draw.text((center_x + tube_w + 30, ty - 15), f"{t}°C", fill=(248, 250, 252, 255), font=font)

    # Dibujar el líquido rojo (mercurio)
    # Bulbo interior
    in_bulb_r = bulb_r - 8
    draw.ellipse([center_x - in_bulb_r, bulb_y - in_bulb_r, center_x + in_bulb_r, bulb_y + in_bulb_r], fill=(239, 68, 68, 255))
    
    # Nivel de mercurio
    level_y = temp_to_y(temp)
    # Asegurar límites del termómetro
    level_y = max(tube_top + 10, min(tube_bottom + 10, level_y))
    
    in_tube_w = tube_w - 8
    draw.rectangle([center_x - in_tube_w, level_y, center_x + in_tube_w, bulb_y], fill=(239, 68, 68, 255))
    # Brillo reflejo en el bulbo
    draw.ellipse([center_x - 25, bulb_y - 25, center_x - 5, bulb_y - 5], fill=(255, 255, 255, 100))

    # Reducir imagen a 150x400 para antialiasing
    img_resized = img.resize((150, 400), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img_resized.save(output, format="PNG")
    return output.getvalue()
