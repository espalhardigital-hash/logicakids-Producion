import { test, expect } from '../helpers/test-fixtures';
import { PHASES, SELECTORS } from '../helpers/constants';
import { ensureAuthenticated, loginAsTestUser } from '../helpers/auth';

/**
 * Suite 04: Gameplay Fases Genéricas (2-6)
 *
 * Valida que cada pantalla de juego (GameScreen) de las fases 2 a 6
 * se cargue correctamente sin errores de chunk, pantallas en blanco,
 * ni errores en la consola del navegador.
 */
test.describe('04 - Gameplay Fases Genéricas (2-6)', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  // ─── Tests dinámicos: GameScreen de cada Fase 2-6 ────────────────
  const phasesToTest = PHASES.filter((p) => p.id >= 2 && p.id <= 6);

  for (const phase of phasesToTest) {
    test(`Fase ${phase.id} (${phase.name}): Welcome carga sin errores`, async ({ page, consoleLogger }) => {
      consoleLogger.clear();

      // 1. Navegar al Welcome Screen
      await page.goto(phase.welcomePath);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500);

      // Re-autenticar si fue redirigido al login
      if (page.url().includes('/login')) {
        await loginAsTestUser(page);
        await page.goto(phase.welcomePath);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2500);
      }

      // Verificar que la pantalla Welcome renderizó contenido
      const welcomeHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
      expect(
        welcomeHtml.length,
        `Welcome de Fase ${phase.id} no tiene contenido`
      ).toBeGreaterThan(50);

      // Sin errores de carga de módulos
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('ChunkLoadError');
      expect(bodyText).not.toContain('Failed to fetch dynamically imported module');

      // Sin errores críticos en la consola
      expect(
        consoleLogger.hasCriticalErrors(),
        `Errores en consola de Welcome Fase ${phase.id}:\n${consoleLogger.getCriticalErrorsSummary()}`
      ).toBe(false);
    });

    test(`Fase ${phase.id} (${phase.name}): GameScreen carga sin errores`, async ({ page, consoleLogger }) => {
      consoleLogger.clear();

      // 2. Navegar directamente al GameScreen
      await page.goto(phase.playPath);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000); // Más tiempo para React Lazy loading

      // Re-autenticar si fue redirigido
      if (page.url().includes('/login')) {
        await loginAsTestUser(page);
        await page.goto(phase.playPath);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
      }

      // Verificar que el GameScreen renderizó (no pantalla en blanco)
      const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
      expect(
        rootHtml.length,
        `GameScreen de Fase ${phase.id} renderizó vacío (posible pantalla en blanco)`
      ).toBeGreaterThan(10);

      // Sin ChunkLoadError
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('ChunkLoadError');
      expect(bodyText).not.toContain('Failed to fetch dynamically imported module');
      expect(bodyText).not.toContain('Application error');

      // Sin errores críticos en la consola del navegador
      expect(
        consoleLogger.hasCriticalErrors(),
        `Errores en consola de GameScreen Fase ${phase.id}:\n${consoleLogger.getCriticalErrorsSummary()}`
      ).toBe(false);
    });
  }

  // ─── Test: Resumen de carga de todas las fases ───────────────────
  test('Resumen: Todas las fases (2-6) cargan sin pantalla en blanco', async ({ page, consoleLogger }) => {
    const failedPhases: string[] = [];

    for (const phase of phasesToTest) {
      consoleLogger.clear();

      await page.goto(phase.playPath);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(4000);

      // Re-autenticar si es necesario
      if (page.url().includes('/login')) {
        await loginAsTestUser(page);
        await page.goto(phase.playPath);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
      }

      const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
      if (rootHtml.length <= 10) {
        failedPhases.push(`Fase ${phase.id} (${phase.name})`);
      }

      // Filter out harmless 'Failed to fetch' errors caused by page navigation aborts in rapid loops
      const criticalErrors = consoleLogger.getErrors().filter((e) => {
        const text = e.text.toLowerCase();
        if (text.includes('favicon')) return false;
        if (text.includes('extension')) return false;
        if (text.includes('devtools')) return false;
        if (text.includes('third-party cookie')) return false;
        if (text.includes('net::err_blocked_by_client')) return false;
        if (text.includes('failed to fetch')) return false;
        if (text.includes('error syncing user profile')) return false;
        return true;
      });

      if (criticalErrors.length > 0) {
        const summary = consoleLogger.getCriticalErrorsSummary();
        console.error(`❌ Console errors in Phase ${phase.id}:`, summary);
        failedPhases.push(`Fase ${phase.id} (${phase.name}) - errores consola: ${summary.replace(/\n/g, ' | ')}`);
      }
    }

    expect(
      failedPhases,
      `Fases con problemas de carga: ${failedPhases.join(', ')}`
    ).toHaveLength(0);
  });
});
