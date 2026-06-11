import { test, expect } from '../helpers/test-fixtures';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { findCorrectAnswerMetadata, navigateGenericTheoryModal, submitNumericKeypad, escapeRegExp } from '../helpers/gameplay-utils';

test.describe('11 - Gameplay Fase 7 - Exhaustivo con Límites de Espejo', () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    testUserEmail = await registerDynamicTestUser(page);
  });

  const metadata7 = getPhaseMetadata(7);
  for (const modulo of metadata7.modulos) {
    for (const nivel of modulo.niveles) {
      test(`Fase 7 - Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
        setPhaseForUser(testUserEmail, 7);
        unlockAllUpToModule(testUserEmail, 7, modulo.modulo_id);
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 7, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/map');
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(({ mId, nId }) => {
          window.localStorage.removeItem('lk_fase_progress_8');
          const progress: Record<string, boolean> = {};
          for (let m = 1; m <= 4; m++) {
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
          window.localStorage.setItem('lk_fase_progress_7', JSON.stringify(progress));
        }, { mId: modulo.modulo_id, nId: nivel.nivel_id });
        await page.waitForTimeout(1000);

        const card = page.locator('div.group', { hasText: 'Fase 7' }).first();
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
          // Fase 7 Módulo 1
          'cohete avanza 2 casillas': '3',
          'Gira 90° a la izquierda': 'Norte',
          'partes de (2,2)': '(3,5)',
          'Norte 2, Este 3, Sur 1': '6',
          'distancia mínima de (1,1) a (4,5)': '7',
          'Norte 3, Este 6': 'No',
          
          // Fase 7 Módulo 2
          'llegar al punto (6, 3)': '6 y 3',
          'punto (5, 5) y otro en (5, 0)': 'Columna',
          'punto (3, 2) se traslada 5': '(8,3)',
          'punto en (7, 6) se mueve 4': '3',
          'distancia Manhattan de (2, 3) a (7, 5)': '7',
          'De (4, 4) a (4, 9)': '5',
          
          // Fase 7 Módulo 3
          '3 horas y 15 minutos': '195',
          'horas completas hay en 150 minutos': '2',
          '15:30 y termina a las 18:00': '2 horas y 30 minutos',
          'tarea a las 17:40 y la terminó': '90',
          'Suma: 1h 45min + 2h 30min': '4h 15min',
          'Resta: 4h 15min – 1h 50min': '2h 25min',
          'Resta: 4h 15min - 1h 50min': '2h 25min',
          
          // Fase 7 Módulo 4
          'salidas: 7:00, 9:00, 11:00': '9:30',
          'metro pasa a las 7:10, 7:25': '15',
          'Bus: 20 min. Espera: 15': '60',
          'Ana sale a las 8:15': '9:00',
          'tarda 40 min. Ruta B: sale 9:10': '9:35',
          'metro pasa cada 12 minutos': '7:00'
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
          const answer = findCorrectAnswerMetadata(7, modulo.modulo_id, nivel.nivel_id, questionText);
          
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
