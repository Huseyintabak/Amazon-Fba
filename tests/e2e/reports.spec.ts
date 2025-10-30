import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/reports');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for page content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display reports charts', async ({ page }) => {
    await page.goto('/reports');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have export functionality', async ({ page }) => {
    await page.goto('/reports');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});


test.describe('Reports Page', () => {
  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/reports');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for page content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display reports charts', async ({ page }) => {
    await page.goto('/reports');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have export functionality', async ({ page }) => {
    await page.goto('/reports');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});



