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
from app.fase5.theory_examples import obtener_ejemplos_expandidos_fase5

from app.utils.graphics_generator import generate_grid_shape_image
from app.core.storage import storage_service

FASE5_ID = 5

# --- DICCIONARIOS DE CONTEXTO FASE 5 ---
NOMBRES = ["Leo", "Emma", "Thiago", "Mia", "Hugo", "Alba"]
ESCENARIOS_P = ["patio", "jardín", "cuadro de pintura", "campo de fútbol"]
ESCENARIOS_A = ["alfombra", "piscina", "mosaico", "pista de baile"]
ESCENARIOS_E = ["mapa del tesoro", "plano de la ciudad", "maqueta escolar"]

# Cache en memoria para reutilizar URLs de gráficos generados
_graphic_url_cache: Dict[str, str] = {}

async def clear_fase5_data(session: AsyncSession):
    print("Purging existing Fase 5 data for a clean overwrite...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE5_ID))
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
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE5_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE5_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE5_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE5_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE5_ID))
    await session.commit()
    print("Fase 5 data purged.")

async def seed_teoria_niveles(session: AsyncSession):
    print("Sembrando guión de textos (NivelTeoria) para Fase 5...")
    
    niveles_teoria = [
        # --- MÓDULO 1: Perímetro y Borde ---
        {
            "modulo_id": 1, "nivel_id": 1,
            "titulo": "Conteo directo de unidades lineales",
            "texto_descubrimiento": "¡Hola, exploradora del espacio! 🚀 ¿Sabías que las figuras geométricas tienen 'fronteras'? El perímetro es la suma de todo el borde exterior de una figura.\nImagínate a una pequeña hormiguita caminando justo por la línea más externa de tu dibujo. En este nivel, vas a contar cada rayita de la cuadrícula por la que camina la hormiguita para dar una vuelta completa. ¡Es muy fácil y divertido!",
            "diccionario": {"Perímetro": "Es la suma de las longitudes de todos los lados que forman el borde de una figura."},
            "advertencia": "¡Atención, pequeña detective! No vayas a contar las líneas que están adentro del dibujo. A la hormiguita solo le gusta caminar por el borde exterior.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(1, 1),
            "interactivos": [
                {"pregunta": "Un rectángulo tiene lados de 3 y 4 unidades. ¿Cuál es su perímetro?", "respuesta": "14", "feedback_acierto": "¡Correcto! Sumamos 3 + 4 + 3 + 4 = 14.", "feedback_error": "Recuerda sumar todos los bordes externos: 3+4+3+4."},
                {"pregunta": "Un cuadrado tiene un lado que mide 5. Su perímetro es:", "respuesta": "20", "feedback_acierto": "¡Excelente! Los cuatro lados miden 5, así que 5 x 4 = 20.", "feedback_error": "Multiplica el lado por 4 porque un cuadrado tiene 4 lados iguales: 5x4."},
                {"pregunta": "El perímetro de un triángulo equilátero con lado de 6 es:", "respuesta": "18", "feedback_acierto": "¡Brillante! Sumamos los 3 lados: 6 + 6 + 6 = 18.", "feedback_error": "Suma los tres lados del triángulo: 6+6+6."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 2,
            "titulo": "Cálculo analítico de perímetros sumando magnitudes",
            "texto_descubrimiento": "¡Ahora vamos a ser ingenieras! 📐 A veces las figuras no están dibujadas sobre una cuadrícula de juego. En ese caso, ¡no podemos contar rayitas! Pero no te preocupes, porque las figuras nos revelan cuánto mide cada uno de sus lados.\nPara hallar el perímetro, solo debemos sumar los números de todos los lados de la figura. ¡Como una gran suma de equipo!",
            "diccionario": {"Lado (Arista)": "El segmento de línea que une dos esquinas de la figura."},
            "advertencia": "Asegúrate de sumar absolutamente TODOS los lados. Si dejas un lado olvidado en el camino, ¡el perímetro quedará incompleto!",
            "ejemplos": obtener_ejemplos_expandidos_fase5(1, 2),
            "interactivos": [
                {"pregunta": "Una figura tiene cuatro lados que miden: 2, 3, 2 y 3. Perímetro:", "respuesta": "10", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma: 2+3+2+3."},
                {"pregunta": "Una estrella de 5 lados tiene cada lado de 1. Perímetro:", "respuesta": "5", "feedback_acierto": "¡Excelente!", "feedback_error": "Suma los cinco lados de 1: 1+1+1+1+1."},
                {"pregunta": "Un rectángulo mide 10 de largo y 5 de ancho. Perímetro:", "respuesta": "30", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma los cuatro lados: 10+5+10+5."}
            ]
        },
        {
            "modulo_id": 1, "nivel_id": 3,
            "titulo": "Conversión de unidades de longitud",
            "texto_descubrimiento": "Las medidas de longitud pueden usar diferentes 'apellidos' según qué tan grandes sean: milímetros (para hormiguitas), centímetros (para lápices), decímetros, metros (para ti) y kilómetros (para autos).\nPara comparar perímetros, necesitamos que todos usen el mismo apellido. ¡Aprenderemos a convertir estas unidades usando una escalera mágica!",
            "diccionario": {"1 metro (m)": "Equivale a 100 centímetros (cm)", "1 kilómetro (km)": "Equivale a 1000 metros (m)"},
            "advertencia": "Si vas a un paso más pequeño, multiplicas. Si vas a un paso más grande, divides. ¡Fíjate bien si subes o bajas en la escalera!",
            "ejemplos": obtener_ejemplos_expandidos_fase5(1, 3),
            "interactivos": [
                {"pregunta": "¿Cuántos centímetros hay en 3 metros?", "respuesta": "300", "feedback_acierto": "¡Correcto! 3 x 100 = 300 cm.", "feedback_error": "Multiplica los metros por 100."},
                {"pregunta": "¿Cuántos metros hay en 5 kilómetros?", "respuesta": "5000", "feedback_acierto": "¡Excelente! 5 x 1000 = 5000 m.", "feedback_error": "Multiplica los kilómetros por 1000."},
                {"pregunta": "¿Cuántos milímetros hay en 2 centímetros?", "respuesta": "20", "feedback_acierto": "¡Brillante! 2 x 10 = 20 mm.", "feedback_error": "Multiplica los centímetros por 10."}
            ]
        },
        # --- MÓDULO 2: Área en Malha ---
        {
            "modulo_id": 2, "nivel_id": 1,
            "titulo": "Conteo analítico de unidades confinadas",
            "texto_descubrimiento": "El área es la medida de la superficie de una figura. Imagina que quieres cubrir el suelo de tu habitación con baldosas.\nEn una cuadrícula, el área nos dice cuántos cuadraditos completos caben adentro de una figura geométrica. Mientras el perímetro mide el borde, el área mide el interior relleno. ¡A contar baldosas!",
            "diccionario": {"Área": "La cantidad de espacio o cuadraditos que caben dentro del contorno de una figura."},
            "advertencia": "No te confundas con el perímetro. Aquí no medimos la frontera, medimos todo lo que está pintado adentro.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(2, 1),
            "interactivos": [
                {"pregunta": "¿Cuál es el área de un cuadrado de 4x4 unidades?", "respuesta": "16", "feedback_acierto": "¡Correcto! 4 filas de 4 cuadraditos = 16.", "feedback_error": "Multiplica base por altura (4x4) o cuenta todos los cuadros."},
                {"pregunta": "Un rectángulo mide 5 de base y 2 de altura. Su área es:", "respuesta": "10", "feedback_acierto": "¡Excelente! 5 x 2 = 10.", "feedback_error": "Multiplica 5x2."},
                {"pregunta": "Si pinto 3 filas de 3 cuadros, ¿cuál es el área?", "respuesta": "9", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 3x3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 2,
            "titulo": "Fusión de sectores triangulares",
            "texto_descubrimiento": "¡A veces las figuras tienen cortes inclinados! Si cortas un cuadrado en diagonal, obtienes dos mitades (triángulos iguales).\nLa regla mágica es: si juntas dos mitades triangulares iguales, ¡hacen exactamente un cuadrado entero! Es como armar un rompecabezas: 1/2 + 1/2 = 1. ¡Une las piezas para contar enteros!",
            "diccionario": {"Fusión de áreas": "Juntar dos mitades de cuadrado para formar una unidad cuadrada entera."},
            "advertencia": "¡Cuidado al contar! Agrupa las mitades de dos en dos para formar nuevos enteros y no te quedes a la mitad.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(2, 2),
            "interactivos": [
                {"pregunta": "Si tengo 4 cuadrados enteros y 2 mitades. Área total:", "respuesta": "5", "feedback_acierto": "¡Correcto! 4 enteros + 1 entero de las mitades = 5.", "feedback_error": "Las dos mitades forman 1 entero."},
                {"pregunta": "Figura con 0 enteros y 4 mitades. Área:", "respuesta": "2", "feedback_acierto": "¡Excelente! 4 mitades son 2 enteros.", "feedback_error": "4 mitades divididas entre 2 da 2 enteros."},
                {"pregunta": "Si tengo 10 enteros y 6 mitades, área total:", "respuesta": "13", "feedback_acierto": "¡Brillante! 6 mitades son 3 enteros.", "feedback_error": "6 mitades son 3 enteros. Suma 10+3."}
            ]
        },
        {
            "modulo_id": 2, "nivel_id": 3,
            "titulo": "Estimación analítica de áreas irregulares",
            "texto_descubrimiento": "Las figuras en la naturaleza (como hojas de árboles o lagunas) son irregulares y no encajan perfecto en la cuadrícula.\nPara calcular su área en mallas densas, contamos todos los cuadrados que están completamente llenos y luego estimamos y sumamos las mitades o esquinas. ¡Una gran aventura de aproximación!",
            "diccionario": {"Área irregular": "Figura que no tiene lados rectos ni formas clásicas predefinidas."},
            "advertencia": "Usa una estrategia ordenada: primero marca los enteros y luego combina las fracciones sobrantes.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(2, 3),
            "interactivos": [
                {"pregunta": "¿Cuánto es 8 enteros más 8 mitades?", "respuesta": "12", "feedback_acierto": "¡Correcto!", "feedback_error": "8 mitades son 4 enteros. 8 + 4 = 12."},
                {"pregunta": "¿Cuánto es 12 enteros más 2 mitades?", "respuesta": "13", "feedback_acierto": "¡Excelente!", "feedback_error": "2 mitades son 1 entero. 12 + 1 = 13."},
                {"pregunta": "Si un polígono ocupa 5 enteros y 4 mitades, su área es:", "respuesta": "7", "feedback_acierto": "¡Brillante!", "feedback_error": "4 mitades = 2. 5 + 2 = 7."}
            ]
        },
        # --- MÓDULO 3: Figuras Compuestas y Simetría ---
        {
            "modulo_id": 3, "nivel_id": 1,
            "titulo": "Descomposición estructural de polígonos",
            "texto_descubrimiento": "¡Las figuras compuestas son como castillos armados con bloques simples! Si tienes una figura en forma de 'L', de cruz o de casita, no hay fórmulas directas para ellas.\nPero si las dividimos con una línea imaginaria, podemos separarlas en rectángulos y cuadrados simples. Calculas el área de cada pieza y luego las sumas. ¡Divide y vencerás!",
            "diccionario": {"Descomponer": "Dividir una figura compleja en partes geométricas simples conocidas."},
            "advertencia": "¡Cuidado al dividir! Las partes no deben superponerse (encimarse) ni debes dejar huecos sin contar.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(3, 1),
            "interactivos": [
                {"pregunta": "Un rectángulo de 10 u² y otro de 8 u² pegados suman:", "respuesta": "18", "feedback_acierto": "¡Correcto!", "feedback_error": "Suma ambas áreas."},
                {"pregunta": "Figura T compuesta por un techo de 12 u² y una base de 4 u². Área:", "respuesta": "16", "feedback_acierto": "¡Excelente!", "feedback_error": "Suma 12+4."},
                {"pregunta": "Una 'L' de 15 u² en el alto y 5 u² en el piso. Total:", "respuesta": "20", "feedback_acierto": "¡Brillante!", "feedback_error": "Suma 15+5."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 2,
            "titulo": "Análisis de conservación del área mediante Tangram",
            "texto_descubrimiento": "¡El Tangram es un juego mágico chino de 7 piezas! Puedes armar un gato, una casa, un pato o un barco.\nLo fabuloso es que, sin importar la forma que crees, si usas las mismas piezas, ¡el área total de la figura sigue siendo exactamente la misma! El área se conserva porque las piezas no cambian de tamaño al moverlas.",
            "diccionario": {"Conservación del área": "El área de un objeto no cambia cuando este cambia de forma o de posición."},
            "advertencia": "Aunque una figura parezca más grande por estar estirada, si usa las mismas piezas, su área sigue siendo igual. ¡No te dejes engañar por el ojo!",
            "ejemplos": obtener_ejemplos_expandidos_fase5(3, 2),
            "interactivos": [
                {"pregunta": "Si un triángulo de 3 u² se rota, su nueva área es:", "respuesta": "3", "feedback_acierto": "¡Correcto! Rotar no cambia el área.", "feedback_error": "Rotar no cambia el área."},
                {"pregunta": "Corto un papel de 10 u² en dos piezas. ¿Cuánto suman las dos piezas juntas?", "respuesta": "10", "feedback_acierto": "¡Excelente! Siguen sumando lo mismo que al principio.", "feedback_error": "Suman lo mismo que el original."},
                {"pregunta": "Armo una casa con un Tangram de 16 u². El área de la casa es:", "respuesta": "16", "feedback_acierto": "¡Brillante!", "feedback_error": "El área se conserva al usar todas las piezas."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 3,
            "titulo": "Cálculo analítico de áreas sombreadas",
            "texto_descubrimiento": "A veces nos piden el área de una zona pintada que tiene un hueco o agujero adentro (como una dona o un marco de fotos).\nPara resolver esto, usamos la resta geométrica: calculas el área de la figura exterior grande, calculas el área del hueco blanco interior, y las restas. ¡Le quitamos el agujero al total!",
            "diccionario": {"Resta geométrica": "Resta del área total menos el área del hueco blanco."},
            "advertencia": "Asegúrate de calcular primero las dos áreas por separado antes de restarlas.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(3, 3),
            "interactivos": [
                {"pregunta": "Área exterior 50, área interior en blanco 10. ¿Área pintada?", "respuesta": "40", "feedback_acierto": "¡Correcto! 50 - 10 = 40.", "feedback_error": "Resta 50 - 10."},
                {"pregunta": "Caja de 100 cm² con agujero de 25 cm². Área restante:", "respuesta": "75", "feedback_acierto": "¡Excelente!", "feedback_error": "Resta 100 - 25."},
                {"pregunta": "Pared de 20 u² con ventana de 4 u². ¿Área a pintar?", "respuesta": "16", "feedback_acierto": "¡Brillante!", "feedback_error": "Resta 20 - 4."}
            ]
        },
        {
            "modulo_id": 3, "nivel_id": 4,
            "titulo": "Identificación de Ejes de Simetría",
            "texto_descubrimiento": "¡La simetría es la magia del espejo! Un eje de simetría es una línea que divide una figura exactamente por la mitad.\nSi doblas la figura por esa línea, las dos mitades deben coincidir perfectamente, esquina con esquina. ¡Como tus manos al aplaudir o las alas de una mariposa!",
            "diccionario": {"Eje de simetría": "Línea imaginaria que divide una figura en dos partes iguales que son reflejos una de otra."},
            "advertencia": "Algunas figuras parecen simétricas, pero si las doblas a la mitad no coinciden. ¡Verifica el doblez en tu mente!",
            "ejemplos": obtener_ejemplos_expandidos_fase5(3, 4),
            "interactivos": [
                {"pregunta": "¿Cuántos ejes de simetría tiene un círculo (escribe: infinitos)?", "respuesta": "infinitos", "feedback_acierto": "¡Correcto! El círculo es perfectamente simétrico en cualquier dirección.", "feedback_error": "El círculo es perfectamente simétrico en cualquier diámetro. Escribe 'infinitos'."},
                {"pregunta": "¿Cuántos ejes de simetría tiene un cuadrado perfecto?", "respuesta": "4", "feedback_acierto": "¡Excelente!", "feedback_error": "Un cuadrado tiene vertical, horizontal y dos diagonales (4 en total)."},
                {"pregunta": "¿Cuántos ejes tiene un triángulo equilátero?", "respuesta": "3", "feedback_acierto": "¡Brillante!", "feedback_error": "Desde cada esquina al lado opuesto."}
            ]
        },
        # --- MÓDULO 4: Conversión y Pantallas ---
        {
            "modulo_id": 4, "nivel_id": 1,
            "titulo": "Interpretación de la escala gráfica base",
            "texto_descubrimiento": "¡Los mapas son versiones mini de la vida real! Como no podemos cargar un mapa del tamaño de una ciudad, usamos escalas.\nLa escala gráfica nos dice la correspondencia: por ejemplo, '1 unidad en el papel representa 10 metros en la realidad'. Así, multiplicando la medida del mapa por el valor de escala, ¡descubrimos distancias reales!",
            "diccionario": {"Escala gráfica": "Barra dividida en segmentos que muestra la relación entre las distancias del plano y las reales."},
            "advertencia": "No olvides multiplicar por la escala. La regla de la escala gráfica siempre funciona multiplicando.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(4, 1),
            "interactivos": [
                {"pregunta": "Escala 1 u = 10m. Si un borde mide 4 u, ¿cuántos metros son?", "respuesta": "40", "feedback_acierto": "¡Correcto! 4 x 10 = 40m.", "feedback_error": "Multiplica 4x10."},
                {"pregunta": "Escala 1 u = 5km. Viajo 6 u. ¿Distancia real?", "respuesta": "30", "feedback_acierto": "¡Excelente! 6 x 5 = 30km.", "feedback_error": "Multiplica 6x5."},
                {"pregunta": "Escala 1 u = 2m. Altura de 15 u en el plano. ¿Altura real?", "respuesta": "30", "feedback_acierto": "¡Brillante!", "feedback_error": "Multiplica 15x2."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 2,
            "titulo": "Modelado analítico de la diagonal (pantallas)",
            "texto_descubrimiento": "Cuando compramos una pantalla de televisión, de celular o tablet, nos dicen su tamaño en pulgadas (por ejemplo, 32 pulgadas o 50 pulgadas).\n¡Pero esa medida no es el ancho ni el alto! El tamaño de las pantallas siempre se mide en línea recta cruzando desde una esquina hasta la esquina contraria. ¡Eso es la diagonal!",
            "diccionario": {"Diagonal": "Segmento de recta que une dos vértices (esquinas) no consecutivos de un polígono."},
            "advertencia": "La diagonal siempre es el lado más largo de la pantalla. ¡Es mayor que la base y mayor que la altura!",
            "ejemplos": obtener_ejemplos_expandidos_fase5(4, 2),
            "interactivos": [
                {"pregunta": "Si un monitor se anuncia como '24 pulgadas', ¿qué mide 24 pulgadas? (escribe: la diagonal)", "respuesta": "la diagonal", "feedback_acierto": "¡Correcto! Se mide en diagonal.", "feedback_error": "Las pantallas se miden en diagonal. Escribe 'la diagonal'."},
                {"pregunta": "En un rectángulo de 3x4, ¿la diagonal mide 5? (Escribe 1 para SÍ, 2 para NO)", "respuesta": "1", "feedback_acierto": "¡Excelente!", "feedback_error": "Sí, 3^2 + 4^2 = 5^2. Escribe 1."},
                {"pregunta": "¿Qué es más largo en un TV, la base o la diagonal? (escribe: diagonal)", "respuesta": "diagonal", "feedback_acierto": "¡Brillante!", "feedback_error": "La diagonal siempre es la más larga. Escribe 'diagonal'."}
            ]
        },
        {
            "modulo_id": 4, "nivel_id": 3,
            "titulo": "Conversión de unidades de superficie",
            "texto_descubrimiento": "¡Cuidado con las unidades al cuadrado! Cuando medimos área, medimos en dos dimensiones (ancho × alto).\nPor eso, 1 metro lineal son 100 centímetros, ¡pero 1 metro cuadrado (m²) son 100 cm × 100 cm = 10,000 cm²! Para convertir áreas, aplicamos la escala dos veces (la escala al cuadrado). ¡Las superficies crecen muy rápido!",
            "diccionario": {"Metro cuadrado (m²)": "Área de un cuadrado que mide 1 metro de lado (equivalente a 10,000 cm²)."},
            "advertencia": "Confusión clásica: al convertir unidades de área (superficie), recuerda multiplicar por la conversión al cuadrado, no por la lineal.",
            "ejemplos": obtener_ejemplos_expandidos_fase5(4, 3),
            "interactivos": [
                {"pregunta": "¿Cuántos centímetros cuadrados hay en 1 m²?", "respuesta": "10000", "feedback_acierto": "¡Correcto! 100 x 100 = 10,000.", "feedback_error": "Multiplica 100x100 para hallar los cm²."},
                {"pregunta": "Si 1 dm = 10 cm, ¿cuántos cm² hay en 1 dm²?", "respuesta": "100", "feedback_acierto": "¡Excelente! 10 x 10 = 100.", "feedback_error": "Multiplica 10x10."},
                {"pregunta": "Si 1 m = 10 dm, ¿cuántos dm² hay en 2 m²?", "respuesta": "200", "feedback_acierto": "¡Brillante! 1 m² = 100 dm², entonces 2 m² = 200 dm².", "feedback_error": "1 m² = 100 dm². Multiplica por 2."}
            ]
        }
    ]
    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE5_ID, **data)
        session.add(nt)

async def _gen_fase5_pool(rng: random.Random, mod_id: int, lvl_id: int) -> dict:
    nombre = rng.choice(NOMBRES)
    errores_previstos = {}

    if mod_id == 1:
        # Perímetro
        a = rng.randint(3, 8)
        b = rng.randint(3, 8)
        ans = 2 * (a + b)
        ans_str = str(ans)
        escenario = rng.choice(ESCENARIOS_P)
        
        # Generar gráfico para cuadrícula de perímetro
        cache_key = f"grid_p_{a}_{b}"
        if cache_key in _graphic_url_cache:
            url = _graphic_url_cache[cache_key]
        else:
            vertices = [(1, 1), (1 + a, 1), (1 + a, 1 + b), (1, 1 + b)]
            img_bytes = generate_grid_shape_image(vertices, grid_size=(max(10, a + 3), max(10, b + 3)), fill_color=(56, 189, 248, 40), outline_color=(56, 189, 248, 255))
            url = await storage_service.upload_question_graphic(img_bytes, f"grid_p_{a}_{b}.png")
            _graphic_url_cache[cache_key] = url
            
        errores_previstos[str(a*b)] = "Calculaste el área (base por altura) en lugar del perímetro (sumar los bordes)."
        errores_previstos[str(a+b)] = "Solo sumaste dos lados. Recuerda que un rectángulo tiene 4 lados."
            
        return {
            "enunciado": f"{nombre} quiere cercar su {escenario} rectangular. En el plano de arriba, los lados miden {a} y {b} unidades. Calcula el perímetro total.",
            "datos_numericos": {"tipo_visual": "imagen", "url": url},
            "respuesta_correcta": ans_str,
            "errores_previstos": errores_previstos,
            "expl": f"Sumamos los 4 lados del rectángulo: {a} + {b} + {a} + {b} = {ans} unidades.",
            "alts": [ans_str, str(a*b), str(a+b), str(ans+4)]
        }
    elif mod_id == 2:
        # Área
        a = rng.randint(3, 7)
        b = rng.randint(3, 7)
        ans = a * b
        ans_str = str(ans)
        escenario = rng.choice(ESCENARIOS_A)
        
        # Generar gráfico para cuadrícula de área
        cache_key = f"grid_a_{a}_{b}"
        if cache_key in _graphic_url_cache:
            url = _graphic_url_cache[cache_key]
        else:
            vertices = [(1, 1), (1 + a, 1), (1 + a, 1 + b), (1, 1 + b)]
            img_bytes = generate_grid_shape_image(vertices, grid_size=(max(10, a + 3), max(10, b + 3)), fill_color=(168, 85, 247, 60), outline_color=(168, 85, 247, 255))
            url = await storage_service.upload_question_graphic(img_bytes, f"grid_a_{a}_{b}.png")
            _graphic_url_cache[cache_key] = url
            
        errores_previstos[str(2*(a+b))] = "Calculaste el perímetro (sumar bordes) en lugar del área (multiplicar dimensiones)."
        errores_previstos[str(a+b)] = "Sumaste la base y la altura en lugar de multiplicarlas."
            
        return {
            "enunciado": f"{nombre} necesita cubrir su {escenario} rectangular con baldosas. La base mide {a} y la altura {b}. Calcula el área total.",
            "datos_numericos": {"tipo_visual": "imagen", "url": url},
            "respuesta_correcta": ans_str,
            "errores_previstos": errores_previstos,
            "expl": f"Multiplicamos base por altura: {a} × {b} = {ans} unidades cuadradas.",
            "alts": [ans_str, str(2*(a+b)), str(a+b), str(ans+3)]
        }
    elif mod_id == 3:
        # Figuras compuestas
        if lvl_id == 4: # Simetría
            ejes = rng.choice([2, 4, 3])
            fig = "rectángulo" if ejes == 2 else "cuadrado" if ejes == 4 else "triángulo equilátero"
            ans_str = str(ejes)
            
            errores_previstos["0"] = "Esa figura sí tiene ejes de simetría. Imagina doblarla por la mitad."
            
            return {
                "enunciado": f"En la clase de arte, {nombre} dibujó un {fig}. ¿Cuántos ejes de simetría tiene esta figura?",
                "respuesta_correcta": ans_str,
                "errores_previstos": errores_previstos,
                "expl": f"El {fig} se puede doblar simétricamente de {ejes} formas distintas.",
                "alts": [ans_str, "0", "1", "6"]
            }
        else:
            ext = rng.randint(40, 100)
            int_h = rng.randint(5, 25)
            ans = ext - int_h
            ans_str = str(ans)
            
            errores_previstos[str(ext+int_h)] = "Sumaste las áreas. Recuerda que el hueco interior debe RESTARSE."
            
            return {
                "enunciado": f"{nombre} construyó un marco rectangular que tiene un área total exterior de {ext} cm² y un hueco interior de {int_h} cm² para colocar una foto. ¿Cuál es el área sombreada del marco?",
                "respuesta_correcta": ans_str,
                "errores_previstos": errores_previstos,
                "expl": f"Restamos el área interior del área total: {ext} - {int_h} = {ans} cm².",
                "alts": [ans_str, str(ext+int_h), str(ans+5), str(ans-5)]
            }
    else:
        # Escala, diagonal y superficie
        if lvl_id == 1:
            scale = rng.choice([2, 5, 10])
            u = rng.randint(3, 12)
            ans = u * scale
            ans_str = str(ans)
            escenario_e = rng.choice(ESCENARIOS_E)
            
            errores_previstos[str(u+scale)] = "Sumaste la unidad con la escala. Debes multiplicar para aplicar la escala."
            
            return {
                "enunciado": f"{nombre} está observando un {escenario_e} donde la escala es 1 u = {scale} metros. Si una calle mide {u} u en el plano, ¿cuál es su longitud real?",
                "respuesta_correcta": ans_str,
                "errores_previstos": errores_previstos,
                "expl": f"Multiplicamos las unidades del mapa por la escala: {u} × {scale} = {ans} metros.",
                "alts": [ans_str, str(u+scale), str(ans+u), str(ans-scale)]
            }
        elif lvl_id == 2:
            ans_str = "la diagonal"
            return {
                "enunciado": f"Cuando {nombre} va a comprar un televisor, ¿qué línea de medida física se utiliza universalmente para anunciar su tamaño en pulgadas?",
                "respuesta_correcta": ans_str,
                "errores_previstos": {},
                "expl": "El tamaño de las pantallas de TV y celulares se mide en pulgadas a lo largo de su diagonal.",
                "alts": [ans_str, "la base", "la altura", "el perímetro"]
            }
        else:
            m2 = rng.randint(1, 8)
            ans = m2 * 10000
            ans_str = str(ans)
            
            errores_previstos[str(m2*100)] = "Multiplicaste por 100 como si fuera longitud lineal. En área (m² a cm²) debes multiplicar por 100x100 (10,000)."
            
            return {
                "enunciado": f"{nombre} quiere saber: ¿Cuántos centímetros cuadrados (cm²) equivalen a {m2} metro(s) cuadrado(s) (m²)?",
                "respuesta_correcta": ans_str,
                "errores_previstos": errores_previstos,
                "expl": f"Como 1 m² = 10,000 cm², multiplicamos {m2} × 10,000 = {ans} cm².",
                "alts": [ans_str, str(m2*100), str(m2*1000), str(m2*100000)]
            }

async def seed_practica_pool(session: AsyncSession):
    print("Sembrando pool de práctica Fase 5...")
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3), (3, 4),
        (4, 1), (4, 2), (4, 3)
    ]
    
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(120):
            rng = random.Random(FASE5_ID * 100000 + seccion_id * 1000 + i)
            q_data = await _gen_fase5_pool(rng, mod_id, lvl_id)
            
            
            datos_finales = {"fase5": True}
            if "datos_numericos" in q_data:
                datos_finales.update(q_data["datos_numericos"])
            
            p = Pregunta(
                fase_id=FASE5_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"], datos_numericos=datos_finales,
                errores_previstos=q_data.get("errores_previstos", {}),
                explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                estado=StatusEnum.ACTIVO
            )
            for idx, alt in enumerate(q_data["alts"]):
                is_correct = (alt == q_data["respuesta_correcta"])
                error_msg = q_data.get("errores_previstos", {}).get(alt, "Esa alternativa es incorrecta.") if not is_correct else None
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx+1, tipo_error=TipoErrorEnum.CALCULO if not is_correct else None, feedback_error=error_msg))
            session.add(p)
    await session.commit()

async def seed_preguntas_desafios(session: AsyncSession):
    print("Sembrando pool de Desafíos de Fase 5 (30 preguntas por desafío)...")
    for modulo_id in range(1, 5):
        for desafio_id in (11, 12, 13):
            seccion_id = modulo_id * 1000 + desafio_id
            
            for idx in range(1, 31):
                rng = random.Random(FASE5_ID * 1000000 + seccion_id * 1000 + idx)
                q_data = await _gen_fase5_pool(rng, modulo_id, 2)
                
                tipo_pregunta = TipoPreguntaEnum.MULTIPLE_OPCION if desafio_id in (11, 12) else TipoPreguntaEnum.RESPUESTA_NUMERICA
                if q_data["respuesta_correcta"] == "la diagonal":
                    tipo_pregunta = TipoPreguntaEnum.RESPUESTA_NUMERICA
                
                datos_finales = {"es_desafio": True}
                if "datos_numericos" in q_data:
                    datos_finales.update(q_data["datos_numericos"])
                
                p = Pregunta(
                    fase_id=FASE5_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                    tipo_pregunta=tipo_pregunta, enunciado=q_data["enunciado"],
                    respuesta_correcta=q_data["respuesta_correcta"], datos_numericos=datos_finales,
                    errores_previstos=q_data.get("errores_previstos", {}),
                    explicacion_paso_a_paso={"titulo": "Desafío", "pasos": [{"orden": 1, "texto": q_data["expl"]}]},
                    estado=StatusEnum.ACTIVO
                )
                
                if tipo_pregunta == TipoPreguntaEnum.MULTIPLE_OPCION:
                    for idx_alt, alt in enumerate(q_data["alts"]):
                        is_correct = (alt == q_data["respuesta_correcta"])
                        error_msg = q_data.get("errores_previstos", {}).get(alt, "Esa alternativa es incorrecta.") if not is_correct else None
                        p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx_alt+1, tipo_error=TipoErrorEnum.CALCULO if not is_correct else None, feedback_error=error_msg))
                session.add(p)
    await session.commit()
async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando configuraciones de progreso Fase 5...")
    
    # 1. Configuración por defecto de la Fase
    config_def = ConfiguracionProgreso(
        fase_id=FASE5_ID, seccion=0, operacion=OperacionEnum.MIXTA,
        cantidad_requerida=15, porcentaje_aprobacion=90, orden_desbloqueo=99,
        tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=60
    )
    session.add(config_def)
    
    # 2. Configuraciones de Niveles de Práctica Libre
    sections = [
        (1, 1), (1, 2), (1, 3),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3), (3, 4),
        (4, 1), (4, 2), (4, 3)
    ]
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        config = ConfiguracionProgreso(
            fase_id=FASE5_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=10, porcentaje_aprobacion=80, orden_desbloqueo=seccion_id,
            tipo_feedback="completo", usa_cronometro=False, tiempo_default_segundos=0
        )
        session.add(config)
        
    # 3. Configuraciones de Desafíos por Módulo
    for mod_id in range(1, 5):
        # Desafío 11
        config_11 = ConfiguracionProgreso(
            fase_id=FASE5_ID, seccion=mod_id * 1000 + 11, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=20, porcentaje_aprobacion=90, orden_desbloqueo=mod_id * 1000 + 11,
            tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=25
        )
        session.add(config_11)
        # Desafío 12
        config_12 = ConfiguracionProgreso(
            fase_id=FASE5_ID, seccion=mod_id * 1000 + 12, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=20, porcentaje_aprobacion=90, orden_desbloqueo=mod_id * 1000 + 12,
            tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=40
        )
        session.add(config_12)
        # Desafío 13
        config_13 = ConfiguracionProgreso(
            fase_id=FASE5_ID, seccion=mod_id * 1000 + 13, operacion=OperacionEnum.MIXTA,
            cantidad_requerida=10, porcentaje_aprobacion=90, orden_desbloqueo=mod_id * 1000 + 13,
            tipo_feedback="simple", usa_cronometro=True, tiempo_default_segundos=50
        )
        session.add(config_13)
        
    await session.commit()

async def run_fase5_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 5...")
    from app.seed import should_seed_phase, update_seed_version, SEED_VERSIONS
    async with AsyncSessionLocal() as session:
        if not await should_seed_phase(session, "fase_5", FASE5_ID):
            return
        
        res = await session.execute(select(Fase).where(Fase.id == FASE5_ID))
        if not res.scalar_one_or_none():
            fase = Fase(id=FASE5_ID, nombre="Geometría Plana y Medidas", descripcion="Desarrollar la comprensión del espacio bidimensional mediante el análisis visual y la conservación de la superficie.", orden=5, estado=StatusEnum.ACTIVO)
            session.add(fase)
            await session.flush()
            
        await clear_fase5_data(session)
        await seed_teoria_niveles(session)
        await seed_configuracion_progreso(session)
        await seed_practica_pool(session)
        await seed_preguntas_desafios(session)
        await update_seed_version(session, "fase_5", SEED_VERSIONS.get("fase_5", "20260603_v1"))
        await session.commit()
    print("Fase 5 inyectada con éxito!")

if __name__ == "__main__":
    asyncio.run(run_fase5_seed())
