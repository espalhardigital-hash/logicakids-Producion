# Reporte de Incidencia: Error de Permisos en PostgreSQL 15+

## 📝 Descripción del Problema
Al intentar realizar el despliegue inicial de LogicaKids Pro y ejecutar la inicialización de la base de datos (o al dejar que el backend lo intentara automáticamente), el sistema arrojaba el siguiente error:

```text
asyncpg.exceptions.InsufficientPrivilegeError: permission denied for schema public
```

Esto impedía el registro de usuarios y bloqueaba completamente el funcionamiento de la aplicación porque la tabla `users` (y el resto de las tablas pedagógicas) no podían ser creadas. A simple vista, el sistema se quejaba de un error de "tabla no existente" (`UndefinedTableError: relation "users" does not exist`).

## 🔍 Causa Raíz
El problema no era un error de código, sino una **política de seguridad estricta introducida en PostgreSQL 15**. 

En versiones antiguas de PostgreSQL, cualquier usuario que pudiera conectarse a una base de datos podía crear tablas en el esquema por defecto llamado `public`. A partir de PostgreSQL 15, **se eliminó el permiso de creación (`CREATE`) en el esquema `public` para todos los usuarios (excepto el dueño de la base de datos o el superusuario)**.

En nuestro caso:
1. El contenedor de base de datos fue inicializado con un súper-administrador llamado `amilcar_Usuario`.
2. La aplicación se conectaba usando el usuario de aplicación `sumas_user`.
3. Al intentar que el backend creara las tablas, PostgreSQL bloqueaba la operación porque `sumas_user` era un usuario sin privilegios y el esquema `public` estaba protegido.

---

## 🛡️ Cómo evitar este problema en futuras instalaciones (Nuevos VPS)

Cuando vayas a instalar LogicaKids Pro en un nuevo VPS o servidor usando Portainer o Docker Compose, asegúrate de seguir una de estas dos estrategias para evitar bloqueos:

### Opción 1: Crear la Base de Datos correctamente desde el inicio (Recomendado)
Si vas a crear la base de datos usando el usuario `postgres` o un superusuario, asegúrate de asignar al usuario de la aplicación como el **dueño absoluto** de la base de datos al momento de crearla.

```sql
-- Ejecutar como superusuario
CREATE ROLE sumas_user WITH LOGIN PASSWORD 'tu_password';
CREATE DATABASE matematicaskids OWNER sumas_user;
```
Al ser el `OWNER` de la base de datos, `sumas_user` tendrá implícitamente control total sobre el esquema `public` de esa base de datos.

### Opción 2: Otorgar los permisos explícitos en el esquema (Si la DB ya existe)
Si estás compartiendo una instancia de PostgreSQL (como `base_postgres_general`) donde un superusuario (ej: `amilcar_Usuario`) ya creó la base de datos y solo asignó acceso a `sumas_user`, **debes ejecutar este paso de configuración inicial obligatoriamente** antes de levantar el backend:

1. Entra a la consola de PostgreSQL usando el usuario administrador:
   ```bash
   psql -U administrador -d nombre_base_datos
   ```
2. Otorga poder total sobre el esquema al usuario de la aplicación:
   ```sql
   ALTER SCHEMA public OWNER TO usuario_aplicacion;
   GRANT ALL ON SCHEMA public TO usuario_aplicacion;
   GRANT CREATE ON DATABASE nombre_base_datos TO usuario_aplicacion;
   ```

### Opción 3: Variables de Entorno en Docker Compose
Si estás levantando tu propio contenedor de PostgreSQL exclusivo para esta app, usa las variables por defecto en tu `docker-compose.yml` para que Docker inicialice todo correctamente y asigne los permisos automáticos al iniciar el contenedor por primera vez:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: sumas_user
      POSTGRES_PASSWORD: tu_password_seguro
      POSTGRES_DB: matematicaskids
```
*(De esta forma, Docker hace que `sumas_user` nazca siendo superusuario de este contenedor aislado y el error de permisos nunca ocurrirá).*

## ✅ Resumen de la Intervención de Hoy
- Se actualizó el código del backend para prevenir fallos por ENUMs (`native_enum=False`).
- Se localizó al superusuario oculto del sistema (`amilcar_Usuario`).
- Se ejecutaron los comandos de elevación de privilegios para `sumas_user`.
- Las tablas se crearon correctamente con el script manual `setup_db.py`.
