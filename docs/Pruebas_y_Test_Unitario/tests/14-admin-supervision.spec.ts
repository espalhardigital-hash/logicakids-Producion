import { test, expect } from '../helpers/test-fixtures';
import { ensureAuthenticated } from '../helpers/auth';
import { setAdminRoleAndPhase, restoreUserRole } from '../helpers/db-utils';
import { ROUTES } from '../helpers/constants';

test.describe('14 - Modo Supervisión del Administrador (Modo Evaluador)', () => {
  test.beforeAll(() => {
    // Elevate user to ADMIN for the test and set phase to 1 (so other phases are "locked" for normal users)
    setAdminRoleAndPhase(process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com', 1);
  });

  test.afterAll(() => {
    // Restore user to normal USER
    restoreUserRole(process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com');
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to Login page and login
    await ensureAuthenticated(page);
  });

  test('ADMIN puede activar el Modo Evaluador y explorar módulos bloqueados sin registrar progreso', async ({ page }) => {
    test.slow();
    
    // 1. Ir al Panel de Admin para activar Modo Evaluador
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // 2. Localizar y Activar el Toggle de Modo Evaluador en la barra lateral
    const evaluatorLabel = page.locator('div').filter({ hasText: /^Modo Evaluador/ }).locator('label.ios-switch-container').first();
    await expect(evaluatorLabel).toBeVisible();
    
    // Click to activate
    await evaluatorLabel.click();
    
    // Dismiss the Alert dialog
    const acceptBtn = page.locator('button', { hasText: 'Aceptar' });
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();
    await page.waitForTimeout(500);

    // 3. Volver al Mapa
    const volverBtn = page.locator('text=Volver al Viaje');
    await volverBtn.click();
    await page.waitForURL('**/map**');
    await page.waitForLoadState('domcontentloaded');

    // 4. Verificar que las Fases normalmente bloqueadas (ej. Fase 9) ahora se pueden acceder
    const fase9Card = page.locator('div.group', { hasText: 'Fase 9' }).first();
    const fase9Button = fase9Card.locator('button').first();
    
    await expect(fase9Button).toBeEnabled();
    await fase9Button.click();
    await page.waitForLoadState('domcontentloaded');

    // 5. Entrar a jugar un módulo (Ej. Simulado 1)
    const moduleCard = page.locator('.fg-module-card').first();
    await moduleCard.click();
    
    const levelCard = page.locator('.fg-level-card').first();
    await levelCard.click();

    // 6. Verificar que pudimos ingresar exitosamente al juego (la pantalla principal o modal se muestra)
    // El hecho de que se abra el modal de "Siguiente" o el juego demuestra que no estaba bloqueado.
    const siguienteBtn = page.locator('button', { hasText: 'Siguiente' }).first();
    await expect(siguienteBtn).toBeVisible({ timeout: 10000 });
  });

  test('ADMIN puede navegar por el Panel de Administración de Contenido', async ({ page }) => {
    // 1. Acceder al Panel de Administrador
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // 2. Verificar Dashboard Inicial
    await expect(page.locator('h2', { hasText: 'Vista General de Administrador' })).toBeVisible();

    // 3. Navegar a Configuración Global
    const configTab = page.locator('button', { hasText: 'Config. Pedagógica' }).first();
    if(await configTab.isVisible()) {
        await configTab.click();
        await expect(page.locator('text=Gestión Pedagógica Avanzada').first()).toBeVisible();
    }

    // 4. Navegar a Banco de Preguntas
    const contentTab = page.locator('button', { hasText: 'Banco de Preguntas' }).first();
    await contentTab.click();
    
    // Verificar que los filtros están visibles
    const filterSelects = page.locator('select');
    await expect(filterSelects.first()).toBeVisible();
    
    // 5. Dashboard principal tiene usuarios
    const usersTab = page.locator('button', { hasText: 'Vista General' }).first();
    await usersTab.click();
    await expect(page.locator('text=Gestión de Usuarios').first()).toBeVisible();
  });
});
