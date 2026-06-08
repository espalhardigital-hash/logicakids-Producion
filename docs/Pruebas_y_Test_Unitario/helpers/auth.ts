import { Page, expect } from '@playwright/test';
import { TEST_USER, SELECTORS, ROUTES } from './constants';

/**
 * Realiza el login con el usuario de prueba y valida la redirección exitosa.
 *
 * Flujo:
 * 1. Navega a /login
 * 2. Llena email y contraseña del usuario de prueba
 * 3. Hace clic en "Entrar"
 * 4. Espera redirección a /map
 * 5. Valida que la navegación fue exitosa
 *
 * @param page - Instancia de Page de Playwright
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  // Navegar a la página de login
  await page.goto(ROUTES.LOGIN);
  await page.waitForLoadState('domcontentloaded');

  // Esperar a que el formulario de login esté visible
  await page.waitForSelector(SELECTORS.EMAIL_INPUT, { state: 'visible', timeout: 15000 });

  // Limpiar campos y llenar credenciales
  const emailInput = page.locator(SELECTORS.EMAIL_INPUT);
  const passwordInput = page.locator(SELECTORS.PASSWORD_INPUT);

  await emailInput.fill(TEST_USER.email);
  await passwordInput.fill(TEST_USER.password);

  // Hacer clic en el botón de login ("Entrar")
  const submitButton = page.locator(SELECTORS.SUBMIT_BUTTON_LOGIN);
  await submitButton.click();

  // Esperar redirección a /map (o cualquier ruta post-login)
  await page.waitForURL('**/map', { timeout: 20000 });

  // Validar que estamos en el mapa de fases
  expect(page.url()).toContain('/map');
}

/**
 * Verifica si el usuario ya está autenticado revisando si estamos en /map.
 * Si no lo está, realiza el login.
 *
 * @param page - Instancia de Page de Playwright
 */
export async function ensureAuthenticated(page: Page): Promise<void> {
  // Intentar navegar al mapa
  await page.goto(ROUTES.MAP);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Si nos redirige al login, hacer login
  if (page.url().includes('/login')) {
    await loginAsTestUser(page);
  }
}

/**
 * Cierra la sesión del usuario limpiando localStorage.
 *
 * @param page - Instancia de Page de Playwright
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  });
  await page.goto(ROUTES.LOGIN);
  await page.waitForLoadState('domcontentloaded');
}
