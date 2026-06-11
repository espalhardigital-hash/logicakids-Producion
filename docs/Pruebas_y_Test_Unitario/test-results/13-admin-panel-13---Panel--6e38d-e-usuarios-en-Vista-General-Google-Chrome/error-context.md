# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 13-admin-panel.spec.ts >> 13 - Panel de Administración y Sincronización de Contenido >> ADMIN puede realizar CRUD completo de usuarios en Vista General
- Location: tests\13-admin-panel.spec.ts:48:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('tr').filter({ hasText: 'cruduser_1781155877121_editado' }).locator('button[title="Borrar"]')
    - locator resolved to <button title="Borrar" class="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 bg-red-500/10 text-red-400 hover:bg-red-500/20">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    28 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Test source

```ts
  27  |       // Restore other questions first
  28  |       execSync(
  29  |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE preguntas SET seccion = 101 WHERE fase_id = 4 AND seccion = 999;"`
  30  |       );
  31  |       if (createdQuestionId) {
  32  |         execSync(
  33  |           `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "DELETE FROM pool_asignado_alumno WHERE pregunta_id = ${createdQuestionId}; DELETE FROM intentos WHERE pregunta_id = ${createdQuestionId}; DELETE FROM intento_preguntas WHERE pregunta_id = ${createdQuestionId}; DELETE FROM preguntas WHERE id = ${createdQuestionId};"`
  34  |         );
  35  |         console.log(`🧹 Deleted test question ID: ${createdQuestionId} and all references.`);
  36  |       }
  37  |       console.log('✅ Test user role restored to USER in the database and questions restored.');
  38  |     } catch (e) {
  39  |       console.error('Failed to cleanup admin test', e);
  40  |     }
  41  |   });
  42  | 
  43  |   test.beforeEach(async ({ page }) => {
  44  |     // Navigate to Login page and login as ADMIN
  45  |     await ensureAuthenticated(page);
  46  |   });
  47  | 
  48  |   test('ADMIN puede realizar CRUD completo de usuarios en Vista General', async ({ page }) => {
  49  |     test.slow();
  50  |     
  51  |     // 1. Acceder al Panel de Administrador
  52  |     const adminBtn = page.locator('button', { hasText: 'Panel Admin' });
  53  |     if (await adminBtn.isVisible()) {
  54  |         await adminBtn.click();
  55  |     } else {
  56  |         await page.goto('/admin');
  57  |     }
  58  |     await page.waitForURL('/admin');
  59  | 
  60  |     // 2. Asegurarse de estar en Vista General (es la por defecto)
  61  |     await page.locator('button', { hasText: 'Vista General' }).click();
  62  |     
  63  |     // Test CRUD data
  64  |     const testUsername = `cruduser_${Date.now()}`;
  65  |     const testEmail = `${testUsername}@gmail.com`;
  66  | 
  67  |     // 3. Crear Usuario (CREATE)
  68  |     await page.locator('button', { hasText: 'Nuevo Usuario' }).click();
  69  |     
  70  |     // Wait for modal input to be visible
  71  |     const inputUsername = page.locator('input[placeholder="Ej: SuperMath"]');
  72  |     await inputUsername.waitFor({ state: 'visible' });
  73  |     
  74  |     await inputUsername.fill(testUsername);
  75  |     await page.locator('input[placeholder="correo@ejemplo.com"]').fill(testEmail);
  76  |     await page.locator('input[placeholder="••••••••"]').fill('password123');
  77  |     
  78  |     // Use filter to find the correct select elements
  79  |     const selects = page.locator('select');
  80  |     await selects.filter({ has: page.locator('option[value="USER"]') }).first().selectOption({ value: 'USER' });
  81  |     await selects.filter({ has: page.locator('option[value="ACTIVE"]') }).first().selectOption({ value: 'ACTIVE' });
  82  |     
  83  |     await page.locator('button', { hasText: 'Guardar Cambios' }).click();
  84  | 
  85  |     // Verify creation by searching
  86  |     const searchInput = page.locator('input[placeholder="Buscar usuario o email..."]');
  87  |     await searchInput.fill(testUsername);
  88  |     await expect(page.locator('td', { hasText: testUsername })).toBeVisible({ timeout: 5000 });
  89  | 
  90  |     // 4. Editar Usuario (UPDATE)
  91  |     const userRow = page.locator('tr', { hasText: testUsername });
  92  |     // The buttons have group-hover opacity, they should still be clickable
  93  |     await userRow.locator('button[title="Editar"]').click();
  94  |     const updatedUsername = `${testUsername}_editado`;
  95  |     await page.locator('input[placeholder="Ej: SuperMath"]').fill(updatedUsername);
  96  |     await page.locator('button', { hasText: 'Guardar Cambios' }).click();
  97  |     
  98  |     // Verify update
  99  |     await searchInput.fill('');
  100 |     await searchInput.fill(updatedUsername);
  101 |     await expect(page.locator('td', { hasText: updatedUsername })).toBeVisible({ timeout: 5000 });
  102 | 
  103 |     // 5. Cambiar Estado (Banear/Activar)
  104 |     const updatedRow = page.locator('tr', { hasText: updatedUsername });
  105 |     await expect(updatedRow.locator('td', { hasText: 'Activo' })).toBeVisible();
  106 |     await updatedRow.locator('button[title="Banear"]').click();
  107 |     await expect(updatedRow.locator('td', { hasText: 'Baneado' })).toBeVisible({ timeout: 5000 });
  108 |     
  109 |     // Activar de nuevo
  110 |     await updatedRow.locator('button[title="Activar"]').click();
  111 |     await expect(updatedRow.locator('td', { hasText: 'Activo' })).toBeVisible({ timeout: 5000 });
  112 | 
  113 |     // 6. Cambiar Contraseña
  114 |     await updatedRow.locator('button[title="Clave"]').click();
  115 |     await page.locator('input[placeholder="••••••••"]').fill('newpassword456');
  116 |     page.once('dialog', dialog => dialog.accept()); // Fallback for native alert
  117 |     await page.locator('button', { hasText: 'Actualizar Ahora' }).click();
  118 |     
  119 |     // Cerrar posible alerta custom si aparece (por si acaso)
  120 |     const btnAceptarAlert = page.locator('button', { hasText: 'Aceptar' }).last();
  121 |     if (await btnAceptarAlert.isVisible()) {
  122 |         await btnAceptarAlert.click();
  123 |     }
  124 | 
  125 |     // 7. Eliminar Usuario (DELETE)
  126 |     page.once('dialog', dialog => dialog.accept());
> 127 |     await updatedRow.locator('button[title="Borrar"]').click();
      |                                                        ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  128 |     
  129 |     await page.waitForTimeout(500);
  130 |     const customConfirmBtn = page.locator('button', { hasText: 'Confirmar' }).last();
  131 |     if (await customConfirmBtn.isVisible()) {
  132 |         await customConfirmBtn.click();
  133 |     }
  134 |     
  135 |     // Verify deletion
  136 |     await searchInput.fill('');
  137 |     await searchInput.fill(updatedUsername);
  138 |     await expect(page.locator('text=No se encontraron usuarios')).toBeVisible({ timeout: 5000 });
  139 |   });
  140 | 
  141 |   test('ADMIN puede crear una pregunta en ContentTab (Fase 4) y USER puede jugarla', async ({ page }) => {
  142 |     test.slow(); // Allow extra time for finding elements and playing the level
  143 |     // 1. Acceder al Panel de Administrador
  144 |     const adminBtn = page.locator('button', { hasText: 'Panel Admin' });
  145 |     if (await adminBtn.isVisible()) {
  146 |         await adminBtn.click();
  147 |     } else {
  148 |         await page.goto('/admin');
  149 |     }
  150 |     await page.waitForURL('/admin');
  151 | 
  152 |     // 2. Navegar a la sección del sidebar "Banco de Preguntas"
  153 |     await page.locator('button', { hasText: 'Banco de Preguntas' }).first().click();
  154 |     
  155 |     // Esperar a que la vista de contenido cargue y hacer clic en la sub-pestaña
  156 |     await page.locator('button', { hasText: 'Banco de Preguntas' }).nth(1).click();
  157 |     
  158 |     // 3. Seleccionar Fase 4, Modulo 1, Nivel 1
  159 |     const selects = page.locator('select');
  160 |     await expect(selects).toHaveCount(4); // Escala tipográfica, Fase, Módulo, Nivel
  161 |     
  162 |     // Seleccionar Fase 4
  163 |     await selects.nth(1).selectOption({ label: 'Fase 4' });
  164 |     // Seleccionar Módulo 1
  165 |     await selects.nth(2).selectOption({ index: 0 }); // Módulo 1: La Fracción Visual
  166 |     // Seleccionar Nivel 1
  167 |     await selects.nth(3).selectOption({ index: 0 }); // Nivel 1: Lectura de Fracciones
  168 |     
  169 |     // 4. Crear la pregunta
  170 |     const newQuestionBtn = page.locator('button', { hasText: 'Agregar Pregunta' }).first();
  171 |     await newQuestionBtn.click();
  172 | 
  173 |     const enunciadoInput = page.locator('label:has-text("Enunciado / Pregunta")').locator('..').locator('input');
  174 |     await enunciadoInput.fill('PREGUNTA DE PRUEBA CREADA POR ADMIN EN FASE 4');
  175 | 
  176 |     const respuestaCorrectaInput = page.locator('label:has-text("Respuesta Correcta")').locator('..').locator('input');
  177 |     await respuestaCorrectaInput.fill('OPCION ADMIN CORRECTA');
  178 | 
  179 |     // Llenar alternativas
  180 |     const alternativasInputs = page.locator('input[placeholder*="Texto de la opción"]');
  181 |     await alternativasInputs.nth(0).fill('OPCION ADMIN CORRECTA');
  182 |     await alternativasInputs.nth(1).fill('INCORRECTA 1');
  183 |     await alternativasInputs.nth(2).fill('INCORRECTA 2');
  184 |     await alternativasInputs.nth(3).fill('INCORRECTA 3');
  185 | 
  186 |     // Guardar Pregunta
  187 |     const saveBtn = page.locator('button', { hasText: 'Crear Pregunta' }).last();
  188 |     await saveBtn.click();
  189 | 
  190 |     // 5. Validar mensaje de éxito
  191 |     await expect(page.locator('text=Pregunta creada exitosamente')).toBeVisible();
  192 | 
  193 |     // 6. Obtener ID de la base de datos
  194 |     const cmd = `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -t -A -c "SELECT id FROM preguntas WHERE enunciado = 'PREGUNTA DE PRUEBA CREADA POR ADMIN EN FASE 4' ORDER BY id DESC LIMIT 1"`;
  195 |     const qIdStr = execSync(cmd).toString().trim();
  196 |     createdQuestionId = parseInt(qIdStr);
  197 |     expect(createdQuestionId).not.toBeNaN();
  198 | 
  199 |     // Ensure the admin created question has the structure_padre_id and variante = 0 to be served by the backend
  200 |     try {
  201 |       execSync(
  202 |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE preguntas SET estructura_padre_id = 'admin_family_test', datos_numericos = '{\\"variante\\": 0}' WHERE id = ${createdQuestionId};"`
  203 |       );
  204 |       console.log('✅ Set structure_padre_id and variante = 0 for the created question.');
  205 |     } catch (e) {
  206 |       console.error('Failed to set structure_padre_id:', e);
  207 |     }
  208 | 
  209 |     // Move all OTHER questions in Fase 4, Modulo 1, Nivel 1 to a dummy seccion = 999 to isolate the admin question
  210 |     try {
  211 |       execSync(
  212 |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "UPDATE preguntas SET seccion = 999 WHERE fase_id = 4 AND seccion = 101 AND id != ${createdQuestionId};"`
  213 |       );
  214 |       console.log('✅ Isolated the admin question by moving other level questions to seccion = 999.');
  215 |     } catch (e) {
  216 |       console.error('Failed to isolate admin question:', e);
  217 |     }
  218 | 
  219 |     // Delete any cached question pool for the student for this level so the backend generates a new one
  220 |     try {
  221 |       execSync(
  222 |         `docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "DELETE FROM pool_asignado_alumno WHERE alumno_id = (SELECT id FROM alumnos WHERE user_id = (SELECT id FROM users WHERE email = '${process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com'}')) AND fase_id = 4 AND seccion = 101;"`
  223 |       );
  224 |       console.log('✅ Deleted cached question pool for the student.');
  225 |     } catch (e) {
  226 |       console.error('Failed to delete cached question pool:', e);
  227 |     }
```