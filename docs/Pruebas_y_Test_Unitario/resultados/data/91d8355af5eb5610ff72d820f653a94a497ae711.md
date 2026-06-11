# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-gameplay-fase2.spec.ts >> 06 - Gameplay Fase 2 (Desarrollo Numérico) >> Módulo 1 Desafío (Gimnasio Mental) - Salida Temprana (Early Exit) tras múltiples fallos
- Location: tests\06-gameplay-fase2.spec.ts:340:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.f2-mc-option-btn').filter({ hasText: /^31$/ }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - button "Salir del nivel" [ref=e7] [cursor=pointer]:
        - img [ref=e8]
      - generic [ref=e11]:
        - generic [ref=e12]: GIMNASIO MENTAL
        - generic [ref=e13]: "|"
        - generic [ref=e14]: FASE 2
        - generic [ref=e15]: "|"
        - generic [ref=e16]: MÓDULO 1
        - generic [ref=e17]: "|"
        - generic [ref=e18]: NIVEL 11
        - generic [ref=e19]: "|"
        - generic [ref=e20]: DESAFÍO 0/25
        - generic [ref=e21]: "|"
        - generic [ref=e22]: "ERRORES: 1/2"
        - generic [ref=e23]: "|"
        - generic [ref=e24]: 10S
    - main [ref=e28]:
      - generic [ref=e31]:
        - generic [ref=e33]: "Calcula mentalmente: 6 + 8 × 8"
        - generic [ref=e34]:
          - button "74" [ref=e35]
          - button "70" [ref=e36]
          - button "69" [ref=e37]
          - button "72" [ref=e38]
        - button "Confirmar" [disabled] [ref=e39]
  - button "Alternar Tema Claro/Oscuro" [ref=e40] [cursor=pointer]:
    - img [ref=e42]
```

# Test source

```ts
  1   | import { test, expect } from '../helpers/test-fixtures';
  2   | import { ROUTES } from '../helpers/constants';
  3   | import { registerDynamicTestUser } from '../helpers/auth';
  4   | import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
  5   | import { execSync } from 'child_process';
  6   | 
  7   | /**
  8   |  * Helper to query the local database for correct answers.
  9   |  */
  10  | function getCorrectAnswer(questionId: number): string {
  11  |   try {
  12  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
  13  |     return execSync(cmd).toString().trim();
  14  |   } catch (e) {
  15  |     console.error(`Error querying answer for question ${questionId}:`, e);
  16  |     return '';
  17  |   }
  18  | }
  19  | 
  20  | /**
  21  |  * Helper to query the local database for Chained Steps answers (Module 4).
  22  |  */
  23  | function getChainedStepAnswer(questionId: number, stepNumber: number): string {
  24  |   try {
  25  |     const query = `SELECT datos_numericos->'pasos'->${stepNumber - 1}->>'respuesta_correcta' FROM preguntas WHERE id = ${questionId}`;
  26  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "${query}"`;
  27  |     return execSync(cmd).toString().trim();
  28  |   } catch (e) {
  29  |     console.error(`Error querying chained step ${stepNumber} for question ${questionId}:`, e);
  30  |     return '';
  31  |   }
  32  | }
  33  | 
  34  | /**
  35  |  * Clean up all attempts and progress for the test user to avoid state leakage.
  36  |  */
  37  | function clearTestUserProgress(email: string) {
  38  |   try {
  39  |     const queries = [
  40  |       `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
  41  |       `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
  42  |       `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
  43  |       `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
  44  |     ];
  45  |     for (const q of queries) {
  46  |       execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${q}"`);
  47  |     }
  48  |     console.log(`🧹 Test user database progress successfully cleared for ${email}.`);
  49  |   } catch (e) {
  50  |     console.error('❌ Failed to clear test user database progress:', e);
  51  |   }
  52  | }
  53  | 
  54  | /**
  55  |  * Dynamically answers a question correctly based on database queries.
  56  |  */
  57  | async function submitCorrectAnswer(page: any, questionId: number) {
  58  |   const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  59  |   const tipo = execSync(typeCmd).toString().trim();
  60  | 
  61  |   if (tipo === 'MULTIPLE_OPCION') {
  62  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
  63  |     const correctText = execSync(cmd).toString().trim();
  64  |     console.log(`Submitting correct alternative: "${correctText}" for question ID: ${questionId}`);
  65  |     await page.locator('.f2-mc-option-btn').filter({ hasText: new RegExp(`^${correctText.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`) }).first().click();
  66  |   } else {
  67  |     const answer = getCorrectAnswer(questionId);
  68  |     console.log(`Submitting correct answer: "${answer}" for question ID: ${questionId}`);
  69  |     await page.locator('.f2-hidden-input').fill(answer);
  70  |   }
  71  | 
  72  |   await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();
  73  | }
  74  | 
  75  | /**
  76  |  * Dynamically answers a question incorrectly based on database queries.
  77  |  */
  78  | async function failCurrentQuestion(page: any, questionId: number) {
  79  |   const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  80  |   const tipo = execSync(typeCmd).toString().trim();
  81  | 
  82  |   if (tipo === 'MULTIPLE_OPCION') {
  83  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
  84  |     const wrongText = execSync(cmd).toString().trim();
  85  |     console.log(`Submitting incorrect alternative: "${wrongText}" for question ID: ${questionId}`);
> 86  |     await page.locator('.f2-mc-option-btn').filter({ hasText: new RegExp(`^${wrongText.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`) }).first().click();
      |                                                                                                                                                   ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  87  |   } else {
  88  |     console.log(`Submitting incorrect answer: "9999" for question ID: ${questionId}`);
  89  |     await page.locator('.f2-hidden-input').fill('9999');
  90  |   }
  91  | 
  92  |   await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();
  93  | }
  94  | 
  95  | test.describe('06 - Gameplay Fase 2 (Desarrollo Numérico)', () => {
  96  |   let currentQuestionId: number | null = null;
  97  |   let testUserEmail: string;
  98  | 
  99  |   test.beforeEach(async ({ page }) => {
  100 |     currentQuestionId = null;
  101 |     testUserEmail = await registerDynamicTestUser(page);
  102 |     setPhaseForUser(testUserEmail, 2);
  103 |     clearTestUserProgress(testUserEmail);
  104 | 
  105 |     // Listen to network responses to capture the question ID of loaded questions
  106 |     page.on('response', async (response) => {
  107 |       if (
  108 |         response.url().includes('/api/fase2/modulo/') &&
  109 |         response.url().includes('/pregunta')
  110 |       ) {
  111 |         try {
  112 |           const json = await response.json();
  113 |           if (json && json.id) {
  114 |             currentQuestionId = json.id;
  115 |             console.log(`Captured Loaded Question ID: ${currentQuestionId}`);
  116 |           }
  117 |         } catch (e) {
  118 |           // Ignore parsing errors for non-JSON responses
  119 |         }
  120 |       }
  121 |     });
  122 | 
  123 |   });
  124 | 
  125 |   test('Módulo 1 Práctica (Gimnasio Mental) - Flujo Completo: Teoría, Acierto y Bucle Espejo', async ({ page }) => {
  126 |     // Intercept reading data to remove interactives for quick and reliable theory modal traversal
  127 |     await page.route('**/api/fase2/lectura/**', async (route) => {
  128 |       const response = await route.fetch();
  129 |       const json = await response.json();
  130 |       json.interactivos = [];
  131 |       await route.fulfill({ json });
  132 |     });
  133 | 
  134 |     // 1. Navigate to Phase 2 Welcome Hub
  135 |     await page.goto('/welcome-fase2');
  136 |     await page.waitForLoadState('domcontentloaded');
  137 |     await page.waitForTimeout(1000);
  138 | 
  139 |     // 2. Click Módulo 1 (Gimnasio Mental)
  140 |     const modCard = page.locator('.f2-module-card').first();
  141 |     await expect(modCard).toBeVisible();
  142 |     await modCard.click();
  143 | 
  144 |     // 3. Click Level 1 to enter
  145 |     const lvl1Btn = page.locator('.f2-level-card').first();
  146 |     await expect(lvl1Btn).toBeVisible();
  147 |     await lvl1Btn.click();
  148 | 
  149 |     // 4. Handle Theory Modal if shown
  150 |     const theoryModal = page.locator('.f2-reading-overlay');
  151 |     await page.waitForTimeout(1500);
  152 |     if (await theoryModal.isVisible()) {
  153 |       console.log('Theory Modal detected. Navigating steps...');
  154 |       while (await page.locator('button:has-text("Siguiente")').isVisible()) {
  155 |         await page.locator('button:has-text("Siguiente")').first().click();
  156 |         await page.waitForTimeout(300);
  157 |       }
  158 |       const startBtn = page.locator('button:has-text("¡Entendido, empezar!")').first();
  159 |       await expect(startBtn).toBeVisible();
  160 |       await startBtn.click();
  161 |       await theoryModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  162 |     }
  163 | 
  164 |     // 5. Dismiss Splash Screen
  165 |     const splash = page.locator('.f2-start-splash-overlay').first();
  166 |     await page.waitForTimeout(1500);
  167 |     if (await splash.isVisible()) {
  168 |       console.log('Splash Screen detected. Clicking to skip...');
  169 |       await splash.click();
  170 |     }
  171 | 
  172 |     // 6. Test Correct Answer (Acierto)
  173 |     // Wait for the first question to load (currentQuestionId becomes non-null)
  174 |     for (let i = 0; i < 50; i++) {
  175 |       if (currentQuestionId !== null) break;
  176 |       await page.waitForTimeout(100);
  177 |     }
  178 |     expect(currentQuestionId).not.toBeNull();
  179 |     const firstQuestionId = currentQuestionId!;
  180 |     
  181 |     const typeCmd1 = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${firstQuestionId}"`;
  182 |     const tipo1 = execSync(typeCmd1).toString().trim();
  183 | 
  184 |     await submitCorrectAnswer(page, firstQuestionId);
  185 | 
  186 |     // Verify correct answer feedback UI
```