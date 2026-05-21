-- Script de actualización manual para la Base de Datos (PostgreSQL)
-- Este script crea las tablas y columnas necesarias para la Fase 2 de LogicaKids.
-- El técnico de mantenimiento debe ejecutar este archivo directamente en la base de datos (por ejemplo, vía pgAdmin o psql)

-- 1. Agregar columna payload_tokenizado a la tabla preguntas (si no existe)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='preguntas' AND column_name='payload_tokenizado'
    ) THEN 
        ALTER TABLE preguntas ADD COLUMN payload_tokenizado JSON;
    END IF; 
END $$;

-- 2. Crear tabla intento_preguntas (Rastreo multi-paso de Fase 2)
CREATE TABLE IF NOT EXISTS intento_preguntas (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id),
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id),
    aprobada_completa BOOLEAN DEFAULT FALSE NOT NULL,
    intentos_totales INTEGER DEFAULT 0 NOT NULL,
    tiempo_total DOUBLE PRECISION DEFAULT 0 NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_intento_preguntas_id ON intento_preguntas(id);

-- 3. Crear tabla intento_pasos (Rastreo granular por pasos de Fase 2)
CREATE TABLE IF NOT EXISTS intento_pasos (
    id SERIAL PRIMARY KEY,
    intento_pregunta_id INTEGER NOT NULL REFERENCES intento_preguntas(id) ON DELETE CASCADE,
    paso_numero INTEGER NOT NULL,
    respuesta_dada VARCHAR(255),
    es_correcta BOOLEAN NOT NULL,
    tipo_error_detectado VARCHAR(50),
    es_espejo BOOLEAN DEFAULT FALSE NOT NULL,
    tiempo_respuesta DOUBLE PRECISION,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_intento_pasos_id ON intento_pasos(id);

-- 4. Opcional: Actualizar la versión de Alembic (para que el sistema sepa que esta migración ya se aplicó)
-- Descomentar y ejecutar si se está utilizando alembic para el control de versiones en producción.
-- UPDATE alembic_version SET version_num = 'a1b2c3d4e5f6' WHERE version_num = '777e2bd6bd57';
