import { test, expect } from '@playwright/test';

test.describe('Autenticación y Redirección', () => {
  test('debe redirigir al login si no está autenticado y cargar la interfaz correctamente', async ({ page }) => {
    // 1. Navegar a la raíz del panel admin
    await page.goto('/');

    // 2. Verificar que se redirige a /login
    await expect(page).toHaveURL(/\/login/);

    // 3. Verificar elementos visuales principales
    const brandHeading = page.locator('h2');
    await expect(brandHeading).toHaveText('LogicaKids Pro');

    // 4. Verificar que existen los campos del formulario
    const usernameInput = page.locator('input[placeholder="amilcar@gmail.com"]');
    const passwordInput = page.locator('input[placeholder="••••••••"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Ingresar al Sistema');
  });

  test('debe mostrar error de validación en campos vacíos', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Deben mostrarse los mensajes de validación de zod
    const usernameError = page.locator('text=El usuario es requerido');
    const passwordError = page.locator('text=La contraseña es muy corta');

    await expect(usernameError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('debe iniciar sesión con éxito y mostrar el panel de alumnos (con mocks de API)', async ({ page }) => {
    // Interceptar llamadas API de autenticación y datos de alumnos
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { access_token: 'mock-jwt-token-xyz' },
      });
    });

    await page.route('**/admin/alumnos/search*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: [
            {
              id: 'user-123',
              alumno_id: 1,
              alumno_nombre: 'Juanito Pérez',
              edad: 7,
              estado: 'ACTIVO',
              fase_actual_id: 2,
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      });
    });

    // 1. Ir a login
    await page.goto('/login');

    // 2. Rellenar credenciales
    await page.locator('input[placeholder="amilcar@gmail.com"]').fill('admin@logicakids.com');
    await page.locator('input[placeholder="••••••••"]').fill('password123');

    // 3. Hacer click en ingresar
    await page.locator('button[type="submit"]').click();

    // 4. Verificar redirección a /alumnos (ruta por defecto de la app)
    await expect(page).toHaveURL(/\/alumnos/);

    // 5. Verificar que se carga el DashboardLayout y la tabla
    const sidebar = page.locator('aside');
    await expect(sidebar).toContainText('LogicaKids Admin');

    // Verificar que el alumno mockeado aparece en la tabla
    const studentName = page.locator('text=Juanito Pérez');
    await expect(studentName).toBeVisible();

    const studentPhase = page.locator('text=Fase 2');
    await expect(studentPhase).toBeVisible();
  });
});
