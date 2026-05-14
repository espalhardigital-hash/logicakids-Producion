# Guía de Despliegue - LogicaKids Pro

## Arquitectura

```text
PostgreSQL (base_postgres_general) ← Backend (FastAPI) ← Frontend (React/Vite)
MinIO (Almacenamiento S3)          ←
```

La plataforma está diseñada para ser desplegada en un servidor o VPS mediante contenedores **Docker** y expuesta a través de **Traefik** como proxy inverso y gestor de certificados SSL.

## Prerrequisitos en el Servidor (VPS)
1. **Docker y Docker Compose** instalados.
2. **PostgreSQL** corriendo (ej. en un contenedor llamado `base_postgres_general`) con la base de datos para el proyecto ya creada.
3. **MinIO** corriendo y configurado (bucket creado, Access Key y Secret Key disponibles).
4. **Redes Docker**: 
   - `traefik_proxy` (para exposición a Internet).
   - `internal_services` (para conexión con bases de datos u otros servicios internos).

## Pasos de Despliegue

### 1. Preparar el Proyecto
Clona el repositorio oficial en el servidor y ubícate en el directorio del proyecto:
```bash
git clone https://github.com/espalhardigital-hash/logicakids.git
cd logicakids
```
*(También puedes usar SSH: `git clone git@github.com:espalhardigital-hash/logicakids.git`)*

### 2. Configurar Variables de Entorno
Crea el archivo `.env` a partir del ejemplo proporcionado:
```bash
cp .env.example .env
nano .env
```

**Variables Clave en `.env`:**
- `DATABASE_URL`: Cadena de conexión a PostgreSQL (ej: `postgresql+asyncpg://usuario:PASSWORD@base_postgres_general:5432/logicakids_db`).
- `SECRET_KEY`: Clave de encriptación para tokens JWT (genera una segura).
- `S3_*`: Credenciales y configuración de conexión a MinIO.
- `VITE_API_URL`: URL pública del backend desde el frontend (ej: `https://logicakids.tudominio.com/api`).
- `ALLOWED_ORIGINS`: Dominios permitidos por CORS (ej: `https://logicakids.tudominio.com`).
- `NOMBRE_APP`: Identificador único para los routers de Traefik (ej: `logicakids`).
- `DOMINIO`: El dominio principal de la aplicación (ej: `logicakids.tudominio.com`).

### 3. Construir e Iniciar
Una vez configurado el `.env`, levanta los contenedores. El flag `--build` es necesario para inyectar correctamente las variables en el build del frontend y compilar el backend:
```bash
docker compose up -d --build
```

**Inicialización Automática:**
A diferencia de versiones anteriores, **no es necesario ejecutar scripts manuales** para inicializar la base de datos. Al iniciar el contenedor del backend, este verificará y creará automáticamente las 8 tablas pedagógicas de la arquitectura (fases, alumnos, progreso, etc.) mediante SQLAlchemy.

### 4. (Opcional) Verificación de la Base de Datos
Si deseas comprobar que la conexión se ha establecido correctamente y las tablas fueron creadas, puedes correr la suite de pruebas del backend:
```bash
docker compose exec backend python tests/test_db_connection.py
```

## Verificación del Despliegue

1. **Frontend**: Accede a `https://<DOMINIO>` → Pantalla de inicio de sesión Premium Glassmorphism.
2. **Backend API (Docs)**: Accede a `https://<DOMINIO>/api/docs` → Documentación Swagger interactiva. Traefik remueve automáticamente el prefijo `/api` hacia el backend.

## Solución de Problemas Frecuentes

- **Error de Conexión a DB ("UndefinedTableError")**: Verifica que la base de datos exista en PostgreSQL y que el contenedor esté en la red compartida (`internal_services`). Si el problema persiste, reinicia el backend para que se re-ejecute la creación automática: `docker compose restart backend`.
- **Problemas de CORS / Fallo en inicio de sesión**: Confirma que el dominio configurado en `VITE_API_URL` durante la fase de build es exacto. Si lo cambiaste en el `.env`, es **obligatorio** reconstruir la imagen del frontend: `docker compose up -d --build frontend`.
- **Errores de SSL / Certificado Inseguro**: Revisa los logs de Traefik (`docker logs traefik`) para validar que tiene permisos de resolver certificados Let's Encrypt y que los puertos 80 y 443 estén expuestos y públicos.
