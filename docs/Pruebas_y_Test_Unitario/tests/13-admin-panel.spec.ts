import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { ensureAuthenticated } from '../helpers/auth';
import { ROUTES } from '../helpers/constants';

test.describe('13 - Panel de Administración y Sincronización de Contenido', () => {
  let createdQuestionId: number | null = null;

  test.beforeAll(() => {
    // Elevate user to ADMIN for the test and ensure Fase 4 is unlocked
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'ADMIN' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}'; UPDATE alumnos SET fase_actual_id = 4 WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}');"`
      );
      console.log('✅ Test user successfully set to role ADMIN and reset to Fase 4.');
    } catch (e) {
      console.error('Failed to set test user to ADMIN', e);
    }
  });

  test.afterAll(() => {
    // Restore user to normal USER and delete test question if it exists
    try {
      execSync(
        `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
      );
      if (createdQuestionId) {
        execSync(
          `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "DELETE FROM preguntas WHERE id = ${createdQuestionId};"`
        );
        console.log(`🧹 Deleted test question ID: ${createdQuestionId}`);
      }
      console.log('✅ Test user role restored to USER in the database.');
    } catch (e) {
      console.error('Failed to cleanup admin test', e);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to Login page and login as ADMIN
    await ensureAuthenticated(page);
  });

  test('ADMIN puede crear una pregunta en ContentTab (Fase 4) y USER puede jugarla', async ({ page }) => {
    test.slow(); // Allow extra time for finding elements and playing the level
    // 1. Acceder al Panel de Administrador
    const adminBtn = page.locator('button', { hasText: 'Panel Admin' });
    if (await adminBtn.isVisible()) {
        await adminBtn.click();
    } else {
        await page.goto('/admin');
    }
    await page.waitForURL('/admin');

    // 2. Navegar a la sección del sidebar "Banco de Preguntas"
    await page.locator('button', { hasText: 'Banco de Preguntas' }).first().click();
    
    // Esperar a que la vista de contenido cargue y hacer clic en la sub-pestaña
    await page.locator('button', { hasText: 'Banco de Preguntas' }).nth(1).click();
    
    // 3. Seleccionar Fase 4, Modulo 1, Nivel 1
    const selects = page.locator('select');
    await expect(selects).toHaveCount(4); // Escala tipográfica, Fase, Módulo, Nivel
    
    // Seleccionar Fase 4
    await selects.nth(1).selectOption({ label: 'Fase 4' });
    // Seleccionar Módulo 1
    await selects.nth(2).selectOption({ index: 0 }); // Módulo 1: La Fracción Visual
    // Seleccionar Nivel 1
    await selects.nth(3).selectOption({ index: 0 }); // Nivel 1: Lectura de Fracciones
    
    // 4. Crear la pregunta
    const newQuestionBtn = page.locator('button', { hasText: 'Agregar Pregunta' }).first();
    await newQuestionBtn.click();

    const enunciadoInput = page.locator('textarea[placeholder*="Enunciado"]');
    await enunciadoInput.fill('PREGUNTA DE PRUEBA CREADA POR ADMIN EN FASE 4');

    const respuestaCorrectaInput = page.locator('input[placeholder*="Ej. 4, Gato, Sur"]');
    await respuestaCorrectaInput.fill('OPCION ADMIN CORRECTA');

    // Llenar alternativas
    const alternativasInputs = page.locator('input[placeholder*="Texto de la alternativa"]');
    await alternativasInputs.nth(0).fill('OPCION ADMIN CORRECTA');
    await alternativasInputs.nth(1).fill('INCORRECTA 1');
    await alternativasInputs.nth(2).fill('INCORRECTA 2');
    await alternativasInputs.nth(3).fill('INCORRECTA 3');

    // Guardar Pregunta
    const saveBtn = page.locator('button', { hasText: 'Crear Pregunta' }).last();
    await saveBtn.click();

    // 5. Validar mensaje de éxito
    await expect(page.locator('text=Pregunta creada exitosamente')).toBeVisible();

    // 6. Obtener ID de la base de datos
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT id FROM preguntas WHERE enunciado = 'PREGUNTA DE PRUEBA CREADA POR ADMIN EN FASE 4' ORDER BY id DESC LIMIT 1"`;
    const qIdStr = execSync(cmd).toString().trim();
    createdQuestionId = parseInt(qIdStr);
    expect(createdQuestionId).not.toBeNaN();

    // 7. Simular Alumno: Cambiar rol a USER
    execSync(
      `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
    );
    
    // 8. Volver al mapa y acceder a la Fase 4
    await page.goto('/map');
    await page.waitForURL('/map');

    const cardFase4 = page.locator('div.group', { hasText: 'Fase 4' }).first();
    await cardFase4.locator('button').first().click();

    await page.waitForURL(/\/fase4/);
    await page.locator('button:has-text("INICIAR DESAFÍO")').first().click();

    // 9. Jugar hasta encontrar la pregunta
    let foundNewQuestion = false;
    // La fase 4 genérica puede tener pantallas de bienvenida teórica
    const modalTheory = page.locator('text=Concepto Nuevo');
    if (await modalTheory.isVisible({ timeout: 2000 })) {
      await page.locator('button:has-text("Siguiente")').last().click();
      await page.waitForTimeout(500);
    }

    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);

      const questionTextEl = page.locator('.fg-question-text, .text-xl, h3').first();
      if (!(await questionTextEl.isVisible())) {
         continue; // Wait for UI
      }
      
      const text = await questionTextEl.innerText();

      if (text.includes('PREGUNTA DE PRUEBA CREADA POR ADMIN')) {
        foundNewQuestion = true;
        
        // 10. Validar que las opciones están presentes y hacer clic
        const btnAdmin = page.locator('button', { hasText: 'OPCION ADMIN CORRECTA' }).first();
        await expect(btnAdmin).toBeVisible();
        await btnAdmin.click();

        const btnConfirm = page.locator('button:has-text("Confirmar"), button:has-text("Siguiente Pregunta")').first();
        if (await btnConfirm.isVisible()) {
            await btnConfirm.click();
        }
        
        break;
      } else {
        // Answer normal questions to proceed
        const dbIdCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT id FROM preguntas WHERE enunciado = '${text.replace(/'/g, "''")}' LIMIT 1"`;
        try {
            const currentQId = execSync(dbIdCmd).toString().trim();
            if (currentQId) {
                const getAnsCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${currentQId}"`;
                const correctAnswer = execSync(getAnsCmd).toString().trim();
                
                const btnAns = page.locator('button', { hasText: new RegExp(`^${correctAnswer}$`) }).first();
                if (await btnAns.isVisible()) {
                    await btnAns.click();
                }

                // Wait a bit to see if "Confirmar" or "Siguiente Pregunta" appears
                await page.waitForTimeout(500);
                const btnConfirm = page.locator('button:has-text("Confirmar"), button:has-text("Siguiente Pregunta")').first();
                if (await btnConfirm.isVisible()) {
                    await btnConfirm.click();
                }
            } else {
                // If it's not in DB, it might be a hardcoded fallback or tutorial. Just click the first alternative.
                const alternativeBtn = page.locator('button.bg-white').first(); // Adjust selector based on typical button styling if needed
                if(await alternativeBtn.isVisible()) {
                    await alternativeBtn.click();
                }
            }
        } catch(err) {
            console.log("Error finding answer, clicking first option");
            const alternativeBtn = page.locator('.fg-alternative-button, button.bg-white').first();
            if(await alternativeBtn.isVisible()) {
                await alternativeBtn.click();
            }
        }
      }
    }

    expect(foundNewQuestion).toBeTruthy();
  });
});
