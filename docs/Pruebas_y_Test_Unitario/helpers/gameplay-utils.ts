import { Page, expect } from '@playwright/test';
import { getFaseMetadata } from '../../../LogicaMath/frontend/components/fase_generic/faseMetadata';
import { getQuestionType, getCorrectAlternative, getCorrectAnswer, getIncorrectAlternative } from './db-utils';

/**
 * Limpia el texto HTML para poder compararlo.
 */
export function cleanText(html: string): string {
  return html
    .replace(/<img[^>]*>/g, '')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/['"‘“’”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Busca la respuesta correcta en la metadata de fases genéricas (7-8).
 */
export function findCorrectAnswerMetadata(faseId: number, moduloId: number, nivelId: number, currentQuestionText: string): string {
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

/**
 * Escapa strings para usarlos en RegExp.
 */
export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Navega automáticamente la ventana de Teoría (Fases Genéricas).
 * Resuelve los interactivos si se proveen las respuestas.
 */
export async function navigateGenericTheoryModal(page: Page, interactivesAnswers: Record<string, string> = {}) {
  const theoryOverlay = page.locator('.fg-reading-overlay');
  
  try {
    await theoryOverlay.waitFor({ state: 'visible', timeout: 5000 });
  } catch (e) {
    // Modal didn't appear in 5 seconds
  }
  
  if (await theoryOverlay.isVisible()) {
    console.log('Theory Modal detected. Navigating steps...');
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
        for (const [key, val] of Object.entries(interactivesAnswers)) {
          if (qText.includes(key)) {
            answer = val;
            break;
          }
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

      try {
        await page.locator('button.fg-reading-close-btn, button.fg-nav-btn.primary').first().waitFor({ state: 'visible', timeout: 3000 });
      } catch (e) {
        break;
      }

      if (await startBtn.isVisible()) {
        await startBtn.click();
        await theoryOverlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(500); // Wait for Framer Motion exit animation
        break;
      } else if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }
  }
}

/**
 * Ingresa numéricamente y hace clic en Confirmar en el Keypad genérico.
 */
export async function submitNumericKeypad(page: Page, answer: string) {
  for (const char of answer) {
    if (char === '/') {
      await page.locator('button:has-text("/")').last().click();
    } else {
      await page.locator(`button:has-text("${char}")`).last().click();
    }
    await page.waitForTimeout(50);
  }
  await page.locator('button.bg-blue-600, button.f2-keypad-submit, button.fg-keypad-submit, button.f5-keypad-submit, button.f6-keypad-submit').first().click();
}

/**
 * Dynamically answers a question correctly based on database queries (Phases 2-6).
 */
export async function submitCorrectAnswerDatabase(page: Page, questionId: number, classPrefix: string = 'f2') {
  const tipo = getQuestionType(questionId);

  if (tipo === 'MULTIPLE_OPCION') {
    const correctText = getCorrectAlternative(questionId);
    console.log(`Submitting correct alternative: "${correctText}" for question ID: ${questionId}`);
    await page.locator(`.${classPrefix}-mc-option-btn`).filter({ hasText: new RegExp(`^${escapeRegExp(correctText)}$`) }).first().click();
  } else {
    const answer = getCorrectAnswer(questionId);
    console.log(`Submitting correct answer: "${answer}" for question ID: ${questionId}`);
    await page.locator(`.${classPrefix}-hidden-input`).fill(answer);
  }

  await page.locator(`.${classPrefix}-submit-btn:has-text("Confirmar")`).first().click();
}

/**
 * Dynamically answers a question incorrectly based on database queries (Phases 2-6).
 */
export async function failCurrentQuestionDatabase(page: Page, questionId: number, classPrefix: string = 'f2') {
  const tipo = getQuestionType(questionId);

  if (tipo === 'MULTIPLE_OPCION') {
    const wrongText = getIncorrectAlternative(questionId);
    console.log(`Submitting incorrect alternative: "${wrongText}" for question ID: ${questionId}`);
    await page.locator(`.${classPrefix}-mc-option-btn`).filter({ hasText: new RegExp(`^${escapeRegExp(wrongText)}$`) }).first().click();
  } else {
    console.log(`Submitting incorrect answer: "9999" for question ID: ${questionId}`);
    await page.locator(`.${classPrefix}-hidden-input`).fill('9999');
  }

  await page.locator(`.${classPrefix}-submit-btn:has-text("Confirmar")`).first().click();
}
