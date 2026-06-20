import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para Pruebas E2E de LogicaKids.
 *
 * - Navegador: Google Chrome (Chromium) como indica el documento rector.
 * - Ejecución secuencial para respetar el flujo de progresión.
 * - URL base configurable vía variable de entorno TEST_URL.
 * - Reporte HTML en ./resultados/
 */
export default defineConfig({
  testDir: './tests',

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    },
  },

  /* Generar reporte consolidado de bugs al finalizar */
  globalTeardown: './helpers/global-teardown.ts',
  globalSetup: './helpers/global-setup.ts',

  /* Ejecución secuencial (1 ventana) para facilitar depuración */
  fullyParallel: false,

  /* No permitir test.only en CI */
  forbidOnly: !!process.env.CI,

  /* Reintentos solo en CI */
  retries: process.env.CI ? 1 : 0,

  /* 1 Worker para ejecución paso a paso secuencial */
  workers: 1,

  /* Reporte HTML en carpeta resultados */
  reporter: [['html', { outputFolder: './resultados', open: 'never' }]],

  /* Configuración global compartida */
  use: {
    /* URL base del entorno de desarrollo */
    baseURL: process.env.TEST_URL || 'http://127.0.0.1:3000',

    /* Capturar screenshot solo al fallar */
    screenshot: 'only-on-failure',

    /* Capturar trace al fallar para debug */
    trace: 'on-first-retry',

    /* Timeout de acción (clic, fill, etc.) */
    actionTimeout: 15000,

    /* Timeout de navegación */
    navigationTimeout: 30000,
  },

  /* Timeout global por test aumentado a 120s por la cantidad masiva de tests dinámicos */
  timeout: 120000,

  /* Proyecto único: Google Chrome */
  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        /* Forzar uso del canal Chrome instalado en el sistema */
        channel: 'chrome',
        /* Viewport estándar */
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
