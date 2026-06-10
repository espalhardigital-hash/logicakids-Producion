import { test, expect } from '@playwright/test';

test.describe('Pruebas E2E: Fases 7, 8 y 9', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login con test_automaticoas
    await page.goto('http://localhost:3000');
    
    // Asumimos que el form tiene campos con placeholders o names
    await page.fill('input[type="email"]', 'test_automaticoas@gmail.com');
    await page.fill('input[type="password"]', 'test_automaticoas_123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page.locator('text="Tu Viaje Matemático"')).toBeVisible({ timeout: 10000 });
  });

  const fases_a_probar = [7, 8, 9];

  for (const fase of fases_a_probar) {
    test(`Fase ${fase}: Prueba de humo de Welcome Screen y Juego`, async ({ page }) => {
      // Hacer click en el texto de "Fase X" dentro de la tarjeta
      await page.locator(`text="Fase ${fase}"`).first().click();
      
      // Esperar a que cargue la pantalla de bienvenida de la fase genérica
      await page.waitForTimeout(2000);

      // Verificar que no hay pantalla blanca y cargó el metadata (los títulos de la fase deben estar visibles)
      if (fase === 8) {
        await expect(page.locator('text=/Lógica, Combinatoria y Probabilidad/i').first()).toBeVisible();
      } else if (fase === 9) {
        await expect(page.locator('text=/Simulados Colegio Pedro II/i').first()).toBeVisible();
      }
      // Hacer click en el primer módulo (la primera tarjeta fg-module-card)
      await page.locator('.fg-module-card').first().click();
      
      // Esperar la animación/cambio a la vista de niveles
      await page.waitForTimeout(1000);

      // Hacer click en el Nivel 1 (la primera tarjeta fg-level-card)
      await page.locator('.fg-level-card').first().click();

      // Esperar un momento a que carguen las preguntas
      await page.waitForTimeout(3000);
      
      // Solo asegurar que la página renderizó y no es una pantalla blanca
      await expect(page.locator('body')).not.toBeEmpty();
      
      // Verificar que hay texto visible en el viewport
      const textContent = await page.evaluate(() => document.body.innerText);
      console.log(`FASE ${fase} TEXT CONTENT:`, textContent);
      expect(textContent.length).toBeGreaterThan(50);
    });
  }

});
