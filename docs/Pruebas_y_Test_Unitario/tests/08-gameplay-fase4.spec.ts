import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

const FASE4_THEORY_ANSWERS: Record<string, string> = {
  'Un círculo está dividido en 5 partes': '2/5',
  'Si pintas 4 partes de un rectángulo': '4/6',
  'Un círculo tiene 4 partes y todas': '4/4',
  'Encuentra la fracción equivalente a 1/2': '3/6',
  'Amplifica 2/3 por un factor de 2': '4/6',
  '¿Qué fracción equivalente a 4/8': '1/2',
  'Un cuadrado se divide en 2 rectángulos': '1/2',
  'Un cuadrado de 4x4 cuadraditos tiene 8 pintados': '1/2',
  'Si cortamos un círculo en 4 porciones, pero 2 de ellas': 'no',
  'Calcula 1/4 de 16': '4',
  'Si tienes 15 manzanas y regalas 1/3': '5',
  'Calcula 1/5 de 40': '8',
  'Calcula 3/4 de 24': '18',
  'Un cofre tiene 30 monedas. Tomas 2/3': '20',
  'Calcula 4/5 de 50': '40',
  'Si gastas 3/8 de tu dinero': '5/8',
  'Tenías 30 manzanas y regalaste 1/3. ¿Cuántas': '20',
  'Un tanque de 50 litros vacía 2/5': '30',
  'Calcula el 50% de 80.': '40',
  'Calcula el 25% de 120.': '30',
  'Calcula el 10% de 450.': '45',
  'En una encuesta del 100%, 45% prefiere chocolate': '25',
  'De un total de 400 personas, el 50%': '200',
  'Si el 10% de un pastel representa 8': '80',
  'Tres barras marcan: A=100, B=150, C=50. ¿Cuál es el total': '300',
  'Usando las barras anteriores: ¿cuánto más grande': '100',
  'Si sumamos las barras A (100) y C (50)': 'sí',
  'Calcula el promedio de las puntuaciones: 4, 8 y 12.': '8',
  'Dos amigos gastan R$ 10 y R$ 20. ¿Cuál': '15',
  'En tres días llovió 6 mm, 6 mm y 12 mm. ¿Cuál': '8',
  'La receta es 3 tazas de agua por 1 de limón': '9',
  'Pintura rosa usa 1 litro de rojo por 4 de blanco': '8',
  'Una masa requiere 1 huevo por 3 tazas de harina': '3',
  'Mezclas 2 litros de azul y 3 de amarillo': '6',
  'Pintura rosa usa 1 de rojo y 4 de blanco': '20',
  'Concreto lleva 3 de arena y 7 de grava': '9',
  'Una mezcla tiene 1 parte de concentrado y 9 de agua': '10',
  'Un jugo de 200 ml contiene 25% de pulpa. ¿Cuántos': '50',
  'Si en 100 gramos de chocolate hay 10%': '90'
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

function getBeakerCorrectLevel(questionId: number): number {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT COALESCE((datos_numericos->>'ess')::integer, respuesta_correcta::integer) FROM preguntas WHERE id = ${questionId}"`;
    return parseInt(execSync(cmd).toString().trim(), 10);
  } catch (e) {
    console.error(`Error querying beaker level for question ${questionId}:`, e);
    return 0;
  }
}

function getQuestionEnunciado(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT enunciado FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying enunciado for question ${questionId}:`, e);
    return '';
  }
}
function isQuestionBeakerInteractive(questionId: number): boolean {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT COALESCE((datos_numericos->>'es_interactivo')::boolean, false) FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim() === 't';
  } catch (e) {
    console.error(`Error querying beaker interactivity for question ${questionId}:`, e);
    return false;
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

function isQuestionInteractiveLayout(questionId: number): boolean {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT COALESCE((datos_numericos->>'es_interactivo')::boolean, false) AND datos_numericos->>'tipo_visual' IN ('pizza', 'pie') FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim() === 't';
  } catch (e) {
    console.error(`Error querying interactive layout for question ${questionId}:`, e);
    return false;
  }
}

async function waitForLayoutReady(page: any, isInteractive: boolean, isMultipleOption: boolean) {
  let retries = 0;
  const confirmBtn = page.locator('button:has-text("CONFIRMAR")');
  const numpadBtn = page.locator('[data-testid="submit-numpad"]');
  
  if (isMultipleOption) {
    while ((await confirmBtn.count() !== 0 || await numpadBtn.count() !== 0) && retries < 30) {
      await page.waitForTimeout(100);
      retries++;
    }
  } else if (isInteractive) {
    while ((await confirmBtn.count() !== 1 || await numpadBtn.count() !== 0) && retries < 30) {
      await page.waitForTimeout(100);
      retries++;
    }
  } else {
    while ((await numpadBtn.count() !== 1 || await confirmBtn.count() !== 0) && retries < 30) {
      await page.waitForTimeout(100);
      retries++;
    }
  }
}

async function submitCorrectAnswer(page: any, questionId: number) {
  const answer = getCorrectAnswer(questionId);
  const enunciado = getQuestionEnunciado(questionId);
  if (answer.includes('/')) {
    await page.locator(`text=${answer}`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  } else if (enunciado) {
    const cleanText = enunciado.replace(/\[ESPEJO\]/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30);
    if (cleanText) {
      await page.locator(`text=${cleanText}`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  }
  await page.waitForTimeout(200);

  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();
  const isMultipleOption = tipo === 'MULTIPLE_OPCION';
  const isInteractive = isQuestionInteractiveLayout(questionId);

  // Wait for the layouts to settle and exiting screens to unmount completely
  await waitForLayoutReady(page, isInteractive, isMultipleOption);

  if (isMultipleOption) {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
    const correctText = execSync(cmd).toString().trim();
    await page.locator(`button:has-text("${correctText}")`).first().click();
  } else {
    if (isInteractive) {
      const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
      if (answer.includes('/')) {
        const [num, den] = answer.split('/');
        const numerator = parseInt(num, 10);
        const denominator = parseInt(den, 10);
        const paths = page.locator('path[stroke="rgba(255,255,255,0.15)"]');
        let retries = 0;
        while (await paths.count() !== denominator && retries < 30) {
          await page.waitForTimeout(100);
          retries++;
        }
        for (let i = 0; i < numerator; i++) {
          await paths.nth(i).click({ force: true });
          await page.waitForTimeout(200);
        }
      } else {
        const hint = page.locator('text=👉 ¡TÓCAME!').first();
        if (await hint.isVisible()) {
          await hint.click({ force: true });
          await page.waitForTimeout(200);
        }
        let label = `${answer}%`;
        if (answer === '25') label = '1/4 (25%)';
        else if (answer === '50') label = '1/2 (50%)';
        
        await page.locator(`button:has-text("${label}")`).first().click();
        await page.waitForTimeout(200);
      }
      await page.waitForTimeout(300); // Wait for React state to propagate
      await confirmBtn.click();
    } else {
      if (answer.includes('/')) {
        const [num, den] = answer.split('/');
        
        for (const char of num) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
        
        await page.locator('.f4-fraction-input-field').nth(1).click();
        await page.waitForTimeout(100);
        
        for (const char of den) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
      } else {
        const beakerSegments = page.locator('.flex-col-reverse > div');
        let beakerClicked = false;
        if (isQuestionBeakerInteractive(questionId) && await beakerSegments.count() > 0) {
          const level = getBeakerCorrectLevel(questionId);
          if (level > 0 && level <= await beakerSegments.count()) {
            await beakerSegments.nth(level - 1).click({ force: true });
            await page.waitForTimeout(200);
            beakerClicked = true;
          }
        }

        if (!beakerClicked) {
          for (const char of answer) {
            await page.locator(`button:has-text("${char}")`).last().click();
            await page.waitForTimeout(50);
          }
        }
      }
      await page.waitForTimeout(300);
      await page.getByTestId('submit-numpad').click();
    }
  }
}

async function failCurrentQuestion(page: any, questionId: number) {
  const answer = getCorrectAnswer(questionId);
  const enunciado = getQuestionEnunciado(questionId);
  if (answer.includes('/')) {
    await page.locator(`text=${answer}`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  } else if (enunciado) {
    const cleanText = enunciado.replace(/\[ESPEJO\]/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30);
    if (cleanText) {
      await page.locator(`text=${cleanText}`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  }
  await page.waitForTimeout(200);

  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();
  const isMultipleOption = tipo === 'MULTIPLE_OPCION';
  const isInteractive = isQuestionInteractiveLayout(questionId);

  // Wait for layout to be ready
  await waitForLayoutReady(page, isInteractive, isMultipleOption);

  if (isMultipleOption) {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
    const wrongText = execSync(cmd).toString().trim();
    await page.locator(`button:has-text("${wrongText}")`).first().click();
  } else {
    if (isInteractive) {
      const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
      if (answer.includes('/')) {
        const [_, den] = answer.split('/');
        const denominator = parseInt(den, 10);
        const paths = page.locator('path[stroke="rgba(255,255,255,0.15)"]');
        let retries = 0;
        while (await paths.count() !== denominator && retries < 30) {
          await page.waitForTimeout(100);
          retries++;
        }
        await paths.first().click({ force: true });
        await page.waitForTimeout(100);
        await paths.first().click({ force: true });
        await page.waitForTimeout(300);
      } else {
        const hint = page.locator('text=👉 ¡TÓCAME!').first();
        if (await hint.isVisible()) {
          await hint.click({ force: true });
          await page.waitForTimeout(200);
        }
        const wrongOption = answer === '10' ? '20%' : '10%';
        await page.locator(`button:has-text("${wrongOption}")`).first().click();
        await page.waitForTimeout(200);
      }
      await confirmBtn.click();
    } else {
      const beakerSegments = page.locator('.flex-col-reverse > div');
      let beakerClicked = false;
      if (isQuestionBeakerInteractive(questionId) && await beakerSegments.count() > 0) {
        const level = getBeakerCorrectLevel(questionId);
        const wrongLevel = level === 1 ? 2 : 1;
        if (wrongLevel <= await beakerSegments.count()) {
          await beakerSegments.nth(wrongLevel - 1).click({ force: true });
          await page.waitForTimeout(200);
          beakerClicked = true;
        }
      }

      if (!beakerClicked) {
        if (answer.includes('/')) {
          await page.locator(`button:has-text("9")`).last().click();
          await page.locator('.f4-fraction-input-field').nth(1).click();
          await page.locator(`button:has-text("9")`).last().click();
        } else {
          for (let i = 0; i < 4; i++) {
            await page.locator(`button:has-text("9")`).last().click();
            await page.waitForTimeout(50);
          }
        }
      }
      await page.waitForTimeout(300);
      await page.getByTestId('submit-numpad').click();
    }
  }
}

const metadata = getPhaseMetadata(4);

test.describe('08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(240000);
    currentQuestionId = null;
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 4);
    clearTestUserProgress(testUserEmail);

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase4/modulo/') &&
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
        unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 4, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/welcome-fase4');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f4-module-card-item');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const lvlBtn = page.locator('.f4-level-card-item').nth(nivel.nivel_id - 1);
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click();

        await navigateGenericTheoryModal(page, FASE4_THEORY_ANSWERS, 'f4');

        const splash = page.locator('.f4-start-splash-overlay').first();
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
            const submitBtn = page.locator('button:has-text("CONFIRMAR"), [data-testid="submit-numpad"]').first();
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
        unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
        for (const n of modulo.niveles) {
           approveProgresoMaestria(testUserEmail, 4, n.seccion, 'MIXTA');
        }
        for (const d of modulo.desafios) {
           if (d.nivel_id < desafio.nivel_id) {
              approveProgresoMaestria(testUserEmail, 4, d.seccion, 'MIXTA');
           }
        }

        await page.goto('/welcome-fase4');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f4-module-card-item');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
        const desafioBtn = page.locator('.f4-challenge-bar-btn, .f4-challenge-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
        
        if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
            await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
            await desafioBtn.click();

            const splash = page.locator('.f4-start-splash-overlay').first();
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
              
              const earlyExitModal = page.locator('.f4-feedback-card.early-exit, .early-exit-modal');
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
