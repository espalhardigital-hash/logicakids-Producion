---
name: creacion_base_datos
description: Guía e instrucciones para la creación de una nueva base de datos en el contenedor PostgreSQL local (gestionado por Portainer o Docker) cuando se inicia un nuevo proyecto backend.
---

# Creación de Base de Datos para Nuevos Proyectos

Esta habilidad instruye al asistente sobre cómo crear y configurar una base de datos PostgreSQL en el entorno local cada vez que se inicia un nuevo proyecto backend.

## Flujo de Trabajo para Crear la Base de Datos

Cuando se requiera crear una base de datos para un nuevo proyecto, el asistente debe seguir los siguientes pasos:

### 1. Identificar el Contenedor de PostgreSQL Local
Por defecto, el entorno utiliza un contenedor de PostgreSQL local (gestionado a través de Docker/Portainer). 
* **Nombre del contenedor típico:** `logicakids_local_db` (o el correspondiente al stack activo).
* **Usuario administrador:** `postgres` o el usuario root configurado (ej. `logicakids_local_user`).

### 2. Ejecutar el Comando de Creación de la Base de Datos
El asistente puede proponer o ejecutar (con aprobación del usuario) un comando en PowerShell para crear la base de datos directamente usando `docker exec` sin necesidad de entrar manualmente a Portainer:

```powershell
# Reemplazar <nombre_base_datos> con el nombre de la BD del nuevo proyecto
docker exec -i logicakids_local_db psql -U logicakids_local_user -d postgres -c "CREATE DATABASE <nombre_base_datos>;"
```

*Nota: Si se requieren permisos adicionales o un usuario exclusivo para la nueva base de datos, se pueden ejecutar sentencias adicionales de SQL:*
```powershell
docker exec -i logicakids_local_db psql -U logicakids_local_user -d postgres -c "CREATE USER <nuevo_usuario> WITH PASSWORD '<contraseña>';"
docker exec -i logicakids_local_db psql -U logicakids_local_user -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE <nombre_base_datos> TO <nuevo_usuario>;"
```

### 3. Verificar la Creación de la Base de Datos
Para listar las bases de datos y confirmar que se ha creado correctamente:
```powershell
docker exec -i logicakids_local_db psql -U logicakids_local_user -d postgres -c "\l"
```

### 4. Configurar el Archivo `.env` del Nuevo Proyecto
Una vez creada la base de datos, se debe guiar al usuario para configurar o crear su archivo `.env` o `.env.local` en el nuevo proyecto backend, utilizando los siguientes datos de conexión base:

```env
DB_HOST=localhost
DB_PORT=5433  # Puerto expuesto en el host local
DB_NAME=<nombre_base_datos>
DB_USER=logicakids_local_user
DB_PASSWORD=LogicaKids2026#Local
```
