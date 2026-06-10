# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-gameplay-fase2.spec.ts >> 06 - Gameplay Fase 2 (Desarrollo Numérico) >> Módulo 1 Práctica (Gimnasio Mental) - Flujo Completo: Teoría, Acierto y Bucle Espejo
- Location: tests\06-gameplay-fase2.spec.ts:150:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('.f2-mirror-modal-card')
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for locator('.f2-mirror-modal-card')
    14 × locator resolved to <div class="f2-mirror-modal-card glass-card">…</div>
       - unexpected value "visible"

```

```yaml
- button
- text: "¡SEGUNDA OPORTUNIDAD! Vamos a repasar juntos el concepto REPASO: Pregunta anterior: \"Halla el triple de 20.\" Tú respondiste: 9999 La respuesta correcta era:"
- strong: "60"
- heading "Sofía ahorró 12 pinceles y Elena tiene el cuádruple. ¿cuántos pinceles tiene Elena?" [level=2]
- textbox: "60"
- text: "60 Era: 48"
- img
- button "¡Intentar de nuevo! →"
- button "7"
- button "8"
- button "9"
- button "4"
- button "5"
- button "6"
- button "1"
- button "2"
- button "3"
- button "."
- button "0"
- button
- button "Continuar" [disabled]
```

# Test source

```ts
  162 |     await page.waitForTimeout(1000);
  163 | 
  164 |     // 2. Click Módulo 1 (Gimnasio Mental)
  165 |     const modCard = page.locator('.f2-module-card').first();
  166 |     await expect(modCard).toBeVisible();
  167 |     await modCard.click();
  168 | 
  169 |     // 3. Click Level 1 to enter
  170 |     const lvl1Btn = page.locator('.f2-level-card').first();
  171 |     await expect(lvl1Btn).toBeVisible();
  172 |     await lvl1Btn.click();
  173 | 
  174 |     // 4. Handle Theory Modal if shown
  175 |     const theoryModal = page.locator('.f2-reading-overlay');
  176 |     await page.waitForTimeout(1500);
  177 |     if (await theoryModal.isVisible()) {
  178 |       console.log('Theory Modal detected. Navigating steps...');
  179 |       while (await page.locator('button:has-text("Siguiente")').isVisible()) {
  180 |         await page.locator('button:has-text("Siguiente")').first().click();
  181 |         await page.waitForTimeout(300);
  182 |       }
  183 |       const startBtn = page.locator('button:has-text("¡Entendido, empezar!")').first();
  184 |       await expect(startBtn).toBeVisible();
  185 |       await startBtn.click();
  186 |     }
  187 | 
  188 |     // 5. Dismiss Splash Screen
  189 |     const splash = page.locator('.f2-start-splash-overlay').first();
  190 |     await page.waitForTimeout(1500);
  191 |     if (await splash.isVisible()) {
  192 |       console.log('Splash Screen detected. Clicking to skip...');
  193 |       await splash.click();
  194 |     }
  195 | 
  196 |     // 6. Test Correct Answer (Acierto)
  197 |     // Wait for the first question to load (currentQuestionId becomes non-null)
  198 |     for (let i = 0; i < 50; i++) {
  199 |       if (currentQuestionId !== null) break;
  200 |       await page.waitForTimeout(100);
  201 |     }
  202 |     expect(currentQuestionId).not.toBeNull();
  203 |     const firstQuestionId = currentQuestionId!;
  204 |     
  205 |     const typeCmd1 = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${firstQuestionId}"`;
  206 |     const tipo1 = execSync(typeCmd1).toString().trim();
  207 | 
  208 |     await submitCorrectAnswer(page, firstQuestionId);
  209 | 
  210 |     // Verify correct answer feedback UI
  211 |     if (tipo1 === 'MULTIPLE_OPCION') {
  212 |       await expect(page.locator('.f2-mc-option-btn.selected').first()).toBeVisible();
  213 |     } else {
  214 |       await expect(page.locator('.f2-custom-input-box.correct')).toBeVisible();
  215 |     }
  216 |     
  217 |     // In practice libre, correct answers automatically advance after 500ms.
  218 |     // So we wait for the next question to load and update currentQuestionId.
  219 |     for (let i = 0; i < 50; i++) {
  220 |       if (currentQuestionId !== null && currentQuestionId !== firstQuestionId) break;
  221 |       await page.waitForTimeout(100);
  222 |     }
  223 |     expect(currentQuestionId).not.toBe(firstQuestionId);
  224 | 
  225 |     // 7. Test Incorrect Answer (Fallo) to trigger Bucle Espejo
  226 |     expect(currentQuestionId).not.toBeNull();
  227 |     const secondQuestionId = currentQuestionId!;
  228 |     
  229 |     const typeCmd2 = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${secondQuestionId}"`;
  230 |     const tipo2 = execSync(typeCmd2).toString().trim();
  231 | 
  232 |     await failCurrentQuestion(page, secondQuestionId);
  233 | 
  234 |     // Verify incorrect answer feedback UI
  235 |     if (tipo2 === 'MULTIPLE_OPCION') {
  236 |       await expect(page.locator('.f2-mc-option-btn.selected').first()).toBeVisible();
  237 |     } else {
  238 |       await expect(page.locator('.f2-custom-input-box.incorrect')).toBeVisible();
  239 |     }
  240 |     await page.waitForTimeout(1000);
  241 | 
  242 |     // Click continue on wrong answer to trigger Mirror Modal
  243 |     const continueBtnWrong = page.locator('.f2-submit-btn:has-text("Continuar")').first();
  244 |     await expect(continueBtnWrong).toBeVisible({ timeout: 5000 });
  245 |     await continueBtnWrong.click();
  246 | 
  247 |     // 8. Verify Bucle Espejo (Mirror Modal) displays
  248 |     console.log('Waiting for Mirror Modal to appear...');
  249 |     const mirrorModal = page.locator('.f2-mirror-modal-card');
  250 |     await expect(mirrorModal).toBeVisible({ timeout: 10000 });
  251 | 
  252 |     // Solve Mirror Question Correctly
  253 |     expect(currentQuestionId).not.toBeNull();
  254 |     const mirrorAnswer = getCorrectAnswer(currentQuestionId!);
  255 |     console.log(`Submitting correct answer: "${mirrorAnswer}" for Mirror Question ID: ${currentQuestionId}`);
  256 | 
  257 |     const mirrorInput = mirrorModal.locator('.f2-hidden-input');
  258 |     await mirrorInput.fill(mirrorAnswer);
  259 |     await mirrorModal.locator('button:has-text("Confirmar")').first().click();
  260 | 
  261 |     // Mirror Modal should auto-close upon correct answer after 1.5s
> 262 |     await expect(mirrorModal).not.toBeVisible({ timeout: 5000 });
      |                                   ^ Error: expect(locator).not.toBeVisible() failed
  263 |     console.log('Mirror Modal successfully solved and closed.');
  264 |   });
  265 | 
  266 |   test('Módulo 4 Práctica (Constructor de Soluciones) - Flujo de Pregunta Chained (Multi-Paso)', async ({ page }) => {
  267 |     // Intercept reading data to remove interactives for quick and reliable theory modal traversal
  268 |     await page.route('**/api/fase2/lectura/**', async (route) => {
  269 |       const response = await route.fetch();
  270 |       const json = await response.json();
  271 |       json.interactivos = [];
  272 |       await route.fulfill({ json });
  273 |     });
  274 | 
  275 |     // 1. Navigate to Phase 2 Welcome Hub
  276 |     await page.goto('/welcome-fase2');
  277 |     await page.waitForLoadState('domcontentloaded');
  278 |     await page.waitForTimeout(1000);
  279 | 
  280 |     // 2. Click Módulo 4 (Constructor de Soluciones)
  281 |     const modCards = page.locator('.f2-module-card');
  282 |     const mod4Card = modCards.nth(3); // 4th card (index 3)
  283 |     await expect(mod4Card).toBeVisible();
  284 |     await mod4Card.click();
  285 | 
  286 |     // 3. Click Level 1 to enter
  287 |     const lvl1Btn = page.locator('.f2-level-card').first();
  288 |     await expect(lvl1Btn).toBeVisible();
  289 |     await lvl1Btn.click();
  290 | 
  291 |     // 4. Handle Theory Modal if shown
  292 |     const theoryModal = page.locator('.f2-reading-overlay');
  293 |     await page.waitForTimeout(1500);
  294 |     if (await theoryModal.isVisible()) {
  295 |       while (await page.locator('button:has-text("Siguiente")').isVisible()) {
  296 |         await page.locator('button:has-text("Siguiente")').first().click();
  297 |         await page.waitForTimeout(300);
  298 |       }
  299 |       await page.locator('button:has-text("¡Entendido, empezar!")').first().click();
  300 |     }
  301 | 
  302 |     // 5. Dismiss Splash Screen
  303 |     const splash = page.locator('.f2-start-splash-overlay').first();
  304 |     await page.waitForTimeout(1500);
  305 |     if (await splash.isVisible()) {
  306 |       await splash.click();
  307 |     }
  308 | 
  309 |     // Wait for the first question to load (currentQuestionId becomes non-null)
  310 |     for (let i = 0; i < 50; i++) {
  311 |       if (currentQuestionId !== null) break;
  312 |       await page.waitForTimeout(100);
  313 |     }
  314 |     expect(currentQuestionId).not.toBeNull();
  315 | 
  316 |     // Verify Chained step UI is active for step 1
  317 |     await expect(page.locator('text=Paso 1:')).toBeVisible();
  318 | 
  319 |     const step1Answer = getChainedStepAnswer(currentQuestionId!, 1);
  320 |     console.log(`Submitting Step 1 answer: "${step1Answer}" for question ID: ${currentQuestionId}`);
  321 | 
  322 |     await page.locator('.f2-hidden-input').fill(step1Answer);
  323 |     await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();
  324 | 
  325 |     // Click continue on step 1 feedback
  326 |     const continueBtn1 = page.locator('.f2-submit-btn:has-text("Continuar")').first();
  327 |     await expect(continueBtn1).toBeVisible({ timeout: 5000 });
  328 |     await continueBtn1.click();
  329 | 
  330 |     // 7. Chained Question Step 2
  331 |     await page.waitForTimeout(1500);
  332 |     // Verify Step 2 is now visible and active
  333 |     await expect(page.locator('text=Paso 2:')).toBeVisible();
  334 | 
  335 |     const step2Answer = getChainedStepAnswer(currentQuestionId!, 2);
  336 |     console.log(`Submitting Step 2 answer: "${step2Answer}" for question ID: ${currentQuestionId}`);
  337 | 
  338 |     await page.locator('.f2-hidden-input').fill(step2Answer);
  339 |     await page.locator('.f2-submit-btn:has-text("Confirmar")').first().click();
  340 | 
  341 |     // Verify correct answer feedback UI displays green highlight for final step
  342 |     await expect(page.locator('.f2-custom-input-box.correct').first()).toBeVisible();
  343 |     console.log('Chained step 2 submitted successfully.');
  344 |   });
  345 | 
  346 |   test('Módulo 1 Desafío (Gimnasio Mental) - Salida Temprana (Early Exit) tras múltiples fallos', async ({ page }) => {
  347 |     // 1. Navigate to Phase 2 Welcome Hub
  348 |     await page.goto('/welcome-fase2');
  349 |     await page.waitForLoadState('domcontentloaded');
  350 |     await page.waitForTimeout(1000);
  351 | 
  352 |     // 2. Click Módulo 1 (Gimnasio Mental)
  353 |     const modCard = page.locator('.f2-module-card').first();
  354 |     await expect(modCard).toBeVisible();
  355 |     await modCard.click();
  356 | 
  357 |     // 3. Click Desafío 1 (Estándar) in the challenge zone
  358 |     const desafio1Btn = page.locator('.f2-challenge-bar-btn').first();
  359 |     await expect(desafio1Btn).toBeVisible();
  360 |     await desafio1Btn.click();
  361 | 
  362 |     // 4. Dismiss Splash Screen (Challenges always show the premium countdown splash)
```