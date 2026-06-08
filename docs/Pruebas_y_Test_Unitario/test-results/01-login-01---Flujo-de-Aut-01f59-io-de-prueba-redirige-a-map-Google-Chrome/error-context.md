# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-login.spec.ts >> 01 - Flujo de Autenticación >> Login exitoso con usuario de prueba redirige a /map
- Location: tests\01-login.spec.ts:51:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/map" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - heading "Logica Kids" [level=1] [ref=e8]
      - paragraph [ref=e9]: Domina las matemáticas jugando
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - img [ref=e13]
          - textbox "Correo Electrónico" [ref=e16]: prueba@gmail.com
        - generic [ref=e17]:
          - img [ref=e18]
          - textbox "Contraseña" [ref=e21]: pruebas
          - button [ref=e22]:
            - img [ref=e23]
        - button "¿Olvidaste tu contraseña?" [ref=e27]
        - paragraph [ref=e28]: Error de conexión
        - button "Entrar" [ref=e29]:
          - text: Entrar
          - img [ref=e30]
      - generic [ref=e32]:
        - paragraph [ref=e33]:
          - text: ¿No tienes cuenta?
          - button "Regístrate" [ref=e34]
        - generic [ref=e37]: O bien
        - button "Continuar como Invitado" [ref=e39]
  - button "Alternar Tema Claro/Oscuro" [ref=e40] [cursor=pointer]:
    - img [ref=e42]
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { TEST_USER, SELECTORS, ROUTES } from './constants';
  3  | 
  4  | /**
  5  |  * Realiza el login con el usuario de prueba y valida la redirección exitosa.
  6  |  *
  7  |  * Flujo:
  8  |  * 1. Navega a /login
  9  |  * 2. Llena email y contraseña del usuario de prueba
  10 |  * 3. Hace clic en "Entrar"
  11 |  * 4. Espera redirección a /map
  12 |  * 5. Valida que la navegación fue exitosa
  13 |  *
  14 |  * @param page - Instancia de Page de Playwright
  15 |  */
  16 | export async function loginAsTestUser(page: Page): Promise<void> {
  17 |   // Navegar a la página de login
  18 |   await page.goto(ROUTES.LOGIN);
  19 |   await page.waitForLoadState('domcontentloaded');
  20 | 
  21 |   // Esperar a que el formulario de login esté visible
  22 |   await page.waitForSelector(SELECTORS.EMAIL_INPUT, { state: 'visible', timeout: 15000 });
  23 | 
  24 |   // Limpiar campos y llenar credenciales
  25 |   const emailInput = page.locator(SELECTORS.EMAIL_INPUT);
  26 |   const passwordInput = page.locator(SELECTORS.PASSWORD_INPUT);
  27 | 
  28 |   await emailInput.fill(TEST_USER.email);
  29 |   await passwordInput.fill(TEST_USER.password);
  30 | 
  31 |   // Hacer clic en el botón de login ("Entrar")
  32 |   const submitButton = page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN);
  33 |   await submitButton.click();
  34 | 
  35 |   // Esperar redirección a /map (o cualquier ruta post-login)
> 36 |   await page.waitForURL('**/map', { timeout: 20000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
  37 | 
  38 |   // Validar que estamos en el mapa de fases
  39 |   expect(page.url()).toContain('/map');
  40 | }
  41 | 
  42 | /**
  43 |  * Verifica si el usuario ya está autenticado revisando si estamos en /map.
  44 |  * Si no lo está, realiza el login.
  45 |  *
  46 |  * @param page - Instancia de Page de Playwright
  47 |  */
  48 | export async function ensureAuthenticated(page: Page): Promise<void> {
  49 |   // Intentar navegar al mapa
  50 |   await page.goto(ROUTES.MAP);
  51 |   await page.waitForLoadState('domcontentloaded');
  52 |   await page.waitForTimeout(2000);
  53 | 
  54 |   // Si nos redirige al login, hacer login
  55 |   if (page.url().includes('/login')) {
  56 |     await loginAsTestUser(page);
  57 |   }
  58 | }
  59 | 
  60 | /**
  61 |  * Cierra la sesión del usuario limpiando localStorage.
  62 |  *
  63 |  * @param page - Instancia de Page de Playwright
  64 |  */
  65 | export async function logout(page: Page): Promise<void> {
  66 |   await page.evaluate(() => {
  67 |     localStorage.removeItem('auth_token');
  68 |     localStorage.removeItem('auth_user');
  69 |   });
  70 |   await page.goto(ROUTES.LOGIN);
  71 |   await page.waitForLoadState('domcontentloaded');
  72 | }
  73 | 
```