# 🐘 Setup y Configuración Inicial de PostgreSQL para LogicaKids

Este documento consolida las instrucciones obligatorias para preparar la base de datos PostgreSQL para la aplicación LogicaKids en un nuevo entorno o Máquina Virtual. Es vital seguir este documento como **primer paso** antes de intentar levantar el backend, especialmente debido a las políticas de seguridad estrictas introducidas en PostgreSQL 15+.

---

## 1. Estrategias de Instalación y Conexión Inicial

A partir de PostgreSQL 15, se eliminó el permiso de creación (`CREATE`) en el esquema `public` para todos los usuarios, excepto el dueño de la base de datos (`OWNER`) o el superusuario. Si no se configura correctamente desde el inicio, el backend fallará al intentar crear las tablas con el error: `asyncpg.exceptions.InsufficientPrivilegeError: permission denied for schema public`.

Dependiendo de cómo decidas instalar PostgreSQL, sigue **una** de las siguientes opciones:

### Opción A: Despliegue Aislado con Docker Compose (Recomendado)
Si estás levantando tu propio contenedor de PostgreSQL exclusivo para esta app, usa las variables por defecto en tu `docker-compose.yml`. De esta forma, Docker asignará los permisos de superusuario automáticamente al iniciar el contenedor por primera vez.

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: logicakids_user
      POSTGRES_PASSWORD: tu_password_seguro
      POSTGRES_DB: logicakids
```

### Opción B: Instalación de PostgreSQL directamente en la Máquina Virtual (Ubuntu/Debian)
Si prefieres instalar la base de datos directamente en el sistema operativo del VPS:

1. Instala PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib -y
   sudo systemctl status postgresql
   ```

2. Entra a la consola de PostgreSQL usando el superusuario:
   ```bash
   sudo -u postgres psql
   ```

3. **CREACIÓN DE LA BASE DE DATOS Y USUARIO (CRÍTICO):** Crea el usuario y la base de datos asignando al nuevo usuario como `OWNER`. Esto evitará los problemas de permisos en PostgreSQL 15+:
   ```sql
   -- Crear el usuario
   CREATE ROLE logicakids_user WITH LOGIN PASSWORD 'tu_password_seguro';

   -- Crear la base de datos (solo si no existe)
   CREATE DATABASE logicakids OWNER logicakids_user;

   \q
   ```

### Opción C: Compartiendo una instancia de PostgreSQL (Base de datos ya existente)
Si estás compartiendo una instancia de PostgreSQL donde un superusuario diferente ya creó la base de datos y solo asignó acceso a `logicakids_user`, **debes ejecutar este paso obligatoriamente** para evitar el error de permisos en el esquema `public`:

1. Entra a la consola de PostgreSQL usando el usuario administrador:
   ```bash
   psql -U administrador_general -d logicakids
   ```

2. Otorga poder total sobre el esquema `public` al usuario de la aplicación:
   ```sql
   ALTER SCHEMA public OWNER TO logicakids_user;
   GRANT ALL ON SCHEMA public TO logicakids_user;
   GRANT CREATE ON DATABASE logicakids TO logicakids_user;
   \q
   ```

---

## 2. Inicialización de la Estructura y Datos (Seed)

Una vez que la base de datos está creada y el usuario tiene los permisos correctos, debes crear las tablas e insertar los datos iniciales (Fases, Reglas de Progreso y Usuario Admin).

### Forma Recomendada: Automatizada (Python Seed Script)

El proyecto incluye un script de "Seed" que crea las tablas si no existen e inserta toda la configuración pedagógica inicial y el usuario administrador.

1. Configura tu archivo `.env` del backend:
   ```env
   DATABASE_URL=postgresql+asyncpg://logicakids_user:tu_password_seguro@localhost:5432/logicakids
   DB_PASSWORD=tu_password_seguro
   ```

2. Ejecuta el seed desde la raíz del backend:
   ```bash
   # Esto crea tablas + Fases + Reglas + Admin
   python seed_pedagogico.py
   ```
   *Credenciales generadas por defecto:*
   - **Admin Email:** `admin@pedroii.edu.br`
   - **Admin Password:** `admin123`

---

## 3. Creación de Usuarios (Manual)

Si necesitas crear usuarios adicionales (Administradores o Alumnos) manualmente vía SQL, sigue estos ejemplos. **Nota:** Debes usar un UUID válido y un hash de contraseña compatible con `bcrypt`.

### Crear un Administrador (Manual)
```sql
-- 1. Insertar en la tabla users
INSERT INTO users (id, username, email, password_hash, role, status, created_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'admin_vps', 
    'vps@logicakids.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L9E.D6K4E.vF.q.', -- Hash para 'admin123'
    'ADMIN', 
    'ACTIVE', 
    CURRENT_TIMESTAMP
);
```

### Crear un Alumno de Prueba (Manual)
Un alumno requiere un registro en `users` (para login) y otro en `alumnos` (perfil pedagógico).

```sql
-- 1. Crear el usuario (Login)
INSERT INTO users (id, username, email, password_hash, role, status, created_at)
VALUES (
    'alumno-uuid-prueba-001', 
    'alumno_test', 
    'test@logicakids.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L9E.D6K4E.vF.q.', -- Hash para 'admin123'
    'USER', 
    'ACTIVE', 
    CURRENT_TIMESTAMP
);

-- 2. Crear el perfil pedagógico (Alumno) vinculándolo al user_id
INSERT INTO alumnos (user_id, nombre, edad, fase_actual_id, estado, fecha_creacion)
VALUES (
    'alumno-uuid-prueba-001', 
    'Alumno de Prueba', 
    10, 
    1, -- Fase 0 (Operaciones Elementales)
    'activo', 
    CURRENT_TIMESTAMP
);
```

---

## 4. Script SQL Manual (Solo Estructura)

Si prefieres (o necesitas) crear **únicamente la estructura** manualmente vía SQL sin usar el script de Python, aquí tienes el script completo.

```sql
-- ========================================================
-- MIGRACIÓN INICIAL: LOGICAKIDS (ESTRUCTURA COMPLETA)
-- ========================================================

-- Habilitar extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR,
    role VARCHAR DEFAULT 'USER',
    status VARCHAR DEFAULT 'ACTIVE',
    avatar VARCHAR,
    settings JSONB DEFAULT '{}'::jsonb,
    unlocked_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 2. TABLA: fases
CREATE TABLE IF NOT EXISTS fases (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    estado VARCHAR NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    edad INTEGER,
    fase_actual_id INTEGER REFERENCES fases(id) ON DELETE SET NULL,
    estado VARCHAR NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: preguntas
CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
    seccion INTEGER NOT NULL,
    sub_nivel INTEGER,
    operacion VARCHAR NOT NULL,
    tipo_pregunta VARCHAR NOT NULL,
    enunciado TEXT NOT NULL,
    respuesta_correcta VARCHAR(255) NOT NULL,
    datos_numericos JSONB,
    explicacion_paso_a_paso JSONB,
    requiere_subrayado BOOLEAN DEFAULT FALSE NOT NULL,
    palabras_clave JSONB,
    errores_previstos JSONB,
    creado_por VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    modificado_por VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    estado VARCHAR NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_preguntas_fase_seccion_operacion_estado ON preguntas(fase_id, seccion, operacion, estado);

-- 5. TABLA: alternativas
CREATE TABLE IF NOT EXISTS alternativas (
    id SERIAL PRIMARY KEY,
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    texto VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE NOT NULL,
    orden INTEGER,
    tipo_error VARCHAR,
    feedback_error TEXT,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alternativas_pregunta ON alternativas(pregunta_id);

-- 6. TABLA: configuracion_progreso
CREATE TABLE IF NOT EXISTS configuracion_progreso (
    id SERIAL PRIMARY KEY,
    fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
    seccion INTEGER NOT NULL,
    operacion VARCHAR NOT NULL,
    cantidad_requerida INTEGER NOT NULL,
    porcentaje_aprobacion INTEGER NOT NULL,
    orden_desbloqueo INTEGER NOT NULL,
    tipo_feedback VARCHAR(20) DEFAULT 'simple' NOT NULL,
    usa_cronometro BOOLEAN DEFAULT FALSE NOT NULL,
    tiempo_default_segundos INTEGER,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_config_fase_seccion_operacion UNIQUE (fase_id, seccion, operacion)
);
CREATE INDEX IF NOT EXISTS idx_config_fase_seccion_operacion ON configuracion_progreso(fase_id, seccion, operacion);

-- 7. TABLA: pool_asignado_alumno
CREATE TABLE IF NOT EXISTS pool_asignado_alumno (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
    seccion INTEGER NOT NULL,
    operacion VARCHAR NOT NULL,
    respondida_correctamente BOOLEAN DEFAULT FALSE NOT NULL,
    respondida_alguna_vez BOOLEAN DEFAULT FALSE NOT NULL,
    numero_intentos INTEGER DEFAULT 0 NOT NULL,
    fecha_asignacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pool_alumno_pregunta UNIQUE (alumno_id, pregunta_id)
);
CREATE INDEX IF NOT EXISTS idx_pool_alumno_bloque ON pool_asignado_alumno(alumno_id, fase_id, seccion, operacion);
CREATE INDEX IF NOT EXISTS idx_pool_pendientes ON pool_asignado_alumno(alumno_id, fase_id, seccion, operacion, respondida_correctamente);

-- 8. TABLA: progreso_maestria
CREATE TABLE IF NOT EXISTS progreso_maestria (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
    seccion INTEGER NOT NULL,
    operacion VARCHAR NOT NULL,
    estado VARCHAR DEFAULT 'bloqueado' NOT NULL,
    aciertos_acumulados INTEGER DEFAULT 0 NOT NULL,
    intentos_totales INTEGER DEFAULT 0 NOT NULL,
    porcentaje_actual INTEGER DEFAULT 0 NOT NULL,
    fecha_inicio TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP WITHOUT TIME ZONE,
    ultima_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_progreso_alumno_fase_seccion_operacion UNIQUE (alumno_id, fase_id, seccion, operacion)
);
CREATE INDEX IF NOT EXISTS idx_progreso_alumno_fase ON progreso_maestria(alumno_id, fase_id);
CREATE INDEX IF NOT EXISTS idx_progreso_alumno_estado ON progreso_maestria(alumno_id, estado);

-- 9. TABLA: intentos
CREATE TABLE IF NOT EXISTS intentos (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    alternativa_id INTEGER REFERENCES alternativas(id) ON DELETE SET NULL,
    respuesta_dada VARCHAR(255),
    es_correcta BOOLEAN NOT NULL,
    fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
    seccion INTEGER NOT NULL,
    operacion VARCHAR NOT NULL,
    tipo_error VARCHAR,
    feedback_mostrado TEXT,
    explicacion_mostrada JSONB,
    tiempo_respuesta_segundos DOUBLE PRECISION,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_intentos_alumno_fecha ON intentos(alumno_id, fecha);
CREATE INDEX IF NOT EXISTS idx_intentos_alumno_bloque ON intentos(alumno_id, fase_id, seccion, operacion);
CREATE INDEX IF NOT EXISTS idx_intentos_pregunta ON intentos(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_intentos_tipo_error ON intentos(tipo_error);

-- 10. TABLA: platform_settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_platform_settings_key ON platform_settings(key);

-- ========================================================
-- FIN DEL SCRIPT
-- ========================================================
```
