# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-gameplay-fase4.spec.ts >> 08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo >> Módulo 1 Nivel 1 - Flujo Completo Optimizado
- Location: tests\08-gameplay-fase4.spec.ts:215:11

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 120000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e8]: Cargando misión...
  - button "Alternar Tema Claro/Oscuro" [ref=e9] [cursor=pointer]:
    - img [ref=e11]
```

# Test source

```ts
  148 |   } else {
  149 |     const answer = getCorrectAnswer(questionId);
  150 |     
  151 |     const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
  152 |     if (await confirmBtn.isVisible()) {
  153 |       if (answer.includes('/')) {
  154 |         await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
  155 |         await page.waitForTimeout(100);
  156 |         await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
  157 |         await page.waitForTimeout(300);
  158 |       } else {
  159 |         const hint = page.locator('text=👉 ¡TÓCAME!').first();
  160 |         if (await hint.isVisible()) {
  161 |           await hint.click({ force: true });
  162 |           await page.waitForTimeout(200);
  163 |         }
  164 |         const wrongOption = answer === '10' ? '20%' : '10%';
  165 |         await page.locator(`button:has-text("${wrongOption}")`).first().click();
  166 |         await page.waitForTimeout(200);
  167 |       }
  168 |       await confirmBtn.click();
  169 |     } else {
  170 |       if (answer.includes('/')) {
  171 |         await page.locator(`button:has-text("9")`).last().click();
  172 |         await page.locator('input[placeholder="?"]').last().click();
  173 |         await page.locator(`button:has-text("9")`).last().click();
  174 |       } else {
  175 |         for (let i = 0; i < 4; i++) {
  176 |           await page.locator(`button:has-text("9")`).last().click();
  177 |           await page.waitForTimeout(50);
  178 |         }
  179 |       }
  180 |       await page.waitForTimeout(300);
  181 |       await page.getByTestId('submit-numpad').click();
  182 |     }
  183 |   }
  184 | }
  185 | 
  186 | const metadata = getPhaseMetadata(4);
  187 | 
  188 | test.describe('08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo', () => {
  189 |   let currentQuestionId: number | null = null;
  190 |   let testUserEmail: string;
  191 | 
  192 |   test.beforeEach(async ({ page }) => {
  193 |     currentQuestionId = null;
  194 |     testUserEmail = await registerDynamicTestUser(page);
  195 |     setPhaseForUser(testUserEmail, 4);
  196 |     clearTestUserProgress(testUserEmail);
  197 | 
  198 |     page.on('response', async (response) => {
  199 |       if (
  200 |         response.url().includes('/api/fase4/modulo/') &&
  201 |         response.url().includes('/pregunta')
  202 |       ) {
  203 |         try {
  204 |           const json = await response.json();
  205 |           if (json && json.id) {
  206 |             currentQuestionId = json.id;
  207 |           }
  208 |         } catch (e) {}
  209 |       }
  210 |     });
  211 |   });
  212 | 
  213 |   for (const modulo of metadata.modulos) {
  214 |     for (const nivel of modulo.niveles) {
  215 |       test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
  216 |         unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
  217 |         for (let l = 1; l < nivel.nivel_id; l++) {
  218 |            approveProgresoMaestria(testUserEmail, 4, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
  219 |         }
  220 | 
  221 |         await page.goto('/welcome-fase4');
  222 |         await page.waitForLoadState('domcontentloaded');
  223 |         await page.waitForTimeout(1000);
  224 | 
  225 |         const modCards = page.locator('.f4-module-card-item');
  226 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  227 |         await expect(modCard).toBeVisible();
  228 |         await modCard.click();
  229 | 
  230 |         const lvlBtn = page.locator('.f4-level-card-item').nth(nivel.nivel_id - 1);
  231 |         await expect(lvlBtn).toBeVisible();
  232 |         await lvlBtn.click();
  233 | 
  234 |         await navigateGenericTheoryModal(page, FASE4_THEORY_ANSWERS, 'f4');
  235 | 
  236 |         const splash = page.locator('.f4-start-splash-overlay').first();
  237 |         if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
  238 |           await splash.click();
  239 |           await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  240 |         }
  241 | 
  242 |         let errorsForced = 0;
  243 |         const maxErrors = 4;
  244 |         let questionCounter = 0;
  245 |         const maxQuestionsSafety = 30; 
  246 | 
  247 |         while (questionCounter < maxQuestionsSafety) {
> 248 |           await page.waitForTimeout(2000);
      |                      ^ Error: page.waitForTimeout: Test timeout of 120000ms exceeded.
  249 |           
  250 |           const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
  251 |           if (await endScreen.isVisible().catch(()=>false)) {
  252 |              break;
  253 |           }
  254 | 
  255 |           if (currentQuestionId === null) {
  256 |             const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
  257 |             if (await continueBtn.isVisible().catch(()=>false)) {
  258 |               await continueBtn.click();
  259 |             }
  260 |             continue;
  261 |           }
  262 | 
  263 |           const qId = currentQuestionId;
  264 |           
  265 |           if (errorsForced < maxErrors && questionCounter % 3 === 1) {
  266 |             await failCurrentQuestion(page, qId);
  267 |             errorsForced++;
  268 |             
  269 |             await page.waitForTimeout(1500);
  270 |             const continueBtnWrong = page.locator('button:has-text("Continuar →"), button:has-text("Continuar")').first();
  271 |             if (await continueBtnWrong.isVisible({ timeout: 5000 }).catch(()=>false)) {
  272 |               await continueBtnWrong.click();
  273 |             }
  274 | 
  275 |             await page.waitForTimeout(1500);
  276 |             if (currentQuestionId) {
  277 |                await submitCorrectAnswer(page, currentQuestionId);
  278 |                currentQuestionId = null;
  279 |             }
  280 |           } else {
  281 |             await submitCorrectAnswer(page, qId);
  282 |             currentQuestionId = null;
  283 |           }
  284 | 
  285 |           await page.waitForTimeout(1000);
  286 |           const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
  287 |           if (await nextBtn.isVisible().catch(()=>false)) {
  288 |             await nextBtn.click();
  289 |             currentQuestionId = null;
  290 |           }
  291 | 
  292 |           questionCounter++;
  293 |         }
  294 |       });
  295 |     }
  296 | 
  297 |     for (const desafio of modulo.desafios) {
  298 |       test(`Módulo ${modulo.modulo_id} Desafío ${desafio.seccion} - Salida Temprana`, async ({ page }) => {
  299 |         unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
  300 |         for (const n of modulo.niveles) {
  301 |            approveProgresoMaestria(testUserEmail, 4, n.seccion, 'MIXTA');
  302 |         }
  303 |         for (const d of modulo.desafios) {
  304 |            if (d.nivel_id < desafio.nivel_id) {
  305 |               approveProgresoMaestria(testUserEmail, 4, d.seccion, 'MIXTA');
  306 |            }
  307 |         }
  308 | 
  309 |         await page.goto('/welcome-fase4');
  310 |         await page.waitForLoadState('domcontentloaded');
  311 |         await page.waitForTimeout(1000);
  312 | 
  313 |         const modCards = page.locator('.f4-module-card-item');
  314 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  315 |         await expect(modCard).toBeVisible();
  316 |         await modCard.click();
  317 | 
  318 |         const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
  319 |         const desafioBtn = page.locator('.f4-challenge-bar-btn, .f4-challenge-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
  320 |         
  321 |         if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
  322 |             await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
  323 |             await desafioBtn.click();
  324 | 
  325 |             const splash = page.locator('.f4-start-splash-overlay').first();
  326 |             if (await splash.isVisible({ timeout: 5000 }).catch(()=>false)) {
  327 |                 await splash.click();
  328 |                 await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  329 |             }
  330 | 
  331 |             for (let attempts = 0; attempts < 5; attempts++) {
  332 |               await page.waitForTimeout(1500);
  333 |               if (currentQuestionId === null) continue;
  334 |               
  335 |               await failCurrentQuestion(page, currentQuestionId!);
  336 | 
  337 |               const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Siguiente Pregunta →")').first();
  338 |               if (await continueBtn.isVisible().catch(()=>false)) {
  339 |                 await continueBtn.click();
  340 |               }
  341 |               
  342 |               const earlyExitModal = page.locator('.f4-feedback-card.early-exit, .early-exit-modal');
  343 |               if (await earlyExitModal.isVisible({ timeout: 2000 }).catch(()=>false)) {
  344 |                   const exitBtn = earlyExitModal.locator('button:has-text("Entendido"), button:has-text("Salir")').first();
  345 |                   if (await exitBtn.isVisible()) await exitBtn.click();
  346 |                   break;
  347 |               }
  348 |             }
```