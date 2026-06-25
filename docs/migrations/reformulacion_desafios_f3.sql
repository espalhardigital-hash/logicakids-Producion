-- ============================================================
-- REFORMULACIÓN PEDAGÓGICA — DESAFÍOS FASE 3 (v5-FINAL-DEFINITIVA)
-- Usa substring(col FROM 'patrón') con punto (.) como comodín
-- para los caracteres acentuados (ó→'regal.', ñ→'compa.ero')
-- COALESCE en todas las extracciones como seguridad anti-NULL
-- ============================================================

BEGIN;

-- ============================================================
-- MÓDULO 1 (1011, 1012, 1013) — Suma y Resta
-- A = 'tiene (\d+) globos'
-- B = 'regal. (\d+) globos'  ← punto para 'ó'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 5)
  WHEN 0 THEN
    'En una fiesta había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' globos de colores. Al terminar, ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' globos se fueron volando. ¿Cuántos globos quedaron?'
  WHEN 1 THEN
    'La abuela cosechó ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' manzanas del huerto. Luego regaló ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' al vecino. ¿Cuántas manzanas le quedaron?'
  WHEN 2 THEN
    'La biblioteca tenía ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' libros en el estante. El maestro prestó ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' libros a los niños. ¿Cuántos libros quedaron en el estante?'
  WHEN 3 THEN
    'Tomás coleccionó ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' estampillas de superhéroes. Le regaló ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' a su mejor amigo. ¿Cuántas estampillas le quedan a Tomás?'
  WHEN 4 THEN
    'En el árbol había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' pájaros cantando. De repente, ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' volaron asustados. ¿Cuántos pájaros quedaron en el árbol?'
END
WHERE p.fase_id = 3 AND p.seccion IN (1011, 1012, 1013);

-- ============================================================
-- MÓDULO 2 (2011, 2012, 2013) — Operaciones Encadenadas
-- A = 'con (\d+) cajas'
-- B = 'Entrega (\d+) cajas'
-- C = 'carga (\d+) cajas'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 5)
  WHEN 0 THEN
    'Un autobús salió con ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' pasajeros. En la primera parada bajaron ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' y subieron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    '. ¿Cuántos pasajeros hay ahora?'
  WHEN 1 THEN
    'Una pecera tenía ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' peces. El dueño sacó ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' para venderlos y luego añadió ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' nuevos. ¿Cuántos peces hay ahora?'
  WHEN 2 THEN
    'Una tienda tenía ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' sandías. Vendió ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' en la mañana y recibió ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' nuevas en la tarde. ¿Cuántas sandías tiene ahora?'
  WHEN 3 THEN
    'El jardín tenía ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' flores. El jardinero cortó ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' para el florero y sembró ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' nuevas. ¿Cuántas flores tiene el jardín?'
  WHEN 4 THEN
    'Un almacén tenía ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' cajas de productos. Se enviaron ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' al cliente y llegaron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' nuevas. ¿Cuántas cajas hay ahora?'
END
WHERE p.fase_id = 3 AND p.seccion IN (2011, 2012, 2013);

-- ============================================================
-- MÓDULO 3 (3011, 3012, 3013) — Álgebra Básica
-- A = 'cuestan R. (\d+),'  ← punto para '$'
-- B = 'cartuchera cuestan R. (\d+)'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 5)
  WHEN 0 THEN
    '2 chocolates y un refresco cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. 3 chocolates con el mismo refresco cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta 1 chocolate?'
  WHEN 1 THEN
    '2 cuadernos y una mochila cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Si compras 3 cuadernos con la misma mochila, pagas $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto vale un cuaderno?'
  WHEN 2 THEN
    '2 videojuegos y un control cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Comprar 3 videojuegos con el mismo control cuesta $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta un videojuego?'
  WHEN 3 THEN
    '2 pizzas y una bebida cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Pedir 3 pizzas con la misma bebida cuesta $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto vale una pizza?'
  WHEN 4 THEN
    '2 tacos y una limonada cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. 3 tacos con la misma limonada cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta 1 taco?'
END
WHERE p.fase_id = 3 AND p.seccion IN (3011, 3012, 3013);

-- ============================================================
-- MÓDULO 4 (4011, 4012, 4013) — División con Resto
-- A = 'hizo (\d+) panes'
-- B = 'bolsas de (\d+) panes'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 5)
  WHEN 0 THEN
    'La panadería horneó ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' panes y los puso en cajas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' cada una. ¿Cuántos panes sobraron sin caber en ninguna caja completa?'
  WHEN 1 THEN
    'Valentina recogió ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' flores del jardín y quiere hacer ramos de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' flores cada uno. ¿Cuántas flores le sobran después de hacer los ramos?'
  WHEN 2 THEN
    'Sebastián tiene ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' caramelos y los reparte en bolsitas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' cada una. ¿Cuántos caramelos le sobran?'
  WHEN 3 THEN
    'En el salón hay ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' sillas y se quieren formar filas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' sillas cada una. ¿Cuántas sillas quedan sin completar una fila?'
  WHEN 4 THEN
    'El equipo tiene ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' balones y los guarda en cajas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' cada una. ¿Cuántos balones sobran después de llenar las cajas?'
END
WHERE p.fase_id = 3 AND p.seccion IN (4011, 4012, 4013);

-- ============================================================
-- MÓDULO 5 (5011, 5012, 5013) — Ciclos y MCM
-- A = 'tarda (\d+) minutos por vuelta'
-- B = 'compa.ero tarda (\d+) minutos'  ← punto para 'ñ'
-- Fix pedagógico crítico: especifica encuentro en punto de salida
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 5)
  WHEN 0 THEN
    'Dos amigos corren en una pista circular. Uno completa cada vuelta en ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y el otro en ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. Salen al mismo tiempo desde el mismo punto. ¿Cuántos minutos tardan en encontrarse de nuevo exactamente en el punto de salida?'
  WHEN 1 THEN
    'Dos semáforos se encienden juntos. El primero cambia a verde cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿En cuántos minutos vuelven a cambiar juntos al mismo tiempo?'
  WHEN 2 THEN
    'Dos ruedas arrancan alineadas y giran. La primera da una vuelta completa cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y la segunda cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿Cuántos minutos tardan en volver a quedar alineadas en la posición inicial?'
  WHEN 3 THEN
    'Dos campanas repican juntas al mismo tiempo. La primera repica cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y la segunda cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿Cuántos minutos pasan hasta que vuelvan a repicar juntas?'
  WHEN 4 THEN
    'Dos buques salen juntos del muelle. El primero regresa cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' días y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' días. ¿En cuántos días coincidirán de nuevo en el muelle al mismo tiempo?'
END
WHERE p.fase_id = 3 AND p.seccion IN (5011, 5012, 5013);

-- ============================================================
-- SECCIÓN 99099 — Desafío Maestro
-- Mismo patrón que M1, contextos narrativos de nivel avanzado
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 5)
  WHEN 0 THEN
    'En el mercado había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' naranjas frescas. El vendedor entregó ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' a los primeros clientes. ¿Cuántas naranjas quedan en el puesto?'
  WHEN 1 THEN
    'El maestro tenía ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' hojas de papel. Entregó ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' a los estudiantes del primer turno. ¿Cuántas hojas le quedaron?'
  WHEN 2 THEN
    'En el corral había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' gallinas. ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' se escaparon por el portón abierto. ¿Cuántas gallinas quedaron en el corral?'
  WHEN 3 THEN
    'El camión llevó ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' cajones de verduras al mercado. Descargó ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' en el puesto principal. ¿Cuántos cajones quedan en el camión?'
  WHEN 4 THEN
    'La tienda recibió ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' botellas de jugo. En el primer día vendió ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    '. ¿Cuántas botellas quedan en la tienda?'
END
WHERE p.fase_id = 3 AND p.seccion = 99099;

-- ============================================================
-- VERIFICACIONES POST-UPDATE
-- ============================================================
DO $$
DECLARE v_diff INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_diff FROM preguntas p
  JOIN _backup_desafios_f3 b ON p.id = b.id
  WHERE p.respuesta_correcta != b.respuesta_correcta;
  IF v_diff > 0 THEN
    RAISE EXCEPTION 'CRITICO: % filas con respuesta_correcta modificada!', v_diff;
  END IF;
  RAISE NOTICE 'CHECK 1 OK: respuesta_correcta intacta en las 2400 filas.';
END;
$$;

DO $$
DECLARE v_q INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_q FROM preguntas
  WHERE fase_id=3 AND seccion IN (3011,3012,3013) AND enunciado LIKE '%R$%';
  IF v_q > 0 THEN RAISE WARNING '% filas M3 aun con R$.', v_q;
  ELSE RAISE NOTICE 'CHECK 2 OK: Sin precios R$ en Modulo 3.'; END IF;
END;
$$;

DO $$
DECLARE v_q INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_q FROM preguntas
  WHERE fase_id=3 AND seccion IN (5011,5012,5013)
    AND enunciado LIKE '%encuentran de nuevo?';
  IF v_q > 0 THEN RAISE WARNING '% filas M5 con enunciado ambiguo original.', v_q;
  ELSE RAISE NOTICE 'CHECK 3 OK: Sin ambiguedad en M5.'; END IF;
END;
$$;

DO $$
DECLARE v_changed INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_changed FROM preguntas p
  JOIN _backup_desafios_f3 b ON p.id = b.id WHERE p.enunciado != b.enunciado;
  RAISE NOTICE 'CHECK 4: Total reformulados = % / 2400', v_changed;
END;
$$;

COMMIT;

-- Reporte final de unicidad por sección
SELECT seccion,
       COUNT(*) AS total,
       COUNT(DISTINCT enunciado) AS unicos,
       ROUND(COUNT(DISTINCT enunciado)::numeric / COUNT(*) * 100, 1) AS pct_unicidad
FROM preguntas
WHERE fase_id=3 AND seccion IN (
  1011,1012,1013, 2011,2012,2013,
  3011,3012,3013, 4011,4012,4013,
  5011,5012,5013, 99099)
GROUP BY seccion ORDER BY seccion;
