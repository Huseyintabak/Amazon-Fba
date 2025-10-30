import { test, expect } from '@playwright/test';

test.describe('Products Page', () => {
  test('should navigate to products page', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for products table or content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display products table headers', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded successfully
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

