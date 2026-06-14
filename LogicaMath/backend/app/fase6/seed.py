import asyncio
import random
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.db.session import AsyncSessionLocal
from app.models.sql_models import (
    Fase,
    Pregunta,
    Alternativa,
    ConfiguracionProgreso,
    StatusEnum,
    OperacionEnum,
    TipoPreguntaEnum,
    TipoErrorEnum,
    Intento,
    PoolAsignadoAlumno,
)
from app.fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso
from app.fase6.theory_examples import obtener_ejemplos_expandidos_fase6

from app.utils.graphics_generator import generate_isometric_cubes_image, generate_thermometer_image
from app.core.storage import storage_service

FASE6_ID = 6

# Cache en memoria para reutilizar URLs de gráficos generados
_graphic_url_cache: Dict[str, str] = {}

async def clear_fase6_data(session: AsyncSession):
    print("Purging existing Fase 6 data for a clean overwrite...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE6_ID))
    pregunta_ids_list = result.scalars().all()
    
    if pregunta_ids_list:
        await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids_list)))
        res_int_q = await session.execute(select(IntentoPregunta.id).where(IntentoPregunta.pregunta_id.in_(pregunta_ids_list)))
        int_q_ids = res_int_q.scalars().all()
        if int_q_ids:
            await session.execute(delete(IntentoPaso).where(IntentoPaso.intento_pregunta_id.in_(int_q_ids)))
            await session.execute(delete(IntentoPregunta).where(IntentoPregunta.id.in_(int_q_ids)))
            
        await session.execute(delete(Intento).where(Intento.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(pregunta_ids_list)))
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE6_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE6_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE6_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE6_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE6_ID))
    await session.commit()
    print("Fase 6 data purged.")

async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando guión de textos (NivelTeoria) para Fase 6...")
    
    niveles_teoria = [
        # --- MÓDULO 1: Reconocimiento 3D ---
        {
            "modulo_id": 1, "nivel_id": 1,
            "titulo": "Identificación de poliedros",
            "texto_descubrimiento": "¡Hola, campeona del espacio 3D! 🌌 Hasta ahora hemos jugado en papel plano (2D), pero hoy daremos el gran salto a las tres dimensiones. Los poliedros son cuerpos sólidos que tienen volumen (ocupan un lugar real en tu habitación).\nTienen tres partes clave:\n1. Caras: las paredes planas.\n2. Vértices: las esquinitas puntiagudas.\n3. Aristas: las líneas rectas donde se juntan las caras. ¡Como los bordes de una caja de regalo!",
            "diccionario": {"Vértice": "Esquina donde se unen tres o más aristas.", "Cara": "Superficie plana del poliedro.", "Arista": "Línea de unión donde se juntan dos caras contiguas."},
            "advertencia": "No vayas a confundir aristas con caras. Por ejemplo, un cubo tiene 6 caras pero ¡12 aristas! Contemos con cuidado.",
            "ejemplos": obtener_ejemplos_expandidos_fase6(1, 1),
            "interactivos": [
                {"pregunta": "¿Cuántas caras tiene un cubo regular?", "respuesta": "6", "feedback_acierto": "¡Correcto! Base, tapa y 4 lados.", "feedback_error": "Cuenta las superficies del dado: 6 en total."},
                {"pregunta": "¿Cuántos vértices tiene un cubo?", "respuesta": "8", "feedback_acierto": "¡Excelente! 4 esquinas arriba y 4 abajo.", "feedback_error": "Cuenta las esquinitas: 4 superiores y 4 inferiores."},
                {"pregunta": "¿Cuántas aristas tiene un cubo?", "respuesta": "12", "feedback_acierto": "¡Brillante! 4 arriba, 4 abajo y 4 columnas verticales.", "feedback_error": "Cuenta los bordes lineales: 12 en total."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 2,
            "titulo": "Detección de bloques ocultos",
            "texto_descubrimiento": "¡Hora de usar la visión de rayos X en tu mente! 🕵️‍♀️ Cuando dibujamos bloques apilados en 3D, algunos cubos quedan escondidos detrás o debajo de otros.\nRecuerda la ley física: un bloque que está arriba no puede flotar mágicamente en el aire; necesita que haya bloques en el suelo y en los pisos de abajo para sostenerlo. ¡Tu misión es contar los bloques visibles y deducir cuántos están ocultos!",
            "diccionario": {"Perspectiva isométrica": "Dibujo técnico en 2D que representa un objeto 3D visto desde un ángulo."},
            "advertencia": "Mira con atención la altura. Si un cubo está en el nivel 3 (tercer piso), significa que obligatoriamente hay 2 cubos escondidos abajo sosteniéndolo.",
            "ejemplos": obtener_ejemplos_expandidos_fase6(1, 2),
            "interactivos": [
                {"pregunta": "Si ves un bloque a una altura de 3 niveles, ¿cuántos bloques hay en su columna completa?", "respuesta": "3", "feedback_acierto": "¡Correcto! El de arriba y los 2 de base.", "feedback_error": "Incluye el que ves y los que lo sostienen en los niveles inferiores."},
                {"pregunta": "En una estructura en forma de cruz, el bloque central está en el nivel 2. ¿Cuántos bloques ocultos hay debajo?", "respuesta": "1", "feedback_acierto": "¡Excelente! El primer nivel sostiene al segundo.", "feedback_error": "El nivel 1 sostiene al nivel 2."},
                {"pregunta": "Si cuento 5 bloques en total pero solo veo 4, ¿cuántos están ocultos?", "respuesta": "1", "feedback_acierto": "¡Brillante! Restamos 5 - 4 = 1.", "feedback_error": "Resta el total menos los visibles."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 3,
            "titulo": "Asociación de moldes desplegados",
            "texto_descubrimiento": "¡Imagínate desarmar una caja de cartón por sus uniones y extenderla sobre la mesa! Eso es un molde desplegado.\nNos dice cómo se ve una figura tridimensional abierta y aplanada en dos dimensiones. En este nivel, vas a aprender a doblar mentalmente los moldes planos para descubrir qué cuerpo 3D se forma. ¡Es como doblar origami!",
            "diccionario": {"Molde desplegado": "La representación plana de las caras conectadas de un cuerpo tridimensional antes de plegarse."},
            "advertencia": "Al plegar, comprueba que las caras no choquen o se encimen. Si dos cuadrados se doblan al mismo lugar, ¡el molde no se cerrará correctamente!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(1, 3),
            "interactivos": [
                {"pregunta": "¿Cuántos cuadrados debe tener un molde para formar un cubo cerrado?", "respuesta": "6", "feedback_acierto": "¡Correcto! Un cubo tiene 6 caras.", "feedback_error": "El cubo tiene 6 caras."},
                {"pregunta": "Si un molde tiene 5 caras, ¿formará un cubo cerrado? (1 para SÍ, 2 para NO)", "respuesta": "2", "feedback_acierto": "¡Excelente! Faltará una tapa.", "feedback_error": "Responde 2. Faltará una cara para cerrar el cubo."},
                {"pregunta": "Un molde de cilindro tiene 2 círculos y un...", "respuesta": "rectángulo", "feedback_acierto": "¡Brillante!", "feedback_error": "El tubo curvo se estira como un rectángulo."}
            ]
        },
        # --- MÓDULO 2: Patrones de Crecimiento ---
        {
            "modulo_id": 2, "nivel_id": 1,
            "titulo": "Análisis de sucesiones espaciales",
            "texto_descubrimiento": "¡Las figuras también pueden crecer de forma inteligente! 📈 Un patrón geométrico es una serie de construcciones que se expanden siguiendo una regla fija.\nPor ejemplo, si la Etapa 1 tiene 1 bloque y la Etapa 2 tiene 3 bloques, la regla es sumarle 2 bloques en cada paso. Si sigues esa regla, ¡puedes adivinar el futuro de la figura en la Etapa 4!",
            "diccionario": {"Sucesión espacial": "Grupo ordenado de formas geométricas que crecen con un patrón regular."},
            "advertencia": "Descubre primero el secreto: compara la Etapa 2 con la Etapa 1. ¿Cuántos bloques se añadieron? ¡Ese es el ritmo de crecimiento!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(2, 1),
            "interactivos": [
                {"pregunta": "Si el patrón es 1, 3, 5, 7. ¿Cuántos bloques en la etapa 5?", "respuesta": "9", "feedback_acierto": "¡Correcto! Sumamos 2 al anterior.", "feedback_error": "Suma 2 al 7."},
                {"pregunta": "Si en etapa 1 hay 2 bloques, en etapa 2 hay 4 y en etapa 3 hay 6. ¿Regla? (escribe: suma 2)", "respuesta": "suma 2", "feedback_acierto": "¡Excelente! Aumenta en 2.", "feedback_error": "Aumenta en 2. Escribe 'suma 2'."},
                {"pregunta": "Patrón: 2, 5, 8. Siguiente número:", "respuesta": "11", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 2,
            "titulo": "Conteo volumétrico estratificado",
            "texto_descubrimiento": "¡Para contar grandes pilas de bloques sin perder la cabeza, usamos pisos! 🏢\nEl conteo estratificado es una técnica de ingenieras que consiste en contar los bloques capa por capa horizontal (los estratos), de arriba hacia abajo. Luego, sumas las cantidades de cada capa. ¡Así ningún cubo oculto en el centro se te escapará!",
            "diccionario": {"Estrato": "Capa o piso de bloques a una misma altura en la construcción."},
            "advertencia": "Cuenta el piso de arriba primero, luego el del medio, y al final la base. ¡Apunta y suma ordenadamente!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(2, 2),
            "interactivos": [
                {"pregunta": "Piso inferior 9, piso medio 4, piso superior 1. Total:", "respuesta": "14", "feedback_acierto": "¡Correcto! 9+4+1 = 14.", "feedback_error": "Suma 9+4+1."},
                {"pregunta": "Edificio de 3 pisos, 4 bloques por piso. Total:", "respuesta": "12", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 4x3."},
                {"pregunta": "Capa 1: 5 bloques, Capa 2: 3 bloques. Total:", "respuesta": "8", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 5+3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 3,
            "titulo": "Generalización algebraica",
            "texto_descubrimiento": "¡Imagina que te piden contar los bloques de la Etapa 100! Dibujarlo tardaría horas.\nAquí es donde brilla la generalización algebraica: creamos una fórmula matemática mágica usando la letra 'N' (que representa el número de etapa). Al reemplazar N por la etapa deseada, ¡la fórmula calcula la respuesta al instante!",
            "diccionario": {"Generalización": "Encontrar la fórmula o regla matemática que describe cómo se comporta una serie infinita."},
            "advertencia": "Fíjate muy bien en la regla. Si la regla es N + 4 y te piden la etapa 10, la cuenta es 10 + 4. ¡Reemplaza la N con cuidado!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(2, 3),
            "interactivos": [
                {"pregunta": "Regla: Nx3. ¿Etapa 4?", "respuesta": "12", "feedback_acierto": "¡Correcto! 4x3 = 12.", "feedback_error": "Multiplica 4x3."},
                {"pregunta": "Regla: NxN. ¿Etapa 5?", "respuesta": "25", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 5x5."},
                {"pregunta": "Regla: N+4. ¿Etapa 10?", "respuesta": "14", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 10+4."}
            ]
        },
        # --- MÓDULO 3: Cubos Unitarios ---
        {
            "modulo_id": 3, "nivel_id": 1,
            "titulo": "Modelado del concepto de volumen (u³)",
            "texto_descubrimiento": "El volumen es la cantidad de espacio tridimensional que ocupa un cuerpo. ¡Cuánto lugar ocupa en el mundo!\nPara medir volumen, usamos cubos unitarios de 1x1x1 (u³). El volumen de una caja nos dice cuántos de estos cubitos idénticos caben guardados adentro. ¡Contemos cubos para descubrir el volumen!",
            "diccionario": {"Unidad cúbica (u³)": "Un cubo de medida estándar 1 de ancho, 1 de largo y 1 de alto que sirve para contar volumen."},
            "advertencia": "Recuerda que cuentas volumen en 3D (largo × ancho × alto). No vayas a contar solo las caras visibles, ¡incluye todo lo de adentro!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(3, 1),
            "interactivos": [
                {"pregunta": "Si apilo 4 cubos en el suelo y luego pongo 4 cubos encima. Volumen total:", "respuesta": "8", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma 4+4."},
                {"pregunta": "Una línea de 5 cubos, repetida 2 veces. Volumen:", "respuesta": "10", "feedback_acierto": "¡Excelente!", "feedback_error": "Multiplica 5x2."},
                {"pregunta": "Tres columnas de 3 cubos. Volumen:", "call": "9", "respuesta": "9", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 3x3."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 2,
            "titulo": "Cálculo analítico formal de prismas",
            "texto_descubrimiento": "¡Ahora usaremos el superpoder de multiplicar! ⚡ Contar cubito por cubito en una caja grande es muy tardado.\nPara calcular el volumen de un prisma rectangular (como una caja de zapatos), usamos la fórmula matemática oficial: Volumen = Largo × Ancho × Alto. ¡Multiplicas las tres dimensiones y listo!",
            "diccionario": {"Prisma rectangular": "Cuerpo geométrico de caras planas con base rectangular."},
            "advertencia": "Asegúrate de multiplicar las tres dimensiones: base × fondo × altura. ¡No te saltes ninguna!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(3, 2),
            "interactivos": [
                {"pregunta": "Caja de largo 5, ancho 2, alto 2. Volumen:", "respuesta": "20", "feedback_acierto": "¡Correcto! 5 x 2 x 2 = 20.", "feedback_error": "Multiplica largo x ancho x alto (5x2x2)."},
                {"pregunta": "Cubo de lado 3. Volumen:", "respuesta": "27", "feedback_acierto": "¡Excelente! 3 x 3 x 3 = 27.", "feedback_error": "Multiplica 3x3x3."},
                {"pregunta": "Habitación 4x4x3. Volumen:", "respuesta": "48", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 4x4x3."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 3,
            "titulo": "Relación entre volumen cúbico y líquidos",
            "texto_descubrimiento": "¡Los cubos y los líquidos son mejores amigos! 💧 Existe una equivalencia directa entre el volumen y la capacidad de líquido.\nUn decímetro cúbico (dm³) es un cubo de 10x10x10 cm. Si lo llenas de agua, cabe exactamente un Litro (L) de líquido. ¡1 dm³ = 1 Litro! Y un centímetro cúbico (cm³) equivale a 1 mililitro (mL).",
            "diccionario": {"1 decímetro cúbico (dm³)": "Equivale exactamente a 1 Litro (L).", "1 centímetro cúbico (cm³)": "Equivale exactamente a 1 mililitro (mL)."},
            "advertencia": "¡Cuidado! Un metro cúbico (m³) es enorme. Contiene exactamente 1000 Litros de agua, no solo uno.",
            "ejemplos": obtener_ejemplos_expandidos_fase6(3, 3),
            "interactivos": [
                {"pregunta": "Un recipiente tiene 10 dm³. ¿Cuántos Litros de agua contiene?", "respuesta": "10", "feedback_acierto": "¡Correcto!", "feedback_error": "1 dm³ es igual a 1 Litro."},
                {"pregunta": "Una botella tiene 500 cm³. ¿Cuántos mL tiene?", "respuesta": "500", "feedback_acierto": "¡Excelente!", "feedback_error": "1 cm³ es igual a 1 mL."},
                {"pregunta": "Un tanque de 1 m³. ¿Cuántos Litros?", "respuesta": "1000", "feedback_acierto": "¡Brillante! Contiene 1000 L.", "feedback_error": "1 m³ contiene 1000 Litros."}
            ]
        },
        # --- MÓDULO 4: Medidas de Masa y Temperatura ---
        {
            "modulo_id": 4, "nivel_id": 1,
            "titulo": "Balanzas y Termómetros",
            "texto_descubrimiento": "¡En el laboratorio usamos herramientas! 🌡️ Las balanzas miden la masa (el peso de las cosas) y los termómetros miden qué tan caliente o frío está algo.\nPara pesos, 1 kilogramo (kg) equivale a 1000 gramos (g). Para temperaturas cotidianas, usamos la escala de grados Celsius (°C). ¡A aprender estas conversiones!",
            "diccionario": {"Kilogramo (kg)": "Unidad de masa (peso) que equivale a 1000 gramos.", "Grados Celsius (°C)": "Unidad de medida de la temperatura."},
            "advertencia": "Presta mucha atención a la unidad física de la pregunta: ¿kg o gramos?",
            "ejemplos": obtener_ejemplos_expandidos_fase6(4, 1),
            "interactivos": [
                {"pregunta": "¿Cuántos gramos hay en 3 kg?", "respuesta": "3000", "feedback_acierto": "¡Correcto! 3 x 1000 = 3000g.", "feedback_error": "Multiplica 3x1000."},
                {"pregunta": "Medio kilo (0,5 kg) son cuántos gramos:", "respuesta": "500", "feedback_acierto": "¡Excelente!", "feedback_error": "La mitad de 1000 es 500."},
                {"pregunta": "Si un termómetro sube de 10° a 25°, aumentó:", "respuesta": "15", "feedback_acierto": "¡Brillante! 25 - 10 = 15.", "feedback_error": "Resta la temperatura final menos la inicial: 25 - 10."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 2,
            "titulo": "Variaciones térmicas y signo negativo",
            "texto_descubrimiento": "¡Cuando hace muchísimo frío, el termómetro marca bajo cero! ❄️\nLas temperaturas por debajo del cero se escriben con un signo negativo (como -2°C). Si la temperatura está a 5°C y baja 7 grados, pasas por debajo del cero y quedas a -2°C. ¡Aprenderemos a movernos en la escala fría!",
            "diccionario": {"Temperatura negativa": "Valores por debajo del cero absoluto de congelación del agua."},
            "advertencia": "Cuando restas y bajas del cero, sumas las distancias. De 2° a -3° bajó 5 grados en total.",
            "ejemplos": obtener_ejemplos_expandidos_fase6(4, 2),
            "interactivos": [
                {"pregunta": "Temperatura inicial 2°. Baja 5°. ¿Nueva temperatura?", "respuesta": "-3", "feedback_acierto": "¡Correcto! 2 - 5 = -3.", "feedback_error": "2 - 5 = -3."},
                {"pregunta": "Temperatura inicial -4°. Sube 10°. ¿Nueva temperatura?", "respuesta": "6", "feedback_acierto": "¡Excelente! -4 + 10 = 6.", "feedback_error": "-4 + 10 = 6."},
                {"pregunta": "Estaba a 10°, ahora está a -5°. ¿Cuánto bajó?", "respuesta": "15", "feedback_acierto": "¡Brillante! 10 hasta 0 son 10, y 5 más son 15.", "feedback_error": "10 hasta 0 son 10, y de 0 a -5 son 5 más. Suma 10+5."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 3,
            "titulo": "La Máquina Kelvin",
            "texto_descubrimiento": "¡La ciencia espacial usa la escala Kelvin (K) para el espacio sideral! 👽\nConvertir grados Celsius a Kelvin es facilísimo con la regla mágica de la Máquina Kelvin: sumas <span class=\"keyword-highlight\">273</span>. Para ir de Kelvin a Celsius, restas 273. K = C + 273. ¡La escala Kelvin nunca tiene números negativos!",
            "diccionario": {"Escala Kelvin (K)": "Escala de temperatura científica absoluta donde el cero representa la inmovilidad de los átomos.", "Constante Kelvin": "El número 273 que usamos para convertir escalas."},
            "advertencia": "Kelvin no lleva el símbolo de grados (°). Escribimos simplemente 'K'. Y recuerda: ¡siempre sumas 273!",
            "ejemplos": obtener_ejemplos_expandidos_fase6(4, 3),
            "interactivos": [
                {"pregunta": "0°C en Kelvin es:", "respuesta": "273", "feedback_acierto": "¡Correcto! 0 + 273 = 273 K.", "feedback_error": "0 + 273."},
                {"pregunta": "100°C en Kelvin es:", "respuesta": "373", "feedback_acierto": "¡Excelente! 100 + 273 = 373 K.", "feedback_error": "100 + 273."},
                {"pregunta": "Si tengo 300 K, ¿cuántos grados Celsius son?", "respuesta": "27", "feedback_acierto": "¡Brillante! 300 - 273 = 27°C.", "feedback_error": "Resta 300 - 273."}
            ]
        }
    ]

    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE6_ID, **data)
        session.add(nt)

async def _gen_fase6_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    if mod_id == 1:
        if lvl_id == 1:
            # Poliedros: caras, vértices, aristas
            solid_type = rng.choice(["cubo", "prisma rectangular", "pirámide cuadrangular", "prisma triangular"])
            if solid_type == "cubo":
                param = rng.choice(["caras", "vértices", "aristas"])
                if param == "caras":
                    ans, expl = 6, "Un cubo tiene 6 caras cuadradas idénticas (tapa, base y 4 caras laterales)."
                elif param == "vértices":
                    ans, expl = 8, "Un cubo tiene 8 vértices (4 esquinas arriba y 4 abajo)."
                else:
                    ans, expl = 12, "Un cubo tiene 12 aristas (4 bordes arriba, 4 abajo y 4 bordes verticales)."
                enunciado = (
                    f"¿Cuántas {param} tiene un cubo regular?<br/>"
                    "<svg width='160' height='160' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                    "  <polygon points='60,20 90,35 60,50 30,35' fill='#3B82F6' fill-opacity='0.6' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='30,35 60,50 60,90 30,75' fill='#1D4ED8' fill-opacity='0.8' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='60,50 90,35 90,75 60,90' fill='#1E40AF' fill-opacity='0.8' stroke='#1E3A8A' stroke-width='2'/>"
                    "</svg>"
                )
            elif solid_type == "prisma rectangular":
                param = rng.choice(["caras", "vértices", "aristas"])
                if param == "caras":
                    ans, expl = 6, "Un prisma rectangular (como una caja de zapatos) tiene 6 caras rectangulares en total."
                elif param == "vértices":
                    ans, expl = 8, "Un prisma rectangular tiene 8 vértices (4 arriba y 4 abajo)."
                else:
                    ans, expl = 12, "Un prisma rectangular tiene 12 aristas en total."
                enunciado = (
                    f"¿Cuántas {param} tiene un prisma rectangular?<br/>"
                    "<svg width='160' height='160' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                    "  <polygon points='60,25 100,40 60,55 20,40' fill='#3B82F6' fill-opacity='0.6' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='20,40 60,55 60,95 20,80' fill='#1D4ED8' fill-opacity='0.8' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='60,55 100,40 100,80 60,95' fill='#1E40AF' fill-opacity='0.8' stroke='#1E3A8A' stroke-width='2'/>"
                    "</svg>"
                )
            elif solid_type == "pirámide cuadrangular":
                param = rng.choice(["caras", "vértices", "aristas"])
                if param == "caras":
                    ans, expl = 5, "Una pirámide cuadrangular tiene 5 caras (1 base cuadrada y 4 caras triangulares)."
                elif param == "vértices":
                    ans, expl = 5, "Una pirámide cuadrangular tiene 5 vértices (4 esquinas en la base y la cúspide)."
                else:
                    ans, expl = 8, "Una pirámide cuadrangular tiene 8 aristas (4 en la base cuadrada y 4 que suben a la punta)."
                enunciado = (
                    f"¿Cuántas {param} tiene una pirámide con base cuadrada (pirámide cuadrangular)?<br/>"
                    "<svg width='160' height='160' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                    "  <line x1='30' y1='80' x2='60' y2='65' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <line x1='90' y1='80' x2='60' y2='65' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <line x1='60' y1='65' x2='60' y2='25' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <polygon points='60,25 30,80 60,95' fill='#3B82F6' fill-opacity='0.6' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='60,25 60,95 90,80' fill='#1D4ED8' fill-opacity='0.8' stroke='#1E3A8A' stroke-width='2'/>"
                    "</svg>"
                )
            else: # prisma triangular
                param = rng.choice(["caras", "vértices", "aristas"])
                if param == "caras":
                    ans, expl = 5, "Un prisma triangular tiene 5 caras en total (2 bases triangulares y 3 caras laterales rectangulares)."
                elif param == "vértices":
                    ans, expl = 6, "Un prisma triangular tiene 6 vértices (3 esquinas en la base inferior y 3 en la superior)."
                else:
                    ans, expl = 9, "Un prisma triangular tiene 9 aristas (3 en la base de arriba, 3 abajo y 3 uniendo ambas bases)."
                enunciado = (
                    f"¿Cuántas {param} tiene un prisma triangular?<br/>"
                    "<svg width='160' height='160' viewBox='0 0 120 120' style='margin:10px auto; display:block; background:#111827; border:2px solid #3B82F6; border-radius:12px;'>"
                    "  <line x1='30' y1='40' x2='60' y2='25' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <line x1='90' y1='40' x2='60' y2='25' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <line x1='30' y1='80' x2='65' y2='65' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <line x1='90' y1='80' x2='65' y2='65' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <line x1='60' y1='25' x2='65' y2='65' stroke='#94A3B8' stroke-width='1.5' stroke-dasharray='3,3'/>"
                    "  <polygon points='30,40 30,80 75,95 75,55' fill='#3B82F6' fill-opacity='0.6' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='75,55 75,95 90,80 90,40' fill='#1D4ED8' fill-opacity='0.8' stroke='#1E3A8A' stroke-width='2'/>"
                    "  <polygon points='30,40 75,55 90,40' fill='#1E40AF' fill-opacity='0.5' stroke='#1E3A8A' stroke-width='2'/>"
                    "</svg>"
                )
            
            ans_str = str(ans)
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans+2), str(max(1, ans-3)), str(ans+4)]
            }
        elif lvl_id == 2:
            # Bloques ocultos (cubos isométricos)
            shape_idx = rng.randint(0, 3)
            if shape_idx == 0:
                cubes = [(0,0,0), (1,0,0), (0,1,0), (0,0,1)]
                total_cubes = 4
                ocultos = 0
            elif shape_idx == 1:
                cubes = [(0,0,0), (1,0,0), (0,1,0), (1,1,0), (0,0,1), (1,0,1), (0,1,1)]
                total_cubes = 7
                ocultos = 1
            elif shape_idx == 2:
                cubes = [(0,0,0), (1,0,0), (-1,0,0), (0,1,0), (0,-1,0), (0,0,1)]
                total_cubes = 6
                ocultos = 1
            else:
                cubes = [
                    (0,0,0), (1,0,0), (2,0,0),
                    (0,1,0), (1,1,0),
                    (0,2,0),
                    (0,0,1), (1,0,1),
                    (0,1,1),
                    (0,0,2)
                ]
                total_cubes = 10
                ocultos = 3

            cache_key = f"iso_cubes_{shape_idx}"
            if cache_key in _graphic_url_cache:
                url = _graphic_url_cache[cache_key]
            else:
                img_bytes = generate_isometric_cubes_image(cubes)
                url = await storage_service.upload_question_graphic(img_bytes, f"iso_cubes_{shape_idx}.png")
                _graphic_url_cache[cache_key] = url
                
            q_type = rng.choice(["total", "ocultos"])
            if q_type == "total":
                ans = total_cubes
                ans_str = str(ans)
                enunciado = "Observa la estructura tridimensional de bloques. Sabiendo que todos los bloques son cubos iguales de 1 cm³, ¿cuál es el volumen total (cantidad de cubos) de la figura?"
                datos_numericos = {"cubes": cubes, "tipo_visual": "imagen", "url": url}
                expl = f"Contamos los cubos piso por piso. Hay {total_cubes} cubos en total constituyendo el volumen de {total_cubes} cm³."
            else:
                ans = ocultos
                ans_str = str(ans)
                enunciado = "Observa la estructura de bloques. Algunos cubos están ocultos sirviendo de base para sostener los bloques que se ven arriba. ¿Cuántos cubos están completamente ocultos a la vista?"
                datos_numericos = {"cubes": cubes, "tipo_visual": "imagen", "url": url}
                expl = f"Los cubos en pisos superiores deben sostenerse sobre cubos de abajo. Hay exactamente {ocultos} cubo(s) oculto(s) en la base."

            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "datos_numericos": datos_numericos,
                "alts": [ans_str, str(ans+1), str(max(0, ans-1)), str(ans+2)]
            }
        else:
            # Moldes desplegados
            faces = rng.choice([6, 5, 4])
            if faces == 6:
                ans_str = "cubo"
                enunciado = "Si tienes un molde desplegado que consiste en 6 cuadrados iguales conectados en forma de cruz, ¿qué cuerpo tridimensional se forma al doblarlo?"
                expl = "Un cubo regular tiene exactamente 6 caras cuadradas idénticas."
                alts = ["cubo", "pirámide", "cilindro", "prisma triangular"]
            elif faces == 5:
                ans_str = "pirámide cuadrangular"
                enunciado = "Un molde desplegado tiene 1 cuadrado en el centro y 4 triángulos iguales pegados a sus lados. ¿Qué cuerpo 3D se forma al plegarlo?"
                expl = "El cuadrado forma la base y los 4 triángulos se unen en la punta, formando una pirámide cuadrangular."
                alts = ["pirámide cuadrangular", "cubo", "prisma rectangular", "cono"]
            else:
                ans_str = "tetraedro"
                enunciado = "Un molde desplegado está formado por 4 triángulos equiláteros iguales. ¿Qué poliedro regular de 4 caras se forma al armarlo?"
                expl = "Un tetraedro regular (pirámide triangular) tiene 4 caras que son triángulos equiláteros."
                alts = ["tetraedro", "cubo", "prisma triangular", "octaedro"]
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": alts
            }
    elif mod_id == 2:
        if lvl_id == 1:
            base = rng.choice([1, 2, 3])
            growth = rng.choice([2, 3, 4])
            etapa_target = rng.choice([4, 5])
            ans = base + (etapa_target - 1) * growth
            ans_str = str(ans)
            
            s1 = base
            s2 = base + growth
            s3 = base + 2*growth
            
            enunciado = f"Una sucesión de figuras con bloques crece etapa por etapa de forma constante. La Etapa 1 tiene {s1} bloque(s), la Etapa 2 tiene {s2} bloques, y la Etapa 3 tiene {s3} bloques. Si el patrón continúa igual, ¿cuántos bloques tendrá la Etapa {etapa_target}?"
            expl = f"El crecimiento es de +{growth} bloques por etapa ({s2} - {s1} = {growth}). Sumamos sucesivamente para llegar a la Etapa {etapa_target}: {ans} bloques."
            
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans + growth), str(ans - growth), str(ans + 1)]
            }
        elif lvl_id == 2:
            p3 = rng.choice([1, 2])
            p2 = rng.choice([4, 3])
            p1 = rng.choice([9, 8, 6])
            ans = p1 + p2 + p3
            ans_str = str(ans)
            
            cubes = []
            count1 = 0
            for x in range(3):
                for y in range(3):
                    if count1 < p1:
                        cubes.append((x, y, 0))
                        count1 += 1
            count2 = 0
            for x in range(2):
                for y in range(2):
                    if count2 < p2:
                        cubes.append((x, y, 1))
                        count2 += 1
            count3 = 0
            for x in range(1):
                for y in range(1):
                    if count3 < p3:
                        cubes.append((x, y, 2))
                        count3 += 1

            cache_key = f"iso_strat_{p1}_{p2}_{p3}"
            if cache_key in _graphic_url_cache:
                url = _graphic_url_cache[cache_key]
            else:
                img_bytes = generate_isometric_cubes_image(cubes)
                url = await storage_service.upload_question_graphic(img_bytes, f"iso_strat_{p1}_{p2}_{p3}.png")
                _graphic_url_cache[cache_key] = url

            enunciado = "Para calcular el volumen de esta estructura de cubos, contamos capa por capa (estratos). El piso inferior tiene {p1} bloques, el piso medio tiene {p2} bloques, y el superior {p3} bloque(s). ¿Cuál es el volumen total de la estructura en u³?"
            datos_numericos = {"cubes": cubes, "tipo_visual": "imagen", "url": url}
            expl = f"Sumamos las capas ordenadamente de abajo hacia arriba: {p1} (base) + {p2} (medio) + {p3} (superior) = {ans} unidades cúbicas (u³)."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "datos_numericos": datos_numericos,
                "alts": [ans_str, str(ans+2), str(ans-2), str(p1*p2)]
            }
        else:
            mult = rng.choice([2, 3, 5])
            add = rng.choice([1, 2, 4])
            n_val = rng.choice([10, 20])
            ans = n_val * mult + add
            ans_str = str(ans)
            
            enunciado = f"La regla general para calcular el número de bloques de una estructura en la etapa N es: <b>{mult}N + {add}</b>. ¿Cuántos bloques se necesitarán para construir la etapa N = {n_val}?"
            expl = f"Reemplazamos N por {n_val} en la fórmula: {mult} × ({n_val}) + {add} = {mult * n_val} + {add} = {ans} bloques."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans + mult), str(ans - add), str(n_val * mult)]
            }
    elif mod_id == 3:
        if lvl_id == 1:
            largo = rng.randint(2, 4)
            ancho = rng.randint(2, 3)
            alto = rng.randint(2, 3)
            ans = largo * ancho * alto
            ans_str = str(ans)
            
            cubes = [(x, y, z) for x in range(largo) for y in range(ancho) for z in range(alto)]
            
            cache_key = f"iso_vol_{largo}_{ancho}_{alto}"
            if cache_key in _graphic_url_cache:
                url = _graphic_url_cache[cache_key]
            else:
                img_bytes = generate_isometric_cubes_image(cubes)
                url = await storage_service.upload_question_graphic(img_bytes, f"iso_vol_{largo}_{ancho}_{alto}.png")
                _graphic_url_cache[cache_key] = url
                
            enunciado = "¿Cuántos cubitos de 1 u³ componen el prisma rectangular que se muestra en la imagen? (Volumen en u³)"
            datos_numericos = {"cubes": cubes, "tipo_visual": "imagen", "url": url}
            expl = f"Multiplicamos las dimensiones: {largo} de largo × {ancho} de ancho × {alto} de alto = {ans} cubos en total."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "datos_numericos": datos_numericos,
                "alts": [ans_str, str(ans+2), str(ans-2), str(largo+ancho+alto)]
            }
        elif lvl_id == 2:
            largo = rng.randint(3, 8)
            ancho = rng.randint(2, 5)
            alto = rng.randint(2, 6)
            ans = largo * ancho * alto
            ans_str = str(ans)
            
            enunciado = f"Calcula el volumen de una caja de cartón en forma de prisma rectangular que mide {largo} cm de largo, {ancho} cm de ancho y {alto} cm de alto."
            expl = f"Aplicamos la fórmula del volumen de un prisma: Largo × Ancho × Alto. Multiplicamos {largo} × {ancho} × {alto} = {ans} cm³."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans + 10), str(ans - 10), str(largo + ancho + alto)]
            }
        else:
            unit = rng.choice(["dm3_to_l", "cm3_to_ml", "m3_to_l"])
            if unit == "dm3_to_l":
                val = rng.randint(2, 20)
                ans = val
                ans_str = str(ans)
                enunciado = f"Un recipiente tiene una capacidad interior de {val} dm³. ¿Cuántos litros (L) de agua caben en él?"
                expl = "Como 1 decímetro cúbico (dm³) equivale exactamente a 1 litro (L), la cantidad es la misma."
            elif unit == "cm3_to_ml":
                val = rng.choice([250, 500, 750, 1000])
                ans = val
                ans_str = str(ans)
                enunciado = f"Un frasco contiene {val} cm³ de jarabe. ¿A cuántos mililitros (mL) equivale esta cantidad?"
                expl = "Como 1 centímetro cúbico (cm³) equivale exactamente a 1 mililitro (mL), la cantidad es la misma."
            else:
                val = rng.randint(1, 5)
                ans = val * 1000
                ans_str = str(ans)
                enunciado = f"Una piscina pequeña de agua inflable tiene un volumen de {val} m³. ¿Cuántos litros (L) de agua se necesitan para llenarla?"
                expl = "Como 1 metro cúbico (m³) equivale exactamente a 1000 litros (L), multiplicamos por 1000."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans//10 if ans > 10 else ans+1), str(ans*10 if ans < 1000 else ans-100), str(ans+10)]
            }
    else: # mod_id == 4
        if lvl_id == 1:
            q_type = rng.choice(["weight", "temp_read"])
            if q_type == "weight":
                kg = rng.choice([1.5, 2.0, 3.5, 5.0])
                ans = int(kg * 1000)
                ans_str = str(ans)
                enunciado = f"En una balanza electrónica, una bolsa de manzanas pesa {kg} kg. ¿Cuál es su masa equivalente en gramos (g)?"
                expl = f"Como 1 kilogramo (kg) equivale a 1000 gramos (g), multiplicamos {kg} × 1000 = {ans} g."
                alts = [ans_str, str(ans+500), str(int(kg*100)), str(int(kg*10))]
            else:
                temp = rng.randint(15, 38)
                ans_str = f"{temp}"
                cache_key = f"therm_{temp}"
                if cache_key in _graphic_url_cache:
                    url = _graphic_url_cache[cache_key]
                else:
                    img_bytes = generate_thermometer_image(float(temp))
                    url = await storage_service.upload_question_graphic(img_bytes, f"therm_{temp}.png")
                    _graphic_url_cache[cache_key] = url
                enunciado = f"Observa la escala del termómetro médico en la imagen. ¿Qué temperatura marca en grados Celsius (°C)?"
                datos_numericos = {
                    "url": url,
                    "tipo_visual": "termometro",
                    "valor": temp,
                    "min": 10,
                    "max": 45,
                    "unidad": "°C"
                }
                expl = f"El nivel del líquido rojo en la escala del termómetro coincide exactamente con la marca de {temp}°C."
                alts = [ans_str, str(temp + 5), str(temp - 5), str(temp + 10)]
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "datos_numericos": datos_numericos if q_type == "temp_read" else {},
                "alts": alts
            }
        elif lvl_id == 2:
            init_temp = rng.randint(1, 15)
            drop = rng.randint(init_temp + 2, init_temp + 10)
            ans = init_temp - drop
            ans_str = str(ans)
            
            cache_key = f"therm_neg_{ans}"
            if cache_key in _graphic_url_cache:
                url = _graphic_url_cache[cache_key]
            else:
                img_bytes = generate_thermometer_image(float(ans))
                url = await storage_service.upload_question_graphic(img_bytes, f"therm_{ans}.png")
                _graphic_url_cache[cache_key] = url

            enunciado = f"En la mañana la temperatura era de {init_temp}°C. Por la tarde, la temperatura bajó {drop}°C, llegando al nivel bajo cero mostrado en la imagen. ¿Cuál es la nueva temperatura en grados Celsius (°C)?"
            datos_numericos = {
                "url": url,
                "init": init_temp, "drop": drop, "final": ans,
                "tipo_visual": "termometro",
                "valor": ans,
                "min": -20,
                "max": 20,
                "unidad": "°C"
            }
            expl = f"Restamos la variación a la temperatura inicial: {init_temp} - {drop} = {ans}°C. Al bajar del cero, el resultado es negativo."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "datos_numericos": datos_numericos,
                "alts": [ans_str, str(ans - 2), str(-ans), str(init_temp + drop)]
            }
        else:
            celsius = rng.randint(-15, 45)
            ans = celsius + 273
            ans_str = str(ans)
            
            enunciado = f"En el laboratorio de física espacial, un sensor de gas registra una temperatura de {celsius}°C. ¿Cuál es esta temperatura expresada en la escala absoluta de Kelvin (K)?"
            expl = f"Para convertir grados Celsius a Kelvin, sumamos 273 a la temperatura en Celsius: {celsius} + 273 = {ans} K."
            return {
                "enunciado": enunciado,
                "respuesta_correcta": ans_str,
                "expl": expl,
                "alts": [ans_str, str(ans + 100), str(celsius - 273), str(celsius)]
            }

async def seed_practica_pool(session: AsyncSession):
    print("Sembrando pool de práctica Fase 6...")
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3),
        (4, 1), (4, 2), (4, 3)
    ]
    
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(120):
            rng = random.Random(FASE6_ID * 100000 + seccion_id * 1000 + i)
            q_data = await _gen_fase6_pool(rng, mod_id, lvl_id)
            
            p = Pregunta(
                fase_id=FASE6_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"], datos_numericos={"fase6": True},
                explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                estado=StatusEnum.ACTIVO
            )
            for idx, alt in enumerate(q_data["alts"]):
                is_correct = (alt == q_data["respuesta_correcta"])
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx+1))
            session.add(p)
    await session.commit()

async def seed_preguntas_desafios(session: AsyncSession):
    print("Sembrando pool de Desafíos de Fase 6 (30 preguntas por desafío)...")
    for modulo_id in range(1, 5):
        for desafio_id in (11, 12, 13):
            seccion_id = modulo_id * 1000 + desafio_id
            
            for idx in range(1, 31):
                rng = random.Random(FASE6_ID * 1000000 + seccion_id * 1000 + idx)
                lvl_id = rng.choice([1, 2, 3])
                q_data = await _gen_fase6_pool(rng, modulo_id, lvl_id)
                
                tipo_pregunta = TipoPreguntaEnum.MULTIPLE_OPCION if desafio_id in (11, 12) else TipoPreguntaEnum.RESPUESTA_NUMERICA
                if not q_data["respuesta_correcta"].lstrip('-').isdigit():
                    tipo_pregunta = TipoPreguntaEnum.MULTIPLE_OPCION
                
                p = Pregunta(
                    fase_id=FASE6_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                    tipo_pregunta=tipo_pregunta, enunciado=q_data["enunciado"],
                    respuesta_correcta=q_data["respuesta_correcta"], datos_numericos={"es_desafio": True},
                    explicacion_paso_a_paso={"titulo": "Desafío", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                    estado=StatusEnum.ACTIVO
                )
                
                if tipo_pregunta == TipoPreguntaEnum.MULTIPLE_OPCION:
                    for idx_alt, alt in enumerate(q_data["alts"]):
                        is_correct = (alt == q_data["respuesta_correcta"])
                        p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx_alt+1))
                session.add(p)
    await session.commit()

async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando configuraciones de progreso Fase 6...")
    
    # 1. Configuración por defecto de la Fase
    config_def = ConfiguracionProgreso(
        fase_id=FASE6_ID, seccion=0, operacion=OperacionEnum.MIXTA,
        cantidad_requerida=15, porcentaje_aprobacion=90, orden_desbloqueo=99,
        tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=60
    )
    session.add(config_def)
    
    # 2. Configuraciones de Niveles de Práctica Libre
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3),
        (4, 1), (4, 2), (4, 3)
    ]
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        config = ConfiguracionProgreso(
            fase_id=FASE6_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=10, porcentaje_aprobacion=80, orden_desbloqueo=seccion_id,
            tipo_feedback="completo", usa_cronometro=False, tiempo_default_segundos=0
        )
        session.add(config)
        
    # 3. Configuraciones de Desafíos por Módulo
    for mod_id in range(1, 5):
        # Desafío 11
        config_11 = ConfiguracionProgreso(
            fase_id=FASE6_ID, seccion=mod_id * 1000 + 11, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=20, porcentaje_aprobacion=90, orden_desbloqueo=mod_id * 1000 + 11,
            tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=25
        )
        session.add(config_11)
        # Desafío 12
        config_12 = ConfiguracionProgreso(
            fase_id=FASE6_ID, seccion=mod_id * 1000 + 12, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=20, porcentaje_aprobacion=90, orden_desbloqueo=mod_id * 1000 + 12,
            tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=40
        )
        session.add(config_12)
        # Desafío 13
        config_13 = ConfiguracionProgreso(
            fase_id=FASE6_ID, seccion=mod_id * 1000 + 13, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=10, porcentaje_aprobacion=90, orden_desbloqueo=mod_id * 1000 + 13,
            tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=50
        )
        session.add(config_13)
        
    await session.commit()

async def run_fase6_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 6...")
    from app.seed import should_seed_phase, update_seed_version, SEED_VERSIONS
    async with AsyncSessionLocal() as session:
        if not await should_seed_phase(session, "fase_6", FASE6_ID):
            return
        
        res = await session.execute(select(Fase).where(Fase.id == FASE6_ID))
        if not res.scalar_one_or_none():
            fase = Fase(id=FASE6_ID, nombre="Geometría Espacial, Volumen y Magnitudes Físicas", descripcion="Desarrollar la visualización tridimensional, el razonamiento abstracto analítico y la medición de magnitudes.", orden=6, estado=StatusEnum.ACTIVO)
            session.add(fase)
            await session.flush()
            
        await clear_fase6_data(session)
        await seed_teoria_niveles(session)
        await seed_configuracion_progreso(session)
        await seed_practica_pool(session)
        await seed_preguntas_desafios(session)
        await update_seed_version(session, "fase_6", SEED_VERSIONS.get("fase_6", "20260614_v1"))
        await session.commit()
    print("Fase 6 inyectada con éxito!")

if __name__ == "__main__":
    asyncio.run(run_fase6_seed())
