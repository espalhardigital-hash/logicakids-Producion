# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-login.spec.ts >> 01 - Flujo de Autenticación >> Email con formato inválido muestra error de validación
- Location: tests\01-login.spec.ts:105:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.text-red-500, .text-red-400')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.text-red-500, .text-red-400')

```

```yaml
- heading "Logica Kids" [level=1]
- paragraph: Domina las matemáticas jugando
- textbox "Correo Electrónico": no-es-un-email
- textbox "Contraseña": cualquier
- button
- button "¿Olvidaste tu contraseña?"
- button "Entrar"
- paragraph:
  - text: ¿No tienes cuenta?
  - button "Regístrate"
- text: O bien
- button "Continuar como Invitado"
- button "Alternar Tema Claro/Oscuro"
```

# Test source

```ts
  17  |     await page.goto(ROUTES.LOGIN);
  18  |     await page.waitForLoadState('domcontentloaded');
  19  | 
  20  |     // Verificar que el título de la app está visible
  21  |     const appTitle = page.locator(SELECTORS.APP_TITLE);
  22  |     await expect(appTitle).toBeVisible({ timeout: 10000 });
  23  |     await expect(appTitle).toContainText('Logica Kids');
  24  | 
  25  |     // Verificar que los campos del formulario están visibles
  26  |     const emailInput = page.locator(SELECTORS.EMAIL_INPUT);
  27  |     const passwordInput = page.locator(SELECTORS.PASSWORD_INPUT);
  28  |     const submitButton = page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN);
  29  | 
  30  |     await expect(emailInput).toBeVisible();
  31  |     await expect(passwordInput).toBeVisible();
  32  |     await expect(submitButton).toBeVisible();
  33  |     await expect(submitButton).toContainText('Entrar');
  34  | 
  35  |     // Verificar botón de invitado
  36  |     const guestButton = page.locator(SELECTORS.GUEST_BUTTON);
  37  |     await expect(guestButton).toBeVisible();
  38  | 
  39  |     // Verificar enlace de registro
  40  |     const registerLink = page.locator(SELECTORS.REGISTER_LINK);
  41  |     await expect(registerLink).toBeVisible();
  42  | 
  43  |     // Sin errores críticos en consola
  44  |     expect(
  45  |       consoleLogger.hasCriticalErrors(),
  46  |       `Errores en consola:\n${consoleLogger.getCriticalErrorsSummary()}`
  47  |     ).toBe(false);
  48  |   });
  49  | 
  50  |   // ─── Test: Login exitoso con usuario de prueba ───────────────────
  51  |   test('Login exitoso con usuario de prueba redirige a /map', async ({ page, consoleLogger }) => {
  52  |     await loginAsTestUser(page);
  53  | 
  54  |     // Verificar que estamos en el mapa de fases
  55  |     expect(page.url()).toContain('/map');
  56  | 
  57  |     // Verificar que la interfaz del mapa cargó (root no vacío)
  58  |     const rootHtml = await page.innerHTML('#root');
  59  |     expect(rootHtml.length).toBeGreaterThan(10);
  60  | 
  61  |     // Sin errores críticos en consola
  62  |     expect(
  63  |       consoleLogger.hasCriticalErrors(),
  64  |       `Errores en consola:\n${consoleLogger.getCriticalErrorsSummary()}`
  65  |     ).toBe(false);
  66  |   });
  67  | 
  68  |   // ─── Test: Login con credenciales inválidas ──────────────────────
  69  |   test('Login con credenciales inválidas muestra error', async ({ page }) => {
  70  |     await page.goto(ROUTES.LOGIN);
  71  |     await page.waitForLoadState('domcontentloaded');
  72  |     await page.waitForSelector(SELECTORS.EMAIL_INPUT, { state: 'visible' });
  73  | 
  74  |     // Llenar con credenciales incorrectas
  75  |     await page.locator(SELECTORS.EMAIL_INPUT).fill('usuario_falso@test.com');
  76  |     await page.locator(SELECTORS.PASSWORD_INPUT).fill('contraseña_incorrecta');
  77  |     await page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN).click();
  78  | 
  79  |     // Esperar mensaje de error
  80  |     const errorMsg = page.locator(SELECTORS.ERROR_MESSAGE);
  81  |     await expect(errorMsg).toBeVisible({ timeout: 10000 });
  82  | 
  83  |     // No debería redirigir a /map
  84  |     expect(page.url()).toContain('/login');
  85  |   });
  86  | 
  87  |   // ─── Test: Campos vacíos muestran validación ─────────────────────
  88  |   test('Campos vacíos muestran mensaje de validación', async ({ page }) => {
  89  |     await page.goto(ROUTES.LOGIN);
  90  |     await page.waitForLoadState('domcontentloaded');
  91  |     await page.waitForSelector(SELECTORS.SUBMIT_BUTTON_LOGIN, { state: 'visible' });
  92  | 
  93  |     // Hacer clic sin llenar campos
  94  |     await page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN).click();
  95  | 
  96  |     // Debe aparecer mensaje de error de validación
  97  |     const errorMsg = page.locator(SELECTORS.ERROR_MESSAGE);
  98  |     await expect(errorMsg).toBeVisible({ timeout: 5000 });
  99  | 
  100 |     // Verificar que el mensaje indica campos incompletos
  101 |     await expect(errorMsg).toContainText('completa todos los campos');
  102 |   });
  103 | 
  104 |   // ─── Test: Email con formato inválido ────────────────────────────
  105 |   test('Email con formato inválido muestra error de validación', async ({ page }) => {
  106 |     await page.goto(ROUTES.LOGIN);
  107 |     await page.waitForLoadState('domcontentloaded');
  108 |     await page.waitForSelector(SELECTORS.EMAIL_INPUT, { state: 'visible' });
  109 | 
  110 |     // Llenar con email mal formateado
  111 |     await page.locator(SELECTORS.EMAIL_INPUT).fill('no-es-un-email');
  112 |     await page.locator(SELECTORS.PASSWORD_INPUT).fill('cualquier');
  113 |     await page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN).click();
  114 | 
  115 |     // Debe aparecer mensaje sobre correo inválido
  116 |     const errorMsg = page.locator(SELECTORS.ERROR_MESSAGE);
> 117 |     await expect(errorMsg).toBeVisible({ timeout: 5000 });
      |                            ^ Error: expect(locator).toBeVisible() failed
  118 |     await expect(errorMsg).toContainText('correo electrónico');
  119 |   });
  120 | 
  121 |   // ─── Test: Cambio a modo registro ────────────────────────────────
  122 |   test('Se puede cambiar al modo de registro y volver', async ({ page }) => {
  123 |     await page.goto(ROUTES.LOGIN);
  124 |     await page.waitForLoadState('domcontentloaded');
  125 |     await page.waitForSelector(SELECTORS.REGISTER_LINK, { state: 'visible' });
  126 | 
  127 |     // Hacer clic en "Regístrate"
  128 |     await page.locator(SELECTORS.REGISTER_LINK).click();
  129 | 
  130 |     // Verificar que aparece el campo de nombre de jugador
  131 |     const usernameInput = page.locator('input[placeholder="Nombre de Jugador"]');
  132 |     await expect(usernameInput).toBeVisible({ timeout: 5000 });
  133 | 
  134 |     // Verificar que el botón cambió a "Registrarse"
  135 |     const submitBtn = page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN);
  136 |     await expect(submitBtn).toContainText('Registrarse');
  137 | 
  138 |     // Volver a modo login
  139 |     await page.locator(SELECTORS.LOGIN_LINK).click();
  140 | 
  141 |     // El campo de nombre debería desaparecer
  142 |     await expect(usernameInput).not.toBeVisible();
  143 |     await expect(submitBtn).toContainText('Entrar');
  144 |   });
  145 | });
  146 | 
```