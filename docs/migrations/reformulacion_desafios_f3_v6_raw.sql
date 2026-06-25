-- ============================================================
-- REFORMULACIÓN PEDAGÓGICA — DESAFÍOS FASE 3 (v6-12-CONTEXTOS)
-- ============================================================

BEGIN;

-- ============================================================
-- MÓDULO 1 (1011, 1012, 1013) — Suma y Resta
-- A = 'tiene (\d+) globos'
-- B = 'regal. (\d+) globos'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 12)
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
  WHEN 5 THEN
    'Un pastelero preparó ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' deliciosos cupcakes. Vendió ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' en la mañana. ¿Cuántos cupcakes le quedan por vender?'
  WHEN 6 THEN
    'En el estacionamiento del colegio había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' autos. A la hora de salida, se retiraron ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' autos. ¿Cuántos autos quedaron estacionados?'
  WHEN 7 THEN
    'Lucía compró ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' lápices de colores para su clase de arte. Compartió ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' lápices con sus compañeros de equipo. ¿Cuántos lápices le quedaron?'
  WHEN 8 THEN
    'En una caja de juguetes había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' bloques de construcción. Los niños usaron ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' bloques para armar un castillo. ¿Cuántos bloques quedaron en la caja?'
  WHEN 9 THEN
    'Una frutería recibió ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' piñas maduras. Durante el día, vendieron ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' piñas a los clientes. ¿Cuántas piñas quedan en la tienda?'
  WHEN 10 THEN
    'El granjero recolectó ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' huevos frescos del gallinero. Utilizó ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' huevos para preparar el desayuno. ¿Cuántos huevos le quedaron?'
  WHEN 11 THEN
    'En una colmena había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' abejas trabajando. Al mediodía, ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' abejas salieron a buscar néctar en las flores. ¿Cuántas abejas quedaron en la colmena?'
END
WHERE p.fase_id = 3 AND p.seccion IN (1011, 1012, 1013);

-- ============================================================
-- MÓDULO 2 (2011, 2012, 2013) — Operaciones Encadenadas
-- A = 'con (\d+) cajas'
-- B = 'Entrega (\d+) cajas'
-- C = 'carga (\d+) cajas'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 12)
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
  WHEN 5 THEN
    'Un tren de pasajeros partió con ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' vagones ocupados. En la estación central desengancharon ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' vagones y acoplaron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' vagones vacíos. ¿Cuántos vagones tiene el tren ahora?'
  WHEN 6 THEN
    'En un puerto había ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' barcos de carga. Al amanecer zarparon ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' barcos y llegaron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' nuevos buques. ¿Cuántos barcos hay en el puerto?'
  WHEN 7 THEN
    'Una panadería comenzó el día con ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' bandejas de donas. Donó ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' bandejas a un refugio y horneó ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' bandejas frescas. ¿Cuántas bandejas tiene disponibles?'
  WHEN 8 THEN
    'Un camión de mensajería transportaba ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' paquetes. Entregó ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' paquetes en su ruta y recogió ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' nuevos paquetes para enviar. ¿Cuántos paquetes lleva ahora?'
  WHEN 9 THEN
    'La frutería del barrio inició con ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' cajas de fresas. Vendió ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' cajas al público y el distribuidor trajo ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' cajas más. ¿Cuántas cajas de fresas tiene la frutería?'
  WHEN 10 THEN
    'Un estante de supermercado estaba abastecido con ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' latas de sopa. Los clientes compraron ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' latas y el reponedor colocó ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' latas nuevas. ¿Cuántas latas de sopa hay en el estante?'
  WHEN 11 THEN
    'Un vivero tenía ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' macetas con plantas. Vendieron ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' macetas a un colegio y trajeron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' macetas de flores silvestres. ¿Cuántas macetas tiene el vivero?'
END
WHERE p.fase_id = 3 AND p.seccion IN (2011, 2012, 2013);

-- ============================================================
-- MÓDULO 3 (3011, 3012, 3013) — Álgebra Básica
-- A = 'cuestan R. (\d+),'
-- B = 'cartuchera cuestan R. (\d+)'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 12)
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
  WHEN 5 THEN
    '2 libros de aventuras y un estuche cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Si compras 3 libros de aventuras y el mismo estuche, pagas $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta un libro de aventuras?'
  WHEN 6 THEN
    '2 balones de fútbol y un inflador cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. 3 balones de fútbol con el mismo inflador cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto vale un balón de fútbol?'
  WHEN 7 THEN
    '2 muñecas y una casita de juguete cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Comprar 3 muñecas con la misma casita de juguete cuesta $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta una muñeca?'
  WHEN 8 THEN
    '2 hamburguesas y unas papas fritas cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Si pides 3 hamburguesas con las mismas papas fritas, cuesta $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta una hamburguesa?'
  WHEN 9 THEN
    '2 camisas y una corbata cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Comprar 3 camisas con la misma corbata cuesta $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta una camisa?'
  WHEN 10 THEN
    '2 entradas al cine y un paquete de palomitas cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. 3 entradas de cine con las mismas palomitas cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta una entrada al cine?'
  WHEN 11 THEN
    '2 helados y una copa de frutas cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. Pedir 3 helados con la misma copa de frutas cuesta $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta un helado?'
END
WHERE p.fase_id = 3 AND p.seccion IN (3011, 3012, 3013);

-- ============================================================
-- MÓDULO 4 (4011, 4012, 4013) — División con Resto
-- A = 'hizo (\d+) panes'
-- B = 'bolsas de (\d+) panes'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 12)
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
  WHEN 5 THEN
    'Un agricultor recolectó ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' naranjas y las guardó en mallas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' naranjas cada una. ¿Cuántas naranjas quedaron fuera de las mallas?'
  WHEN 6 THEN
    'En una fábrica empacaron ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' lápices en paquetes de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' unidades cada uno. ¿Cuántos lápices quedaron sueltos sin empacar?'
  WHEN 7 THEN
    'El profesor tiene ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' cuadernos para repartir en grupos de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' cuadernos por mesa. ¿Cuántos cuadernos le sobran al profesor?'
  WHEN 8 THEN
    'Un chef preparó ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' galletas y quiere armar paquetes de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' galletas para vender. ¿Cuántas galletas le sobran al final?'
  WHEN 9 THEN
    'En la biblioteca quieren organizar ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' libros en estantes donde caben exactamente ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' libros por estante. ¿Cuántos libros quedan fuera?'
  WHEN 10 THEN
    'Un grupo de deportistas tiene ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' botellas de agua. Las distribuyen en paquetes de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' botellas para cada equipo de entrenamiento. ¿Cuántas botellas sobran?'
  WHEN 11 THEN
    'Un artesano fabricó ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' pulseras y las guardó en cajitas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' unidades cada una. ¿Cuántas pulseras quedaron sueltas?'
END
WHERE p.fase_id = 3 AND p.seccion IN (4011, 4012, 4013);

-- ============================================================
-- MÓDULO 5 (5011, 5012, 5013) — Ciclos y MCM
-- A = 'tarda (\d+) minutos por vuelta'
-- B = 'compa.ero tarda (\d+) minutos'
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 12)
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
  WHEN 5 THEN
    'Dos trenes salen al mismo tiempo de la estación central. El primero regresa al origen cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' horas y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' horas. ¿Dentro de cuántas horas volverán a partir juntos de la estación?'
  WHEN 6 THEN
    'Dos faros en la costa comienzan a emitir destellos a la vez. El primero destella cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' segundos y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' segundos. ¿Cuántos segundos tardarán en coincidir sus destellos al mismo tiempo?'
  WHEN 7 THEN
    'Dos relojes de arena se voltean al mismo tiempo. El primero se vacía cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿Cuántos minutos pasan para que ambos se vacíen a la vez nuevamente?'
  WHEN 8 THEN
    'Dos satélites pasan sobre la misma ciudad al mismo tiempo. El primero completa su órbita cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' horas y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' horas. ¿En cuántas horas volverán a pasar juntos sobre esa ciudad?'
  WHEN 9 THEN
    'Dos regadores automáticos en el jardín comienzan a funcionar juntos. El primero riega cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y el segundo cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿En cuántos minutos volverán a regar al mismo tiempo?'
  WHEN 10 THEN
    'Dos ciclistas parten juntos de la línea de salida. El primero tarda ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' segundos en completar una vuelta y el segundo tarda ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' segundos. ¿Cuántos segundos tardarán en volver a cruzar juntos la meta?'
  WHEN 11 THEN
    'Dos autobuses escolares parten juntos de la terminal. El primero completa su ruta de regreso en ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y el segundo en ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿En cuántos minutos coincidirán de nuevo en la terminal?'
END
WHERE p.fase_id = 3 AND p.seccion IN (5011, 5012, 5013);

-- ============================================================
-- SECCIÓN 99099 — Desafío Maestro
-- Alterna dinámicamente entre los diferentes contextos de MÓDULOS 1 a 5
-- ============================================================
UPDATE preguntas p
SET enunciado = CASE (p.id % 12)
  -- Contexto Módulo 1 (Suma/Resta)
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
  
  -- Contexto Módulo 5 (Ciclos y MCM)
  WHEN 2 THEN
    'Dos campanas gigantes en una catedral repican juntas. La primera suena cada ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' minutos y la segunda cada ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' minutos. ¿Cuántos minutos pasan hasta que vuelvan a sonar juntas?'
  WHEN 3 THEN
    'Dos satélites espaciales pasan alineados sobre la base de control. El primero orbita la Tierra en ' ||
    COALESCE(substring(p.enunciado FROM 'tarda (\d+) minutos por vuelta'), '?') ||
    ' horas y el segundo en ' ||
    COALESCE(substring(p.enunciado FROM 'compa.ero tarda (\d+) minutos'), '?') ||
    ' horas. ¿En cuántas horas volverán a estar alineados?'

  -- Contexto Módulo 3 (Álgebra)
  WHEN 4 THEN
    '2 balones de básquetbol y un inflador cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. 3 balones con el mismo inflador cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta 1 balón?'
  WHEN 5 THEN
    '2 cuadernos de dibujo y una mochila escolar cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cuestan R. (\d+),'), '?') ||
    ' en total. 3 cuadernos con la misma mochila cuestan $' ||
    COALESCE(substring(p.enunciado FROM 'cartuchera cuestan R. (\d+)'), '?') ||
    '. ¿Cuánto cuesta un cuaderno de dibujo?'

  -- Contexto Módulo 2 (Operaciones Encadenadas)
  WHEN 6 THEN
    'Un tren comenzó su viaje transportando ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' vagones cargados. En la primera estación desengancharon ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' vagones y acoplaron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' vagones nuevos. ¿Cuántos vagones lleva ahora?'
  WHEN 7 THEN
    'El almacén central tenía guardadas ' ||
    COALESCE(substring(p.enunciado FROM 'con (\d+) cajas'), '?') ||
    ' cajas de herramientas. Despacharon ' ||
    COALESCE(substring(p.enunciado FROM 'Entrega (\d+) cajas'), '?') ||
    ' cajas a una sucursal y recibieron ' ||
    COALESCE(substring(p.enunciado FROM 'carga (\d+) cajas'), '?') ||
    ' cajas de repuestos. ¿Cuántas cajas tienen almacenadas?'

  -- Contexto Módulo 4 (División)
  WHEN 8 THEN
    'Un pastelero preparó ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' galletas de avena y las empacó en bolsas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' galletas cada una. ¿Cuántas galletas le sobraron?'
  WHEN 9 THEN
    'En el almacén de deportes organizan ' ||
    COALESCE(substring(p.enunciado FROM 'hizo (\d+) panes'), '?') ||
    ' balones en canastas de ' ||
    COALESCE(substring(p.enunciado FROM 'bolsas de (\d+) panes'), '?') ||
    ' balones cada una. ¿Cuántos balones quedan sueltos?'

  -- Contextos adicionales del Módulo 1 (Suma/Resta)
  WHEN 10 THEN
    'En el corral había ' ||
    COALESCE(substring(p.enunciado FROM 'tiene (\d+) globos'), '?') ||
    ' gallinas. ' ||
    COALESCE(substring(p.enunciado FROM 'regal. (\d+) globos'), '?') ||
    ' se escaparon por el portón abierto. ¿Cuántas gallinas quedaron en el corral?'
  WHEN 11 THEN
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
  WHERE fase_id=3 AND seccion IN (3011,3012,3013) AND (enunciado LIKE '%R$%' OR enunciado LIKE '%??%');
  IF v_q > 0 THEN RAISE WARNING '% filas M3 con caracteres extraños o R$.', v_q;
  ELSE RAISE NOTICE 'CHECK 2 OK: Sin precios R$ ni caracteres corruptos en Modulo 3.'; END IF;
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
