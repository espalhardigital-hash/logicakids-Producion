/**
 * Global Setup: Se ejecuta al INICIAR toda la ejecución de pruebas.
 * Inicializa el sistema de reportes de bugs.
 */
import { iniciarEjecucion } from './bug-reporter';

async function globalSetup() {
  iniciarEjecucion();
}

export default globalSetup;
