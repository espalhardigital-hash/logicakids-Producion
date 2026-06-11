import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';

function getCorrectAnswer(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
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
      execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${q}"`);
    }
  } catch (e) {
    console.error('❌ Failed to clear test user database progress:', e);
  }
}

async function submitCorrectAnswer(page: any, questionId: number) {
  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();

  if (tipo === 'MULTIPLE_OPCION') {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
    const correctText = execSync(cmd).toString().trim();
    await page.locator(`button:has-text("${correctText}")`).first().click();
    await page.waitForTimeout(100);
    const confirmBtn = page.locator('button:has-text("Confirmar")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  } else {
    const answer = getCorrectAnswer(questionId);
    
    const hiddenInput = page.locator('.f5-hidden-input');
    if (await hiddenInput.count() > 0) {
      await hiddenInput.fill(answer);
      await hiddenInput.press('Enter');
    } else {
      for (const char of answer) {
        await page.locator(`button:has-text("${char}")`).last().click();
        await page.waitForTimeout(50);
      }
      await page.locator('button.bg-\\[\\#2563eb\\], button:has(svg)').last().click();
    }
  }
}

async function failCurrentQuestion(page: any, questionId: number) {
  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();

  if (tipo === 'MULTIPLE_OPCION') {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
    const wrongText = execSync(cmd).toString().trim();
    await page.locator(`button:has-text("${wrongText}")`).first().click();
    await page.waitForTimeout(100);
    const confirmBtn = page.locator('button:has-text("Confirmar")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  } else {
    for (let i = 0; i < 4; i++) {
      await page.locator(`button:has-text("9")`).last().click();
      await page.waitForTimeout(50);
    }
    await page.locator('button.bg-\\[\\#2563eb\\], button:has(svg)').last().click();
  }
}

const metadata = getPhaseMetadata(5);

test.describe('09 - Gameplay Fase 5 (Geometría Plana y Medidas) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 5);
    clearTestUserProgress(testUserEmail);

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase5/modulo/') &&
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
        unlockAllUpToModule(testUserEmail, 5, modulo.modulo_id);
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 5, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.route('**/api/fase5/lectura/**', async (route) => {
          const response = await route.fetch();
          const json = await response.json();
          json.interactivos = [];
          await route.fulfill({ json });
        });

        await page.goto('/welcome-fase5');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f5-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const lvlBtn = page.locator('.f5-level-card').nth(nivel.nivel_id - 1);
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click();

        const theoryModal = page.locator('.f5-reading-overlay');
        await page.waitForTimeout(1500);
        if (await theoryModal.isVisible()) {
          while (await page.locator('button:has-text("Siguiente")').isVisible()) {
            await page.locator('button:has-text("Siguiente")').first().click();
            await page.waitForTimeout(300);
          }
          const startBtn = page.locator('button:has-text("¡Entendido, empezar!")').first();
          if (await startBtn.isVisible()) await startBtn.click();
        }

        const splash = page.locator('.f5-start-splash-overlay').first();
        await page.waitForTimeout(1500);
        if (await splash.isVisible()) {
          await splash.click();
        }

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        const maxQuestionsSafety = 30; 

        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(1000);
          
          const endScreen = page.locator('text=¡Desafío Terminado!, text=Nivel Completado, text=Dominado').first();
          if (await endScreen.isVisible().catch(()=>false)) {
             break;
          }

          if (currentQuestionId === null) {
            const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
            if (await continueBtn.isVisible().catch(()=>false)) {
              await continueBtn.click();
            }
            continue;
          }

          const qId = currentQuestionId;
          
          if (errorsForced < maxErrors && questionCounter % 3 === 1) {
            await failCurrentQuestion(page, qId);
            errorsForced++;
            
            await page.waitForTimeout(1500);
            const continueBtnWrong = page.locator('button:has-text("Continuar →"), button:has-text("Continuar")').first();
            if (await continueBtnWrong.isVisible({ timeout: 5000 }).catch(()=>false)) {
              await continueBtnWrong.click();
            }

            await page.waitForTimeout(1500);
            if (currentQuestionId) {
               await submitCorrectAnswer(page, currentQuestionId);
            }
          } else {
            await submitCorrectAnswer(page, qId);
          }

          await page.waitForTimeout(1000);
          const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
          if (await nextBtn.isVisible().catch(()=>false)) {
            await nextBtn.click();
            currentQuestionId = null;
          }

          questionCounter++;
        }
      });
    }

    for (const desafio of modulo.desafios) {
      test(`Módulo ${modulo.modulo_id} Desafío ${desafio.seccion} - Salida Temprana`, async ({ page }) => {
        unlockAllUpToModule(testUserEmail, 5, modulo.modulo_id);
        for (const n of modulo.niveles) {
           approveProgresoMaestria(testUserEmail, 5, n.seccion, 'MIXTA');
        }

        await page.goto('/welcome-fase5');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f5-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
        const desafioBtn = page.locator('.f5-challenge-bar-btn, .f5-challenge-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
        
        if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
            await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
            await desafioBtn.click();

            const splash = page.locator('.f5-start-splash-overlay').first();
            if (await splash.isVisible({ timeout: 5000 }).catch(()=>false)) {
                await splash.click();
            }

            for (let attempts = 0; attempts < 5; attempts++) {
              await page.waitForTimeout(1500);
              if (currentQuestionId === null) continue;
              
              await failCurrentQuestion(page, currentQuestionId!);

              const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Siguiente Pregunta →")').first();
              if (await continueBtn.isVisible().catch(()=>false)) {
                await continueBtn.click();
              }
              
              const earlyExitModal = page.locator('.f5-feedback-card.early-exit, .early-exit-modal');
              if (await earlyExitModal.isVisible({ timeout: 2000 }).catch(()=>false)) {
                  const exitBtn = earlyExitModal.locator('button:has-text("Entendido"), button:has-text("Salir")').first();
                  if (await exitBtn.isVisible()) await exitBtn.click();
                  break;
              }
            }
        }
      });
    }
  }
});
