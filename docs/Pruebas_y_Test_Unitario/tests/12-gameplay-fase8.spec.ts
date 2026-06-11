import { test, expect } from '../helpers/test-fixtures';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { findCorrectAnswerMetadata, navigateGenericTheoryModal, submitNumericKeypad, escapeRegExp } from '../helpers/gameplay-utils';

test.describe('12 - Gameplay Fase 8 - Exhaustivo con Límites de Espejo', () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    testUserEmail = await registerDynamicTestUser(page);
  });

  const metadata8 = getPhaseMetadata(8);
  for (const modulo of metadata8.modulos) {
    for (const nivel of modulo.niveles) {
      test(`Fase 8 - Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
        setPhaseForUser(testUserEmail, 8);
        unlockAllUpToModule(testUserEmail, 8, modulo.modulo_id);
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 8, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/map');
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(({ mId, nId }) => {
          window.localStorage.removeItem('lk_fase_progress_7');
          const progress: Record<string, boolean> = {};
          for (let m = 1; m <= 3; m++) {
            for (let n = 1; n <= 6; n++) {
              if (m < mId || (m === mId && n < nId)) {
                progress[`${m}_${n}`] = true;
              }
            }
            if (m < mId) {
              progress[`${m}_11`] = true;
              progress[`${m}_12`] = true;
              progress[`${m}_13`] = true;
            }
          }
          window.localStorage.setItem('lk_fase_progress_8', JSON.stringify(progress));
        }, { mId: modulo.modulo_id, nId: nivel.nivel_id });
        await page.waitForTimeout(1000);

        const card = page.locator('div.group', { hasText: 'Fase 8' }).first();
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

        await navigateGenericTheoryModal(page, {
          // Fase 8 Módulo 1
          '4, 10, 16, 22': '28',
          '50, 45, 40, 35': '30',
          'sigue en: 2, 6, 18, 54': '162',
          'compuesto: 5, 10, 8, 13': '16',
          '8, 13, ?, 23, 28': '18',
          '100, 90, 80, ?, 60': '70',
          'Completa: 15, 22, 29, 36': '43',
          '1, 3, 2, 6, 4, 12': '8',
          'bacteria se duplica cada hora': '40',
          
          // Fase 8 Módulo 2
          '3 tamaños de palomitas': '12',
          '3 sopas, 4 platos fuertes': '24',
          'camisas y 3 pantalones': '8',
          '4 poleras y 4 pantalones': '16',
          '4 colores de polera y 3': '11',
          '150 piezas y hacemos lotes': '6',
          
          // Fase 8 Módulo 3
          '5 bolas rojas y 0 azules': 'Imposible',
          'tiras una moneda al aire': 'Posible',
          '7 lápices azules y 3 lápices rojos': '3/10',
          'Dado normal. ¿Probabilidad de sacar número par': '3/6',
          '3 rojas y 1 azul': 'Roja',
          'cola y 4 naranja': '3/7',
          'número mayor que 4': '2/6',
          '5 dulces de fresa y 5 de menta': '4/9',
          '5 esferas y 5 cubos': '5/10'
        });

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        const maxQuestionsSafety = 30;

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
          const answer = findCorrectAnswerMetadata(8, modulo.modulo_id, nivel.nivel_id, questionText);
          
          if (answer) {
              const isMultipleChoice = await page.locator('.fg-options-grid').count() > 0;
              
              if (errorsForced < maxErrors && questionCounter % 3 === 1) {
                  if (isMultipleChoice) {
                      const wrongOption = page.locator('.fg-option-text', { hasNotText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
                      if (await wrongOption.isVisible().catch(()=>false)) {
                          await wrongOption.click();
                          await page.waitForTimeout(200); 
                          await page.locator('.fg-mc-confirm-btn').click();
                      }
                  } else {
                      await submitNumericKeypad(page, "9999");
                  }
                  errorsForced++;
                  await page.waitForTimeout(1500);
                  
                  if (isMultipleChoice) {
                      await page.locator('.fg-mc-confirm-btn').click();
                  } else {
                      await page.locator('button.bg-blue-600, button.f2-keypad-submit, button.fg-keypad-submit, button.f5-keypad-submit, button.f6-keypad-submit').first().click();
                  }
                  await page.waitForTimeout(500);
                  
                  if (isMultipleChoice) {
                      const correctOption = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
                      if (await correctOption.isVisible().catch(()=>false)) {
                          await correctOption.click();
                          await page.waitForTimeout(200); 
                          await page.locator('.fg-mc-confirm-btn').click();
                      }
                  } else {
                      await submitNumericKeypad(page, answer);
                  }
                  await page.waitForTimeout(1500);

              } else {
                  if (isMultipleChoice) {
                    const optionBtn = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
                    if (await optionBtn.isVisible().catch(()=>false)) {
                        await optionBtn.click();
                        await page.waitForTimeout(200); 
                        await page.locator('.fg-mc-confirm-btn').click();
                    }
                  } else {
                    await submitNumericKeypad(page, answer);
                  }
                  await page.waitForTimeout(1500); 
              }
          } else {
              if (await page.locator('.fg-options-grid').count() > 0) {
                 await page.locator('.fg-option-text').first().click();
                 await page.locator('.fg-mc-confirm-btn').click();
              } else {
                 await submitNumericKeypad(page, "1");
              }
          }
          questionCounter++;
        }
      });
    }
  }
});
