/**
 * Sistema de Reporte de Bugs e Historial de Soluciones para LogicaKids.
 *
 * FLUJO DE TRABAJO:
 * 1. Se ejecutan las pruebas E2E
 * 2. Al finalizar, se genera UN SOLO reporte consolidado con TODOS los bugs
 *    encontrados en esa ejecución → `reportes_bugs/reporte_ultima_ejecucion.md`
 * 3. Se le pide al agente que corrija los bugs listados en el reporte
 * 4. Al corregir, el agente actualiza el historial acumulativo
 *    → `reportes_bugs/historial_bugs.md` con la solución aplicada
 * 5. Se ejecutan las pruebas de nuevo y se repite el ciclo
 *
 * El historial acumulativo sirve como BASE DE CONOCIMIENTO: cuando un
 * problema similar se repite, el agente consulta el historial para saber
 * cómo solucionarlo sin investigar desde cero.
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Directorios y archivos ──────────────────────────────────────────
const REPORTS_DIR = path.resolve(__dirname, '..', 'reportes_bugs');
const SCREENSHOTS_DIR = path.resolve(REPORTS_DIR, 'screenshots');
const REPORTE_ULTIMA_EJECUCION = path.resolve(REPORTS_DIR, 'reporte_ultima_ejecucion.md');
const HISTORIAL_BUGS = path.resolve(REPORTS_DIR, 'historial_bugs.md');
const TEMP_SESSION_FILE = path.resolve(REPORTS_DIR, 'temp_session.json');

interface SessionData {
  fechaInicio: string;
  bugs: BugEntry[];
}

/**
 * Interfaz para un bug encontrado durante una ejecución.
 */
export interface BugEntry {
  /** ID único del bug */
  id: string;
  /** Severidad: 'critico' | 'alto' | 'medio' | 'bajo' */
  severidad: 'critico' | 'alto' | 'medio' | 'bajo';
  /** Categoría del bug */
  categoria: 'ui' | 'logica' | 'api' | 'consola' | 'rendimiento' | 'progresion' | 'otro';
  /** Suite de prueba */
  suite: string;
  /** Test específico */
  test: string;
  /** Descripción del problema */
  descripcion: string;
  /** Pasos para reproducir */
  pasos_reproduccion: string[];
  /** Resultado esperado */
  resultado_esperado: string;
  /** Resultado obtenido */
  resultado_obtenido: string;
  /** Errores de consola del browser */
  errores_consola?: string[];
  /** URL donde ocurrió */
  url?: string;
  /** Ruta al screenshot */
  screenshot?: string;
}

// ─── Almacén temporal de bugs de la ejecución actual ─────────────────
let bugsEjecucionActual: BugEntry[] = [];
let fechaInicioEjecucion: string = '';

/**
 * Genera un ID único para el bug.
 */
function generateBugId(suite: string): string {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
  const suiteShort = suite.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  return `BUG-${suiteShort}-${dateStr}-${hash}`;
}

/**
 * Asegura que los directorios necesarios existen.
 */
function ensureDirs(): void {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Retorna emoji según severidad.
 */
function getSeveridadEmoji(sev: string): string {
  switch (sev) {
    case 'critico': return '🔴';
    case 'alto': return '🟠';
    case 'medio': return '🟡';
    case 'bajo': return '🔵';
    default: return '⚪';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// FASE 1: RECOLECCIÓN — Se llama durante la ejecución de tests
// ═══════════════════════════════════════════════════════════════════════

/**
 * Inicializa una nueva ejecución de pruebas.
 * Limpia los bugs acumulados de la ejecución anterior.
 */
export function iniciarEjecucion(): void {
  ensureDirs();
  const data: SessionData = {
    fechaInicio: new Date().toISOString(),
    bugs: []
  };
  fs.writeFileSync(TEMP_SESSION_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Registra un bug encontrado durante la ejecución actual.
 * Guarda el bug en el archivo de sesión temporal para compartirlo entre workers de Playwright.
 *
 * @param bug - Datos del bug (sin ID, se genera automáticamente)
 */
export function registrarBug(bug: Omit<BugEntry, 'id'>): string {
  ensureDirs();
  const id = generateBugId(bug.suite);
  const bugCompleto: BugEntry = { ...bug, id };

  let session: SessionData = { fechaInicio: new Date().toISOString(), bugs: [] };
  if (fs.existsSync(TEMP_SESSION_FILE)) {
    try {
      session = JSON.parse(fs.readFileSync(TEMP_SESSION_FILE, 'utf-8'));
    } catch (e) {
      // Fallback
    }
  }

  session.bugs.push(bugCompleto);
  fs.writeFileSync(TEMP_SESSION_FILE, JSON.stringify(session, null, 2), 'utf-8');

  console.log(`🐛 Bug registrado: ${id} — ${bug.test}`);
  return id;
}

/**
 * Retorna la cantidad de bugs registrados en la ejecución actual.
 */
export function getBugsCount(): number {
  if (fs.existsSync(TEMP_SESSION_FILE)) {
    try {
      const session: SessionData = JSON.parse(fs.readFileSync(TEMP_SESSION_FILE, 'utf-8'));
      return session.bugs.length;
    } catch (e) {}
  }
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════
// FASE 2: REPORTE — Se llama al finalizar TODA la ejecución
// ═══════════════════════════════════════════════════════════════════════

/**
 * Genera el reporte consolidado de la última ejecución.
 * Este archivo contiene TODOS los bugs encontrados y es el que
 * el agente usará para saber qué debe corregir.
 *
 * Sobreescribe el reporte anterior (solo importa la última ejecución).
 *
 * @returns Ruta al archivo generado, o null si no hubo bugs
 */
export function generarReporteConsolidado(): string | null {
  ensureDirs();

  const fechaFin = new Date().toISOString();
  let sessionBugs: BugEntry[] = [];
  let fechaInicio = fechaInicioEjecucion || fechaFin;

  if (fs.existsSync(TEMP_SESSION_FILE)) {
    try {
      const session: SessionData = JSON.parse(fs.readFileSync(TEMP_SESSION_FILE, 'utf-8'));
      sessionBugs = session.bugs;
      fechaInicio = session.fechaInicio;
      // Eliminar el archivo de sesión temporal al terminar
      fs.unlinkSync(TEMP_SESSION_FILE);
    } catch (e) {
      console.error('Error al leer temp_session.json:', e);
    }
  }

  if (sessionBugs.length === 0) {
    // Si no hubo bugs, generar un reporte limpio
    const contenidoLimpio = `# ✅ Reporte de Última Ejecución — Sin Bugs

| Campo | Valor |
|---|---|
| **Fecha inicio** | ${fechaInicio} |
| **Fecha fin** | ${fechaFin} |
| **Bugs encontrados** | 0 |

> 🎉 Todas las pruebas pasaron sin errores. No hay bugs pendientes por corregir.
`;
    fs.writeFileSync(REPORTE_ULTIMA_EJECUCION, contenidoLimpio, 'utf-8');
    console.log('✅ Ejecución sin bugs. Reporte limpio generado.');
    return REPORTE_ULTIMA_EJECUCION;
  }

  // Clasificar bugs por severidad
  const criticos = sessionBugs.filter((b) => b.severidad === 'critico');
  const altos = sessionBugs.filter((b) => b.severidad === 'alto');
  const medios = sessionBugs.filter((b) => b.severidad === 'medio');
  const bajos = sessionBugs.filter((b) => b.severidad === 'bajo');

  // Generar el contenido del reporte consolidado
  let contenido = `# 🐛 Reporte de Última Ejecución — Bugs a Corregir

| Campo | Valor |
|---|---|
| **Fecha inicio** | ${fechaInicio} |
| **Fecha fin** | ${fechaFin} |
| **Total bugs encontrados** | ${sessionBugs.length} |
| 🔴 Críticos | ${criticos.length} |
| 🟠 Altos | ${altos.length} |
| 🟡 Medios | ${medios.length} |
| 🔵 Bajos | ${bajos.length} |

> **Instrucciones para el Agente:** Corrige los bugs listados a continuación en orden de severidad
> (críticos primero). Después de corregir cada bug, actualiza el historial de bugs ejecutando
> \`resolverBugEnHistorial(bugId, "descripción de la solución aplicada")\` para que quede
> documentado cómo se resolvió.

---

## Tabla Resumen

| # | ID | Severidad | Categoría | Suite | Test | Estado |
|---|---|---|---|---|---|---|
${sessionBugs.map((b, i) => `| ${i + 1} | \`${b.id}\` | ${getSeveridadEmoji(b.severidad)} ${b.severidad} | ${b.categoria} | ${b.suite} | ${b.test} | 🔴 Pendiente |`).join('\n')}

---

`;

  // Detalle de cada bug
  for (let i = 0; i < sessionBugs.length; i++) {
    const bug = sessionBugs[i];
    contenido += `## Bug ${i + 1}: \`${bug.id}\`

| Campo | Valor |
|---|---|
| **Severidad** | ${getSeveridadEmoji(bug.severidad)} ${bug.severidad.toUpperCase()} |
| **Categoría** | ${bug.categoria} |
| **Suite** | ${bug.suite} |
| **Test** | ${bug.test} |
| **URL** | ${bug.url || 'N/A'} |

### Descripción
${bug.descripcion}

### Pasos para Reproducir
${bug.pasos_reproduccion.map((p, j) => `${j + 1}. ${p}`).join('\n')}

### Resultado Esperado
${bug.resultado_esperado}

### Resultado Obtenido
${bug.resultado_obtenido}

${bug.errores_consola && bug.errores_consola.length > 0 ? `### Errores de Consola del Browser
\`\`\`
${bug.errores_consola.join('\n')}
\`\`\`
` : ''}${bug.screenshot ? `### Screenshot
![Bug ${i + 1}](${bug.screenshot})
` : ''}
### ✅ Corrección Aplicada
> ⏳ _Pendiente — El agente debe corregir este bug y documentar la solución aquí._

---

`;
  }

  contenido += `
---
*Reporte generado automáticamente al finalizar la ejecución de pruebas E2E de LogicaKids.*
*Archivo: \`reportes_bugs/reporte_ultima_ejecucion.md\`*
`;

  fs.writeFileSync(REPORTE_ULTIMA_EJECUCION, contenido, 'utf-8');
  console.log(`\n🐛 ═══ REPORTE DE EJECUCIÓN GENERADO ═══`);
  console.log(`   📄 Archivo: ${REPORTE_ULTIMA_EJECUCION}`);
  console.log(`   🔢 Total bugs: ${sessionBugs.length}`);
  console.log(`   🔴 Críticos: ${criticos.length} | 🟠 Altos: ${altos.length} | 🟡 Medios: ${medios.length} | 🔵 Bajos: ${bajos.length}`);
  console.log(`═════════════════════════════════════════\n`);

  return REPORTE_ULTIMA_EJECUCION;
}

// ═══════════════════════════════════════════════════════════════════════
// FASE 3: HISTORIAL — Se llama MANUALMENTE por el agente al corregir
// ═══════════════════════════════════════════════════════════════════════

/**
 * Registra un bug resuelto en el historial acumulativo.
 * El agente llama a esta función DESPUÉS de corregir un bug,
 * documentando qué hizo para solucionarlo.
 *
 * @param bugId - ID del bug (del reporte de última ejecución)
 * @param descripcionBug - Breve descripción del problema
 * @param solucion - Descripción detallada de la solución aplicada
 * @param archivosModificados - Lista de archivos que se modificaron para la corrección
 */
export function resolverBugEnHistorial(
  bugId: string,
  descripcionBug: string,
  solucion: string,
  archivosModificados: string[] = []
): void {
  ensureDirs();

  const fechaResolucion = new Date().toISOString();

  // Crear el historial si no existe
  if (!fs.existsSync(HISTORIAL_BUGS)) {
    const header = `# 📚 Historial de Bugs y Soluciones — LogicaKids

Este archivo es la **base de conocimiento acumulativa** de todos los bugs encontrados
y resueltos durante las pruebas E2E. Cuando un problema se repite o uno similar aparece,
consulta este historial para encontrar rápidamente la solución.

> **Uso:** Busca por palabras clave (ej: "ChunkLoadError", "login", "bloqueo") para
> encontrar soluciones previas relevantes.

---

`;
    fs.writeFileSync(HISTORIAL_BUGS, header, 'utf-8');
  }

  // Agregar la entrada resuelta al historial
  const entrada = `
## ✅ ${bugId}

| Campo | Valor |
|---|---|
| **Fecha detección** | _(ver reporte original)_ |
| **Fecha resolución** | ${fechaResolucion} |
| **Estado** | 🟢 RESUELTO |

### Problema
${descripcionBug}

### Solución Aplicada
${solucion}

${archivosModificados.length > 0 ? `### Archivos Modificados
${archivosModificados.map((f) => `- \`${f}\``).join('\n')}
` : ''}
---
`;

  fs.appendFileSync(HISTORIAL_BUGS, entrada, 'utf-8');

  // Actualizar también el reporte de última ejecución si existe
  if (fs.existsSync(REPORTE_ULTIMA_EJECUCION)) {
    let reporte = fs.readFileSync(REPORTE_ULTIMA_EJECUCION, 'utf-8');

    // Marcar el bug como corregido en la tabla resumen
    reporte = reporte.replace(
      new RegExp(`(\`${bugId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\`[^|]*\\|[^|]*\\|[^|]*\\|[^|]*\\|[^|]*\\|) 🔴 Pendiente \\|`),
      `$1 🟢 Corregido |`
    );

    // Reemplazar el placeholder de corrección con la solución real
    const bugSection = new RegExp(
      `(## Bug \\d+: \`${bugId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\`[\\s\\S]*?)> ⏳ _Pendiente — El agente debe corregir este bug y documentar la solución aquí\\._`
    );
    reporte = reporte.replace(
      bugSection,
      `$1✅ **CORREGIDO** (${fechaResolucion})\n\n${solucion}${archivosModificados.length > 0 ? '\n\nArchivos modificados: ' + archivosModificados.map(f => `\`${f}\``).join(', ') : ''}`
    );

    fs.writeFileSync(REPORTE_ULTIMA_EJECUCION, reporte, 'utf-8');
  }

  console.log(`✅ Bug ${bugId} documentado como RESUELTO en el historial`);
}

/**
 * Busca en el historial de bugs soluciones previas para un problema similar.
 * El agente usa esto para consultar si ya se resolvió algo parecido antes.
 *
 * @param keywords - Palabras clave del error o problema
 * @returns Array de soluciones previas encontradas
 */
export function buscarSolucionPrevia(
  keywords: string[]
): { bugId: string; problema: string; solucion: string }[] {
  if (!fs.existsSync(HISTORIAL_BUGS)) return [];

  const historial = fs.readFileSync(HISTORIAL_BUGS, 'utf-8');
  const resultados: { bugId: string; problema: string; solucion: string }[] = [];

  // Dividir por secciones de bugs
  const secciones = historial.split(/^## ✅ /gm).filter((s) => s.includes('RESUELTO'));

  for (const seccion of secciones) {
    const lower = seccion.toLowerCase();
    const coincide = keywords.some((kw) => lower.includes(kw.toLowerCase()));

    if (coincide) {
      // Extraer ID
      const idMatch = seccion.match(/^(BUG-\S+)/);
      const bugId = idMatch ? idMatch[1] : 'desconocido';

      // Extraer problema
      const probMatch = seccion.match(/### Problema\n([\s\S]*?)(?=\n###)/);
      const problema = probMatch ? probMatch[1].trim() : '';

      // Extraer solución
      const solMatch = seccion.match(/### Solución Aplicada\n([\s\S]*?)(?=\n###|\n---)/);
      const solucion = solMatch ? solMatch[1].trim() : '';

      if (bugId !== 'desconocido' && solucion) {
        resultados.push({ bugId, problema, solucion });
      }
    }
  }

  return resultados;
}
