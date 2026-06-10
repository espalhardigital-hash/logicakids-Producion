# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-gameplay-fase4.spec.ts >> 08 - Gameplay Fase 4 (Fracciones y Porcentajes) >> Módulo 1 Práctica - Flujo Completo: Teoría, Acierto y Bucle Espejo
- Location: tests\08-gameplay-fase4.spec.ts:177:7

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not 124677
```

# Test source

```ts
  144 |   test.afterAll(() => {
  145 |     try {
  146 |       execSync(
  147 |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE users SET role = 'USER' WHERE email = '${process.env.TEST_EMAIL || 'prueba@gmail.com'}';"`
  148 |       );
  149 |       console.log('✅ Test user role restored to USER in the database.');
  150 |     } catch (e) {
  151 |       console.error('❌ Failed to restore test user role:', e);
  152 |     }
  153 |   });
  154 | 
  155 |   test.beforeEach(async ({ page }) => {
  156 |     currentQuestionId = null;
  157 |     clearTestUserProgress();
  158 | 
  159 |     page.on('response', async (response) => {
  160 |       if (
  161 |         response.url().includes('/api/fase4/modulo/') &&
  162 |         response.url().includes('/pregunta')
  163 |       ) {
  164 |         try {
  165 |           const json = await response.json();
  166 |           if (json && json.id) {
  167 |             currentQuestionId = json.id;
  168 |             console.log(`Captured Loaded Question ID: ${currentQuestionId}`);
  169 |           }
  170 |         } catch (e) {}
  171 |       }
  172 |     });
  173 | 
  174 |     await ensureAuthenticated(page);
  175 |   });
  176 | 
  177 |   test('Módulo 1 Práctica - Flujo Completo: Teoría, Acierto y Bucle Espejo', async ({ page }) => {
  178 |     await page.route('**/api/fase4/lectura/**', async (route) => {
  179 |       const response = await route.fetch();
  180 |       const json = await response.json();
  181 |       json.interactivos = [];
  182 |       await route.fulfill({ json });
  183 |     });
  184 | 
  185 |     // 1. Navigate to Phase 4 Welcome
  186 |     await page.goto('/welcome-fase4');
  187 |     await page.waitForLoadState('domcontentloaded');
  188 |     await page.waitForTimeout(1000);
  189 | 
  190 |     // 2. Click Módulo 1 (Concepto de Fracción)
  191 |     const modCard = page.locator('.f4-module-card-item').first();
  192 |     await expect(modCard).toBeVisible();
  193 |     await modCard.click();
  194 | 
  195 |     // 3. Click Level 1
  196 |     const lvl1Btn = page.locator('.f4-level-card-item').first();
  197 |     await expect(lvl1Btn).toBeVisible();
  198 |     await lvl1Btn.click();
  199 | 
  200 |     // 4. Handle Theory Modal
  201 |     const theoryModal = page.locator('.f4-reading-overlay');
  202 |     await page.waitForTimeout(1500);
  203 |     if (await theoryModal.isVisible()) {
  204 |       console.log('Theory Modal detected. Navigating steps...');
  205 |       while (await page.locator('button:has-text("Siguiente")').isVisible()) {
  206 |         await page.locator('button:has-text("Siguiente")').first().click();
  207 |         await page.waitForTimeout(300);
  208 |       }
  209 |       const startBtn = page.locator('button:has-text("¡Entendido, empezar!")').first();
  210 |       await expect(startBtn).toBeVisible();
  211 |       await startBtn.click();
  212 |     }
  213 | 
  214 |     // 5. Dismiss Splash Screen
  215 |     const splash = page.locator('.f4-start-splash-overlay').first();
  216 |     await page.waitForTimeout(1500);
  217 |     if (await splash.isVisible()) {
  218 |       console.log('Splash Screen detected. Clicking to skip...');
  219 |       await splash.click();
  220 |     }
  221 | 
  222 |     // 6. Test Correct Answer
  223 |     for (let i = 0; i < 50; i++) {
  224 |       if (currentQuestionId !== null) break;
  225 |       await page.waitForTimeout(100);
  226 |     }
  227 |     expect(currentQuestionId).not.toBeNull();
  228 |     const firstQuestionId = currentQuestionId!;
  229 | 
  230 |     await submitCorrectAnswer(page, firstQuestionId);
  231 |     await page.waitForTimeout(1000);
  232 | 
  233 |     // Click continue if correct answer confirmation doesn't auto-advance
  234 |     const continueBtn = page.locator('button:has-text("Siguiente Pregunta →")').first();
  235 |     if (await continueBtn.isVisible()) {
  236 |       await continueBtn.click();
  237 |     }
  238 | 
  239 |     // Wait for next question
  240 |     for (let i = 0; i < 50; i++) {
  241 |       if (currentQuestionId !== null && currentQuestionId !== firstQuestionId) break;
  242 |       await page.waitForTimeout(100);
  243 |     }
> 244 |     expect(currentQuestionId).not.toBe(firstQuestionId);
      |                                   ^ Error: expect(received).not.toBe(expected) // Object.is equality
  245 | 
  246 |     // 7. Test Fail to trigger mirror question
  247 |     expect(currentQuestionId).not.toBeNull();
  248 |     const secondQuestionId = currentQuestionId!;
  249 | 
  250 |     await failCurrentQuestion(page, secondQuestionId);
  251 |     await page.waitForTimeout(1000);
  252 | 
  253 |     // Click continue on incorrect feedback
  254 |     const continueBtnWrong = page.locator('button:has-text("Continuar →")').first();
  255 |     await expect(continueBtnWrong).toBeVisible({ timeout: 5000 });
  256 |     await continueBtnWrong.click();
  257 | 
  258 |     // 8. Solve Mirror Question
  259 |     console.log('Waiting for mirror question loop...');
  260 |     await page.waitForTimeout(1500);
  261 |     expect(currentQuestionId).not.toBeNull();
  262 |     await submitCorrectAnswer(page, currentQuestionId!);
  263 |     console.log('Mirror question solved successfully.');
  264 |   });
  265 | });
  266 | 
```