# theory_examples.py
# ─────────────────────────────────────────────────────────────
# Base de ejemplos extendidos y formateados premium para Fase 5.
# Proporciona ejemplos estructurados para cada módulo y nivel de Fase 5 con gráficos SVG y explicaciones para niños.

def obtener_ejemplos_expandidos_fase5(modulo_id: int, nivel_id: int) -> list:
    ejemplos_db = {
        # --- MÓDULO 1: PERÍMETRO Y BORDE ---
        (1, 1): [
            {
                "enunciado": "Calcula el perímetro de esta figura contando cada segmento del contorno en la cuadrícula:<br/>"
                             "<svg width='260' height='260' viewBox='-15 -10 150 135' style='margin:10px auto; display:block; background:#111827; border:2px solid #A855F7; border-radius:12px;'>"
                             "  <!-- Grilla -->"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <!-- Polígono -->"
                             "  <rect x='40' y='40' width='40' height='40' fill='#A855F7' fill-opacity='0.2' stroke='#A855F7' stroke-width='3.5'/>"
                             "  <text x='60' y='65' fill='#A855F7' font-size='14' font-weight='bold' text-anchor='middle'>2 x 2</text>"
                             "  <!-- Flechas e indicaciones -->"
                             "  <text x='60' y='32' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>2 unidades</text>"
                             "  <text x='95' y='64' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle' transform='rotate(90 95 64)'>2 unidades</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El perímetro es el <span class=\"keyword-highlight\">borde exterior</span> de la figura. Imagina a una hormiguita caminando alrededor."},
                    {"orden": 2, "texto": "Contamos los segmentos: Arriba = 2, Derecha = 2, Abajo = 2, Izquierda = 2."},
                    {"orden": 3, "texto": "Sumamos los bordes: 2 + 2 + 2 + 2 = <span class=\"keyword-highlight\">8 unidades</span>."}
                ]
            },
            {
                "enunciado": "Un rectángulo tiene lados de 3 y 4 unidades. ¿Cuál es su perímetro?<br/>"
                             "<svg width='260' height='260' viewBox='-15 -15 150 145' style='margin:10px auto; display:block; background:#111827; border:2px solid #A855F7; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <rect x='30' y='20' width='60' height='80' fill='#A855F7' fill-opacity='0.2' stroke='#A855F7' stroke-width='3.5'/>"
                             "  <text x='60' y='14' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>3 unidades</text>"
                             "  <text x='60' y='122' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>3 unidades</text>"
                             "  <text x='18' y='64' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>4 u</text>"
                             "  <text x='102' y='64' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>4 u</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un rectángulo tiene 4 lados. Lados paralelos son del mismo tamaño."},
                    {"orden": 2, "texto": "Los lados miden: 3 de arriba, 4 de la derecha, 3 de abajo, y 4 de la izquierda."},
                    {"orden": 3, "texto": "Sumamos todo el contorno: 3 + 4 + 3 + 4 = <span class=\"keyword-highlight\">14 unidades</span>."}
                ]
            },
            {
                "enunciado": "Un cuadrado tiene un lado de 5 unidades. ¿Cuál es su perímetro?<br/>"
                             "<svg width='280' height='260' viewBox='-25 -10 170 140' style='margin:10px auto; display:block; background:#111827; border:2px solid #A855F7; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <rect x='10' y='10' width='100' height='100' fill='#A855F7' fill-opacity='0.2' stroke='#A855F7' stroke-width='3.5'/>"
                             "  <text x='60' y='65' fill='#FFF' font-size='14' font-weight='bold' text-anchor='middle'>Lado = 5</text>"
                             "  <text x='60' y='125' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>Todos los lados miden 5 unidades</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un cuadrado tiene 4 lados idénticos."},
                    {"orden": 2, "texto": "Sumamos el lado de 5 unidades 4 veces o multiplicamos: 5 × 4."},
                    {"orden": 3, "texto": "El perímetro es: 5 + 5 + 5 + 5 = <span class=\"keyword-highlight\">20 unidades</span>."}
                ]
            },
            {
                "enunciado": "El perímetro de un triángulo con lados de 6 unidades cada uno es:<br/>"
                             "<svg width='260' height='260' viewBox='-15 -10 150 135' style='margin:10px auto; display:block; background:#111827; border:2px solid #A855F7; border-radius:12px;'>"
                             "  <polygon points='60,20 100,100 20,100' fill='#A855F7' fill-opacity='0.2' stroke='#A855F7' stroke-width='3.5'/>"
                             "  <text x='60' y='122' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>6 u</text>"
                             "  <text x='30' y='65' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>6 u</text>"
                             "  <text x='90' y='65' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>6 u</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Este es un triángulo equilátero porque todos sus lados miden igual."},
                    {"orden": 2, "texto": "Tiene 3 lados, así que sumamos: 6 + 6 + 6 o hacemos 6 × 3."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">18 unidades</span>."}
                ]
            }
        ],
        (1, 2): [
            {
                "enunciado": "Calcula el perímetro de esta figura irregular sumando las longitudes de sus lados:<br/>"
                             "<svg width='280' height='200' viewBox='-15 -10 170 115' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <polygon points='20,20 120,20 120,80 80,80 80,50 20,50' fill='#F59E0B' fill-opacity='0.2' stroke='#F59E0B' stroke-width='3'/>"
                             "  <text x='70' y='14' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>10 cm</text>"
                             "  <text x='126' y='55' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>6 cm</text>"
                             "  <text x='100' y='98' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>4 cm</text>"
                             "  <text x='70' y='65' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>3 cm</text>"
                             "  <text x='50' y='44' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>6 cm</text>"
                             "  <text x='15' y='38' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>3 cm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Apuntamos todas las aristas exteriores de la figura."},
                    {"orden": 2, "texto": "Los lados miden: 10 cm, 6 cm, 4 cm, 3 cm, 6 cm y 3 cm."},
                    {"orden": 3, "texto": "Sumamos los valores: 10 + 6 + 4 + 3 + 6 + 3 = <span class=\"keyword-highlight\">32 cm</span>."}
                ]
            },
            {
                "enunciado": "Una figura tiene lados de 2, 3, 2 y 3. ¿Cuál es su perímetro?<br/>"
                             "<svg width='280' height='200' viewBox='-15 -10 170 115' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <rect x='30' y='20' width='80' height='60' fill='#F59E0B' fill-opacity='0.2' stroke='#F59E0B' stroke-width='3'/>"
                             "  <text x='70' y='14' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3</text>"
                             "  <text x='70' y='98' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3</text>"
                             "  <text x='18' y='54' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>2</text>"
                             "  <text x='122' y='54' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>2</text> "
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los 4 lados de la figura en orden."},
                    {"orden": 2, "texto": "Suma: 2 + 3 + 2 + 3 = 10."},
                    {"orden": 3, "texto": "El perímetro es: <span class=\"keyword-highlight\">10</span>."}
                ]
            },
            {
                "enunciado": "Una estrella geométrica tiene 5 lados iguales y cada uno mide 1 cm. ¿Cuál es el perímetro?<br/>"
                             "<svg width='280' height='200' viewBox='-15 -10 170 115' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <polygon points='70,15 110,45 95,90 45,90 30,45' fill='#F59E0B' fill-opacity='0.2' stroke='#F59E0B' stroke-width='3'/>"
                             "  <text x='70' y='102' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 cm</text>"
                             "  <text x='25' y='72' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 cm</text>"
                             "  <text x='115' y='72' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 cm</text>"
                             "  <text x='42' y='32' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 cm</text>"
                             "  <text x='98' y='32' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 cm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos la longitud de cada una de las 5 aristas exteriores."},
                    {"orden": 2, "texto": "Suma: 1 + 1 + 1 + 1 + 1 = 5 (o 5 × 1)."},
                    {"orden": 3, "texto": "Perímetro total: <span class=\"keyword-highlight\">5 cm</span>."}
                ]
            },
            {
                "enunciado": "Calcula el contorno de un rectángulo con lados de 10, 5, 10 y 5 cm.<br/>"
                             "<svg width='280' height='200' viewBox='-15 -10 170 115' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <rect x='20' y='20' width='100' height='50' fill='#F59E0B' fill-opacity='0.2' stroke='#F59E0B' stroke-width='3'/>"
                             "  <text x='70' y='14' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>10 cm</text>"
                             "  <text x='70' y='88' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>10 cm</text>"
                             "  <text x='10' y='48' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 cm</text>"
                             "  <text x='130' y='48' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 cm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los 4 bordes externos del rectángulo."},
                    {"orden": 2, "texto": "Suma: 10 + 5 + 10 + 5 = 30."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">30 cm</span>."}
                ]
            }
        ],
        (1, 3): [
            {
                "enunciado": "¿Cómo convertimos 2 metros (m) a centímetros (cm)?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='24' fill='#10B981' rx='6'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 m = 100 cm</text>"
                             "  <text x='80' y='48' fill='#6B7280' font-size='10' font-weight='bold' text-anchor='middle'>Multiplicamos por 100</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un metro tiene exactamente 100 centímetros. ¡Es como 100 pasitos de hormiga!"},
                    {"orden": 2, "texto": "Para convertir de m a cm, multiplicamos la cantidad por 100."},
                    {"orden": 3, "texto": "Operación: 2 m × 100 = <span class=\"keyword-highlight\">200 cm</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos centímetros hay en 3 metros?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='24' fill='#10B981' rx='6'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>3 m × 100 = 300 cm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sabemos que 1 m = 100 cm."},
                    {"orden": 2, "texto": "Multiplicamos los metros por 100: 3 × 100."},
                    {"orden": 3, "texto": "El resultado es: <span class=\"keyword-highlight\">300 cm</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos metros hay en 5 kilómetros (km)?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='24' fill='#10B981' rx='6'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 km = 1000 metros</text>"
                             "  <text x='80' y='48' fill='#FFF' font-size='10' text-anchor='middle'>5 × 1000 = 5000 m</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un kilómetro es muy largo. ¡Tiene exactamente 1000 metros!"},
                    {"orden": 2, "texto": "Multiplicamos los kilómetros por 1000: 5 × 1000."},
                    {"orden": 3, "texto": "Obtenemos: <span class=\"keyword-highlight\">5000 metros</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos milímetros (mm) hay en 2 centímetros (cm)?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <rect x='10' y='8' width='140' height='24' fill='#10B981' rx='6'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 cm = 10 milímetros</text>"
                             "  <text x='80' y='48' fill='#FFF' font-size='10' text-anchor='middle'>2 × 10 = 20 mm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un centímetro en la regla contiene 10 milímetros pequeños."},
                    {"orden": 2, "texto": "Multiplicamos los centímetros por 10: 2 × 10."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20 mm</span>."}
                ]
            }
        ],

        # --- MÓDULO 2: ÁREA EN MALHA ---
        (2, 1): [
            {
                "enunciado": "Calcula el área contando los cuadrados completos ocupados por el rectángulo:<br/>"
                             "<svg width='260' height='260' viewBox='-15 -10 150 135' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <!-- Rectángulo de 2x3 -->"
                             "  <rect x='40' y='20' width='40' height='60' fill='#EC4899' fill-opacity='0.3' stroke='#EC4899' stroke-width='3'/>"
                             "  <text x='60' y='55' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>Área = 6</text>"
                             "  <text x='60' y='122' fill='#EC4899' font-size='10' font-weight='bold' text-anchor='middle'>2 de base x 3 de alto</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El área mide el <span class=\"keyword-highlight\">espacio interior</span> en cuadraditos."},
                    {"orden": 2, "texto": "Contamos: base de 2 cuadraditos, altura de 3 cuadraditos. Total celdas = 2 × 3 = 6."},
                    {"orden": 3, "texto": "El área es de <span class=\"keyword-highlight\">6 unidades cuadradas</span>."}
                ]
            },
            {
                "enunciado": "¿Cuál es el área de un cuadrado de 4x4 unidades?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <rect x='20' y='20' width='80' height='80' fill='#EC4899' fill-opacity='0.3' stroke='#EC4899' stroke-width='3'/>"
                             "  <text x='60' y='65' fill='#FFF' font-size='14' font-weight='bold' text-anchor='middle'>4 × 4 = 16</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un cuadrado de 4x4 tiene 4 filas de 4 cuadraditos cada una."},
                    {"orden": 2, "texto": "Multiplicamos lado por lado (o base por altura): 4 × 4 = 16."},
                    {"orden": 3, "texto": "El área total es: <span class=\"keyword-highlight\">16</span>."}
                ]
            },
            {
                "enunciado": "Un rectángulo mide 5 de base y 2 de altura. Su área es:<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <rect x='10' y='40' width='100' height='40' fill='#EC4899' fill-opacity='0.3' stroke='#EC4899' stroke-width='3'/>"
                             "  <text x='60' y='65' fill='#FFF' font-size='14' font-weight='bold' text-anchor='middle'>5 × 2 = 10</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El área de un rectángulo es Base × Altura."},
                    {"orden": 2, "texto": "Multiplicamos los lados: 5 de base × 2 de altura = 10."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">10 unidades cuadradas</span>."}
                ]
            },
            {
                "enunciado": "Si pintas 3 filas con 3 cuadros cada una en un papel cuadriculado, ¿cuánto mide el área pintada?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <rect x='30' y='30' width='60' height='60' fill='#EC4899' fill-opacity='0.3' stroke='#EC4899' stroke-width='3'/>"
                             "  <text x='60' y='65' fill='#FFF' font-size='14' font-weight='bold' text-anchor='middle'>3 × 3 = 9</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La cuadrícula pintada forma un cuadrado de 3x3."},
                    {"orden": 2, "texto": "Multiplicamos: 3 filas × 3 columnas = 9."},
                    {"orden": 3, "texto": "Área: <span class=\"keyword-highlight\">9</span>."}
                ]
            }
        ],
        (2, 2): [
            {
                "enunciado": "Calcula el área total de la figura sumando cuadrados completos y mitades (triángulos):<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <!-- 2 cuadrados y 2 triángulos (mitades) -->"
                             "  <rect x='40' y='40' width='40' height='20' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6' stroke-width='2.5'/>"
                             "  <polygon points='80,40 100,40 80,60' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6' stroke-width='2'/>"
                             "  <polygon points='80,60 100,60 80,40' fill='#3B82F6' fill-opacity='0.1' stroke='#3B82F6' stroke-width='2'/>"
                             "  <text x='60' y='54' fill='#FFF' font-size='10' text-anchor='middle'>Enteros (2)</text>"
                             "  <text x='88' y='48' fill='#FFF' font-size='9' text-anchor='middle'>1/2</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Contamos las celdas enteras: hay <span class=\"keyword-highlight\">2 cuadrados completos</span>."},
                    {"orden": 2, "texto": "Contamos las mitades triangulares: hay <span class=\"keyword-highlight\">2 mitades</span>. Juntas forman 1 cuadrado entero (1/2 + 1/2 = 1)."},
                    {"orden": 3, "texto": "Sumamos todo: 2 enteros + 1 entero = <span class=\"keyword-highlight\">3 unidades cuadradas</span>."}
                ]
            },
            {
                "enunciado": "Si tengo 4 cuadrados enteros y 2 mitades. ¿Cuál es el área total?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <rect x='20' y='40' width='80' height='20' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6' stroke-width='2.5'/>"
                             "  <polygon points='100,40 120,40 100,60' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6' stroke-width='2'/>"
                             "  <polygon points='100,60 120,60 100,40' fill='#3B82F6' fill-opacity='0.1' stroke='#3B82F6' stroke-width='2'/>"
                             "  <text x='60' y='54' fill='#FFF' font-size='10' text-anchor='middle'>4 enteros</text>"
                             "  <text x='106' y='48' fill='#FFF' font-size='9' text-anchor='middle'>Mitades</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Las 2 mitades se fusionan para formar 1 cuadrado entero: 2 ÷ 2 = 1."},
                    {"orden": 2, "texto": "Sumamos los 4 enteros originales más el nuevo entero: 4 + 1."},
                    {"orden": 3, "texto": "Área total: <span class=\"keyword-highlight\">5</span>."}
                ]
            },
            {
                "enunciado": "Una figura geométrica tiene 0 cuadrados enteros y 4 mitades triangulares. Su área es:<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <polygon points='20,20 40,20 20,40' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6'/>"
                             "  <polygon points='40,20 60,20 40,40' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6'/>"
                             "  <polygon points='60,20 80,20 60,40' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6'/>"
                             "  <polygon points='80,20 100,20 80,40' fill='#3B82F6' fill-opacity='0.3' stroke='#3B82F6'/>"
                             "  <text x='60' y='60' fill='#FFF' font-size='10' text-anchor='middle'>4 mitades triangulares</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Cada pareja de mitades forma 1 entero: 4 mitades ÷ 2 = 2 enteros."},
                    {"orden": 2, "texto": "Sumamos al número de enteros (0): 0 + 2 = 2."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">2</span>."}
                ]
            },
            {
                "enunciado": "Si tengo 10 enteros y 6 mitades, ¿cuál es el área total?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <text x='60' y='50' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>10 enteros + 6 mitades</text>"
                             "  <text x='60' y='75' fill='#3B82F6' font-size='11' font-weight='bold' text-anchor='middle'>6 mitades = 3 enteros</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos cuántos enteros forman las mitades: 6 mitades ÷ 2 = 3 enteros."},
                    {"orden": 2, "texto": "Sumamos los enteros originales: 10 + 3 = 13."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">13</span>."}
                ]
            }
        ],
        (2, 3): [
            {
                "enunciado": "Suma el área de esta figura irregular en la cuadrícula:<br/>"
                             "<svg width='260' height='260' viewBox='-15 -10 150 135' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <path d='M20,0 V120 M40,0 V120 M60,0 V120 M80,0 V120 M100,0 V120 M0,20 H120 M0,40 H120 M0,60 H120 M0,80 H120 M0,100 H120' stroke='#374151' stroke-width='0.5'/>"
                             "  <!-- 8 enteros y 8 mitades -->"
                             "  <rect x='40' y='40' width='40' height='40' fill='#10B981' fill-opacity='0.3' stroke='#10B981' stroke-width='2.5'/>"
                             "  <polygon points='20,40 40,40 40,20' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='40,20 60,20 60,40' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='60,20 80,20 60,40' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='80,40 80,60 100,60' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='80,60 80,80 60,80' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='60,80 40,80 40,60' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='40,80 20,60 40,60' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <polygon points='20,60 20,40 40,40' fill='#10B981' fill-opacity='0.2' stroke='#10B981'/>"
                             "  <text x='60' y='64' fill='#FFF' font-size='10' font-weight='bold' text-anchor='middle'>Centro: 8</text>"
                             "  <text x='60' y='122' fill='#10B981' font-size='10' font-weight='bold' text-anchor='middle'>8 puntas triangulares</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Primero contamos los cuadros enteros en el centro de la figura: hay <span class=\"keyword-highlight\">8 enteros</span>."},
                    {"orden": 2, "texto": "Contamos las puntas triangulares alrededor: hay <span class=\"keyword-highlight\">8 mitades</span> (forman 4 enteros)."},
                    {"orden": 3, "texto": "Sumamos los totales: 8 + 4 = <span class=\"keyword-highlight\">12 unidades cuadradas</span>."}
                ]
            },
            {
                "enunciado": "¿Cuánto es 8 enteros más 8 mitades?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='26' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>8 + (8 mitades ÷ 2) = 12</text>"
                             "  <text x='80' y='46' fill='#10B981' font-size='10' font-weight='bold' text-anchor='middle'>8 + 4 = 12</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Convertimos las 8 mitades a enteros: 8 ÷ 2 = 4."},
                    {"orden": 2, "texto": "Sumamos a los 8 enteros originales: 8 + 4 = 12."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">12</span>."}
                ]
            },
            {
                "enunciado": "¿Cuánto es 12 enteros más 2 mitades?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='26' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>12 + (2 mitades ÷ 2) = 13</text>"
                             "  <text x='80' y='46' fill='#10B981' font-size='10' font-weight='bold' text-anchor='middle'>12 + 1 = 13</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Las 2 mitades forman exactamente 1 entero: 2 ÷ 2 = 1."},
                    {"orden": 2, "texto": "Sumamos: 12 + 1 = 13."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">13</span>."}
                ]
            },
            {
                "enunciado": "Si un polígono ocupa 5 enteros y 4 mitades, su área es:<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #10B981; border-radius:12px;'>"
                             "  <text x='80' y='26' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>5 + (4 mitades ÷ 2)</text>"
                             "  <text x='80' y='46' fill='#10B981' font-size='10' font-weight='bold' text-anchor='middle'>5 + 2 = 7 enteros</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Las 4 mitades forman: 4 ÷ 2 = 2 enteros."},
                    {"orden": 2, "texto": "Sumamos: 5 + 2 = 7."},
                    {"orden": 3, "texto": "Área total: <span class=\"keyword-highlight\">7</span>."}
                ]
            }
        ],

        # --- MÓDULO 3: FIGURAS COMPUESTAS Y SIMETRÍA ---
        (3, 1): [
            {
                "enunciado": "Calcula el área total de esta figura en 'L' descomponiéndola en dos rectángulos independientes:<br/>"
                             "<svg width='280' height='200' viewBox='-15 -10 150 115' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <!-- Rectángulo A (vertical) -->"
                             "  <rect x='20' y='10' width='30' height='70' fill='#A855F7' fill-opacity='0.3' stroke='#A855F7' stroke-width='2.5'/>"
                             "  <!-- Rectángulo B (horizontal) -->"
                             "  <rect x='50' y='50' width='50' height='30' fill='#06B6D4' fill-opacity='0.3' stroke='#06B6D4' stroke-width='2.5'/>"
                             "  <text x='35' y='48' fill='#FFF' font-weight='bold' font-size='12' text-anchor='middle'>A</text>"
                             "  <text x='75' y='70' fill='#FFF' font-weight='bold' font-size='12' text-anchor='middle'>B</text>"
                             "  <text x='60' y='104' fill='#FFF' font-size='9' text-anchor='middle'>Área total = Área A + Área B</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Descomponemos la figura 'L' en dos rectángulos independientes: el A y el B."},
                    {"orden": 2, "texto": "Área de A (púrpura) = 10 unidades cuadradas. Área de B (azul) = 8 unidades cuadradas."},
                    {"orden": 3, "texto": "Sumamos ambas partes: 10 + 8 = <span class=\"keyword-highlight\">18 unidades cuadradas</span>."}
                ]
            },
            {
                "enunciado": "Un rectángulo de 10 u² y otro de 8 u² pegados. ¿Cuánto suman en total?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <rect x='15' y='15' width='50' height='30' fill='#A855F7' fill-opacity='0.3' stroke='#A855F7'/>"
                             "  <rect x='65' y='15' width='80' height='30' fill='#06B6D4' fill-opacity='0.3' stroke='#06B6D4'/>"
                             "  <text x='40' y='34' fill='#FFF' font-size='10' text-anchor='middle'>10 u²</text>"
                             "  <text x='105' y='34' fill='#FFF' font-size='10' text-anchor='middle'>8 u²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Para saber el área de la figura combinada, sumamos sus partes."},
                    {"orden": 2, "texto": "Suma: 10 + 8 = 18."},
                    {"orden": 3, "texto": "El área total es: <span class=\"keyword-highlight\">18</span>."}
                ]
            },
            {
                "enunciado": "Una figura en 'T' está compuesta por una barra de techo de 12 u² y una base de 4 u². Su área es:<br/>"
                             "<svg width='280' height='140' viewBox='0 0 140 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <!-- Techo -->"
                             "  <rect x='20' y='15' width='100' height='20' fill='#A855F7' fill-opacity='0.3' stroke='#A855F7'/>"
                             "  <!-- Base -->"
                             "  <rect x='60' y='35' width='20' height='30' fill='#06B6D4' fill-opacity='0.3' stroke='#06B6D4'/>"
                             "  <text x='70' y='28' fill='#FFF' font-size='9' text-anchor='middle'>Techo = 12</text>"
                             "  <text x='70' y='52' fill='#FFF' font-size='9' text-anchor='middle'>Base = 4</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos el área de la barra del techo más el área de la base vertical."},
                    {"orden": 2, "texto": "Suma: 12 + 4 = 16."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">16</span>."}
                ]
            },
            {
                "enunciado": "Una figura 'L' tiene una torre de 15 u² y un pie de 5 u². ¿Cuál es su área total?<br/>"
                             "<svg width='280' height='140' viewBox='0 0 140 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #EC4899; border-radius:12px;'>"
                             "  <rect x='20' y='10' width='30' height='60' fill='#A855F7' fill-opacity='0.3' stroke='#A855F7'/>"
                             "  <rect x='50' y='40' width='70' height='30' fill='#06B6D4' fill-opacity='0.3' stroke='#06B6D4'/>"
                             "  <text x='35' y='40' fill='#FFF' font-size='9' text-anchor='middle'>15</text>"
                             "  <text x='85' y='60' fill='#FFF' font-size='9' text-anchor='middle'>5</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos ambas áreas descompuestas: 15 + 5."},
                    {"orden": 2, "texto": "Suma: 20."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20 u²</span>."}
                ]
            }
        ],
        (3, 2): [
            {
                "enunciado": "Si cortamos una hoja de papel de 10 cm² en varios pedazos para armar un barco con Tangram, ¿cuál es el área total del barco?<br/>"
                             "<svg width='260' height='180' viewBox='-15 -10 150 95' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <!-- Silueta de barco simple -->"
                             "  <polygon points='30,50 90,50 80,70 40,70' fill='#F59E0B' stroke='#B45309' stroke-width='2'/>"
                             "  <polygon points='60,15 60,45 85,45' fill='#EC4899' stroke='#BE185D' stroke-width='2'/>"
                             "  <polygon points='55,20 55,45 35,45' fill='#3B82F6' stroke='#1D4ED8' stroke-width='2'/>"
                             "  <text x='60' y='86' fill='#FFF' font-size='7' text-anchor='middle'>El área total es la misma</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "El principio de <span class=\"keyword-highlight\">conservación del área</span> nos dice que mover, rotar o cortar piezas no cambia el espacio total."},
                    {"orden": 2, "texto": "El área del papel original es 10 cm². Aunque armemos otra figura, sigue usando el mismo papel."},
                    {"orden": 3, "texto": "La suma de las piezas del barco sigue siendo exactamente: <span class=\"keyword-highlight\">10 cm²</span>."}
                ]
            },
            {
                "enunciado": "Si un triángulo de 3 u² se rota o gira, ¿cuál es su nueva área?<br/>"
                             "<svg width='260' height='140' viewBox='-15 -10 190 95' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <polygon points='30,20 70,20 50,60' fill='#F59E0B' fill-opacity='0.3' stroke='#F59E0B' stroke-width='2'/>"
                             "  <polygon points='110,60 150,60 110,20' fill='#F59E0B' fill-opacity='0.3' stroke='#F59E0B' stroke-width='2' transform='rotate(45 130 40)'/>"
                             "  <text x='50' y='84' fill='#FFF' font-size='9' text-anchor='middle'>Original = 3 u²</text>"
                             "  <text x='125' y='84' fill='#FFF' font-size='9' text-anchor='middle'>Rotado = 3 u²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Girar un triángulo no altera su tamaño, solo su posición en el espacio."},
                    {"orden": 2, "texto": "Por conservación, el área se mantiene exactamente igual."},
                    {"orden": 3, "texto": "El área sigue siendo: <span class=\"keyword-highlight\">3 u²</span>."}
                ]
            },
            {
                "enunciado": "Corto un papel de 10 u² en dos. ¿Cuánto sumará el área de ambas piezas juntas?<br/>"
                             "<svg width='260' height='100' viewBox='0 0 160 60' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <text x='80' y='25' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>10 u² cortados en 2 partes</text>"
                             "  <text x='80' y='45' fill='#F59E0B' font-size='11' font-weight='bold' text-anchor='middle'>Suma de partes = 10 u²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La suma de las partes cortadas siempre equivale al total de la hoja original."},
                    {"orden": 2, "texto": "No se ha perdido papel en el proceso."},
                    {"orden": 3, "texto": "Las partes sumadas dan: <span class=\"keyword-highlight\">10 u²</span>."}
                ]
            },
            {
                "enunciado": "Armo una casa de juguete usando todas las piezas de un Tangram de 16 u². El área de la casa es:<br/>"
                             "<svg width='260' height='140' viewBox='0 0 120 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #F59E0B; border-radius:12px;'>"
                             "  <!-- Casa de tangram simplificada -->"
                             "  <polygon points='60,10 90,40 30,40' fill='#F59E0B' stroke='#FFF'/>"
                             "  <rect x='30' y='40' width='60' height='30' fill='#EC4899' stroke='#FFF'/>"
                             "  <text x='60' y='58' fill='#FFF' font-size='8' text-anchor='middle'>Casa = 16 u²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Al usar todas las piezas del Tangram, el área total ocupada se conserva."},
                    {"orden": 2, "texto": "El área del Tangram es 16 u²."},
                    {"orden": 3, "texto": "El área de la casa construida es: <span class=\"keyword-highlight\">16 u²</span>."}
                ]
            }
        ],
        (3, 3): [
            {
                "enunciado": "Calcula el área sombreada (la zona de color violeta) restando el área del hueco en blanco:<br/>"
                             "<svg width='280' height='200' viewBox='0 0 120 100' style='margin:10px auto; display:block; border:2px solid #8B5CF6; background:#1F2937; border-radius:12px;'>"
                             "  <!-- Rectángulo exterior -->"
                             "  <rect x='10' y='10' width='100' height='80' fill='#8B5CF6' fill-opacity='0.4' stroke='#8B5CF6' stroke-width='2.5'/>"
                             "  <!-- Hueco interior -->"
                             "  <rect x='40' y='30' width='40' height='40' fill='#1F2937' stroke='#9CA3AF' stroke-dasharray='4'/>"
                             "  <text x='25' y='54' fill='#FFF' font-weight='bold' font-size='8'>Pintado</text>"
                             "  <text x='60' y='54' fill='#FFF' font-size='8' text-anchor='middle'>Hueco</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos el área del rectángulo exterior: 10 × 8 = 80 unidades cuadradas."},
                    {"orden": 2, "texto": "Calculamos el área del hueco interior en blanco: 4 × 4 = 16 unidades cuadradas."},
                    {"orden": 3, "texto": "Restamos: Área Exterior - Hueco = 80 - 16 = <span class=\"keyword-highlight\">64 unidades cuadradas</span>."}
                ]
            },
            {
                "enunciado": "Si el área exterior de un cartel es 50 cm² y tiene una foto en blanco de 10 cm² adentro, ¿cuál es el área sombreada?<br/>"
                             "<svg width='280' height='160' viewBox='0 0 140 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <rect x='15' y='10' width='110' height='60' fill='#8B5CF6' fill-opacity='0.4' stroke='#8B5CF6'/>"
                             "  <rect x='50' y='25' width='40' height='30' fill='#111827' stroke='#FFF'/>"
                             "  <text x='30' y='45' fill='#FFF' font-size='8'>50 cm²</text>"
                             "  <text x='70' y='42' fill='#FFF' font-size='8' text-anchor='middle'>10 cm²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Restamos el área del agujero o foto en blanco del área total del cartel."},
                    {"orden": 2, "texto": "Operación: 50 - 10 = 40."},
                    {"orden": 3, "texto": "El área pintada es: <span class=\"keyword-highlight\">40 cm²</span>."}
                ]
            },
            {
                "enunciado": "Una caja de cartón de 100 cm² tiene una ventana transparente de 25 cm². ¿Cuánto mide el área de cartón restante?<br/>"
                             "<svg width='280' height='160' viewBox='0 0 140 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <rect x='20' y='10' width='100' height='60' fill='#8B5CF6' fill-opacity='0.4' stroke='#8B5CF6'/>"
                             "  <rect x='50' y='20' width='40' height='40' fill='#111827' stroke='#FFF'/>"
                             "  <text x='70' y='44' fill='#FFF' font-size='9' text-anchor='middle'>100 - 25 = 75 cm²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Restamos el espacio de la ventana del espacio total de la tapa."},
                    {"orden": 2, "texto": "Operación: 100 - 25 = 75."},
                    {"orden": 3, "texto": "La superficie restante es: <span class=\"keyword-highlight\">75 cm²</span>."}
                ]
            },
            {
                "enunciado": "Una pared de 20 u² tiene una ventana de 4 u². ¿Cuál es el área de pared que se va a pintar?<br/>"
                             "<svg width='280' height='160' viewBox='0 0 140 80' style='margin:10px auto; display:block; background:#111827; border:2px solid #8B5CF6; border-radius:12px;'>"
                             "  <rect x='20' y='10' width='100' height='60' fill='#8B5CF6' fill-opacity='0.4' stroke='#8B5CF6'/>"
                             "  <rect x='55' y='25' width='30' height='30' fill='#111827' stroke='#FFF'/>"
                             "  <text x='70' y='44' fill='#FFF' font-size='9' text-anchor='middle'>20 u² - 4 u² = 16 u²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Restamos los metros cuadrados de la ventana de los metros totales de la pared."},
                    {"orden": 2, "texto": "Operación: 20 - 4 = 16."},
                    {"orden": 3, "texto": "El área a pintar es: <span class=\"keyword-highlight\">16 u²</span>."}
                ]
            }
        ],
        (3, 4): [
            {
                "enunciado": "¿Cuántos ejes de simetría tiene un cuadrado perfecto?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 100 100' style='margin:10px auto; display:block; border:2.5px solid #3B82F6; background:#1F2937; border-radius:12px;'>"
                             "  <!-- Líneas de simetría -->"
                             "  <line x1='50' y1='0' x2='50' y2='100' stroke='#EF4444' stroke-width='2' stroke-dasharray='4'/>"
                             "  <line x1='0' y1='50' x2='100' y2='50' stroke='#EF4444' stroke-width='2' stroke-dasharray='4'/>"
                             "  <line x1='0' y1='0' x2='100' y2='100' stroke='#10B981' stroke-width='2' stroke-dasharray='4'/>"
                             "  <line x1='100' y1='0' x2='0' y2='100' stroke='#10B981' stroke-width='2' stroke-dasharray='4'/>"
                             "  <rect x='10' y='10' width='80' height='80' fill='none' stroke='#3B82F6' stroke-width='2'/>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un eje de simetría es una línea imaginaria que divide la figura en dos partes idénticas (como un espejo)."},
                    {"orden": 2, "texto": "En un cuadrado podemos doblar a la mitad de forma vertical, horizontal y por las dos esquinas diagonales."},
                    {"orden": 3, "texto": "Contando todas las dobleces perfectas, un cuadrado tiene exactamente: <span class=\"keyword-highlight\">4 ejes</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos ejes de simetría tiene un círculo?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 100 100' style='margin:10px auto; display:block; border:2.5px solid #3B82F6; background:#1F2937; border-radius:12px;'>"
                             "  <circle cx='50' cy='50' r='40' fill='none' stroke='#3B82F6' stroke-width='2'/>"
                             "  <line x1='50' y1='5' x2='50' y2='95' stroke='#EF4444' stroke-width='2' stroke-dasharray='3'/>"
                             "  <line x1='5' y1='50' x2='95' y2='50' stroke='#EF4444' stroke-width='2' stroke-dasharray='3'/>"
                             "  <line x1='18' y1='18' x2='82' y2='82' stroke='#EF4444' stroke-width='1.5' stroke-dasharray='3'/>"
                             "  <text x='50' y='54' fill='#FFF' font-size='10' text-anchor='middle'>¡Infinitos!</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Cualquier línea recta que pase exactamente por el centro del círculo lo divide en dos mitades perfectas."},
                    {"orden": 2, "texto": "Como hay infinitas líneas que pasan por el centro, tiene infinitas posibilidades de doblez."},
                    {"orden": 3, "texto": "Respuesta correcta: <span class=\"keyword-highlight\">infinitos</span>."}
                ]
            },
            {
                "enunciado": "¿Cuántos ejes de simetría tiene un triángulo equilátero (3 lados iguales)?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 100 100' style='margin:10px auto; display:block; border:2.5px solid #3B82F6; background:#1F2937; border-radius:12px;'>"
                             "  <polygon points='50,15 90,85 10,85' fill='none' stroke='#3B82F6' stroke-width='2'/>"
                             "  <line x1='50' y1='5' x2='50' y2='95' stroke='#EF4444' stroke-width='2' stroke-dasharray='3'/>"
                             "  <line x1='10' y1='85' x2='70' y2='50' stroke='#EF4444' stroke-width='1.5' stroke-dasharray='3'/>"
                             "  <line x1='90' y1='85' x2='30' y2='50' stroke='#EF4444' stroke-width='1.5' stroke-dasharray='3'/>"
                             "  <text x='50' y='64' fill='#FFF' font-size='11' text-anchor='middle'>3 ejes</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Podemos trazar una línea desde cada una de sus 3 esquinas hasta el centro del lado de enfrente."},
                    {"orden": 2, "texto": "Cada línea divide el triángulo en dos mitades simétricas idénticas."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">3</span> ejes."}
                ]
            },
            {
                "enunciado": "¿Tiene ejes de simetría una figura con forma de letra 'F'?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 100 100' style='margin:10px auto; display:block; border:2.5px solid #3B82F6; background:#1F2937; border-radius:12px;'>"
                             "  <path d='M30,20 H70 V32 H42 V48 H65 V60 H42 V80 H30 Z' fill='#3B82F6' fill-opacity='0.4' stroke='#3B82F6' stroke-width='2'/>"
                             "  <text x='50' y='94' fill='#EF4444' font-size='11' font-weight='bold' text-anchor='middle'>0 Ejes de Simetría</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Intentamos trazar una línea vertical u horizontal que actúe de espejo."},
                    {"orden": 2, "texto": "Al doblarla de cualquier lado, los brazos de la 'F' no coinciden con nada."},
                    {"orden": 3, "texto": "Respuesta: <span class=\"keyword-highlight\">0</span> ejes (ninguno)."}
                ]
            }
        ],

        # --- MÓDULO 4: CONVERSIÓN Y PANTALLAS ---
        (4, 1): [
            {
                "enunciado": "En un plano de escala gráfica, 1 unidad del mapa equivale a 10 metros reales. ¿Cuántos metros representan 4 unidades?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#1F2937; border-radius:12px; border:2px solid #4B5563;'>"
                             "  <rect x='10' y='15' width='30' height='10' fill='#FFF'/>"
                             "  <rect x='40' y='15' width='30' height='10' fill='#000'/>"
                             "  <rect x='70' y='15' width='30' height='10' fill='#FFF'/>"
                             "  <rect x='100' y='15' width='30' height='10' fill='#000'/>"
                             "  <text x='10' y='42' fill='#FFF' font-size='10' font-weight='bold'>0m</text>"
                             "  <text x='40' y='42' fill='#FFF' font-size='10' font-weight='bold'>10m</text>"
                             "  <text x='70' y='42' fill='#FFF' font-size='10' font-weight='bold'>20m</text>"
                             "  <text x='100' y='42' fill='#FFF' font-size='10' font-weight='bold'>30m</text>"
                             "  <text x='130' y='42' fill='#FFF' font-size='10' font-weight='bold'>40m</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La escala gráfica nos dice la equivalencia: 1 unidad de dibujo = 10 metros en la vida real."},
                    {"orden": 2, "texto": "Multiplicamos la medida del mapa por el valor de escala: 4 unidades × 10 m."},
                    {"orden": 3, "texto": "Resultado: Representa <span class=\"keyword-highlight\">40 metros reales</span>."}
                ]
            },
            {
                "enunciado": "Si la escala es 1 u = 5 km, y viajas una distancia de 6 u en el mapa, ¿cuál es la distancia real?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#1F2937; border-radius:12px; border:2px solid #4B5563;'>"
                             "  <rect x='10' y='10' width='140' height='20' fill='#4B5563' rx='4'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>1 u = 5 km  →  6 u × 5 = 30 km</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Cada unidad en el mapa representa 5 km reales."},
                    {"orden": 2, "texto": "Multiplicamos las 6 unidades por 5: 6 × 5."},
                    {"orden": 3, "texto": "La distancia real es: <span class=\"keyword-highlight\">30 km</span>."}
                ]
            },
            {
                "enunciado": "Escala 1 u = 2 m. Un árbol mide 15 u de altura en el plano. ¿Cuál es su altura real?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#1F2937; border-radius:12px; border:2px solid #4B5563;'>"
                             "  <rect x='10' y='10' width='140' height='20' fill='#4B5563' rx='4'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>15 u × 2 = 30 metros</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos la altura del plano por la escala de conversión."},
                    {"orden": 2, "texto": "Operación: 15 × 2 = 30."},
                    {"orden": 3, "texto": "La altura real es: <span class=\"keyword-highlight\">30 metros</span>."}
                ]
            },
            {
                "enunciado": "En un mapa de escala 1 u = 100 m, una calle mide 3 u. ¿Cuánto mide en la realidad?<br/>"
                             "<svg width='280' height='100' viewBox='0 0 160 50' style='margin:10px auto; display:block; background:#1F2937; border-radius:12px; border:2px solid #4B5563;'>"
                             "  <rect x='10' y='10' width='140' height='20' fill='#4B5563' rx='4'/>"
                             "  <text x='80' y='24' fill='#FFF' font-size='11' font-weight='bold' text-anchor='middle'>3 u × 100 = 300 metros</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos la medida del mapa por 100 metros: 3 × 100."},
                    {"orden": 2, "texto": "Operación: 300."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">300 metros</span>."}
                ]
            }
        ],
        (4, 2): [
            {
                "enunciado": "Un monitor de computadora se anuncia como de 25 pulgadas. ¿Qué parte física mide 25 pulgadas?<br/>"
                             "<svg width='260' height='220' viewBox='0 0 120 100' style='margin:10px auto; display:block; background:#111827; border-radius:12px; border:2px solid #EC4899;'>"
                             "  <rect x='10' y='10' width='100' height='70' fill='#374151' rx='5' stroke='#FFF' stroke-width='2.5'/>"
                             "  <!-- Diagonal -->"
                             "  <line x1='10' y1='80' x2='110' y2='10' stroke='#EF4444' stroke-width='3.5' stroke-dasharray='4'/>"
                             "  <text x='65' y='55' fill='#EF4444' font-weight='bold' font-size='11' transform='rotate(-32 65 55)'>Diagonal</text>"
                             "  <rect x='45' y='80' width='30' height='15' fill='#6B7280'/>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Las pantallas de televisores, celulares y monitores se miden cruzando las esquinas opuestas."},
                    {"orden": 2, "texto": "Esta línea inclinada que cruza de la esquina inferior a la superior contraria es la <span class=\"keyword-highlight\">diagonal</span>."},
                    {"orden": 3, "texto": "Por lo tanto, la respuesta correcta es: <span class=\"keyword-highlight\">la diagonal</span>."}
                ]
            },
            {
                "enunciado": "En un rectángulo que mide 3 de base y 4 de altura, ¿cuánto mide la diagonal?<br/>"
                             "<svg width='260' height='220' viewBox='0 0 120 100' style='margin:10px auto; display:block; background:#111827; border-radius:12px; border:2px solid #EC4899;'>"
                             "  <rect x='20' y='20' width='80' height='60' fill='none' stroke='#FFF' stroke-width='2'/>"
                             "  <line x1='20' y1='80' x2='100' y2='20' stroke='#EF4444' stroke-width='3'/>"
                             "  <text x='60' y='94' fill='#FFF' font-size='10' text-anchor='middle'>3</text>"
                             "  <text x='108' y='54' fill='#FFF' font-size='10' text-anchor='middle'>4</text>"
                             "  <text x='60' y='44' fill='#EF4444' font-size='11' font-weight='bold' text-anchor='middle'>D = 5</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Por el teorema de Pitágoras, la diagonal al cuadrado es igual a la suma de los cuadrados de los lados."},
                    {"orden": 2, "texto": "Calculamos: 3² + 4² = 9 + 16 = 25. La raíz cuadrada de 25 es 5."},
                    {"orden": 3, "texto": "La diagonal mide: <span class=\"keyword-highlight\">5</span>."}
                ]
            },
            {
                "enunciado": "¿Qué medida es más larga en un televisor, su base horizontal o su diagonal inclinada?<br/>"
                             "<svg width='260' height='220' viewBox='0 0 120 100' style='margin:10px auto; display:block; background:#111827; border-radius:12px; border:2px solid #EC4899;'>"
                             "  <rect x='10' y='20' width='100' height='60' fill='none' stroke='#FFF' stroke-width='2'/>"
                             "  <line x1='10' y1='80' x2='110' y2='20' stroke='#EF4444' stroke-width='3'/>"
                             "  <text x='60' y='50' fill='#EF4444' font-size='11' font-weight='bold' text-anchor='middle'>Diagonal es mayor</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "La diagonal actúa como la hipotenusa de un triángulo rectángulo."},
                    {"orden": 2, "texto": "La hipotenusa siempre es el lado más largo de un triángulo rectángulo."},
                    {"orden": 3, "texto": "Respuesta correcta: <span class=\"keyword-highlight\">diagonal</span>."}
                ]
            },
            {
                "enunciado": "Si un televisor se describe como de 50 pulgadas, ¿dónde se toman esas 50 pulgadas?<br/>"
                             "<svg width='260' height='220' viewBox='0 0 120 100' style='margin:10px auto; display:block; background:#111827; border-radius:12px; border:2px solid #EC4899;'>"
                             "  <rect x='10' y='10' width='100' height='70' fill='#374151' rx='5' stroke='#FFF'/>"
                             "  <line x1='10' y1='80' x2='110' y2='10' stroke='#EF4444' stroke-width='3'/>"
                             "  <text x='60' y='46' fill='#EF4444' font-size='10' font-weight='bold' text-anchor='middle'>50\" Diagonal</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Se mide la distancia en línea recta de una esquina de la pantalla a la esquina contraria."},
                    {"orden": 2, "texto": "Ese trazo inclinado es la diagonal de la pantalla."},
                    {"orden": 3, "texto": "La respuesta es: <span class=\"keyword-highlight\">la diagonal</span>."}
                ]
            }
        ],
        (4, 3): [
            {
                "enunciado": "¿Cuántos centímetros cuadrados (cm²) hay en 1 metro cuadrado (m²)?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; border:2.5px solid #10B981; background:#1F2937; border-radius:12px;'>"
                             "  <text x='60' y='45' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 m²</text>"
                             "  <text x='60' y='68' fill='#10B981' font-size='12' font-weight='bold' text-anchor='middle'>= 10,000 cm²</text>"
                             "  <text x='60' y='90' fill='#6B7280' font-size='9' text-anchor='middle'>100cm × 100cm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un metro tiene 100 cm de longitud lineal. Pero un metro cuadrado es bidimensional (ancho × alto)."},
                    {"orden": 2, "texto": "Para hallar el área en cm², multiplicamos el ancho en cm por el alto en cm: 100 cm × 100 cm."},
                    {"orden": 3, "texto": "Operación: 100 × 100 = <span class=\"keyword-highlight\">10000 cm²</span>."}
                ]
            },
            {
                "enunciado": "Si 1 decímetro (dm) = 10 cm, ¿cuántos cm² hay en 1 dm²?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; border:2.5px solid #10B981; background:#1F2937; border-radius:12px;'>"
                             "  <text x='60' y='45' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 dm²</text>"
                             "  <text x='60' y='68' fill='#10B981' font-size='12' font-weight='bold' text-anchor='middle'>= 100 cm²</text>"
                             "  <text x='60' y='90' fill='#6B7280' font-size='9' text-anchor='middle'>10cm × 10cm</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Un decímetro cuadrado es un cuadrado de 10 cm de lado."},
                    {"orden": 2, "texto": "Multiplicamos las dos dimensiones: 10 cm × 10 cm = 100."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">100 cm²</span>."}
                ]
            },
            {
                "enunciado": "Si 1 m = 10 dm, ¿cuántos dm² hay en 2 m²?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; border:2.5px solid #10B981; background:#1F2937; border-radius:12px;'>"
                             "  <text x='60' y='45' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>1 m² = 100 dm²</text>"
                             "  <text x='60' y='68' fill='#10B981' font-size='12' font-weight='bold' text-anchor='middle'>2 m² = 200 dm²</text>"
                             "  <text x='60' y='90' fill='#6B7280' font-size='9' text-anchor='middle'>10dm × 10dm × 2</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Primero calculamos cuántos dm² hay en 1 m²: 10 dm × 10 dm = 100 dm²."},
                    {"orden": 2, "texto": "Como tenemos 2 m², multiplicamos por 2: 100 dm² × 2."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">200 dm²</span>."}
                ]
            },
            {
                "enunciado": "Si un azulejo mide 2 m² y lo queremos pasar a centímetros cuadrados, ¿cuánto resulta?<br/>"
                             "<svg width='260' height='260' viewBox='0 0 120 120' style='margin:10px auto; display:block; border:2.5px solid #10B981; background:#1F2937; border-radius:12px;'>"
                             "  <text x='60' y='45' fill='#FFF' font-size='12' font-weight='bold' text-anchor='middle'>2 m² to cm²</text>"
                             "  <text x='60' y='68' fill='#10B981' font-size='12' font-weight='bold' text-anchor='middle'>= 20,000 cm²</text>"
                             "  <text x='60' y='90' fill='#6B7280' font-size='9' text-anchor='middle'>2 × 10,000 cm²</text>"
                             "</svg>",
                "pasos": [
                    {"orden": 1, "texto": "Sabemos que 1 m² = 10,000 cm² (100 cm × 100 cm)."},
                    {"orden": 2, "texto": "Multiplicamos los 2 m² por 10,000: 2 × 10,000."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20000 cm²</span>."}
                ]
            }
        ]
    }
    return ejemplos_db.get((modulo_id, nivel_id), [])
