const { test, expect } = require('@playwright/test');

test('login una vez y guardar sesión', async ({ page }) => {
  await page.goto('/web/index.php/auth/login');
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
  await page.context().storageState({ path: '.auth/admin.json' });
});
