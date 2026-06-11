import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser } from '../helpers/db-utils';
import { execSync } from 'child_process';

/**
 * Helper to query the local database for correct answers.
 */
function getCorrectAnswer(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying answer for question ${questionId}:`, e);
    return '';
  }
}

/**
 * Helper to query the local database for Chained Steps answers (Module 4).
 */
function getChainedStepAnswer(questionId: number, stepNumber: number): string {
  try {
    const query = `SELECT datos_numericos->'pasos'->${stepNumber - 1}->>'respuesta_correcta' FROM preguntas WHERE id = ${questionId}`;
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "${query}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying chained step ${stepNumber} for question ${questionId}:`, e);
    return '';
  }
}

/**
 * Clean up all attempts and progress for the test user to avoid state leakage.
 */
function clearTestUserProgress() {
  try {
    const email = process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com';
    const queries = [
      `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
      `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
      `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
      `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
    ];
    for (const q of queries) {
      execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${q}"`);
    }
    console.log(`🧹 Test user database progress successfully cleared for ${email}.`);
  } catch (e) {
    console.error('❌ Failed to clear test user database progress:', e);
  }
}

/**
 * Dynamically answers a question correctly based on database queries.
 */
async function submitCorrectAnswer(page: any, questionId: number) {
  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();

  if (tipo === 'MULTIPLE_OPCION') {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
    const correctText = execSync(cmd).toString().trim();
    console.log(`Submitting correct alternative: "${correctText}" for question ID: ${questionId}`);
    await page.locator('.f2-mc-option-btn').filter({ hasText: new RegExp(`^${correctText.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`) }).first().click();
  } else {
    const answer = getCorrectAnswer(questionId);
    console.log(`Submitting correct answer: "${answer}" for question ID: ${questionId}`);
    await page.locator('.f2-hidden-input').fill(answer);
  }

  await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();
}

/**
 * Dynamically answers a question incorrectly based on database queries.
 */
async function failCurrentQuestion(page: any, questionId: number) {
  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();

  if (tipo === 'MULTIPLE_OPCION') {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
    const wrongText = execSync(cmd).toString().trim();
    console.log(`Submitting incorrect alternative: "${wrongText}" for question ID: ${questionId}`);
    await page.locator('.f2-mc-option-btn').filter({ hasText: new RegExp(`^${wrongText.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`) }).first().click();
  } else {
    console.log(`Submitting incorrect answer: "9999" for question ID: ${questionId}`);
    await page.locator('.f2-hidden-input').fill('9999');
  }

  await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();
}

test.describe('06 - Gameplay Fase 2 (Desarrollo Numérico)', () => {
  let currentQuestionId: number | null = null;

  test.beforeAll(() => {
    // Force set the test user '${process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com'}' to Phase 2 (fase_actual_id = 2) and role = ADMIN
    // so that all module cards and challenges are unlocked and clickable in the frontend.
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE alumnos SET fase_actual_id = 2 WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com'}');"`
      );
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'ADMIN' WHERE email = '${process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com'}';"`
      );
      console.log('✅ Test user successfully set to Phase 2 and role ADMIN in the database.');
    } catch (e) {
      console.error('❌ Failed to set test user state:', e);
    }
  });

  test.afterAll(() => {
    // Restore test user '${process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com'}' role to USER
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com'}';"`
      );
      console.log('✅ Test user role restored to USER in the database.');
    } catch (e) {
      console.error('❌ Failed to restore test user role:', e);
    }
  });

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    clearTestUserProgress();

    // Listen to network responses to capture the question ID of loaded questions
    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase2/modulo/') &&
        response.url().includes('/pregunta')
      ) {
        try {
          const json = await response.json();
          if (json && json.id) {
            currentQuestionId = json.id;
            console.log(`Captured Loaded Question ID: ${currentQuestionId}`);
          }
        } catch (e) {
          // Ignore parsing errors for non-JSON responses
        }
      }
    });

  });

  test('Módulo 1 Práctica (Gimnasio Mental) - Flujo Completo: Teoría, Acierto y Bucle Espejo', async ({ page }) => {
    // Intercept reading data to remove interactives for quick and reliable theory modal traversal
    await page.route('**/api/fase2/lectura/**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.interactivos = [];
      await route.fulfill({ json });
    });

    // 1. Navigate to Phase 2 Welcome Hub
    await page.goto('/welcome-fase2');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Click Módulo 1 (Gimnasio Mental)
    const modCard = page.locator('.f2-module-card').first();
    await expect(modCard).toBeVisible();
    await modCard.click();

    // 3. Click Level 1 to enter
    const lvl1Btn = page.locator('.f2-level-card').first();
    await expect(lvl1Btn).toBeVisible();
    await lvl1Btn.click();

    // 4. Handle Theory Modal if shown
    const theoryModal = page.locator('.f2-reading-overlay');
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
      await theoryModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    // 5. Dismiss Splash Screen
    const splash = page.locator('.f2-start-splash-overlay').first();
    await page.waitForTimeout(1500);
    if (await splash.isVisible()) {
      console.log('Splash Screen detected. Clicking to skip...');
      await splash.click();
    }

    // 6. Test Correct Answer (Acierto)
    // Wait for the first question to load (currentQuestionId becomes non-null)
    for (let i = 0; i < 50; i++) {
      if (currentQuestionId !== null) break;
      await page.waitForTimeout(100);
    }
    expect(currentQuestionId).not.toBeNull();
    const firstQuestionId = currentQuestionId!;
    
    const typeCmd1 = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${firstQuestionId}"`;
    const tipo1 = execSync(typeCmd1).toString().trim();

    await submitCorrectAnswer(page, firstQuestionId);

    // Verify correct answer feedback UI
    if (tipo1 === 'MULTIPLE_OPCION') {
      await expect(page.locator('.f2-mc-option-btn.selected').first()).toBeVisible();
    } else {
      await expect(page.locator('.f2-custom-input-box.correct')).toBeVisible();
    }
    
    // In practice libre, correct answers automatically advance after 500ms.
    // So we wait for the next question to load and update currentQuestionId.
    for (let i = 0; i < 50; i++) {
      if (currentQuestionId !== null && currentQuestionId !== firstQuestionId) break;
      await page.waitForTimeout(100);
    }
    expect(currentQuestionId).not.toBe(firstQuestionId);

    // 7. Test Incorrect Answer (Fallo) to trigger Bucle Espejo
    expect(currentQuestionId).not.toBeNull();
    const secondQuestionId = currentQuestionId!;
    
    const typeCmd2 = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${secondQuestionId}"`;
    const tipo2 = execSync(typeCmd2).toString().trim();

    await failCurrentQuestion(page, secondQuestionId);

    // Verify incorrect answer feedback UI
    if (tipo2 === 'MULTIPLE_OPCION') {
      await expect(page.locator('.f2-mc-option-btn.selected').first()).toBeVisible();
    } else {
      await expect(page.locator('.f2-custom-input-box.incorrect')).toBeVisible();
    }
    await page.waitForTimeout(1000);

    // Click continue on wrong answer to trigger Mirror Modal
    const continueBtnWrong = page.locator('.f2-submit-btn:has-text("Continuar")').first();
    await expect(continueBtnWrong).toBeVisible({ timeout: 5000 });
    await continueBtnWrong.click();

    // 8. Verify Bucle Espejo (Mirror Modal) displays
    console.log('Waiting for Mirror Modal to appear...');
    const mirrorModal = page.locator('.f2-mirror-modal-card');
    await expect(mirrorModal).toBeVisible({ timeout: 10000 });

    // Solve Mirror Question Correctly
    // Extraer el texto de la pregunta espejo de la UI para buscar la respuesta exacta
    const mirrorQuestionTextRaw = await mirrorModal.locator('h2, h3, .text-xl, .text-2xl').first().innerText();
    const mirrorQuestionTextClean = mirrorQuestionTextRaw.trim().replace(/'/g, "''"); // escape single quotes for SQL

    console.log(`Mirror Question visible: "${mirrorQuestionTextRaw}"`);
    
    const mirrorAnsCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE enunciado ILIKE '%${mirrorQuestionTextClean}%' LIMIT 1"`;
    let mirrorAnswer = "1"; // fallback
    try {
        const dbResult = execSync(mirrorAnsCmd).toString().trim();
        if (dbResult) mirrorAnswer = dbResult;
    } catch (e) {
        console.error('Error fetching mirror answer', e);
        mirrorAnswer = "48";
    }
    
    console.log(`Submitting correct answer: "${mirrorAnswer}" for Mirror Question: ${mirrorQuestionTextClean}`);

    const mirrorInput = mirrorModal.locator('.f2-hidden-input');
    await mirrorInput.fill(mirrorAnswer);
    await mirrorModal.locator('button:has-text("Confirmar")').first().click();

    // Mirror Modal should auto-close upon correct answer after 1.5s
    await expect(mirrorModal).not.toBeVisible({ timeout: 5000 });
    console.log('Mirror Modal successfully solved and closed.');
  });

  test('Módulo 4 Práctica (Constructor de Soluciones) - Flujo de Pregunta Chained (Multi-Paso)', async ({ page }) => {
    // Intercept reading data to remove interactives for quick and reliable theory modal traversal
    await page.route('**/api/fase2/lectura/**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.interactivos = [];
      await route.fulfill({ json });
    });

    // 1. Navigate to Phase 2 Welcome Hub
    await page.goto('/welcome-fase2');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Click Módulo 4 (Constructor de Soluciones)
    const modCards = page.locator('.f2-module-card');
    const mod4Card = modCards.nth(3); // 4th card (index 3)
    await expect(mod4Card).toBeVisible();
    await mod4Card.click();

    // 3. Click Level 1 to enter
    const lvl1Btn = page.locator('.f2-level-card').first();
    await expect(lvl1Btn).toBeVisible();
    await lvl1Btn.click();

    // 4. Handle Theory Modal if shown
    const theoryModal = page.locator('.f2-reading-overlay');
    await page.waitForTimeout(1500);
    if (await theoryModal.isVisible()) {
      while (await page.locator('button:has-text("Siguiente")').isVisible()) {
        await page.locator('button:has-text("Siguiente")').first().click();
        await page.waitForTimeout(300);
      }
      await page.locator('button:has-text("¡Entendido, empezar!")').first().click();
      await theoryModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    // 5. Dismiss Splash Screen
    const splash = page.locator('.f2-start-splash-overlay').first();
    await page.waitForTimeout(1500);
    if (await splash.isVisible()) {
      await splash.click();
    }

    // Wait for the first question to load (currentQuestionId becomes non-null)
    for (let i = 0; i < 50; i++) {
      if (currentQuestionId !== null) break;
      await page.waitForTimeout(100);
    }
    expect(currentQuestionId).not.toBeNull();

    // Verify Chained step UI is active for step 1
    await expect(page.locator('text=Paso 1:')).toBeVisible();

    const step1Answer = getChainedStepAnswer(currentQuestionId!, 1);
    console.log(`Submitting Step 1 answer: "${step1Answer}" for question ID: ${currentQuestionId}`);

    await page.locator('.f2-hidden-input').fill(step1Answer);
    await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();

    // Click continue on step 1 feedback
    const continueBtn1 = page.locator('.f2-submit-btn:has-text("Continuar")').first();
    await expect(continueBtn1).toBeVisible({ timeout: 5000 });
    await continueBtn1.click();

    // 7. Chained Question Step 2
    await page.waitForTimeout(1500);
    // Verify Step 2 is now visible and active
    await expect(page.locator('text=Paso 2:')).toBeVisible();

    const step2Answer = getChainedStepAnswer(currentQuestionId!, 2);
    console.log(`Submitting Step 2 answer: "${step2Answer}" for question ID: ${currentQuestionId}`);

    await page.locator('.f2-hidden-input').fill(step2Answer);
    await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();

    // Verify correct answer feedback UI displays green highlight for final step
    await expect(page.locator('.f2-custom-input-box.correct').first()).toBeVisible();
    console.log('Chained step 2 submitted successfully.');
  });

  test('Módulo 1 Desafío (Gimnasio Mental) - Salida Temprana (Early Exit) tras múltiples fallos', async ({ page }) => {
    // 1. Navigate to Phase 2 Welcome Hub
    await page.goto('/welcome-fase2');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Click Módulo 1 (Gimnasio Mental)
    const modCard = page.locator('.f2-module-card').first();
    await expect(modCard).toBeVisible();
    await modCard.click();

    // 3. Click Desafío 1 (Estándar) in the challenge zone
    const desafio1Btn = page.locator('.f2-challenge-bar-btn').first();
    await expect(desafio1Btn).toBeVisible();
    await expect(desafio1Btn).toBeEnabled({ timeout: 10000 });
    await desafio1Btn.click();

    // 4. Dismiss Splash Screen (Challenges always show the premium countdown splash)
    const splash = page.locator('.f2-start-splash-overlay').first();
    await expect(splash).toBeVisible({ timeout: 10000 });
    await splash.click();

    // 5. Verify timer is present in challenges
    const timerBadge = page.locator('.f2-badge-timer');
    await expect(timerBadge).toBeVisible({ timeout: 10000 });

    // Wait for the first question to load (currentQuestionId becomes non-null)
    for (let i = 0; i < 50; i++) {
      if (currentQuestionId !== null) break;
      await page.waitForTimeout(100);
    }
    expect(currentQuestionId).not.toBeNull();

    // 6. Fail multiple times to exceed tolerance (max_errores is dynamic, we submit wrong answers until Early Exit modal shows)
    let isEarlyExitVisible = false;
    const earlyExitModal = page.locator('.f2-feedback-card.early-exit');
    
    // We try up to 5 times (desafio 1 max errors is typically 3)
    for (let attempts = 0; attempts < 5; attempts++) {
      expect(currentQuestionId).not.toBeNull();
      const oldQuestionId = currentQuestionId;
      console.log(`Submitting incorrect answer to trigger Early Exit (Attempt ${attempts + 1}, Question ID: ${currentQuestionId})`);
      
      await failCurrentQuestion(page, currentQuestionId!);

      // Dynamically wait for the browser to auto-advance to the next question.
      // If it auto-advances, currentQuestionId changes.
      // If it does not auto-advance after 2.4 seconds, it means early_exit is true and we must click Continuar.
      let nextQuestionLoaded = false;
      for (let waitStep = 0; waitStep < 12; waitStep++) {
        await page.waitForTimeout(200);
        if (currentQuestionId !== oldQuestionId) {
          nextQuestionLoaded = true;
          break;
        }
      }

      if (!nextQuestionLoaded) {
        console.log('Detected Early Exit feedback card. Clicking "Continuar" manually...');
        const continueBtn = page.locator('.f2-submit-btn:has-text("Continuar")').first();
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
        }
        
        // Wait for the Early Exit modal to become visible
        await expect(earlyExitModal).toBeVisible({ timeout: 5000 });
        isEarlyExitVisible = true;
        console.log('Early Exit Modal successfully triggered!');
        
        // Click return button on Early Exit modal to exit challenge
        const exitBtn = earlyExitModal.locator('button:has-text("Entendido")').first();
        await expect(exitBtn).toBeVisible();
        await exitBtn.click();
        break;
      }
    }

    expect(isEarlyExitVisible).toBe(true);
    // Verify we are redirected back to the Welcome Hub dashboard (no longer in gameplay screen)
    await expect(page.locator('.f2-modules-grid')).toBeVisible();
  });
});
