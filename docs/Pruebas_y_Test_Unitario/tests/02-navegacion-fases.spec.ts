import { test, expect } from '@playwright/test';
import { ROUTES, PHASES, SELECTORS } from '../helpers/constants';
import { loginAsTestUser, ensureAuthenticated } from '../helpers/auth';
import { BrowserConsoleLogger } from '../helpers/console-logger';

/**
 * Suite 02: Navegación por Fases
 *
 * Valida que el mapa de fases cargue correctamente y que cada
 * pantalla Welcome de las fases se renderice sin errores.
 * Comprueba que la navegación entre pantallas funcione adecuadamente.
 */
test.describe('02 - Navegación por Fases', () => {
  let consoleLogger: BrowserConsoleLogger;

  test.beforeEach(async ({ page }) => {
    consoleLogger = new BrowserConsoleLogger(page);
    // Asegurar que el usuario está autenticado antes de cada test
    await ensureAuthenticated(page);
  });

  // ─── Test: Mapa de fases carga correctamente ─────────────────────
  test('El mapa de fases (/map) se renderiza completamente', async ({ page }) => {
    await page.goto(ROUTES.MAP);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Esperar animaciones y Suspense

    // Verificar que el contenedor root no está vacío
    const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
    expect(rootHtml.length).toBeGreaterThan(50);

    // Verificar que no hay pantalla en blanco
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('ChunkLoadError');
    expect(bodyText).not.toContain('Application error');

    // Sin errores críticos en consola
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola del mapa de fases:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Tests dinámicos: Welcome de cada Fase (1-6) ─────────────────
  for (const phase of PHASES) {
    test(`Fase ${phase.id} (${phase.name}): Welcome se carga correctamente`, async ({ page }) => {
      consoleLogger.clear();

      // Navegar a la pantalla Welcome de la fase
      await page.goto(phase.welcomePath);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500); // Esperar React Suspense + animaciones

      // Si nos redirige a login, re-autenticar
      if (page.url().includes('/login')) {
        await loginAsTestUser(page);
        await page.goto(phase.welcomePath);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2500);
      }

      // Verificar que la interfaz renderizó contenido
      const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
      expect(
        rootHtml.length,
        `La pantalla Welcome de Fase ${phase.id} no renderizó contenido`
      ).toBeGreaterThan(50);

      // Verificar que no hay errores de carga de chunks
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('ChunkLoadError');
      expect(bodyText).not.toContain('Failed to fetch dynamically imported module');

      // Sin errores críticos en consola
      expect(
        consoleLogger.hasCriticalErrors(),
        `Errores en consola de Fase ${phase.id} Welcome:\n${consoleLogger.getCriticalErrorsSummary()}`
      ).toBe(false);
    });
  }

  // ─── Test: Pantalla Welcome genérica (Fases 7-8) ─────────────────
  test('Fases genéricas (7-8): Welcome genérico se carga correctamente', async ({ page }) => {
    consoleLogger.clear();

    await page.goto(ROUTES.WELCOME_FASE_GENERIC);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);

    // Si redirige a login, re-autenticar
    if (page.url().includes('/login')) {
      await loginAsTestUser(page);
      await page.goto(ROUTES.WELCOME_FASE_GENERIC);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500);
    }

    // Verificar que la interfaz renderizó
    const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
    expect(rootHtml.length).toBeGreaterThan(10);

    // Sin errores críticos en consola
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola de Welcome genérico:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Test: Navegación directa al mapa tras login ─────────────────
  test('Tras login, la navegación a /map funciona sin redirección', async ({ page }) => {
    await page.goto(ROUTES.MAP);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Debemos estar en /map (no redirigidos a /login)
    expect(page.url()).toContain('/map');
  });
});
