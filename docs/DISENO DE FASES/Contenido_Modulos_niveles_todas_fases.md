Aquí tienes el documento maestro actualizado, consolidado y refactorizado con todos los cambios que discutimos.

He ajustado la numeración (por ejemplo, en la Fase 2, al eliminar la redundancia del "Detective Matemático", el Módulo 5 pasó a ser el Módulo 4) y he eliminado las notas antiguas que ya no aplicaban.

```text
MAPA DE RUTA PEDAGÓGICO GLOBAL: LOGICAKIDS PRO (FASES 1 A 9)
ARQUITECTURA COMPLETA DE NIVELES Y CONCEPTOS MATEMÁTICOS

**NOTA SOBRE LOS DESAFÍOS (Niveles 11, 12 y 13):**
* Todos los "DESAFÍO 1" en este mapa corresponden técnicamente al Nivel 11 en la base de datos (25 preguntas, Opción Múltiple).
* Todos los "DESAFÍO 2" corresponden al Nivel 12 (25 preguntas, Opción Múltiple).
* Todos los "DESAFÍO FINAL" corresponden al Nivel 13 (10 preguntas, Evocación Pura).
* Ningún desafío usa mocks, el flujo es 100% server-authoritative extraído del endpoint `/api/fases/{id}/dashboard`.

================================================================================
[FASE 1: ARITMÉTICA BÁSICA]
Propósito: Garantizar la comprensión del sistema decimal y la automatización y fluidez de las operaciones.
================================================================================
 │
 ├── [MÓDULO 1: Sumas] -> Tema: Algoritmo aditivo y fluidez.
 │    ├── Nivel 1: [Algoritmo tradicional de 1 a 3 cifras con acarreo] (Mecánica: Visual, guiado, sin tiempo)
 │    ├── Nivel 2: [Sumas encadenadas de tres o más sumandos] (Mecánica: Práctica estándar, Bucle Espejo)
 │    ├── Nivel 3: [Cálculo veloz buscando complementos a 10 y dobles] (Mecánica: Fluidez, pequeña presión de tiempo)
 │    │
 │    ├── DESAFÍO 1: [Operaciones lineales directas] (Mecánica: El Filtro, >80% para continuar)
 │    ├── DESAFÍO 2: [Suma de números con desalineación posicional] (Mecánica: La Trampa, distractores visuales)
 │    └── DESAFÍO FINAL: [Maratón de velocidad contra reloj] (Mecánica: El Candado, requiere ≥90%)
 │
 ├── [MÓDULO 2: Restas] -> Tema: Sustracción, reagrupación y valor faltante.
 │    ├── Nivel 1: [Restas con reagrupación o acarreo simple] (Mecánica: Visual, guiado, sin tiempo)
 │    ├── Nivel 2: [La trampa del cero en el minuendo, ej. 400 - 127] (Mecánica: Práctica estándar, Bucle Espejo)
 │    ├── Nivel 3: [Hallar el valor faltante y algoritmo de comprobación] (Mecánica: Fluidez, pequeña presión de tiempo)
 │    │
 │    ├── DESAFÍO 1: [Restas directas con dígitos altos] (Mecánica: El Filtro, >80% para continuar)
 │    ├── DESAFÍO 2: [Minuendos compuestos por ceros consecutivos] (Mecánica: La Trampa, distractores numéricos)
 │    └── DESAFÍO FINAL: [Maratón de velocidad de sustracción] (Mecánica: El Candado, requiere ≥90%)
 │
 ├── [MÓDULO 3: Tablas] -> Tema: Multiplicación operativa y propiedades base.
 │    ├── Nivel 1: [Tablas del 2 al 9 mediante patrones y saltos visuales] (Mecánica: Visual, guiado, sin tiempo)
 │    ├── Nivel 2: [Tablas extendidas de control analítico: 11 y 12] (Mecánica: Práctica estándar, Bucle Espejo)
 │    ├── Nivel 3: [Atajos multiplicativos rápidos por 10, 20, 25, 50 y 100] (Mecánica: Fluidez, pequeña presión de tiempo)
 │    │
 │    ├── DESAFÍO 1: [Cálculo mental directo de factores combinados] (Mecánica: El Filtro, >80% para continuar)
 │    ├── DESAFÍO 2: [Propiedad conmutativa con factores trampa invertidos] (Mecánica: La Trampa, distractores)
 │    └── DESAFÍO FINAL: [Carrera contra el reloj de tablas mixtas] (Mecánica: El Candado, requiere ≥90%)
 │
 ├── [MÓDULO 4: Divisiones] -> Tema: Reparto equitativo y algoritmo inverso.
 │    ├── Nivel 1: [División exacta como el inverso de la multiplicación] (Mecánica: Visual, guiado, sin tiempo)
 │    ├── Nivel 2: [Divisiones inexactas con residuo en escenarios de reparto] (Mecánica: Práctica estándar, Bucle Espejo)
 │    ├── Nivel 3: [Divisiones de cálculo mental rápido entre 2, 3, 4 y 5] (Mecánica: Fluidez, pequeña presión de tiempo)
 │    │
 │    ├── DESAFÍO 1: [Divisiones exactas de dos y tres cifras en dividendo] (Mecánica: El Filtro, >80% para continuar)
 │    ├── DESAFÍO 2: [Identificación e interpretación exacta del residuo] (Mecánica: La Trampa, enunciados ambiguos)
 │    └── DESAFÍO FINAL: [Prueba de agilidad en divisiones complejas] (Mecánica: El Candado, requiere ≥90%)
 │
 └── [MÓDULO 5: Desafío Mixto] -> Tema: Agilidad aritmética y alternancia de signos.
      ├── Nivel 1: [Alternancia aleatoria de las 4 operaciones con un dígito] (Mecánica: Visual, guiado, sin tiempo)
      ├── Nivel 2: [Operaciones combinadas lineales de dos pasos sin paréntesis] (Mecánica: Práctica estándar, Bucle Espejo)
      ├── Nivel 3: [Fusión de cálculo mental rápido y operaciones escritas] (Mecánica: Fluidez, pequeña presión de tiempo)
      │
      ├── DESAFÍO 1: [Cadenas aritméticas directas de tres elementos] (Mecánica: El Filtro, >80% para continuar)
      ├── DESAFÍO 2: [Cambios bruscos de signos y operadores trampa] (Mecánica: La Trampa, distractores mixtos)
      └── DESAFÍO FINAL: [Examen integral de la Fase 1] (Mecánica: El Candado, requiere ≥90% para abrir Fase 2)


================================================================================
[FASE 2: DESARROLLO NUMÉRICO Y RAZONAMIENTO]
Propósito: Pasar del cálculo puramente mecánico al pensamiento numérico estructurado y abstracto.
================================================================================
 │
 ├── [MÓDULO 1: Gimnasio Numérico Mental] -> Tema: Escalas, relaciones distributivas y jerarquía.
 │    ├── Nivel 1: [Conceptos de doble, triple, mitad y cuádruple] (Mecánica: Visual, guiado, input numérico, sin tiempo)
 │    ├── Nivel 2: [Prioridad algebraica: orden de operaciones y uso de paréntesis] (Mecánica: Prioridad algebraica, sin tiempo)
 │    ├── Nivel 3: [Traducción del lenguaje verbal a expresiones numéricas abstractas] (Mecánica: Circuito mixto, activación de Bucle Espejo)
 │    │
 │    ├── DESAFÍO 1: [Operaciones lineales] (Mecánica: Opción múltiple, lineal, 45s/Q, Early Exit al 3er error)
 │    ├── DESAFÍO 2: [Jerarquía avanzada] (Mecánica: Opción múltiple, jerarquía avanzada, 60s/Q, Early Exit al 3er error)
 │    └── DESAFÍO FINAL: [Evocación pura] (Mecánica: Evocación pura, input vacío, 45s/Q, requiere ≥90%, Early Exit al 2do error)
 │
 ├── [MÓDULO 2: Tablas en Acción] -> Tema: Ecuaciones de un paso y operaciones inversas.
 │    ├── Nivel 1: [Operación Inversa - Suma y Resta] (Mecánica: Camino de regreso aditivo, sin tiempo)
 │    ├── Nivel 2: [Operación Inversa - Multiplicación y División] (Mecánica: Espejos multiplicativos, sin tiempo)
 │    ├── Nivel 3: [El Número Faltante] (Mecánica: Despeje del espacio vacío, ecuación de un paso, sin tiempo)
 │    ├── Nivel 4: [Gran Integración] (Mecánica: Cambio de velocidades operacionales, activación de Bucle Espejo)
 │    │
 │    ├── DESAFÍO 1: [Inversa directa] (Mecánica: Opción múltiple, inversa directa, 45s/Q, Early Exit al 3er error)
 │    ├── DESAFÍO 2: [Incógnitas complejas] (Mecánica: Opción múltiple, incógnitas complejas, 60s/Q, Early Exit al 3er error)
 │    └── DESAFÍO FINAL: [Evocación pura] (Mecánica: Evocación pura, input vacío, 45s/Q, requiere ≥90%, Early Exit al 2do error)
 │
 ├── [MÓDULO 3: Tienda Matemática] (Restricción monetaria estricta: ,00, ,25, ,50, ,75) -> Tema: Sistema monetario, presupuestos y decimales amigables.
 │    ├── Nivel 1: [Reconozco el Dinero] (Mecánica: Agrupación de centavos amigables, sin tiempo)
 │    ├── Nivel 2: [Pago y Cambio] (Mecánica: Cálculo intuitivo del vuelto desglosado, sin tiempo)
 │    ├── Nivel 3: [Carrito de Compras] (Mecánica: Sumas multiobjeto consolidando reales extra, sin tiempo)
 │    ├── Nivel 4: [Comprador Inteligente] (Mecánica: Decisión de presupuesto: alcanza o falta, activación de Bucle Espejo)
 │    │
 │    ├── DESAFÍO 1: [Conteo y vuelto simple] (Mecánica: Opción múltiple, conteo y vuelto simple, 45s/Q, Early Exit al 3er error)
 │    ├── DESAFÍO 2: [La Trampa Financiera] (Mecánica: Opción múltiple, carritos y balances cruzados, 60s/Q, Early Exit al 3er error)
 │    └── DESAFÍO FINAL: [Evocación pura decimal] (Mecánica: Evocación pura, input flotante vacío, 45s/Q, requiere ≥90%, Early Exit al 2do error)
 │
 └── [MÓDULO 4: Constructor de Soluciones] -> Tema: Encadenamiento y problemas multi-paso simples.
      ├── Nivel 1: [Problemas de Dos Pasos Guiados] (Mecánica: Diagrama de flujo guiado, sin tiempo)
      ├── Nivel 2: [Encadenamiento de Resultados] (Mecánica: Ecuaciones en cadena secuenciales, sin tiempo)
      ├── Nivel 3: [Minimización de Error de Arrastre] (Mecánica: Auto-verificación activa, activación de Bucle Espejo)
      │
      ├── DESAFÍO 1: [Problema estándar] (Mecánica: Opción múltiple, 45s/Q, Early Exit al 3er error)
      ├── DESAFÍO 2: [Trampa intermedia] (Mecánica: Opción múltiple, 60s/Q, Early Exit al 3er error)
      └── DESAFÍO FINAL: [Resolución libre] (Mecánica: Evocación pura, 45s/Q, requiere ≥90%, Early Exit al 2do error para desbloquear Fase 3)


================================================================================
[FASE 3: PROBLEMAS DE TEXTO Y SISTEMAS SIMPLES]
Propósito: Entrenar el formato de examen: leer, filtrar distractores narrativos, deducir sistemas lógicos y aplicar ciclos (MCM/MCD).
================================================================================
 │
 ├── [MÓDULO 1: El Detective Literario] -> Tema: Filtrado de datos basura, distractores y modelado del problema.
 │    ├── Nivel 1: [Aislamiento de Variables Críticas] (Mecánica: Resaltador lógico sobre textos densos, marcar solo lo operable)
 │    ├── Nivel 2: [Datos Útiles vs. Datos Basura] (Mecánica: Tachar información irrelevante, como fechas o edades que no afectan el cálculo)
 │    ├── Nivel 3: [Descarte por Incongruencia] (Mecánica: Identificar magnitudes que no se pueden mezclar, ej. sumar años con litros)
 │    │
 │    ├── DESAFÍO 1: [Extracción limpia de datos en textos cortos con tiempo] (Mecánica: El Filtro, >80% de aciertos)
 │    ├── DESAFÍO 2: [Enunciados largos llenos de números descriptivos trampa] (Mecánica: La Trampa, sobrecarga de información)
 │    └── DESAFÍO FINAL: [Traducción de historias complejas a un modelo matemático limpio] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 2: Secuencia Temporal] -> Tema: Cronología de eventos y análisis retrospectivo.
 │    ├── Nivel 1: [Operaciones aditivas acumulativas en riguroso orden cronológico] (Mecánica: Línea de tiempo interactiva, sin tiempo)
 │    ├── Nivel 2: [Álgebra retrospectiva: reconstrucción hacia atrás para hallar el inicio] (Mecánica: Algoritmo inverso guiado, Bucle Espejo)
 │    ├── Nivel 3: [Resolución de textos complejos con 3 o más mutaciones sucesivas] (Mecánica: Simulación secuencial, fluidez con tiempo)
 │    │
 │    ├── DESAFÍO 1: [Historias de cambio lineal con estructura temporal limpia] (Mecánica: El Filtro, >80% de aciertos)
 │    ├── DESAFÍO 2: [Textos con la cronología invertida o narrada de atrás hacia adelante] (Mecánica: La Trampa, distorsión temporal)
 │    └── DESAFÍO FINAL: [Ejercicios históricos oficiales tipo 'Figuritas de bafo'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 3: Deducción de Precios] -> Tema: Introducción intuitiva a sistemas de ecuaciones.
 │    ├── Nivel 1: [Deducción de valores unitarios por diferencia visual de grupos] (Mecánica: Comparación de carritos, sin tiempo)
 │    ├── Nivel 2: [Completado analítico de tablas matriciales cruzando datos parciales] (Mecánica: Grilla de doble entrada, Bucle Espejo)
 │    ├── Nivel 3: [Sistemas simples de dos variables combinando sustitución e intuición] (Mecánica: Álgebra visual, fluidez con tiempo)
 │    │
 │    ├── DESAFÍO 1: [Problemas de proporcionalidad directa de precios unitarios] (Mecánica: El Filtro, >80% de aciertos)
 │    ├── DESAFÍO 2: [Sistemas de ecuaciones implícitos estilo '4 libros and 2 cuadernos'] (Mecánica: La Trampa, variables cruzadas)
 │    └── DESAFÍO FINAL: [Evaluación analítica sin opciones de compra compartida] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 4: Reparto y Residuos] -> Tema: Algoritmo de la división, agrupamiento y patrones modulares.
 │    ├── Nivel 1: [Cálculo de repartos exactos y cuotabilización en inventarios macro] (Mecánica: Agrupación visual, sin tiempo)
 │    ├── Nivel 2: [Interpretación lógica del residuo: sobrantes y cajas incompletas] (Mecánica: Análisis de resto, Bucle Espejo)
 │    ├── Nivel 3: [Patrones modulares y congruencias cíclicas basadas en el resto] (Mecánica: Sucesión circular, fluidez con tiempo)
 │    │
 │    ├── DESAFÍO 1: [Problemas de distribución exacta con dividendos elevados] (Mecánica: El Filtro, >80% de aciertos)
 │    ├── DESAFÍO 2: [Enunciados trampa donde la pregunta exige analizar qué hacer con el resto] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Problemas integrales de empaquetado de estructura Pedro II] (Mecánica: El Candado, requiere ≥90%)
 │
 └── [MÓDULO 5: Ciclos y Agrupaciones Máximas] -> Tema: Múltiplos, divisores y aplicaciones narrativas (MCM y MCD).
      ├── Nivel 1: [Visualización de Saltos y Empaques] (Mecánica: Recta numérica interactiva y llenado de cajas exactas, sin tiempo)
      ├── Nivel 2: [Encuentros Periódicos - MCM] (Mecánica: Sincronización de eventos, ej. semáforos, planetas, salidas de autobuses)
      ├── Nivel 3: [División Máxima Exacta - MCD] (Mecánica: Corte de listones o armado de kits idénticos sin sobrantes, fluidez)
      │
      ├── DESAFÍO 1: [Cálculo directo de MCM/MCD aplicado a escenarios limpios] (Mecánica: El Filtro, >80% de aciertos)
      ├── DESAFÍO 2: [Textos ambiguos: deducir si la historia pide MCM o MCD a partir de pistas] (Mecánica: La Trampa)
      └── DESAFÍO FINAL: [Problemas oficiales Pedro II de sincronización temporal] (Mecánica: El Candado, requiere ≥90% para abrir Fase 4)


================================================================================
[FASE 4: FRACCIONES, PORCENTAJES Y PROPORCIONES]
Propósito: Romper el pensamiento del número entero; dominar relaciones relacionales complejas de forma visual y análisis estadístico.
================================================================================
 │
 ├── [MÓDULO 1: La Fracción Visual] -> Tema: Concepto parte-todo y fracciones equivalentes.
 │    ├── Nivel 1: [Lectura y modelado de numerador/denominador en polígonos simétricos] (Mecánica: Sombrear áreas, sin tiempo)
 │    ├── Nivel 2: [Construcción de equivalencias visuales mediante la subdivisión de redes] (Mecánica: División dinámica, Bucle Espejo)
 │    ├── Nivel 3: [Determinación de áreas fraccionarias en composiciones geométricas asimétricas] (Mecánica: Análisis geométrico, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Identificación directa de fracciones sobre figuras estándar con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Figuras divididas con trazos asimétricos o partes no equivalentes] (Mecánica: La Trampa, ilusión visual)
 │    └── DESAFÍO FINAL: [Problemas oficiales complejos de fracciones sobre rectángulos] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 2: Fracción de Cantidad] -> Tema: Operador fraccionario sobre conjuntos finitos naturales.
 │    ├── Nivel 1: [Cálculo de porciones unitarias simples (1/n) sobre grupos de objetos] (Mecánica: Selección de grupos, sin tiempo)
 │    ├── Nivel 2: [Operador compuesto (m/n de X) combinando multiplicación y división] (Mecánica: Algoritmo de dos pasos, Bucle Espejo)
 │    ├── Nivel 3: [Lógica del complemento fraccionario: deducir el resto a partir del gasto] (Mecánica: Deducción de remanentes, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Cálculo directo de fracciones compuestas sobre inventarios grandes] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Historias de encadenamiento fraccionario: calcular la fracción del resto] (Mecánica: La Trampa, texto complejo)
 │    └── DESAFÍO FINAL: [Problemas narrativos de distribución de estudiantes por fracciones] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 3: Porcentajes Rápidos y Promedios] -> Tema: Equivalencias porcentuales, análisis estadístico y media aritmética.
 │    ├── Nivel 1: [Mapeo de porcentajes intuitivos: 50% (1/2), 25% (1/4), 10% (1/10)] (Mecánica: Conexión de bloques, sin tiempo)
 │    ├── Nivel 2: [Lectura, análisis e interpretación directa de gráficos circulares (Pie Charts)] (Mecánica: Extracción visual, Bucle Espejo)
 │    ├── Nivel 3: [Comparación de tasas y crecimiento porcentual sobre gráficos de barras] (Mecánica: Lectura de métricas, fluidez)
 │    ├── Nivel 4: [El Punto de Equilibrio] -> Nivelación de datos para calcular la media aritmética a partir de gráficos de barras o tablas (Mecánica: Nivelador interactivo de barras, fluidez analítica)
 │    │
 │    ├── DESAFÍO 1: [Cálculo mental de porcentajes base y promedios simples sobre tablas de datos] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [La trampa inversa: el promedio se da como dato para hallar un valor faltante en el gráfico] (Mecánica: La Trampa, lógica inversa)
 │    └── DESAFÍO FINAL: [Problemas de examen que fusionan tablas estadísticas, cálculo de promedios y porcentajes] (Mecánica: El Candado, formato examen, ≥90%)
 │
 └── [MÓDULO 4: Razón y Mezclas] -> Tema: Escalas numéricas, razones geométricas y reparto proporcional.
      ├── Nivel 1: [Cálculo de razones simples (a:b) y proporcionalidad directa en recetas] (Mecánica: Multiplicadores visuales, sin tiempo)
      ├── Nivel 2: [Reparto proporcional de un volumen macro basándose en porciones relativas] (Mecánica: Distribución guiada, Bucle Espejo)
      ├── Nivel 3: [Homogeneización de mezclas complejas y cálculo de tasas unitarias fijas] (Mecánica: Simulación de fluidos, fluidez)
      │
      ├── DESAFÍO 1: [Escalado directo de proporciones en problemas narrativos cortos] (Mecánica: El Filtro, >80%)
      ├── DESAFÍO 2: [Cambio dinámico de la razón al alterar o añadir elementos a la mezcla] (Mecánica: La Trampa, lógica inversa)
      └── DESAFÍO FINAL: [Problemas oficiales de mezclas industriales de pintura estilo Pedro II] (Mecánica: El Candado, requiere ≥90% para abrir Fase 5)


================================================================================
[FASE 5: GEOMETRÍA PLANA Y MEDIDAS]
Propósito: Desarrollar la comprensión del espacio bidimensional mediante el análisis visual y la conservación de la superficie.
================================================================================
 │
 ├── [MÓDULO 1: Perímetro y Borde] -> Tema: Longitudes métricas lineales y conversiones en un plano.
 │    ├── Nivel 1: [Conteo directo de unidades lineales sobre bordes de cuadrículas] (Mecánica: Trazado interactivo, sin tiempo)
 │    ├── Nivel 2: [Cálculo analítico de perímetros sumando magnitudes de polígonos irregulares] (Mecánica: Suma de aristas, Bucle Espejo)
 │    ├── Nivel 3: [Conversión de unidades de longitud: mm, cm, dm, m, km] (Mecánica: Escala de conversión, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Determinación directa de perímetros en figuras acotadas con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Polígonos con longitudes internas ocultas deducibles por paralelismo] (Mecánica: La Trampa, geometría trampa)
 │    └── DESAFÍO FINAL: [Problemas integrales estilo 'Perímetro proyectado por láser iKeybo'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 2: Área en Malha] -> Tema: Superficie bidimensional e integración de grillas cuadradas.
 │    ├── Nivel 1: [Conteo analítico de unidades raíces enteras (u²) confinadas en una grilla] (Mecánica: Clic sobre celdas, sin tiempo)
 │    ├── Nivel 2: [Fusión de sectores triangulares (medios cuadrados) para consolidar unidades enteras] (Mecánica: Rompecabezas 2D, Bucle Espejo)
 │    ├── Nivel 3: [Estimación analítica y cálculo exacto de áreas irregulares sobre mallas densas] (Mecánica: Grilla de precisión, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Cálculo rápido de superficies mixtas sobre mallas estandarizadas] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Figuras con diagonales cruzadas complejas que alteran la percepción visual] (Mecánica: La Trampa, distorsión)
 │    └── DESAFÍO FINAL: [Problemas de examen tipo 'Área de la figura de la banderita junina'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 3: Figuras Compuestas y Simetría] -> Tema: Descomposición poligonal, áreas sombreadas y ejes de reflexión.
 │    ├── Nivel 1: [Descomposición estructural de polígonos en forma de T o L en rectángulos simples] (Mecánica: Corte dinámico, sin tiempo)
 │    ├── Nivel 2: [Análisis de conservación del área mediante la traslación de piezas del Tangram] (Mecánica: Arrastre y rotación, Bucle Espejo)
 │    ├── Nivel 3: [Cálculo analítico de áreas sombreadas mediante la resta: Área Mayor - Área Menor] (Mecánica: Resta geométrica, fluidez)
 │    ├── Nivel 4: [Identificación de Ejes de Simetría] (Mecánica: Plegado mental interactivo, determinar si una figura es simétrica y trazar sus ejes)
 │    │
 │    ├── DESAFÍO 1: [Suma aditiva de superficies y reconocimiento de ejes simétricos directos] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Composiciones complejas y figuras con falsos ejes de simetría] (Mecánica: La Trampa, ilusiones ópticas)
 │    └── DESAFÍO FINAL: [Problemas oficiales de área total y simetría geométrica en mosaicos] (Mecánica: El Candado, formato examen, ≥90%)
 │
 └── [MÓDULO 4: Conversión y Pantallas] -> Tema: Escalas cartográficas, diagonales y unidades de superficie.
      ├── Nivel 1: [Interpretación de la escala gráfica base: 1 unidad de malla = X metros reales] (Mecánica: Modulador de mapas, sin tiempo)
      ├── Nivel 2: [Modelado analítico de la diagonal como medida estándar en pantallas y televisores] (Mecánica: Trazo diagonal, Bucle Espejo)
      ├── Nivel 3: [Conversión de unidades de superficie bidimensionales: m² a cm² y dm²] (Mecánica: Matriz multiplicadora, fluidez con tiempo)
      │
      ├── DESAFÍO 1: [Cálculo de dimensiones reales de terrenos basándose en mapas a escala con tiempo] (Mecánica: El Filtro, >80%)
      ├── DESAFÍO 2: [La trampa conceptual clásica de confundir escala lineal con escala de superficie] (Mecánica: La Trampa)
      └── DESAFÍO FINAL: [Problemas reales tipo 'Cálculo de diagonal de TV de 42 pulgadas expresada en metros'] (Mecánica: El Candado, requiere ≥90% para abrir Fase 6)


================================================================================
[FASE 6: GEOMETRÍA ESPACIAL, VOLUMEN Y MAGNITUDES FÍSICAS]
Propósito: Desarrollar la visualización tridimensional, el razonamiento abstracto analítico y la medición de magnitudes.
================================================================================
 │
 ├── [MÓDULO 1: Reconocimiento 3D] -> Tema: Anatomía de cuerpos poliedros, revoluciones y planificaciones.
 │    ├── Nivel 1: [Identificación de poliedros: conteo de caras, aristas y vértices] (Mecánica: Rotación de sólidos SVG, sin tiempo)
 │    ├── Nivel 2: [Detección de bloques ocultos o estructuras de soporte invisibles por perspectiva] (Mecánica: Rayos X interactivos, Bucle Espejo)
 │    ├── Nivel 3: [Asociación bidimensional entre moldes desplegados (planificaciones) y sólidos 3D] (Mecánica: Plegado dinámico, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Reconocimiento visual directo de tipos de prismas y pirámides con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Planificaciones trampa con caras invertidas o patrones que no cierran el cubo] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Identificación analítica de caras adyacentes pintadas en un cubo armado] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 2: Patrones de Crecimiento] -> Tema: Sucesiones geométricas espaciales y leyes de formación.
 │    ├── Nivel 1: [Análisis de sucesiones geométricas tridimensionales con tasas de crecimiento lineal] (Mecánica: Constructor de bloques, sin tiempo)
 │    ├── Nivel 2: [Conteo volumétrico estratificado analizando la acumulación de bloques por capas] (Mecánica: Desglose por niveles, Bucle Espejo)
 │    ├── Nivel 3: [Generalización algebraica: deducción analítica de la cantidad de bloques para la etapa N] (Mecánica: Entrada de fórmulas, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Deducción directa de la cantidad de piezas de la etapa inmediatamente posterior] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Sucesiones espaciales con crecimiento cuadrático estilo 'Estructuras de árboles Minecraft'] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Cálculo analítico sin opciones de bloques necesarios para la Etapa 10 de un patrón] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 3: Cubos Unitarios] -> Tema: Volumen de cuerpos ortoédricos y capacidad de almacenamiento.
 │    ├── Nivel 1: [Modelado del concepto de volumen mediante la suma pura de unidades cúbicas independientes (u³)] (Mecánica: Apilado visual, sin tiempo)
 │    ├── Nivel 2: [Cálculo analítico formal en prismas rectangulares utilizando: Largo × Ancho × Alto] (Mecánica: Regulador dimensional, Bucle Espejo)
 │    ├── Nivel 3: [Relación intrínseca de conversión entre volumen cúbico y capacidad real de líquidos (Litros/mL)] (Mecánica: Llenado de recipientes, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Cálculo directo de volumen en bloques ortoédricos regulares con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Sólidos compuestos con vacíos interiores no visibles o rompecabezas cúbicos encajados] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Problemas tipo 'Consumo mensual de caixas promocionales de chocolate Prontinho'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 └── [MÓDULO 4: Medidas de Masa y Temperatura] -> Tema: Equivalencias de peso, variación térmica y cálculo algebraico básico.
      ├── Nivel 1: [Balanzas y Termómetros: lectura visual analógica de kg, g, y escalas Celsius] (Mecánica: Calibración interactiva, sin tiempo)
      ├── Nivel 2: [Variaciones térmicas lineales en Celsius: sumas/restas de intervalos e introducción al signo negativo] (Mecánica: Control térmico, Bucle Espejo)
      ├── Nivel 3: [La Máquina Kelvin: traducción y despeje lógico algebraico aplicando de forma estricta la regla ±273] (Mecánica: Entrada de fórmulas, fluidez)
      │
      ├── DESAFÍO 1: [Determinación del equilibrio en balanzas de platillos con diferentes unidades (kg y g)] (Mecánica: El Filtro, >80%)
      ├── DESAFÍO 2: [Problemas de temperatura que obligan a cruzar el cero térmico hacia el rango negativo o conversiones de Kelvin a Celsius] (Mecánica: La Trampa)
      └── DESAFÍO FINAL: [Problemas integrales complejos de examen vinculando masa, capacidad y temperatura] (Mecánica: El Candado, requiere ≥90% para abrir Fase 7)


================================================================================
[FASE 7: COORDENADAS, RUTAS Y TIEMPO]
Propósito: Dominar la orientación en un plano de referencia, la vectorización del movimiento y la aritmética del tiempo.
================================================================================
 │
 ├── [MÓDULO 1: Orientación Cardinal y Ángulos] -> Tema: Vectores de dirección absoluta, ángulos de giro y navegación espacial.
 │    ├── Nivel 1: [Uso de Puntos Cardinales y Ángulos: Giros de 90° (rectos) y 180° (llanos)] (Mecánica: Brújula interactiva, orientación basada en comandos angulares, sin tiempo)
 │    ├── Nivel 2: [Traducción sistemática de instrucciones verbales extensas a trayectos vectoriales exactos] (Mecánica: Trazador de rutas, Bucle Espejo)
 │    ├── Nivel 3: [Análisis y detección de trayectorias críticas, distancias óptimas o bloqueos en grillas urbanas] (Mecánica: Simulador vial, fluidez con tiempo)
 │    │
 │    ├── DESAFÍO 1: [Seguimiento secuencial combinando comandos cardinales y giros angulares limpios con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Identificación de la única ruta imposible o falsa dentro de una lista de alternativas descriptivas] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Problemas de examen tipo 'El trayecto óptimo de Ana pasando obligatoriamente por la padaria'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 2: Plano Cartesiano] -> Tema: Sistemas de coordenadas ortogonales y traslación bidimensional.
 │    ├── Nivel 1: [Lectura, decodificación y ubicación de pares ordenados (X, Y) en el primer cuadrante] (Mecánica: Marcado de puntos, sin tiempo)
 │    ├── Nivel 2: [Traslación de figuras en el plano sumando o restando magnitudes directamente a las coordenadas] (Mecánica: Desplazamiento dinámico, Bucle Espejo)
 │    ├── Nivel 3: [Cálculo analítico de la Distancia Manhattan (métrica de cuadras recorridas en una grilla)] (Mecánica: Conteo vectorial, fluidez con tiempo)
 │    │
 │    ├── DESAFÍO 1: [Identificación de coordenadas exactas asociadas a puntos clave en un mapa con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Comandos encadenados con coordenadas invertidas intencionalmente (Y, X) o ejes modificados] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Ejercicios tipo 'Desplazamiento vectorial continuo del punto B al punto C en grilla de 10x10'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 ├── [MÓDULO 3: La Mecánica del Tiempo] -> Tema: Operaciones en el sistema sexagesimal y cálculo de intervalos.
 │    ├── Nivel 1: [Lectura analógica y digital del reloj con conversiones lineales de unidades (horas, min, seg)] (Mecánica: Sincronización de manecillas, sin tiempo)
 │    ├── Nivel 2: [Cálculo exacto de la duración de eventos cruzando fronteras temporales AM/PM y husos de 24h] (Mecánica: Cronómetro de intervalos, Bucle Espejo)
 │    ├── Nivel 3: [Aritmética sexagesimal avanzada: adición y sustracción agrupando minutos y horas de forma independiente] (Mecánica: Calculadora sexagesimal, fluidez)
 │    │
 │    ├── DESAFÍO 1: [Cálculo directo del tiempo total de duración de una actividad escolar con tiempo] (Mecánica: El Filtro, >80%)
 │    ├── DESAFÍO 2: [Problemas de cálculo retrospectivo: determinar la hora exacta de inicio a partir de la llegada] (Mecánica: La Trampa)
 │    └── DESAFÍO FINAL: [Problemas oficiales complejos basados en la estructura 'Ahorro diario en cofrinho para comprar juguete'] (Mecánica: El Candado, formato examen, ≥90%)
 │
 └── [MÓDULO 4: Horarios y Apps] -> Tema: Análisis de matrices de doble entrada y optimización de recursos.
      ├── Nivel 1: [Lectura e interpretación de datos cruzados en tablas de horarios de transporte público] (Mecánica: Selector matricial, sin tiempo)
      ├── Nivel 2: [Cálculo de tiempos compuestos sumando duraciones de viaje, intervalos de espera y transbordos] (Mecánica: Planificador de viajes, Bucle Espejo)
      ├── Nivel 3: [Optimización algorítmica: comparar opciones de transporte simultáneas para seleccionar la llegada más temprana] (Mecánica: Toma de decisiones, fluidez)
      │
      ├── DESAFÍO 1: [Extracción directa de la hora de salida idónea de una tabla de transporte con tiempo] (Mecánica: El Filtro, >80%)
      ├── DESAFÍO 2: [Tablas con desfases horarios ocultos o condiciones restrictivas no explícitas en el texto principal] (Mecánica: La Trampa)
      └── DESAFÍO FINAL: [Ejercicios oficiales con formato analítico idéntico a la pregunta de movilidad urbana 'Moovit'] (Mecánica: El Candado, requiere ≥90% para abrir Fase 8)

 