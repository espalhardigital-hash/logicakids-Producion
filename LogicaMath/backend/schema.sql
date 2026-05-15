-- ========================================================
-- PLATAFORMA EDUCATIVA PEDRO II - Schema SQL (PostgreSQL)
-- ========================================================
-- Plan v4 - 8 tablas pedagogicas + users (autenticacion)
-- Este archivo es DOCUMENTACION. Las tablas se crean via
-- setup_db.py usando SQLAlchemy.
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- ENUMS
-- ========================================================

CREATE TYPE status_enum AS ENUM ('activo', 'inactivo', 'eliminado');
CREATE TYPE operacion_enum AS ENUM ('suma', 'resta', 'multiplicacion', 'division', 'mixta');
CREATE TYPE tipo_pregunta_enum AS ENUM (
    'calculo_directo', 'problema_contexto', 'problema_mixto',
    'identificar_operacion', 'multiple_opcion', 'respuesta_numerica'
);
CREATE TYPE estado_progreso_enum AS ENUM ('bloqueado', 'en_progreso', 'en_revision', 'aprobado');
CREATE TYPE tipo_error_enum AS ENUM (
    'calculo', 'lectura', 'atencion', 'operacion_incorrecta',
    'no_identifica_datos', 'problema_incompleto', 'tabuada',
    'division', 'valor_posicional', 'troco', 'inferencia'
);


-- ========================================================
-- TABLA 1: users (autenticacion - copiada del proyecto actual)
-- ========================================================

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


-- ========================================================
-- TABLA 2: fases
-- ========================================================

CREATE TABLE IF NOT EXISTS fases (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    estado status_enum DEFAULT 'activo' NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ========================================================
-- TABLA 3: alumnos
-- ========================================================

CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    edad INTEGER,
    fase_actual_id INTEGER NOT NULL DEFAULT 1,
    estado status_enum DEFAULT 'activo' NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alumnos_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_alumnos_fase FOREIGN KEY (fase_actual_id) REFERENCES fases(id)
);

CREATE INDEX IF NOT EXISTS ix_alumnos_user_id ON alumnos(user_id);


-- ========================================================
-- TABLA 4: preguntas
-- ========================================================

CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    fase_id INTEGER NOT NULL,
    seccion INTEGER NOT NULL,
    sub_nivel INTEGER,
    operacion operacion_enum NOT NULL,
    tipo_pregunta tipo_pregunta_enum NOT NULL,
    enunciado TEXT NOT NULL,
    respuesta_correcta VARCHAR(255) NOT NULL,
    datos_numericos JSONB,
    explicacion_paso_a_paso JSONB,
    requiere_subrayado BOOLEAN DEFAULT FALSE NOT NULL,
    palabras_clave JSONB,
    errores_previstos JSONB,
    creado_por VARCHAR,
    modificado_por VARCHAR,
    estado status_enum DEFAULT 'activo' NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_preguntas_fase FOREIGN KEY (fase_id) REFERENCES fases(id),
    CONSTRAINT fk_preguntas_creador FOREIGN KEY (creado_por) REFERENCES users(id),
    CONSTRAINT fk_preguntas_modificador FOREIGN KEY (modificado_por) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_preguntas_fase_seccion_operacion_estado
    ON preguntas(fase_id, seccion, operacion, estado);


-- ========================================================
-- TABLA 5: alternativas
-- ========================================================

CREATE TABLE IF NOT EXISTS alternativas (
    id SERIAL PRIMARY KEY,
    pregunta_id INTEGER NOT NULL,
    texto VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE NOT NULL,
    orden INTEGER,
    tipo_error tipo_error_enum,
    feedback_error TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alternativas_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id)
);

CREATE INDEX IF NOT EXISTS idx_alternativas_pregunta ON alternativas(pregunta_id);


-- ========================================================
-- TABLA 6: configuracion_progreso
-- ========================================================

CREATE TABLE IF NOT EXISTS configuracion_progreso (
    id SERIAL PRIMARY KEY,
    fase_id INTEGER NOT NULL,
    seccion INTEGER NOT NULL,
    operacion operacion_enum NOT NULL,
    cantidad_requerida INTEGER NOT NULL,
    porcentaje_aprobacion INTEGER NOT NULL,
    orden_desbloqueo INTEGER NOT NULL,
    tipo_feedback VARCHAR(20) DEFAULT 'simple' NOT NULL,
    usa_cronometro BOOLEAN DEFAULT FALSE NOT NULL,
    tiempo_default_segundos INTEGER,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_config_fase FOREIGN KEY (fase_id) REFERENCES fases(id),
    CONSTRAINT uq_config_fase_seccion_operacion UNIQUE (fase_id, seccion, operacion)
);

CREATE INDEX IF NOT EXISTS idx_config_fase_seccion_operacion
    ON configuracion_progreso(fase_id, seccion, operacion);


-- ========================================================
-- TABLA 7: pool_asignado_alumno
-- ========================================================

CREATE TABLE IF NOT EXISTS pool_asignado_alumno (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL,
    pregunta_id INTEGER NOT NULL,
    fase_id INTEGER NOT NULL,
    seccion INTEGER NOT NULL,
    operacion operacion_enum NOT NULL,
    respondida_correctamente BOOLEAN DEFAULT FALSE NOT NULL,
    respondida_alguna_vez BOOLEAN DEFAULT FALSE NOT NULL,
    numero_intentos INTEGER DEFAULT 0 NOT NULL,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pool_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    CONSTRAINT fk_pool_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id),
    CONSTRAINT fk_pool_fase FOREIGN KEY (fase_id) REFERENCES fases(id),
    CONSTRAINT uq_pool_alumno_pregunta UNIQUE (alumno_id, pregunta_id)
);

CREATE INDEX IF NOT EXISTS idx_pool_alumno_bloque
    ON pool_asignado_alumno(alumno_id, fase_id, seccion, operacion);

CREATE INDEX IF NOT EXISTS idx_pool_pendientes
    ON pool_asignado_alumno(alumno_id, fase_id, seccion, operacion, respondida_correctamente);


-- ========================================================
-- TABLA 8: progreso_maestria
-- ========================================================

CREATE TABLE IF NOT EXISTS progreso_maestria (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL,
    fase_id INTEGER NOT NULL,
    seccion INTEGER NOT NULL,
    operacion operacion_enum NOT NULL,
    estado estado_progreso_enum DEFAULT 'bloqueado' NOT NULL,
    aciertos_acumulados INTEGER DEFAULT 0 NOT NULL,
    intentos_totales INTEGER DEFAULT 0 NOT NULL,
    porcentaje_actual INTEGER DEFAULT 0 NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progreso_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    CONSTRAINT fk_progreso_fase FOREIGN KEY (fase_id) REFERENCES fases(id),
    CONSTRAINT uq_progreso_alumno_fase_seccion_operacion
        UNIQUE (alumno_id, fase_id, seccion, operacion)
);

CREATE INDEX IF NOT EXISTS idx_progreso_alumno_fase
    ON progreso_maestria(alumno_id, fase_id);

CREATE INDEX IF NOT EXISTS idx_progreso_alumno_estado
    ON progreso_maestria(alumno_id, estado);


-- ========================================================
-- TABLA 9: intentos
-- ========================================================

CREATE TABLE IF NOT EXISTS intentos (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL,
    pregunta_id INTEGER NOT NULL,
    alternativa_id INTEGER,
    respuesta_dada VARCHAR(255),
    es_correcta BOOLEAN NOT NULL,
    fase_id INTEGER NOT NULL,
    seccion INTEGER NOT NULL,
    operacion operacion_enum NOT NULL,
    tipo_error tipo_error_enum,
    feedback_mostrado TEXT,
    explicacion_mostrada JSONB,
    tiempo_respuesta_segundos DOUBLE PRECISION,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_intentos_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    CONSTRAINT fk_intentos_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id),
    CONSTRAINT fk_intentos_alternativa FOREIGN KEY (alternativa_id) REFERENCES alternativas(id),
    CONSTRAINT fk_intentos_fase FOREIGN KEY (fase_id) REFERENCES fases(id)
);

CREATE INDEX IF NOT EXISTS idx_intentos_alumno_fecha
    ON intentos(alumno_id, fecha);

CREATE INDEX IF NOT EXISTS idx_intentos_alumno_bloque
    ON intentos(alumno_id, fase_id, seccion, operacion);

CREATE INDEX IF NOT EXISTS idx_intentos_pregunta
    ON intentos(pregunta_id);

CREATE INDEX IF NOT EXISTS idx_intentos_tipo_error
    ON intentos(tipo_error);
