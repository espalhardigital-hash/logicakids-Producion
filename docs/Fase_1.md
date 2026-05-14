# Documento de reglas para generación y carga de preguntas — Fase 1 LogicaKids

## 1. Propósito del documento

Este documento define cómo deben generarse, almacenarse y presentar las preguntas de la **Fase 1 de LogicaKids**.

La Fase 1 tiene como objetivo principal desarrollar en el niño:

1. **Seguridad numérica**.
2. **Cálculo mental**.
3. **Comprensión del sistema monetario**.
4. **Lectura matemática de problemas**.
5. **Capacidad para elegir operaciones y resolver paso a paso**.

Para lograr estos objetivos, no todas las preguntas deben crearse de la misma forma. Algunos módulos funcionan mejor con **generación aleatoria controlada**, otros necesitan una **base de datos de preguntas preparadas**, y en algunos casos se recomienda usar **plantillas dinámicas**.

---

# 2. Regla general de generación de preguntas

La Fase 1 debe usar un modelo híbrido:

```text
Módulos 1, 2 y 3:
usar generación aleatoria controlada.

Módulos 4 y 5:
usar base de datos de preguntas preparadas.

En algunos casos:
usar plantillas dinámicas.
```

Esta decisión permite equilibrar tres necesidades:

```text
1. Tener muchas preguntas diferentes.
2. Mantener control pedagógico.
3. Evitar que el niño memorice respuestas.
```

---

# 3. Definición de cada método

## 3.1. Generación aleatoria controlada

La **generación aleatoria controlada** significa que el sistema crea preguntas automáticamente, pero siguiendo reglas pedagógicas claras.

No se debe generar cualquier número al azar.

El generador debe respetar:

```text
- módulo;
- nivel;
- tipo de operación;
- rango numérico permitido;
- dificultad;
- formato de respuesta;
- resultado válido;
- explicación paso a paso;
- reglas especiales del nivel.
```

Ejemplo:

```text
Módulo 3 — Tienda Matemática
Nivel 3 — Carrito de Compras

Regla:
Generar sumas de dinero usando valores terminados en ,00, ,25, ,50 y ,75.

Pregunta generada:
Un pan cuesta R$ 1,75.
Un jugo cuesta R$ 2,50.
¿Cuánto cuestan juntos?

Respuesta:
R$ 4,25
```

---

## 3.2. Base de datos de preguntas preparadas

La **base de datos de preguntas preparadas** significa que las preguntas son creadas, revisadas y guardadas previamente por el equipo pedagógico o administrativo.

Este método debe usarse cuando la pregunta depende mucho del lenguaje, del contexto, de la lectura y del orden lógico.

Cada pregunta debe estar completa y contener:

```text
- enunciado;
- datos importantes;
- datos distractores;
- pregunta principal;
- operación correcta;
- pasos esperados;
- respuesta correcta;
- explicación;
- tipo de error posible;
- módulo;
- nivel;
- dificultad.
```

Ejemplo:

```text
Enunciado:
Carlos tenía R$ 50,00.
Compró un libro por R$ 18,00 y un lápiz por R$ 4,00.
Después recibió R$ 10,00 de su madre.
¿Cuánto dinero tiene ahora?

Datos importantes:
R$ 50,00
R$ 18,00
R$ 4,00
R$ 10,00

Pregunta principal:
¿Cuánto dinero tiene ahora?

Operaciones esperadas:
suma, resta, suma

Solución:
18 + 4 = 22
50 - 22 = 28
28 + 10 = 38

Respuesta:
Carlos tiene ahora R$ 38,00.
```

---

## 3.3. Plantillas dinámicas

Las **plantillas dinámicas** son un punto intermedio entre preguntas aleatorias y preguntas manuales.

El equipo crea una estructura fija de problema, y el sistema cambia nombres, productos, cantidades y valores siguiendo reglas controladas.

Ejemplo de plantilla:

```text
{nombre} tenía R$ {dinero_inicial}.
Compró {producto} por R$ {precio}.
¿Cuánto dinero le sobró?
```

Ejemplo generado:

```text
Ana tenía R$ 10,00.
Compró un jugo por R$ 2,50.
¿Cuánto dinero le sobró?
```

La plantilla permite variar la pregunta sin perder control pedagógico.

---

# 4. Reglas por módulo

## Módulo 1 — Gimnasio Numérico Mental

### Método principal

```text
Generación aleatoria controlada.
```

### Motivo

Este módulo trabaja cálculo mental, sumas, restas, completar números, dobles, mitades y operaciones combinadas. Son ejercicios numéricos que pueden generarse con reglas claras.

### Tipos de preguntas generadas

```text
- sumas simples;
- restas simples;
- completar hasta 50 o 100;
- dobles;
- mitades;
- operaciones combinadas;
- ejercicios con resultado entero;
- ejercicios de cálculo mental.
```

### Reglas generales

```text
- Los números deben estar dentro del rango permitido para cada nivel.
- Las respuestas deben ser adecuadas para cálculo mental.
- El resultado no debe ser negativo, salvo que el nivel lo permita explícitamente.
- Las preguntas deben tener explicación paso a paso.
- No se deben generar ejercicios demasiado largos.
```

### Regla especial del Nivel 4

El **Módulo 1, Nivel 4 — Combo Mental Maestro** debe generar ejercicios que combinen siempre **3 operaciones**.

Las operaciones posibles son:

```text
suma
resta
multiplicación
división
```

Cada ejercicio debe usar exactamente **3 operaciones combinadas**.

Ejemplo:

```text
36 ÷ 6 + 8 × 2 = ?
```

Explicación:

```text
Primero resolvemos división y multiplicación:
36 ÷ 6 = 6
8 × 2 = 16

Luego sumamos:
6 + 16 = 22

Respuesta: 22
```

---

## Módulo 2 — Tablas en Acción

### Método principal

```text
Generación aleatoria controlada.
```

### Motivo

Este módulo trabaja tablas de multiplicar, grupos iguales y operaciones inversas. Es ideal para generación automática porque se pueden controlar fácilmente las tablas, factores y resultados.

### Tipos de preguntas generadas

```text
- multiplicaciones directas;
- completar multiplicaciones;
- divisiones relacionadas con tablas;
- operaciones inversas;
- problemas simples de grupos;
- relación entre multiplicación y división.
```

### Reglas generales

```text
- Usar solo las tablas permitidas según el nivel.
- Mantener resultados enteros.
- Evitar números fuera del nivel del alumno.
- Incluir explicación cuando el niño se equivoque.
- Relacionar multiplicación con división en los niveles avanzados.
```

Ejemplo:

```text
Si 8 × 7 = 56, entonces 56 ÷ 8 = ?
```

Respuesta:

```text
7
```

---

## Módulo 3 — Tienda Matemática

### Método principal

```text
Generación aleatoria controlada.
```

### Método secundario

```text
Plantillas dinámicas.
```

### Motivo

Este módulo trabaja sistema monetario, suma de precios, cambio, comparación y dinero suficiente. Muchas preguntas pueden generarse automáticamente, pero los problemas con contexto de compra pueden beneficiarse de plantillas dinámicas.

### Tipos de preguntas generadas

```text
- sumar valores de dinero;
- restar valores de dinero;
- calcular cambio;
- completar R$ 1,00;
- completar R$ 5,00;
- completar R$ 10,00;
- decidir si el dinero alcanza;
- comparar precios.
```

### Regla para valores decimales

El sistema debe usar valores monetarios controlados.

Terminaciones permitidas:

```text
,00
,25
,50
,75
```

Ejemplos permitidos:

```text
R$ 0,25
R$ 0,50
R$ 0,75
R$ 1,00
R$ 1,25
R$ 1,50
R$ 1,75
R$ 2,50
R$ 3,75
R$ 5,00
R$ 10,00
```

Ejemplos de preguntas:

```text
R$ 1,75 + R$ 2,50 = ?
```

```text
R$ 0,75 + ___ = R$ 1,00
```

```text
R$ 10,00 - R$ 4,25 = ?
```

### Uso de plantillas dinámicas en Módulo 3

Las plantillas se deben usar para dar contexto real a las operaciones monetarias.

Ejemplo de plantilla:

```text
{nombre} compró {producto_1} por R$ {precio_1}
y {producto_2} por R$ {precio_2}.
¿Cuánto gastó en total?
```

Ejemplo generado:

```text
Lucas compró un pan por R$ 1,75
y un jugo por R$ 2,50.
¿Cuánto gastó en total?
```

Respuesta:

```text
R$ 4,25
```

---

# 5. Módulos con base de datos de preguntas preparadas

## Módulo 4 — Detective de Problemas

### Método principal

```text
Base de datos de preguntas preparadas.
```

### Método secundario

```text
Plantillas dinámicas cuidadosamente controladas.
```

### Motivo

Este módulo enseña al niño a leer matemáticamente. Por eso, las preguntas deben tener un lenguaje claro, datos importantes, posibles distractores y una pregunta principal bien definida.

Aquí no conviene depender solamente de generación aleatoria, porque el objetivo no es solo calcular. El objetivo es comprender el enunciado.

### Cada pregunta debe incluir

```text
- enunciado completo;
- datos importantes;
- datos distractores;
- pregunta principal;
- operación correcta;
- respuesta correcta;
- explicación pedagógica;
- opciones para marcar;
- tipo de error esperado.
```

### Ejemplo de pregunta preparada

```text
Enunciado:
María tenía 35 figuritas y ganó 18 de su amiga.
¿Cuántas figuritas tiene ahora?

Datos importantes:
35 figuritas
18 figuritas

Datos distractores:
María
amiga
ahora

Pregunta principal:
¿Cuántas figuritas tiene ahora?

Operación correcta:
suma

Cálculo:
35 + 18 = 53

Respuesta completa:
María tiene ahora 53 figuritas.
```

---

## Módulo 5 — Constructor de Soluciones

### Método principal

```text
Base de datos de preguntas preparadas.
```

### Método secundario

```text
Plantillas dinámicas cuidadosamente controladas.
```

### Motivo

Este módulo trabaja problemas de dos o más pasos. Por eso, cada problema debe estar muy bien diseñado.

El sistema necesita saber:

```text
- qué operación va primero;
- qué operación va después;
- qué representa cada resultado;
- cuál es la respuesta final;
- qué errores de secuencia puede cometer el niño.
```

Estos elementos son difíciles de controlar si todo se genera de forma completamente aleatoria.

### Cada pregunta debe incluir

```text
- enunciado;
- datos importantes;
- pregunta principal;
- cantidad de pasos;
- primera operación esperada;
- segunda operación esperada;
- tercera operación, si existe;
- respuesta final;
- explicación paso a paso;
- distractores;
- opciones incorrectas posibles;
- tipo de error esperado.
```

### Ejemplo de pregunta preparada

```text
Enunciado:
Carlos tenía R$ 50,00.
Compró un libro por R$ 18,00 y un lápiz por R$ 4,00.
Después recibió R$ 10,00 de su madre.
¿Cuánto dinero tiene ahora?

Datos importantes:
R$ 50,00
R$ 18,00
R$ 4,00
R$ 10,00

Pregunta principal:
¿Cuánto dinero tiene ahora?

Pasos esperados:
1. Sumar los gastos:
18 + 4 = 22

2. Restar los gastos al dinero inicial:
50 - 22 = 28

3. Sumar el dinero recibido:
28 + 10 = 38

Respuesta final:
Carlos tiene ahora R$ 38,00.
```

---

# 6. Cuándo usar plantillas dinámicas

Las plantillas dinámicas se deben usar cuando se necesita variar la pregunta, pero mantener una estructura pedagógica segura.

Son recomendadas para:

```text
- problemas simples de dinero;
- problemas de compra y cambio;
- problemas de suma o resta con contexto;
- problemas de grupos iguales;
- problemas de dos pasos con estructura fija.
```

No se deben usar sin reglas. Cada plantilla debe tener validaciones.

---

## Ejemplo de plantilla dinámica completa

```json
{
  "tipo": "cambio_simple",
  "modulo": 3,
  "nivel": 2,
  "plantilla": "{nombre} tenía R$ {dinero_inicial}. Compró {producto} por R$ {precio}. ¿Cuánto dinero le sobró?",
  "variables": {
    "nombre": ["Ana", "Bruno", "Carlos", "María"],
    "producto": ["un jugo", "un pan", "una goma", "un lápiz"],
    "dinero_inicial": [5.00, 10.00, 20.00],
    "precio": [1.50, 2.50, 3.00, 4.50, 7.50]
  },
  "reglas": [
    "precio < dinero_inicial",
    "resultado >= 0",
    "resultado debe terminar en ,00 o ,50"
  ],
  "datos_importantes": ["dinero_inicial", "precio"],
  "pregunta_principal": "¿Cuánto dinero le sobró?",
  "operacion_correcta": "resta",
  "expresion": "dinero_inicial - precio",
  "respuesta_correcta": "dinero_inicial - precio"
}
```

---

# 7. Reglas obligatorias para cualquier pregunta

Toda pregunta, sea generada aleatoriamente, cargada en base de datos o creada por plantilla, debe contener como mínimo:

```text
- módulo;
- nivel;
- tipo de actividad;
- enunciado o expresión;
- respuesta correcta;
- explicación;
- dificultad;
- habilidad evaluada.
```

En preguntas de lectura matemática también debe contener:

```text
- datos importantes;
- datos distractores;
- pregunta principal;
- operación correcta;
- pasos de solución;
- respuesta textual.
```

---

# 8. Criterio de aprobación

Para los **Módulos 1, 2 y 3**:

```text
Cada nivel tendrá máximo 40 preguntas.
El alumno debe aprobar con 90%.
Debe responder correctamente al menos 36 de 40 preguntas.
```

Para los **Módulos 4 y 5**, además del resultado final, el sistema debe evaluar el proceso:

```text
- si marcó los datos importantes;
- si identificó la pregunta principal;
- si eligió la operación correcta;
- si ordenó bien los pasos;
- si respondió correctamente;
- si necesitó ayuda.
```

---

# 9. Recomendación final para implementación

La implementación ideal de preguntas para la Fase 1 debe seguir esta arquitectura:

```text
1. Generador aleatorio controlado
   Para Módulos 1, 2 y 3.

2. Banco de preguntas preparadas
   Para Módulos 4 y 5.

3. Motor de plantillas dinámicas
   Para crear variaciones controladas en problemas de dinero, grupos y situaciones simples.
```

---

# 10. Instrucción para una inteligencia artificial

Cuando una inteligencia artificial genere preguntas para la Fase 1, debe seguir estas reglas:

```text
No generar preguntas sin conocer el módulo y el nivel.

Si el módulo es 1, 2 o 3:
    usar generación aleatoria controlada.
    respetar rangos numéricos.
    respetar reglas del nivel.
    generar respuesta correcta.
    generar explicación paso a paso.

Si el módulo es 4 o 5:
    crear o usar preguntas preparadas.
    incluir enunciado claro.
    incluir datos importantes.
    incluir datos distractores.
    incluir pregunta principal.
    incluir operación correcta.
    incluir solución paso a paso.
    incluir respuesta textual.

Si se usa una plantilla dinámica:
    mantener estructura pedagógica fija.
    variar solo los datos permitidos.
    validar que el resultado sea correcto.
    validar que la dificultad corresponda al nivel.
```

---

# 11. Resumen ejecutivo

La Fase 1 debe usar un modelo híbrido de preguntas.

Los **Módulos 1, 2 y 3** deben usar **generación aleatoria controlada**, porque trabajan cálculo mental, tablas y sistema monetario. Estos módulos necesitan mucha repetición, variedad y adaptación automática.

Los **Módulos 4 y 5** deben usar principalmente **base de datos de preguntas preparadas**, porque trabajan lectura matemática, identificación de datos, elección de operación y resolución de problemas de varios pasos. En estos módulos es más importante la calidad pedagógica que la cantidad aleatoria.

Las **plantillas dinámicas** deben usarse como apoyo para crear muchas variaciones sin perder control. Son especialmente útiles en problemas de dinero, compras, cambio, grupos iguales y problemas simples de uno o dos pasos.

Esta estructura permite que LogicaKids tenga una Fase 1 escalable, segura, variada y pedagógicamente controlada.

---

# 12. Modelo de Datos (Base de Datos)

Para implementar la Fase 1, se requiere una arquitectura de base de datos relacional (PostgreSQL) que soporte el seguimiento detallado del alumno y el banco de preguntas.

### 12.1. Tabla: Fases
Define las etapas del plan de estudio.
- `id`: Identificador único.
- `nombre`: "Fase 1 - Fundamentos y Razonamiento".
- `orden`: Posición en la secuencia global.

### 12.2. Tabla: Preguntas (Banco de Ejercicios)
El corazón de la Fase 1. Soporta generación híbrida.
- `id`: ID único.
- `fase_id`: Relación con Fase 1.
- `modulo`: (1 a 5) Según la definición pedagógica.
- `nivel`: Nivel de dificultad dentro del módulo.
- `tipo_pregunta`: `calculo_directo`, `problema_contexto`, `plantilla_dinamica`.
- `enunciado`: El texto o expresión matemática.
- `datos_numericos (JSONB)`: Para plantillas dinámicas (ej: `{"a": 10, "b": 5}`).
- `respuesta_correcta`: Valor esperado.
- `explicacion_paso_a_paso (JSONB)`: Estructura para la Tutoría Invisible.
- `errores_previstos (JSONB)`: Mapeo de respuestas comunes a tipos de error.

### 12.3. Tabla: Alternativas
Solo para preguntas de opción múltiple.
- `pregunta_id`: Relación.
- `texto`: La opción.
- `es_correcta`: Booleano.
- `tipo_error`: (Cálculo, Lectura, Atención) Para feedback inmediato.

### 12.4. Tabla: Progreso de Maestría
Rastrea el avance del alumno en cada bloque (Módulo + Nivel).
- `alumno_id`: Relación.
- `modulo`: ID del módulo.
- `nivel`: ID del nivel.
- `aciertos_acumulados`: Contador de éxitos.
- `intentos_totales`: Para calcular la tasa de precisión.
- `estado`: `bloqueado`, `en_progreso`, `aprobado`.

### 12.5. Tabla: Intentos (Analítica Detallada)
Registra cada respuesta para generar reportes pedagógicos.
- `pregunta_id`, `alumno_id`.
- `respuesta_dada`: Lo que escribió/marcó el alumno.
- `es_correcta`: Resultado.
- `tipo_error_detectado`: Basado en el mapeo de `errores_previstos`.
- `tiempo_respuesta`: En segundos.

---

# 13. Esquemas de Datos Estructurados (JSONB)

La "Tutoría Invisible" depende de que la información esté estructurada para que el frontend pueda presentarla paso a paso.

### 13.1. Esquema de Explicación Paso a Paso
```json
{
  "titulo": "Resolvamos paso a paso",
  "pasos": [
    {
      "orden": 1,
      "instruccion": "Identifica los datos iniciales",
      "detalle": "Carlos tiene R$ 50,00."
    },
    {
      "orden": 2,
      "instruccion": "Suma los gastos realizados",
      "operacion": "18 + 4 = 22",
      "detalle": "Gastó R$ 22,00 en total."
    },
    {
      "orden": 3,
      "instruccion": "Resta los gastos al total inicial",
      "operacion": "50 - 22 = 28",
      "detalle": "Le quedan R$ 28,00."
    }
  ]
}
```

### 13.2. Esquema de Errores Previstos
```json
{
  "mapeo": [
    {
      "respuesta": "22",
      "tipo_error": "problema_incompleto",
      "feedback": "Calculaste bien los gastos, pero falta restarlos del dinero inicial."
    },
    {
      "respuesta": "68",
      "tipo_error": "operacion_incorrecta",
      "feedback": "Parece que sumaste todos los valores en lugar de restar los gastos."
    }
  ]
}
```

---

---

# 15. Hoja de Ruta de Implementación Detallada (Paso a Paso)

Para garantizar la estabilidad del sistema, la implementación se dividirá en una **Fase Base (Estructura General)** y luego se avanzará **Módulo por Módulo**. Cada módulo debe ser programado, probado y validado antes de pasar al siguiente.

## ETAPA 1: Estructura Base y Lógica General (El Motor)

Antes de programar preguntas específicas, necesitamos que el sistema central pueda gestionarlas.

### Backend (Base)
- [ ] **Migraciones Finales**: Asegurar que las tablas `Preguntas`, `Alternativas`, `ProgresoMaestria`, e `Intentos` estén operativas en PostgreSQL.
- [ ] **Servicio de Fases y Módulos**: Crear los endpoints `GET /fases/1/modulos` para devolver la estructura del mapa.
- [ ] **Gestor de Progreso (Guardado)**: Crear el endpoint `POST /intentos` que recibe las respuestas del niño y calcula el "acierto/error" actualizando `ProgresoMaestria`.
- [ ] **Despachador de Preguntas (Router)**: Endpoint `GET /preguntas/next?modulo=X&nivel=Y`. Este endpoint decidirá internamente si debe usar el *Generador Aleatorio*, cargar de la *Base de Datos* o instanciar una *Plantilla Dinámica*.

### Frontend (Base)
- [ ] **Navegación de Fase 1**: Interfaz del mapa principal donde el niño ve los 5 Módulos. Los módulos 2, 3, 4 y 5 deben estar bloqueados si no ha superado el anterior.
- [ ] **Motor de UI Híbrido (`GameScreenFase1.tsx`)**: Un componente base capaz de renderizar:
  - Preguntas de texto simple (Generador Aleatorio).
  - Preguntas con alternativas (Base de Datos).
  - Preguntas de completar espacios.
- [ ] **Componente de Tutoría Invisible**: UI flotante o panel lateral que reciba el JSON de `errores_previstos` y `explicacion_paso_a_paso` para mostrar los mensajes dinámicos sin salir de la pantalla de juego.
- [ ] **Panel Admin (Gestión Base)**: Formularios básicos en React para que los profesores puedan cargar Preguntas y Alternativas en la base de datos.

---

## ETAPA 2: Implementación Módulo a Módulo

Una vez que el Motor Base funciona, pasamos a implementar la lógica pedagógica específica de cada módulo.

### Módulo 1 — Gimnasio Numérico Mental
*Objetivo: Cálculo rápido y operaciones combinadas.*
* **Backend**:
  - Implementar el algoritmo de **Generación Aleatoria Controlada** para sumas, restas y dobles.
  - Implementar el generador de Nivel 4 (3 operaciones combinadas respetando prioridad matemática).
* **Frontend**:
  - Crear el renderizador de "Tarjetas Flash" (grandes números, ingreso numérico rápido por teclado o botones en pantalla).
  - Implementar cronómetro visual estricto para este módulo.
* **Testing y Validación**: Jugar los 4 niveles completos. Validar que nunca salgan números negativos (salvo regla explícita) y que el sistema pase al Módulo 2 al lograr 90% de precisión.

### Módulo 2 — Tablas en Acción
*Objetivo: Multiplicación, división y relación inversa.*
* **Backend**:
  - Algoritmo de generación para familias de operaciones (ej. si genera `3x4=12`, luego preguntar `12/3=?`).
* **Frontend**:
  - Representación visual opcional de "Grupos Iguales" (ej. mostrar matrices de puntitos para niveles iniciales).
  - Componente de teclado numérico que soporte el símbolo de división "÷" visualmente claro.
* **Testing y Validación**: Comprobar que solo aparezcan las tablas permitidas por el nivel.

### Módulo 3 — Tienda Matemática
*Objetivo: Sistema Monetario.*
* **Backend**:
  - Implementar el generador con **Plantillas Dinámicas** (`{"producto": "pan", "precio": 1.50}`).
  - Asegurar la lógica de terminaciones decimales permitidas (`,00`, `,25`, `,50`, `,75`).
* **Frontend**:
  - Crear componentes visuales de "Monedas y Billetes" (opcional pero recomendado) o formato de etiquetas de precio (`R$ 0,00`).
  - Inputs que formateen automáticamente a 2 decimales para evitar errores de tipeo.
* **Testing y Validación**: Verificar que las operaciones con decimales flotantes no generen errores de precisión (ej. `0.1 + 0.2 = 0.300000004` en JavaScript debe corregirse en el generador).

### Módulo 4 — Detective de Problemas
*Objetivo: Lectura Matemática.*
* **Backend**:
  - Conectar el despachador de preguntas con la **Base de Datos** (ya no es generador aleatorio).
  - Enviar el JSON de `errores_previstos`.
* **Frontend**:
  - Implementar la herramienta de **"Subrayador"**. El niño debe poder hacer clic en el texto del enunciado para marcar los "Datos Importantes".
  - Renderizar botones de "Operación a Elegir" (Suma, Resta, Multiplicación, División) antes de pedir el resultado.
* **Testing y Validación**: Validar que la Tutoría Invisible se dispare correctamente al elegir la operación equivocada.

### Módulo 5 — Constructor de Soluciones
*Objetivo: Problemas de múltiples pasos.*
* **Backend**:
  - Algoritmo de validación por pasos (evaluar si el Paso 1 es correcto antes de permitir el Paso 2).
  - Despachar el JSON estructurado `explicacion_paso_a_paso`.
* **Frontend**:
  - Implementar la UI de "Flujo de Pasos" (Cajas conectadas por flechas donde el resultado de la Caja 1 alimenta a la Caja 2).
  - Al fallar 2 veces, desbloquear la interfaz de Tutoría Activa que bloquea el avance hasta leer la explicación.
* **Testing y Validación**: Cargar 5 problemas complejos en la base de datos y simular todos los caminos de error posibles.

---

# 16. Conclusión Estratégica y Siguientes Pasos

La división por módulos garantiza que nunca rompamos el sistema principal. El flujo de trabajo recomendado para nuestro equipo será:

1. **Yo (IA)** programo el Backend Base y el Frontend Base. Lo revisamos juntos.
2. Pasamos al **Módulo 1**. Desarrollamos generadores y UI. Tú lo pruebas en tu navegador.
3. Si el Módulo 1 aprueba, lo damos por cerrado (Endpoint/Commit Seguro).
4. Avanzamos al Módulo 2 y repetimos el ciclo.

Esta metodología "Agile" por Módulos asegura implementaciones precisas, testadas y puestas a prueba de balas antes de avanzar, manteniendo siempre la base de datos íntegra.
