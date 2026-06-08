-- ==============================================================================
-- ACTUALIZACIÓN DE TEXTOS DE TEORÍA — FASE 2
-- Sprint: Mayo 2026 — Sincronización seed.py ↔ Fase_2.md ↔ BD
-- ==============================================================================
-- Ejecutar: docker exec -i <postgres_container> psql -U <user> -d <dbname> < update_teoria_textos.sql
-- ==============================================================================

-- Módulo 1, Nivel 1: "Conceptos de doble, triple, mitad y cuádruple"
-- ANTES: texto gamificado ("¡Hola, atleta de la mente! Bienvenido al Gimnasio Numérico...")
-- AHORA: texto conceptual formal aprobado en Fase_2.md
UPDATE niveles_teoria_pool
SET texto_descubrimiento = 'Comprender el doble, el triple o el cuádruple de una cantidad significa aplicar un factor de escala mediante la multiplicación. Cuando calculas el doble de un número, no estás simplemente sumando; estás tomando esa misma cantidad exacta dos veces. De manera similar, la mitad de un número es un proceso de partición equitativa: significa dividir la cantidad original en dos partes exactamente iguales. Dominar estas escalas te permitirá proyectar y reducir cantidades de forma rápida y mental, lo cual es la base del pensamiento proporcional.'
WHERE fase_id = 2
  AND modulo_id = 1
  AND nivel_id = 1;

-- Verificación
SELECT modulo_id, nivel_id, LEFT(texto_descubrimiento, 80) AS texto_preview
FROM niveles_teoria_pool
WHERE fase_id = 2
ORDER BY modulo_id, nivel_id;
