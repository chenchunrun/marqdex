import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('h1')).toContainText('登录');
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/Register/);
    await expect(page.locator('h1')).toContainText('注册');
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Application Structure', () => {
  test('should have all main pages accessible', async ({ page }) => {
    const pages = ['/login', '/register'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await expect(page).toHaveOK();
    }
  });
});
