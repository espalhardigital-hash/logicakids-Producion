import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

const FASE6_THEORY_ANSWERS: Record<string, string> = {
  '¿Cuántas caras tiene un cubo regular?': '6',
  '¿Cuántos vértices tiene un cubo?': '8',
  '¿Cuántas aristas tiene un cubo?': '12',
  'Si ves un bloque a una altura de 3 niveles, ¿cuántos bloques hay en su columna completa?': '3',
  'En una estructura en forma de cruz, el bloque central': '1',
  'Si cuento 5 bloques en total pero solo veo 4, ¿cuántos están ocultos?': '1',
  '¿Cuántos cuadrados debe tener un molde para formar un cubo cerrado?': '6',
  'Si un molde tiene 5 caras, ¿formará un cubo cerrado?': '2',
  'Un molde de cilindro tiene 2 círculos y un': 'rectángulo',
  'Si el patrón es 1, 3, 5, 7. ¿Cuántos bloques en la etapa 5?': '9',
  'Si en etapa 1 hay 2 bloques... ¿Regla?': 'suma 2',
  'Patrón: 2, 5, 8. Siguiente número:': '11',
  'Piso inferior 9, piso medio 4, piso superior 1. Total:': '14',
  'Edificio de 3 pisos, 4 bloques por piso. Total:': '12',
  'Capa 1: 5 bloques, Capa 2: 3 bloques. Total:': '8',
  'Regla: Nx3. ¿Etapa 4?': '12',
  'Regla: NxN. ¿Etapa 5?': '25',
  'Regla: N+4. ¿Etapa 10?': '14',
  'Si apilo 4 cubos en el suelo... Volumen total:': '8',
  'Una línea de 5 cubos, repetida 2 veces. Volumen:': '10',
  'Tres columnas de 3 cubos. Volumen:': '9',
  'Caja de largo 5, ancho 2, alto 2. Volumen:': '20',
  'Cubo de lado 3. Volumen:': '27',
  'Habitación 4x4x3. Volumen:': '48',
  'Un recipiente tiene 10 dm³. ¿Cuántos Litros de agua contiene?': '10',
  'Una botella tiene 500 cm³. ¿Cuántos mL tiene?': '500',
  'Un tanque de 1 m³. ¿Cuántos Litros?': '1000',
  '¿Cuántos gramos hay en 3 kg?': '3000',
  'Medio kilo (0,5 kg) son cuántos gramos:': '500',
  'Si un termómetro sube de 10° a 25°, aumentó:': '15',
  'Temperatura inicial 2°. Baja 5°. ¿Nueva temperatura?': '-3',
  'Temperatura inicial -4°. Sube 10°. ¿Nueva temperatura?': '6',
  'Estaba a 10°, ahora está a -5°. ¿Cuánto bajó?': '15',
  '0°C en Kelvin es:': '273',
  '100°C en Kelvin es:': '373',
  'Si tengo 300 K, ¿cuántos grados Celsius son?': '27'
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
    
    const hiddenInput = page.locator('.f6-hidden-input');
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
    const hiddenInput = page.locator('.f6-hidden-input');
    if (await hiddenInput.count() > 0) {
      await hiddenInput.fill('9999');
      await hiddenInput.press('Enter');
    } else {
      for (let i = 0; i < 4; i++) {
        await page.locator(`button:has-text("9")`).last().click();
        await page.waitForTimeout(50);
      }
      await page.locator('button.bg-\\[\\#2563eb\\], button:has(svg)').last().click();
    }
  }
}

const metadata = getPhaseMetadata(6);

test.describe('10 - Gameplay Fase 6 (Geometría Espacial) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 6);
    clearTestUserProgress(testUserEmail);

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase6/modulo/') &&
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
        unlockAllUpToModule(testUserEmail, 6, modulo.modulo_id);
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 6, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/welcome-fase6');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f6-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const lvlBtn = page.locator('.f6-level-card').nth(nivel.nivel_id - 1);
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click();

        const theoryModal = page.locator('.f6-reading-overlay');
        await page.waitForTimeout(1500);
        if (await theoryModal.isVisible()) {
          await navigateGenericTheoryModal(page, FASE6_THEORY_ANSWERS, 'f6');
        }

        const splash = page.locator('.f6-start-splash-overlay').first();
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
        unlockAllUpToModule(testUserEmail, 6, modulo.modulo_id);
        for (const n of modulo.niveles) {
           approveProgresoMaestria(testUserEmail, 6, n.seccion, 'MIXTA');
        }
        for (const d of modulo.desafios) {
           if (d.nivel_id < desafio.nivel_id) {
              approveProgresoMaestria(testUserEmail, 6, d.seccion, 'MIXTA');
           }
        }

        await page.goto('/welcome-fase6');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f6-module-card');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
        const desafioBtn = page.locator('.f6-challenge-bar-btn, .f6-challenge-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
        
        if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
            await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
            await desafioBtn.click();

            const splash = page.locator('.f6-start-splash-overlay').first();
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
              
              const earlyExitModal = page.locator('.f6-feedback-card.early-exit, .early-exit-modal');
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
