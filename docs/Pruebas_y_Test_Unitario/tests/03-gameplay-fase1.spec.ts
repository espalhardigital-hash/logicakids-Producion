import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule, execDbQuery } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';

function getCorrectAnswer(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying answer for question ${questionId}:`, e);
    return '';
  }
}

async function submitCorrectAnswer(page: any, questionId: number) {
  const answer = getCorrectAnswer(questionId);
  for (const char of answer) {
    await page.locator(`button:has-text("${char}")`).last().click();
    await page.waitForTimeout(50);
  }
  await page.locator('button.bg-blue-600').filter({ hasText: '' }).last().click();
}

async function failCurrentQuestion(page: any, questionId: number) {
  for (let i = 0; i < 4; i++) {
    await page.locator(`button:has-text("9")`).last().click();
    await page.waitForTimeout(50);
  }
  await page.locator('button.bg-blue-600').filter({ hasText: '' }).last().click();
}

const metadata = getPhaseMetadata(1);
const CATEGORY_NAMES = ['Sumas', 'Restas', 'Tablas', 'Divisiones', 'Desafío Mixto'];

test.describe('03 - Gameplay Fase 1 (Aritmética Básica) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 1);

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase1/pedagogia/') &&
        response.url().includes('/responder')
      ) {
        try {
          const json = await response.json();
          if (json && json.id) {
            // No hay id directo en la respuesta, lo manejamos interceptando requests
          }
        } catch (e) {}
      }
    });

    page.on('request', async (request) => {
       if (request.url().includes('/api/fase1/pedagogia/responder')) {
          const postData = request.postDataJSON();
          if (postData && postData.pregunta_id) {
              currentQuestionId = postData.pregunta_id;
          }
       }
    });
  });

  for (const modulo of metadata.modulos) {
    const categoryName = CATEGORY_NAMES[modulo.modulo_id - 1] || 'Sumas';

    for (const nivel of modulo.niveles) {
      if (nivel.nivel_id > 5) continue; // La UI de Fase 1 (LevelSelectionScreen) solo renderiza hasta 5 niveles
      
      test(`Fase 1 - Módulo ${modulo.modulo_id} (${categoryName}) Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
        test.setTimeout(300000); // 5 minutos de timeout por nivel por si la red/animaciones van lentas
        unlockAllUpToModule(testUserEmail, 1, modulo.modulo_id);
        
        // Fase 1 usa user.settings.unlockedLevels para desbloquear los niveles internos
        const categories = ['addition', 'subtraction', 'multiplication', 'division', 'challenge'];
        const currentCat = categories[modulo.modulo_id - 1];
        
        // El nivel desbloqueado debe ser al menos el nivel actual que queremos jugar
        const targetLevel = nivel.nivel_id;
        const queryUpdate = `
          UPDATE users 
          SET settings = jsonb_set(
            COALESCE(settings, '{}'::jsonb), 
            '{unlockedLevels, ${currentCat}}', 
            '${targetLevel}'::jsonb
          )
          WHERE email = '${testUserEmail}';
        `;
        execDbQuery(queryUpdate);

        await page.goto('/welcome');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Click on Category Card
        const catBtn = page.locator('h3', { hasText: categoryName }).first();
        await expect(catBtn).toBeVisible();
        await catBtn.click({ force: true });
        
        await page.waitForTimeout(1000);

        // Click on Level
        const lvlBtn = page.locator(`span:has-text("Nivel ${nivel.nivel_id}")`).first();
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click({ force: true });

        await page.waitForTimeout(1500);

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        let emptyCycles = 0;
        const maxQuestionsSafety = 40;

        // Bucle de Preguntas
        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(1000);
          
          // Detectar pantalla de resultados/fin
          if (await page.locator('text=Misión Completada, text=Nivel Superado, text=Nivel Completado, text=Dominado').isVisible().catch(()=>false)) {
            break;
          }

          // En Fase 1 no podemos saber el currentQuestionId facilmente desde UI sin API,
          // asi que extraemos el texto y buscamos
          const questionTextEl = page.locator('h2.text-7xl, h2.text-8xl').first();
          if (!await questionTextEl.isVisible().catch(()=>false)) {
             emptyCycles++;
             if (emptyCycles > 10) break; // Evitar loop infinito si ya no hay pregunta
             continue;
          }
          emptyCycles = 0;
          
          const questionText = await questionTextEl.innerHTML();
          
          // Buscar respuesta en DB directo por texto (ya que es matemática basica "2 + 2 =")
          let answer = '';
          try {
             const clean = questionText.trim().replace(/'/g, "''");
             const sqlQuery = `SELECT respuesta_correcta FROM preguntas WHERE fase_id = 1 AND enunciado = '${clean}' LIMIT 1;`;
             const cmd = `docker exec -i logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A`;
             answer = execSync(cmd, { input: sqlQuery }).toString().trim();
          } catch(e) {
             console.log("Error querying answer", e);
          }

          if (!answer) {
             // Fallback resolver manual (1)
             answer = "1";
          }
          
          if (errorsForced < maxErrors && questionCounter % 3 === 1) {
             // Equivocarse a propósito
             for (let i = 0; i < 4; i++) {
                await page.locator(`button:has-text("9")`).last().click();
                await page.waitForTimeout(50);
             }
             await page.locator('button.bg-blue-600').filter({ hasText: '' }).last().click();
             errorsForced++;
             
             await page.waitForTimeout(2000); // Wait for red feedback

             // Reparar error
             for (const char of answer) {
                await page.locator(`button:has-text("${char}")`).last().click();
                await page.waitForTimeout(50);
             }
             await page.locator('button.bg-blue-600').filter({ hasText: '' }).last().click();
             await page.waitForTimeout(1500);
          } else {
             // Acertar a la primera
             for (const char of answer) {
                await page.locator(`button:has-text("${char}")`).last().click();
                await page.waitForTimeout(50);
             }
             await page.locator('button.bg-blue-600').filter({ hasText: '' }).last().click();
             await page.waitForTimeout(1500);
          }

          questionCounter++;
        }
      });
    }
  }
});
