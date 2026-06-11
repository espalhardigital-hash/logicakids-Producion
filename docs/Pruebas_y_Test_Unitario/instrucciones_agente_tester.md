# Instrucciones para el Agente Tester: Pruebas E2E y de Lógica (LogicaKids)

Este documento es el **manual rector** que define cómo un agente autónomo (o tester) debe realizar las pruebas End-to-End (E2E) y de validación lógica sobre la aplicación LogicaKids. Estas instrucciones servirán de base para la posterior creación de scripts o entornos de prueba automatizados.

> **⚠️ Estado actual:** Entorno **100% local** (sin conexión VPS). Cuando se restaure la conexión SSH, consultar [`cambio_para_vps.md`](../cambio_para_vps.md).

---

## 1. Preparación, Contexto y Herramientas

### Entorno de Ejecución (100% Local)

Antes de ejecutar cualquier prueba, el agente debe asegurar que el stack Docker local esté levantado y funcional:

1. **Verificar estado del stack:**
   ```bash
   docker compose -f docs/Pruebas_y_Test_Unitario/docker-compose.local.yml ps
   ```
   Todos los servicios deben estar en estado `running` o `healthy`.

2. **Si el stack no está levantado, iniciarlo:**
   ```bash
   docker compose -f docs/Pruebas_y_Test_Unitario/docker-compose.local.yml up -d --build
   ```

3. **Verificar que la API responde:**
   ```bash
   curl http://localhost:8000/
   ```
   Debe retornar: `{"message": "LogicaKids Pro - Backend API"}`

4. **Verificar que el frontend carga:**
   Abrir `http://localhost:3000` — debe mostrar la pantalla de login de LogicaKids.

### Servicios Locales Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | `http://localhost:3000` | Aplicación React |
| Backend API | `http://localhost:8000` | FastAPI + Uvicorn |
| PostgreSQL | `localhost:5433` | Base de datos (user: `logicakids_local_user`) |
| Redis | `localhost:6380` | Cache |
| MinIO Console | `http://localhost:9101` | Storage S3 (avatares) |

### Usuario de Prueba
- **Restricción de Usuario:** Todas las pruebas deben ejecutarse utilizando exclusivamente un **usuario de prueba dedicado**. Bajo ninguna circunstancia se debe utilizar un usuario real o de producción para evitar alteraciones en los datos y métricas.
- **Credenciales del Usuario:** El usuario de prueba ya se encuentra creado en el sistema. Las credenciales a utilizar son:
  - **Usuario/Correo:** prueba@gmail.com
  - **Contraseña:** pruebas

### Usuario Administrador (para validaciones de panel admin)
  - **Usuario/Correo:** amilcar@gmail.com
  - **Contraseña:** Colombia1#_

### Selección de Herramientas
- El agente evaluador tiene la **flexibilidad de elegir la herramienta más adecuada** para ejecutar estas tareas (por ejemplo, utilizando el `browser_subagent` interno para interacción en vivo, o estructurando scripts externos como Cypress, Playwright, etc., según la necesidad y eficiencia).
- **Navegador por Defecto:** Se debe utilizar **Google Chrome** por defecto para realizar todas las pruebas basadas en navegador.

---

## 2. Idempotencia y Limpieza de Estado (Aislamiento de Tests)

Para garantizar que las pruebas no generen falsos positivos ni fallen en cadena, el agente debe asegurar la idempotencia estricta:

1. **Aislamiento de Entorno:**
   - **Antes y después** de cada flujo de prueba, se deben limpiar las tablas de progreso del usuario de prueba a nivel de base de datos (`intentos`, `intento_pasos`, `progreso_maestria`).
2. **Limpieza de Sesión en Navegador:**
   - Forzar el borrado de la caché del navegador y del `localStorage` (ej. limpiando variables persistentes como `lk_fase_progress_X`) al iniciar un test nuevo para evitar que sesiones previas afecten la evaluación actual.

---

## 3. Flujo de Acceso Inicial y Uso de Roles

El agente deberá simular el comportamiento de un usuario real, siguiendo estos pasos iniciales:

1. **Apertura y Navegación:** Abrir Google Chrome e ingresar a `http://localhost:3000`.
2. **Autenticación (Login):** Ingresar las credenciales del usuario de prueba y validar redirección.
3. **Manejo de Usuarios y Simulación de Progreso Natural (Sin Rol Admin):**
   - **Evaluación de una Fase o Módulo Específico:** Cuando se solicite testear una fase o módulo avanzado, se debe crear un **usuario nuevo** exclusivamente para ese test. Para simular el flujo de progresión natural sin usar el rol ADMIN, **todas las fases, módulos y desafíos anteriores** deben insertarse directamente en la base de datos como **aprobados**. De esta forma, el usuario no será bloqueado por no tener los pre-requisitos.
   - **Evaluación Completa (E2E Completo):** Cuando se solicite probar todos los módulos desde el inicio, se debe crear un **usuario nuevo desde cero** y este debe avanzar paso a paso de forma natural en el test (sin insertar progreso previo).
   - **Aislamiento Estricto:** **Siempre** que se pidan baterías de tests automatizados, se debe crear un usuario nuevo por cada test.
   - **Prohibido:** No utilizar el rol `ADMIN` para bypassear candados, a menos que el objetivo de la prueba sea evaluar funcionalidades exclusivas de los administradores.

---

## 4. Validación Exhaustiva de UI y Lógica por Interfaz

Por cada pantalla, nivel o desafío que el agente visite, deberá detenerse y realizar las siguientes comprobaciones de forma estricta:

### A. Carga de Interfaz y Manejo de Animaciones
- **Transiciones y Framer Motion:** El agente **nunca debe usar esperas de tiempo fijo** (hardcoded timeouts como `wait(500ms)`). 
- Se debe usar comprobación absoluta de estado: usar comandos explícitos de espera como `.waitFor({ state: 'hidden' })` al cerrar modales superpuestos, o `.toBeEnabled()` antes de presionar botones de interacción. Esto evita que los clics automatizados sean interceptados por animaciones en curso.
- Verificar que la interfaz se renderice completamente, leyendo activamente los errores de consola del navegador.

### B. Evaluación de Acciones, Red y Respuestas
- **Política de Timeouts de Red:** El agente debe interceptar las peticiones API reales (ej. esperar la respuesta `200 OK` de `/api/faseX/modulo/X/pregunta`) para saber que la pantalla ya cargó los datos, en lugar de depender solo de buscar elementos visuales.
- **Caso de Acierto / Fallo:** Seleccionar respuestas correctas e incorrectas, validando que el feedback (positivo/negativo) y las reglas de puntuación se apliquen.
- **La Pregunta Espejo:** Verificar explícitamente que tras un fallo, la "pregunta espejo" se dispare y que su lógica funcione igual que una pregunta normal.

---

## 5. Validación de Progreso y Desbloqueos

1. **Botones de Navegación:** Verificar la correcta transición entre interfaces tras pulsar "Siguiente".
2. **Criterios de Liberación:**
   - **Aprobación:** Asegurar que los niveles siguientes se desbloqueen solo al alcanzar la nota mínima.
   - **Reprobación:** Comprobar que los niveles siguientes permanezcan bloqueados si se falla, acorde al diseño.

---

## 6. Sistema de Reportes de Bugs e Historial de Soluciones

El flujo de trabajo automatizado para documentar fallos es el siguiente:

1. **Ejecutar pruebas:** Se genera un reporte consolidado en `reportes_bugs/reporte_ultima_ejecucion.md`.
2. **Corregir bugs:** El agente lee el reporte, prioriza por severidad (críticos primero) y aplica correcciones directas al código fuente.
3. **Actualizar historial:** Tras arreglar un bug, se documenta la solución en `reportes_bugs/historial_bugs.md` indicando el problema, solución y archivos modificados.
4. **Re-ejecutar:** El ciclo se repite hasta lograr un reporte 100% limpio (0 bugs).
5. *(Recomendación para CI/CD):* En entornos automatizados de integración (GitHub Actions/VPS), el agente debe procurar correr el navegador en modo "Headless" y solo conservar videos o pantallazos en caso de falla para ahorrar recursos.

---



*Nota para el Agente: Al ejecutar un ciclo de pruebas basándote en este documento, debes priorizar el aislamiento, la idempotencia y la lectura activa de interceptores de red para asegurar tests 100% fiables.*

---

## 7. Prompt Maestro de Ejecución por Fase

Para solicitar al agente que ejecute y depure una Fase completa de manera automática, selecciona este archivo como contexto y pégale el siguiente prompt en el chat:

> **Prompt de Ejecución:**
> "Actúa como un **Agente Tester Automatizado y Desarrollador Senior Experto** (especializado en Python/FastAPI, TypeScript/React, Playwright y Arquitectura DevOps con Docker/PostgreSQL). 
> Basándote estrictamente en `instrucciones_agente_tester.md`, tu misión es realizar una prueba exhaustiva sobre la **Fase [NÚMERO DE FASE]**. Debes aplicar los tests automáticos simulando el flujo completo de un alumno real de principio a fin, garantizando una **cobertura absoluta (ejecutando todos y cada uno de los módulos, niveles y desafíos internos pertenecientes a la fase solicitada)**. Durante esta ejecución, debes buscar, diagnosticar y solucionar cualquier bug de UX, lógica de negocio o infraestructura subyacente que impida la progresión del usuario al 100%.
> 
> **Reglas críticas aprendidas de ejecuciones previas que debes verificar o aplicar ANTES de correr los tests:**
> 1. **Timeouts Reales:** Asegúrate de configurar un timeout amplio en el archivo `.spec.ts` correspondiente (ej. `test.setTimeout(300000);` es decir, 5 minutos) para tolerar la latencia de red y animaciones en el entorno local Docker.
> 2. **Consultas Seguras a DB:** Si el test usa `execSync` para sacar respuestas de PostgreSQL (`docker exec`), utiliza SIEMPRE el modo interactivo inyectando por `stdin` (`{ input: sqlQuery }`) en lugar del flag `-c`. Esto evita que la terminal de Windows corrompa las comillas simples de los enunciados.
> 3. **Sincronización UI vs DB:** Revisa la interfaz gráfica del selector de niveles de esta fase y asegúrate de que el test no intente hacer clic en niveles que no se renderizan (ej. si la UI solo renderiza 5 niveles estáticos, limita tu bucle de test a 5 niveles, aunque la DB tenga más).
> 4. **Locators Exactos:** Ajusta los textos del localizador final (ej. *"Misión Completada"*, *"Nivel Superado"*, *"Dominado"*) según lo que diga exactamente la pantalla de resultados de esa Fase en particular para evitar bucles infinitos por Timeouts.
> 5. **Prevención de 'Pregunta Espejo' y Fallos de Estado:** Valida cuidadosamente el estado de React (ej. variables como `interactiveSelectedCount` o transiciones rápidas) antes de hacer clic en enviar. Si el test va más rápido que la UI, inyecta esperas cortas (`page.waitForTimeout(300)`) entre selecciones para evitar que la UI procese envíos vacíos o duplicados (problema de 'pregunta espejo').
> 6. **Fallback de Usuarios:** Asegúrate de no usar correos hardcodeados erróneos (ej. `prueba@gmail.com`) en inyecciones SQL que bloqueen el progreso; utiliza siempre el correo dinámico E2E del test en turno.
> 
> **Instrucción final:** Retorna un **plan de implementación** explicando tu diagnóstico y enfoque por este prompt antes de ejecutar alguna acción. Una vez aprobado, corre las pruebas iterativamente corrigiendo los fallos hasta lograr el 100% de tests en verde, actualizando tu lista de tareas y entregando un `walkthrough` del reporte de bugs al terminar."
