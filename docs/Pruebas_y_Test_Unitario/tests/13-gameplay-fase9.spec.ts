import { test, expect } from '../helpers/test-fixtures';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanText(html: string): string {
  return html
    .replace(/<img[^>]*>/g, '')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/['"‘“’”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findCorrectAnswer(metadata: any, moduloId: number, nivelId: number, currentQuestionText: string): string {
  const cleanCurrent = cleanText(currentQuestionText);

  if (moduloId === 99) {
    const allQuestions = metadata.modulos.flatMap((m: any) => m.niveles.flatMap((n: any) => n.preguntas));
    for (const q of allQuestions) {
      if (cleanText(q.enunciado) === cleanCurrent) {
        return q.respuesta_correcta;
      }
    }
    return '';
  }

  const modulo = metadata.modulos.find((m: any) => m.modulo_id === moduloId);
  if (!modulo) return '';
  const nivel = modulo.niveles.find((n: any) => n.nivel_id === nivelId);
  if (!nivel) return '';

  for (const q of nivel.preguntas) {
    if (cleanText(q.enunciado) === cleanCurrent) {
      return q.respuesta_correcta;
    }
  }

  return '';
}

test.describe('12 - Gameplay Fase 9 (Simulados Colegio Pedro II) - Exhaustivo', () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    testUserEmail = await registerDynamicTestUser(page);
  });

  const metadata = getPhaseMetadata(9);

  for (const modulo of metadata.modulos) {
    for (const nivel of modulo.niveles) {
      test(`Fase 9 - Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
        setPhaseForUser(testUserEmail, 9);
        unlockAllUpToModule(testUserEmail, 9, modulo.modulo_id);
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 9, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/map');
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(() => {
          window.localStorage.removeItem('lk_fase_progress_9');
        });
        await page.waitForTimeout(1000);

        const card = page.locator('div.group', { hasText: 'Fase 9' }).first();
        await card.locator('button').first().click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.fg-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const lvlBtn = page.locator('.fg-level-card').nth(nivel.nivel_id - 1);
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click();

        const theoryOverlay = page.locator('.fg-reading-overlay');
        if (await theoryOverlay.isVisible().catch(()=>false)) {
            while (true) {
              const nextBtn = page.locator('button.fg-nav-btn.primary');
              const startBtn = page.locator('button.fg-reading-close-btn');
              if (await startBtn.isVisible().catch(()=>false)) {
                await startBtn.click();
                break;
              } else if (await nextBtn.isVisible().catch(()=>false) && await nextBtn.isEnabled().catch(()=>false)) {
                await nextBtn.click();
                await page.waitForTimeout(500);
              } else {
                break;
              }
            }
        }

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        const maxQuestionsSafety = 40;

        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(1000);
          
          if (await page.locator('text=¡Desafío Terminado!').isVisible().catch(()=>false)) {
            break;
          }

          const questionTextEl = page.locator('.fg-question-text').first();
          if (!await questionTextEl.isVisible().catch(()=>false)) {
            if (await page.locator('text=¡Desafío Terminado!').isVisible().catch(()=>false)) {
              break;
            }
            continue; 
          }

          const questionText = await questionTextEl.innerHTML();
          const answer = findCorrectAnswer(metadata, modulo.modulo_id, nivel.nivel_id, questionText);
          
          if (answer) {
              const isMultipleChoice = await page.locator('.fg-options-grid').count() > 0;
              
              if (errorsForced < maxErrors && questionCounter % 3 === 1) {
                  // Fallar a propósito
                  if (isMultipleChoice) {
                      const wrongOption = page.locator('.fg-option-text', { hasNotText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
                      if (await wrongOption.isVisible().catch(()=>false)) {
                          await wrongOption.click();
                          await page.locator('.fg-mc-confirm-btn').click();
                      }
                  } else {
                      await page.locator(`button:has-text("9")`).last().click();
                      await page.locator('button.bg-blue-600').first().click();
                  }
                  errorsForced++;
                  await page.waitForTimeout(1500);
                  
                  // Solucionar el espejo
                  if (isMultipleChoice) {
                      const correctOption = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
                      if (await correctOption.isVisible().catch(()=>false)) {
                          await correctOption.click();
                          await page.locator('.fg-mc-confirm-btn').click();
                      }
                  } else {
                      for (const char of answer) {
                        await page.locator(`button:has-text("${char}")`).last().click();
                        await page.waitForTimeout(50);
                      }
                      await page.locator('button.bg-blue-600').first().click();
                  }
                  await page.waitForTimeout(1500);

              } else {
                  // Acertar directamente
                  if (isMultipleChoice) {
                    const optionBtn = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
                    if (await optionBtn.isVisible().catch(()=>false)) {
                        await optionBtn.click();
                        await page.locator('.fg-mc-confirm-btn').click();
                    }
                  } else {
                    for (const char of answer) {
                      await page.locator(`button:has-text("${char}")`).last().click();
                      await page.waitForTimeout(50);
                    }
                    await page.locator('button.bg-blue-600').first().click();
                  }
                  await page.waitForTimeout(1500); 
              }
          } else {
              if (await page.locator('.fg-options-grid').count() > 0) {
                 await page.locator('.fg-option-text').first().click();
                 await page.locator('.fg-mc-confirm-btn').click();
              } else {
                 await page.locator(`button:has-text("1")`).last().click();
                 await page.locator('button.bg-blue-600').first().click();
              }
          }
          questionCounter++;
        }
      });
    }
  }
});
