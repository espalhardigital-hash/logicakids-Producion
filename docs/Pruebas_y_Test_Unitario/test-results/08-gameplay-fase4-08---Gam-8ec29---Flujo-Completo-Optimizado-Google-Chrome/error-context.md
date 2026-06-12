# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-gameplay-fase4.spec.ts >> 08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo >> Módulo 1 Nivel 1 - Flujo Completo Optimizado
- Location: tests\08-gameplay-fase4.spec.ts:350:11

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button:has-text("CONFIRMAR")').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - button [ref=e7] [cursor=pointer]:
        - img [ref=e8]
      - generic [ref=e10]:
        - button "TEORÍA" [ref=e11] [cursor=pointer]:
          - img [ref=e12]
          - generic [ref=e14]: TEORÍA
        - generic [ref=e15]:
          - generic [ref=e16]: LA FRACCIÓN VISUAL
          - generic [ref=e17]: "|"
          - generic [ref=e18]: FASE 4
          - generic [ref=e19]: "|"
          - generic [ref=e20]: PROGRESO 2/15
    - main [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - img [ref=e27]
          - paragraph [ref=e42]: Identifica qué fracción representa la parte pintada de la pizza en la ilustración.
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]:
              - textbox "?" [ref=e46]
              - textbox "?" [ref=e48]
            - generic [ref=e49]:
              - generic [ref=e50]:
                - button "7" [ref=e51] [cursor=pointer]
                - button "8" [ref=e52] [cursor=pointer]
                - button "9" [ref=e53] [cursor=pointer]
                - button "4" [ref=e54] [cursor=pointer]
                - button "5" [ref=e55] [cursor=pointer]
                - button "6" [ref=e56] [cursor=pointer]
                - button "1" [ref=e57] [cursor=pointer]
                - button "2" [ref=e58] [cursor=pointer]
                - button "3" [ref=e59] [cursor=pointer]
                - button [ref=e60] [cursor=pointer]:
                  - img [ref=e61]
                - button "0" [ref=e65] [cursor=pointer]
                - button [disabled] [ref=e66]:
                  - img [ref=e67]
              - generic [ref=e69]: Teclado Numérico
          - generic [ref=e70]:
            - generic [ref=e71]:
              - generic [ref=e72]: CORRECTAS
              - text: "2"
            - generic [ref=e73]:
              - generic [ref=e74]: ERRORES
              - text: "3"
  - button "Alternar Tema Claro/Oscuro" [ref=e75] [cursor=pointer]:
    - img [ref=e77]
```

# Test source

```ts
  188 |         if (answer === '25') label = '1/4 (25%)';
  189 |         else if (answer === '50') label = '1/2 (50%)';
  190 |         
  191 |         await page.locator(`button:has-text("${label}")`).first().click();
  192 |         await page.waitForTimeout(200);
  193 |       }
  194 |       await page.waitForTimeout(300); // Wait for React state to propagate
  195 |       await confirmBtn.click();
  196 |     } else {
  197 |       if (answer.includes('/')) {
  198 |         const [num, den] = answer.split('/');
  199 |         
  200 |         for (const char of num) {
  201 |           await page.locator(`button:has-text("${char}")`).last().click();
  202 |           await page.waitForTimeout(50);
  203 |         }
  204 |         
  205 |         await page.locator('.f4-fraction-input-field').nth(1).click();
  206 |         await page.waitForTimeout(100);
  207 |         
  208 |         for (const char of den) {
  209 |           await page.locator(`button:has-text("${char}")`).last().click();
  210 |           await page.waitForTimeout(50);
  211 |         }
  212 |       } else {
  213 |         const beakerSegments = page.locator('.flex-col-reverse > div');
  214 |         let beakerClicked = false;
  215 |         if (isQuestionBeakerInteractive(questionId) && await beakerSegments.count() > 0) {
  216 |           const level = getBeakerCorrectLevel(questionId);
  217 |           if (level > 0 && level <= await beakerSegments.count()) {
  218 |             await beakerSegments.nth(level - 1).click({ force: true });
  219 |             await page.waitForTimeout(200);
  220 |             beakerClicked = true;
  221 |           }
  222 |         }
  223 | 
  224 |         if (!beakerClicked) {
  225 |           for (const char of answer) {
  226 |             await page.locator(`button:has-text("${char}")`).last().click();
  227 |             await page.waitForTimeout(50);
  228 |           }
  229 |         }
  230 |       }
  231 |       await page.waitForTimeout(300);
  232 |       await page.getByTestId('submit-numpad').click();
  233 |     }
  234 |   }
  235 | }
  236 | 
  237 | async function failCurrentQuestion(page: any, questionId: number) {
  238 |   const answer = getCorrectAnswer(questionId);
  239 |   const enunciado = getQuestionEnunciado(questionId);
  240 |   if (answer.includes('/')) {
  241 |     await page.locator(`text=${answer}`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  242 |   } else if (enunciado) {
  243 |     const cleanText = enunciado.replace(/\[ESPEJO\]/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30);
  244 |     if (cleanText) {
  245 |       await page.locator(`text=${cleanText}`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  246 |     }
  247 |   }
  248 |   await page.waitForTimeout(200);
  249 | 
  250 |   const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  251 |   const tipo = execSync(typeCmd).toString().trim();
  252 |   const isMultipleOption = tipo === 'MULTIPLE_OPCION';
  253 |   const isInteractive = isQuestionInteractiveLayout(questionId);
  254 | 
  255 |   // Wait for layout to be ready
  256 |   await waitForLayoutReady(page, isInteractive, isMultipleOption);
  257 | 
  258 |   if (isMultipleOption) {
  259 |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
  260 |     const wrongText = execSync(cmd).toString().trim();
  261 |     await page.locator(`button:has-text("${wrongText}")`).first().click();
  262 |   } else {
  263 |     if (isInteractive) {
  264 |       const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
  265 |       if (answer.includes('/')) {
  266 |         const [_, den] = answer.split('/');
  267 |         const denominator = parseInt(den, 10);
  268 |         const paths = page.locator('path[stroke="rgba(255,255,255,0.15)"]');
  269 |         let retries = 0;
  270 |         while (await paths.count() !== denominator && retries < 30) {
  271 |           await page.waitForTimeout(100);
  272 |           retries++;
  273 |         }
  274 |         await paths.first().click({ force: true });
  275 |         await page.waitForTimeout(100);
  276 |         await paths.first().click({ force: true });
  277 |         await page.waitForTimeout(300);
  278 |       } else {
  279 |         const hint = page.locator('text=👉 ¡TÓCAME!').first();
  280 |         if (await hint.isVisible()) {
  281 |           await hint.click({ force: true });
  282 |           await page.waitForTimeout(200);
  283 |         }
  284 |         const wrongOption = answer === '10' ? '20%' : '10%';
  285 |         await page.locator(`button:has-text("${wrongOption}")`).first().click();
  286 |         await page.waitForTimeout(200);
  287 |       }
> 288 |       await confirmBtn.click();
      |                        ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  289 |     } else {
  290 |       const beakerSegments = page.locator('.flex-col-reverse > div');
  291 |       let beakerClicked = false;
  292 |       if (isQuestionBeakerInteractive(questionId) && await beakerSegments.count() > 0) {
  293 |         const level = getBeakerCorrectLevel(questionId);
  294 |         const wrongLevel = level === 1 ? 2 : 1;
  295 |         if (wrongLevel <= await beakerSegments.count()) {
  296 |           await beakerSegments.nth(wrongLevel - 1).click({ force: true });
  297 |           await page.waitForTimeout(200);
  298 |           beakerClicked = true;
  299 |         }
  300 |       }
  301 | 
  302 |       if (!beakerClicked) {
  303 |         if (answer.includes('/')) {
  304 |           await page.locator(`button:has-text("9")`).last().click();
  305 |           await page.locator('.f4-fraction-input-field').nth(1).click();
  306 |           await page.locator(`button:has-text("9")`).last().click();
  307 |         } else {
  308 |           for (let i = 0; i < 4; i++) {
  309 |             await page.locator(`button:has-text("9")`).last().click();
  310 |             await page.waitForTimeout(50);
  311 |           }
  312 |         }
  313 |       }
  314 |       await page.waitForTimeout(300);
  315 |       await page.getByTestId('submit-numpad').click();
  316 |     }
  317 |   }
  318 | }
  319 | 
  320 | const metadata = getPhaseMetadata(4);
  321 | 
  322 | test.describe('08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo', () => {
  323 |   let currentQuestionId: number | null = null;
  324 |   let testUserEmail: string;
  325 | 
  326 |   test.beforeEach(async ({ page }) => {
  327 |     test.setTimeout(240000);
  328 |     currentQuestionId = null;
  329 |     testUserEmail = await registerDynamicTestUser(page);
  330 |     setPhaseForUser(testUserEmail, 4);
  331 |     clearTestUserProgress(testUserEmail);
  332 | 
  333 |     page.on('response', async (response) => {
  334 |       if (
  335 |         response.url().includes('/api/fase4/modulo/') &&
  336 |         response.url().includes('/pregunta')
  337 |       ) {
  338 |         try {
  339 |           const json = await response.json();
  340 |           if (json && json.id) {
  341 |             currentQuestionId = json.id;
  342 |           }
  343 |         } catch (e) {}
  344 |       }
  345 |     });
  346 |   });
  347 | 
  348 |   for (const modulo of metadata.modulos) {
  349 |     for (const nivel of modulo.niveles) {
  350 |       test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
  351 |         unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
  352 |         for (let l = 1; l < nivel.nivel_id; l++) {
  353 |            approveProgresoMaestria(testUserEmail, 4, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
  354 |         }
  355 | 
  356 |         await page.goto('/welcome-fase4');
  357 |         await page.waitForLoadState('domcontentloaded');
  358 |         await page.waitForTimeout(1000);
  359 | 
  360 |         const modCards = page.locator('.f4-module-card-item');
  361 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  362 |         await expect(modCard).toBeVisible();
  363 |         await modCard.click();
  364 | 
  365 |         const lvlBtn = page.locator('.f4-level-card-item').nth(nivel.nivel_id - 1);
  366 |         await expect(lvlBtn).toBeVisible();
  367 |         await lvlBtn.click();
  368 | 
  369 |         await navigateGenericTheoryModal(page, FASE4_THEORY_ANSWERS, 'f4');
  370 | 
  371 |         const splash = page.locator('.f4-start-splash-overlay').first();
  372 |         if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
  373 |           await splash.click();
  374 |           await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  375 |         }
  376 | 
  377 |         let errorsForced = 0;
  378 |         const maxErrors = 4;
  379 |         let questionCounter = 0;
  380 |         const maxQuestionsSafety = 30; 
  381 |         const answeredQuestionIds = new Set<number>();
  382 | 
  383 |         while (questionCounter < maxQuestionsSafety) {
  384 |           await page.waitForTimeout(500);
  385 |           
  386 |           const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
  387 |           if (await endScreen.isVisible().catch(()=>false)) {
  388 |              break;
```