# 🐛 Reporte de Última Ejecución — Bugs a Corregir

| Campo | Valor |
|---|---|
| **Fecha inicio** | 2026-06-08T16:10:00.342Z |
| **Fecha fin** | 2026-06-08T16:10:33.175Z |
| **Total bugs encontrados** | 2 |
| 🔴 Críticos | 0 |
| 🟠 Altos | 2 |
| 🟡 Medios | 0 |
| 🔵 Bajos | 0 |

> **Instrucciones para el Agente:** Corrige los bugs listados a continuación en orden de severidad
> (críticos primero). Después de corregir cada bug, actualiza el historial de bugs ejecutando
> `resolverBugEnHistorial(bugId, "descripción de la solución aplicada")` para que quede
> documentado cómo se resolvió.

---

## Tabla Resumen

| # | ID | Severidad | Categoría | Suite | Test | Estado |
|---|---|---|---|---|---|---|
| 1 | `BUG-01loginspe-20260608161001-YJM7` | 🟠 alto | api | 01-login.spec.ts | La interfaz de login se renderiza completamente | 🔴 Pendiente |
| 2 | `BUG-01loginspe-20260608161023-6VRA` | 🟠 alto | consola | 01-login.spec.ts | Login exitoso con usuario de prueba redirige a /map | 🔴 Pendiente |

---

## Bug 1: `BUG-01loginspe-20260608161001-YJM7`

| Campo | Valor |
|---|---|
| **Severidad** | 🟠 ALTO |
| **Categoría** | api |
| **Suite** | 01-login.spec.ts |
| **Test** | La interfaz de login se renderiza completamente |
| **URL** | http://localhost:3000/login |

### Descripción
El test "La interfaz de login se renderiza completamente" falló con el siguiente error:

Error: Errores en consola:
  [1] Failed to load resource: net::ERR_EMPTY_RESPONSE (http://localhost:8000/api/admin/settings)
  [2] Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897 (http://localhost:3000/assets/index-DkGZ_79z.js)
  [3] Failed to load resource: net::ERR_EMPTY_RESPONSE (http://localhost:8000/api/admin/settings)
  [4] Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897 (http://localhost:3000/assets/index-DkGZ_79z.js)

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mfalse[39m
Received: [31mtrue[39m

### Pasos para Reproducir
1. Ejecutar la suite: 01-login.spec.ts
2. Ejecutar el test: La interfaz de login se renderiza completamente
3. URL actual: http://localhost:3000/login

### Resultado Esperado
El test debería pasar sin errores

### Resultado Obtenido
Error: Errores en consola:
  [1] Failed to load resource: net::ERR_EMPTY_RESPONSE (http://localhost:8000/api/admin/settings)
  [2] Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897 (http://localhost:3000/assets/index-DkGZ_79z.js)
  [3] Failed to load resource: net::ERR_EMPTY_RESPONSE (http://localhost:8000/api/admin/settings)
  [4] Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897 (http://localhost:3000/assets/index-DkGZ_79z.js)

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mfalse[39m
Received: [31mtrue[39m

### Errores de Consola del Browser
```
Failed to load resource: net::ERR_EMPTY_RESPONSE
Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897
Failed to load resource: net::ERR_EMPTY_RESPONSE
Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897
```
### Screenshot
![Bug 1](D:\Antigravity\APP_Logica_Matematicas_kids\docs\Pruebas_y_Test_Unitario\reportes_bugs\screenshots\La_interfaz_de_login_se_renderiza_completamente_1780935001964.png)

### ✅ Corrección Aplicada
> ⏳ _Pendiente — El agente debe corregir este bug y documentar la solución aquí._

---

## Bug 2: `BUG-01loginspe-20260608161023-6VRA`

| Campo | Valor |
|---|---|
| **Severidad** | 🟠 ALTO |
| **Categoría** | consola |
| **Suite** | 01-login.spec.ts |
| **Test** | Login exitoso con usuario de prueba redirige a /map |
| **URL** | http://localhost:3000/login |

### Descripción
El test "Login exitoso con usuario de prueba redirige a /map" falló con el siguiente error:

TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/map" until "load"
============================================================

### Pasos para Reproducir
1. Ejecutar la suite: 01-login.spec.ts
2. Ejecutar el test: Login exitoso con usuario de prueba redirige a /map
3. URL actual: http://localhost:3000/login

### Resultado Esperado
El test debería pasar sin errores

### Resultado Obtenido
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/map" until "load"
============================================================

### Errores de Consola del Browser
```
Failed to load resource: net::ERR_EMPTY_RESPONSE
Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897
Failed to load resource: net::ERR_EMPTY_RESPONSE
Error fetching admin settings: TypeError: Failed to fetch
    at We (http://localhost:3000/assets/index-DkGZ_79z.js:615:2899)
    at async Qg (http://localhost:3000/assets/index-DkGZ_79z.js:615:8052)
    at async q (http://localhost:3000/assets/index-DkGZ_79z.js:736:17155)
    at async http://localhost:3000/assets/index-DkGZ_79z.js:736:17897
Failed to load resource: net::ERR_EMPTY_RESPONSE
```
### Screenshot
![Bug 2](D:\Antigravity\APP_Logica_Matematicas_kids\docs\Pruebas_y_Test_Unitario\reportes_bugs\screenshots\Login_exitoso_con_usuario_de_prueba_redirige_a__map_1780935023567.png)

### ✅ Corrección Aplicada
> ⏳ _Pendiente — El agente debe corregir este bug y documentar la solución aquí._

---


---
*Reporte generado automáticamente al finalizar la ejecución de pruebas E2E de LogicaKids.*
*Archivo: `reportes_bugs/reporte_ultima_ejecucion.md`*
