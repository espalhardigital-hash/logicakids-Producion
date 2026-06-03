import os
import re

base_path = r"D:\Antigravity\Apps_LogicaKids - Desarrollo\LogicaMath\backend\app"
fase2_router = os.path.join(base_path, "fase2", "router.py")

with open(fase2_router, "r", encoding="utf-8") as f:
    content = f.read()

# For Fase 5
content_f5 = content.replace("Fase2", "Fase5").replace("fase2", "fase5").replace("FASE2_ID = 2", "FASE5_ID = 5").replace("FASE2_ID", "FASE5_ID")

modulos_meta_5 = """MODULOS_META = {
    1: {"nombre": "Perímetro y Borde", "descripcion": "Longitudes métricas lineales y conversiones.", "icono": "activity", "color": "#10B981"},
    2: {"nombre": "Área en Malha", "descripcion": "Conservación de la superficie y unidades confinadas.", "icono": "hash", "color": "#8B5CF6"},
    3: {"nombre": "Figuras Compuestas y Simetría", "descripcion": "Descomposición estructural y ejes de simetría.", "icono": "shopping-bag", "color": "#F59E0B"},
    4: {"nombre": "Conversión y Pantallas", "descripcion": "Escalas gráficas, modelado de diagonal y conversión al cuadrado.", "icono": "tool", "color": "#EC4899"},
}"""

niveles_meta_5 = """NIVELES_META = {
    (1, 1): {"nombre": "Conteo directo", "descripcion": "Conteo directo sobre bordes de cuadrículas."},
    (1, 2): {"nombre": "Cálculo analítico", "descripcion": "Perímetros sumando magnitudes de polígonos irregulares."},
    (1, 3): {"nombre": "Conversión", "descripcion": "Conversión de mm, cm, dm, m, km."},
    (2, 1): {"nombre": "Conteo analítico", "descripcion": "Conteo de unidades confinadas en cuadrícula densa."},
    (2, 2): {"nombre": "Fusión de sectores", "descripcion": "Fusión de sectores triangulares (mitades = enteros)."},
    (2, 3): {"nombre": "Estimación", "descripcion": "Estimación analítica de áreas irregulares sobre malla."},
    (3, 1): {"nombre": "Descomposición", "descripcion": "Descomposición estructural de polígonos complejos."},
    (3, 2): {"nombre": "Tangram", "descripcion": "Análisis de conservación del área mediante Tangram."},
    (3, 3): {"nombre": "Cálculo analítico", "descripcion": "Cálculo analítico de áreas sombreadas (Resta geométrica)."},
    (3, 4): {"nombre": "Simetría", "descripcion": "Identificación de Ejes de Simetría formal."},
    (4, 1): {"nombre": "Escala gráfica", "descripcion": "Interpretación de la escala gráfica base."},
    (4, 2): {"nombre": "Modelado de pantallas", "descripcion": "Modelado analítico de la diagonal (pantallas de TV)."},
    (4, 3): {"nombre": "Conversión", "descripcion": "Matriz de conversión de unidades de superficie al cuadrado."},
}"""

content_f5 = re.sub(r"MODULOS_META = \{.*?\n\}", modulos_meta_5, content_f5, flags=re.DOTALL)
content_f5 = re.sub(r"NIVELES_META = \{.*?\n\}", niveles_meta_5, content_f5, flags=re.DOTALL)
# Modificar mapa de niveles
content_f5 = re.sub(r"modulo_niveles_map = \{.*?\}", "modulo_niveles_map = {1: 3, 2: 3, 3: 4, 4: 3}", content_f5)
content_f5 = content_f5.replace("total_niveles_aprobados >= 26", "total_niveles_aprobados >= 13")

with open(os.path.join(base_path, "fase5", "router.py"), "w", encoding="utf-8") as f:
    f.write(content_f5)


# For Fase 6
content_f6 = content.replace("Fase2", "Fase6").replace("fase2", "fase6").replace("FASE2_ID = 2", "FASE6_ID = 6").replace("FASE2_ID", "FASE6_ID")

modulos_meta_6 = """MODULOS_META = {
    1: {"nombre": "Reconocimiento 3D", "descripcion": "Identificación de poliedros y vistas 3D.", "icono": "box", "color": "#10B981"},
    2: {"nombre": "Patrones de Crecimiento", "descripcion": "Análisis de sucesiones espaciales.", "icono": "bar-chart", "color": "#8B5CF6"},
    3: {"nombre": "Cubos Unitarios", "descripcion": "Modelado del concepto de volumen (u³).", "icono": "database", "color": "#F59E0B"},
    4: {"nombre": "Medidas Físicas", "descripcion": "Magnitudes de masa y temperatura.", "icono": "thermometer", "color": "#EC4899"},
}"""

niveles_meta_6 = """NIVELES_META = {
    (1, 1): {"nombre": "Identificación de poliedros", "descripcion": "Vértices, aristas y caras ocultas en formas sólidas."},
    (1, 2): {"nombre": "Detección de bloques", "descripcion": "Detección de bloques ocultos por perspectivas isométricas."},
    (1, 3): {"nombre": "Moldes desplegados", "descripcion": "Asociación de moldes desplegados a figuras cerradas 3D."},
    (2, 1): {"nombre": "Análisis de sucesiones", "descripcion": "Análisis de sucesiones espaciales (Patrones geométricos crecientes)."},
    (2, 2): {"nombre": "Conteo volumétrico", "descripcion": "Conteo volumétrico estratificado (Capa por capa)."},
    (2, 3): {"nombre": "Generalización", "descripcion": "Generalización algebraica de la capa N."},
    (3, 1): {"nombre": "Concepto de volumen", "descripcion": "Modelado del concepto de volumen (u³)."},
    (3, 2): {"nombre": "Prismas rectangulares", "descripcion": "Cálculo analítico formal de prismas rectangulares (Base x Altura)."},
    (3, 3): {"nombre": "Volumen y líquidos", "descripcion": "Relación entre volumen cúbico y líquidos (1 dm³ = 1 L)."},
    (4, 1): {"nombre": "Balanzas y termómetros", "descripcion": "Interpretación analítica de balanzas y termómetros."},
    (4, 2): {"nombre": "Variaciones térmicas", "descripcion": "Variaciones térmicas y comprensión del signo negativo térmico."},
    (4, 3): {"nombre": "La Máquina Kelvin", "descripcion": "La Máquina Kelvin: Sumar 273 grados (conversión sin negativos)."},
}"""

content_f6 = re.sub(r"MODULOS_META = \{.*?\n\}", modulos_meta_6, content_f6, flags=re.DOTALL)
content_f6 = re.sub(r"NIVELES_META = \{.*?\n\}", niveles_meta_6, content_f6, flags=re.DOTALL)
# Modificar mapa de niveles
content_f6 = re.sub(r"modulo_niveles_map = \{.*?\}", "modulo_niveles_map = {1: 3, 2: 3, 3: 3, 4: 3}", content_f6)
content_f6 = content_f6.replace("total_niveles_aprobados >= 26", "total_niveles_aprobados >= 12")

with open(os.path.join(base_path, "fase6", "router.py"), "w", encoding="utf-8") as f:
    f.write(content_f6)

print("Routers generated successfully!")
