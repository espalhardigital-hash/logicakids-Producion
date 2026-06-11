import { test, expect } from '../helpers/test-fixtures';
import { ROUTES } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';
import { execSync } from 'child_process';
import { navigateGenericTheoryModal } from '../helpers/gameplay-utils';

const FASE3_THEORY_ANSWERS: Record<string, string> = {
  'María tiene 10 globos y 3 gatos. Se le revientan 4 globos. ¿Cuántos globos le quedan?': '6',
  'En un garaje hay 8 autos y 5 bicicletas. Salen 3 autos. ¿Cuántos autos quedan?': '5',
  'Lucas tiene 15 figuritas y 4 pelotas. Le regala 5 figuritas a su hermano. ¿Cuántas figuritas tiene ahora?': '10',
  'Pedro tiene 11 años. Ayer compró 10 chocolates y 4 chupetines. Se comió 3 chocolates. ¿Cuántos chocolates le quedan?': '7',
  'A las 4:00 PM, un tren partió con 20 pasajeros. En el año 2025, el tren sumó 5 pasajeros en la estación. ¿Cuántos pasajeros van ahora?': '25',
  'En una tienda que abre a las 8:00 AM, un niño de 12 años compra 15 galletas. Le regala 6 a su amigo. ¿Cuántas galletas le quedan?': '9',
  'En una mochila hay 8 lápices, 2 botellas de agua (litros) and 3 gomas. ¿Cuántos útiles escolares (lápices y gomas) hay?': '11',
  'Un camión transporta 10 cajas de manzanas, 50 litros de gasolina en el tanque y 4 cajas de peras. ¿Cuántas cajas de frutas transporta en total?': '14',
  'Un pintor compró 6 latas de pintura, 2 escaleras y 3 pinceles. ¿Cuántas herramientas de aplicación (latas y pinceles) tiene?': '9',
  'Sofía inicia el día con 15 tazos. Pierde 5 jugando, y luego su hermano le regala 8. ¿Cuántos tiene ahora?': '18',
  'Una alcancía tiene 30 monedas. Sacamos 10 para comprar un juguete, y luego metemos 5. ¿Cuántas monedas quedan?': '25',
  'Un árbol tenía 12 pájaros. Se volaron 4, y luego llegaron 6 nuevos. ¿Cuántos pájaros hay ahora?': '14',
  'Un cofre de monedas fue asaltado y le quitaron 8 monedas. Ahora quedan 12. ¿Cuántas monedas tenía al inicio?': '20',
  'Sofía recibió 5 chocolates de su tío y ahora tiene 15 en total. ¿Cuántos chocolates tenía Sofía antes del regalo?': '10',
  'Un autobús deja 6 pasajeros en la estación y se queda con 14. ¿Cuántos pasajeros llevaba al inicio?': '20',
  'Un comerciante tiene 10 manzanas. Compra 5 más, luego duplica toda su mercadería, y al final vende 8 manzanas. ¿Cuántas manzanas le quedan?': '22',
  'Un globo aerostático sube a 100 metros. Desciende 40 metros, luego sube el doble de lo que descendió (80 metros), y baja 10 metros. ¿A qué altura está ahora?': '130',
  'Un jugador de cartas tiene 20 fichas. Gana 10, pierde la mitad de lo que tiene ahora, y luego gana 5 fichas más. ¿Cuántas tiene al final?': '20',
  'Carrito A: 2 pizzas y 1 refresco cuesta R$ 20. Carrito B: 2 pizzas y 2 refrescos cuesta R$ 25. ¿Cuánto cuesta 1 refresco?': '5',
  'Grupo A: 5 lápices y 1 goma cuesta R$ 10. Grupo B: 5 lápices y 2 gomas cuesta R$ 12. ¿Cuánto cuesta 1 goma?': '2',
  'Paquete A: 3 libros cuesta R$ 30. Paquete B: 3 libros y 1 cuaderno cuesta R$ 38. ¿Cuánto cuesta 1 cuaderno?': '8',
  'Sabemos que 1 refresco cuesta R$ 4. Si 2 hamburguesas y 1 refresco cuestan R$ 24 en total, ¿cuánto cuesta 1 hamburguesa?': '10',
  'Si 1 manzana cuesta R$ 2, y 3 plátanos con 2 manzanas cuestan R$ 19, ¿cuánto cuesta 1 plátano?': '5',
  'Sabemos que 1 regla cuesta R$ 3. Si 2 cuadernos y 3 reglas cuestan R$ 19, ¿cuánto cuesta 1 cuaderno?': '5',
  'Un libro y un cuaderno cuestan R$ 30 en total. El libro cuesta R$ 6 más que el cuaderno. ¿Cuánto cuesta el cuaderno?': '12',
  'Un estuche y una mochila cuestan R$ 60 en total. La mochila cuesta R$ 20 más que el estuche. ¿Cuánto cuesta el estuche?': '20',
  'Una pelota y un bate cuestan R$ 100 en total. El bate cuesta R$ 40 más que la pelota. ¿Cuánto cuesta la pelota?': '30',
  'Se quieren repartir 150 lápices en 5 estuches en partes iguales. ¿Cuántos lápices van en cada estuche?': '30',
  'Una biblioteca tiene 240 libros para acomodar en 8 estantes. ¿Cuántos libros van en cada estante?': '30',
  'Un agricultor recolectó 400 papas y las colocó en 10 sacos en partes iguales. ¿Cuántas papas van en cada saco?': '40',
  'Tenemos 26 chocolates para armar bolsitas de 4 chocolates cada una. ¿Cuántos chocolates sobran?': '2',
  'Un profesor tiene 33 alumnos y los agrupa en equipos de 5. ¿Cuántos alumnos quedan sin equipo?': '3',
  'Queremos colocar 53 juguetes en cajas de 10 unidades. ¿Cuántos juguetes quedan en la última caja incompleta?': '3',
  'Un semáforo cambia de color en orden: Rojo (1), Amarillo (2), Verde (3), y repite. ¿Qué color saldrá en el parpadeo 20? (Escribe el número: 1, 2 o 3)': '2',
  'Una rueda de la fortuna tiene 4 canastillas numeradas en orden: 1, 2, 3, 4, y gira continuamente. Si avanza 45 posiciones, ¿qué número de canastilla queda abajo?': '1',
  'Un juego de cartas reparte a 3 jugadores: Lucas (1), Ana (2), Juan (3) en orden cíclico. ¿A quién le cae la carta número 18?': '3',
  'Un saltamontes da saltos de 5 metros. ¿Cuántos saltos necesita para recorrer 35 metros?': '7',
  'Queremos llenar cajas de 6 bombones. Si tenemos 48 bombones en total, ¿cuántas cajas exactas podemos completar?': '8',
  'Un robot avanza dando pasos de 4 centímetros. ¿Cuántos pasos debe dar para recorrer 40 centímetros?': '10',
  'Un faro parpadea cada 3 segundos y otro cada 5 segundos. Si parpadean juntos ahora, ¿en cuántos segundos volverán a parcapar juntos?': '15',
  'Dos campanas suenan en una iglesia: una cada 6 minutos y otra cada 8 minutos. Si suenan juntas ahora, ¿en cuántos minutos volverán a sonar juntas?': '24',
  'Un semáforo se pone en verde cada 4 segundos y otro cada 8 segundos. ¿En cuántos segundos coinciden si arrancan juntos?': '8',
  'Queremos armar bolsas idénticas de dulces sin que sobre nada, usando 15 bombones de fresa y 20 de menta. ¿Cuál es el número máximo de bolsas idénticas que podemos armar?': '5',
  'Tenemos dos tablones de madera de 24 cm y 32 cm. Queremos cortarlos en piezas de igual longitud lo más largas posible sin desperdiciar nada. ¿De cuántos cm debe ser cada pieza?': '8',
  'Queremos agrupar 12 niños y 18 niñas en filas idénticas con el mismo número de integrantes. ¿Cuál es el tamaño máximo de cada fila?': '6'
};

function getCorrectAnswer(questionId: number): string {
  try {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT respuesta_correcta FROM preguntas WHERE id = ${questionId}"`;
    return execSync(cmd).toString().trim();
  } catch (e) {
    console.error(`Error querying answer for question ${questionId}:`, e);
    return '';
  }
}

function clearTestUserProgress(email: string) {
  try {
    const queries = [
      `DELETE FROM intento_pasos WHERE intento_pregunta_id IN (SELECT id FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}')));`,
      `DELETE FROM intento_preguntas WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
      `DELETE FROM intentos WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`,
      `DELETE FROM progreso_maestria WHERE alumno_id IN (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${email}'));`
    ];
    for (const q of queries) {
      execSync(`docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "${q}"`);
    }
  } catch (e) {
    console.error('❌ Failed to clear test user database progress:', e);
  }
}

async function submitCorrectAnswer(page: any, questionId: number) {
  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();

  if (tipo === 'MULTIPLE_OPCION') {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = true LIMIT 1"`;
    const correctText = execSync(cmd).toString().trim();
    await page.locator(`button:has-text("${correctText}")`).first().click();
    await page.locator('button:has-text("Confirmar Respuesta")').first().click();
  } else {
    const answer = getCorrectAnswer(questionId);
    for (const char of answer) {
      await page.locator('button').filter({ hasText: new RegExp(`^${char}$`) }).last().click();
      await page.waitForTimeout(50);
    }
    await page.getByTestId('submit-numpad').click();
  }
}

async function failCurrentQuestion(page: any, questionId: number) {
  const typeCmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT tipo_pregunta FROM preguntas WHERE id = ${questionId}"`;
  const tipo = execSync(typeCmd).toString().trim();

  if (tipo === 'MULTIPLE_OPCION') {
    const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT texto FROM alternativas WHERE pregunta_id = ${questionId} AND es_correcta = false LIMIT 1"`;
    const wrongText = execSync(cmd).toString().trim();
    await page.locator(`button:has-text("${wrongText}")`).first().click();
    await page.locator('button:has-text("Confirmar Respuesta")').first().click();
  } else {
    for (let i = 0; i < 4; i++) {
      await page.locator('button').filter({ hasText: new RegExp(`^9$`) }).last().click();
      await page.waitForTimeout(50);
    }
    await page.getByTestId('submit-numpad').click();
  }
}

const metadata = getPhaseMetadata(3);

test.describe('07 - Gameplay Fase 3 (Problemas de Texto) - Exhaustivo', () => {
  let currentQuestionId: number | null = null;
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    currentQuestionId = null;
    testUserEmail = await registerDynamicTestUser(page);
    setPhaseForUser(testUserEmail, 3);
    clearTestUserProgress(testUserEmail);

    page.on('response', async (response) => {
      if (
        response.url().includes('/api/fase3/modulo/') &&
        response.url().includes('/pregunta')
      ) {
        try {
          const json = await response.json();
          if (json && json.id) {
            currentQuestionId = json.id;
          }
        } catch (e) {}
      }
    });
  });

  for (const modulo of metadata.modulos) {
    for (const nivel of modulo.niveles) {
      test(`Módulo ${modulo.modulo_id} Nivel ${nivel.nivel_id} - Flujo Completo Optimizado`, async ({ page }) => {
        unlockAllUpToModule(testUserEmail, 3, modulo.modulo_id);
        
        for (let l = 1; l < nivel.nivel_id; l++) {
           approveProgresoMaestria(testUserEmail, 3, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
        }

        await page.goto('/welcome-fase3');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f3-module-card-item');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const lvlBtn = page.locator('.f3-level-card-item').nth(nivel.nivel_id - 1);
        await expect(lvlBtn).toBeVisible();
        await lvlBtn.click();

        await navigateGenericTheoryModal(page, FASE3_THEORY_ANSWERS, 'f3');

        const splash = page.locator('.f3-start-splash-overlay').first();
        if (await splash.isVisible({ timeout: 5000 }).catch(() => false)) {
          await splash.click();
        }

        let errorsForced = 0;
        const maxErrors = 4;
        let questionCounter = 0;
        const maxQuestionsSafety = 30; 

        while (questionCounter < maxQuestionsSafety) {
          await page.waitForTimeout(1000);
          
          const endScreen = page.locator('text=¡Desafío Terminado!').or(page.locator('text=Nivel Completado')).or(page.locator('text=Dominado')).or(page.locator('text=Desafío Terminado')).or(page.locator('button:has-text("Ir al Nivel")')).first();
          if (await endScreen.isVisible().catch(()=>false)) {
             break;
          }

          if (currentQuestionId === null) {
            const continueBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
            if (await continueBtn.isVisible().catch(()=>false)) {
              await continueBtn.click();
            }
            continue;
          }

          const qId = currentQuestionId;
          
          if (errorsForced < maxErrors && questionCounter % 3 === 1) {
            await failCurrentQuestion(page, qId);
            errorsForced++;
            await page.waitForTimeout(1500);

            const continueBtnWrong = page.locator('button:has-text("Intentar de nuevo ↺"), button:has-text("Continuar")').first();
            if (await continueBtnWrong.isVisible({ timeout: 3000 }).catch(()=>false)) {
               await continueBtnWrong.click();
            } else {
               const incorrectInput = page.locator('.f3-custom-input-box.incorrect').first();
               if (await incorrectInput.isVisible({ timeout: 1000 }).catch(()=>false)) {
                 for (let i = 0; i < 4; i++) {
                   await page.getByTestId('delete-numpad').click(); 
                 }
               }
            }

            await page.waitForTimeout(1500);
            if (currentQuestionId) {
               await submitCorrectAnswer(page, currentQuestionId);
            }
          } else {
            await submitCorrectAnswer(page, qId);
          }

          await page.waitForTimeout(1000);
          const nextBtn = page.locator('button:has-text("Siguiente Pregunta →"), button:has-text("Continuar")').first();
          if (await nextBtn.isVisible().catch(()=>false)) {
            await nextBtn.click();
            currentQuestionId = null;
          }

          questionCounter++;
        }
      });
    }

    for (const desafio of modulo.desafios) {
      test(`Módulo ${modulo.modulo_id} Desafío ${desafio.seccion} - Salida Temprana`, async ({ page }) => {
        unlockAllUpToModule(testUserEmail, 3, modulo.modulo_id);
        for (const n of modulo.niveles) {
           approveProgresoMaestria(testUserEmail, 3, n.seccion, 'MIXTA');
        }
        for (const d of modulo.desafios) {
           if (d.nivel_id < desafio.nivel_id) {
              approveProgresoMaestria(testUserEmail, 3, d.seccion, 'MIXTA');
           }
        }

        await page.goto('/welcome-fase3');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const modCards = page.locator('.f3-module-card-item');
        const modCard = modCards.nth(modulo.modulo_id - 1);
        await expect(modCard).toBeVisible();
        await modCard.click();

        const desafioBtnIndex = modulo.desafios.findIndex(d => d.seccion === desafio.seccion);
        const desafioBtn = page.locator('.f3-challenge-bar-btn, .f3-challenge-btn').nth(desafioBtnIndex >= 0 ? desafioBtnIndex : 0);
        
        if (await desafioBtn.isVisible({timeout: 3000}).catch(()=>false)) {
            await expect(desafioBtn).toBeEnabled({ timeout: 10000 });
            await desafioBtn.click();

            const splash = page.locator('.f3-start-splash-overlay').first();
            if (await splash.isVisible({ timeout: 5000 }).catch(()=>false)) {
                await splash.click();
            }

            for (let attempts = 0; attempts < 5; attempts++) {
              await page.waitForTimeout(1500);
              if (currentQuestionId === null) continue;
              
              await failCurrentQuestion(page, currentQuestionId!);

              const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Siguiente Pregunta →")').first();
              if (await continueBtn.isVisible().catch(()=>false)) {
                await continueBtn.click();
              }
              
              const earlyExitModal = page.locator('.f3-feedback-card.early-exit, .early-exit-modal');
              if (await earlyExitModal.isVisible({ timeout: 2000 }).catch(()=>false)) {
                  const exitBtn = earlyExitModal.locator('button:has-text("Entendido"), button:has-text("Salir")').first();
                  if (await exitBtn.isVisible()) await exitBtn.click();
                  break;
              }
            }
        }
      });
    }
  }
});
