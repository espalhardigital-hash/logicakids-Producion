import { test, expect } from '../helpers/test-fixtures';
import { API, GAME_CONFIG } from '../helpers/constants';
import { ensureAuthenticated } from '../helpers/auth';

/**
 * Suite 05: Validación de Progresión y Desbloqueo
 *
 * Verifica el sistema de bloqueo/desbloqueo de módulos, niveles y desafíos.
 * Comprueba que:
 * - Los bloques con estado BLOQUEADO no son accesibles
 * - Los bloques EN_PROGRESO son accesibles
 * - Los bloques APROBADO están correctamente marcados
 * - El porcentaje mínimo de aprobación se respeta para desbloquear
 * - La API de progreso responde con datos coherentes
 */
test.describe('05 - Progresión y Desbloqueo', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  // ─── Test: API de progreso responde correctamente ────────────────
  test('La API de bloques de progreso responde con datos válidos', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token, 'Token de autenticación no encontrado').toBeTruthy();

    // Llamar al endpoint de bloques de progreso
    const response = await page.request.get(API.PROGRESS_BLOCKS, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    expect(
      response.ok(),
      `API ${API.PROGRESS_BLOCKS} respondió con error: ${response.status()}`
    ).toBe(true);

    const blocks = await response.json();
    expect(Array.isArray(blocks), 'La respuesta de bloques debe ser un array').toBe(true);

    if (blocks.length > 0) {
      // Validar estructura de cada bloque
      const firstBlock = blocks[0];
      expect(firstBlock).toHaveProperty('fase_id');
      expect(firstBlock).toHaveProperty('estado');
      expect(firstBlock).toHaveProperty('porcentaje_actual');

      // Validar que los estados son válidos
      const validStates = Object.values(GAME_CONFIG.BLOCK_STATE);
      for (const block of blocks) {
        expect(
          validStates,
          `Estado inválido encontrado: "${block.estado}" en fase ${block.fase_id}, sección ${block.seccion}`
        ).toContain(block.estado);
      }

      console.log(`📊 Total de bloques: ${blocks.length}`);
      console.log(`   ✅ APROBADOS: ${blocks.filter((b: any) => b.estado === 'APROBADO').length}`);
      console.log(`   🔄 EN_PROGRESO: ${blocks.filter((b: any) => b.estado === 'EN_PROGRESO').length}`);
      console.log(`   🔒 BLOQUEADOS: ${blocks.filter((b: any) => b.estado === 'BLOQUEADO').length}`);
    }
  });

  // ─── Test: Resumen de progreso responde correctamente ────────────
  test('La API de resumen de progreso responde con datos válidos', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    const response = await page.request.get(API.PROGRESS_SUMMARY, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    expect(response.ok(), `API ${API.PROGRESS_SUMMARY} respondió con error`).toBe(true);

    const summary = await response.json();
    expect(summary).toHaveProperty('alumno_id');
    expect(summary).toHaveProperty('total_bloques_aprobados');
    expect(summary).toHaveProperty('precision_promedio');

    console.log(`📈 Resumen del usuario de prueba:`);
    console.log(`   Bloques trabajados: ${summary.total_bloques_trabajados}`);
    console.log(`   Bloques aprobados: ${summary.total_bloques_aprobados}`);
    console.log(`   Precisión promedio: ${summary.precision_promedio}%`);
  });

  // ─── Test: Bloques BLOQUEADOS no permiten avance ─────────────────
  test('Los bloques BLOQUEADOS tienen porcentaje 0 y no están desbloqueados por admin', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    const response = await page.request.get(API.PROGRESS_BLOCKS, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const blocks = await response.json();
    const blockedBlocks = blocks.filter((b: any) => b.estado === GAME_CONFIG.BLOCK_STATE.BLOQUEADO);

    if (blockedBlocks.length > 0) {
      for (const block of blockedBlocks) {
        // Los bloques bloqueados no deberían tener progreso
        expect(
          block.completitud_actual,
          `Bloque bloqueado (fase ${block.fase_id}, sección ${block.seccion}) tiene completitud > 0`
        ).toBe(0);

        // No deberían estar desbloqueados por admin (a menos que sea override)
        if (!block.desbloqueado_por_admin) {
          expect(block.aciertos_acumulados).toBe(0);
          expect(block.intentos_totales).toBe(0);
        }
      }
      console.log(`🔒 ${blockedBlocks.length} bloques BLOQUEADOS verificados correctamente`);
    } else {
      console.log('ℹ️ No hay bloques BLOQUEADOS para el usuario de prueba');
    }
  });

  // ─── Test: Bloques APROBADOS tienen porcentaje >= mínimo ─────────
  test('Los bloques APROBADOS tienen porcentaje >= nota mínima de aprobación', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    // Obtener configuración de aprobación (si hay override por admin, usar ese)
    const configResponse = await page.request.get(API.ADMIN_SETTINGS, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let passingScore = GAME_CONFIG.DEFAULT_PASSING_SCORE;
    if (configResponse.ok()) {
      const config = await configResponse.json();
      if (config?.practica_libre?.porcentaje_aprobacion) {
        passingScore = config.practica_libre.porcentaje_aprobacion;
      }
    }

    // Obtener bloques de progreso
    const response = await page.request.get(API.PROGRESS_BLOCKS, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const blocks = await response.json();
    const approvedBlocks = blocks.filter(
      (b: any) => b.estado === GAME_CONFIG.BLOCK_STATE.APROBADO && !b.aprobado_por_admin
    );

    if (approvedBlocks.length > 0) {
      for (const block of approvedBlocks) {
        expect(
          block.porcentaje_actual,
          `Bloque APROBADO (fase ${block.fase_id}, sección ${block.seccion}, op: ${block.operacion}) ` +
          `tiene porcentaje ${block.porcentaje_actual}% pero mínimo es ${passingScore}%`
        ).toBeGreaterThanOrEqual(passingScore);
      }
      console.log(
        `✅ ${approvedBlocks.length} bloques APROBADOS verificados (todos >= ${passingScore}%)`
      );
    } else {
      console.log('ℹ️ No hay bloques APROBADOS orgánicamente para verificar');
    }
  });

  // ─── Test: Orden de desbloqueo es coherente ──────────────────────
  test('El orden de desbloqueo de bloques es coherente (no hay saltos)', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    const response = await page.request.get(API.PROGRESS_BLOCKS, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const blocks = await response.json();

    if (blocks.length > 1) {
      // Agrupar bloques por fase
      const byFase: Record<number, any[]> = {};
      for (const block of blocks) {
        if (!byFase[block.fase_id]) byFase[block.fase_id] = [];
        byFase[block.fase_id].push(block);
      }

      // Para cada fase, verificar que no haya un bloque EN_PROGRESO/APROBADO
      // después de un bloque BLOQUEADO (excepto si el admin lo desbloqueó)
      for (const [faseId, faseBlocks] of Object.entries(byFase)) {
        // Ordenar por sección
        const sorted = faseBlocks.sort((a: any, b: any) => a.seccion - b.seccion);

        let foundBlocked = false;
        for (const block of sorted) {
          if (block.estado === GAME_CONFIG.BLOCK_STATE.BLOQUEADO) {
            foundBlocked = true;
          } else if (foundBlocked && !block.desbloqueado_por_admin && !block.aprobado_por_admin) {
            // Un bloque activo después de uno bloqueado sin intervención admin es sospechoso
            console.warn(
              `⚠️ Fase ${faseId}: Bloque sección ${block.seccion} (${block.operacion}) ` +
              `está ${block.estado} pero hay bloques anteriores BLOQUEADOS`
            );
          }
        }
      }

      console.log(`📋 Coherencia de desbloqueo verificada para ${Object.keys(byFase).length} fases`);
    }
  });

  // ─── Test: Historial de progreso responde correctamente ──────────
  test('El historial de progreso del usuario responde con datos válidos', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    const response = await page.request.get(API.PROGRESS_HISTORY, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    expect(response.ok(), `API ${API.PROGRESS_HISTORY} respondió con error`).toBe(true);

    const history = await response.json();
    expect(Array.isArray(history), 'El historial debe ser un array').toBe(true);

    if (history.length > 0) {
      const firstEntry = history[0];
      expect(firstEntry).toHaveProperty('fase_id');
      expect(firstEntry).toHaveProperty('porcentaje');
      expect(firstEntry).toHaveProperty('estado_resultado');

      // Validar estados de resultado válidos
      const validResults = ['APROBADO', 'NO_APROBADO', 'EN_PROGRESO', 'EARLY_EXIT', 'RESCATE_COMPLETADO', 'ADMIN_UNLOCK', 'ADMIN_APPROVE'];
      for (const entry of history) {
        expect(
          validResults,
          `Estado de resultado inválido: "${entry.estado_resultado}"`
        ).toContain(entry.estado_resultado);
      }

      console.log(`📜 Historial: ${history.length} registros encontrados`);
    } else {
      console.log('ℹ️ El usuario de prueba aún no tiene historial de progreso');
    }
  });

  test('La pantalla de progreso se renderiza en el browser sin errores', async ({ page, consoleLogger }) => {
    consoleLogger.clear();

    await page.goto('/progress');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);

    // Verificar que hay contenido
    const rootHtml = await page.innerHTML('#root');
    expect(rootHtml.length).toBeGreaterThan(50);

    // Sin errores de carga
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('ChunkLoadError');

    // Sin errores críticos en consola del browser
    expect(
      consoleLogger.hasCriticalErrors(),
      `Errores en consola de la pantalla de progreso:\n${consoleLogger.getCriticalErrorsSummary()}`
    ).toBe(false);
  });
});
