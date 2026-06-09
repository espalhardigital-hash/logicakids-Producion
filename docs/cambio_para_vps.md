# 🔄 Cambios para Restaurar Conexión VPS

> **Propósito**: Este documento lista los cambios exactos que el agente debe realizar cuando se restaure la conexión SSH con la VPS para volver a la estrategia de desarrollo remota.

---

## Contexto

Se migró temporalmente a un entorno 100% local debido a la pérdida de conexión SSH con la VPS (`rominejo@34.9.51.225`). Los archivos de configuración para desarrollo remoto y producción fueron preservados intactos en:

- `D:\Antigravity\APP_Logica_Matematicas_kids\Datos_Desarrollo\` (`.env` + `docker-compose_desarrollo.yml`)
- `D:\Antigravity\APP_Logica_Matematicas_kids\Datos_Producion\` (`.env` + `docker-compose_Producion.yml`)

---

## Checklist de Restauración

### 1. Verificar Conectividad SSH

```bash
ssh rominejo@34.9.51.225
```

Si la conexión es exitosa, proceder con los siguientes pasos.

---

### 2. Restaurar `playwright.config.ts`

**Archivo**: `docs/Pruebas_y_Test_Unitario/playwright.config.ts`

```diff
-    baseURL: process.env.TEST_URL || 'http://localhost:3000',
+    baseURL: process.env.TEST_URL || 'https://logica.espalhar.shop',
```

**Nota**: Esto solo si se desea que los tests apunten por defecto al VPS. Puede mantenerse `localhost` si se prefiere ejecutar tests locales.

---

### 3. Restaurar `.env` de Pruebas (si necesario)

**Archivo**: `docs/Pruebas_y_Test_Unitario/.env`

El archivo `.env` original ya existe con la configuración del túnel SSH:
- `DATABASE_URL` apunta a `host.docker.internal:5432` (túnel SSH)
- `SKIP_DB_ALTERATIONS=true` (protege la BD de desarrollo)
- `SEED_DB=false`

**No requiere cambios** — fue preservado intacto.

---

### 4. Actualizar `docker-compose.local.yml` para Modo VPS

Si se desea volver a usar el `docker-compose.local.yml` con la BD remota:

```diff
# Eliminar servicios locales (postgres, redis, minio, minio-setup)
# Cambiar env_file de .env.local a .env
- env_file:
-   - .env.local
+ env_file:
+   - .env
```

O simplemente usar `.env` con el docker-compose original:

```bash
docker compose -f docker-compose.local.yml --env-file .env up -d --build
```

**Alternativa recomendada**: Mantener ambos archivos (`.env` y `.env.local`) y elegir cuál usar según el contexto.

---

### 5. Restablecer Túnel SSH (si aplica)

Para ejecutar las pruebas locales contra la BD de desarrollo remota, se necesita el túnel SSH:

```bash
ssh -L 5432:localhost:5432 rominejo@34.9.51.225
```

Esto hace que `host.docker.internal:5432` (desde Docker) llegue al PostgreSQL del VPS.

---

### 6. Redesplegar Stacks en VPS

Si hubo cambios de código durante el período local:

```bash
# En la VPS, actualizar el repositorio
cd /ruta/al/proyecto
git pull origin desarrollo

# Redesplegar via Portainer o docker compose
sudo docker compose -p logicakids_desarrollo up -d --build
```

**Recordar**: Usar siempre `-p logicakids_desarrollo` para evitar duplicación de proyectos Docker.

---

### 7. Sincronizar Datos de BD (si necesario)

Si se crearon datos importantes en la BD local que deben sincronizarse con la BD de desarrollo:

1. **Exportar datos locales**:
   ```bash
   docker exec logicakids_local_db pg_dump -U logicakids_local_user -d logicakids_local --data-only > local_data_dump.sql
   ```

2. **Importar en VPS** (con precaución):
   ```bash
   # Revisar manualmente el dump antes de importar
   ssh rominejo@34.9.51.225
   psql -U logicakids_admin_desarrollo -d bd_logicakids_desarrollo < local_data_dump.sql
   ```

> ⚠️ **PRECAUCIÓN**: No ejecutar automáticamente. Revisar el dump para evitar conflictos de datos.

---

### 8. Actualizar `gemini.md` (Opcional)

Si se desea revertir la sección "Modo de Pruebas Locales" del `gemini.md`, se puede:
- Eliminar la sección `## 5. Modo de Pruebas Locales`
- O mantenerla como referencia para futuros cortes de conexión

---

### 9. Archivos que NO Necesitan Cambios

Los siguientes archivos/directorios fueron **preservados intactos** y no requieren ninguna acción:

| Directorio/Archivo | Estado |
|---|---|
| `Datos_Desarrollo/.env` | ✅ Intacto |
| `Datos_Desarrollo/docker-compose_desarrollo.yml` | ✅ Intacto |
| `Datos_Producion/.env` | ✅ Intacto |
| `Datos_Producion/docker-compose_Producion.yml` | ✅ Intacto |
| `LogicaMath/backend/` (código fuente) | ✅ Sin cambios por la migración local |
| `LogicaMath/frontend/` (código fuente) | ✅ Sin cambios por la migración local |
| `docs/Pruebas_y_Test_Unitario/.env` (original) | ✅ Intacto |

---

### 10. Limpieza de Infraestructura Local (Opcional)

Para liberar recursos locales tras restaurar la VPS:

```bash
# Detener y eliminar contenedores locales
docker compose -f docs/Pruebas_y_Test_Unitario/docker-compose.local.yml down

# Si desea eliminar también los datos persistidos (volúmenes):
docker compose -f docs/Pruebas_y_Test_Unitario/docker-compose.local.yml down -v

# Eliminar imágenes de build local
docker image rm logicakids_local_backend logicakids_local_frontend 2>/dev/null
```

---

## Resumen de Archivos Modificados Durante la Migración Local

| Archivo | Cambio Realizado | Acción para Revertir |
|---|---|---|
| `docs/Pruebas_y_Test_Unitario/docker-compose.local.yml` | Reestructurado con PostgreSQL+Redis+MinIO locales | Revertir a versión sin servicios locales, o mantener ambas versiones |
| `docs/Pruebas_y_Test_Unitario/.env.local` | Creado nuevo | Puede mantenerse como alternativa local |
| `docs/Pruebas_y_Test_Unitario/playwright.config.ts` | baseURL → `localhost:3000` | Revertir a `logica.espalhar.shop` |
| `docs/Pruebas_y_Test_Unitario/README.md` | Documentación actualizada para flujo local | Actualizar con flujo dual (local + VPS) |
| `docs/Pruebas_y_Test_Unitario/instrucciones_agente_tester.md` | Setup local como predeterminado | Restaurar VPS como opción principal |
| `gemini.md` | Agregada sección 5 (control total local) | Eliminar o marcar como inactiva |
