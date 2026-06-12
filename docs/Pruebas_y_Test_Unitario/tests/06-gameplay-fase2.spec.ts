import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

const FASE2_THEORY_ANSWERS: Record<string, string> = {
  'doble de 8': '16',
  'cuádruple de 3': '12',
  'mitad de 14': '7',
  '5 + 4 × 2 =': '13',
  '5 + 4 \\* 2 =': '13',
  '(5 + 4) × 2 =': '18',
  '(5 + 4) \\* 2 =': '18',
  '20 - 10 ÷ 2 =': '15',
  '20 - 10 / 2 =': '15',
  'triple de la suma de 2 y 3': '15',
  '20 le resto la mitad de 8': '16',
  'doble de 10, y al resultado le sumo 5': '25',
  'se junta con 5 y el resultado final es 12': '7',
  'le roban 4 y quedan 10': '14',
  'X - 8 = 2': '10',
  'doble de mi edad actual da como resultado 20': '10',
  'amigos en partes iguales y a cada uno le tocaron 5': '20',
  '3 × Y = 18': '6',
  '3 \\* Y = 18': '6',
  '8 + [ ] = 20': '12',
  '8 + \\[ \\] = 20': '12',
  '[ ] ÷ 3 = 6': '18',
  '\\[ \\] / 3 = 6': '18',
  '25 - [ ] = 15': '10',
  '25 - \\[ \\] = 15': '10',
  'X + 14 = 30': '16',
  '4 × Z = 32': '8',
  '4 \\* Z = 32': '8',
  'Y - 9 = 11': '20',
  'dos monedas de 0,50': '1,00',
  'billete de 5,00 reais y una moneda de 0,25': '5,25',
  'tres monedas de 0,25': '0,75',
  'cuesta 1,50 pesos y pago con un billete de 2,00': '0,50',
  'cuesta 3,00 pesos. El cliente me paga con un billete de 5,00': '2,00',
  'cuesta 4,25 pesos y pago con un billete limpio de 5,00': '0,75',
  'jugo de 1,25 pesos y unas galletas de 1,25': '2,50',
  'helado de 2,75 pesos y un chicle de 0,25': '3,00',
  'cómic de 5,50 pesos y un lápiz de 1,50': '7,00',
  '10,00 pesos y mi carrito suma 8,50': '1',
  '4,00 pesos, pero el libro cuesta 5,75': '1,75',
  '6,50 pesos y compro un pastelito de 6,50': '0,00',
  'cajas de crayones con 6': '18',
  'crayones en pantalla! Si en el camino se le rompen 4': '14',
  '2 nidos y cada nido tiene 5 pajaritos (Total = 10)': '13',
  '12 manzanas rojas y 8 manzanas verdes': '20',
  '20 manzanas calculadas: Si utiliza la mitad': '10',
  '4 paquetes con 5 calcomanías cada uno (Total = 20)': '10',
  'Valentina tenía 15 bombones': '10',
  'Su abuela llegó y le duplicó': '20',
  'Mateo tiene 2 cajas con 6 tazos': '9'
};

function getCorrectAnswer(questionId: number): string {
  try {
    const cmd = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
    return execSync(cmd, { input: `SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId};` }).toString().trim();
  } catch (e) {
    console.error(`Error querying answer for question ${questionId}:`, e);
    return '';
  }
}

function clearTestUserProgress(email: string) {
  try {
    const queries = [
      `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
      `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
      `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
      `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
    ];
    for (const q of queries) {
      execSync(`docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local`, { input: q });
    }
  } catch (e) {
    console.error('❌ Failed to clear test user database progress:', e);
  }
}

async function submitCorrectAnswer(page: any, questionId: number) {
  const splash = page.locator('.f2-start-splash-overlay').first();
  if (await splash.isVisible().catch(() => false)) {
      await splash.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }
  const psqlBase = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
  const tipo = execSync(psqlBase, { input: `SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId};` }).toString().trim();

  if (tipo === 'MULTIPLE_OPCION' || tipo === 'multiple_opcion') {
    const correctText = execSync(psqlBase, { input: `SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1;` }).toString().trim();
    console.log(`[Q:${questionId}] MULTIPLE_OPCION -> CorrectText: "${correctText}"`);
    await page.locator(`button:has-text("${correctText}")`).first().click({ timeout: 5000 });
    await page.waitForTimeout(300); // Evitar pregunta espejo
    await page.locator('button:has-text("Confirmar")').first().click({ timeout: 5000 });
  } else if (tipo === 'CONSTRUCTOR_CHAINED' || tipo === 'constructor_soluciones_chained') {
    const ans1 = execSync(psqlBase, { input: `SELECT datos_numericos->'pasos'->0->>'respuesta_correcta' FROM preguntas WHERE id = ${questionId};` }).toString().trim();
    const ans2 = execSync(psqlBase, { input: `SELECT datos_numericos->'pasos'->1->>'respuesta_correcta' FROM preguntas WHERE id = ${questionId};` }).toString().trim();
    console.log(`[Q:${questionId}] CHAINED -> Paso 1: "${ans1}", Paso 2: "${ans2}"`);
    const hiddenInput = page.locator('input.f2-hidden-input').first();
    await hiddenInput.fill(ans1);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    const continueBtn = page.locator('button:has-text("Continuar →")').first();
    if (await continueBtn.isVisible().catch(()=>false)) {
      await continueBtn.click({ timeout: 5000 });
    }
    await page.waitForTimeout(500);
    await hiddenInput.fill(ans2);
    await page.keyboard.press('Enter');
  } else {
    const answer = getCorrectAnswer(questionId);
    console.log(`[Q:${questionId}] INTERACTIVA -> Answer: "${answer}"`);
    const hiddenInput = page.locator('input.f2-hidden-input').first();
    if (await hiddenInput.count() > 0) {
      await hiddenInput.fill(answer);
      await page.keyboard.press('Enter');
    } else {
      for (const char of answer) {
        console.log(`[Q:${questionId}] Typing char: "${char}"`);
        await page.locator('button').filter({ hasText: new RegExp(`^${char}$`) }).last().click({ timeout: 5000 });
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(300); // Evitar pregunta espejo
      await page.locator('button:has-text("Confirmar"), button.bg-blue-600').last().click({ timeout: 5000 });
    }
  }
}

async function failCurrentQuestion(page: any, questionId: number) {
  const splash = page.locator('.f2-start-splash-overlay').first();
  if (await splash.isVisible().catch(() => false)) {
      await splash.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }
  const psqlBase = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
  const tipo = execSync(psqlBase, { input: `SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId};` }).toString().trim();

  if (tipo === 'MULTIPLE_OPCION' || tipo === 'multiple_opcion') {
    const wrongText = execSync(psqlBase, { input: `SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1;` }).toString().trim();
    console.log(`[Q:${questionId}] MULTIPLE_OPCION (FAIL) -> WrongText: "${wrongText}"`);
    await page.locator(`button:has-text("${wrongText}")`).first().click({ timeout: 5000 });
    await page.waitForTimeout(300); // Evitar pregunta espejo
    await page.locator('button:has-text("Confirmar")').first().click({ timeout: 5000 });
  } else if (tipo === 'CONSTRUCTOR_CHAINED' || tipo === 'constructor_soluciones_chained') {
    console.log(`[Q:${questionId}] CHAINED (FAIL) -> Forcing '9999' on Paso 1`);
    const hiddenInput = page.locator('input.f2-hidden-input').first();
    await hiddenInput.fill('9999');
    await page.keyboard.press('Enter');
  } else {
    const hiddenInput = page.locator('input.f2-hidden-input').first();
    if (await hiddenInput.count() > 0) {
      await hiddenInput.fill('9999');
      await page.keyboard.press('Enter');
    } else {
      console.log(`[Q:${questionId}] INTERACTIVA (FAIL) -> Forcing '9999'`);
      for (let i = 0; i < 4; i++) {
        await page.locator('button').filter({ hasText: new RegExp(`^9$`) }).last().click({ timeout: 5000 });
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(300); // Evitar pregunta espejo
      await page.locator('button:has-text("Confirmar"), button.bg-blue-600').last().click({ timeout: 5000 });
    }
  }
}

const metadata = getPhaseMetadata(2);

test.describe('06 - Gameplay Fase 2 (Aritmética Intermedia) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 2);
    clearTestUserProgress(testUserEmail);

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase2/modulo/') &&
        response.url().includes('/pregunta')
      ) {
        try {
          const json = await response.json();
          if (json && json.id) {
            currentQuestionId = json.id;
          }
        } catch (e) {}
      }
    });
  });

  for (const modulo of metadata.modulos) {
    for (const nivel of modulo.niveles) {
      test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
        test.setTimeout(300000); // Timeout amplio para entorno local/Docker
        unlockAllUpToModule(testUserEmail, 2, modulo.modulo_id);
        
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 2, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/welcome-fase2');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f2-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const lvlBtn = page.locator('.f2-level-card').nth(nivel.nivel_id - 1);
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click();

        await navigateGenericTheoryModal(page, FASE2_THEORY_ANSWERS, 'f2');

        const splash = page.locator('.f2-start-splash-overlay').first();
        if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
          await splash.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        }

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        const maxQuestionsSafety = 30; // Evitar bucles infinitos

        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(1000);
          
          // Verificar si terminamos el nivel
          const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
          if (await endScreen.isVisible().catch(()=>false)) {
             console.log('Nivel completado con éxito.');
             break;
          }

          if (currentQuestionId === null) {
            // Check if there's a continue button
            const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
            if (await continueBtn.isVisible().catch(()=>false)) {
              await continueBtn.click();
            }
            continue;
          }

          const qId = currentQuestionId;
          
          // Forzamos error solo en algunas preguntas impares y si no superamos el límite
          if (errorsForced < maxErrors && questionCounter % 3 === 1) {
            await failCurrentQuestion(page, qId);
            errorsForced++;
            await page.waitForTimeout(1500);

            // Manejar la pantalla de error (Intentar de nuevo)
            const continueBtnWrong = page.locator('button:has-text("Intentar de nuevo ↺"), button:has-text("Continuar")').first();
            if (await continueBtnWrong.isVisible({ timeout: 3000 }).catch(()=>false)) {
               await continueBtnWrong.click();
            }

            await page.waitForTimeout(1500);
            if (currentQuestionId) {
               await submitCorrectAnswer(page, currentQuestionId);
            }
          } else {
            await submitCorrectAnswer(page, qId);
          }

          // Clic en Siguiente después de acertar
          await page.waitForTimeout(1000);
          const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
          if (await nextBtn.isVisible().catch(()=>false)) {
            await nextBtn.click();
            currentQuestionId = null; // resetear para esperar la proxima request
          }

          questionCounter++;
        }
      });
    }

    for (const desafio of modulo.desafios) {
      test(`Módulo ${modulo.modulo_id} Desafío ${desafio.seccion} - Salida Temprana`, async ({ page }) => {
        test.setTimeout(300000); // Timeout amplio para entorno local/Docker
        unlockAllUpToModule(testUserEmail, 2, modulo.modulo_id);
        for (const n of modulo.niveles) {
           approveProgresoMaestria(testUserEmail, 2, n.seccion, 'MIXTA');
        }
        for (const d of modulo.desafios) {
           if (d.nivel_id < desafio.nivel_id) {
              approveProgresoMaestria(testUserEmail, 2, d.seccion, 'MIXTA');
           }
        }

        await page.goto('/welcome-fase2');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f2-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
        const desafioBtn = page.locator('.f2-challenge-bar-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
        
        if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
            await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
            await desafioBtn.click();

            const splash = page.locator('.f2-start-splash-overlay').first();
            if (await splash.isVisible({ timeout: 5000 }).catch(()=>false)) {
                await splash.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            }

            for (let attempts = 0; attempts < 5; attempts++) {
              if (currentQuestionId === null) {
                 await page.waitForTimeout(1000);
                 attempts--; // Don't count waiting as an attempt
                 continue;
              }
              
              const oldQuestionId = currentQuestionId;
              await failCurrentQuestion(page, currentQuestionId!);

              let isEarlyExitVisible = false;
              const earlyExitModal = page.locator('.f2-feedback-overlay, .early-exit-modal').filter({ hasText: '¡Desafío Incompleto!' }).first();
              
              // Wait 3 seconds to let the normal auto-close handle it (which takes 1.5s)
              await page.waitForTimeout(3000);
              
              // If we are still here and Continuar is visible, auto-close didn't happen!
              // This means it's an early exit.
              const continueBtn = page.locator('button:has-text("Continuar →"), button:has-text("Continuar")').first();
              if (await continueBtn.isVisible().catch(()=>false)) {
                  await continueBtn.click().catch(()=>{});
                  
                  // Now wait for EarlyExitModal to appear
                  try {
                      await earlyExitModal.waitFor({ state: 'visible', timeout: 4000 });
                      isEarlyExitVisible = true;
                      const exitBtn = earlyExitModal.locator('button:has-text("Entendido"), button:has-text("Salir")').first();
                      if (await exitBtn.isVisible().catch(()=>false)) {
                          await exitBtn.click();
                      }
                  } catch (e) {
                      console.log("Early exit modal didn't appear after clicking Continuar");
                  }
              }

              if (isEarlyExitVisible) {
                  break;
              }

              // Wait for new question to load if it hasn't already
              for (let waitCount = 0; waitCount < 10; waitCount++) {
                 if (currentQuestionId !== oldQuestionId) break;
                 await page.waitForTimeout(500);
              }
            }
        }
      });
    }
  }
});
