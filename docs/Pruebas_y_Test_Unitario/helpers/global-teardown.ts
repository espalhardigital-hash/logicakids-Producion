/**
 * Global Teardown: Se ejecuta al finalizar TODA la ejecución de pruebas.
 * Genera el reporte consolidado de bugs encontrados.
 */
import { generarReporteConsolidado } from './bug-reporter';

async function globalTeardown() {
  generarReporteConsolidado();
}

export default globalTeardown;
