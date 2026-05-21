¡Me alegra mucho que te haya parecido excelente! Tienes toda la razón: anclar estas reglas con ejemplos reales del texto original hace que el documento sea mucho más claro y fácil de replicar para el equipo.

Aquí tienes la versión actualizada del **Documento Rector**, enriquecida con ejemplos extraídos de la Fase 2.

---

# Documento Rector para la Creación de Fases — LogicaKids Pro

## 1. Principios Arquitectónicos y Generación

Todas las fases de LogicaKids Pro deben operar bajo un modelo de **Autoridad en el Servidor (Server-Authoritative)**. El frontend actúa únicamente como capa de renderizado interactiva; jamás calcula respuestas finales, ni controla la progresión, ni maneja los estados de aprobación.

Para la generación de preguntas, las fases deben utilizar un **Modelo Híbrido** según la complejidad cognitiva de la habilidad a evaluar:

* **Generación Aleatoria Controlada (Backend):** Para operaciones matemáticas puras y directas.
> **Ejemplo Aplicado (Módulo 3 - Tienda):** Generar sumas de decimales que representen dinero, pero restringiendo las terminaciones estrictamente a `,00`, `,25`, `,50` o `,75` para evitar frustración cognitiva, calculando el backend el resultado en tiempo real (ej. `R$ 1,75 + R$ 2,50`).


* **Base de Datos Estática / Plantillas Dinámicas JSONB:** Para problemas textuales, razonamiento lógico de múltiples pasos y herramientas interactivas.
> **Ejemplo Aplicado (Módulo 2 - Plantillas):** `{nombre} tenía R$ {dinero_inicial}. Compró {producto} por R$ {precio}. ¿Cuánto dinero le sobró?` El backend reemplaza las variables y valida.



---

## 2. Anatomía Estándar de un Módulo

Cada fase está compuesta por **Módulos**, y cada módulo debe respetar el siguiente flujo de usuario inalterable:

1. **Fase de Aprendizaje Teórico:** Lectura fragmentada por niveles.
2. **Desbloqueo por Evocación:** Resolución obligatoria de 3 mini-retos numéricos sin temporizador.
3. **Práctica Libre (Niveles):** Batería de preguntas con asistencia algorítmica (*Bucle Espejo*).
4. **Zona de Desafíos (Evaluación):** 3 niveles de examen con temporizador y reglas de expulsión estricta (*Early Exit*).

---

## 3. Estructura Interna de un Nivel de Aprendizaje y Práctica

Cada nivel dentro de un módulo sirve para aislar un micro-concepto antes de integrarlo. Debe diseñarse con los siguientes componentes:

### 3.1. Textos y Teoría

* **Mensaje de Bienvenida:** Tono motivacional y declarativo del objetivo ("tu superpoder hoy será...").
* **Bloque de Advertencia ("Cuidado con la Trampa"):** Exposición explícita del error más común que cometen los niños en ese concepto, explicando por qué ocurre y cuál es el camino correcto.
> **Ejemplo Aplicado (Módulo 1 - Jerarquías):** "El monstruo del desorden quiere que operes de izquierda a derecha. Si ves `4 + 3 × 2`, el camino incorrecto es `4 + 3 = 7` y luego `7 × 2 = 14`. ¡Primero mandan multiplicación y división!"


* **Interactivos de Desbloqueo:** 3 preguntas de evocación pura (cuadro de texto `input` vacío) obligatorias para acceder a la práctica.

### 3.2. Batería de Práctica Libre

* **Formato:** Exclusivamente `input` de texto vacío (sin opciones múltiples para evitar adivinanzas).
* **Sistema de Tutoría (Bucle Espejo):** Si el alumno falla, el avance se congela. El servidor envía un feedback quirúrgico (identificando el tipo de error) y carga una variante matemática de la misma estructura.
> **Ejemplo Aplicado (Módulo 1):** > *Pregunta original:* `4 + 3 × 4`. *Respuesta correcta:* `16`.
> *Fallo del alumno:* Escribe `28` (sumó primero).
> *Feedback del Backend:* "Le quitaste el poder al Jefe Supremo. Multiplicar va primero."
> *Variante Espejo:* El sistema no repite la misma pregunta, entrega `5 + 2 × 3`.



---

## 4. Zona de Evaluación: Los Desafíos

Al terminar los niveles de práctica, el módulo se cierra con la **Zona de Desafíos**. Aquí no hay red de seguridad (sin Bucle Espejo) y se exige velocidad. Todo módulo debe tener exactamente estos 3 desafíos:

| Componente | Dificultad | Interfaz | Cantidad | Temporizador | Regla de Cierre (Early Exit) |
| --- | --- | --- | --- | --- | --- |
| **Desafío 1** | Estándar | Opción Múltiple | 25 | **45 seg** / pregunta | Expulsión al **3er error** |
| **Desafío 2** | Avanzada | Opción Múltiple | 25 | **60 seg** / pregunta | Expulsión al **3er error** |
| **Desafío Final** | Maestría | Evocación Pura (`input`) | 10 | **45 seg** / pregunta | Expulsión al **2do error** |

> **Ejemplo Aplicado (Desafío Final - Módulo 1):** Evocación pura. El niño ve `30 - 15 ÷ 3`. No hay opciones. El temporizador corre (45s). Debe tipear `25` correctamente o acumula un error crítico.

---

## 5. Reglas Universales de Aprobación y Early Exit

Todas las evaluaciones exigen un **90% de precisión**. Para evitar el "Bloqueo del Pequeño Fracaso" (donde el alumno sigue respondiendo cuando matemáticamente ya reprobó), el servidor debe abortar la sesión automáticamente.

**Tabla Maestra de Tolerancia:**

* Sesión de **10** preguntas $\rightarrow$ Aborta al **2º error**.
* Sesión de **15** preguntas $\rightarrow$ Aborta al **2º error**.
* Sesión de **20** preguntas $\rightarrow$ Aborta al **3er error**.
* Sesión de **25** preguntas $\rightarrow$ Aborta al **3er error**.
* Sesión de **50** preguntas $\rightarrow$ Aborta al **6º error**.

---

## 6. Especificaciones Técnicas y de Base de Datos

Para que los nuevos módulos se acoplen a la API FastAPI y a PostgreSQL sin romper el sistema, deben cumplir con los siguientes estándares:

### 6.1. Esquemas JSONB para Tutoría

Deben utilizarse para la `explicacion_paso_a_paso` y `errores_previstos`.

> **Ejemplo Aplicado (Errores Previstos):** Si la respuesta correcta es `28` (por restar `50 - 22`), el JSONB en la base de datos mapea distractores:
> ```json
> {
>   "respuesta": "22",
>   "tipo_error": "problema_incompleto",
>   "feedback": "Calculaste bien los gastos, pero falta restarlos de los R$ 50,00 iniciales."
> }
> 
> ```
> 
> 

### 6.2. Reglas de Protección y Anti-Trampas (Edge Cases)

1. **Fallo de Punto Flotante (IEEE 754):** El backend y la DB **jamás** deben operar con tipo `Float` para dinero. Todo se almacena como enteros.
> **Ejemplo:** `R$ 2,50` se procesa internamente en el backend y base de datos como `250` centavos.


2. **Protección del Estado de Sesión:** Si el alumno actualiza el navegador (F5), el frontend hidrata el estado desde la API para evitar que burle el `Early Exit`.
3. **Tokenización de Textos (Evitar falsos negativos):** En preguntas donde el alumno interactúa con el texto, el frontend envía un array de IDs, no texto crudo (que podría fallar por espacios o acentos).
> **Ejemplo Aplicado (Módulo 4 - Subrayado):** En la oración "Lucas tiene 5 manzanas rojas", el texto "5 manzanas rojas" es el token `ID: 2` con el rol `"dato_util"`. El frontend solo envía `{"tokens_seleccionados": [2]}`.



---

## 7. Checklist de Creación para Nuevas Fases

Cuando el equipo pedagógico y técnico comience el diseño de una nueva fase, debe entregar:

1. [ ] **Documento de Diseño Lógico:** Definición del propósito de los módulos y las trampas conceptuales.
2. [ ] **Guion de Textos:** Lecturas de entrada, diccionario/analogías, y 3 ejemplos interactivos por nivel.
3. [ ] **Estructura del Pool (Base de datos):** Mínimo 150 preguntas o combinaciones únicas por nivel (usar `random.sample()` en el backend).
4. [ ] **Scripts Generadores:** Código Python con límites de iteración (`max_intentos = cantidad * 50`) listos para inyectar en PostgreSQL.
5. [ ] **Mapeo de Errores (JSONB):** Definición explícita de los distractores (las "trampas") y el texto exacto del Tutor Invisible.