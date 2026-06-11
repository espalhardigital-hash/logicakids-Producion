# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-gameplay-fase2.spec.ts >> 06 - Gameplay Fase 2 (Aritmética Intermedia) - Exhaustivo >> Módulo 1 Desafío 1012 - Salida Temprana
- Location: tests\06-gameplay-fase2.spec.ts:261:11

# Error details

```
TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('button:has-text("3")').first()
    - locator resolved to <button class="f2-mc-option-btn ">3</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <svg width="22" height="22" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target" xmlns="http://www.w3.org/2000/svg">…</svg> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <span class="f2-splash-meta-label">Preguntas</span> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <span class="f2-splash-meta-label">Preguntas</span> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="22" height="22" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target" xmlns="http://www.w3.org/2000/svg">…</svg> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
  2 × retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="f2-splash-meta-label">Preguntas</span> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="f2-splash-meta-label">Preguntas</span> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="22" height="22" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target" xmlns="http://www.w3.org/2000/svg">…</svg> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="22" height="22" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target" xmlns="http://www.w3.org/2000/svg">…</svg> from <div class="f2-start-splash-overlay">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e7] [cursor=pointer]:
      - generic [ref=e8]: ¡Desafío Especial!
      - 'heading "Desafío 2: Avanzado" [level=1] [ref=e9]'
      - generic [ref=e10]:
        - generic [ref=e11]:
          - img [ref=e13]
          - generic [ref=e16]: Módulo
          - generic [ref=e17]: Gimnasio Mental
        - generic [ref=e18]:
          - img [ref=e20]
          - generic [ref=e24]: Preguntas
          - generic [ref=e25]: 25 a superar
        - generic [ref=e26]:
          - img [ref=e28]
          - generic [ref=e31]: Tiempo
          - generic [ref=e32]: 40s / pregunta
      - generic [ref=e33]:
        - img [ref=e34]
        - generic [ref=e37]: "2"
      - generic [ref=e38]: Haz clic o presiona cualquier tecla para comenzar ahora
    - banner [ref=e39]:
      - button "Salir del nivel" [ref=e40] [cursor=pointer]:
        - img [ref=e41]
      - generic [ref=e44]:
        - generic [ref=e45]: GIMNASIO MENTAL
        - generic [ref=e46]: "|"
        - generic [ref=e47]: FASE 2
        - generic [ref=e48]: "|"
        - generic [ref=e49]: MÓDULO 1
        - generic [ref=e50]: "|"
        - generic [ref=e51]: NIVEL 12
        - generic [ref=e52]: "|"
        - generic [ref=e53]: DESAFÍO 0/25
        - generic [ref=e54]: "|"
        - generic [ref=e55]: "ERRORES: 0/2"
        - generic [ref=e56]: "|"
        - generic [ref=e57]: 34S
    - main [ref=e61]:
      - generic [ref=e64]:
        - generic [ref=e66]: "Calcula con cuidado: (14 - 14) × 3"
        - generic [ref=e67]:
          - button "3" [ref=e68]
          - button "0" [ref=e69]
          - button "4" [ref=e70]
          - button "2" [ref=e71]
        - button "Confirmar" [disabled] [ref=e72]
    - generic [ref=e74] [cursor=pointer]:
      - generic [ref=e75]: ZONA DE DESAFÍO
      - 'heading "Desafío 2: Avanzado" [level=1] [ref=e76]'
      - generic [ref=e77]:
        - generic [ref=e78]:
          - generic [ref=e79]: 📚
          - generic [ref=e80]: Módulo
          - generic [ref=e81]: Gimnasio Mental
        - generic [ref=e82]:
          - generic [ref=e83]: 🎯
          - generic [ref=e84]: Preguntas
          - generic [ref=e85]: 25 a superar
        - generic [ref=e86]:
          - generic [ref=e87]: ⏳
          - generic [ref=e88]: Tiempo
          - generic [ref=e89]: 40s / pregunta
        - generic [ref=e90]:
          - generic [ref=e91]: 🎯
          - generic [ref=e92]: Preguntas
          - generic [ref=e93]: 25 a superar
        - generic [ref=e94]:
          - generic [ref=e95]: ⏱️
          - generic [ref=e96]: Tiempo
          - generic [ref=e97]: 40s / preguntas / pregunta
      - generic [ref=e98]:
        - img [ref=e99]
        - generic [ref=e102]: "2"
      - generic [ref=e103]: Haz clic en cualquier lugar para comenzar de inmediato
  - button "Alternar Tema Claro/Oscuro" [ref=e104] [cursor=pointer]:
    - img [ref=e106]
```

# Test source

```ts
  24  |   'X - 8 = 2': '10',
  25  |   'doble de mi edad actual da como resultado 20': '10',
  26  |   'amigos en partes iguales y a cada uno le tocaron 5': '20',
  27  |   '3 × Y = 18': '6',
  28  |   '3 \\* Y = 18': '6',
  29  |   '8 + [ ] = 20': '12',
  30  |   '8 + \\[ \\] = 20': '12',
  31  |   '[ ] ÷ 3 = 6': '18',
  32  |   '\\[ \\] / 3 = 6': '18',
  33  |   '25 - [ ] = 15': '10',
  34  |   '25 - \\[ \\] = 15': '10',
  35  |   'X + 14 = 30': '16',
  36  |   '4 × Z = 32': '8',
  37  |   '4 \\* Z = 32': '8',
  38  |   'Y - 9 = 11': '20',
  39  |   'dos monedas de 0,50': '1,00',
  40  |   'billete de 5,00 reais y una moneda de 0,25': '5,25',
  41  |   'tres monedas de 0,25': '0,75',
  42  |   'cuesta 1,50 pesos y pago con un billete de 2,00': '0,50',
  43  |   'cuesta 3,00 pesos. El cliente me paga con un billete de 5,00': '2,00',
  44  |   'cuesta 4,25 pesos y pago con un billete limpio de 5,00': '0,75',
  45  |   'jugo de 1,25 pesos y unas galletas de 1,25': '2,50',
  46  |   'helado de 2,75 pesos y un chicle de 0,25': '3,00',
  47  |   'cómic de 5,50 pesos y un lápiz de 1,50': '7,00',
  48  |   '10,00 pesos y mi carrito suma 8,50': '1',
  49  |   '4,00 pesos, pero el libro cuesta 5,75': '1,75',
  50  |   '6,50 pesos y compro un pastelito de 6,50': '0,00',
  51  |   'cajas de crayones con 6': '18',
  52  |   'crayones en pantalla! Si en el camino se le rompen 4': '14',
  53  |   '2 nidos y cada nido tiene 5 pajaritos (Total = 10)': '13',
  54  |   '12 manzanas rojas y 8 manzanas verdes': '20',
  55  |   '20 manzanas calculadas: Si utiliza la mitad': '10',
  56  |   '4 paquetes con 5 calcomanías cada uno (Total = 20)': '10',
  57  |   'Valentina tenía 15 bombones': '10',
  58  |   'Su abuela llegó y le duplicó': '20',
  59  |   'Mateo tiene 2 cajas con 6 tazos': '9'
  60  | };
  61  | 
  62  | function getCorrectAnswer(questionId: number): string {
  63  |   try {
  64  |     const cmd = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
  65  |     return execSync(cmd, { input: `SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId};` }).toString().trim();
  66  |   } catch (e) {
  67  |     console.error(`Error querying answer for question ${questionId}:`, e);
  68  |     return '';
  69  |   }
  70  | }
  71  | 
  72  | function clearTestUserProgress(email: string) {
  73  |   try {
  74  |     const queries = [
  75  |       `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
  76  |       `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
  77  |       `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
  78  |       `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
  79  |     ];
  80  |     for (const q of queries) {
  81  |       execSync(`docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local`, { input: q });
  82  |     }
  83  |   } catch (e) {
  84  |     console.error('❌ Failed to clear test user database progress:', e);
  85  |   }
  86  | }
  87  | 
  88  | async function submitCorrectAnswer(page: any, questionId: number) {
  89  |   const psqlBase = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
  90  |   const tipo = execSync(psqlBase, { input: `SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId};` }).toString().trim();
  91  | 
  92  |   if (tipo === 'MULTIPLE_OPCION') {
  93  |     const correctText = execSync(psqlBase, { input: `SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1;` }).toString().trim();
  94  |     console.log(`[Q:${questionId}] MULTIPLE_OPCION -> CorrectText: "${correctText}"`);
  95  |     await page.locator(`button:has-text("${correctText}")`).first().click({ timeout: 5000 });
  96  |     await page.waitForTimeout(300); // Evitar pregunta espejo
  97  |     await page.locator('button:has-text("Confirmar")').first().click({ timeout: 5000 });
  98  |   } else {
  99  |     const answer = getCorrectAnswer(questionId);
  100 |     console.log(`[Q:${questionId}] INTERACTIVA -> Answer: "${answer}"`);
  101 |     const hiddenInput = page.locator('input.f2-hidden-input').first();
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
> 124 |     await page.locator(`button:has-text("${wrongText}")`).first().click({ timeout: 5000 });
      |                                                                   ^ TimeoutError: locator.click: Timeout 5000ms exceeded.
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
  202 |         const maxErrors = 4;
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
```