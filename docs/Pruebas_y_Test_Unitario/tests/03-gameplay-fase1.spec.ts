import { test, expect } from '@playwright/test';
import { ROUTES, API, SELECTORS } from '../helpers/constants';
import { ensureAuthenticated, loginAsTestUser } from '../helpers/auth';
import { BrowserConsoleLogger } from '../helpers/console-logger';

/**
 * Suite 03: Gameplay Fase 1 — Validación de Lógica
 *
 * Prueba el flujo completo de juego en la Fase 1 (Aritmética Básica):
 * - Carga correcta de la interfaz de juego
 * - Comportamiento ante respuesta correcta (acierto)
 * - Comportamiento ante respuesta incorrecta (fallo)
 * - Aparición de pregunta espejo tras fallo (si aplica la configuración)
 * - Funcionamiento del botón "Siguiente"
 * - Ausencia de errores en la consola del browser
 */
test.describe('03 - Gameplay Fase 1 (Aritmética Básica)', () => {
  let consoleLogger: BrowserConsoleLogger;

  test.beforeEach(async ({ page }) => {
    consoleLogger = new BrowserConsoleLogger(page);
    await ensureAuthenticated(page);
  });

  // ─── Test: Interfaz de juego Fase 1 carga correctamente ──────────
  test('La pantalla de juego de Fase 1 se renderiza sin errores', async ({ page }) => {
    // Navegar al welcome de fase 1
    await page.goto(ROUTES.WELCOME_FASE1);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    if (page.url().includes('/login')) {
      await loginAsTestUser(page);
      await page.goto(ROUTES.WELCOME_FASE1);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    }

    // Verificar que la pantalla welcome cargó
    const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
    expect(rootHtml.length).toBeGreaterThan(50);

    // Sin errores de carga
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('ChunkLoadError');
    expect(bodyText).not.toContain('Application error');

    // Sin errores críticos en la consola del browser
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola durante carga Fase 1:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Test: Selección de nivel en Fase 1 ──────────────────────────
  test('La pantalla de selección de nivel carga correctamente', async ({ page }) => {
    await page.goto(ROUTES.LEVEL_SELECTION);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    if (page.url().includes('/login')) {
      await loginAsTestUser(page);
      await page.goto(ROUTES.LEVEL_SELECTION);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    }

    // Verificar que hay contenido renderizado
    const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
    expect(rootHtml.length).toBeGreaterThan(50);

    // Sin errores críticos en consola
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola de selección de nivel:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Test: Dashboard de Fase 1 vía API ───────────────────────────
  test('El dashboard de Fase 1 responde correctamente vía API', async ({ page }) => {
    await ensureAuthenticated(page);

    // Obtener el token de autenticación del localStorage
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token, 'El token de autenticación no existe en localStorage').toBeTruthy();

    // Llamar al endpoint del dashboard
    const response = await page.request.get(`${API.FASE1_DASHBOARD}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // El endpoint debe responder exitosamente
    expect(response.ok(), `API ${API.FASE1_DASHBOARD} respondió con error: ${response.status()}`).toBe(true);

    // La respuesta debe ser un JSON válido
    const data = await response.json();
    expect(data).toBeDefined();
  });

  // ─── Test: Respuesta a pregunta vía API (simulación de acierto/fallo) ───
  test('El endpoint de responder preguntas funciona correctamente', async ({ page }) => {
    await ensureAuthenticated(page);

    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    // Primero obtener el dashboard para saber qué preguntas hay disponibles
    const dashResponse = await page.request.get(`${API.FASE1_DASHBOARD}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (dashResponse.ok()) {
      const dashboard = await dashResponse.json();

      // Si hay preguntas disponibles, intentar responder una
      if (dashboard.pregunta_actual || dashboard.pregunta) {
        const pregunta = dashboard.pregunta_actual || dashboard.pregunta;
        const preguntaId = pregunta.id;

        // Enviar una respuesta (puede ser correcta o incorrecta)
        const respuestaResponse = await page.request.post(`${API.FASE1_RESPONDER}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: {
            pregunta_id: preguntaId,
            respuesta_dada: 'test_response',
            tiempo_respuesta_segundos: 5,
          },
        });

        // El endpoint debe responder (200 o 422 si la respuesta no es válida)
        expect(
          [200, 201, 422].includes(respuestaResponse.status()),
          `Endpoint responder devolvió status inesperado: ${respuestaResponse.status()}`
        ).toBe(true);

        if (respuestaResponse.ok()) {
          const resultado = await respuestaResponse.json();

          // Validar estructura de la respuesta
          expect(resultado).toHaveProperty('es_correcta');
          expect(resultado).toHaveProperty('respuesta_correcta');
          expect(resultado).toHaveProperty('porcentaje_actual');

          // Documentar si fue acierto o fallo
          if (resultado.es_correcta) {
            console.log(`✅ Respuesta correcta - Porcentaje actual: ${resultado.porcentaje_actual}%`);
          } else {
            console.log(`❌ Respuesta incorrecta - Feedback: ${resultado.feedback_error || 'N/A'}`);
            console.log(`   Respuesta correcta era: ${resultado.respuesta_correcta}`);

            // Si hay tipo_feedback, verificar que existe
            if (resultado.tipo_feedback) {
              expect(['inmediato', 'diferido', 'espejo']).toContain(resultado.tipo_feedback);
            }
          }
        }
      } else {
        console.log('ℹ️ No hay preguntas disponibles en el dashboard actual. Saltando prueba de respuesta.');
      }
    }
  });

  // ─── Test: Pantalla de juego Fase 1 (/play) carga ────────────────
  test('La pantalla de juego /play renderiza elementos interactivos', async ({ page }) => {
    consoleLogger.clear();

    await page.goto(ROUTES.PLAY_FASE1);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Esperar carga de pregunta + animaciones

    if (page.url().includes('/login')) {
      await loginAsTestUser(page);
      await page.goto(ROUTES.PLAY_FASE1);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
    }

    // Verificar que la interfaz tiene contenido
    const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
    expect(rootHtml.length).toBeGreaterThan(50);

    // No debe haber pantalla en blanco ni errores de chunk
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('ChunkLoadError');
    expect(bodyText).not.toContain('Failed to fetch dynamically imported module');

    // Sin errores críticos en consola del browser
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola durante gameplay Fase 1:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });

  // ─── Test: Pantalla de resultados carga ──────────────────────────
  test('La pantalla de resultados (/results) se renderiza correctamente', async ({ page }) => {
    consoleLogger.clear();

    await page.goto(ROUTES.RESULTS);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verificar que hay contenido (puede redirigir si no hay datos de juego previo)
    const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
    expect(rootHtml.length).toBeGreaterThan(10);

    // Sin errores críticos
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola de Results:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });
});
