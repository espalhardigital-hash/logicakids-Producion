# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-gameplay-fase4.spec.ts >> 08 - Gameplay Fase 4 (Fracciones y Porcentajes) - Exhaustivo >> Módulo 1 Nivel 1 - Flujo Completo Optimizado
- Location: tests\08-gameplay-fase4.spec.ts:216:11

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
          - generic [ref=e20]: PROGRESO 1/15
    - main [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - img [ref=e27]
          - paragraph [ref=e36]: Identifica qué fracción representa la parte pintada de la pizza en la ilustración.
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - textbox "?" [ref=e40]
              - textbox "?" [ref=e42]
            - generic [ref=e43]:
              - generic [ref=e44]:
                - button "7" [ref=e45] [cursor=pointer]
                - button "8" [ref=e46] [cursor=pointer]
                - button "9" [ref=e47] [cursor=pointer]
                - button "4" [ref=e48] [cursor=pointer]
                - button "5" [ref=e49] [cursor=pointer]
                - button "6" [ref=e50] [cursor=pointer]
                - button "1" [ref=e51] [cursor=pointer]
                - button "2" [ref=e52] [cursor=pointer]
                - button "3" [ref=e53] [cursor=pointer]
                - button [ref=e54] [cursor=pointer]:
                  - img [ref=e55]
                - button "0" [ref=e59] [cursor=pointer]
                - button [disabled] [ref=e60]:
                  - img [ref=e61]
              - generic [ref=e63]: Teclado Numérico
          - generic [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66]: CORRECTAS
              - text: "1"
            - generic [ref=e67]:
              - generic [ref=e68]: ERRORES
              - text: "2"
  - button "Alternar Tema Claro/Oscuro" [ref=e69] [cursor=pointer]:
    - img [ref=e71]
```

# Test source

```ts
  11  |   'Si pintas 4 partes de un rectángulo': '4/6',
  12  |   'Un círculo tiene 4 partes y todas': '4/4',
  13  |   'Encuentra la fracción equivalente a 1/2': '3/6',
  14  |   'Amplifica 2/3 por un factor de 2': '4/6',
  15  |   '¿Qué fracción equivalente a 4/8': '1/2',
  16  |   'Un cuadrado se divide en 2 rectángulos': '1/2',
  17  |   'Un cuadrado de 4x4 cuadraditos tiene 8 pintados': '1/2',
  18  |   'Si cortamos un círculo en 4 porciones, pero 2 de ellas': 'no',
  19  |   'Calcula 1/4 de 16': '4',
  20  |   'Si tienes 15 manzanas y regalas 1/3': '5',
  21  |   'Calcula 1/5 de 40': '8',
  22  |   'Calcula 3/4 de 24': '18',
  23  |   'Un cofre tiene 30 monedas. Tomas 2/3': '20',
  24  |   'Calcula 4/5 de 50': '40',
  25  |   'Si gastas 3/8 de tu dinero': '5/8',
  26  |   'Tenías 30 manzanas y regalaste 1/3. ¿Cuántas': '20',
  27  |   'Un tanque de 50 litros vacía 2/5': '30',
  28  |   'Calcula el 50% de 80.': '40',
  29  |   'Calcula el 25% de 120.': '30',
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
  94  |           await page.locator('path[stroke="rgba(255,255,255,0.15)"]').nth(i).click({ force: true });
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
> 111 |       await confirmBtn.click();
      |                        ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  112 |     } else {
  113 |       if (answer.includes('/')) {
  114 |         const [num, den] = answer.split('/');
  115 |         
  116 |         for (const char of num) {
  117 |           await page.locator(`button:has-text("${char}")`).last().click();
  118 |           await page.waitForTimeout(50);
  119 |         }
  120 |         
  121 |         await page.locator('.f4-fraction-input-field').nth(1).click();
  122 |         await page.waitForTimeout(100);
  123 |         
  124 |         for (const char of den) {
  125 |           await page.locator(`button:has-text("${char}")`).last().click();
  126 |           await page.waitForTimeout(50);
  127 |         }
  128 |       } else {
  129 |         for (const char of answer) {
  130 |           await page.locator(`button:has-text("${char}")`).last().click();
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
  172 |         await page.locator('.f4-fraction-input-field').nth(1).click();
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
  193 |     test.setTimeout(240000);
  194 |     currentQuestionId = null;
  195 |     testUserEmail = await registerDynamicTestUser(page);
  196 |     setPhaseForUser(testUserEmail, 4);
  197 |     clearTestUserProgress(testUserEmail);
  198 | 
  199 |     page.on('response', async (response) => {
  200 |       if (
  201 |         response.url().includes('/api/fase4/modulo/') &&
  202 |         response.url().includes('/pregunta')
  203 |       ) {
  204 |         try {
  205 |           const json = await response.json();
  206 |           if (json && json.id) {
  207 |             currentQuestionId = json.id;
  208 |           }
  209 |         } catch (e) {}
  210 |       }
  211 |     });
```