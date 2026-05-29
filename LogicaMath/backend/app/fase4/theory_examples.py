# theory_examples.py
# ─────────────────────────────────────────────────────────────
# Base de ejemplos extendidos y formateados premium para Fase 4.
# Proporciona los ejemplos estructurados para cada módulo y nivel de Fase 4.

def obtener_ejemplos_expandidos_fase4(modulo_id: int, nivel_id: int) -> list:
    ejemplos_db = {
        # --- MÓDULO 1: LA FRACCIÓN VISUAL ---
        # Nivel 1: Lectura y modelado de numerador/denominador en polígonos simétricos
        (1, 1): [
            {
                "enunciado": "Una pizza está cortada en <span class=\"keyword-highlight\">8 pedazos iguales</span>. Si te comes <span class=\"keyword-highlight\">3 pedazos</span>, ¿qué fracción representa?",
                "pasos": [
                    {"orden": 1, "texto": "Contamos el total de porciones (denominador): <span class=\"keyword-highlight\">8</span>."},
                    {"orden": 2, "texto": "Contamos las porciones que tomas (numerador): <span class=\"keyword-highlight\">3</span>."},
                    {"orden": 3, "texto": "Escribimos la relación: <span class=\"keyword-highlight\">3/8</span>."}
                ]
            },
            {
                "enunciado": "Una barra de chocolate tiene <span class=\"keyword-highlight\">4 cuadrados idénticos</span>. Te comes <span class=\"keyword-highlight\">1 cuadrado</span>. ¿Qué fracción queda?",
                "pasos": [
                    {"orden": 1, "texto": "El chocolate entero se dividió en <span class=\"keyword-highlight\">4</span> partes. (Denominador = 4)."},
                    {"orden": 2, "texto": "Si comes 1, te quedan: <span class=\"keyword-highlight\">4 - 1 = 3</span> cuadrados. (Numerador = 3)."},
                    {"orden": 3, "texto": "La fracción restante es: <span class=\"keyword-highlight\">3/4</span>."}
                ]
            },
            {
                "enunciado": "Una bandera está dividida en <span class=\"keyword-highlight\">3 franjas verticales iguales</span>. Hay <span class=\"keyword-highlight\">2 franjas de color rojo</span>. ¿Qué fracción es roja?",
                "pasos": [
                    {"orden": 1, "texto": "El total de franjas es <span class=\"keyword-highlight\">3</span>. Va abajo (Denominador)."},
                    {"orden": 2, "texto": "Las rojas son <span class=\"keyword-highlight\">2</span>. Va arriba (Numerador)."},
                    {"orden": 3, "texto": "La fracción resultante es: <span class=\"keyword-highlight\">2/3</span>."}
                ]
            },
            {
                "enunciado": "Una ventana tiene <span class=\"keyword-highlight\">6 cristales iguales</span>. Si <span class=\"keyword-highlight\">5 cristales</span> están limpios, ¿qué fracción representa?",
                "pasos": [
                    {"orden": 1, "texto": "Total de divisiones = <span class=\"keyword-highlight\">6</span> (Denominador)."},
                    {"orden": 2, "texto": "Porción de interés = <span class=\"keyword-highlight\">5</span> (Numerador)."},
                    {"orden": 3, "texto": "La fracción es: <span class=\"keyword-highlight\">5/6</span> de la ventana limpia."}
                ]
            }
        ],
        # Nivel 2: Construcción de equivalencias
        (1, 2): [
            {
                "enunciado": "Encuentra la fracción equivalente a <span class=\"keyword-highlight\">1/2</span> multiplicando arriba y abajo por 2.",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos el numerador: <span class=\"keyword-highlight\">1 × 2 = 2</span>."},
                    {"orden": 2, "texto": "Multiplicamos el denominador: <span class=\"keyword-highlight\">2 × 2 = 4</span>."},
                    {"orden": 3, "texto": "La fracción equivalente es: <span class=\"keyword-highlight\">2/4</span>."}
                ]
            },
            {
                "enunciado": "Encuentra el clon equivalente a <span class=\"keyword-highlight\">1/3</span> si multiplicamos por 3.",
                "pasos": [
                    {"orden": 1, "texto": "Numerador: <span class=\"keyword-highlight\">1 × 3 = 3</span>."},
                    {"orden": 2, "texto": "Denominador: <span class=\"keyword-highlight\">3 × 3 = 9</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">3/9</span>."}
                ]
            },
            {
                "enunciado": "Amplifica la fracción <span class=\"keyword-highlight\">2/5</span> por un factor de escala de 2.",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos el de arriba: <span class=\"keyword-highlight\">2 × 2 = 4</span>."},
                    {"orden": 2, "texto": "Multiplicamos el de abajo: <span class=\"keyword-highlight\">5 × 2 = 10</span>."},
                    {"orden": 3, "texto": "La nueva fracción equivalente es: <span class=\"keyword-highlight\">4/10</span>."}
                ]
            },
            {
                "enunciado": "Amplifica la fracción <span class=\"keyword-highlight\">3/4</span> duplicando sus partes.",
                "pasos": [
                    {"orden": 1, "texto": "Numerador: <span class=\"keyword-highlight\">3 × 2 = 6</span>."},
                    {"orden": 2, "texto": "Denominador: <span class=\"keyword-highlight\">4 × 2 = 8</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">6/8</span>."}
                ]
            }
        ],
        # Nivel 3: Áreas fraccionarias en composiciones geométricas asimétricas
        (1, 3): [
            {
                "enunciado": "Un cuadrado se dividió en <span class=\"keyword-highlight\">4 partes</span>, pero 2 son el doble de grandes que las otras. ¿Cada parte representa 1/4?",
                "pasos": [
                    {"orden": 1, "texto": "Para representar fracciones, todas las partes deben ser <span class=\"keyword-highlight\">idénticas en área</span>."},
                    {"orden": 2, "texto": "Al ser asimétricas, no representan directamente 1/4 cada una."},
                    {"orden": 3, "texto": "Respuesta: <span class=\"keyword-highlight\">No, porque las partes no son iguales</span>."}
                ]
            },
            {
                "enunciado": "Un rectángulo está cortado por su diagonal en <span class=\"keyword-highlight\">2 triángulos iguales</span>. ¿Qué fracción representa cada uno?",
                "pasos": [
                    {"orden": 1, "texto": "La diagonal divide la unidad en <span class=\"keyword-highlight\">2 áreas simétricas</span>."},
                    {"orden": 2, "texto": "Cada triángulo es una de esas partes: <span class=\"keyword-highlight\">1</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">1/2</span> del rectángulo."}
                ]
            },
            {
                "enunciado": "Un círculo tiene una línea que corta una pequeña porción del borde. ¿Es esa porción la mitad (1/2)?",
                "pasos": [
                    {"orden": 1, "texto": "Una mitad exige que el corte pase exactamente por el centro (diámetro)."},
                    {"orden": 2, "texto": "Al ser un corte descentrado, las áreas son asimétricas."},
                    {"orden": 3, "texto": "Respuesta: <span class=\"keyword-highlight\">No, no representa la mitad</span>."}
                ]
            },
            {
                "enunciado": "En un cuadrado dividido en una grilla de 4x4, se colorean <span class=\"keyword-highlight\">4 cuadraditos</span>. ¿Qué fracción representa?",
                "pasos": [
                    {"orden": 1, "texto": "Total de cuadraditos = <span class=\"keyword-highlight\">16</span>."},
                    {"orden": 2, "texto": "Cuadraditos pintados = <span class=\"keyword-highlight\">4</span>."},
                    {"orden": 3, "texto": "Relación: <span class=\"keyword-highlight\">4/16</span>, que simplificado es equivalente a <span class=\"keyword-highlight\">1/4</span>."}
                ]
            }
        ],

        # --- MÓDULO 2: FRACCIÓN DE CANTIDAD ---
        # Nivel 1: Cálculo de porciones unitarias (1/n) sobre grupos
        (2, 1): [
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">1/3 de 15 caramelos</span>.",
                "pasos": [
                    {"orden": 1, "texto": "El denominador indica que debemos repartir las 15 unidades en <span class=\"keyword-highlight\">3 cajas iguales</span>."},
                    {"orden": 2, "texto": "Dividimos: <span class=\"keyword-highlight\">15 ÷ 3 = 5</span> caramelos por caja."},
                    {"orden": 3, "texto": "Tomamos 1 caja: <span class=\"keyword-highlight\">5 × 1 = 5</span> caramelos."}
                ]
            },
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">1/4 de 20 monedas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos el total entre el de abajo: <span class=\"keyword-highlight\">20 ÷ 4 = 5</span>."},
                    {"orden": 2, "texto": "Multiplicamos por el de arriba: <span class=\"keyword-highlight\">5 × 1 = 5</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">5 monedas</span>."}
                ]
            },
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">1/5 de 50 soldados</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 50 en 5 grupos: <span class=\"keyword-highlight\">50 ÷ 5 = 10</span>."},
                    {"orden": 2, "texto": "Tomamos 1 de esos grupos: <span class=\"keyword-highlight\">10</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">10 soldados</span>."}
                ]
            },
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">1/8 de 32 cartas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos las cartas en 8 pilas iguales: <span class=\"keyword-highlight\">32 ÷ 8 = 4</span>."},
                    {"orden": 2, "texto": "Tomamos 1 pila: <span class=\"keyword-highlight\">4</span> cartas."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">4 cartas</span>."}
                ]
            }
        ],
        # Nivel 2: Operador compuesto (m/n de X) y algoritmo de dos pasos
        (2, 2): [
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">3/4 de 20 manzanas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1 (Corta): Dividimos el total entre el de abajo: <span class=\"keyword-highlight\">20 ÷ 4 = 5</span>."},
                    {"orden": 2, "texto": "Paso 2 (Recolecta): Multiplicamos el resultado por el de arriba: <span class=\"keyword-highlight\">5 × 3 = 15</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">15 manzanas</span>."}
                ]
            },
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">2/5 de 50 monedas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: Dividimos 50 entre 5: <span class=\"keyword-highlight\">50 ÷ 5 = 10</span>."},
                    {"orden": 2, "texto": "Paso 2: Multiplicamos por 2: <span class=\"keyword-highlight\">10 × 2 = 20</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20 monedas</span>."}
                ]
            },
            {
                "enunciado": "En una clase de 30 alumnos, <span class=\"keyword-highlight\">2/3</span> llevan gafas. ¿Cuántos alumnos llevan gafas?",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos los alumnos en 3 grupos: <span class=\"keyword-highlight\">30 ÷ 3 = 10</span>."},
                    {"orden": 2, "texto": "Tomamos 2 de esos grupos: <span class=\"keyword-highlight\">10 × 2 = 20</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20 alumnos</span>."}
                ]
            },
            {
                "enunciado": "Calcula <span class=\"keyword-highlight\">5/8 de 40 cartas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Dividimos 40 entre 8: <span class=\"keyword-highlight\">40 ÷ 8 = 5</span>."},
                    {"orden": 2, "texto": "Multiplicamos por 5: <span class=\"keyword-highlight\">5 × 5 = 25</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">25 cartas</span>."}
                ]
            }
        ],
        # Nivel 3: Lógica del complemento y deducción del resto
        (2, 3): [
            {
                "enunciado": "Si regalas <span class=\"keyword-highlight\">1/4 de tus juguetes</span>, ¿qué fracción te queda?",
                "pasos": [
                    {"orden": 1, "texto": "El total entero es <span class=\"keyword-highlight\">4/4</span>."},
                    {"orden": 2, "texto": "Restamos la fracción regalada: <span class=\"keyword-highlight\">4/4 - 1/4 = 3/4</span>."},
                    {"orden": 3, "texto": "Resultado: Te quedan <span class=\"keyword-highlight\">3/4</span> de tus juguetes."}
                ]
            },
            {
                "enunciado": "Sofía preparó <span class=\"keyword-highlight\">40 cupcakes</span> y vendió <span class=\"keyword-highlight\">1/4</span> en la feria. ¿Cuántos le quedaron?",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos cuántos vendió: <span class=\"keyword-highlight\">1/4 de 40 = 10</span> cupcakes."},
                    {"orden": 2, "texto": "Restamos lo vendido del total: <span class=\"keyword-highlight\">40 - 10 = 30</span> cupcakes."},
                    {"orden": 3, "texto": "Resultado: Le quedaron <span class=\"keyword-highlight\">30 cupcakes</span>."}
                ]
            },
            {
                "enunciado": "Un tanque de agua de 50 litros se derrama en <span class=\"keyword-highlight\">2/5</span> de su volumen. ¿Cuántos litros quedan?",
                "pasos": [
                    {"orden": 1, "texto": "Calculamos lo derramado: <span class=\"keyword-highlight\">2/5 de 50 = 20 litros</span>."},
                    {"orden": 2, "texto": "Restamos del volumen total: <span class=\"keyword-highlight\">50 - 20 = 30 litros</span>."},
                    {"orden": 3, "texto": "Resultado: Quedan <span class=\"keyword-highlight\">30 litros</span>."}
                ]
            },
            {
                "enunciado": "Si gastas <span class=\"keyword-highlight\">3/8 de tus ahorros</span>, ¿qué fracción sigue guardada en el banco?",
                "pasos": [
                    {"orden": 1, "texto": "Tu dinero total inicial es <span class=\"keyword-highlight\">8/8</span>."},
                    {"orden": 2, "texto": "Restamos los octavos gastados: <span class=\"keyword-highlight\">8/8 - 3/8 = 5/8</span>."},
                    {"orden": 3, "texto": "Resultado: Sigue guardada la fracción <span class=\"keyword-highlight\">5/8</span>."}
                ]
            }
        ],

        # --- MÓDULO 3: PORCENTAJES RÁPIDOS Y PROMEDIOS ---
        # Nivel 1: Mapeo de porcentajes intuitivos: 50%, 25%, 10%
        (3, 1): [
            {
                "enunciado": "Calcula el <span class=\"keyword-highlight\">50% de 60 monedas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "El 50% representa exactamente la mitad de un todo."},
                    {"orden": 2, "texto": "Dividimos entre 2: <span class=\"keyword-highlight\">60 ÷ 2 = 30</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">30 monedas</span>."}
                ]
            },
            {
                "enunciado": "Calcula el <span class=\"keyword-highlight\">25% de 80 puntos</span>.",
                "pasos": [
                    {"orden": 1, "texto": "El 25% representa una cuarta parte (1/4)."},
                    {"orden": 2, "texto": "Dividimos entre 4: <span class=\"keyword-highlight\">80 ÷ 4 = 20</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20 puntos</span>."}
                ]
            },
            {
                "enunciado": "Calcula el <span class=\"keyword-highlight\">10% de 350 monedas</span>.",
                "pasos": [
                    {"orden": 1, "texto": "El 10% representa una décima parte (1/10)."},
                    {"orden": 2, "texto": "Dividimos entre 10 (quitando el cero final): <span class=\"keyword-highlight\">350 ÷ 10 = 35</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">35 monedas</span>."}
                ]
            },
            {
                "enunciado": "Un artículo de 20 pesos tiene un descuento del <span class=\"keyword-highlight\">50%</span>. ¿Cuál es el precio final?",
                "pasos": [
                    {"orden": 1, "texto": "Descuento de la mitad: <span class=\"keyword-highlight\">20 ÷ 2 = 10 pesos</span> de rebaja."},
                    {"orden": 2, "texto": "Restamos el descuento: <span class=\"keyword-highlight\">20 - 10 = 10</span>."},
                    {"orden": 3, "texto": "Resultado: El precio final es <span class=\"keyword-highlight\">10 pesos</span>."}
                ]
            }
        ],
        # Nivel 2: Lectura e interpretación de gráficos circulares
        (3, 2): [
            {
                "enunciado": "En un gráfico circular, el <span class=\"keyword-highlight\">40%</span> prefiere fútbol, el <span class=\"keyword-highlight\">35%</span> básquet y el resto vóley. ¿Qué porcentaje prefiere vóley?",
                "pasos": [
                    {"orden": 1, "texto": "La suma total de todos los sectores en un gráfico circular es siempre <span class=\"keyword-highlight\">100%</span>."},
                    {"orden": 2, "texto": "Sumamos los conocidos: <span class=\"keyword-highlight\">40% + 35% = 75%</span>."},
                    {"orden": 3, "texto": "Restamos de 100%: <span class=\"keyword-highlight\">100% - 75% = 25%</span> para vóley."}
                ]
            },
            {
                "enunciado": "De 200 alumnos encuestados, el <span class=\"keyword-highlight\">25%</span> prefiere matemáticas. ¿Cuántos alumnos son?",
                "pasos": [
                    {"orden": 1, "texto": "El 25% representa una cuarta parte (1/4)."},
                    {"orden": 2, "texto": "Dividimos el total de alumnos entre 4: <span class=\"keyword-highlight\">200 ÷ 4 = 50</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">50 alumnos</span>."}
                ]
            },
            {
                "enunciado": "En un gráfico sobre mascotas, el 50% son perros, el 30% gatos y el resto peces. ¿Qué porcentaje representan los peces?",
                "pasos": [
                    {"orden": 1, "texto": "Suma de perros y gatos: <span class=\"keyword-highlight\">50% + 30% = 80%</span>."},
                    {"orden": 2, "texto": "Restamos del 100% total: <span class=\"keyword-highlight\">100% - 80% = 20%</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">20%</span> son peces."}
                ]
            },
            {
                "enunciado": "Si un pastel representa un total de 120 rebanadas, y el 10% son de fresa, ¿cuántas son de fresa?",
                "pasos": [
                    {"orden": 1, "texto": "El 10% equivale a dividir entre 10."},
                    {"orden": 2, "texto": "Dividimos: <span class=\"keyword-highlight\">120 ÷ 10 = 12</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">12 rebanadas</span>."}
                ]
            }
        ],
        # Nivel 3: Comparación de tasas en gráficos de barras
        (3, 3): [
            {
                "enunciado": "Un gráfico de barras muestra: Región A = <span class=\"keyword-highlight\">450</span>, Región B = <span class=\"keyword-highlight\">320</span>, Región C = <span class=\"keyword-highlight\">530</span>. ¿Cuántas empresas hay en total?",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los valores representados por cada barra."},
                    {"orden": 2, "texto": "Planteamos la suma: <span class=\"keyword-highlight\">450 + 320 + 530</span>."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">1300 empresas</span>."}
                ]
            },
            {
                "enunciado": "Usando el gráfico anterior, ¿cuántas empresas más tiene la Región C que la Región B?",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos los valores: Región C = <span class=\"keyword-highlight\">530</span>, Región B = <span class=\"keyword-highlight\">320</span>."},
                    {"orden": 2, "texto": "Restamos para hallar la diferencia: <span class=\"keyword-highlight\">530 - 320 = 210</span>."},
                    {"orden": 3, "texto": "Resultado: La Región C tiene <span class=\"keyword-highlight\">210 empresas más</span>."}
                ]
            },
            {
                "enunciado": "Las barras indican ventas: Enero = 150, Febrero = 200, Marzo = 120. ¿Cuál fue el mes con mayor volumen y cuánto vendió?",
                "pasos": [
                    {"orden": 1, "texto": "Buscamos la barra más alta, que corresponde a Febrero."},
                    {"orden": 2, "texto": "Leemos su escala: <span class=\"keyword-highlight\">200</span> unidades."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">Febrero con 200</span>."}
                ]
            },
            {
                "enunciado": "Si en la Región A hay 450 y en la B 320, ¿cuál es la suma combinada de ambas regiones?",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos ambos valores: <span class=\"keyword-highlight\">450 + 320 = 770</span>."},
                    {"orden": 2, "texto": "Resultado: <span class=\"keyword-highlight\">770</span>."}
                ]
            }
        ],
        # Nivel 4: El Punto de Equilibrio - Media Aritmética
        (3, 4): [
            {
                "enunciado": "Calcula el promedio de libros leídos por tres niños: <span class=\"keyword-highlight\">3, 7 y 5 libros</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1 (Sumar): Juntamos todos los elementos en una pila única: <span class=\"keyword-highlight\">3 + 7 + 5 = 15</span>."},
                    {"orden": 2, "texto": "Paso 2 (Dividir): Repartimos la pila entre la cantidad de niños (3): <span class=\"keyword-highlight\">15 ÷ 3 = 5</span>."},
                    {"orden": 3, "texto": "Resultado: El promedio es <span class=\"keyword-highlight\">5 libros</span>."}
                ]
            },
            {
                "enunciado": "Calcula el promedio de edad entre dos hermanos de <span class=\"keyword-highlight\">10 y 20 años</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1: Sumamos las edades: <span class=\"keyword-highlight\">10 + 20 = 30</span>."},
                    {"orden": 2, "texto": "Paso 2: Dividimos entre 2 hermanos: <span class=\"keyword-highlight\">30 ÷ 2 = 15</span>."},
                    {"orden": 3, "texto": "Resultado: El promedio de edad es <span class=\"keyword-highlight\">15 años</span>."}
                ]
            },
            {
                "enunciado": "Calcula el promedio de las siguientes cuatro notas: <span class=\"keyword-highlight\">2, 4, 6 y 8</span>.",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos las notas: <span class=\"keyword-highlight\">2 + 4 + 6 + 8 = 20</span>."},
                    {"orden": 2, "texto": "Dividimos entre el número total de notas (4): <span class=\"keyword-highlight\">20 ÷ 4 = 5</span>."},
                    {"orden": 3, "texto": "Resultado: El promedio es <span class=\"keyword-highlight\">5</span>."}
                ]
            },
            {
                "enunciado": "Si tienes tres bolsas con dulces: 6, 8 y 10. ¿Cuál es el promedio de dulces por bolsa?",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos los dulces: <span class=\"keyword-highlight\">6 + 8 + 10 = 24</span>."},
                    {"orden": 2, "texto": "Dividimos entre 3 bolsas: <span class=\"keyword-highlight\">24 ÷ 3 = 8</span>."},
                    {"orden": 3, "texto": "Resultado: El promedio es <span class=\"keyword-highlight\">8 dulces</span>."}
                ]
            }
        ],

        # --- MÓDULO 4: RAZÓN Y MEZCLAS ---
        # Nivel 1: Razones simples (a:b) y proporcionalidad directa
        (4, 1): [
            {
                "enunciado": "La receta de limonada exige <span class=\"keyword-highlight\">3 tazas de agua por 1 de limón</span> (3:1). Si pones <span class=\"keyword-highlight\">2 de limón</span>, ¿cuánta agua necesitas?",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos el factor de escala: el limón pasó de 1 a 2, por lo que duplicamos la receta (x2)."},
                    {"orden": 2, "texto": "Multiplicamos el agua original por 2: <span class=\"keyword-highlight\">3 × 2 = 6</span>."},
                    {"orden": 3, "texto": "Resultado: Necesitas <span class=\"keyword-highlight\">6 tazas de agua</span>."}
                ]
            },
            {
                "enunciado": "Una pared se pinta combinando <span class=\"keyword-highlight\">2 litros de rojo y 3 de blanco</span> (2:3). Si compras <span class=\"keyword-highlight\">6 litros de rojo</span>, ¿cuántos de blanco necesitas?",
                "pasos": [
                    {"orden": 1, "texto": "Identificamos el multiplicador: el rojo pasó de 2 a 6, es decir, el triple (x3)."},
                    {"orden": 2, "texto": "Multiplicamos el blanco por 3: <span class=\"keyword-highlight\">3 × 3 = 9</span>."},
                    {"orden": 3, "texto": "Resultado: Necesitas <span class=\"keyword-highlight\">9 litros de blanco</span>."}
                ]
            },
            {
                "enunciado": "Para preparar cemento se usa <span class=\"keyword-highlight\">1 porción de cemento por 4 de arena</span>. Si usas <span class=\"keyword-highlight\">2 de cemento</span>, ¿cuánta arena aportas?",
                "pasos": [
                    {"orden": 1, "texto": "Multiplicamos por 2 ya que se duplicó la base de cemento."},
                    {"orden": 2, "texto": "Arena = <span class=\"keyword-highlight\">4 × 2 = 8</span> porciones."},
                    {"orden": 3, "texto": "Resultado: <span class=\"keyword-highlight\">8 porciones de arena</span>."}
                ]
            },
            {
                "enunciado": "La masa de galletas requiere <span class=\"keyword-highlight\">1 vaso de leche por 2 de harina</span> (1:2). Si pones <span class=\"keyword-highlight\">4 vasos de harina</span>, ¿cuántos de leche usarás?",
                "pasos": [
                    {"orden": 1, "texto": "La harina se duplicó (de 2 a 4)."},
                    {"orden": 2, "texto": "Dividimos la nueva harina entre 2 para hallar la leche: <span class=\"keyword-highlight\">4 ÷ 2 = 2</span>."},
                    {"orden": 3, "texto": "Resultado: Usarás <span class=\"keyword-highlight\">2 vasos de leche</span>."}
                ]
            }
        ],
        # Nivel 2: Reparto proporcional de volúmenes macro
        (4, 2): [
            {
                "enunciado": "Para hacer pintura verde mezclas <span class=\"keyword-highlight\">2 litros de azul y 3 de amarillo</span> (haciendo 5 litros en total). Si quieres <span class=\"keyword-highlight\">30 litros de verde</span>, ¿cuántos de azul usas?",
                "pasos": [
                    {"orden": 1, "texto": "Paso 1 (Escala): Dividimos el pedido deseado entre el total de la receta base: <span class=\"keyword-highlight\">30 ÷ 5 = 6 veces</span>."},
                    {"orden": 2, "texto": "Paso 2: Multiplicamos el ingrediente azul por ese factor: <span class=\"keyword-highlight\">2 × 6 = 12</span>."},
                    {"orden": 3, "texto": "Resultado: Necesitas <span class=\"keyword-highlight\">12 litros de azul</span>."}
                ]
            },
            {
                "enunciado": "Haces pintura rosa con <span class=\"keyword-highlight\">1 litro de rojo y 4 de blanco</span> (5 litros total). Para un lote de <span class=\"keyword-highlight\">50 litros</span>, ¿cuánto blanco comprarás?",
                "pasos": [
                    {"orden": 1, "texto": "Escala de la receta: <span class=\"keyword-highlight\">50 ÷ 5 = 10 lotes</span>."},
                    {"orden": 2, "texto": "Multiplicamos el blanco por 10: <span class=\"keyword-highlight\">4 × 10 = 40</span>."},
                    {"orden": 3, "texto": "Resultado: Comprarás <span class=\"keyword-highlight\">40 litros de blanco</span>."}
                ]
            },
            {
                "enunciado": "Una mezcla de concreto tiene <span class=\"keyword-highlight\">3 paladas de arena y 7 de grava</span> (10 en total). Si necesitas <span class=\"keyword-highlight\">40 paladas</span> de mezcla total, ¿cuántas son de arena?",
                "pasos": [
                    {"orden": 1, "texto": "Escala de la mezcla: <span class=\"keyword-highlight\">40 ÷ 10 = 4 veces</span> la receta."},
                    {"orden": 2, "texto": "Multiplicamos la arena por 4: <span class=\"keyword-highlight\">3 × 4 = 12</span>."},
                    {"orden": 3, "texto": "Resultado: Aportarás <span class=\"keyword-highlight\">12 paladas de arena</span>."}
                ]
            },
            {
                "enunciado": "Un jarabe se hace con <span class=\"keyword-highlight\">1 taza de agua y 1 de jugo concentrado de fruta</span> (2 en total). Si quieres hacer <span class=\"keyword-highlight\">20 litros</span> de jarabe, ¿cuánto concentrado lleva?",
                "pasos": [
                    {"orden": 1, "texto": "Escala: <span class=\"keyword-highlight\">20 ÷ 2 = 10 veces</span> la receta."},
                    {"orden": 2, "texto": "Multiplicamos el jugo por 10: <span class=\"keyword-highlight\">1 × 10 = 10</span>."},
                    {"orden": 3, "texto": "Resultado: Lleva <span class=\"keyword-highlight\">10 litros de concentrado</span>."}
                ]
            }
        ],
        # Nivel 3: Homogeneización de mezclas complejas
        (4, 3): [
            {
                "enunciado": "Un frasco de perfume mezcla <span class=\"keyword-highlight\">1 parte de esencia por 4 partes de alcohol</span> (1:4). ¿Qué porcentaje representa la esencia?",
                "pasos": [
                    {"orden": 1, "texto": "Sumamos el total de partes: <span class=\"keyword-highlight\">1 + 4 = 5 partes totales</span>."},
                    {"orden": 2, "texto": "La esencia es 1 de esas 5 partes, es decir, la fracción <span class=\"keyword-highlight\">1/5</span>."},
                    {"orden": 3, "texto": "Convertimos la fracción a porcentaje: $1/5 \times 100 = 20\%$. Resultado: <span class=\"keyword-highlight\">20%</span>."}
                ]
            },
            {
                "enunciado": "Si tienes una bebida de 300 ml que contiene <span class=\"keyword-highlight\">10% de jugo real</span>, ¿cuántos ml de jugo real tiene?",
                "pasos": [
                    {"orden": 1, "texto": "El 10% equivale a una décima parte (dividir entre 10)."},
                    {"orden": 2, "texto": "Dividimos el total de bebida: <span class=\"keyword-highlight\">300 ÷ 10 = 30</span>."},
                    {"orden": 3, "texto": "Resultado: Tiene <span class=\"keyword-highlight\">30 ml</span> de jugo real."}
                ]
            },
            {
                "enunciado": "En una aleación de oro y cobre de 100 gramos, el 75% es oro. ¿Cuántos gramos de cobre hay?",
                "pasos": [
                    {"orden": 1, "texto": "Si el 75% es oro, el porcentaje restante de cobre es <span class=\"keyword-highlight\">100% - 75% = 25%</span>."},
                    {"orden": 2, "texto": "Calculamos el 25% (un cuarto) de 100 gramos: <span class=\"keyword-highlight\">100 ÷ 4 = 25</span>."},
                    {"orden": 3, "texto": "Resultado: Hay <span class=\"keyword-highlight\">25 gramos de cobre</span>."}
                ]
            },
            {
                "enunciado": "Una mezcla de agua salada de 80 gramos contiene <span class=\"keyword-highlight\">10% de sal</span>. Si se evaporan 30 gramos de agua pura, ¿cuánta sal queda?",
                "pasos": [
                    {"orden": 1, "texto": "La evaporación de agua pura no altera la masa de la sal disuelta."},
                    {"orden": 2, "texto": "Calculamos la sal inicial: <span class=\"keyword-highlight\">10% de 80 = 8 gramos</span>."},
                    {"orden": 3, "texto": "Resultado: Quedan exactamente <span class=\"keyword-highlight\">8 gramos de sal</span>."}
                ]
            }
        ]
    }
    return ejemplos_db.get((modulo_id, nivel_id), [])
