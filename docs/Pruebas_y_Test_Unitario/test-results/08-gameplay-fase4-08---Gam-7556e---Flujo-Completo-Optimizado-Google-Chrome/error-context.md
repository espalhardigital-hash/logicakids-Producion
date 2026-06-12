# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-gameplay-fase4.spec.ts >> 08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo >> Módulo 1 Nivel 3 - Flujo Completo Optimizado
- Location: tests\08-gameplay-fase4.spec.ts:213:11

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button:has-text("n")').last()

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
          - generic [ref=e20]: PROGRESO 0/15
    - main [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: 🍕 🧪
          - paragraph [ref=e26]: Un cuadrado está cortado en 4 secciones. Si 2 de ellas son rectángulos gigantes y las otras son cuadrangulares pequeños, ¿representa cada sección exactamente 1/4?
        - generic [ref=e27]:
          - generic [ref=e28]:
            - textbox "Respuesta" [ref=e30]
            - generic [ref=e31]:
              - generic [ref=e32]:
                - button "7" [ref=e33] [cursor=pointer]
                - button "8" [ref=e34] [cursor=pointer]
                - button "9" [ref=e35] [cursor=pointer]
                - button "4" [ref=e36] [cursor=pointer]
                - button "5" [ref=e37] [cursor=pointer]
                - button "6" [ref=e38] [cursor=pointer]
                - button "1" [ref=e39] [cursor=pointer]
                - button "2" [ref=e40] [cursor=pointer]
                - button "3" [ref=e41] [cursor=pointer]
                - button [ref=e42] [cursor=pointer]:
                  - img [ref=e43]
                - button "0" [ref=e47] [cursor=pointer]
                - button [disabled] [ref=e48]:
                  - img [ref=e49]
              - generic [ref=e51]: Teclado Numérico
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]: CORRECTAS
              - text: "0"
            - generic [ref=e55]:
              - generic [ref=e56]: ERRORES
              - text: "0"
  - button "Alternar Tema Claro/Oscuro" [ref=e57] [cursor=pointer]:
    - img [ref=e59]
```

# Test source

```ts
  30  |   'Calcula el 10% de 450.': '45',
  31  |   'En una encuesta del 100%, 45% prefiere chocolate': '25',
  32  |   'De un total de 400 personas, el 50%': '200',
  33  |   'Si el 10% de un pastel representa 8': '80',
  34  |   'Tres barras marcan: A=100, B=150, C=50. ¿Cuál es el total': '300',
  35  |   'Usando las barras anteriores: ¿cuánto más grande': '100',
  36  |   'Si sumamos las barras A (100) y C (50)': 'sí',
  37  |   'Calcula el promedio de las puntuaciones: 4, 8 y 12.': '8',
  38  |   'Dos amigos gastan R$ 10 y R$ 20. ¿Cuál': '15',
  39  |   'En tres días llovió 6 mm, 6 mm y 12 mm. ¿Cuál': '8',
  40  |   'La receta es 3 tazas de agua por 1 de limón': '9',
  41  |   'Pintura rosa usa 1 litro de rojo por 4 de blanco': '8',
  42  |   'Una masa requiere 1 huevo por 3 tazas de harina': '3',
  43  |   'Mezclas 2 litros de azul y 3 de amarillo': '6',
  44  |   'Pintura rosa usa 1 de rojo y 4 de blanco': '20',
  45  |   'Concreto lleva 3 de arena y 7 de grava': '9',
  46  |   'Una mezcla tiene 1 parte de concentrado y 9 de agua': '10',
  47  |   'Un jugo de 200 ml contiene 25% de pulpa. ¿Cuántos': '50',
  48  |   'Si en 100 gramos de chocolate hay 10%': '90'
  49  | };
  50  | 
  51  | function getCorrectAnswer(questionId: number): string {
  52  |   try {
  53  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
  54  |     return execSync(cmd).toString().trim();
  55  |   } catch (e) {
  56  |     console.error(`Error querying answer for question ${questionId}:`, e);
  57  |     return '';
  58  |   }
  59  | }
  60  | 
  61  | function clearTestUserProgress(email: string) {
  62  |   try {
  63  |     const queries = [
  64  |       `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
  65  |       `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
  66  |       `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
  67  |       `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
  68  |     ];
  69  |     for (const q of queries) {
  70  |       execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${q}"`);
  71  |     }
  72  |   } catch (e) {
  73  |     console.error('❌ Failed to clear test user database progress:', e);
  74  |   }
  75  | }
  76  | 
  77  | async function submitCorrectAnswer(page: any, questionId: number) {
  78  |   const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  79  |   const tipo = execSync(typeCmd).toString().trim();
  80  | 
  81  |   if (tipo === 'MULTIPLE_OPCION') {
  82  |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
  83  |     const correctText = execSync(cmd).toString().trim();
  84  |     await page.locator(`button:has-text("${correctText}")`).first().click();
  85  |   } else {
  86  |     const answer = getCorrectAnswer(questionId);
  87  |     
  88  |     const confirmBtn = page.locator('button:has-text("CONFIRMAR")').first();
  89  |     if (await confirmBtn.isVisible()) {
  90  |       if (answer.includes('/')) {
  91  |         const [num] = answer.split('/');
  92  |         const numerator = parseInt(num, 10);
  93  |         for (let i = 0; i < numerator; i++) {
  94  |           await page.locator('path[stroke="rgba(255,255,255,0.15)"]').first().click({ force: true });
  95  |           await page.waitForTimeout(50);
  96  |         }
  97  |       } else {
  98  |         const hint = page.locator('text=👉 ¡TÓCAME!').first();
  99  |         if (await hint.isVisible()) {
  100 |           await hint.click({ force: true });
  101 |           await page.waitForTimeout(200);
  102 |         }
  103 |         let label = `${answer}%`;
  104 |         if (answer === '25') label = '1/4 (25%)';
  105 |         else if (answer === '50') label = '1/2 (50%)';
  106 |         
  107 |         await page.locator(`button:has-text("${label}")`).first().click();
  108 |         await page.waitForTimeout(200);
  109 |       }
  110 |       await page.waitForTimeout(300); // Wait for React state to propagate
  111 |       await confirmBtn.click();
  112 |     } else {
  113 |       if (answer.includes('/')) {
  114 |         const [num, den] = answer.split('/');
  115 |         
  116 |         for (const char of num) {
  117 |           await page.locator(`button:has-text("${char}")`).last().click();
  118 |           await page.waitForTimeout(50);
  119 |         }
  120 |         
  121 |         await page.locator('input[placeholder="?"]').last().click();
  122 |         await page.waitForTimeout(100);
  123 |         
  124 |         for (const char of den) {
  125 |           await page.locator(`button:has-text("${char}")`).last().click();
  126 |           await page.waitForTimeout(50);
  127 |         }
  128 |       } else {
  129 |         for (const char of answer) {
> 130 |           await page.locator(`button:has-text("${char}")`).last().click();
      |                                                                   ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  131 |           await page.waitForTimeout(50);
  132 |         }
  133 |       }
  134 |       await page.waitForTimeout(300);
  135 |       await page.getByTestId('submit-numpad').click();
  136 |     }
  137 |   }
  138 | }
  139 | 
  140 | async function failCurrentQuestion(page: any, questionId: number) {
  141 |   const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  142 |   const tipo = execSync(typeCmd).toString().trim();
  143 | 
  144 |   if (tipo === 'MULTIPLE_OPCION') {
  145 |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
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
  159 |           await hint.click({ force: true });
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
```