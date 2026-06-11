# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-gameplay-fase2.spec.ts >> 06 - Gameplay Fase 2 (Aritmética Intermedia) - Exhaustivo >> Módulo 4 Nivel 3 - Flujo Completo Optimizado
- Location: tests\06-gameplay-fase2.spec.ts:168:11

# Error details

```
Test timeout of 300000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 300000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - button "Salir del nivel" [ref=e7] [cursor=pointer]:
        - img [ref=e8]
      - generic [ref=e10]:
        - button "Teoría" [ref=e11] [cursor=pointer]:
          - img [ref=e12]
          - generic [ref=e14]: Teoría
        - generic [ref=e15]:
          - generic [ref=e16]: CONSTRUCTOR DE SOLUCIONES
          - generic [ref=e17]: "|"
          - generic [ref=e18]: FASE 2
          - generic [ref=e19]: "|"
          - generic [ref=e20]: MÓDULO 4
          - generic [ref=e21]: "|"
          - generic [ref=e22]: NIVEL 3
          - generic [ref=e23]: "|"
          - generic [ref=e24]: PROGRESO 0/15
    - main [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e29]:
          - generic [ref=e31]: Enzo tenía 24 muffins en una caja y también vio 5 libros viejos. Si perdió 4 muffins, y luego su hermano mayor le duplica la cantidad restante.
          - generic [ref=e33]:
            - generic [ref=e35]: "Paso 1: Paso 1"
            - paragraph [ref=e36]: ¿Cuántos muffins le quedaron después de que perdió los primeros?
            - generic [ref=e37] [cursor=pointer]:
              - textbox [active] [ref=e38]
              - generic [ref=e39]: "?"
          - button "Confirmar" [disabled] [ref=e40]
          - generic [ref=e41]:
            - generic [ref=e42]:
              - generic [ref=e43]: CORRECTAS
              - generic [ref=e44]: "0"
            - generic [ref=e45]:
              - generic [ref=e46]: ERRORES
              - generic [ref=e47]: "1"
        - generic [ref=e49]:
          - generic [ref=e50]:
            - button "7" [ref=e51]
            - button "8" [ref=e52]
            - button "9" [ref=e53]
            - button "4" [ref=e54]
            - button "5" [ref=e55]
            - button "6" [ref=e56]
            - button "1" [ref=e57]
            - button "2" [ref=e58]
            - button "3" [ref=e59]
            - button "." [ref=e60]
            - button "0" [ref=e61]
            - button [ref=e62]:
              - img [ref=e63]
          - button "Confirmar" [disabled] [ref=e67]:
            - text: Confirmar
            - img [ref=e68]
  - button "Alternar Tema Claro/Oscuro" [ref=e70] [cursor=pointer]:
    - img [ref=e72]
```

# Test source

```ts
  102 |     if (await hiddenInput.count() > 0) {
  103 |       await hiddenInput.fill(answer);
  104 |       await page.keyboard.press('Enter');
  105 |     } else {
  106 |       for (const char of answer) {
  107 |         console.log(`[Q:${questionId}] Typing char: "${char}"`);
  108 |         await page.locator('button').filter({ hasText: new RegExp(`^${char}$`) }).last().click({ timeout: 5000 });
  109 |         await page.waitForTimeout(50);
  110 |       }
  111 |       await page.waitForTimeout(300); // Evitar pregunta espejo
  112 |       await page.locator('button:has-text("Confirmar"), button.bg-blue-600').last().click({ timeout: 5000 });
  113 |     }
  114 |   }
  115 | }
  116 | 
  117 | async function failCurrentQuestion(page: any, questionId: number) {
  118 |   const psqlBase = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
  119 |   const tipo = execSync(psqlBase, { input: `SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId};` }).toString().trim();
  120 | 
  121 |   if (tipo === 'MULTIPLE_OPCION') {
  122 |     const wrongText = execSync(psqlBase, { input: `SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1;` }).toString().trim();
  123 |     console.log(`[Q:${questionId}] MULTIPLE_OPCION (FAIL) -> WrongText: "${wrongText}"`);
  124 |     await page.locator(`button:has-text("${wrongText}")`).first().click({ timeout: 5000 });
  125 |     await page.waitForTimeout(300); // Evitar pregunta espejo
  126 |     await page.locator('button:has-text("Confirmar")').first().click({ timeout: 5000 });
  127 |   } else {
  128 |     const hiddenInput = page.locator('input.f2-hidden-input').first();
  129 |     if (await hiddenInput.count() > 0) {
  130 |       await hiddenInput.fill('9999');
  131 |       await page.keyboard.press('Enter');
  132 |     } else {
  133 |       console.log(`[Q:${questionId}] INTERACTIVA (FAIL) -> Forcing '9999'`);
  134 |       for (let i = 0; i < 4; i++) {
  135 |         await page.locator('button').filter({ hasText: new RegExp(`^9$`) }).last().click({ timeout: 5000 });
  136 |         await page.waitForTimeout(50);
  137 |       }
  138 |       await page.waitForTimeout(300); // Evitar pregunta espejo
  139 |       await page.locator('button:has-text("Confirmar"), button.bg-blue-600').last().click({ timeout: 5000 });
  140 |     }
  141 |   }
  142 | }
  143 | 
  144 | const metadata = getPhaseMetadata(2);
  145 | 
  146 | test.describe('06 - Gameplay Fase 2 (Aritmética Intermedia) - Exhaustivo', () => {
  147 |   let currentQuestionId: number | null = null;
  148 |   let testUserEmail: string;
  149 | 
  150 |   test.beforeEach(async ({ page }) => {
  151 |     currentQuestionId = null;
  152 |     testUserEmail = await registerDynamicTestUser(page);
  153 |     setPhaseForUser(testUserEmail, 2);
  154 |     clearTestUserProgress(testUserEmail);
  155 | 
  156 |     page.on('response', async (response) => {
  157 |       if (
  158 |         response.url().includes('/api/fase2/modulo/') &&
  159 |         response.url().includes('/pregunta')
  160 |       ) {
  161 |         try {
  162 |           const json = await response.json();
  163 |           if (json && json.id) {
  164 |             currentQuestionId = json.id;
  165 |           }
  166 |         } catch (e) {}
  167 |       }
  168 |     });
  169 |   });
  170 | 
  171 |   for (const modulo of metadata.modulos) {
  172 |     for (const nivel of modulo.niveles) {
  173 |       test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
  174 |         test.setTimeout(300000); // Timeout amplio para entorno local/Docker
  175 |         unlockAllUpToModule(testUserEmail, 2, modulo.modulo_id);
  176 |         
  177 |         for (let l = 1; l < nivel.nivel_id; l++) {
  178 |            approveProgresoMaestria(testUserEmail, 2, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
  179 |         }
  180 | 
  181 |         await page.goto('/welcome-fase2');
  182 |         await page.waitForLoadState('domcontentloaded');
  183 |         await page.waitForTimeout(1000);
  184 | 
  185 |         const modCards = page.locator('.f2-module-card');
  186 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  187 |         await expect(modCard).toBeVisible();
  188 |         await modCard.click();
  189 | 
  190 |         const lvlBtn = page.locator('.f2-level-card').nth(nivel.nivel_id - 1);
  191 |         await expect(lvlBtn).toBeVisible();
  192 |         await lvlBtn.click();
  193 | 
  194 |         await navigateGenericTheoryModal(page, FASE2_THEORY_ANSWERS, 'f2');
  195 | 
  196 |         const splash = page.locator('.f2-start-splash-overlay').first();
  197 |         if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
  198 |           await splash.click();
  199 |         }
  200 | 
  201 |         let errorsForced = 0;
> 202 |         const maxErrors = 4;
      |                      ^ Error: page.waitForTimeout: Test timeout of 300000ms exceeded.
  203 |         let questionCounter = 0;
  204 |         const maxQuestionsSafety = 30; // Evitar bucles infinitos
  205 | 
  206 |         while (questionCounter < maxQuestionsSafety) {
  207 |           await page.waitForTimeout(1000);
  208 |           
  209 |           // Verificar si terminamos el nivel
  210 |           const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
  211 |           if (await endScreen.isVisible().catch(()=>false)) {
  212 |              console.log('Nivel completado con éxito.');
  213 |              break;
  214 |           }
  215 | 
  216 |           if (currentQuestionId === null) {
  217 |             // Check if there's a continue button
  218 |             const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
  219 |             if (await continueBtn.isVisible().catch(()=>false)) {
  220 |               await continueBtn.click();
  221 |             }
  222 |             continue;
  223 |           }
  224 | 
  225 |           const qId = currentQuestionId;
  226 |           
  227 |           // Forzamos error solo en algunas preguntas impares y si no superamos el límite
  228 |           if (errorsForced < maxErrors && questionCounter % 3 === 1) {
  229 |             await failCurrentQuestion(page, qId);
  230 |             errorsForced++;
  231 |             await page.waitForTimeout(1500);
  232 | 
  233 |             // Manejar la pantalla de error (Intentar de nuevo)
  234 |             const continueBtnWrong = page.locator('button:has-text("Intentar de nuevo ↺"), button:has-text("Continuar")').first();
  235 |             if (await continueBtnWrong.isVisible({ timeout: 3000 }).catch(()=>false)) {
  236 |                await continueBtnWrong.click();
  237 |             }
  238 | 
  239 |             await page.waitForTimeout(1500);
  240 |             if (currentQuestionId) {
  241 |                await submitCorrectAnswer(page, currentQuestionId);
  242 |             }
  243 |           } else {
  244 |             await submitCorrectAnswer(page, qId);
  245 |           }
  246 | 
  247 |           // Clic en Siguiente después de acertar
  248 |           await page.waitForTimeout(1000);
  249 |           const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
  250 |           if (await nextBtn.isVisible().catch(()=>false)) {
  251 |             await nextBtn.click();
  252 |             currentQuestionId = null; // resetear para esperar la proxima request
  253 |           }
  254 | 
  255 |           questionCounter++;
  256 |         }
  257 |       });
  258 |     }
  259 | 
  260 |     for (const desafio of modulo.desafios) {
  261 |       test(`Módulo ${modulo.modulo_id} Desafío ${desafio.seccion} - Salida Temprana`, async ({ page }) => {
  262 |         test.setTimeout(300000); // Timeout amplio para entorno local/Docker
  263 |         unlockAllUpToModule(testUserEmail, 2, modulo.modulo_id);
  264 |         for (const n of modulo.niveles) {
  265 |            approveProgresoMaestria(testUserEmail, 2, n.seccion, 'MIXTA');
  266 |         }
  267 |         for (const d of modulo.desafios) {
  268 |            if (d.nivel_id < desafio.nivel_id) {
  269 |               approveProgresoMaestria(testUserEmail, 2, d.seccion, 'MIXTA');
  270 |            }
  271 |         }
  272 | 
  273 |         await page.goto('/welcome-fase2');
  274 |         await page.waitForLoadState('domcontentloaded');
  275 |         await page.waitForTimeout(1000);
  276 | 
  277 |         const modCards = page.locator('.f2-module-card');
  278 |         const modCard = modCards.nth(modulo.modulo_id - 1);
  279 |         await expect(modCard).toBeVisible();
  280 |         await modCard.click();
  281 | 
  282 |         const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
  283 |         const desafioBtn = page.locator('.f2-challenge-bar-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
  284 |         
  285 |         if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
  286 |             await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
  287 |             await desafioBtn.click();
  288 | 
  289 |             const splash = page.locator('.f2-start-splash-overlay').first();
  290 |             if (await splash.isVisible({ timeout: 5000 }).catch(()=>false)) {
  291 |                 await splash.click();
  292 |             }
  293 | 
  294 |             for (let attempts = 0; attempts < 5; attempts++) {
  295 |               await page.waitForTimeout(1500);
  296 |               if (currentQuestionId === null) continue;
  297 |               
  298 |               const oldQuestionId = currentQuestionId;
  299 |               await failCurrentQuestion(page, currentQuestionId!);
  300 | 
  301 |               let isEarlyExitVisible = false;
  302 |               const earlyExitModal = page.locator('.f2-feedback-card.early-exit, .early-exit-modal');
```