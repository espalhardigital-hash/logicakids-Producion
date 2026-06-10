# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-gameplay-fase1.spec.ts >> 03 - Gameplay Fase 1 (Aritmética Básica) >> La pantalla de juego /play renderiza elementos interactivos
- Location: tests\03-gameplay-fase1.spec.ts:165:7

# Error details

```
Error: Errores en consola durante gameplay Fase 1:
  [1] WebSocket connection to 'ws://localhost:8000/ws/admin-sync' failed: Error during WebSocket handshake: Unexpected response code: 404 (http://localhost:3000/assets/index-Dc7kVkAu.js)

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - button "Salir del Nivel" [ref=e7] [cursor=pointer]:
        - img [ref=e8]
        - generic [ref=e11]: Salir del Nivel
      - generic [ref=e13]:
        - generic [ref=e14]: DESAFÍO MIX
        - generic [ref=e15]: "|"
        - generic [ref=e16]: FASE 1
        - generic [ref=e17]: "|"
        - generic [ref=e18]: MÓDULO 503
        - generic [ref=e19]: "|"
        - generic [ref=e20]: NIVEL 3
        - generic [ref=e21]: "|"
        - generic [ref=e22]: DESAFÍO 1/50
        - generic [ref=e23]: "|"
        - generic [ref=e24]: 15S
    - generic [ref=e29]:
      - generic [ref=e33]:
        - heading "3 + 8" [level=2] [ref=e35]
        - spinbutton [active] [ref=e37]
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]: Correctas
            - generic [ref=e41]: "0"
          - generic [ref=e42]:
            - generic [ref=e43]: Errores
            - generic [ref=e44]: "0"
      - generic [ref=e45]:
        - generic [ref=e46]:
          - button "7" [ref=e47] [cursor=pointer]
          - button "8" [ref=e48] [cursor=pointer]
          - button "9" [ref=e49] [cursor=pointer]
          - button "4" [ref=e50] [cursor=pointer]
          - button "5" [ref=e51] [cursor=pointer]
          - button "6" [ref=e52] [cursor=pointer]
          - button "1" [ref=e53] [cursor=pointer]
          - button "2" [ref=e54] [cursor=pointer]
          - button "3" [ref=e55] [cursor=pointer]
          - button [ref=e56] [cursor=pointer]:
            - img [ref=e57]
          - button "0" [ref=e61] [cursor=pointer]
          - button [ref=e62] [cursor=pointer]:
            - img [ref=e63]
        - paragraph [ref=e65]: Teclado Numérico
  - button "Alternar Tema Claro/Oscuro" [ref=e66] [cursor=pointer]:
    - img [ref=e68]
```

# Test source

```ts
  92  | 
  93  |     // La respuesta debe ser un JSON válido
  94  |     const data = await response.json();
  95  |     expect(data).toBeDefined();
  96  |   });
  97  | 
  98  |   // ─── Test: Respuesta a pregunta vía API (simulación de acierto/fallo) ───
  99  |   test('El endpoint de responder preguntas funciona correctamente', async ({ page }) => {
  100 |     await ensureAuthenticated(page);
  101 | 
  102 |     const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  103 |     expect(token).toBeTruthy();
  104 | 
  105 |     // Primero obtener el dashboard para saber qué preguntas hay disponibles
  106 |     const dashResponse = await page.request.get(`${API.FASE1_DASHBOARD}`, {
  107 |       headers: { 'Authorization': `Bearer ${token}` },
  108 |     });
  109 | 
  110 |     if (dashResponse.ok()) {
  111 |       const dashboard = await dashResponse.json();
  112 | 
  113 |       // Si hay preguntas disponibles, intentar responder una
  114 |       if (dashboard.pregunta_actual || dashboard.pregunta) {
  115 |         const pregunta = dashboard.pregunta_actual || dashboard.pregunta;
  116 |         const preguntaId = pregunta.id;
  117 | 
  118 |         // Enviar una respuesta (puede ser correcta o incorrecta)
  119 |         const respuestaResponse = await page.request.post(`${API.FASE1_RESPONDER}`, {
  120 |           headers: {
  121 |             'Authorization': `Bearer ${token}`,
  122 |             'Content-Type': 'application/json',
  123 |           },
  124 |           data: {
  125 |             pregunta_id: preguntaId,
  126 |             respuesta_dada: 'test_response',
  127 |             tiempo_respuesta_segundos: 5,
  128 |           },
  129 |         });
  130 | 
  131 |         // El endpoint debe responder (200 o 422 si la respuesta no es válida)
  132 |         expect(
  133 |           [200, 201, 422].includes(respuestaResponse.status()),
  134 |           `Endpoint responder devolvió status inesperado: ${respuestaResponse.status()}`
  135 |         ).toBe(true);
  136 | 
  137 |         if (respuestaResponse.ok()) {
  138 |           const resultado = await respuestaResponse.json();
  139 | 
  140 |           // Validar estructura de la respuesta
  141 |           expect(resultado).toHaveProperty('es_correcta');
  142 |           expect(resultado).toHaveProperty('respuesta_correcta');
  143 |           expect(resultado).toHaveProperty('porcentaje_actual');
  144 | 
  145 |           // Documentar si fue acierto o fallo
  146 |           if (resultado.es_correcta) {
  147 |             console.log(`✅ Respuesta correcta - Porcentaje actual: ${resultado.porcentaje_actual}%`);
  148 |           } else {
  149 |             console.log(`❌ Respuesta incorrecta - Feedback: ${resultado.feedback_error || 'N/A'}`);
  150 |             console.log(`   Respuesta correcta era: ${resultado.respuesta_correcta}`);
  151 | 
  152 |             // Si hay tipo_feedback, verificar que existe
  153 |             if (resultado.tipo_feedback) {
  154 |               expect(['inmediato', 'diferido', 'espejo']).toContain(resultado.tipo_feedback);
  155 |             }
  156 |           }
  157 |         }
  158 |       } else {
  159 |         console.log('ℹ️ No hay preguntas disponibles en el dashboard actual. Saltando prueba de respuesta.');
  160 |       }
  161 |     }
  162 |   });
  163 | 
  164 |   // ─── Test: Pantalla de juego Fase 1 (/play) carga ────────────────
  165 |   test('La pantalla de juego /play renderiza elementos interactivos', async ({ page, consoleLogger }) => {
  166 |     consoleLogger.clear();
  167 | 
  168 |     await page.goto(ROUTES.PLAY_FASE1);
  169 |     await page.waitForLoadState('domcontentloaded');
  170 |     await page.waitForTimeout(3000); // Esperar carga de pregunta + animaciones
  171 | 
  172 |     if (page.url().includes('/login')) {
  173 |       await loginAsTestUser(page);
  174 |       await page.goto(ROUTES.PLAY_FASE1);
  175 |       await page.waitForLoadState('domcontentloaded');
  176 |       await page.waitForTimeout(3000);
  177 |     }
  178 | 
  179 |     // Verificar que la interfaz tiene contenido
  180 |     const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
  181 |     expect(rootHtml.length).toBeGreaterThan(50);
  182 | 
  183 |     // No debe haber pantalla en blanco ni errores de chunk
  184 |     const bodyText = await page.textContent('body');
  185 |     expect(bodyText).not.toContain('ChunkLoadError');
  186 |     expect(bodyText).not.toContain('Failed to fetch dynamically imported module');
  187 | 
  188 |     // Sin errores críticos en consola del browser
  189 |     expect(
  190 |       consoleLogger.hasCriticalErrors(),
  191 |       `Errores en consola durante gameplay Fase 1:\n${consoleLogger.getCriticalErrorsSummary()}`
> 192 |     ).toBe(false);
      |       ^ Error: Errores en consola durante gameplay Fase 1:
  193 |   });
  194 | 
  195 |   // ─── Test: Pantalla de resultados carga ──────────────────────────
  196 |   test('La pantalla de resultados (/results) se renderiza correctamente', async ({ page, consoleLogger }) => {
  197 |     consoleLogger.clear();
  198 | 
  199 |     await page.goto(ROUTES.RESULTS);
  200 |     await page.waitForLoadState('domcontentloaded');
  201 |     await page.waitForTimeout(2000);
  202 | 
  203 |     // Verificar que hay contenido (puede redirigir si no hay datos de juego previo)
  204 |     const rootHtml = await page.innerHTML(SELECTORS.ROOT_CONTAINER);
  205 |     expect(rootHtml.length).toBeGreaterThan(10);
  206 | 
  207 |     // Sin errores críticos
  208 |     expect(
  209 |       consoleLogger.hasCriticalErrors(),
  210 |       `Errores en consola de Results:\n${consoleLogger.getCriticalErrorsSummary()}`
  211 |     ).toBe(false);
  212 |   });
  213 | });
  214 | 
```