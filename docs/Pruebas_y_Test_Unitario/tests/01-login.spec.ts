import { test, expect } from '../helpers/test-fixtures';
import { TEST_USER, SELECTORS, ROUTES } from '../helpers/constants';
import { loginAsTestUser, logout } from '../helpers/auth';

/**
 * Suite 01: Flujo de Autenticación (Login)
 *
 * Valida que la pantalla de login cargue correctamente,
 * que el usuario de prueba pueda autenticarse, y que se
 * manejen apropiadamente los errores de validación.
 */
test.describe('01 - Flujo de Autenticación', () => {
  // No need to instantiate consoleLogger manually, it's a fixture

  // ─── Test: Interfaz de Login carga correctamente ─────────────────
  test('La interfaz de login se renderiza completamente', async ({ page, consoleLogger }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('domcontentloaded');

    // Verificar que el título de la app está visible
    const appTitle = page.locator(SELECTORS.APP_TITLE);
    await expect(appTitle).toBeVisible({ timeout: 10000 });
    await expect(appTitle).toContainText('Logica Kids');

    // Verificar que los campos del formulario están visibles
    const emailInput = page.locator(SELECTORS.EMAIL_INPUT);
    const passwordInput = page.locator(SELECTORS.PASSWORD_INPUT);
    const submitButton = page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Entrar');

    // Verificar botón de invitado
    const guestButton = page.locator(SELECTORS.GUEST_BUTTON);
    await expect(guestButton).toBeVisible();

    // Verificar enlace de registro
    const registerLink = page.locator(SELECTORS.REGISTER_LINK);
    await expect(registerLink).toBeVisible();

    // Sin errores críticos en consola
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Test: Login exitoso con usuario de prueba ───────────────────
  test('Login exitoso con usuario de prueba redirige a /map', async ({ page, consoleLogger }) => {
    await loginAsTestUser(page);

    // Verificar que estamos en el mapa de fases
    expect(page.url()).toContain('/map');

    // Verificar que la interfaz del mapa cargó (root no vacío)
    const rootHtml = await page.innerHTML('#root');
    expect(rootHtml.length).toBeGreaterThan(10);

    // Sin errores críticos en consola
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Test: Login con credenciales inválidas ──────────────────────
  test('Login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(SELECTORS.EMAIL_INPUT, { state: 'visible' });

    // Llenar con credenciales incorrectas
    await page.locator(SELECTORS.EMAIL_INPUT).fill('usuario_falso@test.com');
    await page.locator(SELECTORS.PASSWORD_INPUT).fill('contraseña_incorrecta');
    await page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN).click();

    // Esperar mensaje de error
    const errorMsg = page.locator(SELECTORS.ERROR_MESSAGE);
    await expect(errorMsg).toBeVisible({ timeout: 10000 });

    // No debería redirigir a /map
    expect(page.url()).toContain('/login');
  });

  // ─── Test: Campos vacíos muestran validación ─────────────────────
  test('Campos vacíos muestran mensaje de validación', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(SELECTORS.SUBMIT_BUTTON_LOGIN, { state: 'visible' });

    // Hacer clic sin llenar campos
    await page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN).click();

    // Debe aparecer mensaje de error de validación
    const errorMsg = page.locator(SELECTORS.ERROR_MESSAGE);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });

    // Verificar que el mensaje indica campos incompletos
    await expect(errorMsg).toContainText('completa todos los campos');
  });

  // ─── Test: Email con formato inválido ────────────────────────────
  test('Email con formato inválido muestra error de validación', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(SELECTORS.EMAIL_INPUT, { state: 'visible' });

    // Llenar con email mal formateado
    await page.locator(SELECTORS.EMAIL_INPUT).fill('no-es-un-email');
    await page.locator(SELECTORS.PASSWORD_INPUT).fill('cualquier');
    await page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN).click();

    // Debe aparecer mensaje sobre correo inválido
    const errorMsg = page.locator(SELECTORS.ERROR_MESSAGE);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await expect(errorMsg).toContainText('correo electrónico');
  });

  // ─── Test: Cambio a modo registro ────────────────────────────────
  test('Se puede cambiar al modo de registro y volver', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(SELECTORS.REGISTER_LINK, { state: 'visible' });

    // Hacer clic en "Regístrate"
    await page.locator(SELECTORS.REGISTER_LINK).click();

    // Verificar que aparece el campo de nombre de jugador
    const usernameInput = page.locator('input[placeholder="Nombre de Jugador"]');
    await expect(usernameInput).toBeVisible({ timeout: 5000 });

    // Verificar que el botón cambió a "Registrarse"
    const submitBtn = page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN);
    await expect(submitBtn).toContainText('Registrarse');

    // Volver a modo login
    await page.locator(SELECTORS.LOGIN_LINK).click();

    // El campo de nombre debería desaparecer
    await expect(usernameInput).not.toBeVisible();
    await expect(submitBtn).toContainText('Entrar');
  });
});
