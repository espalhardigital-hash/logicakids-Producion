import asyncio
import os
import re
import math
import sys
from dotenv import load_dotenv
from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import create_async_engine

# Ensure we can load env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

# Regex pattern and math solver helper
def solve_arithmetic_from_text(enunciado: str, seccion: int, fase_id: int) -> str:
    """
    Parses the question text and returns the mathematically solved answer as a string.
    If the text doesn't match any known pattern, returns None.
    """
    # Clean up prefixes
    text_clean = enunciado.replace("[ESPEJO] ", "").strip()
    
    # ------------------ FASE 3 QUESTIONS ------------------
    if fase_id == 3:
        # M1L1: "Lucas tiene {manzanas} manzanas rojas y {bicicletas} bicicletas azules en su garaje. Regala {regala} manzanas a su amigo. ¿Cuántas manzanas le quedan?"
        m1 = re.search(r"Lucas tiene (\d+) manzanas rojas y (\d+) bicicletas azules en su garaje\. Regala (\d+) manzanas a su amigo\. ¿Cuántas manzanas le quedan\?", text_clean)
        if m1:
            manzanas, bicicletas, regala = map(int, m1.groups())
            return str(manzanas - regala)
            
        # M1L2: "María tiene {edad} años. Ayer a las 4:00 PM compró {chocolates} chocolates y {paletas} paletas en la tienda. Le regaló {regalo} chocolates a su hermano de 6 años. ¿Cuántos chocolates le quedan?"
        m2 = re.search(r"María tiene (\d+) años\. Ayer a las 4:00 PM compró (\d+) chocolates y (\d+) paletas en la tienda\. Le regaló (\d+) chocolates a su hermano de 6 años\. ¿Cuántos chocolates le quedan\?", text_clean)
        if m2:
            edad, chocolates, paletas, regalo = map(int, m2.groups())
            return str(chocolates - regalo)
            
        # M1L3: "En un estante hay {libros} libros de aventuras, {litros} litros de jugo de naranja y {cuadernos} cuadernos escolares. ¿Cuántas unidades de papelería/lectura hay en total?"
        m3 = re.search(r"En un estante hay (\d+) libros de aventuras, (\d+) litros de jugo de naranja y (\d+) cuadernos escolares\. ¿Cuántas unidades de papelería/lectura hay en total\?", text_clean)
        if m3:
            libros, litros, cuadernos = map(int, m3.groups())
            return str(libros + cuadernos)
            
        # M2L1: "Un tren arranca la marcha con {inicial} pasajeros. En la primera parada se bajan {bajan} pasajeros y luego suben {suben}. ¿Cuántos pasajeros van en el tren?"
        m4 = re.search(r"Un tren arranca la marcha con (\d+) pasajeros\. En la primera parada se bajan (\d+) pasajeros y luego suben (\d+)\. ¿Cuántos pasajeros van en el tren\?", text_clean)
        if m4:
            inicial, bajan, suben = map(int, m4.groups())
            return str(inicial - bajan + suben)
            
        # M2L2: "Lucas gastó {gasto} monedas de oro en la armería. Ahora le quedan exactamente {final} monedas de oro. ¿Cuántas monedas tenía Lucas al inicio?"
        m5 = re.search(r"Lucas gastó (\d+) monedas de oro en la armería\. Ahora le quedan exactamente (\d+) monedas de oro\. ¿Cuántas monedas tenía Lucas al inicio\?", text_clean)
        if m5:
            gasto, final = map(int, m5.groups())
            return str(final + gasto)
            
        # M2L3: "Un tanque tiene {agua} litros de agua. Se consumen {consumo} litros por la mañana, luego se duplica la cantidad restante, y por la tarde se evaporan 10 litros. ¿Cuántos litros de agua quedan?"
        m6 = re.search(r"Un tanque tiene (\d+) litros de agua\. Se consumen (\d+) litros por la mañana, luego se duplica la cantidad restante, y por la tarde se evaporan 10 litros\. ¿Cuántos litros de agua quedan\?", text_clean)
        if m6:
            agua, consumo = map(int, m6.groups())
            return str((agua - consumo) * 2 - 10)
            
        # M3L1: "Carrito A: {lapices} lápices y {gomas} gomas cuesta R$ {tot_a}. Carrito B: {lapices} lápices y {gomas+1} gomas cuesta R$ {tot_b}. ¿Cuánto cuesta 1 goma?"
        m7 = re.search(r"Carrito A: (\d+) lápices y (\d+) gomas cuesta R\$ (\d+)\. Carrito B: \d+ lápices y \d+ gomas cuesta R\$ (\d+)\. ¿Cuánto cuesta 1 goma\?", text_clean)
        if m7:
            lapices, gomas, tot_a, tot_b = map(int, m7.groups())
            return str(tot_b - tot_a)
            
        # M3L2: "Si {cant_cuadernos} cuadernos cuestan R$ {tot_a} en total, y {cant_cuadernos} cuadernos con 2 reglas cuestan R$ {tot_b}, ¿cuánto cuesta 1 regla?"
        m8 = re.search(r"Si (\d+) cuadernos cuestan R\$ (\d+) en total, y \d+ cuadernos con 2 reglas cuestan R\$ (\d+), ¿cuánto cuesta 1 regla\?", text_clean)
        if m8:
            cuadernos, tot_a, tot_b = map(int, m8.groups())
            return str((tot_b - tot_a) // 2)
            
        # M3L3: "Un estuche y una mochila cuestan R$ {total} en total. La mochila cuesta R$ {dif} más que el estuche. ¿Cuánto cuesta el estuche?"
        m9 = re.search(r"Un estuche y una mochila cuestan R\$ (\d+) en total\. La mochila cuesta R\$ (\d+) más que el estuche\. ¿Cuánto cuesta el estuche\?", text_clean)
        if m9:
            total, dif = map(int, m9.groups())
            return str((total - dif) // 2)
            
        # M4L1: "Queremos empaquetar {dulces} dulces en {cajas} cajas de forma que cada una tenga exactamente la misma cantidad. ¿Cuántos dulces van en cada caja?"
        m10 = re.search(r"Queremos empaquetar (\d+) dulces en (\d+) cajas de forma que cada una tenga exactamente la misma cantidad\. ¿Cuántos dulces van en cada caja\?", text_clean)
        if m10:
            dulces, cajas = map(int, m10.groups())
            return str(dulces // cajas)
            
        # M4L2: "Tenemos {manzanas} manzanas para guardar en cajas de {capacidad} unidades cada una. ¿Cuántas manzanas sobran al completar el máximo número de cajas posibles?"
        m11 = re.search(r"Tenemos (\d+) manzanas para guardar en cajas de (\d+) unidades cada una\. ¿Cuántas manzanas sobran al completar el máximo número de cajas posibles\?", text_clean)
        if m11:
            manzanas, capacidad = map(int, m11.groups())
            return str(manzanas % capacidad)
            
        # M4L3: "Una tira de luces parpadea cíclicamente en orden: Rojo (1), Verde (2), Azul (3), Amarillo (4), y repite. ¿Qué número de color saldrá en el parpadeo {pasos}?"
        m12 = re.search(r"Una tira de luces parpadea cíclicamente en orden: Rojo \(1\), Verde \(2\), Azul \(3\), Amarillo \(4\), y repite\. ¿Qué número de color saldrá en el parpadeo (\d+)\?", text_clean)
        if m12:
            pasos = int(m12.group(1))
            return str((pasos - 1) % 4 + 1)
            
        # M5L1: "Una rana da saltos de {salto} metros de longitud en la recta numérica. ¿Cuántos saltos debe dar para llegar exactamente a los {dist} metros?"
        m13 = re.search(r"Una rana da saltos de (\d+) metros de longitud en la recta numérica\. ¿Cuántos saltos debe dar para llegar exactamente a los (\d+) metros\?", text_clean)
        if m13:
            salto, dist = map(int, m13.groups())
            return str(dist // salto)
            
        # M5L2: "Un semáforo se enciende en verde cada {a} segundos, y otro semáforo lo hace cada {b} segundos. Si ambos se encienden juntos ahora, ¿en cuántos segundos volverán a coincidir?"
        m14 = re.search(r"Un semáforo se enciende en verde cada (\d+) segundos, y otro semáforo lo hace cada (\d+) segundos\. Si ambos se encienden juntos ahora, ¿en cuántos segundos volverán a coincidir\?", text_clean)
        if m14:
            a, b = map(int, m14.groups())
            return str(math.lcm(a, b))
            
        # M5L3: "Queremos cortar dos cuerdas de {a} metros y {b} metros en pedazos iguales lo más largos posible, sin que sobre nada. ¿De cuántos metros medirá cada pedazo?"
        m15 = re.search(r"Queremos cortar dos cuerdas de (\d+) metros y (\d+) metros en pedazos iguales lo más largos posible, sin que sobre nada\. ¿De cuántos metros medirá cada pedazo\?", text_clean)
        if m15:
            a, b = map(int, m15.groups())
            return str(math.gcd(a, b))

        # --- Phase 3 Challenges ---
        # M1 Challenge: "María de 12 años tiene {a} globos y {b} pelotas de tenis. Ayer a las 3:00 PM regaló {c} globos. ¿Cuántos globos tiene ahora?"
        mc1 = re.search(r"María de 12 años tiene (\d+) globos y (\d+) pelotas de tenis\. Ayer a las 3:00 PM regaló (\d+) globos\. ¿Cuántos globos tiene ahora\?", text_clean)
        if mc1:
            a, b, c = map(int, mc1.groups())
            return str(a - c)

        # M2 Challenge: "Un camión sale del patio con {a} cajas de frutas. Entrega {b} cajas en el supermercado y luego carga {c} cajas nuevas. ¿Cuántas cajas lleva?"
        mc2 = re.search(r"Un camión sale del patio con (\d+) cajas de frutas\. Entrega (\d+) cajas en el supermercado y luego carga (\d+) cajas nuevas\. ¿Cuántas cajas lleva\?", text_clean)
        if mc2:
            a, b, c = map(int, mc2.groups())
            return str(a - b + c)

        # M3 Challenge: "Si 2 cuadernos y una cartuchera de R$ 10,00 cuestan R$ {tot_a}, y 3 cuadernos con la misma cartuchera cuestan R$ {tot_b}, ¿cuánto cuesta 1 cuaderno?"
        mc3 = re.search(r"Si 2 cuadernos y una cartuchera de R\$ 10,00 cuestan R\$ (\d+), y 3 cuadernos con la misma cartuchera cuestan R\$ (\d+), ¿cuánto cuesta 1 cuaderno\?", text_clean)
        if mc3:
            tot_a, tot_b = map(int, mc3.groups())
            return str(tot_b - tot_a)

        # M4 Challenge: "Un panadero hizo {tot} panes y los agrupó en bolsas de {cap} panes cada una. ¿Cuántos panes quedaron sueltos fuera de las bolsas completas?"
        mc4 = re.search(r"Un panadero hizo (\d+) panes y los agrupó en bolsas de (\d+) panes cada una\. ¿Cuántos panes quedaron sueltos fuera de las bolsas completas\?", text_clean)
        if mc4:
            tot, cap = map(int, mc4.groups())
            return str(tot % cap)

        # M5 Challenge: "Un atleta corre en una pista y tarda {a} minutos por vuelta, y su compañero tarda {b} minutos. Si salen juntos, ¿en cuántos minutos se encuentran de nuevo?"
        mc5 = re.search(r"Un atleta corre en una pista y tarda (\d+) minutos por vuelta, y su compañero tarda (\d+) minutos\. Si salen juntos, ¿en cuántos minutos se encuentran de nuevo\?", text_clean)
        if mc5:
            a, b = map(int, mc5.groups())
            return str(math.lcm(a, b))

    # ------------------ FASE 2 QUESTIONS ------------------
    elif fase_id == 2:
        # Double / triple / halves / order of operations
        # "Calcula mentalmente: {a} + {b} × {c}"
        m1 = re.search(r"Calcula mentalmente: (\d+) \+ (\d+) × (\d+)", text_clean)
        if m1:
            a, b, c = map(int, m1.groups())
            return str(a + b * c)
            
        # "Calcula con cuidado: ({a} - {b}) × {c}"
        m2 = re.search(r"Calcula con cuidado: \((\d+) - (\d+)\) × (\d+)", text_clean)
        if m2:
            a, b, c = map(int, m2.groups())
            return str((a - b) * c)
            
        # "Evocación Mental Suprema: ¿Cuánto es {a} × {b} + {c} × 2?"
        m3 = re.search(r"Evocación Mental Suprema: ¿Cuánto es (\d+) × (\d+) \+ (\d+) × 2\?", text_clean)
        if m3:
            a, b, c = map(int, m3.groups())
            return str(a * b + c * 2)

        # "Halla la incógnita: Y × {a} = {b}"
        m4 = re.search(r"Halla la incógnita: Y × (\d+) = (\d+)", text_clean)
        if m4:
            a, b = map(int, m4.groups())
            return str(b // a)

        # "Completa la casilla vacía: {a} + [ ] = {b}"
        m5 = re.search(r"Completa la casilla vacía: (\d+) \+ \[ \] = (\d+)", text_clean)
        if m5:
            a, b = map(int, m5.groups())
            return str(b - a)

        # "Despeja la incógnita paso a paso: {a} × X + {b} = {c}"
        m6 = re.search(r"Despeja la incógnita paso a paso: (\d+) × X \+ (\d+) = (\d+)", text_clean)
        if m6:
            a, b, c = map(int, m6.groups())
            return str((c - b) // a)

        # "Pagas un artículo de {precio} pesos con un billete de {pago} pesos. ¿Cuánto cambio recibes?"
        m7 = re.search(r"Pagas un artículo de ([\d,]+) pesos con un billete de ([\d,]+) pesos\. ¿Cuánto cambio recibes\?", text_clean)
        if m7:
            precio = float(m7.group(1).replace(",", "."))
            pago = float(m7.group(2).replace(",", "."))
            ans = pago - precio
            return f"{ans:.2f}".replace(".", ",")

        # "Llevas un billete de {presupuesto} pesos. Compras dos artículos que cuestan {p1} y {p2} pesos. ¿Cuánto cambio te queda?"
        m8 = re.search(r"Llevas un billete de ([\d,]+) pesos\. Compras dos artículos que cuestan ([\d,]+) y ([\d,]+) pesos\. ¿Cuánto cambio te queda\?", text_clean)
        if m8:
            presupuesto = float(m8.group(1).replace(",", "."))
            p1 = float(m8.group(2).replace(",", "."))
            p2 = float(m8.group(3).replace(",", "."))
            ans = presupuesto - (p1 + p2)
            if ans >= 0:
                return f"{ans:.2f}".replace(".", ",")
            else:
                return None # The question might ask "how much money do you lack?" instead

        # "Quieres comprar dos artículos de {p1} y {p2} pesos, pero solo tienes {presupuesto} pesos. ¿Cuánto dinero te falta?"
        m9 = re.search(r"Quieres comprar dos artículos de ([\d,]+) y ([\d,]+) pesos, pero solo tienes ([\d,]+) pesos\. ¿Cuánto dinero te falta\?", text_clean)
        if m9:
            p1 = float(m9.group(1).replace(",", "."))
            p2 = float(m9.group(2).replace(",", "."))
            presupuesto = float(m9.group(3).replace(",", "."))
            ans = (p1 + p2) - presupuesto
            return f"{ans:.2f}".replace(".", ",")

        # "Compras {n} pasteles de {p1} pesos cada uno. Pagas con un billete de {presupuesto} pesos. ¿Cuánto cambio te queda?"
        m10 = re.search(r"Compras (\d+) pasteles de ([\d,]+) pesos cada uno\. Pagas con un billete de ([\d,]+) pesos\. ¿Cuánto cambio te queda\?", text_clean)
        if m10:
            n = int(m10.group(1))
            p1 = float(m10.group(2).replace(",", "."))
            presupuesto = float(m10.group(3).replace(",", "."))
            ans = presupuesto - (n * p1)
            if ans >= 0:
                return f"{ans:.2f}".replace(".", ",")
            else:
                return None

        # "Quieres comprar {n} pasteles de {p1} pesos cada uno, pero solo tienes un billete de {presupuesto} pesos. ¿Cuánto te falta?"
        m11 = re.search(r"Quieres comprar (\d+) pasteles de ([\d,]+) pesos cada uno, pero solo tienes un billete de ([\d,]+) pesos\. ¿Cuánto te falta\?", text_clean)
        if m11:
            n = int(m11.group(1))
            p1 = float(m11.group(2).replace(",", "."))
            presupuesto = float(m11.group(3).replace(",", "."))
            ans = (n * p1) - presupuesto
            return f"{ans:.2f}".replace(".", ",")

        # "Un carpintero fabrica {cajas} cajas y mete {lapices} tornillos en cada una. Si gasta {rotos} tornillos sueltos en otro mueble, ¿cuántos le quedan en las cajas?"
        m12 = re.search(r"Un carpintero fabrica (\d+) cajas y mete (\d+) tornillos en cada una\. Si gasta (\d+) tornillos sueltos en otro mueble, ¿cuántos le quedan en las cajas\?", text_clean)
        if m12:
            cajas, lapices, rotos = map(int, m12.groups())
            return str(cajas * lapices - rotos)

        # "Enzo tiene {rojas} canicas rojas y {distractor} lápices amarillos. Jugando pierde {perdidas} canicas rojas. Luego, triplica las canicas rojas que le quedan. ¿Cuántas canicas tiene ahora?"
        m13 = re.search(r"Enzo tiene (\d+) canicas rojas y (\d+) lápices amarillos\. Jugando pierde (\d+) canicas rojas\. Luego, triplica las canicas rojas que le quedan\. ¿Cuántas canicas tiene ahora\?", text_clean)
        if m13:
            rojas, distractor, perdidas = map(int, m13.groups())
            return str((rojas - perdidas) * 3)

        # "Un camión lleva {cajas} cajas con {libros} libros de regalo cada una. Reparten todos los libros por igual entre {cajones} bibliotecas escolares. ¿Cuántos libros recibe cada biblioteca?"
        m14 = re.search(r"Un camión lleva (\d+) cajas con (\d+) libros de regalo cada una\. Reparten todos los libros por igual entre (\d+) bibliotecas escolares\. ¿Cuántos libros recibe cada biblioteca\?", text_clean)
        if m14:
            cajas, libros, cajones = map(int, m14.groups())
            return str((cajas * libros) // cajones)

    return None

async def run_analysis():
    print("Connecting to the database...")
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.connect() as conn:
        print("[OK] Connected to database.")
        
        # 1. TABLE SIZES
        print("\n--- 1. Table Sizes ---")
        if conn.dialect.name == "sqlite":
            result = await conn.execute(text("""
                SELECT name 
                FROM sqlite_master 
                WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name;
            """))
        else:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
        tables = [t[0] for t in result.fetchall()]
        
        for table in tables:
            cnt_res = await conn.execute(text(f'SELECT COUNT(*) FROM "{table}"'))
            cnt = cnt_res.scalar()
            print(f"Table {table:25s} : {cnt:6d} rows")

        # 2. QUESTIONS DISTRIBUTION BY PHASE, MODULE, LEVEL
        print("\n--- 2. Questions Distribution ---")
        
        # We will retrieve all questions and group them
        result = await conn.execute(text("""
            SELECT id, fase_id, seccion, tipo_pregunta, enunciado, respuesta_correcta 
            FROM preguntas 
            WHERE fase_id IN (2, 3)
            ORDER BY fase_id, seccion, id;
        """))
        questions = result.fetchall()
        print(f"Total questions loaded from Phase 2 and 3: {len(questions)}")
        
        # Group by phase & section
        distribution = {}
        for q in questions:
            q_id, fase_id, seccion, tipo_pregunta, enunciado, respuesta_correcta = q
            key = (fase_id, seccion)
            if key not in distribution:
                distribution[key] = []
            distribution[key].append(q)

        # Print detailed counts
        print("\nDetailed Question Counts by Phase and Section:")
        print(f"{'Phase':6s} | {'Section':8s} | {'Type':20s} | {'Count':6s}")
        print("-" * 50)
        
        # Let's also check missing sections
        # Phase 2 standard sections: 101, 102, 103, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403
        # Phase 2 challenges: 1011, 1012, 1013, 2011, 2012, 2013, 3011, 3012, 3013, 4011, 4012, 4013
        # Phase 3 standard: 101, 102, 103, 201, 202, 203, 301, 302, 303, 401, 402, 403, 501, 502, 503
        # Phase 3 challenges: 1011, 1012, 1013, 2011, 2012, 2013, 3011, 3012, 3013, 4011, 4012, 4013, 5011, 5012, 5013
        
        expected_f2 = [
            101, 102, 103, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403,
            1011, 1012, 1013, 2011, 2012, 2013, 3011, 3012, 3013, 4011, 4012, 4013
        ]
        expected_f3 = [
            101, 102, 103, 201, 202, 203, 301, 302, 303, 401, 402, 403, 501, 502, 503,
            1011, 1012, 1013, 2011, 2012, 2013, 3011, 3012, 3013, 4011, 4012, 4013, 5011, 5012, 5013
        ]
        
        gaps = []
        
        for s in expected_f2:
            key = (2, s)
            cnt = len(distribution.get(key, []))
            print(f"Fase 2 | {s:7d} | {('Practice' if s < 1000 else 'Challenge'):20s} | {cnt:5d}")
            if cnt == 0:
                gaps.append(f"Fase 2: Missing Section {s}")
                
        for s in expected_f3:
            key = (3, s)
            cnt = len(distribution.get(key, []))
            print(f"Fase 3 | {s:7d} | {('Practice' if s < 1000 else 'Challenge'):20s} | {cnt:5d}")
            if cnt == 0:
                gaps.append(f"Fase 3: Missing Section {s}")
                
        if gaps:
            print("\n[WARNING] Structure Gaps Found:")
            for g in gaps:
                print(f" - {g}")
        else:
            print("\n[OK] No missing sections in Phase 2 or Phase 3.")

        # 3. QUALITY CHECKS (Empty, Null, Duplicates, MCQs)
        print("\n--- 3. Quality and Structural Integrity Checks ---")
        
        null_enunciados = 0
        null_respuestas = 0
        mcq_with_wrong_alt_count = []
        mcq_with_no_correct = []
        mcq_with_multiple_correct = []
        
        for q in questions:
            q_id, fase_id, seccion, tipo_pregunta, enunciado, respuesta_correcta = q
            if not enunciado or not enunciado.strip():
                null_enunciados += 1
            if not respuesta_correcta or not respuesta_correcta.strip():
                null_respuestas += 1
                
            # If MCQ, check alternatives
            if tipo_pregunta == "MULTIPLE_OPCION":
                alt_res = await conn.execute(text(f"SELECT id, texto, es_correcta FROM alternativas WHERE pregunta_id = {q_id}"))
                alts = alt_res.fetchall()
                if len(alts) != 4:
                    mcq_with_wrong_alt_count.append((q_id, len(alts)))
                
                correct_count = sum(1 for a in alts if a[2])
                if correct_count == 0:
                    mcq_with_no_correct.append(q_id)
                elif correct_count > 1:
                    mcq_with_multiple_correct.append((q_id, correct_count))
                    
        print(f"Questions with null or empty Enunciado: {null_enunciados}")
        print(f"Questions with null or empty Respuesta Correcta: {null_respuestas}")
        print(f"MCQ Questions without exactly 4 alternatives: {len(mcq_with_wrong_alt_count)}")
        if mcq_with_wrong_alt_count:
            print("  Samples (ID, Count):", mcq_with_wrong_alt_count[:10])
        print(f"MCQ Questions with ZERO correct options: {len(mcq_with_no_correct)}")
        if mcq_with_no_correct:
            print("  Samples (ID):", mcq_with_no_correct[:10])
        print(f"MCQ Questions with MULTIPLE correct options: {len(mcq_with_multiple_correct)}")
        if mcq_with_multiple_correct:
            print("  Samples (ID, Count):", mcq_with_multiple_correct[:10])

        # 4. DUPLICATES CHECK
        print("\n--- 4. Duplicates Check ---")
        dup_res = await conn.execute(text("""
            SELECT enunciado, seccion, fase_id, COUNT(*) AS count 
            FROM preguntas 
            WHERE fase_id IN (2, 3) 
            GROUP BY enunciado, seccion, fase_id 
            HAVING COUNT(*) > 1 
            ORDER BY count DESC;
        """))
        dups = dup_res.fetchall()
        print(f"Found {len(dups)} duplicate question statements.")
        if dups:
            print("Samples of duplicates (showing top 5):")
            for d in dups[:5]:
                print(f" - Count: {d[3]} | Phase: {d[2]} | Sec: {d[1]} | Text: '{d[0][:80]}...'")

        # 5. MATHEMATICAL COHERENCE CHECKS
        print("\n--- 5. Mathematical Coherence Check ---")
        parsed_count = 0
        error_count = 0
        error_samples = []
        
        for q in questions:
            q_id, fase_id, seccion, tipo_pregunta, enunciado, respuesta_correcta = q
            
            calculated = solve_arithmetic_from_text(enunciado, seccion, fase_id)
            if calculated is not None:
                parsed_count += 1
                # Check for strict equivalence
                if calculated != respuesta_correcta:
                    error_count += 1
                    error_samples.append({
                        "id": q_id,
                        "fase_id": fase_id,
                        "seccion": seccion,
                        "enunciado": enunciado,
                        "db_ans": respuesta_correcta,
                        "calculated": calculated
                    })
                    
        print(f"Total questions mathematically evaluated/parsed: {parsed_count}")
        print(f"Total arithmetic errors found: {error_count}")
        
        if error_count > 0:
            print("\n[ALERT] Mathematical Coherence Errors Found!")
            print(f"Showing first 10 errors:")
            for idx, err in enumerate(error_samples[:10]):
                print(f"  Error #{idx+1} in Question ID {err['id']} (Phase {err['fase_id']}, Sec {err['seccion']}):")
                print(f"    Text: {err['enunciado']}")
                print(f"    DB Answer        : '{err['db_ans']}'")
                print(f"    Calculated Answer: '{err['calculated']}'")
        else:
            print("[OK] All audited questions are mathematically coherent with their answers!")

        # 6. CONFIGURATION COMPARISON
        print("\n--- 6. Config vs. Questions Sufficiency ---")
        cfg_res = await conn.execute(text("""
            SELECT fase_id, seccion, operacion, cantidad_requerida 
            FROM configuracion_progreso 
            WHERE fase_id IN (2, 3) 
            ORDER BY fase_id, seccion;
        """))
        configs = cfg_res.fetchall()
        
        insufficient = []
        for cfg in configs:
            f_id, sec, op, req = cfg
            # Count questions available for this specific block
            # Standard practice sections match 'seccion', challenges match 'modulo * 1000 + lvl'
            # Wait, configuracion_progreso has 'operacion'.
            # Let's count matching questions.
            q_cnt_res = await conn.execute(text("""
                SELECT COUNT(*) 
                FROM preguntas 
                WHERE fase_id = :f_id AND seccion = :sec AND operacion = :op AND estado = 'ACTIVO'
            """), {"f_id": f_id, "sec": sec, "op": op})
            avail = q_cnt_res.scalar()
            
            status = "[OK]" if avail >= req else "[INSUFFICIENT]"
            print(f"Fase {f_id} | Sec {sec:5d} | Op {op:15s} | Required: {req:3d} | Available: {avail:3d} | {status}")
            if avail < req:
                insufficient.append((f_id, sec, op, req, avail))
                
        if insufficient:
            print("\n[WARNING] Configuration Sufficiency Gaps Found:")
            for ins in insufficient:
                print(f" - Fase {ins[0]} Sec {ins[1]} ({ins[2]}): requires {ins[3]} questions, but only {ins[4]} are available.")
        else:
            print("[OK] The database contains sufficient questions for all progress configurations.")

if __name__ == "__main__":
    asyncio.run(run_analysis())
