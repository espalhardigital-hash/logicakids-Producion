# Permisos y Restricciones del Agente (Antigravity AI)

Este documento detalla las capacidades, herramientas, permisos y restricciones actuales bajo los cuales opera el agente en este entorno de trabajo.

---

## 1. Directorios de Trabajo y Acceso a Archivos

### Directorios con Acceso Total (Lectura y Escritura)
* **Workspace Activo**: `d:\Antigravity\APP_Logica_Matematicas_kids` (Cualquier archivo de código del proyecto debe ser editado aquí).
* **Directorio de Datos del Agente**: `C:\Users\Rominejo\.gemini\antigravity-ide\`
  * `scratch/` (Para scripts temporales o de prueba).
  * `browser_recordings/` (Donde se graban las sesiones de navegación automatizadas).
  * `html_artifacts/` (Para almacenar artefactos UI/UX interactivos).
  * `knowledge/` (Información del sistema de conocimiento local).
  * `worktrees/` (Para ramas de trabajo git secundarias).
  * `skills/` (Librerías de scripts y habilidades del asistente).

### Archivos Específicos Permitidos
* **Lectura**: 
  * `D:\Antigravity\Apps_LogicaKids - Desarrollo\.env`
  * `d:\Antigravity\logica kig clone dase 2 producion\.env`
  * `D:\Antigravity\APP_Logica_Matematicas_kids\.env`
  * `.env` y configuraciones en `D:\Antigravity\APP_Logica_Matematicas_kids\Datos_Desarrollo\` (Entorno de Desarrollo)
  * `.env` y configuraciones en `D:\Antigravity\APP_Logica_Matematicas_kids\Datos_Producion\` (Entorno de Producción)

### Diferenciación de Entornos (Desarrollo vs. Producción)
El agente **debe diferenciar estrictamente** según el contexto indicado en el prompt del usuario:
* **Entorno de Desarrollo**: Utiliza los archivos ubicados en `d:\Antigravity\APP_Logica_Matematicas_kids\Datos_Desarrollo` (su `.env` y su `docker-compose_desarrollo.yml`).
* **Entorno de Producción**: Utiliza los archivos ubicados en `d:\Antigravity\APP_Logica_Matematicas_kids\Datos_Producion` (su `.env` y su `docker-compose_Producion.yml`).
* **Regla**: El agente **bajo ninguna circunstancia debe confundir o mezclar** estos archivos de configuración, debiendo operar exclusivamente sobre el directorio correspondiente a la orden dada por el usuario.

### Permisos que Requieren Confirmación Explícita ("Ask")
Para interactuar con cualquiera de los siguientes archivos de configuración o credenciales sensibles, el agente solicitará permiso explícito al usuario en tiempo de ejecución:
* Lectura de archivos `.env` generales del sistema (ej: `.env.local`, `.env.production`, `.env.development`, `.env.staging`).
* Archivos de credenciales de paquetes/sistemas: `.npmrc`, `.pypirc`, `.netrc`, `.git-credentials`.
* Archivo de configuración global de MCP: `mcp_config.json`.
* Modificación de archivos de habilidades en: `C:\Users\Rominejo\.gemini\skills`.
* Ciertos ganchos de ejecución (`hooks.json`) y sidecars.
* Peticiones web a dominios no listados explícitamente (`read_url(*)`).

### Denegados de Forma Estricta ("Denied")
* **Escritura en cualquier archivo `.env`** (todos los archivos `.env` son estrictamente de solo lectura para el agente).
* Acceso a directorios del sistema de configuración de Gemini y la IDE:
  * `C:\Users\Rominejo\.gemini\antigravity-ide` (A nivel raíz).
  * `C:\Users\Rominejo\.gemini\config`
  * `config.json` e `initial_projects.json`.
* Escritura en la base de datos de configuraciones de MCP o historial de conversaciones.

---

## 2. Permisos de Red y Conectividad

### Dominios Permitidos Directamente
El agente puede realizar consultas HTTP de manera directa (Lectura de contenido) a:
* `logica.espalhar.shop`
* `matematicas.espalhar.shop`
* Conexiones locales sobre `localhost`.

---

## 3. Ejecución de Comandos en Consola (Shell)

### Entorno
* **Sistema Operativo**: Windows (PowerShell).
* **Restricción de cd**: El agente **NUNCA** propondrá un comando `cd` independiente en la consola. En su lugar, utiliza el parámetro `Cwd` provisto por las herramientas de ejecución.

### Comandos de Ejecución Libre
* `echo`
* `date`

### Comandos de Ejecución General (Requieren Confirmación del Usuario)
Cualquier otro comando propuesto en PowerShell (ej: `git`, `docker`, `docker compose`, `ssh`, `scp`, `npm`, `python3`) es enviado a una cola de aprobación. El usuario debe aceptarlo o rechazarlo manualmente a través de la interfaz antes de que se ejecute en el sistema local.

### Restricción de Operaciones Git
* El agente **NUNCA** ejecutará de forma automática comandos que alteren el historial remoto o local como `git commit` o `git push`, a menos que el usuario lo autorice o solicite de forma expresa y explícita en su prompt.
* **Principio 1**: El agente **NUNCA** realizará operaciones que actualicen el repositorio de GitHub (como `git commit` o `git push`) sin que el usuario lo haya solicitado de manera expresa y explícita en el prompt de la conversación actual.
* **Principio 2**: Cuando el usuario solicite de manera expresa actualizar el repositorio de GitHub, el agente operará **exclusivamente sobre la rama de desarrollo** (`desarrollo`). Bajo ninguna circunstancia se actualizará la rama o el repositorio de producción a menos que el prompt de la conversación lo requiera de forma explícita y expresa.



### Acceso y Control de VPS / Docker
* **Conexión a VPS**: El agente tiene permiso para conectarse a la VPS utilizando los datos y credenciales definidos en los archivos `.env` (ej: `rominejo@34.9.51.225`).
* **Gestión de Contenedores y Stacks**: El agente está autorizado a reiniciar, detener o redesplegar contenedores **únicamente de los stacks oficiales existentes** con el fin de resolver fallos y mantener la funcionalidad.
* **Restricción de Creación de Contenedores**: El agente **NUNCA** creará nuevos contenedores, redes o stacks de forma independiente, a menos que el usuario lo autorice o solicite de forma explícita en su prompt.
* **Garantía de No Duplicidad (Uso Obligatorio de -p)**: Para evitar que Docker Compose genere proyectos duplicados basados en el nombre de la carpeta (como `datos_desarrollo`), el agente **siempre** deberá especificar explícitamente el nombre del proyecto mediante `-p` en cualquier comando `docker compose` en la VPS (ej: `sudo docker compose -p logicakids_desarrollo ...` o `sudo docker compose -p matematicas-producion ...`).
* **Flujo de Despliegue (Git-First)**: El despliegue de cambios en la VPS debe realizarse preferentemente actualizando el repositorio de GitHub (previa autorización del usuario) y redesplegando el stack desde la interfaz web de Portainer. El agente **evitará** ejecutar `docker compose up` directamente desde la consola del VPS a menos que sea la única alternativa y cuente con aprobación explícita.


---

## 4. Herramientas del Sistema Disponibles

El agente tiene acceso a las siguientes API/Herramientas para interactuar con el espacio de trabajo:

| Herramienta | Propósito |
| :--- | :--- |
| `list_permissions` | Permite verificar los permisos activos de lectura/escritura y red del agente. |
| `list_dir` | Lista el contenido de un directorio en el sistema local (directorios y archivos). |
| `view_file` | Muestra el contenido de archivos de texto o binarios (imágenes, PDF, audios). |
| `write_to_file` | Crea nuevos archivos o sobrescribe archivos existentes (con metadatos opcionales). |
| `replace_file_content` | Edita un bloque único y contiguo de líneas en un archivo existente. |
| `multi_replace_file_content` | Realiza múltiples ediciones no contiguas en un mismo archivo simultáneamente. |
| `run_command` | Propone un comando para ejecutar en la terminal (sujeto a aprobación). |
| `grep_search` | Realiza búsquedas de texto plano o expresiones regulares usando Ripgrep. |
| `search_web` | Realiza búsquedas de información y documentación en la web. |
| `read_url_content` | Descarga y convierte a markdown el contenido estático de una URL sin ejecutar JS. |
| `browser_subagent` | Inicia una sesión interactiva de navegador automatizada para interactuar con aplicaciones web complejas. |
| `generate_image` | Genera imágenes o interfaces de usuario usando IA generativa. |
| `ask_permission` | Solicita permisos adicionales en tiempo de ejecución tras un error de denegación. |
| `ask_question` | Presenta preguntas de opción múltiple interactiva en la interfaz de usuario. |
| `manage_task` | Lista, cancela o envía inputs a los comandos que corren en segundo plano. |
| `schedule` | Programa temporizadores únicos o tareas automatizadas recurrentes (cron). |
