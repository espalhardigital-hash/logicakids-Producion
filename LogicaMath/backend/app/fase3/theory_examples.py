# theory_examples.py
# ─────────────────────────────────────────────────────────────
# Base de ejemplos extendidos y formateados premium para Fase 3.
# Garantiza exactamente 5 ejemplos guiados por nivel.

def obtener_ejemplos_expandidos_fase3(modulo_id: int, nivel_id: int) -> list:
    ejemplos_db = {
        # --- MÓDULO 1: EL DETECTIVE LITERARIO ---
        # Nivel 1: Aislamiento de Variables Críticas
        (1, 1): [
            {
                "enunciado": "Lucas tiene <span class=\"keyword-highlight\">5 manzanas rojas</span> y <span class=\"keyword-highlight\">3 bicicletas azules</span> (basura). Regala <span class=\"keyword-highlight\">2 manzanas</span>. ¿Cuántas manzanas le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "La pregunta es sobre manzanas. Ignoramos las <span class=\"keyword-highlight\">3 bicicletas azules</span> por completo."},
                    {"orden": 2, "texto": "Operamos con las manzanas: <span class=\"keyword-highlight\">5 - 2 = 3 manzanas</span>."}
                ]
            },
            {
                "enunciado": "Sofía compró <span class=\"keyword-highlight\">4 libros</span> y <span class=\"keyword-highlight\">2 lápices</span> (basura). Perdió <span class=\"keyword-highlight\">1 libro</span> en el camino. ¿Cuántos libros le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "La pregunta es sobre libros. Ignoramos los <span class=\"keyword-highlight\">2 lápices</span>."},
                    {"orden": 2, "texto": "Operamos con los libros: <span class=\"keyword-highlight\">4 - 1 = 3 libros</span>."}
                ]
            },
            {
                "enunciado": "María tiene <span class=\"keyword-highlight\">10 globos</span> y <span class=\"keyword-highlight\">3 gatos</span> (basura). Se le revientan <span class=\"keyword-highlight\">4 globos</span>. ¿Cuántos globos le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "La pregunta es sobre globos. Ignoramos los <span class=\"keyword-highlight\">3 gatos</span>."},
                    {"orden": 2, "texto": "Restamos los globos: <span class=\"keyword-highlight\">10 - 4 = 6 globos</span>."}
                ]
            },
            {
                "enunciado": "En un garaje hay <span class=\"keyword-highlight\">8 autos</span> y <span class=\"keyword-highlight\">5 bicicletas</span> (basura). Salen <span class=\"keyword-highlight\">3 autos</span>. ¿Cuántos autos quedan?",
                "pasos": [
                    {"orden": 1, "texto": "La pregunta es sobre autos. Ignoramos las <span class=\"keyword-highlight\">5 bicicletas</span>."},
                    {"orden": 2, "texto": "Restamos los autos: <span class=\"keyword-highlight\">8 - 3 = 5 autos</span>."}
                ]
            },
            {
                "enunciado": "Lucas tiene <span class=\"keyword-highlight\">15 figuritas</span> y <span class=\"keyword-highlight\">4 pelotas</span> (basura). Le regala <span class=\"keyword-highlight\">5 figuritas</span> a su hermano. ¿Cuántas figuritas tiene ahora?",
                "pasos": [
                    {"orden": 1, "texto": "La pregunta es sobre figuritas. Ignoramos las <span class=\"keyword-highlight\">4 pelotas</span>."},
                    {"orden": 2, "texto": "Operamos las figuritas: <span class=\"keyword-highlight\">15 - 5 = 10 figuritas</span>."}
                ]
            }
        ],
        # Nivel 2: Datos Útiles vs. Datos Basura
        (1, 2): [
            {
                "enunciado": "Lucas tiene <span class=\"keyword-highlight\">12 años</span>. Tomó el autobús <span class=\"keyword-highlight\">número 5</span> a las <span class=\"keyword-highlight\">3:00 PM</span> y compró <span class=\"keyword-highlight\">8 dulces</span>. Si se comió <span class=\"keyword-highlight\">3 dulces</span>, ¿cuántos le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos datos basura: <span class=\"keyword-highlight\">12 años</span>, <span class=\"keyword-highlight\">autobús 5</span> y <span class=\"keyword-highlight\">hora 3:00 PM</span>."},
                    {"orden": 2, "texto": "Identificamos datos útiles: <span class=\"keyword-highlight\">8 dulces iniciales</span>, <span class=\"keyword-highlight\">3 dulces consumidos</span>."},
                    {"orden": 3, "texto": "Operamos: <span class=\"keyword-highlight\">8 - 3 = 5 dulces</span>."}
                ]
            },
            {
                "enunciado": "En el año <span class=\"keyword-highlight\">2024</span>, Juan de <span class=\"keyword-highlight\">9 años</span> tenía <span class=\"keyword-highlight\">15 tazos</span>. Perdió <span class=\"keyword-highlight\">4 tazos</span>. ¿Cuántos tazos le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Basura: <span class=\"keyword-highlight\">año 2024</span>, edad <span class=\"keyword-highlight\">9 años</span>."},
                    {"orden": 2, "texto": "Útiles: <span class=\"keyword-highlight\">15 tazos iniciales</span>, <span class=\"keyword-highlight\">4 perdidos</span>."},
                    {"orden": 3, "texto": "Operamos: <span class=\"keyword-highlight\">15 - 4 = 11 tazos</span>."}
                ]
            },
            {
                "enunciado": "Pedro tiene <span class=\"keyword-highlight\">11 años</span>. Ayer compró <span class=\"keyword-highlight\">10 chocolates</span> y <span class=\"keyword-highlight\">4 chupetines</span> (basura). Se comió <span class=\"keyword-highlight\">3 chocolates</span>. ¿Cuántos chocolates le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos la edad de <span class=\"keyword-highlight\">11 años</span> y los <span class=\"keyword-highlight\">chupetines</span>."},
                    {"orden": 2, "texto": "Identificamos útiles: <span class=\"keyword-highlight\">10 chocolates iniciales</span>, <span class=\"keyword-highlight\">3 comidos</span>."},
                    {"orden": 3, "texto": "Operamos: <span class=\"keyword-highlight\">10 - 3 = 7 chocolates</span>."}
                ]
            },
            {
                "enunciado": "A las <span class=\"keyword-highlight\">4:00 PM</span>, un tren partió con <span class=\"keyword-highlight\">20 pasajeros</span>. En el año <span class=\"keyword-highlight\">2025</span>, el tren sumó <span class=\"keyword-highlight\">5 pasajeros</span> en la estación. ¿Cuántos pasajeros van ahora?",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos la hora <span class=\"keyword-highlight\">4:00 PM</span> y el año <span class=\"keyword-highlight\">2025</span>."},
                    {"orden": 2, "texto": "Operamos pasajeros: <span class=\"keyword-highlight\">20 + 5 = 25 pasajeros</span>."}
                ]
            },
            {
                "enunciado": "En una tienda que abre a las <span class=\"keyword-highlight\">8:00 AM</span>, un niño de <span class=\"keyword-highlight\">12 años</span> compra <span class=\"keyword-highlight\">15 galletas</span>. Le regala <span class=\"keyword-highlight\">6</span> a su amigo. ¿Cuántas galletas le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos la hora <span class=\"keyword-highlight\">8:00 AM</span> y la edad de <span class=\"keyword-highlight\">12 años</span>."},
                    {"orden": 2, "texto": "Operamos galletas: <span class=\"keyword-highlight\">15 - 6 = 9 galletas</span>."}
                ]
            }
        ],
        # Nivel 3: Descarte por Incongruencia
        (1, 3): [
            {
                "enunciado": "En un estante hay <span class=\"keyword-highlight\">12 libros de historia</span>, <span class=\"keyword-highlight\">15 litros de agua</span> y <span class=\"keyword-highlight\">4 cuadernos</span>. ¿Cuántas unidades de papelería/lectura hay en total?",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos magnitudes: <span class=\"keyword-highlight\">12 libros</span> (papelería), <span class=\"keyword-highlight\">15 litros</span> (líquido), <span class=\"keyword-highlight\">4 cuadernos</span> (papelería)."},
                    {"orden": 2, "texto": "La pregunta es sobre papelería. Descartamos los <span class=\"keyword-highlight\">15 litros</span> por incongruencia."},
                    {"orden": 3, "texto": "Sumamos papelería: <span class=\"keyword-highlight\">12 + 4 = 16 unidades</span>."}
                ]
            },
            {
                "enunciado": "Un chef tiene <span class=\"keyword-highlight\">5 kg de harina</span>, <span class=\"keyword-highlight\">3 litros de leche</span> y <span class=\"keyword-highlight\">2 kg de azúcar</span>. ¿Cuántos kg de ingredientes secos tiene?",
                "pasos": [
                    {"orden": 1, "texto": "Harina y azúcar están en kg. Leche está en litros (líquido). Descartamos leche."},
                    {"orden": 2, "texto": "Sumamos ingredientes secos: <span class=\"keyword-highlight\">5 kg + 2 kg = 7 kg</span>."}
                ]
            },
            {
                "enunciado": "En una mochila hay <span class=\"keyword-highlight\">8 lápices</span>, <span class=\"keyword-highlight\">2 botellas de agua (litros)</span> y <span class=\"keyword-highlight\">3 gomas</span>. ¿Cuántos útiles escolares hay?",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos magnitudes y descartamos las <span class=\"keyword-highlight\">botellas de agua</span> (líquido) por incongruencia."},
                    {"orden": 2, "texto": "Sumamos útiles: <span class=\"keyword-highlight\">8 + 3 = 11 útiles</span>."}
                ]
            },
            {
                "enunciado": "Un camión transporta <span class=\"keyword-highlight\">10 cajas de manzanas</span>, <span class=\"keyword-highlight\">50 litros de gasolina</span> en el tanque y <span class=\"keyword-highlight\">4 cajas de peras</span>. ¿Cuántas cajas de frutas transporta?",
                "pasos": [
                    {"orden": 1, "texto": "Descartamos los <span class=\"keyword-highlight\">50 litros de gasolina</span> por incongruencia (combustible vs fruta)."},
                    {"orden": 2, "texto": "Sumamos las cajas de frutas: <span class=\"keyword-highlight\">10 + 4 = 14 cajas</span>."}
                ]
            },
            {
                "enunciado": "Un pintor compró <span class=\"keyword-highlight\">6 latas de pintura</span>, <span class=\"keyword-highlight\">2 escaleras</span> y <span class=\"keyword-highlight\">3 pinceles</span>. ¿Cuántas herramientas de aplicación (latas y pinceles) tiene?",
                "pasos": [
                    {"orden": 1, "texto": "Descartamos las <span class=\"keyword-highlight\">2 escaleras</span> por incongruencia conceptual."},
                    {"orden": 2, "texto": "Sumamos latas y pinceles: <span class=\"keyword-highlight\">6 + 3 = 9 herramientas</span>."}
                ]
            }
        ],

        # --- MÓDULO 2: SECUENCIA TEMPORAL ---
        # Nivel 1: Operaciones Cronológicas
        (2, 1): [
            {
                "enunciado": "Un tren arranca con <span class=\"keyword-highlight\">20 pasajeros</span>. Bajan <span class=\"keyword-highlight\">5</span> y luego suben <span class=\"keyword-highlight\">8</span>. ¿Cuántos van ahora?",
                "pasos": [
                    {"orden": 1, "texto": "Punto de partida: <span class=\"keyword-highlight\">20 pasajeros</span>."},
                    {"orden": 2, "texto": "Primer evento cronológico: Bajan 5. Quedan <span class=\"keyword-highlight\">20 - 5 = 15</span>."},
                    {"orden": 3, "texto": "Segundo evento: Suben 8. Ahora van <span class=\"keyword-highlight\">15 + 8 = 23 pasajeros</span>."}
                ]
            },
            {
                "enunciado": "Sofía inicia el día con <span class=\"keyword-highlight\">15 tazos</span>. Pierde <span class=\"keyword-highlight\">5</span> jugando, y luego su hermano le regala <span class=\"keyword-highlight\">8</span>. ¿Cuántos tiene ahora?",
                "pasos": [
                    {"orden": 1, "texto": "Punto de partida: <span class=\"keyword-highlight\">15 tazos</span>."},
                    {"orden": 2, "texto": "Primer evento: Pierde 5. Quedan <span class=\"keyword-highlight\">15 - 5 = 10 tazos</span>."},
                    {"orden": 3, "texto": "Segundo evento: Regalan 8. Ahora tiene <span class=\"keyword-highlight\">10 + 8 = 18 tazos</span>."}
                ]
            },
            {
                "enunciado": "Una alcancía tiene <span class=\"keyword-highlight\">30 monedas</span>. Sacamos <span class=\"keyword-highlight\">10</span> para comprar un juguete, y luego metemos <span class=\"keyword-highlight\">5</span>. ¿Cuántas monedas quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Punto de partida: 30 monedas."},
                    {"orden": 2, "texto": "Sacamos 10 monedas: <span class=\"keyword-highlight\">30 - 10 = 20 monedas</span>."},
                    {"orden": 3, "texto": "Metemos 5 monedas: <span class=\"keyword-highlight\">20 + 5 = 25 monedas</span>."}
                ]
            },
            {
                "enunciado": "Un árbol tenía <span class=\"keyword-highlight\">12 pájaros</span>. Se volaron <span class=\"keyword-highlight\">4</span>, y luego llegaron <span class=\"keyword-highlight\">6 nuevos</span>. ¿Cuántos pájaros hay ahora?",
                "pasos": [
                    {"orden": 1, "texto": "Partida: 12 pájaros."},
                    {"orden": 2, "texto": "Se van 4: <span class=\"keyword-highlight\">12 - 4 = 8 pájaros</span>."},
                    {"orden": 3, "texto": "Llegan 6: <span class=\"keyword-highlight\">8 + 6 = 14 pájaros</span>."}
                ]
            },
            {
                "enunciado": "Una biblioteca tiene <span class=\"keyword-highlight\">50 libros</span>. Prestamos <span class=\"keyword-highlight\">15</span> y al final del día devuelven <span class=\"keyword-highlight\">10</span>. ¿Cuántos libros quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Partida: 50 libros."},
                    {"orden": 2, "texto": "Prestamos 15: <span class=\"keyword-highlight\">50 - 15 = 35 libros</span>."},
                    {"orden": 3, "texto": "Devuelven 10: <span class=\"keyword-highlight\">35 + 10 = 45 libros</span>."}
                ]
            }
        ],
        # Nivel 2: Álgebra Retrospectiva
        (2, 2): [
            {
                "enunciado": "Lucas regaló <span class=\"keyword-highlight\">4 juguetes</span> y se quedó con <span class=\"keyword-highlight\">10</span>. ¿Cuántos tenía al principio?",
                "pasos": [
                    {"orden": 1, "texto": "Estado final: <span class=\"keyword-highlight\">10 juguetes</span>."},
                    {"orden": 2, "texto": "Viajamos al pasado: Como regaló (restó) 4, aplicamos la inversa (sumar 4)."},
                    {"orden": 3, "texto": "Calculamos el inicio: <span class=\"keyword-highlight\">10 + 4 = 14 juguetes</span>."}
                ]
            },
            {
                "enunciado": "Un cofre de monedas fue asaltado y le quitaron <span class=\"keyword-highlight\">8 monedas</span>. Ahora quedan <span class=\"keyword-highlight\">12</span>. ¿Cuántas monedas tenía al inicio?",
                "pasos": [
                    {"orden": 1, "texto": "Estado final: <span class=\"keyword-highlight\">12 monedas</span>."},
                    {"orden": 2, "texto": "Viajamos al pasado: Como le quitaron 8, aplicamos la inversa (sumar 8)."},
                    {"orden": 3, "texto": "Calculamos el inicio: <span class=\"keyword-highlight\">12 + 8 = 20 monedas</span>."}
                ]
            },
            {
                "enunciado": "Sofía recibió <span class=\"keyword-highlight\">5 chocolates</span> de su tío y ahora tiene <span class=\"keyword-highlight\">15</span> en total. ¿Cuántos chocolates tenía Sofía antes del regalo?",
                "pasos": [
                    {"orden": 1, "texto": "Estado final: <span class=\"keyword-highlight\">15 chocolates</span>."},
                    {"orden": 2, "texto": "Viajamos al pasado: Como recibió (sumó) 5, aplicamos la inversa (restar 5)."},
                    {"orden": 3, "texto": "Calculamos el inicio: <span class=\"keyword-highlight\">15 - 5 = 10 chocolates</span>."}
                ]
            },
            {
                "enunciado": "Un autobús deja <span class=\"keyword-highlight\">6 pasajeros</span> en la estación y se queda con <span class=\"keyword-highlight\">14</span>. ¿Cuántos pasajeros llevaba al inicio?",
                "pasos": [
                    {"orden": 1, "texto": "Estado final: <span class=\"keyword-highlight\">14 pasajeros</span>."},
                    {"orden": 2, "texto": "Pasado: Sumamos los que bajaron: <span class=\"keyword-highlight\">14 + 6</span>."},
                    {"orden": 3, "texto": "Total inicial: <span class=\"keyword-highlight\">20 pasajeros</span>."}
                ]
            },
            {
                "enunciado": "Una biblioteca prestó <span class=\"keyword-highlight\">12 libros</span> y ahora le quedan <span class=\"keyword-highlight\">38</span> en los estantes. ¿Cuántos libros tenía al inicio?",
                "pasos": [
                    {"orden": 1, "texto": "Estado final: <span class=\"keyword-highlight\">38 libros</span>."},
                    {"orden": 2, "texto": "Pasado: Sumamos los libros prestados: <span class=\"keyword-highlight\">38 + 12</span>."},
                    {"orden": 3, "texto": "Total inicial: <span class=\"keyword-highlight\">50 libros</span>."}
                ]
            }
        ],
        # Nivel 3: Mutaciones Sucesivas
        (2, 3): [
            {
                "enunciado": "Un estanque de agua tiene <span class=\"keyword-highlight\">50 litros</span>. Se vacían <span class=\"keyword-highlight\">20 litros</span>, luego se <span class=\"keyword-highlight\">duplica</span> el agua restante, y finalmente se evaporan <span class=\"keyword-highlight\">10 litros</span>. ¿Cuántos litros quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: <span class=\"keyword-highlight\">50 litros - 20 litros vaciados = 30 litros</span>."},
                    {"orden": 2, "texto": "Paso 2: Se duplica el restante: <span class=\"keyword-highlight\">30 × 2 = 60 litros</span>."},
                    {"orden": 3, "texto": "Paso 3: Se evaporan 10 litros: <span class=\"keyword-highlight\">60 - 10 = 50 litros finales</span>."}
                ]
            },
            {
                "enunciado": "Un comerciante tiene <span class=\"keyword-highlight\">10 manzanas</span>. Compra <span class=\"keyword-highlight\">5 más</span>, luego <span class=\"keyword-highlight\">duplica</span> toda su mercadería, y al final vende <span class=\"keyword-highlight\">8 manzanas</span>. ¿Cuántas manzanas le quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: <span class=\"keyword-highlight\">10 + 5 = 15 manzanas</span>."},
                    {"orden": 2, "texto": "Paso 2: Se duplica: <span class=\"keyword-highlight\">15 × 2 = 30 manzanas</span>."},
                    {"orden": 3, "texto": "Paso 3: Vende 8: <span class=\"keyword-highlight\">30 - 8 = 22 manzanas finales</span>."}
                ]
            },
            {
                "enunciado": "Un globo aerostático sube a <span class=\"keyword-highlight\">100 metros</span>. Desciende <span class=\"keyword-highlight\">40 metros</span>, luego sube <span class=\"keyword-highlight\">el doble de lo que descendió (80 metros)</span>, y baja <span class=\"keyword-highlight\">10 metros</span>. ¿A qué altura está?",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: Descenso inicial: <span class=\"keyword-highlight\">100 - 40 = 60 metros</span>."},
                    {"orden": 2, "texto": "Paso 2: Sube el doble (80 metros): <span class=\"keyword-highlight\">60 + 80 = 140 metros</span>."},
                    {"orden": 3, "texto": "Paso 3: Baja 10 metros: <span class=\"keyword-highlight\">140 - 10 = 130 metros finales</span>."}
                ]
            },
            {
                "enunciado": "Un jugador de cartas tiene <span class=\"keyword-highlight\">20 fichas</span>. Gana <span class=\"keyword-highlight\">10</span>, pierde <span class=\"keyword-highlight\">la mitad</span> de lo que tiene, y luego gana <span class=\"keyword-highlight\">5 fichas</span> más. ¿Cuántas tiene al final?",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: Gana 10: <span class=\"keyword-highlight\">20 + 10 = 30 fichas</span>."},
                    {"orden": 2, "texto": "Paso 2: Pierde la mitad: <span class=\"keyword-highlight\">30 ÷ 2 = 15 fichas</span>."},
                    {"orden": 3, "texto": "Paso 3: Gana 5 más: <span class=\"keyword-highlight\">15 + 5 = 20 fichas finales</span>."}
                ]
            },
            {
                "enunciado": "Un tanque contiene <span class=\"keyword-highlight\">100 litros</span>. Pierde <span class=\"keyword-highlight\">30 litros</span> por una fuga, luego se <span class=\"keyword-highlight\">duplica</span> el agua restante, y se extraen <span class=\"keyword-highlight\">40 litros</span>. ¿Cuántos litros quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: Pérdida: <span class=\"keyword-highlight\">100 - 30 = 70 litros</span>."},
                    {"orden": 2, "texto": "Paso 2: Se duplica: <span class=\"keyword-highlight\">70 × 2 = 140 litros</span>."},
                    {"orden": 3, "texto": "Paso 3: Extracción: <span class=\"keyword-highlight\">140 - 40 = 100 litros finales</span>."}
                ]
            }
        ],

        # --- MÓDULO 3: DEDUCCIÓN DE PRECIOS ---
        # Nivel 1: Comparación de Carritos
        (3, 1): [
            {
                "enunciado": "Carrito A: <span class=\"keyword-highlight\">3 cuadernos, 1 lápiz = R$ 13,00</span>. Carrito B: <span class=\"keyword-highlight\">3 cuadernos, 2 lápices = R$ 15,00</span>. ¿Cuánto cuesta 1 lápiz?",
                "pasos": [
                    {"orden": 1, "texto": "La única diferencia entre los dos carritos es que el Carrito B tiene <span class=\"keyword-highlight\">1 lápiz extra</span>."},
                    {"orden": 2, "texto": "La diferencia de precio es de <span class=\"keyword-highlight\">R$ 15,00 - R$ 13,00 = R$ 2,00</span>."},
                    {"orden": 3, "texto": "Por lo tanto, 1 lápiz cuesta <span class=\"keyword-highlight\">R$ 2,00</span>."}
                ]
            },
            {
                "enunciado": "Carrito A: <span class=\"keyword-highlight\">2 pizzas y 1 refresco = R$ 20,00</span>. Carrito B: <span class=\"keyword-highlight\">2 pizzas y 2 refrescos = R$ 25,00</span>. ¿Cuánto cuesta 1 refresco?",
                "pasos": [
                    {"orden": 1, "texto": "La única diferencia es el <span class=\"keyword-highlight\">refresco extra</span> en el Carrito B."},
                    {"orden": 2, "texto": "La diferencia de costo es: <span class=\"keyword-highlight\">R$ 25,00 - R$ 20,00 = R$ 5,00</span>."},
                    {"orden": 3, "texto": "Por lo tanto, 1 refresco cuesta <span class=\"keyword-highlight\">R$ 5,00</span>."}
                ]
            },
            {
                "enunciado": "Grupo A: <span class=\"keyword-highlight\">5 lápices y 1 goma = R$ 10,00</span>. Grupo B: <span class=\"keyword-highlight\">5 lápices y 2 gomas = R$ 12,00</span>. ¿Cuánto cuesta 1 goma?",
                "pasos": [
                    {"orden": 1, "texto": "La diferencia física es de <span class=\"keyword-highlight\">1 goma</span>."},
                    {"orden": 2, "texto": "La diferencia de costo es: <span class=\"keyword-highlight\">R$ 12,00 - R$ 10,00 = R$ 2,00</span>."},
                    {"orden": 3, "texto": "La goma cuesta: <span class=\"keyword-highlight\">R$ 2,00</span>."}
                ]
            },
            {
                "enunciado": "Paquete A: <span class=\"keyword-highlight\">3 libros = R$ 30,00</span>. Paquete B: <span class=\"keyword-highlight\">3 libros y 1 cuaderno = R$ 38,00</span>. ¿Cuánto cuesta 1 cuaderno?",
                "pasos": [
                    {"orden": 1, "texto": "La diferencia física es el <span class=\"keyword-highlight\">cuaderno</span> añadido en el paquete B."},
                    {"orden": 2, "texto": "La diferencia de precio es: <span class=\"keyword-highlight\">R$ 38,00 - R$ 30,00 = R$ 8,00</span>."},
                    {"orden": 3, "texto": "El cuaderno cuesta: <span class=\"keyword-highlight\">R$ 8,00</span>."}
                ]
            },
            {
                "enunciado": "Carrito A: <span class=\"keyword-highlight\">4 hamburguesas y 1 refresco = R$ 42,00</span>. Carrito B: <span class=\"keyword-highlight\">4 hamburguesas y 2 refrescos = R$ 46,00</span>. ¿Cuánto cuesta 1 refresco?",
                "pasos": [
                    {"orden": 1, "texto": "La diferencia es de <span class=\"keyword-highlight\">1 refresco</span>."},
                    {"orden": 2, "texto": "La diferencia de precio es: <span class=\"keyword-highlight\">R$ 46,00 - R$ 42,00 = R$ 4,00</span>."},
                    {"orden": 3, "texto": "El refresco cuesta: <span class=\"keyword-highlight\">R$ 4,00</span>."}
                ]
            }
        ],
        # Nivel 2: Grilla de Doble Entrada
        (3, 2): [
            {
                "enunciado": "Sabemos que <span class=\"keyword-highlight\">1 lápiz cuesta R$ 2,00</span>. Si una cuenta de <span class=\"keyword-highlight\">2 cuadernos y 2 lápices da R$ 14,00</span>. ¿Cuánto cuesta 1 cuaderno?",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos el costo de los lápices conocidos: 2 lápices × R$ 2,00 = <span class=\"keyword-highlight\">R$ 4,00</span>."},
                    {"orden": 2, "texto": "Restamos ese valor del total: R$ 14,00 - R$ 4,00 = <span class=\"keyword-highlight\">R$ 10,00</span> (eso cuestan los 2 cuadernos)."},
                    {"orden": 3, "texto": "Dividimos entre la cantidad de cuadernos: R$ 10,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 5,00 por cuaderno</span>."}
                ]
            },
            {
                "enunciado": "Sabemos que <span class=\"keyword-highlight\">1 refresco cuesta R$ 4,00</span>. Si <span class=\"keyword-highlight\">2 hamburguesas y 1 refresco cuestan R$ 24,00</span> en total, ¿cuánto cuesta 1 hamburguesa?",
                "pasos": [
                    {"orden": 1, "texto": "Restamos el valor del refresco al total: R$ 24,00 - R$ 4,00 = <span class=\"keyword-highlight\">R$ 20,00</span> (precio de las 2 hamburguesas)."},
                    {"orden": 2, "texto": "Dividimos el restante entre 2: R$ 20,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 10,00</span>."},
                    {"orden": 3, "texto": "Cada hamburguesa cuesta: <span class=\"keyword-highlight\">R$ 10,00</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">1 manzana cuesta R$ 2,00</span>, y <span class=\"keyword-highlight\">3 plátanos con 2 manzanas cuestan R$ 19,00</span>, ¿cuánto cuesta 1 plátano?",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos el valor de las 2 manzanas: 2 × R$ 2,00 = <span class=\"keyword-highlight\">R$ 4,00</span>."},
                    {"orden": 2, "texto": "Restamos del total: R$ 19,00 - R$ 4,00 = <span class=\"keyword-highlight\">R$ 15,00</span> (precio de los 3 plátanos)."},
                    {"orden": 3, "texto": "Dividimos entre 3: R$ 15,00 ÷ 3 = <span class=\"keyword-highlight\">R$ 5,00 por plátano</span>."}
                ]
            },
            {
                "enunciado": "Sabemos que <span class=\"keyword-highlight\">1 regla cuesta R$ 3,00</span>. Si <span class=\"keyword-highlight\">2 cuadernos y 3 reglas cuestan R$ 19,00</span>, ¿cuánto cuesta 1 cuaderno?",
                "pasos": [
                    {"orden": 1, "texto": "Costo de las 3 reglas: 3 × R$ 3,00 = <span class=\"keyword-highlight\">R$ 9,00</span>."},
                    {"orden": 2, "texto": "Restamos del total: R$ 19,00 - R$ 9,00 = <span class=\"keyword-highlight\">R$ 10,00</span> (precio de los 2 cuadernos)."},
                    {"orden": 3, "texto": "Dividimos entre 2: R$ 10,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 5,00 por cuaderno</span>."}
                ]
            },
            {
                "enunciado": "Sabemos que <span class=\"keyword-highlight\">1 chicle cuesta R$ 1,00</span>. Si <span class=\"keyword-highlight\">4 helados y 2 chicles cuestan R$ 22,00</span>, ¿cuánto cuesta 1 helado?",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos las 2 unidades conocidas: 2 chicles = <span class=\"keyword-highlight\">R$ 2,00</span>."},
                    {"orden": 2, "texto": "Restamos al total: R$ 22,00 - R$ 2,00 = <span class=\"keyword-highlight\">R$ 20,00</span> (precio de los 4 helados)."},
                    {"orden": 3, "texto": "Dividimos entre 4: R$ 20,00 ÷ 4 = <span class=\"keyword-highlight\">R$ 5,00 por helado</span>."}
                ]
            }
        ],
        # Nivel 3: Álgebra Visual
        (3, 3): [
            {
                "enunciado": "Un <span class=\"keyword-highlight\">pantalón</span> y una <span class=\"keyword-highlight\">camisa</span> cuestan <span class=\"keyword-highlight\">R$ 50,00</span> en total. El pantalón cuesta <span class=\"keyword-highlight\">R$ 10,00 más</span> que la camisa. ¿Cuánto cuesta la camisa?",
                "pasos": [
                    {"orden": 1, "texto": "Restamos la diferencia del total de la balanza: R$ 50,00 - R$ 10,00 = <span class=\"keyword-highlight\">R$ 40,00</span>."},
                    {"orden": 2, "texto": "Dividimos el resultado en dos partes iguales: R$ 40,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 20,00</span>."},
                    {"orden": 3, "texto": "El artículo de menor valor (la camisa) cuesta: <span class=\"keyword-highlight\">R$ 20,00</span>. (El pantalón cuesta 20 + 10 = R$ 30,00)."}
                ]
            },
            {
                "enunciado": "Un <span class=\"keyword-highlight\">libro</span> y un <span class=\"keyword-highlight\">cuaderno</span> cuestan <span class=\"keyword-highlight\">R$ 30,00</span> en total. El libro cuesta <span class=\"keyword-highlight\">R$ 6,00 más</span> que el cuaderno. ¿Cuánto cuesta el cuaderno?",
                "pasos": [
                    {"orden": 1, "texto": "Restamos la diferencia del total: R$ 30,00 - R$ 6,00 = <span class=\"keyword-highlight\">R$ 24,00</span>."},
                    {"orden": 2, "texto": "Dividimos el resultado entre 2: R$ 24,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 12,00</span>."},
                    {"orden": 3, "texto": "El artículo más barato (el cuaderno) cuesta: <span class=\"keyword-highlight\">R$ 12,00</span>. (El libro cuesta 12 + 6 = R$ 18,00)."}
                ]
            },
            {
                "enunciado": "Un <span class=\"keyword-highlight\">estuche</span> y una <span class=\"keyword-highlight\">mochila</span> cuestan <span class=\"keyword-highlight\">R$ 60,00</span> en total. La mochila cuesta <span class=\"keyword-highlight\">R$ 20,00 más</span> que el estuche. ¿Cuánto cuesta el estuche?",
                "pasos": [
                    {"orden": 1, "texto": "Quitamos el exceso de la mochila: R$ 60,00 - R$ 20,00 = <span class=\"keyword-highlight\">R$ 40,00</span>."},
                    {"orden": 2, "texto": "Repartimos a la mitad: R$ 40,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 20,00</span>."},
                    {"orden": 3, "texto": "El estuche (menor costo) vale: <span class=\"keyword-highlight\">R$ 20,00</span>. (La mochila vale 20 + 20 = R$ 40,00)."}
                ]
            },
            {
                "enunciado": "Una <span class=\"keyword-highlight\">pelota</span> y un <span class=\"keyword-highlight\">bate</span> cuestan <span class=\"keyword-highlight\">R$ 100,00</span> en total. El bate cuesta <span class=\"keyword-highlight\">R$ 40,00 más</span> que la pelota. ¿Cuánto cuesta la pelota?",
                "pasos": [
                    {"orden": 1, "texto": "Restamos la diferencia del total: R$ 100,00 - R$ 40,00 = <span class=\"keyword-highlight\">R$ 60,00</span>."},
                    {"orden": 2, "texto": "Dividimos el resultado entre 2: R$ 60,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 30,00</span>."},
                    {"orden": 3, "texto": "El artículo menor (pelota) cuesta: <span class=\"keyword-highlight\">R$ 30,00</span>. (El bate cuesta 30 + 40 = R$ 70,00)."}
                ]
            },
            {
                "enunciado": "Un par de <span class=\"keyword-highlight\">zapatos</span> y unos <span class=\"keyword-highlight\">calcetines</span> cuestan <span class=\"keyword-highlight\">R$ 80,00</span> en total. Los zapatos cuestan <span class=\"keyword-highlight\">R$ 60,00 más</span> que los calcetines. ¿Cuánto cuestan los calcetines?",
                "pasos": [
                    {"orden": 1, "texto": "Restamos la diferencia: R$ 80,00 - R$ 60,00 = <span class=\"keyword-highlight\">R$ 20,00</span>."},
                    {"orden": 2, "texto": "Dividimos el resto a la mitad: R$ 20,00 ÷ 2 = <span class=\"keyword-highlight\">R$ 10,00</span>."},
                    {"orden": 3, "texto": "Los calcetines cuestan: <span class=\"keyword-highlight\">R$ 10,00</span>."}
                ]
            }
        ],

        # --- MÓDULO 4: REPARTO Y RESIDUOS ---
        # Nivel 1: Agrupación Visual
        (4, 1): [
            {
                "enunciado": "Tenemos <span class=\"keyword-highlight\">120 dulces</span> y queremos empaquetarlos en <span class=\"keyword-highlight\">6 cajas</span> en partes iguales. ¿Cuántos dulces van en cada caja?",
                "pasos": [
                    {"orden": 1, "texto": "Realizamos la división directa: <span class=\"keyword-highlight\">120 dulces ÷ 6 cajas</span>."},
                    {"orden": 2, "texto": "Calculamos el cociente exacto: <span class=\"keyword-highlight\">120 ÷ 6 = 20 dulces</span> por caja."}
                ]
            },
            {
                "enunciado": "Se quieren repartir <span class=\"keyword-highlight\">150 lápices</span> en <span class=\"keyword-highlight\">5 estuches</span> en partes iguales. ¿Cuántos lápices van en cada estuche?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos el total entre los estuches: <span class=\"keyword-highlight\">150 ÷ 5</span>."},
                    {"orden": 2, "texto": "Obtenemos la cantidad exacta: <span class=\"keyword-highlight\">30 lápices por estuche</span>."}
                ]
            },
            {
                "enunciado": "Una biblioteca tiene <span class=\"keyword-highlight\">240 libros</span> para acomodar en <span class=\"keyword-highlight\">8 estantes</span>. ¿Cuántos libros van en cada estante?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos el total de libros entre los estantes: <span class=\"keyword-highlight\">240 ÷ 8</span>."},
                    {"orden": 2, "texto": "Calculamos: <span class=\"keyword-highlight\">30 libros por estante</span>."}
                ]
            },
            {
                "enunciado": "Un agricultor recolectó <span class=\"keyword-highlight\">400 papas</span> y las colocó en <span class=\"keyword-highlight\">10 sacos</span> en partes iguales. ¿Cuántas papas van en cada saco?",
                "pasos": [
                    {"orden": 1, "texto": "Planteamos la división: <span class=\"keyword-highlight\">400 papas ÷ 10 sacos</span>."},
                    {"orden": 2, "texto": "El resultado exacto es: <span class=\"keyword-highlight\">40 papas por saco</span>."}
                ]
            },
            {
                "enunciado": "Queremos distribuir <span class=\"keyword-highlight\">180 chocolates</span> en <span class=\"keyword-highlight\">9 bolsas</span> en partes iguales. ¿Cuántos chocolates van por bolsa?",
                "pasos": [
                    {"orden": 1, "texto": "Planteamos la división: <span class=\"keyword-highlight\">180 ÷ 9</span>."},
                    {"orden": 2, "texto": "El resultado exacto es: <span class=\"keyword-highlight\">20 chocolates por bolsa</span>."}
                ]
            }
        ],
        # Nivel 2: Análisis de Resto
        (4, 2): [
            {
                "enunciado": "Tenemos <span class=\"keyword-highlight\">17 manzanas</span> y las guardamos en cajas de <span class=\"keyword-highlight\">5 unidades</span>. ¿Cuántas manzanas sobran?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 17 entre 5: 17 ÷ 5 = <span class=\"keyword-highlight\">3 cajas completas</span> (3 × 5 = 15)."},
                    {"orden": 2, "texto": "Calculamos el residuo o resto: <span class=\"keyword-highlight\">17 - 15 = 2 manzanas</span>."},
                    {"orden": 3, "texto": "Por lo tanto, sobran: <span class=\"keyword-highlight\">2 manzanas</span>."}
                ]
            },
            {
                "enunciado": "Tenemos <span class=\"keyword-highlight\">26 chocolates</span> para armar bolsitas de <span class=\"keyword-highlight\">4 chocolates</span> cada una. ¿Cuántos chocolates sobran?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 26 entre 4: 26 ÷ 4 = <span class=\"keyword-highlight\">6 bolsitas completas</span> (6 × 4 = 24)."},
                    {"orden": 2, "texto": "Restamos los chocolates empacados al total: <span class=\"keyword-highlight\">26 - 24 = 2</span>."},
                    {"orden": 3, "texto": "El sobrante es: <span class=\"keyword-highlight\">2 chocolates</span>."}
                ]
            },
            {
                "enunciado": "Un profesor tiene <span class=\"keyword-highlight\">33 alumnos</span> y los agrupa en equipos de <span class=\"keyword-highlight\">5</span>. ¿Cuántos alumnos quedan sin equipo?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 33 entre 5: 33 ÷ 5 = <span class=\"keyword-highlight\">6 equipos completos</span> (6 × 5 = 30)."},
                    {"orden": 2, "texto": "Calculamos la diferencia: <span class=\"keyword-highlight\">33 - 30 = 3 alumnos</span>."},
                    {"orden": 3, "texto": "Quedan sin equipo: <span class=\"keyword-highlight\">3 alumnos</span>."}
                ]
            },
            {
                "enunciado": "Queremos colocar <span class=\"keyword-highlight\">53 juguetes</span> en cajas de <span class=\"keyword-highlight\">10 unidades</span>. ¿Cuántos juguetes quedan en la última caja incompleta?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 53 entre 10: <span class=\"keyword-highlight\">5 cajas llenas</span> (5 × 10 = 50)."},
                    {"orden": 2, "texto": "El residuo de juguetes es: <span class=\"keyword-highlight\">53 - 50 = 3</span>."},
                    {"orden": 3, "texto": "En la última caja incompleta quedan: <span class=\"keyword-highlight\">3 juguetes</span>."}
                ]
            },
            {
                "enunciado": "Tenemos <span class=\"keyword-highlight\">41 caramelos</span> para repartir en bolsas de <span class=\"keyword-highlight\">6 unidades</span>. ¿Cuántos caramelos nos sobran?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 41 entre 6: <span class=\"keyword-highlight\">6 bolsas llenas</span> (6 × 6 = 36)."},
                    {"orden": 2, "texto": "El residuo es: <span class=\"keyword-highlight\">41 - 36 = 5</span>."},
                    {"orden": 3, "texto": "Nos sobran: <span class=\"keyword-highlight\">5 caramelos</span>."}
                ]
            }
        ],
        # Nivel 3: Sucesión Circular
        (4, 3): [
            {
                "enunciado": "Una tira de luces parpadea en orden: <span class=\"keyword-highlight\">Rojo (1)</span>, <span class=\"keyword-highlight\">Verde (2)</span>, <span class=\"keyword-highlight\">Azul (3)</span>, y repite. ¿De qué color es el parpadeo <span class=\"keyword-highlight\">número 14</span>?",
                "pasos": [
                    {"orden": 1, "texto": "El ciclo tiene longitud <span class=\"keyword-highlight\">3</span> (Rojo, Verde, Azul)."},
                    {"orden": 2, "texto": "Dividimos el número entre la longitud: 14 ÷ 3 = <span class=\"keyword-highlight\">4 ciclos completos y residuo 2</span>."},
                    {"orden": 3, "texto": "El residuo 2 corresponde al segundo color del ciclo: <span class=\"keyword-highlight\">Verde</span>."}
                ]
            },
            {
                "enunciado": "Un semáforo cambia de color en orden: <span class=\"keyword-highlight\">Rojo (1)</span>, <span class=\"keyword-highlight\">Amarillo (2)</span>, <span class=\"keyword-highlight\">Verde (3)</span>, y repite. ¿Qué color saldrá en el parpadeo <span class=\"keyword-highlight\">número 20</span>?",
                "pasos": [
                    {"orden": 1, "texto": "La longitud del ciclo es <span class=\"keyword-highlight\">3</span>."},
                    {"orden": 2, "texto": "Dividimos la posición entre 3: 20 ÷ 3 = <span class=\"keyword-highlight\">6 ciclos completos y residuo 2</span>."},
                    {"orden": 3, "texto": "El residuo 2 indica el segundo color: <span class=\"keyword-highlight\">Amarillo (2)</span>."}
                ]
            },
            {
                "enunciado": "Una rueda de la fortuna tiene <span class=\"keyword-highlight\">4 canastillas</span> numeradas en orden: 1, 2, 3, 4, y gira continuamente. Si avanza <span class=\"keyword-highlight\">45 posiciones</span>, ¿qué número de canastilla queda abajo?",
                "pasos": [
                    {"orden": 1, "texto": "La longitud del ciclo es <span class=\"keyword-highlight\">4</span>."},
                    {"orden": 2, "texto": "Dividimos la posición: 45 ÷ 4 = <span class=\"keyword-highlight\">11 giros completos y residuo 1</span>."},
                    {"orden": 3, "texto": "El residuo 1 indica la canastilla: <span class=\"keyword-highlight\">1</span>."}
                ]
            },
            {
                "enunciado": "Un juego de cartas reparte a 3 jugadores: <span class=\"keyword-highlight\">Lucas (1)</span>, <span class=\"keyword-highlight\">Ana (2)</span>, <span class=\"keyword-highlight\">Juan (3)</span> en orden cíclico. ¿A quién le cae la carta <span class=\"keyword-highlight\">número 18</span>?",
                "pasos": [
                    {"orden": 1, "texto": "La longitud del ciclo es <span class=\"keyword-highlight\">3</span>."},
                    {"orden": 2, "texto": "Dividimos la carta entre 3: 18 ÷ 3 = <span class=\"keyword-highlight\">6 rondas completas y residuo 0</span>."},
                    {"orden": 3, "texto": "El residuo 0 (perfecto) corresponde al último jugador: <span class=\"keyword-highlight\">Juan (3)</span>."}
                ]
            },
            {
                "enunciado": "Un carrusel tiene 5 animales en ciclo: León (1), Tigre (2), Oso (3), Jirafa (4), Cebra (5). ¿Qué animal queda abajo en el giro <span class=\"keyword-highlight\">número 32</span>?",
                "pasos": [
                    {"orden": 1, "texto": "La longitud del ciclo es <span class=\"keyword-highlight\">5</span>."},
                    {"orden": 2, "texto": "Dividimos: 32 ÷ 5 = <span class=\"keyword-highlight\">6 ciclos completos y residuo 2</span>."},
                    {"orden": 3, "texto": "El residuo 2 corresponde al segundo animal: <span class=\"keyword-highlight\">Tigre (2)</span>."}
                ]
            }
        ],

        # --- MÓDULO 5: CICLOS Y AGRUPACIONES MÁXIMAS ---
        # Nivel 1: Visualización de Saltos y Empaques
        (5, 1): [
            {
                "enunciado": "Una rana da saltos de <span class=\"keyword-highlight\">3 metros</span> cada uno en la recta numérica. ¿Cuántos saltos debe dar para llegar a los <span class=\"keyword-highlight\">18 metros</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Distancia a recorrer: <span class=\"keyword-highlight\">18 metros</span>. Tamaño del salto: <span class=\"keyword-highlight\">3 metros</span>."},
                    {"orden": 2, "texto": "Dividimos la distancia total entre la medida de cada salto: <span class=\"keyword-highlight\">18 ÷ 3 = 6 saltos</span>."},
                    {"orden": 3, "texto": "La rana debe dar exactamente: <span class=\"keyword-highlight\">6 saltos</span>."}
                ]
            },
            {
                "enunciado": "Un saltamontes da saltos de <span class=\"keyword-highlight\">5 metros</span>. ¿Cuántos saltos necesita para recorrer <span class=\"keyword-highlight\">35 metros</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Distancia total: 35 metros. Tamaño del salto: 5 metros."},
                    {"orden": 2, "texto": "Dividimos: <span class=\"keyword-highlight\">35 ÷ 5 = 7 saltos</span>."},
                    {"orden": 3, "texto": "Necesita dar exactamente: <span class=\"keyword-highlight\">7 saltos</span>."}
                ]
            },
            {
                "enunciado": "Queremos llenar cajas de <span class=\"keyword-highlight\">6 bombones</span>. Si tenemos <span class=\"keyword-highlight\">48 bombones</span> en total, ¿cuántas cajas podemos completar?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos los bombones totales entre la capacidad de la caja: <span class=\"keyword-highlight\">48 ÷ 6</span>."},
                    {"orden": 2, "texto": "El resultado de la división es: <span class=\"keyword-highlight\">8 cajas llenas</span>."}
                ]
            },
            {
                "enunciado": "Un robot avanza dando pasos de <span class=\"keyword-highlight\">4 centímetros</span>. ¿Cuántos pasos debe dar para recorrer <span class=\"keyword-highlight\">40 centímetros</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos la longitud total entre el tamaño del paso: <span class=\"keyword-highlight\">40 ÷ 4</span>."},
                    {"orden": 2, "texto": "El robot debe dar exactamente: <span class=\"keyword-highlight\">10 pasos</span>."}
                ]
            },
            {
                "enunciado": "Un canguro da saltos de <span class=\"keyword-highlight\">8 metros</span>. ¿Cuántos saltos necesita para avanzar <span class=\"keyword-highlight\">72 metros</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos la distancia entre la medida del salto: <span class=\"keyword-highlight\">72 ÷ 8</span>."},
                    {"orden": 2, "texto": "El canguro necesita dar exactamente: <span class=\"keyword-highlight\">9 saltos</span>."}
                ]
            }
        ],
        # Nivel 2: Encuentros Periódicos - MCM
        (5, 2): [
            {
                "enunciado": "Un autobús sale cada <span class=\"keyword-highlight\">4 minutos</span> y otro cada <span class=\"keyword-highlight\">6 minutos</span>. Si salen juntos a las 12:00, ¿en cuántos minutos volverán a coincidir?",
                "pasos": [
                    {"orden": 1, "texto": "Listamos múltiplos de 4: 4, 8, <span class=\"keyword-highlight\">12</span>, 16, 20..."},
                    {"orden": 2, "texto": "Listamos múltiplos de 6: 6, <span class=\"keyword-highlight\">12</span>, 18, 24..."},
                    {"orden": 3, "texto": "El menor múltiplo común (MCM) que comparten es 12. Coincidirán en <span class=\"keyword-highlight\">12 minutos</span>."}
                ]
            },
            {
                "enunciado": "Un faro parpadea cada <span class=\"keyword-highlight\">3 segundos</span> y otro cada <span class=\"keyword-highlight\">5 segundos</span>. Si parpadean juntos ahora, ¿en cuántos segundos volverán a parpadear juntos?",
                "pasos": [
                    {"orden": 1, "texto": "Listamos múltiplos de 3: 3, 6, 9, 12, <span class=\"keyword-highlight\">15</span>, 18..."},
                    {"orden": 2, "texto": "Listamos múltiplos de 5: 5, 10, <span class=\"keyword-highlight\">15</span>, 20..."},
                    {"orden": 3, "texto": "El Mínimo Común Múltiplo (MCM) es 15. Parpadearán juntos en <span class=\"keyword-highlight\">15 segundos</span>."}
                ]
            },
            {
                "enunciado": "Dos campanas suenan en una iglesia: una cada <span class=\"keyword-highlight\">6 minutos</span> y otra cada <span class=\"keyword-highlight\">8 minutos</span>. Si suenan juntas ahora, ¿en cuántos minutos volverán a sonar juntas?",
                "pasos": [
                    {"orden": 1, "texto": "Listamos múltiplos de 6: 6, 12, 18, <span class=\"keyword-highlight\">24</span>, 30..."},
                    {"orden": 2, "texto": "Listamos múltiplos de 8: 8, 16, <span class=\"keyword-highlight\">24</span>, 32..."},
                    {"orden": 3, "texto": "El MCM es 24. Volverán a sonar juntas en <span class=\"keyword-highlight\">24 minutos</span>."}
                ]
            },
            {
                "enunciado": "Un semáforo se pone en verde cada <span class=\"keyword-highlight\">4 segundos</span> y otro cada <span class=\"keyword-highlight\">8 segundos</span>. ¿En cuántos segundos coinciden si arrancan juntos?",
                "pasos": [
                    {"orden": 1, "texto": "Como 8 es múltiplo directo de 4, el menor múltiplo común es simplemente 8."},
                    {"orden": 2, "texto": "Coincidirán exactamente en: <span class=\"keyword-highlight\">8 segundos</span>."}
                ]
            },
            {
                "enunciado": "Dos alarmas suenan: una cada <span class=\"keyword-highlight\">5 segundos</span> y otra cada <span class=\"keyword-highlight\">10 segundos</span>. ¿En cuántos segundos volverán a coincidir si suenan juntas?",
                "pasos": [
                    {"orden": 1, "texto": "Como 10 es divisible por 5, el Mínimo Común Múltiplo es 10."},
                    {"orden": 2, "texto": "Coincidirán exactamente en: <span class=\"keyword-highlight\">10 segundos</span>."}
                ]
            }
        ],
        # Nivel 3: División Máxima Exacta - MCD
        (5, 3): [
            {
                "enunciado": "Tenemos dos cuerdas de <span class=\"keyword-highlight\">12 metros</span> y <span class=\"keyword-highlight\">18 metros</span>. Queremos cortarlas en trozos de igual longitud lo más largos posible sin que sobre nada. ¿De cuántos metros debe ser cada trozo?",
                "pasos": [
                    {"orden": 1, "texto": "Divisores de 12: 1, 2, 3, 4, <span class=\"keyword-highlight\">6</span>, 12."},
                    {"orden": 2, "texto": "Divisores de 18: 1, 2, 3, <span class=\"keyword-highlight\">6</span>, 9, 18."},
                    {"orden": 3, "texto": "El Máximo Común Divisor (MCD) es 6. Cada trozo debe medir <span class=\"keyword-highlight\">6 metros</span>."}
                ]
            },
            {
                "enunciado": "Tenemos <span class=\"keyword-highlight\">16 manzanas</span> y <span class=\"keyword-highlight\">24 peras</span>. Queremos armar bolsas iguales con la máxima cantidad de frutas sin que sobre nada. ¿Cuántas piezas de fruta debe tener cada bolsa?",
                "pasos": [
                    {"orden": 1, "texto": "Listamos divisores de 16: 1, 2, 4, <span class=\"keyword-highlight\">8</span>, 16."},
                    {"orden": 2, "texto": "Listamos divisores de 24: 1, 2, 3, 4, 6, <span class=\"keyword-highlight\">8</span>, 12, 24."},
                    {"orden": 3, "texto": "El MCD es 8. Cada bolsa debe contener exactamente: <span class=\"keyword-highlight\">8 frutas</span>."}
                ]
            },
            {
                "enunciado": "Dos tablas de madera miden <span class=\"keyword-highlight\">20 cm</span> y <span class=\"keyword-highlight\">30 cm</span>. Queremos cortarlas en listones de igual medida lo más largos posible. ¿Cuánto medirá cada listón?",
                "pasos": [
                    {"orden": 1, "texto": "Divisores comunes de 20 y 30: 1, 2, 5, <span class=\"keyword-highlight\">10</span>."},
                    {"orden": 2, "texto": "El mayor divisor común (MCD) es 10."},
                    {"orden": 3, "texto": "Cada listón medirá: <span class=\"keyword-highlight\">10 centímetros</span>."}
                ]
            },
            {
                "enunciado": "Tenemos dos cintas de <span class=\"keyword-highlight\">8 metros</span> y <span class=\"keyword-highlight\">12 metros</span> de largo. Deseamos cortarlas en tiras iguales lo más largas posibles. ¿De cuántos metros será cada tira?",
                "pasos": [
                    {"orden": 1, "texto": "Divisores de 8: 1, 2, <span class=\"keyword-highlight\">4</span>, 8."},
                    {"orden": 2, "texto": "Divisores de 12: 1, 2, 3, <span class=\"keyword-highlight\">4</span>, 6, 12."},
                    {"orden": 3, "texto": "El MCD es 4. Cada tira medirá: <span class=\"keyword-highlight\">4 metros</span>."}
                ]
            },
            {
                "enunciado": "Dos listones miden <span class=\"keyword-highlight\">15 metros</span> y <span class=\"keyword-highlight\">25 metros</span>. Queremos dividirlos en segmentos iguales máximos sin desperdiciar. ¿Cuánto medirá cada segmento?",
                "pasos": [
                    {"orden": 1, "texto": "Divisores de 15: 1, 3, <span class=\"keyword-highlight\">5</span>, 15."},
                    {"orden": 2, "texto": "Divisores de 25: 1, <span class=\"keyword-highlight\">5</span>, 25."},
                    {"orden": 3, "texto": "El MCD es 5. Cada segmento medirá: <span class=\"keyword-highlight\">5 metros</span>."}
                ]
            }
        ]
    }

    # Retornar los ejemplos del nivel o una lista vacía si no está definido
    return ejemplos_db.get((modulo_id, nivel_id), [])
