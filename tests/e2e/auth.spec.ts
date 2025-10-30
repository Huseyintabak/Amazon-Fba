import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for landing page elements
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    const loginButton = page.getByRole('button', { name: /login|giriş/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });
});

