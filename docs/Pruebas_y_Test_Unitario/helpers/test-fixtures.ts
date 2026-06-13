/**
 * Fixture personalizado de Playwright que integra automáticamente:
 * - BrowserConsoleLogger: captura errores de la consola del browser
 * - BugReporter: registra bugs durante la ejecución y genera reporte consolidado al final
 *
 * FLUJO:
 * 1. Al iniciar la ejecución → iniciarEjecucion() limpia bugs anteriores
 * 2. Cada test recibe un `consoleLogger` automáticamente
 * 3. Si un test FALLA → registrarBug() acumula el bug en memoria
 * 4. Al finalizar TODA la ejecución → generarReporteConsolidado() escribe el reporte
 * 5. El agente lee el reporte, corrige los bugs, y actualiza el historial
 *
 * Uso: importar `test` y `expect` desde este archivo en vez de '@playwright/test'
 *
 * Ejemplo:
 *   import { test, expect } from '../helpers/test-fixtures';
 */

import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserConsoleLogger } from './console-logger';
import {
  iniciarEjecucion,
  registrarBug,
  generarReporteConsolidado,
  buscarSolucionPrevia,
} from './bug-reporter';
type TestFixtures = {
  consoleLogger: BrowserConsoleLogger;
};

export const test = base.extend<TestFixtures>({
  consoleLogger: [async ({ page }, use, testInfo) => {
    // Crear el logger y adjuntarlo a la página
    const logger = new BrowserConsoleLogger(page);

    // Interceptor dinámico de API de preguntas para Content Linting
    const invalidPatterns = [
      /es_desafio/i,
      /es_desafío/i,
      /=true/i,
      /=false/i,
      /\[objeto\]/i,
      /\[debug\]/i,
      /todo:/i,
      /fixme:/i
    ];

    let contentLintError: string | null = null;

    await page.route('**/pregunta*', async (route) => {
      try {
        const headers = {
          ...route.request().headers(),
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
        };
        delete headers['if-none-match'];
        delete headers['if-modified-since'];

        const response = await route.fetch({ headers });
        const json = await response.json();

        // Helper recursivo para buscar patrones inválidos en el JSON
        function checkValue(val: any, path: string = ''): string | null {
          if (typeof val === 'string') {
            for (const pattern of invalidPatterns) {
              if (pattern.test(val)) {
                return `Ruta JSON: ${path}, Valor: "${val}", Patrón: ${pattern.toString()}`;
              }
            }
          } else if (val && typeof val === 'object') {
            for (const key of Object.keys(val)) {
              const res = checkValue(val[key], `${path}.${key}`);
              if (res) return res;
            }
          }
          return null;
        }

        const lintError = checkValue(json);
        if (lintError) {
          contentLintError = `[Content Lint] Se detectó metadato de desarrollo en la respuesta de la API: ${lintError}`;
        }
        await route.fulfill({ response });
      } catch (e: any) {
        await route.continue().catch(() => {});
      }
    });

    // Usar el logger durante el test
    await use(logger);

    // ── Post-test: si falló o si se detectó un error de Content Lint, registrar el bug ──────────────────────
    if (testInfo.status === 'failed' || testInfo.status === 'timedOut' || contentLintError) {
      const erroresConsola = logger.getErrors().map((e) => e.text);
      const errorMessage = contentLintError || testInfo.error?.message || 'Error desconocido';

      // Determinar severidad
      let severidad: 'critico' | 'alto' | 'medio' | 'bajo' = 'medio';
      if (contentLintError) {
        severidad = 'medio';
      } else if (errorMessage.includes('ChunkLoadError') || errorMessage.includes('pantalla en blanco')) {
        severidad = 'critico';
      } else if (erroresConsola.length > 0) {
        severidad = 'alto';
      } else if (testInfo.status === 'timedOut') {
        severidad = 'alto';
      }

      // Determinar categoría
      let categoria: 'ui' | 'logica' | 'api' | 'consola' | 'rendimiento' | 'progresion' | 'contenido' | 'otro' = 'otro';
      const suiteName = testInfo.titlePath[0] || '';
      if (contentLintError) {
        categoria = 'contenido';
      } else {
        if (suiteName.includes('Login') || suiteName.includes('Navegación')) categoria = 'ui';
        else if (suiteName.includes('Gameplay')) categoria = 'logica';
        else if (suiteName.includes('Progresión')) categoria = 'progresion';
        if (erroresConsola.length > 0) categoria = 'consola';
        if (errorMessage.includes('API') || errorMessage.includes('fetch')) categoria = 'api';
        if (testInfo.status === 'timedOut') categoria = 'rendimiento';
      }

      // Buscar soluciones previas en el historial
      const keywords = errorMessage.split(/\s+/).filter((w) => w.length > 4).slice(0, 5);
      const solucionesPrevias = buscarSolucionPrevia(keywords);

      if (solucionesPrevias.length > 0) {
        console.log('\n🔍 ═══ SOLUCIONES PREVIAS ENCONTRADAS EN EL HISTORIAL ═══');
        for (const sol of solucionesPrevias) {
          console.log(`   📌 ${sol.bugId}: ${sol.problema}`);
          console.log(`   ✅ Solución: ${sol.solucion}`);
          console.log('');
        }
        console.log('═══════════════════════════════════════════════════════\n');
      }

      // Capturar screenshot
      let screenshotPath: string | undefined;
      try {
        const screenshotBuffer = await page.screenshot();
        const screenshotDir = path.resolve(__dirname, '..', 'reportes_bugs', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const screenshotFile = `${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
        screenshotPath = path.join(screenshotDir, screenshotFile);
        fs.writeFileSync(screenshotPath, screenshotBuffer);
      } catch {
        // No se pudo capturar screenshot
      }

      // Registrar el bug (se acumula en memoria, NO genera archivo todavía)
      registrarBug({
        suite: suiteName,
        test: testInfo.title,
        severidad,
        categoria,
        descripcion: contentLintError ? contentLintError : `El test "${testInfo.title}" falló con el Administrative / Code error:\n\n${errorMessage}`,
        pasos_reproduccion: [
          `Ejecutar la suite: ${suiteName}`,
          `Ejecutar el test: ${testInfo.title}`,
          `URL actual: ${page.url()}`,
        ],
        resultado_esperado: contentLintError ? 'La respuesta de la API no debe contener metadatos de desarrollo' : 'El test debería pasar sin errores',
        resultado_obtenido: errorMessage,
        errores_consola: erroresConsola.length > 0 ? erroresConsola : undefined,
        url: page.url(),
        screenshot: screenshotPath,
      });

      // Si fue error de content lint, lanzarlo para que Playwright marque el test como fallido
      if (contentLintError) {
        throw new Error(contentLintError);
      }
    }
  }, { auto: true }],
});

export { expect };
