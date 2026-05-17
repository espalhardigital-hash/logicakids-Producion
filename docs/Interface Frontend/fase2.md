# Documento de Reglas para Generación y Carga de Preguntas — Fase 2 LogicaKids - Versión 3.0 (Certificada)

## 1. Propósito del Documento

Este documento define las directrices y reglas técnicas para la generación, almacenamiento y presentación de preguntas de la **Fase 2 de LogicaKids Pro** ("Desarrollo Numérico y Razonamiento").

La Fase 2 tiene como objetivo principal desarrollar en el alumno:
1. **Seguridad numérica**.
2. **Cálculo mental avanzado**.
3. **Comprensión del sistema monetario brasileño (R$)**.
4. **Lectura e interpretación matemática de problemas**.
5. **Capacidad para elegir operaciones y resolver paso a paso**.

Para lograr estos objetivos, el sistema emplea una **arquitectura de generación híbrida con autoridad en el servidor (Server-Authoritative)**. Módulos matemáticos estructurados y de cálculo mental rápido hacen uso de **generación aleatoria controlada en base a reglas en el backend**, mientras que los módulos lógicos y de comprensión lectora compleja consumen un **banco de preguntas y plantillas dinámicas preparadas en la base de datos PostgreSQL**.

---

## 2. Regla General de Generación de Preguntas

La Fase 2 utiliza un modelo híbrido controlado íntegramente por el backend FastAPI:

```text
Módulos 1, 2 y 3:
Usar generación aleatoria controlada en el servidor.

Módulos 4 y 5:
Usar base de datos de preguntas preparadas en PostgreSQL.

En ciertos niveles:
Usar motor de plantillas dinámicas (JSONB en BD).
```

Esta separación equilibra tres necesidades fundamentales:
1. **Infinidad de ejercicios** para cálculo rápido.
2. **Control pedagógico estricto** en problemas de texto.
3. **Evitar memorización** de respuestas mediante variaciones controladas.

---

## 3. Definición de Métodos

### 3.1. Generación Aleatoria Controlada
El servidor de FastAPI crea preguntas automáticamente en tiempo real basándose en la configuración del nivel, aplicando rangos numéricos controlados y restricciones matemáticas:

* **Módulo 3 — Tienda Matemática (Nivel 3 - Carrito de Compras)**:
  - *Regla*: Generar sumas de valores decimales que representen dinero, restringiendo las terminaciones a `,00`, `,25`, `,50` y `,75`.
  - *Pregunta generada*: "Un pan cuesta R$ 1,75. Un jugo cuesta R$ 2,50. ¿Cuánto cuestan juntos?"
  - *Respuesta correcta*: `4,25` (Almacenado y comprobado en backend).

### 3.2. Base de Datos de Preguntas Preparadas
Utilizado para módulos que dependen del lenguaje, contexto narrativo y orden secuencial. Las preguntas se diseñan en la base de datos con campos para datos importantes, distractores y pasos de resolución:

* *Ejemplo de Enunciado*: "Carlos tenía R$ 50,00. Compró un libro por R$ 18,00 y un lápiz por R$ 4,00. Después recibió R$ 10,00 de su madre. ¿Cuánto dinero tiene ahora?"
* *Solución secuencial esperada*:
  1. `18 + 4 = 22` (Gasto total).
  2. `50 - 22 = 28` (Dinero restante).
  3. `28 + 10 = 38` (Dinero final).

### 3.3. Plantillas Dinámicas
El equipo pedagógico guarda una estructura fija (plantilla) en formato JSON, y el motor del backend reemplaza nombres, variables y números en tiempo real para generar miles de variaciones con control semántico:

* *Plantilla*: `"{nombre} tenía R$ {dinero_inicial}. Compró {producto} por R$ {precio}. ¿Cuánto dinero le sobró?"`
* *Generación reactiva*: "Ana tenía R$ 10,00. Compró un jugo por R$ 2,50. ¿Cuánto dinero le sobró?"
* *Respuesta*: `7,50`

---

## 4. Reglas por Módulo (Pedagogía)

### Módulo 1 — Gimnasio Numérico Mental
* **Método**: Generación aleatoria controlada en backend.
* **Mecánica**: Sumas, restas, dobles, mitades y combinadas dentro de rangos numéricos rápidos.
* **Regla Especial Nivel 4 (Combo Mental Maestro)**: El generador debe combinar exactamente **3 operaciones** (ej. `36 ÷ 6 + 8 × 2 = ?`) respetando la prioridad algebraica. El backend resuelve y despacha tanto la expresión como los pasos intermedios de resolución.

### Módulo 2 — Tablas en Acción
* **Método**: Generación aleatoria en backend.
* **Mecánica**: Tablas de multiplicar, factores faltantes y operaciones inversas.
* **Ejemplo**: Si genera `8 × 7 = 56`, el sistema puede estructurar la operación inversa: `56 ÷ 8 = ?` (Respuesta: `7`).

### Módulo 3 — Tienda Matemática
* **Método**: Generación aleatoria y plantillas dinámicas.
* **Mecánica**: Suma de precios, cálculo de cambio, comparación de monedas y billetes.
* **Valores Permitidos**: Decimales terminados en `,00`, `,25`, `,50` y `,75` para emular valores reales de monedas brasileñas.
* **Evitar Errores de Punto Flotante**: El frontend y backend aplican redondeos estrictos a dos decimales (`round(val, 2)`) para evitar los clásicos errores de precisión de JavaScript/Python con números flotantes.

### Módulo 4 — Detective de Problemas
* **Método**: Base de datos de preguntas preparadas.
* **Mecánica**: Enfoque de lectura matemática y aislamiento de distractores. El alumno debe utilizar una herramienta interactiva de **subrayador** en el frontend para clasificar palabras del enunciado.
* **Información Requerida**: Enunciado, datos útiles, distractores (ej. nombres, datos temporales irrelevantes), operación lógica correcta y feedback de tutoría invisible.

### Módulo 5 — Constructor de Soluciones
* **Método**: Base de datos de preguntas preparadas.
* **Mecánica**: Problemas de múltiples pasos conectados (ej. la salida del Paso 1 alimenta el Paso 2). El motor de base de datos valida cada paso de forma independiente para ofrecer tutoría guiada antes de calificar la respuesta final.

---

## 5. Criterio de Aprobación y Maestría

De acuerdo con el estándar unificado de la base de datos de LogicaKids Pro:
* Cada bloque de nivel cuenta con **50 preguntas** (o configurable dinámicamente por administrador).
* El alumno debe aprobar con un **90% de precisión mínima** (ej. responder correctamente al menos 45 de 50 preguntas).
* El avance a otros módulos y fases se guarda atómicamente en PostgreSQL, garantizando consistencia total de la progresión y previniendo "Bypasses" no autorizados (excepto cuentas con rol `ADMIN`).

---

## 6. Arquitectura de Base de Datos y Modelado Relacional (PostgreSQL)

Tras la **Certificación Final**, la base de datos implementa el patrón **Facade (Fachada de Modelos)** en `app/models/sql_models.py`, consolidando modelos independientes y asíncronos (`alumno.py`, `pregunta.py`, `progreso.py`) bajo un único registro SQLAlchemy, operado de manera transaccional y controlado mediante migraciones en **Alembic**.

### 6.1. Definición de Modelos ORM (SQLAlchemy)

#### Modelo: `Fase`
Define los nodos del Viaje Matemático.
- `id` (Integer, Primary Key): ID único de la fase (1 a 9).
- `nombre` (String): "Desarrollo Numérico y Razonamiento".
- `orden` (Integer): Posición (2).

#### Modelo: `Pregunta` (Banco de Ejercicios)
Soporta la carga de problemas preparados, plantillas e información interactiva.
- `id` (Integer, Primary key).
- `fase_id` (Integer, ForeignKey('fases.id')): Relación directa con la Fase 2.
- `modulo` (Integer): Módulo pedagógico (1 a 5).
- `nivel` (Integer): Nivel de dificultad (1 a 5).
- `tipo_pregunta` (String): `calculo_directo`, `problema_contexto`, `plantilla_dinamica`.
- `enunciado` (Text): El texto descriptivo o expresión matemática.
- `datos_numericos` (JSONB): Variables numéricas para plantillas dinámicas (ej: `{"a": 10, "b": 5}`).
- `respuesta_correcta` (String): El resultado numérico o texto esperado.
- `explicacion_paso_a_paso` (JSONB): Estructura detallada de pasos de solución.
- `errores_previstos` (JSONB): Diccionario para la detección de errores de atención o cálculo.

#### Modelo: `Alternativa`
- `id` (Integer, Primary Key).
- `pregunta_id` (Integer, ForeignKey('preguntas.id')).
- `texto` (String): Opción de respuesta.
- `es_correcta` (Boolean).
- `tipo_error` (String): (ej: `Cálculo`, `Comprensión`, `Incompleto`).

#### Modelo: `ProgresoMaestria`
Rastrea la maestría y desbloqueo del bloque del alumno.
- `id` (Integer, Primary Key).
- `alumno_id` (Integer, ForeignKey('alumnos.id'), nullable=False).
- `modulo` (Integer, nullable=False).
- `nivel` (Integer, nullable=False).
- `aciertos_acumulados` (Integer, default=0).
- `intentos_totales` (Integer, default=0).
- `estado` (String): `bloqueado`, `en_progreso`, `aprobado` (Mapeado con Enum Python en SQLAlchemy usando `native_enum=False` para prevenir fallos al alterar enums en PostgreSQL en producción).

#### Modelo: `Intento`
Registra el historial analítico detallado de cada pregunta respondida.
- `id` (Integer, Primary Key).
- `alumno_id` (Integer, ForeignKey('alumnos.id'), nullable=False).
- `pregunta_id` (Integer, ForeignKey('preguntas.id'), nullable=False).
- `respuesta_dada` (String): Entrada del alumno.
- `es_correcta` (Boolean).
- `tipo_error_detectado` (String, nullable=True).
- `tiempo_respuesta` (Float): Tiempo tomado en segundos.

---

## 7. Optimización de Capa de Datos (Garantía de Rendimiento)

Para soportar concurrencia a gran escala en producción, se implementaron las siguientes restricciones y optimizaciones de base de datos:

1. **Restricción de Unicidad (`UniqueConstraint`)**:
   Aplicado sobre la combinación de `(alumno_id, modulo, nivel)` en `ProgresoMaestria`. Esto previene a nivel de base de datos la inserción de registros duplicados de progreso para un mismo alumno en el mismo nivel.
2. **Índices de Base de Datos Estratégicos**:
   - `idx_progreso_alumno_fase` en `ProgresoMaestria`: Optimiza las búsquedas cuando el frontend carga el mapa del Viaje Matemático del alumno logueado para pintar los candados.
   - `idx_pool_alumno_bloque` en `Intentos`: Optimiza los reportes analíticos agregados para la Tutoría IA y estadísticas del Panel de Administración.
3. **Migraciones con Alembic**:
   Toda modificación estructural de base de datos se maneja bajo control transaccional de Alembic. Se prohíbe la creación o alteración manual del DDL en el evento de inicio (`startup`) de FastAPI en producción.

---

## 8. Esquemas de Datos Estructurados (JSONB)

La **Tutoría Invisible** y los flujos avanzados de problemas de texto consumen las siguientes estructuras JSONB:

### 8.1. Explicación Paso a Paso (`explicacion_paso_a_paso`)
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

### 8.2. Errores Previstos (`errores_previstos`)
```json
{
  "mapeo": [
    {
      "respuesta": "22",
      "tipo_error": "problema_incompleto",
      "feedback": "Calculaste bien los gastos, pero falta restarlos de los R$ 50,00 iniciales."
    },
    {
      "respuesta": "68",
      "tipo_error": "operacion_incorrecta",
      "feedback": "Parece que sumaste todos los números en lugar de restar los gastos."
    }
  ]
}
```

---

## 9. Hoja de Ruta de Implementación de la Fase 2 (Estabilizada)

### ETAPA 1: Estructura Base y Lógica Central (Completado)
- [x] **Base de Datos y Modelos**: Consolidación del Facade relacional en `sql_models.py` con índices optimizados y restricciones de unicidad.
- [x] **Endpoints en FastAPI**: Creación de los endpoints pedagógicos centralizados `/pedagogia/dashboard` e `/pedagogia/responder`.
- [x] **Alembic**: Configuración de ciclo asíncrono y control de versiones de esquema en producción.

### ETAPA 2: Integración de la UI y Motor Híbrido (Siguiente Iteración)
- [ ] **Desconexión del Generador Local**: Remover por completo la dependencia del frontend en `mathService.ts` para la Fase 2.
- [ ] **Implementación de Rutas**: Crear las vistas declarativas en React Router DOM v6+ para la Fase 2 (`/fase/2/welcome`, `/fase/2/play`, `/fase/2/results`).
- [ ] **Componente de Tutoría Invisible**: Crear la UI flotante reactiva que interprete las estructuras JSONB de `errores_previstos` y `explicacion_paso_a_paso` provistas por la API de FastAPI.
- [ ] **Herramienta Subrayadora Interactiva**: Construir el componente de marcado e identificación de textos para los Módulos 4 y 5.
