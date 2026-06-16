# 🎓 FASE 9: SIMULADOR DE EXÁMENES PEDRO II

**Propósito:** Consolidar el aprendizaje transversal, dominar el manejo del tiempo bajo presión y familiarizarse con el formato exacto de las preguntas de ingreso del Colégio Pedro II.

---

## PARTE 1: DOCUMENTO DE DISEÑO LÓGICO

La Fase 9 es la culminación de la aplicación. Aquí el alumno abandona el aprendizaje por submódulos interactivos y se enfrenta a **evaluaciones tipo examen** que mezclan todos los temas bajo la presión de un examen real. El enfoque es estrictamente de simulación (sin fase de entrenamiento previa).

### 🗺️ Mapa de la Fase 9: Estructura de Módulos y Niveles

La fase se divide en 3 módulos incrementales que albergan un total de **20 exámenes (simulados)**. Cada examen representa un nivel lógico en la arquitectura.

```text
[FASE 9: SIMULADOR PEDRO II]
│
├── [MÓDULO 1: Simulacros Iniciales]
│    ├── 5 Exámenes (Niveles 1 al 5)
│    └── Objetivo: Adaptación a la mezcla de temas y control de tiempo básico.
│
├── [MÓDULO 2: Simulacros Intermedios]
│    ├── 10 Exámenes (Niveles 1 al 10, correspondientes a los exámenes 6-15)
│    └── Objetivo: Resistencia mental, formato idéntico al Pedro II con mayor complejidad.
│
└── [MÓDULO 3: Simulacros Avanzados]
     ├── 5 Exámenes (Niveles 1 al 5, correspondientes a los exámenes 16-20)
     └── Objetivo: Perfeccionamiento y manejo de exámenes con alta densidad de problemas geométricos y lógicos.
```

### ⏱️ Zona de Evaluación: Reglas del Simulador

En la Fase 9, el alumno debe completar la prueba entera para experimentar la presión del examen.

| Parámetro | Valor |
| --- | --- |
| **Total de Exámenes** | 20 simulados independientes |
| **Preguntas por Examen** | 10 preguntas fijas extraídas del banco por examen |
| **Temporizador por Examen**| 15 minutos globales |
| **Condición de Aprobación**| ≥ 70% (7/10 preguntas correctas) |
| **Persistencia** | Los resultados se guardan en `ProgresoMaestria` |
| **Graduación de Fase** | Completar y aprobar los 20 exámenes |

---

## PARTE 2: MECÁNICAS Y FLUJO DE USUARIO

A diferencia de las fases anteriores, la Fase 9 no incluye una sub-fase de práctica o desafíos aislados. El flujo es directo:

1. **Selección del Módulo:** El usuario entra a la Fase 9 y ve los 3 módulos disponibles.
2. **Selección del Nivel (Examen):** Al entrar a un módulo, ve la cuadrícula de exámenes correspondientes. Los niveles se desbloquean secuencialmente.
3. **Inicio del Simulado:** Se crea una `SimuladoSession`. Se extraen 10 preguntas de la sección específica (`modulo_id * 100 + nivel_id`).
4. **Desarrollo:** El usuario responde a contrarreloj. El frontend muestra el temporizador de 15 minutos en retroceso.
5. **Cierre:** Al enviar el examen o acabarse el tiempo, se procesan las respuestas y se registra en `ProgresoMaestria`. Si alcanza el 70%, se marca el nivel como superado, permitiendo el avance al siguiente examen.

---

## PARTE 3: INTEGRACIÓN TÉCNICA Y BASE DE DATOS

Para soportar los 20 exámenes, el backend y la base de datos están configurados así:

1. **Seed de Preguntas (`seed_fase9.py`):**
   - Se inyectan 20 secciones a la base de datos (IDs 90101 a 90105 para Modulo 1, 90201 a 90210 para Modulo 2, 90301 a 90305 para Modulo 3).
   - En total hay 200 preguntas en la Fase 9 (10 por cada sección).
   - Se crean 20 registros en `NivelTeoria` asociados, que actúan como contenedores de nivel en el dashboard.

2. **Endpoints API:**
   - La lógica del dashboard recae en `fase9/router.py`, que expone la estructura de los 3 módulos y mapea el progreso consultando la tabla `ProgresoMaestria` para determinar qué exámenes están aprobados.
   - La ejecución del examen usa los endpoints genéricos de `api/rutas/simulados.py` (`iniciar` y `responder`), adaptados para la Fase 9.
   - El endpoint de evaluación toma en cuenta las 10 preguntas y el tiempo límite para definir la aprobación.

3. **Front-End (`faseMetadata.ts`):**
   - La fase 9 está definida estructuralmente con 3 módulos y un arreglo de niveles `[5, 10, 5]`.
   - Utiliza el layout de niveles estándar, pero los direcciona directamente al motor de simulados en lugar de a un entorno de aprendizaje libre.

---

## PARTE 4: UX/UI RECOMENDACIONES MODO EXAMEN

Para enfatizar que esto es un simulador:
* **Paleta y Tono:** Transición a un entorno menos lúdico y más profesional/enfocado cuando se inicia el simulado.
* **Cabecera de Control:** Cronómetro global siempre visible (idealmente cambiando a ámbar a los 5 minutos restantes, y rojo en el último minuto).
* **Navegación Intrasimulado:** Mostrar visualmente cuántas de las 10 preguntas han sido respondidas.
* **Resultados Finales:** Al finalizar, se muestra el puntaje (ej. 8/10) y se recomienda proveer un pequeño resumen de aciertos/errores para fomentar la retroalimentación, dado que la fase ya no cuenta con el componente de "Clínica de Errores" externo.
