import { test, expect } from '../helpers/test-fixtures';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule, getCorrectAnswer, getQuestionType, getCorrectAlternative } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

function logToReport(message: string) {
    const fs = require('fs');
    try {
        fs.appendFileSync('D:/Antigravity/APP_Logica_Matematicas_kids/docs/Pruebas_y_Test_Unitario/reporte_parcial_test_fase7.md', message + '\n');
    } catch (e) {
        console.error('No se pudo escribir en el reporte_parcial_test_fase7.md', e);
    }
}

async function verifyGraphics(page: any, fase: number, modulo: number, nivel: number, qId: number) {
    const contentArea = page.locator('.pregunta-container, .fg-question-area, .gameplay-container').first();
    if (await contentArea.isVisible().catch(() => false)) {
        const graphics = contentArea.locator('img, svg, canvas');
        const count = await graphics.count();
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const isVisible = await graphics.nth(i).isVisible();
                if (!isVisible) {
                    console.error(`⚠️ F${fase} M${modulo} L${nivel} (Q:${qId}): Gráfico oculto o no renderizado correctamente.`);
                }
                // Si es imagen, verificamos que no esté rota comprobando el naturalWidth
                const tagName = await graphics.nth(i).evaluate((el: Element) => el.tagName.toLowerCase());
                if (tagName === 'img') {
                    const isBroken = await graphics.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth === 0);
                    if (isBroken) {
                        console.error(`❌ F${fase} M${modulo} L${nivel} (Q:${qId}): IMAGEN ROTA DETECTADA.`);
                        throw new Error(`Imagen rota en Q:${qId}`);
                    }
                }
            }
        } else {
            console.log(`[Q:${qId}] No se detectaron gráficas en esta pregunta.`);
        }
    }
}

async function submitCorrectAnswerGeneric(page: any, questionId: number) {
    const splash = page.locator('.f7-start-splash-overlay, .fg-start-splash-overlay').first();
    if (await splash.isVisible().catch(() => false)) {
        await splash.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }

    const psqlBase = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
    const tipo = execSync(psqlBase, { input: `SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId};` }).toString().trim().toLowerCase();

    if (tipo === 'multiple_opcion') {
        const correctText = execSync(psqlBase, { input: `SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1;` }).toString().trim();
        await page.locator(`button:has-text("${correctText}")`).first().click({ timeout: 5000 });
        await page.waitForTimeout(300);
        await page.locator('button:has-text("Confirmar")').first().click({ timeout: 5000 }).catch(() => {});
    } else {
        const answer = execSync(psqlBase, { input: `SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId};` }).toString().trim();
        const hiddenInput = page.locator('input.fg-hidden-input, input[type="text"]').first();
        if (await hiddenInput.count() > 0 && await hiddenInput.isVisible()) {
            await hiddenInput.fill(answer);
            await page.keyboard.press('Enter');
        } else {
            // Typing characters if custom keyboard exists
            for (const char of answer) {
                await page.locator('button').filter({ hasText: new RegExp(`^${char}$`) }).last().click({ timeout: 5000 }).catch(() => {});
                await page.waitForTimeout(50);
            }
            await page.waitForTimeout(300);
            await page.locator('button:has-text("Confirmar"), button.bg-blue-600').last().click({ timeout: 5000 }).catch(() => {});
        }
    }
}

const metadata = getPhaseMetadata(7);

test.describe('12 - Gameplay Fase 7 E2E', () => {
    let currentQuestionId: number | null = null;
    let testUserEmail: string;

    test.beforeEach(async ({ page }) => {
        currentQuestionId = null;
        const ts = Date.now();
        testUserEmail = await registerDynamicTestUser(page);
        setPhaseForUser(testUserEmail, 7);
        // Desbloquear Fases 1 a 6 implícitamente asegurando que el backend lo permite
        // clearTestUserProgress(testUserEmail);

        page.on('response', async (response) => {
            if (response.url().includes('/api/fase7/modulo/') && response.url().includes('/pregunta')) {
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
            test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Fase 7`, async ({ page }) => {
                test.setTimeout(300000);
                
                unlockAllUpToModule(testUserEmail, 7, modulo.modulo_id);
                for (let l = 1; l < nivel.nivel_id; l++) {
                    approveProgresoMaestria(testUserEmail, 7, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
                }

                await page.goto('/');
                await page.evaluate(({ modId, lvlId }) => {
                    const progress: any = {};
                    for (let m = 1; m < modId; m++) {
                        progress[`${m}_1`] = true;
                        progress[`${m}_2`] = true;
                        progress[`${m}_3`] = true;
                    }
                    for (let l = 1; l < lvlId; l++) {
                        progress[`${modId}_${l}`] = true;
                    }
                    localStorage.setItem('lk_fase_progress_7', JSON.stringify(progress));
                }, { modId: modulo.modulo_id, lvlId: nivel.nivel_id });

                await page.goto('/welcome-fase7');
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(1000);

                const modCards = page.locator('.fg-module-card');
                const modCard = modCards.nth(modulo.modulo_id - 1);
                await expect(modCard).toBeVisible({ timeout: 10000 });
                await modCard.click();

                const lvlBtn = page.locator('.fg-level-card').nth(nivel.nivel_id - 1);
                await expect(lvlBtn).toBeVisible({ timeout: 10000 });
                await lvlBtn.click();

                // Wait for Splash screen to disappear first!
                const splashLevel = page.locator('.f7-start-splash-overlay, .fg-start-splash-overlay').first();
                if (await splashLevel.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await splashLevel.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
                }

                const theoryModal = page.locator('.f7-reading-overlay, .fg-theory-modal, .theory-modal').first();
                if (await theoryModal.isVisible({ timeout: 8000 }).catch(() => false)) {
                    console.log(`[DEBUG] Theory modal found. Calling navigateGenericTheoryModal...`);
                    await navigateGenericTheoryModal(page, {}, 'f7');
                } else {
                    console.log(`[DEBUG] Theory modal NOT found within 8000ms.`);
                }

                let questionCounter = 0;
                while (questionCounter < 20) {
                    await page.waitForTimeout(1000);
                    const endScreen = page.locator('text=Nivel Completado').or(page.locator('text=Dominado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
                    if (await endScreen.isVisible().catch(() => false)) {
                        logToReport(`| 7 | ${modulo.modulo_id} | ${nivel.nivel_id} | — | ✅ PASS | ${new Date().toLocaleTimeString()} | Gráficos OK |`);
                        break;
                    }

                    if (currentQuestionId) {
                        await verifyGraphics(page, 7, modulo.modulo_id, nivel.nivel_id, currentQuestionId);
                        await submitCorrectAnswerGeneric(page, currentQuestionId);
                        currentQuestionId = null;
                    }

                    const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
                    if (await nextBtn.isVisible().catch(() => false)) {
                        await nextBtn.click();
                        currentQuestionId = null;
                    }
                    questionCounter++;
                }
            });
        }

    }
});
