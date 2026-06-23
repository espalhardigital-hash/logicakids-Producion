# theory_examples.py
# ─────────────────────────────────────────────────────────────
# Base de ejemplos extendidos y formateados premium para Fase 6.
# Proporciona ejemplos estructurados para cada módulo y nivel de Fase 6 con gráficos SVG y explicaciones para niños.

def obtener_ejemplos_expandidos_fase6(modulo_id: int, nivel_id: int) -> list:
    ejemplos_db = {
        # --- MÓDULO 1: RECONOCIMIENTO 3D ---
        (1, 1): [
            {
                "enunciado": "Contar las caras, aristas y vértices en un cubo regular 3D:<br/>"
                             "<svg width='260' height='260' viewBox='0 0 180 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Cubo isométrico semi-transparente -->"
                             "  <!-- Caras traseras / Estructura interna -->"
                             "  <line x1='90' y1='20' x2='90' y2='60' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                             "  <line x1='90' y1='60' x2='120' y2='75' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                             "  <line x1='60' y1='75' x2='90' y2='60' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                             "  <!-- Cara superior (Tapa) -->"
                             "  <polygon points='90,20 120,35 90,50 60,35' fill='#3B82F6' fill-opacity='0.25' stroke='#3B82F6' stroke-width='2'/>"
                             "  <!-- Cara frontal izquierda -->"
                             "  <polygon points='60,35 90,50 90,90 60,75' fill='#3B82F6' fill-opacity='0.15' stroke='#3B82F6' stroke-width='2'/>"
                             "  <!-- Cara frontal derecha -->"
                             "  <polygon points='90,50 120,35 120,75 90,90' fill='#3B82F6' fill-opacity='0.2' stroke='#3B82F6' stroke-width='2'/>"
                             "  <!-- Vértices marcados (8 en total) -->"
                             "  <circle cx='90' cy='20' r='4' fill='#FDE047'/>"
                             "  <circle cx='120' cy='35' r='4' fill='#FDE047'/>"
                             "  <circle cx='90' cy='50' r='4' fill='#FDE047'/>"
                             "  <circle cx='60' cy='35' r='4' fill='#FDE047'/>"
                             "  <circle cx='90' cy='60' r='4' fill='#FDE047' fill-opacity='0.8'/>"
                             "  <circle cx='120' cy='75' r='4' fill='#FDE047'/>"
                             "  <circle cx='90' cy='90' r='4' fill='#FDE047'/>"
                             "  <circle cx='60' cy='75' r='4' fill='#FDE047'/>"
                             "  <text x='90' y='110' fill='#FFF' font-size='9' text-anchor='middle'>Esquinas amarillas = Vértices</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Las <span class=\"keyword-highlight\">caras</span> son las paredes planas (un cubo tiene 6 caras)."},
                    {"orden": 2, "texto": "Los <span class=\"keyword-highlight\">vértices</span> son las esquinas amarillas (un cubo tiene 8 vértices)."},
                    {"orden": 3, "texto": "Las <span class=\"keyword-highlight\">aristas</span> son los bordes oscuros donde chocan las caras (un cubo tiene 12 aristas)."}
                ]
            },
            {
                "enunciado": "¿Cuántas caras tiene un cubo regular?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 160 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Caras desplegadas tipo cruz -->"
                             "  <rect x='68' y='12' width='24' height='24' fill='#3B82F6' fill-opacity='0.5' stroke='#FFF'/>"
                             "  <rect x='44' y='36' width='24' height='24' fill='#3B82F6' fill-opacity='0.5' stroke='#FFF'/>"
                             "  <rect x='68' y='36' width='24' height='24' fill='#3B82F6' fill-opacity='0.5' stroke='#FFF'/>"
                             "  <rect x='92' y='36' width='24' height='24' fill='#3B82F6' fill-opacity='0.5' stroke='#FFF'/>"
                             "  <rect x='68' y='60' width='24' height='24' fill='#3B82F6' fill-opacity='0.5' stroke='#FFF'/>"
                             "  <rect x='68' y='84' width='24' height='24' fill='#3B82F6' fill-opacity='0.5' stroke='#FFF'/>"
                             "  <text x='80' y='51' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>6 caras</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un cubo es como un dado para jugar juegos de mesa."},
                    {"orden": 2, "texto": "Tiene base (1), tapa (2) y 4 paredes laterales (3, 4, 5, 6)."},
                    {"orden": 3, "texto": "En total tiene: <span class=\"keyword-highlight\">6 caras</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos vértices (esquinas) tiene un cubo?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 180 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Estructura de alambre transparente -->"
                             "  <line x1='90' y1='20' x2='90' y2='60' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                             "  <line x1='90' y1='60' x2='120' y2='75' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                             "  <line x1='60' y1='75' x2='90' y2='60' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                             "  <polygon points='90,20 120,35 90,50 60,35' fill='none' stroke='#FFF' stroke-width='2'/>"
                             "  <polygon points='60,35 90,50 90,90 60,75' fill='none' stroke='#FFF' stroke-width='2'/>"
                             "  <polygon points='90,50 120,35 120,75 90,90' fill='none' stroke='#FFF' stroke-width='2'/>"
                             "  <!-- 8 vértices marcados -->"
                             "  <circle cx='90' cy='20' r='4' fill='#FDE047'/>"
                             "  <circle cx='120' cy='35' r='4' fill='#FDE047'/>"
                             "  <circle cx='90' cy='50' r='4' fill='#FDE047'/>"
                             "  <circle cx='60' cy='35' r='4' fill='#FDE047'/>"
                             "  <circle cx='90' cy='60' r='4' fill='#FDE047'/>"
                             "  <circle cx='120' cy='75' r='4' fill='#FDE047'/>"
                             "  <circle cx='90' cy='90' r='4' fill='#FDE047'/>"
                             "  <circle cx='60' cy='75' r='4' fill='#FDE047'/>"
                             "  <text x='90' y='112' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>8 vértices en total</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Contamos las esquinas de la tapa superior: hay 4."},
                    {"orden": 2, "texto": "Contamos las esquinas de la base inferior: hay otras 4."},
                    {"orden": 3, "texto": "Sumamos todas las esquinas: 4 + 4 = <span class=\"keyword-highlight\">8 vértices</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántas aristas (bordes) tiene un cubo?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 180 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Cara superior (4 aristas rojas) -->"
                             "  <polygon points='90,20 120,35 90,50 60,35' fill='none' stroke='#EF4444' stroke-width='3'/>"
                             "  <!-- Cara inferior frontal (2 aristas rojas visibles) -->"
                             "  <polyline points='60,75 90,90 120,75' fill='none' stroke='#EF4444' stroke-width='3' stroke-linecap='round'/>"
                             "  <!-- Cara inferior trasera (2 aristas rojas ocultas) -->"
                             "  <polyline points='120,75 90,60 60,75' fill='none' stroke='#EF4444' stroke-width='2.5' stroke-dasharray='4,4' stroke-linecap='round'/>"
                             "  <!-- Columnas verticales frontales (3 aristas verdes) -->"
                             "  <line x1='60' y1='35' x2='60' y2='75' stroke='#10B981' stroke-width='3' stroke-linecap='round'/>"
                             "  <line x1='120' y1='35' x2='120' y2='75' stroke='#10B981' stroke-width='3' stroke-linecap='round'/>"
                             "  <line x1='90' y1='50' x2='90' y2='90' stroke='#10B981' stroke-width='3' stroke-linecap='round'/>"
                             "  <!-- Columna vertical trasera (1 arista verde oculta) -->"
                             "  <line x1='90' y1='20' x2='90' y2='60' stroke='#10B981' stroke-width='2.5' stroke-dasharray='4,4' stroke-linecap='round'/>"
                             "  <text x='90' y='112' fill='#FFF' font-size='9' text-anchor='middle'>Rojos: 8 (caras) + Verdes: 4 (columnas) = 12</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Contamos los bordes de arriba (4) y los de abajo (4)."},
                    {"orden": 2, "texto": "Contamos las columnas verticales que unen la base con la tapa: hay otras 4."},
                    {"orden": 3, "texto": "Sumamos todos los bordes: 4 + 4 + 4 = <span class=\"keyword-highlight\">12 aristas</span>."}
                ]
            }
        ],
        (1, 2): [
            {
                "enunciado": "Contamos los bloques de una torre y encontramos los bloques ocultos abajo:<br/>"
                             "<svg width='260' height='260' viewBox='0 0 160 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Columna izquierda (2 de altura) -->"
                             "  <polygon points='55,50 75,40 95,50 75,60' fill='#A855F7' stroke='#5B21B6'/>"
                             "  <polygon points='55,50 75,60 75,80 55,70' fill='#8B5CF6' stroke='#5B21B6'/>"
                             "  <polygon points='75,60 95,50 95,70 75,80' fill='#7C3AED' stroke='#5B21B6'/>"
                             "  <!-- Bloque flotante encima (nivel 3) -->"
                             "  <polygon points='55,20 75,10 95,20 75,30' fill='#EC4899' stroke='#BE185D'/>"
                             "  <polygon points='55,20 75,30 75,50 55,40' fill='#D946EF' stroke='#BE185D'/>"
                             "  <polygon points='75,30 95,20 95,40 75,50' fill='#C084FC' stroke='#BE185D'/>"
                             "  <text x='115' y='30' fill='#EF4444' font-size='10' font-weight='bold'>Nivel 3</text>"
                             "  <text x='115' y='65' fill='#A855F7' font-size='9' font-weight='bold'>Soportes</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Si ves un cubo en el aire en el Nivel 3, significa que no puede flotar mágicamente."},
                    {"orden": 2, "texto": "Necesita <span class=\"keyword-highlight\">bloques ocultos</span> abajo que le sirvan de soporte."},
                    {"orden": 3, "texto": "Para que esté a altura 3, debe haber 2 bloques abajo sosteniéndolo."}
                ]
            },
            {
                "enunciado": "Si ves un bloque a una altura de 3 niveles, ¿cuántos bloques hay en su columna completa?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 160 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Columna vertical de 3 bloques -->"
                             "  <polygon points='80,20 100,10 120,20 100,30' fill='#EC4899' stroke='#BE185D'/>"
                             "  <polygon points='80,20 100,30 100,50 80,40' fill='#D946EF' stroke='#BE185D'/>"
                             "  <polygon points='100,30 120,20 120,50 100,50' fill='#C084FC' stroke='#BE185D'/>"
                             "  <polygon points='80,50 100,60 100,80 80,70' fill='#8B5CF6' stroke='#5B21B6'/>"
                             "  <polygon points='100,60 120,50 120,80 100,80' fill='#7C3AED' stroke='#5B21B6'/>"
                             "  <polygon points='80,80 100,90 100,110 80,100' fill='#3B82F6' stroke='#1E3A8A'/>"
                             "  <polygon points='100,90 120,80 120,110 100,110' fill='#1D4ED8' stroke='#1E3A8A'/>"
                             "  <text x='55' y='60' fill='#FFF' font-size='10' font-weight='bold'>3 bloques</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El nivel superior es el 3."},
                    {"orden": 2, "texto": "Para sostenerlo en esa posición, debe haber bloques en el nivel 1 y el nivel 2."},
                    {"orden": 3, "texto": "La columna completa tiene exactamente: <span class=\"keyword-highlight\">3 bloques</span>."}
                ]
            },
            {
                "enunciado": "En una estructura en forma de cruz, el bloque central está en el nivel 2. ¿Cuántos bloques ocultos hay debajo?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 160 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <!-- Bloque Nivel 2 -->"
                             "  <polygon points='70,40 90,30 110,40 90,50' fill='#EC4899' stroke='#BE185D'/>"
                             "  <polygon points='70,40 90,50 90,70 70,60' fill='#D946EF' stroke='#BE185D'/>"
                             "  <polygon points='90,50 110,40 110,70 90,70' fill='#C084FC' stroke='#BE185D'/>"
                             "  <text x='90' y='95' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>Soporte oculto abajo</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El bloque central que estás viendo está en el segundo piso."},
                    {"orden": 2, "texto": "El primer piso está justo debajo del segundo piso."},
                    {"orden": 3, "texto": "Hay exactamente <span class=\"keyword-highlight\">1 bloque oculto</span> debajo sirviendo de base."}
                ]
            },
            {
                "enunciado": "Si un modelo tiene 5 bloques en total pero solo logras ver 4 en la foto, ¿cuántos están ocultos?<br/>"
                             "<svg width='260' height='160' viewBox='0 0 160 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 totales - 4 visibles = 1 oculto</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Restamos los bloques visibles del número total de bloques."},
                    {"orden": 2, "texto": "Cálculo: 5 bloques en total - 4 bloques visibles = 1."},
                    {"orden": 3, "texto": "Hay exactamente <span class=\"keyword-highlight\">1 bloque oculto</span>."}
                ]
            }
        ],
        (1, 3): [
            {
                "enunciado": "¿Qué molde plano (2D) sirve para armar un cubo 3D cerrado?<br/>"
                             "<svg width='260' height='220' viewBox='0 0 120 100' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <!-- Molde cruz de cubo -->"
                             "  <rect x='10' y='40' width='20' height='20' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='1.5'/>"
                             "  <rect x='30' y='40' width='20' height='20' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='1.5'/>"
                             "  <rect x='50' y='40' width='20' height='20' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='1.5'/>"
                             "  <rect x='70' y='40' width='20' height='20' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='1.5'/>"
                             "  <rect x='30' y='20' width='20' height='20' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='1.5'/>"
                             "  <rect x='30' y='60' width='20' height='20' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='1.5'/>"
                             "  <text x='100' y='55' fill='#FFF' font-size='10' font-weight='bold'>6 caras</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un cubo tiene exactamente 6 caras cuadradas."},
                    {"orden": 2, "texto": "El molde plano (desplegado) debe tener <span class=\"keyword-highlight\">6 cuadrados unidos</span>."},
                    {"orden": 3, "texto": "Al doblar los lados hacia arriba y cerrarlo, se forma el cubo. Si tuviera 5 caras, ¡faltaría una tapa!"}
                ]
            },
            {
                "enunciado": "¿Cuántos cuadrados debe tener un molde para formar un cubo cerrado?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>Debe tener 6 cuadrados</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Cada cuadrado en el molde representa una de las caras del cubo."},
                    {"orden": 2, "texto": "Un cubo tiene 6 caras en total."},
                    {"orden": 3, "texto": "El molde plano debe tener: <span class=\"keyword-highlight\">6 cuadrados</span>."}
                ]
            },
            {
                "enunciado": "Si un molde tiene 5 caras cuadradas, ¿formará un cubo cerrado al armarlo?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>Falta una cara para la tapa</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un cubo cerrado requiere 6 tapas cuadradas."},
                    {"orden": 2, "texto": "Al tener solo 5 caras, el cubo quedará abierto por un lado."},
                    {"orden": 3, "texto": "La respuesta es: <span class=\"keyword-highlight\">no</span>."}
                ]
            },
            {
                "enunciado": "Un molde de cilindro se compone de 2 círculos (las tapas) y un...<br/>"
                             "<svg width='260' height='160' viewBox='0 0 140 85' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <circle cx='70' cy='21' r='12' fill='#10B981' fill-opacity='0.4' stroke='#FFF'/>"
                             "  <rect x='40' y='36' width='60' height='26' fill='#10B981' fill-opacity='0.4' stroke='#FFF'/>"
                             "  <circle cx='70' cy='71' r='12' fill='#10B981' fill-opacity='0.4' stroke='#FFF'/>"
                             "  <text x='70' y='51' fill='#FFF' font-size='9' text-anchor='middle'>Rectángulo</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El cilindro es redondo como una lata de refresco."},
                    {"orden": 2, "texto": "Si desdoblamos la pared curva lateral y la aplanamos sobre la mesa, se estira."},
                    {"orden": 3, "texto": "Se convierte en un: <span class=\"keyword-highlight\">rectángulo</span>."}
                ]
            }
        ],

        # --- MÓDULO 2: PATRONES DE CRECIMIENTO ---
        (2, 1): [
            {
                "enunciado": "Descubre el siguiente paso del patrón espacial (regla: sumamos 2 bloques):<br/>"
                             "<svg width='260' height='100' viewBox='0 0 180 70' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <!-- Etapa 1 (1 bloque) -->"
                             "  <rect x='10' y='45' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <text x='17.5' y='35' fill='#FFF' font-size='8' text-anchor='middle'>E1 (1)</text>"
                             "  <!-- Etapa 2 (3 bloques) -->"
                             "  <rect x='50' y='45' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <rect x='65' y='45' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <rect x='58' y='30' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <text x='62.5' y='20' fill='#FFF' font-size='8' text-anchor='middle'>E2 (3)</text>"
                             "  <!-- Etapa 3 (5 bloques) -->"
                             "  <rect x='110' y='45' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <rect x='125' y='45' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <rect x='140' y='45' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <rect x='118' y='30' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <rect x='133' y='30' width='15' height='15' fill='#F59E0B' stroke='#78350F'/>"
                             "  <text x='132.5' y='18' fill='#FFF' font-size='8' text-anchor='middle'>E3 (5)</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Observamos la sucesión espacial: Etapa 1 = 1 bloque, Etapa 2 = 3 bloques, Etapa 3 = 5 bloques."},
                    {"orden": 2, "texto": "Identificamos que en cada paso sumamos 2 bloques adicionales (1 → 3 → 5)."},
                    {"orden": 3, "texto": "Para la Etapa 4, sumamos 2 a la anterior: 5 + 2 = <span class=\"keyword-highlight\">7 bloques</span>."}
                ]
            },
            {
                "enunciado": "Si el patrón es 1, 3, 5, 7. ¿Cuántos bloques habrá en la etapa 5?<br/>"
                             "<svg width='260' height='80' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 → 3 → 5 → 7 → ¿?</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La serie avanza sumando 2 a cada término anterior."},
                    {"orden": 2, "texto": "El cuarto término es 7."},
                    {"orden": 3, "texto": "El quinto término es: 7 + 2 = <span class=\"keyword-highlight\">9</span>."}
                ]
            },
            {
                "enunciado": "Si en la etapa 1 hay 2 bloques, en la etapa 2 hay 4, y en la etapa 3 hay 6. ¿Cuál es la regla de crecimiento?<br/>"
                             "<svg width='260' height='80' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>2 → 4 → 6 (+2 en cada paso)</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Observamos el crecimiento: de 2 a 4 (aumentó 2), de 4 a 6 (aumentó 2)."},
                    {"orden": 2, "texto": "La regla es sumar 2 bloques en cada nueva etapa."},
                    {"orden": 3, "texto": "Respuesta: <span class=\"keyword-highlight\">suma 2</span>."}
                ]
            },
            {
                "enunciado": "Sigue la serie de patrones: 2, 5, 8. ¿Cuál es el siguiente número?<br/>"
                             "<svg width='260' height='80' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>2 → 5 → 8 → 11 (+3 en cada paso)</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Buscamos la diferencia: de 2 a 5 hay 3, de 5 a 8 hay 3."},
                    {"orden": 2, "texto": "Sumamos 3 al último número de la serie (8): 8 + 3."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">11</span>."}
                ]
            }
        ],
        (1, 4): [
            {
                "enunciado": "Calcula el volumen sumando los bloques de una pirámide capa por capa (estratos):<br/>"
                             "<svg width='260' height='220' viewBox='0 0 180 100' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <!-- Capa inferior: 4 bloques (en cruz isométrica) -->"
                             "  <polygon points='90,50 110,40 130,50 110,60' fill='#059669' stroke='#047857'/>"
                             "  <polygon points='70,60 90,50 110,60 90,70' fill='#059669' stroke='#047857'/>"
                             "  <polygon points='50,50 70,40 90,50 70,60' fill='#059669' stroke='#047857'/>"
                             "  <!-- Capa superior: 1 bloque flotante -->"
                             "  <polygon points='70,30 90,20 110,30 90,40' fill='#34D399' stroke='#047857'/>"
                             "  <polygon points='70,30 90,40 90,50 70,40' fill='#6EE7B7' stroke='#047857'/>"
                             "  <polygon points='90,40 110,30 110,40 90,50' fill='#A7F3D0' stroke='#047857'/>"
                             "  <text x='90' y='92' fill='#FFF' font-size='9' text-anchor='middle'>Arriba: 1, Abajo: 4 = 5 bloques</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "<b>Capa de abajo (Piso 1):</b> Hay 4 bloques sirviendo de base."},
                    {"orden": 2, "texto": "<b>Capa de arriba (Piso 2):</b> Hay 1 bloque en la cima."},
                    {"orden": 3, "texto": "Sumamos las capas: 4 + 1 = <span class=\"keyword-highlight\">5 bloques</span> en total."}
                ]
            },
            {
                "enunciado": "Piso inferior 9, piso medio 4, piso superior 1. ¿Cuál es el total de bloques?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='26' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>9 (P1) + 4 (P2) + 1 (P3)</text>"
                             "  <text x='80' y='46' fill='#34D399' font-size='12' font-weight='bold' text-anchor='middle'>Total = 14 bloques</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los bloques de cada nivel de la estructura."},
                    {"orden": 2, "texto": "Operación: 9 + 4 + 1."},
                    {"orden": 3, "texto": "El total es: <span class=\"keyword-highlight\">14</span>."}
                ]
            },
            {
                "enunciado": "Un edificio de 3 pisos tiene 4 bloques por piso. ¿Cuál es el total?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3 pisos × 4 bloques = 12</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos el número de pisos por los bloques por piso."},
                    {"orden": 2, "texto": "Operación: 4 bloques × 3 pisos = 12."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">12</span>."}
                ]
            },
            {
                "enunciado": "Capa 1 tiene 5 bloques, Capa 2 tiene 3 bloques. ¿Cuántos hay en total?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 + 3 = 8 bloques</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos la cantidad de ambas capas directamente: 5 + 3."},
                    {"orden": 2, "texto": "Operación: 8."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">8</span>."}
                ]
            }
        ],
        (2, 3): [
            {
                "enunciado": "Descubre cuántos bloques habrá en la etapa N usando la fórmula: Regla = 2 × N. Calcula para N = 5:<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #EF4444; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='34' fill='#3B82F6' fill-opacity='0.2' stroke='#3B82F6' stroke-width='2' rx='6'/>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>N = 5  →  2 × 5 = 10</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La fórmula nos da la regla para cualquier etapa 'N'."},
                    {"orden": 2, "texto": "Reemplazamos la letra 'N' por la etapa que queremos calcular (5)."},
                    {"orden": 3, "texto": "Hacemos la operación: 2 × 5 = <span class=\"keyword-highlight\">10 bloques</span>."}
                ]
            },
            {
                "enunciado": "Regla: N × 3. ¿Cuántos bloques en la etapa N = 4?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #EF4444; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>N = 4  →  4 × 3 = 12</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Reemplazamos 'N' por 4 en la fórmula."},
                    {"orden": 2, "texto": "Multiplicamos: 4 × 3 = 12."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">12</span>."}
                ]
            },
            {
                "enunciado": "Regla: N × N. ¿Cuántos bloques en la etapa N = 5?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #EF4444; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>N = 5  →  5 × 5 = 25</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Reemplazamos 'N' por 5. La operación es multiplicar el número por sí mismo."},
                    {"orden": 2, "texto": "Multiplicamos: 5 × 5 = 25."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">25</span>."}
                ]
            },
            {
                "enunciado": "Regla: N + 4. ¿Cuántos bloques en la etapa N = 10?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 180 100' style='margin:10px auto; display:block; background:#111827; border:2px solid #EF4444; border-radius:12px;'>"
                             "  <text x='90' y='55' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>N = 10  →  10 + 4 = 14</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Reemplazamos 'N' por 10 en la fórmula."},
                    {"orden": 2, "texto": "Operación: 10 + 4 = 14."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">14</span>."}
                ]
            }
        ],

        # --- MÓDULO 3: CUBOS UNITARIOS ---
        (3, 1): [
            {
                "enunciado": "Calcula el volumen contando los cubitos unitarios de 1x1x1 (u³) de esta figura:<br/>"
                             "<svg width='260' height='220' viewBox='0 0 180 100' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <!-- Fila de 3 cubos isométricos -->"
                             "  <polygon points='40,50 60,40 80,50 60,60' fill='#F59E0B' stroke='#D97706'/>"
                             "  <polygon points='40,50 60,60 60,80 40,70' fill='#D97706' stroke='#B45309'/>"
                             "  <polygon points='60,60 80,50 80,70 60,80' fill='#B45309' stroke='#B45309'/>"
                             "  <polygon points='70,50 90,40 110,50 90,60' fill='#F59E0B' stroke='#D97706'/>"
                             "  <polygon points='70,50 90,60 90,80 70,70' fill='#D97706' stroke='#B45309'/>"
                             "  <polygon points='90,60 110,50 110,70 90,80' fill='#B45309' stroke='#B45309'/>"
                             "  <polygon points='100,50 120,40 140,50 120,60' fill='#F59E0B' stroke='#D97706'/>"
                             "  <polygon points='100,50 120,60 120,80 100,70' fill='#D97706' stroke='#B45309'/>"
                             "  <polygon points='120,60 140,50 140,70 120,80' fill='#B45309' stroke='#B45309'/>"
                             "  <text x='90' y='94' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>3 cubos unitarios = 3 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Cada cubito unitario representa 1 unidad cúbica (1 u³)."},
                    {"orden": 2, "texto": "Contamos cuántos cubos individuales hay alineados en la fila: 1, 2, y 3."},
                    {"orden": 3, "texto": "El volumen de la figura es de: <span class=\"keyword-highlight\">3 u³</span>."}
                ]
            },
            {
                "enunciado": "Si apilo 4 cubos en el suelo y luego pongo otros 4 cubos encima, ¿cuál es el volumen total?<br/>"
                             "<svg width='260' height='220' viewBox='0 0 180 100' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <!-- 4 abajo, 4 arriba -->"
                             "  <polygon points='70,40 90,30 110,40 90,50' fill='#EC4899' stroke='#FFF'/>"
                             "  <polygon points='70,40 90,50 90,70 70,60' fill='#D946EF' stroke='#FFF'/>"
                             "  <polygon points='90,50 110,40 110,70 90,70' fill='#C084FC' stroke='#FFF'/>"
                             "  <text x='90' y='90' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>4 base + 4 arriba = 8 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los cubos del primer piso y del segundo piso."},
                    {"orden": 2, "texto": "Operación: 4 + 4 = 8."},
                    {"orden": 3, "texto": "Volumen total: <span class=\"keyword-highlight\">8 u³</span>."}
                ]
            },
            {
                "enunciado": "Tengo una línea de 5 cubos, y la repito al lado 2 veces. ¿Cuál es el volumen total?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 cubos × 2 filas = 10 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos los cubos de una fila por el número de filas: 5 × 2."},
                    {"orden": 2, "texto": "Operación: 10."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">10 u³</span>."}
                ]
            },
            {
                "enunciado": "Tres columnas verticales y cada una tiene 3 cubos. ¿Cuál es el volumen total?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3 columnas × 3 cubos = 9 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos la altura de las columnas por la cantidad de columnas: 3 × 3."},
                    {"orden": 2, "texto": "Operación: 9."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">9 u³</span>."}
                ]
            }
        ],
        (3, 2): [
            {
                "enunciado": "Calcula el volumen de un prisma usando la fórmula: Volumen = Largo × Ancho × Alto:<br/>"
                             "<svg width='280' height='200' viewBox='0 0 160 100' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <!-- Prisma Rectangular 3D -->"
                             "  <polygon points='40,30 90,20 120,35 70,45' fill='#EC4899' fill-opacity='0.3' stroke='#DB2777' stroke-width='2'/>"
                             "  <polygon points='40,30 70,45 70,85 40,70' fill='#D946EF' fill-opacity='0.3' stroke='#DB2777' stroke-width='2'/>"
                             "  <polygon points='70,45 120,35 120,75 70,85' fill='#C084FC' fill-opacity='0.3' stroke='#DB2777' stroke-width='2'/>"
                             "  <text x='55' y='65' fill='#FFF' font-size='9' font-weight='bold'>Largo = 2</text>"
                             "  <text x='102' y='65' fill='#FFF' font-size='9' font-weight='bold'>Ancho = 3</text>"
                             "  <text x='80' y='25' fill='#FFF' font-size='9' font-weight='bold'>Alto = 4</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos el largo por el ancho para hallar el área de la base: 2 × 3 = 6."},
                    {"orden": 2, "texto": "Multiplicamos ese resultado por la altura del prisma: 6 × 4."},
                    {"orden": 3, "texto": "Resultado del volumen: 2 × 3 × 4 = <span class=\"keyword-highlight\">24 unidades cúbicas</span>."}
                ]
            },
            {
                "enunciado": "Una caja tiene largo 5, ancho 2, y alto 2. ¿Cuál es su volumen?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 (L) × 2 (A) × 2 (H) = 20 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos las tres dimensiones en orden: Largo × Ancho × Alto."},
                    {"orden": 2, "texto": "Operación: 5 × 2 × 2 = 20."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20 u³</span>."}
                ]
            },
            {
                "enunciado": "Un cubo perfecto tiene 3 de lado. ¿Cuál es su volumen?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3 × 3 × 3 = 27 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "En un cubo, el largo, the ancho y el alto son iguales (3)."},
                    {"orden": 2, "texto": "Multiplicamos el lado por sí mismo tres veces: 3 × 3 × 3."},
                    {"orden": 3, "texto": "Operación: 3 × 3 = 9; 9 × 3 = 27. Volumen: <span class=\"keyword-highlight\">27 u³</span>."}
                ]
            },
            {
                "enunciado": "Una habitación rectangular mide 4 de largo, 4 de ancho, y 3 de alto. ¿Cuál es su volumen?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>4 × 4 × 3 = 48 u³</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos las tres medidas: 4 × 4 × 3."},
                    {"orden": 2, "texto": "Operación: 16 × 3 = 48."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">48</span>."}
                ]
            }
        ],
        (3, 3): [
            {
                "enunciado": "¿Cuántos litros caben en un recipiente que mide 5 decímetros cúbicos (dm³)?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #06B6D4; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='24' fill='#06B6D4' rx='6'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 dm³ = 1 Litro (L)</text>"
                             "  <text x='80' y='48' fill='#6B7280' font-size='10' font-weight='bold' text-anchor='middle'>La equivalencia es 1 a 1</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un decímetro cúbico (dm³) tiene exactamente la misma capacidad que 1 Litro de agua."},
                    {"orden": 2, "texto": "Como la relación es de 1 a 1, no necesitas hacer multiplicaciones difíciles."},
                    {"orden": 3, "texto": "Respuesta: En 5 dm³ caben exactamente <span class=\"keyword-highlight\">5 Litros</span>."}
                ]
            },
            {
                "enunciado": "Un recipiente tiene 10 dm³. ¿Cuántos Litros de agua contiene?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #06B6D4; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>10 dm³ = 10 Litros</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La equivalencia nos dice que 1 dm³ = 1 Litro."},
                    {"orden": 2, "texto": "Por tanto, 10 dm³ equivalen a 10 Litros."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">10</span>."}
                ]
            },
            {
                "enunciado": "Una botella de agua tiene un volumen interno de 500 cm³. ¿Cuántos mL tiene?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #06B6D4; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>500 cm³ = 500 mL</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sabemos que 1 centímetro cúbico (cm³) equivale exactamente a 1 mililitro (mL)."},
                    {"orden": 2, "texto": "La relación es directa: 500 cm³ = 500 mL."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">500 mL</span>."}
                ]
            },
            {
                "enunciado": "Un tanque gigante tiene un volumen de 1 metro cúbico (m³). ¿Cuántos Litros de agua caben?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #06B6D4; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 m³ = 1000 dm³ = 1000 L</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un metro cúbico es muy grande. En él caben exactamente 1000 decímetros cúbicos."},
                    {"orden": 2, "texto": "Como 1 dm³ = 1 Litro, entonces 1 m³ = 1000 Litros."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">1000 Litros</span>."}
                ]
            }
        ],

        # --- MÓDULO 4: MEDIDAS FÍSICAS ---
        (4, 1): [
            {
                "enunciado": "¿Cuántos gramos (g) hay en un peso de 2 kilogramos (kg)?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='24' fill='#F59E0B' rx='6'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 kg = 1000 gramos</text>"
                             "  <text x='80' y='48' fill='#6B7280' font-size='9' font-weight='bold' text-anchor='middle'>Multiplicamos por 1000</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un kilogramo es igual a 1000 gramos. ¡Son mil granitos de azúcar!"},
                    {"orden": 2, "texto": "Para pasar de kg a gramos, multiplicamos el peso por 1000."},
                    {"orden": 3, "texto": "Operación: 2 kg × 1000 = <span class=\"keyword-highlight\">2000 gramos</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos gramos hay en 3 kg?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3 kg × 1000 = 3000 gramos</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos los kilogramos por 1000."},
                    {"orden": 2, "texto": "Operación: 3 × 1000 = 3000."},
                    {"orden": 3, "texto": "El resultado es: <span class=\"keyword-highlight\">3000 gramos</span>."}
                ]
            },
            {
                "enunciado": "Medio kilo (0.5 kg) equivale a cuántos gramos:<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1000 g ÷ 2 = 500 gramos</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Si un kilo completo tiene 1000 gramos, medio kilo es la mitad de 1000."},
                    {"orden": 2, "texto": "Dividimos: 1000 ÷ 2 = 500."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">500 gramos</span>."}
                ]
            },
            {
                "enunciado": "Si un termómetro de agua sube de 10°C a 25°C, ¿cuántos grados aumentó?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='35' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>25°C - 10°C = 15°C de aumento</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Para saber el aumento, restamos la temperatura inicial de la final."},
                    {"orden": 2, "texto": "Operación: 25 - 10 = 15."},
                    {"orden": 3, "texto": "La temperatura aumentó: <span class=\"keyword-highlight\">15 grados</span>."}
                ]
            }
        ],
        (4, 2): [
            {
                "enunciado": "Si la temperatura inicial es de 2°C y baja 5°C, ¿a qué temperatura queda?<br/>"
                             "<svg width='280' height='80' viewBox='0 0 180 60' style='margin:10px auto; display:block; background:#111827; border:1px solid #374151; border-radius:12px;'>"
                             "  <line x1='10' y1='30' x2='170' y2='30' stroke='#9CA3AF' stroke-width='2.5'/>"
                             "  <circle cx='110' cy='30' r='5' fill='#3B82F6'/><text x='110' y='20' fill='#3B82F6' font-size='9' font-weight='bold' text-anchor='middle'>2°C</text>"
                             "  <circle cx='50' cy='30' r='5' fill='#EF4444'/><text x='50' y='20' fill='#EF4444' font-size='9' font-weight='bold' text-anchor='middle'>-3°C</text>"
                             "  <path d='M105,35 Q77.5,45 55,35' fill='none' stroke='#EF4444' stroke-width='1.5' marker-end='url(#arrow)' stroke-dasharray='3'/>"
                             "  <text x='80' y='52' fill='#EF4444' font-size='8' text-anchor='middle'>Baja 5</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Imagina una escala. Empezamos en el número positivo 2."},
                    {"orden": 2, "texto": "Retrocedemos 5 pasos hacia la izquierda pasando por el cero: 2 → 1 → 0 → -1 → -2 → -3."},
                    {"orden": 3, "texto": "Operación: 2 - 5 = <span class=\"keyword-highlight\">-3°C</span> (¡tres bajo cero!)."}
                ]
            },
            {
                "enunciado": "Temperatura inicial -4°C. Sube 10°C. ¿Cuál es la nueva temperatura?<br/>"
                             "<svg width='280' height='80' viewBox='0 0 180 60' style='margin:10px auto; display:block; background:#111827; border-radius:12px; border:2px solid #374151;'>"
                             "  <line x1='10' y1='30' x2='170' y2='30' stroke='#9CA3AF' stroke-width='2.5'/>"
                             "  <circle cx='50' cy='30' r='5' fill='#EF4444'/><text x='50' y='20' fill='#EF4444' font-size='9' font-weight='bold' text-anchor='middle'>-4°C</text>"
                             "  <circle cx='130' cy='30' r='5' fill='#10B981'/><text x='130' y='20' fill='#10B981' font-size='9' font-weight='bold' text-anchor='middle'>6°C</text>"
                             "  <text x='90' y='52' fill='#10B981' font-size='8' text-anchor='middle'>Sube 10</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Estamos bajo cero en el número negativo -4."},
                    {"orden": 2, "texto": "Sumamos 10 a la temperatura: -4 + 10."},
                    {"orden": 3, "texto": "Operación: 10 - 4 = 6. Resultado: <span class=\"keyword-highlight\">6°C</span>."}
                ]
            },
            {
                "enunciado": "Estaba a 10°C, y ahora marca -5°C. ¿Cuántos grados bajó la temperatura?<br/>"
                             "<svg width='280' height='80' viewBox='0 0 180 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #374151; border-radius:12px;'>"
                             "  <line x1='10' y1='30' x2='170' y2='30' stroke='#9CA3AF' stroke-width='2.5'/>"
                             "  <circle cx='140' cy='30' r='5' fill='#3B82F6'/><text x='140' y='20' fill='#3B82F6' font-size='9' font-weight='bold' text-anchor='middle'>10°C</text>"
                             "  <circle cx='50' cy='30' r='5' fill='#EF4444'/><text x='50' y='20' fill='#EF4444' font-size='9' font-weight='bold' text-anchor='middle'>-5°C</text>"
                             "  <text x='95' y='52' fill='#EF4444' font-size='9' text-anchor='middle'>Bajó 15 grados en total</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos la distancia desde 10 hasta el cero: 10 grados."},
                    {"orden": 2, "texto": "Calculamos la distancia desde el cero hasta el -5: otros 5 grados."},
                    {"orden": 3, "texto": "Sumamos las distancias: 10 + 5 = <span class=\"keyword-highlight\">15 grados</span>."}
                ]
            },
            {
                "enunciado": "Si congelamos un vaso que estaba a 5°C y baja 7°C, ¿a qué temperatura queda?<br/>"
                             "<svg width='280' height='80' viewBox='0 0 180 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #374151; border-radius:12px;'>"
                             "  <line x1='10' y1='30' x2='170' y2='30' stroke='#9CA3AF' stroke-width='2.5'/>"
                             "  <circle cx='110' cy='30' r='5' fill='#3B82F6'/><text x='110' y='20' fill='#3B82F6' font-size='9' font-weight='bold' text-anchor='middle'>5°C</text>"
                             "  <circle cx='50' cy='30' r='5' fill='#EF4444'/><text x='50' y='20' fill='#EF4444' font-size='9' font-weight='bold' text-anchor='middle'>-2°C</text>"
                             "  <text x='80' y='52' fill='#EF4444' font-size='8' text-anchor='middle'>Restamos 7</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Restamos a la temperatura de 5°C la disminución de 7°C."},
                    {"orden": 2, "texto": "Operación: 5 - 7 = -2."},
                    {"orden": 3, "texto": "-2°C."}
                ]
            }
        ],
        (4, 3): [
            {
                "enunciado": "¿Cómo convertimos 10 grados Celsius (°C) a escala Kelvin (K)?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <rect x='10' y='5' width='140' height='24' fill='#8B5CF6' rx='6'/>"
                             "  <text x='80' y='21' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>K = Celsius + 273</text>"
                             "  <text x='80' y='44' fill='#6B7280' font-size='9' font-weight='bold' text-anchor='middle'>10°C + 273 = 283 K</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La escala Kelvin mide el frío absoluto de las moléculas en el universo."},
                    {"orden": 2, "texto": "Para convertir de Celsius a Kelvin, sumamos la constante <span class=\"keyword-highlight\">273</span>."},
                    {"orden": 3, "texto": "Operación: 10°C + 273 = <span class=\"keyword-highlight\">283 K</span>."}
                ]
            },
            {
                "enunciado": "La temperatura de congelación del agua es 0°C. ¿Cuánto es en Kelvin?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>0°C + 273 = 273 K</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos la constante a la temperatura en grados Celsius: 0 + 273."},
                    {"orden": 2, "texto": "Operación: 273."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">273 K</span>."}
                ]
            },
            {
                "enunciado": "La temperatura de ebullición del agua es 100°C. ¿Cuánto es en Kelvin?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>100°C + 273 = 373 K</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos la constante a los grados Celsius: 100 + 273."},
                    {"orden": 2, "texto": "Operación: 373."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">373 K</span>."}
                ]
            },
            {
                "enunciado": "Si un gas tiene una temperatura absoluta de 300 K, ¿cuántos grados Celsius son?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <text x='80' y='30' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>300 K - 273 = 27°C</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Para convertir al revés (de Kelvin a Celsius), restamos la constante 273."},
                    {"orden": 2, "texto": "Operación: 300 K - 273 = 27."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">27°C</span>."}
                ]
            }
        ]
    }
    return ejemplos_db.get((modulo_id, nivel_id), [])
