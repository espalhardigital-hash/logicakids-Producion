import { test, expect } from '@playwright/test';

const phases = [
  { path: '/fase2/play', welcomePath: '/welcome-fase2' },
  { path: '/fase3/play', welcomePath: '/welcome-fase3' },
  { path: '/fase4/play', welcomePath: '/welcome-fase4' },
  { path: '/fase5/play', welcomePath: '/welcome-fase5' },
  { path: '/fase6/play', welcomePath: '/welcome-fase6' }
];

test.describe('E2E LogicaKids Pro Phase Loading Integrity', () => {

  test.beforeEach(async ({ page }) => {
    // Perform a real login for testing
    await page.goto('/login');
    
    // Check if we are already logged in (redirected to map)
    if (page.url().includes('/map')) return;

    // Fill login form (assuming standard username/password for admin)
    // The previous instructions indicated there are test users created by seed
    // We will use one of the seed users: admin / admin123 or similar.
    // If not, we can just intercept the checkAuth call to mock the response
    await page.route('**/api/auth/me', async route => {
      const json = {
        id: 'admin',
        username: 'AdminTest',
        role: 'ADMIN',
        unlocked_level: 100,
        status: 'ACTIVE'
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/auth/profile', async route => {
      const json = {
        id: 'admin',
        username: 'AdminTest',
        role: 'ADMIN',
        unlocked_level: 100,
        status: 'ACTIVE'
      };
      await route.fulfill({ json });
    });
    
    // But since the app component is wrapped in checkAuth on mount, we can just inject into localstorage and mock the network responses.
    await page.addInitScript(() => {
      window.localStorage.setItem('currentUser', JSON.stringify({
        id: 'admin',
        username: 'AdminTest',
        role: 'ADMIN',
        unlocked_level: 100
      }));
    });
  });

  for (const phase of phases) {
    test(`Should load ${phase.path} Game Screen successfully`, async ({ page }) => {
      // Intercept the profile fetch again just in case
      await page.route('**/api/auth/me', route => route.fulfill({ json: { id: 'admin', username: 'AdminTest', role: 'ADMIN' } }));
      await page.route('**/api/auth/profile', route => route.fulfill({ json: { id: 'admin', username: 'AdminTest', role: 'ADMIN' } }));
      await page.route('**/api/pedagogy/config/*', route => route.fulfill({ json: {} }));
      await page.route('**/api/admin/settings', route => route.fulfill({ json: {} }));

      // 1. Navigate to Welcome Screen
      await page.goto(phase.welcomePath);
      await page.waitForLoadState('domcontentloaded');
      // Some React Suspense chunks may take time
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
         // Force mock navigation if it redirected to login
         await page.goto(phase.welcomePath);
      }

      // 2. Direct Navigation to Game Screen to verify bundle chunk loading (React Lazy)
      await page.goto(phase.path);
      await page.waitForLoadState('domcontentloaded');
      
      // Allow some time for Suspense to resolve and components to mount
      await page.waitForTimeout(2000);

      // Verify no React crash (white screen of death)
      const rootHtml = await page.innerHTML('#root');
      expect(rootHtml.length).toBeGreaterThan(10); // Not empty

      // Basic generic text check
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('ChunkLoadError');
      expect(bodyText).not.toContain('Failed to fetch dynamically imported module');
      expect(bodyText).not.toContain('Application error');
    });
  }
});
