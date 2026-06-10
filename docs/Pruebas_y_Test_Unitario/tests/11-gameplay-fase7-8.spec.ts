import { test, expect } from '../helpers/test-fixtures';
import { ensureAuthenticated } from '../helpers/auth';
import { execSync } from 'child_process';
import { getFaseMetadata } from '../../../LogicaMath/frontend/components/fase_generic/faseMetadata';

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

function findCorrectAnswer(faseId: number, moduloId: number, nivelId: number, currentQuestionText: string): string {
  const metadata = getFaseMetadata(faseId);
  if (!metadata) return '';

  const cleanCurrent = cleanText(currentQuestionText);

  if (moduloId === 99) {
    // Mastery Challenge: search all questions in all modules
    const allQuestions = metadata.modulos.flatMap(m => m.niveles.flatMap(n => n.preguntas));
    for (const q of allQuestions) {
      if (cleanText(q.enunciado) === cleanCurrent) {
        return q.respuesta_correcta;
      }
    }
    return '';
  }

  const modulo = metadata.modulos.find(m => m.moduloId === moduloId);
  if (!modulo) return '';
  const nivel = modulo.niveles.find(n => n.nivelId === nivelId);
  if (!nivel) return '';

  for (const q of nivel.preguntas) {
    if (cleanText(q.enunciado) === cleanCurrent) {
      return q.respuesta_correcta;
    }
  }

  return '';
}

test.describe('11 - Gameplay Fase 7 y 8 (Coordenadas, Rutas, Tiempo, Lógica, Combinatoria y Probabilidad)', () => {
  test.beforeAll(() => {
    try {
      // Set user role to ADMIN and fase_actual_id to 8 in the DB to bypass locks
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'ADMIN' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}'; UPDATE alumnos SET fase_actual_id = 8 WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}');"`
      );
      console.log('✅ Test user successfully set to role ADMIN in the database.');
    } catch (e) {
      console.error('❌ Failed to set test user state:', e);
    }
  });

  test.afterAll(() => {
    try {
      // Restore user role to USER
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
      );
      console.log('✅ Test user role restored to USER in the database.');
    } catch (e) {
      console.error('❌ Failed to restore test user role:', e);
    }
  });

  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    // Clear localStorage progress for both phases
    await page.addInitScript(() => {
      window.localStorage.removeItem('lk_fase_progress_7');
      window.localStorage.removeItem('lk_fase_progress_8');
    });
  });

  test('Fase 7 - Módulo 1 Nivel 1: Flujo Completo y Respuestas', async ({ page }) => {
    // 1. Navigate to Map page and click Phase 7
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
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
    const theoryOverlay = page.locator('.fg-reading-overlay');
    await expect(theoryOverlay).toBeVisible();
    
    while (true) {
      const interactiveBoxes = page.locator('.fg-interactive-box');
      const count = await interactiveBoxes.count();
      for (let i = 0; i < count; i++) {
        const box = interactiveBoxes.nth(i);
        const isLocked = await box.locator('text=🔒').isVisible();
        if (isLocked) continue;
        const isCorrect = (await box.getAttribute('class'))?.includes('correct');
        if (isCorrect) continue;
        const qTextEl = box.locator('.fg-int-q');
        const qText = await qTextEl.innerText();
        let answer = '';
        if (qText.includes('cohete avanza 2 casillas')) {
          answer = '3';
        } else if (qText.includes('Gira 90° a la izquierda')) {
          answer = 'Norte';
        } else if (qText.includes('4, 10, 16, 22')) {
          answer = '28';
        } else if (qText.includes('50, 45, 40, 35')) {
          answer = '30';
        }
        if (answer) {
          const input = box.locator('input.fg-int-input');
          await input.fill(answer);
          const verifyBtn = box.locator('button.fg-int-verify');
          await verifyBtn.click();
          await page.waitForTimeout(500);
        }
      }
      const nextBtn = page.locator('button.fg-nav-btn.primary');
      const startBtn = page.locator('button.fg-reading-close-btn');
      if (await startBtn.isVisible()) {
        await startBtn.click();
        break;
      } else if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }

    // 5. Answer Level questions
    // There are 2 questions in Fase 7 Modulo 1 Level 1
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

      const answer = findCorrectAnswer(7, 1, 1, questionText);
      expect(answer).not.toBe('');

      // Check question type
      const isMultipleChoice = await page.locator('.fg-options-grid').count() > 0;

      if (isMultipleChoice) {
        // Select correct option
        const optionBtn = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
        await optionBtn.click();
        
        // Confirm
        const confirmBtn = page.locator('.fg-mc-confirm-btn');
        await confirmBtn.click();
      } else {
        // Numeric - input using keypad
        for (const char of answer) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
        // Submit using arrow button
        await page.locator('button.bg-blue-600').first().click();
      }
      await page.waitForTimeout(1500); // Wait for auto-advance or fade
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
    const theoryOverlay = page.locator('.fg-reading-overlay');
    await expect(theoryOverlay).toBeVisible();
    
    while (true) {
      const interactiveBoxes = page.locator('.fg-interactive-box');
      const count = await interactiveBoxes.count();
      for (let i = 0; i < count; i++) {
        const box = interactiveBoxes.nth(i);
        const isLocked = await box.locator('text=🔒').isVisible();
        if (isLocked) continue;
        const isCorrect = (await box.getAttribute('class'))?.includes('correct');
        if (isCorrect) continue;
        const qTextEl = box.locator('.fg-int-q');
        const qText = await qTextEl.innerText();
        let answer = '';
        if (qText.includes('cohete avanza 2 casillas')) {
          answer = '3';
        } else if (qText.includes('Gira 90° a la izquierda')) {
          answer = 'Norte';
        } else if (qText.includes('4, 10, 16, 22')) {
          answer = '28';
        } else if (qText.includes('50, 45, 40, 35')) {
          answer = '30';
        }
        if (answer) {
          const input = box.locator('input.fg-int-input');
          await input.fill(answer);
          const verifyBtn = box.locator('button.fg-int-verify');
          await verifyBtn.click();
          await page.waitForTimeout(500);
        }
      }
      const nextBtn = page.locator('button.fg-nav-btn.primary');
      const startBtn = page.locator('button.fg-reading-close-btn');
      if (await startBtn.isVisible()) {
        await startBtn.click();
        break;
      } else if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }

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

      const answer = findCorrectAnswer(8, 1, 1, questionText);
      expect(answer).not.toBe('');

      // Check question type
      const isMultipleChoice = await page.locator('.fg-options-grid').count() > 0;

      if (isMultipleChoice) {
        const optionBtn = page.locator('.fg-option-text', { hasText: new RegExp(`^${escapeRegExp(answer)}$`) }).first();
        await optionBtn.click();
        const confirmBtn = page.locator('.fg-mc-confirm-btn');
        await confirmBtn.click();
      } else {
        for (const char of answer) {
          await page.locator(`button:has-text("${char}")`).last().click();
          await page.waitForTimeout(50);
        }
        await page.locator('button.bg-blue-600').first().click();
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
