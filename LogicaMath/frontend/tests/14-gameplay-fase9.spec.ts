import { test, expect } from '@playwright/test';

test.describe('Pruebas E2E: Gameplay Fase 9 (Modo Examen)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login con test_automaticoas
    await page.goto('http://localhost:3000');
    
    await page.fill('input[type="email"]', 'test_automaticoas@gmail.com');
    await page.fill('input[type="password"]', 'test_automaticoas_123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page.locator('text="Tu Viaje Matemático"')).toBeVisible({ timeout: 10000 });
  });

  test('Fase 9: Simulado completo con entrega y resultados', async ({ page }) => {
    // Ingresar a Fase 9
    await page.locator('text="Fase 9"').first().click();
    
    // Welcome Screen Fase 9
    await expect(page.locator('text=/Simulados Colegio Pedro II/i').first()).toBeVisible({ timeout: 10000 });
    
    // Seleccionar primer año/módulo
    await page.locator('.fg-module-card').first().click();
    await page.waitForTimeout(1000);

    // Seleccionar primer simulado
    await page.locator('.fg-level-card').first().click();

    // ----- FASE 9 GAME SCREEN -----
    // Esperar a que el simulado inicie
    await expect(page.locator('text="Simulacro Pedro II"')).toBeVisible({ timeout: 10000 });
    
    // El timer global debe ser visible (ej. 30:00)
    await expect(page.locator('.font-mono')).toBeVisible();

    // Marcar la pregunta 1 para revisión
    await page.locator('button:has-text("Revisar después")').click();

    // Asegurar que el indicador de "Para revisión" aparezca en el grid (naranja)
    await expect(page.locator('.bg-orange-500\\/10')).toBeVisible();

    // Seleccionar la primera alternativa de la primera pregunta
    await page.locator('button:has(.w-7.h-7)').first().click();

    // Navegar a la pregunta 2 usando el botón "Siguiente"
    await page.locator('button:has-text("Siguiente")').click();
    
    // Verificar que estamos en la Pregunta 2
    await expect(page.locator('text="Questão 2"')).toBeVisible();

    // Saltar a la última pregunta (suponiendo 20 preguntas)
    await page.locator('button:has-text("20")').click();
    await expect(page.locator('text="Questão 20"')).toBeVisible();

    // Seleccionar una respuesta en la 20
    await page.locator('button:has(.w-7.h-7)').first().click();

    // Clic en "Finalizar" o "Entregar"
    await page.locator('button:has-text("Entregar")').first().click();

    // Aparece el modal de confirmación
    await expect(page.locator('text="¿Entregar Simulacro?"')).toBeVisible();

    // Confirmar entrega
    await page.locator('button:has-text("Entregar Examen")').click();

    // ----- FASE 9 RESULTS SCREEN -----
    // Debe redirigir a la Clínica de Errores
    await expect(page.locator('text="Clínica de Errores"')).toBeVisible({ timeout: 15000 });

    // Verificar si hay resultados visualizados
    await expect(page.locator('text="Aciertos"').first()).toBeVisible();
    await expect(page.locator('text="Total"').first()).toBeVisible();

    // Volver al dashboard
    await page.locator('button', { hasText: /Volver|dashboard/i }).first().click();
    await expect(page.locator('text=/Simulados Colegio Pedro II/i').first()).toBeVisible({ timeout: 10000 });
  });

});
