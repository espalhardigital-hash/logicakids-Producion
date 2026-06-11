import { test, expect } from '../helpers/test-fixtures';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser } from '../helpers/db-utils';
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
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 9);
  });

  test('Fase 9 - Simulados Pedro II: Flujo Completo', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      window.localStorage.removeItem('lk_fase_progress_9');
    });
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
    const theoryOverlay = page.locator('.fg-reading-overlay');
    await expect(theoryOverlay).toBeVisible();
    
    while (true) {
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

    // Preguntas (2 preguntas en el seed)
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
