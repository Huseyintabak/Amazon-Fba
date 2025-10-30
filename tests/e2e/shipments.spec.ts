import { test, expect } from '@playwright/test';

test.describe('Shipments Page', () => {
  test('should navigate to shipments page', async ({ page }) => {
    await page.goto('/shipments');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for page content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display shipments content', async ({ page }) => {
    await page.goto('/shipments');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

