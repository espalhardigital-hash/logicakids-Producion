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
  
  const modCards = await page.$$('.fg-module-card');
  console.log('Modules found:', modCards.length);
  const evalBtn = await page.$('.fg-eval-btn');
  if (evalBtn) {
    console.log('Clicking Iniciar Desafío...');
    await evalBtn.click();
    await page.waitForTimeout(3000);
    console.log('Current URL:', page.url());
    const bodyHTML = await page.innerHTML('body');
    if (bodyHTML.includes('fg-screen') || bodyHTML.includes('fg-reading-overlay')) {
      console.log('Screen rendered successfully.');
    } else {
      console.log('Blank page possible. HTML:', bodyHTML.substring(0, 500));
    }
  } else {
    console.log('Iniciar Desafío button not found');
  }
  
  await browser.close();
})();
