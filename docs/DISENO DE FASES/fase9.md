# Especificación de Interfaz de Usuario: Fase 9 — Simulados Pedro II

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 9 de LogicaKids Pro**, la etapa cúspide de la plataforma diseñada como un simulador de examen real riguroso para preparar de forma decisiva al alumno para la admisión a la institución **Pedro II**.

---

## 1. Propósito Pedagógico

* **Objetivo General**: Entrenar al alumno en las condiciones formales, el formato, los límites de tiempo y la variedad de temas del examen real Pedro II, reduciendo la ansiedad ante exámenes y promoviendo la revisión estructurada y el aprendizaje reflexivo a partir de los errores cometidos.
* **Habilidades Desarrolladas**:
  1. Gestión estratégica del tiempo de examen (ritmo de resolución).
  2. Resistencia matemática ante pruebas de larga duración y alta concentración.
  3. Autodiagnóstico e identificación activa de debilidades de aprendizaje específicas.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase adopta un diseño **sumamente sobrio, formal y enfocado en la productividad extrema**, sin perder la sofisticación del diseño cyberpunk de la plataforma.

### 2.1. Panel Superior de Monitoreo (Fijo)
* **El Cronómetro de Arena Digital**: Un reloj de cuenta regresiva en formato digital (`MM:SS`) de color ámbar brillante parpadeante, ubicado en el centro superior.
* **Mapa de Navegación de Preguntas**: Un panel retráctil que muestra círculos numerados del 1 al N (las preguntas del simulacro).
  - Círculo Gris: Pregunta no visitada.
  - Círculo Azul Eléctrico: Pregunta actual.
  - Círculo Blanco: Pregunta ya respondida.
  - El alumno puede pulsar cualquier círculo para **saltar directamente** a esa pregunta (permitiendo la estrategia de resolver las fáciles primero y dejar las difíciles para el final).

### 2.2. Tarjeta del Enunciado del Examen (Centro)
* **Estilo**: Tarjeta de vidrio templado muy limpia, con tipografía de alta legibilidad en color blanco mate.
* **Contenido**: Enunciados textuales complejos con diagramas ilustrativos de apoyo opcionales.
* **Alternativas de Selección Múltiple**: Botones grandes apilados verticalmente (`bg-slate-900/50 hover:bg-slate-800/80 border border-white/10`).
  - Al seleccionar una opción, se ilumina el borde con un resplandor dorado sutil. No se muestra retroalimentación de "correcto/incorrecto" en caliente; toda la retroalimentación se reserva para la fase de revisión al finalizar la prueba.

### 2.3. El Panel de Control Inferior
* Contiene los botones de navegación: `[ Atrás ]`, `[ Marcar para Revisar Después ]` (que añade un icono de bandera amarilla al círculo del mapa de navegación) y `[ Siguiente ]`.
* Botón destacado `[ Finalizar Examen ]` que requiere confirmación doble en un modal.

---

## 3. La Fase de Revisión Dirigida (El Post-Examen)

Una vez finalizado el examen, se entra a un **Modo de Revisión Dirigida** (único de la Fase 9):
* **Filtros de Análisis**: El alumno visualiza su puntuación y una barra para ver: *Todas las preguntas*, *Solo Aciertos*, *Solo Errores*.
* **Tutoría IA Pedro II**: Al pulsar en cualquier pregunta errónea:
  - Se muestra el enunciado.
  - Se resalta la opción que marcó el niño en rojo y la opción correcta en verde.
  - Se despliega el análisis detallado y explicaciones dinámicas de la Inteligencia Artificial explicando detalladamente la lógica correcta de solución del examen Pedro II.

---

## 4. Reglas Generales de Preguntas

* **Origen**: Banco de Ejercicios del Examen Pedro II cargados en PostgreSQL (preguntas de exámenes reales de años anteriores).
* **Tipos de Simulados**:
  - **Simulado Corto**: 10 preguntas por área / tema específico.
  - **Simulado Completo**: Examen idéntico en duración y cantidad de preguntas al formato real del Pedro II.
* **Habilidad de Guardado**: Guardado de estados en tiempo real. Si el alumno se desconecta accidentalmente, al volver a iniciar sesión el simulador retoma exactamente en el segundo y la pregunta donde se quedó.
