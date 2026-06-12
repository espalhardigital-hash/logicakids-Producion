import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

const FASE4_THEORY_ANSWERS: Record<string, string> = {
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
  } else {
    const answer = getCorrectAnswer(questionId);
    
    const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
    if (await confirmBtn.isVisible()) {
      if (answer.includes('/')) {
        const [num] = answer.split('/');
        const numerator = parseInt(num, 10);
        for (let i = 0; i < numerator; i++) {
          await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
          await page.waitForTimeout(50);
        }
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
        
        await page.locator('input[placeholder="?"]').last().click();
        await page.waitForTimeout(100);
        
        for (const char of den) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
      } else {
        for (const char of answer) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
      }
      await page.getByTestId('submit-numpad').click();
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
  } else {
    const answer = getCorrectAnswer(questionId);
    
    const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
    if (await confirmBtn.isVisible()) {
      await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
      await page.waitForTimeout(300);
      await confirmBtn.click();
    } else {
      if (answer.includes('/')) {
        await page.locator(`button:has-text("9")`).last().click();
        await page.locator('input[placeholder="?"]').last().click();
        await page.locator(`button:has-text("9")`).last().click();
      } else {
        for (let i = 0; i < 4; i++) {
          await page.locator(`button:has-text("9")`).last().click();
          await page.waitForTimeout(50);
        }
      }
      await page.getByTestId('submit-numpad').click();
    }
  }
}

const metadata = getPhaseMetadata(4);

test.describe('08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
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

        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(1000);
          
          const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
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
