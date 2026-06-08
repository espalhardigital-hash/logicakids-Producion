# Instrucciones para el Agente Tester: Pruebas E2E y de Lógica (LogicaKids)

Este documento es el **manual rector** que define cómo un agente autónomo (o tester) debe realizar las pruebas End-to-End (E2E) y de validación lógica sobre la aplicación LogicaKids. Estas instrucciones servirán de base para la posterior creación de scripts o entornos de prueba automatizados.

---

## 1. Preparación, Contexto y Herramientas

### Usuario de Prueba
- **Restricción de Usuario:** Todas las pruebas deben ejecutarse utilizando exclusivamente un **usuario de prueba dedicado**. Bajo ninguna circunstancia se debe utilizar un usuario real o de producción para evitar alteraciones en los datos y métricas.
- **Credenciales del Usuario:** El usuario de prueba ya se encuentra creado en el sistema. Las credenciales a utilizar son:
  - **Usuario/Correo:** prueba@gmail.com
  - **Contraseña:** pruebas

### Selección de Herramientas
- El agente evaluador tiene la **flexibilidad de elegir la herramienta más adecuada** para ejecutar estas tareas (por ejemplo, utilizando el `browser_subagent` interno para interacción en vivo, o estructurando scripts externos como Cypress, Playwright, etc., según la necesidad y eficiencia).
- **Navegador por Defecto:** Se debe utilizar **Google Chrome** por defecto para realizar todas las pruebas basadas en navegador.

---

## 2. Flujo de Acceso Inicial

El agente deberá simular el comportamiento de un usuario real, siguiendo estos pasos iniciales:

1. **Apertura y Navegación:** Abrir el navegador **Google Chrome** (establecido por defecto) e ingresar a la URL del entorno correspondiente (Desarrollo o Producción, según se haya indicado).
2. **Autenticación (Login):** Ingresar las credenciales del usuario de prueba y validar que el acceso sea exitoso (verificando la redirección al dashboard o pantalla principal).
3. **Inicio del Recorrido:** 
   - Navegar hacia la **Fase** indicada.
   - Ingresar al **Módulo** correspondiente.
   - Comenzar siempre desde el **Nivel 1** o el nivel/desafío específico que el usuario haya indicado en su instrucción.

---

## 3. Validación Exhaustiva de UI y Lógica por Interfaz

Por cada pantalla, nivel o desafío que el agente visite, deberá detenerse y realizar las siguientes comprobaciones de forma estricta:

### A. Carga de Interfaz
- Verificar que la interfaz se renderice completamente y sin errores. El agente evaluador debe leer activamente los errores proporcionados por la consola del navegador (browser) para identificar cualquier fallo que deba ser corregido.
- Validar que los elementos visuales cumplan con los **Criterios de Diseño** estipulados y la configuración actual (disposición, visibilidad de los elementos de juego).

### B. Evaluación de Acciones y Respuestas
El agente debe interactuar con las opciones disponibles y observar el comportamiento de la aplicación ante diferentes escenarios:

1. **En Caso de Acierto:**
   - Seleccionar la respuesta correcta.
   - Validar que el sistema reconozca el acierto (ej. feedback visual positivo, incremento de puntaje).
   - Comprobar que el flujo permite continuar de manera fluida.

2. **En Caso de Fallo:**
   - Seleccionar una respuesta incorrecta de manera intencional.
   - Validar qué sucede en la interfaz (ej. feedback visual negativo, deducción de puntos si aplica).
   - Validar el comportamiento del sistema ante el error según las reglas del juego.

3. **La Pregunta Espejo:**
   - Si la configuración del nivel dictamina que al fallar debe presentarse una "pregunta espejo" (o de refuerzo), el agente debe **verificar explícitamente** que esta pregunta cargue correctamente y que su lógica funcione igual que una pregunta normal.

### C. Reglas Generales
- Asegurar que en todo momento las interfaces y transiciones respeten las reglas generales establecidas para LogicaKids.

---

## 4. Validación de Progreso y Desbloqueos

El flujo de navegación entre niveles y módulos es crítico. El agente debe probar:

1. **Botones de Navegación:**
   - Pulsar el botón "Siguiente" o botones de transición similares.
   - Verificar que al presionarlo, la siguiente interfaz se cargue correctamente.

2. **Criterios de Liberación (Bloqueo/Desbloqueo):**
   - **Aprobación:** Verificar que al finalizar un nivel, desafío o módulo, el siguiente se libere **únicamente si** el usuario alcanzó la nota o grado mínimo de aprobación configurado.
   - **Reprobación:** Comprobar que, si no se alcanza la nota mínima de aprobación, los niveles/módulos siguientes **permanezcan bloqueados** impidiendo el avance, tal como indica el diseño.

---

## 5. Sistema de Reportes de Bugs e Historial de Soluciones

Durante la ejecución de las pruebas, el sistema genera automáticamente reportes y mantiene un historial acumulativo.

### Flujo de Trabajo
1. **Ejecutar pruebas:** Al finalizar la ejecución completa, se genera un reporte consolidado en `reportes_bugs/reporte_ultima_ejecucion.md` con TODOS los bugs encontrados.
2. **Corregir bugs:** El agente debe leer el reporte, corregir cada bug listado en orden de severidad (críticos primero), y aplicar las correcciones al código fuente.
3. **Actualizar historial:** Después de corregir cada bug, el agente debe documentar la solución en el historial acumulativo `reportes_bugs/historial_bugs.md`, indicando qué se hizo y qué archivos se modificaron.
4. **Re-ejecutar:** Se vuelven a correr las pruebas para verificar que los bugs fueron resueltos. El ciclo se repite hasta que el reporte salga limpio (sin bugs).

### Archivos del Sistema de Reportes
- `reportes_bugs/reporte_ultima_ejecucion.md` — Contiene todos los bugs de la última ejecución. Se sobreescribe en cada nueva ejecución.
- `reportes_bugs/historial_bugs.md` — Base de conocimiento acumulativa. Cada entrada documenta un bug resuelto y su solución. Cuando un problema similar reaparece, el agente consulta este historial para saber cómo solucionarlo.
- `reportes_bugs/screenshots/` — Capturas de pantalla automáticas al momento de cada fallo.

### Consulta del Historial
Antes de investigar un bug desde cero, el agente debe buscar en el historial si existe una solución previa para un problema similar. El sistema lo hace automáticamente durante la ejecución y muestra coincidencias en la consola.

---

*Nota para el Agente: Al ejecutar un ciclo de pruebas basándote en este documento, debes reportar detalladamente cualquier anomalía en el reporte consolidado de bugs, corregir los errores encontrados, y actualizar el historial de soluciones para futura referencia.*
