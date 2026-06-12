# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-gameplay-fase4.spec.ts >> 08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo >> Módulo 1 Nivel 1 - Flujo Completo Optimizado
- Location: tests\08-gameplay-fase4.spec.ts:213:11

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
          - generic [ref=e20]: PROGRESO 6/15
    - main [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - img [ref=e27]
          - generic [ref=e37]: 0/5
          - generic [ref=e38]:
            - generic [ref=e39]: "SOMBREA EXACTAMENTE LA FRACCIÓN:"
            - generic [ref=e40]: 3/5
        - generic [ref=e41]:
          - button "CONFIRMAR ✓" [ref=e42] [cursor=pointer]:
            - generic [ref=e44]: CONFIRMAR
            - generic [ref=e46]: ✓
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]: CORRECTAS
              - text: "6"
            - generic [ref=e50]:
              - generic [ref=e51]: ERRORES
              - text: "9"
  - button "Alternar Tema Claro/Oscuro" [ref=e52] [cursor=pointer]:
    - img [ref=e54]
```

# Test source

```ts
  146 |     const wrongText = execSync(cmd).toString().trim();
  147 |     await page.locator(`button:has-text("${wrongText}")`).first().click();
  148 |   } else {
  149 |     const answer = getCorrectAnswer(questionId);
  150 |     
  151 |     const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
  152 |     if (await confirmBtn.isVisible()) {
  153 |       if (answer.includes('/')) {
  154 |         await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
  155 |         await page.waitForTimeout(300);
  156 |       } else {
  157 |         const hint = page.locator('text=👉 ¡TÓCAME!').first();
  158 |         if (await hint.isVisible()) {
  159 |           await hint.click();
  160 |           await page.waitForTimeout(200);
  161 |         }
  162 |         const wrongOption = answer === '10' ? '20%' : '10%';
  163 |         await page.locator(`button:has-text("${wrongOption}")`).first().click();
  164 |         await page.waitForTimeout(200);
  165 |       }
  166 |       await confirmBtn.click();
  167 |     } else {
  168 |       if (answer.includes('/')) {
  169 |         await page.locator(`button:has-text("9")`).last().click();
  170 |         await page.locator('input[placeholder="?"]').last().click();
  171 |         await page.locator(`button:has-text("9")`).last().click();
  172 |       } else {
  173 |         for (let i = 0; i < 4; i++) {
  174 |           await page.locator(`button:has-text("9")`).last().click();
  175 |           await page.waitForTimeout(50);
  176 |         }
  177 |       }
  178 |       await page.waitForTimeout(300);
  179 |       await page.getByTestId('submit-numpad').click();
  180 |     }
  181 |   }
  182 | }
  183 | 
  184 | const metadata = getPhaseMetadata(4);
  185 | 
  186 | test.describe('08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo', () => {
  187 |   let currentQuestionId: number | null = null;
  188 |   let testUserEmail: string;
  189 | 
  190 |   test.beforeEach(async ({ page }) => {
  191 |     currentQuestionId = null;
  192 |     testUserEmail = await registerDynamicTestUser(page);
  193 |     setPhaseForUser(testUserEmail, 4);
  194 |     clearTestUserProgress(testUserEmail);
  195 | 
  196 |     page.on('response', async (response) => {
  197 |       if (
  198 |         response.url().includes('/api/fase4/modulo/') &&
  199 |         response.url().includes('/pregunta')
  200 |       ) {
  201 |         try {
  202 |           const json = await response.json();
  203 |           if (json && json.id) {
  204 |             currentQuestionId = json.id;
  205 |           }
  206 |         } catch (e) {}
  207 |       }
  208 |     });
  209 |   });
  210 | 
  211 |   for (const modulo of metadata.modulos) {
  212 |     for (const nivel of modulo.niveles) {
  213 |       test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
  214 |         unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
  215 |         for (let l = 1; l < nivel.nivel_id; l++) {
  216 |            approveProgresoMaestria(testUserEmail, 4, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
  217 |         }
  218 | 
  219 |         await page.goto('/welcome-fase4');
  220 |         await page.waitForLoadState('domcontentloaded');
  221 |         await page.waitForTimeout(1000);
  222 | 
  223 |         const modCards = page.locator('.f4-module-card-item');
  224 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  225 |         await expect(modCard).toBeVisible();
  226 |         await modCard.click();
  227 | 
  228 |         const lvlBtn = page.locator('.f4-level-card-item').nth(nivel.nivel_id - 1);
  229 |         await expect(lvlBtn).toBeVisible();
  230 |         await lvlBtn.click();
  231 | 
  232 |         await navigateGenericTheoryModal(page, FASE4_THEORY_ANSWERS, 'f4');
  233 | 
  234 |         const splash = page.locator('.f4-start-splash-overlay').first();
  235 |         if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
  236 |           await splash.click();
  237 |           await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  238 |         }
  239 | 
  240 |         let errorsForced = 0;
  241 |         const maxErrors = 4;
  242 |         let questionCounter = 0;
  243 |         const maxQuestionsSafety = 30; 
  244 | 
  245 |         while (questionCounter < maxQuestionsSafety) {
> 246 |           await page.waitForTimeout(2000);
      |                      ^ Error: page.waitForTimeout: Test timeout of 120000ms exceeded.
  247 |           
  248 |           const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
  249 |           if (await endScreen.isVisible().catch(()=>false)) {
  250 |              break;
  251 |           }
  252 | 
  253 |           if (currentQuestionId === null) {
  254 |             const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
  255 |             if (await continueBtn.isVisible().catch(()=>false)) {
  256 |               await continueBtn.click();
  257 |             }
  258 |             continue;
  259 |           }
  260 | 
  261 |           const qId = currentQuestionId;
  262 |           
  263 |           if (errorsForced < maxErrors && questionCounter % 3 === 1) {
  264 |             await failCurrentQuestion(page, qId);
  265 |             errorsForced++;
  266 |             
  267 |             await page.waitForTimeout(1500);
  268 |             const continueBtnWrong = page.locator('button:has-text("Continuar →"), button:has-text("Continuar")').first();
  269 |             if (await continueBtnWrong.isVisible({ timeout: 5000 }).catch(()=>false)) {
  270 |               await continueBtnWrong.click();
  271 |             }
  272 | 
  273 |             await page.waitForTimeout(1500);
  274 |             if (currentQuestionId) {
  275 |                await submitCorrectAnswer(page, currentQuestionId);
  276 |                currentQuestionId = null;
  277 |             }
  278 |           } else {
  279 |             await submitCorrectAnswer(page, qId);
  280 |             currentQuestionId = null;
  281 |           }
  282 | 
  283 |           await page.waitForTimeout(1000);
  284 |           const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
  285 |           if (await nextBtn.isVisible().catch(()=>false)) {
  286 |             await nextBtn.click();
  287 |             currentQuestionId = null;
  288 |           }
  289 | 
  290 |           questionCounter++;
  291 |         }
  292 |       });
  293 |     }
  294 | 
  295 |     for (const desafio of modulo.desafios) {
  296 |       test(`Módulo ${modulo.modulo_id} Desafío ${desafio.seccion} - Salida Temprana`, async ({ page }) => {
  297 |         unlockAllUpToModule(testUserEmail, 4, modulo.modulo_id);
  298 |         for (const n of modulo.niveles) {
  299 |            approveProgresoMaestria(testUserEmail, 4, n.seccion, 'MIXTA');
  300 |         }
  301 |         for (const d of modulo.desafios) {
  302 |            if (d.nivel_id < desafio.nivel_id) {
  303 |               approveProgresoMaestria(testUserEmail, 4, d.seccion, 'MIXTA');
  304 |            }
  305 |         }
  306 | 
  307 |         await page.goto('/welcome-fase4');
  308 |         await page.waitForLoadState('domcontentloaded');
  309 |         await page.waitForTimeout(1000);
  310 | 
  311 |         const modCards = page.locator('.f4-module-card-item');
  312 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  313 |         await expect(modCard).toBeVisible();
  314 |         await modCard.click();
  315 | 
  316 |         const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
  317 |         const desafioBtn = page.locator('.f4-challenge-bar-btn, .f4-challenge-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
  318 |         
  319 |         if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
  320 |             await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
  321 |             await desafioBtn.click();
  322 | 
  323 |             const splash = page.locator('.f4-start-splash-overlay').first();
  324 |             if (await splash.isVisible({ timeout: 5000 }).catch(()=>false)) {
  325 |                 await splash.click();
  326 |                 await splash.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  327 |             }
  328 | 
  329 |             for (let attempts = 0; attempts < 5; attempts++) {
  330 |               await page.waitForTimeout(1500);
  331 |               if (currentQuestionId === null) continue;
  332 |               
  333 |               await failCurrentQuestion(page, currentQuestionId!);
  334 | 
  335 |               const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Siguiente Pregunta →")').first();
  336 |               if (await continueBtn.isVisible().catch(()=>false)) {
  337 |                 await continueBtn.click();
  338 |               }
  339 |               
  340 |               const earlyExitModal = page.locator('.f4-feedback-card.early-exit, .early-exit-modal');
  341 |               if (await earlyExitModal.isVisible({ timeout: 2000 }).catch(()=>false)) {
  342 |                   const exitBtn = earlyExitModal.locator('button:has-text("Entendido"), button:has-text("Salir")').first();
  343 |                   if (await exitBtn.isVisible()) await exitBtn.click();
  344 |                   break;
  345 |               }
  346 |             }
```