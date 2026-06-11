import { test, expect } from '../helpers/test-fixtures';
import { API } from '../helpers/constants';
import { registerDynamicTestUser } from '../helpers/auth';
import { setPhaseForUser, approveProgresoMaestria, unlockAllUpToModule } from '../helpers/db-utils';
import { getPhaseMetadata } from '../helpers/metadata-utils';

function getPlayUrl(fase: number, modulo: number, nivel: number): string {
    if (fase === 1) {
        const categories = ['addition', 'subtraction', 'multiplication', 'division', 'challenge'];
        const difficulties = ['easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'challenge'];
        const cat = categories[modulo - 1] || 'addition';
        const diff = difficulties[nivel - 1] || 'easy';
        return `/play?category=${cat}&difficulty=${diff}`;
    }
    return `/fase${fase}/modulo/${modulo}/nivel/${nivel}`;
}

test.describe('05 - Candados y Seguridad de Progresión Exhaustiva', () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    testUserEmail = await registerDynamicTestUser(page);
  });

  // Iteramos sobre todas las fases de la plataforma
  for (let faseId = 1; faseId <= 9; faseId++) {
      
    test(`Fase ${faseId} - Intentos de Salto Ilegal entre Módulos y Niveles`, async ({ page }) => {
      // Le damos acceso al usuario solo a esta fase (Nivel 1, Modulo 1)
      setPhaseForUser(testUserEmail, faseId);
      const metadata = getPhaseMetadata(faseId);
      
      // Validar que no se puede entrar a la Fase Siguiente
      if (faseId < 9) {
         const nextFaseUrl = `/welcome-fase${faseId + 1}`;
         await page.goto(nextFaseUrl);
         await page.waitForLoadState('domcontentloaded');
         await page.waitForTimeout(1000);
         // Debería expulsarlo de la ruta por no tener el nivel de fase
         expect(page.url()).not.toContain(nextFaseUrl);
      }

      for (let mIndex = 0; mIndex < metadata.modulos.length; mIndex++) {
         const modulo = metadata.modulos[mIndex];
         
         // Otorgamos acceso legitimo hasta el modulo actual
         unlockAllUpToModule(testUserEmail, faseId, modulo.modulo_id);
         
         for (let nIndex = 0; nIndex < modulo.niveles.length; nIndex++) {
            const nivel = modulo.niveles[nIndex];
            
            // Otorgamos acceso legítimo hasta nivel_id - 1
            for (let l = 1; l < nivel.nivel_id; l++) {
               approveProgresoMaestria(testUserEmail, faseId, parseInt(`${modulo.modulo_id}0${l}`), 'MIXTA');
            }
            
            // Simular intento de hack: El usuario está validado hasta nivel.nivel_id (aún no lo pasa).
            // Intenta saltar al nivel.nivel_id + 1 (Si existe)
            if (nIndex + 1 < modulo.niveles.length) {
               const nextNivel = modulo.niveles[nIndex + 1];
               const illegalUrl = getPlayUrl(faseId, modulo.modulo_id, nextNivel.nivel_id);
               
               await page.goto(illegalUrl);
               await page.waitForTimeout(1500);
               
               // La plataforma debe detectarlo y redirigirlo al dashboard o mapa, NO dejarlo en el nivel ilegal
               // O en su defecto, mostrar un cartel de "Bloqueado"
               const isStillOnIllegalUrl = page.url().includes(illegalUrl);
               if (isStillOnIllegalUrl) {
                  // Si no lo redirige, la pantalla debe estar vacía o mostrar acceso denegado explícito
                  const hasQuestions = await page.locator('button.bg-blue-600, .f2-keypad-submit, .fg-keypad-submit').count();
                  const isBlockedMsg = await page.locator('text=Bloqueado, text=Acceso Denegado, text=No tienes permiso').isVisible().catch(()=>false);
                  
                  expect(hasQuestions === 0 || isBlockedMsg, `¡Brecha de seguridad! El usuario logró cargar el nivel ${nextNivel.nivel_id} del módulo ${modulo.modulo_id} en fase ${faseId} sin haber pasado el anterior.`).toBe(true);
               }
            }

            // Simular intento de hack: Saltar al Módulo Siguiente (Nivel 1)
            if (nIndex === 0 && mIndex + 1 < metadata.modulos.length) {
                const nextModulo = metadata.modulos[mIndex + 1];
                const illegalModUrl = getPlayUrl(faseId, nextModulo.modulo_id, 1);
                
                await page.goto(illegalModUrl);
                await page.waitForTimeout(1500);
                
                const isStillOnIllegalUrl = page.url().includes(illegalModUrl);
                if (isStillOnIllegalUrl) {
                   const hasQuestions = await page.locator('button.bg-blue-600, .f2-keypad-submit, .fg-keypad-submit').count();
                   const isBlockedMsg = await page.locator('text=Bloqueado, text=Acceso Denegado').isVisible().catch(()=>false);
                   expect(hasQuestions === 0 || isBlockedMsg, `¡Brecha de seguridad! El usuario logró saltar al módulo ${nextModulo.modulo_id} en fase ${faseId} sin terminar el módulo actual.`).toBe(true);
                }
            }
         }
      }
    });
  }

  // Comprobar la UI visual de candados en los Dashboards
  test('La Interfaz Gráfica muestra los candados correctamente en todas las fases', async ({ page }) => {
    // Usuario recien creado, Fase 1
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    await page.goto('/map');
    await page.waitForTimeout(2000);
    
    // Fases 2 a 9 deben estar bloqueadas visualmente
    for (let i = 2; i <= 9; i++) {
        const card = page.locator('div.group', { hasText: `Fase ${i}` }).first();
        // Puede que tengan svg de lock o disabled en el boton
        const isBtnDisabled = await card.locator('button').isDisabled().catch(()=>false);
        const hasLockIcon = await card.locator('svg').count() > 0;
        expect(isBtnDisabled || hasLockIcon, `La Fase ${i} debería verse bloqueada visualmente en el mapa`).toBe(true);
    }

    // Fase 2 UI
    setPhaseForUser(testUserEmail, 2);
    await page.goto('/welcome-fase2');
    await page.waitForTimeout(2000);
    const lockedF2Mods = await page.locator('.f2-module-card:has(.lucide-lock), .f2-module-card.opacity-50').count();
    expect(lockedF2Mods).toBeGreaterThan(0); // Debe haber módulos bloqueados

    // Fase 7 UI
    setPhaseForUser(testUserEmail, 7);
    await page.goto('/welcome-fase7');
    await page.waitForTimeout(2000);
    const lockedF7Mods = await page.locator('.fg-module-card:has(svg), .fg-module-card.opacity-50, .fg-module-card.cursor-not-allowed').count();
    expect(lockedF7Mods).toBeGreaterThan(0); 
  });
});
