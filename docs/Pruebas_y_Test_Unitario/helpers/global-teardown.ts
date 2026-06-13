/**
 * Global Teardown: Se ejecuta al finalizar TODA la ejecución de pruebas.
 * Genera el reporte consolidado de bugs encontrados.
 */
import { generarReporteConsolidado } from './bug-reporter';
import { execSync } from 'child_process';
import * as path from 'path';

async function globalTeardown() {
  generarReporteConsolidado();
  try {
    const scriptPath = path.resolve(__dirname, 'generate-dashboard.js');
    execSync(`node "${scriptPath}"`);
    console.log('✅ Dashboard de QA e Historial de Bugs generado.');
  } catch (err) {
    console.error('❌ Error al generar el Dashboard de QA:', err);
  }
}

export default globalTeardown;
