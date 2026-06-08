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
* **Escritura**:
  * `D:\Antigravity\APP_Logica_Matematicas_kids\.env`

### Permisos que Requieren Confirmación Explícita ("Ask")
Para leer o escribir cualquiera de los siguientes archivos de configuración o credenciales sensibles, el agente solicitará permiso explícito al usuario en tiempo de ejecución:
* Archivos `.env` generales del sistema (ej: `.env.local`, `.env.production`, `.env.development`, `.env.staging`).
* Archivos de credenciales de paquetes/sistemas: `.npmrc`, `.pypirc`, `.netrc`, `.git-credentials`.
* Archivo de configuración global de MCP: `mcp_config.json`.
* Modificación de archivos de habilidades en: `C:\Users\Rominejo\.gemini\skills`.
* Ciertos ganchos de ejecución (`hooks.json`) y sidecars.
* Peticiones web a dominios no listados explícitamente (`read_url(*)`).

### Denegados de Forma Estricta ("Denied")
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
