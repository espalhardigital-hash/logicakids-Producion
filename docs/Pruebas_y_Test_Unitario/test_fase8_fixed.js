const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('console', msg => { 
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); 
  });
  
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'pruebas_automaticas_2@gmail.com');
  await page.fill('input[type="password"]', 'pruebas');
  
  await Promise.all([
    page.waitForURL('**/map'),
    page.click('button[type="submit"]')
  ]);
  
  console.log('Navigating to Fase 8 Welcome...');
  await page.goto('http://localhost:3000/welcome-fase8');
  await page.waitForTimeout(2000);
  

  // The above doesn't trigger React Router. Instead, let's just go to a URL with state.
  // We can't easily. Let's just evaluate a click on a dynamically created link with state? No.
  // Let's just execute `window.__navigate = ...` if we had it.
  
  // Actually, let's just click the first level, it's NOT locked!
  const modCards = await page.$$('.fg-module-card');
  if (modCards.length > 0) {
    await modCards[0].click();
    await page.waitForTimeout(2000);
    const lvlCards = await page.$$('.fg-level-card');
    if (lvlCards.length >= 4) {
      console.log('Clicking Level 6 (Desafío Final)...');
      await lvlCards[5].click();
      await page.waitForTimeout(4000);
      console.log('Current URL:', page.url());
      await page.screenshot({ path: 'D:/Antigravity/APP_Logica_Matematicas_kids/docs/Pruebas_y_Test_Unitario/screenshot_lvl6.png' });
      const bodyHTML = await page.innerHTML('body');
      if (bodyHTML.includes('fg-screen') || bodyHTML.includes('fg-reading-overlay')) {
        console.log('Screen rendered successfully.');
      } else {
        console.log('Blank page possible. HTML:', bodyHTML.substring(0, 500));
      }
    }
  }
  
  await browser.close();
})();
