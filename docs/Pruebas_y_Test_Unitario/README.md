# 🧪 LogicaKids — Pruebas E2E

Entorno de pruebas End-to-End autocontenido para la aplicación LogicaKids, basado en [Playwright](https://playwright.dev/) y Google Chrome.

> **Documento rector:** Consulta [`instrucciones_agente_tester.md`](./instrucciones_agente_tester.md) para las reglas completas de validación.

> **⚠️ Estado actual:** Entorno **100% local** (sin conexión VPS). Cuando se restaure la conexión SSH, consultar [`cambio_para_vps.md`](../cambio_para_vps.md).

---

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **Google Chrome** instalado en el sistema
- **Docker y Docker Compose** (para levantar el stack local completo)

---

## 🚀 Instalación

```bash
# Desde esta carpeta
cd docs/Pruebas_y_Test_Unitario

# Instalar dependencias
npm install

# Instalar navegador Chromium de Playwright
npx playwright install chromium
```

---

## 🐳 Levantar el Stack Local (PostgreSQL + Redis + MinIO + Backend + Frontend)

El entorno local es completamente autocontenido. No requiere conexión a internet ni a la VPS.

### 1. Levantar todos los servicios

```bash
# Desde esta carpeta (docs/Pruebas_y_Test_Unitario)
docker compose -f docker-compose.local.yml up -d --build
```

> *Nota: La primera compilación tomará varios minutos mientras descarga imágenes e instala dependencias.*

### 2. Verificar que todo esté corriendo

```bash
docker compose -f docker-compose.local.yml ps
```

Todos los servicios deben estar en estado `running` o `healthy`:

| Servicio | Puerto Local | Descripción |
|----------|-------------|-------------|
| `logicakids_local_db` | `5433` | PostgreSQL 15 |
| `logicakids_local_redis` | `6380` | Redis 7 |
| `logicakids_local_minio` | `9100` (API) / `9101` (Console) | MinIO Storage |
| `logicakids_local_backend` | `8000` | FastAPI Backend |
| `logicakids_local_frontend` | `3000` | React Frontend |

### 3. Verificar que la API esté funcionando

```bash
curl http://localhost:8000/
# Debe retornar: {"message": "LogicaKids Pro - Backend API"}
```

### 4. Verificar la base de datos

```bash
# Listar tablas creadas
docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "\dt"

# Verificar usuarios
docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "SELECT email, role FROM users;"

# Verificar preguntas por fase
docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "SELECT fase_id, COUNT(*) FROM preguntas GROUP BY fase_id ORDER BY fase_id;"
```

### 5. Acceder al MinIO Console (para avatares)

Abrir `http://localhost:9101` en el navegador:
- **Usuario**: `logicakids_minio_admin`
- **Contraseña**: `LogicaKids2026#MinIO`

---

## ▶️ Ejecución de Pruebas

### Pruebas Locales (Recomendado)

Con el stack local levantado:

```bash
npx playwright test
```

La URL base por defecto es `http://localhost:3000`. Para usar otra URL:

```bash
TEST_URL=http://otro-host:3000 npx playwright test
```

### Ejecutar suites individuales

```bash
# 01 - Login y autenticación
npm run test:login

# 02 - Navegación por fases
npm run test:nav

# 03 - Gameplay Fase 1 (acierto, fallo, espejo)
npm run test:gameplay

# 04 - Carga de GameScreens Fases 2-6
npm run test:fases

# 05 - Progresión y desbloqueo
npm run test:progress
```

---

## 📊 Ver Reporte de Resultados

Después de ejecutar las pruebas, se genera un reporte HTML:

```bash
npm run report
```

Esto abrirá el reporte en tu navegador. Los reportes se almacenan en la carpeta `resultados/`.

---

## 📁 Estructura de Archivos

```
Pruebas_y_Test_Unitario/
├── .env                          # Config para VPS (preservado, NO usar en modo local)
├── .env.local                    # Config 100% local (PostgreSQL + Redis + MinIO locales)
├── docker-compose.local.yml      # Stack Docker completo (5 servicios)
├── instrucciones_agente_tester.md # Documento rector (reglas de prueba)
├── package.json                  # Dependencias
├── playwright.config.ts          # Configuración de Playwright
├── README.md                     # Este archivo
├── helpers/
│   ├── auth.ts                   # Login/logout del usuario de prueba
│   ├── bug-reporter.ts           # Sistema de reportes de bugs
│   ├── console-logger.ts         # Captura errores de consola del browser
│   ├── constants.ts              # Credenciales, rutas, selectores
│   ├── global-setup.ts           # Inicialización del sistema de bugs
│   ├── global-teardown.ts        # Finalización del sistema de bugs
│   └── test-fixtures.ts          # Fixtures personalizados con bug reporting
├── tests/
│   ├── 01-login.spec.ts          # Flujo de autenticación
│   ├── 02-navegacion-fases.spec.ts   # Navegación por mapa de fases
│   ├── 03-gameplay-fase1.spec.ts     # Gameplay Fase 1
│   ├── 04-gameplay-fases-genericas.spec.ts  # GameScreens Fases 2-6
│   └── 05-progresion-desbloqueo.spec.ts     # Bloqueo/desbloqueo
├── reportes_bugs/                # (Generada) Reportes de bugs
└── resultados/                   # (Generada) Reportes HTML
```

---

## 🔐 Usuarios del Sistema

| Campo       | Administrador | Prueba |
|-------------|---------------|--------|
| **Email**   | `amilcar@gmail.com` | `prueba@gmail.com` |
| **Clave**   | `Colombia1#_` | `pruebas` |
| **Rol**     | ADMIN | USER |

> ⚠️ **Nunca** usar cuentas de usuarios reales o de producción para ejecutar estas pruebas.

---

## 🧩 Suites de Prueba

| Suite | Archivo | Qué valida |
|-------|---------|------------|
| **01 - Login** | `01-login.spec.ts` | UI del login, credenciales válidas/inválidas, validaciones de campos |
| **02 - Navegación** | `02-navegacion-fases.spec.ts` | Mapa de fases, pantallas Welcome (fases 1-8) |
| **03 - Gameplay F1** | `03-gameplay-fase1.spec.ts` | Juego Fase 1, respuestas correctas/incorrectas, pregunta espejo |
| **04 - Fases 2-6** | `04-gameplay-fases-genericas.spec.ts` | Carga de GameScreens, sin ChunkLoadError |
| **05 - Progresión** | `05-progresion-desbloqueo.spec.ts` | API de bloques, nota mínima, orden de desbloqueo |

---

## 🐛 Sistema de Reportes de Bugs

Cuando un test falla, el sistema registra automáticamente el bug. Al finalizar la ejecución, se genera un reporte consolidado.

### Archivos generados

| Archivo | Propósito |
|---|---|
| `reportes_bugs/reporte_ultima_ejecucion.md` | Reporte con TODOS los bugs de la última ejecución |
| `reportes_bugs/historial_bugs.md` | Base de conocimiento acumulativa con soluciones |
| `reportes_bugs/screenshots/` | Capturas de pantalla de los fallos |

### Flujo de corrección

1. Ejecutar pruebas: `npx playwright test`
2. Revisar el reporte: `reportes_bugs/reporte_ultima_ejecucion.md`
3. Corregir los bugs listados (en orden de severidad)
4. Documentar cada solución en `reportes_bugs/historial_bugs.md`
5. Re-ejecutar las pruebas y repetir hasta que no haya bugs

---

## 🔧 Gestión del Stack Local

### Reiniciar un servicio específico
```bash
docker compose -f docker-compose.local.yml restart backend
```

### Ver logs del backend
```bash
docker compose -f docker-compose.local.yml logs -f backend
```

### Reconstruir solo el backend (después de cambios de código)
```bash
docker compose -f docker-compose.local.yml up -d --build backend
```

### Re-ejecutar seed (inyectar preguntas de nuevo)
```bash
# Detener el backend, forzar re-siembra, y reiniciar
docker compose -f docker-compose.local.yml stop backend
docker compose -f docker-compose.local.yml run --rm -e FORCE_SEED=true backend python run_migrations.py
docker compose -f docker-compose.local.yml up -d backend
```

### Resetear la base de datos completamente
```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d --build
```

### Conectarse a la BD local con psql
```bash
docker exec -it logicakids_local_db psql -U logicakids_local_user -d logicakids_local
```

---

## 🛠️ Solución de Problemas

### Las pruebas fallan por timeout
Incrementa el timeout en `playwright.config.ts`:
```ts
timeout: 90000, // 90 segundos
```

### Chrome no se encuentra
Asegúrate de tener Google Chrome instalado, o usa Chromium de Playwright:
```ts
// En playwright.config.ts, comenta la línea:
// channel: 'chrome',
```

### Error de conexión a la API
Verificar que los contenedores estén corriendo:
```bash
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs backend
```

### El backend no inicia (error de BD)
Verificar que PostgreSQL esté healthy:
```bash
docker compose -f docker-compose.local.yml logs postgres
```

### Restaurar conexión VPS
Consultar [`cambio_para_vps.md`](../cambio_para_vps.md) para los pasos detallados.
