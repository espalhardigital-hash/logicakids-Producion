# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 13-admin-panel.spec.ts >> 13 - Panel de Administración y Sincronización de Contenido >> ADMIN puede crear una pregunta en ContentTab (Fase 4) y USER puede jugarla
- Location: tests\13-admin-panel.spec.ts:44:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: 'Banco de Preguntas' }).nth(1)

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { execSync } from 'child_process';
  3   | import { ensureAuthenticated } from '../helpers/auth';
  4   | import { ROUTES } from '../helpers/constants';
  5   | 
  6   | test.describe('13 - Panel de Administración y Sincronización de Contenido', () => {
  7   |   let createdQuestionId: number | null = null;
  8   | 
  9   |   test.beforeAll(() => {
  10  |     // Elevate user to ADMIN for the test and ensure Fase 4 is unlocked
  11  |     try {
  12  |       execSync(
  13  |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'ADMIN' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}'; UPDATE alumnos SET fase_actual_id = 4 WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}');"`
  14  |       );
  15  |       console.log('✅ Test user successfully set to role ADMIN and reset to Fase 4.');
  16  |     } catch (e) {
  17  |       console.error('Failed to set test user to ADMIN', e);
  18  |     }
  19  |   });
  20  | 
  21  |   test.afterAll(() => {
  22  |     // Restore user to normal USER and delete test question if it exists
  23  |     try {
  24  |       execSync(
  25  |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
  26  |       );
  27  |       if (createdQuestionId) {
  28  |         execSync(
  29  |           `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "DELETE FROM preguntas WHERE id = ${createdQuestionId};"`
  30  |         );
  31  |         console.log(`🧹 Deleted test question ID: ${createdQuestionId}`);
  32  |       }
  33  |       console.log('✅ Test user role restored to USER in the database.');
  34  |     } catch (e) {
  35  |       console.error('Failed to cleanup admin test', e);
  36  |     }
  37  |   });
  38  | 
  39  |   test.beforeEach(async ({ page }) => {
  40  |     // Navigate to Login page and login as ADMIN
  41  |     await ensureAuthenticated(page);
  42  |   });
  43  | 
  44  |   test('ADMIN puede crear una pregunta en ContentTab (Fase 4) y USER puede jugarla', async ({ page }) => {
  45  |     test.slow(); // Allow extra time for finding elements and playing the level
  46  |     // 1. Acceder al Panel de Administrador
  47  |     const adminBtn = page.locator('button', { hasText: 'Panel Admin' });
  48  |     if (await adminBtn.isVisible()) {
  49  |         await adminBtn.click();
  50  |     } else {
  51  |         await page.goto('/admin');
  52  |     }
  53  |     await page.waitForURL('/admin');
  54  | 
  55  |     // 2. Navegar a la pestaña "Banco de Preguntas" (la pestaña central, no el menú lateral)
> 56  |     await page.locator('button', { hasText: 'Banco de Preguntas' }).nth(1).click();
      |                                                                            ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  57  |     
  58  |     // 3. Seleccionar Fase 4, Modulo 1, Nivel 1
  59  |     const selects = page.locator('select');
  60  |     await expect(selects).toHaveCount(4); // Escala tipográfica, Fase, Módulo, Nivel
  61  |     
  62  |     // Seleccionar Fase 4
  63  |     await selects.nth(1).selectOption({ label: 'Fase 4' });
  64  |     // Seleccionar Módulo 1
  65  |     await selects.nth(2).selectOption({ index: 0 }); // Módulo 1: La Fracción Visual
  66  |     // Seleccionar Nivel 1
  67  |     await selects.nth(3).selectOption({ index: 0 }); // Nivel 1: Lectura de Fracciones
  68  |     
  69  |     // 4. Crear la pregunta
  70  |     const newQuestionBtn = page.locator('button', { hasText: 'Agregar Pregunta' }).first();
  71  |     await newQuestionBtn.click();
  72  | 
  73  |     const enunciadoInput = page.locator('textarea[placeholder*="Enunciado"]');
  74  |     await enunciadoInput.fill('PREGUNTA DE PRUEBA CREADA POR ADMIN EN FASE 4');
  75  | 
  76  |     const respuestaCorrectaInput = page.locator('input[placeholder*="Ej. 4, Gato, Sur"]');
  77  |     await respuestaCorrectaInput.fill('OPCION ADMIN CORRECTA');
  78  | 
  79  |     // Llenar alternativas
  80  |     const alternativasInputs = page.locator('input[placeholder*="Texto de la alternativa"]');
  81  |     await alternativasInputs.nth(0).fill('OPCION ADMIN CORRECTA');
  82  |     await alternativasInputs.nth(1).fill('INCORRECTA 1');
  83  |     await alternativasInputs.nth(2).fill('INCORRECTA 2');
  84  |     await alternativasInputs.nth(3).fill('INCORRECTA 3');
  85  | 
  86  |     // Guardar Pregunta
  87  |     const saveBtn = page.locator('button', { hasText: 'Crear Pregunta' }).last();
  88  |     await saveBtn.click();
  89  | 
  90  |     // 5. Validar mensaje de éxito
  91  |     await expect(page.locator('text=Pregunta creada exitosamente')).toBeVisible();
  92  | 
  93  |     // 6. Obtener ID de la base de datos
  94  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT id FROM preguntas WHERE enunciado = 'PREGUNTA DE PRUEBA CREADA POR ADMIN EN FASE 4' ORDER BY id DESC LIMIT 1"`;
  95  |     const qIdStr = execSync(cmd).toString().trim();
  96  |     createdQuestionId = parseInt(qIdStr);
  97  |     expect(createdQuestionId).not.toBeNaN();
  98  | 
  99  |     // 7. Simular Alumno: Cambiar rol a USER
  100 |     execSync(
  101 |       `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
  102 |     );
  103 |     
  104 |     // 8. Volver al mapa y acceder a la Fase 4
  105 |     await page.goto('/map');
  106 |     await page.waitForURL('/map');
  107 | 
  108 |     const cardFase4 = page.locator('div.group', { hasText: 'Fase 4' }).first();
  109 |     await cardFase4.locator('button').first().click();
  110 | 
  111 |     await page.waitForURL(/\/fase4/);
  112 |     await page.locator('button:has-text("INICIAR DESAFÍO")').first().click();
  113 | 
  114 |     // 9. Jugar hasta encontrar la pregunta
  115 |     let foundNewQuestion = false;
  116 |     // La fase 4 genérica puede tener pantallas de bienvenida teórica
  117 |     const modalTheory = page.locator('text=Concepto Nuevo');
  118 |     if (await modalTheory.isVisible({ timeout: 2000 })) {
  119 |       await page.locator('button:has-text("Siguiente")').last().click();
  120 |       await page.waitForTimeout(500);
  121 |     }
  122 | 
  123 |     for (let i = 0; i < 15; i++) {
  124 |       await page.waitForTimeout(1000);
  125 | 
  126 |       const questionTextEl = page.locator('.fg-question-text, .text-xl, h3').first();
  127 |       if (!(await questionTextEl.isVisible())) {
  128 |          continue; // Wait for UI
  129 |       }
  130 |       
  131 |       const text = await questionTextEl.innerText();
  132 | 
  133 |       if (text.includes('PREGUNTA DE PRUEBA CREADA POR ADMIN')) {
  134 |         foundNewQuestion = true;
  135 |         
  136 |         // 10. Validar que las opciones están presentes y hacer clic
  137 |         const btnAdmin = page.locator('button', { hasText: 'OPCION ADMIN CORRECTA' }).first();
  138 |         await expect(btnAdmin).toBeVisible();
  139 |         await btnAdmin.click();
  140 | 
  141 |         const btnConfirm = page.locator('button:has-text("Confirmar"), button:has-text("Siguiente Pregunta")').first();
  142 |         if (await btnConfirm.isVisible()) {
  143 |             await btnConfirm.click();
  144 |         }
  145 |         
  146 |         break;
  147 |       } else {
  148 |         // Answer normal questions to proceed
  149 |         const dbIdCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT id FROM preguntas WHERE enunciado = '${text.replace(/'/g, "''")}' LIMIT 1"`;
  150 |         try {
  151 |             const currentQId = execSync(dbIdCmd).toString().trim();
  152 |             if (currentQId) {
  153 |                 const getAnsCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${currentQId}"`;
  154 |                 const correctAnswer = execSync(getAnsCmd).toString().trim();
  155 |                 
  156 |                 const btnAns = page.locator('button', { hasText: new RegExp(`^${correctAnswer}$`) }).first();
```