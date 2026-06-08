import { Page } from '@playwright/test';

/**
 * Interfaz para un mensaje capturado de la consola del navegador.
 */
export interface ConsoleMessage {
  type: 'error' | 'warning' | 'log' | 'info' | 'debug';
  text: string;
  url?: string;
  timestamp: number;
}

/**
 * Logger de consola del navegador.
 *
 * Se adjunta a una instancia de Page y captura todos los mensajes
 * de consola y errores de página (excepciones no capturadas).
 * Permite al agente/tester validar que no hay errores JS en la consola
 * durante las pruebas, tal como indica el documento rector.
 */
export class BrowserConsoleLogger {
  private messages: ConsoleMessage[] = [];
  private pageErrors: string[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.attach();
  }

  /**
   * Adjunta los listeners de consola y errores a la página.
   */
  private attach(): void {
    // Capturar mensajes de consola (console.log, console.error, etc.)
    this.page.on('console', (msg) => {
      const type = msg.type() as ConsoleMessage['type'];
      this.messages.push({
        type,
        text: msg.text(),
        url: msg.location()?.url,
        timestamp: Date.now(),
      });
    });

    // Capturar excepciones no capturadas (window.onerror, unhandled rejections)
    this.page.on('pageerror', (error) => {
      this.pageErrors.push(error.message);
      this.messages.push({
        type: 'error',
        text: `[PageError] ${error.message}`,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Retorna todos los mensajes de tipo 'error' capturados.
   */
  getErrors(): ConsoleMessage[] {
    return this.messages.filter((m) => m.type === 'error');
  }

  /**
   * Retorna todos los mensajes de tipo 'warning' capturados.
   */
  getWarnings(): ConsoleMessage[] {
    return this.messages.filter((m) => m.type === 'warning');
  }

  /**
   * Retorna todos los errores de página (excepciones no capturadas).
   */
  getPageErrors(): string[] {
    return [...this.pageErrors];
  }

  /**
   * Retorna todos los mensajes capturados.
   */
  getAllMessages(): ConsoleMessage[] {
    return [...this.messages];
  }

  /**
   * Verifica si hay errores críticos en la consola.
   * Filtra errores comunes no críticos (ej. favicon, extensiones del navegador).
   *
   * @returns true si hay errores críticos, false si no
   */
  hasCriticalErrors(): boolean {
    const criticalErrors = this.getErrors().filter((e) => {
      const text = e.text.toLowerCase();
      // Filtrar errores no críticos conocidos
      if (text.includes('favicon')) return false;
      if (text.includes('extension')) return false;
      if (text.includes('devtools')) return false;
      if (text.includes('third-party cookie')) return false;
      if (text.includes('net::err_blocked_by_client')) return false; // ad blockers
      return true;
    });
    return criticalErrors.length > 0;
  }

  /**
   * Retorna un resumen formateado de los errores críticos encontrados.
   * Útil para incluir en los mensajes de fallo de los tests.
   */
  getCriticalErrorsSummary(): string {
    const criticalErrors = this.getErrors().filter((e) => {
      const text = e.text.toLowerCase();
      if (text.includes('favicon')) return false;
      if (text.includes('extension')) return false;
      if (text.includes('devtools')) return false;
      if (text.includes('third-party cookie')) return false;
      if (text.includes('net::err_blocked_by_client')) return false;
      return true;
    });

    if (criticalErrors.length === 0) return 'Sin errores críticos en la consola.';

    return criticalErrors
      .map((e, i) => `  [${i + 1}] ${e.text}${e.url ? ` (${e.url})` : ''}`)
      .join('\n');
  }

  /**
   * Limpia todos los mensajes capturados.
   * Útil entre navegaciones dentro de un mismo test.
   */
  clear(): void {
    this.messages = [];
    this.pageErrors = [];
  }
}
