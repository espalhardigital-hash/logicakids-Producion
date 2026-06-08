# theory_examples.py
# ─────────────────────────────────────────────────────────────
# Base de ejemplos extendidos y formateados premium para Fase 2.
# Garantiza exactamente 5 ejemplos guiados por nivel.

def obtener_ejemplos_expandidos_fase2(modulo_id: int, nivel_id: int) -> list:
    ejemplos_db = {
        # --- MÓDULO 1: GIMNASIO MENTAL ---
        # Nivel 1: Conceptos de doble, triple, mitad y cuádruple
        (1, 1): [
            {
                "enunciado": "Hallar el <span class=\"keyword-highlight\">triple</span> de <span class=\"keyword-highlight\">6</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Traducimos '<span class=\"keyword-highlight\">el triple</span>' como multiplicar por 3 (× 3)."},
                    {"orden": 2, "texto": "Realizamos la operación: <span class=\"keyword-highlight\">6 × 3 = 18</span>."}
                ]
            },
            {
                "enunciado": "Hallar la <span class=\"keyword-highlight\">mitad</span> de <span class=\"keyword-highlight\">10</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Traducimos '<span class=\"keyword-highlight\">la mitad</span>' como dividir entre 2 (÷ 2)."},
                    {"orden": 2, "texto": "Realizamos la operación: <span class=\"keyword-highlight\">10 ÷ 2 = 5</span>."}
                ]
            },
            {
                "enunciado": "Hallar el <span class=\"keyword-highlight\">doble</span> de <span class=\"keyword-highlight\">8</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Traducimos '<span class=\"keyword-highlight\">el doble</span>' como multiplicar por 2 (× 2)."},
                    {"orden": 2, "texto": "Realizamos la operación: <span class=\"keyword-highlight\">8 × 2 = 16</span>."}
                ]
            },
            {
                "enunciado": "Hallar el <span class=\"keyword-highlight\">cuádruple</span> de <span class=\"keyword-highlight\">5</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Traducimos '<span class=\"keyword-highlight\">el cuádruple</span>' como multiplicar por 4 (× 4)."},
                    {"orden": 2, "texto": "Realizamos la operación: <span class=\"keyword-highlight\">5 × 4 = 20</span>."}
                ]
            },
            {
                "enunciado": "Hallar la <span class=\"keyword-highlight\">mitad</span> de <span class=\"keyword-highlight\">24</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Traducimos '<span class=\"keyword-highlight\">la mitad</span>' como dividir entre 2 (÷ 2)."},
                    {"orden": 2, "texto": "Realizamos la operación: <span class=\"keyword-highlight\">24 ÷ 2 = 12</span>."}
                ]
            }
        ],
        # Nivel 2: Prioridad algebraica
        (1, 2): [
            {
                "enunciado": "Resolver respetando la prioridad: <span class=\"keyword-highlight\">8 + 4 ÷ 2</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos que la <span class=\"keyword-highlight\">división (÷)</span> tiene mayor prioridad que la suma (+)."},
                    {"orden": 2, "texto": "Resolvemos primero la división: <span class=\"keyword-highlight\">4 ÷ 2 = 2</span>."},
                    {"orden": 3, "texto": "Sumamos el resultado: <span class=\"keyword-highlight\">8 + 2 = 10</span>."}
                ]
            },
            {
                "enunciado": "Resolver usando el poder de los paréntesis: <span class=\"keyword-highlight\">(4 + 6) × 3</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos que el <span class=\"keyword-highlight\">paréntesis ( )</span> tiene poder absoluto."},
                    {"orden": 2, "texto": "Resolvemos primero la suma de adentro: <span class=\"keyword-highlight\">4 + 6 = 10</span>."},
                    {"orden": 3, "texto": "Multiplicamos el resultado: <span class=\"keyword-highlight\">10 × 3 = 30</span>."}
                ]
            },
            {
                "enunciado": "Resolver respetando la prioridad: <span class=\"keyword-highlight\">15 - 3 × 4</span>.",
                "pasos": [
                    {"orden": 1, "texto": "La <span class=\"keyword-highlight\">multiplicación (×)</span> va antes que la resta (-)."},
                    {"orden": 2, "texto": "Resolvemos primero la multiplicación: <span class=\"keyword-highlight\">3 × 4 = 12</span>."},
                    {"orden": 3, "texto": "Ejecutamos la resta: <span class=\"keyword-highlight\">15 - 12 = 3</span>."}
                ]
            },
            {
                "enunciado": "Resolver usando paréntesis: <span class=\"keyword-highlight\">(12 - 4) ÷ 2</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Resolvemos primero el contenido del <span class=\"keyword-highlight\">paréntesis ( )</span>: 12 - 4."},
                    {"orden": 2, "texto": "Operamos la resta: <span class=\"keyword-highlight\">12 - 4 = 8</span>."},
                    {"orden": 3, "texto": "Dividimos el resultado entre 2: <span class=\"keyword-highlight\">8 ÷ 2 = 4</span>."}
                ]
            },
            {
                "enunciado": "Resolver respetando la prioridad: <span class=\"keyword-highlight\">5 × 4 + 3</span>.",
                "pasos": [
                    {"orden": 1, "texto": "La <span class=\"keyword-highlight\">multiplicación (×)</span> se resuelve antes que la suma (+)."},
                    {"orden": 2, "texto": "Resolvemos la multiplicación: <span class=\"keyword-highlight\">5 × 4 = 20</span>."},
                    {"orden": 3, "texto": "Sumamos el valor restante: <span class=\"keyword-highlight\">20 + 3 = 23</span>."}
                ]
            }
        ],
        # Nivel 3: Traducción de lenguaje verbal
        (1, 3): [
            {
                "enunciado": "Traducir y resolver: \"El <span class=\"keyword-highlight\">doble</span> de la <span class=\"keyword-highlight\">suma de 3 y 5</span>\".",
                "pasos": [
                    {"orden": 1, "texto": "La suma de 3 y 5 se escribe protegiéndola con paréntesis: <span class=\"keyword-highlight\">(3 + 5)</span>."},
                    {"orden": 2, "texto": "El doble significa multiplicar por 2: <span class=\"keyword-highlight\">2 × (3 + 5)</span>."},
                    {"orden": 3, "texto": "Resolvemos el paréntesis: <span class=\"keyword-highlight\">3 + 5 = 8</span>."},
                    {"orden": 4, "texto": "Multiplicamos el resultado: <span class=\"keyword-highlight\">2 × 8 = 16</span>."}
                ]
            },
            {
                "enunciado": "Traducir y resolver: \"El <span class=\"keyword-highlight\">triple</span> de la <span class=\"keyword-highlight\">diferencia entre 10 y 4</span>\".",
                "pasos": [
                    {"orden": 1, "texto": "La diferencia (resta) entre 10 y 4 se protege así: <span class=\"keyword-highlight\">(10 - 4)</span>."},
                    {"orden": 2, "texto": "El triple significa multiplicar por 3: <span class=\"keyword-highlight\">3 × (10 - 4)</span>."},
                    {"orden": 3, "texto": "Resolvemos el paréntesis: <span class=\"keyword-highlight\">10 - 4 = 6</span>."},
                    {"orden": 4, "texto": "Multiplicamos: <span class=\"keyword-highlight\">3 × 6 = 18</span>."}
                ]
            },
            {
                "enunciado": "Traducir y resolver: \"A la <span class=\"keyword-highlight\">mitad de 20</span> sumarle <span class=\"keyword-highlight\">7</span>\".",
                "pasos": [
                    {"orden": 1, "texto": "La mitad de 20 se escribe como una división: <span class=\"keyword-highlight\">(20 ÷ 2)</span>."},
                    {"orden": 2, "texto": "Agregamos la suma de 7: <span class=\"keyword-highlight\">(20 ÷ 2) + 7</span>."},
                    {"orden": 3, "texto": "Calculamos la mitad primero: <span class=\"keyword-highlight\">20 ÷ 2 = 10</span>."},
                    {"orden": 4, "texto": "Sumamos el valor restante: <span class=\"keyword-highlight\">10 + 7 = 17</span>."}
                ]
            },
            {
                "enunciado": "Traducir y resolver: \"El <span class=\"keyword-highlight\">cuádruple</span> de la <span class=\"keyword-highlight\">suma de 2 y 3</span>\".",
                "pasos": [
                    {"orden": 1, "texto": "Escribimos la suma de 2 y 3 entre paréntesis: <span class=\"keyword-highlight\">(2 + 3)</span>."},
                    {"orden": 2, "texto": "El cuádruple significa multiplicar por 4: <span class=\"keyword-highlight\">4 × (2 + 3)</span>."},
                    {"orden": 3, "texto": "Resolvemos la suma: <span class=\"keyword-highlight\">2 + 3 = 5</span>."},
                    {"orden": 4, "texto": "Multiplicamos: <span class=\"keyword-highlight\">4 × 5 = 20</span>."}
                ]
            },
            {
                "enunciado": "Traducir y resolver: \"A <span class=\"keyword-highlight\">50</span> le resto el <span class=\"keyword-highlight\">doble de 15</span>\".",
                "pasos": [
                    {"orden": 1, "texto": "El doble de 15 se escribe: <span class=\"keyword-highlight\">2 × 15</span>."},
                    {"orden": 2, "texto": "Escribimos la resta partiendo de 50: <span class=\"keyword-highlight\">50 - 2 × 15</span>."},
                    {"orden": 3, "texto": "Por jerarquía, calculamos el doble primero: <span class=\"keyword-highlight\">2 × 15 = 30</span>."},
                    {"orden": 4, "texto": "Restamos de 50: <span class=\"keyword-highlight\">50 - 30 = 20</span>."}
                ]
            }
        ],

        # --- MÓDULO 2: TABLAS EN ACCIÓN ---
        # Nivel 1: Suma y Resta
        (2, 1): [
            {
                "enunciado": "Si <span class=\"keyword-highlight\">X + 6 = 14</span>, hallar X.",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos que el 6 está <span class=\"keyword-highlight\">sumando</span> a la X."},
                    {"orden": 2, "texto": "Usamos el regreso inverso: pasamos el 6 <span class=\"keyword-highlight\">restando</span> al otro lado: X = 14 - 6."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">X = 8</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">Y - 5 = 12</span>, hallar Y.",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos que el 5 está <span class=\"keyword-highlight\">restando</span> a la Y."},
                    {"orden": 2, "texto": "Usamos el regreso inverso: pasamos el 5 <span class=\"keyword-highlight\">sumando</span> al otro lado: Y = 12 + 5."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">Y = 17</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">Z + 9 = 20</span>, hallar Z.",
                "pasos": [
                    {"orden": 1, "texto": "El 9 está sumando. Su operación inversa es la resta."},
                    {"orden": 2, "texto": "Despejamos Z restando 9 al otro lado: Z = 20 - 9."},
                    {"orden": 3, "texto": "Calculamos: <span class=\"keyword-highlight\">Z = 11</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">A - 8 = 15</span>, hallar A.",
                "pasos": [
                    {"orden": 1, "texto": "El 8 está restando. Su operación inversa es la suma."},
                    {"orden": 2, "texto": "Despejamos A sumando 8 al otro lado: A = 15 + 8."},
                    {"orden": 3, "texto": "Calculamos: <span class=\"keyword-highlight\">A = 23</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">B + 15 = 40</span>, hallar B.",
                "pasos": [
                    {"orden": 1, "texto": "El 15 está sumando a la incógnita B."},
                    {"orden": 2, "texto": "Cruzamos la balanza restando 15 al otro lado: B = 40 - 15."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">B = 25</span>."}
                ]
            }
        ],
        # Nivel 2: Multiplicación y División
        (2, 2): [
            {
                "enunciado": "Si <span class=\"keyword-highlight\">4 × Y = 32</span>, hallar Y.",
                "pasos": [
                    {"orden": 1, "texto": "El 4 está <span class=\"keyword-highlight\">multiplicando</span> a la Y."},
                    {"orden": 2, "texto": "Usamos la operación inversa: pasamos el 4 <span class=\"keyword-highlight\">dividiendo</span> al otro lado: Y = 32 ÷ 4."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">Y = 8</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">Z ÷ 3 = 6</span>, hallar Z.",
                "pasos": [
                    {"orden": 1, "texto": "El 3 está <span class=\"keyword-highlight\">dividiendo</span> a la Z."},
                    {"orden": 2, "texto": "Usamos la operación inversa: pasamos el 3 <span class=\"keyword-highlight\">multiplicando</span> al otro lado: Z = 6 × 3."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">Z = 18</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">5 × X = 45</span>, hallar X.",
                "pasos": [
                    {"orden": 1, "texto": "El 5 multiplica a la incógnita X."},
                    {"orden": 2, "texto": "Pasa al otro lado dividiendo por ser su inversa: X = 45 ÷ 5."},
                    {"orden": 3, "texto": "Calculamos: <span class=\"keyword-highlight\">X = 9</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">A ÷ 2 = 14</span>, hallar A.",
                "pasos": [
                    {"orden": 1, "texto": "El 2 está dividiendo a la A."},
                    {"orden": 2, "texto": "Pasa al otro lado multiplicando por ser su inversa: A = 14 × 2."},
                    {"orden": 3, "texto": "Calculamos: <span class=\"keyword-highlight\">A = 28</span>."}
                ]
            },
            {
                "enunciado": "Si <span class=\"keyword-highlight\">8 × B = 56</span>, hallar B.",
                "pasos": [
                    {"orden": 1, "texto": "El 8 está multiplicando a la variable B."},
                    {"orden": 2, "texto": "Pasamos el 8 dividiendo al otro lado de la balanza: B = 56 ÷ 8."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">B = 7</span>."}
                ]
            }
        ],
        # Nivel 3: El Número Faltante
        (2, 3): [
            {
                "enunciado": "Hallar el espacio vacío: <span class=\"keyword-highlight\">12 - [ ] = 8</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Razonamos de forma intuitiva: ¿Qué le resto a 12 para obtener 8?"},
                    {"orden": 2, "texto": "Restamos el resultado final de la cantidad total: <span class=\"keyword-highlight\">12 - 8</span>."},
                    {"orden": 3, "texto": "El valor faltante es: <span class=\"keyword-highlight\">4</span>. Verificación: 12 - 4 = 8."}
                ]
            },
            {
                "enunciado": "Completa el espacio faltante: <span class=\"keyword-highlight\">15 + [ ] = 25</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Un número sumado a 15 da 25. Aplicamos la resta inversa."},
                    {"orden": 2, "texto": "Restamos la cantidad conocida del total: <span class=\"keyword-highlight\">25 - 15</span>."},
                    {"orden": 3, "texto": "El valor faltante es: <span class=\"keyword-highlight\">10</span>. Verificación: 15 + 10 = 25."}
                ]
            },
            {
                "enunciado": "Completa el espacio faltante: <span class=\"keyword-highlight\">[ ] - 6 = 14</span>.",
                "pasos": [
                    {"orden": 1, "texto": "A un número le quitamos 6 y nos dio 14. Queremos volver al inicio."},
                    {"orden": 2, "texto": "Aplicamos la suma inversa para recuperar el total: <span class=\"keyword-highlight\">14 + 6</span>."},
                    {"orden": 3, "texto": "El valor faltante es: <span class=\"keyword-highlight\">20</span>. Verificación: 20 - 6 = 14."}
                ]
            },
            {
                "enunciado": "Completa el espacio faltante: <span class=\"keyword-highlight\">[ ] ÷ 4 = 5</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Un número repartido en 4 partes da 5 en cada una."},
                    {"orden": 2, "texto": "Aplicamos la multiplicación inversa para saber el total: <span class=\"keyword-highlight\">5 × 4</span>."},
                    {"orden": 3, "texto": "El valor faltante es: <span class=\"keyword-highlight\">20</span>. Verificación: 20 ÷ 4 = 5."}
                ]
            },
            {
                "enunciado": "Completa el espacio faltante: <span class=\"keyword-highlight\">30 - [ ] = 18</span>.",
                "pasos": [
                    {"orden": 1, "texto": "A 30 le restamos una cantidad para quedar con 18."},
                    {"orden": 2, "texto": "Calculamos la diferencia restando el resultado final a 30: <span class=\"keyword-highlight\">30 - 18</span>."},
                    {"orden": 3, "texto": "El valor faltante es: <span class=\"keyword-highlight\">12</span>. Verificación: 30 - 12 = 18."}
                ]
            }
        ],
        # Nivel 4: Gran Integración
        (2, 4): [
            {
                "enunciado": "Resolver para X: <span class=\"keyword-highlight\">2 × X + 3 = 11</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Deshacemos primero la operación más externa (la suma). Pasamos el +3 <span class=\"keyword-highlight\">restando</span>: 2 × X = 11 - 3 → 2 × X = 8."},
                    {"orden": 2, "texto": "Deshacemos la multiplicación. Pasamos el 2 <span class=\"keyword-highlight\">dividiendo</span>: X = 8 ÷ 2."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">X = 4</span>."}
                ]
            },
            {
                "enunciado": "Resolver para Y: <span class=\"keyword-highlight\">3 × Y - 4 = 17</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Neutralizamos la resta (-4) pasándola como <span class=\"keyword-highlight\">suma (+4)</span>: 3 × Y = 17 + 4 → 3 × Y = 21."},
                    {"orden": 2, "texto": "Neutralizamos la multiplicación pasándola como <span class=\"keyword-highlight\">división (÷3)</span>: Y = 21 ÷ 3."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">Y = 7</span>."}
                ]
            },
            {
                "enunciado": "Resolver para Z: <span class=\"keyword-highlight\">Z ÷ 2 + 5 = 12</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Pasamos el +5 restando al otro lado del igual: Z ÷ 2 = 12 - 5 → Z ÷ 2 = 7."},
                    {"orden": 2, "texto": "Como el 2 está dividiendo, lo pasamos al otro lado <span class=\"keyword-highlight\">multiplicando (×2)</span>: Z = 7 × 2."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">Z = 14</span>."}
                ]
            },
            {
                "enunciado": "Resolver para A: <span class=\"keyword-highlight\">4 × A - 6 = 18</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Pasamos el -6 sumando al otro lado de la balanza: 4 × A = 18 + 6 → 4 × A = 24."},
                    {"orden": 2, "texto": "El 4 que multiplica pasa dividiendo al otro lado: A = 24 ÷ 4."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">A = 6</span>."}
                ]
            },
            {
                "enunciado": "Resolver para B: <span class=\"keyword-highlight\">B ÷ 3 - 2 = 8</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Deshacemos la resta de 2 pasándola sumando: B ÷ 3 = 8 + 2 → B ÷ 3 = 10."},
                    {"orden": 2, "texto": "El 3 que divide a la variable B pasa al otro lado multiplicando: B = 10 × 3."},
                    {"orden": 3, "texto": "Resolvemos: <span class=\"keyword-highlight\">B = 30</span>."}
                ]
            }
        ],

        # --- MÓDULO 3: TIENDA MATEMÁTICA ---
        # Nivel 1: Reconozco el Dinero
        (3, 1): [
            {
                "enunciado": "¿Cuánto dinero suman <span class=\"keyword-highlight\">3 monedas de 0,50</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Dos monedas de 0,50 forman <span class=\"keyword-highlight\">1 peso entero (1,00)</span>."},
                    {"orden": 2, "texto": "Agregamos la tercera moneda de 0,50."},
                    {"orden": 3, "texto": "Suman en total: <span class=\"keyword-highlight\">1,50 pesos</span>."}
                ]
            },
            {
                "enunciado": "¿Cuánto dinero suman <span class=\"keyword-highlight\">4 monedas de 0,25</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Dos monedas de 0,25 forman 50 centavos (0,50)."},
                    {"orden": 2, "texto": "Las otras dos monedas forman otros 50 centavos (0,50)."},
                    {"orden": 3, "texto": "Sumando 0,50 + 0,50 obtenemos <span class=\"keyword-highlight\">1 peso entero (1,00)</span>."}
                ]
            },
            {
                "enunciado": "¿Cuánto dinero suman <span class=\"keyword-highlight\">1 billete de 5,00</span> y <span class=\"keyword-highlight\">1 moneda de 0,50</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Tomamos la parte entera del billete: 5,00 pesos."},
                    {"orden": 2, "texto": "Agregamos los centavos de la moneda: 0,50 pesos."},
                    {"orden": 3, "texto": "Consolidamos los valores: <span class=\"keyword-highlight\">5,00 + 0,50 = 5,50 pesos</span>."}
                ]
            },
            {
                "enunciado": "¿Cuánto dinero suman <span class=\"keyword-highlight\">2 monedas de 0,50</span> y <span class=\"keyword-highlight\">1 de 0,25</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Dos monedas de 0,50 suman 1 peso entero (1,00)."},
                    {"orden": 2, "texto": "Le añadimos la moneda de 0,25 centavos."},
                    {"orden": 3, "texto": "Consolidamos: <span class=\"keyword-highlight\">1,00 + 0,25 = 1,25 pesos</span>."}
                ]
            },
            {
                "enunciado": "¿Cuánto dinero suman <span class=\"keyword-highlight\">3 monedas de 0,25</span>?",
                "pasos": [
                    {"orden": 1, "texto": "Dos monedas de 0,25 centavos forman 50 centavos (0,50)."},
                    {"orden": 2, "texto": "Agregamos la tercera moneda de 0,25 centavos."},
                    {"orden": 3, "texto": "Consolidamos: <span class=\"keyword-highlight\">0,50 + 0,25 = 0,75 centavos</span>."}
                ]
            }
        ],
        # Nivel 2: Pago y Cambio
        (3, 2): [
            {
                "enunciado": "Pagas con un <span class=\"keyword-highlight\">billete de 5,00</span> por un juguete de <span class=\"keyword-highlight\">3,50</span>. ¿Cuánto vuelto recibes?",
                "pasos": [
                    {"orden": 1, "texto": "Convertimos a centavos para operar limpio: 500 centavos y 350 centavos."},
                    {"orden": 2, "texto": "Restamos los centavos: <span class=\"keyword-highlight\">500 - 350 = 150 centavos</span>."},
                    {"orden": 3, "texto": "Convertimos de vuelta a pesos decimales: <span class=\"keyword-highlight\">1,50 pesos</span>."}
                ]
            },
            {
                "enunciado": "Pagas con un <span class=\"keyword-highlight\">billete de 2,00</span> por una paleta de <span class=\"keyword-highlight\">1,25</span>. ¿Cuánto vuelto recibes?",
                "pasos": [
                    {"orden": 1, "texto": "Convertimos a centavos: 200 centavos y 125 centavos."},
                    {"orden": 2, "texto": "Efectuamos la resta: <span class=\"keyword-highlight\">200 - 125 = 75 centavos</span>."},
                    {"orden": 3, "texto": "Escribimos en formato de pesos decimales: <span class=\"keyword-highlight\">0,75 pesos</span>."}
                ]
            },
            {
                "enunciado": "Pagas con un <span class=\"keyword-highlight\">billete de 10,00</span> por un libro de <span class=\"keyword-highlight\">7,50</span>. ¿Cuánto vuelto recibes?",
                "pasos": [
                    {"orden": 1, "texto": "Convertimos a centavos: 1000 centavos y 750 centavos."},
                    {"orden": 2, "texto": "Restamos los valores: <span class=\"keyword-highlight\">1000 - 750 = 250 centavos</span>."},
                    {"orden": 3, "texto": "Convertimos a formato de dinero: <span class=\"keyword-highlight\">2,50 pesos</span>."}
                ]
            },
            {
                "enunciado": "Pagas con una <span class=\"keyword-highlight\">moneda de 1,00</span> por un chicle de <span class=\"keyword-highlight\">0,25</span>. ¿Cuánto vuelto recibes?",
                "pasos": [
                    {"orden": 1, "texto": "1,00 peso equivale a 100 centavos."},
                    {"orden": 2, "texto": "Restamos el costo del chicle: <span class=\"keyword-highlight\">100 - 25 = 75 centavos</span>."},
                    {"orden": 3, "texto": "Convertimos de vuelta a decimal: <span class=\"keyword-highlight\">0,75 centavos</span>."}
                ]
            },
            {
                "enunciado": "Pagas con un <span class=\"keyword-highlight\">billete de 5,00</span> por un cuaderno de <span class=\"keyword-highlight\">2,75</span>. ¿Cuánto vuelto recibes?",
                "pasos": [
                    {"orden": 1, "texto": "Convertimos ambos valores a centavos: 500 y 275 centavos."},
                    {"orden": 2, "texto": "Hacemos la resta: <span class=\"keyword-highlight\">500 - 275 = 225 centavos</span>."},
                    {"orden": 3, "texto": "Expresamos en decimal de dinero: <span class=\"keyword-highlight\">2,25 pesos</span>."}
                ]
            }
        ],
        # Nivel 3: Carrito de Compras
        (3, 3): [
            {
                "enunciado": "Sumar en el carrito: un jugo de <span class=\"keyword-highlight\">2,75</span> y unas papas de <span class=\"keyword-highlight\">1,50</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los pesos enteros: <span class=\"keyword-highlight\">2 + 1 = 3 pesos</span>."},
                    {"orden": 2, "texto": "Sumamos los centavos: <span class=\"keyword-highlight\">75 + 50 = 125 centavos</span>."},
                    {"orden": 3, "texto": "Como 125 centavos supera 100, formamos 1 peso extra y sobran 25 centavos."},
                    {"orden": 4, "texto": "Consolidamos todo: 3 pesos + 1 peso (extra) = <span class=\"keyword-highlight\">4,25 pesos</span>."}
                ]
            },
            {
                "enunciado": "Sumar en el carrito: un helado de <span class=\"keyword-highlight\">1,50</span> y unas galletas de <span class=\"keyword-highlight\">1,25</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los pesos enteros: <span class=\"keyword-highlight\">1 + 1 = 2 pesos</span>."},
                    {"orden": 2, "texto": "Sumamos los centavos: <span class=\"keyword-highlight\">50 + 25 = 75 centavos</span>."},
                    {"orden": 3, "texto": "Consolidamos enteros y centavos directos: <span class=\"keyword-highlight\">2,75 pesos</span>."}
                ]
            },
            {
                "enunciado": "Sumar en el carrito: un refresco de <span class=\"keyword-highlight\">2,25</span> y un chocolate de <span class=\"keyword-highlight\">1,75</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los enteros: <span class=\"keyword-highlight\">2 + 1 = 3 pesos</span>."},
                    {"orden": 2, "texto": "Sumamos los centavos: <span class=\"keyword-highlight\">25 + 75 = 100 centavos</span>."},
                    {"orden": 3, "texto": "Como 100 centavos forman exactamente 1 peso extra, no nos quedan centavos."},
                    {"orden": 4, "texto": "Consolidamos la cuenta entera: 3 + 1 = <span class=\"keyword-highlight\">4,00 pesos</span>."}
                ]
            },
            {
                "enunciado": "Sumar en el carrito: un libro de <span class=\"keyword-highlight\">5,50</span> y un lápiz de <span class=\"keyword-highlight\">1,50</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los enteros: <span class=\"keyword-highlight\">5 + 1 = 6 pesos</span>."},
                    {"orden": 2, "texto": "Sumamos los centavos: <span class=\"keyword-highlight\">50 + 50 = 100 centavos</span> (1 peso entero extra)."},
                    {"orden": 3, "texto": "Consolidamos agregando el peso extra: 6 + 1 = <span class=\"keyword-highlight\">7,00 pesos</span>."}
                ]
            },
            {
                "enunciado": "Sumar en el carrito: un chicle de <span class=\"keyword-highlight\">0,50</span> y una paleta de <span class=\"keyword-highlight\">0,75</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los enteros: 0 pesos."},
                    {"orden": 2, "texto": "Sumamos los centavos: <span class=\"keyword-highlight\">50 + 75 = 125 centavos</span>."},
                    {"orden": 3, "texto": "Separamos 100 centavos en 1 peso entero y nos quedan 25 centavos."},
                    {"orden": 4, "texto": "Consolidamos: <span class=\"keyword-highlight\">1,25 pesos</span>."}
                ]
            }
        ],
        # Nivel 4: Comprador Inteligente
        (3, 4): [
            {
                "enunciado": "Tengo <span class=\"keyword-highlight\">4,00</span> y quiero comprar galletas de <span class=\"keyword-highlight\">4,50</span>. ¿Cuánto dinero me falta?",
                "pasos": [
                    {"orden": 1, "texto": "Comparamos: 4,00 es menor que 4,50. No nos alcanza."},
                    {"orden": 2, "texto": "Restamos el costo total menos nuestro dinero: <span class=\"keyword-highlight\">4,50 - 4,00</span>."},
                    {"orden": 3, "texto": "Nos faltan exactamente: <span class=\"keyword-highlight\">0,50 pesos</span>."}
                ]
            },
            {
                "enunciado": "Tengo <span class=\"keyword-highlight\">10,00</span> y quiero comprar un juguete de <span class=\"keyword-highlight\">8,50</span>. ¿Me alcanza? ¿Cuánto vuelto queda?",
                "pasos": [
                    {"orden": 1, "texto": "Comparamos: 10,00 es mayor que 8,50. ¡Sí nos alcanza!"},
                    {"orden": 2, "texto": "Restamos para conocer el vuelto: <span class=\"keyword-highlight\">10,00 - 8,50</span>."},
                    {"orden": 3, "texto": "El vuelto que recibiremos es: <span class=\"keyword-highlight\">1,50 pesos</span>."}
                ]
            },
            {
                "enunciado": "Tengo <span class=\"keyword-highlight\">5,00</span> y quiero comprar un libro de <span class=\"keyword-highlight\">5,75</span>. ¿Cuánto dinero me falta?",
                "pasos": [
                    {"orden": 1, "texto": "Comparamos: 5,00 es menor que 5,75. No nos alcanza."},
                    {"orden": 2, "texto": "Calculamos la diferencia: <span class=\"keyword-highlight\">5,75 - 5,00</span>."},
                    {"orden": 3, "texto": "Nos hacen falta: <span class=\"keyword-highlight\">0,75 centavos</span>."}
                ]
            },
            {
                "enunciado": "Tengo <span class=\"keyword-highlight\">3,00</span> y el chicle cuesta <span class=\"keyword-highlight\">2,25</span>. ¿Me alcanza? ¿Cuánto vuelto queda?",
                "pasos": [
                    {"orden": 1, "texto": "Comparamos: 3,00 es mayor que 2,25. Sí nos alcanza."},
                    {"orden": 2, "texto": "Restamos los valores: <span class=\"keyword-highlight\">3,00 - 2,25</span>."},
                    {"orden": 3, "texto": "El vuelto es: <span class=\"keyword-highlight\">0,75 centavos</span>."}
                ]
            },
            {
                "enunciado": "Tengo <span class=\"keyword-highlight\">2,50</span> y el helado cuesta <span class=\"keyword-highlight\">2,50</span>. ¿Me alcanza? ¿Cuánto vuelto queda?",
                "pasos": [
                    {"orden": 1, "texto": "Comparamos: Las cantidades son iguales. Sí nos alcanza de forma exacta."},
                    {"orden": 2, "texto": "Hacemos la resta: <span class=\"keyword-highlight\">2,50 - 2,50 = 0,00</span>."},
                    {"orden": 3, "texto": "El vuelto es: <span class=\"keyword-highlight\">0,00 pesos</span>."}
                ]
            }
        ],

        # --- MÓDULO 4: CONSTRUCTOR DE SOLUCIONES ---
        # Nivel 1: Problemas de Dos Pasos Guiados
        (4, 1): [
            {
                "enunciado": "Mateo compra <span class=\"keyword-highlight\">4 cajas de lápices</span>. Cada caja tiene <span class=\"keyword-highlight\">6 lápices</span>. Luego regala <span class=\"keyword-highlight\">5 lápices</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso A (Total Inicial): Calculamos cuántos compró: <span class=\"keyword-highlight\">4 × 6 = 24 lápices</span>."},
                    {"orden": 2, "texto": "Paso B (Resta de Pérdida): Restamos los regalados del total: <span class=\"keyword-highlight\">24 - 5 = 19 lápices</span>."}
                ]
            },
            {
                "enunciado": "Lucía tiene <span class=\"keyword-highlight\">3 bolsas de caramelos</span> con <span class=\"keyword-highlight\">8 caramelos</span> cada una. Su papá le regala <span class=\"keyword-highlight\">4 caramelos</span> más.",
                "pasos": [
                    {"orden": 1, "texto": "Paso A (Total Inicial): Calculamos cuántos tiene en bolsas: <span class=\"keyword-highlight\">3 × 8 = 24 caramelos</span>."},
                    {"orden": 2, "texto": "Paso B (Suma de Regalo): Añadimos los caramelos de regalo: <span class=\"keyword-highlight\">24 + 4 = 28 caramelos</span>."}
                ]
            },
            {
                "enunciado": "Lucas compra <span class=\"keyword-highlight\">5 paquetes de stickers</span> con <span class=\"keyword-highlight\">4 stickers</span> cada uno. En el camino pierde <span class=\"keyword-highlight\">6 stickers</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso A (Total Inicial): Hallamos la cantidad inicial comprada: <span class=\"keyword-highlight\">5 × 4 = 20 stickers</span>."},
                    {"orden": 2, "texto": "Paso B (Pérdida): Restamos las calcomanías perdidas: <span class=\"keyword-highlight\">20 - 6 = 14 stickers</span>."}
                ]
            },
            {
                "enunciado": "Sofía tiene <span class=\"keyword-highlight\">2 cajas de chocolates</span> con <span class=\"keyword-highlight\">10 chocolates</span> cada una. Se come <span class=\"keyword-highlight\">3 chocolates</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso A (Total Inicial): Hallamos el inventario total: <span class=\"keyword-highlight\">2 × 10 = 20 chocolates</span>."},
                    {"orden": 2, "texto": "Paso B (Resta de Consumo): Restamos los chocolates que se comió: <span class=\"keyword-highlight\">20 - 3 = 17 chocolates</span>."}
                ]
            },
            {
                "enunciado": "Enzo compra <span class=\"keyword-highlight\">6 paquetes de tazos</span> con <span class=\"keyword-highlight\">5 tazos</span> cada uno. Le regala <span class=\"keyword-highlight\">12 tazos</span> a su hermano.",
                "pasos": [
                    {"orden": 1, "texto": "Paso A (Total Inicial): Calculamos el total inicial de tazos: <span class=\"keyword-highlight\">6 × 5 = 30 tazos</span>."},
                    {"orden": 2, "texto": "Paso B (Pérdida): Restamos los tazos que regaló: <span class=\"keyword-highlight\">30 - 12 = 18 tazos</span>."}
                ]
            }
        ],
        # Nivel 2: Encadenamiento de Resultados
        (4, 2): [
            {
                "enunciado": "Luisa cosecha <span class=\"keyword-highlight\">15 naranjas por la mañana</span> y <span class=\"keyword-highlight\">5 por la tarde</span>. Luego, vende <span class=\"keyword-highlight\">la mitad</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Eslabón 1 (Suma): Total cosechado = <span class=\"keyword-highlight\">15 + 5 = 20 naranjas</span>."},
                    {"orden": 2, "texto": "Eslabón 2 (División): Vende la mitad = <span class=\"keyword-highlight\">20 ÷ 2 = 10 naranjas</span> restantes."}
                ]
            },
            {
                "enunciado": "Sofía recolectó <span class=\"keyword-highlight\">12 manzanas rojas</span> y <span class=\"keyword-highlight\">8 manzanas verdes</span>. Utiliza <span class=\"keyword-highlight\">la mitad</span> para un pastel.",
                "pasos": [
                    {"orden": 1, "texto": "Eslabón 1 (Suma): Cosecha total = <span class=\"keyword-highlight\">12 + 8 = 20 manzanas</span>."},
                    {"orden": 2, "texto": "Eslabón 2 (División): Mitad restante = <span class=\"keyword-highlight\">20 ÷ 2 = 10 manzanas</span> restantes."}
                ]
            },
            {
                "enunciado": "Enzo compró <span class=\"keyword-highlight\">4 paquetes con 5 calcomanías</span> cada uno. Las reparte entre sus <span class=\"keyword-highlight\">2 hermanos</span> por partes iguales.",
                "pasos": [
                    {"orden": 1, "texto": "Eslabón 1 (Multiplicación): Total de calcomanías = <span class=\"keyword-highlight\">4 × 5 = 20 calcomanías</span>."},
                    {"orden": 2, "texto": "Eslabón 2 (División): Reparto equitativo = <span class=\"keyword-highlight\">20 ÷ 2 = 10 calcomanías</span> a cada uno."}
                ]
            },
            {
                "enunciado": "Tomas tiene <span class=\"keyword-highlight\">18 tazos</span>, gana <span class=\"keyword-highlight\">6</span> en el recreo y luego le regala <span class=\"keyword-highlight\">la tercera parte</span> a su amigo.",
                "pasos": [
                    {"orden": 1, "texto": "Eslabón 1 (Suma): Total acumulado = <span class=\"keyword-highlight\">18 + 6 = 24 tazos</span>."},
                    {"orden": 2, "texto": "Eslabón 2 (División): Regala la tercera parte = <span class=\"keyword-highlight\">24 ÷ 3 = 8 tazos</span> regalados."}
                ]
            },
            {
                "enunciado": "Una caja contiene <span class=\"keyword-highlight\">25 canicas</span>. Añadimos <span class=\"keyword-highlight\">5</span> más y repartimos el total en <span class=\"keyword-highlight\">3 bolsas</span> iguales.",
                "pasos": [
                    {"orden": 1, "texto": "Eslabón 1 (Suma): Total de canicas = <span class=\"keyword-highlight\">25 + 5 = 30 canicas</span>."},
                    {"orden": 2, "texto": "Eslabón 2 (División): Reparto en bolsas = <span class=\"keyword-highlight\">30 ÷ 3 = 10 canicas</span> por bolsa."}
                ]
            }
        ],
        # Nivel 3: Minimización de Error de Arrastre
        (4, 3): [
            {
                "enunciado": "Tomás tiene <span class=\"keyword-highlight\">10 estampas</span> y <span class=\"keyword-highlight\">4 lápices de colores</span> (basura). Pierde <span class=\"keyword-highlight\">2 estampas</span>. Su hermano le <span class=\"keyword-highlight\">duplica</span> las estampas que le quedan.",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos datos basura: Ignoramos los <span class=\"keyword-highlight\">4 lápices</span>, la pregunta es sobre estampas."},
                    {"orden": 2, "texto": "Calculamos las estampas que quedan tras la pérdida: <span class=\"keyword-highlight\">10 - 2 = 8 estampas</span>."},
                    {"orden": 3, "texto": "Aplicamos el multiplicador de duplicar: <span class=\"keyword-highlight\">8 × 2 = 16 estampas</span>."}
                ]
            },
            {
                "enunciado": "Valentina tenía <span class=\"keyword-highlight\">15 bombones</span> y <span class=\"keyword-highlight\">3 sillas</span> (basura). Se comió <span class=\"keyword-highlight\">5 bombones</span>. Su abuela le <span class=\"keyword-highlight\">duplica</span> la cantidad de bombones que le quedan.",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos datos basura: Las <span class=\"keyword-highlight\">3 sillas de madera</span> no influyen en los bombones."},
                    {"orden": 2, "texto": "Calculamos los bombones restantes: <span class=\"keyword-highlight\">15 - 5 = 10 bombones</span>."},
                    {"orden": 3, "texto": "Duplicamos la cantidad restante: <span class=\"keyword-highlight\">10 × 2 = 20 bombones</span>."}
                ]
            },
            {
                "enunciado": "Mateo tiene <span class=\"keyword-highlight\">12 tazos</span> y <span class=\"keyword-highlight\">5 camisas rojas</span> (basura). Pierde <span class=\"keyword-highlight\">3 tazos</span>. Su amigo le <span class=\"keyword-highlight\">triplica</span> la cantidad que le queda.",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos datos basura: Las <span class=\"keyword-highlight\">5 camisas rojas</span> son distractores."},
                    {"orden": 2, "texto": "Restamos los tazos perdidos: <span class=\"keyword-highlight\">12 - 3 = 9 tazos</span> restantes."},
                    {"orden": 3, "texto": "Triplicamos el valor obtenido: <span class=\"keyword-highlight\">9 × 3 = 27 tazos</span>."}
                ]
            },
            {
                "enunciado": "Sofía tiene <span class=\"keyword-highlight\">20 galletas</span> y <span class=\"keyword-highlight\">2 gatos</span> (basura). Le regala <span class=\"keyword-highlight\">8 galletas</span> a su tía y reparte el resto entre <span class=\"keyword-highlight\">2 amigos</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos datos basura: Los <span class=\"keyword-highlight\">2 gatos</span> no participan en la repartición de galletas."},
                    {"orden": 2, "texto": "Calculamos las galletas sobrantes: <span class=\"keyword-highlight\">20 - 8 = 12 galletas</span>."},
                    {"orden": 3, "texto": "Repartimos a la mitad entre sus amigos: <span class=\"keyword-highlight\">12 ÷ 2 = 6 galletas</span> a cada uno."}
                ]
            },
            {
                "enunciado": "En una caja hay <span class=\"keyword-highlight\">30 caramelos</span> y <span class=\"keyword-highlight\">4 libros</span> (basura). Se pierden <span class=\"keyword-highlight\">10 caramelos</span> y el resto se <span class=\"keyword-highlight\">triplica</span> por un truco.",
                "pasos": [
                    {"orden": 1, "texto": "Ignoramos datos basura: Los <span class=\"keyword-highlight\">4 libros</span> no son caramelos."},
                    {"orden": 2, "texto": "Restamos los caramelos perdidos: <span class=\"keyword-highlight\">30 - 10 = 20 caramelos</span>."},
                    {"orden": 3, "texto": "Aplicamos el multiplicador: <span class=\"keyword-highlight\">20 × 3 = 60 caramelos</span>."}
                ]
            }
        ]
    }

    # Retornar los ejemplos del nivel o una lista vacía si no está definido
    return ejemplos_db.get((modulo_id, nivel_id), [])
