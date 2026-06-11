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
  await page.fill('input[type="password"]', 'TestUser2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  console.log('Navigating to Fase 8 Welcome...');
  await page.goto('http://localhost:3000/welcome-fase8');
  await page.waitForTimeout(2000);
  
  const modCards = await page.$$('.fg-module-card');
  console.log('Modules found:', modCards.length);
  if (modCards.length > 0) {
    await modCards[0].click();
    await page.waitForTimeout(2000);
    const lvlCards = await page.$$('.fg-level-card');
    console.log('Levels found:', lvlCards.length);
    if (lvlCards.length >= 4) {
      console.log('Clicking Level 4 (Desafío 1)...');
      await lvlCards[3].click();
      await page.waitForTimeout(3000);
      console.log('Current URL:', page.url());
      const bodyHTML = await page.innerHTML('body');
      if (bodyHTML.includes('fg-screen') || bodyHTML.includes('fg-reading-overlay')) {
        console.log('Screen rendered successfully.');
      } else {
        console.log('Blank page possible.');
      }
    } else console.log('Level 4 not found');
  } else console.log('Modules not found');
  
  await browser.close();
})();
