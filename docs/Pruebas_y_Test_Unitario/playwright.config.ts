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

  /* Ejecución secuencial - las pruebas de progresión dependen del orden */
  fullyParallel: false,

  /* No permitir test.only en CI */
  forbidOnly: !!process.env.CI,

  /* Reintentos solo en CI */
  retries: process.env.CI ? 1 : 0,

  /* Un solo worker para ejecución ordenada */
  workers: 1,

  /* Reporte HTML en carpeta resultados */
  reporter: [['html', { outputFolder: './resultados', open: 'never' }]],

  /* Configuración global compartida */
  use: {
    /* URL base del entorno de desarrollo */
    baseURL: process.env.TEST_URL || 'https://logica.espalhar.shop',

    /* Capturar screenshot solo al fallar */
    screenshot: 'only-on-failure',

    /* Capturar trace al fallar para debug */
    trace: 'on-first-retry',

    /* Timeout de acción (clic, fill, etc.) */
    actionTimeout: 15000,

    /* Timeout de navegación */
    navigationTimeout: 30000,
  },

  /* Timeout global por test (60s para interfaces educativas con animaciones) */
  timeout: 60000,

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
