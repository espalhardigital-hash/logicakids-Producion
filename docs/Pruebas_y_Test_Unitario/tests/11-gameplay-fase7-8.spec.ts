import { test, expect } from '../helpers/test-fixtures';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser } from '../helpers/db-utils';
import { findCorrectAnswerMetadata, navigateGenericTheoryModal, submitNumericKeypad, escapeRegExp } from '../helpers/gameplay-utils';

test.describe('11 - Gameplay Fase 7 y 8 (Coordenadas, Rutas, Tiempo, Lógica, Combinatoria y Probabilidad)', () => {
  
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    // 1. Crear un usuario nuevo para aislamiento estricto
    testUserEmail = await registerDynamicTestUser(page);
    
    // 2. Inyectar progreso en DB para simular que avanzó hasta la Fase 8 naturalmente
    setPhaseForUser(testUserEmail, 8);
  });

  test('Fase 7 - Módulo 1 Nivel 1: Flujo Completo y Respuestas', async ({ page }) => {
    // 1. Navigate to Map page and click Phase 7
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      window.localStorage.removeItem('lk_fase_progress_7');
      window.localStorage.removeItem('lk_fase_progress_8');
    });
    await page.waitForTimeout(1000);

    const card = page.locator('div.group', { hasText: 'Fase 7' }).first();
    await card.locator('button').first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Select Module 1 (Orientación Cardinal)
    const modCard = page.locator('.fg-module-card.unlocked').first();
    await expect(modCard).toBeVisible();
    await modCard.click();

    // 3. Start Level 1
    const lvlCard = page.locator('.fg-level-card.unlocked').first();
    await expect(lvlCard).toBeVisible();
    await lvlCard.click();

    // 4. Handle Theory Modal
    await navigateGenericTheoryModal(page, {
      'cohete avanza 2 casillas': '3',
      'Gira 90° a la izquierda': 'Norte',
      '4, 10, 16, 22': '28',
      '50, 45, 40, 35': '30'
    });

    // 5. Answer Level questions
    // There are 2 questions in Fase 7 Modulo 1 Level 1
    for (let qIdx = 0; qIdx < 5; qIdx++) {
      await page.waitForTimeout(500);
      if (await page.locator('text=¡Desafío Terminado!').isVisible()) {
        console.log('🏁 Desafío Terminado detectado al inicio del bucle.');
        break;
      }
      const questionTextEl = page.locator('.fg-question-text').first();
      if (!await questionTextEl.isVisible()) {
        if (await page.locator('text=¡Desafío Terminado!').isVisible()) {
          console.log('🏁 Desafío Terminado detectado tras verificar visibilidad del enunciado.');
          break;
        }
      }
      await expect(questionTextEl).toBeVisible();
      const questionText = await questionTextEl.innerHTML();
      console.log(`❓ Pregunta [${qIdx + 1}]: "${questionText.trim()}"`);

      const answer = findCorrectAnswerMetadata(7, 1, 1, questionText);
      console.log(`💡 Respuesta calculada: "${answer}"`);
      expect(answer).not.toBe('');

      // Check question type
      const isMultipleChoice = await page.locator('.fg-options-grid').count() > 0;
      console.log(`🔧 Tipo: ${isMultipleChoice ? 'OPCIÓN MÚLTIPLE' : 'NUMÉRICA'}`);

      if (isMultipleChoice) {
        // Select correct option
        const optionBtn = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
        await optionBtn.click();
        await page.waitForTimeout(200); // Dar tiempo a que React actualice el estado selectedOption
        
        // Confirm
        const confirmBtn = page.locator('.fg-mc-confirm-btn');
        await confirmBtn.click();
      } else {
        // Submit using arrow button
        await submitNumericKeypad(page, answer);
      }
      await page.waitForTimeout(1500); // Wait for auto-advance or fade

      // Log UI feedback
      const feedbackText = await page.locator('.fg-ambient-glow').count() > 0;
      console.log(`📢 UI Feedback visible: ${feedbackText}`);
    }

    // 6. Verification: Back to Welcome phase and level marked as Dominado
    await page.waitForSelector('text=¡Desafío Terminado!');
    const menuBtn = page.locator('button:has-text("Volver al Menú")');
    await menuBtn.click();

    // Verify localStorage progress has been saved
    const { progress, allKeys } = await page.evaluate(() => {
      let dump = 'ALL LOCAL STORAGE:\\n';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        dump += key + ' = ' + localStorage.getItem(key!) + '\\n';
      }
      return { progress: localStorage.getItem('lk_fase_progress_7'), allKeys: dump };
    });
    console.log(allKeys);
    expect(progress).toContain('"1_1":true');
  });

  test('Fase 8 - Módulo 1 Nivel 1: Flujo Completo y Respuestas', async ({ page }) => {
    // 1. Navigate to Map page and click Phase 8
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      window.localStorage.removeItem('lk_fase_progress_7');
      window.localStorage.removeItem('lk_fase_progress_8');
    });
    await page.waitForTimeout(1000);

    const card = page.locator('div.group', { hasText: 'Fase 8' }).first();
    await card.locator('button').first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 2. Select Module 1 (Secuencias Lógicas)
    const modCard = page.locator('.fg-module-card.unlocked').first();
    await expect(modCard).toBeVisible();
    await modCard.click();

    // 3. Start Level 1
    const lvlCard = page.locator('.fg-level-card.unlocked').first();
    await expect(lvlCard).toBeVisible();
    await lvlCard.click();

    // 4. Handle Theory Modal
    await navigateGenericTheoryModal(page, {
      '4, 10, 16, 22': '28',
      '50, 45, 40, 35': '30'
    });

    // 5. Answer Level questions
    for (let qIdx = 0; qIdx < 5; qIdx++) {
      await page.waitForTimeout(500);
      if (await page.locator('text=¡Desafío Terminado!').isVisible()) {
        break;
      }
      const questionTextEl = page.locator('.fg-question-text').first();
      if (!await questionTextEl.isVisible()) {
        if (await page.locator('text=¡Desafío Terminado!').isVisible()) {
          break;
        }
      }
      await expect(questionTextEl).toBeVisible();
      const questionText = await questionTextEl.innerHTML();

      const answer = findCorrectAnswerMetadata(8, 1, 1, questionText);
      expect(answer).not.toBe('');

      // Check question type
      const isMultipleChoice = await page.locator('.fg-options-grid').count() > 0;

      if (isMultipleChoice) {
        const optionBtn = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
        await optionBtn.click();
        await page.waitForTimeout(200); // Dar tiempo a que React actualice el estado
        const confirmBtn = page.locator('.fg-mc-confirm-btn');
        await confirmBtn.click();
      } else {
        await submitNumericKeypad(page, answer);
      }
      await page.waitForTimeout(1500);
    }

    // 6. Verification
    await page.waitForSelector('text=¡Desafío Terminado!');
    const menuBtn = page.locator('button:has-text("Volver al Menú")');
    await menuBtn.click();

    const progress = await page.evaluate(() => {
      return localStorage.getItem('lk_fase_progress_8');
    });
    expect(progress).toContain('"1_1":true');
  });
});
