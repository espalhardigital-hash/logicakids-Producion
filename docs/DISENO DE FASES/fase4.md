Aquí tienes el desarrollo completo, profundo y estructurado de la **Fase 4: Fracciones, Porcentajes y Proporciones**, diseñado exactamente bajo la misma concepción filosófica, técnica y pedagógica que el documento de la Fase 2 que me proporcionaste.

Este documento está redactado como un manual maestro (GDD - Game Design Document) listo para ser interpretado por desarrolladores, diseñadores de UI e inteligencias artificiales encargadas de generar los scripts de base de datos.

---

# Documento de Reglas para Generación y Carga de Preguntas — Fase 4 LogicaKids Pro

**Versión:** 1.0 — Documento de Diseño Arquitectónico y Pedagógico
**Estado:** Documento base de trabajo
**Fase:** Fase 4 — Fracciones, Porcentajes y Proporciones
**Proyecto:** LogicaKids Pro

---

# 1. Propósito del Documento

Este documento define las directrices pedagógicas, técnicas y operativas para la generación, almacenamiento, validación y presentación de preguntas correspondientes a la **Fase 4 de LogicaKids Pro**, enfocada en la visualización de la relación "parte-todo" y la ruptura del pensamiento de números enteros absolutos.

La Fase 4 tiene como objetivo desarrollar las siguientes competencias:

1. Comprensión visual y numérica de fracciones (numerador/denominador).
2. Cálculo de fracciones sobre conjuntos o cantidades enteras.
3. Entendimiento de la equivalencia fraccionaria y comparación.
4. Dominio rápido de porcentajes amigables (50%, 25%, 10%).
5. Razonamiento proporcional simple aplicado a mezclas y lectura de gráficos (alineado con los estándares de exámenes como el Pedro II).

**Arquitectura:** Se mantiene el modelo híbrido *Server-Authoritative*. El servidor FastAPI controla los cálculos, la progresión del Bucle Espejo y la inyección de datos para los componentes visuales interactivos (Cortador de Pizza, Termómetro Reactivo).

---

# 2. Reglas de Interfaz y UI Visual

Dado que la Fase 4 es **altamente manipulativa**, el backend no enviará solo texto, sino estructuras JSONB que configurarán los componentes visuales del frontend.

* **El Cortador de Pizza (SVG Dinámico):** Un círculo interactivo donde el alumno configura el denominador (cortes) y el numerador (porciones coloreadas). El backend validará la fracción enviada: `{"numerador": 3, "denominador": 8}`.
* **El Termómetro Reactivo:** Una barra vertical de carga. Al arrastrarla al 50%, el backend valida si corresponde a la fracción 1/2 o al dato solicitado.
* **Bucle Espejo Gráfico:** Si el alumno se equivoca, el Bucle Espejo no solo congela el avance, sino que anima la figura en pantalla para demostrar visualmente el error antes de cargar la variante matemática.

---

# 3. MÓDULO 1: LA FRACCIÓN VISUAL (El Cortador de Porciones)

**Propósito Pedagógico:** Enseñar que los números pueden representar "pedazos rotos" de algo entero. El número de abajo (denominador) es el jefe que corta, y el número de arriba (numerador) es el recolector que toma.
**Interfaz:** Cortador de Pizza Interactivo y Cuadrículas irregulares.

## 👑 Nivel 1: Identificación de Regiones

* **Enfoque:** Leer figuras simétricas.
* **Interactivo 1:** "La pizza está cortada en 4 pedazos iguales y 1 tiene pepperoni. ¿Cuál es la fracción?" -> `[Input: 1/4]`
* **Trampa Conceptual:** El niño suma los pedazos sombreados y los no sombreados como dos números separados (ej. decir "1 y 3" en lugar de "1 de 4"). El Bucle Espejo debe reforzar que el denominador es el total absoluto.

## 👑 Nivel 2: Sombreando la Fracción

* **Enfoque:** Acción inversa. El sistema da la fracción y el niño pinta la cuadrícula interactiva.
* **Interactivo 2:** "Pinta exactamente 3/8 de este rectángulo de cristal." (El niño hace clic en 3 de los 8 recuadros).
* **Validación Backend:** El servidor verifica que el array de regiones seleccionadas tenga `length == 3` y que la cuadrícula base sea `8`.

## 👑 Nivel 3: La Unidad Completa (El 1 Disfrazado)

* **Enfoque:** Entender que si tomo todos los pedazos, tengo la unidad. 4/4 = 1.
* **Interactivo 3:** "Si una barra de chocolate tiene 6 pedazos y te comes los 6, ¿qué fracción de chocolate te comiste?" -> `[Input: 6/6]` -> ¡Eso es igual a 1 chocolate entero!

---

# 4. MÓDULO 2: FRACCIÓN DE UNA CANTIDAD (El Operador de Inventarios)

**Propósito Pedagógico:** Transicionar de la figura geométrica abstracta a cantidades reales (inventarios de canicas, dinero, alumnos). Aquí la fracción funciona como un "operador": primero divide el total en grupos (denominador) y luego multiplica por los grupos que quiero (numerador).

## 👑 Nivel 1: Fracciones Unitarias Básicas

* **Enfoque:** Calcular 1/2, 1/3 y 1/4 de números enteros.
* **Teoría:** "Para encontrar 1/3 de 15 manzanas, primero metes las manzanas en 3 cajas iguales (`15 ÷ 3 = 5`). ¡Cada caja tiene 5 manzanas!"
* **Interactivo 1:** "Calcula 1/4 de 20 tazos." -> `[Input: 5]`

## 👑 Nivel 2: Fracciones Compuestas (El Algoritmo de dos pasos)

* **Enfoque:** Calcular fracciones como 3/4 o 2/5 aplicando el motor: `(Total ÷ Denominador) × Numerador`.
* **Teoría:** "Para calcular 3/4 de 20 tazos. Paso 1 (Corta): `20 ÷ 4 = 5`. Paso 2 (Recolecta): Toma 3 de esos grupos. `5 × 3 = 15`."
* **Interactivo 2:** "Calcula 2/5 de 50 monedas." -> `[Input: 20]`

## 👑 Nivel 3: El Resto del Inventario (Problemas Verbales)

* **Enfoque:** Razonamiento lógico sobre la parte no tomada.
* **Teoría:** "Si te comes 1/4 de las galletas, no hace falta contar todo otra vez para saber que te quedan 3/4 en el frasco."
* **Interactivo 3:** "Mateo tenía 30 cartas. Regaló 1/3 a su hermano. ¿Cuántas cartas le QUEDAN a Mateo?" (El niño calcula 1/3 = 10, y resta 30 - 10 = 20). -> `[Input: 20]`

---

# 5. MÓDULO 3: COMPARACIÓN Y EQUIVALENCIA (El Espejo de las Fracciones)

**Propósito Pedagógico:** Demostrar que pedazos más pequeños pueden sumar la misma cantidad que un pedazo grande.

## 👑 Nivel 1: Equivalencia Visual

* **Enfoque:** Demostrar que 1/2 = 2/4 = 4/8.
* **Interactivo 1:** (Visualiza media pizza). "Si corto cada pedazo grande a la mitad, ahora tengo 4 pedazos, pero sigo teniendo la misma cantidad de comida. Escribe la nueva fracción." -> `[Input: 2/4]`

## 👑 Nivel 2: Tablas de Amplificación

* **Enfoque:** Multiplicar arriba y abajo por el mismo número para crear clones de la fracción.
* **Interactivo 2:** "Multiplica el numerador y el denominador por 3 para encontrar el clon de 2/5." -> `[Inputs: 6 y 15]`

## 👑 Nivel 3: Orden de Fracciones

* **Enfoque:** ¿Quién es más grande? Regla de oro: Si el numerador es igual, el denominador más pequeño hace pedazos más grandes (1/2 es mayor que 1/8).
* **Interactivo 3:** "Ordena de menor a mayor: 1/8, 1/2, 1/4." -> Validación de UI tipo "Drag and Drop" verificada por el backend en formato array `[1/8, 1/4, 1/2]`.

---

# 6. MÓDULO 4: PORCENTAJES PRÁCTICOS (El Termómetro)

**Propósito Pedagógico:** Eliminar el miedo al símbolo `%`. Enseñar a los niños de 10 años que el porcentaje no es magia, es solo una fracción disfrazada que siempre tiene el número 100 como denominador.

## 👑 Nivel 1: Los Tres Porcentajes Amigables

* **Enfoque:** Traducir % a fracciones conocidas.
* 50% = La mitad (÷ 2)
* 25% = La cuarta parte (÷ 4)
* 10% = La décima parte (÷ 10)


* **Interactivo 1:** "El 50% de R$ 40,00 es lo mismo que calcular su mitad. ¿Cuánto es?" -> `[Input: 20]`

## 👑 Nivel 2: Descuentos y Aumentos Simples

* **Enfoque:** Calcular el valor de la rebaja y restarlo del precio.
* **Teoría:** (Misión de 2 pasos del Módulo 5, Fase 2). "Paso 1: Calcula el 10% de R$ 80,00 (es 8). Paso 2: Como es un descuento, ¡réstalo! `80 - 8 = 72`."
* **Interactivo 2:** "Un juguete cuesta 60 puntos. Hoy tiene un 25% de descuento (una cuarta parte). ¿Cuánto cuesta ahora?" -> `[Input: 45]`

## 👑 Nivel 3: Encontrar el Total Original (Ingeniería Inversa)

* **Enfoque:** Si sé que 10 es el 50% (la mitad), entonces el total (100%) debe ser 20.
* **Interactivo 3:** "Si el 25% (un cuarto) de un tanque se llena con 10 litros, ¿cuántos litros caben en el tanque completo?" -> `[Input: 40]`

---

# 7. MÓDULO 5: RAZÓN Y PROPORCIÓN (El Laboratorio de Mezclas)

**Propósito Pedagógico:** Conectar las fracciones con la vida real mediante recetas y lecturas de gráficos de pastel/barras (evaluación típica de exámenes de admisión).

## 👑 Nivel 1: Razones Simples (El Idioma de los Ingredientes)

* **Enfoque:** Leer relaciones "A por cada B".
* **Interactivo 1:** "Una receta dice: 2 tazas de agua por 1 de arroz (2:1). Si pones 4 tazas de agua, ¿cuántas tazas de arroz necesitas?" -> `[Input: 2]`

## 👑 Nivel 2: Escalado de Mezclas Totales

* **Enfoque:** Sumar las partes para encontrar el total de la mezcla y luego escalar (Estilo pregunta examen Pedro II).
* **Teoría:** "Si mezclas 2 litros de pintura azul y 3 litros de amarilla, fabricas 5 litros de pintura verde. ¡El total del lote es 5!"
* **Interactivo 2:** "Para hacer un lote de 5 litros de jugo, usas 2 litros de naranja y 3 de agua. Si quieres fabricar un mega-lote de 50 litros de jugo (10 veces más), ¿cuántos litros de naranja necesitas?" -> `[Input: 20]`

## 👑 Nivel 3: Enlace Visual (Gráficos Sectoriales)

* **Enfoque:** Leer un gráfico circular y extraer datos reales.
* **Interactivo 3:** (UI muestra un círculo donde la mitad [50%] es "Perros" y un cuarto [25%] es "Gatos"). "Si en total encuestamos a 40 personas, ¿cuántas prefieren Gatos?" -> `[Input: 10]`

---

# 8. BLOQUE DE EVALUACIÓN: DESAFÍOS DE LA FASE 4

## ⚡ Desafío 1: El Analista Gráfico (Dificultad Estándar)

* **Formato:** Opción Múltiple (A, B, C, D) + Imágenes/SVG renderizados desde JSONB.
* **Contenido:** 25 preguntas. Foco en Módulos 1, 3 y 4 (Identificación visual, equivalencias, 50%/25%/10% directos).
* **Temporizador:** 45 segundos por pregunta.
* **Early Exit:** Cierre automático al 3er error.

## 🚀 Desafío 2: Operador de Inventarios y Mezclas (Dificultad Avanzada)

* **Formato:** Opción Múltiple (A, B, C, D).
* **Contenido:** 25 preguntas. Foco en Módulos 2 y 5 (Algoritmo de 2 pasos de fracciones de cantidades, escalado de recetas y descuentos porcentuales).
* **Temporizador:** 60 segundos por pregunta.
* **Early Exit:** Cierre automático al 3er error.

## 👑 Desafío Final: El Maestro Proporcional (Evocación Pura)

* **Formato:** Input vacío. Sin opciones de apoyo.
* **Contenido:** 10 preguntas integradoras que mezclan descuentos encadenados, fracciones de restos y lectura de proporciones complejas.
* **Temporizador:** 60 segundos.
* **Early Exit:** Cierre fulminante al 2do error (Aprobación 9/10).

---

# 9. INSTRUCCIONES TÉCNICAS PARA IA: GENERACIÓN DE SCRIPTS (BASE DE DATOS)

*Nota para la IA de backend que desarrolle los scripts en Python:*

Cuando generes el script para popular la base de datos de la **Fase 4 (Fracciones y Porcentajes)**, debes usar el patrón JSONB definido en la Fase 2, incorporando metadata visual.

**Ejemplo de Prompt / Regla para la generación en Python (Módulo 2, Nivel 2):**

> "Genera un script en Python que construya un pool de 150 preguntas únicas para el M2N2 (Fracciones compuestas). El script debe usar una lista de denominadores amigables `[3, 4, 5, 8, 10]`. El 'Total' (inventario) debe ser SIEMPRE un múltiplo exacto del denominador para que la división sea perfecta y entera (sin decimales). La respuesta correcta se calcula como `(Total / Denominador) * Numerador`. Exporta un JSON con los campos `id`, `modulo_id`, `enunciado`, `respuesta_correcta`, y un objeto `retroalimentacion_error` que explique el algoritmo de dos pasos."

**Ejemplo de Estructura JSONB Esperada (Módulo 4, Nivel 2 - Descuentos):**

```json
{
  "id": 44201,
  "modulo": 4,
  "nivel": 2,
  "tipo_pregunta": "calculo_descuento_amigable",
  "enunciado": "Un videojuego cuesta R$ 120,00. Hoy tiene un descuento del 25% por oferta especial. ¿Cuánto cuesta el videojuego con el descuento aplicado?",
  "respuesta_correcta": "90",
  "metadata_tecnica": {
    "precio_original": 120,
    "porcentaje": 25,
    "operacion_logica": "120 - (120 / 4) = 90"
  },
  "retroalimentacion_bucle": {
    "donde_esta_el_error": "Olvidaste restar el descuento al precio original.",
    "explicacion_pedagogica": "Paso 1: Calcula el 25% (la cuarta parte) de 120, que es 30. Paso 2: Resta esos 30 al precio inicial. 120 - 30 = 90."
  }
}

```

---

# 10. RESUMEN OPERATIVO DE LA FASE 4

| Bloque | Formato UI | Cantidad | Tiempo | Bucle Espejo | Aprobación |
| --- | --- | --- | --- | --- | --- |
| **M1:** La Fracción Visual | SVG Interactivo (Pizza/Grid) | 15 a 20 | Sin tiempo | Sí | 90% (Early Exit) |
| **M2:** Fracción de Cantidad | Input Textual | 20 | Sin tiempo | Sí | 90% (Early Exit) |
| **M3:** Equivalencia | Drag & Drop / Input | 15 | Sin tiempo | Sí | 90% (Early Exit) |
| **M4:** Porcentajes Prácticos | Termómetro / Input | 20 | Sin tiempo | Sí | 90% (Early Exit) |
| **M5:** Razón y Proporción | Gráficos Sectoriales / Input | 20 | Sin tiempo | Sí | 90% (Early Exit) |
| **Desafío 1:** Analista | Opción múltiple (A,B,C,D) | 25 | 45 s/preg | No | 23/25 (Early al 3er error) |
| **Desafío 2:** Operador | Opción múltiple (A,B,C,D) | 25 | 60 s/preg | No | 23/25 (Early al 3er error) |
| **Desafío Final:** Maestro | Input (Evocación pura) | 10 | 60 s/preg | No | 9/10 (Early al 2do error) |