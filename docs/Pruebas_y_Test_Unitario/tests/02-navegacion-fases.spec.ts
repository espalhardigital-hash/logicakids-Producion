import { test, expect } from '../helpers/test-fixtures';
import { ROUTES, PHASES, SELECTORS } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser } from '../helpers/db-utils';

/**
 * Suite 02: Navegación por Fases
 *
 * Valida que el mapa de fases cargue correctamente y que cada
 * pantalla Welcome de las fases se renderice sin errores.
 * Comprueba que la navegación entre pantallas funcione adecuadamente.
 */
test.describe('02 - Navegación por Fases', () => {
  test.beforeEach(async ({ page }) => {
    // Asegurar que el usuario está autenticado antes de cada test
    const testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 1);
  });

  // ─── Test: Mapa de fases carga correctamente ─────────────────────
  test('El mapa de fases (/map) se renderiza completamente', async ({ page, consoleLogger }) => {
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
    test(`Fase ${phase.id} (${phase.name}): Welcome se carga correctamente`, async ({ page, consoleLogger }) => {
      consoleLogger.clear();

      // Navegar a la pantalla Welcome de la fase
      await page.goto(phase.welcomePath);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500); // Esperar React Suspense + animaciones

      // Si nos redirige a login, re-autenticar

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

  // ─── Test: Pantalla Welcome de Fases 7, 8 y 9 ─────────────────
  for (const phaseId of [7, 8, 9]) {
    test(`Fase ${phaseId}: Welcome se carga correctamente`, async ({ page, consoleLogger }) => {
      consoleLogger.clear();

      const path = `/welcome-fase${phaseId}`;
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500);

      // Si redirige a login, re-autenticar

      // Verificar que la interfaz renderizó
      const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
      expect(rootHtml.length).toBeGreaterThan(10);

      // Sin errores críticos en consola
      expect(
        consoleLogger.hasCriticalErrors(),
        `Errores en consola de Welcome Fase ${phaseId}:\n${consoleLogger.getCriticalErrorsSummary()}`
      ).toBe(false);
    });
  }

  // ─── Test: Navegación directa al mapa tras login ─────────────────
  test('Tras login, la navegación a /map funciona sin redirección', async ({ page }) => {
    await page.goto(ROUTES.MAP);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Debemos estar en /map (no redirigidos a /login)
    expect(page.url()).toContain('/map');
  });
});
