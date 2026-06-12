import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

const FASE5_THEORY_ANSWERS: Record<string, string> = {
  'Un rectángulo tiene lados de 3 y 4 unidades. ¿Cuál es su perímetro?': '14',
  'Un cuadrado tiene un lado que mide 5. Su perímetro es:': '20',
  'El perímetro de un triángulo equilátero con lado de 6 es:': '18',
  'Una figura tiene cuatro lados que miden: 2, 3, 2 y 3. Perímetro:': '10',
  'Una estrella de 5 lados tiene cada lado de 1. Perímetro:': '5',
  'Un rectángulo mide 10 de largo y 5 de ancho. Perímetro:': '30',
  '¿Cuántos centímetros hay en 3 metros?': '300',
  '¿Cuántos metros hay en 5 kilómetros?': '5000',
  '¿Cuántos milímetros hay en 2 centímetros?': '20',
  '¿Cuál es el área de un cuadrado de 4x4 unidades?': '16',
  'Un rectángulo mide 5 de base y 2 de altura. Su área es:': '10',
  'Si pinto 3 filas de 3 cuadros, ¿cuál es el área?': '9',
  'Si tengo 4 cuadrados enteros y 2 mitades. Área total:': '5',
  'Figura con 0 enteros y 4 mitades. Área:': '2',
  'Si tengo 10 enteros y 6 mitades, área total:': '13',
  '¿Cuánto es 8 enteros más 8 mitades?': '12',
  '¿Cuánto es 12 enteros más 2 mitades?': '13',
  'Si un polígono ocupa 5 enteros y 4 mitades, su área es:': '7',
  'Un rectángulo de 10 u² y otro de 8 u² pegados suman:': '18',
  'Figura T compuesta por un techo de 12 u² y una base de 4 u². Área:': '16',
  'Una \'L\' de 15 u² en el alto y 5 u² en el piso. Total:': '20',
  'Si un triángulo de 3 u² se rota, su nueva área es:': '3',
  'Corto un papel de 10 u² en dos piezas. ¿Cuánto suman las dos piezas juntas?': '10',
  'Armo una casa con un Tangram de 16 u². El área de la casa es:': '16',
  'Área exterior 50, área interior en blanco 10. ¿Área pintada?': '40',
  'Caja de 100 cm² con agujero de 25 cm². Área restante:': '75',
  'Pared de 20 u² con ventana de 4 u². ¿Área a pintar?': '16',
  '¿Cuántos ejes de simetría tiene un círculo (escribe: infinitos)?': 'infinitos',
  '¿Cuántos ejes de simetría tiene un cuadrado perfecto?': '4',
  '¿Cuántos ejes tiene un triángulo equilátero?': '3',
  'Escala 1 u = 10m. Si un borde mide 4 u, ¿cuántos metros son?': '40',
  'Escala 1 u = 5km. Viajo 6 u. ¿Distancia real?': '30',
  'Escala 1 u = 2m. Altura de 15 u en el plano. ¿Altura real?': '30',
  'Si un monitor se anuncia como \'24 pulgadas\', ¿qué mide 24 pulgadas?': 'la diagonal',
  'En un rectángulo de 3x4, ¿la diagonal mide 5?': '1',
  '¿Qué es más largo en un TV, la base o la diagonal?': 'diagonal',
  '¿Cuántos centímetros cuadrados hay en 1 m²?': '10000',
  'Si 1 dm = 10 cm, ¿cuántos cm² hay en 1 dm²?': '100',
  'Si 1 m = 10 dm, ¿cuántos dm² hay en 2 m²?': '200'
};

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
      await page.waitForTimeout(300);
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
    await page.waitForTimeout(300);
    await page.locator('button.bg-\\[\\#2563eb\\], button:has(svg)').last().click();
  }
}

const metadata = getPhaseMetadata(5);

test.describe('09 - Gameplay Fase 5 (Geometría Plana y Medidas) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(240000);
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

        await navigateGenericTheoryModal(page, FASE5_THEORY_ANSWERS, 'f5');

        const splash = page.locator('.f5-start-splash-overlay').first();
        if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
          await splash.click();
          await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        }

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        const maxQuestionsSafety = 30; 
        const answeredQuestionIds = new Set<number>();

        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(500);
          
          const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
          if (await endScreen.isVisible().catch(()=>false)) {
             break;
          }

          if (currentQuestionId === null || answeredQuestionIds.has(currentQuestionId)) {
            const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
            const submitBtn = page.locator('button:has-text("Confirmar"), [data-testid="submit-numpad"]').first();
            if (await continueBtn.isVisible().catch(()=>false)) {
              await continueBtn.click();
              await page.waitForTimeout(500);
            } else if (currentQuestionId !== null && await submitBtn.isVisible().catch(()=>false)) {
              answeredQuestionIds.delete(currentQuestionId);
            } else {
              await page.waitForTimeout(200);
            }
            continue;
          }

          const qId = currentQuestionId;
          
          if (errorsForced < maxErrors && questionCounter % 3 === 1) {
            await failCurrentQuestion(page, qId);
            errorsForced++;
            
            await page.waitForTimeout(1000);
            const continueBtnWrong = page.locator('button:has-text("Continuar →"), button:has-text("Continuar")').first();
            if (await continueBtnWrong.isVisible({ timeout: 5000 }).catch(()=>false)) {
              await continueBtnWrong.click();
            }

            // Wait for the new question to load and currentQuestionId to change from qId
            let waitRetries = 0;
            while (currentQuestionId === qId && waitRetries < 30) {
              await page.waitForTimeout(100);
              waitRetries++;
            }

            if (currentQuestionId && !answeredQuestionIds.has(currentQuestionId)) {
              await submitCorrectAnswer(page, currentQuestionId);
              answeredQuestionIds.add(currentQuestionId);
            }
          } else {
            await submitCorrectAnswer(page, qId);
          }

          answeredQuestionIds.add(qId);

          await page.waitForTimeout(500);
          const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
          if (await nextBtn.isVisible().catch(()=>false)) {
            await nextBtn.click();
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
        for (const d of modulo.desafios) {
           if (d.nivel_id < desafio.nivel_id) {
              approveProgresoMaestria(testUserEmail, 5, d.seccion, 'MIXTA');
           }
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
                await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
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
