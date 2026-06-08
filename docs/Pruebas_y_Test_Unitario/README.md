# 🧪 LogicaKids — Pruebas E2E

Entorno de pruebas End-to-End autocontenido para la aplicación LogicaKids, basado en [Playwright](https://playwright.dev/) y Google Chrome.

> **Documento rector:** Consulta [`instrucciones_agente_tester.md`](./instrucciones_agente_tester.md) para las reglas completas de validación.

---

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **Google Chrome** instalado en el sistema
- **Docker y Docker Compose** (para ejecutar las pruebas en tu máquina local `localhost`)
- Acceso de red a `https://logica.espalhar.shop` (para ejecutar las pruebas directamente contra el VPS de desarrollo)

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

## ▶️ Ejecución de Pruebas

### Opción A: Pruebas Locales (Recomendado antes de subir cambios)
Para levantar la base de datos, el backend y el frontend en tu propia computadora:

1. **Levantar los contenedores locales:**
   ```bash
   # Desde esta carpeta (docs/Pruebas_y_Test_Unitario)
   docker compose -f docker-compose.local.yml up -d --build
   ```
   *Nota: La primera compilación tomará unos minutos mientras descarga las imágenes e instala dependencias.*

2. **Ejecutar las pruebas:**
   ```bash
   TEST_URL=http://localhost:3000 npx playwright test
   ```

3. **Detener los contenedores locales al finalizar:**
   ```bash
   docker compose -f docker-compose.local.yml down
   ```

### Opción B: Pruebas Remotas (Contra VPS de Desarrollo)
Si deseas ejecutar la suite contra el VPS de desarrollo actual:
```bash
npx playwright test
```

### Ejecutar suites individuales
Puedes ejecutar partes específicas de la suite de pruebas locales:
```bash
# 01 - Login y autenticación
TEST_URL=http://localhost:3000 npm run test:login

# 02 - Navegación por fases
TEST_URL=http://localhost:3000 npm run test:nav

# 03 - Gameplay Fase 1 (acierto, fallo, espejo)
TEST_URL=http://localhost:3000 npm run test:gameplay

# 04 - Carga de GameScreens Fases 2-6
TEST_URL=http://localhost:3000 npm run test:fases

# 05 - Progresión y desbloqueo
TEST_URL=http://localhost:3000 npm run test:progress
```

*Nota: Omitir `TEST_URL=http://localhost:3000` ejecutará los tests individuales contra el VPS remoto.*

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
├── instrucciones_agente_tester.md   # Documento rector (reglas de prueba)
├── package.json                      # Dependencias
├── playwright.config.ts              # Configuración de Playwright
├── README.md                         # Este archivo
├── helpers/
│   ├── auth.ts                       # Login/logout del usuario de prueba
│   ├── console-logger.ts             # Captura errores de consola del browser
│   └── constants.ts                  # Credenciales, rutas, selectores
├── tests/
│   ├── 01-login.spec.ts              # Flujo de autenticación
│   ├── 02-navegacion-fases.spec.ts   # Navegación por mapa de fases
│   ├── 03-gameplay-fase1.spec.ts     # Gameplay Fase 1
│   ├── 04-gameplay-fases-genericas.spec.ts  # GameScreens Fases 2-6
│   └── 05-progresion-desbloqueo.spec.ts     # Bloqueo/desbloqueo
└── resultados/                       # (Generada) Reportes HTML
```

---

## 🔐 Usuario de Prueba

| Campo       | Valor              |
|-------------|---------------------|
| **Email**   | `prueba@gmail.com` |
| **Clave**   | `pruebas`           |

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
Verifica que `https://logica.espalhar.shop` esté accesible, o cambia la URL:
```bash
TEST_URL=http://localhost:3000 npx playwright test
```
