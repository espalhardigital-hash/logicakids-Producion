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
    // Mastery Challenge
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

test.describe('12 - Gameplay Fase 9 (Simulados Colegio Pedro II)', () => {
  test.beforeAll(() => {
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'ADMIN' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}'; UPDATE alumnos SET fase_actual_id = 9 WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}');"`
      );
      console.log('✅ Test user set to role ADMIN and fase_actual_id = 9.');
    } catch (e) {
      console.error('❌ Failed to set test user state:', e);
    }
  });

  test.afterAll(() => {
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
      );
      console.log('✅ Test user role restored to USER.');
    } catch (e) {
      console.error('❌ Failed to restore test user role:', e);
    }
  });

  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await page.addInitScript(() => {
      window.localStorage.removeItem('lk_fase_progress_9');
    });
  });

  test('Fase 9 - Simulados Pedro II: Flujo Completo', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const card = page.locator('div.group', { hasText: 'Fase 9' }).first();
    await card.locator('button').first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Módulo 1 (Simulados)
    const modCard = page.locator('.fg-module-card.unlocked').first();
    await expect(modCard).toBeVisible();
    await modCard.click();

    // Nivel 1
    const lvlCard = page.locator('.fg-level-card.unlocked').first();
    await expect(lvlCard).toBeVisible();
    await lvlCard.click();

    // Modal de Teoría
    const theoryBtn = page.locator('button:has-text("¡Entendido, a Jugar!")');
    await expect(theoryBtn).toBeVisible();
    await theoryBtn.click();

    // Preguntas (2 preguntas en el seed)
    for (let qIdx = 0; qIdx < 2; qIdx++) {
      await page.waitForTimeout(500);
      const questionTextEl = page.locator('.fg-question-text').first();
      await expect(questionTextEl).toBeVisible();
      const questionText = await questionTextEl.innerHTML();

      const answer = findCorrectAnswer(9, 1, 1, questionText);
      expect(answer).not.toBe('');

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

    // Pantalla Final
    await page.waitForSelector('text=¡Desafío Terminado!');
    const menuBtn = page.locator('button:has-text("Volver al Menú")');
    await menuBtn.click();
  });
});
