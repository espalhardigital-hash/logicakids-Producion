import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { ensureAuthenticated } from '../helpers/auth';
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

function clearTestUserProgress() {
  try {
    const queries = [
      `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id = (SELECT id FROM alumnos WHERE nombre = 'usuario_prueba'));`,
      `DELETE FROM intento_preguntas WHERE alumno_id = (SELECT id FROM alumnos WHERE nombre = 'usuario_prueba');`,
      `DELETE FROM intentos WHERE alumno_id = (SELECT id FROM alumnos WHERE nombre = 'usuario_prueba');`,
      `DELETE FROM progreso_maestria WHERE alumno_id = (SELECT id FROM alumnos WHERE nombre = 'usuario_prueba');`
    ];
    for (const q of queries) {
      execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${q}"`);
    }
    console.log('🧹 Test user database progress successfully cleared.');
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
    console.log(`Submitting correct alternative: "${correctText}" for question ID: ${questionId}`);
    await page.locator(`button:has-text("${correctText}")`).first().click();
  } else {
    const answer = getCorrectAnswer(questionId);
    console.log(`Submitting correct answer: "${answer}" for question ID: ${questionId}`);
    
    const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
    if (await confirmBtn.isVisible()) {
      if (answer.includes('/')) {
        const [num] = answer.split('/');
        const numerator = parseInt(num, 10);
        for (let i = 0; i < numerator; i++) {
          await page.locator('path[stroke="rgba(255,255,255,0.15)"]').nth(i).click({ force: true });
          await page.waitForTimeout(50);
        }
      }
      await confirmBtn.click();
    } else {
      if (answer.includes('/')) {
        const [num, den] = answer.split('/');
        
        // Type numerator
        for (const char of num) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
        
        // Click denominator input box
        await page.locator('input[placeholder="?"]').last().click();
        await page.waitForTimeout(100);
        
        // Type denominator
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
    console.log(`Submitting incorrect alternative: "${wrongText}" for question ID: ${questionId}`);
    await page.locator(`button:has-text("${wrongText}")`).first().click();
  } else {
    console.log(`Submitting incorrect answer: "9999" for question ID: ${questionId}`);
    const answer = getCorrectAnswer(questionId);
    
    const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
    if (await confirmBtn.isVisible()) {
      await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
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

  // After submitting wrong answer, we must click 'Siguiente Pregunta'
  await page.waitForTimeout(500);
  const nextBtn = page.locator('button', { hasText: /Siguiente Pregunta/i }).first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
  }
}

test.describe('08 - Gameplay Fase 4 (Fracciones y Porcentajes)', () => {
  let currentQuestionId: number | null = null;

  test.beforeAll(() => {
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE alumnos SET fase_actual_id = 4 WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}');"`
      );
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'ADMIN' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
      );
      console.log('✅ Test user successfully set to Phase 4 and role ADMIN in the database.');
    } catch (e) {
      console.error('❌ Failed to set test user state:', e);
    }
  });

  test.afterAll(() => {
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
      );
      console.log('✅ Test user role restored to USER in the database.');
    } catch (e) {
      console.error('❌ Failed to restore test user role:', e);
    }
  });

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    clearTestUserProgress();

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase4/modulo/') &&
        response.url().includes('/pregunta')
      ) {
        try {
          const json = await response.json();
          if (json && json.id) {
            currentQuestionId = json.id;
            console.log(`Captured Loaded Question ID: ${currentQuestionId}`);
          }
        } catch (e) {}
      }
    });

    await ensureAuthenticated(page);
  });

  test('Módulo 1 Práctica - Flujo Completo: Teoría, Acierto y Bucle Espejo', async ({ page }) => {
    await page.route('**/api/fase4/lectura/**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.interactivos = [];
      await route.fulfill({ json });
    });

    // 1. Navigate to Phase 4 Welcome
    await page.goto('/welcome-fase4');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Click Módulo 1 (Concepto de Fracción)
    const modCard = page.locator('.f4-module-card-item').first();
    await expect(modCard).toBeVisible();
    await modCard.click();

    // 3. Click Level 1
    const lvl1Btn = page.locator('.f4-level-card-item').first();
    await expect(lvl1Btn).toBeVisible();
    await lvl1Btn.click();

    // 4. Handle Theory Modal
    const theoryModal = page.locator('.f4-reading-overlay');
    await page.waitForTimeout(1500);
    if (await theoryModal.isVisible()) {
      console.log('Theory Modal detected. Navigating steps...');
      while (await page.locator('button:has-text("Siguiente")').isVisible()) {
        await page.locator('button:has-text("Siguiente")').first().click();
        await page.waitForTimeout(300);
      }
      const startBtn = page.locator('button:has-text("¡Entendido, empezar!")').first();
      await expect(startBtn).toBeVisible();
      await startBtn.click();
    }

    // 5. Dismiss Splash Screen
    const splash = page.locator('.f4-start-splash-overlay').first();
    await page.waitForTimeout(1500);
    if (await splash.isVisible()) {
      console.log('Splash Screen detected. Clicking to skip...');
      await splash.click();
    }

    // 6. Test Correct Answer
    for (let i = 0; i < 50; i++) {
      if (currentQuestionId !== null) break;
      await page.waitForTimeout(100);
    }
    expect(currentQuestionId).not.toBeNull();
    const firstQuestionId = currentQuestionId!;

    await submitCorrectAnswer(page, firstQuestionId);
    await page.waitForTimeout(1000);

    // Click continue if correct answer confirmation doesn't auto-advance
    const continueBtn = page.locator('button:has-text("Siguiente Pregunta →")').first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Wait for next question
    for (let i = 0; i < 50; i++) {
      if (currentQuestionId !== null && currentQuestionId !== firstQuestionId) break;
      await page.waitForTimeout(100);
    }
    expect(currentQuestionId).not.toBe(firstQuestionId);

    // 7. Test Fail to trigger mirror question
    expect(currentQuestionId).not.toBeNull();
    const secondQuestionId = currentQuestionId!;

    await failCurrentQuestion(page, secondQuestionId);
    await page.waitForTimeout(1000);

    // Click continue on incorrect feedback
    const continueBtnWrong = page.locator('button:has-text("Continuar →")').first();
    await expect(continueBtnWrong).toBeVisible({ timeout: 5000 });
    await continueBtnWrong.click();

    // 8. Solve Mirror Question
    console.log('Waiting for mirror question loop...');
    await page.waitForTimeout(1500);
    expect(currentQuestionId).not.toBeNull();
    await submitCorrectAnswer(page, currentQuestionId!);
    console.log('Mirror question solved successfully.');
  });
});
